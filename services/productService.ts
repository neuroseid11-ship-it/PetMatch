
import { Product } from '../types';

const STORAGE_KEY = 'petmatch_store_products';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Boné Protetor Oficial',
    description: 'Boné exclusivo para os guardiões da PetMatch DF.',
    price: 350,
    category: 'bones',
    imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400',
    stock: 50
  },
  {
    id: 'p2',
    name: 'Pack Adesivos Pets',
    description: 'Cartela com adesivos exclusivos. Inclui o famoso selo "Sem Raça Definida mas mudou minha vida!".',
    price: 120,
    category: 'adesivos',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
    stock: 200
  },
  {
    id: 'p3',
    name: 'Vale-Consulta Parceiro',
    description: 'Crédito para utilização em consultas nas clínicas veterinárias parceiras da rede PetMatch.',
    price: 800,
    category: 'parceiros',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400',
    stock: 30
  },
  {
    id: 'p4',
    name: 'Caneta Pata Amiga',
    description: 'Caneta personalizada com topo em formato de patinha e escrita em gel preta.',
    price: 80,
    category: 'canetas',
    imageUrl: 'https://images.unsplash.com/photo-1585336139118-b31f74ec91a2?auto=format&fit=crop&q=80&w=400',
    stock: 100
  },
  {
    id: 'p5',
    name: 'Curso: Cuidados Básicos',
    description: 'Treinamento online em vídeo sobre higiene, alimentação e bem-estar do seu novo pet.',
    price: 1200,
    category: 'cursos',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400',
    stock: 999
  },
  {
    id: 'p6',
    name: 'Medalha Colecionável Anjo',
    description: 'Medalha física banhada a cobre comemorativa da 1ª Edição da Liga da Adoção.',
    price: 600,
    category: 'moedas',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=400',
    stock: 15
  },
  {
    id: 'p7',
    name: 'Guia Refletiva Noturna',
    description: 'Guia de 2 metros com material refletivo para passeios seguros à noite.',
    price: 400,
    category: 'acessorios',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400',
    stock: 25
  },
  {
    id: 'p8',
    name: 'Mordedor Corda Extra-Forte',
    description: 'Brinquedo de corda trançada ideal para cães de médio e grande porte.',
    price: 180,
    category: 'brinquedos',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400',
    stock: 45
  },
  {
    id: 'p9',
    name: 'Camiseta Guardião PetMatch',
    description: 'Camiseta 100% algodão com estampa exclusiva de pet da nossa comunidade.',
    price: 500,
    category: 'camisetas',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400',
    stock: 60
  },
  {
    id: 'p10',
    name: 'Kit Higiene Sustentável',
    description: 'Porta-saquinhos biodegradáveis com clip para coleira.',
    price: 150,
    category: 'acessorios',
    imageUrl: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&q=80&w=400',
    stock: 80
  },
  {
    id: 'p11',
    name: 'Curso: Comportamento Canino',
    description: 'Entenda os sinais do seu cão e aprenda técnicas de adestramento positivo para uma convivência harmoniosa.',
    price: 1500,
    category: 'cursos',
    imageUrl: 'https://images.unsplash.com/photo-1541591415222-36e8b5502219?auto=format&fit=crop&q=80&w=400',
    stock: 999
  },
  {
    id: 'p12',
    name: 'Curso: Nutrição Felina',
    description: 'Aprenda tudo sobre a dieta ideal para gatos, desde rações super premium até alimentação natural balanceada.',
    price: 1350,
    category: 'cursos',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    stock: 999
  },
  {
    id: 'p13',
    name: 'Curso: Primeiros Socorros Pet',
    description: 'Saiba como agir em emergências até chegar ao veterinário. Essencial para todo guardião responsável.',
    price: 1800,
    category: 'cursos',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    stock: 999
  }
];

export const productService = {
  getAll: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },

  getById: (id: string): Product | undefined => {
    const products = productService.getAll();
    return products.find(p => p.id === id);
  },

  save: (product: Omit<Product, 'id'>, id?: string): Product => {
    const products = productService.getAll();
    let updatedProduct: Product;

    if (id) {
      updatedProduct = { ...product, id };
      const updated = products.map(p => p.id === id ? updatedProduct : p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      updatedProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...products, updatedProduct]));
    }
    return updatedProduct;
  },

  delete: (id: string): void => {
    const products = productService.getAll();
    const updated = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
