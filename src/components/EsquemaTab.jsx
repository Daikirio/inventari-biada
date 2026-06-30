import { useMemo, useState } from 'react';
import { Database, MapPin, Tag, ChevronDown, ChevronRight, Laptop } from 'lucide-react';

export default function EsquemaTab({ ordinadors, onSububicacioClick }) {
  const [expandedLocs, setExpandedLocs] = useState({});

  const normalitzarText = (text) => {
    if (!text) return 'Sense sub-ubicació (Observacions buides)';
    return text.toString()
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, ' '); 
  };

  const esquema = useMemo(() => {
    const mapa = {};

    ordinadors.forEach(ord => {
      const ubicacioReal = ord.ubicacio || 'Sense Ubicació';
      const clauSububicacio = normalitzarText(ord.observacions);
      
      const nomSububicacioMostrar = ord.observacions ? ord.observacions.trim() : 'Sense sub-ubicació (Observacions buides)';

      if (!mapa[ubicacioReal]) {
        mapa[ubicacioReal] = { total: 0, sububicacions: {} };
      }
      
      mapa[ubicacioReal].total += 1;

      if (!mapa[ubicacioReal].sububicacions[clauSububicacio]) {
        mapa[ubicacioReal].sububicacions[clauSububicacio] = {
          nomOriginal: nomSububicacioMostrar,
          total: 0,
          equips: []
        };
      }

      mapa[ubicacioReal].sububicacions[clauSububicacio].total += 1;
      mapa[ubicacioReal].sububicacions[clauSububicacio].equips.push(ord);
    });

    return mapa;
  }, [ordinadors]);

  const toggleLoc = (loc) => {
    setExpandedLocs(prev => ({ ...prev, [loc]: !prev[loc] }));
  };

  const ubicacionsOrdenades = Object.keys(esquema).sort();

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8 border-b dark:border-gray-700 pb-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Esquema de Distribució</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mapa estructural de les ubicacions i sub-ubicacions. Fes clic a una sub-ubicació per veure'n els equips.</p>
        </div>
      </div>

      {ubicacionsOrdenades.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No hi ha dades per mostrar l'esquema.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ubicacionsOrdenades.map(ubicacio => (
            <div key={ubicacio} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              <div 
                className="bg-white dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => toggleLoc(ubicacio)}
              >
                <div className="flex items-center gap-2">
                  {expandedLocs[ubicacio] ? <ChevronDown className="w-5 h-5 text-gray-400"/> : <ChevronRight className="w-5 h-5 text-gray-400"/>}
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{ubicacio}</h3>
                </div>
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-sm shadow-inner flex items-center gap-1.5">
                  <Laptop className="w-4 h-4"/> {esquema[ubicacio].total}
                </div>
              </div>

              {expandedLocs[ubicacio] && (
                <div className="p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/20">
                  {Object.values(esquema[ubicacio].sububicacions).sort((a,b) => b.total - a.total).map((sub, idx) => (
                    
                    /* --- AQUEST DIV ARA ÉS CLICABLE --- */
                    <div 
                      key={idx} 
                      onClick={() => onSububicacioClick(sub.nomOriginal)}
                      title="Veure aquests equips a l'Inventari"
                      className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <Tag className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sub.nomOriginal}
                        </span>
                      </div>
                      <div className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-semibold px-2.5 py-1 rounded-md text-xs whitespace-nowrap flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-800 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-300 transition-colors">
                        {sub.total} equips
                      </div>
                    </div>

                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}