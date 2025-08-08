import { useState } from 'react';

export const useModals = () => {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  return {
    isCreateRoomModalOpen,
    openCreateRoomModal: () => setIsCreateRoomModalOpen(true),
    closeCreateRoomModal: () => setIsCreateRoomModalOpen(false),
  };
};
