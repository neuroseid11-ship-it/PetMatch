
import React, { useState } from 'react';
// Added PawPrint to the imports from lucide-react
import { Share2, BookOpen, Calendar, Trophy, Lock, BarChart2, Coins, ChevronRight, PawPrint } from 'lucide-react';
import { Mission, Guardian } from '../types';

const Gamification: React.FC = () => {
  const [missions] = useState<Mission[]>([
    { id: '1', title: 'Compartilhar perfil de adoção', description: 'Ajude um pet a encontrar um lar compartilhando nas redes.', reward: 50, completed: false, type: 'share' },
    { id: '2', title: 'Leitura Rápida', description: 'Leia o artigo "Cuidados com Pets no Verão".', reward: 20, completed: false, type: 'read' },
    { id: '3', title: 'Check-in Diário', description: 'Acesse a plataforma hoje.', reward: 10, completed: true, type: 'checkin' },
  ]);

  const topGuardians: Guardian[] = [
    { rank: 1, name: 'Ana M.', xp: '5.2k', avatar: 'https://picsum.photos/seed/ana/100/100' },
    { rank: 2, name: 'João P.', xp: '4.8k', avatar: 'https://picsum.photos/seed/joao/100/100' },
    { rank: 3, name: 'Bia S.', xp: '4.1k', avatar: 'https://picsum.photos/seed/bia/100/100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#5d2e0a]">A Jornada do Guardião - Revisada</h1>
          <p className="text-[#8b4513]">Complete missões diárias, suba de nível e ajude mais pets!</p>
        </div>
        <button className="wood-panel px-4 py-2 rounded-xl flex items-center gap-2 text-[#5d2e0a] font-semibold hover:translate-y-[-2px] transition-transform">
          <BarChart2 size={18} />
          Ver Ranking Global
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Wallet */}
        <div className="space-y-6">
          <div className="grass-bg p-4 shadow-xl">
            <div className="wood-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/carlos/100/100" className="w-16 h-16 rounded-full border-2 border-[#55a630]" alt="Carlos" />
                <div>
                  <p className="text-xs text-[#8b4513]">Bem-vindo de volta,</p>
                  <h3 className="text-xl font-bold text-[#5d2e0a]">Carlos Silva</h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-[#5d2e0a]">
                  <span className="flex items-center gap-1"><Trophy size={14} /> Nível 5</span>
                  <span className="opacity-70">Protetor Jr.</span>
                </div>
                <div className="w-full bg-[#f1dfcf] h-3 rounded-full overflow-hidden border border-[#c9a688]">
                  <div className="bg-[#55a630] h-full w-[45%]" />
                </div>
                <div className="flex justify-between text-[10px] text-[#8b4513] font-medium">
                  <span>Progresso atual</span>
                  <span>450/1000 XP</span>
                </div>
                <p className="text-center text-[10px] text-[#8b4513] mt-1 italic">Faltam 550 XP para o próximo nível</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="wood-inner p-3 text-center">
                  <p className="text-2xl font-bold text-[#5d2e0a]">12</p>
                  <p className="text-[10px] text-[#8b4513] uppercase tracking-wider">Missões Feitas</p>
                </div>
                <div className="wood-inner p-3 text-center">
                  <p className="text-2xl font-bold text-[#5d2e0a]">3</p>
                  <p className="text-[10px] text-[#8b4513] uppercase tracking-wider">Conquistas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="wood-panel p-6 rounded-2xl relative overflow-hidden shadow-lg border-2 border-[#c9a688]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#5d2e0a]">
                   <Coins size={16} className="text-[#cd7f32]" /> Minha Carteira
                </p>
                <h2 className="text-4xl font-black text-[#5d2e0a] mt-1">1.250 <span className="text-lg font-bold">PetCoins</span></h2>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/1036/1036815.png" alt="Chest" className="w-20 h-20 -rotate-12 drop-shadow-md" />
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 wood-panel bg-[#d2b48c] py-2 rounded-xl text-[#5d2e0a] font-bold shadow-sm hover:opacity-80 flex items-center justify-center gap-2">
                 Resgatar
              </button>
              <button className="px-4 wood-panel py-2 rounded-xl text-[#5d2e0a] font-bold shadow-sm hover:opacity-80">
                ↺
              </button>
            </div>
            {/* Grass fringe decorative */}
            <div className="absolute -bottom-1 -left-1 -right-1 h-3 grass-bg opacity-30"></div>
          </div>
        </div>

        {/* Middle & Right Column Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Missions */}
          <section>
            <h2 className="text-xl font-bold text-[#5d2e0a] flex items-center gap-2 mb-4">
              <Calendar className="text-[#55a630]" /> Missões do Dia
            </h2>
            <div className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="wood-panel p-4 rounded-2xl flex items-center justify-between group hover:translate-x-1 transition-transform border-2 border-[#c9a688]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 wood-inner flex items-center justify-center text-[#8b4513]">
                      {mission.type === 'share' && <Share2 size={24} />}
                      {mission.type === 'read' && <BookOpen size={24} />}
                      {mission.type === 'checkin' && <Calendar size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5d2e0a]">{mission.title}</h4>
                      <p className="text-xs text-[#8b4513]">{mission.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!mission.completed ? (
                      <>
                        <span className="text-xs font-bold text-[#5d2e0a] bg-[#f1dfcf] px-2 py-1 rounded-lg border border-[#c9a688] flex items-center gap-1">
                          <Coins size={12} className="text-[#cd7f32]" /> +{mission.reward} Coins
                        </span>
                        <button className="wood-panel bg-[#d2b48c] px-4 py-2 rounded-xl text-xs font-bold text-[#5d2e0a] hover:opacity-80">
                          {mission.type === 'read' ? 'Ler Agora' : 'Realizar'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 italic">Concluído</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Achievements */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#5d2e0a] flex items-center gap-2">
                  <Trophy className="text-[#55a630]" /> Conquistas
                </h2>
                <button className="text-xs text-[#8b4513] font-bold hover:underline">Ver todas</button>
              </div>
              <div className="flex gap-4">
                <div className="grass-bg p-1.5 rounded-2xl shadow-md">
                   <div className="wood-panel p-4 w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1">
                     <PawPrint className="text-[#8b4513]" size={28} />
                     <p className="text-[8px] text-center font-bold text-[#5d2e0a] uppercase leading-tight">Amigo dos Pets</p>
                   </div>
                </div>
                <div className="grass-bg p-1.5 rounded-2xl shadow-md">
                   <div className="wood-panel p-4 w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1">
                     <Trophy className="text-[#cd7f32]" size={28} />
                     <p className="text-[8px] text-center font-bold text-[#5d2e0a] uppercase leading-tight">Doador Bronze</p>
                   </div>
                </div>
                <div className="wood-panel w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 border-dashed border-2 border-[#c9a688] opacity-60">
                   <Lock className="text-[#8b4513] opacity-40" size={24} />
                   <p className="text-[10px] font-bold text-[#5d2e0a]">Bloqueado</p>
                </div>
              </div>
            </section>

            {/* Top Guardians */}
            <section>
              <h2 className="text-xl font-bold text-[#5d2e0a] flex items-center gap-2 mb-4">
                <BarChart2 className="text-[#55a630]" /> Top Guardiões
              </h2>
              <div className="grass-bg p-3 space-y-2">
                {topGuardians.map((g) => (
                  <div key={g.rank} className="wood-panel px-4 py-2 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#8b4513] w-4">{g.rank}</span>
                      <img src={g.avatar} className="w-8 h-8 rounded-full border border-[#55a630]" alt={g.name} />
                      <span className="text-sm font-bold text-[#5d2e0a]">{g.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8b4513]">XP {g.xp}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
