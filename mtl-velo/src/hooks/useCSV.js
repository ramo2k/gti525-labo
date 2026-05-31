import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useCSV = (url, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Papa.parse(url, {
      download: true,
      header: true, // Par défaut, on s'attend à une ligne d'en-tête
      skipEmptyLines: true,
      ...options,   // Permet d'écraser les options (ex: pour territoires.csv)
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, [url]);

  return { data, loading };
};