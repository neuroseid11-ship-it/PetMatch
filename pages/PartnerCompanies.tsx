
import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, MapPin, Phone, Mail, Instagram,
  Send, CheckCircle, Star, Tag, ArrowRight,
  Info, ShoppingBag, Map as MapIcon, ChevronRight,
  ChevronLeft, MessageSquare, ShieldCheck, Search, Clock,
  Stethoscope, Store, Sparkles, Filter, X
} from 'lucide-react';
import { partnerService } from '../services/partnerService';
import { messageService } from '../services/messageService';
import { PartnerCompany } from '../types';

const PartnerCompanies: React.FC = () => {
  const [allPartners, setAllPartners] = useState<PartnerCompany[]>([]);
  const [activePartner, setActivePartner] = useState<PartnerCompany | null>(null);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PartnerCompany['category']>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [only24h, setOnly24h] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      const data = await partnerService.getAll();
      setAllPartners(data);
      if (data.length > 0) setActivePartner(data[0]);
    };
    fetchPartners();
  }, []);

  // Lógica de Filtragem
  const filteredPartners = useMemo(() => {
    return allPartners.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.about.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || p.neighborhood === locationFilter;
      const matches24h = !only24h || p.is24h;

      return matchesSearch && matchesCategory && matchesLocation && matches24h;
    });
  }, [allPartners, searchTerm, categoryFilter, locationFilter, only24h]);

  // Sincroniza o parceiro ativo se ele sumir do filtro
  useEffect(() => {
    if (filteredPartners.length > 0) {
      if (!activePartner || !filteredPartners.some(p => p.id === activePartner.id)) {
        setActivePartner(filteredPartners[0]);
      }
    } else {
      setActivePartner(null);
    }
  }, [filteredPartners, activePartner]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activePartner) {
      messageService.send({
        petId: `partner-${activePartner.id}`,
        petName: activePartner.name,
        petImage: activePartner.logoUrl,
        userName: 'Visitante Logado',
        userEmail: 'visitante@exemplo.com',
        message: message,
        type: 'direct_contact'
      });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setMessage('');
      }, 3000);
    }
  };

  const neighborhoods = useMemo(() => {
    const set = new Set(allPartners.map(p => p.neighborhood));
    return Array.from(set).sort();
  }, [allPartners]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER: Título e Seletor de Perfis à Direita */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#5d2e0a] flex items-center gap-3">
            <Building2 className="text-[#55a630]" size={40} /> Empresas Parceiras
          </h1>
          <p className="text-[#8b4513] font-medium italic mt-1">Conheça os negócios que apoiam a causa animal no Distrito Federal.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 max-w-full">
          {filteredPartners.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePartner(p)}
              className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl border-4 transition-all hover:scale-110 overflow-hidden shadow-lg ${activePartner?.id === p.id ? 'border-[#55a630] bg-white ring-4 ring-[#55a630]/20' : 'border-[#c9a688] grayscale opacity-60'
                }`}
              title={p.name}
            >
              <img src={p.logoUrl} className="w-full h-full object-cover" alt={p.name} />
            </button>
          ))}
        </div>
      </header>

      {/* BARRA DE FILTROS */}
      <section className="wood-panel p-4 md:p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por empresa, serviço ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:ring-2 focus:ring-[#55a630] focus:outline-none placeholder-[#8b4513]/40"
            />
            <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
          </div>

          <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border border-[#c9a688] w-full lg:w-auto overflow-x-auto no-scrollbar">
            <FilterButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} icon={<Filter size={14} />} label="Todos" />
            <FilterButton active={categoryFilter === 'clinica'} onClick={() => setCategoryFilter('clinica')} icon={<Stethoscope size={14} />} label="Clínicas" />
            <FilterButton active={categoryFilter === 'petshop'} onClick={() => setCategoryFilter('petshop')} icon={<Store size={14} />} label="Pet Shops" />
            <FilterButton active={categoryFilter === 'servico'} onClick={() => setCategoryFilter('servico')} icon={<Sparkles size={14} />} label="Serviços" />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-64">
            <MapPin size={18} className="text-red-500 flex-shrink-0" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full wood-inner px-4 py-3 border border-[#c9a688] text-[10px] font-black uppercase text-[#5d2e0a] outline-none"
            >
              <option value="all">Todo o DF</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button
            onClick={() => setOnly24h(!only24h)}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-md border-b-4 ${only24h ? 'grass-bg text-white border-[#3d7a22]' : 'wood-panel text-[#5d2e0a] border-[#c9a688]'
              }`}
          >
            <Clock size={16} /> 24h
          </button>
        </div>
      </section>

      {activePartner ? (
        <>
          {/* 1. BANNER DA EMPRESA ATIVA */}
          <section className="relative h-[300px] md:h-[400px] rounded-[50px] border-4 border-[#c9a688] shadow-2xl overflow-hidden wood-panel group">
            <img
              src={activePartner.bannerUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-linear"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-2xl overflow-hidden bg-white">
                  <img src={activePartner.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#55a630] text-[10px] font-black px-3 py-1 rounded-full uppercase border border-white/20">Parceiro Verificado</span>
                    {activePartner.is24h && (
                      <span className="bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-white/20 flex items-center gap-1">
                        <Clock size={12} /> 24 Horas
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg">{activePartner.name}</h2>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section className="space-y-8">
                <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-xl relative overflow-hidden bg-[#fdfaf7]">
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-black text-[#5d2e0a] flex items-center gap-3">
                      <Info className="text-[#55a630]" /> Perfil da Empresa
                    </h3>
                    <p className="text-lg text-[#5d2e0a] font-medium leading-relaxed italic">
                      "{activePartner.about}"
                    </p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 opacity-5 rotate-12">
                    <Building2 size={160} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-[#5d2e0a] flex items-center gap-3 ml-4">
                    <Tag className="text-[#55a630]" /> Promoções e Serviços
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activePartner.promotions.map(promo => (
                      <div key={promo.id} className="wood-panel p-4 rounded-[32px] border-2 border-[#c9a688] shadow-lg group hover:translate-y-[-4px] transition-all bg-white flex flex-col">
                        <div className="relative h-40 rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                          <img src={promo.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          <div className="absolute top-3 left-3 grass-bg px-3 py-1 border-2 border-[#3d7a22] shadow-md">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{promo.discount}</span>
                          </div>
                        </div>
                        <div className="px-2 space-y-2 flex-1">
                          <h4 className="text-xl font-black text-[#5d2e0a]">{promo.title}</h4>
                          <p className="text-xs text-[#8b4513] font-medium leading-tight">{promo.description}</p>
                        </div>
                        <button className="mt-4 w-full wood-inner bg-[#f1dfcf] py-3 rounded-xl text-[10px] font-black uppercase text-[#5d2e0a] border border-[#c9a688] flex items-center justify-center gap-2 hover:bg-[#d2b48c] transition-colors">
                          Resgatar Cupom <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-black text-[#5d2e0a] flex items-center gap-3 ml-4">
                  <MapIcon className="text-[#55a630]" /> Onde nos encontrar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="wood-panel rounded-[40px] border-4 border-[#c9a688] h-64 overflow-hidden relative shadow-xl group">
                    <div
                      className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                      style={{
                        backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=-15.7938,-47.8827&zoom=14&size=600x600&scale=2&style=feature:all|element:labels|visibility:on&style=feature:landscape|color:0xf4ece0&key=')`,
                        backgroundSize: 'cover'
                      }}
                    >
                      <div className="absolute top-[45%] left-[48%] animate-bounce">
                        <div className="grass-bg p-2 rounded-xl shadow-2xl border-2 border-white">
                          <Building2 size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 wood-panel bg-white/90 backdrop-blur-sm p-3 rounded-2xl border-2 border-[#c9a688] shadow-lg flex items-start gap-3">
                      <MapPin className="text-red-500 mt-1" size={18} />
                      <p className="text-[10px] font-bold text-[#5d2e0a] leading-tight uppercase">{activePartner.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <ContactCard icon={<Phone size={24} />} label="Telefone / WhatsApp" value={activePartner.phone} />
                    <ContactCard icon={<Mail size={24} />} label="E-mail Corporativo" value={activePartner.email} />
                    <ContactCard icon={<Instagram size={24} />} label="Siga no Instagram" value={activePartner.instagram || '@petmatchdf'} />
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl space-y-6 bg-[#fdf5ed]">
                  <div className="text-center">
                    <div className="w-16 h-16 grass-bg rounded-2xl mx-auto flex items-center justify-center text-white border-2 border-[#3d7a22] shadow-lg mb-4">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-[#5d2e0a]">Fale com a Empresa</h3>
                    <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest mt-1">Dúvidas, Agendamentos ou Orçamentos</p>
                  </div>

                  {isSent ? (
                    <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
                      <CheckCircle size={48} className="text-[#55a630] mx-auto animate-bounce" />
                      <p className="text-sm font-black text-[#5d2e0a] uppercase">Mensagem Enviada!</p>
                      <p className="text-xs text-[#8b4513] font-medium italic">O parceiro responderá em breve via WhatsApp ou E-mail.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Sua Mensagem</label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={`Olá ${activePartner.name}, gostaria de saber mais sobre...`}
                          className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] focus:ring-4 focus:ring-[#55a630]/10 outline-none transition-all placeholder-[#8b4513]/20"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-transform"
                      >
                        Enviar Agora <Send size={20} />
                      </button>
                    </form>
                  )}

                  <div className="pt-6 border-t-2 border-[#c9a688]/40 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-[#55a630]" />
                    <p className="text-[10px] font-bold text-[#8b4513]">Sua mensagem é enviada de forma segura e direta.</p>
                  </div>
                </div>

                <div className="wood-panel p-6 rounded-3xl border-2 border-[#cd7f32] bg-[#fffdf0] flex items-center gap-4 group">
                  <div className="w-12 h-12 wood-inner flex items-center justify-center border border-[#cd7f32] shadow-inner group-hover:scale-110 transition-transform">
                    <ShoppingBag className="text-[#cd7f32]" size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#8b4513] uppercase opacity-60">Benefício Guardião</p>
                    <p className="text-xs font-black text-[#5d2e0a] leading-tight">Consuma produtos aqui e ganhe <span className="text-[#cd7f32]">2x PetCoins</span>!</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div className="py-20 text-center space-y-4 opacity-50">
          <Building2 size={64} className="mx-auto text-[#8b4513]" />
          <h2 className="text-2xl font-black text-[#5d2e0a]">Nenhum parceiro encontrado</h2>
          <p className="text-[#8b4513] italic">Tente mudar os filtros ou a categoria da busca.</p>
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${active ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
      }`}
  >
    {icon} {label}
  </button>
);

const ContactCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="wood-panel p-5 rounded-3xl border-2 border-[#c9a688] shadow-md flex items-center gap-4 bg-white hover:bg-[#f1dfcf] transition-colors group">
    <div className="p-3 wood-inner border border-[#c9a688] text-[#5d2e0a] group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-[8px] font-black text-[#8b4513] uppercase tracking-tighter opacity-60">{label}</p>
      <p className="text-sm font-black text-[#5d2e0a] truncate">{value}</p>
    </div>
  </div>
);

export default PartnerCompanies;
