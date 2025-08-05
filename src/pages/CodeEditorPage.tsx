import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/codeeditorpage/Sidebar';
import Header from '../components/codeeditorpage/Header';
import SubHeader from '../components/codeeditorpage/SubHeader';
import type { FileNode } from '../types/CodeEditor.types';
import ConsoleBox from '../components/codeeditorpage/ConsoleBox';
import ProblemPreview from '../components/codeeditorpage/ProblemPreview';
import PanelTabHeader from '../components/codeeditorpage/PanelTabHeader';
import ChatPanel from '../components/codeeditorpage/ChatPanel';
import Modal from '../components/common/Modal';

import type { ConsoleBoxHandle } from '../components/codeeditorpage/ConsoleBox';
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import TextField from '../components/common/TextField';
import { useLocation } from 'react-router-dom';

import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';

import * as awarenessProtocol from 'y-protocols/awareness.js';

import { getRandomColor, getRandomName } from '../utils/cursor';

// 인터페이스 설정
interface Message {
  nickname: string;
  time: string;
  content: string;
}

// 소켓 관련 핸들러 저장용 Map
const socketHandlers = new Map<
  string,
  {
    handleSync: (u: Uint8Array) => void;
    handleUpdate: (u: Uint8Array) => void;
    handleAwarenessUpdateToSocket: ({
      update,
      fileName,
    }: {
      update: Uint8Array;
      fileName: string;
    }) => void;

    handleChatUpdate: (msg: Message) => void;

    handleChatSync: (msg: Message[]) => void;
  }
>();

// Y.Doc 업데이트 핸들러 저장 Map
const ydocHandlers = new Map<
  string,
  {
    handleDocUpdate: (u: Uint8Array) => void;
  }
>();

// Awareness 이벤트 핸들러 저장 Map
const awarenessHandlers = new Map<
  string,
  {
    handleAwarenessUpdate: (e: any) => void;
    handleAwarenessChange: () => void;
  }
>();

const ydocs: Record<string, Y.Doc> = {}; // 파일별 Y.Doc 인스턴스를 저장
const awarenessMap: Record<string, awarenessProtocol.Awareness> = {}; // 파일별 Awareness 인스턴스를 저장
const bindingMap: Record<string, MonacoBinding> = {}; // 파일별 MonacoBinding 인스턴스를 저장
const modelMap: Record<string, monaco.editor.ITextModel> = {}; // 파일별 Monaco 모델 저장

const username = getRandomName(); // 사용자 이름 생성 (나중에 변경해야 함)
const usercolor = getRandomColor(); // 사용자 커서 색상 지정

