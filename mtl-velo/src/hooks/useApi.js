import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/gti525/v1';
      
      // Gestion des QueryParams si on passe un objet complet au lieu d'une string
      let url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur réseau';
        try {
          const data = await res.json();
          errorMsg = data.erreur || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      if (res.status === 204) return null;
      
      return await res.json();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error, setError, setLoading };
};
