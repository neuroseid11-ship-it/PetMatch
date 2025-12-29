
import React, { useState, useEffect } from 'react';
import { 
  Camera, Heart, MessageSquare, Share2, MoreHorizontal, X, Smile, Send, Plus, Check, Copy, Grid, Bookmark, UserCircle2, MapPin, Settings, Instagram, Facebook, Globe, Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { noticeService } from '../services/noticeService';
import { MuralPost, MuralComment } from '../types';

const MuralFeed: React.FC = () => {
  const navigate = useNavigate();
  const [muralPosts, setMuralPosts] = useState<MuralPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<MuralPost | null>(null);
  const [postComment, setPostComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMuralModalOpen, setIsMuralModalOpen] = useState(false);
  const [newMuralPost, setNewMuralPost] = useState({ imageUrl: '', caption: '' });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para o Perfil da Comunidade
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileBio, setProfileBio] = useState('Conectando corações e transformando a vida dos pets em todo o Distrito Federal. 🐾 Compartilhe suas conquistas!');
  const [socialLinks, setSocialLinks] = useState({
    instagram: 'petmatch.df',
    facebook: 'petmatchdf',
    website: 'petmatch.df/comunidade'
  });

  useEffect(() => {
    const role = localStorage.getItem('petmatch_user_role');
    setIsAdmin(role === 'admin');
    loadMural();
    
    // Carregar bio e links salvos se existirem
    const savedBio = localStorage.getItem('petmatch_mural_bio');
    if (savedBio) setProfileBio(savedBio);
    const savedLinks = localStorage.getItem('petmatch_mural_links');
    if (savedLinks) setSocialLinks(JSON.parse(savedLinks));
  }, []);

  const loadMural = () => {
    setMuralPosts(noticeService.getAll());
  };

  const handleLikePost = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    noticeService.toggleLike(postId);
    loadMural();
    if (selectedPost?.id === postId) {
      const updated = noticeService.getAll().find(p => p.id === postId);
      if (updated) setSelectedPost(updated);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postComment.trim() || !selectedPost) return;

    const newComment: MuralComment = {
      id: Date.now().toString(),
      userName: 'Você (Guardião)',
      userAvatar: 'https://picsum.photos/seed/user/100/100',
      text: postComment,
      timestamp: 'AGORA MESMO'
    };

    noticeService.addComment(selectedPost.id, newComment);
    loadMural();
    const updated = noticeService.getAll().find(p => p.id === selectedPost.id);
    if (updated) setSelectedPost(updated);
    setPostComment('');
  };

  const handleMuralFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMuralPost(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishMural = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuralPost.imageUrl || !newMuralPost.caption) return;
    const post: MuralPost = {
      id: Date.now().toString(),
      userName: 'PETMATCH ADMIN',
      userAvatar: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
      imageUrl: newMuralPost.imageUrl,
      caption: newMuralPost.caption,
      timestamp: 'AGORA MESMO',
      likes: 0,
      isLiked: false,
      comments: []
    };
    noticeService.save(post);
    loadMural();
    setNewMuralPost({ imageUrl: '', caption: '' });
    setIsMuralModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('petmatch_mural_bio', profileBio);
    localStorage.setItem('petmatch_mural_links', JSON.stringify(socialLinks));
    setIsEditProfileModalOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 px-4">
      
      {/* CABEÇALHO ATUALIZADO CONFORME IMAGEM */}
      <header className="py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-black text-[#5d2e0a] tracking-tight uppercase">Mural da Rede DF</h1>
          
          <div className="flex gap-2 items-center">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsMuralModalOpen(true)}
                  className="wood-panel px-6 py-2 rounded-xl text-[10px] font-black uppercase text-[#5d2e0a] shadow-md hover:bg-[#d2b48c] transition-colors border-2 border-[#c9a688]"
                >
                  Novo Post
                </button>
                <button 
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="wood-panel px-6 py-2 rounded-xl text-[10px] font-black uppercase text-[#5d2e0a] shadow-md hover:bg-[#d2b48c] transition-colors border-2 border-[#c9a688]"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={() => navigate('/perfil')}
                  className="wood-panel p-2 rounded-xl border-2 border-[#c9a688] shadow-md hover:rotate-45 transition-transform text-[#5d2e0a]"
                  title="Configurações Pessoais"
                >
                  <Settings size={18}/>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-black text-[#8b4513] uppercase opacity-70">
            {muralPosts.length} publicações
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-black text-[#5d2e0a] uppercase tracking-tighter">Comunidade PetMatch Brasília</h2>
            <p className="text-xs text-[#5d2e0a] font-medium leading-relaxed italic max-w-2xl">
              {profileBio}
            </p>
          </div>
          
          {/* ÍCONES DE REDES SOCIAIS DINÂMICOS */}
          <div className="flex items-center gap-4 text-[#8b4513]">
             {socialLinks.instagram && (
               <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noreferrer" className="hover:text-[#55a630] transition-colors flex items-center gap-1.5">
                 <Instagram size={16} />
                 <span className="text-[10px] font-black uppercase">@{socialLinks.instagram}</span>
               </a>
             )}
             {socialLinks.facebook && (
               <a href="#" className="hover:text-[#55a630] transition-colors">
                 <Facebook size={16} />
               </a>
             )}
             {socialLinks.website && (
               <a href={`https://${socialLinks.website}`} target="_blank" rel="noreferrer" className="hover:text-[#55a630] transition-colors flex items-center gap-1.5 text-blue-600">
                 <Globe size={16} />
                 <span className="text-[10px] font-black uppercase">{socialLinks.website}</span>
               </a>
             )}
          </div>
        </div>
        
        <div className="border-b-2 border-[#c9a688]/30 pt-4"></div>
      </header>

      {/* GRADE DE POSTS */}
      <div className="grid grid-cols-3 gap-1 md:gap-8 pt-6">
        {muralPosts.map((post) => (
          <div 
            key={post.id} 
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square cursor-pointer overflow-hidden wood-panel border-2 border-[#c9a688] rounded-xl md:rounded-3xl shadow-lg"
          >
            <img 
              src={post.imageUrl} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={post.caption} 
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-black">
              <div className="flex items-center gap-2">
                <Heart size={24} className="fill-white" />
                <span className="text-lg">{post.likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={24} className="fill-white" />
                <span className="text-lg">{post.comments.length}</span>
              </div>
            </div>
          </div>
        ))}

        {muralPosts.length === 0 && (
          <div className="col-span-3 py-20 text-center opacity-40">
             <Camera size={64} className="mx-auto text-[#8b4513] mb-4" />
             <h3 className="text-xl font-black text-[#5d2e0a]">Ainda não há fotos por aqui</h3>
          </div>
        )}
      </div>

      {/* POPUP EDITAR PERFIL COMUNIDADE */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsEditProfileModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={24}/></button>
            
            <h2 className="text-2xl font-black text-[#5d2e0a] mb-6 uppercase tracking-tighter border-b-2 border-[#c9a688] pb-2">Editar Info Mural</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#8b4513] uppercase ml-2">Bio / Descrição da Comunidade</label>
                  <textarea 
                    rows={4} 
                    value={profileBio} 
                    onChange={e => setProfileBio(e.target.value)}
                    className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none font-bold italic"
                    placeholder="Conte o que torna nossa rede especial..."
                  />
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-[#8b4513] uppercase ml-2 flex items-center gap-2">
                    <LinkIcon size={12}/> Redes Sociais e Links
                  </p>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] opacity-40" size={16} />
                      <input 
                        type="text" 
                        value={socialLinks.instagram} 
                        onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})}
                        className="w-full wood-inner pl-12 pr-4 py-3 text-sm border-2 border-[#c9a688] outline-none font-bold"
                        placeholder="Usuário Instagram (sem @)"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b4513] opacity-40" size={16} />
                      <input 
                        type="text" 
                        value={socialLinks.website} 
                        onChange={e => setSocialLinks({...socialLinks, website: e.target.value})}
                        className="w-full wood-inner pl-12 pr-4 py-3 text-sm border-2 border-[#c9a688] outline-none font-bold"
                        placeholder="Link Principal (ex: linktree.com/petmatch)"
                      />
                    </div>
                  </div>
               </div>

               <button type="submit" className="w-full grass-bg py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-4 border-[#3d7a22] hover:translate-y-[-2px] transition-all">
                  Salvar Alterações <Check size={20} className="inline ml-2" />
               </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DO POST */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-6xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 h-[90vh]">
            <button onClick={() => setSelectedPost(null)} className="absolute top-6 right-6 z-20 text-white md:text-[#5d2e0a] hover:rotate-90 transition-transform bg-black/40 md:bg-transparent rounded-full p-2"><X size={32} strokeWidth={3}/></button>
            
            <div className="w-full md:w-[60%] h-1/2 md:h-full bg-black flex items-center justify-center border-r-4 border-[#c9a688]/30 overflow-hidden">
              <img src={selectedPost.imageUrl} className="w-full h-full object-contain" alt="" />
            </div>

            <div className="w-full md:w-[40%] h-1/2 md:h-full bg-white flex flex-col">
              <div className="p-4 md:p-6 border-b-2 border-[#c9a688]/20 flex items-center justify-between bg-[#fdfaf7]">
                <div className="flex items-center gap-3">
                  <img src={selectedPost.userAvatar} className="w-10 h-10 rounded-full border-2 border-[#55a630] shadow-md" alt="" />
                  <div>
                    <p className="text-sm font-black text-[#5d2e0a] uppercase tracking-tighter leading-none">{selectedPost.userName}</p>
                    <p className="text-[10px] text-[#8b4513] font-black flex items-center gap-1 opacity-60 uppercase mt-1">
                      <MapPin size={10} className="text-red-500" /> Brasília, DF
                    </p>
                  </div>
                </div>
                <button className="text-[#5d2e0a] hover:opacity-60 transition-opacity">
                  <MoreHorizontal size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#fdfaf7]/30">
                <div className="flex gap-4">
                  <img src={selectedPost.userAvatar} className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-[#c9a688]" alt="" />
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium text-[#5d2e0a] leading-relaxed">
                      <span className="font-black uppercase mr-2 text-[#8b4513]">{selectedPost.userName}</span>
                      {selectedPost.caption}
                    </p>
                    <span className="text-[9px] font-black text-[#8b4513] uppercase opacity-40 tracking-widest">{selectedPost.timestamp}</span>
                  </div>
                </div>
                
                {selectedPost.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <img src={comment.userAvatar} className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-[#c9a688]/30" alt="" />
                    <div className="space-y-1">
                      <p className="text-[13px] font-medium text-[#5d2e0a] leading-relaxed">
                        <span className="font-black uppercase mr-2 text-[#8b4513]">{comment.userName}</span>
                        {comment.text}
                      </p>
                      <div className="flex gap-3 text-[9px] font-black text-[#8b4513] uppercase opacity-40">
                        <span>{comment.timestamp}</span>
                        <button className="hover:underline">Responder</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t-2 border-[#c9a688]/20 bg-white space-y-4">
                <div className="flex gap-6 text-[#5d2e0a]">
                  <button onClick={(e) => handleLikePost(e, selectedPost.id)}>
                    <Heart size={28} className={`cursor-pointer transition-all hover:scale-110 ${selectedPost.isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                  </button>
                  <MessageSquare size={28} className="cursor-pointer hover:text-[#55a630] transition-all" />
                  <Share2 size={28} onClick={() => setIsShareModalOpen(true)} className="cursor-pointer hover:text-blue-500 transition-all" />
                  <Bookmark size={28} className="ml-auto cursor-pointer hover:text-amber-500 transition-all" />
                </div>
                
                <div>
                   <p className="text-sm font-black text-[#5d2e0a] uppercase tracking-widest">{selectedPost.likes} CURTIDAS</p>
                   <p className="text-[9px] font-black text-[#8b4513] uppercase opacity-40 mt-1">{selectedPost.timestamp}</p>
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-4 border-t border-[#c9a688]/10 pt-4">
                  <Smile size={24} className="text-[#8b4513] opacity-40 cursor-pointer hover:opacity-100 transition-opacity" />
                  <input 
                    type="text" 
                    value={postComment}
                    onChange={e => setPostComment(e.target.value)}
                    placeholder="Adicione um comentário..." 
                    className="flex-1 text-sm wood-inner bg-transparent border-none focus:ring-0 outline-none placeholder-[#8b4513]/40" 
                  />
                  <button type="submit" disabled={!postComment.trim()} className="text-[#55a630] font-black text-xs uppercase tracking-widest disabled:opacity-30">Publicar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPARTILHAR */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-sm rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-10 text-center animate-in zoom-in-95">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={20} /></button>
            <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl mb-6">
               <Share2 size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#5d2e0a]">Compartilhar</h2>
            <div className="mt-8 space-y-3">
               <div className="wood-inner p-3 flex items-center justify-between border border-[#c9a688]">
                  <span className="text-[10px] font-bold text-[#5d2e0a] truncate mr-4 uppercase">{window.location.href}</span>
                  <button onClick={copyToClipboard} className="text-[#55a630]">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO REGISTRO (ADMIN) */}
      {isMuralModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95">
            <button onClick={() => setIsMuralModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            <h2 className="text-3xl font-black text-[#5d2e0a] mb-8 uppercase tracking-tighter border-b-2 border-[#c9a688] pb-2">Novo Registro no Mural</h2>
            <form onSubmit={handlePublishMural} className="space-y-6">
              <div className="aspect-square wood-inner border-4 border-[#c9a688] border-dashed rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden bg-[#fdfaf7]">
                {newMuralPost.imageUrl ? (
                  <img src={newMuralPost.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                ) : (
                  <div className="text-center opacity-40">
                    <Camera size={64} className="mx-auto text-[#8b4513]" />
                    <p className="text-xs font-black uppercase">Clique para enviar uma foto</p>
                  </div>
                )}
                <input required type="file" accept="image/*" hidden id="mural-img" onChange={handleMuralFileChange} />
                <label htmlFor="mural-img" className="absolute inset-0 cursor-pointer"></label>
              </div>
              <textarea 
                required
                rows={3}
                value={newMuralPost.caption}
                onChange={e => setNewMuralPost({...newMuralPost, caption: e.target.value})}
                placeholder="Legenda para o destaque..."
                className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] outline-none font-bold"
              />
              <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22]">Publicar no Mural <Send size={24} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuralFeed;
