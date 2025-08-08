import React from 'react';
import { usePagination } from './paginationUtils';
import PageButton from './PageButton';
import NavigationButton from './NavigationButton';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const { visiblePages, canGoPrevious, canGoNext } = usePagination(
    currentPage,
    totalPages,
  );

  // totalPages가 0이면 페이지네이션을 렌더링하지 않음
  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <NavigationButton
        direction="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
      />

      {visiblePages.map((page, index) => (
        <PageButton
          key={index}
          page={page}
          isActive={currentPage === page}
          onClick={() => currentPage !== page && onPageChange(page as number)}
          disabled={currentPage === page}
        />
      ))}

      <NavigationButton
        direction="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      />
    </div>
  );
};

export default Pagination;
