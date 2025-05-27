import React, { useState } from "react";
import headToHeadStats from "../data/headToHeadStats.json";
import allSeasonsProfiles from "../data/allSeasonsProfiles.json";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const managers = Array.from(
  new Set(Object.keys(headToHeadStats).flatMap((key) => key.split(" vs ")))
).sort();

const getAvatar = (name) => (name ? name.slice(0, 2).toUpperCase() : "--");

function getFinalStanding(manager, year) {
  const yearData = allSeasonsProfiles[year];
  if (!yearData) return null;
  const team = yearData.find((t) => t.manager === manager);
  return team?.final_standing ?? null;
}

function getManagerStats(name) {
  const allGames = [];
  Object.entries(headToHeadStats).forEach(([pair, data]) => {
    if (data.match_history) {
      allGames.push(
        ...data.match_history.filter(
          (m) => m.manager_a === name || m.manager_b === name
        )
      );
    }
  });

  const yearSummary = {};
  let totalPoints = 0,
    totalAgainst = 0,
    wins = 0,
    losses = 0,
    highestScore = 0,
    bestWin = 0,
    currentStreak = 0,
    longestStreak = 0;

  allGames.sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.week - b.week
  );

  allGames.forEach((g) => {
    const isA = g.manager_a === name;
    const myScore = isA ? g.score_a : g.score_b;
    const oppScore = isA ? g.score_b : g.score_a;
    const isWin = g.winner === name;
    const year = g.year;

    if (!yearSummary[year]) {
      yearSummary[year] = {
        wins: 0,
        losses: 0,
        pf: 0,
        pa: 0,
        games: 0,
        finish: null,
        history: [],
      };
      yearSummary[year].finish = getFinalStanding(name, year);
    }

    yearSummary[year].wins += isWin ? 1 : 0;
    yearSummary[year].losses += isWin ? 0 : 1;
    yearSummary[year].pf += myScore;
    yearSummary[year].pa += oppScore;
    yearSummary[year].games++;
    yearSummary[year].history.push(g);

    totalPoints += myScore;
    totalAgainst += oppScore;
    wins += isWin ? 1 : 0;
    losses += isWin ? 0 : 1;
    highestScore = Math.max(highestScore, myScore);
    bestWin = isWin ? Math.max(bestWin, myScore - oppScore) : bestWin;

    currentStreak = isWin ? currentStreak + 1 : 0;
    longestStreak = Math.max(currentStreak, longestStreak);
  });

  const scoreTrendData = Object.entries(yearSummary).map(([year, data]) => ({
    year,
    avg: data.pf / data.games,
  }));

  const rivalries = Object.entries(headToHeadStats)
    .filter(([key]) => key.includes(name))
    .map(([pair, s]) => {
      const [a, b] = pair.split(" vs ");
      const rival = a === name ? b : a;
      const wins = a === name ? s.wins_a : s.wins_b;
      const losses = s.games - wins;
      return { rival, wins, losses, games: s.games, history: s.match_history };
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);

  return {
    games: allGames.length,
    wins,
    losses,
    winPct: wins + losses ? (wins / (wins + losses)).toFixed(3) : "0.000",
    avgScore: wins + losses ? (totalPoints / (wins + losses)).toFixed(1) : "0",
    avgAgainst: wins + losses ? (totalAgainst / (wins + losses)).toFixed(1) : "0",
    highestScore,
    bestWin,
    longestStreak,
    pointDiff: (totalPoints - totalAgainst).toFixed(1),
    yearSummary,
    scoreTrendData,
    rivalries,
  };
}

