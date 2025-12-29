
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox, Search, Filter, MessageSquare,
  Calendar, CheckCircle, XCircle, Trash2,
  Mail, Clock, User, ArrowRight, Eye, Send,
  ShieldCheck, FileText, Phone, Building2, Heart, Info, Recycle, Tag,
  AlertTriangle, Coins
} from 'lucide-react';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { garageService } from '../services/garageService';
import { AdoptionRequest, PlatformUser, GarageItem } from '../types';
import PageHeader from '../components/PageHeader';
import InfoItem from '../components/InfoItem';

// Tipo unificado para a lista da central
type UnifiedRequest = (AdoptionRequest & { isUserRequest?: false }) | (PlatformUser & { isUserRequest: true });

const AdminMessages: React.FC = () => {
  const navigate = useNavigate();
  const [combinedRequests, setCombinedRequests] = useState<UnifiedRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    const messages = messageService.getAll().map(m => ({ ...m, isUserRequest: false as const }));
    const allUsers = await userService.getAll();
    const users = allUsers.map(u => ({ ...u, isUserRequest: true as const }));

    // Combina e ordena por data de criação (mais recentes primeiro)
    const combined: UnifiedRequest[] = [...messages, ...users].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setCombinedRequests(combined);
  };

  const handleUpdateMessageStatus = (id: string, status: AdoptionRequest['status']) => {
    messageService.updateStatus(id, status);
    loadData();
    if (selectedRequest && !selectedRequest.isUserRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status } as UnifiedRequest);
    }
  };

  const handleUpdateUserStatus = (id: string, status: PlatformUser['status']) => {
    userService.update(id, { status });
    loadData();
    if (selectedRequest && selectedRequest.isUserRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status } as UnifiedRequest);
    }
  };

  const handleApproveGarageItem = (id: string, requestId: string) => {
    garageService.updateStatus(id, 'approved');
    handleUpdateMessageStatus(requestId, 'responded');
    alert('Item aprovado e publicado no Mercado de Garagem!');
  };

  const handleRejectGarageItem = (id: string, requestId: string) => {
    garageService.updateStatus(id, 'rejected');
    handleUpdateMessageStatus(requestId, 'archived');
    alert('Item rejeitado.');
  };

  const handleDelete = (id: string, isUser: boolean) => {
    if (window.confirm('Excluir este registro permanentemente?')) {
      if (isUser) userService.delete(id);
      else messageService.delete(id);
      loadData();
      setSelectedRequest(null);
    }
  };

  const handleSendReply = () => {
    if (replyText.trim() && selectedRequest && !selectedRequest.isUserRequest) {
      setIsReplying(true);
      setTimeout(() => {
        handleUpdateMessageStatus(selectedRequest.id, 'responded');
        setIsReplying(false);
        setReplyText('');
        alert('Resposta enviada com sucesso ao interessado!');
      }, 1500);
    }
  };

  const filteredRequests = combinedRequests.filter(req => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return req.status === 'pending';
    if (statusFilter === 'responded') return req.status === 'responded' || req.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-160px)] flex flex-col">
      <PageHeader
        title="Central de Atendimento"
        subtitle="Gestão unificada de mensagens, adoções e novos cadastros."
        icon={<Inbox size={24} />}
        className="flex-shrink-0 mb-0"
      >
        <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border border-[#c9a688] shadow-inner">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === 'all' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === 'pending' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('responded')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === 'responded' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
          >
            Concluídas
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* List Side */}
        <div className="lg:col-span-1 wood-panel rounded-[32px] border-2 border-[#c9a688] flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#c9a688] flex-shrink-0 bg-[#f1dfcf]/30">
            <div className="relative">
              <input type="text" placeholder="Filtrar central..." className="w-full wood-inner pl-10 pr-4 py-2 text-xs border border-[#c9a688] outline-none" />
              <Search size={14} className="absolute left-3 top-2.5 text-[#8b4513] opacity-40" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredRequests.map(req => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${selectedRequest?.id === req.id
                  ? 'border-[#55a630] bg-[#fdfaf7] shadow-md'
                  : 'border-transparent hover:bg-[#f1dfcf]'
                  }`}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl border border-[#c9a688] overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={req.isUserRequest ? (req as PlatformUser).photoUrl : (req as AdoptionRequest).petImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-black text-[#5d2e0a] truncate uppercase tracking-tighter">
                        {req.isUserRequest ? `Cadastro: ${req.name}` : (req as AdoptionRequest).petName}
                      </h4>
                      <span className="text-[8px] font-bold text-[#8b4513] whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#8b4513] truncate">
                      {req.isUserRequest ? (req as PlatformUser).email : (req as AdoptionRequest).userEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${req.isUserRequest ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        (req as AdoptionRequest).type === 'visit' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          (req as AdoptionRequest).type === 'garage_approval' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            (req as AdoptionRequest).type === 'event_suggestion' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                        {req.isUserRequest ? 'Novo Cadastro' :
                          (req as AdoptionRequest).type === 'visit' ? 'Visita' :
                            (req as AdoptionRequest).type === 'garage_approval' ? 'Mercado Garagem' :
                              (req as AdoptionRequest).type === 'event_suggestion' ? 'Sugestão Evento' : 'Adoção'}
                      </span>
                      {req.status === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="py-20 text-center opacity-40">
                <Inbox size={48} className="mx-auto mb-2 text-[#8b4513]" />
                <p className="text-[10px] font-black uppercase text-[#8b4513]">Nenhum item pendente</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Side */}
        <div className="lg:col-span-2 wood-panel rounded-[40px] border-4 border-[#c9a688] shadow-2xl flex flex-col overflow-hidden relative bg-white">
          {selectedRequest ? (
            <>
              {/* Header of detail */}
              <div className="p-8 border-b-2 border-[#c9a688] flex-shrink-0 bg-[#fdfaf7]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-3xl border-4 border-[#c9a688] shadow-md overflow-hidden bg-white">
                      <img src={selectedRequest.isUserRequest ? (selectedRequest as PlatformUser).photoUrl : (selectedRequest as AdoptionRequest).petImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase ${selectedRequest.isUserRequest ? 'bg-purple-100 text-purple-700 border-purple-300' :
                          (!selectedRequest.isUserRequest && selectedRequest.type === 'garage_approval') ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            (!selectedRequest.isUserRequest && selectedRequest.type === 'event_suggestion') ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                              'bg-blue-100 text-blue-700 border-blue-300'
                          }`}>
                          {selectedRequest.isUserRequest ? 'Solicitação de Acesso' :
                            (!selectedRequest.isUserRequest && selectedRequest.type === 'garage_approval') ? 'Aprovação de Item' :
                              (!selectedRequest.isUserRequest && selectedRequest.type === 'event_suggestion') ? 'Proposta de Evento' :
                                'Solicitação de Adoção'}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-[#5d2e0a]">
                        {selectedRequest.isUserRequest ? (selectedRequest as PlatformUser).name : (selectedRequest as AdoptionRequest).petName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-bold text-[#8b4513]">
                        <span className="flex items-center gap-1.5"><User size={14} /> {selectedRequest.isUserRequest ? 'Novo Guardião' : (selectedRequest as AdoptionRequest).userName}</span>
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedRequest.isUserRequest ? (selectedRequest as PlatformUser).email : (selectedRequest as AdoptionRequest).userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(selectedRequest.id, selectedRequest.isUserRequest || false)} className="p-2 wood-inner text-[#8b4513] hover:bg-red-50 border border-[#c9a688] transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Body of detail */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {selectedRequest.isUserRequest ? (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-[#8b4513] uppercase border-b border-[#c9a688] pb-1 flex items-center gap-2">
                          <FileText size={14} /> Dados do Cadastro
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <InfoItem label="Perfil Solicitado" value={(selectedRequest as PlatformUser).type === 'volunteer' ? 'Voluntário' : 'Empresa Parceira'} icon={(selectedRequest as PlatformUser).type === 'volunteer' ? <Heart size={14} /> : <Building2 size={14} />} />
                          <InfoItem label="CPF / CNPJ" value={(selectedRequest as PlatformUser).documentNumber} />
                          <InfoItem label="Data do Pedido" value={new Date(selectedRequest.createdAt).toLocaleDateString()} />
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button
                            onClick={() => handleUpdateUserStatus(selectedRequest.id, 'approved')}
                            disabled={selectedRequest.status === 'approved'}
                            className="flex-1 grass-bg py-4 text-white font-black uppercase text-[11px] rounded-xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                          >
                            Aprovar Acesso
                          </button>
                          <button
                            onClick={() => handleUpdateUserStatus(selectedRequest.id, 'rejected')}
                            disabled={selectedRequest.status === 'rejected'}
                            className="flex-1 bg-red-600 py-4 text-white font-black uppercase text-[11px] rounded-xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#8b4513] uppercase mb-2">Comprovante Enviado</h4>
                        <div className="wood-panel p-2 rounded-2xl border-2 border-[#c9a688] bg-[#f1dfcf] aspect-video group relative overflow-hidden">
                          <img src={(selectedRequest as PlatformUser).documentFileUrl} className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-110" alt="Doc" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[9px] font-black uppercase tracking-widest">Ver Documento Completo</span>
                          </div>
                        </div>
                        <div className="p-3 wood-inner border border-[#c9a688] border-dashed">
                          <p className="text-[9px] font-bold text-[#8b4513] leading-tight">
                            Verifique se o documento condiz com o nome e o número de registro informado antes de aprovar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !selectedRequest.isUserRequest && selectedRequest.type === 'garage_approval' ? (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="aspect-square wood-inner border-4 border-[#c9a688] rounded-[32px] overflow-hidden shadow-xl bg-white group">
                          <img src={selectedRequest.petImage} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                        </div>
                        <div className="p-4 wood-panel bg-amber-50 border-amber-200 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                          <p className="text-[10px] font-bold text-amber-800 leading-tight">
                            Lembrete: Verifique se a foto não contém animais vivos. O Mercado de Garagem é exclusivo para acessórios e itens pet.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6 flex flex-col justify-center">
                        <div>
                          <h4 className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest opacity-60">Solicitação do Guardião</h4>
                          <h3 className="text-3xl font-black text-[#5d2e0a] mt-1">{selectedRequest.petName.replace('Item Mercado: ', '')}</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <InfoItem label="Valor Solicitado" value="Verifique no sistema" icon={<Coins size={14} className="text-[#cd7f32]" />} />
                          <InfoItem label="Vendedor" value={selectedRequest.userName} />
                          <InfoItem label="Data do Envio" value={new Date(selectedRequest.createdAt).toLocaleDateString()} />
                        </div>

                        <div className="pt-6 flex flex-col gap-3">
                          <button
                            onClick={() => handleApproveGarageItem(selectedRequest.relatedId || '', selectedRequest.id)}
                            disabled={selectedRequest.status === 'responded'}
                            className="w-full grass-bg py-5 text-white font-black uppercase text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={20} /> Aprovar e Publicar
                          </button>
                          <button
                            onClick={() => handleRejectGarageItem(selectedRequest.relatedId || '', selectedRequest.id)}
                            disabled={selectedRequest.status === 'archived'}
                            className="w-full bg-red-600 py-4 text-white font-black uppercase text-sm rounded-2xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                          >
                            <XCircle size={18} className="inline mr-2" /> Rejeitar Anúncio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="wood-inner p-6 border-2 border-[#c9a688] border-dashed relative">
                      <div className="absolute -top-3 left-6 grass-bg px-3 py-1 border-2 border-[#3d7a22] shadow-md">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Mensagem Recebida</span>
                      </div>
                      <p className="text-[#5d2e0a] font-medium leading-relaxed italic text-base">
                        "{(selectedRequest as AdoptionRequest).message}"
                      </p>

                      {(selectedRequest as AdoptionRequest).type === 'visit' && (
                        <div className="mt-6 flex gap-6 pt-6 border-t border-[#c9a688]/30">
                          <div className="flex items-center gap-2 text-xs font-black text-[#55a630]">
                            <Calendar size={16} /> Data Sugerida: {new Date((selectedRequest as AdoptionRequest).visitDate!).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-black text-[#55a630]">
                            <Clock size={16} /> Horário: {(selectedRequest as AdoptionRequest).visitTime}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Enviar Resposta ao Interessado</label>
                      <div className="relative">
                        <textarea
                          rows={6}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Digite sua resposta aqui. O usuário será notificado no e-mail cadastrado."
                          className="w-full wood-inner p-6 text-sm border-2 border-[#c9a688] outline-none focus:ring-4 focus:ring-[#55a630]/10 transition-all placeholder-[#8b4513]/30"
                        />
                        <div className="absolute bottom-4 right-4">
                          <button
                            onClick={handleSendReply}
                            disabled={isReplying || !replyText.trim()}
                            className="grass-bg px-8 py-3 text-white font-black text-xs uppercase shadow-xl hover:translate-y-[-2px] transition-transform flex items-center gap-2 disabled:opacity-50"
                          >
                            {isReplying ? 'Enviando...' : 'Enviar Agora'} <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer of detail */}
              <div className="p-4 bg-[#f1dfcf]/50 border-t-2 border-[#c9a688] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#8b4513] uppercase">Situação do Item:</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase ${selectedRequest.status === 'responded' || selectedRequest.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : selectedRequest.status === 'rejected' || selectedRequest.status === 'archived'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-amber-100 text-amber-700 border-amber-300'
                    }`}>
                    {selectedRequest.status === 'responded' || selectedRequest.status === 'approved' ? 'Concluído' :
                      selectedRequest.status === 'rejected' || selectedRequest.status === 'archived' ? 'Rejeitado' : 'Pendente de Ação'}
                  </span>
                </div>
                {(!selectedRequest.isUserRequest && selectedRequest.status === 'pending') && (
                  <button onClick={() => handleUpdateMessageStatus(selectedRequest.id, 'responded')} className="text-[10px] font-black text-[#55a630] hover:underline uppercase">Marcar como Lido</button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-12">
              <div className="w-32 h-32 wood-inner border-4 border-[#c9a688] border-dashed rounded-full flex items-center justify-center mb-6">
                <Inbox size={64} className="text-[#8b4513]" />
              </div>
              <h3 className="text-2xl font-black text-[#5d2e0a]">Central PetMatch</h3>
              <p className="text-sm font-bold text-[#8b4513] max-w-xs mt-2 italic">Selecione uma mensagem ou pedido de cadastro na lista lateral para gerenciar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default AdminMessages;
