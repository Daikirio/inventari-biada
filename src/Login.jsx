import { useState } from 'react';
import { supabase } from './supabase'; 
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // <--- Nuevo estado

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (isRegistering) {
      // MODO REGISTRO
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setError('✅ Compte creat correctament! Ara pots iniciar sessió.');
    } else {
      // MODO LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Correu o contrasenya incorrectes');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-biada.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        
        <div className="flex flex-col items-center mb-8">
          {/* Tu logo del instituto */}
          <img src="/logo-biada.png" alt="Logo Institut Miquel Biada" className="w-24 h-auto mb-4 drop-shadow-md" />
          <h1 className="text-3xl font-bold text-white tracking-wide text-center">
            Institut Miquel Biada
          </h1>
          <p className="text-blue-100 mt-2 text-sm text-center">
            Portal de Coordinació Digital
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="email" required placeholder="Correu electrònic"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="password" required placeholder="Contrasenya (mínim 6 caràcters)"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center py-2 rounded ${error.includes('✅') ? 'bg-green-500/30 text-green-200' : 'bg-red-900/40 text-red-200'}`}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Processant...' : (isRegistering ? 'Crear compte de visitant' : 'Entrar al portal')}
          </button>
        </form>

        {/* El mensajito azul para cambiar de modo */}
        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            className="text-blue-300 hover:text-white text-sm transition-colors font-medium underline decoration-blue-400/50 hover:decoration-white"
          >
            {isRegistering 
              ? "¿Ja tens un compte? Inicia sessió aquí" 
              : "¿No tens compte? Registra't com a visitant"}
          </button>
        </div>

      </div>
    </div>
  );
}