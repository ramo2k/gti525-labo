import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // État pour contrôler l'ouverture du menu mobile
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour fermer le menu (déclenchée au clic sur un lien mobile)
  const closeMenu = () => setIsOpen(false);

  // Style des liens pour la version Bureau
  const getLinkClass = ({ isActive }) => 
    `px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive 
        ? 'bg-mtl-actif font-bold text-white' 
        : 'text-green-50 hover:bg-mtl-survol hover:text-white'
    }`;

  // Style des liens pour la version Mobile (prend toute la largeur avec 'block')
  const getMobileLinkClass = ({ isActive }) => 
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      isActive 
        ? 'bg-mtl-actif font-bold text-white' 
        : 'text-green-50 hover:bg-mtl-survol hover:text-white'
    }`;

  return (
    <header className="bg-mtl-primaire shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-white text-xl font-extrabold tracking-wider">🚲 MTL Vélo</span>
          </div>
          
          {/* Menu de navigation (Bureau) caché sur mobile avec "hidden md:block" */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={getLinkClass}>Accueil</NavLink>
              <NavLink to="/reseau" className={getLinkClass}>Réseau cyclable</NavLink>
              <NavLink to="/statistiques" className={getLinkClass}>Statistiques</NavLink>
              <NavLink to="/poi" className={getLinkClass}>Points d'intérêt</NavLink>
              <NavLink to="/assistant" className={getLinkClass}>Assistant</NavLink>
              <NavLink to="/a-propos" className={getLinkClass}>À propos</NavLink>
            </div>
          </div>

          {/* Bouton Hamburger (Mobile) visible seulement sur mobile avec "md:hidden" */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-green-50 hover:text-white hover:bg-mtl-survol focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {/* SVG : Si c'est fermé, on montre les 3 lignes. Si ouvert, on montre une croix (X) */}
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu déroulant (Mobile) - S'affiche uniquement si isOpen est true */}
      {isOpen && (
        <div className="md:hidden bg-mtl-primaire border-t border-mtl-survol shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" onClick={closeMenu} className={getMobileLinkClass}>Accueil</NavLink>
            <NavLink to="/reseau" onClick={closeMenu} className={getMobileLinkClass}>Réseau cyclable</NavLink>
            <NavLink to="/statistiques" onClick={closeMenu} className={getMobileLinkClass}>Statistiques</NavLink>
            <NavLink to="/poi" onClick={closeMenu} className={getMobileLinkClass}>Points d'intérêt</NavLink>
            <NavLink to="/assistant" onClick={closeMenu} className={getMobileLinkClass}>Assistant</NavLink>
            <NavLink to="/a-propos" onClick={closeMenu} className={getMobileLinkClass}>À propos</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;