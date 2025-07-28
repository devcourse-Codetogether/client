import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';

import * as awarenessProtocol from 'y-protocols/awareness.js';

import { getRandomColor, getRandomName } from './util';

interface Message {
  time: string;
  sender: 'me' | 'other';
  text: string;
  name: string;
}

const CollaborativeTextarea2 = ({ roomId }: { roomId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null); // 에디터가 들어갈 div
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Monaco 인스턴스
  const socketRef = useRef<Socket | null>(null);
  const awarenessRef = useRef<awarenessProtocol.Awareness | null>(null);

  const ydocRef = useRef<Y.Doc | null>(null);
  const oldDecorationsRef = useRef<string[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // ✅ 소켓이 생성되지 않았다면 최초 1회만 생성
    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    // ✅ Y.Doc 인스턴스도 최초 1회만 생성
    if (!ydocRef.current) {
      ydocRef.current = new Y.Doc();
    }

    const ydoc = ydocRef.current;
    const ytext = ydoc.getText('shared');

    // ✅ Awareness 객체도 1회만 생성하고 사용자 상태 등록
    if (!awarenessRef.current) {
      awarenessRef.current = initAwareness(ydoc);
    }
    const awareness = awarenessRef.current;

    // 🔁 실시간 문서 동기화 관련 소켓 이벤트 설정
    socketEventsEdit(socket, ydoc, awareness);

    // 💬 채팅 관련 소켓 이벤트 설정
    socketEventChat(awareness);

    // 🖱️ 다른 사용자 커서 위치 추적 및 표시
    awarenessEvents(awareness, socket);

    // ⚠️ Monaco 에디터를 렌더링할 DOM이 없다면 중단
    if (!containerRef.current) return;

    // 📝 Monaco 에디터 생성 및 Awareness에 커서 위치 반영 설정
    const editor = initEditor(containerRef.current, awareness);
    monacoRef.current = editor;

    // 🔗 Monaco 에디터와 Yjs 문서 및 awareness 연결
    const binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      awareness,
    );

    // ✅ 브라우저 종료 시 사용자 상태 정리
    const cleanUp = () => {
      awareness.setLocalState(null);
    };

    window.addEventListener('beforeunload', cleanUp);

    // 🔁 컴포넌트 언마운트 또는 Fast Refresh 시 정리 작업
    return () => {
      cleanUp();
      window.removeEventListener('beforeunload', cleanUp);
      awareness.destroy();
      binding.destroy();
      editor.dispose();
      awarenessRef.current?.destroy?.();
      monacoRef.current?.dispose?.();
      socketRef.current?.disconnect?.();
      awarenessRef.current = null;
      monacoRef.current = null;
      socketRef.current = null;
      setTimeout(() => socket.disconnect(), 50); // 💡 100~200ms 정도 기다려주는 게 일반적
    };
  }, [roomId]);

  // ✅ 소켓 초기화 함수 (Fast Refresh 대응 없이 단순 생성)
  const initSocket = () => {
    return io('http://localhost:3000/collab-algorism', {
      transports: ['websocket'],
      withCredentials: true,
    });
  };

  // ✅ Awareness 초기화 및 사용자 정보 등록
  const initAwareness = (ydoc: Y.Doc) => {
    const awareness = new awarenessProtocol.Awareness(ydoc);

    awareness.setLocalStateField('user', {
      name: getRandomName(),
      color: getRandomColor(),
    });
    return awareness;
  };

  // 📡 문서 편집과 관련된 소켓 이벤트 설정
  //socket.on(...)에 등록하는 콜백은 어디서 선언되었는지는 중요하지 않음
  // 해당 시점에 유효한 함수라면 어떤 함수든 가능
  const socketEventsEdit = (
    socket: Socket,
    ydoc: Y.Doc,
    awareness: awarenessProtocol.Awareness,
  ) => {
    socket.on('connect', () => {
      console.log('🔌 Connected to server', socket.id);
      socket.emit('join', { roomId });
    });

    // 서버로부터 문서 초기 상태 동기화
    socket.on('sync', (update: Uint8Array) => {
      const fixedUpdate =
        update instanceof Uint8Array ? update : new Uint8Array(update);
      if (fixedUpdate instanceof Uint8Array && fixedUpdate.length > 0) {
        Y.applyUpdate(ydoc, fixedUpdate);
      }
    });

    // 다른 클라이언트의 업데이트 반영
    socket.on('update', (update: Uint8Array | ArrayBuffer) => {
      try {
        const fixedUpdate =
          update instanceof Uint8Array ? update : new Uint8Array(update);
        Y.applyUpdate(ydoc, new Uint8Array(fixedUpdate));
      } catch (err) {
        console.error('update apply 실패:', err);
      }
    });

    // 현재 클라이언트의 업데이트를 서버로 전송
    ydoc.on('update', (update: Uint8Array) => {
      socket.emit('update', { roomId, update });
    });

    // Awareness 상태 동기화
    socket.on('awareness-update', (update: Uint8Array) => {
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        new Uint8Array(update),
        null,
      );
    });

    // 💬 채팅 메시지 수신 처리
    socket.on('chat', (receivedMessage: Message) => {
      console.log('receivedMessage:', receivedMessage);
      setMessages((prev) => [...prev, receivedMessage]);
    });
  };

  // 💬 사용자 Awareness에서 유저 이름 가져오기
  const socketEventChat = (awareness: awarenessProtocol.Awareness) => {
    const state = awareness.getLocalState();
    const userName = state.user.name;
    console.log(userName);

    // socket.emit("update", { roomId, update });
  };

  // 🎯 다른 사용자 Awareness 정보 기반 커서 표시 이벤트
  const awarenessEvents = (
    awareness: awarenessProtocol.Awareness,
    socket: Socket,
  ) => {
    // Awareness 업데이트가 발생하면 서버에 전송
    awareness.on('update', ({ added, updated, removed }) => {
      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        added.concat(updated, removed),
      );
      socket.emit('awareness-update', { roomId, update });
    });

    // Awareness 상태가 변경되면 커서 표시 업데이트
    awareness.on('change', () => {
      const states = awareness.getStates();
      const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

      for (const [clientId, state] of states) {
        if (clientId === awareness.clientID) continue; // 본인 제외
        const user = state.user;
        const cursor = state.cursor;
        if (!user || !cursor) continue; // 정보 없으면 생략

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

        // 🏷️ 유저 커서 이름 스타일 DOM에 추가
        addCursorLabelStyle(clientId, user.name, user.color);
      }

      const editor = monacoRef.current!;
      const decorationIds = editor.deltaDecorations(
        oldDecorationsRef.current,
        newDecorations,
      );
      oldDecorationsRef.current = decorationIds;
    });
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

  // 📝 Monaco Editor 초기화 및 Awareness 커서 반영
  const initEditor = (
    container: HTMLElement,
    awareness: awarenessProtocol.Awareness,
  ): monaco.editor.IStandaloneCodeEditor => {
    const editor = monaco.editor.create(container, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
    });

    editor.onDidChangeCursorPosition((e) => {
      awareness.setLocalStateField('cursor', {
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    return editor;
  };

  // ✉️ 채팅 메시지 전송 함수
  const sendMessage = () => {
    if (input.trim() === '') return;
    const userName = awarenessRef.current.getLocalState().user.name;

    const localtime = new Date().toLocaleTimeString();

    const message: Message = {
      time: localtime,
      sender: 'me',
      text: input,
      name: '',
    };

    setMessages((prev) => [...prev, message]);
    setInput('');

    const socket = socketRef.current;
    const newMessage = { ...message, name: userName };
    socket.emit('chat', { roomId, newMessage });
  };

  return (
    <>
      <div>
        <h2>💬 Collaborative Textarea with Cursor Sharing</h2>
        <div
          ref={containerRef}
          style={{ height: '500px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <div className="flex flex-col h-[500px] w-[350px] border rounded-2xl shadow-md p-4 bg-white">
          <div className="flex-1 overflow-y-auto space-y-2 mb-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'me' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    msg.sender === 'me' ? 'text-right' : 'text-left'
                  } text-gray-500`}
                >
                  {msg.name}
                </div>
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[70%] break-words ${
                    msg.sender === 'me'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>

                <div
                  className={`text-xs mb-1 ${
                    msg.sender === 'me' ? 'text-right' : 'text-left'
                  } text-gray-500`}
                >
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
              type="text"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm"
              onClick={sendMessage}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollaborativeTextarea2;
