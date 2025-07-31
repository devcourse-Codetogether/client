import type { ReactNode } from 'react';
import Button from './Button';
import { XMarkIcon } from '@heroicons/react/24/solid';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // 모달 내용
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void; // 확인 버튼 클릭 시 동작
  onCancel?: () => void; // 취소 버튼 클릭 시 동작 (없으면 onClose 사용)
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-[90%] max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl font-bold cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel || onClose}
            text={cancelText}
            color="light"
          />
          <Button onClick={onConfirm} text={confirmText} color="primary" />
        </div>
      </div>
    </div>
  );
};

export default Modal;
