import { useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';

export const useArrondissements = () => {
  const { data: territoiresData, loading, error } = useCSV('/data/territoires.csv', { header: false });
  
  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  return { territoires, loading, error };
};
