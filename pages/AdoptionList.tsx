
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Heart, 
  ChevronRight, PlusCircle, Dog, Cat,
  Filter, MessageSquare, Edit3, X, Send,
  CheckCircle, Gift, Trash2, Plus, HandHelping, Coins, ArrowUpRight
} from 'lucide-react';
import { petService } from '../services/petService';
import { messageService } from '../services/messageService';
import { RegisteredPet } from '../types';

const AdoptionList: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<RegisteredPet[]>([]);
  const [filter, setFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Partial<RegisteredPet> | null>(null);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  // My Adoption Pets Modal
  const [isMyPetsModalOpen, setIsMyPetsModalOpen] = useState(false);
  
  // Sponsorship Popup Modal
  const [isSponsorshipListModalOpen, setIsSponsorshipListModalOpen] = useState(false);

  const userEmail = localStorage.getItem('petmatch_user_email');

  useEffect(() => {
    loadPets();
  }, []);

  // Update loadPets to be an async function to correctly handle the Promise from petService
  const loadPets = async () => {
    const registered = await petService.getAll();
    setPets(registered);
  };

  const adoptionPets = useMemo(() => pets.filter(p => p.adoptionType === 'adoption'), [pets]);
  
  const sponsorshipPets = useMemo(() => pets.filter(p => p.adoptionType === 'sponsorship'), [pets]);

  const myAdoptionPets = useMemo(() => {
    if (!userEmail) return [];
    return pets.filter(p => p.ownerEmail === userEmail);
  }, [pets, userEmail]);

  const filteredPets = adoptionPets.filter(pet => {
    const matchesFilter = filter === 'all' || pet.type === filter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      pet.name?.toLowerCase().includes(term) || 
      pet.breed?.toLowerCase().includes(term) ||
      pet.location?.toLowerCase().includes(term);
    
    return matchesFilter && matchesSearch;
  });

  const openAdoptionModal = (pet: Partial<RegisteredPet>) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
    setIsSent(false);
    setMessage('');
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedPet) {
      messageService.send({
        petId: selectedPet.id || '',
        petName: selectedPet.name || '',
        petImage: selectedPet.images?.[0] || '',
        userName: 'Visitante Logado',
        userEmail: userEmail || 'visitante@exemplo.com',
        message: message,
        type: 'interest'
      });
      setIsSent(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    }
  };

  const handleDeletePet = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este anúncio permanentemente?')) {
      await petService.delete(id);
      loadPets();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
        <div className="flex items-center gap-3">
          <Gift className="text-[#55a630] flex-shrink-0" size={32} />
          <div>
            <h1 className="text-3xl font-black text-[#5d2e0a] tracking-tight leading-none">Encontre seu Melhor Amigo</h1>
            <p className="text-[#8b4513] text-sm font-medium italic mt-1">Animais disponíveis para doação e adoção responsável no DF.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsMyPetsModalOpen(true)}
            className="w-full sm:w-auto wood-panel px-6 py-4 rounded-2xl text-[#5d2e0a] font-black text-xs border-2 border-[#c9a688] flex items-center justify-center gap-2 hover:bg-[#d2b48c] transition-all shadow-md"
          >
            MEUS PETS PARA ADOÇÃO ({myAdoptionPets.length})
          </button>

          <button 
            onClick={() => setIsSponsorshipListModalOpen(true)}
            className="w-full sm:w-auto wood-panel px-6 py-4 rounded-2xl text-[#5d2e0a] font-black text-xs border-2 border-[#c9a688] flex items-center justify-center gap-2 hover:bg-[#d2b48c] transition-all shadow-md"
          >
            <HandHelping size={16} className="text-[#3b82f6]" /> APADRINHAR UM PET
          </button>
          
          {/* Botão Anunciar Pet - Estilizado conforme imagem de referência */}
          <Link 
            to="/cadastrar" 
            className="w-full sm:w-auto grass-bg px-8 py-4 rounded-[24px] text-white shadow-xl hover:scale-105 transition-all border-b-6 border-[#3d7a22] flex items-center justify-center gap-4 relative overflow-hidden group min-w-[180px]"
          >
            <div className="absolute inset-y-0 left-8 border-l border-white/20 border-dashed"></div>
            <div className="absolute inset-y-0 right-14 border-l border-white/20 border-dashed"></div>
            
            <span className="text-lg font-black tracking-tighter leading-none relative z-10">Anunciar Pet</span>
            
            <div className="relative z-10 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md bg-white/10 group-hover:bg-white/20 transition-colors">
              <Plus size={18} strokeWidth={4} />
            </div>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Buscar por nome, raça ou localização..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:ring-2 focus:ring-[#55a630] focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>

        <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border border-[#c9a688] w-full lg:w-auto overflow-x-auto no-scrollbar">
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')} 
            icon={<Filter size={16} />} 
            label="Todos" 
          />
          <FilterButton 
            active={filter === 'dog'} 
            onClick={() => setFilter('dog')} 
            icon={<Dog size={16} />} 
            label="Cães" 
          />
          <FilterButton 
            active={filter === 'cat'} 
            onClick={() => setFilter('cat')} 
            icon={<Cat size={16} />} 
            label="Gatos" 
          />
        </div>
      </div>

      {/* Grid of Pets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="wood-panel p-3 rounded-[32px] border-2 border-[#c9a688] shadow-xl group hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
              <img 
                src={pet.images[0]} 
                alt={pet.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
                <Link 
                  to={`/editar/${pet.id}`}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-[#5d2e0a] hover:border-[#5d2e0a] transition-all"
                  title="Editar Pet"
                >
                  <Edit3 size={18} />
                </Link>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-600 transition-all">
                  <Heart size={20} />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
                 <div className="grass-bg px-3 py-1 border-2 border-[#3d7a22] inline-block shadow-lg">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">{pet.personality}</span>
                 </div>
              </div>
            </div>

            <div className="px-2 pb-2 space-y-3 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-[#5d2e0a]">{pet.name}</h3>
                  <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-tighter">{pet.breed}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#55a630] uppercase">Doação</p>
                  <p className="text-[10px] font-bold text-[#8b4513]">{pet.age}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#8b4513]">
                <MapPin size={14} className="text-red-500" /> {pet.location}
              </div>

              <div className="mt-auto pt-2 space-y-2">
                <button 
                  onClick={() => openAdoptionModal(pet)}
                  className="w-full grass-bg py-3 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md border-b-4 border-[#3d7a22]"
                >
                  Quero Adotar <MessageSquare size={14} />
                </button>
                <Link 
                  to={`/pet/${pet.id}`}
                  className="w-full wood-inner bg-[#d2b48c] py-2 rounded-xl text-[#5d2e0a] font-bold text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border border-[#b38b6d]"
                >
                  Ver Detalhes <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredPets.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="wood-inner p-12 max-w-md mx-auto border-2 border-dashed border-[#c9a688]">
                <Gift size={48} className="mx-auto text-[#8b4513] opacity-20 mb-4" />
                <h3 className="text-xl font-black text-[#5d2e0a]">Nenhum pet para doação no momento</h3>
                <p className="text-sm text-[#8b4513] mt-2">Confira mais tarde ou mude os filtros de busca.</p>
             </div>
          </div>
        )}
      </div>

      {/* POPUP: PETS PARA APADRINHAMENTO */}
      {isSponsorshipListModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="wood-panel w-full max-w-6xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsSponsorshipListModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md z-10"><X size={32}/></button>
              
              <div className="text-center mb-10 space-y-2">
                 <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl mx-auto flex items-center justify-center text-white border-2 border-blue-700 shadow-lg">
                    <HandHelping size={32} />
                 </div>
                 <h2 className="text-4xl font-black text-[#5d2e0a] uppercase tracking-tighter">Pets para Apadrinhar</h2>
                 <p className="text-[#8b4513] font-bold text-sm italic">Seja o anjo da guarda que garante saúde e amor para quem ainda não tem um lar.</p>
              </div>

              {sponsorshipPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {sponsorshipPets.map(pet => (
                     <div key={pet.id} className="wood-panel p-3 rounded-[32px] border-2 border-[#c9a688] bg-white shadow-lg group hover:translate-y-[-4px] transition-all flex flex-col">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                           <img src={pet.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={pet.name} />
                           <div className="absolute top-2 right-2">
                              <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-white uppercase tracking-widest">
                                 Apadrinhar
                              </div>
                           </div>
                        </div>
                        <div className="px-1 space-y-3 flex-1 flex flex-col">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h4 className="text-xl font-black text-[#5d2e0a]">{pet.name}</h4>
                                 <p className="text-[9px] font-bold text-[#8b4513] uppercase opacity-70">{pet.breed}</p>
                              </div>
                              <div className="flex items-center gap-1 text-sm font-black text-blue-600">
                                 <Coins size={14} className="text-[#cd7f32]" /> {pet.sponsorshipValue}
                              </div>
                           </div>
                           
                           <p className="text-[10px] text-[#5d2e0a] font-medium leading-relaxed italic line-clamp-3 bg-[#fdf5ed] p-2 rounded-xl border border-blue-100 flex-1">
                              "{pet.sponsorshipReason || pet.personalityDesc}"
                           </p>
                           
                           <button 
                             onClick={() => { setIsSponsorshipListModalOpen(false); navigate(`/pet/${pet.id}`); }}
                             className="w-full bg-blue-600 py-3 rounded-xl text-white font-black text-[10px] uppercase shadow-md hover:brightness-110 flex items-center justify-center gap-2 border-b-4 border-blue-800"
                           >
                              Ver Perfil do Afilhado <ArrowUpRight size={14} />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-6 opacity-40">
                   <div className="w-24 h-24 wood-inner border-4 border-dashed border-[#c9a688] rounded-full mx-auto flex items-center justify-center">
                      <Heart size={48} className="text-[#8b4513]" />
                   </div>
                   <h3 className="text-xl font-black text-[#5d2e0a]">Nenhum pet para apadrinhamento no momento.</h3>
                </div>
              )}
           </div>
        </div>
      )}

      {/* MODAL: MEUS PETS PARA ADOÇÃO */}
      {isMyPetsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="wood-panel w-full max-w-5xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsMyPetsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={32} /></button>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b-4 border-[#c9a688]/30 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="grass-bg p-3 rounded-2xl text-white shadow-lg">
                       <Gift size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-[#5d2e0a] uppercase tracking-tighter">Minhas Publicações</h2>
                 </div>
                 <Link 
                  to="/cadastrar"
                  className="grass-bg px-8 py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:scale-105 transition-all flex items-center gap-2"
                 >
                   <Plus size={24} /> Cadastrar Pet para Adoção
                 </Link>
              </div>

              {myAdoptionPets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAdoptionPets.map(pet => (
                    <div key={pet.id} className="wood-panel p-4 rounded-[32px] border-2 border-[#c9a688] shadow-md bg-white group flex flex-col">
                       <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                          <img src={pet.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={pet.name} />
                          <div className="absolute top-2 right-2 flex gap-2">
                             <span className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase shadow-sm ${
                               pet.adoptionType === 'adoption' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                             }`}>
                                {pet.adoptionType === 'adoption' ? 'Adoção' : 'Apadrinhar'}
                             </span>
                          </div>
                       </div>
                       <div className="px-2 space-y-2 flex-1">
                          <h4 className="text-xl font-black text-[#5d2e0a]">{pet.name}</h4>
                          <p className="text-[10px] font-bold text-[#8b4513] uppercase">{pet.breed} • {pet.age}</p>
                          <p className="text-[10px] text-[#55a630] font-black flex items-center gap-1 uppercase">
                             <Heart size={10} fill="currentColor" /> {pet.personality}
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#c9a688]/20">
                          <button 
                            onClick={() => { setIsMyPetsModalOpen(false); navigate(`/editar/${pet.id}`); }}
                            className="wood-panel bg-[#f1dfcf] py-2 rounded-xl text-[10px] font-black uppercase text-[#5d2e0a] border border-[#c9a688] flex items-center justify-center gap-1 hover:bg-[#d2b48c] transition-all"
                          >
                             <Edit3 size={14} /> Editar
                          </button>
                          <button 
                            onClick={() => handleDeletePet(pet.id)}
                            className="wood-panel bg-red-50 py-2 rounded-xl text-[10px] font-black uppercase text-red-600 border border-red-200 flex items-center justify-center gap-1 hover:bg-red-100 transition-all"
                          >
                             <Trash2 size={14} /> Excluir
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-6 opacity-40">
                   <div className="w-24 h-24 wood-inner border-4 border-dashed border-[#c9a688] rounded-full mx-auto flex items-center justify-center">
                      <Dog size={48} className="text-[#8b4513]" />
                   </div>
                   <h3 className="text-xl font-black text-[#5d2e0a]">Você não tem anúncios cadastrados.</h3>
                   <p className="text-sm font-bold text-[#8b4513] max-w-md mx-auto">Comece agora e ajude um amiguinho a encontrar um lar!</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Adoption Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"
            >
              <X size={24} />
            </button>

            {isSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Interesse Enviado!</h2>
                <p className="text-[#8b4513] font-medium italic">O responsável pelo {selectedPet?.name} entrará em contato em breve.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-[24px] border-2 border-[#c9a688] overflow-hidden">
                    <img src={selectedPet?.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#5d2e0a]">Quero Adotar o {selectedPet?.name}</h2>
                    <p className="text-[#8b4513] text-sm font-bold uppercase">{selectedPet?.breed}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Sua Mensagem</label>
                    <textarea 
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Olá! Tenho muito interesse em dar um novo lar para o ${selectedPet?.name}...`}
                      className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    Enviar Interesse <Send size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
      active ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
    }`}
  >
    {icon} {label}
  </button>
);

export default AdoptionList;
