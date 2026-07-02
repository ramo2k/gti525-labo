// Composant de pagination réutilisable : Première / Précédent / numéros de page / Suivant / Dernière
const Pagination = ({ page, totalPages, onPageChange }) => {
  // Rien à afficher s'il n'y a qu'une seule page (ou aucune)
  if (totalPages <= 1) return null;

  // Construit la liste des numéros à afficher, avec "..." pour ne pas tout afficher
  // si trop de pages (garde la 1re, la dernière, et celles proches de la page actuelle)
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const btnClass = "px-3 py-2 text-sm font-medium rounded-md border border-mtl-texte/30 bg-white text-mtl-texte hover:bg-mtl-fond disabled:opacity-50 transition-colors";

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-mtl-texte/20 flex-wrap">
      <button onClick={() => onPageChange(1)} disabled={page === 1} className={btnClass} aria-label="Première page">
        « Première
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={btnClass} aria-label="Page précédente">
        ‹ Précédent
      </button>

      {getPageNumbers().map((n, idx) =>
        n === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-mtl-texte/50">...</span>
        ) : (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
              n === page
                ? 'bg-mtl-primaire text-white border-mtl-primaire'
                : 'bg-white text-mtl-texte border-mtl-texte/30 hover:bg-mtl-fond'
            }`}
          >
            {n}
          </button>
        )
      )}

      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={btnClass} aria-label="Page suivante">
        Suivant ›
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className={btnClass} aria-label="Dernière page">
        Dernière »
      </button>
    </div>
  );
};

export default Pagination;