
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Info, Plus, ChevronRight, 
  Search, Star, TrendingUp, History, Coins,
  Clock, Award, ShieldCheck, X, Calendar, Target, Save, FileText, MessageSquare
} from 'lucide-react';

interface LeaguePet {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  points: number;
  cost: number;
  multiplier: string;
}

const League: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPets, setSelectedPets] = useState<(LeaguePet | null)[]>([null, null, null, null, null]);
  
  // Estados do Formulário de Nova Jornada
  const [journeyForm, setJourneyForm] = useState({
    date: '',
    goals: '',
    cost: 50,
    multiplier: '1.2x',
    reason: '',
    observation: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    setIsAdmin(role === 'admin');
  }, []);

  const marketPets: LeaguePet[] = [
    { id: 'p1', name: 'Pipoca', breed: 'Vira-lata', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200', points: 125, cost: 50, multiplier: '1.2x' },
    { id: 'p2', name: 'Mel', breed: 'Golden', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200', points: 98, cost: 40, multiplier: '1.0x' },
    { id: 'p3', name: 'Oliver', breed: 'Siamês', imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=200', points: 150, cost: 60, multiplier: '1.5x' },
    { id: 'p4', name: 'Bolinha', breed: 'Poodle', imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=200', points: 85, cost: 30, multiplier: '1.0x' },
  ];

  const handleSelectPet = (pet: LeaguePet) => {
    const emptyIndex = selectedPets.findIndex(p => p === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedPets];
      newSelected[emptyIndex] = pet;
      setSelectedPets(newSelected);
    }
  };

  const handleRemovePet = (index: number) => {
    const newSelected = [...selectedPets];
    newSelected[index] = null;
    setSelectedPets(newSelected);
  };

  const handleCreateJourney = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Nova Jornada criada com sucesso e publicada para todos os guardiões!");
    setIsCreateModalOpen(false);
    setJourneyForm({ date: '', goals: '', cost: 50, multiplier: '1.2x', reason: '', observation: '' });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Banner - Alinhado conforme imagem solicitada */}
      <header className="wood-panel p-10 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative overflow-hidden bg-[#f5e7da]">
        <div className="flex flex-col lg:flex-row justify-between relative z-10">
          {/* Lado Esquerdo: Identificação e Descrição */}
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 grass-bg px-4 py-2 border-2 border-[#3d7a22] shadow-lg mb-2">
              <Trophy className="text-white w-4 h-4" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Fantasy Game Solidário</span>
            </div>
            
            <h1 className="text-6xl font-black text-[#5d2e0a] tracking-tighter">Jornada da Adoção</h1>
            
            <p className="text-[#8b4513] font-medium text-lg leading-relaxed max-w-xl">
              Escale seu time de pets! Quanto mais visibilidade e interações eles ganharem na plataforma real, mais pontos você acumula para ganhar recompensas exclusivas.
            </p>
            
            {/* Contador no canto inferior esquerdo do banner */}
            <div className="pt-8">
              <div className="wood-inner px-4 py-2.5 border border-[#c9a688] inline-flex items-center gap-2 rounded-xl shadow-inner">
                <Clock className="text-[#8b4513]" size={16} />
                <span className="text-[11px] font-black text-[#5d2e0a] uppercase">Encerra em: <span className="text-[#55a630]">2D 14H 30M</span></span>
              </div>
            </div>
          </div>
          
          {/* Lado Direito: Ações e Recompensa */}
          <div className="flex flex-col items-center lg:items-end justify-between py-2">
             <div className="flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="grass-bg px-8 py-4 rounded-2xl flex items-center gap-2 text-white font-black text-lg hover:scale-105 transition-transform shadow-xl border-b-6 border-[#3d7a22]"
                  >
                    <Plus size={20} strokeWidth={3} /> Criar Jornada
                  </button>
                )}
                <button className="wood-panel px-8 py-4 rounded-2xl flex items-center gap-2 text-[#5d2e0a] font-black text-lg hover:translate-y-[-2px] transition-transform shadow-lg bg-[#d2b48c] border-b-6 border-[#b38b6d]">
                  <Award size={22} /> Ver Ranking Global
                </button>
             </div>
             
             <div className="text-right mt-10 lg:mt-0">
                <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60 tracking-widest mb-1">Prêmio da Rodada</p>
                <div className="flex items-center justify-end gap-2 text-3xl font-black text-[#55a630]">
                   <Coins size={28} className="text-[#cd7f32]" /> 5.000 PetCoins
                </div>
             </div>
          </div>
        </div>
        
        {/* Detalhes decorativos */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#55a630]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Team Selection Slots */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-[#5d2e0a] flex items-center gap-3">
                <Users size={28} className="text-[#55a630]" /> Seu Time
                <span className="text-xs font-black bg-[#f1dfcf] px-3 py-1 rounded-full border border-[#c9a688] text-[#8b4513]">
                  {selectedPets.filter(p => p !== null).length}/5 ESCALADOS
                </span>
              </h2>
              <button className="text-xs font-bold text-[#8b4513] hover:underline uppercase flex items-center gap-1">
                Regras de Pontuação <Info size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {selectedPets.map((pet, index) => (
                <div key={index} className="group relative">
                  {pet ? (
                    <div className="wood-panel p-2 rounded-[32px] border-2 border-[#55a630] shadow-xl animate-in zoom-in-95 duration-300 overflow-hidden group">
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2">
                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemovePet(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="rotate-45" size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                           <p className="text-[10px] font-black text-white">{pet.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[#55a630]">
                          <TrendingUp size={12} />
                          <span className="text-xs font-black">{pet.points} pts</span>
                        </div>
                        <span className="text-[8px] font-bold text-[#8b4513] bg-[#f1dfcf] px-2 py-0.5 rounded border border-[#c9a688] uppercase">
                          Custo: {pet.cost} PC
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grass-bg p-1.5 rounded-[32px] shadow-lg h-full border-2 border-transparent hover:border-[#3d7a22] transition-all cursor-pointer">
                      <div className="wood-panel h-full aspect-square rounded-[26px] border-2 border-[#c9a688] flex flex-col items-center justify-center border-dashed gap-2 bg-opacity-80">
                         <div className="w-10 h-10 rounded-full bg-[#f1dfcf] flex items-center justify-center text-[#8b4513] shadow-inner">
                            <Plus size={24} />
                         </div>
                         <p className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-tighter">Escalar Pet</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Market / Transfer Area */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-black text-[#5d2e0a]">Mercado de Pets</h2>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <input 
                    type="text" 
                    placeholder="Filtrar por nome..." 
                    className="w-full wood-inner pl-10 pr-4 py-2 text-xs border border-[#c9a688] focus:outline-none"
                   />
                   <Search className="absolute left-3 top-2.5 text-[#8b4513] opacity-50" size={14} />
                </div>
                <button className="wood-panel px-4 py-2 rounded-xl text-xs font-bold text-[#5d2e0a] border border-[#c9a688]">
                   Filtros
                </button>
              </div>
            </div>

            <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
                  <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
                    <th className="px-6 py-4">Pet</th>
                    <th className="px-6 py-4">Status / Pontos</th>
                    <th className="px-6 py-4">Multiplicador</th>
                    <th className="px-6 py-4">Custo</th>
                    <th className="px-6 py-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="text-[#5d2e0a]">
                  {marketPets.map(pet => (
                    <tr key={pet.id} className="border-b border-[#c9a688] hover:bg-[#f1dfcf] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={pet.imageUrl} className="w-12 h-12 rounded-xl border border-[#c9a688] object-cover" alt={pet.name} />
                          <div>
                            <h4 className="font-black text-sm">{pet.name}</h4>
                            <p className="text-[10px] font-bold text-[#8b4513] uppercase">{pet.breed}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <div className="w-32 bg-[#e6cbb3] h-2 rounded-full overflow-hidden border border-[#c9a688]">
                              <div className="grass-bg h-full" style={{ width: `${(pet.points / 200) * 100}%` }}></div>
                           </div>
                           <span className="text-xs font-black">{pet.points} pts</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs font-black text-[#55a630] bg-[#f1dfcf] px-2 py-1 rounded border border-[#55a630]">{pet.multiplier}</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1 text-sm font-black">
                           <Coins size={14} className="text-[#cd7f32]" /> {pet.cost}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button 
                          onClick={() => handleSelectPet(pet)}
                          className="bg-[#55a630] text-white p-2 rounded-xl hover:scale-110 transition-transform shadow-md disabled:opacity-50"
                          disabled={selectedPets.filter(p => p !== null).length === 5 || selectedPets.some(p => p?.id === pet.id)}
                         >
                            <Plus size={20} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-[#8b4513] uppercase">Seus Recursos</p>
                <History className="text-[#8b4513] opacity-40 cursor-pointer" size={16} />
             </div>
             <div className="flex items-center gap-3 mb-6">
                <div className="wood-inner w-12 h-12 flex items-center justify-center border border-[#c9a688]">
                   <Coins size={28} className="text-[#cd7f32]" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-[#5d2e0a]">1.250</h2>
                   <p className="text-[10px] font-black text-[#8b4513] uppercase">PetCoins Disponíveis</p>
                </div>
             </div>
             
             <button className="w-full grass-bg py-4 rounded-2xl text-white font-black text-sm shadow-xl hover:translate-y-[-2px] transition-transform border-b-4 border-[#3d7a22] flex items-center justify-center gap-2">
                Salvar Time <ShieldCheck size={18} />
             </button>
             
             <p className="text-center text-[10px] font-bold text-[#8b4513] mt-4 italic">
                Custo total da escalação: {selectedPets.reduce((acc, p) => acc + (p?.cost || 0), 0)} PC
             </p>
          </div>

          <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] shadow-lg space-y-4">
             <h3 className="text-sm font-black text-[#5d2e0a] uppercase border-b border-[#c9a688] pb-2">Ranking de Amigos</h3>
             <div className="space-y-3">
                {[
                  { name: 'Ana Silva', points: '1.450', avatar: 'https://picsum.photos/seed/ana/50/50' },
                  { name: 'Marcos J.', points: '1.280', avatar: 'https://picsum.photos/seed/marcos/50/50' },
                  { name: 'Carla Dias', points: '1.100', avatar: 'https://picsum.photos/seed/carla/50/50' },
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-[#8b4513] w-3">{i+1}</span>
                       <img src={friend.avatar} className="w-8 h-8 rounded-full border border-[#55a630]" alt="" />
                       <span className="text-xs font-bold text-[#5d2e0a]">{friend.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#55a630]">{friend.points}</span>
                  </div>
                ))}
             </div>
             <button className="w-full text-[10px] font-black text-[#8b4513] hover:underline uppercase tracking-widest text-center pt-2">Ver Todos</button>
          </div>
        </div>
      </div>

      {/* MODAL ADMINISTRATIVO: CRIAR JORNADA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                 <h2 className="text-4xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center justify-center gap-3">
                    <Trophy size={36} className="text-[#55a630]" /> Nova Jornada
                 </h2>
                 <p className="text-[#8b4513] font-bold text-xs uppercase tracking-widest mt-1">Configurações de Rodada Administrativa</p>
              </div>

              <form onSubmit={handleCreateJourney} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4 flex items-center gap-1.5">
                          <Calendar size={12} /> Data da Rodada
                       </label>
                       <input 
                         required 
                         type="date" 
                         value={journeyForm.date}
                         onChange={e => setJourneyForm({...journeyForm, date: e.target.value})}
                         className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none focus:ring-4 focus:ring-[#55a630]/10 transition-all" 
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4 flex items-center gap-1.5">
                          <TrendingUp size={12} /> Multiplicador Global
                       </label>
                       <input 
                         required 
                         type="text" 
                         value={journeyForm.multiplier}
                         onChange={e => setJourneyForm({...journeyForm, multiplier: e.target.value})}
                         placeholder="Ex: 1.5x"
                         className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none focus:ring-4 focus:ring-[#55a630]/10" 
                       />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                       <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4 flex items-center gap-1.5">
                          <Target size={12} /> Metas da Jornada
                       </label>
                       <input 
                         required 
                         type="text" 
                         value={journeyForm.goals}
                         onChange={e => setJourneyForm({...journeyForm, goals: e.target.value})}
                         placeholder="Ex: 50 adoções, 200 compartilhamentos..."
                         className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none focus:ring-4 focus:ring-[#55a630]/10" 
                       />
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      type="submit" 
                      className="w-full grass-bg py-6 rounded-[32px] text-white font-black text-2xl shadow-2xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-4 hover:translate-y-[-2px] active:scale-95 transition-all"
                    >
                       <Save size={28} /> PUBLICAR JORNADA
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default League;
