
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PawPrint, Mail, Lock, LogIn, Clock,
  AlertTriangle, XCircle, ShieldCheck, User, UserPlus
} from 'lucide-react';
import { userService } from '../services/userService';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'pending', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'neuroseid@gmail.com') {
      if (password === '000000') {
        handleDirectAccess();
      } else {
        setStatusMessage({ type: 'error', text: 'Senha incorreta para administrador' });
      }
    } else {
      // Simulação simples para outros e-mails
      localStorage.setItem('petmatch_user_email', email);
      localStorage.setItem('petmatch_user_role', 'user');
      onLogin();
    }
  };

  const handleDirectAccess = () => {
    localStorage.setItem('petmatch_auth', 'true');
    localStorage.setItem('petmatch_user_email', 'neuroseid@gmail.com');
    localStorage.setItem('petmatch_user_role', 'admin');
    onLogin();
    navigate('/');
  };

  const handleUserDirectAccess = () => {
    localStorage.setItem('petmatch_auth', 'true');
    localStorage.setItem('petmatch_user_email', 'visitante@petmatch.com.br');
    localStorage.setItem('petmatch_user_role', 'user');
    onLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="wood-panel w-full max-w-md p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-3xl border-4 border-[#c9a688] shadow-2xl overflow-hidden bg-[#55a630] flex items-center justify-center">
          <img src="/logo-login.png" alt="PetMatch Logo" className="w-full h-full object-cover" />
        </div>

        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">PETMATCH</h1>
          <p className="text-[#8b4513] text-sm font-medium italic">Plataforma de Adoção</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full grass-bg py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-4 border-[#3d7a22]"
          >
            Entrar
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/seja-um-parceiro')}
            className="text-[11px] font-black text-[#8b4513] uppercase hover:text-[#55a630] transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            Não tem uma conta? <span className="underline decoration-2">Criar conta agora</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-[#55a630]/20 space-y-3">
          <p className="text-center text-[9px] font-black text-[#55a630] uppercase tracking-widest">Painel de Testes</p>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleDirectAccess}
              className="w-full grass-bg py-3 rounded-2xl text-white font-black text-xs shadow-lg border-b-4 border-[#3d7a22] flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> ENTRAR COMO ADMIN (DIRETO)
            </button>

            <button
              onClick={handleUserDirectAccess}
              className="w-full wood-panel bg-[#d2b48c] py-3 rounded-2xl text-[#5d2e0a] font-black text-xs shadow-lg border-b-4 border-[#b38b6d] flex items-center justify-center gap-2"
            >
              <User size={16} /> ENTRAR COMO USUÁRIO (TESTE)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
