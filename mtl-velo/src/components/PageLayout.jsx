/**
 * Composant de mise en page principal (T1.4)
 * @param {String} title - Titre de la page
 * @param {Number} itemTotal - Nombre total d'éléments affichés
 * @param {ReactNode} filters - Éléments de filtrage (optionnel)
 * @param {ReactNode} children - Contenu principal de la page
 */
const PageLayout = ({ title, itemTotal, filters, children }) => {
  return (
    // T1.4 : Conteneur flexible qui s'adapte aux écrans (colonne sur mobile, ligne sur PC)
    <div className="flex flex-col md:flex-row gap-6 p-4">
      
      {/* N'affiche le panneau latéral que si on a passé des filtres en paramètre */}
      {filters && (
        <aside className="w-full md:w-1/4 bg-white p-5 rounded-lg shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Filtres</h2>
          {filters}
        </aside>
      )}

      {/* T1.4 : La zone principale prend 75% si les filtres sont là, sinon 100% */}
      <section className={`w-full ${filters ? 'md:w-3/4' : ''} bg-white p-5 rounded-lg shadow-sm border border-slate-200`}>
        <h2 className="text-2xl font-bold mb-6 text-mtl-primaire">
          {title} 
          {/* Affiche le nombre total entre parenthèses s'il est défini */}
          {itemTotal !== undefined && (
            <span className="text-slate-500 text-lg font-normal ml-2">({itemTotal})</span>
          )}
        </h2>
        {/* Injecte le contenu spécifique à chaque page */}
        {children}
      </section>

    </div>
  );
};

export default PageLayout;