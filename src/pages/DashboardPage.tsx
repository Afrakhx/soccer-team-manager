import { Link } from 'react-router-dom';
import { Users, Calendar, Trophy, BrainCircuit, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/components/schedule/EventCard';
import { Avatar } from '@/components/ui/Avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOverallScore, getLatestRating } from '@/utils/skillAggregation';
import { formatDate } from '@/utils/dateUtils';

const CORNER_BADGES = {
  technical:     { label: 'T',  bg: 'bg-blue-100',   text: 'text-blue-700'   },
  tactical:      { label: 'Ta', bg: 'bg-purple-100',  text: 'text-purple-700' },
  physical:      { label: 'Ph', bg: 'bg-orange-100',  text: 'text-orange-700' },
  psychological: { label: 'M',  bg: 'bg-green-100',   text: 'text-green-700'  },
} as const;

export function DashboardPage() {
  const { players, events, ratings, records, settings, getUpcoming, getPast, aiAssessments } = useApp();

  const activePlayers = players.filter(p => p.isActive);
  const upcoming = getUpcoming().slice(0, 3);
  const recentGames = getPast().filter(e => e.type === 'Game').slice(0, 3);
  const wins = recentGames.filter(e => e.result === 'Win').length;

  // Team attendance chart for last 5 completed events
  const completedEvents = events
    .filter(e => e.isCompleted)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .reverse();

  const attendanceChartData = completedEvents.map(event => {
    const eventRecords = records.filter(r => r.eventId === event.id);
    const present = eventRecords.filter(r => r.status === 'Present').length;
    const absent = eventRecords.filter(r => r.status === 'Absent').length;
    return {
      name: event.title.length > 14 ? event.title.slice(0, 14) + '…' : event.title,
      Present: present,
      Absent: absent,
    };
  });

  // Top performers by skill score
  const topPlayers = [...activePlayers]
    .map(p => ({
      player: p,
      score: (() => {
        const playerRatings = ratings.filter(r => r.playerId === p.id);
        const latest = getLatestRating(playerRatings);
        return latest ? getOverallScore(latest) : 0;
      })(),
    }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Recent AI assessments — last 4, newest first, enriched with player name
  const recentAIReports = [...aiAssessments]
    .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))
    .slice(0, 4)
    .map(r => ({
      report: r,
      player: players.find(p => p.id === r.playerId),
    }))
    .filter(r => r.player !== undefined);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {settings.teamName} · {settings.season}
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Players',        value: activePlayers.length,  icon: Users,         color: 'text-pitch-600 bg-pitch-50'  },
          { label: 'Upcoming Events',value: upcoming.length,        icon: Calendar,      color: 'text-blue-600 bg-blue-50'    },
          { label: 'Wins (recent)',  value: wins,                   icon: Trophy,        color: 'text-yellow-600 bg-yellow-50'},
          { label: 'AI Reports',     value: aiAssessments.length,   icon: BrainCircuit,  color: 'text-emerald-600 bg-emerald-50'},
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Upcoming events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/schedule" className="text-sm text-pitch-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(event => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          )}
        </Card>

        {/* Team attendance chart */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Team Attendance</h2>
          {attendanceChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No attendance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Present" fill="#16a34a" radius={[3,3,0,0]} />
                <Bar dataKey="Absent" fill="#fca5a5" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent AI Reports */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-pitch-600" />
              <h2 className="font-semibold text-gray-900">Recent AI Reports</h2>
            </div>
            <Link to="/coaches-corner" className="text-sm text-pitch-600 hover:underline flex items-center gap-1">
              New Report <ArrowRight size={14} />
            </Link>
          </div>
          {recentAIReports.length === 0 ? (
            <div className="text-center py-6">
              <BrainCircuit size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No AI reports yet.</p>
              <Link to="/coaches-corner">
                <p className="text-xs text-pitch-600 mt-1 hover:underline">Run your first assessment →</p>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAIReports.map(({ report, player }) => (
                <Link
                  key={report.id}
                  to={`/players/${report.playerId}`}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <Avatar firstName={player!.firstName} lastName={player!.lastName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {player!.firstName} {player!.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(report.assessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {report.isDemo && ' · demo'}
                    </p>
                  </div>
                  {/* Corner score mini-badges */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(Object.keys(CORNER_BADGES) as Array<keyof typeof CORNER_BADGES>).map(k => (
                      <span key={k} className={`text-xs font-bold px-1.5 py-0.5 rounded ${CORNER_BADGES[k].bg} ${CORNER_BADGES[k].text}`}>
                        {CORNER_BADGES[k].label}{report[k].score}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Top performers */}
        {topPlayers.length > 0 ? (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Top Performers</h2>
              <Link to="/roster" className="text-sm text-pitch-600 hover:underline flex items-center gap-1">
                Roster <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {topPlayers.map(({ player, score }, i) => (
                <Link key={player.id} to={`/players/${player.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                  <span className="w-5 text-center text-sm font-bold text-gray-400">{i + 1}</span>
                  <Avatar firstName={player.firstName} lastName={player.lastName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{player.firstName} {player.lastName}</p>
                    <p className="text-xs text-gray-500">#{player.jerseyNumber} · {player.position}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Trophy size={13} fill="currentColor" />
                    <span className="text-sm font-bold text-gray-700">{score}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          /* Recent results (fallback when no top performers yet) */
          recentGames.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Results</h2>
                <Link to="/schedule" className="text-sm text-pitch-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {recentGames.map(game => (
                  <div key={game.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className={`w-2 h-8 rounded-full ${
                      game.result === 'Win' ? 'bg-pitch-500' :
                      game.result === 'Loss' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{game.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(game.date)}</p>
                    </div>
                    {game.goalsFor !== undefined && (
                      <span className="text-sm font-bold text-gray-700">
                        {game.goalsFor}–{game.goalsAgainst}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )
        )}
      </div>

      {/* Recent results (shown alongside top performers when both exist) */}
      {topPlayers.length > 0 && recentGames.length > 0 && (
        <Card className="mt-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Results</h2>
            <Link to="/schedule" className="text-sm text-pitch-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recentGames.map(game => (
              <div key={game.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                  game.result === 'Win' ? 'bg-pitch-500' :
                  game.result === 'Loss' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{game.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(game.date)}</p>
                </div>
                {game.goalsFor !== undefined && (
                  <span className="text-sm font-bold text-gray-700 flex-shrink-0">
                    {game.goalsFor}–{game.goalsAgainst}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
