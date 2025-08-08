import { useState } from 'react';

interface FilterData {
  mode: string;
  language: string;
}

export const useSearchFilter = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterData, setFilterData] = useState<FilterData>({
    mode: '',
    language: '',
  });

  const handleSearch = (value: string) => {
    alert(`검색어: ${value}`);
  };

  const handleFilterConfirm = (data: FilterData) => {
    console.log('필터 적용:', data);
    setFilterData(data);
    alert(`필터가 적용되었습니다!\n모드: ${data.mode}\n언어: ${data.language}`);
  };

  const resetFilters = () => {
    setSearchValue('');
    setFilterData({ mode: '', language: '' });
  };

  return {
    searchValue,
    filterData,
    setSearchValue,
    handleSearch,
    handleFilterConfirm,
    resetFilters,
  };
};
