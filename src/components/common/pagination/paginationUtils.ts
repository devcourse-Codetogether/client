import { useMemo } from 'react';

export const PAGINATION_CONSTANTS = {
  DELTA: 2,
  ITEMS_PER_PAGE: 20,
} as const;

export type PageItem = number | string;
export type VisiblePages = PageItem[];

export const createPageRange = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const shouldShowLeftDots = (
  currentPage: number,
  delta: number,
): boolean => {
  return currentPage - delta > 2;
};

export const shouldShowRightDots = (
  currentPage: number,
  delta: number,
  totalPages: number,
): boolean => {
  return currentPage + delta < totalPages - 1;
};

export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
): VisiblePages => {
  // totalPages가 0이면 빈 배열 반환
  if (totalPages <= 0) return [];

  // totalPages가 1이면 1만 반환
  if (totalPages === 1) return [1];

  // totalPages가 2이면 1, 2만 반환
  if (totalPages === 2) return [1, 2];

  return buildComplexPagination(currentPage, totalPages);
};

const buildComplexPagination = (
  currentPage: number,
  totalPages: number,
): VisiblePages => {
  const { DELTA } = PAGINATION_CONSTANTS;
  const range: number[] = [];
  const rangeWithDots: VisiblePages = [];

  // 범위 계산: 1부터 시작하도록 변경
  for (
    let i = Math.max(1, currentPage - DELTA);
    i <= Math.min(totalPages, currentPage + DELTA);
    i++
  ) {
    // 1과 마지막 페이지는 제외하고 중간 페이지들만 추가
    if (i !== 1 && i !== totalPages) {
      range.push(i);
    }
  }

  // 첫 번째 페이지 추가
  rangeWithDots.push(1);

  // 중간에 점(...) 추가 조건 수정
  if (shouldShowLeftDots(currentPage, DELTA)) {
    rangeWithDots.push('...');
  }

  // 중간 페이지들 추가
  rangeWithDots.push(...range);

  // 중간에 점(...) 추가 조건 수정
  if (shouldShowRightDots(currentPage, DELTA, totalPages)) {
    rangeWithDots.push('...');
  }

  // 마지막 페이지 추가 (1페이지가 아닌 경우에만)
  if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
};

// usePagination 훅을 paginationUtils.ts에 통합
export const usePagination = (currentPage: number, totalPages: number) => {
  const visiblePages = useMemo<VisiblePages>(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return {
    visiblePages,
    canGoPrevious,
    canGoNext,
  };
};
