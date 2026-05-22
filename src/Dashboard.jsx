import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Users, HelpCircle, Search, ShieldCheck, ShieldCheck as ShieldCheckIcon } from 'lucide-react';

// --- NUEVAS IMPORTACIONES DE ARCHIVOS COMPONENTES ---
import Navbar from './components/Navbar';
import InventariTab from './components/InventariTab';
import ConfigTab from './components/ConfigTab';
import Modals from './components/Modals';

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('inventari');
  const [role, setRole] = useState('visitant');
  const [ordinadors, setOrdinadors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('tots');
  const [loading, setLoading] = useState(true);

  const [opcions, setOpcions] = useState({ marca: [], model: [], estat: [], ubicacio: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaOpcio, setNovaOpcio] = useState({ categoria: 'marca', valor: '' });
  
  const valorsInicialsForm = { sace: '', marca: '', model: '', estat: '', ubicacio: '', observacions: '', nom_alumne: '', classe_alumne: '' };
  const [formData, setFormData] = useState(valorsInicialsForm);
  const [editingId, setEditingId] = useState(null); 

  const [llistaUsuaris, setLlistaUsuaris] = useState([]);
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

  useEffect(() => { carregarDades(); }, [session]);
  useEffect(() => { if (activeTab === 'usuaris' && role === 'admin') carregarUsuaris(); }, [activeTab, role]);

  const carregarDades = async () => {
    setLoading(true);
    const { data: perfilData } = await supabase.from('perfils').select('rol').eq('id', session.user.id).single();
    if (perfilData) setRole(perfilData.rol);

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

  const formatData = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getBadgeColor = (estat) => {
    if (!estat) return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    const e = estat.toLowerCase();
    if (e.includes('ok') || e.includes('assignat') || e.includes('operatiu')) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    if (e.includes('defectes') || e.includes('reparació') || e.includes('pendent')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  };

  // --- FILTRADO AVANZADO QUE MANDAMOS A LA TABLA ---
  const ordinadorsFiltrats = ordinadors.filter(ord => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const strSace = (ord.sace || '').toLowerCase();
    const strMarcaModel = `${ord.marca || ''} ${ord.model || ''}`.toLowerCase();
    const strEstat = (ord.estat || '').toLowerCase();
    const strUbicacioAssignacio = `${ord.ubicacio || ''} ${ord.nom_alumne || ''} ${ord.classe_alumne || ''}`.toLowerCase();
    const strObservacions = (ord.observacions || '').toLowerCase();
    const strActualitzat = formatData(ord.data_modificacio).toLowerCase();

    switch (searchField) {
      case 'sace': return strSace.includes(searchLower);
      case 'marca_model': return strMarcaModel.includes(searchLower);
      case 'estat': return strEstat.includes(searchLower);
      case 'ubicacio_assignacio': return strUbicacioAssignacio.includes(searchLower);
      case 'observacions': return strObservacions.includes(searchLower);
      case 'actualitzat': return strActualitzat.includes(searchLower);
      default: return (strSace.includes(searchLower) || strMarcaModel.includes(searchLower) || strEstat.includes(searchLower) || strUbicacioAssignacio.includes(searchLower) || strObservacions.includes(searchLower) || strActualitzat.includes(searchLower));
    }
  });

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    let payload = { [bulkData.camp]: bulkData.valor };
    if (bulkData.camp === 'estat' && bulkData.valor !== 'Assignat') { payload.nom_alumne = null; payload.classe_alumne = null; }
    await supabase.from('ordinadors').update(payload).in('id', selectedIds);
    setIsBulkModalOpen(false); setSelectedIds([]); carregarDades();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Segur que vols esborrar ${selectedIds.length} portàtils?`)) return;
    await supabase.from('ordinadors').delete().in('id', selectedIds);
    setSelectedIds([]); carregarDades();
  };

  const obrirModalNou = () => { setFormData(valorsInicialsForm); setEditingId(null); setIsModalOpen(true); };
  const obrirModalEdicio = (ord) => { setFormData({ sace: ord.sace, marca: ord.marca, model: ord.model, estat: ord.estat, ubicacio: ord.ubicacio, observacions: ord.observacions || '', nom_alumne: ord.nom_alumne || '', classe_alumne: ord.classe_alumne || '' }); setEditingId(ord.id); setIsModalOpen(true); };

  const handleDesarPortatil = async (e) => {
    e.preventDefault();
    if (editingId) { await supabase.from('ordinadors').update(formData).eq('id', editingId); }
    else { await supabase.from('ordinadors').insert([{ ...formData, creat_per: session.user.id }]); }
    setIsModalOpen(false); carregarDades();
  };

  const handleEsborrarPortatil = async (id) => {
    if (!window.confirm("Segur que vols esborrar-lo?")) return;
    await supabase.from('ordinadors').delete().eq('id', id); carregarDades();
  };

  const handleAfegirOpcio = async (e) => {
    e.preventDefault();
    await supabase.from('opcions_desplegables').insert([novaOpcio]);
    setNovaOpcio({ ...novaOpcio, valor: '' }); carregarDades();
  };

  const handleEsborrarOpcio = async (id) => {
    await supabase.from('opcions_desplegables').delete().eq('id', id); carregarDades();
  };

  const handleCanviarRol = async (id, nouRol) => {
    if (id === session.user.id) return alert("No pots treure't els permisos a tu mateix!");
    await supabase.from('perfils').update({ rol: nouRol }).eq('id', id); carregarUsuaris();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} role={role} theme={theme} toggleTheme={toggleTheme} onSignOut={() => supabase.auth.signOut()} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventari' && (
          <InventariTab 
            role={role} loading={loading} ordinadors={ordinadorsFiltrats} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds} setIsBulkModalOpen={setIsBulkModalOpen} handleBulkDelete={handleBulkDelete} obrirModalNou={obrirModalNou} obrirModalEdicio={obrirModalEdicio} handleEsborrarPortatil={handleEsborrarPortatil} formatData={formatData} getBadgeColor={getBadgeColor}
          />
        )}
        {activeTab === 'configuracio' && <ConfigTab handleAfegirOpcio={handleAfegirOpcio} novaOpcio={novaOpcio} setNovaOpcio={setNovaOpcio} opcions={opcions} handleEsborrarOpcio={handleEsborrarOpcio} />}
        {activeTab === 'usuaris' && role === 'admin' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="text-blue-500"/> Gestió d'Usuaris</h2>
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50 dark:bg-gray-700 text-sm border-b">
                <th className="p-4">Correu</th><th className="p-4">Rol</th><th className="p-4">Accions</th>
              </tr></thead>
              <tbody>{llistaUsuaris.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4"><span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">{u.rol}</span></td>
                  <td className="p-4"><select value={u.rol} onChange={(e) => handleCanviarRol(u.id, e.target.value)} disabled={u.id === session.user.id} className="border p-1 rounded"><option value="visitant">Visitant</option><option value="admin">Admin</option></select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {activeTab === 'ajuda' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="text-blue-500" /> Manual d'Usuari</h2>
            <p>Benvingut al Portal de Coordinació Digital de l'<strong>Institut Miquel Biada</strong>. Utilitza els desplegables per fer cerques de precisió.</p>
          </div>
        )}
      </main>

      <Modals 
        isBulkModalOpen={isBulkModalOpen} setIsBulkModalOpen={setIsBulkModalOpen} selectedIds={selectedIds} bulkData={bulkData} setBulkData={setBulkData} handleBulkUpdate={handleBulkUpdate} opcions={opcions}
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} editingId={editingId} formData={formData} setFormData={setFormData} handleDesarPortatil={handleDesarPortatil}
      />
    </div>
  );
}