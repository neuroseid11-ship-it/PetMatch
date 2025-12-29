
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, User, Calendar, 
  CheckCircle, Clock, Info, Inbox, Users, 
  Search, Smile, Image as ImageIcon, X, ShieldCheck
} from 'lucide-react';
import { messageService } from '../services/messageService';
import { AdoptionRequest, CommunityChatMessage } from '../types';

const UserMessages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'community'>('community');
  const [myRequests, setMyRequests] = useState<AdoptionRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<CommunityChatMessage[]>([
    { id: '1', userName: 'Ana Protetora', userAvatar: 'https://picsum.photos/seed/ana/50/50', text: 'Alguém sabe se o Abrigo Flora e Fauna está aceitando doação de ração hoje?', timestamp: '14:20' },
    { id: '2', userName: 'Marcos Voluntário', userAvatar: 'https://picsum.photos/seed/marcos/50/50', text: 'Sim Ana! Falei com eles de manhã, estão precisando bastante.', timestamp: '14:22' },
    { id: '3', userName: 'Carla Dias', userAvatar: 'https://picsum.photos/seed/carla/50/50', text: 'Gente, acabei de adotar o Pipoca! Estou tão feliz! ❤️', timestamp: '14:25' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Admin Contact Modal States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [isAdminMsgSent, setIsAdminMsgSent] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    setIsAdmin(role === 'admin');
    loadMyRequests();
  }, []);

  const loadMyRequests = () => {
    const all = messageService.getAll();
    const userEmail = localStorage.getItem('petmatch_user_email') || 'visitante@exemplo.com'; 
    setMyRequests(all.filter(m => m.userEmail === userEmail));
  };

  useEffect(() => {
    if (activeTab === 'community') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: CommunityChatMessage = {
      id: Date.now().toString(),
      userName: 'Você',
      userAvatar: 'https://picsum.photos/seed/user/50/50',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminMessage.trim()) {
      messageService.send({
        petId: 'system-support',
        petName: 'Suporte Administrativo',
        petImage: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        userName: 'Visitante Logado',
        userEmail: localStorage.getItem('petmatch_user_email') || 'visitante@exemplo.com',
        message: adminMessage,
        type: 'direct_contact'
      });
      setIsAdminMsgSent(true);
      loadMyRequests();
      setTimeout(() => {
        setIsAdminModalOpen(false);
        setIsAdminMsgSent(false);
        setAdminMessage('');
      }, 2500);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER PRINCIPAL DE MENSAGENS */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
        <div>
          <h1 className="text-5xl font-black text-[#5d2e0a] tracking-tighter">Mensagens</h1>
          <p className="text-[#8b4513] font-medium italic mt-1">Gerencie seus contatos e interaja com a comunidade.</p>
        </div>

        <div className="flex bg-[#e6cbb3] p-1.5 rounded-[28px] border-4 border-[#c9a688] shadow-2xl">
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${
              activeTab === 'community' ? 'grass-bg text-white shadow-xl border-b-4 border-[#3d7a22]' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
            }`}
          >
            <Users size={18} /> Chat da Comunidade
          </button>
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${
              activeTab === 'inbox' ? 'grass-bg text-white shadow-xl border-b-4 border-[#3d7a22]' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
            }`}
          >
            <Inbox size={18} /> Meus Pedidos
          </button>
        </div>
      </header>

      {/* ÁREA DE MENSAGENS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[500px] px-2">
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
          {activeTab === 'inbox' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
              {myRequests.length > 0 ? (
                myRequests.map((req) => (
                  <div key={req.id} className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col md:flex-row gap-6 relative group overflow-hidden bg-white">
                    <div className="w-24 h-24 rounded-2xl border-2 border-[#c9a688] overflow-hidden flex-shrink-0 shadow-md">
                      <img src={req.petImage} className="w-full h-full object-cover" alt={req.petName} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest opacity-60">
                            {req.type === 'visit' ? 'Agendamento de Visita' : 
                             req.type === 'direct_contact' ? 'Contato com Suporte' : 
                             'Interesse em Adoção'}
                          </p>
                          <h3 className="text-2xl font-black text-[#5d2e0a]">{req.petName}</h3>
                        </div>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase shadow-sm ${
                          req.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {req.status === 'responded' ? 'Respondido' : 'Em Análise'}
                        </span>
                      </div>
                      
                      <div className="wood-inner p-4 border border-[#c9a688]/30 italic text-sm text-[#5d2e0a] leading-relaxed">
                        "{req.message}"
                      </div>

                      <div className="flex items-center gap-6 text-[10px] font-bold text-[#8b4513]">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Enviado em {new Date(req.createdAt).toLocaleDateString()}</span>
                        {req.visitDate && (
                          <span className="flex items-center gap-1.5 text-[#55a630]"><Clock size={14} /> Sugestão: {req.visitDate} às {req.visitTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                   <Inbox size={48} className="text-[#8b4513]" />
                   <h3 className="text-xl font-black text-[#5d2e0a]">Nenhuma mensagem</h3>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 wood-panel rounded-[40px] border-4 border-[#c9a688] shadow-2xl flex flex-col overflow-hidden bg-[#fdfaf7] min-h-[500px]">
               <div className="p-4 border-b-2 border-[#c9a688] flex items-center justify-between bg-[#f1dfcf]/50">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-black text-[#5d2e0a] uppercase">Guardiões Online (12)</span>
                  </div>
                  <button className="text-[10px] font-black text-[#8b4513] uppercase hover:underline">Ver Membros</button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                       <img src={msg.userAvatar} className="w-10 h-10 rounded-xl border-2 border-[#c9a688] object-cover flex-shrink-0" alt="" />
                       <div className={`max-w-[70%] space-y-1 ${msg.isMe ? 'items-end' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                             <span className="text-[10px] font-black text-[#5d2e0a]">{msg.userName}</span>
                             <span className="text-[8px] font-bold text-[#8b4513] opacity-60">{msg.timestamp}</span>
                          </div>
                          <div className={`p-4 rounded-2xl shadow-sm border-2 text-sm leading-relaxed ${
                            msg.isMe ? 'grass-bg text-white border-[#3d7a22] rounded-tr-none' : 'wood-inner text-[#5d2e0a] border-[#c9a688] rounded-tl-none'
                          }`}>
                             {msg.text}
                          </div>
                       </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>
               <form onSubmit={handleSendChatMessage} className="p-4 border-t-2 border-[#c9a688] bg-[#f1dfcf]/30">
                  <div className="flex items-center gap-3">
                     <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite uma mensagem..."
                          className="w-full wood-inner pl-6 pr-24 py-4 text-sm border-2 border-[#c9a688] outline-none focus:ring-4 focus:ring-[#55a630]/10 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#8b4513] opacity-60">
                           <button type="button" className="hover:text-[#55a630]"><Smile size={18} /></button>
                           <button type="button" className="hover:text-[#55a630]"><ImageIcon size={18} /></button>
                        </div>
                     </div>
                     <button type="submit" disabled={!newMessage.trim()} className="grass-bg p-4 text-white rounded-2xl shadow-xl hover:scale-105 transition-all border-b-4 border-[#3d7a22] disabled:opacity-50">
                        <Send size={24} />
                     </button>
                  </div>
               </form>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6">
           <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] shadow-md space-y-4">
              <h4 className="text-[10px] font-black text-[#8b4513] uppercase flex items-center gap-2">
                 <Info size={14} /> Ajuda
              </h4>
              <div className="p-4 wood-inner border border-[#c9a688] border-dashed text-xs leading-tight text-[#5d2e0a]">
                O tempo de resposta para adoções é de 24h a 48h.
              </div>
              <button onClick={() => setIsAdminModalOpen(true)} className="w-full grass-bg py-4 rounded-2xl text-white font-black text-xs shadow-md border-b-4 border-[#3d7a22] flex items-center justify-center gap-2">
                <ShieldCheck size={18} /> Falar com Admin
              </button>
           </div>
        </aside>
      </div>

      {/* MODAL CONTATO ADMIN */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            {isAdminMsgSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] animate-bounce">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Mensagem Enviada!</h2>
              </div>
            ) : (
              <form onSubmit={handleSendAdminMessage} className="space-y-6">
                <h2 className="text-3xl font-black text-[#5d2e0a] text-center">Suporte Admin</h2>
                <textarea 
                  required
                  rows={6}
                  value={adminMessage}
                  onChange={e => setAdminMessage(e.target.value)}
                  placeholder="Como podemos ajudar sua jornada hoje?..."
                  className="w-full wood-inner p-6 text-sm border-2 border-[#c9a688] outline-none focus:ring-4 focus:ring-[#55a630]/10 transition-all"
                />
                <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-4 hover:translate-y-[-4px] transition-all">
                  Enviar Mensagem <Send size={24} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessages;
