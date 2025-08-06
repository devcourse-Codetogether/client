import { useState } from 'react';
import Modal from '../components/common/Modal';

const ModalTestPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');

  const handleCreate = () => {
    alert(`"${roomTitle}" 방을 만들었습니다!`);
    setIsOpen(false);
    setRoomTitle('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">모달 테스트 페이지</h1>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        새 방 만들기
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="새 방 만들기"
        confirmText="방 만들기"
        cancelText="취소"
        onConfirm={handleCreate}
        onCancel={() => setIsOpen(false)}
      >
        <input
          type="text"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          placeholder="방 제목을 입력하세요"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </Modal>
    </div>
  );
};

export default ModalTestPage;
