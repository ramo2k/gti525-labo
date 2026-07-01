const APropos = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-mtl-texte/20">
      <h1 className="text-3xl font-bold text-mtl-primaire mb-8">À propos de MTL Vélo</h1>
      
      <div className="space-y-8 text-mtl-texte">
        <section>
          <h2 className="text-xl font-bold text-mtl-primaire mb-3">Source des données</h2>
          <p className="mb-2 text-sm">Les données utilisées dans cette application proviennent des <strong>Données ouvertes de la Ville de Montréal</strong> :</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-mtl-texte/80">
            <li>Compteurs de vélos (emplacements et passages)</li>
            <li>Réseau cyclable (9 100+ segments de pistes)</li>
            <li>Fontaines d'eau potable</li>
            <li>Délimitations des arrondissements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mtl-primaire mb-3">Technologies (Phase 1)</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-mtl-texte/80">
            <li><strong>Interface</strong> : HTML5, CSS moderne, JavaScript ES2020 (modules ES)</li>
            <li><strong>Cadriciel et Librairies</strong> : React, Vite, Tailwind CSS v4</li>
            <li><strong>Traitement de données</strong> : PapaParse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mtl-primaire mb-3">Contexte pédagogique</h2>
          <p className="text-sm leading-relaxed text-mtl-texte/90">
            Ce projet est réalisé dans le cadre du cours <strong>GTI525 — Technologies des applications web</strong>. 
            Il illustre l'intégration d'un front-end SPA, d'une API REST sécurisée et d'un assistant conversationnel ancré sur des données réelles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-mtl-primaire mb-3">Équipe 17</h2>
          <div className="bg-mtl-fond p-4 rounded-md border border-mtl-texte/20 text-sm">
            <ul className="list-disc pl-5 space-y-1 text-mtl-texte">
              <li><strong>Omar Khudhair</strong></li>
              <li><strong>Christian Junior Djomga</strong></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default APropos;
