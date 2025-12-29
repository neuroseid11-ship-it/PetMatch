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
                    <h4 className="font-black text-sm truncate uppercase tracking-tighter">{user.name}</h4>
                    <p className="text-[10px] text-[#8b4513] font-bold truncate opacity-70">{user.email}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className="text-[10px] font-bold text-[#8b4513] bg-[#f1dfcf] px-3 py-1 rounded-full border border-[#c9a688]">{user.documentNumber}</span>
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
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={onViewProfile}
                    className="p-2 wood-inner text-[#5d2e0a] hover:bg-[#d2b48c] border border-[#c9a688] transition-all flex items-center gap-1 group/btn"
                    title="Ver Perfil Completo"
                >
                    <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase hidden md:inline">Ver Perfil</span>
                </button>

                {user.status !== 'approved' && (
                    <button
                        onClick={() => onUpdateStatus(user.id, 'approved')}
                        className="p-2 wood-inner text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Aprovar Cadastro"
                    >
                        <CheckCircle size={16} />
                    </button>
                )}

                <button
                    onClick={() => onDelete(user.id, user.name)}
                    className="p-2 wood-inner text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                    title="Excluir Permanentemente"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </td>
    </tr>
);

export default UserRow;
