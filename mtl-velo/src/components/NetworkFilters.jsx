import React from 'react';

/**
 * Composant affichant les contrôles de filtrage pour le réseau cyclable (T1.5).
 * Respecte les standards d'accessibilité (fieldset, legend, label htmlFor).
 */
const NetworkFilters = ({ selectedCategories, toggleCategory, saison4, setSaison4 }) => {
  const categories = [
    { id: 'REV', label: 'Réseau Express Vélo (REV)' },
    { id: 'PARTAGEE', label: 'Voie partagée' },
    { id: 'PROTEGEE', label: 'Voie protégée' },
    { id: 'POLYVALENT', label: 'Sentier polyvalent' },
    { id: 'AUTRE', label: 'Autre / En projet' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 flex flex-col md:flex-row gap-8 mb-6">
      
      {/* Filtre par type de voie (T1.5 - Cases à cocher) */}
      <fieldset className="flex-1">
        <legend className="text-lg font-bold text-mtl-primaire mb-4">Type de voie</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center">
              <input
                type="checkbox"
                id={`filter-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="w-4 h-4 text-mtl-primaire border-mtl-texte/30 rounded focus:ring-mtl-primaire cursor-pointer"
              />
              <label htmlFor={`filter-${cat.id}`} className="ml-2 text-sm text-mtl-texte cursor-pointer">
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Filtre Accessibilité 4 saisons (T1.5 - Boutons) */}
      <fieldset className="flex-1">
        <legend className="text-lg font-bold text-mtl-primaire mb-4">Accessibilité 4 saisons</legend>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSaison4('TOUTES')}
            aria-pressed={saison4 === 'TOUTES'}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mtl-primaire focus:ring-offset-2 ${
              saison4 === 'TOUTES'
                ? 'bg-mtl-primaire text-white shadow-md'
                : 'bg-mtl-fond text-mtl-texte border border-mtl-texte/20 hover:bg-mtl-texte/10'
            }`}
          >
            Toutes
          </button>
          <button
            type="button"
            onClick={() => setSaison4('OUI')}
            aria-pressed={saison4 === 'OUI'}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mtl-primaire focus:ring-offset-2 ${
              saison4 === 'OUI'
                ? 'bg-mtl-primaire text-white shadow-md'
                : 'bg-mtl-fond text-mtl-texte border border-mtl-texte/20 hover:bg-mtl-texte/10'
            }`}
          >
            Oui (4 saisons)
          </button>
          <button
            type="button"
            onClick={() => setSaison4('NON')}
            aria-pressed={saison4 === 'NON'}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mtl-primaire focus:ring-offset-2 ${
              saison4 === 'NON'
                ? 'bg-mtl-primaire text-white shadow-md'
                : 'bg-mtl-fond text-mtl-texte border border-mtl-texte/20 hover:bg-mtl-texte/10'
            }`}
          >
            Non
          </button>
        </div>
      </fieldset>
      
    </div>
  );
};

export default NetworkFilters;
