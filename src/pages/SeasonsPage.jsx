import React, { useState } from "react";
import headToHeadStats from "../data/headToHeadStats.json";
import allSeasonsProfiles from "../data/allSeasonsProfiles.json";
import { Dialog } from "@headlessui/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SeasonsPage() {
  const availableSeasons = Object.keys(allSeasonsProfiles).sort();
  const [selectedSeason, setSelectedSeason] = useState(availableSeasons.at(-1));
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailedManager, setDetailedManager] = useState(null);

  const teams = allSeasonsProfiles[selectedSeason] || [];
  const matches = Object.values(headToHeadStats)
    .flatMap(entry => entry.match_history || [])
    .filter(m => m.year.toString() === selectedSeason);

  const teamStats = {};
  const matchHistoryPerManager = {};

  matches.forEach(m => {
    [
      { name: m.manager_a, score: m.score_a, opp: m.manager_b, oppScore: m.score_b },
      { name: m.manager_b, score: m.score_b, opp: m.manager_a, oppScore: m.score_a }
    ].forEach(({ name, score, opp, oppScore }) => {
      if (!teamStats[name]) {
        teamStats[name] = {
          name,
          wins: 0,
          losses: 0,
          pf: 0,
          pa: 0,
          games: 0,
          luck: 0,
        };
      }
      if (!matchHistoryPerManager[name]) matchHistoryPerManager[name] = [];
      teamStats[name].pf += score ?? 0;
      teamStats[name].pa += oppScore ?? 0;
      teamStats[name].games++;
      if ((score ?? 0) > (oppScore ?? 0)) {
        teamStats[name].wins++;
        if ((score - oppScore) < 10) teamStats[name].luck++;
      } else {
        teamStats[name].losses++;
        if ((oppScore - score) < 10) teamStats[name].luck--;
      }
      matchHistoryPerManager[name].push({ opponent: opp, score, oppScore });
    });
  });

  const mergedStats = Object.entries(teamStats).map(([name, stats]) => {
    const standing = teams.find(t => t.manager === name);
    return {
      ...stats,
      avgScore: stats.pf / stats.games,
      avgAgainst: stats.pa / stats.games,
      pointDiff: stats.pf - stats.pa,
      finish: standing?.final_standing ?? null
    };
  });

  const top3 = [...mergedStats].sort((a, b) => a.finish - b.finish).slice(0, 3);
  const bestTeam = [...mergedStats].sort((a, b) => b.wins - a.wins)[0];
  const pointsLeader = [...mergedStats].sort((a, b) => b.pf - a.pf)[0];
  const lowestScorer = [...mergedStats].sort((a, b) => a.pf - b.pf)[0];
  const worstTeam = [...mergedStats].sort((a, b) => a.wins - b.wins)[0];
  const luckiest = [...mergedStats].sort((a, b) => b.luck - a.luck)[0];
  const unluckiest = [...mergedStats].sort((a, b) => a.luck - b.luck)[0];

  const seasonRecords = {
    highestScore: matches.reduce((max, m) => Math.max(max, m.score_a, m.score_b), 0),
    lowestScore: matches.reduce((min, m) => Math.min(min, m.score_a, m.score_b), Infinity),
    biggestBlowout: matches.reduce((max, m) => Math.max(max, Math.abs(m.score_a - m.score_b)), 0),
    slimmestWin: matches.reduce((min, m) => Math.min(min, Math.abs(m.score_a - m.score_b)), Infinity)
  };

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-accent mb-4">🏆 {selectedSeason} Season Overview</h1>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="mb-6 p-2 rounded bg-secondary text-white"
        >
          {availableSeasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Manager</th>
                  <th className="text-center p-2">W</th>
                  <th className="text-center p-2">L</th>
                  <th className="text-center p-2">PF</th>
                  <th className="text-center p-2">PA</th>
                  <th className="text-center p-2">Avg PF</th>
                  <th className="text-center p-2">PD</th>
                  <th className="text-center p-2">Finish</th>
                </tr>
              </thead>
              <tbody>
                {mergedStats.sort((a, b) => a.finish - b.finish).map((t) => (
                  <tr key={t.name} className="even:bg-background">
                    <td className="p-2 text-left font-semibold cursor-pointer hover:underline" onClick={() => setDetailedManager(t.name)}>{t.name}</td>
                    <td className="p-2 text-center">{t.wins}</td>
                    <td className="p-2 text-center">{t.losses}</td>
                    <td className="p-2 text-center">{(t.pf ?? 0).toFixed(1)}</td>
                    <td className="p-2 text-center">{(t.pa ?? 0).toFixed(1)}</td>
                    <td className="p-2 text-center">{(t.avgScore ?? 0).toFixed(1)}</td>
                    <td className="p-2 text-center">{(t.pointDiff ?? 0).toFixed(1)}</td>
                    <td className="p-2 text-center">{t.finish ? `${t.finish}${t.finish === 1 ? ' 🏆' : ''}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-accent mb-2">📈 Avg Points per Game</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mergedStats.sort((a, b) => a.finish - b.finish)}>
                  <XAxis dataKey="name" stroke="#ccc" fontSize={10} />
                  <YAxis stroke="#ccc" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary rounded-xl p-4">
              <h2 className="text-lg font-bold text-accent mb-3">🏆 Champions</h2>
              {top3.map((t, i) => (
                <p key={i} className="text-sm mb-2">
                  {i + 1}. {t.name} ({t.finish === 1 ? 'Champion 🏆' : `#${t.finish}`})
                </p>
              ))}
            </div>

            <div className="bg-secondary rounded-xl p-4">
              <h2 className="text-lg font-bold text-accent mb-3">📊 Fun Highlights</h2>
              <p className="text-sm">In-Season Champ: <span className="text-white font-medium">{bestTeam.name}</span></p>
              <p className="text-sm">Points Leader: <span className="text-white font-medium">{pointsLeader.name}</span></p>
              <p className="text-sm">Lowest Scorer: <span className="text-white font-medium">{lowestScorer.name}</span></p>
              <p className="text-sm">Worst Record: <span className="text-white font-medium">{worstTeam.name}</span></p>
              <p className="text-sm">Luckiest: <span className="text-white font-medium">{luckiest.name}</span></p>
              <p className="text-sm">Unluckiest: <span className="text-white font-medium">{unluckiest.name}</span></p>
            </div>

            <div className="bg-secondary rounded-xl p-4">
              <h2 className="text-lg font-bold text-accent mb-3">📚 Season Records</h2>
              <p className="text-sm">Highest Score: {seasonRecords.highestScore}</p>
              <p className="text-sm">Lowest Score: {seasonRecords.lowestScore}</p>
              <p className="text-sm">Biggest Blowout: {seasonRecords.biggestBlowout}</p>
              <p className="text-sm">Slimmest Win: {seasonRecords.slimmestWin}</p>
            </div>
          </div>
        </div>

        {detailedManager && (
          <Dialog open={!!detailedManager} onClose={() => setDetailedManager(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-primary max-w-lg w-full rounded-xl p-6 text-white">
                <Dialog.Title className="text-xl font-bold mb-4">{detailedManager} – Match History</Dialog.Title>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2">Opponent</th>
                        <th className="p-2">PF</th>
                        <th className="p-2">PA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchHistoryPerManager[detailedManager]?.map((m, i) => (
                        <tr key={i} className="even:bg-background">
                          <td className="p-2">{m.opponent}</td>
                          <td className="p-2">{m.score}</td>
                          <td className="p-2">{m.oppScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <button onClick={() => setDetailedManager(null)} className="text-accent underline">Close</button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
}