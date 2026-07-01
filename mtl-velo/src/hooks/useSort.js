import { useState, useMemo } from 'react';

/**
 * Hook personnalisé pour trier les données d'un tableau (T2.1)
 * @param {Array} items - Les données brutes à trier
 * @param {Object} config - Configuration par défaut du tri
 */
export const useSort = (items, config = { key: null, direction: 'asc' }) => {
  // Garde en mémoire quelle colonne est triée et dans quel sens (asc/desc)
  const [sortConfig, setSortConfig] = useState(config);

  // useMemo évite de refaire le calcul de tri à chaque rendu si rien n'a changé
  const sortedItems = useMemo(() => {
    // On crée une copie du tableau car la méthode .sort modifie l'original
    let sortableItems = [...items];
    
    // Si une colonne a été choisie pour le tri
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Extraction des valeurs, avec '' comme sécurité si la donnée est manquante
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        
        // Comparaison utilisant localeCompare pour supporter les caractères accentués en français
        const compareResult = String(valA).localeCompare(String(valB), 'fr', { numeric: true });
        return sortConfig.direction === 'asc' ? compareResult : -compareResult;
      });
    }
    
    return sortableItems;
  }, [items, sortConfig]); // Refait le calcul seulement si les données ou le choix de tri changent

  // Fonction appelée quand tu cliques sur l'en-tête d'une colonne
  const requestSort = (key) => {
    let direction = 'asc';
    
    // Si la colonne cliquée est déjà celle en cours de tri (en ascendant), on inverse le sens
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};