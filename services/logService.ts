
import { AdminLog } from '../types';

const STORAGE_KEY = 'petmatch_admin_logs';

export const logService = {
  getAll: (): AdminLog[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  add: (log: Omit<AdminLog, 'id' | 'timestamp' | 'adminEmail'>): void => {
    const logs = logService.getAll();
    const adminEmail = localStorage.getItem('petmatch_user_email') || 'sistema@petmatch.com.br';
    
    const newLog: AdminLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      adminEmail,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newLog, ...logs].slice(0, 500))); // Mantém os últimos 500
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
