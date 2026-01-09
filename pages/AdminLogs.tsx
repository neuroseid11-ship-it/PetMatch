
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Clock, User, Shield, Search,
  Filter, Trash2, Download, CheckCircle,
  AlertTriangle, Info, Dog, Users, Inbox, Building2, ShoppingBag, X
} from 'lucide-react';
import { logService } from '../services/logService';
import { AdminLog } from '../types';
import PageHeader from '../components/PageHeader';
import TabButton from '../components/TabButton';

const AdminLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadLogs();
  }, [navigate]);

  const loadLogs = async () => {
    setLogs(await logService.getAll());
  };

  const handleClearLogs = async () => {
    if (window.confirm("Deseja apagar TODO o histórico de logs definitivamente?")) {
      await logService.clear();
      loadLogs();
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.adminName && log.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'pets': return <Dog size={14} />;
      case 'users': return <Users size={14} />;
      case 'ongs': return <Building2 size={14} />;
      case 'messages': return <Inbox size={14} />;
      case 'store': return <ShoppingBag size={14} />;
      default: return <Shield size={14} />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-200';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Logs do Sistema"
        subtitle="Auditoria e rastreabilidade de ações administrativas."
        icon={<History size={24} />}
      >
        <button
          onClick={handleClearLogs}
          className="wood-panel bg-red-50 px-6 py-3 rounded-2xl text-red-600 font-black text-sm shadow-xl border-b-4 border-red-200 flex items-center gap-2 hover:bg-red-100 transition-all"
        >
          <Trash2 size={18} /> Limpar Histórico
        </button>
      </PageHeader>

      {/* Stats e Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por detalhes, ação ou admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:ring-2 focus:ring-[#55a630] focus:outline-none"
            />
            <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
          </div>
          <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border border-[#c9a688] shadow-inner overflow-x-auto no-scrollbar max-w-full">
            <TabButton active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')} label="Tudo" />
            <TabButton active={moduleFilter === 'pets'} onClick={() => setModuleFilter('pets')} label="Pets" />
            <TabButton active={moduleFilter === 'users'} onClick={() => setModuleFilter('users')} label="Usuários" />
            <TabButton active={moduleFilter === 'ongs'} onClick={() => setModuleFilter('ongs')} label="ONGs" />
            <TabButton active={moduleFilter === 'messages'} onClick={() => setModuleFilter('messages')} label="Central" />
          </div>
        </div>

        <div className="lg:col-span-1 wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col justify-center items-center text-center bg-[#fdfaf7]">
          <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60">Total de Eventos</p>
          <h3 className="text-4xl font-black text-[#5d2e0a]">{logs.length}</h3>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
              <tr className="text-[9px] font-black text-[#5d2e0a] uppercase tracking-widest">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Módulo</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="text-[#5d2e0a] divide-y divide-[#c9a688]/30">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fdfaf7] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#8b4513]">
                      <Clock size={12} className="opacity-40" />
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#5d2e0a] opacity-40" />
                      <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[120px]" title={log.adminEmail}>
                        {log.adminName || log.adminEmail.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#f1dfcf] border border-[#c9a688] text-[9px] font-black uppercase">
                      {getModuleIcon(log.module)}
                      {log.module}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityStyle(log.severity)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-medium text-[#5d2e0a] leading-relaxed max-w-md line-clamp-2">
                      {log.details}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center opacity-40 italic text-sm font-bold uppercase">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



export default AdminLogs;
