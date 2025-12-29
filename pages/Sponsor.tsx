
import React, { useState, useEffect } from 'react';
import { 
  Heart, Filter, Search, Info, 
  Coins, TrendingUp, Users, 
  ChevronRight, Award, ShieldCheck, Inbox,
  HandHelping, MessageCircle, X, FileText, HeartHandshake, CheckCircle,
  ShoppingBag, Sparkles, ArrowUpRight
} from 'lucide-react';
import { PetSponsorship, RegisteredPet } from '../types';
import { petService } from '../services/petService';
import { useNavigate } from 'react-router-dom';

const Sponsor: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState<PetSponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState(false);
  const [isPetCoinsModalOpen, setIsPetCoinsModalOpen] = useState(false);

  useEffect(() => {
    // Carrega apenas pets para APADRINHAMENTO asynchronously
    const fetchData = async () => {
      const allPets = await petService.getAll();
      const registeredPets = allPets.filter(p => p.adoptionType === 'sponsorship');
      
      const sponsorshipPets: PetSponsorship[] = registeredPets.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        imageUrl: pet.images[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
        description: pet.personalityDesc || `Este amiguinho(a) ${pet.personality.toLowerCase()} está esperando por um anjo da guarda para ajudar em seus cuidados diários.`,
        monthlyGoal: pet.sponsorshipValue || 300, // Usa o valor cadastrado ou fallback
        currentRaised: Math.floor(Math.random() * (pet.sponsorshipValue || 300) * 0.8),
        sponsorsCount: Math.floor(Math.random() * 5),
        urgency: Math.random() > 0.7,
        sponsorshipReason: pet.sponsorshipReason
      }));

      setPets(sponsorshipPets);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredPets = pets.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.type === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Hero Header */}
      <header className="wood-panel p-10 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 grass-bg px-4 py-1.5 border-2 border-[#3d7a22] shadow-lg mb-2">
              <Award className="text-white w-4 h-4" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Programa de Apadrinhamento</span>
            </div>
            <h1 className="text-5xl font-black text-[#5d2e0a] flex items-center gap-4">
               <HandHelping className="text-[#55a630]" size={48} /> Seja o Anjo de um Pet
            </h1>
            <p className="text-[#8b4513] font-medium leading-relaxed">
              Nem todos podem adotar, mas todos podem ajudar. Apadrinhar é garantir saúde, 
              alimentação e amor para um pet que ainda aguarda um lar.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <button 
                onClick={() => setIsTransparencyModalOpen(true)}
                className="flex items-center gap-2 bg-[#f1dfcf] px-4 py-2 rounded-full border border-[#c9a688] text-xs font-bold text-[#5d2e0a] hover:bg-[#e6cbb3] transition-colors shadow-sm"
              >
                <ShieldCheck size={16} className="text-[#55a630]" /> Transparência Total
              </button>
              <button 
                onClick={() => setIsPetCoinsModalOpen(true)}
                className="flex items-center gap-2 bg-[#f1dfcf] px-4 py-2 rounded-full border border-[#c9a688] text-xs font-bold text-[#5d2e0a] hover:bg-[#e6cbb3] transition-colors shadow-sm"
              >
                <Coins size={16} className="text-[#cd7f32]" /> Ganhe PetCoins
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative group">
             <div className="absolute inset-0 grass-bg blur-3xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity"></div>
             <img 
               src="https://cdn-icons-png.flaticon.com/512/3047/3047928.png" 
               alt="Angel Pet" 
               className="w-48 h-48 drop-shadow-2xl animate-bounce duration-[3000ms]" 
             />
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border-2 border-[#c9a688] shadow-inner">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeFilter === 'all' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setActiveFilter('dog')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeFilter === 'dog' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Cães
          </button>
          <button 
            onClick={() => setActiveFilter('cat')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeFilter === 'cat' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Gatos
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border-2 border-[#c9a688] text-sm focus:outline-none focus:ring-2 focus:ring-[#55a630] text-[#5d2e0a]"
          />
          <Search className="absolute left-3 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>
      </div>

      {/* Pet Grid */}
      {loading ? (
        <div className="py-20 text-center font-black text-[#5d2e0a] text-xl">Carregando pets para apadrinhamento...</div>
      ) : filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <div key={pet.id} className="wood-panel p-3 rounded-[32px] border-2 border-[#c9a688] shadow-lg group hover:translate-y-[-4px] transition-all flex flex-col">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {pet.urgency && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-white shadow-lg animate-pulse uppercase tracking-wider">
                    Urgente
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] font-bold text-white uppercase opacity-80">{pet.breed}</p>
                  <h3 className="text-xl font-black text-white">{pet.name}</h3>
                </div>
              </div>

              <div className="px-1 space-y-4">
                <p className="text-xs text-[#8b4513] font-medium h-10 overflow-hidden line-clamp-2 italic leading-snug">
                  "{pet.description}"
                </p>
                
                {pet.sponsorshipReason && (
                   <div className="flex items-start gap-1.5 wood-inner p-2 border border-[#c9a688]/30">
                      <MessageCircle size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold text-[#8b4513] leading-tight italic line-clamp-2">
                         Destinado a: {pet.sponsorshipReason}
                      </p>
                   </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-[#8b4513]">Meta do Mês</span>
                    <span className="text-[#5d2e0a]">R$ {pet.currentRaised} / R$ {pet.monthlyGoal}</span>
                  </div>
                  <div className="w-full bg-[#f1dfcf] h-2 rounded-full border border-[#c9a688] overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-1000" 
                      style={{ width: `${Math.min((pet.currentRaised / pet.monthlyGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black text-[#8b4513]">
                  <div className="flex items-center gap-1">
                    <Users size={12} /> {pet.sponsorsCount} Padrinhos
                  </div>
                  <div className="flex items-center gap-1 text-[#55a630]">
                    <TrendingUp size={12} /> +100 PC/mês
                  </div>
                </div>

                <button className="w-full bg-blue-600 py-3 rounded-xl text-white font-black text-sm shadow-md hover:scale-[1.02] transition-transform border-b-4 border-blue-800 flex items-center justify-center gap-2">
                  Apadrinhar Agora <Heart size={16} className="fill-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 opacity-50">
          <HandHelping size={64} className="mx-auto text-[#8b4513]" />
          <h2 className="text-2xl font-black text-[#5d2e0a]">Nenhum pet para apadrinhamento</h2>
          <p className="text-[#8b4513] italic">No momento, todos os nossos amiguinhos estão sendo cuidados. Volte mais tarde!</p>
        </div>
      )}

      {/* How it works banner */}
      <section className="wood-inner p-8 border-2 border-[#c9a688] border-dashed rounded-[32px] grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 wood-panel rounded-full mx-auto flex items-center justify-center text-[#5d2e0a]">
            <Award size={24} />
          </div>
          <h4 className="font-black text-[#5d2e0a]">Escolha um valor</h4>
          <p className="text-xs text-[#8b4513] font-medium leading-relaxed">Você decide quanto quer doar mensalmente. A partir de R$ 10 você já faz a diferença!</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 wood-panel rounded-full mx-auto flex items-center justify-center text-[#5d2e0a]">
            <TrendingUp size={24} />
          </div>
          <h4 className="font-black text-[#5d2e0a]">Acompanhe de perto</h4>
          <p className="text-xs text-[#8b4513] font-medium leading-relaxed">Receba fotos e atualizações exclusivas sobre a saúde e o bem-estar do seu afilhado.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 wood-panel rounded-full mx-auto flex items-center justify-center text-[#5d2e0a]">
            <Heart size={24} />
          </div>
          <h4 className="font-black text-[#5d2e0a]">Visite seu afilhado</h4>
          <p className="text-xs text-[#8b4513] font-medium leading-relaxed">Padrinhos têm acesso prioritário para visitar e passear com seus pets nos abrigos parceiros.</p>
        </div>
      </section>

      {/* POPUP: TRANSPARÊNCIA TOTAL */}
      {isTransparencyModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsTransparencyModalOpen(false)} 
              className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl">
                <ShieldCheck className="text-white" size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">Compromisso com a Transparência</h2>
              
              <div className="space-y-6 text-left">
                <div className="flex gap-4">
                  <div className="w-10 h-10 wood-inner flex-shrink-0 flex items-center justify-center text-[#55a630] border border-[#c9a688]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#5d2e0a] uppercase">Prestação de Contas</h4>
                    <p className="text-xs text-[#8b4513] font-medium leading-relaxed">
                      Todo valor arrecadado é destinado ao pet. As notas fiscais de ração, medicamentos e clínicas são anexadas ao histórico de saúde do animal para conferência.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 wood-inner flex-shrink-0 flex items-center justify-center text-[#cd7f32] border border-[#c9a688]">
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#5d2e0a] uppercase">Lucro Zero</h4>
                    <p className="text-xs text-[#8b4513] font-medium leading-relaxed">
                      A plataforma PetMatch DF não retém nenhuma porcentagem sobre os valores de apadrinhamento. Somos uma ponte gratuita entre doadores e protetores.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 wood-inner flex-shrink-0 flex items-center justify-center text-blue-500 border border-[#c9a688]">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#5d2e0a] uppercase">Processo Auditado</h4>
                    <p className="text-xs text-[#8b4513] font-medium leading-relaxed">
                      As ONGs parceiras concordam com auditorias regulares dos comprovantes para garantir que seu investimento chegue onde realmente importa.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsTransparencyModalOpen(false)}
                className="w-full grass-bg py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:translate-y-[-2px] transition-transform"
              >
                Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: GANHE PETCOINS */}
      {isPetCoinsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsPetCoinsModalOpen(false)} 
              className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl">
                <Coins className="text-white" size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">Economia Solidária</h2>
              
              <div className="space-y-6 text-left">
                <div className="flex gap-4">
                  <div className="w-10 h-10 wood-inner flex-shrink-0 flex items-center justify-center text-[#cd7f32] border border-[#c9a688]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#5d2e0a] uppercase">Sua Ação Gera Valor</h4>
                    <p className="text-xs text-[#8b4513] font-medium leading-relaxed">
                      Ao apadrinhar, adotar ou interagir na rede PetMatch, você acumula PetCoins como forma de reconhecimento pelo seu impacto positivo na causa animal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 wood-inner flex-shrink-0 flex items-center justify-center text-[#55a630] border border-[#c9a688]">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#5d2e0a] uppercase">Troque por Benefícios</h4>
                    <p className="text-xs text-[#8b4513] font-medium leading-relaxed">
                      Suas PetCoins não são apenas números! Elas podem ser trocadas por produtos exclusivos em nossa loja física/virtual ou por descontos e serviços em clínicas e pet shops parceiros.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => navigate('/loja')}
                  className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-transform"
                >
                  Conhecer a Loja <ArrowUpRight size={24} />
                </button>
                <button 
                  onClick={() => setIsPetCoinsModalOpen(false)}
                  className="w-full text-xs font-black text-[#8b4513] uppercase hover:underline"
                >
                  Fechar Explicação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsor;
