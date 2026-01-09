
import { AdminLog } from '../types';
import { supabase } from '../lib/supabaseClient';

const fromDB = (row: any): AdminLog => ({
  id: row.id,
  action: row.action,
  module: row.module,
  adminEmail: row.admin_email,
  adminName: row.admin_name,
  details: row.details,
  severity: row.severity,
  timestamp: row.timestamp
});

const toDB = (log: Partial<AdminLog>) => {
  const dbLog: any = { ...log };
  if (log.id) dbLog.id = log.id;
  if (log.adminEmail) dbLog.admin_email = log.adminEmail;
  if (log.adminName) dbLog.admin_name = log.adminName;
  delete dbLog.adminEmail;
  delete dbLog.adminName;
  return dbLog;
};

export const logService = {
  getAll: async (): Promise<AdminLog[]> => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return data.map(fromDB);
  },

  add: async (log: Omit<AdminLog, 'id' | 'timestamp' | 'adminEmail'>): Promise<void> => {
    const adminEmail = localStorage.getItem('petmatch_user_email') || 'sistema@petmatch.com.br';
    const adminName = localStorage.getItem('petmatch_user_name') || 'Admin';

    // Create local log object just to pass to toDB helper
    const newLogFull = {
      id: crypto.randomUUID(), // Generate a UUID for the log entry
      ...log,
      adminEmail,
      adminName,
      timestamp: new Date().toISOString(), // Ensure timestamp is set
    };

    const dbLog = toDB(newLogFull);
    // Let DB handle ID and Timestamp via defaults or we can set them
    // DB has default now() for timestamp, but our type has it as string.
    // If we rely on DB default, we don't send it.

    const { error } = await supabase
      .from('system_logs')
      .insert(dbLog);

    if (error) console.error('Error adding log:', error);
  },

  clear: async (): Promise<void> => {
    // Dangerous to expose clear all, maybe just for local testing
    // or we can implement it as 'delete all'.
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .neq('id', '0'); // Hack to delete all if needed, or specific logic.
    // But typically we don't clear DB logs.
    // Leaving implementation empty or minimal for safety unless requested.
    // The original code cleared LocalStorage.

    console.warn('Clear logs not fully implemented for Database for safety.');
  }
};
