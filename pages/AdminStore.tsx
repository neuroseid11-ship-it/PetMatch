
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Plus, Search, Edit3, Trash2, Save, X,
  ImageIcon, Coins, LayoutGrid, Upload, Camera,
  TrendingUp, ArrowUpRight, Package2, Award, ListFilter,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import PageHeader from '../components/PageHeader';
import ExchangeChart from '../components/ExchangeChart';



const AdminStore: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | Product['category']>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mock de dados para o dashboard administrativo
  const [dashboardStats] = useState({
    totalExchanges: 1458,
    dailyTrend: [45, 62, 38, 90, 110, 75, 120],
    mostWanted: 'Medalha Anjo',
    weeklyGrowth: '+12.5%'
  });

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'bones',
    imageUrl: '',
    stock: 0
  });

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = () => {
    setProducts(productService.getAll());
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData({ ...product });
      setEditingId(product.id);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 100,
        category: 'bones',
        imageUrl: '',
        stock: 10
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
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Por favor, adicione uma imagem para o produto.");
      return;
    }
    productService.save(formData, editingId || undefined);
    loadProducts();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${name}" da loja?`)) {
      productService.delete(id);
      loadProducts();
    }
  };

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'cursos', label: 'Cursos' },
    { id: 'bones', label: 'Bonés' },
    { id: 'camisetas', label: 'Camisetas' },
    { id: 'adesivos', label: 'Adesivos' },
    { id: 'parceiros', label: 'Empresas Parceiras' },
    { id: 'moedas', label: 'Moedas' },
    { id: 'canetas', label: 'Canetas' },
    { id: 'acessorios', label: 'Acessórios' },
    { id: 'brinquedos', label: 'Brinquedos' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const globalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const getCountByCategory = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Gestão da Loja"
        subtitle="Gerencie os produtos disponíveis para troca por PetCoins."
        icon={<ShoppingBag size={24} />}
      >
        <button
          onClick={() => handleOpenModal()}
          className="grass-bg px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl hover:scale-105 transition-transform border-b-4 border-[#3d7a22] flex items-center gap-2"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </PageHeader>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
        <div className="lg:col-span-3 wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#5d2e0a] uppercase flex items-center gap-2">
                <TrendingUp className="text-[#55a630]" size={14} /> Fluxo de Resgates PetCoins
              </h3>
              <span className="text-[8px] font-black text-white bg-[#55a630] px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight size={10} /> {dashboardStats.weeklyGrowth}
              </span>
            </div>
            <ExchangeChart data={dashboardStats.dailyTrend} />
          </div>
          <div className="w-px h-24 bg-[#c9a688]/30 hidden md:block"></div>
          <div className="space-y-4 min-w-[160px]">
            <div>
              <p className="text-[8px] font-black text-[#8b4513] uppercase opacity-60">Total de Trocas</p>
              <h4 className="text-2xl font-black text-[#5d2e0a] leading-none">{dashboardStats.totalExchanges.toLocaleString()}</h4>
            </div>
            <div>
              <p className="text-[8px] font-black text-[#8b4513] uppercase opacity-60">Estoque Global</p>
              <div className="flex items-center gap-2">
                <Package2 size={14} className="text-[#8b4513]" />
                <span className="text-md font-black text-[#5d2e0a]">{globalStock} unidades</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex flex-col justify-center items-center text-center bg-[#fdfaf7] relative overflow-hidden group">
          <Award className="text-[#cd7f32] mb-1 group-hover:scale-110 transition-transform" size={32} />
          <p className="text-[9px] font-black text-[#8b4513] uppercase tracking-tighter">O Mais Pedido</p>
          <h4 className="text-lg font-black text-[#5d2e0a] mt-1">{dashboardStats.mostWanted}</h4>
          <div className="mt-2 bg-[#f1dfcf] px-4 py-1 rounded-full border border-[#c9a688] shadow-inner">
            <span className="text-[8px] font-black text-[#8b4513] uppercase">Top 1 da Semana</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 grass-bg opacity-5 rounded-full"></div>
        </div>
      </div>

      {/* NOVO: Barra de Categorias para Melhor Compreensão */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-4">
          <ListFilter size={16} className="text-[#8b4513]" />
          <h3 className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest">Navegar por Categorias de Itens</h3>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
          {categories.map(cat => {
            const count = getCountByCategory(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 shadow-md ${activeCategory === cat.id
                    ? 'grass-bg border-[#3d7a22] text-white'
                    : 'wood-panel border-[#c9a688] text-[#5d2e0a] hover:bg-[#f1dfcf]'
                  }`}
              >
                <Tag size={14} className={activeCategory === cat.id ? 'text-white' : 'text-[#8b4513]'} />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase leading-none">{cat.label}</p>
                  <p className={`text-[8px] font-bold ${activeCategory === cat.id ? 'text-white/70' : 'text-[#8b4513]/60'}`}>{count} itens</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Controls */}
      <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Filtrar por nome do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full wood-inner pl-12 pr-4 py-3 border border-[#c9a688] text-sm focus:ring-2 focus:ring-[#55a630] focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-[#8b4513] opacity-50" size={18} />
        </div>
      </div>

      {/* Products Table */}
      <div className="wood-panel rounded-[32px] border-2 border-[#c9a688] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#d2b48c] border-b-2 border-[#b38b6d]">
              <tr className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-widest">
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço (PC)</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-[#5d2e0a] divide-y divide-[#c9a688]">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-[#f1dfcf] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#c9a688] overflow-hidden shadow-sm">
                      <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-black text-base">{product.name}</h4>
                      <p className="text-[10px] font-bold text-[#8b4513] opacity-60 line-clamp-1">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase bg-[#f1dfcf] px-2 py-1 rounded border border-[#c9a688]">
                      {product.category === 'parceiros' ? 'Parceiros' : product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-black">
                      <Coins size={14} className="text-[#cd7f32]" /> {product.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {product.stock} un.
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 wood-inner hover:bg-[#d2b48c] transition-colors"
                        title="Editar Produto"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 wood-inner text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Excluir Produto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center opacity-40">
                    <p className="text-sm font-black uppercase">Nenhum item encontrado nesta categoria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8">{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Image Upload Area */}
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Imagem do Produto</label>
                  <div className="relative group">
                    <div className={`wood-inner border-2 border-[#c9a688] border-dashed rounded-3xl aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-all ${!formData.imageUrl ? 'bg-[#f1dfcf]/50' : 'bg-white'}`}>
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={removeImage} className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                              <X size={24} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-2 opacity-40">
                          <Camera size={48} className="mx-auto text-[#8b4513]" />
                          <p className="text-[10px] font-black uppercase">Nenhuma imagem</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="grass-bg w-full py-3 rounded-xl text-white font-black text-[10px] uppercase cursor-pointer hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-md border-b-4 border-[#3d7a22] mt-2">
                    <Upload size={16} /> {formData.imageUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                {/* Right Side Inputs */}
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome do Produto</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold" placeholder="Ex: Boné PetMatch Oficial" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold">
                      <option value="bones">Bonés</option>
                      <option value="adesivos">Adesivos</option>
                      <option value="parceiros">Empresas Parceiras</option>
                      <option value="moedas">Moedas</option>
                      <option value="cursos">Cursos</option>
                      <option value="canetas">Canetas</option>
                      <option value="camisetas">Camisetas</option>
                      <option value="acessorios">Acessórios</option>
                      <option value="brinquedos">Brinquedos</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Preço (PetCoins)</label>
                    <div className="relative">
                      <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cd7f32]" size={16} />
                      <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] outline-none font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Estoque Atual</label>
                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Descrição do Produto</label>
                  <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Explique os detalhes do item para os guardiões..." />
                </div>
              </div>

              <div className="p-4 wood-inner border border-[#c9a688] border-dashed">
                <p className="text-[10px] font-bold text-[#8b4513] leading-tight flex items-start gap-2">
                  <LayoutGrid size={14} className="flex-shrink-0" />
                  A imagem enviada será otimizada para visualização na loja de recompensas. Use fotos claras e com fundo neutro para melhor destaque.
                </p>
              </div>

              <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3 transition-transform hover:scale-[1.01]">
                <Save size={24} /> {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStore;
