
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Mail,
  FileText, Phone, Camera, Upload,
  CheckCircle, ShieldCheck, Heart, Lock, AlertTriangle, Sparkles,
  Store, Clock, MapPin, Tag, MessageSquare, Image as ImageIcon, Plus,
  Dog, Cat, Home, Building, Zap, Coffee, Coins, QrCode, Copy, Check, X
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserType, PartnerCompany } from '../types';

const RegisterUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isFromGoogle, setIsFromGoogle] = useState(false);

  const [donationAmount, setDonationAmount] = useState<number>(5);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'volunteer' as UserType,
    documentNumber: '',
    address: '',
    city: '',
    state: 'DF',
    password: '',
    confirmPassword: '',
    photoUrl: '',
    documentFileUrl: '',
    petPreference: 'dog' as 'dog' | 'cat' | 'both',
    residenceType: 'house' as 'house' | 'apartment',
    temperamentPreference: 'energetic' as 'energetic' | 'chill',
    // Campos de Parceiro
    category: 'petshop' as PartnerCompany['category'],
    is24h: false,
    neighborhood: '',
    about: '',
    instagram: '',
    bannerUrl: '',
    promoTitle: '',
    promoDesc: '',
    promoDiscount: ''
  });

  useEffect(() => {
    const state = location.state as { prefill?: { name: string, email: string } };
    if (state?.prefill) {
      setFormData(prev => ({
        ...prev,
        name: state.prefill!.name,
        email: state.prefill!.email,
        password: 'login_google_placeholder',
        confirmPassword: 'login_google_placeholder'
      }));
      setIsFromGoogle(true);
      setStep(1);
    }
  }, [location]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("doe@petmatch.com.br");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFromGoogle && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (!formData.photoUrl || !formData.documentFileUrl) {
      setError('Por favor, anexe sua foto e o documento para verificação.');
      return;
    }

    let partnerProfile: PartnerCompany | undefined;
    if (formData.type === 'partner') {
      partnerProfile = {
        id: `p-${Math.random().toString(36).substr(2, 5)}`,
        name: formData.name,
        about: formData.about || 'Novo parceiro da rede PetMatch.',
        bannerUrl: formData.bannerUrl || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200',
        logoUrl: formData.photoUrl,
        location: formData.address + ', ' + formData.city + ' - ' + formData.state,
        neighborhood: formData.neighborhood || formData.city,
        category: formData.category,
        is24h: formData.is24h,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        top: '50%',
        left: '50%',
        promotions: formData.promoTitle ? [{
          id: 'p1',
          title: formData.promoTitle,
          description: formData.promoDesc,
          discount: formData.promoDiscount,
          imageUrl: formData.photoUrl
        }] : []
      };
    }

    const { confirmPassword, ...submitData } = formData;
    try {
      await userService.register({
        ...submitData,
        partnerProfile
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      setError('Erro ao realizar cadastro. Tente novamente.');
    }
  };

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 py-10">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-black text-[#5d2e0a]">Junte-se à Rede</h1>
        <p className="text-[#8b4513] font-medium italic">Faça parte da comunidade PetMatch.</p>
      </header>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
          <SelectionCard
            title="Voluntário"
            desc="Quero dedicar meu tempo para ajudar nos resgates e eventos."
            icon={<Heart className="w-10 h-10" />}
            onClick={() => { setFormData({ ...formData, type: 'volunteer' }); setStep(2); }}
          />
          <SelectionCard
            title="Empresa Parceira"
            desc="Quero oferecer descontos e serviços p/ beneficiar a causa pet."
            icon={<Building2 className="w-10 h-10" />}
            onClick={() => { setFormData({ ...formData, type: 'partner' }); setStep(2); }}
          />
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20 px-2">
          <div className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-2xl space-y-6 bg-white/40">
            <div className="flex justify-between items-center">
              <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex items-center gap-2 text-xs font-black text-[#8b4513] uppercase hover:underline">
                <ArrowLeft size={14} /> Voltar
              </button>
              <div className="flex items-center gap-2 text-[#55a630]">
                <Lock size={16} />
                <span className="text-[10px] font-bold uppercase">Conexão Segura</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-[#5d2e0a] flex items-center gap-2">
              <User size={24} className="text-[#55a630]" /> {formData.type === 'volunteer' ? 'Dados do Guardião' : 'Dados do Responsável'}
            </h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in-95">
                <AlertTriangle size={20} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome Completo / Razão Social</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">E-mail</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">WhatsApp / Telefone</label>
                <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none" placeholder="(61) 98888-7777" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">{formData.type === 'volunteer' ? 'CPF' : 'CNPJ'}</label>
                <input required value={formData.documentNumber} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none" placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Estado (UF)</label>
                <select
                  required
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] focus:ring-2 focus:ring-[#55a630] outline-none font-bold"
                >
                  {states.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Cidade / Região</label>
                <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: Brasília" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Endereço Completo</label>
                <input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="Ex: Quadra 2, Conjunto B" />
              </div>

              {!isFromGoogle && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Senha</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Confirmar Senha</label>
                    <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full wood-inner px-5 py-4 text-sm border-2 border-[#c9a688] outline-none" />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Sua Foto / Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 wood-inner border-2 border-[#c9a688] flex items-center justify-center overflow-hidden">
                    {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <Camera size={24} className="opacity-20" />}
                  </div>
                  <label className="grass-bg px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform">
                    Upload <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'photoUrl')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Documento Identidade</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 wood-inner border-2 border-[#c9a688] flex items-center justify-center overflow-hidden">
                    {formData.documentFileUrl ? <img src={formData.documentFileUrl} className="w-full h-full object-cover" /> : <Upload size={24} className="opacity-20" />}
                  </div>
                  <label className="wood-panel bg-[#d2b48c] px-4 py-2 rounded-xl text-[#5d2e0a] text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform">
                    Anexar <input type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'documentFileUrl')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {formData.type === 'partner' && (
            <div className="wood-panel p-8 rounded-[40px] border-4 border-[#55a630] shadow-2xl bg-[#f1fcf1] space-y-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="grass-bg p-2 rounded-xl text-white shadow-md">
                  <Store size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#5d2e0a]">Vitrine Comercial</h2>
                  <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-widest">Estes dados aparecerão em "Empresas Parceiras"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Categoria do Negócio</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold">
                      <option value="petshop">Pet Shop</option>
                      <option value="clinica">Clínica Veterinária</option>
                      <option value="servico">Serviços</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Instagram (sem @)</label>
                    <input value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="petmatch.df" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Sobre a Empresa (Bio)</label>
                    <textarea rows={4} value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none italic" placeholder="Conte sua história para os guardiões..." />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Banner Vitrine (URL)</label>
                    <input value={formData.bannerUrl} onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" placeholder="https://..." />
                  </div>

                  <div className="p-5 wood-inner border-2 border-dashed border-[#55a630] rounded-3xl bg-white/50 space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-[#55a630]" />
                      <h3 className="text-xs font-black text-[#5d2e0a] uppercase tracking-tighter">Item Promocional Inicial</h3>
                    </div>
                    <input value={formData.promoTitle} onChange={e => setFormData({ ...formData, promoTitle: e.target.value })} className="w-full bg-white/80 p-3 text-xs border border-[#c9a688] rounded-xl font-bold" placeholder="Título da oferta (Ex: Banho & Tosa)" />
                    <div className="flex gap-2">
                      <input value={formData.promoDiscount} onChange={e => setFormData({ ...formData, promoDiscount: e.target.value })} className="w-24 bg-white/80 p-3 text-xs border border-[#c9a688] rounded-xl font-black uppercase text-emerald-600" placeholder="Ex: 10% OFF" />
                      <input value={formData.promoDesc} onChange={e => setFormData({ ...formData, promoDesc: e.target.value })} className="flex-1 bg-white/80 p-3 text-xs border border-[#c9a688] rounded-xl" placeholder="Breve regra..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="w-full grass-bg py-6 rounded-[32px] text-white font-black text-2xl shadow-xl border-b-8 border-[#3d7a22] hover:translate-y-[-2px] transition-transform flex items-center justify-center gap-3 max-w-2xl mx-auto">
            Criar Conta PetMatch <Plus size={28} />
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="wood-panel p-12 rounded-[40px] border-4 border-[#c9a688] shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500 max-w-lg mx-auto bg-white/40">
          <div className="w-24 h-24 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-[#5d2e0a] tracking-tight">Cadastro Concluído!</h2>
          <p className="text-[#8b4513] font-medium italic">
            Recebemos seus dados. Nossa equipe fará a análise documental e você receberá um e-mail assim que seu acesso for liberado!
          </p>
          <button onClick={() => navigate('/login')} className="px-10 py-4 wood-panel bg-[#f1dfcf] rounded-2xl font-black text-[#5d2e0a] uppercase tracking-widest hover:bg-[#d2b48c] transition-colors shadow-lg border-b-4 border-[#c9a688]">
            Ir para Login
          </button>
        </div>
      )}
    </div>
  );
};

const SelectionCard = ({ title, desc, icon, onClick }: any) => (
  <div onClick={onClick} className="wood-panel p-8 rounded-[40px] border-4 border-[#c9a688] shadow-xl cursor-pointer hover:scale-105 transition-all text-center group bg-white/40 h-full flex flex-col justify-between">
    <div className="w-20 h-20 grass-bg mx-auto mb-6 flex items-center justify-center text-white border-4 border-[#3d7a22] shadow-lg group-hover:rotate-6 transition-transform">
      {icon}
    </div>
    <div>
      <h3 className="text-2xl font-black text-[#5d2e0a] mb-2">{title}</h3>
      <p className="text-xs text-[#8b4513] font-medium leading-relaxed px-4">{desc}</p>
    </div>
    <div className="mt-6 inline-block text-[10px] font-black text-[#55a630] uppercase border-b-2 border-transparent group-hover:border-[#55a630]">
      Selecionar Perfil
    </div>
  </div>
);

export default RegisterUser;
