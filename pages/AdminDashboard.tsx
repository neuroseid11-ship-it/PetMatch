
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Edit3, Plus, Search,
  Filter, Eye, ArrowUpDown, Dog, Cat,
  AlertCircle, CheckCircle, Database, Map as MapIcon, Building2, Home as HomeIcon, X, Save, Camera
} from 'lucide-react';
import { petService } from '../services/petService';
import { mapService } from '../services/mapService';
import { logService } from '../services/logService';
import { RegisteredPet, MapPoint } from '../types';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<RegisteredPet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [loading, setLoading] = useState(true);

  // Map points state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapForm, setMapForm] = useState<Omit<MapPoint, 'id'>>({
    name: '',
    type: 'abrigo',
    top: '50%',
    left: '50%',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadPets();
  }, [navigate]);

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await petService.getAll();
      setPets(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${name} do sistema definitivamente?`)) {
      await petService.delete(id);
      logService.add({
        action: 'EXCLUSÃO',
        module: 'pets',
        details: `O animal ${name} (ID: ${id}) foi removido permanentemente do sistema.`,
        severity: 'critical'
      });
      loadPets();
    }
  };
  const handleCleanDatabase = async () => {
    if (window.confirm('ATENÇÃO CRÍTICA: Isso apagará TODOS os pets cadastrados no sistema (Adoção, Apadrinhamento e Pets de Usuários). Essa ação é IRREVERSÍVEL. Deseja continuar?')) {
      const confirm2 = window.prompt('Digite "DELETAR TUDO" para confirmar a exclusão em massa:');
      if (confirm2 === 'DELETAR TUDO') {
        try {
          // Delete from both tables
          await petService.deleteAll();
          await import('../services/userPetService').then(m => m.userPetService.deleteAll());

          await logService.add({
            action: 'LIMPEZA_SISTEMA',
            module: 'system',
            details: 'O administrador realizou a limpeza completa do banco de dados de pets.',
            severity: 'critical'
          });

          alert('Limpeza concluída com sucesso. Todos os pets foram removidos.');
          loadPets();
        } catch (error) {
          console.error(error);
          alert('Ocorreu um erro durante a limpeza. Verifique o console.');
        }
      }
    }
  };
  const handleSaveMapPoint = (e: React.FormEvent) => {
    e.preventDefault();
    mapService.save(mapForm);
    logService.add({
      action: 'MAPA',
      module: 'system',
      details: `Novo ponto registrado no mapa: ${mapForm.name} (${mapForm.type}).`,
      severity: 'info'
    });
    setIsMapModalOpen(false);
    alert('Ponto registrado com sucesso no mapa!');
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || pet.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Gestão Geral de Pets"
        subtitle="Administração centralizada do banco de dados PetMatch DF."
        icon={<Database size={24} />}
      >
        <button
          onClick={() => setIsMapModalOpen(true)}
          className="wood-panel px-6 py-3 rounded-2xl text-[#5d2e0a] font-black text-sm shadow-xl hover:bg-[#d2b48c] transition-all border-b-4 border-[#c9a688] flex items-center gap-2"
        >
          <MapIcon size={18} /> Gerir Mapa
        </button>
        <button
          onClick={loadPets}
          className="wood-panel p-3 rounded-2xl text-[#5d2e0a] hover:bg-[#d2b48c] transition-all border-b-4 border-[#c9a688] shadow-md"
          title="Atualizar Banco de Dados"
        >
          <Database size={18} className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={handleCleanDatabase}
          className="bg-red-100 p-3 rounded-2xl text-red-600 hover:bg-red-200 transition-all border-b-4 border-red-300 shadow-md"
          title="LIMPAR BANCO DE DADOS (CUIDADO)"
        >
          <Trash2 size={18} />
        </button>
        <Link
          to="/cadastrar"
          className="grass-bg px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl hover:scale-105 transition-transform border-b-4 border-[#3d7a22] flex items-center gap-2"
        >
          <Plus size={18} /> Novo Registro
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total de Pets" value={pets.length} icon={<Database size={20} />} color="text-blue-600" />
        <StatCard label="Cachorros" value={pets.filter(p => p.type === 'dog').length} icon={<Dog size={20} />} color="text-[#8b4513]" />
        <StatCard label="Gatos" value={pets.filter(p => p.type === 'cat').length} icon={<Cat size={20} />} color="text-[#55a630]" />
      </div>

      {/* Table Controls */}
      <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Filtrar por nome, raça ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:ring-2 focus:ring-[#55a630] focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="wood-inner px-4 py-3 border border-[#c9a688] text-xs font-black uppercase text-[#5d2e0a] outline-none"
          >
            <option value="all">Todas Espécies</option>
            <option value="dog">Somente Cães</option>
            <option value="cat">Somente Gatos</option>
          </select>
          <button className="wood-panel px-4 py-3 rounded-xl border border-[#c9a688] hover:bg-[#d2b48c] transition-colors">
            <ArrowUpDown size={18} className="text-[#5d2e0a]" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
              <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Identificação</th>
                <th className="px-6 py-4">Espécie / Raça</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Ações de Gestor</th>
              </tr>
            </thead>
            <tbody className="text-[#5d2e0a] divide-y divide-[#c9a688]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center font-bold italic opacity-40 uppercase">Acessando banco de dados...</td>
                </tr>
              ) : filteredPets.length > 0 ? filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-[#f1dfcf] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#c9a688] overflow-hidden shadow-sm">
                      <img src={pet.images[0]} className="w-full h-full object-cover" alt={pet.name} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-black text-base">{pet.name}</h4>
                      <p className="text-[10px] font-bold text-[#8b4513] opacity-60">ID: {pet.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-xs font-black uppercase">
                        {pet.type === 'dog' ? <Dog size={12} className="text-[#8b4513]" /> : <Cat size={12} className="text-[#55a630]" />}
                        {pet.type === 'dog' ? 'Cachorro' : 'Gato'}
                      </span>
                      <span className="text-[10px] font-bold text-[#8b4513] italic">{pet.breed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#8b4513]">
                    {pet.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/pet/${pet.id}`}
                        className="p-2 wood-inner bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Visualizar Detalhes"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/editar/${pet.id}`}
                        className="p-2 wood-inner bg-[#fdfaf7] text-[#5d2e0a] hover:bg-[#d2b48c] border border-[#c9a688] transition-colors"
                        title="Editar Registro"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(pet.id, pet.name)}
                        className="p-2 wood-inner bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                        title="Excluir Permanentemente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center font-bold italic opacity-40 uppercase">Nenhum pet encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Point Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsMapModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8">Cadastrar Abrigo / Parceiro</h2>

            <form onSubmit={handleSaveMapPoint} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome</label>
                  <input required value={mapForm.name} onChange={e => setMapForm({ ...mapForm, name: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: Abrigo Solidário" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Tipo</label>
                  <select value={mapForm.type} onChange={e => setMapForm({ ...mapForm, type: e.target.value as any })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none">
                    <option value="abrigo">Abrigo</option>
                    <option value="empresa">Empresa Parceira</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Posição Vertical (%)</label>
                  <input required value={mapForm.top} onChange={e => setMapForm({ ...mapForm, top: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: 45%" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Posição Horizontal (%)</label>
                  <input required value={mapForm.left} onChange={e => setMapForm({ ...mapForm, left: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: 50%" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">URL da Imagem / Logo</label>
                  <input value={mapForm.imageUrl} onChange={e => setMapForm({ ...mapForm, imageUrl: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="https://..." />
                </div>
              </div>

              <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3">
                <Save size={24} /> Registrar Ponto no Mapa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default AdminDashboard;
