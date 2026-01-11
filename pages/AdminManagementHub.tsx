
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Settings, Database, Building2, Users, Inbox,
  ShoppingBag, ChevronRight, AlertCircle,
  CheckCircle, Dog, Cat, MessageSquare, Package, TrendingUp,
  FileDown, X, Calendar, Download, Loader2, BarChart3, PieChart, ListFilter, Search, ArrowRight, Coins, Save, Layout as LayoutIcon,
  Medal, Target, Trophy, FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { petService } from '../services/petService';
import { ongService } from '../services/ongService';
import { userService } from '../services/userService';
import { messageService } from '../services/messageService';
import { productService } from '../services/productService';
import { logService } from '../services/logService';
import { RegisteredPet, PlatformUser } from '../types';
import PageHeader from '../components/PageHeader';
import HubCard from '../components/HubCard';
import TabButton from '../components/TabButton';
import ExcelExporter from '../utils/excelExporter';

// jsPDF types handled via any to avoid conflicts with autotable extension




const AdminManagementHub: React.FC = () => {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    module: 'all',
    period: '7',
    customDays: '',
    dateFilter: 'all' as 'all' | '7d' | '30d' | '90d' | 'custom',
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    documentNumber: '',
    category: 'petshop' as 'petshop' | 'clinica' | 'servico',
    about: ''
  });

  const [activeTab, setActiveTab] = useState<'animals' | 'users' | 'messages' | 'store'>('animals');
  const [searchTerm, setSearchTerm] = useState('');
  const [petCoinPrice, setPetCoinPrice] = useState<number>(1.00);

  const [allPets, setAllPets] = useState<RegisteredPet[]>([]);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);

  const [stats, setStats] = useState({
    pets: { total: 0, dogs: 0, cats: 0, trend: [10, 12, 11, 15, 14, 18, 20] },
    ongs: { total: 0, trend: [2, 2, 3, 3, 4, 4, 5] },
    users: { total: 0, pending: 0, trend: [40, 45, 42, 50, 55, 53, 60] },
    messages: { total: 0, pending: 0, trend: [5, 8, 12, 7, 10, 15, 13] },
    store: { total: 0, lowStock: 0, trend: [20, 18, 25, 22, 30, 28, 35] }
  });

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem('petmatch_user_role');
      if (role !== 'admin') {
        navigate('/');
        return;
      }

      const savedPrice = localStorage.getItem('petmatch_petcoin_price');
      if (savedPrice) setPetCoinPrice(parseFloat(savedPrice));

      const pets = await petService.getAll();
      setAllPets(pets);
      const users = await userService.listAllFromFirestore();
      setAllUsers(users);
      const allMessages = messageService.getAll();
      const allOngs = await ongService.getAll();
      const allProducts = await productService.getAll();

      setStats(prev => ({
        ...prev,
        pets: {
          ...prev.pets,
          total: pets.length,
          dogs: pets.filter(p => p.type === 'dog').length,
          cats: pets.filter(p => p.type === 'cat').length
        },
        ongs: {
          ...prev.ongs,
          total: allOngs.length
        },
        users: {
          ...prev.users,
          total: users.length,
          pending: users.filter(u => u.status === 'pending').length
        },
        messages: {
          ...prev.messages,
          total: allMessages.length,
          pending: allMessages.filter(m => m.status === 'pending').length
        },
        store: {
          ...prev.store,
          total: allProducts.length,
          lowStock: allProducts.filter(p => p.stock <= 5).length
        }
      }));
    };
    fetchData();
  }, [navigate]);

  // Dashboard data filtering
  const [filteredStoreProducts, setFilteredStoreProducts] = useState<any[]>([]);
  useEffect(() => {
    const filterStore = async () => {
      if (activeTab === 'store') {
        const products = await productService.getAll();
        setFilteredStoreProducts(products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    };
    filterStore();
  }, [activeTab, searchTerm]);

  const dashboardData = useMemo(() => {
    switch (activeTab) {
      case 'animals':
        return allPets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'users':
        return allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'messages':
        return messageService.getAll().filter(m => m.petName.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'store':
        return filteredStoreProducts;
      default:
        return [];
    }
  }, [activeTab, searchTerm, allPets, allUsers, filteredStoreProducts]);

  const [storeChartData, setStoreChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadStoreChart = async () => {
      if (activeTab === 'store') {
        const prods = await productService.getAll();
        const catCount = prods.reduce((acc: any, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        setStoreChartData(Object.entries(catCount).map(([cat, count]) => ({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: count as number,
          color: '#cd7f32'
        })).slice(0, 4));
      }
    }
    loadStoreChart();
  }, [activeTab]);

  const chartData = useMemo(() => {
    if (activeTab === 'animals') {
      return [
        { label: 'Cachorros', value: stats.pets.dogs, color: '#8b4513' },
        { label: 'Gatos', value: stats.pets.cats, color: '#55a630' }
      ];
    }
    if (activeTab === 'users') {
      return [
        { label: 'Voluntários', value: allUsers.filter(u => u.type === 'volunteer').length, color: '#55a630' },
        { label: 'Parceiros', value: allUsers.filter(u => u.type === 'partner').length, color: '#cd7f32' }
      ];
    }
    if (activeTab === 'messages') {
      const msgs = messageService.getAll();
      return [
        { label: 'Adoção', value: msgs.filter(m => m.type === 'interest').length, color: '#3b82f6' },
        { label: 'Visitas', value: msgs.filter(m => m.type === 'visit').length, color: '#55a630' },
        { label: 'Outros', value: msgs.filter(m => m.type !== 'interest' && m.type !== 'visit').length, color: '#8b4513' }
      ];
    }
    if (activeTab === 'store') {
      return storeChartData;
    }
    return [];
  }, [activeTab, stats, allUsers, storeChartData]);

  const handleSavePrice = () => {
    localStorage.setItem('petmatch_petcoin_price', petCoinPrice.toString());
    alert(`Valor do PetCoin atualizado para R$ ${petCoinPrice.toFixed(2)}`);
  };

  const handleExtractReport = async () => {
    try {
      setIsGenerating(true);

      // Import PDF generators
      const {
        generatePetReport,
        generateUserReport,
        generateFullReport,
        generateOngReport,
        generateMessageReport,
        generateStoreReport,
        generateGamificationReport,
        generatePartnerReport,
        generateScheduleReport
      } = await import('../utils/pdfGenerator');

      // Fetch data based on module
      if (reportConfig.module === 'animals') {
        const pets = await petService.getAll();
        generatePetReport(pets);
      } else if (reportConfig.module === 'users') {
        const users = await userService.listAllFromFirestore();
        generateUserReport(users);
      } else if (reportConfig.module === 'ongs') {
        const ongs = await ongService.getAll();
        const pets = await petService.getAll();
        generateOngReport(ongs, pets);
      } else if (reportConfig.module === 'messages') {
        const messages = messageService.getAll();
        generateMessageReport(messages);
      } else if (reportConfig.module === 'store') {
        const products = await productService.getAll();
        generateStoreReport(products);
      } else if (reportConfig.module === 'gamification') {
        const { missionService } = await import('../services/missionService');
        const { default: RankingService } = await import('../services/rankingService');
        const missions = await missionService.getAll();
        const ranking = await RankingService.getAll();
        generateGamificationReport(missions, ranking);
      } else if (reportConfig.module === 'partners') {
        const users = await userService.listAllFromFirestore();
        const partners = users.filter(u => u.type === 'partner');
        generatePartnerReport(partners);
      } else if (reportConfig.module === 'schedules') {
        const { default: VisitService } = await import('../services/visitService');
        const visits = await VisitService.getAll();
        generateScheduleReport(visits);
      } else {
        // All modules - Relatório Completo
        const pets = await petService.getAll();
        const users = await userService.listAllFromFirestore();
        const ongs = await ongService.getAll();
        const messages = messageService.getAll();
        const products = await productService.getAll();
        const { missionService } = await import('../services/missionService');
        const { default: RankingService } = await import('../services/rankingService');
        const { default: VisitService } = await import('../services/visitService');
        const missions = await missionService.getAll();
        const ranking = await RankingService.getAll();
        const partners = users.filter(u => u.type === 'partner');
        const visits = await VisitService.getAll();

        await generateFullReport(pets, users, ongs, messages, products, missions, ranking, partners, visits);
      }

      await logService.add({
        action: 'RELATÓRIO',
        module: 'system',
        details: `Relatório de ${reportConfig.module} gerado em PDF.`,
        severity: 'info'
      });

      setIsReportModalOpen(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar o relatório PDF. Verifique o console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtractExcel = async () => {
    try {
      setIsGenerating(true);

      if (reportConfig.module === 'animals') {
        const pets = await petService.getAll();
        ExcelExporter.exportPets(pets);
      } else if (reportConfig.module === 'users') {
        const users = await userService.listAllFromFirestore();
        ExcelExporter.exportUsers(users);
      } else if (reportConfig.module === 'ongs') {
        const ongs = await ongService.getAll();
        const pets = await petService.getAll();
        ExcelExporter.exportOngs(ongs, pets);
      } else if (reportConfig.module === 'messages') {
        const messages = messageService.getAll();
        ExcelExporter.exportMessages(messages);
      } else if (reportConfig.module === 'store') {
        const products = await productService.getAll();
        ExcelExporter.exportStore(products);
      } else if (reportConfig.module === 'gamification') {
        const { missionService } = await import('../services/missionService');
        const { default: RankingService } = await import('../services/rankingService');
        const missions = await missionService.getAll();
        const ranking = await RankingService.getAll();
        ExcelExporter.exportGamification(missions, ranking);
      } else if (reportConfig.module === 'partners') {
        const users = await userService.listAllFromFirestore();
        const partners = users.filter(u => u.type === 'partner');
        ExcelExporter.exportPartners(partners);
      } else if (reportConfig.module === 'schedules') {
        const { default: VisitService } = await import('../services/visitService');
        const visits = await VisitService.getAll();
        ExcelExporter.exportSchedules(visits);
      } else {
        // All modules - relatório completo
        const pets = await petService.getAll();
        const users = await userService.listAllFromFirestore();
        const ongs = await ongService.getAll();
        const messages = messageService.getAll();
        const products = await productService.getAll();
        const { missionService } = await import('../services/missionService');
        const { default: RankingService } = await import('../services/rankingService');
        const { default: VisitService } = await import('../services/visitService');
        const missions = await missionService.getAll();
        const ranking = await RankingService.getAll();
        const partners = users.filter(u => u.type === 'partner');
        const visits = await VisitService.getAll();

        ExcelExporter.exportFullReport({
          pets, users, ongs, messages, products,
          missions, ranking, partners, visits
        });
      }

      logService.add({
        action: 'excel_export',
        module: 'system',
        details: `Relatório de ${reportConfig.module} exportado em Excel.`,
        severity: 'info'
      });

      alert('Arquivo Excel baixado com sucesso!');
      setIsReportModalOpen(false);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao gerar arquivo Excel. Verifique o console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await userService.register({
        name: newPartner.name,
        email: newPartner.email,
        type: 'partner',
        documentNumber: newPartner.documentNumber,
        photoUrl: 'https://cdn-icons-png.flaticon.com/512/2809/2809796.png', // Default icon
        documentFileUrl: 'admin-generated',
        partnerProfile: {
          id: '', // Will be generated
          name: newPartner.name,
          about: newPartner.about,
          bannerUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80',
          logoUrl: 'https://cdn-icons-png.flaticon.com/512/2809/2809796.png',
          location: 'Brasília, DF',
          neighborhood: 'Asa Norte',
          category: newPartner.category,
          is24h: false,
          phone: '(61) 99999-9999',
          email: newPartner.email,
          instagram: '',
          promotions: [],
          top: '50%',
          left: '50%'
        }
      });

      await logService.add({
        action: 'CADASTRO',
        module: 'users',
        details: `Novo parceiro registrado: ${newPartner.name} (${newPartner.category}).`,
        severity: 'info'
      });

      alert("Empresa parceira cadastrada com sucesso!");
      setIsPartnerModalOpen(false);
      setNewPartner({ name: '', email: '', documentNumber: '', category: 'petshop', about: '' });
      // Refresh data
      const users = await userService.listAllFromFirestore();
      setAllUsers(users);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar parceiro.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <PageHeader
        title="Painel de Gestão"
        subtitle="Visão geral e controle administrativo."
        icon={<Settings className="animate-spin-slow" size={24} />}
      >
        <button
          onClick={() => navigate('/admin/parceiros')}
          className="wood-panel px-6 py-2.5 rounded-xl text-[#5d2e0a] font-black text-[11px] uppercase flex items-center gap-2 border-b-4 border-[#c9a688] hover:bg-[#d2b48c] transition-all group"
        >
          <Building2 className="group-hover:scale-110 transition-transform" size={16} />
          Nova Empresa
        </button>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="wood-panel px-6 py-2.5 rounded-xl text-[#5d2e0a] font-black text-[11px] uppercase flex items-center gap-2 border-b-4 border-[#c9a688] hover:bg-[#d2b48c] transition-all group"
        >
          <FileDown className="group-hover:translate-y-0.5 transition-transform" size={16} />
          Extrair Relatório
        </button>
      </PageHeader>

      <section className="space-y-6">
        <div className="wood-panel rounded-[40px] border-4 border-[#c9a688] shadow-2xl overflow-hidden bg-white">
          <div className="bg-[#fdfaf7] border-b-4 border-[#c9a688] p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex bg-[#e6cbb3] p-1 rounded-2xl border border-[#c9a688] shadow-inner overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'animals'} onClick={() => setActiveTab('animals')} icon={<Dog size={16} />} label="Animais" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Comunidade" />
              <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<Inbox size={16} />} label="Central" />
              <TabButton active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<ShoppingBag size={16} />} label="Inventário" />
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Filtrar dados na tabela..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full wood-inner pl-10 pr-4 py-2 text-xs border border-[#c9a688] outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-[#8b4513] opacity-40" size={14} />
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#5d2e0a] uppercase flex items-center gap-2">
                  <PieChart size={18} className="text-[#55a630]" /> Distribuição do Módulo
                </h3>
              </div>

              <div className="wood-inner p-6 border-2 border-dashed border-[#c9a688] flex flex-col gap-6">
                {chartData.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-[#8b4513] uppercase">{item.label}</span>
                      <span className="text-xs font-black text-[#5d2e0a]">{item.value}</span>
                    </div>
                    <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden border border-[#c9a688]/30">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{
                          backgroundColor: item.color,
                          width: `${(item.value / Math.max(dashboardData.length, 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 wood-panel bg-[#fffdf0] border-[#cd7f32] rounded-[24px] flex flex-col gap-4 shadow-lg group border-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-md border border-[#cd7f32]/20 group-hover:rotate-6 transition-transform">
                    <Coins className="text-[#cd7f32]" size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#8b4513] uppercase tracking-widest leading-none mb-1">Câmbio de Moeda</p>
                    <h4 className="text-sm font-black text-[#5d2e0a] uppercase tracking-tighter">Valor do PetCoin</h4>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8b4513]">R$</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0.10"
                      value={petCoinPrice}
                      onChange={(e) => setPetCoinPrice(parseFloat(e.target.value) || 0)}
                      className="w-full wood-inner pl-10 pr-4 py-3 text-sm font-black border-2 border-[#c9a688] outline-none"
                      placeholder="1.00"
                    />
                  </div>
                  <button
                    onClick={handleSavePrice}
                    className="grass-bg px-6 py-3 text-white font-black text-[11px] uppercase shadow-xl border-b-4 border-[#3d7a22] hover:scale-105 active:translate-y-1 transition-all"
                  >
                    <Save size={14} /> Definir
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-[#5d2e0a] uppercase flex items-center gap-2">
                <ListFilter size={18} className="text-[#55a630]" /> Relatório Analítico
              </h3>

              <div className="wood-inner border-2 border-[#c9a688] rounded-3xl overflow-hidden shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-[#d2b48c]/30 border-b border-[#c9a688] sticky top-0 backdrop-blur-sm">
                    <tr className="text-[9px] font-black text-[#8b4513] uppercase">
                      <th className="px-4 py-3">Identificação</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c9a688]/30 text-[#5d2e0a]">
                    {dashboardData.slice(0, 10).map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#f1dfcf]/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-[#c9a688] overflow-hidden flex-shrink-0">
                              <img src={item.photoUrl || item.imageUrl || (item.images ? item.images[0] : item.petImage)} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-tighter leading-none">{item.name || item.petName || item.title}</p>
                              <p className="text-[8px] font-bold text-[#8b4513] opacity-60 mt-0.5">{item.email || item.breed || 'Registro Ativo'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${item.status === 'approved' || item.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}>
                            {item.status || item.category || item.adoptionType || 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate(activeTab === 'animals' ? `/pet/${item.id}` : activeTab === 'users' ? `/perfil/${item.id}` : `/admin/${activeTab}`)}
                            className="text-[#55a630] hover:scale-110 transition-transform"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <HubCard title="Animais" path="/admin/pets" icon={<Database size={24} />} chartData={stats.pets.trend} color="bg-[#f1dfcf]" accent="border-[#8b4513]" textColor="text-[#8b4513]" chartColor="#8b4513"
          stats={[
            { label: 'Total', value: stats.pets.total, icon: <CheckCircle size={10} /> },
            { label: 'Cães', value: stats.pets.dogs, icon: <Dog size={10} /> },
            { label: 'Gatos', value: stats.pets.cats, icon: <Cat size={10} /> }
          ]}
        />
        <HubCard title="ONGs" path="/admin/ongs" icon={<Building2 size={24} />} chartData={stats.ongs.trend} color="bg-[#fff5f5]" accent="border-[#ff6b6b]" textColor="text-[#ff6b6b]" chartColor="#ff6b6b"
          stats={[
            { label: 'Ativas', value: stats.ongs.total, icon: <Building2 size={10} /> }
          ]}
        />
        <HubCard title="Usuários" path="/admin/users" icon={<Users size={24} />} chartData={stats.users.trend} color="bg-[#f1fcf1]" accent="border-[#55a630]" textColor="text-[#55a630]" chartColor="#55a630"
          stats={[
            { label: 'Total', value: stats.users.total, icon: <Users size={10} /> },
            { label: 'Pendentes', value: stats.users.pending, icon: <AlertCircle size={10} /> }
          ]}
        />
        <HubCard title="Mensagens" path="/admin/messages" icon={<Inbox size={24} />} chartData={stats.messages.trend} color="bg-[#f0f7ff]" accent="border-blue-500" textColor="text-blue-600" chartColor="#3b82f6"
          stats={[
            { label: 'Total', value: stats.messages.total, icon: <MessageSquare size={10} /> },
            { label: 'Novas', value: stats.messages.pending, icon: <AlertCircle size={10} /> }
          ]}
        />
        <HubCard title="Loja" path="/admin/loja" icon={<ShoppingBag size={24} />} chartData={stats.store.trend} color="bg-[#fffdf0]" accent="border-[#cd7f32]" textColor="text-[#cd7f32]" chartColor="#cd7f32"
          stats={[
            { label: 'Produtos', value: stats.store.total, icon: <Package size={10} /> }
          ]}
        />
        <HubCard title="Gamificação" path="/admin/missions" icon={<Medal size={24} />} chartData={[10, 20, 15, 25, 30]} color="bg-[#f0f9ff]" accent="border-[#0284c7]" textColor="text-[#0284c7]" chartColor="#0284c7"
          stats={[
            { label: 'Missões', value: 3, icon: <Target size={10} /> },
            { label: 'Ranking', value: 12, icon: <Trophy size={10} /> }
          ]}
        />
        <HubCard title="Parceiros" path="/admin/parceiros" icon={<Building2 size={24} />} chartData={[5, 10, 15, 20]} color="bg-[#f0fff4]" accent="border-[#55a630]" textColor="text-[#55a630]" chartColor="#55a630"
          stats={[
            { label: 'Total', value: allUsers.filter(u => u.type === 'partner').length, icon: <Users size={10} /> }
          ]}
        />
        <HubCard title="Agendamentos" path="/admin/visitas" icon={<Calendar size={24} />} chartData={[3, 5, 8, 12, 15]} color="bg-[#fff9f0]" accent="border-[#f59e0b]" textColor="text-[#f59e0b]" chartColor="#f59e0b"
          stats={[
            { label: 'Visitas', value: messageService.getAll().filter(m => m.type === 'visit').length, icon: <Calendar size={10} /> }
          ]}
        />
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-md rounded-[32px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95">
            <button onClick={() => setIsReportModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 grass-bg rounded-2xl mx-auto flex items-center justify-center text-white border-2 border-[#3d7a22] shadow-lg mb-4">
                <FileDown size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#5d2e0a]">Extração de Relatórios</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-1">
                  <Settings size={12} /> Módulo do Sistema
                </label>
                <select
                  value={reportConfig.module}
                  onChange={e => setReportConfig({ ...reportConfig, module: e.target.value })}
                  className="w-full wood-inner p-3 text-sm font-black border-2 border-[#c9a688] outline-none"
                >
                  <option value="all">Todos os Módulos</option>
                  <option value="animals">Animais</option>
                  <option value="ongs">ONGs</option>
                  <option value="users">Usuários</option>
                  <option value="messages">Mensagens</option>
                  <option value="store">Loja</option>
                  <option value="gamification">Gamificação</option>
                  <option value="partners">Parceiros</option>
                  <option value="schedules">Agendamentos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-1">
                  <Calendar size={12} /> Período
                </label>
                <select
                  value={reportConfig.dateFilter}
                  onChange={e => setReportConfig({ ...reportConfig, dateFilter: e.target.value as any })}
                  className="w-full wood-inner p-3 text-sm font-black border-2 border-[#c9a688] outline-none"
                >
                  <option value="all">Todos os Registros</option>
                  <option value="7d">Últimos 7 Dias</option>
                  <option value="30d">Últimos 30 Dias</option>
                  <option value="90d">Últimos 90 Dias</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {reportConfig.dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-4 wood-inner border-2 border-dashed border-[#c9a688] rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#8b4513] uppercase ml-1">Data Início</label>
                    <input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={e => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                      className="w-full wood-inner p-2 text-xs border border-[#c9a688] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#8b4513] uppercase ml-1">Data Fim</label>
                    <input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={e => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                      className="w-full wood-inner p-2 text-xs border border-[#c9a688] outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExtractReport}
                  disabled={isGenerating}
                  className="grass-bg py-4 rounded-2xl text-white font-black text-[11px] uppercase shadow-xl border-b-4 border-[#3d7a22] flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  PDF
                </button>
                <button
                  onClick={handleExtractExcel}
                  disabled={isGenerating}
                  className="bg-green-700 hover:bg-green-800 py-4 rounded-2xl text-white font-black text-[11px] uppercase shadow-xl border-b-4 border-green-900 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                  EXCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Cadastro Rápido de Parceiro */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsPartnerModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24} /></button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 grass-bg rounded-2xl mx-auto flex items-center justify-center text-white border-2 border-[#3d7a22] shadow-lg mb-4">
                <Building2 size={32} />
              </div>
              <h2 className="text-3xl font-black text-[#5d2e0a]">Novo Parceiro</h2>
              <p className="text-[#8b4513] font-medium italic">Cadastre uma nova empresa na rede PetMatch.</p>
            </div>

            <form onSubmit={handleRegisterPartner} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Nome da Empresa</label>
                  <input required value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} className="w-full wood-inner p-3 text-sm font-bold border-2 border-[#c9a688] outline-none" placeholder="Ex: PetShop Amigo" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">CNPJ</label>
                  <input required value={newPartner.documentNumber} onChange={e => setNewPartner({ ...newPartner, documentNumber: e.target.value })} className="w-full wood-inner p-3 text-sm border-2 border-[#c9a688] outline-none" placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">E-mail Corporativo</label>
                  <input required type="email" value={newPartner.email} onChange={e => setNewPartner({ ...newPartner, email: e.target.value })} className="w-full wood-inner p-3 text-sm border-2 border-[#c9a688] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Categoria</label>
                  <select value={newPartner.category} onChange={e => setNewPartner({ ...newPartner, category: e.target.value as any })} className="w-full wood-inner p-3 text-sm font-bold border-2 border-[#c9a688] outline-none">
                    <option value="petshop">Pet Shop</option>
                    <option value="clinica">Clínica Veterinária</option>
                    <option value="servico">Serviços</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Sobre a Empresa</label>
                <textarea rows={3} value={newPartner.about} onChange={e => setNewPartner({ ...newPartner, about: e.target.value })} className="w-full wood-inner p-3 text-sm border-2 border-[#c9a688] outline-none" placeholder="Descrição breve..." />
              </div>

              <button type="submit" disabled={isGenerating} className="w-full grass-bg py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:scale-[1.01] transition-transform disabled:opacity-50">
                {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar Cadastro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default AdminManagementHub;
