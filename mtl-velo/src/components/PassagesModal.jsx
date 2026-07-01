import { useState } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Modale simple : choix d'une période + graphique du nombre de passages par jour
// pour UN compteur, en lisant les fichiers /data/comptage_velo_ANNEE.csv
const PassagesModal = ({ compteur, onClose }) => {
  const [dateDebut, setDateDebut] = useState('2024-01-01');
  const [dateFin, setDateFin] = useState('2024-01-31');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const genererGraphique = () => {
    setLoading(true);
    setChartData(null);

    // On détermine les fichiers CSV (par année) à charger selon la période choisie
    const anneeDebut = parseInt(dateDebut.slice(0, 4));
    const anneeFin = parseInt(dateFin.slice(0, 4));
    const annees = [];
    for (let a = anneeDebut; a <= anneeFin; a++) annees.push(a);

    // On charge chaque fichier d'année, puis on combine les résultats
    Promise.all(
      annees.map(
        (annee) =>
          new Promise((resolve) => {
            Papa.parse(`/data/comptage_velo_${annee}.csv`, {
              download: true,
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
              error: () => resolve([]), // fichier manquant -> on ignore simplement
            });
          })
      )
    ).then((tableaux) => {
      const toutesLesLignes = tableaux.flat();

      // On garde seulement les lignes du compteur choisi, dans la période choisie
      const lignesFiltrees = toutesLesLignes.filter((ligne) => {
        const date = ligne.date_heure?.slice(0, 10); // "YYYY-MM-DD"
        return ligne.id_compteur === compteur.ID && date >= dateDebut && date <= dateFin;
      });

      // Regroupement par jour : on additionne les passages de chaque jour
      const parJour = {};
      lignesFiltrees.forEach((ligne) => {
        const date = ligne.date_heure.slice(0, 10);
        const nb = parseInt(ligne.nb_passages) || 0;
        parJour[date] = (parJour[date] || 0) + nb;
      });

      const dates = Object.keys(parJour).sort();
      const valeurs = dates.map((d) => parJour[d]);

      setChartData({
        labels: dates,
        datasets: [
          {
            label: 'Passages par jour',
            data: valeurs,
            borderColor: '#15803D',
            backgroundColor: '#15803D',
          },
        ],
      });
      setLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-mtl-primaire">Passages — {compteur.Nom}</h2>
          <button onClick={onClose} className="text-2xl leading-none px-2">&times;</button>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border border-mtl-texte/30 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border border-mtl-texte/30 rounded p-2"
            />
          </div>
          <button
            onClick={genererGraphique}
            className="bg-mtl-primaire text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Afficher
          </button>
        </div>

        {loading && <p>Chargement des données...</p>}
        {chartData && chartData.labels.length === 0 && (
          <p className="italic text-mtl-texte/60">Aucune donnée pour ce compteur sur cette période.</p>
        )}
        {chartData && chartData.labels.length > 0 && <Line data={chartData} />}
      </div>
    </div>
  );
};

export default PassagesModal;