import React from 'react';

/**
 * Composant affichant les statistiques dynamiques de la carte (T1.3)
 */
const NetworkStatsPanel = ({ stats }) => {
  return (
    <div 
      className="flex flex-col md:flex-row gap-6 mt-6 mb-8"
      aria-live="polite" 
      aria-atomic="true"
    >
      {/* Carte du nombre de segments */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 text-center hover:shadow-md transition-shadow">
        <div className="text-4xl mb-2" aria-hidden="true">🚴‍♂️</div>
        <p className="text-3xl font-extrabold text-mtl-primaire mb-1">
          {stats.totalSegments.toLocaleString('fr-CA')}
        </p>
        <p className="text-sm font-medium text-mtl-texte/70 uppercase tracking-wider">
          Segments visibles
        </p>
      </div>
      
      {/* Carte de la longueur totale */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 text-center hover:shadow-md transition-shadow">
        <div className="text-4xl mb-2" aria-hidden="true">📏</div>
        <p className="text-3xl font-extrabold text-mtl-primaire mb-1">
          {stats.totalLengthKm} km
        </p>
        <p className="text-sm font-medium text-mtl-texte/70 uppercase tracking-wider">
          Longueur totale
        </p>
      </div>
    </div>
  );
};

export default NetworkStatsPanel;
