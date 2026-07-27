import { useState, useRef, useEffect } from 'react';

const Assistant = () => {
  // T6: Durée de vie de la conversation depuis les variables d'environnement (défaut 24h)
  const expirationMs = parseInt(import.meta.env.VITE_CHATBOT_EXPIRATION_MS) || 86400000;

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('velobot_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Vérifier si l'enregistrement n'est pas expiré
        if (parsed.timestamp && (Date.now() - parsed.timestamp < expirationMs)) {
          return parsed.data;
        }
      } catch (e) {}
    }
    return [
      { role: 'bot', text: 'Bonjour ! Je suis le Vélobot. Je peux répondre à tes questions sur les statistiques de passages, les arrondissements ou comparer des données. Comment puis-je t\'aider ?' }
    ];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [reportedIndexes, setReportedIndexes] = useState(() => {
    const saved = localStorage.getItem('velobot_reported');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && (Date.now() - parsed.timestamp < expirationMs)) {
          return new Set(parsed.data);
        }
      } catch (e) {}
    }
    return new Set();
  });
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 10000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('velobot_messages', JSON.stringify({ data: messages, timestamp: Date.now() }));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('velobot_reported', JSON.stringify({ data: [...reportedIndexes], timestamp: Date.now() }));
  }, [reportedIndexes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (inputValue.length > 1000) {
        showNotification("La question ne doit pas dépasser 1000 caractères.", true);
        return;
    }

    const userQuestion = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/gti525/v1/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erreur || "Erreur lors de la communication avec l'assistant.");
      }

      setMessages(prev => [...prev, { role: 'bot', text: data.reponse, questionOriginale: userQuestion }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `Erreur: ${err.message}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignalement = async (index) => {
    const msg = messages[index];
    if (reportedIndexes.has(index) || !msg.questionOriginale) return;
    
    try {
      await fetch('/gti525/v1/assistant/signalement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg.questionOriginale, reponse: msg.text })
      });
      
      const newReported = new Set(reportedIndexes);
      newReported.add(index);
      setReportedIndexes(newReported);
      showNotification("Merci, le signalement a été enregistré.");
    } catch (e) {
      showNotification("Erreur lors du signalement.", true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-mtl-texte/20 flex flex-col h-[80vh]">
      <h1 className="text-3xl font-bold text-mtl-primaire mb-2">Assistant Vélobot</h1>
      
      {/* Notification UI */}
      {notification && (
        <div className={`mb-4 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          notification.isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* T6.4 : Honnêteté et Transparence */}
      <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 mb-4 text-sm text-blue-800">
        ℹ️ Les réponses de cet assistant sont générées par une intelligence artificielle à partir des données de la base. Elles peuvent parfois être inexactes.
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 bg-mtl-fond rounded-md p-4 mb-4 border border-mtl-texte/10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`px-4 py-2 text-sm rounded-lg ${
              msg.role === 'user' 
                ? 'bg-mtl-primaire text-white rounded-br-none' 
                : msg.isError 
                  ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-none'
                  : 'bg-white border border-mtl-texte/20 text-mtl-texte rounded-bl-none'
            }`}>
              {msg.text}
            </div>
            
            {/* Bouton de signalement (T6.4) uniquement pour les réponses du bot générées depuis l'API */}
            {msg.role === 'bot' && !msg.isError && msg.questionOriginale && (
              <button 
                onClick={() => handleSignalement(idx)}
                disabled={reportedIndexes.has(idx)}
                className={`text-xs mt-1 px-2 py-0.5 rounded ${reportedIndexes.has(idx) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
              >
                {reportedIndexes.has(idx) ? '✓ Signalé' : '⚠️ Signaler une mauvaise réponse'}
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="self-start px-4 py-2 text-sm rounded-lg bg-white border border-mtl-texte/20 text-mtl-texte/50 rounded-bl-none italic">
            Vélobot réfléchit...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={3}
            placeholder="Pose ta question ici... (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            className="flex-1 border border-mtl-texte/30 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-mtl-primaire focus:ring-1 focus:ring-mtl-primaire resize-y min-h-[60px] max-h-[250px]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || inputValue.length > 1000}
            className="px-6 py-2 text-sm font-medium rounded-md bg-mtl-primaire text-white hover:bg-mtl-primaire/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[60px]"
          >
            Envoyer
          </button>
        </div>
        <div className="text-xs text-right pr-[100px]">
          {inputValue.length <= 1000 ? (
            <span className="text-gray-500">{1000 - inputValue.length} caractères restants</span>
          ) : (
            <span className="text-red-500 font-bold">{1000 - inputValue.length} caractères</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Assistant;