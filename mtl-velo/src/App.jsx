import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Accueil from './pages/Accueil';
import Statistiques from './pages/Statistiques';
import POI from './pages/POI';
import Reseau from './pages/Reseau';
import APropos from './pages/APropos';

// T1.1 : Squelette et navigation
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Passer au contenu principal
        </a>
        <Navbar />
        
        {/* Zone de contenu principal centralisée */}
        <main id="main-content" className="flex-grow max-w-screen-xl mx-auto w-full p-4">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/reseau" element={<Reseau />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/poi" element={<POI />} />
            <Route path="/assistant" element={<h1>Assistant Vélobot</h1>} />
            <Route path="/a-propos" element={<APropos />} />
          </Routes>
        </main>

        <footer className="bg-mtl-primaire text-white p-4 text-center mt-auto">
          <p>&copy; 2026 MTL Vélo</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;