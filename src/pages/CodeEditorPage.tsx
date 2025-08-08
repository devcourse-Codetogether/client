import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { useLocation } from 'react-router-dom';
import { postAIQuestion, postCodeReview } from '../services/aiChat';
import { executeCode, saveCode } from '../services/code';
import { useUserStore } from '../stores/useUserStore';
import '../utils/monacoWorkers';
import DOMPurify from 'dompurify';

import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';

import * as awarenessProtocol from 'y-protocols/awareness.js';

import { getRandomColor } from '../utils/cursor';

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

const usercolor = getRandomColor(); // 사용자 커서 색상 지정

const webFileTree: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    childrenNode: [
      { id: '2', name: 'index.html', type: 'file' },
      { id: '3', name: 'style.css', type: 'file' },
      { id: '4', name: 'app.js', type: 'file' },
    ],
  },
];

const getExtensionByLanguage = (language: string): string => {
  switch (language) {
    case 'python':
      return 'py';
    case 'cpp':
      return 'cpp';
    case 'java':
      return 'java';
    case 'c':
      return 'c';
    case 'javascript':
    case 'js':
      return 'js';
    case 'typescript':
    case 'ts':
      return 'ts';
    default:
      return 'txt';
  }
};

const getFileTree = (mode: string, language: string): FileNode[] => {
  if (mode === '웹편집') return webFileTree;

  const ext = getExtensionByLanguage(language);
  return [
    {
      id: '1',
      name: `solution.${ext}`,
      type: 'file',
    },
  ];
};

