
export interface AdminLog {
  id: string;
  action: string;
  module: 'pets' | 'users' | 'ongs' | 'messages' | 'store' | 'system';
  adminEmail: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  type: 'share' | 'read' | 'checkin';
}

export interface Guardian {
  rank: number;
  name: string;
  xp: string;
  avatar: string;
}

export interface PetSlot {
  id: number;
  petName?: string;
  imageUrl?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  reward: number;
  isUrgent: boolean;
  type: 'fair' | 'rescue' | 'health';
  status: 'pending' | 'approved';
  createdAt: string;
  authorEmail?: string;
}

export interface PetSponsorship {
  id: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  imageUrl: string;
  description: string;
  monthlyGoal: number;
  currentRaised: number;
  sponsorsCount: number;
  urgency: boolean;
  sponsorshipReason?: string;
}

export interface ONG {
  id: string;
  name: string;
  description: string;
  location: string;
  top: string;
  left: string;
  imageUrl: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
}

export interface PartnerCompany {
  id: string;
  name: string;
  about: string;
  bannerUrl: string;
  logoUrl: string;
  location: string;
  neighborhood: string;
  category: 'clinica' | 'petshop' | 'servico';
  is24h: boolean;
  phone: string;
  email: string;
  instagram?: string;
  promotions: Promotion[];
  top: string;
  left: string;
}

export interface RegisteredPet {
  id: string;
  ownerEmail?: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  location: string;
  images: string[];
  personality: string;
  personalityDesc?: string;
  personalityIcon?: string;
  story?: string[];
  health?: {
    vacinado: string;
    castrado: string;
    vermifugado: string;
    porte: string;
  };
  age: string;
  gender: 'Macho' | 'Fêmea';
  shelter?: string;
  ongId?: string;
  adoptionType: 'adoption' | 'sponsorship';
  responsibilityType: 'ong' | 'person';
  sponsorshipType?: 'financial' | 'item';
  sponsorshipValue?: number;
  sponsorshipItem?: string;
  sponsorshipReason?: string;
  // Campos de Match
  residenceSuitability?: 'house' | 'apartment' | 'both';
  energyLevel?: 'energetic' | 'chill';
  chipNumber?: string;
  status?: UserStatus;
  createdAt?: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDose?: string;
}

export interface UserPet {
  id: string;
  ownerEmail: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: string;
  weight: string;
  photoUrl: string;
  vaccines: VaccineRecord[];
  diseases: string;
  surgeries: string;
  medicines: string;
  consultations: string;
  grooming: string;
  chipNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'bones' | 'adesivos' | 'parceiros' | 'moedas' | 'cursos' | 'canetas' | 'camisetas' | 'acessorios' | 'brinquedos';
  imageUrl: string;
  stock: number;
}

export interface GarageItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  sellerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type UserType = 'volunteer' | 'partner';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  type: UserType;
  documentNumber: string;
  photoUrl: string;
  documentFileUrl: string;
  status: UserStatus;
  createdAt: string;
  coins: number;
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  petPreference?: 'dog' | 'cat' | 'both';
  residenceType?: 'house' | 'apartment';
  temperamentPreference?: 'energetic' | 'chill';
  partnerProfile?: PartnerCompany;
}

export type RequestType = 'interest' | 'visit' | 'event_suggestion' | 'abuse_report' | 'lost_pet' | 'direct_contact' | 'garage_approval';
export type RequestStatus = 'pending' | 'responded' | 'archived';

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  userName: string;
  userEmail: string;
  message: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  visitDate?: string;
  visitTime?: string;
  address?: string;
  relatedId?: string; // ID do item do mercado para aprovação
}

export interface CommunityChatMessage {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}

export interface MuralComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface MuralPost {
  id: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: MuralComment[];
}

export interface PlatformEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'adoption' | 'volunteer' | 'social' | 'health';
  imageUrl?: string;
  top?: string;
  left?: string;
}

export interface MapPoint {
  id: string;
  type: 'abrigo' | 'empresa' | 'perdido' | 'ong' | 'evento';
  name: string;
  top?: string;
  left?: string;
  lat?: number;
  lng?: number;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  hasBadge?: boolean;
  isAlert?: boolean;
}
