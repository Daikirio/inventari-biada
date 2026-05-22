import { Search, Filter, Plus, Edit, Trash2, Clock, Download, History } from 'lucide-react';

export default function InventariTab({ 
  role, loading, ordinadors, searchTerm, setSearchTerm, searchField, setSearchField,
  selectedIds, setSelectedIds, setIsBulkModalOpen, handleBulkDelete, obrirModalNou, obrirModalEdicio, handleEsborrarPortatil, formatData, getBadgeColor, obrirHistorial
}) {

  const exportarA_CSV = () => {
    if (ordinadors.length === 0) return alert("No hi ha dades per exportar");
    const headers = ["SACE", "Marca", "Model", "Estat", "Ubicacio", "Alumne", "Classe", "Observacions", "Ultima_Modificacio"];
    
    const rows = ordinadors.map(ord => [
      `"${ord.sace || ''}"`, `"${ord.marca || ''}"`, `"${ord.model || ''}"`, `"${ord.estat || ''}"`,
      `"${ord.ubicacio || ''}"`, `"${ord.nom_alumne || ''}"`, `"${ord.classe_alumne || ''}"`,
      `"${(ord.observacions || '').replace(/"/g, '""')}"`, `"${formatData(ord.data_modificacio)}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventari_Biada_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(ordinadors.map(o => o.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        
        <div className="flex flex-col sm:flex-row w-full xl:w-[600px] shadow-sm rounded-lg">
          <div className="relative flex items-center border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg sm:rounded-tr-none sm:rounded-l-lg border-b-0 sm:border-b sm:border-r-0">
            <Filter className="w-4 h-4 text-gray-500 absolute left-3" />
            <select 
              value={searchField} 
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="tots">Tots els camps</option>
              <option value="sace">SACE</option>
              <option value="marca_model">Marca i Model</option>
              <option value="estat">Estat</option>
              <option value="ubicacio_assignacio">Ubicació / Assignació</option>
              <option value="observacions">Observacions</option>
              <option value="actualitzat">Data Actualització</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={searchField === 'tots' ? "Cercar a tot l'inventari..." : "Escriu per filtrar..."} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg sm:rounded-bl-none sm:rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full xl:w-auto justify-end items-center">
          <button onClick={exportarA_CSV} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Exportar ({ordinadors.length})
          </button>

          {role === 'admin' && selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-2 rounded-lg animate-fade-in">
              <span className="text-purple-700 dark:text-purple-300 font-semibold">{selectedIds.length} sel.</span>
              <button onClick={() => setIsBulkModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"><Edit className="w-4 h-4 inline mr-1"/> Editar</button>
              <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"><Trash2 className="w-4 h-4 inline"/></button>
            </div>
          )}

          {role === 'admin' && selectedIds.length === 0 && (
            <button onClick={obrirModalNou} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
              <Plus className="w-5 h-5" /> Afegir
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {role === 'admin' && (
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" onChange={toggleSelectAll} checked={selectedIds.length === ordinadors.length && ordinadors.length > 0} />
                </th>
              )}
              <th className="p-4 font-semibold">SACE</th>
              <th className="p-4 font-semibold">Marca i Model</th>
              <th className="p-4 font-semibold">Estat</th>
              <th className="p-4 font-semibold">Ubicació / Assignació</th>
              <th className="p-4 font-semibold">Observacions</th>
              <th className="p-4 font-semibold">Actualitzat</th>
              {role === 'admin' && <th className="p-4 font-semibold text-right">Accions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={role === 'admin' ? "8" : "7"} className="text-center p-8 text-gray-500 animate-pulse">Carregant inventari...</td></tr>
            ) : ordinadors.length === 0 ? (
              <tr><td colSpan={role === 'admin' ? "8" : "7"} className="text-center p-8 text-gray-500">No s'han trobat equips.</td></tr>
            ) : (
              ordinadors.map(ord => (
                <tr key={ord.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIds.includes(ord.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  {role === 'admin' && (
                    <td className="p-4 text-center"><input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" checked={selectedIds.includes(ord.id)} onChange={() => toggleSelectOne(ord.id)} /></td>
                  )}
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{ord.sace}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{ord.marca} {ord.model}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(ord.estat)}`}>{ord.estat}</span></td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    <div>{ord.ubicacio}</div>
                    {ord.estat === 'Assignat' && (ord.nom_alumne || ord.classe_alumne) && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded">👤 {ord.nom_alumne || 'Sense nom'} {ord.classe_alumne ? `(${ord.classe_alumne})` : ''}</div>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">{ord.observacions || '-'}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1 opacity-50"/>{formatData(ord.data_modificacio)}</td>
                  
                  {role === 'admin' && (
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      {/* --- NOU BOTÓ DE L'HISTORIAL A CADA FILA --- */}
                      <button onClick={() => obrirHistorial(ord.id, ord.sace)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" title="Veure historial de canvis"><History className="w-5 h-5 inline"/></button>
                      <button onClick={() => obrirModalEdicio(ord)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Editar"><Edit className="w-5 h-5 inline"/></button>
                      <button onClick={() => handleEsborrarPortatil(ord.id, ord.sace)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Esborrar"><Trash2 className="w-5 h-5 inline"/></button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}