export default function CodeEditorPage() {
  const location = useLocation();

  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'ai' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const cursorListenerRef = useRef<monaco.IDisposable | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const previewDisposablesRef = useRef<monaco.IDisposable[]>([]);

  // 디바운스 도우미
  const debounce = (fn: (...a: any[]) => void, ms = 150) => {
    let t: number | undefined;
    return (...args: any[]) => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), ms);
    };
  };

  const refreshPreview = useCallback(() => {
    if (!isPreviewVisible || !previewRef.current) return;
    const htmlFile = pickByExt('.html') || 'index.html';
    const cssFile = pickByExt('.css') || 'style.css';
    const jsFile = pickByExt('.js') || 'app.js';
    const html = readFile(htmlFile);
    const css = readFile(cssFile);
    const js = readFile(jsFile);
    previewRef.current.srcdoc = buildPreviewHTML(html, css, js);
  }, [isPreviewVisible]);

  const refreshPreviewDebounced = useMemo(
    () => debounce(refreshPreview, 180),
    [refreshPreview],
  );

  const watchPreviewSources = useCallback(() => {
    previewDisposablesRef.current.forEach((d) => d.dispose());
    previewDisposablesRef.current = [];

    const names = Object.keys(modelMap).filter(
      (n) => n.endsWith('.html') || n.endsWith('.css') || n.endsWith('.js'),
    );

    names.forEach((name) => {
      const m = modelMap[name];
      if (!m || m.isDisposed()) return;
      const d = m.onDidChangeContent(() => {
        refreshPreviewDebounced();
      });
      previewDisposablesRef.current.push(d);
    });

    refreshPreviewDebounced();
  }, [refreshPreviewDebounced]);

  useEffect(() => {
    refreshPreview();
  }, [isPreviewVisible, refreshPreview]);

  // 파일 내용 읽기 (modelMap 우선, 없으면 Yjs에서)
  const readFile = (name: string) => {
    const model = modelMap[name];
    if (model && !model.isDisposed()) return model.getValue();
    const ydoc = ydocs[name];
    if (ydoc) return ydoc.getText(name).toString();
    return '';
  };

  // 파일명 자동 탐색 (트리에서 이름이 달라도 확장자로 찾기)
  const pickByExt = (ext: string) => {
    const keys = Object.keys(modelMap).concat(Object.keys(ydocs));
    // 우선 index.html, style.css, app.js가 있으면 그것부터
    const preferred = {
      '.html': ['index.html'],
      '.css': ['style.css'],
      '.js': ['app.js'],
    }[ext];

    if (preferred) {
      for (const p of preferred) if (keys.includes(p)) return p;
    }
    // 없으면 확장자로 아무거나 하나
    return keys.find((k) => k.endsWith(ext)) ?? '';
  };

  const sanitizeHTML = (dirty: string) => {
    return DOMPurify.sanitize(dirty, {
      // 기본값으로도 script, on* 제거됨. 그래도 명시적으로 제한해두면 좋음.
      ALLOWED_TAGS: [
        'div',
        'span',
        'p',
        'a',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'strong',
        'em',
        'b',
        'i',
        'u',
        'code',
        'pre',
        'blockquote',
        'img',
        'br',
        'hr',
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
        'section',
        'article',
        'header',
        'footer',
        'main',
        'nav',
      ],
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'width',
        'height',
        'class',
        'id',
        'style',
      ],
      // 잠재적으로 위험한 URL 스킴 차단 (javascript:, data: 등)
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      // <iframe> 같은 것까지 허용하고 싶지 않으면 FORBID_TAGS에 추가
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      // style 허용을 원치 않으면 ALLOWED_ATTR에서 style 빼기
    });
  };

  const buildPreviewHTML = (htmlRaw = '', cssRaw = '', jsRaw = '') => {
    const safeHTML = sanitizeHTML(htmlRaw ?? '');
    const safeCSS = (cssRaw ?? '').replace(/<\/style>/gi, '<\\/style>');
    const safeJS = (jsRaw ?? '').replace(/<\/script>/gi, '<\\/script>');

    return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Preview</title>
<style>${safeCSS}</style>
</head>
<body>
${safeHTML}
<script>
${safeJS}
</script>
</body>
</html>`;
  };

  const username = useUserStore((state) => state.user?.nickname);
  const userId = useUserStore((state) => state.user?.id);

  let lastCursorState: { line: number; column: number } = {
    line: 0,
    column: 0,
  };

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [aiMessages, setAIMessages] = useState<Message[]>([
    {
      nickname: 'AI 도우미',
      time: '',
      content:
        '안녕하세요. AI 도우미입니다. 코드 리뷰를 원하신다면 코드 리뷰 버튼을 눌러주시고, 궁금한 점이 있으시면 채팅으로 자유롭게 물어봐 주세요.',
    },
  ]);

  // 페이지에서 넘어온 데이터
  console.log(location.state);
  const {
    id: roomId,
    language,
    mode,
    ownerId,
    participants: users,
    title,
  } = location.state || {};

  const fileTree: FileNode[] = getFileTree(mode, language);

  // ✅ 초기 파일명 헬퍼
  const getInitialFileName = (mode?: string, language?: string) => {
    if (mode === '웹편집') return 'index.html';
    const ext = getExtensionByLanguage(language ?? '');
    return `solution.${ext}`;
  };

  // ✅ 초기 파일명 생성
  const initialFileName = useMemo(
    () => getInitialFileName(mode, language),
    [mode, language],
  );

  // 모나코, yjs, awareness, socket io
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Monaco 인스턴스
  const socketRef = useRef<Socket | null>(null);
  const oldDecorationsRef = useRef<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentFileRef = useRef<string>(initialFileName);
  const [oldFile, setOldFile] = useState<string>('');

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
  }, [roomId]);

  // ✅ 소켓 초기화 함수 (Fast Refresh 대응 없이 단순 생성)
  const initSocket = () => {
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
      theme: isDarkMode ? 'vs-dark' : 'vs',
      automaticLayout: true,
      // 🔽 자동완성/힌트 관련
      quickSuggestions: { other: true, comments: true, strings: true },
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: 'off',
      tabCompletion: 'on',
      parameterHints: { enabled: true },
      formatOnType: true,
      formatOnPaste: true,
      // 편의
      minimap: { enabled: true },
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
    watchPreviewSources();
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
      setChatMessages((prev) => [...prev, newMessage]);
    };

    // 채팅 동기화
    const handleChatSync = (chatmessages: Message[]) => {
      console.log('동기화 테스트', chatmessages);
      if (chatmessages.length == 0) {
        console.log('동기화 메시지 빈값');
      }
      chatmessages.map((message) => {
        console.log(message.content);
        setChatMessages((prev) => [...prev, message]);
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
        theme: isDarkMode ? 'vs-dark' : 'vs',
        automaticLayout: true,
        // 🔽 자동완성/힌트 관련
        quickSuggestions: { other: true, comments: true, strings: true },
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: 'off',
        tabCompletion: 'on',
        parameterHints: { enabled: true },
        formatOnType: true,
        formatOnPaste: true,
        // 편의
        minimap: { enabled: true },
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
    watchPreviewSources();
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
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.py')) return 'python';
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
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      // Monaco 전역 테마 변경
      monaco.editor.setTheme(next ? 'vs-dark' : 'vs');
      monacoRef.current?.layout();

      return next;
    });
  };

  const togglePanel = (panel: 'chat' | 'ai') => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const consoleRef = useRef<ConsoleBoxHandle>(null);

  const handleSendChat = () => {
    const content = chatInputRef.current?.value;
    if (!content) return;
    chatInputRef.current!.value = '';

    const localtime = new Date().toLocaleTimeString();
    const newMessage: Message = {
      time: localtime,
      content,
      nickname: username ?? '',
    };

    setChatMessages((prev) => [...prev, newMessage]);
    socketRef.current?.emit('chat', { roomId, newMessage, userId });
  };

  const handleSendAIQuestion = async () => {
    const content = chatInputRef.current?.value;
    if (!content) return;
    chatInputRef.current!.value = '';

    const localtime = new Date().toLocaleTimeString();
    setAIMessages((prev) => [
      ...prev,
      { time: localtime, content, nickname: username ?? '' },
    ]);

    try {
      const answer = await postAIQuestion(roomId, content);
      setAIMessages((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          content: answer ?? 'AI 응답이 없습니다.',
          nickname: 'AI 도우미',
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCodeReview = async () => {
    const content = monacoRef.current?.getValue() ?? '';
    if (!content) return;

    const localtime = new Date().toLocaleTimeString();
    const userMessage: Message = {
      time: localtime,
      content: '[코드 리뷰 요청]',
      nickname: username ?? '',
    };

    setAIMessages((prev) => [...prev, userMessage]);
    console.log(content);
    try {
      const response = await postCodeReview(roomId, content);

      const aiMessage: Message = {
        time: new Date().toLocaleTimeString(),
        content: response.answer ?? 'AI 응답이 없습니다.',
        nickname: 'AI 도우미',
      };
      console.log(response);
      setAIMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setAIMessages((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          content: 'AI 응답을 가져오는 데 실패했습니다.',
          nickname: '시스템',
        },
      ]);
    }
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

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('방 주소가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert(
        '복사에 실패했습니다. 브라우저가 클립보드를 지원하는지 확인하세요.',
      );
    }
  };

  const handleExecuteCode = async () => {
    if (!roomId || !language || !monacoRef.current) return;

    const code = monacoRef.current.getValue();

    try {
      const output = await executeCode(roomId, language, code, '');
      console.log(output);
      consoleRef.current?.appendLog(`🟢 실행 결과:\n${output}`);
    } catch (err) {
      console.error('❌ 코드 실행 오류:', err);
      consoleRef.current?.appendLog('❌ 코드 실행 중 오류가 발생했습니다.');
    }
  };

  const handleSaveCode = async () => {
    if (!roomId || !language || !monacoRef.current) return;

    const code = monacoRef.current.getValue();

    try {
      await saveCode(roomId, language, code);
      consoleRef.current?.appendLog('💾 코드가 저장되었습니다.');
    } catch (err) {
      console.error('❌ 코드 저장 오류:', err);
      consoleRef.current?.appendLog('❌ 코드 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-screen h-screen bg-gray-100 dark:bg-black text-black dark:text-white transition-colors min-w-0">
      <Header
        filename={title}
        isOwner={ownerId === userId}
        onToggleDarkMode={handleThemeToggle}
        onSettingClick={() => setSettingModalOpen(true)}
      />
      <main className="flex flex-row h-full w-full min-w-0">
        <Sidebar
          fileTree={fileTree}
          users={users}
          className="border-r border-gray-200 dark:border-gray-700"
          onInviteClick={handleInvite}
          onSaveClick={handleSaveCode}
          currentFile={currentFileRef.current}
          onSelectFile={handleSelectFile}
        />
        <div className="flex flex-col flex-grow shrink min-w-0">
          <SubHeader
            mode={mode === '문제풀이' ? 'problem' : 'web'}
            showPreview={isPreviewVisible}
            onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
            onRunCode={handleExecuteCode}
          />
          <div className="flex w-full flex-1 min-h-0">
            <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} min-h-0`}>
              <div
                ref={containerRef}
                className="w-full h-full border border-gray-200 dark:border-gray-700"
              />
            </div>
            {isPreviewVisible && (
              <div className="w-1/2 h-full bg-white dark:bg-black p-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
                {mode === 'problem' ? (
                  <ProblemPreview textareaRef={problemRef} />
                ) : (
                  <iframe
                    ref={previewRef}
                    title="web-preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-row justify-end items-center bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-3 gap-3">
            <ChatBubbleLeftRightIcon
              className={`w-4 h-4 cursor-pointer ${
                activePanel === 'chat'
                  ? 'text-primary-500'
                  : 'text-gray-700 dark:text-gray-100'
              }`}
              onClick={() => togglePanel('chat')}
            />
            <LightBulbIcon
              className={`w-4 h-4 cursor-pointer ${
                activePanel === 'ai'
                  ? 'text-secondary-500'
                  : 'text-gray-700 dark:text-gray-100'
              }`}
              onClick={() => togglePanel('ai')}
            />
          </div>

          <div className="flex flex-col bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-row justify-between items-center py-3 px-3">
              <div className="text-sm font-medium">콘솔</div>
              <TrashIcon className="w-4 h-4 text-gray-700 dark:text-primary-100 cursor-pointer" />
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
              onSendChat={handleSendChat}
              onSendAIQuestion={handleSendAIQuestion}
              onCodeReview={handleCodeReview}
            />
          </div>
        )}
      </main>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="방 주소 복사"
        confirmText="복사하기"
        cancelText="닫기"
        onConfirm={async () => {
          try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            alert('방 주소가 클립보드에 복사되었습니다.');
          } catch (err) {
            console.error('클립보드 복사 실패:', err);
            alert(
              '복사에 실패했습니다. 브라우저가 클립보드를 지원하는지 확인하세요.',
            );
          }
          setInviteModalOpen(false);
        }}
        onCancel={() => setInviteModalOpen(false)}
      >
        <div className="text-sm text-gray-700 dark:text-gray-200">
          아래 버튼을 누르면 방 주소가 클립보드에 복사됩니다.
          <br />
          복사된 주소를 다른 사용자에게 공유하세요.
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 border rounded text-xs break-all">
            {`${window.location.origin}/code/${roomId}`}
          </div>
        </div>
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
        <div className="text-sm text-red-500" />
      </Modal>
    </div>
  );
}
