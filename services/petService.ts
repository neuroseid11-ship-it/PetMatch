
import { RegisteredPet } from '../types';

const STORAGE_KEY = 'petmatch_local_pets';

const INITIAL_DATA: RegisteredPet[] = [
  { 
    id: 'p0',
    name: 'Pipoca', 
    type: 'dog', 
    breed: 'Beagle', 
    location: 'Asa Sul, DF', 
    images: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800'], 
    personality: 'O Explorador', 
    personalityDesc: 'Ama passeios longos, cheirar tudo pela frente e descobrir novos lugares.', 
    age: '2 anos', 
    gender: 'Macho', 
    adoptionType: 'adoption', 
    responsibilityType: 'ong', 
    shelter: 'Abrigo Amigo Fiel', 
    status: 'approved', 
    createdAt: new Date().toISOString(),
    story: [
      'O Pipoca foi encontrado vagando perto do Parque da Cidade, assustado mas abanando o rabo para quem passava.',
      'Com cerca de 2 anos, ele está no auge da sua energia! É um cão extremamente sociável.',
      'Ele já aprendeu alguns comandos básicos como "senta" e "pata".'
    ], 
    health: { vacinado: 'Sim, todas doses', castrado: 'Sim', vermifugado: 'Recente', porte: 'Médio (15kg)' }
  },
  { 
    id: 'p1',
    name: 'Toby', 
    type: 'dog', 
    breed: 'Golden Retriever', 
    location: 'Lago Sul, DF', 
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800'], 
    personality: 'O Atleta', 
    personalityDesc: 'Ama correr, brincar de buscar bolinha e é extremamente dócil com crianças.', 
    age: '2 anos', 
    gender: 'Macho', 
    adoptionType: 'adoption', 
    responsibilityType: 'ong', 
    shelter: 'Abrigo Amigo Fiel', 
    status: 'approved', 
    createdAt: new Date().toISOString(),
    story: [
      'Toby foi resgatado de uma situação de negligência em um terreno baldio.',
      'Apesar disso, ele não perdeu o brilho nos olhos e a vontade de amar.',
      'Ideal para famílias ativas que buscam um parceiro para aventuras.'
    ], 
    health: { vacinado: 'Sim, completo', castrado: 'Sim', vermifugado: 'Sim', porte: 'Grande' }
  },
  { 
    id: 'p2',
    name: 'Mimi', 
    type: 'cat', 
    breed: 'Siamês', 
    location: 'Asa Norte, DF', 
    images: ['https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800'], 
    personality: 'A Elegante', 
    personalityDesc: 'Calma, silenciosa e adora observar o movimento pela janela ensolarada.', 
    age: '3 anos', 
    gender: 'Fêmea', 
    adoptionType: 'adoption', 
    responsibilityType: 'person', 
    shelter: 'Carla Oliveira', 
    status: 'approved', 
    createdAt: new Date().toISOString(),
    story: [
      'Mimi vivia em um apartamento onde a dona faleceu, ficando sozinha por alguns dias.',
      'Ela é uma gata muito carinhosa, mas tímida no início.',
      'Precisa de um lar tranquilo para florescer novamente.'
    ], 
    health: { vacinado: 'Sim', castrado: 'Sim', vermifugado: 'Sim', porte: 'Pequeno' }
  },
  { 
    id: 'p3',
    name: 'Max', 
    type: 'dog', 
    breed: 'Vira-lata (SRD)', 
    location: 'Gama, DF', 
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'], 
    personality: 'O Guardião', 
    personalityDesc: 'Sempre atento e leal, Max protege quem ama com todo seu coração.', 
    age: '4 anos', 
    gender: 'Macho', 
    adoptionType: 'adoption', 
    responsibilityType: 'ong', 
    shelter: 'ONG Flora e Fauna', 
    status: 'approved', 
    createdAt: new Date().toISOString(),
    story: [
      'Max era o "cão comunitário" de uma oficina, mas o local fechou e ele ficou sem lar.',
      'Ele é muito inteligente e já atende por comandos básicos.',
      'Ótimo para quem busca um cão de companhia fiel e protetor.'
    ], 
    health: { vacinado: 'Sim', castrado: 'Sim', vermifugado: 'Sim', porte: 'Médio' }
  }
];

export const petService = {
  getAll: async (): Promise<RegisteredPet[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  getById: async (id: string): Promise<RegisteredPet | undefined> => {
    const pets = await petService.getAll();
    return pets.find(p => p.id === id);
  },

  register: async (pet: Omit<RegisteredPet, 'id'>): Promise<string> => {
    const pets = await petService.getAll();
    const id = Math.random().toString(36).substr(2, 9);
    const newPet = { 
      ...pet, 
      id, 
      status: pet.status || 'pending',
      createdAt: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pets, newPet]));
    return id;
  },

  update: async (id: string, updatedData: Partial<RegisteredPet>): Promise<void> => {
    const pets = await petService.getAll();
    const updated = pets.map(p => p.id === id ? { ...p, ...updatedData } : p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    const pets = await petService.getAll();
    const filtered = pets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
