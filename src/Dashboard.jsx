import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Users, HelpCircle, Search, ShieldCheck, AlertTriangle } from 'lucide-react';

import Navbar from './components/Navbar';
import InventariTab from './components/InventariTab';
import EsquemaTab from './components/EsquemaTab'; // NOU: Component de l'Esquema Visual
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
  
  const valorsInicialsForm = { sace: '', sn: '', marca: '', model: '', estat: '', ubicacio: '', observacions: '', nom_alumne: '', classe_alumne: '' };
  const [formData, setFormData] = useState(valorsInicialsForm);
  const [editingId, setEditingId] = useState(null); 

  const [llistaUsuaris, setLlistaUsuaris] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState({ camp: 'estat', valor: '' });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historySace, setHistorySace] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [conflictingEquip, setConflictingEquip] = useState(null);
  const [pendingData, setPendingData] = useState(null);

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

  const ordinadorsFiltrats = ordinadors.filter(ord => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const strSace = (ord.sace || '').toLowerCase();
    const strSn = (ord.sn || '').toLowerCase();
    const strMarcaModel = `${ord.marca || ''} ${ord.model || ''}`.toLowerCase();
    const strEstat = (ord.estat || '').toLowerCase();
    const strUbicacioAssignacio = `${ord.ubicacio || ''} ${ord.nom_alumne || ''} ${ord.classe_alumne || ''}`.toLowerCase();
    const strObservacions = (ord.observacions || '').toLowerCase();
    const strActualitzat = formatData(ord.data_modificacio).toLowerCase();

    switch (searchField) {
      case 'sace_sn': return strSace.includes(searchLower) || strSn.includes(searchLower);
      case 'marca_model': return strMarcaModel.includes(searchLower);
      case 'estat': return strEstat.includes(searchLower);
      case 'ubicacio_assignacio': return strUbicacioAssignacio.includes(searchLower);
      case 'observacions': return strObservacions.includes(searchLower);
      case 'actualitzat': return strActualitzat.includes(searchLower);
      default: return (strSace.includes(searchLower) || strSn.includes(searchLower) || strMarcaModel.includes(searchLower) || strEstat.includes(searchLower) || strUbicacioAssignacio.includes(searchLower) || strObservacions.includes(searchLower) || strActualitzat.includes(searchLower));
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
  
  const obrirModalEdicio = (ord) => { 
    setFormData({ 
      sace: ord.sace || '', 
      sn: ord.sn || '', 
      marca: ord.marca, model: ord.model, estat: ord.estat, ubicacio: ord.ubicacio, observacions: ord.observacions || '', nom_alumne: ord.nom_alumne || '', classe_alumne: ord.classe_alumne || '' 
    }); 
    setEditingId(ord.id); 
    setIsModalOpen(true); 
  };

  const obrirHistorial = async (id, sace, sn) => {
    setHistorySace(sace || sn || 'Sense ID');
    setHistoryData([]);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    const { data } = await supabase.from('historial_ordinadors').select('*').eq('ordinador_id', id).order('data_canvi', { ascending: false });
    if (data) setHistoryData(data);
    setLoadingHistory(false);
  };

  const handleDesarPortatil = async (e) => {
    e.preventDefault();
    
    if (!formData.sace.trim() && !formData.sn.trim()) {
      return alert('❌ ERROR: Has d\'introduir almenys el SACE o el Número de Sèrie (S/N).');
    }

    const dadesAGuardar = { ...formData };
    if (dadesAGuardar.sace.trim() === '') dadesAGuardar.sace = null;
    if (dadesAGuardar.sn.trim() === '') dadesAGuardar.sn = null;

    if (dadesAGuardar.estat !== 'Assignat') {
      dadesAGuardar.nom_alumne = null;
      dadesAGuardar.classe_alumne = null;
    }

    let orConditions = [];
    if (dadesAGuardar.sace) orConditions.push(`sace.eq."${dadesAGuardar.sace}"`);
    if (dadesAGuardar.sn) orConditions.push(`sn.eq."${dadesAGuardar.sn}"`);

    if (orConditions.length > 0) {
      let query = supabase.from('ordinadors').select('*').or(orConditions.join(','));
      
      if (editingId) {
        query = query.neq('id', editingId);
      }

      const { data: duplicats } = await query;

      if (duplicats && duplicats.length > 0) {
        setConflictingEquip(duplicats[0]);
        setPendingData(dadesAGuardar);
        setIsDuplicateModalOpen(true);
        return; 
      }
    }

    await executarGuardatReal(dadesAGuardar, editingId);
  };

  const executarGuardatReal = async (dades, idEdit) => {
    if (idEdit) { 
      const { error } = await supabase.from('ordinadors').update(dades).eq('id', idEdit); 
      if (error) return alert('❌ Error de base de dades: ' + error.message);
    } else { 
      const { error } = await supabase.from('ordinadors').insert([{ ...dades, creat_per: session.user.id }]); 
      if (error) return alert('❌ Error de base de dades: ' + error.message);
    }
    
    setIsModalOpen(false); 
    carregarDades();
  };

  const handleReemplacarDuplicat = async () => {
    await supabase.from('ordinadors').delete().eq('id', conflictingEquip.id);
    await executarGuardatReal(pendingData, editingId);
    setIsDuplicateModalOpen(false);
    setConflictingEquip(null);
    setPendingData(null);
  };

  const cancelarReemplac = () => {
    setIsDuplicateModalOpen(false);
    setConflictingEquip(null);
    setPendingData(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} role={role} theme={theme} toggleTheme={toggleTheme} onSignOut={() => supabase.auth.signOut()} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventari' && (
          <InventariTab 
            role={role} loading={loading} ordinadors={ordinadorsFiltrats} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchField={searchField} setSearchField={setSearchField}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds} setIsBulkModalOpen={setIsBulkModalOpen} handleBulkDelete={handleBulkDelete} obrirModalNou={obrirModalNou} obrirModalEdicio={obrirModalEdicio} handleEsborrarPortatil={handleEsborrarPortatil} formatData={formatData} getBadgeColor={getBadgeColor} obrirHistorial={obrirHistorial}
          />
        )}
        
        {/* --- NOU APARTAT D'ESQUEMA --- */}
        {activeTab === 'esquema' && (
          <EsquemaTab 
            ordinadors={ordinadors} 
            onSububicacioClick={(nomSububicacio) => {
              // Si la sububicació no està buida, filtrem
              if (nomSububicacio !== 'Sense sub-ubicació (Observacions buides)') {
                setSearchField('observacions');
                setSearchTerm(nomSububicacio);
              } else {
                setSearchField('tots');
                setSearchTerm('');
              }
              // I canviem a la pestanya d'inventari
              setActiveTab('inventari');
            }}
          />
        )}

        {activeTab === 'configuracio' && <ConfigTab handleAfegirOpcio={handleAfegirOpcio} novaOpcio={novaOpcio} setNovaOpcio={setNovaOpcio} opcions={opcions} handleEsborrarOpcio={handleEsborrarOpcio} />}
        
        {activeTab === 'usuaris' && role === 'admin' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><Users className="text-blue-500"/> Gestió d'Usuaris</h2>
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
                    <tr key={usuari.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{usuari.email || 'Correu no sincronitzat'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${usuari.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                          {usuari.rol.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          value={usuari.rol} 
                          onChange={(e) => handleCanviarRol(usuari.id, e.target.value)} 
                          disabled={usuari.id === session.user.id} 
                          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg outline-none px-3 py-2 disabled:opacity-50"
                        >
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
        )}

        {activeTab === 'ajuda' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
              <HelpCircle className="text-blue-500" /> Manual d'Usuari del Portal
            </h2>
            
            <div className="space-y-8 text-gray-600 dark:text-gray-300">
              <p className="text-lg">Benvingut/da al Portal de Coordinació Digital de l'<strong>Institut Miquel Biada</strong>.</p>
              
              <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2"><Search className="w-5 h-5"/> Per a tot el professorat (Rol: Visitant)</h3>
                <p className="mb-2">Com a professor, la teva eina principal és la pestanya <strong>Inventari</strong>.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pots utilitzar la <strong>barra de cerca</strong> per trobar ràpidament un ordinador pel número SACE, la marca o el nom de l'alumne.</li>
                  <li>Utilitza el desplegable de l'esquerra del buscador per filtrar exactament per un camp (ex: data d'actualització).</li>
                  <li>Podràs veure d'un cop d'ull si un equip està Operatiu (Verd), té defectes (Groc) o No funciona (Vermell).</li>
                </ul>
              </section>

              {role === 'admin' && (
                <section className="space-y-6">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2 border-b dark:border-gray-700 pb-2"><ShieldCheck className="w-5 h-5"/> Eines exclusives de Coordinació (Rol: Admin)</h3>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Com editar múltiples equips de cop?</h4>
                    <p>A l'esquerra de cada portàtil veuràs una casella de selecció. Marca tots els equips que vulguis. Apareixerà un botó lila per canviar l'estat o ubicació de tots de cop. Això és súper útil per moure 20 portàtils a un altre armari d'un sol clic!</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Com assignar un ordinador a un alumne?</h4>
                    <p>A l'editar o afegir un portàtil, si canvies el seu estat a <strong>"Assignat"</strong>, s'obriran automàticament dos camps nous per escriure el nom de l'alumne i la seva classe.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Pestanya "Configuració"</h4>
                    <p className="mb-2">Afegeix noves marques, estats o ubicacions (aules) perquè apareguin als desplegables del formulari.</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
        
      </main>

      <Modals 
        isBulkModalOpen={isBulkModalOpen} setIsBulkModalOpen={setIsBulkModalOpen} selectedIds={selectedIds} bulkData={bulkData} setBulkData={setBulkData} handleBulkUpdate={handleBulkUpdate} opcions={opcions}
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} editingId={editingId} formData={formData} setFormData={setFormData} handleDesarPortatil={handleDesarPortatil}
        isHistoryModalOpen={isHistoryModalOpen} setIsHistoryModalOpen={setIsHistoryModalOpen} historyData={historyData} historySace={historySace} loadingHistory={loadingHistory}
      />

      {/* --- POP-UP SUPERIOR D'ALERTA DE DUPLICATS --- */}
      {isDuplicateModalOpen && conflictingEquip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-red-500">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-800/50 flex items-start gap-4">
              <div className="bg-red-100 dark:bg-red-800/50 p-2 rounded-full text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Equip Duplicat Detectat!</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">El SACE o S/N que intentes posar ja està assignat a un altre equip de la base de dades.</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 space-y-3">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dades de l'equip antic que es perdrà:</h3>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm text-sm">
                <p className="text-gray-800 dark:text-gray-200"><strong className="text-gray-500 dark:text-gray-400">SACE:</strong> {conflictingEquip.sace || '-'}</p>
                <p className="text-gray-800 dark:text-gray-200"><strong className="text-gray-500 dark:text-gray-400">S/N:</strong> {conflictingEquip.sn || '-'}</p>
                <p className="text-gray-800 dark:text-gray-200 mt-2"><strong className="text-gray-500 dark:text-gray-400">Model:</strong> {conflictingEquip.marca} {conflictingEquip.model}</p>
                <p className="text-gray-800 dark:text-gray-200"><strong className="text-gray-500 dark:text-gray-400">Aula:</strong> {conflictingEquip.ubicacio}</p>
                <p className="text-gray-800 dark:text-gray-200 mt-2"><strong className="text-gray-500 dark:text-gray-400">Estat actual:</strong> <span className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600">{conflictingEquip.estat}</span></p>
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-4 text-center">Vols esborrar l'equip antic i guardar el nou al seu lloc?</p>
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800">
              <button onClick={cancelarReemplac} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancel·lar</button>
              <button onClick={handleReemplacarDuplicat} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">Reemplaçar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}