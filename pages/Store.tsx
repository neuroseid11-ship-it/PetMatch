
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Coins, ShoppingCart, Filter, Search,
  Tag, CheckCircle, Info, X, TrendingUp, BarChart3,
  Package2, Award, ArrowUpRight, History, PlusCircle, CreditCard, Loader2,
  ShieldCheck, Settings, DollarSign, Recycle, Wrench, Upload, Camera, AlertTriangle, Send, Trash2, Clock, Plus
} from 'lucide-react';
import { Product, PlatformUser, GarageItem } from '../types';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { garageService } from '../services/garageService';
import { messageService } from '../services/messageService';

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | Product['category'] | 'garagem'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [boughtProduct, setBoughtProduct] = useState<any>(null);

  // Estados para Compra de PetCoins
  const [isBuyCoinsModalOpen, setIsBuyCoinsModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(100);
  const [isBuying, setIsBuying] = useState(false);
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Valor configurável do PetCoin (Admin)
  const [petCoinPrice, setPetCoinPrice] = useState<number>(1.00);

  // Estados Mercado de Garagem (Popup do Usuário)
  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);
  const [isGarageRegisterOpen, setIsGarageRegisterOpen] = useState(false);
  const [allGarageItems, setAllGarageItems] = useState<GarageItem[]>([]);
  const [myGarageItems, setMyGarageItems] = useState<GarageItem[]>([]);
  const [newGarageItem, setNewGarageItem] = useState({ name: '', price: 50, imageUrl: '' });
  const [isGarageSuccess, setIsGarageSuccess] = useState(false);

  useEffect(() => {
    loadData();
    const role = localStorage.getItem('petmatch_user_role');
    setIsAdmin(role === 'admin');

    const savedPrice = localStorage.getItem('petmatch_petcoin_price');
    if (savedPrice) setPetCoinPrice(parseFloat(savedPrice));
  }, []);

  const loadData = async () => {
    const fetchedProducts = await productService.getAll();
    setProducts(fetchedProducts);
    setAllGarageItems(garageService.getApproved());
    await loadUser();
  };

  const loadUser = async () => {
    const email = localStorage.getItem('petmatch_user_email');
    if (email) {
      try {
        const users = await userService.getAll();
        const user = users.find(u => u.email === email);
        if (user) {
          setCurrentUser(user);
          setMyGarageItems(garageService.getBySeller(email));
        } else if (email === 'admin@petmatch.com.br') {
          setCurrentUser({ id: 'admin', name: 'Admin', email, coins: 9999 } as any);
          setMyGarageItems(garageService.getBySeller(email));
        }
      } catch (err) {
        console.error("Erro ao carregar usuario na loja:", err);
      }
    }
  };

  const handleBuy = (item: any) => {
    setBoughtProduct(item);
    setIsSuccessModalOpen(true);
  };

  const handleConfirmBuyCoins = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyAmount <= 0) return;

    setIsBuying(true);
    setTimeout(() => {
      if (currentUser) {
        const newBalance = currentUser.coins + buyAmount;
        userService.update(currentUser.id, { coins: newBalance });
        loadUser();
        window.dispatchEvent(new Event('storage'));
      }
      setIsBuying(false);
      setIsBuyCoinsModalOpen(false);
      alert(`Sucesso! ${buyAmount} PetCoins foram adicionados à sua carteira.`);
    }, 2000);
  };

  const handleGarageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGarageItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGarageItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGarageItem.imageUrl) return alert("Selecione uma foto!");

    const savedItem = garageService.save(newGarageItem);

    messageService.send({
      petId: 'garage-system',
      petName: `Item Mercado: ${savedItem.name}`,
      petImage: savedItem.imageUrl,
      userName: currentUser?.name || 'Guardião',
      userEmail: currentUser?.email || 'email@petmatch.com.br',
      message: `Solicitação de autorização para venda de item usado: ${savedItem.name} por ${savedItem.price} PetCoins.`,
      type: 'garage_approval',
      relatedId: savedItem.id
    });

    setIsGarageSuccess(true);
    setTimeout(() => {
      setIsGarageRegisterOpen(false);
      setIsGarageSuccess(false);
      setNewGarageItem({ name: '', price: 50, imageUrl: '' });
      loadData();
    }, 3000);
  };

  const handleDeleteMyItem = (id: string) => {
    if (window.confirm("Deseja remover este anúncio definitivamente?")) {
      garageService.delete(id);
      loadData();
    }
  };

  const combinedDisplayItems = useMemo(() => {
    const official = products.map(p => ({ ...p, isOfficial: true }));
    const garage = allGarageItems.map(g => ({ ...g, isOfficial: false, category: 'garagem' as const }));

    const all = [...official, ...garage];

    return all.filter(item => {
      const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const price = item.price;
      const min = minPrice === '' ? 0 : parseInt(minPrice);
      const max = maxPrice === '' ? Infinity : parseInt(maxPrice);
      const matchesPrice = price >= min && price <= max;

      return matchesFilter && matchesSearch && matchesPrice;
    });
  }, [products, allGarageItems, activeFilter, searchTerm, minPrice, maxPrice]);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'garagem', label: 'Desapegos' },
    { id: 'alimentos', label: 'Alimentos' },
    { id: 'higiene', label: 'Higiene' },
    { id: 'brinquedos', label: 'Brinquedos' },
    { id: 'acessorios', label: 'Acessórios' },
    { id: 'parceiros', label: 'Empresas Parceiras' },
    { id: 'cursos', label: 'Cursos' },
    { id: 'bones', label: 'Bonés' },
    { id: 'camisetas', label: 'Camisetas' },
    { id: 'adesivos', label: 'Adesivos' },
    { id: 'moedas', label: 'Moedas' },
    { id: 'canetas', label: 'Canetas' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Hero Store Header */}
      <header className="wood-panel p-10 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 grass-bg px-4 py-1.5 border-2 border-[#3d7a22] shadow-lg mb-2">
              <ShoppingBag className="text-white w-4 h-4" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Loja de Recompensas</span>
            </div>
            <h1 className="text-5xl font-black text-[#5d2e0a]">Troque seus PetCoins</h1>
            <p className="text-[#8b4513] font-medium leading-relaxed">
              Use as moedas que você ganhou completando missões e ajudando a rede para adquirir itens exclusivos e apoiar ainda mais a causa animal.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-6">
              <div className="flex items-center gap-2 bg-[#f1dfcf] px-6 py-4 rounded-[20px] border-2 border-[#c9a688]/40 text-sm font-black text-[#5d2e0a] shadow-inner whitespace-nowrap">
                <Coins className="w-5 h-5 text-[#cd7f32]" /> {currentUser?.coins.toLocaleString() || '0'} PC Disponíveis
              </div>

              {/* Botão Comprar PetCoins - Agora no modelo wood-panel conforme solicitado */}
              <button
                onClick={() => setIsBuyCoinsModalOpen(true)}
                className="w-full sm:w-auto wood-panel px-8 py-4 rounded-2xl text-[#5d2e0a] font-black text-xs border-2 border-[#c9a688] flex items-center justify-center gap-2 hover:bg-[#d2b48c] transition-all shadow-md uppercase"
              >
                <Plus size={16} className="text-[#55a630]" /> Comprar PetCoins
              </button>

              {/* Botão Mercado de Garagem - Voltado ao estilo wood-panel original */}
              <button
                onClick={() => setIsGarageModalOpen(true)}
                className="w-full sm:w-auto wood-panel px-8 py-4 rounded-2xl text-[#5d2e0a] font-black text-xs border-2 border-[#c9a688] flex items-center justify-center gap-2 hover:bg-[#d2b48c] transition-all shadow-md uppercase"
              >
                <Recycle size={16} className="text-[#cd7f32]" /> Mercado de Garagem
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 grass-bg blur-3xl opacity-20 -z-10"></div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1036/1036815.png"
              alt="Chest Rewards"
              className="w-48 h-48 drop-shadow-2xl animate-bounce duration-[4000ms]"
            />
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center lg:justify-between bg-[#e6cbb3] p-1.5 rounded-[28px] border-2 border-[#c9a688] shadow-inner gap-2">
          <div className="flex flex-wrap justify-center gap-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id as any)}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeFilter === cat.id ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/40 px-4 py-1.5 rounded-2xl border border-[#c9a688]/50 lg:ml-2">
            <span className="text-[10px] font-black text-[#5d2e0a] uppercase tracking-tighter opacity-70">Valor:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-16 wood-inner bg-white/80 py-1.5 px-2 text-[10px] font-black text-[#5d2e0a] border border-[#c9a688] outline-none placeholder:italic placeholder:opacity-50"
              />
              <span className="text-[#8b4513] font-bold text-[10px] italic">até</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-16 wood-inner bg-white/80 py-1.5 px-2 text-[10px] font-black text-[#5d2e0a] border border-[#c9a688] outline-none placeholder:italic placeholder:opacity-50"
              />
              <Coins size={12} className="text-[#cd7f32] ml-0.5" />
            </div>
          </div>
        </div>

        <div className="bg-[#e6cbb3] p-1.5 rounded-[28px] border-2 border-[#c9a688] shadow-inner">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full wood-inner pl-12 pr-4 py-4 rounded-[22px] border border-[#c9a688] text-sm focus:outline-none focus:ring-2 focus:ring-[#55a630]/20 text-[#5d2e0a] italic"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] opacity-40" size={20} />
          </div>
        </div>
      </div>

      {/* Grid de Produtos Unificado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {combinedDisplayItems.map((item: any) => (
          <div key={item.id} className="wood-panel p-3 rounded-[32px] border-2 border-[#c9a688] shadow-lg group hover:translate-y-[-4px] transition-all flex flex-col">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <div className={`backdrop-blur-sm px-3 py-1 border border-[#c9a688] rounded-full shadow-sm ${item.isOfficial ? 'bg-[#f1dfcf]/90' : 'bg-blue-500/90'}`}>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${item.isOfficial ? 'text-[#8b4513]' : 'text-white'}`}>
                    {item.isOfficial ? (item.category === 'parceiros' ? 'Parceiros' : item.category) : 'Desapego'}
                  </span>
                </div>
              </div>
              {item.isOfficial && item.stock <= 5 && item.stock > 0 && (
                <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  Poucas Unidades!
                </div>
              )}
            </div>

            <div className="px-2 pb-2 space-y-3 flex-1 flex flex-col">
              <div>
                <h3 className="text-xl font-black text-[#5d2e0a]">{item.name}</h3>
                <p className="text-[10px] font-medium text-[#8b4513] italic line-clamp-2 h-8 leading-tight">{item.description || 'Item usado em ótimo estado, negociado por PetCoins.'}</p>
              </div>

              <div className="mt-auto pt-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-2xl font-black text-[#5d2e0a]">
                    <Coins size={20} className="text-[#cd7f32]" /> {item.price}
                  </div>
                  {item.isOfficial && <span className="text-[9px] font-bold text-[#8b4513] opacity-60">Estoque: {item.stock}</span>}
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={item.stock === 0}
                  className="w-full grass-bg py-3 rounded-xl text-white font-black text-sm shadow-xl hover:scale-[1.02] transition-transform border-b-4 border-[#3d7a22] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  Resgatar Agora <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: COMPRAR PETCOINS */}
      {isBuyCoinsModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsBuyCoinsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md z-10"><X size={24} /></button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl">
                <Coins className="text-white" size={40} />
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">Comprar PetCoins</h2>
                <p className="text-[#8b4513] font-bold text-xs uppercase tracking-widest mt-1 italic">Recarregue sua carteira solidária</p>
              </div>

              <form onSubmit={handleConfirmBuyCoins} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Quantidade de PetCoins</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cd7f32]" size={20} />
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={buyAmount}
                      onChange={e => setBuyAmount(parseInt(e.target.value) || 0)}
                      className="w-full wood-inner pl-12 pr-4 py-4 text-2xl font-black border-2 border-[#c9a688] outline-none text-center"
                    />
                  </div>
                </div>

                <div className="wood-inner p-4 border border-[#c9a688] bg-white/50 flex justify-between items-center">
                  <span className="text-xs font-black text-[#8b4513] uppercase">Valor Total:</span>
                  <span className="text-2xl font-black text-[#5d2e0a]">R$ {(buyAmount * petCoinPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
                  <Info size={20} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-800 leading-tight text-left">
                    O pagamento via PIX será processado e suas moedas serão creditadas instantaneamente após a confirmação.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isBuying || buyAmount <= 0}
                  className="w-full grass-bg py-5 rounded-3xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  {isBuying ? <><Loader2 className="animate-spin" /> Processando...</> : <><CreditCard size={24} /> Confirmar Compra</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MERCADO DE GARAGEM (GESTÃO PESSOAL) */}
      {isGarageModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-5xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsGarageModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"><X size={24} /></button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-[#c9a688]/30 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 grass-bg rounded-2xl flex items-center justify-center text-white border-2 border-[#3d7a22] shadow-lg">
                  <Recycle size={32} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-[#5d2e0a] uppercase tracking-tighter leading-none">Meus Desapegos</h2>
                  <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest mt-1 italic">Gestão dos seus itens anunciados no Mercado de Garagem.</p>
                </div>
              </div>
              <button
                onClick={() => setIsGarageRegisterOpen(true)}
                className="grass-bg px-8 py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:scale-105 transition-transform flex items-center gap-2"
              >
                <PlusCircle size={24} /> Anunciar Novo Item
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-4">
              {myGarageItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGarageItems.map(item => (
                    <div key={item.id} className="wood-panel p-4 rounded-[32px] border-2 border-[#c9a688] bg-white shadow-lg relative group">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        <div className="absolute top-2 right-2">
                          <span className={`text-[7px] font-black px-2 py-1 rounded-full border uppercase shadow-sm ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                              'bg-red-50 text-red-600 border-red-200'
                            }`}>
                            {item.status === 'approved' ? 'No Ar' : item.status === 'pending' ? 'Em Análise' : 'Recusado'}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-[#5d2e0a] truncate">{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1 text-sm font-black text-[#cd7f32]">
                          <Coins size={14} /> {item.price}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteMyItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <Tag size={64} className="mx-auto text-[#8b4513] opacity-20" />
                  <h3 className="text-xl font-black text-[#5d2e0a]">Você não anunciou nada ainda</h3>
                  <p className="text-sm font-bold">Ganhe PetCoins desapegando de itens pet que não usa mais!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR ITEM GARAGEM */}
      {isGarageRegisterOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsGarageRegisterOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24} /></button>

            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8 text-center uppercase tracking-tighter flex items-center justify-center gap-2">
              <Tag size={28} className="text-[#55a630]" /> Cadastrar Desapego
            </h2>

            {isGarageSuccess ? (
              <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#5d2e0a] uppercase tracking-tighter">Enviado para Análise</h3>
                  <p className="text-sm text-[#8b4513] font-medium italic mt-2">O Admin verificará seu anúncio. Você será notificado assim que for aprovado!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveGarageItem} className="space-y-6">
                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase">Foto do Item</label>
                  <div className="aspect-video wood-inner border-4 border-[#c9a688] border-dashed rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden bg-white/50 group">
                    {newGarageItem.imageUrl ? (
                      <img src={newGarageItem.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera size={48} className="text-[#8b4513] opacity-20" />
                    )}
                    <input type="file" accept="image/*" hidden id="garage-img" onChange={handleGarageFileChange} />
                    <label htmlFor="garage-img" className="absolute inset-0 cursor-pointer"></label>
                  </div>
                  <p className="text-[8px] font-bold text-[#8b4513] italic">Fotos de alta qualidade ajudam a vender mais rápido!</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome do Item</label>
                  <input required value={newGarageItem.name} onChange={e => setNewGarageItem({ ...newGarageItem, name: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold" placeholder="Ex: Bebedouro Automático" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Valor Desejado (PetCoins)</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cd7f32]" size={16} />
                    <input required type="number" min="1" value={newGarageItem.price} onChange={e => setNewGarageItem({ ...newGarageItem, price: parseInt(e.target.value) })} className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] outline-none font-bold" />
                  </div>
                </div>

                <div className="p-4 wood-inner border border-red-200 border-dashed flex gap-3 bg-red-50/50">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-red-600 leading-tight">Ao cadastrar, você declara que o item não é um animal vivo. Infrações levam ao banimento imediato da conta.</p>
                </div>

                <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] hover:translate-y-[-2px] transition-transform">
                  Publicar Anúncio <Upload size={24} className="inline ml-2" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-sm rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-10 text-center animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsSuccessModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={20} /></button>
            <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl mb-6 animate-bounce">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#5d2e0a]">Resgate Concluído!</h2>
            <p className="text-sm text-[#8b4513] font-medium italic mt-2">
              Você adquiriu o item <strong>{boughtProduct?.name}</strong>.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full mt-8 wood-panel bg-[#f1dfcf] py-3 rounded-xl font-black text-[#5d2e0a] uppercase tracking-widest hover:bg-[#d2b48c] transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
