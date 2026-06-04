import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// T1.1 : Structure de navigation entre les pages de l'application
const Navbar = () => {
  // isOpen (booléen) : Mémorise si le menu mobile est déroulé ou caché
  const [isOpen, setIsOpen] = useState(false);

  // Ferme le menu mobile automatiquement après la sélection d'une page
  const closeMenu = () => setIsOpen(false);

  /**
   * T1.2 : Style dynamique pour l'élément actif et le survol
   * @param {Boolean} isActive - Vrai si la route actuelle correspond au lien
   * @param {Boolean} isMobile - Vrai pour forcer l'affichage en bloc dans le menu déroulant
   */
  const getLinkStyle = (isActive, isMobile = false) => {
    // Utilise rounded-full pour un effet très arrondi (pilule) sur PC, et rounded-lg sur mobile
    const baseStyle = isMobile ? "block px-4 py-3 rounded-lg transition-colors" : "px-4 py-2 rounded-full transition-colors";
    const stateStyle = isActive ? "bg-mtl-actif text-white font-bold" : "text-white hover:bg-mtl-survol";
    return `${baseStyle} ${stateStyle}`;
  };

  return (
    // T1.4 : En-tête collé en haut de page
    <header className="bg-mtl-primaire sticky top-0 z-50">
      
      {/* T1.4 : Conteneur principal avec largeur maximale */}
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        
        <div className="text-white text-xl font-bold">MTL Vélo</div>
        
        {/* Menu format Bureau (caché sur les petits écrans) */}
        <div className="hidden md:flex space-x-2">
          <NavLink to="/" className={({ isActive }) => getLinkStyle(isActive)}>Accueil</NavLink>
          <NavLink to="/reseau" className={({ isActive }) => getLinkStyle(isActive)}>Réseau cyclable</NavLink>
          <NavLink to="/statistiques" className={({ isActive }) => getLinkStyle(isActive)}>Statistiques</NavLink>
          <NavLink to="/poi" className={({ isActive }) => getLinkStyle(isActive)}>Points d'intérêt</NavLink>
          <NavLink to="/assistant" className={({ isActive }) => getLinkStyle(isActive)}>Assistant</NavLink>
          <NavLink to="/a-propos" className={({ isActive }) => getLinkStyle(isActive)}>À propos</NavLink>
        </div>

        {/* Bouton pour ouvrir/fermer le menu Mobile */}
        <button 
          className="md:hidden text-white p-2 rounded-full hover:bg-mtl-survol transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Alterne l'icône entre le X (fermer) et les 3 lignes (ouvrir) */}
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* Menu déroulant format Mobile */}
      {isOpen && (
        <div className="md:hidden bg-mtl-primaire flex flex-col p-3 border-t border-mtl-survol space-y-2 shadow-inner">
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Accueil</NavLink>
          <NavLink to="/reseau" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Réseau cyclable</NavLink>
          <NavLink to="/statistiques" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Statistiques</NavLink>
          <NavLink to="/poi" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Points d'intérêt</NavLink>
          <NavLink to="/assistant" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Assistant</NavLink>
          <NavLink to="/a-propos" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>À propos</NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;