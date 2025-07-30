import { useRef, useState } from 'react';
import Sidebar from '../components/CodeEditor/Sidebar';
import Header from '../components/CodeEditor/Header';
import SubHeader from '../components/CodeEditor/SubHeader';
import MonacoEditor from '../components/CodeEditor/MonacoEditor';
import type { FileNode } from '../types/CodeEditor.types';
import ConsoleBox from '../components/CodeEditor/ConsoleBox';
import ProblemPreview from '../components/CodeEditor/ProblemPreview';
import PanelTabHeader from '../components/CodeEditor/PanelTabHeader';
import ChatPanel from '../components/CodeEditor/ChatPanel';
import Modal from '../components/common/Modal';

import type { ConsoleBoxHandle } from '../components/CodeEditor/ConsoleBox';
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import TextField from '../components/common/TextField';

export default function CodeEditorPage() {
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'ai' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>('');

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

  const handleSelectFile = (filename: string) => {
    if (filename !== currentFile) {
      setCurrentFile(filename);
      console.log('파일 변경:', filename);
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
              <MonacoEditor theme={isDarkMode ? 'dark' : 'light'} />
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
