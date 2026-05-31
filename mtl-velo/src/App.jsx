import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Statistiques from './pages/Statistiques';
import POI from './pages/POI';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        
        {/* Contenu principal */}
        <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<h1 className="text-3xl font-bold">Accueil - MTL Vélo</h1>} />
            <Route path="/reseau" element={<h1 className="text-3xl font-bold">Réseau cyclable</h1>} />
            
            {/* C'est ici qu'on ajoute nos nouvelles pages ! */}
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/poi" element={<POI />} />
            
            <Route path="/assistant" element={<h1 className="text-3xl font-bold">Assistant Vélobot</h1>} />
            <Route path="/a-propos" element={<h1 className="text-3xl font-bold">À propos de MTL Vélo</h1>} />
          </Routes>
        </main>

        <footer className="bg-slate-800 text-white p-4 text-center mt-auto">
          <p>&copy; 2026 MTL Vélo - GTI525</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;