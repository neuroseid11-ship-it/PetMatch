import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                navigate('/admin'); // Default redirect to admin for now, logic will handle role check later
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                    },
                });
                if (error) throw error;
                alert('Cadastro realizado! Por favor, verifique seu email para confirmar.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8 space-y-2">
                    <div className="w-24 h-24 bg-[#55a630] rounded-[24px] mx-auto shadow-xl flex items-center justify-center border-4 border-[#c9a688] mb-4 overflow-hidden">
                        <img src="/project-logo.png" alt="PetMatch Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl font-black text-[#5d2e0a] tracking-tight">PetMatch</h1>
                    <p className="text-[#8b4513] font-bold italic">Portal do Guardião</p>
                </div>

                <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative">
                    <div className="flex bg-[#e6cbb3] p-1 rounded-2xl mb-8 border border-[#c9a688]/30 shadow-inner">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#d2b48c]'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#d2b48c]'
                                }`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-3">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a688]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] rounded-2xl outline-none focus:border-[#55a630] font-bold text-[#5d2e0a]"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-3">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a688]" size={18} />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] rounded-2xl outline-none focus:border-[#55a630] font-bold text-[#5d2e0a]"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-3">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a688]" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] rounded-2xl outline-none focus:border-[#55a630] font-bold text-[#5d2e0a]"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full grass-bg py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform border-b-4 border-[#3d7a22] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {isLogin ? 'Acessar Conta' : 'Criar Conta'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-[10px] text-[#8b4513] font-medium opacity-60">
                        Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
