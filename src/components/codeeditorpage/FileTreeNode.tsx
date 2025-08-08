import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
} from '@heroicons/react/24/solid';

import type { FileNode } from '../../types/CodeEditor.types';

interface Props {
  node: FileNode;
  depth?: number;
  currentFile?: string;
  onSelectFile?: (file: { fileId: string; filename: string }) => void;
}

export default function FileTreeNode({
  node,
  depth = 0,
  currentFile,
  onSelectFile,
}: Props) {
  const hasChildren = node.childrenNode && node.childrenNode.length > 0;
  const [isOpen, setIsOpen] = useState(node.type === 'folder' && hasChildren);

  const handleClick = () => {
    console.log('!!!');
    if (node.type === 'folder') {
      setIsOpen((prev) => !prev);
    } else if (node.type === 'file' && onSelectFile) {
      onSelectFile({ fileId: node.id, filename: node.name });
    }
  };

  return (
    <div>
      <div
        className={`flex items-center cursor-pointer text-sm
          ${
            node.type === 'file' && node.name === currentFile
              ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200 font-bold rounded'
              : 'text-gray-800 dark:text-gray-100'
          }`}
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        {node.type === 'folder' && hasChildren ? (
          isOpen ? (
            <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-700 dark:text-primary-100" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-700 dark:text-primary-100" />
          )
        ) : (
          <div className="w-4 h-4 mr-1" />
        )}
        {node.type === 'folder' ? (
          <>
            <FolderIcon className="w-4 h-4 mr-1 text-gray-700 dark:text-primary-100 text-sm" />
            <span className="font-medium text-gray-700 dark:text-primary-100 text-sm">
              {node.name}
            </span>
          </>
        ) : (
          <>
            <DocumentIcon className="w-4 h-4 mr-1 text-gray-700 dark:text-primary-100 text-sm" />
            <span className="font-medium text-gray-700 dark:text-primary-100 text-sm">
              {node.name}
            </span>
          </>
        )}
      </div>
      {isOpen &&
        node.childrenNode?.map((child) => (
          <FileTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            currentFile={currentFile}
            onSelectFile={onSelectFile}
          />
        ))}
    </div>
  );
}
