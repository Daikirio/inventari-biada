import { X, CheckSquare } from 'lucide-react';

export default function Modals({
  isBulkModalOpen, setIsBulkModalOpen, selectedIds, bulkData, setBulkData, handleBulkUpdate, opcions,
  isModalOpen, setIsModalOpen, editingId, formData, setFormData, handleDesarPortatil
}) {
  return (
    <>
      {/* --- MODAL EDICIÓ EN LOTE (BULK EDIT) --- */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
              <h2 className="text-xl font-bold dark:text-white text-purple-800 dark:text-purple-300"><CheckSquare className="inline mr-2 w-5 h-5"/> Modificació Massiva</h2>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleBulkUpdate} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">S'aplicarà el mateix valor als <strong>{selectedIds.length}</strong> equips seleccionats.</p>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Què vols canviar?</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={bulkData.camp} onChange={e => setBulkData({camp: e.target.value, valor: ''})}>
                  <option value="estat">Estat</option><option value="ubicacio">Ubicació</option><option value="marca">Marca</option><option value="model">Model</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Quin és el nou valor?</label>
                <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={bulkData.valor} onChange={e => setBulkData({...bulkData, valor: e.target.value})}>
                  <option value="">Selecciona...</option>
                  {opcions[bulkData.camp]?.map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel·lar</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL INDIVIDUAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold dark:text-white">{editingId ? 'Editar Portàtil' : 'Afegir Nou Portàtil'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleDesarPortatil} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">SACE *</label>
                <input required type="text" disabled={!!editingId} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50" value={formData.sace} onChange={e => setFormData({...formData, sace: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Marca *</label>
                  <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})}>
                    <option value="">Selecciona...</option>{opcions.marca.map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Model *</label>
                  <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
                    <option value="">Selecciona...</option>{opcions.model.map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estat *</label>
                  <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.estat} onChange={e => setFormData({...formData, estat: e.target.value})}>
                    <option value="">Selecciona...</option>{opcions.estat.map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ubicació *</label>
                  <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.ubicacio} onChange={e => setFormData({...formData, ubicacio: e.target.value})}>
                    <option value="">Selecciona...</option>{opcions.ubicacio.map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                  </select>
                </div>
              </div>

              {formData.estat === 'Assignat' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-blue-800 dark:text-blue-300">Alumne Assignat</label>
                    <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.nom_alumne} onChange={e => setFormData({...formData, nom_alumne: e.target.value})} placeholder="Ex: Maria Font" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-blue-800 dark:text-blue-300">Grup / Classe</label>
                    <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.classe_alumne} onChange={e => setFormData({...formData, classe_alumne: e.target.value})} placeholder="Ex: 3r ESO A" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Observacions</label>
                <textarea className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2" value={formData.observacions} onChange={e => setFormData({...formData, observacions: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel·lar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">{editingId ? 'Guardar Canvis' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}