
import { PartnerCompany } from '../types';
import { userService } from './userService';

export const partnerService = {
  getAll: async (): Promise<PartnerCompany[]> => {
    // Busca todos os usuários da plataforma
    const allUsers = await userService.getAll();

    // Filtra apenas empresas aprovadas que possuem perfil de parceiro preenchido
    const dynamicPartners = allUsers
      .filter(u => u.type === 'partner' && u.status === 'approved' && u.partnerProfile)
      .map(u => u.partnerProfile!);

    return dynamicPartners;
  },

  getById: async (id: string): Promise<PartnerCompany | undefined> => {
    const partners = await partnerService.getAll();
    return partners.find(p => p.id === id);
  }
};
