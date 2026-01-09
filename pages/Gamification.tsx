import React, { useState, useEffect } from 'react';
import { Share2, BookOpen, Calendar, Trophy, Lock, BarChart2, Coins, ChevronRight, PawPrint } from 'lucide-react';
import { Mission, Guardian } from '../types';
import { missionService } from '../services/missionService';
import { supabase } from '../lib/supabaseClient';

const Gamification: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [topGuardians, setTopGuardians] = useState<Guardian[]>([]);
  const [userScore, setUserScore] = useState({ xp: 0, coins: 0, level: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [missionsData, rankingData] = await Promise.all([
        missionService.getAll(),
        missionService.getRanking()
      ]);

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (userId) {
        // Mark completed missions
        const userMissions = await missionService.getUserMissions(userId);
        const completedIds = new Set(userMissions.filter(m => m.status === 'completed').map(m => m.mission_id));

        const missionsWithStatus = missionsData.map(m => ({
          ...m,
          completed: completedIds.has(m.id)
        }));
        setMissions(missionsWithStatus);

        // Find user in ranking to get score
        const currentUserRank = rankingData.find(g => g.id === userId);
        if (currentUserRank) {
          setUserScore({
            xp: parseInt(currentUserRank.xp.replace('k', '000').replace('.', '')), // Simple parsing for display
            coins: 0, // Coins not yet in ranking view, defaulting
            level: Math.floor(parseInt(currentUserRank.xp.replace('k', '000').replace('.', '')) / 1000) + 1
          });
        }
      } else {
        setMissions(missionsData);
      }

      setTopGuardians(rankingData.slice(0, 5)); // Top 5
    } catch (error) {
      console.error("Error loading gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMission = async (mission: Mission) => {
    if (mission.completed) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        alert("Faça login para completar missões!");
        return;
      }

      await missionService.completeMission(mission.id, user.data.user.id);

      // Update local state to reflect completion immediately
      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, completed: true } : m));
      alert(`Parabéns! Você completou a missão "${mission.title}" e ganhou +${mission.xp_reward} XP!`);

      // Reload to update ranking/score
      loadData();
    } catch (error) {
      console.error("Error completing mission:", error);
      alert("Erro ao completar missão. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#5d2e0a]">A Jornada do Guardião</h1>
          <p className="text-[#8b4513]">Complete missões diárias, suba de nível e ajude mais pets!</p>
        </div>
        <button className="wood-panel px-4 py-2 rounded-xl flex items-center gap-2 text-[#5d2e0a] font-semibold hover:translate-y-[-2px] transition-transform">
          <BarChart2 size={18} />
          Ver Ranking Global
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-[#8b4513] font-bold">Carregando sua jornada...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile & Wallet */}
          <div className="space-y-6">
            <div className="grass-bg p-4 shadow-xl">
              <div className="wood-panel p-6 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-16 h-16 rounded-full border-2 border-[#55a630] bg-white" alt="Avatar" />
                  <div>
                    <p className="text-xs text-[#8b4513]">Bem-vindo de volta,</p>
                    <h3 className="text-xl font-bold text-[#5d2e0a]">Guardião</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-[#5d2e0a]">
                    <span className="flex items-center gap-1"><Trophy size={14} /> Nível {userScore.level}</span>
                    <span className="opacity-70">Protetor do Lar</span>
                  </div>
                  <div className="w-full bg-[#f1dfcf] h-3 rounded-full overflow-hidden border border-[#c9a688]">
                    <div className="bg-[#55a630] h-full" style={{ width: `${(userScore.xp % 1000) / 10}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8b4513] font-medium">
                    <span>Progresso atual</span>
                    <span>{userScore.xp} XP</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="wood-inner p-3 text-center">
                    <p className="text-2xl font-bold text-[#5d2e0a]">{missions.filter(m => m.completed).length}</p>
                    <p className="text-[10px] text-[#8b4513] uppercase tracking-wider">Missões Feitas</p>
                  </div>
                  <div className="wood-inner p-3 text-center">
                    <p className="text-2xl font-bold text-[#5d2e0a]">1</p>
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
                  <h2 className="text-4xl font-black text-[#5d2e0a] mt-1">{userScore.xp * 2} <span className="text-lg font-bold">PtC</span></h2>
                </div>
                {/* Chest icon placeholder if needed */}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 wood-panel bg-[#d2b48c] py-2 rounded-xl text-[#5d2e0a] font-bold shadow-sm hover:opacity-80 flex items-center justify-center gap-2">
                  Resgatar
                </button>
              </div>
              <div className="absolute -bottom-1 -left-1 -right-1 h-3 grass-bg opacity-30"></div>
            </div>
          </div>

          {/* Middle & Right Column Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Missions */}
            <section>
              <h2 className="text-xl font-bold text-[#5d2e0a] flex items-center gap-2 mb-4">
                <Calendar className="text-[#55a630]" /> Missões Disponíveis
              </h2>
              <div className="space-y-4">
                {missions.length === 0 && <p className="text-[#8b4513] italic">Nenhuma missão disponível no momento.</p>}
                {missions.map((mission) => (
                  <div key={mission.id} className={`wood-panel p-4 rounded-2xl flex items-center justify-between group hover:translate-x-1 transition-transform border-2 ${mission.completed ? 'border-[#55a630]/50 opacity-80' : 'border-[#c9a688]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 wood-inner flex items-center justify-center ${mission.completed ? 'text-[#55a630]' : 'text-[#8b4513]'}`}>
                        {mission.type === 'daily' ? <Calendar size={24} /> : <Trophy size={24} />}
                      </div>
                      <div>
                        <h4 className={`font-bold ${mission.completed ? 'text-[#55a630] line-through' : 'text-[#5d2e0a]'}`}>{mission.title}</h4>
                        <p className="text-xs text-[#8b4513]">{mission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!mission.completed ? (
                        <>
                          <span className="text-xs font-bold text-[#5d2e0a] bg-[#f1dfcf] px-2 py-1 rounded-lg border border-[#c9a688] flex items-center gap-1">
                            <Trophy size={12} className="text-[#cd7f32]" /> +{mission.xp_reward} XP
                          </span>
                          <button
                            onClick={() => handleCompleteMission(mission)}
                            className="wood-panel bg-[#d2b48c] px-4 py-2 rounded-xl text-xs font-bold text-[#5d2e0a] hover:opacity-80 shadow-sm border border-[#bfa58a]"
                          >
                            Realizar
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-[#55a630] flex items-center gap-1">
                          <Trophy size={14} /> Concluído
                        </span>
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
                </div>
                <div className="flex gap-4">
                  <div className="grass-bg p-1.5 rounded-2xl shadow-md">
                    <div className="wood-panel p-4 w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1">
                      <PawPrint className="text-[#8b4513]" size={28} />
                      <p className="text-[8px] text-center font-bold text-[#5d2e0a] uppercase leading-tight">Amigo dos Pets</p>
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
                <div className="grass-bg p-3 space-y-2 rounded-2xl shadow-inner">
                  {topGuardians.map((g, index) => (
                    <div key={g.id} className="wood-panel px-4 py-2 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black w-4 ${index === 0 ? 'text-[#eab308] text-lg' : 'text-[#8b4513]'}`}>{index + 1}º</span>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${g.name}`} className="w-8 h-8 rounded-full border border-[#55a630] bg-white" alt={g.name} />
                        <span className="text-sm font-bold text-[#5d2e0a] truncate max-w-[100px]">{g.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#8b4513]">{g.xp} XP</span>
                    </div>
                  ))}
                  {topGuardians.length === 0 && <p className="text-center text-white text-xs py-2">Sem ranking ainda.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamification;
