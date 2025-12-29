
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Search, Edit3, Trash2, 
  Save, X, MapPin, Mail, Phone, Home, Camera, Upload
} from 'lucide-react';
import { ongService } from '../services/ongService';
import { ONG } from '../types';

const AdminONGs: React.FC = () => {
  const navigate = useNavigate();
  const [ongs, setOngs] = useState<ONG[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ONG, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    location: '',
    top: '50%',
    left: '50%',
    imageUrl: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    setOngs(ongService.getAll());
  };

  const handleOpenModal = (ong?: ONG) => {
    if (ong) {
      setFormData({ ...ong });
      setEditingId(ong.id);
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        top: '50%',
        left: '50%',
        imageUrl: '',
        phone: '',
        email: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ongService.save(formData, editingId || undefined);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Excluir a ONG "${name}" e removê-la do mapa?`)) {
      ongService.delete(id);
      loadData();
    }
  };

  const filteredONGs = ongs.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="grass-bg p-2 rounded-xl">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-[#5d2e0a]">Gestão de ONGs</h1>
          </div>
          <p className="text-[#8b4513] font-medium italic">Cadastre as organizações parceiras para exibição no mapa e associação aos pets.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="grass-bg px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl hover:scale-105 transition-transform border-b-4 border-[#3d7a22] flex items-center gap-2"
        >
          <Plus size={18} /> Nova ONG
        </button>
      </header>

      <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Buscar ONG por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>
      </div>

      <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
            <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
              <th className="px-6 py-4">Logo</th>
              <th className="px-6 py-4">ONG</th>
              <th className="px-6 py-4">Localização</th>
              <th className="px-6 py-4">Mapa (X,Y)</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-[#5d2e0a] divide-y divide-[#c9a688]">
            {filteredONGs.map(ong => (
              <tr key={ong.id} className="hover:bg-[#f1dfcf] transition-colors">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-[#c9a688] overflow-hidden">
                    <img src={ong.imageUrl || 'https://picsum.photos/seed/ong/100/100'} className="w-full h-full object-cover" alt="" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <h4 className="font-black text-sm">{ong.name}</h4>
                    <p className="text-[10px] text-[#8b4513] font-bold">{ong.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-[#8b4513]">
                  {ong.location}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black bg-[#f1dfcf] px-2 py-1 rounded border border-[#c9a688]">
                    {ong.left}, {ong.top}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(ong)}
                      className="p-2 wood-inner hover:bg-[#d2b48c] transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ong.id, ong.name)}
                      className="p-2 wood-inner text-red-600 hover:bg-red-50 border border-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8">{editingId ? 'Editar ONG' : 'Cadastrar Nova ONG'}</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome da ONG</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: ONG Vida Animal" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">E-mail</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="contato@ong.org" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">WhatsApp</label>
                      <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="(61) 90000-0000" />
                   </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                   <div className="space-y-1 text-center">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase">Logo / Foto</label>
                      <div className="w-32 h-32 mx-auto wood-inner border-2 border-[#c9a688] border-dashed rounded-3xl flex items-center justify-center overflow-hidden relative">
                         {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Camera size={32} className="opacity-20" />}
                         <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <p className="text-[8px] font-bold text-[#8b4513] mt-1 italic">Clique para alterar</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Mapa X (%)</label>
                         <input required value={formData.left} onChange={e => setFormData({...formData, left: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Mapa Y (%)</label>
                         <input required value={formData.top} onChange={e => setFormData({...formData, top: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Endereço Completo</label>
                      <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Bairro, Quadra, Cidade-DF" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Breve História / Missão</label>
                      <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Conte um pouco sobre o trabalho da ONG..." />
                   </div>
                </div>
              </div>
              
              <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3">
                <Save size={24} /> {editingId ? 'Salvar Alterações' : 'Cadastrar ONG'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminONGs;
