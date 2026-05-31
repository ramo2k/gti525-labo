const PageLayout = ({ title, itemTotal, filters, children }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Filtres</h2>
        {filters}
      </aside>

      <section className="w-full md:w-3/4 bg-white p-4 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold mb-4">
          {title} {itemTotal !== undefined && `(${itemTotal})`}
        </h2>
        {children}
      </section>
    </div>
  );
};

export default PageLayout;