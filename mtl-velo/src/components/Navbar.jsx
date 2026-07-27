import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// T1.1 : Structure de navigation entre les pages de l'application
const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
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
    const stateStyle = isActive ? "bg-black/30 text-white font-bold" : "text-white hover:bg-black/20";
    return `${baseStyle} ${stateStyle}`;
  };

  return (
    // T1.4 : En-tête collé en haut de page
    <header className="bg-mtl-primaire sticky top-0 z-50">
      
      {/* T1.4 : Conteneur principal avec largeur maximale */}
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        
        <div className="text-white text-xl font-bold">MTL Vélo</div>
        
        {/* Menu format Bureau (caché sur les petits écrans) */}
        <div className="hidden md:flex items-center space-x-2">
          <NavLink to="/" className={({ isActive }) => getLinkStyle(isActive)}>Accueil</NavLink>
          <NavLink to="/reseau" className={({ isActive }) => getLinkStyle(isActive)}>Réseau cyclable</NavLink>
          <NavLink to="/statistiques" className={({ isActive }) => getLinkStyle(isActive)}>Statistiques</NavLink>
          <NavLink to="/poi" className={({ isActive }) => getLinkStyle(isActive)}>Points d'intérêt</NavLink>
          <NavLink to="/assistant" className={({ isActive }) => getLinkStyle(isActive)}>Assistant</NavLink>
          <NavLink to="/a-propos" className={({ isActive }) => getLinkStyle(isActive)}>À propos</NavLink>
          
          <div className="ml-4 pl-4 border-l border-white/30 flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-white/80 text-sm">{user?.courriel}</span>
                <button onClick={handleLogout} className="text-white hover:text-red-300 text-sm font-medium transition-colors">Déconnexion</button>
              </>
            ) : (
              <NavLink to="/auth" className={({ isActive }) => getLinkStyle(isActive)}>Se connecter</NavLink>
            )}
          </div>
        </div>

        {/* Bouton pour ouvrir/fermer le menu Mobile */}
        <button 
          className="md:hidden text-white p-2 rounded-full hover:bg-black/20 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {/* Alterne l'icône entre le X (fermer) et les 3 lignes (ouvrir) */}
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* Menu déroulant format Mobile */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden bg-mtl-primaire flex flex-col p-3 border-t border-black/20 space-y-2 shadow-inner">
          <NavLink to="/" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Accueil</NavLink>
          <NavLink to="/reseau" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Réseau cyclable</NavLink>
          <NavLink to="/statistiques" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Statistiques</NavLink>
          <NavLink to="/poi" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Points d'intérêt</NavLink>
          <NavLink to="/assistant" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Assistant</NavLink>
          <NavLink to="/a-propos" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>À propos</NavLink>
          
          <div className="border-t border-white/20 mt-2 pt-2">
            {isAuthenticated ? (
              <div className="flex flex-col px-4 py-2 space-y-2">
                <span className="text-white/80 text-sm">{user?.courriel}</span>
                <button onClick={() => { handleLogout(); closeMenu(); }} className="text-left text-red-300 hover:text-red-400 font-medium">Déconnexion</button>
              </div>
            ) : (
              <NavLink to="/auth" onClick={closeMenu} className={({ isActive }) => getLinkStyle(isActive, true)}>Se connecter / S'inscrire</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;