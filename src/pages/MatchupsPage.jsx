// MatchupsPage.jsx (START OF FULL FILE)
// ✅ Avatars
// ✅ Icons in summary
// ✅ Styled leaderboard (top 10 by games played)
// ✅ ESC support and modals

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList,
  LineChart, Line
} from 'recharts';
import headToHeadStats from '../data/headToHeadStats.json';

const managers = Array.from(new Set(Object.keys(headToHeadStats).flatMap((key) => key.split(' vs ')))).sort();

const getAvatar = (name) => name ? name.slice(0, 2).toUpperCase() : "--";

export default function MatchupsPage() {
  const [managerA, setManagerA] = useState(managers[0]);
  const [managerB, setManagerB] = useState(managers[1]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const escHandler = (e) => { if (e.key === 'Escape') setModalData(null); };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, []);

  const getStats = (a, b) => headToHeadStats[`${a} vs ${b}`] || headToHeadStats[`${b} vs ${a}`];

  const stats = getStats(managerA, managerB);
  const filteredHistory = (stats?.match_history || []).filter(m => selectedYear === 'All' || m.year === selectedYear);
  const totalWinsA = filteredHistory.filter(m => m.winner === managerA).length;
  const totalWinsB = filteredHistory.filter(m => m.winner === managerB).length;

  const chartData = [
    { name: managerA, 'Avg Score': 0, Wins: totalWinsA },
    { name: managerB, 'Avg Score': 0, Wins: totalWinsB }
  ];
  filteredHistory.forEach(m => {
    chartData[0]['Avg Score'] += m.manager_a === managerA ? m.score_a : m.score_b;
    chartData[1]['Avg Score'] += m.manager_b === managerB ? m.score_b : m.score_a;
  });
  if (totalWinsA) chartData[0]['Avg Score'] /= totalWinsA;
  if (totalWinsB) chartData[1]['Avg Score'] /= totalWinsB;

  const trendData = filteredHistory.map(m => ({
    game: `W${m.week} ${m.year}`,
    [managerA]: m.manager_a === managerA ? m.score_a : m.score_b,
    [managerB]: m.manager_b === managerB ? m.score_b : m.score_a
  }));

  const recentWinners = filteredHistory.slice(-3).map(m => m.winner).reverse();
  const avgMargin = filteredHistory.length ? (filteredHistory.reduce((sum, m) => sum + Math.abs(m.score_a - m.score_b), 0) / filteredHistory.length).toFixed(1) : 'N/A';

  const rivalries = Object.entries(headToHeadStats).map(([pair, s]) => {
    const [a, b] = pair.split(' vs ');
    return {
      pair,
      total: s.games,
      winsA: s.wins_a,
      winsB: s.wins_b,
      winPctDiff: Math.abs((s.wins_a / s.games) - (s.wins_b / s.games)),
      record: `${a} ${s.wins_a} - ${s.wins_b} ${b}`,
      history: s.match_history,
      a, b
    };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="font-inter bg-primary text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-accent text-center mb-6">Matchups Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex gap-3 flex-wrap justify-center mb-6">
            <select className="bg-secondary px-4 py-2 rounded" value={managerA} onChange={e => setManagerA(e.target.value)}>
              {managers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-secondary px-4 py-2 rounded" value={managerB} onChange={e => setManagerB(e.target.value)}>
              {managers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-secondary px-4 py-2 rounded" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {['All', ...Array.from(new Set((stats?.match_history || []).map(m => m.year)))].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="bg-secondary rounded-xl p-4 shadow mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-accent text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">{getAvatar(managerA)}</div>
              <span className="font-semibold text-lg">{managerA}</span>
            </div>
            <div className="text-gray-400">vs</div>
            <div className="flex items-center gap-2">
              <div className="bg-accent text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">{getAvatar(managerB)}</div>
              <span className="font-semibold text-lg">{managerB}</span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm">📅 Games: <span className="font-semibold text-white">{filteredHistory.length}</span></p>
              <p className="text-sm">🏆 Record: <span className="font-semibold text-white">{managerA} {totalWinsA} - {totalWinsB} {managerB}</span></p>
              <p className="text-sm">🧠 Avg Margin: <span className="font-semibold text-white">{avgMargin}</span></p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350} className="mb-6">
            <BarChart data={chartData} margin={{ top: 30, right: 20, left: 10, bottom: 10 }}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Avg Score" fill="#3b82f6">
                <LabelList dataKey="Avg Score" position="top" fill="#fff" />
              </Bar>
              <Bar dataKey="Wins" fill="#facc15">
                <LabelList dataKey="Wins" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300} className="mb-8">
            <LineChart data={trendData}><XAxis dataKey="game" /><YAxis /><Tooltip /><Legend />
              <Line dataKey={managerA} stroke="#3b82f6" />
              <Line dataKey={managerB} stroke="#facc15" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-secondary rounded-xl p-4 shadow h-fit">
          <h2 className="text-lg font-bold text-accent mb-3 text-center">Top 10 Most Played Rivalries</h2>
          <table className="w-full text-sm text-white">
            <thead className="text-gray-300 border-b border-gray-600">
              <tr><th className="text-left px-2 py-1">Matchup</th><th className="px-2 py-1">Record</th><th className="px-2 py-1">Games</th></tr>
            </thead>
            <tbody>
              {rivalries.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800 border-b border-gray-700 cursor-pointer" onClick={() => setModalData(r)}>
                  <td className="px-2 py-1 text-accent font-medium">{r.pair}</td>
                  <td className="px-2 py-1">{r.record}</td>
                  <td className="px-2 py-1">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-6">
          <div className="bg-secondary text-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
            <button onClick={() => setModalData(null)} className="absolute top-2 right-4 text-white text-xl">×</button>
            <h2 className="text-2xl font-bold text-accent mb-4 text-center">{modalData.pair}</h2>
            <ResponsiveContainer width="100%" height={250} className="mb-4">
              <LineChart data={modalData.history.map(m => ({
                game: `W${m.week} ${m.year}`,
                [modalData.a]: m.manager_a === modalData.a ? m.score_a : m.score_b,
                [modalData.b]: m.manager_b === modalData.b ? m.score_b : m.score_a
              }))}><XAxis dataKey="game" /><YAxis /><Tooltip /><Legend />
                <Line dataKey={modalData.a} stroke="#3b82f6" />
                <Line dataKey={modalData.b} stroke="#facc15" />
              </LineChart>
            </ResponsiveContainer>
            <div className="overflow-y-auto max-h-[50vh]">
              <table className="w-full text-sm text-white">
                <thead className="text-gray-400 border-b border-gray-600">
                  <tr><th className="px-2 py-1">Year</th><th className="px-2 py-1">Week</th><th className="px-2 py-1">{modalData.a}</th><th className="px-2 py-1">{modalData.b}</th><th className="px-2 py-1">Winner</th></tr>
                </thead>
                <tbody>
                  {modalData.history.map((m, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="px-2 py-1">{m.year}</td>
                      <td className="px-2 py-1">{m.week}</td>
                      <td className="px-2 py-1">{m.score_a}</td>
                      <td className="px-2 py-1">{m.score_b}</td>
                      <td className="px-2 py-1 text-accent font-semibold">{m.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
