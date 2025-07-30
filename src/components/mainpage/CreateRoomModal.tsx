import React, { useState } from 'react';
import Modal from '../common/Modal';
import TextField from '../common/TextField';
import Dropdown from '../common/Dropdown';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roomData: {
    title: string;
    mode: string;
    language: string;
  }) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('문제풀이');
  const [language, setLanguage] = useState('');

  const languageOptions = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'HTML/CSS', value: 'html' },
  ];

  const handleConfirm = () => {
    if (!title.trim() || !language) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    onConfirm({
      title: title.trim(),
      mode,
      language,
    });

    // 폼 초기화
    setTitle('');
    setMode('문제풀이');
    setLanguage('');
  };

  const handleCancel = () => {
    // 폼 초기화
    setTitle('');
    setMode('문제풀이');
    setLanguage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="새 방 만들기"
      confirmText="방 만들기"
      cancelText="취소"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div className="space-y-4">
        {/* 방 제목 */}
        <div>
          <TextField
            label="방 제목"
            placeholder="방 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>

        {/* 모드 선택 */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            모드 선택
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="문제풀이"
                checked={mode === '문제풀이'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2 text-primary-600 focus:ring-primary-700"
              />
              <span className="text-sm text-gray-700">문제풀이</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="웹편집"
                checked={mode === '웹편집'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">웹편집</span>
            </label>
          </div>
        </div>

        {/* 언어 선택 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            언어 선택
          </label>
          <Dropdown
            placeholder="언어를 선택하세요"
            options={languageOptions}
            onOptionSelect={setLanguage}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateRoomModal;
