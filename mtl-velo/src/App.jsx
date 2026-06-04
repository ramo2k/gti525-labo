import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Statistiques from './pages/Statistiques';
import POI from './pages/POI';
import Reseau from './pages/Reseau';

// T1.1 : Squelette et navigation
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Zone de contenu principal centralisée */}
        <main className="flex-grow max-w-screen-xl mx-auto w-full p-4">
          <Routes>
            <Route path="/" element={<h1>Accueil - MTL Vélo</h1>} />
            <Route path="/reseau" element={<Reseau />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/poi" element={<POI />} />
            <Route path="/assistant" element={<h1>Assistant Vélobot</h1>} />
            <Route path="/a-propos" element={<h1>À propos</h1>} />
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