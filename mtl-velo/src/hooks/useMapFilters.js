import { useState, useMemo, useCallback } from 'react';
import { getTrackCategory } from '../utils/mapLogic';

export const ALL_CATEGORIES = ['REV', 'PARTAGEE', 'PROTEGEE', 'POLYVALENT', 'AUTRE'];

/**
 * Hook personnalisé pour gérer l'état des filtres de la carte (T1.5) et calculer les statistiques (T1.3)
 * @param {Object} geoJsonData - Les données GeoJSON brutes du réseau
 */
export const useMapFilters = (geoJsonData) => {
  // État des filtres
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES);
  const [saison4, setSaison4] = useState('TOUTES'); // 'TOUTES', 'OUI', 'NON'

  // Bascule une catégorie (case à cocher)
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Fonction de filtre passée au composant GeoJSON de Leaflet
  const filterFeature = useCallback((feature) => {
    const category = getTrackCategory(feature.properties);
    const isSaison4 = feature.properties.SAISONS4?.toUpperCase() === 'OUI';
    
    // Vérifie si la catégorie est cochée
    if (!selectedCategories.includes(category)) {
      return false;
    }

    // Vérifie le filtre 4 saisons
    if (saison4 === 'OUI' && !isSaison4) return false;
    if (saison4 === 'NON' && isSaison4) return false;

    return true;
  }, [selectedCategories, saison4]);

  // Calcul dynamique des statistiques pour le panneau (T1.3)
  // Mémoïsé pour ne pas recalculer si les filtres n'ont pas changé
  const stats = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) {
      return { totalSegments: 0, totalLengthKm: 0 };
    }

    let totalLengthMeters = 0;
    let totalSegments = 0;

    geoJsonData.features.forEach(feature => {
      // On additionne seulement les pistes qui passent le filtre actif
      if (filterFeature(feature)) {
        totalSegments++;
        totalLengthMeters += (feature.properties.LONGUEUR || 0);
      }
    });

    return {
      totalSegments,
      totalLengthKm: (totalLengthMeters / 1000).toLocaleString('fr-CA', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 1 
      })
    };
  }, [geoJsonData, filterFeature]);

  return {
    selectedCategories,
    toggleCategory,
    saison4,
    setSaison4,
    filterFeature,
    stats
  };
};
