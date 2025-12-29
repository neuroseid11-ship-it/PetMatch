
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Heart, Share2, Play, ShieldCheck, 
  ChevronRight, MessageSquare, Info, 
  Stethoscope, Scissors, Pill, Maximize2, X, Send, CheckCircle, ArrowLeft,
  Calendar, Clock, Building2, Coins, MessageCircle, Package
} from 'lucide-react';
import { petService } from '../services/petService';
import { messageService } from '../services/messageService';
import { ongService } from '../services/ongService';
import { RegisteredPet, ONG } from '../types';

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<RegisteredPet | null>(null);
  const [responsibleONG, setResponsibleONG] = useState<ONG | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    // Correctly await asynchronous service calls within an async function
    const fetchPet = async () => {
      if (id) {
        const data = await petService.getById(id);
        if (data) {
          setPet(data);
          if (data.ongId) {
            const ong = ongService.getById(data.ongId);
            if (ong) setResponsibleONG(ong);
          }
        } else {
          navigate('/adocao');
        }
      }
    };
    fetchPet();
  }, [id, navigate]);

  const handleSendMessage = () => {
    if (message.trim() && pet) {
      messageService.send({
        petId: pet.id,
        petName: pet.name,
        petImage: pet.images[0],
        userName: 'Visitante Logado',
        userEmail: 'visitante@exemplo.com',
        message: message,
        type: pet.adoptionType === 'sponsorship' ? 'direct_contact' : 'interest'
      });
      setIsSent(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSent(false);
      }, 2000);
    }
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleDate && scheduleTime && pet) {
      messageService.send({
        petId: pet.id,
        petName: pet.name,
        petImage: pet.images[0],
        userName: 'Visitante Logado',
        userEmail: 'visitante@exemplo.com',
        message: `Visita agendada para ${scheduleDate} às ${scheduleTime}.`,
        type: 'visit',
        visitDate: scheduleDate,
        visitTime: scheduleTime
      });
      setIsScheduled(true);
      setTimeout(() => {
        setIsScheduleModalOpen(false);
        setIsScheduled(false);
      }, 2500);
    }
  };

  if (!pet) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <nav className="text-[10px] font-bold text-[#8b4513] uppercase flex items-center gap-2 opacity-70">
          <Link to={pet.adoptionType === 'sponsorship' ? "/apadrinhar" : "/adocao"} className="hover:text-[#55a630]">
            {pet.adoptionType === 'sponsorship' ? 'Apadrinhamento' : 'Adoção'}
          </Link> 
          <ChevronRight size={10} />
          <span className="text-[#5d2e0a]">{pet.name}</span>
        </nav>
        <button onClick={() => navigate(-1)} className="wood-panel px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-[#5d2e0a] hover:bg-[#d2b48c]">
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-5xl font-black text-[#5d2e0a] leading-tight">{pet.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-[#8b4513]">
            <span className="flex items-center gap-1"><MapPin size={16} className="text-red-500" /> {pet.location}</span>
            <span className="opacity-40">•</span>
            <span>{pet.breed}</span>
            <span className="opacity-40">•</span>
            <span>{pet.age}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="wood-panel px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-[#5d2e0a] hover:bg-[#d2b48c]"><Share2 size={16} /></button>
          <button className="wood-panel px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-[#5d2e0a] hover:bg-[#d2b48c]"><Heart size={16} className="text-red-500" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="wood-panel p-2 rounded-3xl border-4 border-[#c9a688] overflow-hidden group">
            <img src={pet.images[0]} className="w-full h-[500px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700" alt="" />
          </div>

          {responsibleONG && (
            <div className="wood-panel p-6 rounded-3xl border-2 border-[#ff6b6b] bg-[#fff5f5] flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/mapa')}>
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-[#ff6b6b] flex items-center justify-center border-2 border-red-700 shadow-lg rounded-2xl animate-pulse">
                    <Building2 className="text-white" size={32} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Este pet está sob os coordenadas da</p>
                   <h3 className="text-2xl font-black text-[#5d2e0a] mt-1">{responsibleONG.name}</h3>
                   <p className="text-xs text-red-600 font-bold flex items-center gap-1"><MapPin size={12}/> Clique para ver localização no mapa</p>
                 </div>
               </div>
               <ChevronRight className="text-red-400 group-hover:translate-x-2 transition-transform" />
            </div>
          )}

          <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] bg-[#fdfaf7]">
             <div className="flex items-start gap-6">
               <div className="w-16 h-16 grass-bg flex items-center justify-center border-2 border-[#3d7a22] shadow-lg rounded-2xl">
                  <Heart className="text-white" size={32} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-[#8b4513] uppercase">Personalidade</p>
                 <h3 className="text-2xl font-black text-[#5d2e0a] mt-1">{pet.personality}</h3>
                 <p className="text-sm text-[#8b4513] font-medium leading-relaxed mt-2">{pet.personalityDesc || 'Perfil único verificado.'}</p>
               </div>
             </div>
          </div>

          <section className="space-y-4 wood-panel p-8 rounded-3xl border-2 border-[#c9a688]">
            <h2 className="text-3xl font-black text-[#5d2e0a]">A História do {pet.name}</h2>
            <div className="text-[#5d2e0a] font-medium leading-loose space-y-4 italic">
              {pet.story?.map((p, i) => <p key={i}>{p}</p>) || <p>Aguardando uma nova família para começar uma nova história.</p>}
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HealthCard icon={<Stethoscope size={24} />} label="Vacinado" status={pet.health?.vacinado || 'Sim'} />
            <HealthCard icon={<Scissors size={24} />} label="Castrado" status={pet.health?.castrado || 'Sim'} />
            <HealthCard icon={<Pill size={24} />} label="Vermifugado" status={pet.health?.vermifugado || 'Sim'} />
            <HealthCard icon={<Maximize2 size={24} />} label="Porte" status={pet.health?.porte || 'Médio'} />
          </section>
        </div>

        <div className="space-y-6">
          <div className="wood-panel p-8 md:p-10 rounded-[40px] border-4 border-[#c9a688] shadow-2xl sticky top-28 bg-[#fdf5ed] space-y-6">
            <div className="flex justify-between items-start">
               <div>
                <p className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest mb-2 opacity-60">
                  {pet.adoptionType === 'sponsorship' ? 'AJUDA MENSAL' : 'Adoção Responsável'}
                </p>
                <h2 className="text-3xl font-black text-[#5d2e0a] mb-2 leading-none">
                  {pet.adoptionType === 'sponsorship' ? (
                     pet.sponsorshipType === 'financial' ? (
                        <>
                          <span className="text-lg align-top mr-1 font-bold">R$</span>
                          <span className="text-3xl">{pet.sponsorshipValue || 0}</span>
                        </>
                     ) : (
                        <span className="text-2xl">{pet.sponsorshipItem || 'Doação'}</span>
                     )
                  ) : 'Taxa Zero'}
                </h2>
               </div>

               {pet.adoptionType === 'sponsorship' && (
                  <div className="bg-[#fdf5ed] text-[#3b82f6] text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-[#3b82f6] uppercase tracking-wider">
                    Apadrinhamento
                  </div>
               )}
            </div>
            
            {pet.adoptionType === 'sponsorship' && pet.sponsorshipReason && (
               <div className="space-y-1">
                  <p className="text-[20px] md:text-[24px] font-black text-[#5d2e0a] italic leading-tight">
                    Motivo: {pet.sponsorshipReason}
                  </p>
               </div>
            )}
            
            <div className="space-y-4 pt-2">
              {pet.adoptionType === 'sponsorship' ? (
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#3b82f6] py-5 rounded-3xl text-white font-black text-xl shadow-xl hover:translate-y-[-2px] transition-transform border-b-8 border-blue-700 flex items-center justify-center gap-3">
                  Apadrinhar Agora <Heart size={24} className="fill-white" />
                </button>
              ) : (
                <>
                  <button onClick={() => setIsModalOpen(true)} className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl hover:translate-y-[-2px] transition-transform border-b-8 border-[#3d7a22] flex items-center justify-center gap-3">
                    Quero Adotar <MessageSquare size={24} />
                  </button>
                  <button onClick={() => setIsScheduleModalOpen(true)} className="w-full wood-panel bg-[#f1dfcf] py-4 rounded-2xl text-[#5d2e0a] font-black text-lg shadow-md border-b-4 border-[#c9a688] flex items-center justify-center gap-3 hover:bg-[#e6cbb3] transition-all">
                    Agendar Visita <Calendar size={20} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 pt-6 border-t-2 border-[#c9a688]/40 flex items-center gap-2">
              <ShieldCheck className="text-[#55a630]" size={20} />
              <p className="text-[10px] font-bold text-[#8b4513]">Segurança garantida PetMatch DF.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const HealthCard = ({ icon, label, status }: any) => (
  <div className="wood-panel p-4 rounded-2xl border-2 border-[#c9a688] flex flex-col items-center justify-center text-center gap-1 hover:bg-[#d2b48c] transition-colors group">
    <div className="text-[#8b4513] group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-[#5d2e0a] uppercase mt-1">{label}</p>
    <span className="text-[8px] font-bold text-[#8b4513] bg-[#f1dfcf] px-2 py-0.5 rounded-full border border-[#c9a688]">{status}</span>
  </div>
);
export default PetDetails;
