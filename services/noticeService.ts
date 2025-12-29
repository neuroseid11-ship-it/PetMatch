
import { MuralPost, MuralComment } from '../types';

const STORAGE_KEY = 'petmatch_mural_posts';

const INITIAL_POSTS: MuralPost[] = [
  {
    id: 'm1',
    userName: 'PETMATCH OFICIAL',
    userAvatar: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    caption: 'Preparativos a todo vapor para a feira de adoção deste final de semana no Parque da Cidade! Esperamos vocês das 10h às 16h. 🐾✨',
    timestamp: 'HÁ 2 HORAS',
    likes: 42,
    isLiked: false,
    comments: [
      { id: 'c1', userName: 'Ana Clara', userAvatar: 'https://picsum.photos/seed/ana/50/50', text: 'Estarei lá com certeza! 😍', timestamp: 'Há 1 hora' }
    ]
  },
  {
    id: 'm2',
    userName: 'ONG FLORA E FAUNA',
    userAvatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=100',
    imageUrl: 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=800',
    caption: 'Hoje foi dia de vacinação para os nossos pequenos resgatados. Graças aos padrinhos, todos estão protegidos! #ProteçãoAnimal',
    timestamp: 'HÁ 5 HORAS',
    likes: 28,
    isLiked: true,
    comments: []
  },
  {
    id: 'm3',
    userName: 'PETZ NORTE',
    userAvatar: 'https://picsum.photos/seed/petz/100/100',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
    caption: 'Nova remessa de caminhas sustentáveis chegou na loja! Guardiões têm 15% OFF com o código PetMatch15. 🛒💸',
    timestamp: 'ONTEM',
    likes: 45,
    isLiked: false,
    comments: []
  },
  {
    id: 'm4',
    userName: 'PETMATCH OFICIAL',
    userAvatar: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
    caption: 'CAPACITAÇÃO: Novo workshop para voluntários de campo no próximo sábado. Participe e ganhe o selo de Guardião Especialista! 🎓🐾',
    timestamp: 'HÁ 10 MINUTOS',
    likes: 12,
    isLiked: false,
    comments: []
  },
  {
    id: 'm5',
    userName: 'ABRIGO AMIGO FIEL',
    userAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=100',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    caption: 'FINAL FELIZ! A Safira encontrou seu lar definitivo hoje. Olhem só a felicidade dela com sua nova família! Desejamos muito amor nessa nova fase. ❤️🐱',
    timestamp: 'HÁ 1 DIA',
    likes: 254,
    isLiked: false,
    comments: [
      { id: 'csaf', userName: 'Maria José', userAvatar: 'https://picsum.photos/seed/maria/50/50', text: 'Que notícia maravilhosa! Ela merece muito.', timestamp: 'Há 5 horas' }
    ]
  },
  {
    id: 'm6',
    userName: 'CLÍNICA VETCARE',
    userAvatar: 'https://cdn-icons-png.flaticon.com/512/387/387561.png',
    imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800',
    caption: 'BEM-VINDA: A Clínica VetCare agora é parceira premium da PetMatch DF. Guardiões têm 20% de desconto em check-ups preventivos! 🏥🩺',
    timestamp: 'HÁ 3 DIAS',
    likes: 89,
    isLiked: false,
    comments: []
  },
  {
    id: 'm7',
    userName: 'ONG FLORA E FAUNA',
    userAvatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=100',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    caption: 'URGENTE: Estamos com o estoque de ração para filhotes muito baixo. Quem puder doar, nosso ponto de coleta principal é no Parque da Cidade (estacionamento 4). Ajude-nos a manter nossos pequenos nutridos! 🙏🐶',
    timestamp: 'HÁ 6 HORAS',
    likes: 156,
    isLiked: false,
    comments: []
  }
];

export const noticeService = {
  getAll: (): MuralPost[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(data);
  },

  save: (post: MuralPost): void => {
    const posts = noticeService.getAll();
    const exists = posts.find(p => p.id === post.id);
    let updated;
    if (exists) {
      updated = posts.map(p => p.id === post.id ? post : p);
    } else {
      updated = [post, ...posts];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleLike: (id: string): void => {
    const posts = noticeService.getAll();
    const updated = posts.map(p => {
      if (p.id === id) {
        const liked = !p.isLiked;
        return {
          ...p,
          isLiked: liked,
          likes: liked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  addComment: (postId: string, comment: MuralComment): void => {
    const posts = noticeService.getAll();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, comment] };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const posts = noticeService.getAll();
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
