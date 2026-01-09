import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, Medal, Target, Coins, Star, Trophy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { missionService, Mission, RankingUser } from '../services/missionService';

const AdminMissions: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'missions' | 'ranking'>('missions');
    const [missions, setMissions] = useState<Mission[]>([]);
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        xp_reward: 0,
        coin_reward: 0,
        type: 'daily' as 'daily' | 'one_time',
        action_link: '',
        icon: ''
    });

    useEffect(() => {
        checkAdmin();
        loadData();
    }, []);

    const checkAdmin = () => {
        const role = localStorage.getItem('petmatch_user_role');
        if (role !== 'admin') {
            alert('Acesso não autorizado');
            navigate('/');
        }
    };

    const loadData = async () => {
        try {
            console.log("Loading missions...");
            const missionsData = await missionService.getAll();
            console.log("Missions loaded:", missionsData);
            setMissions(missionsData);

            if (activeTab === 'ranking') {
                const rankingData = await missionService.getRanking();
                setRanking(rankingData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Erro ao carregar dados. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    // Reload ranking specifically when switching tabs
    useEffect(() => {
        if (activeTab === 'ranking') {
            setLoading(true);
            missionService.getRanking().then(data => {
                setRanking(data);
                setLoading(false);
            });
        }
    }, [activeTab]);

    // ... existing handlers ...

    if (loading && missions.length === 0) {
        return <div className="p-10 text-center font-bold text-[#8b4513]">Carregando sistema de gamificação...</div>;
    }
    if (mission) {
        setFormData({
            title: mission.title,
            description: mission.description,
            xp_reward: mission.xp_reward,
            coin_reward: mission.coin_reward,
            type: mission.type,
            action_link: mission.action_link || '',
            icon: mission.icon || ''
        });
        setEditingId(mission.id);
    } else {
        setFormData({
            title: '',
            description: '',
            xp_reward: 50,
            coin_reward: 20,
            type: 'daily',
            action_link: '',
            icon: ''
        });
        setEditingId(null);
    }
    setIsModalOpen(true);
};

const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await missionService.save(formData, editingId || undefined);
        await loadData();
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving mission:", error);
        alert("Erro ao salvar missão");
    }
};

const handleDelete = async (id: string) => {
    if (window.confirm("Excluir esta missão?")) {
        try {
            await missionService.delete(id);
            await loadData();
        } catch (error) {
            console.error("Error deleting mission:", error);
            alert("Erro ao excluir missão");
        }
    }
};

return (
    <div className="pb-20">
        <PageHeader
            title="Gestão de Gamificação"
            subtitle="Gerencie missões e acompanhe o ranking dos guardiões"
            icon={<Medal size={28} />}
        >
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('missions')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'missions' ? 'bg-[#55a630] text-white' : 'bg-[#e6d0b3] text-[#5d2e0a]'}`}
                >
                    Missões
                </button>
                <button
                    onClick={() => setActiveTab('ranking')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'ranking' ? 'bg-[#55a630] text-white' : 'bg-[#e6d0b3] text-[#5d2e0a]'}`}
                >
                    Ranking
                </button>
            </div>
        </PageHeader>

        {/* MISSIONS TAB */}
        {activeTab === 'missions' && (
            <div className="mt-6">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-[#55a630] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4a912a] transition-colors shadow-sm"
                    >
                        <Plus size={20} /> Nova Missão
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {missions.map(mission => (
                        <div key={mission.id} className="wood-panel p-6 rounded-2xl relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-full ${mission.type === 'daily' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {mission.type === 'daily' ? <Target size={24} /> : <Star size={24} />}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(mission)} className="p-2 bg-[#fdfaf7] rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(mission.id)} className="p-2 bg-[#fdfaf7] rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-[#5d2e0a] mb-2">{mission.title}</h3>
                            <p className="text-sm text-[#8b4513] mb-4 h-10 overflow-hidden text-ellipsis">{mission.description}</p>

                            <div className="flex items-center gap-4 text-xs font-black">
                                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                    +{mission.xp_reward} XP
                                </span>
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                    <Coins size={12} /> +{mission.coin_reward} Moedas
                                </span>
                            </div>

                            <div className="mt-4 text-[10px] uppercase font-bold text-[#8b4513]/50">
                                {mission.type === 'daily' ? 'Renova Diariamente' : 'Missão Única'}
                            </div>
                        </div>
                    ))}
                </div>

                {missions.length === 0 && !loading && (
                    <div className="text-center py-20 text-[#8b4513]/50 font-medium">
                        Nenhuma missão cadastrada ainda.
                    </div>
                )}
            </div>
        )}

        {/* RANKING TAB */}
        {activeTab === 'ranking' && (
            <div className="mt-6">
                <div className="wood-panel overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e6d0b3] text-[#5d2e0a] text-xs uppercase tracking-wider font-black">
                                    <th className="p-4 w-16 text-center">Pos</th>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4 text-center">Missões</th>
                                    <th className="p-4 text-center">XP Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c9a688]/30">
                                {ranking.map((user, index) => (
                                    <tr key={user.profile_id} className="hover:bg-[#f1dfcf]/50 transition-colors">
                                        <td className="p-4 text-center font-bold text-[#8b4513]">
                                            {index === 0 ? <Trophy size={20} className="text-amber-500 mx-auto" /> :
                                                index === 1 ? <Trophy size={20} className="text-slate-400 mx-auto" /> :
                                                    index === 2 ? <Trophy size={20} className="text-amber-700 mx-auto" /> :
                                                        `${index + 1}º`}
                                        </td>
                                        <td className="p-4 font-medium text-[#5d2e0a]">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{user.full_name}</span>
                                                <span className="text-xs text-[#8b4513] opacity-70">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-[#5d2e0a] font-bold">
                                            {user.completed_missions}
                                        </td>
                                        <td className="p-4 text-center text-emerald-600 font-black">
                                            {user.total_xp} XP
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {ranking.length === 0 && !loading && (
                        <div className="text-center py-20 text-[#8b4513]/50 font-medium">
                            Nenhum usuário pontuou ainda.
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-[#fdfaf7] w-full max-w-md rounded-3xl shadow-2xl p-6 border-4 border-[#e6d0b3] animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-[#5d2e0a]">
                            {editingId ? 'Editar Missão' : 'Nova Missão'}
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-[#8b4513] hover:bg-[#f1dfcf] p-2 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Título da Missão</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                                placeholder="Ex: Passeio Matinal"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Descrição</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                                rows={3}
                                placeholder="Descreva o que o usuário deve fazer..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Recompensa (XP)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.xp_reward}
                                    onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                    className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Recompensa (Moedas)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.coin_reward}
                                    onChange={e => setFormData({ ...formData, coin_reward: parseInt(e.target.value) })}
                                    className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                            >
                                <option value="daily">Diária (Repetível)</option>
                                <option value="one_time">Única (Conquista)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#8b4513] mb-1 uppercase">Link de Ação (Opcional)</label>
                            <input
                                type="text"
                                value={formData.action_link}
                                onChange={e => setFormData({ ...formData, action_link: e.target.value })}
                                className="w-full bg-white border-2 border-[#e6d0b3] rounded-xl px-4 py-2 text-[#5d2e0a] font-medium focus:border-[#55a630] focus:ring-4 focus:ring-[#55a630]/20 outline-none transition-all"
                                placeholder="/mapa"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#55a630] text-white font-black py-4 rounded-xl shadow-lg hover:translate-y-[-2px] hover:shadow-xl active:translate-y-[0px] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <Save size={20} />
                            Salvar Missão
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
);
};

export default AdminMissions;
