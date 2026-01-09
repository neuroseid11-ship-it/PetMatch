
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, Trash2, Edit3,
  CheckCircle, XCircle, Eye, ShieldCheck,
  Database, User as UserIcon, Building2, Heart,
  ArrowRight
} from 'lucide-react';
import { userService } from '../services/userService';
import { logService } from '../services/logService';
import { PlatformUser, UserType, UserStatus } from '../types';
import UserRow from '../components/UserRow';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';



const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAll();
      setUsers(allUsers);
    } catch (error: any) {
      console.error("Error loading users:", error);
      alert(`Erro ao carregar usuários: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Excluir permanentemente o registro de ${name}?`)) {
      try {
        await userService.delete(id);

        await logService.add({
          action: 'EXCLUSÃO',
          module: 'users',
          details: `Usuário ${name} (ID: ${id}) excluído permanentemente.`,
          severity: 'critical'
        });

        await loadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Erro ao excluir usuário. Verifique se você tem permissão ou se o usuário ainda existe.");
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: UserStatus) => {
    try {
      await userService.update(id, { status });

      const user = users.find(u => u.id === id);
      await logService.add({
        action: 'STATUS',
        module: 'users',
        details: `Status do usuário ${user?.name || id} alterado para: ${status.toUpperCase()}.`,
        severity: status === 'blocked' ? 'warning' : 'info'
      });

      await loadUsers();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Erro ao atualizar status. O usuário pode ter sido removido ou você não tem permissão.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const volunteers = filteredUsers.filter(u => u.type === 'volunteer');
  const partners = filteredUsers.filter(u => u.type === 'partner');

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Gestão de Comunidade"
        subtitle="Painel administrativo de controle de membros e parceiros."
        icon={<Users size={24} />}
      />

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total de Usuários" value={users.length} icon={<Database size={20} />} color="text-blue-600" />
        <StatCard label="Pendentes de Aprovação" value={users.filter(u => u.status === 'pending').length} icon={<Filter size={20} />} color="text-amber-600" />
        <StatCard label="Aprovados na Rede" value={users.filter(u => u.status === 'approved').length} icon={<CheckCircle size={20} />} color="text-[#55a630]" />
      </div>

      {/* Global Search */}
      <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail em toda a rede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:outline-none focus:ring-2 focus:ring-[#55a630]"
          />
          <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>
      </div>

      {/* BLOCO 1: VOLUNTÁRIOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grass-bg p-2 rounded-xl text-white shadow-md">
              <Heart size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#5d2e0a] leading-tight">Voluntários (Guardiões)</h2>
              <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest">{volunteers.length} membros cadastrados</p>
            </div>
          </div>
          <button
            onClick={loadUsers}
            className="p-2 wood-inner text-[#5d2e0a] hover:bg-[#d2b48c] border border-[#c9a688] rounded-xl transition-all"
            title="Atualizar Lista"
          >
            <Database size={18} className="animate-pulse" />
          </button>
        </div>

        <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
                <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">CPF</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a688] text-[#5d2e0a]">
                {volunteers.map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onViewProfile={() => navigate(`/perfil/${user.id}`)}
                  />
                ))}
                {volunteers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center opacity-40 italic text-sm font-bold">Nenhum voluntário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOCO 2: EMPRESAS PARCEIRAS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#cd7f32] p-2 rounded-xl text-white shadow-md">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#5d2e0a] leading-tight">Empresas Parceiras</h2>
              <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest">{partners.length} parceiros corporativos</p>
            </div>
          </div>
        </div>

        <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#c9a688] border-b-2 border-[#b38b6d]">
                <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">CNPJ</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a688] text-[#5d2e0a]">
                {partners.map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onViewProfile={() => navigate(`/perfil/${user.id}`)}
                  />
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center opacity-40 italic text-sm font-bold">Nenhuma empresa encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOCO 3: OUTROS USUÁRIOS (ADMINS E DIVERSOS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#5d2e0a] p-2 rounded-xl text-white shadow-md">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#5d2e0a] leading-tight">Administradores e Outros</h2>
              <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest">{filteredUsers.filter(u => u.type !== 'volunteer' && u.type !== 'partner').length} usuários</p>
            </div>
          </div>
        </div>

        <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#b38b6d] border-b-2 border-[#8b6b4d]">
                <tr className="text-[10px] font-black text-[#fdf6e3] uppercase tracking-widest">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a688] text-[#5d2e0a]">
                {filteredUsers.filter(u => u.type !== 'volunteer' && u.type !== 'partner').map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onViewProfile={() => navigate(`/perfil/${user.id}`)}
                  />
                ))}
                {filteredUsers.filter(u => u.type !== 'volunteer' && u.type !== 'partner').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center opacity-40 italic text-sm font-bold">Nenhum outro usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div >
  );
};



export default AdminUsers;
