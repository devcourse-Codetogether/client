import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/codeeditorpage/Sidebar';
import Header from '../components/codeeditorpage/Header';
import SubHeader from '../components/codeeditorpage/SubHeader';
import MonacoEditor from '../components/codeeditorpage/MonacoEditor';
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
  time: string;
  sender: 'me' | 'other';
  text: string;
  name: string;
}

export default function CodeEditorPage2() {
  const username = getRandomName();
  const usercolor = getRandomColor();
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'ai' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);

  const dummyFileTree: FileNode[] = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      childrenNode: [
        {
          id: '2',
          name: 'App.tsx',
          type: 'file',
        },
        {
          id: '3',
          name: 'components',
          type: 'folder',
          childrenNode: [{ id: '4', name: 'Sidebar.tsx', type: 'file' }],
        },
      ],
    },
  ];
  const users = [
    { id: 1, nickname: '기영', line: 42 },
    { id: 2, nickname: '수연', line: 13 },
    { id: 3, nickname: '예람', line: 87 },
  ];
  const filename = 'Main.tsx';
  const isOwner = true;
  const mode = 'problem';
  const chatMessages = [
    {
      nickname: '기영',
      time: '10:15',
      content: '여기 문제 조건 다시 확인해주세요.',
    },
    { nickname: '민수', time: '10:17', content: '네 알겠습니다!' },
    { nickname: '하린', time: '10:18', content: '힌트는 어디에 있나요?' },
  ];

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
  const { roomId, type } = location.state || {};

  // 모나코, yjs, awareness, socket io
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Monaco 인스턴스
  const socketRef = useRef<Socket | null>(null);
  const oldDecorationsRef = useRef<string[]>([]);

  const ydocs: Record<string, Y.Doc> = {};
  const awarenessMap: Record<string, awarenessProtocol.Awareness> = {};
  const bindingMap: Record<string, MonacoBinding> = {};
  const modelMap: Record<string, monaco.editor.ITextModel> = {};

  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFile, setCurrentFile] = useState('App.tsx');

  const didInit = useRef(false);

  // const [messages, setMessages] = useState<Message[]>([]);
  // const [input, setInput] = useState('');

  // 추가 부분
  useEffect(() => {
    // ✅ 소켓이 생성되지 않았다면 최초 1회만 생성
    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to server', socket.id);
      socket.emit('join', { roomId });
    });

    // ⚠️ Monaco 에디터를 렌더링할 DOM이 없다면 중단
    if (!containerRef.current) {
      console.warn('⚠️ containerRef가 아직 준비되지 않음.');
      return;
    }

    // 기본 파일 초기화
    initYDocIfNeeded(currentFile, socket);
    switchToFile(currentFile);

    // ✅ 브라우저 종료 시 사용자 상태 정리
    const cleanUp = () => {
      awarenessMap[currentFile].setLocalState(null);
    };

    window.addEventListener('beforeunload', cleanUp);

    // 🔁 컴포넌트 언마운트 또는 Fast Refresh 시 정리 작업
    return () => {
      cleanUp();
      window.removeEventListener('beforeunload', cleanUp);

      monacoRef.current?.dispose?.();
      Object.values(bindingMap).forEach((b) => b.destroy());
      Object.values(awarenessMap).forEach((a) => a.destroy());
      setTimeout(() => socket.disconnect(), 50); // 💡 100~200ms 정도 기다려주는 게 일반적
    };
  }, []);

  // ✅ 소켓 초기화 함수 (Fast Refresh 대응 없이 단순 생성)
  const initSocket = () => {
    return io('http://localhost:3002/collab-webpublish', {
      transports: ['websocket'],
      withCredentials: true,
    });
  };

  /** ✅ 파일이 선택될 때마다 호출하여 해당 파일의 Yjs 연결 준비 */
  const initYDocIfNeeded = (fileName: string, socket: Socket) => {
    if (!ydocs[fileName]) {
      console.log('ydoc와 awareness 생성 ');
      const ydoc = new Y.Doc();
      ydocs[fileName] = ydoc;

      const awareness = new awarenessProtocol.Awareness(ydoc);
      awareness.setLocalStateField('user', {
        name: username,
        color: usercolor,
      });
      awarenessMap[fileName] = awareness;
    }

    registerSocketEvents(fileName, socket);
  };

  const registerSocketEvents = (fileName: string, socket: Socket) => {
    const ydoc = ydocs[fileName]!;
    const awareness = awarenessMap[fileName]!;

    console.log('ydoc, awareness:', ydoc, awareness);

    const handleSync = ({
      update,
      filename,
    }: {
      update: Uint8Array;
      filename: string;
    }) => {
      if (filename !== fileName) return;
      Y.applyUpdate(ydoc, new Uint8Array(update));
    };

    const handleUpdate = ({
      update,
      filename,
    }: {
      update: Uint8Array;
      filename: string;
    }) => {
      if (filename !== fileName) return;
      Y.applyUpdate(ydoc, new Uint8Array(update));
    };

    const handleAwarenessUpdate = ({
      update,
      filename,
    }: {
      update: Uint8Array;
      filename: string;
    }) => {
      if (filename !== fileName) return;
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        new Uint8Array(update),
        null,
      );
    };

    socket.off('sync', handleSync);
    socket.off('update', handleUpdate);
    socket.off('awareness-update', handleAwarenessUpdate);

    socket.on('sync', handleSync);
    socket.on('update', handleUpdate);
    socket.on('awareness-update', handleAwarenessUpdate);

    // 파일 싱크 요청
    socket.emit('sync', { roomId, fileName });

    ydoc.on('update', (update: Uint8Array) => {
      console.log('ydoc 업데이트:', fileName);
      socket.emit('update', { roomId, fileName, update });
    });

    awareness.on('update', ({ added, updated, removed }) => {
      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        added.concat(updated, removed),
      );
      socket.emit('awareness-update', { roomId, fileName, update });
    });

    awareness.on('change', () => {
      if (currentFile !== fileName) return;
      updateRemoteCursors(awareness);
    });
  };

  /** ✅ 파일 전환 시 Monaco 에디터와 Yjs 연결 전환 */
  const switchToFile = (fileName: string) => {
    console.log('[switchToFile] 진입:', fileName);
    const ydoc = ydocs[fileName];
    const awareness = awarenessMap[fileName];
    const ytext = ydoc.getText(fileName);
    const uri = monaco.Uri.parse(`file:///${fileName}`);

    // ✅ 1. modelMap 또는 monaco 내부에서 모델 가져오기
    let model = modelMap[fileName] ?? monaco.editor.getModel(uri);

    // ✅ 2. 없으면 새로 생성
    if (!model) {
      console.log('처음 모델 생성');
      model = monaco.editor.createModel(
        ytext.toString(),
        getLanguageFromFile(fileName),
        uri,
      );
    } else {
      console.log('지금 모델이 있다고? model:', model);
    }

    modelMap[fileName] = model;

    // ✅ 3. Monaco Editor 인스턴스가 없다면 생성
    if (!monacoRef.current || monacoRef.current.getModel() === null) {
      console.log('모나코 에디터 인스턴스 생성');
      monacoRef.current = monaco.editor.create(containerRef.current!, {
        model,
        theme: 'vs-dark',
        automaticLayout: true,
      });

      // ✅ 커서 위치 awareness 등록
      monacoRef.current.onDidChangeCursorPosition((e) => {
        awareness.setLocalStateField('cursor', {
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });
    } else {
      // ✅ 4. 모델 전환
      monacoRef.current.setModel(model);
    }

    // ✅ 5. 기존 바인딩 제거 후 새로 연결
    const prevBinding = bindingMap[fileName];
    if (
      prevBinding &&
      !(prevBinding as any)._isDisposed &&
      prevBinding.awareness === awarenessMap[fileName]
    ) {
      try {
        console.log('바인딩이 있다고?');
        prevBinding.destroy();
      } catch (err) {
        console.warn(`[yjs] 바인딩 제거 중 오류 (무시 가능):`, err);
      }
    } else {
      console.log('바인딩 안되어 잇음');
    }

    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([monacoRef.current]),
      awareness,
    );

    bindingMap[fileName] = binding;
  };

  /** ✅ Awareness 기반 사용자 커서 표시 */
  const updateRemoteCursors = (awareness: awarenessProtocol.Awareness) => {
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

    const editor = monacoRef.current!;
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

  // ✉️ 채팅 메시지 전송 함수
  // const sendMessage = () => {
  //   if (input.trim() === '') return;
  //   if (!awarenessRef.current) return;

  //   const state = awarenessRef.current.getLocalState();

  //   if (!state) return;

  //   const userName = state.user.name;

  //   const localtime = new Date().toLocaleTimeString();

  //   const message: Message = {
  //     time: localtime,
  //     sender: 'me',
  //     text: input,
  //     name: '',
  //   };

  //   setMessages((prev) => [...prev, message]);
  //   setInput('');

  //   const socket = socketRef.current;
  //   if (!socket) return;
  //   const newMessage = { ...message, name: userName };
  //   socket.emit('chat', { roomId, newMessage });
  // };

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

  const handleSendChat = () => {
    console.log('채팅:', chatInputRef.current?.value);
  };

  const handleSelectFile = (file: { fileId: string; filename: string }) => {
    const { fileId, filename } = file;
    console.log(fileId, filename);

    if (filename !== currentFile) {
      console.log('파일 변경:', filename);
      setCurrentFile(filename);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-gray-100 dark:bg-black text-black dark:text-white transition-colors min-w-0">
      <Header
        filename={filename}
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
          currentFile={currentFile}
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
              {/* <MonacoEditor theme={isDarkMode ? 'dark' : 'light'} /> */}

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
              chatMessages={chatMessages}
              aiMessages={aiMessages}
              inputRef={chatInputRef}
              onSendChat={sendMessage}
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
