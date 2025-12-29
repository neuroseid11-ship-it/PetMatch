import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    PawPrint, User, Coins, LogOut, Settings,
    ChevronDown, Search, Bell, Menu, X,
    Layout as LayoutIcon, Dog, Building2, Users, Inbox, History,
    Activity, Gift, Heart, Camera, MessageSquare
} from 'lucide-react';
import { userService } from '../services/userService';
import { messageService } from '../services/messageService';
import { supabase } from '../lib/supabaseClient';

interface NavItem {
    label: string;
    path: string;
    icon?: React.ReactNode;
    children?: NavItem[];
}

interface NavbarProps {
    onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [userCoins, setUserCoins] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const role = localStorage.getItem('petmatch_user_role');
            const email = localStorage.getItem('petmatch_user_email');
            setIsAdmin(role === 'admin');

            if (email) {
                try {
                    const users = await userService.getAll();
                    const user = users.find(u => u.email === email);

                    if (user) {
                        setUserCoins(user.coins);
                    } else if (email === 'admin@petmatch.com.br') {
                        setUserCoins(9999);
                    }
                } catch (error) {
                    console.error("Error fetching user data in Navbar:", error);
                }
            }
        };

        fetchUserData();
    }, [location]);

    const handleLogoutClick = async () => {
        if (onLogout) await onLogout();
        // Fallback if onLogout props is not passed (though App.tsx handles it)
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        {
            label: 'Início',
            path: '/',
            children: [
                { label: 'Página Inicial', path: '/', icon: <Activity size={14} /> },
                { label: 'Perfil', path: '/perfil', icon: <User size={14} /> }
            ]
        },
        {
            label: 'Adoção',
            path: '/adocao',
            children: [
                { label: 'Adoção Responsável', path: '/adocao', icon: <Gift size={14} /> },
                { label: 'Apadrinhar um Pet', path: '/apadrinhar', icon: <Heart size={14} /> }
            ]
        },
        {
            label: 'Jornada',
            path: '/liga',
            children: [
                { label: 'Atividades', path: '/atividades' },
                { label: 'Eventos', path: '/eventos' },
                { label: 'Loja', path: '/loja' }
            ]
        },
        {
            label: 'Mapa',
            path: '/mapa',
            children: [
                { label: 'Mapa Solidário', path: '/mapa' },
                { label: 'Empresas Parceiras', path: '/parceiros' }
            ]
        },
        {
            label: 'Mural',
            path: '/mural',
            children: [
                { label: 'Mural da Rede', path: '/mural', icon: <Camera size={14} /> },
                { label: 'Mensagens', path: '/mensagens', icon: <MessageSquare size={14} /> }
            ]
        },
        ...(isAdmin ? [{
            label: 'Gestão Admin',
            path: '/admin',
            children: [
                { label: 'Dashboard Geral', path: '/admin', icon: <LayoutIcon size={14} /> },
                { label: 'Animais', path: '/admin/pets', icon: <Dog size={14} /> },
                { label: 'ONGs', path: '/admin/ongs', icon: <Building2 size={14} /> },
                { label: 'Parceiros', path: '/admin/parceiros', icon: <Building2 size={14} /> },
                { label: 'Usuários', path: '/admin/users', icon: <Users size={14} /> },
                { label: 'Central de Mensagens', path: '/admin/messages', icon: <Inbox size={14} /> },
                { label: 'Logs de Atividade', path: '/admin/logs', icon: <History size={14} /> }
            ]
        }] : [])
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleMobileNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="wood-panel sticky top-0 z-50 flex flex-col shadow-md border-b-2 border-[#b38b6d]">
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-[#5d2e0a] hover:bg-[#f1dfcf] rounded-lg transition-colors"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="grass-bg p-1.5 group-hover:rotate-12 transition-transform shadow-md">
                            <PawPrint className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-lg md:text-xl font-black text-[#5d2e0a] tracking-tight uppercase whitespace-nowrap">PetMatch</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-[22px] font-bold text-[13px] uppercase tracking-tighter text-[#5d2e0a]/80 ml-4">
                        {navItems.map((item) => {
                            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            const hasChildren = item.children && item.children.length > 0;

                            if (hasChildren) {
                                return (
                                    <div key={item.label} className="relative group/menu py-4">
                                        <Link
                                            to={item.path}
                                            className={`hover:text-[#55a630] transition-all flex items-center gap-1 cursor-pointer ${active ? 'text-[#55a630]' : ''
                                                }`}
                                        >
                                            {item.label}
                                            <ChevronDown size={12} className="group-hover/menu:rotate-180 transition-transform" />
                                        </Link>

                                        <div className="absolute top-full left-0 mt-[-10px] min-w-[200px] wood-panel rounded-xl border-2 border-[#c9a688] shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all p-2 z-[60]">
                                            {item.children?.map(child => (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black hover:bg-[#f1dfcf] transition-colors ${location.pathname === child.path ? 'text-[#55a630]' : 'text-[#5d2e0a]'
                                                        }`}
                                                >
                                                    {child.icon}
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`hover:text-[#55a630] transition-all relative flex items-center gap-1.5 ${active ? 'text-[#55a630]' : ''
                                        }`}
                                >
                                    {item.label}
                                    {active && <div className="absolute -bottom-1 left-0 right-0 h-0.5 grass-bg" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-[#f1dfcf] px-2 md:px-3 py-1.5 rounded-full border border-[#c9a688] flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black text-[#5d2e0a] shadow-inner whitespace-nowrap">
                        <Coins className="w-3 h-3 text-[#cd7f32]" />
                        {userCoins.toLocaleString()} PC
                    </div>

                    <div className="group relative">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-100 border-2 border-[#55a630] overflow-hidden cursor-pointer shadow-md p-0.5">
                            <img src="https://picsum.photos/seed/user/100/100" alt="Profile" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="absolute right-0 mt-2 w-64 wood-panel rounded-[24px] border-2 border-[#c9a688] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 z-50">
                            <div className="px-4 py-3 mb-1">
                                <p className="text-[11px] font-black text-[#8b4513] uppercase tracking-wider">{isAdmin ? 'Administrador' : 'Guardião'}</p>
                                <p className="text-[13px] font-black text-[#5d2e0a] truncate opacity-80">{localStorage.getItem('petmatch_user_email') || 'Usuário'}</p>
                            </div>

                            <div className="space-y-1">
                                {isAdmin && (
                                    <Link to="/admin" className="w-full text-left px-4 py-2.5 text-xs font-black text-amber-600 hover:bg-[#f1dfcf] rounded-xl flex items-center gap-3 transition-colors">
                                        <Settings size={16} /> Painel Administrativo
                                    </Link>
                                )}
                                <Link to="/perfil" className="w-full text-left px-4 py-2.5 text-xs font-black text-[#5d2e0a] hover:bg-[#f1dfcf] rounded-xl flex items-center gap-3 transition-colors">
                                    <User size={16} /> Meu Perfil
                                </Link>
                            </div>

                            <div className="h-px bg-[#c9a688]/30 my-2 mx-2"></div>

                            <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2.5 text-xs font-black text-red-600 hover:bg-[#f1dfcf] rounded-xl flex items-center gap-3 transition-colors">
                                <LogOut size={16} className="rotate-180" /> Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t-2 border-[#c9a688] bg-[#fdfaf7] animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
                        {navItems.map((item) => (
                            <div key={item.label} className="space-y-1">
                                {item.children ? (
                                    <>
                                        <div className="px-4 py-2 text-xs font-black text-[#8b4513] uppercase opacity-60">
                                            {item.label}
                                        </div>
                                        <div className="pl-4 space-y-1">
                                            {item.children.map(child => (
                                                <button
                                                    key={child.path}
                                                    onClick={() => handleMobileNavigate(child.path)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${location.pathname === child.path ? 'bg-[#55a630]/10 text-[#55a630]' : 'text-[#5d2e0a] hover:bg-[#f1dfcf]'
                                                        }`}
                                                >
                                                    {child.icon}
                                                    {child.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleMobileNavigate(item.path)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${location.pathname === item.path ? 'bg-[#55a630]/10 text-[#55a630]' : 'text-[#5d2e0a] hover:bg-[#f1dfcf]'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
