import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Hook personnalisé pour charger et lire un fichier CSV (T2.1)
 * @param {String} url - Le chemin du fichier à charger
 * @param {Object} options - Options supplémentaires pour configurer PapaParse
 */
export const useCSV = (url, options = {}) => {
  // data : Stocke le tableau des résultats une fois la lecture terminée
  const [data, setData] = useState([]);
  // loading : Indique si l'application est en train de télécharger le fichier
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Utilisation de la librairie PapaParse pour lire le fichier distant
    Papa.parse(url, {
      download: true,       // Obligatoire pour lire un fichier via une URL (requête réseau)
      header: true,         // Transforme chaque ligne en objet en utilisant la 1ère ligne comme clés
      skipEmptyLines: true, // Évite les bugs en ignorant les lignes vides à la fin du fichier
      ...options,           // Permet d'écraser les réglages par défaut si besoin
      
      // Fonction exécutée automatiquement quand la lecture est un succès
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      }
    });
  }, [url]); // Le useEffect se redéclenche uniquement si l'URL change

  return { data, loading, error };
};