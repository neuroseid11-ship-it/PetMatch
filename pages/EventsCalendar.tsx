
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Clock, 
  ChevronLeft, ChevronRight, 
  Users, Heart, Star, Plus, 
  Filter, X, Save, Trash2, Send, CheckCircle, Edit3, Image as ImageIcon
} from 'lucide-react';
import { PlatformEvent } from '../types';
import { eventService } from '../services/eventService';
import { messageService } from '../services/messageService';

const EventsCalendar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<PlatformEvent | null>(null);
  
  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isSuggestSent, setIsSuggestSent] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [eventForm, setEventForm] = useState<Omit<PlatformEvent, 'id'>>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'adoption',
    imageUrl: '',
    top: '50%',
    left: '50%'
  });

  const [suggestionMessage, setSuggestionMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    setIsAdmin(role === 'admin');
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(eventService.getAll());
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleOpenEventModal = (event?: PlatformEvent) => {
    if (event) {
      setEventForm({ ...event });
      setEditingId(event.id);
    } else {
      setEventForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        description: '',
        category: 'adoption',
        imageUrl: '',
        top: '50%',
        left: '50%'
      });
      setEditingId(null);
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<PlatformEvent, 'id'>, id?: string) => {
    eventService.save(eventData, id);
    loadEvents();
    setIsEventModalOpen(false);
    setActiveEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      eventService.delete(id);
      loadEvents();
      setActiveEvent(null);
    }
  };

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestionMessage.trim()) {
      const userEmail = localStorage.getItem('petmatch_user_email') || 'visitante@petmatch.com.br';
      messageService.send({
        petId: 'system-event',
        petName: 'Sugestão de Evento',
        petImage: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        userName: 'Guardião da Rede',
        userEmail: userEmail,
        message: suggestionMessage,
        type: 'event_suggestion'
      });
      setIsSuggestSent(true);
      setTimeout(() => {
        setIsSuggestModalOpen(false);
        setIsSuggestSent(false);
        setSuggestionMessage('');
      }, 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="grass-bg p-2 rounded-xl">
              <CalendarIcon className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-[#5d2e0a]">Calendário de Eventos</h1>
          </div>
          <p className="text-[#8b4513] font-medium italic">Fique por dentro das programações presenciais da rede PetMatch DF.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button className="wood-panel px-6 py-3 rounded-2xl text-[#5d2e0a] font-black text-sm shadow-xl flex items-center gap-2 hover:bg-[#d2b48c] transition-all border-b-4 border-[#c9a688]">
            <Filter size={18} /> Filtrar
          </button>
          
          {isAdmin ? (
            /* Botão Estilizado conforme imagem do usuário para ADMIN */
            <button 
              onClick={() => handleOpenEventModal()}
              className="grass-bg px-6 py-4 rounded-[24px] text-white shadow-xl hover:scale-105 transition-all border-b-4 border-[#3d7a22] flex flex-col items-start min-w-[140px] relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-8 border-l border-white/20 border-dashed"></div>
              <div className="absolute inset-y-0 left-20 border-l border-white/20 border-dashed"></div>
              <Plus size={24} className="mb-1" strokeWidth={3} />
              <span className="text-lg font-black tracking-tighter leading-none">Novo Evento</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsSuggestModalOpen(true)}
              className="grass-bg px-8 py-5 rounded-[24px] text-white font-black text-lg shadow-xl hover:scale-105 transition-all border-b-6 border-[#3d7a22] flex items-center gap-3"
            >
              <Plus size={24} strokeWidth={3} /> Sugerir Evento
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Calendário Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="text-2xl font-black text-[#5d2e0a] uppercase tracking-tighter">Maio 2024</h2>
              <div className="flex gap-2">
                <button className="p-2 wood-inner border border-[#c9a688] text-[#8b4513] hover:bg-[#d2b48c]"><ChevronLeft size={20} /></button>
                <button className="p-2 wood-inner border border-[#c9a688] text-[#8b4513] hover:bg-[#d2b48c]"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-[#8b4513] uppercase opacity-60 pb-4">{day}</div>
              ))}
              
              {daysInMonth.map(day => {
                const hasEvent = events.some(e => new Date(e.date).getUTCDate() === day);
                const isSelected = selectedDate.getUTCDate() === day;
                
                return (
                  <div 
                    key={day}
                    onClick={() => {
                      const event = events.find(e => new Date(e.date).getUTCDate() === day);
                      setActiveEvent(event || null);
                      setSelectedDate(new Date(2024, 4, day));
                    }}
                    className={`
                      aspect-square rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center relative
                      ${isSelected ? 'border-[#55a630] bg-[#f1fcf1] shadow-inner scale-105' : 'border-[#c9a688] wood-inner hover:border-[#5d2e0a]'}
                    `}
                  >
                    <span className={`text-sm font-black ${isSelected ? 'text-[#55a630]' : 'text-[#5d2e0a]'}`}>{day}</span>
                    {hasEvent && (
                      <div className="absolute bottom-1.5 w-4 h-4 rounded-full shadow-md animate-event-glow border border-white/20"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="wood-inner p-6 border-2 border-[#c9a688] border-dashed rounded-3xl flex items-center gap-4">
             <div className="w-12 h-12 grass-bg flex items-center justify-center text-white border-2 border-[#3d7a22] shadow-md rounded-2xl">
                <Star size={24} />
             </div>
             <div>
                <h4 className="text-sm font-black text-[#5d2e0a] uppercase">Dica do Mês</h4>
                <p className="text-[11px] text-[#8b4513] font-bold italic">Eventos presenciais geram o dobro de PetCoins para quem fizer check-in via QR Code!</p>
             </div>
          </div>
        </div>

        {/* Lado Direito: Detalhes do Evento Selecionado */}
        <div className="space-y-6">
          <div className="wood-panel rounded-[40px] border-4 border-[#c9a688] shadow-2xl overflow-hidden flex flex-col h-full sticky top-28 min-h-[500px]">
            {activeEvent ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                {activeEvent.imageUrl ? (
                  <div className="h-48 w-full relative">
                    <img src={activeEvent.imageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-4 right-4 grass-bg px-3 py-1 border-2 border-[#3d7a22]">
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">{activeEvent.category}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 w-full grass-bg flex items-center justify-center border-b-4 border-[#3d7a22]">
                    <CalendarIcon size={64} className="text-white opacity-20" />
                  </div>
                )}

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-[#5d2e0a] leading-tight">{activeEvent.title}</h2>
                      <p className="text-[11px] font-bold text-[#8b4513] uppercase mt-2 italic">Data: {new Date(activeEvent.date).toLocaleDateString()}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenEventModal(activeEvent)}
                          className="p-2 wood-inner text-[#5d2e0a] hover:bg-[#d2b48c] border border-[#c9a688]"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(activeEvent.id)}
                          className="p-2 wood-inner text-red-600 hover:bg-red-50 border border-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-[#5d2e0a]">
                      <Clock size={18} className="text-[#55a630]" /> {activeEvent.time}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-[#5d2e0a]">
                      <MapPin size={18} className="text-red-500" /> {activeEvent.location}
                    </div>
                  </div>

                  <div className="wood-inner p-6 border border-[#c9a688] border-dashed">
                    <p className="text-sm text-[#5d2e0a] font-medium leading-relaxed">
                      {activeEvent.description}
                    </p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button className="w-full grass-bg py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:translate-y-[-2px] transition-transform flex items-center justify-center gap-3">
                      Eu Vou! <Heart size={20} />
                    </button>
                    <button className="w-full wood-panel bg-[#f1dfcf] py-3 rounded-2xl text-[#5d2e0a] font-black text-xs shadow-md flex items-center justify-center gap-2 border-b-4 border-[#c9a688]">
                      <Users size={16} /> Ver Confirmados (12)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 opacity-40 h-full">
                <div className="w-24 h-24 wood-inner border-4 border-dashed border-[#c9a688] rounded-full flex items-center justify-center">
                  <CalendarIcon size={48} className="text-[#8b4513]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#5d2e0a]">Selecione um Evento</h3>
                  <p className="text-xs font-bold text-[#8b4513] mt-2 italic">Escolha uma data marcada no calendário para ver os detalhes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Management Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsEventModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8">{editingId ? 'Editar Evento' : 'Criar Novo Evento'}</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(eventForm, editingId || undefined); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Título do Evento</label>
                  <input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: Feira de Adoção Petz" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Categoria</label>
                  <select value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value as any})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none">
                    <option value="adoption">Adoção</option>
                    <option value="volunteer">Voluntariado</option>
                    <option value="social">Social</option>
                    <option value="health">Saúde</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Data</label>
                  <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Horário</label>
                  <input required value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: 09:00 - 17:00" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Localização</label>
                  <input required value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Endereço completo..." />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Descrição</label>
                  <textarea rows={4} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Detalhes do evento..." />
                </div>
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Mapa X (%)</label>
                    <input required value={eventForm.left} onChange={e => setEventForm({...eventForm, left: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: 48%" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Mapa Y (%)</label>
                    <input required value={eventForm.top} onChange={e => setEventForm({...eventForm, top: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: 30%" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">URL da Imagem</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] opacity-40" size={16} />
                    <input value={eventForm.imageUrl} onChange={e => setEventForm({...eventForm, imageUrl: e.target.value})} className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="https://..." />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3">
                <Save size={24} /> {editingId ? 'Salvar Alterações' : 'Criar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Suggest Event Modal */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsSuggestModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            
            {isSuggestSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Sugestão Enviada!</h2>
                <p className="text-[#8b4513] font-medium italic">Obrigado por ajudar a nossa rede crescer. O Admin receberá sua proposta na Central!</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-[#5d2e0a]">Sugerir Evento</h2>
                  <p className="text-[#8b4513] text-xs font-bold uppercase tracking-widest mt-1">Envie sua ideia para a nossa equipe</p>
                </div>

                <form onSubmit={handleSendSuggestion} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Detalhes da Sugestão</label>
                    <textarea 
                      required
                      rows={6}
                      value={suggestionMessage}
                      onChange={e => setSuggestionMessage(e.target.value)}
                      placeholder="Descreva o evento: nome, local provável, data e por que seria legal para a comunidade..."
                      className="w-full wood-inner p-6 text-sm border-2 border-[#c9a688] outline-none focus:ring-4 focus:ring-[#55a630]/10 transition-all"
                    />
                  </div>
                  
                  <div className="p-4 wood-inner border border-[#c9a688] border-dashed">
                    <p className="text-[10px] text-[#8b4513] font-bold leading-tight">
                       Dica: Sugestões aprovadas dão 200 PetCoins de bônus para o Guardião autor da ideia!
                    </p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3"
                  >
                    Enviar Proposta <Send size={20} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