export default function CodeEditorPage3() {
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'ai' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const cursorListenerRef = useRef<monaco.IDisposable | null>(null);

  let lastCursorState: { line: number; column: number } = {
    line: 0,
    column: 0,
  };

  const dummyFileTree: FileNode[] = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      childrenNode: [
        {
          id: '2',
          name: 'index.html',
          type: 'file',
        },
        {
          id: '3',
          name: 'components',
          type: 'folder',
          childrenNode: [
            { id: '4', name: 'style.css', type: 'file' },
            { id: '5', name: 'app.js', type: 'file' },
          ],
        },
      ],
    },
  ];
  const users = [
    { id: 1, nickname: '기영', line: 42 },
    { id: 2, nickname: '수연', line: 13 },
    { id: 3, nickname: '예람', line: 87 },
  ];

  const isOwner = true;
  const mode = 'problem';

  const aiMessages = [
    {
      nickname: 'AI 도우미',
      time: '10:20',
      content: '이 문제는 DFS 방식으로 해결할 수 있습니다.',
    },
    {
      nickname: 'AI 도우미',
      time: '10:21',
      content: '입력값은 항상 유효하다고 가정해도 됩니다.',
    },
  ];

  const location = useLocation();

  // 페이지에서 넘어온 데이터
  const { roomId } = location.state || {};

  // 모나코, yjs, awareness, socket io
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Monaco 인스턴스
  const socketRef = useRef<Socket | null>(null);
  const oldDecorationsRef = useRef<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentFileRef = useRef<string>('index.html');
  const [oldFile, setOldFile] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([
    {
      nickname: '기영',
      time: '10:15',
      content: '여기 문제 조건 다시 확인해주세요.',
    },
    {
      nickname: '민수',
      time: '10:17',
      content: '네 알겠습니다!',
    },
    {
      nickname: '하린',
      time: '10:18',
      content: '힌트는 어디에 있나요?',
    },
  ]);

  const [input, setInput] = useState('');

  // 추가 부분
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = initSocket(); // 소켓 초기화
    }
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to server', socket.id);
      socket.emit('join', { roomId }); // 방 참가 요청
    });

    // 채팅 동기화 요청
    socket.emit('chat-sync', { roomId });

    // 초기 파일에 대한 Y.Doc 초기화
    initYDocIfNeeded(currentFileRef.current, socket);

    // ✅ 브라우저 종료 시 사용자 상태 정리
    const cleanUp = () => {
      // 페이지의 awareness값 삭제
      const oldAwareness = awarenessMap[currentFileRef.current];
      oldAwareness.setLocalState(null); // 내 커서 상태 제거
      const socket = socketRef.current; // 해당 클라이언트의 awareness값을 삭제
      socket?.emit('awareness-remove', { roomId }); // 서버에 상태 제거 요청
    };

    window.addEventListener('beforeunload', cleanUp);

    // 🔁 컴포넌트 언마운트 또는 Fast Refresh 시 정리 작업
    return () => {
      cleanUp();
      window.removeEventListener('beforeunload', cleanUp);
      setTimeout(() => socket.disconnect(), 50); // 💡 100~200ms 정도 기다려주는 게 일반적
    };
  }, []);

  // ✅ 소켓 초기화 함수 (Fast Refresh 대응 없이 단순 생성)
  const initSocket = () => {
    //https://codetogether.store/collab-webpublish
    //http://localhost:3002/collab-webpublish
    return io('https://codetogether.store/collab-webpublish', {
      transports: ['websocket'],
      withCredentials: true,
    });
  };

  // 👉 유틸: Y.Doc + Awareness 생성
  const createYDocAndAwareness = (fileName: string) => {
    const ydoc = new Y.Doc();
    ydocs[fileName] = ydoc;
    const awareness = new awarenessProtocol.Awareness(ydoc);
    awareness.setLocalStateField('user', { name: username, color: usercolor });
    awarenessMap[fileName] = awareness;
    return { ydoc, awareness };
  };
  // 👉 유틸: Monaco 모델 생성
  const createMonacoModel = (fileName: string, ytext: Y.Text) => {
    const uri = monaco.Uri.parse(`file:///${fileName}`);
    const existingModel = monaco.editor.getModel(uri);
    if (existingModel) existingModel.dispose();
    const model = monaco.editor.createModel(
      ytext.toString(),
      getLanguageFromFile(fileName),
      uri,
    );
    modelMap[fileName] = model;
    return model;
  };

  // ✅ Yjs 초기화 필요 시만 생성
  const initYDocIfNeeded = (fileName: string, socket: Socket) => {
    const { ydoc, awareness } = createYDocAndAwareness(fileName);

    const ytext = ydoc.getText(fileName);
    const model = createMonacoModel(fileName, ytext);

    // 에디터 레퍼런스 생성
    monacoRef.current = monaco.editor.create(containerRef.current!, {
      model,
      theme: 'vs-dark',
      automaticLayout: true,
    });

    // 👆 커서 리스너 중복 제거 후 등록
    if (cursorListenerRef.current) cursorListenerRef.current.dispose();

    // 커서 변경 시 이벤트 발동
    cursorListenerRef.current = monacoRef.current.onDidChangeCursorPosition(
      (e) => {
        const current = awareness.getLocalState()?.cursor;
        const next = { line: e.position.lineNumber, column: e.position.column };
        if (
          !current ||
          current.line !== next.line ||
          current.column !== next.column
        ) {
          awareness.setLocalStateField('cursor', next);
        }
      },
    );

    // 🔗 바인딩 연결
    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([monacoRef.current]),
      awareness,
    );

    // 바인딩 저장
    bindingMap[fileName] = binding;

    registerSocketEvents(fileName, socket);
  };

  const registerSocketEvents = (fileName: string, socket: Socket) => {
    // 기존 이벤트 삭제
    const ydoc = ydocs[oldFile]!;
    const awareness = awarenessMap[oldFile]!;

    console.log('삭제할 이벤트 파일: ', oldFile);

    // 🔁 기존 핸들러 제거
    const prevSocketHandler = socketHandlers.get(oldFile);

    if (prevSocketHandler) {
      socket.off('sync', prevSocketHandler.handleSync);
      socket.off('update', prevSocketHandler.handleUpdate);
      socket.off(
        'awareness-update',
        prevSocketHandler.handleAwarenessUpdateToSocket,
      );
      socket.off('chat', prevSocketHandler.handleChatUpdate);
      socket.off('chat', prevSocketHandler.handleChatSync);
      console.log('prevSocketHandler 이벤트 제거');
    }

    const prevYdocHandler = ydocHandlers.get(oldFile);
    if (prevYdocHandler) {
      ydoc.off('update', prevYdocHandler.handleDocUpdate);
      console.log('prevYdocHandler 이벤트 제거');
    }

    const prevAwarenessHandler = awarenessHandlers.get(oldFile);
    if (prevAwarenessHandler) {
      awareness.off('update', prevAwarenessHandler.handleAwarenessUpdate);
      awareness.off('change', prevAwarenessHandler.handleAwarenessChange);

      console.log('prevAwarenessHandler 이벤트 제거');
    }

    // 새 Ydoc 와 Awareness값 가져오기
    const newYdoc = ydocs[fileName]!;
    const newAwareness = awarenessMap[fileName]!;

    // 🔧 새로운 핸들러 정의 및 등록

    // Ydoc 문서 동기화 핸들러
    const handleSync = (update: Uint8Array) => {
      if (!newYdoc) {
        console.log('설마 없어?');
      }
      console.log('Ydoc 동기화:', update);
      Y.applyUpdate(newYdoc, new Uint8Array(update));
    };

    // Ydoc 문서 Update
    const handleUpdate = (update: Uint8Array) => {
      Y.applyUpdate(newYdoc, new Uint8Array(update));
    };

    // Awareness 상태 Update
    const handleAwarenessUpdateToSocket = ({
      update,
      fileName,
    }: {
      update: Uint8Array;
      fileName: string;
    }) => {
      console.log(
        `awareness update - fileName:${fileName} - currentFile:${currentFileRef.current}`,
      );

      // 내 페이지 있는 커서만 보여주기
      if (fileName !== currentFileRef.current) {
        console.log(
          '다른 파일 awareness 업데이터:',
          fileName,
          currentFileRef.current,
        );
        return;
      }

      awarenessProtocol.applyAwarenessUpdate(
        newAwareness,
        new Uint8Array(update),
        null,
      );
    };

    // 채팅 업데이트
    const handleChatUpdate = (newMessage: Message) => {
      console.log('receivedMessage:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
    };

    // 채팅 동기화
    const handleChatSync = (messages: Message[]) => {
      console.log('동기화 테스트', messages);
      if (messages.length == 0) {
        console.log('동기화 메시지 빈값');
      }
      messages.map((message) => {
        console.log(message.content);
        setMessages((prev) => [...prev, message]);
      });
    };

    // 이벤트 등록
    socket.on('sync', handleSync);
    socket.on('update', handleUpdate);
    socket.on('awareness-update', handleAwarenessUpdateToSocket);
    socket.on('chat', handleChatUpdate);
    socket.on('chat-sync', handleChatSync);

    // 파일 싱크 요청
    socket.emit('sync', { roomId, fileName });

    // 핸들러 레퍼런스 저장
    socketHandlers.set(fileName, {
      handleSync,
      handleUpdate,
      handleAwarenessUpdateToSocket,
      handleChatUpdate,
      handleChatSync,
    });

    // 기존 이벤트 핸들러 정의 (항상 같은 참조 사용)
    const handleDocUpdate = (update: Uint8Array) => {
      console.log('📄 Y.Doc 업데이트 발생:', fileName);
      socket.emit('update', { roomId, fileName, update });
    };

    // 👉  Ydoc 해들러 등록
    newYdoc.on('update', handleDocUpdate);

    // 핸들러 저장
    ydocHandlers.set(fileName, { handleDocUpdate });

    // Awareness 업데이트 핸들러
    const handleAwarenessUpdate = ({ added, updated, removed }: any) => {
      console.log('awareness update');

      const awareness = awarenessMap[fileName];
      const states = awareness.getStates();
      const myState = states.get(awareness.clientID);
      const currentCursor = myState?.cursor;

      console.log('👤 awareness 업데이트 발생');

      console.log('현재 파일:', currentFileRef.current);
      if (
        currentCursor &&
        currentCursor.line === lastCursorState.line &&
        currentCursor.column === lastCursorState.column
      ) {
        console.log(
          'currentCursor.line:',
          currentCursor.line,
          'currentCursor.column:',
          currentCursor.column,
        );
        console.log(
          'lastCursorState.line:',
          lastCursorState.line,
          'lastCursorState.column:',
          lastCursorState.column,
        );

        console.log('변동 없음');
        return;
      }

      const update = awarenessProtocol.encodeAwarenessUpdate(
        newAwareness,
        added.concat(updated, removed),
      );
      socket.emit('awareness-update', { roomId, fileName, update });
      console.log('awareness broadcast');
      // 상태 업데이트 진행
      lastCursorState = currentCursor ?? null;
    };

    // 상태 변화 업데이트 감지
    const handleAwarenessChange = () => {
      console.log('change 이벤트 발생');
      updateRemoteCursors(newAwareness);
    };

    newAwareness.on('update', handleAwarenessUpdate);
    newAwareness.on('change', handleAwarenessChange);

    awarenessHandlers.set(fileName, {
      handleAwarenessUpdate,
      handleAwarenessChange,
    });

    //oldfile 전환
    setOldFile(fileName);
  };

  // ✅ 파일 전환 처리
  const switchToFile = (fileName: string) => {
    // 기존 파일에 있던 awareness 값 비활성화
    const oldAwareness = awarenessMap[currentFileRef.current];
    oldAwareness.setLocalState(null);

    const socket = socketRef.current!;

    // 🔧 이전 바인딩
    if (bindingMap[oldFile]) {
      console.log('binding:', oldFile);
      bindingMap[oldFile].destroy();
      delete bindingMap[oldFile];
    }

    // 이전  모델 제거
    if (modelMap[oldFile]) {
      console.log('model:', oldFile);
      const model = modelMap[oldFile];
      if (!model.isDisposed()) model.dispose();
      delete modelMap[oldFile];
    }

    // ✅ 기존 ydoc, awareness는 무조건 파괴하고 새로 생성 (기존 상태 꼬임 방지)
    if (ydocs[fileName]) {
      ydocs[fileName].destroy();
      delete ydocs[fileName];
    }
    if (awarenessMap[fileName]) {
      awarenessMap[fileName].destroy();
      delete awarenessMap[fileName];
    }

    // ✅ 새 ydoc / awareness 생성 및 저장
    const { ydoc, awareness } = createYDocAndAwareness(fileName);
    ydocs[fileName] = ydoc;
    awarenessMap[fileName] = awareness;

    // 🔧 모델이 없으면 새로 생성
    const ytext = ydoc.getText(fileName);
    let model = modelMap[fileName];
    if (!model) model = createMonacoModel(fileName, ytext);

    // 🖋️ Monaco 에디터 모델 적용
    if (!monacoRef.current || monacoRef.current.getModel() === null) {
      // 기존 인스턴스가 있다면 먼저 dispose
      if (monacoRef.current) {
        console.log('기존 코드 모델 삭제');
        monacoRef.current.dispose();
        monacoRef.current = null;
      }

      monacoRef.current = monaco.editor.create(containerRef.current!, {
        model,
        theme: 'vs-dark',
        automaticLayout: true,
      });
    } else {
      monacoRef.current.setModel(model);
    }

    // 👆 커서 리스너 중복 제거 후 등록
    if (cursorListenerRef.current) cursorListenerRef.current.dispose();
    cursorListenerRef.current = monacoRef.current.onDidChangeCursorPosition(
      (e) => {
        const current = awareness.getLocalState()?.cursor;
        const next = { line: e.position.lineNumber, column: e.position.column };
        if (
          !current ||
          current.line !== next.line ||
          current.column !== next.column
        ) {
          awareness.setLocalStateField('cursor', next);
        }
      },
    );

    // 🔗 바인딩 연결
    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([monacoRef.current]),
      awareness,
    );
    bindingMap[fileName] = binding;

    // 📌 이벤트 재등록
    registerSocketEvents(fileName, socket);
  };

  /** ✅ Awareness 기반 사용자 커서 표시 */
  const updateRemoteCursors = (awareness: awarenessProtocol.Awareness) => {
    const editor = monacoRef.current!;
    if (!editor) {
      console.warn('[awareness] editor가 아직 생성되지 않음');
      return;
    }

    const states = awareness.getStates();
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

    for (const [clientId, state] of states) {
      if (clientId === awareness.clientID) continue;
      const user = state.user;
      const cursor = state.cursor;
      if (!user || !cursor) continue;

      newDecorations.push({
        range: new monaco.Range(
          cursor.line,
          cursor.column,
          cursor.line,
          cursor.column,
        ),
        options: {
          className: 'remote-cursor',
          afterContentClassName: `remote-cursor-label-${clientId}`,
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });

      addCursorLabelStyle(clientId, user.name, user.color);
    }

    const decorationIds = editor.deltaDecorations(
      oldDecorationsRef.current,
      newDecorations,
    );
    oldDecorationsRef.current = decorationIds;
  };

  /** ✅ 파일 이름에 따라 언어 결정 */
  const getLanguageFromFile = (filename: string): string => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    return 'plaintext';
  };

  const addCursorLabelStyle = (
    clientId: number,
    username: string,
    color: string,
  ) => {
    const style = document.createElement('style');
    style.innerHTML = `
    .remote-cursor-label-${clientId}::after {
      content: "${username}";
      position: absolute;
      background: ${color};
      color: white;
      padding: 1px 4px;
      font-size: 10px;
      border-radius: 3px;
      transform: translateY(-1.2em);
      white-space: nowrap;
    }
  `;
    document.head.appendChild(style);
  };

  const problemRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const togglePanel = (panel: 'chat' | 'ai') => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const consoleRef = useRef<ConsoleBoxHandle>(null);

  const handleRun = () => {
    console.log('실행');
  };

  // ✉️ 채팅 메시지 전송 함수
  const handleSendChat = () => {
    console.log('채팅:', chatInputRef.current?.value);
    const content = chatInputRef.current?.value;

    if (!content) return;

    const userName = username;
    const localtime = new Date().toLocaleTimeString();
    const newMessage: Message = {
      time: localtime,
      content,
      nickname: userName,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    console.log(input);
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('chat', { roomId, newMessage });
  };

  const handleSelectFile = (file: { fileId: string; filename: string }) => {
    const { fileId, filename } = file;
    console.log(fileId, filename);

    if (filename !== currentFileRef.current || !ydocs[filename]) {
      console.log('파일 변경:', filename);

      if (socketRef.current) {
        console.log('파일변경');
        switchToFile(filename);
        currentFileRef.current = filename;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-gray-100 dark:bg-black text-black dark:text-white transition-colors min-w-0">
      <Header
        filename={currentFileRef.current}
        isOwner={isOwner}
        onToggleDarkMode={handleThemeToggle}
        onSettingClick={() => setSettingModalOpen(true)}
      />
      <main className="flex flex-row h-full w-full min-w-0">
        <Sidebar
          fileTree={dummyFileTree}
          users={users}
          className="border border-gray-200 dark:border-gray-700"
          onInviteClick={() => setInviteModalOpen(true)}
          currentFile={currentFileRef.current}
          onSelectFile={handleSelectFile}
        />
        <div className="flex flex-col flex-grow shrink min-w-0">
          <SubHeader
            mode={mode}
            showPreview={isPreviewVisible}
            onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
            onRunCode={handleRun}
          />
          <div className="flex w-full h-full">
            <div className={isPreviewVisible ? 'w-1/2' : 'w-full'}>
              {/* 모나코 에디터 */}
              <div
                ref={containerRef}
                style={{ height: '500px', border: '1px solid #ccc' }}
              />
            </div>
            {isPreviewVisible && (
              <div className="w-1/2 h-full bg-gray-0 dark:bg-black p-4 overflow-y-auto">
                {mode === 'problem' ? (
                  <div className="h-full bg-gray-0 dark:bg-black p-4 overflow-y-auto">
                    <ProblemPreview textareaRef={problemRef} />
                  </div>
                ) : (
                  <>HTML 미리보기</>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-row justify-end items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-3 gap-3">
            <ChatBubbleLeftRightIcon
              className={`w-4 h-4 mr-1 text-sm cursor-pointer ${
                activePanel === 'chat'
                  ? 'text-primary-500'
                  : 'text-gray-700 dark:text-gray-100'
              }`}
              onClick={() => togglePanel('chat')}
            />
            <LightBulbIcon
              className={`w-4 h-4 mr-1 text-sm cursor-pointer ${
                activePanel === 'ai'
                  ? 'text-secondary-500'
                  : 'text-gray-700 dark:text-gray-100'
              }`}
              onClick={() => togglePanel('ai')}
            />
          </div>

          <div className="flex flex-col bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-3">
              <div>콘솔</div>
              <TrashIcon className="w-4 h-4 mr-1 text-gray-700 dark:text-primary-100 text-sm" />
            </div>
            <ConsoleBox consoleRef={consoleRef} />
          </div>
        </div>
        {activePanel && (
          <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shrink-0 flex flex-col">
            <PanelTabHeader
              activePanel={activePanel}
              onChange={(panel) => setActivePanel(panel)}
              onClose={() => setActivePanel(null)}
              isDarkMode={isDarkMode}
            />
            <ChatPanel
              activePanel={activePanel}
              chatMessages={messages}
              aiMessages={aiMessages}
              inputRef={chatInputRef}
              onSendChat={handleSendChat}
            />
          </div>
        )}
      </main>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="팀원 초대하기"
        confirmText="초대하기"
        cancelText="취소"
        onConfirm={() => {
          setInviteModalOpen(false);
          alert('초대 전송');
        }}
        onCancel={() => setInviteModalOpen(false)}
      >
        <TextField
          label="이메일 주소"
          placeholder="초대할 팀원의 이메일을 입력하세요."
        />
      </Modal>

      <Modal
        isOpen={settingModalOpen}
        onClose={() => setSettingModalOpen(false)}
        title="방 설정"
        confirmText="방 종료"
        cancelText="취소"
        onConfirm={() => {
          setSettingModalOpen(false);
          alert('방이 종료되었습니다.');
        }}
        onCancel={() => setSettingModalOpen(false)}
      >
        <div className="text-sm text-red-500"></div>
      </Modal>
    </div>
  );
}
