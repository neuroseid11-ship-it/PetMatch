
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   User, Mail, Phone, FileText, Calendar, ShieldCheck,
   Edit3, Camera, Building2, Heart, CheckCircle, Clock, XCircle,
   Plus, Dog, Cat, Syringe, ClipboardList, Trash2, Save, X, Upload, Info, AlertTriangle,
   Store, Tag, MapPin, Instagram, ImageIcon, Sparkles, Home, Building, Zap, Coffee, Settings, Stethoscope, Scissors, Pill, Gift, Cpu, ChevronRight
} from 'lucide-react';
import { userService } from '../services/userService';
import { userPetService } from '../services/userPetService';
import { petService } from '../services/petService';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabaseClient';
import { PlatformUser, UserPet, VaccineRecord, Promotion, RegisteredPet } from '../types';

const UserProfile: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
   const [user, setUser] = useState<PlatformUser | null>(null);
   const [userPets, setUserPets] = useState<UserPet[]>([]);
   const [adoptionPets, setAdoptionPets] = useState<RegisteredPet[]>([]);
   const [activeTab, setActiveTab] = useState<'info' | 'pets' | 'business'>('info');
   const [loading, setLoading] = useState(true);

   const [isBusinessEditing, setIsBusinessEditing] = useState(false);
   const [partnerForm, setPartnerForm] = useState<any>(null);

   const [isPetModalOpen, setIsPetModalOpen] = useState(false);
   const [isAdoptionPetsModalOpen, setIsAdoptionPetsModalOpen] = useState(false);
   const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

   const [editingPet, setEditingPet] = useState<UserPet | null>(null);
   const [petFormData, setPetFormData] = useState<Omit<UserPet, 'id' | 'ownerEmail'>>({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      birthDate: '',
      weight: '',
      photoUrl: '',
      vaccines: [],
      healthEvents: [],
      diseases: '',
      surgeries: '',
      medicines: '',
      consultations: '',
      grooming: '',
      chipNumber: ''
   });

   const [profileFormData, setProfileFormData] = useState<Partial<PlatformUser>>({});

   useEffect(() => {
      const fetchProfile = async () => {
         setLoading(true);
         try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
               // Check if it's the current user or viewing another profile
               const targetId = id || session.user.id;
               let profile = await profileService.getProfile(targetId);

               if (!profile && targetId === session.user.id) {
                  // First access: Create placeholder profile
                  console.log('Perfil não encontrado, criando perfil inicial...');
                  await profileService.createProfile(session.user.id, session.user.email!, session.user.user_metadata.full_name);
                  profile = await profileService.getProfile(session.user.id);
                  // Should open edit modal automatically
                  setIsEditProfileModalOpen(true);
               }

               if (profile) {
                  setUser(profile);
                  setProfileFormData({ ...profile });
                  setCurrentUserRole(localStorage.getItem('petmatch_user_role'));

                  // Fetch real pets
                  const pets = userPetService.getByOwner(profile.email);
                  setUserPets(pets);
               }
            }
         } catch (error) {
            console.error('Error loading profile:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [id]);

   const isAdmin = currentUserRole === 'admin';
   const canEdit = !!user && (isAdmin || user.email === localStorage.getItem('petmatch_user_email')); // Simplified check

   const handleSaveBusiness = async () => {
      if (!user || !partnerForm) return;
      const updatedUser = { ...user, partnerProfile: partnerForm };

      try {
         await userService.update(user.id, updatedUser);
         setUser(updatedUser);
         setIsBusinessEditing(false);
         alert('Perfil comercial atualizado com sucesso!');
      } catch (error) {
         console.error(error);
         alert('Erro ao atualizar perfil comercial.');
      }
   };

   const handleSaveProfileChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !profileFormData.id) return;

      try {
         await profileService.updateProfile(profileFormData.id, profileFormData);

         // Update local state
         const updatedUser = { ...user, ...profileFormData } as PlatformUser;
         setUser(updatedUser);
         setProfileFormData({ ...updatedUser });

         setIsEditProfileModalOpen(false);
         alert('Perfil atualizado com sucesso!');
      } catch (error) {
         console.error('Error updating profile:', error);
         alert('Erro ao atualizar perfil.');
      }
   };

   const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
         try {
            const path = `${user.id}/${Date.now()}_avatar`;
            const url = await profileService.uploadImage(file, 'avatars', path);
            setProfileFormData(prev => ({ ...prev, photoUrl: url }));
         } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erro ao enviar foto.');
         }
      }
   };

   const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
         try {
            const path = `${user.id}/${Date.now()}_doc`;
            const url = await profileService.uploadImage(file, 'documents', path);
            setProfileFormData(prev => ({ ...prev, documentFileUrl: url }));
         } catch (error) {
            console.error('Error uploading document:', error);
            alert('Erro ao enviar documento.');
         }
      }
   };

   const addPromotion = () => {
      const newPromo: Promotion = {
         id: Math.random().toString(36).substr(2, 5),
         title: 'Nova Promoção',
         description: 'Descrição da oferta...',
         discount: '0% OFF',
         imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400'
      };
      setPartnerForm({
         ...partnerForm,
         promotions: [...(partnerForm.promotions || []), newPromo]
      });
   };

   const updatePromotion = (index: number, field: keyof Promotion, value: string) => {
      const newPromos = [...partnerForm.promotions];
      newPromos[index] = { ...newPromos[index], [field]: value };
      setPartnerForm({ ...partnerForm, promotions: newPromos });
   };

   const removePromotion = (index: number) => {
      const newPromos = partnerForm.promotions.filter((_: any, i: number) => i !== index);
      setPartnerForm({ ...partnerForm, promotions: newPromos });
   };

   const handleOpenPetModal = (pet?: UserPet) => {
      if (pet) {
         setPetFormData({ ...pet });
         setEditingPet(pet);
      } else {
         setPetFormData({
            name: '',
            species: 'dog',
            breed: '',
            age: '',
            weight: '',
            photoUrl: '',
            vaccines: [],
            diseases: '',
            surgeries: '',
            medicines: '',
            consultations: '',
            grooming: '',
            chipNumber: ''
         });
         setEditingPet(null);
      }
      setIsPetModalOpen(true);
   };

   const handlePetPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setPetFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
         };
         reader.readAsDataURL(file);
      }
   };

   const handleAddVaccine = () => {
      const newVaccine: VaccineRecord = {
         id: Math.random().toString(36).substr(2, 5),
         name: '',
         date: '',
         nextDose: ''
      };
      setPetFormData({ ...petFormData, vaccines: [...petFormData.vaccines, newVaccine] });
   };

   const handleUpdateVaccine = (index: number, field: keyof VaccineRecord, value: string) => {
      const newVaccines = [...petFormData.vaccines];
      newVaccines[index] = { ...newVaccines[index], [field]: value };
      setPetFormData({ ...petFormData, vaccines: newVaccines });
   };

   const handleRemoveVaccine = (index: number) => {
      const newVaccines = petFormData.vaccines.filter((_, i) => i !== index);
      setPetFormData({ ...petFormData, vaccines: newVaccines });
   };

   const calculateAge = (dateString: string) => {
      if (!dateString) return '';
      const today = new Date();
      const birth = new Date(dateString);
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
         years--;
      }
      if (years === 0) {
         // Calculate months if less than 1 year
         let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
         if (today.getDate() < birth.getDate()) months--;
         return `${months} meses`;
      }
      return `${years} anos`;
   };

   const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value;
      const age = calculateAge(date);
      setPetFormData(prev => ({ ...prev, birthDate: date, age }));
   };

   const handleAddHealthEvent = (type: 'consultation' | 'surgery' | 'medicine') => {
      const newEvent = {
         id: Math.random().toString(36).substr(2, 5),
         type,
         description: '',
         date: '',
         completed: false
      };
      setPetFormData(prev => ({
         ...prev,
         healthEvents: [...(prev.healthEvents || []), newEvent]
      }));
   };

   const handleUpdateHealthEvent = (index: number, field: string, value: any) => {
      const events = [...(petFormData.healthEvents || [])];
      events[index] = { ...events[index], [field]: value };
      setPetFormData(prev => ({ ...prev, healthEvents: events }));
   };

   const handleRemoveHealthEvent = (index: number) => {
      const events = (petFormData.healthEvents || []).filter((_, i) => i !== index);
      setPetFormData(prev => ({ ...prev, healthEvents: events }));
   };

   const handleSavePet = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Tentando salvar pet...', petFormData);

      if (!user) {
         console.error('Usuário não encontrado ao tentar salvar.');
         alert('Erro: Usuário não identificado. Recarregue a página.');
         return;
      }

      try {
         const petToSave = { ...petFormData, ownerEmail: user.email };
         console.log('Dados finais para salvar:', petToSave);

         await userPetService.save(petToSave, editingPet?.id);

         const updatedPets = await userPetService.getByOwner(user.email);
         setUserPets(updatedPets);

         setIsPetModalOpen(false);
         alert(editingPet ? 'Prontuário atualizado com sucesso!' : 'Novo amigo salvo com sucesso!');
      } catch (error) {
         console.error('Erro ao salvar pet:', error);
         alert('Ocorreu um erro ao salvar as informações. Tente novamente.');
      }
   };

   const handleDeletePet = async (id: string) => {
      if (window.confirm('Excluir prontuário permanentemente?')) {
         await userPetService.delete(id);
         if (user) setUserPets(await userPetService.getByOwner(user.email));
      }
   };

   const handleDeleteAdoptionPet = async (id: string) => {
      if (window.confirm('Tem certeza que deseja remover este anúncio de adoção?')) {
         await petService.delete(id);
         const allAdoptionPets = await petService.getAll();
         setAdoptionPets(allAdoptionPets.filter(p => p.ownerEmail === user?.email));
      }
   };

   const states = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
   ];

   if (loading || !user) return <div className="py-20 text-center font-black text-[#5d2e0a]">Carregando Perfil...</div>;

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
         {/* Header do Perfil */}
         <div className="wood-panel p-10 rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
               <div className="relative">
                  <div className="w-40 h-40 rounded-[40px] border-4 border-[#c9a688] overflow-hidden shadow-xl bg-white">
                     <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
               </div>

               <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                           <h1 className="text-4xl font-black text-[#5d2e0a]">{user.name}</h1>
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${user.status === 'approved' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                              {user.status === 'approved' ? 'Aprovado' : 'Em Análise'}
                           </span>
                        </div>
                        <p className="text-[#8b4513] font-bold italic">{user.type === 'volunteer' ? `Guardião Voluntário (${user.state})` : `Empresa Parceira (${user.state})`}</p>
                     </div>

                     {canEdit && (
                        <div className="flex gap-3 items-center">
                           <button
                              onClick={() => setIsEditProfileModalOpen(true)}
                              className="wood-panel px-8 py-2.5 rounded-[22px] text-[11px] font-black uppercase text-[#5d2e0a] border-2 border-[#c9a688] shadow-md hover:brightness-105 active:scale-95 transition-all"
                           >
                              Editar Perfil
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="pt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                     <button onClick={() => setActiveTab('info')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'info' ? 'grass-bg text-white shadow-md' : 'wood-panel text-[#5d2e0a]'}`}>Dados da Conta</button>
                     {user.type === 'volunteer' && (
                        <>
                           <button onClick={() => setActiveTab('pets')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'pets' ? 'grass-bg text-white shadow-md' : 'wood-panel text-[#5d2e0a]'}`}>Meus Pets ({userPets.length})</button>
                           <button onClick={() => setIsAdoptionPetsModalOpen(true)} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase wood-panel text-[#5d2e0a] hover:bg-[#d2b48c] transition-all border-2 border-[#c9a688] flex items-center gap-2">
                              Meus pets para adoção ({adoptionPets.length})
                           </button>
                        </>
                     )}
                     {user.type === 'partner' && (
                        <button onClick={() => setActiveTab('business')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'business' ? 'grass-bg text-white shadow-md' : 'wood-panel text-[#5d2e0a]'}`}>Meu Negócio (Vitrine)</button>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-left-4">
               <div className="md:col-span-2 wood-panel p-8 rounded-[32px] border-2 border-[#c9a688] shadow-lg space-y-8">
                  <h2 className="text-xl font-black text-[#5d2e0a] border-b-2 border-[#c9a688] pb-2 uppercase tracking-tighter">Informações Cadastrais</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <ProfileItem icon={<Mail size={18} />} label="E-mail" value={user.email} />
                     <ProfileItem icon={<Phone size={18} />} label="WhatsApp" value={user.phone || '---'} />
                     <ProfileItem icon={<FileText size={18} />} label={user.type === 'volunteer' ? 'CPF' : 'CNPJ'} value={user.documentNumber} />
                     <ProfileItem icon={<Calendar size={18} />} label="Membro desde" value={new Date(user.createdAt).toLocaleDateString()} />

                     <div className="sm:col-span-2">
                        <ProfileItem icon={<MapPin size={18} />} label="Localização" value={`${user.city || 'Brasília'} - ${user.state || 'DF'}`} />
                     </div>

                     {user.petPreference && (
                        <ProfileItem
                           icon={user.petPreference === 'cat' ? <Cat size={18} /> : <Dog size={18} />}
                           label="Preferência de Pet"
                           value={user.petPreference === 'cat' ? 'Gato' : user.petPreference === 'dog' ? 'Cachorro' : 'Ambos'}
                        />
                     )}

                     {user.residenceType && (
                        <ProfileItem
                           icon={user.residenceType === 'house' ? <Home size={18} /> : <Building size={18} />}
                           label="Onde Mora"
                           value={user.residenceType === 'house' ? 'Casa' : 'Apartamento'}
                        />
                     )}

                     {user.temperamentPreference && (
                        <ProfileItem
                           icon={user.temperamentPreference === 'energetic' ? <Zap size={18} /> : <Coffee size={18} />}
                           label="Preferência de Temperamento"
                           value={user.temperamentPreference === 'energetic' ? 'Animado' : 'Calmo'}
                        />
                     )}
                  </div>
               </div>
               <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688]">
                  <h3 className="text-[10px] font-black text-[#5d2e0a] uppercase mb-4 opacity-60">Comprovante de Identidade</h3>
                  {user.documentFileUrl ? (
                     <img src={user.documentFileUrl} className="w-full rounded-2xl border border-[#c9a688]" alt="Documento" />
                  ) : (
                     <div className="h-48 wood-inner border-2 border-dashed border-[#c9a688] flex items-center justify-center opacity-30">
                        <FileText size={48} />
                     </div>
                  )}
               </div>
            </div>
         )}

         {activeTab === 'pets' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-[#5d2e0a]">Seus Companheiros</h2>
                  {canEdit && <button onClick={() => handleOpenPetModal()} className="grass-bg px-6 py-2 rounded-xl text-white font-black text-xs shadow-md border-b-4 border-[#3d7a22] flex items-center gap-2 transition-transform hover:scale-105"><Plus size={16} /> Novo Pet</button>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userPets.map(pet => (
                     <div key={pet.id} className="wood-panel p-5 rounded-[32px] border-2 border-[#c9a688] shadow-md group">
                        <div className="flex items-center gap-4">
                           <img src={pet.photoUrl || 'https://cdn-icons-png.flaticon.com/512/2829/2829828.png'} className="w-16 h-16 rounded-2xl border-2 border-[#c9a688] object-cover" />
                           <div>
                              <h4 className="font-black text-[#5d2e0a]">{pet.name}</h4>
                              <p className="text-[10px] font-bold text-[#8b4513] uppercase">{pet.breed}</p>
                           </div>
                        </div>
                        <button onClick={() => handleOpenPetModal(pet)} className="w-full mt-4 wood-inner py-2 text-[10px] font-black uppercase text-[#5d2e0a] border border-[#c9a688] hover:bg-[#d2b48c] flex items-center justify-center gap-1 transition-all">Editar Prontuário</button>
                     </div>
                  ))}
                  {userPets.length === 0 && (
                     <div className="col-span-full py-12 text-center wood-inner border-2 border-dashed border-[#c9a688] rounded-3xl opacity-40">
                        <p className="font-bold">Nenhum pet pessoal cadastrado.</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {activeTab === 'business' && partnerForm && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center px-4">
                  <div>
                     <h2 className="text-3xl font-black text-[#5d2e0a]">Minha Vitrine Comercial</h2>
                     <p className="text-[#8b4513] italic text-sm">Estes dados são visíveis no link "Empresas Parceiras"</p>
                  </div>
                  {canEdit && !isBusinessEditing && (
                     <button onClick={() => setIsBusinessEditing(true)} className="grass-bg px-8 py-3 rounded-2xl text-white font-black text-sm border-b-4 border-[#3d7a22] flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                        <Edit3 size={18} /> Editar Vitrine
                     </button>
                  )}
               </div>

               <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${!isBusinessEditing ? 'pointer-events-none' : ''}`}>
                  <div className="lg:col-span-2 space-y-8">
                     <div className="wood-panel p-6 rounded-[40px] border-4 border-[#c9a688] shadow-xl space-y-6 bg-white">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Banner da Empresa (URL)</label>
                           <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-[#c9a688] group">
                              <img src={partnerForm.bannerUrl} className="w-full h-full object-cover" />
                              {isBusinessEditing && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input type="text" value={partnerForm.bannerUrl} onChange={e => setPartnerForm({ ...partnerForm, bannerUrl: e.target.value })} className="wood-inner p-3 text-xs w-3/4 outline-none" placeholder="Cole a URL da imagem aqui..." />
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Categoria</label>
                              <select disabled={!isBusinessEditing} value={partnerForm.category} onChange={e => setPartnerForm({ ...partnerForm, category: e.target.value as any })} className="w-full wood-inner p-3 text-sm border border-[#c9a688] font-bold">
                                 <option value="petshop">Pet Shop</option>
                                 <option value="clinica">Clínica Veterinária</option>
                                 <option value="servico">Serviços</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Instagram</label>
                              <input disabled={!isBusinessEditing} value={partnerForm.instagram} onChange={e => setPartnerForm({ ...partnerForm, instagram: e.target.value })} className="w-full wood-inner p-3 text-sm border border-[#c9a688]" />
                           </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Sobre a Empresa (Público)</label>
                           <textarea disabled={!isBusinessEditing} rows={4} value={partnerForm.about} onChange={e => setPartnerForm({ ...partnerForm, about: e.target.value })} className="w-full wood-inner p-4 text-sm border border-[#c9a688] leading-relaxed" />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                           <h3 className="text-xl font-black text-[#5d2e0a] flex items-center gap-2"><Tag size={20} className="text-[#55a630]" /> Promoções Ativas</h3>
                           {isBusinessEditing && <button type="button" onClick={addPromotion} className="text-[10px] font-black text-[#55a630] border border-[#55a630] px-4 py-1.5 rounded-xl hover:bg-emerald-50">+ Add Promoção</button>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {partnerForm.promotions.map((promo: any, i: number) => (
                              <div key={promo.id} className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] bg-white shadow-md relative group">
                                 {isBusinessEditing && (
                                    <button onClick={() => removePromotion(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"><X size={14} /></button>
                                 )}
                                 <div className="space-y-4">
                                    <input disabled={!isBusinessEditing} value={promo.title} onChange={e => updatePromotion(i, 'title', e.target.value)} className="w-full text-lg font-black text-[#5d2e0a] bg-transparent border-b border-dashed border-[#c9a688] outline-none" placeholder="Título" />
                                    <textarea disabled={!isBusinessEditing} rows={2} value={promo.description} onChange={e => updatePromotion(i, 'description', e.target.value)} className="w-full text-xs text-[#8b4513] bg-transparent border-none outline-none resize-none" placeholder="Descrição" />
                                    <div className="flex items-center gap-2">
                                       <div className="grass-bg px-3 py-1 border border-[#3d7a22]">
                                          <input disabled={!isBusinessEditing} value={promo.discount} onChange={e => updatePromotion(i, 'discount', e.target.value)} className="w-16 text-[9px] font-black text-white bg-transparent outline-none uppercase" />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] space-y-6 bg-[#fdf5ed]">
                        <h3 className="text-sm font-black text-[#5d2e0a] uppercase border-b border-[#c9a688] pb-2 flex items-center gap-2"><MapPin size={16} /> Localização</h3>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-[#8b4513] uppercase">Bairro / Região</label>
                              <input disabled={!isBusinessEditing} value={partnerForm.neighborhood} onChange={e => setPartnerForm({ ...partnerForm, neighborhood: e.target.value })} className="w-full wood-inner p-3 text-xs border border-[#c9a688]" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-[#8b4513] uppercase">Endereço Completo</label>
                              <textarea disabled={!isBusinessEditing} rows={3} value={partnerForm.location} onChange={e => setPartnerForm({ ...partnerForm, location: e.target.value })} className="w-full wood-inner p-3 text-xs border border-[#c9a688]" />
                           </div>
                        </div>
                     </div>

                     <div className="wood-panel p-6 rounded-[32px] border-2 border-[#c9a688] shadow-lg flex items-center gap-4 bg-white">
                        <Clock className="text-[#55a630]" />
                        <div className="flex-1">
                           <p className="text-xs font-black text-[#5d2e0a]">Plantão 24 Horas</p>
                        </div>
                        <button disabled={!isBusinessEditing} onClick={() => setPartnerForm({ ...partnerForm, is24h: !partnerForm.is24h })} className={`w-10 h-5 rounded-full relative transition-all ${partnerForm.is24h ? 'grass-bg' : 'bg-gray-300'}`}>
                           <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${partnerForm.is24h ? 'left-5' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>
               </div>

               {isBusinessEditing && (
                  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 animate-in slide-in-from-bottom-10 z-[80]">
                     <button onClick={handleSaveBusiness} className="grass-bg px-12 py-5 rounded-3xl text-white font-black text-xl shadow-2xl border-b-8 border-[#3d7a22] flex items-center gap-3 hover:scale-105 transition-transform">
                        <Save size={24} /> Salvar Alterações
                     </button>
                     <button onClick={() => setIsBusinessEditing(false)} className="wood-panel bg-white px-10 py-5 rounded-3xl text-[#5d2e0a] font-black text-xl shadow-2xl border-b-8 border-[#c9a688] hover:bg-red-50 hover:text-red-600 transition-colors">
                        Cancelar
                     </button>
                  </div>
               )}
            </div>
         )}

         {isEditProfileModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="wood-panel w-full max-w-4xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
                  <button onClick={() => setIsEditProfileModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24} /></button>

                  <h2 className="text-3xl font-black text-[#5d2e0a] mb-8 uppercase tracking-tighter flex items-center gap-3">
                     <Edit3 size={28} className="text-[#55a630]" /> Editar Informações do Cadastro
                  </h2>

                  <form onSubmit={handleSaveProfileChanges} className="space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-6">
                           <div className="space-y-2 text-center">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase">Sua Foto de Perfil</label>
                              <div className="w-40 h-40 mx-auto rounded-[32px] border-4 border-[#c9a688] overflow-hidden bg-white shadow-lg relative group">
                                 <img src={profileFormData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={32} className="text-white" />
                                 </div>
                                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleProfilePhotoChange} />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Comprovante Identidade</label>
                              <div className="wood-inner border-2 border-[#c9a688] border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
                                 {profileFormData.documentFileUrl ? (
                                    <img src={profileFormData.documentFileUrl} className="w-full h-full object-cover" alt="Documento" />
                                 ) : (
                                    <Upload className="opacity-20" size={32} />
                                 )}
                                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleDocumentChange} />
                              </div>
                           </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome Completo / Razão Social</label>
                              <input required value={profileFormData.name} onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">WhatsApp / Telefone</label>
                              <input required value={profileFormData.phone} onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">CPF / CNPJ</label>
                              <input required value={profileFormData.documentNumber} onChange={e => setProfileFormData({ ...profileFormData, documentNumber: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none" />
                           </div>
                           <div className="sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">E-mail</label>
                              <input required type="email" value={profileFormData.email} onChange={e => setProfileFormData({ ...profileFormData, email: e.target.value })} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-4 border-t-2 border-[#c9a688]/30">
                        <h3 className="text-xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-2">
                           <MapPin size={20} className="text-red-500" /> Endereço e Localização
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Estado (UF)</label>
                              <select
                                 value={profileFormData.state}
                                 onChange={e => setProfileFormData({ ...profileFormData, state: e.target.value })}
                                 className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] font-bold outline-none"
                              >
                                 {states.map(st => <option key={st} value={st}>{st}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Cidade / RA</label>
                              <input
                                 value={profileFormData.city || ''}
                                 onChange={e => setProfileFormData({ ...profileFormData, city: e.target.value })}
                                 className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Endereço</label>
                              <input
                                 value={(profileFormData as any).address || ''}
                                 onChange={e => setProfileFormData({ ...profileFormData, address: e.target.value } as any)}
                                 className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold"
                              />
                           </div>
                        </div>
                     </div>

                     {profileFormData.type === 'volunteer' && (
                        <div className="space-y-6 pt-4 border-t-2 border-[#c9a688]/30">
                           <h3 className="text-xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-3">
                              <Sparkles size={20} className="text-[#55a630]" /> Preferências de Guardião
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Preferência de Pet</label>
                                 <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]/50">
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, petPreference: 'dog' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.petPreference === 'dog' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Cão</button>
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, petPreference: 'cat' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.petPreference === 'cat' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Gato</button>
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, petPreference: 'both' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.petPreference === 'both' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Ambos</button>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Tipo de Residência</label>
                                 <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]/50">
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, residenceType: 'house' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.residenceType === 'house' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Casa</button>
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, residenceType: 'apartment' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.residenceType === 'apartment' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Apto</button>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Energia do Pet</label>
                                 <div className="flex bg-[#f1dfcf] p-1 rounded-xl border border-[#c9a688]/50">
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, temperamentPreference: 'energetic' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.temperamentPreference === 'energetic' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Ativo</button>
                                    <button type="button" onClick={() => setProfileFormData({ ...profileFormData, temperamentPreference: 'chill' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${profileFormData.temperamentPreference === 'chill' ? 'grass-bg text-white' : 'text-[#8b4513]'}`}>Calmo</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="pt-8">
                        <button type="submit" className="w-full grass-bg py-6 rounded-[32px] text-white font-black text-2xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all">
                           <Save size={28} /> SALVAR PERFIL COMPLETO
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {isPetModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="wood-panel w-full max-w-4xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={() => setIsPetModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24} /></button>

                  <h2 className="text-3xl font-black text-[#5d2e0a] mb-8 uppercase tracking-tighter border-b-2 border-[#c9a688] pb-2">
                     {editingPet ? 'Editar Prontuário' : 'Novo Amigo da Família'}
                  </h2>

                  <form onSubmit={handleSavePet} className="space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <div className="space-y-2 text-center">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase">Foto do Pet</label>
                              <div className="w-48 h-48 mx-auto rounded-[32px] border-4 border-[#c9a688] overflow-hidden bg-white shadow-lg relative group">
                                 {petFormData.photoUrl ? (
                                    <img src={petFormData.photoUrl} className="w-full h-full object-cover" />
                                 ) : (
                                    <Camera size={48} className="opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                 )}
                                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePetPhotoChange} />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nome</label>
                                 <input required value={petFormData.name} onChange={e => setPetFormData({ ...petFormData, name: e.target.value })} className="w-full wood-inner p-4 text-sm font-bold border-2 border-[#c9a688]" placeholder="Ex: Mel" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Espécie</label>
                                    <select value={petFormData.species} onChange={e => setPetFormData({ ...petFormData, species: e.target.value as any })} className="w-full wood-inner p-4 text-sm font-bold border-2 border-[#c9a688]">
                                       <option value="dog">Cão</option>
                                       <option value="cat">Gato</option>
                                    </select>
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nº do Chip</label>
                                    <input value={petFormData.chipNumber || ''} onChange={e => setPetFormData({ ...petFormData, chipNumber: e.target.value })} className="w-full wood-inner p-4 text-sm font-bold border-2 border-[#c9a688]" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Nascimento</label>
                                    <input type="date" value={petFormData.birthDate || ''} onChange={handleBirthDateChange} className="w-full wood-inner p-4 text-sm font-bold border-2 border-[#c9a688]" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Idade</label>
                                    <input readOnly value={petFormData.age} className="w-full wood-inner p-4 text-sm font-bold border-2 border-[#c9a688] bg-black/5" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h3 className="text-xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-2">
                              <Syringe size={24} className="text-[#55a630]" /> Controle de Vacinação
                           </h3>
                           <div className="space-y-3">
                              {petFormData.vaccines.map((v, i) => (
                                 <div key={v.id} className="flex gap-2 items-center bg-[#fdf5ed] p-3 rounded-2xl border border-[#c9a688]/30">
                                    <input value={v.name} onChange={e => handleUpdateVaccine(i, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-xs font-bold outline-none" placeholder="Vacina" />
                                    <input type="date" value={v.date} onChange={e => handleUpdateVaccine(i, 'date', e.target.value)} className="w-28 bg-transparent border-none text-[10px] font-bold outline-none" />
                                    <button type="button" onClick={() => handleRemoveVaccine(i)} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={16} /></button>
                                 </div>
                              ))}
                              <button type="button" onClick={handleAddVaccine} className="w-full py-3 border-2 border-dashed border-[#55a630] rounded-2xl text-[10px] font-black text-[#55a630] uppercase hover:bg-emerald-50 transition-all">+ Adicionar Registro</button>
                           </div>
                        </div>

                        {/* AGENDA DE SAÚDE */}
                        <div className="space-y-6 pt-6 border-t border-[#c9a688]/30">
                           <h3 className="text-xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-2">
                              <Calendar size={24} className="text-[#55a630]" /> Agenda de Saúde
                           </h3>

                           {/* CONSULTAS */}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-1"><Stethoscope size={12} /> Consultas Agendadas</label>
                              {petFormData.healthEvents?.map((e, i) => {
                                 if (e.type !== 'consultation') return null;
                                 return (
                                    <div key={e.id} className="flex gap-2 items-center bg-[#fdf5ed] p-3 rounded-2xl border border-[#c9a688]/30">
                                       <input value={e.description} onChange={ev => handleUpdateHealthEvent(i, 'description', ev.target.value)} className="flex-1 bg-transparent border-none text-xs font-bold outline-none" placeholder="Motivo da consulta" />
                                       <input type="date" value={e.date} onChange={ev => handleUpdateHealthEvent(i, 'date', ev.target.value)} className="w-28 bg-transparent border-none text-[10px] font-bold outline-none" />
                                       <button type="button" onClick={() => handleRemoveHealthEvent(i)} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={16} /></button>
                                    </div>
                                 );
                              })}
                              <button type="button" onClick={() => handleAddHealthEvent('consultation')} className="w-full py-2 border border-dashed border-[#c9a688] rounded-xl text-[9px] font-black text-[#8b4513] uppercase hover:bg-[#f1dfcf] transition-all">+ Agendar Consulta</button>
                           </div>

                           {/* CIRURGIAS */}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-1"><Scissors size={12} /> Cirurgias</label>
                              {petFormData.healthEvents?.map((e, i) => {
                                 if (e.type !== 'surgery') return null;
                                 return (
                                    <div key={e.id} className="flex gap-2 items-center bg-[#fff0f0] p-3 rounded-2xl border border-red-200">
                                       <input value={e.description} onChange={ev => handleUpdateHealthEvent(i, 'description', ev.target.value)} className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-red-800" placeholder="Procedimento" />
                                       <input type="date" value={e.date} onChange={ev => handleUpdateHealthEvent(i, 'date', ev.target.value)} className="w-28 bg-transparent border-none text-[10px] font-bold outline-none text-red-800" />
                                       <button type="button" onClick={() => handleRemoveHealthEvent(i)} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={16} /></button>
                                    </div>
                                 );
                              })}
                              <button type="button" onClick={() => handleAddHealthEvent('surgery')} className="w-full py-2 border border-dashed border-red-300 rounded-xl text-[9px] font-black text-red-500 uppercase hover:bg-red-50 transition-all">+ Agendar Cirurgia</button>
                           </div>

                           {/* REMÉDIOS */}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-1"><Pill size={12} /> Medicação</label>
                              {petFormData.healthEvents?.map((e, i) => {
                                 if (e.type !== 'medicine') return null;
                                 return (
                                    <div key={e.id} className="flex gap-2 items-center bg-[#f0f9ff] p-3 rounded-2xl border border-blue-200">
                                       <input value={e.description} onChange={ev => handleUpdateHealthEvent(i, 'description', ev.target.value)} className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-blue-800" placeholder="Medicamento e Dosagem" />
                                       <input type="date" value={e.date} onChange={ev => handleUpdateHealthEvent(i, 'date', ev.target.value)} className="w-28 bg-transparent border-none text-[10px] font-bold outline-none text-blue-800" />
                                       <button type="button" onClick={() => handleRemoveHealthEvent(i)} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={16} /></button>
                                    </div>
                                 );
                              })}
                              <button type="button" onClick={() => handleAddHealthEvent('medicine')} className="w-full py-2 border border-dashed border-blue-300 rounded-xl text-[9px] font-black text-blue-500 uppercase hover:bg-blue-50 transition-all">+ Agendar Medicamento</button>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 flex gap-4">
                        <button type="submit" className="flex-1 grass-bg py-5 rounded-3xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center gap-3">
                           <Save size={24} /> {editingPet ? 'Atualizar Prontuário' : 'Salvar Novo Amigo'}
                        </button>
                        {editingPet && (
                           <button type="button" onClick={() => { handleDeletePet(editingPet.id); setIsPetModalOpen(false); }} className="px-10 py-5 rounded-3xl bg-red-50 text-red-600 font-black text-xl shadow-xl border-b-8 border-red-200">
                              <Trash2 size={24} />
                           </button>
                        )}
                     </div>
                  </form>
               </div>
            </div>
         )}

         {isAdoptionPetsModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="wood-panel w-full max-w-5xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={() => setIsAdoptionPetsModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24} /></button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b-4 border-[#c9a688]/30 pb-6">
                     <div className="flex items-center gap-4">
                        <div className="grass-bg p-3 rounded-2xl text-white shadow-lg">
                           <Gift size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-[#5d2e0a] uppercase tracking-tighter">Minhas Publicações</h2>
                     </div>
                     <button
                        onClick={() => { setIsAdoptionPetsModalOpen(false); navigate('/cadastrar'); }}
                        className="grass-bg px-8 py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-[#3d7a22] hover:scale-105 transition-all flex items-center gap-2"
                     >
                        <Plus size={24} /> Criar Novo Anúncio
                     </button>
                  </div>

                  {adoptionPets.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adoptionPets.map(pet => (
                           <div key={pet.id} className="wood-panel p-4 rounded-[32px] border-2 border-[#c9a688] shadow-md bg-white group flex flex-col">
                              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[#c9a688]">
                                 <img src={pet.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={pet.name} />
                                 <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase shadow-sm ${pet.adoptionType === 'adoption' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                                       }`}>
                                       {pet.adoptionType === 'adoption' ? 'Adoção' : 'Apadrinhar'}
                                    </span>
                                 </div>
                              </div>
                              <div className="px-2 space-y-2 flex-1">
                                 <h4 className="text-xl font-black text-[#5d2e0a]">{pet.name}</h4>
                                 <p className="text-[10px] font-bold text-[#8b4513] uppercase">{pet.breed} • {pet.age}</p>
                                 <p className="text-[10px] text-[#55a630] font-black flex items-center gap-1 uppercase">
                                    <Heart size={10} fill="currentColor" /> {pet.personality}
                                 </p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#c9a688]/20">
                                 <button
                                    onClick={() => { setIsAdoptionPetsModalOpen(false); navigate(`/editar/${pet.id}`); }}
                                    className="wood-panel bg-[#f1dfcf] py-2 rounded-xl text-[10px] font-black uppercase text-[#5d2e0a] border border-[#c9a688] flex items-center justify-center gap-1 hover:bg-[#d2b48c] transition-all"
                                 >
                                    <Edit3 size={14} /> Editar
                                 </button>
                                 <button
                                    onClick={() => handleDeleteAdoptionPet(pet.id)}
                                    className="wood-panel bg-red-50 py-2 rounded-xl text-[10px] font-black uppercase text-red-600 border border-red-200 flex items-center justify-center gap-1 hover:bg-red-100 transition-all"
                                 >
                                    <Trash2 size={14} /> Excluir
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="py-20 text-center space-y-6 opacity-40">
                        <div className="w-24 h-24 wood-inner border-4 border-dashed border-[#c9a688] rounded-full mx-auto flex items-center justify-center">
                           <Dog size={48} className="text-[#8b4513]" />
                        </div>
                        <h3 className="text-xl font-black text-[#5d2e0a]">Você não tem anúncios cadastrados.</h3>
                        <p className="text-sm font-bold text-[#8b4513] max-w-md mx-auto">Comece agora e ajude um amiguinho a encontrar um lar!</p>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

const ProfileItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
   <div className="flex items-start gap-4 p-4 wood-inner border border-[#c9a688]/30">
      <div className="text-[#55a630] mt-1">{icon}</div>
      <div className="min-w-0">
         <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60 leading-none mb-1">{label}</p>
         <p className="text-sm font-bold text-[#5d2e0a] truncate">{value}</p>
      </div>
   </div>
);

export default UserProfile;
