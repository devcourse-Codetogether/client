import { useState } from 'react';

export const useModals = () => {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return {
    isCreateRoomModalOpen,
    isFilterModalOpen,
    openCreateRoomModal: () => setIsCreateRoomModalOpen(true),
    closeCreateRoomModal: () => setIsCreateRoomModalOpen(false),
    openFilterModal: () => setIsFilterModalOpen(true),
    closeFilterModal: () => setIsFilterModalOpen(false),
  };
};
