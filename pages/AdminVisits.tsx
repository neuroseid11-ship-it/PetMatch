import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, User, Mail, Clock, CheckCircle,
    XCircle, Filter, Search, ChevronRight, Phone, Dog, Cat
} from 'lucide-react';
import { messageService } from '../services/messageService';
import { AdoptionRequest } from '../types';
import PageHeader from '../components/PageHeader';

const AdminVisits: React.FC = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState<AdoptionRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('petmatch_user_role');
        if (role !== 'admin') {
            navigate('/');
            return;
        }
        loadVisits();
    }, [navigate]);

    const loadVisits = () => {
        const allMessages = messageService.getAll();
        const visitMessages = allMessages.filter(m => m.type === 'visit');
        setVisits(visitMessages);
    };

    const handleMarkCompleted = (id: string) => {
        if (window.confirm('Marcar esta visita como realizada?')) {
            messageService.updateStatus(id, 'responded');
            loadVisits();
        }
    };

    const filteredVisits = visits.filter(visit => {
        const matchesSearch = visit.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.userName.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        if (statusFilter === 'pending') return matchesSearch && visit.status === 'pending';
        if (statusFilter === 'confirmed') return matchesSearch && visit.status === 'responded';
        return matchesSearch;
    });

    const stats = {
        total: visits.length,
        pending: visits.filter(v => v.status === 'pending').length,
        confirmed: visits.filter(v => v.status === 'responded').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Agendamentos de Visitas"
                subtitle="Controle de encontros entre visitantes e pets."
                icon={<Calendar size={24} />}
            >
                <div className="flex gap-3">
                    <div className="wood-panel px-4 py-2 rounded-xl border-2 border-[#c9a688] flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#8b4513] uppercase">Total:</span>
                        <span className="text-sm font-black text-[#5d2e0a]">{stats.total}</span>
                    </div>
                    <div className="wood-panel px-4 py-2 rounded-xl border-2 border-amber-400 flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-700 uppercase">Pendentes:</span>
                        <span className="text-sm font-black text-amber-800">{stats.pending}</span>
                    </div>
                    <div className="wood-panel px-4 py-2 rounded-xl border-2 border-[#55a630] flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#3d7a22] uppercase">Confirmadas:</span>
                        <span className="text-sm font-black text-[#55a630]">{stats.confirmed}</span>
                    </div>
                </div>
            </PageHeader>

            <div className="wood-panel rounded-[40px] border-4 border-[#c9a688] shadow-2xl overflow-hidden bg-white">
                <div className="bg-[#fdfaf7] border-b-4 border-[#c9a688] p-6 flex flex-col md:flex-row justify-between items-center gap-4">
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
                            onClick={() => setStatusFilter('confirmed')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === 'confirmed' ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'}`}
                        >
                            Confirmadas
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar por pet ou visitante..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full wood-inner pl-10 pr-4 py-2 text-xs border border-[#c9a688] outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 text-[#8b4513] opacity-40" size={14} />
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVisits.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <Calendar size={64} className="mx-auto mb-4 text-[#8b4513]" />
                            <p className="text-sm font-black uppercase text-[#8b4513]">Nenhum agendamento encontrado</p>
                        </div>
                    ) : (
                        filteredVisits.map(visit => (
                            <div
                                key={visit.id}
                                className="wood-panel p-6 rounded-[24px] border-2 border-[#c9a688] space-y-4 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-xl border-2 border-[#c9a688] overflow-hidden shadow-md">
                                            <img src={visit.petImage} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-[#5d2e0a] uppercase tracking-tight">{visit.petName}</h3>
                                            <p className="text-[9px] font-bold text-[#8b4513] opacity-60">Pet para visita</p>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase ${visit.status === 'responded'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                            : 'bg-amber-50 text-amber-700 border-amber-300'
                                        }`}>
                                        {visit.status === 'responded' ? 'Confirmada' : 'Pendente'}
                                    </span>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-[#c9a688]/30">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#5d2e0a]">
                                        <User size={14} className="text-[#55a630]" />
                                        <span>{visit.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#5d2e0a]">
                                        <Mail size={14} className="text-[#55a630]" />
                                        <span className="truncate">{visit.userEmail}</span>
                                    </div>
                                    {visit.visitDate && (
                                        <div className="flex items-center gap-2 text-xs font-black text-[#55a630]">
                                            <Calendar size={14} />
                                            <span>{new Date(visit.visitDate).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                    {visit.visitTime && (
                                        <div className="flex items-center gap-2 text-xs font-black text-[#55a630]">
                                            <Clock size={14} />
                                            <span>{visit.visitTime}</span>
                                        </div>
                                    )}
                                    {visit.address && (
                                        <div className="flex items-start gap-2 text-xs font-bold text-[#8b4513]">
                                            <MapPin size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                            <span className="leading-tight">{visit.address}</span>
                                        </div>
                                    )}
                                </div>

                                {visit.message && (
                                    <div className="wood-inner p-3 border border-[#c9a688] border-dashed">
                                        <p className="text-[10px] font-medium text-[#5d2e0a] italic leading-tight">
                                            "{visit.message}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    {visit.status === 'pending' && (
                                        <button
                                            onClick={() => handleMarkCompleted(visit.id)}
                                            className="flex-1 grass-bg py-2 px-3 rounded-xl text-white font-black text-[10px] uppercase shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle size={14} /> Confirmar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/admin/messages')}
                                        className="flex-1 wood-panel bg-[#f1dfcf] py-2 px-3 rounded-xl text-[#5d2e0a] font-black text-[10px] uppercase shadow-sm hover:bg-[#e6cbb3] transition-colors flex items-center justify-center gap-1"
                                    >
                                        Ver Detalhes <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminVisits;
