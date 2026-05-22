import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // Fonction pour définir les classes CSS selon l'état du lien (T1.2 : actif et hover distincts)
  const getLinkClass = ({ isActive }) => 
    `px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive 
        ? 'bg-green-900 font-bold text-white' 
        : 'text-green-50 hover:bg-green-700 hover:text-white'
    }`;

  return (
    <header className="bg-[#15803D] shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-extrabold tracking-wider">🚲 MTL Vélo</span>
          </div>
          
          {/* Menu de navigation T1.1 */}
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;