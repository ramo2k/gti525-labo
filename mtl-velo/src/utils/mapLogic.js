/**
 * Détermine la catégorie d'une piste cyclable basée sur les règles de l'Annexe 1.
 * 
 * Règles :
 * - REV : REV_AVANCEMENT_CODE ∈ {'EV', 'PE', 'TR'}
 * - Voie partagée : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE ∈ {1, 3, 8, 9}
 * - Voie protégée : AVANCEMENT_CODE = 'E', TYPE_VOIE_CODE ∈ {4, 5, 6} et REV_AVANCEMENT_CODE ∉ {'EV', 'PE', 'TR'}
 * - Sentier polyvalent : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE = 7
 */
export const getTrackCategory = (properties) => {
  const revStatus = properties.REV_AVANCEMENT_CODE;
  const status = properties.AVANCEMENT_CODE;
  const typeVoie = properties.TYPE_VOIE_CODE;

  const isREV = ['EV', 'PE', 'TR'].includes(revStatus);

  if (isREV) {
    return 'REV';
  }
  
  if (status === 'E') {
    const typeVoieStr = String(typeVoie);
    if (['1', '3', '8', '9'].includes(typeVoieStr)) {
      return 'PARTAGEE';
    }
    // Note: !isREV est toujours vrai ici grâce au premier "if (isREV)"
    if (['4', '5', '6'].includes(typeVoieStr)) {
      return 'PROTEGEE';
    }
    if (typeVoieStr === '7') {
      return 'POLYVALENT';
    }
  }

  // Si la piste est en projet ou ne correspond pas aux catégories
  return 'AUTRE';
};

/**
 * Retourne l'objet de style pour le rendu Leaflet de la piste.
 */
export const getTrackStyle = (feature) => {
  const category = getTrackCategory(feature.properties);
  
  const colors = {
    'REV': '#2AC7DD',
    'PARTAGEE': '#84CA4B',
    'PROTEGEE': '#025D29',
    'POLYVALENT': '#B958D9',
    'AUTRE': '#A0AEC0' // Gris pour les tracés non classifiés
  };

  return {
    color: colors[category] || '#A0AEC0',
    weight: category === 'REV' ? 4 : 3,
    opacity: category === 'AUTRE' ? 0.4 : 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  };
};
