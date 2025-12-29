
import { PlatformEvent } from '../types';

const STORAGE_KEY = 'petmatch_events';

const INITIAL_EVENTS: PlatformEvent[] = [
  {
    id: 'e1',
    title: 'Feira de Adoção PetMatch',
    date: '2024-05-20',
    time: '10:00 - 16:00',
    location: 'Parque da Cidade, Brasília',
    description: 'Venha conhecer seu novo melhor amigo! Mais de 30 cães e gatos ansiosos por um lar.',
    category: 'adoption',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600',
    top: '30%',
    left: '48%'
  },
  {
    id: 'e2',
    title: 'Caminhada Solidária no Eixão',
    date: '2024-06-02',
    time: '08:00 - 11:00',
    location: 'Eixão Norte, Brasília',
    description: 'Traga seu pet para um passeio especial no Eixão! Teremos brindes, hidratação para os peludos e muita diversão.',
    category: 'social',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    top: '20%',
    left: '52%'
  },
  {
    id: 'e3',
    title: 'Workshop: Primeiros Socorros Pet',
    date: '2024-06-15',
    time: '14:00 - 17:00',
    location: 'Auditório PetMatch, Setor Comercial',
    description: 'Aprenda com veterinários experientes como agir em situações de emergência com seu cão ou gato. Vagas limitadas!',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600',
    top: '45%',
    left: '45%'
  },
  {
    id: 'e4',
    title: 'Arraiá dos Pets PetMatch',
    date: '2024-06-22',
    time: '16:00 - 22:00',
    location: 'Parque Olhos D\'Água, Asa Norte',
    description: 'Nossa festa junina oficial! Concurso de melhor fantasia pet, barracas de comidas típicas (para humanos e pets) e quadrilha animal.',
    category: 'social',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    top: '15%',
    left: '50%'
  }
];

export const eventService = {
  getAll: (): PlatformEvent[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(data);
  },

  save: (event: Omit<PlatformEvent, 'id'>, id?: string): PlatformEvent => {
    const events = eventService.getAll();
    let newEvent: PlatformEvent;

    if (id) {
      newEvent = { ...event, id };
      const updated = events.map(e => e.id === id ? newEvent : e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...events, newEvent]));
    }
    return newEvent;
  },

  delete: (id: string): void => {
    const events = eventService.getAll();
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