export default function ManagersPage() {
  const [selected, setSelected] = useState(managers[0]);
  const [modalRival, setModalRival] = useState(null);
  const [seasonModal, setSeasonModal] = useState(null);
  const stats = getManagerStats(selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 text-foreground font-inter">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-accent mb-4">Manager Profile</h1>
        <select
          className="mb-6 p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {managers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="bg-secondary text-white p-6 rounded-xl shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-accent text-black w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl">
              {getAvatar(selected)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selected}</h2>
              <p className="text-sm text-gray-400">
                {stats.games} games | {stats.wins}-{stats.losses} ({stats.winPct} win%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm mb-6">
            <div className="bg-card p-3 rounded shadow text-center">
              <p className="text-xs text-muted">Avg Score</p>
              <p className="text-lg font-bold">{stats.avgScore}</p>
            </div>
            <div className="bg-card p-3 rounded shadow text-center">
              <p className="text-xs text-muted">Point Diff</p>
              <p className="text-lg font-bold">{stats.pointDiff}</p>
            </div>
            <div className="bg-card p-3 rounded shadow text-center">
              <p className="text-xs text-muted">Best Win</p>
              <p className="text-lg font-bold">+{stats.bestWin}</p>
            </div>
            <div className="bg-card p-3 rounded shadow text-center">
              <p className="text-xs text-muted">High Score</p>
              <p className="text-lg font-bold">{stats.highestScore}</p>
            </div>
            <div className="bg-card p-3 rounded shadow text-center">
              <p className="text-xs text-muted">Longest Streak</p>
              <p className="text-lg font-bold">{stats.longestStreak} W</p>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-2">📈 Avg Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.scoreTrendData}>
              <XAxis dataKey="year" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#facc15" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <h3 className="text-lg font-bold mt-6 mb-2">📅 Season History</h3>
          <table className="w-full text-sm border mb-6">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Year</th>
                <th className="p-2 text-center">W</th>
                <th className="p-2 text-center">L</th>
                <th className="p-2 text-center">PF</th>
                <th className="p-2 text-center">PA</th>
                <th className="p-2 text-center">Games</th>
                <th className="p-2 text-center">Finish</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.yearSummary)
                .sort((a, b) => a[0] - b[0])
                .map(([year, data]) => (
                  <tr
                    key={year}
                    className="even:bg-background cursor-pointer hover:bg-gray-700"
                    onClick={() => setSeasonModal({ year, data })}
                  >
                    <td className="p-2">{year}</td>
                    <td className="p-2 text-center">{data.wins}</td>
                    <td className="p-2 text-center">{data.losses}</td>
                    <td className="p-2 text-center">{data.pf.toFixed(1)}</td>
                    <td className="p-2 text-center">{data.pa.toFixed(1)}</td>
                    <td className="p-2 text-center">{data.games}</td>
                    <td className="p-2 text-center">
                      {data.finish ? `${data.finish}${data.finish === 1 ? " 🏆" : ""}` : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <h3 className="text-lg font-bold mt-6 mb-2">🔥 Top Rivalries</h3>
          <div className="space-y-2">
            {stats.rivalries.map((rival, i) => (
              <div key={i} className="bg-background rounded shadow p-3">
                <div
                  className="cursor-pointer flex justify-between"
                  onClick={() => setModalRival(rival)}
                >
                  <p>
                    <strong>{rival.rival}</strong> — {rival.wins} W / {rival.losses} L ({rival.games} games)
                  </p>
                  <span className="text-muted">📊</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalRival && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-6">
          <div className="bg-secondary text-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
            <button
              onClick={() => setModalRival(null)}
              className="absolute top-2 right-4 text-white text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-accent mb-4 text-center">
              {selected} vs {modalRival.rival}
            </h2>
            <ResponsiveContainer width="100%" height={250} className="mb-4">
              <LineChart
                data={modalRival.history.map((m) => ({
                  game: `W${m.week} ${m.year}`,
                  [selected]: m.manager_a === selected ? m.score_a : m.score_b,
                  [modalRival.rival]: m.manager_b === modalRival.rival ? m.score_b : m.score_a,
                }))}
              >
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey={selected} stroke="#3b82f6" />
                <Line dataKey={modalRival.rival} stroke="#facc15" />
              </LineChart>
            </ResponsiveContainer>
            <div className="overflow-y-auto max-h-[50vh]">
              <table className="w-full text-sm text-white">
                <thead className="text-left text-gray-400 border-b border-gray-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Year</th>
                    <th className="px-2 py-1 text-left">Week</th>
                    <th className="px-2 py-1 text-left">{selected}</th>
                    <th className="px-2 py-1 text-left">{modalRival.rival}</th>
                    <th className="px-2 py-1 text-left">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRival.history.map((m, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="px-2 py-1 text-left">{m.year}</td>
                      <td className="px-2 py-1 text-left">{m.week}</td>
                      <td className="px-2 py-1 text-left">
                        {m.manager_a === selected ? m.score_a : m.score_b}
                      </td>
                      <td className="px-2 py-1 text-left">
                        {m.manager_b === modalRival.rival ? m.score_b : m.score_a}
                      </td>
                      <td className="px-2 py-1 text-left text-accent font-semibold">
                        {m.winner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {seasonModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-6">
          <div className="bg-secondary text-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
            <button
              onClick={() => setSeasonModal(null)}
              className="absolute top-2 right-4 text-white text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-accent mb-4 text-center">
              {selected} - {seasonModal.year} Match History
            </h2>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm text-white">
                <thead className="text-left text-gray-400 border-b border-gray-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Week</th>
                    <th className="px-2 py-1 text-left">Opponent</th>
                    <th className="px-2 py-1 text-left">Score</th>
                    <th className="px-2 py-1 text-left">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonModal.data.history.map((m, i) => {
                    const isA = m.manager_a === selected;
                    const opponent = isA ? m.manager_b : m.manager_a;
                    const myScore = isA ? m.score_a : m.score_b;
                    const oppScore = isA ? m.score_b : m.score_a;
                    const result = myScore > oppScore ? "W" : "L";
                    return (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="px-2 py-1 text-left">{m.week}</td>
                        <td className="px-2 py-1 text-left">{opponent}</td>
                        <td className="px-2 py-1 text-left">
                          {myScore} - {oppScore}
                        </td>
                        <td className="px-2 py-1 text-left text-accent font-semibold">
                          {result}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}