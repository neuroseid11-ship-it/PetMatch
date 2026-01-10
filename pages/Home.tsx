
import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Heart, ChevronRight, ChevronLeft, MessageSquare,
  X, Send, CheckCircle, ShieldCheck, Star, User, Camera, Calendar,
  Clock, AlertTriangle, Megaphone, ArrowRight
} from 'lucide-react';
import { petService } from '../services/petService';
import { eventService } from '../services/eventService';
import { noticeService } from '../services/noticeService';
import { mapService } from '../services/mapService';
import { RegisteredPet, PlatformEvent, MuralPost, MapPoint } from '../types';
import { Link } from 'react-router-dom';
import HealthCard from '../components/HealthCard';

const Home: React.FC = () => {
  const [pets, setPets] = useState<RegisteredPet[]>([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [muralPosts, setMuralPosts] = useState<MuralPost[]>([]);
  const [lostPets, setLostPets] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const muralScrollRef = useRef<HTMLDivElement>(null);
  const lostScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Carrega dados essenciais/rápidos primeiro para desbloquear a UI
      const allPets = await petService.getAll();
      setPets(allPets);
      setEvents(eventService.getAll());
      setMuralPosts(noticeService.getAll());
      setLoading(false); // Desbloqueia a tela imediatamente

      // 2. Carrega dados do mapa (Supabase) em "segundo plano"
      try {
        const mapPoints = await mapService.getAll();
        setLostPets(mapPoints.filter(p => p.type === 'perdido'));
      } catch (error) {
        console.error("Erro ao carregar pets perdidos:", error);
      }
    };

    fetchInitialData();
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'L' | 'R') => {
    if (ref.current) {
      const move = direction === 'L' ? -300 : 300;
      ref.current.scrollBy({ left: move, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="py-20 text-center font-black text-[#5d2e0a]">Buscando amigos...</div>;

  const currentPet = pets[currentPetIndex];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">

      {/* SEÇÃO MATCH DE PETS (ESTILO PIPOCA) */}
      {currentPet && (
        <section className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Esquerda: Foto e Personalidade */}
            <div className="lg:col-span-8 space-y-6">
              <div className="relative group">
                <Link to={`/pet/${currentPet.id}`} className="wood-panel p-2 rounded-[40px] border-4 border-[#c9a688] shadow-2xl aspect-video overflow-hidden bg-white/40 block cursor-pointer hover:opacity-95 transition-opacity">
                  <img src={currentPet.images[0]} className="w-full h-full object-cover rounded-[32px]" alt="" />
                </Link>

                <button
                  onClick={() => setCurrentPetIndex(prev => (prev - 1 + pets.length) % pets.length)}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 wood-panel p-4 rounded-full border-4 border-[#c9a688] shadow-xl hover:scale-110 transition-transform bg-[#f1dfcf]"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={() => setCurrentPetIndex(prev => (prev + 1) % pets.length)}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 wood-panel p-4 rounded-full border-4 border-[#c9a688] shadow-xl hover:scale-110 transition-transform bg-[#f1dfcf]"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              <div className="wood-panel p-6 rounded-3xl border-4 border-[#c9a688] flex items-center gap-6 shadow-xl bg-[#fdfaf7]/80">
                <div className="w-16 h-16 wood-inner flex items-center justify-center border-2 border-[#c9a688] bg-white/50 rounded-2xl">
                  <img src="https://cdn-icons-png.flaticon.com/512/3588/3588265.png" className="w-10 h-10" alt="" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60">Personalidade</p>
                  <h3 className="text-3xl font-black text-[#5d2e0a] uppercase">{currentPet.personality}</h3>
                  <p className="text-xs text-[#8b4513] font-bold italic">{currentPet.personalityDesc}</p>
                </div>
              </div>

              <div className="px-4">
                <h2 className="text-3xl font-black text-[#5d2e0a]">A História do {currentPet.name}</h2>
                <div className="text-[#5d2e0a] font-medium leading-relaxed italic mt-4 space-y-4">
                  {currentPet.story?.map((s, i) => <p key={i}>{s}</p>)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <HealthCard label="VACINADO" status={currentPet.health?.vacinado || 'Sim'} />
                <HealthCard label="CASTRADO" status={currentPet.health?.castrado || 'Sim'} />
                <HealthCard label="VERMIFUGADO" status={currentPet.health?.vermifugado || 'Sim'} />
                <HealthCard label="PORTE" status={currentPet.health?.porte || 'Médio'} />
              </div>
            </div>

            {/* Direita: Ação e Responsável */}
            <div className="lg:col-span-4 space-y-6">
              <div className="wood-panel p-10 rounded-[45px] border-4 border-[#c9a688] shadow-2xl space-y-6 bg-[#fdf5ed] text-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60">Taxa de Adoção</p>
                  <h2 className="text-5xl font-black text-[#5d2e0a]">Gratuita</h2>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full grass-bg py-5 rounded-[22px] text-white font-black text-xl shadow-xl hover:translate-y-[-2px] transition-transform border-b-8 border-[#3d7a22] flex items-center justify-center gap-3"
                >
                  Quero Adotar <MessageSquare size={24} />
                </button>

                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full wood-panel bg-[#f1dfcf] py-4 rounded-[22px] text-[#5d2e0a] font-black text-lg shadow-md border-b-4 border-[#c9a688] flex items-center justify-center gap-3 hover:bg-[#e6cbb3] transition-all"
                >
                  Agendar Visita <Calendar size={20} />
                </button>

                <div className="pt-4 border-t-2 border-[#c9a688]/30 flex items-center justify-center gap-2">
                  <ShieldCheck className="text-[#55a630]" size={16} />
                  <p className="text-[10px] font-bold text-[#8b4513] uppercase">Processo verificado PetMatch</p>
                </div>
              </div>

              <div className="wood-panel p-6 rounded-3xl border-4 border-[#c9a688] shadow-xl cursor-pointer group bg-white/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 wood-inner flex items-center justify-center border-2 border-[#c9a688] bg-white rounded-2xl">
                      <User size={24} className="text-[#8b4513]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[#8b4513] uppercase opacity-60">Responsável</p>
                      <h4 className="text-lg font-black text-[#5d2e0a]">{currentPet.shelter}</h4>
                      <div className="flex items-center gap-1 text-[#cd7f32]">
                        <Star size={12} className="fill-[#cd7f32]" />
                        <span className="text-[10px] font-black">4.9 (128 avaliações)</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-[#c9a688] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PRÓXIMOS EVENTOS */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-3">
            <Calendar size={32} className="text-[#55a630]" /> Próximos Eventos
          </h2>
          <Link to="/eventos" className="text-xs font-black text-[#55a630] uppercase bg-[#f1dfcf] px-4 py-2 rounded-xl border-2 border-[#c9a688] hover:underline">Agenda Completa</Link>
        </div>

        <div className="wood-panel p-6 rounded-[40px] border-4 border-[#c9a688] shadow-xl bg-[#e6cbb3] relative overflow-visible">
          <button onClick={() => scroll(eventsScrollRef, 'L')} className="absolute left-[-20px] top-1/2 -translate-y-1/2 wood-panel p-2 rounded-full border-2 border-[#c9a688] z-20"><ChevronLeft /></button>
          <button onClick={() => scroll(eventsScrollRef, 'R')} className="absolute right-[-20px] top-1/2 -translate-y-1/2 wood-panel p-2 rounded-full border-2 border-[#c9a688] z-20"><ChevronRight /></button>

          <div ref={eventsScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-2">
            {events.map(event => (
              <div key={event.id} className="flex-shrink-0 w-[300px] wood-inner border-2 border-[#c9a688] shadow-lg overflow-hidden group">
                <img src={event.imageUrl} className="h-36 w-full object-cover group-hover:scale-105 transition-transform" alt="" />
                <div className="p-4 bg-white/60">
                  <h4 className="font-black text-sm text-[#5d2e0a] uppercase truncate">{event.title}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[#8b4513] mt-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MURAL DA REDE */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-3">
            <Camera size={32} className="text-[#55a630]" /> Mural da Rede
          </h2>
          <Link to="/mural" className="text-xs font-black text-[#55a630] uppercase bg-[#f1dfcf] px-4 py-2 rounded-xl border-2 border-[#c9a688] hover:underline">Ver Tudo</Link>
        </div>

        <div className="wood-panel p-6 rounded-[40px] border-4 border-[#c9a688] shadow-xl bg-[#e6cbb3] relative overflow-visible">
          <button onClick={() => scroll(muralScrollRef, 'L')} className="absolute left-[-20px] top-1/2 -translate-y-1/2 wood-panel p-2 rounded-full border-2 border-[#c9a688] z-20"><ChevronLeft /></button>
          <button onClick={() => scroll(muralScrollRef, 'R')} className="absolute right-[-20px] top-1/2 -translate-y-1/2 wood-panel p-2 rounded-full border-2 border-[#c9a688] z-20"><ChevronRight /></button>

          <div ref={muralScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-2">
            {muralPosts.map(post => (
              <div key={post.id} className="flex-shrink-0 w-[250px] wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-lg bg-white">
                <img src={post.imageUrl} className="w-full aspect-square object-cover" alt="" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={post.userAvatar} className="w-6 h-6 rounded-full border" alt="" />
                    <span className="text-[10px] font-black uppercase">{post.userName}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#5d2e0a] line-clamp-2">{post.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALERTA SOLIDÁRIO */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-3xl font-black text-[#5d2e0a] uppercase">Alerta Solidário</h2>
          </div>
          <div className="flex gap-3">
            <Link to="/mapa?alert=lost" className="wood-panel px-6 py-3 rounded-2xl text-red-600 font-black text-xs border-red-600 border-2 hover:bg-red-50 flex items-center gap-2">
              <Megaphone size={16} /> PERDI MEU PET
            </Link>

          </div>
        </div>

        <div className="wood-panel p-6 rounded-[40px] border-4 border-[#c9a688] shadow-xl bg-[#e6cbb3] relative overflow-visible">
          <div ref={lostScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar px-2">
            {lostPets.map(pet => (
              <div key={pet.id} className="flex-shrink-0 w-[240px] wood-panel rounded-[32px] border-2 border-red-500 bg-white overflow-hidden shadow-lg">
                <div className="aspect-square relative overflow-hidden border-b-2 border-red-100">
                  <img src={pet.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-red-600 text-red-600 px-2 py-1 font-black text-xl uppercase -rotate-12 bg-white/10 backdrop-blur-[1px]">PROCURA-SE</div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-[11px] font-black text-[#5d2e0a] uppercase">{pet.name}</h4>
                  <Link to="/mapa" className="w-full wood-inner bg-red-50 py-2 rounded-lg text-[8px] font-black text-red-600 border border-red-200 flex items-center justify-center gap-1">
                    VER NO MAPA <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            ))}
            {lostPets.length === 0 && <p className="w-full py-10 text-center text-[#5d2e0a] font-bold italic opacity-60">Nenhum pet perdido registrado recentemente.</p>}
          </div>
        </div>
      </section>

      {/* Modal Adoção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            {isSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce"><CheckCircle className="text-white" size={40} /></div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Interesse Enviado!</h2>
                <p className="text-[#8b4513] font-medium italic">O responsável entrará em contato em breve.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={currentPet?.images?.[0]} className="w-20 h-20 rounded-[24px] border-2 border-[#c9a688] object-cover" alt="" />
                  <h2 className="text-2xl font-black text-[#5d2e0a]">Quero Adotar o {currentPet?.name}</h2>
                </div>
                <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Olá! Tenho interesse em adotar o ${currentPet?.name}...`} className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] outline-none" />
                <button onClick={() => { setIsSent(true); setTimeout(() => { setIsModalOpen(false); setIsSent(false); }, 2000); }} className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-3">Enviar Interesse <Send size={20} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};



export default Home;
