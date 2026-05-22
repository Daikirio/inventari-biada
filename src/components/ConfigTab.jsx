import { Settings, Plus, Trash2 } from 'lucide-react';

export default function ConfigTab({ handleAfegirOpcio, novaOpcio, setNovaOpcio, opcions, handleEsborrarOpcio }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><Settings className="text-blue-500"/> Configuració de Desplegables</h2>
      <form onSubmit={handleAfegirOpcio} className="flex gap-4 mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={novaOpcio.categoria} onChange={(e) => setNovaOpcio({...novaOpcio, categoria: e.target.value})}>
          <option value="marca">Marca</option><option value="model">Model</option><option value="estat">Estat</option><option value="ubicacio">Ubicació</option>
        </select>
        <input type="text" placeholder="Escriu el nou valor..." required className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={novaOpcio.valor} onChange={(e) => setNovaOpcio({...novaOpcio, valor: e.target.value})} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="w-5 h-5"/></button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['marca', 'model', 'estat', 'ubicacio'].map(cat => (
          <div key={cat} className="border dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-bold capitalize mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{cat}</h3>
            <ul className="space-y-2">
              {opcions[cat]?.map(opt => (
                <li key={opt.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm text-gray-700 dark:text-gray-300">
                  {opt.valor}
                  <button onClick={() => handleEsborrarOpcio(opt.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}