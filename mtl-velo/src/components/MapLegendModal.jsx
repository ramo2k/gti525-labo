import React, { useEffect, useRef } from 'react';

/**
 * Composant de fenêtre modale (overlay) pour la légende (T1.4)
 * Respecte les critères d'accessibilité (role="dialog", fermeture Echap).
 */
const MapLegendModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  const closeBtnRef = useRef(null);

  // Garder une référence à l'élément qui avait le focus avant l'ouverture
  const previousFocusRef = useRef(null);

  // Gérer la fermeture avec la touche Échap et le Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Simple Focus Trap (très basique pour restreindre à la modale)
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll('button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus auto sur le bouton de fermeture à l'ouverture
    if (closeBtnRef.current) {
      setTimeout(() => closeBtnRef.current.focus(), 10);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurer le focus à la fermeture
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Si la modale n'est pas ouverte, on ne rend rien
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="legend-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative"
      >
        <button 
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-mtl-texte/50 hover:text-mtl-texte focus:outline-none focus:ring-2 focus:ring-mtl-primaire rounded-full p-1"
          aria-label="Fermer la légende"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="legend-title" className="text-2xl font-bold text-mtl-primaire mb-6">Légende des pistes</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-2 rounded-full mr-4" style={{ backgroundColor: '#2AC7DD' }}></div>
            <span className="font-medium text-mtl-texte">Réseau Express Vélo (REV)</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-2 rounded-full mr-4" style={{ backgroundColor: '#84CA4B' }}></div>
            <span className="font-medium text-mtl-texte">Voie partagée</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-2 rounded-full mr-4" style={{ backgroundColor: '#025D29' }}></div>
            <span className="font-medium text-mtl-texte">Voie protégée</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-2 rounded-full mr-4" style={{ backgroundColor: '#B958D9' }}></div>
            <span className="font-medium text-mtl-texte">Sentier polyvalent</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-2 rounded-full mr-4" style={{ backgroundColor: '#A0AEC0' }}></div>
            <span className="font-medium text-mtl-texte">Autre / En projet</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-mtl-primaire text-white rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mtl-primaire"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLegendModal;
