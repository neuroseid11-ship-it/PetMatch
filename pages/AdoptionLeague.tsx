
import React, { useState } from 'react';
import { Plus, Info, Coins, History, ArrowRight } from 'lucide-react';

const AdoptionLeague: React.FC = () => {
  const [slots] = useState([1, 2, 3, 4, 5]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="wood-panel p-8 rounded-3xl border-2 border-[#c9a688] shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-2 relative z-10">
            <p className="flex items-center gap-2 text-xs font-bold text-[#8b4513] uppercase tracking-widest">
              <TrophyIcon /> Fantasy Game Solidário
            </p>
            <h1 className="text-4xl font-black text-[#5d2e0a]">Jornada da Adoção</h1>
            <p className="text-[#8b4513] max-w-2xl font-medium">
              Rodada #12 - Escale 5 animais de abrigos parceiros. Quanto mais interações eles receberem na vida real, mais pontos você ganha!
            </p>
          </div>
          
          <div className="text-center relative z-10">
            <p className="text-[10px] font-bold text-[#8b4513] uppercase mb-2 tracking-tighter">Encerramento da Rodada</p>
            <div className="flex gap-2">
              <TimeUnit value="02" label="Dias" />
              <TimeUnit value="14" label="Hrs" />
              <TimeUnit value="30" label="Min" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f1dfcf] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Team Selection */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#5d2e0a] flex items-center gap-2">
                <UsersIcon /> Seu Time <span className="text-xs font-bold bg-[#f1dfcf] px-2 py-0.5 rounded-full border border-[#c9a688] ml-2">0/5 Selecionados</span>
              </h2>
              <button className="text-xs text-[#8b4513] font-bold hover:underline flex items-center gap-1">
                Como funciona a pontuação? <Info size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {slots.map((slot) => (
                <div key={slot} className="group cursor-pointer">
                  <div className="grass-bg aspect-square p-2 flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-emerald-300 transition-all rounded-3xl">
                    <div className="wood-panel w-full h-full rounded-2xl flex flex-col items-center justify-center border-2 border-[#c9a688] bg-opacity-80">
                      <div className="w-10 h-10 rounded-xl bg-[#f1dfcf] flex items-center justify-center text-[#8b4513] mb-2 group-hover:bg-[#d2b48c] transition-colors">
                        <Plus size={20} strokeWidth={3} />
                      </div>
                      <p className="text-[10px] font-black text-[#5d2e0a] uppercase text-center leading-none">Adicionar Pet</p>
                      <p className="text-[8px] text-[#8b4513] font-bold mt-1">Slot #{slot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ranking Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#5d2e0a]">Ranking da Semana</h2>
              <button className="text-xs text-[#8b4513] font-bold hover:underline">Ver todos</button>
            </div>
            <div className="wood-panel rounded-2xl overflow-hidden border-2 border-[#c9a688] shadow-lg">
              <table className="w-full text-left">
                <thead className="bg-[#d2b48c] text-[#5d2e0a] text-[10px] font-bold uppercase tracking-wider border-b-2 border-[#b38b6d]">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Jogador</th>
                    <th className="px-6 py-3 text-center">Matches</th>
                    <th className="px-6 py-3 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody className="text-[#5d2e0a]">
                  <RankRow rank={1} name="Mariana Costa" avatar="https://picsum.photos/seed/mari/50/50" matches={12} points="1.450" />
                  <RankRow rank={2} name="João Silva" avatar="https://picsum.photos/seed/jo/50/50" matches={9} points="1.280" />
                  <RankRow rank={3} name="Carlos M." avatar="https://picsum.photos/seed/carlos2/50/50" matches={7} points="950" />
                  <RankRow rank={42} name="Você" avatar="https://picsum.photos/seed/user/50/50" matches={0} points="0" isUser />
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] shadow-md relative">
            <p className="text-[10px] font-bold text-[#8b4513] uppercase tracking-wider mb-1">Sua Carteira</p>
            <h2 className="text-3xl font-black text-[#5d2e0a] flex items-baseline gap-1">1.250 <span className="text-sm font-bold">PC</span></h2>
            <div className="w-full bg-[#f1dfcf] h-1.5 rounded-full mt-4 border border-[#c9a688]">
              <div className="bg-[#55a630] w-[60%] h-full"></div>
            </div>
            <p className="text-[10px] text-[#8b4513] mt-2 font-medium">Você ganhou 300 PetCoins esta semana!</p>
            <button className="w-full mt-6 wood-panel bg-[#f1dfcf] py-2 rounded-xl text-xs font-bold text-[#5d2e0a] flex items-center justify-center gap-2 hover:bg-[#e6cbb3] transition-colors">
              <History size={14} /> Histórico de Transações
            </button>
            <div className="absolute -bottom-1 left-4 right-4 h-1 grass-bg"></div>
          </div>

          <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] shadow-md relative group">
            <h4 className="text-sm font-bold text-[#5d2e0a] mb-2">Ticket da Rodada #12</h4>
            <p className="text-[11px] text-[#8b4513] leading-tight mb-4">
              Garanta sua participação e concorra a prêmios exclusivos dos parceiros.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-[#5d2e0a] mb-6">
               <Coins size={16} className="text-[#cd7f32]" /> 50 PetCoins
            </div>
            <div className="space-y-2">
              <button className="w-full wood-panel bg-[#d2b48c] py-3 rounded-xl text-xs font-black text-[#5d2e0a] flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform">
                Usar 50 PetCoins <ArrowRight size={14} />
              </button>
              <button className="w-full text-[10px] font-bold text-[#8b4513] hover:underline uppercase tracking-tight">
                Comprar mais créditos
              </button>
            </div>
            <div className="absolute -bottom-1 -left-1 -right-1 h-3 grass-bg flex overflow-hidden opacity-40">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className="w-2 h-full border-r border-[#3d7a22] rotate-12"></div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="wood-inner flex flex-col items-center justify-center w-14 h-14 border border-[#c9a688] shadow-inner">
    <span className="text-lg font-black text-[#5d2e0a] leading-none">{value}</span>
    <span className="text-[8px] font-bold text-[#8b4513] uppercase mt-1">{label}</span>
  </div>
);

const RankRow = ({ rank, name, avatar, matches, points, isUser }: any) => (
  <tr className={`${isUser ? 'bg-[#f5e7da]' : 'hover:bg-[#fcf3ea]'} border-b border-[#c9a688] transition-colors`}>
    <td className="px-6 py-3 text-xs font-bold text-[#8b4513]">{rank}</td>
    <td className="px-6 py-3">
      <div className="flex items-center gap-3">
        <img src={avatar} className="w-8 h-8 rounded-full border border-[#55a630]" alt={name} />
        <span className={`text-sm font-bold ${isUser ? 'text-[#55a630]' : 'text-[#5d2e0a]'}`}>{name}</span>
      </div>
    </td>
    <td className="px-6 py-3 text-center text-xs font-bold text-[#5d2e0a]">{matches}</td>
    <td className="px-6 py-3 text-right text-sm font-black text-[#5d2e0a]">{points}</td>
  </tr>
);

const TrophyIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5 text-[#55a630]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default AdoptionLeague;
