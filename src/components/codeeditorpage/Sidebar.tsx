import type { HTMLAttributes } from 'react';
import {
  DocumentCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/solid';
import FileTreeNode from './FileTreeNode';
import type { FileNode } from '../../types/CodeEditor.types';
import Button from '../common/Button';

interface User {
  id: number;
  nickname: string;
  line: number;
}

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  fileTree: FileNode[];
  users: User[];
  onInviteClick?: () => void;
  onSaveClick?: () => void;
  currentFile: string;
  onSelectFile: (file: { fileId: string; filename: string }) => void;
}

const colors = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-purple-500',
];

export default function Sidebar({
  fileTree,
  users,
  className = '',
  onInviteClick,
  onSaveClick,
  currentFile,
  onSelectFile,
  ...props
}: SidebarProps) {
  return (
    <div
      className={`p-4 bg-gray-100 dark:bg-gray-800 w-[256px] h-full flex flex-col shrink-0 ${className}`}
      {...props}
    >
      <div className="flex flex-row justify-between items-center">
        <div>파일 탐색기</div>
        <div className="flex flex-row gap-1 items-center">
          <DocumentCheckIcon
            onClick={onSaveClick}
            className="w-4 h-4 text-gray-600 dark:text-gray-400 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex flex-col justify-between w-full h-full mt-4">
        <div className="overflow-auto">
          {fileTree.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              currentFile={currentFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
        <div className="flex flex-col justify-start">
          <div className="flex flex-row justify-between py-2 px-2">
            <div className="flex flex-row gap-2 justify-start items-center">
              <UserGroupIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 text-sm" />
              <div className="text-sm">참여자</div>
            </div>
            <Button
              icon={<UserPlusIcon className="w-4 h-4" />}
              text="공유하기"
              onClick={onInviteClick}
              color="light"
              className="text-sm dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            />
          </div>
          <div className="flex flex-col gap-2 py-2 px-2">
            {users.map((user, i) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2 px-2 dark:bg-gray-700 rounded"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    colors[i % colors.length]
                  }`}
                >
                  {user.nickname[0]}
                </div>
                <div className="text-sm leading-[1.5]">
                  <div className="font-medium">{user.nickname}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
