import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Laptop, Users, HelpCircle, LogOut, Search, Plus, Trash2, Edit, Sun, Moon, Settings, X, ShieldAlert, ShieldCheck, CheckSquare, Clock } from 'lucide-react';

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('inventari');
  const [role, setRole] = useState('visitant');
  const [ordinadors, setOrdinadors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [opcions, setOpcions] = useState({ marca: [], model: [], estat: [], ubicacio: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaOpcio, setNovaOpcio] = useState({ categoria: 'marca', valor: '' });
  
  const valorsInicialsForm = { sace: '', marca: '', model: '', estat: '', ubicacio: '', observacions: '', nom_alumne: '', classe_alumne: '' };
  const [formData, setFormData] = useState(valorsInicialsForm);
  const [editingId, setEditingId] = useState(null); 

  const [llistaUsuaris, setLlistaUsuaris] = useState([]);

  // --- ESTAT PER LA SELECCIÓ MÚLTIPLE ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState({ camp: 'estat', valor: '' });

  const [theme, setTheme] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    carregarDades();
  }, [session]);

  useEffect(() => {
    if (activeTab === 'usuaris' && role === 'admin') carregarUsuaris();
  }, [activeTab, role]);

  const carregarDades = async () => {
    setLoading(true);
    const { data: perfilData } = await supabase.from('perfils').select('rol').eq('id', session.user.id).single();
    if (perfilData) setRole(perfilData.rol);

    // Ordenem per la data de modificació (els més recents a dalt)
    const { data: ordData } = await supabase.from('ordinadors').select('*').order('data_modificacio', { ascending: false });
    if (ordData) setOrdinadors(ordData);

    const { data: optData } = await supabase.from('opcions_desplegables').select('*').order('valor');
    if (optData) {
      const agrupades = { marca: [], model: [], estat: [], ubicacio: [] };
      optData.forEach(opt => { if (agrupades[opt.categoria]) agrupades[opt.categoria].push(opt); });
      setOpcions(agrupades);
    }
    setLoading(false);
  };

  const carregarUsuaris = async () => {
    const { data } = await supabase.from('perfils').select('*').order('email');
    if (data) setLlistaUsuaris(data);
  };

  // --- FORMATEJADOR DE DATA ---
  const formatData = (dataString) => {
    if (!dataString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('ca-ES', options);
  };

  const getBadgeColor = (estat) => {
    if (!estat) return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-500';
    const e = estat.toLowerCase();
    
    if (e.includes('ok') || e.includes('assignat') || e.includes('operatiu')) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
    if (e.includes('defectes') || e.includes('reparació') || e.includes('pendent')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    if (e.includes('no funciona') || e.includes('no hi són') || e.includes('descartat') || e.includes('baixa')) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-500';
  };

  const ordinadorsFiltrats = ordinadors.filter(ord =>
    ord.sace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.ubicacio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ord.nom_alumne && ord.nom_alumne.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(ordinadorsFiltrats.map(o => o.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (!bulkData.valor) return alert('Selecciona un valor a aplicar!');
    
    let payload = { [bulkData.camp]: bulkData.valor };
    if (bulkData.camp === 'estat' && bulkData.valor !== 'Assignat') {
      payload.nom_alumne = null;
      payload.classe_alumne = null;
    }

    const { error } = await supabase.from('ordinadors').update(payload).in('id', selectedIds);
    if (error) alert("Error actualitzant: " + error.message);
    else {
      setIsBulkModalOpen(false);
      setSelectedIds([]); 
      carregarDades();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`ATENCIÓ: Estàs a punt d'esborrar DEFINITIVAMENT ${selectedIds.length} portàtils. Aquesta acció no es pot desfer. Vols continuar?`)) return;
    const { error } = await supabase.from('ordinadors').delete().in('id', selectedIds);
    if (!error) {
      setSelectedIds([]);
      carregarDades();
    } else alert("Error esborrant: " + error.message);
  };

  const obrirModalNou = () => {
    setFormData(valorsInicialsForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const obrirModalEdicio = (ordinador) => {
    setFormData({
      sace: ordinador.sace, marca: ordinador.marca, model: ordinador.model,
      estat: ordinador.estat, ubicacio: ordinador.ubicacio, observacions: ordinador.observacions || '',
      nom_alumne: ordinador.nom_alumne || '', classe_alumne: ordinador.classe_alumne || ''
    });
    setEditingId(ordinador.id);
    setIsModalOpen(true);
  };

  const handleDesarPortatil = async (e) => {
    e.preventDefault();
    const dadesAGuardar = { ...formData };
    if (dadesAGuardar.estat !== 'Assignat') {
      dadesAGuardar.nom_alumne = null;
      dadesAGuardar.classe_alumne = null;
    }

    if (editingId) {
      const { error } = await supabase.from('ordinadors').update(dadesAGuardar).eq('id', editingId);
      if (error) alert('Error al modificar: ' + error.message);
    } else {
      const { error } = await supabase.from('ordinadors').insert([{ ...dadesAGuardar, creat_per: session.user.id }]);
      if (error) alert(error.message.includes('unique constraint') ? 'Aquest número SACE ja existeix!' : 'Error: ' + error.message);
    }
    setIsModalOpen(false);
    carregarDades();
  };

  const handleEsborrarPortatil = async (id, sace) => {
    if (!window.confirm(`Segur que vols esborrar definitivament el portàtil SACE-${sace}?`)) return;
    await supabase.from('ordinadors').delete().eq('id', id);
    carregarDades();
  };

  const handleAfegirOpcio = async (e) => {
    e.preventDefault();
    if (!novaOpcio.valor.trim()) return;
    await supabase.from('opcions_desplegables').insert([{ categoria: novaOpcio.categoria, valor: novaOpcio.valor.trim() }]);
    setNovaOpcio({ ...novaOpcio, valor: '' });
    carregarDades();
  };

  const handleEsborrarOpcio = async (id) => {
    if (!window.confirm("Segur que vols esborrar aquesta opció?")) return;
    await supabase.from('opcions_desplegables').delete().eq('id', id);
    carregarDades();
  };

  const handleCanviarRol = async (usuariId, nouRol) => {
    if (usuariId === session.user.id) return alert("No pots treure't els permisos d'administrador a tu mateix!");
    await supabase.from('perfils').update({ rol: nouRol }).eq('id', usuariId);
    carregarUsuaris();
  };

  const renderInventari = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96 flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cercar SACE, ubicació o alumne..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        {role === 'admin' && selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-2 rounded-lg animate-fade-in">
            <span className="text-purple-700 dark:text-purple-300 font-semibold">{selectedIds.length} seleccionats</span>
            <button onClick={() => setIsBulkModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"><Edit className="w-4 h-4 inline mr-1"/> Editar tots</button>
            <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"><Trash2 className="w-4 h-4 inline"/></button>
          </div>
        )}

        {role === 'admin' && selectedIds.length === 0 && (
          <button onClick={obrirModalNou} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto shadow-sm">
            <Plus className="w-5 h-5" /> Afegir Portàtil
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {role === 'admin' && (
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" 
                    onChange={toggleSelectAll} 
                    checked={selectedIds.length === ordinadorsFiltrats.length && ordinadorsFiltrats.length > 0} 
                  />
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
            ) : ordinadorsFiltrats.length === 0 ? (
              <tr><td colSpan={role === 'admin' ? "8" : "7"} className="text-center p-8 text-gray-500">No s'han trobat equips.</td></tr>
            ) : (
              ordinadorsFiltrats.map(ord => (
                <tr key={ord.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIds.includes(ord.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  {role === 'admin' && (
                    <td className="p-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        checked={selectedIds.includes(ord.id)}
                        onChange={() => toggleSelectOne(ord.id)}
                      />
                    </td>
                  )}
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{ord.sace}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{ord.marca} {ord.model}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(ord.estat)}`}>{ord.estat}</span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    <div>{ord.ubicacio}</div>
                    {ord.estat === 'Assignat' && (ord.nom_alumne || ord.classe_alumne) && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded">
                        👤 {ord.nom_alumne || 'Sense nom'} {ord.classe_alumne ? `(${ord.classe_alumne})` : ''}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">{ord.observacions || '-'}</td>
                  
                  {/* NOVA COLUMNA DE DATA */}
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                    <Clock className="w-3 h-3 inline mr-1 opacity-50"/>
                    {formatData(ord.data_modificacio)}
                  </td>

                  {role === 'admin' && (
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => obrirModalEdicio(ord)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit className="w-5 h-5 inline"/></button>
                      <button onClick={() => handleEsborrarPortatil(ord.id, ord.sace)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="w-5 h-5 inline"/></button>
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

  const renderUsuaris = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><Users className="text-blue-500"/> Gestió d'Usuaris</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm tracking-wider border-b border-gray-200 dark:border-gray-600">
              <th className="p-4 font-semibold">Correu Electrònic</th>
              <th className="p-4 font-semibold">Rol Actual</th>
              <th className="p-4 font-semibold">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {llistaUsuaris.map(usuari => (
              <tr key={usuari.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium text-gray-900 dark:text-white">{usuari.email || 'Correu no sincronitzat'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${usuari.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                    {usuari.rol === 'admin' ? <ShieldCheck className="w-3 h-3"/> : <ShieldAlert className="w-3 h-3"/>}
                    {usuari.rol.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <select value={usuari.rol} onChange={(e) => handleCanviarRol(usuari.id, e.target.value)} disabled={usuari.id === session.user.id} className="p-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50">
                    <option value="visitant">Fer Visitant</option>
                    <option value="admin">Fer Administrador</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConfiguracio = () => (
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
              {opcions[cat].map(opt => (
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

  const renderAjuda = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><HelpCircle className="text-blue-500" /> Manual d'Usuari</h2>
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <p>Benvingut al Portal de Coordinació Digital. Aquí pots buscar equips pel seu SACE, estat o fins i tot pel nom de l'alumne que el té assignat.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-biada.png" alt="Logo" className="h-10 w-auto" />
              <span className="font-bold text-xl hidden sm:block">Coordinació Digital</span>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-4">
              <button onClick={() => setActiveTab('inventari')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'inventari' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Laptop className="w-4 h-4" /> <span className="hidden sm:inline">Inventari</span></button>
              {role === 'admin' && (
                <>
                  <button onClick={() => setActiveTab('configuracio')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'configuracio' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Settings className="w-4 h-4" /> <span className="hidden sm:inline">Configuració</span></button>
                  <button onClick={() => setActiveTab('usuaris')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'usuaris' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Users className="w-4 h-4" /> <span className="hidden sm:inline">Usuaris</span></button>
                </>
              )}
              <button onClick={() => setActiveTab('ajuda')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'ajuda' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Ajuda</span></button>
              <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
              <button onClick={toggleTheme} className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md"><Sun className="w-5 h-5 hidden dark:block" /><Moon className="w-5 h-5 block dark:hidden" /></button>
              <button onClick={() => supabase.auth.signOut()} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-md"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventari' && renderInventari()}
        {activeTab === 'configuracio' && renderConfiguracio()}
        {activeTab === 'usuaris' && renderUsuaris()}
        {activeTab === 'ajuda' && renderAjuda()}
      </main>

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
                  <option value="estat">Estat</option>
                  <option value="ubicacio">Ubicació</option>
                  <option value="marca">Marca</option>
                  <option value="model">Model</option>
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
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Aplicar a {selectedIds.length} equips</button>
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">{editingId ? 'Guardar Canvis' : 'Guardar Portàtil'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}