import React from 'react';
import { Eye, CheckCircle, Trash2 } from 'lucide-react';
import { PlatformUser, UserStatus } from '../types';

interface UserRowProps {
    user: PlatformUser;
    onDelete: (id: string, name: string) => void;
    onUpdateStatus: (id: string, status: UserStatus) => void;
    onViewProfile: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onDelete, onUpdateStatus, onViewProfile }) => (
    <tr className="hover:bg-[#f1dfcf] transition-colors group">
        <td className="px-6 py-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border-2 border-[#c9a688] overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={user.photoUrl || 'https://picsum.photos/seed/user/50/50'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-black text-sm truncate uppercase tracking-tighter text-[#5d2e0a]">{user.name}</h4>
                    <p className="text-[10px] text-[#8b4513] font-bold truncate opacity-70">{user.email}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${user.documentNumber ? 'text-[#8b4513] bg-[#f1dfcf] border-[#c9a688]' : 'text-gray-400 bg-gray-100 border-gray-200'}`}>
                {user.documentNumber || '---'}
            </span>
        </td>
        <td className="px-6 py-4">
            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${user.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                user.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                    'bg-red-50 text-red-600 border-red-200'
                }`}>
                {user.status}
            </span>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={onViewProfile}
                    className="px-4 py-2 bg-[#f0e6dd] hover:bg-[#e6d8cc] text-[#5d2e0a] border border-[#dcbfa6] rounded-full shadow-sm transition-all flex items-center gap-2 group/btn"
                    title="Ver Perfil Completo"
                >
                    <Eye size={18} className="text-[#8b4513]" />
                    <span className="text-[10px] font-black uppercase text-[#8b4513]">Ver Perfil</span>
                </button>

                {user.status !== 'approved' && (
                    <button
                        onClick={() => onUpdateStatus(user.id, 'approved')}
                        className="w-10 h-10 bg-[#fefae0] hover:bg-[#fef3c7] border border-[#fefae0] hover:border-[#fcd34d] rounded-2xl shadow-sm flex items-center justify-center transition-all"
                        title="Aprovar Cadastro"
                    >
                        <CheckCircle size={20} className="text-[#10b981]" />
                    </button>
                )}

                <button
                    onClick={() => onDelete(user.id, user.name)}
                    className="w-10 h-10 bg-[#ffe4e6] hover:bg-[#fecdd3] border border-[#ffe4e6] hover:border-[#fda4af] rounded-2xl shadow-sm flex items-center justify-center transition-all"
                    title="Excluir Permanentemente"
                >
                    <Trash2 size={20} className="text-[#ef4444]" />
                </button>
            </div>
        </td>
    </tr>
);

export default UserRow;
