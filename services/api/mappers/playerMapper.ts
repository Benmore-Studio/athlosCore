import { Player as APIPlayer, PlayerStats as APIStats } from '@/services/api/playerService';
import { Player as MockPlayer } from '@/data/mockData';

export function mapAPIPlayerToMock(apiPlayer: APIPlayer): MockPlayer {
  const stats = apiPlayer.stats;

  return {
    id: apiPlayer.player_id,
    name: apiPlayer.name || 'Unknown Player',
    jerseyNumber: apiPlayer.player_number || 0,
    position: 'PG', // API doesn't provide position, may need to add this field
    stats: {
      points: (stats?.two_point_made || 0) * 2 + (stats?.three_point_made || 0) * 3 + (stats?.free_throw_made || 0),
      rebounds: (stats?.offensive_rebounds || 0) + (stats?.defensive_rebounds || 0),
      assists: stats?.assists || 0,
      fieldGoalPercentage: calculateFGPercentage(stats),
      freeThrowPercentage: calculateFTPercentage(stats),
      turnovers: stats?.turnovers || 0,
      minutesPlayed: 0, // API doesn't provide this
    },
  };
}

function calculateFGPercentage(stats?: APIStats): number {
  if (!stats) return 0;
  const attempts = stats.two_point_att + stats.three_point_att;
  const made = stats.two_point_made + stats.three_point_made;
  return attempts > 0 ? (made / attempts) * 100 : 0;
}

function calculateFTPercentage(stats?: APIStats): number {
  if (!stats) return 0;
  return stats.free_throw_att > 0 ? (stats.free_throw_made / stats.free_throw_att) * 100 : 0;
}