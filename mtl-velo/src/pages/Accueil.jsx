import { Link } from 'react-router-dom';

const Accueil = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner */}
      <section className="bg-mtl-primaire text-white rounded-xl p-10 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">MTL Vélo</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Explorez et gérez le réseau cyclable de la Ville de Montréal — pistes, compteurs, points d'intérêt et statistiques en temps réel.
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-3xl font-extrabold text-mtl-primaire mb-1">8 088</p>
          <p className="text-sm font-medium text-mtl-texte/70">Segments de pistes</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-3xl font-extrabold text-mtl-primaire mb-1">970.4 km</p>
          <p className="text-sm font-medium text-mtl-texte/70">Longueur totale du réseau</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-3xl font-extrabold text-mtl-primaire mb-1">64</p>
          <p className="text-sm font-medium text-mtl-texte/70">Compteurs vélo</p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Link to="/reseau" className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center hover:shadow-md hover:border-mtl-primaire transition-all flex flex-col items-center">
          <div className="w-12 h-12 bg-mtl-fond text-mtl-primaire rounded-full flex items-center justify-center mb-4 text-2xl" aria-hidden="true">🗺️</div>
          <h2 className="text-lg font-bold text-mtl-texte mb-2">Réseau cyclable</h2>
          <p className="text-sm text-mtl-texte/80">Visualisez les 9 000+ segments de pistes, filtrez par catégorie et découvrez les pistes populaires.</p>
        </Link>
        <Link to="/statistiques" className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center hover:shadow-md hover:border-mtl-primaire transition-all flex flex-col items-center">
          <div className="w-12 h-12 bg-mtl-fond text-mtl-texte rounded-full flex items-center justify-center mb-4 text-2xl" aria-hidden="true">📊</div>
          <h2 className="text-lg font-bold text-mtl-texte mb-2">Statistiques</h2>
          <p className="text-sm text-mtl-texte/80">Consultez les données de passage de chaque compteur et analysez les tendances saisonnières.</p>
        </Link>
        <Link to="/assistant" className="bg-white p-6 rounded-xl shadow-sm border border-mtl-texte/20 text-center hover:shadow-md hover:border-mtl-primaire transition-all flex flex-col items-center">
          <div className="w-12 h-12 bg-mtl-fond text-mtl-texte rounded-full flex items-center justify-center mb-4 text-2xl" aria-hidden="true">💬</div>
          <h2 className="text-lg font-bold text-mtl-texte mb-2">Assistant</h2>
          <p className="text-sm text-mtl-texte/80">Posez des questions en français sur le réseau ; l'assistant interroge la base en temps réel.</p>
        </Link>
      </section>
    </div>
  );
};

export default Accueil;
