import React, { useState } from 'react';
import Modal from '../common/Modal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filterData: { mode: string; language: string }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedMode, setSelectedMode] = useState('전체');
  const [selectedLanguage, setSelectedLanguage] = useState('전체');

  const handleConfirm = () => {
    onConfirm({
      mode: selectedMode,
      language: selectedLanguage,
    });
  };

  const handleReset = () => {
    setSelectedMode('전체');
    setSelectedLanguage('전체');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="필터 설정"
      confirmText="적용"
      cancelText="초기화"
      onConfirm={handleConfirm}
      onCancel={handleReset}
    >
      <div className="space-y-6">
        {/* 모드 선택 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">모드</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="전체"
                checked={selectedMode === '전체'}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="문제풀이"
                checked={selectedMode === '문제풀이'}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">문제풀이</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="웹편집"
                checked={selectedMode === '웹편집'}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">웹편집</span>
            </label>
          </div>
        </div>

        {/* 언어 선택 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">언어</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="전체"
                checked={selectedLanguage === '전체'}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="JavaScript"
                checked={selectedLanguage === 'JavaScript'}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">JavaScript</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="Python"
                checked={selectedLanguage === 'Python'}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Python</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="Java"
                checked={selectedLanguage === 'Java'}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Java</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="HTML/CSS"
                checked={selectedLanguage === 'HTML/CSS'}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">HTML/CSS</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
