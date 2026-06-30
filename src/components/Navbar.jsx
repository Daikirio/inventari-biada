import { Laptop, Network, Settings, Users, HelpCircle, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, role, theme, toggleTheme, onSignOut }) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo-biada.png" alt="Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl hidden sm:block">Coordinació Digital</span>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-4">
            <button onClick={() => setActiveTab('inventari')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'inventari' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Laptop className="w-4 h-4" /> <span className="hidden sm:inline">Inventari</span></button>
            
            {/* --- NOU BOTÓ D'ESQUEMA --- */}
            <button onClick={() => setActiveTab('esquema')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'esquema' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Network className="w-4 h-4" /> <span className="hidden sm:inline">Esquema</span></button>

            {role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('configuracio')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'configuracio' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Settings className="w-4 h-4" /> <span className="hidden sm:inline">Configuració</span></button>
                <button onClick={() => setActiveTab('usuaris')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'usuaris' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Users className="w-4 h-4" /> <span className="hidden sm:inline">Usuaris</span></button>
              </>
            )}
            <button onClick={() => setActiveTab('ajuda')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'ajuda' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Ajuda</span></button>
            <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
            <button onClick={toggleTheme} className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md"><Sun className="w-5 h-5 hidden dark:block" /><Moon className="w-5 h-5 block dark:hidden" /></button>
            <button onClick={onSignOut} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-md"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </nav>
  );
}