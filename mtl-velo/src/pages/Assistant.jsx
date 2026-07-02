// Page « Assistant » — pour l'instant, juste une maquette visuelle statique.
// Aucune logique de chat n'est branchée : ça sera fait en Phase 3 (backend + IA).
const Assistant = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-mtl-texte/20">
      <h1 className="text-3xl font-bold text-mtl-primaire mb-2">Assistant Vélobot</h1>
      <p className="text-sm text-mtl-texte/70 mb-6">
        Un assistant conversationnel pour répondre à tes questions sur le réseau cyclable de Montréal.
      </p>

      {/* Bandeau indiquant que la fonctionnalité arrive plus tard */}
      <div className="bg-mtl-fond border border-mtl-texte/20 rounded-md px-4 py-3 mb-6 text-sm text-mtl-texte">
        🚧 Cette fonctionnalité sera branchée à un vrai backend en <strong>Phase 3</strong>. Ce qui suit est seulement un aperçu visuel.
      </div>

      {/* Zone de conversation (statique, juste pour l'aperçu) */}
      <div className="flex flex-col gap-3 bg-mtl-fond rounded-md p-4 mb-4 min-h-[200px]">
        <div className="self-start max-w-[80%] bg-white border border-mtl-texte/20 rounded-lg rounded-bl-none px-4 py-2 text-sm text-mtl-texte">
          Bonjour ! Bientôt, je pourrai t'aider à trouver des pistes cyclables, des compteurs ou des points d'intérêt à Montréal. 🚴
        </div>
      </div>

      {/* Champ de saisie désactivé : rien n'est encore branché */}
      <div className="flex gap-2">
        <input
          type="text"
          disabled
          placeholder="Pose ta question ici... (disponible en Phase 3)"
          className="flex-1 border border-mtl-texte/30 rounded-md px-3 py-2 text-sm bg-mtl-fond text-mtl-texte/50 cursor-not-allowed"
        />
        <button
          disabled
          className="px-4 py-2 text-sm font-medium rounded-md bg-mtl-primaire/50 text-white cursor-not-allowed"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Assistant;