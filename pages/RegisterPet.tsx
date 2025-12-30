
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  ArrowLeft, Camera, PawPrint, Save,
  MapPin, Info, Tag, Heart, FileText, User, ShieldCheck, Upload, X, Building2,
  Gift, HandHelping, Coins, MessageCircle, Package, UserCircle, Stethoscope,
  Zap, Coffee, Home, Building, Sparkles, Cpu
} from 'lucide-react';
import { petService } from '../services/petService';
import { ongService } from '../services/ongService';
import { logService } from '../services/logService';
import { RegisteredPet, ONG } from '../types';

const RegisterPet: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [ongs, setOngs] = useState<ONG[]>([]);

  const [formData, setFormData] = useState<Omit<RegisteredPet, 'id'>>({
    ownerEmail: '',
    name: '',
    type: 'dog',
    breed: '',
    location: '',
    age: '',
    gender: 'Macho',
    personality: '',
    personalityDesc: '',
    personalityIcon: 'https://cdn-icons-png.flaticon.com/512/2829/2829828.png',
    images: [''],
    story: ['', '', ''],
    health: {
      vacinado: 'Sim',
      castrado: 'Sim',
      vermifugado: 'Sim',
      porte: 'Médio'
    },
    shelter: '',
    ongId: '',
    responsibilityType: 'ong',
    adoptionType: 'adoption',
    sponsorshipType: 'financial',
    sponsorshipValue: 50,
    sponsorshipItem: '',
    sponsorshipReason: '',
    residenceSuitability: 'both',
    energyLevel: 'energetic',
    chipNumber: ''
  });

  useEffect(() => {
    setOngs(ongService.getAll());

    // Get current user email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setFormData(prev => ({ ...prev, ownerEmail: session.user.email! }));
      }
    });
    // Use an async function inside useEffect to await petService.getById
    const fetchPet = async () => {
      if (id) {
        const existingPet = await petService.getById(id);
        if (existingPet) {
          setFormData({
            ...existingPet,
            responsibilityType: existingPet.responsibilityType || (existingPet.ongId ? 'ong' : 'person')
          });
        }
      }
    };
    fetchPet();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [reader.result as string] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images[0]) {
      alert("Por favor, envie uma foto do pet.");
      return;
    }

    const finalData = { ...formData };
    if (finalData.responsibilityType === 'ong') {
      finalData.shelter = '';
    } else {
      finalData.ongId = '';
    }

    // Await asynchronous service calls
    // Await asynchronous service calls
    if (isEditing && id) {
      await petService.update(id, finalData);
      await logService.add({
        action: 'Atualização',
        module: 'pets',
        details: `Pet ${finalData.name} atualizado.`,
        severity: 'info'
      });
    } else {
      await petService.register(finalData);
      await logService.add({
        action: 'Cadastro',
        module: 'pets',
        details: `Novo pet ${finalData.name} cadastrado para ${formData.adoptionType === 'adoption' ? 'adoção' : 'apadrinhamento'}.`,
        severity: 'info'
      });
    }

    if (formData.adoptionType === 'adoption') {
      navigate('/adocao');
    } else {
      navigate('/apadrinhar');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center justify-between px-2">
        <button onClick={() => navigate(-1)} className="wood-panel px-6 py-3 rounded-2xl text-[#5d2e0a] hover:bg-[#d2b48c] flex items-center gap-2 font-bold transition-all shadow-md">
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 className="text-4xl font-black text-[#5d2e0a]">
          {isEditing ? 'Editar Registro' : 'Cadastrar Novo Pet'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUNA ESQUERDA: FOTO E CONFIGURAÇÕES TIPO */}
        <div className="lg:col-span-4 space-y-6">

          {/* FOTO */}
          <div className="wood-panel p-4 rounded-[40px] border-4 border-[#c9a688] aspect-square flex flex-col items-center justify-center relative overflow-hidden bg-[#f1dfcf] shadow-xl">
            {formData.images[0] ? (
              <img src={formData.images[0]} className="absolute inset-0 w-full h-full object-cover" alt="" />
            ) : (
              <Camera className="text-[#8b4513] opacity-20" size={64} />
            )}
            <input type="file" accept="image/*" hidden id="pet-img" onChange={handleFileChange} />
            <label htmlFor="pet-img" className="absolute bottom-6 grass-bg px-8 py-2.5 rounded-2xl text-white font-black text-[11px] cursor-pointer shadow-2xl uppercase border-b-4 border-[#3d7a22] hover:scale-105 transition-transform">Mudar Foto</label>
          </div>

          {/* FINALIDADE DO ANÚNCIO */}
          <div className="wood-panel p-6 rounded-[32px] border-4 border-[#55a630] bg-[#f1fcf1] space-y-4 shadow-lg">
            <label className="text-[10px] font-black text-[#2d5a1a] uppercase flex items-center gap-2 ml-2">
              <Tag size={14} /> Finalidade do Anúncio
            </label>
            <div className="flex bg-white/50 p-1.5 rounded-2xl border-2 border-[#55a630]/20">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, adoptionType: 'adoption' })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.adoptionType === 'adoption' ? 'grass-bg text-white shadow-md' : 'text-[#2d5a1a] hover:bg-white/40'}`}
              >
                <Gift size={14} /> Adoção
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, adoptionType: 'sponsorship' })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.adoptionType === 'sponsorship' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-800 hover:bg-white/40'}`}
              >
                <HandHelping size={14} /> Apadrinhar
              </button>
            </div>
          </div>

          {/* RESPONSABILIDADE */}
          <div className="wood-panel p-6 rounded-[32px] border-4 border-[#ff6b6b] bg-[#fff5f5] space-y-4 shadow-lg">
            <label className="text-[10px] font-black text-red-600 uppercase flex items-center gap-2 ml-2">
              {formData.responsibilityType === 'ong' ? <Building2 size={14} /> : <UserCircle size={14} />}
              Responsável
            </label>

            <div className="flex bg-white/50 p-1.5 rounded-2xl border-2 border-red-200 mb-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, responsibilityType: 'ong' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${formData.responsibilityType === 'ong' ? 'bg-red-500 text-white shadow-md' : 'text-red-600 hover:bg-white/40'}`}
              >
                ONG
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, responsibilityType: 'person' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${formData.responsibilityType === 'person' ? 'bg-red-500 text-white shadow-md' : 'text-red-600 hover:bg-white/40'}`}
              >
                Pessoa
              </button>
            </div>

            {formData.responsibilityType === 'ong' ? (
              <select
                value={formData.ongId}
                onChange={e => setFormData({ ...formData, ongId: e.target.value })}
                className="w-full wood-inner p-4 text-sm font-black border-2 border-red-200 outline-none focus:ring-2 focus:ring-[#ff6b6b] transition-all"
              >
                <option value="">Selecione a ONG...</option>
                {ongs.map(ong => (
                  <option key={ong.id} value={ong.id}>{ong.name}</option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                value={formData.shelter}
                onChange={e => setFormData({ ...formData, shelter: e.target.value })}
                placeholder="Nome do Responsável..."
                className="w-full wood-inner p-4 text-sm font-black border-2 border-red-200 outline-none focus:ring-2 focus:ring-[#ff6b6b] transition-all"
              />
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS TÉCNICOS */}
        <div className="lg:col-span-8">
          <div className="wood-panel p-8 md:p-12 rounded-[50px] border-4 border-[#c9a688] shadow-2xl space-y-10 bg-[#fdfaf7]">

            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-[#5d2e0a] border-b-2 border-[#c9a688]/30 pb-3 flex items-center gap-3">
                <User size={24} className="text-[#55a630]" /> Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome do Pet</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold focus:ring-4 focus:ring-[#55a630]/10 transition-all" placeholder="Ex: Pipoca" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Espécie</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold transition-all">
                    <option value="dog">Cachorro</option>
                    <option value="cat">Gato</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Raça</label>
                  <input required value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold focus:ring-4 focus:ring-[#55a630]/10" placeholder="Ex: Vira-lata" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nº do Chip (Opcional)</label>
                  <div className="relative">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] w-4 h-4 opacity-40" />
                    <input value={formData.chipNumber} onChange={e => setFormData({ ...formData, chipNumber: e.target.value })} className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-[#c9a688] outline-none font-bold focus:ring-4 focus:ring-[#55a630]/10" placeholder="Ex: 123.456.789" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Localização (Cidade/DF)</label>
                  <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold focus:ring-4 focus:ring-[#55a630]/10" placeholder="Ex: Asa Sul, Taguatinga..." />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: PERSONALIDADE E HISTÓRIA */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-[#5d2e0a] border-b-2 border-[#c9a688]/30 pb-3 flex items-center gap-3">
                <Heart size={24} className="text-red-500" /> Personalidade e História
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Selo de Personalidade</label>
                  <input required value={formData.personality} onChange={e => setFormData({ ...formData, personality: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold" placeholder="Ex: O Explorador" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Breve História</label>
                  <textarea value={formData.story![0]} onChange={e => setFormData({ ...formData, story: [e.target.value] })} className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] outline-none min-h-[120px] font-medium leading-relaxed italic" placeholder="Conte como ele foi encontrado e como é o temperamento dele..." />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: SAÚDE E CUIDADOS */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-[#5d2e0a] border-b-2 border-[#c9a688]/30 pb-3 flex items-center gap-3">
                <Stethoscope size={24} className="text-[#3b82f6]" /> Saúde e Cuidados
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#8b4513] uppercase ml-2 text-center block">Vacinado</label>
                  <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]">
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, vacinado: 'Sim' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.vacinado === 'Sim' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513]'}`}>Sim</button>
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, vacinado: 'Não' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.vacinado === 'Não' ? 'bg-red-500 text-white shadow-md' : 'text-[#8b4513]'}`}>Não</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#8b4513] uppercase ml-2 text-center block">Castrado</label>
                  <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]">
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, castrado: 'Sim' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.castrado === 'Sim' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513]'}`}>Sim</button>
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, castrado: 'Não' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.castrado === 'Não' ? 'bg-red-500 text-white shadow-md' : 'text-[#8b4513]'}`}>Não</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#8b4513] uppercase ml-2 text-center block">Vermifugado</label>
                  <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]">
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, vermifugado: 'Sim' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.vermifugado === 'Sim' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513]'}`}>Sim</button>
                    <button type="button" onClick={() => setFormData({ ...formData, health: { ...formData.health!, vermifugado: 'Não' } })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.health?.vermifugado === 'Não' ? 'bg-red-500 text-white shadow-md' : 'text-[#8b4513]'}`}>Não</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#8b4513] uppercase ml-2 block">Porte</label>
                  <select value={formData.health?.porte} onChange={e => setFormData({ ...formData, health: { ...formData.health!, porte: e.target.value } })} className="w-full wood-inner p-3 text-[11px] border border-[#c9a688] outline-none font-bold">
                    <option value="Mini">Mini</option>
                    <option value="Pequeno">Pequeno</option>
                    <option value="Médio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: CAMPOS PARA MATCH */}
            <div className="space-y-6 pt-4 border-t-2 border-[#c9a688]/30">
              <h3 className="text-2xl font-black text-[#5d2e0a] flex items-center gap-3">
                <Sparkles size={24} className="text-amber-500" /> Atributos de Match
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4 flex items-center gap-2">
                    <Home size={14} className="text-[#55a630]" /> Perfil de Residência Ideal
                  </label>
                  <div className="flex bg-[#f1dfcf] p-1.5 rounded-2xl border-2 border-[#c9a688]/30">
                    <button type="button" onClick={() => setFormData({ ...formData, residenceSuitability: 'house' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.residenceSuitability === 'house' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#e6cbb3]'}`}><Home size={16} /> Casa</button>
                    <button type="button" onClick={() => setFormData({ ...formData, residenceSuitability: 'apartment' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.residenceSuitability === 'apartment' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#e6cbb3]'}`}><Building size={16} /> Apto</button>
                    <button type="button" onClick={() => setFormData({ ...formData, residenceSuitability: 'both' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.residenceSuitability === 'both' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#e6cbb3]'}`}><Heart size={16} /> Ambos</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4 flex items-center gap-2">
                    <Zap size={14} className="text-[#55a630]" /> Nível de Energia do Pet
                  </label>
                  <div className="flex bg-[#f1dfcf] p-1.5 rounded-2xl border-2 border-[#c9a688]/30">
                    <button type="button" onClick={() => setFormData({ ...formData, energyLevel: 'energetic' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.energyLevel === 'energetic' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#e6cbb3]'}`}><Zap size={16} /> Ativo</button>
                    <button type="button" onClick={() => setFormData({ ...formData, energyLevel: 'chill' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.energyLevel === 'chill' ? 'grass-bg text-white shadow-md' : 'text-[#8b4513] hover:bg-[#e6cbb3]'}`}><Coffee size={16} /> Calmo</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full grass-bg py-6 rounded-[32px] text-white font-black text-2xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-4 hover:translate-y-[-2px] active:scale-95 transition-all">
                <Save size={28} /> {isEditing ? 'Salvar Alterações' : 'Publicar Registro'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPet;
