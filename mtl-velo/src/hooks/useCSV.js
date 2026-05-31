import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useCSV = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, [url]);

  return { data, loading };
};