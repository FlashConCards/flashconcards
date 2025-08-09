'use client';

import { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  FireIcon, 
  ChartBarIcon, 
  StarIcon,
  ArrowUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { UserStats, Achievement, LeaderboardEntry } from '@/types';
import { getUserStats, getLeaderboard, calculateLevel, getXPForNextLevel } from '@/lib/gamification';

interface StatsOverviewProps {
  userId: string;
  onAchievementClick?: (achievement: Achievement) => void;
}

export default function StatsOverview({ userId, onAchievementClick }: StatsOverviewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Carregar stats do usuário
      const userStats = await getUserStats(userId);
      setStats(userStats);
      
      // Carregar leaderboard
      const leaderboardData = await getLeaderboard(10);
      setLeaderboard(leaderboardData);
      
      // Encontrar posição do usuário
      const userPosition = leaderboardData.findIndex(entry => entry.userId === userId);
      setUserRank(userPosition + 1);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const progressToNextLevel = ((stats.totalXP % getXPForNextLevel(stats.level)) / getXPForNextLevel(stats.level)) * 100;
  const accuracy = stats.studiedCards > 0 ? (stats.correctCards / stats.studiedCards) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Level e XP */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Nível {stats.level}</h3>
            <p className="text-purple-100">Total: {stats.totalXP.toLocaleString()} XP</p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <StarIcon className="w-8 h-8" />
          </div>
        </div>
        
        {/* Barra de progresso para próximo nível */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-purple-100">
            <span>Progresso para Nível {stats.level + 1}</span>
            <span>{progressToNextLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-purple-800 bg-opacity-30 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
        </div>
        <p className="text-xs text-purple-100">
          {getXPForNextLevel(stats.level) - (stats.totalXP % getXPForNextLevel(stats.level))} XP para o próximo nível
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cards Estudados</p>
              <p className="text-lg font-semibold text-gray-900">{stats.studiedCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Precisão</p>
              <p className="text-lg font-semibold text-gray-900">{accuracy.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FireIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sequência</p>
              <p className="text-lg font-semibold text-gray-900">{stats.studyStreak} dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ranking</p>
              <p className="text-lg font-semibold text-gray-900">#{userRank || '?'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conquistas recentes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
            Conquistas ({stats.achievements.length})
          </h3>
        </div>
        
        {stats.achievements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Estude mais para desbloquear suas primeiras conquistas!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.achievements.slice(-8).map((achievement) => (
              <div
                key={achievement.id}
                onClick={() => onAchievementClick?.(achievement)}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-gray-800">{achievement.title}</p>
                  <p className="text-xs text-gray-600">+{achievement.xpReward} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="w-5 h-5 text-blue-500 mr-2" />
          Top Estudantes
        </h3>
        
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <div 
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.userId === userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {entry.position}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.userId === userId ? 'Você' : entry.userName}
                  </p>
                  <p className="text-sm text-gray-600">Nível {entry.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{entry.totalXP.toLocaleString()} XP</p>
                <p className="text-sm text-gray-600">{entry.studyStreak} dias</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metas diárias */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas de Estudo</h3>
        
        <div className="space-y-4">
          {/* Meta diária */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Meta Diária</span>
              <span>{Math.min(stats.studiedCards, stats.dailyGoal)}/{stats.dailyGoal} cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.studiedCards / stats.dailyGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Meta semanal */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Meta Semanal</span>
              <span>{Math.min(stats.studiedCards, stats.weeklyGoal)}/{stats.weeklyGoal} cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.studiedCards / stats.weeklyGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Meta mensal */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Meta Mensal</span>
              <span>{Math.min(stats.studiedCards, stats.monthlyGoal)}/{stats.monthlyGoal} cards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.studiedCards / stats.monthlyGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
