import React, { useState } from 'react';
import recordsData from '../data/records.json';

const TABS = [
  { key: 'all', label: '🏆 All-Time' },
  { key: 'weekly', label: '🔥 Weekly' },
  { key: 'activity', label: '🔁 Activity' },
  { key: 'playoffs', label: '🎯 Playoffs' }
];

function Avatar({ name }) {
  return (
    <div className="bg-accent text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

function WinPctCell({ value }) {
  const percent = parseFloat(value);
  let color = 'text-white';
  if (percent >= 70) color = 'text-green-400';
  else if (percent >= 50) color = 'text-yellow-300';
  else color = 'text-red-400';
  return <span className={`${color} font-semibold`}>{percent.toFixed(1)}%</span>;
}

function ExpandableRow({ manager, summary, yearlyStats, isGoat, showCrown }) {
  const [expanded, setExpanded] = useState(false);
  const sackoIcon = summary.sackos >= 2 ? '🚨' : '';
  const rowStyle = isGoat ? 'bg-yellow-900 bg-opacity-30' : '';
  const champIcon = showCrown ? '👑' : summary.firsts > 0 ? '🥈' : '';

  return (
    <>
      <tr className={`border-b border-gray-700 hover:bg-gray-800 ${rowStyle}`}>
        <td className="px-4 py-2 flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <Avatar name={manager} />
          <span className="font-semibold text-accent">{manager}</span>
        </td>
        <td className="px-4 py-2 font-bold text-green-300">{summary.pointsFor}</td>
        <td className="px-4 py-2">{summary.pointsAgainst || 0}</td>
        <td className="px-4 py-2">{summary.wins}</td>
        <td className="px-4 py-2">{summary.losses}</td>
        <td className="px-4 py-2"><WinPctCell value={summary.winPct * 100} /></td>
        <td className="px-4 py-2">{summary.firsts} {champIcon}</td>
        <td className="px-4 py-2">{summary.sackos} {sackoIcon}</td>
        <td className="px-4 py-2">{summary.years}</td>
      </tr>
      {expanded && yearlyStats.length > 0 && (
        <tr className="bg-gray-900 border-b border-gray-700">
          <td colSpan={9} className="px-6 py-2">
            <table className="w-full text-sm text-white">
              <thead className="text-gray-400 border-b border-gray-600">
                <tr>
                  <th className="px-2 py-1">Year</th>
                  <th className="px-2 py-1">Points</th>
                  <th className="px-2 py-1">Wins</th>
                  <th className="px-2 py-1">Losses</th>
                  <th className="px-2 py-1">Trades</th>
                  <th className="px-2 py-1">Moves</th>
                  <th className="px-2 py-1">Standing</th>
                </tr>
              </thead>
              <tbody>
                {yearlyStats
                  .sort((a, b) => parseInt(a.year) - parseInt(b.year))
                  .map((y, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1">{y.year}</td>
                      <td className="px-2 py-1">{y.points}</td>
                      <td className="px-2 py-1">{y.wins}</td>
                      <td className="px-2 py-1">{y.losses}</td>
                      <td className="px-2 py-1">{y.trades || 0}</td>
                      <td className="px-2 py-1">{y.moves || 0}</td>
                      <td className="px-2 py-1">{y.standing || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [modalType, setModalType] = useState(null);
  const [modalManager, setModalManager] = useState(null);
  const [spotlight, setSpotlight] = useState(() => localStorage.getItem('spotlight') || '');

  const normalize = (name) => name?.toLowerCase().replace(/[^a-z0-9]/gi, '');
  const allManagerNames = [...new Set((recordsData.allTimeTotals || []).map(r => r.manager))].sort();
  const topChampion = recordsData.topChampion;

  const openModal = (type, manager) => {
    setModalType(type);
    setModalManager(manager);
  };

  const closeModal = () => {
    setModalType(null);
    setModalManager(null);
  };

  const section = (title, headers, rows, renderRow, emptyMessage) => (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-accent mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
        <table className="w-full text-sm text-left text-white">
          <thead className="bg-secondary text-gray-300 border-b border-gray-600">
            <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length > 0
              ? rows.map(renderRow)
              : <tr><td colSpan={headers.length} className="text-center py-4 text-gray-400">{emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const allRows = [...(recordsData.allTimeTotals || [])].map(row => ({
    ...row,
    years: row.years || recordsData.seasonRecords.filter(r => normalize(r.manager) === normalize(row.manager)).length
  }));

  const goat = allRows.reduce((top, curr) => {
    const score = curr.firsts * 100 + (curr.winPct || 0);
    const topScore = top.firsts * 100 + (top.winPct || 0);
    return score > topScore ? curr : top;
  }, allRows[0]);

  const aggregateByManager = (list) => {
    const map = {};
    for (const entry of list) {
      if (!map[entry.manager]) map[entry.manager] = { count: 0, breakdown: [] };
      map[entry.manager].count += entry.count;
      map[entry.manager].breakdown.push(entry);
    }
    return Object.entries(map)
      .map(([manager, { count, breakdown }]) => ({ manager, count, breakdown }))
      .sort((a, b) => b.count - a.count);
  };

  const tradesAgg = aggregateByManager(recordsData.trades || []);
  const movesAgg = aggregateByManager(recordsData.addsDrops || []);
  const filtered = (list) => spotlight ? list.filter(r => normalize(r.manager) === normalize(spotlight)) : list;

  return (
    <div className="font-inter bg-primary text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-accent text-center mb-6">📊 League Records</h1>

      <div className="flex flex-wrap justify-between items-center mb-8">
        <div className="flex gap-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded ${activeTab === tab.key
                ? 'bg-accent text-black font-bold'
                : 'bg-secondary text-white hover:bg-gray-700'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={spotlight}
            onChange={(e) => {
              const value = e.target.value;
              setSpotlight(value);
              localStorage.setItem('spotlight', value);
            }}
            className="bg-secondary text-white px-3 py-2 rounded"
          >
            <option value="">🔍 Spotlight: All Managers</option>
            {allManagerNames.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
          {spotlight && (
            <button onClick={() => {
              setSpotlight('');
              localStorage.removeItem('spotlight');
            }} className="text-sm text-accent underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {activeTab === 'all' && section(
        'All-Time Totals',
        ['Manager', 'Points For', 'Points Against', 'Wins', 'Losses', 'Win %', '🥇 Championships', '🧻 Sackos', 'Years'],
        filtered(allRows).sort((a, b) => b.pointsFor - a.pointsFor),
        (row, i) => (
          <ExpandableRow
            key={i}
            manager={row.manager}
            summary={row}
            yearlyStats={recordsData.seasonRecords.filter(r => normalize(r.manager) === normalize(row.manager))}
            isGoat={row.manager === goat.manager}
            showCrown={row.manager === topChampion}
          />
        ),
        'No all-time totals available'
      )}

      {activeTab === 'weekly' && section(
        'Highest Weekly Scores',
        ['Manager', 'Score', 'Year', 'Week'],
        filtered(recordsData.highestWeeklyScores || []),
        (row, i) => (
          <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
            <td className="px-4 py-2">{row.manager}</td>
            <td className="px-4 py-2">{row.score}</td>
            <td className="px-4 py-2">{row.year}</td>
            <td className="px-4 py-2">{row.week}</td>
          </tr>
        ),
        'No weekly scores found'
      )}

      {activeTab === 'activity' && (
        <>
          {section(
            'Most Trades All-Time',
            ['Manager', 'Total Trades'],
            filtered(tradesAgg),
            (row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => openModal('trades', row)}>
                <td className="px-4 py-2 text-accent underline">{row.manager}</td>
                <td className="px-4 py-2">{row.count}</td>
              </tr>
            ),
            'No trade data found'
          )}
          {section(
            'Most Adds/Drops All-Time',
            ['Manager', 'Total Moves'],
            filtered(movesAgg),
            (row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => openModal('moves', row)}>
                <td className="px-4 py-2 text-accent underline">{row.manager}</td>
                <td className="px-4 py-2">{row.count}</td>
              </tr>
            ),
            'No adds/drops data found'
          )}
        </>
      )}

      {activeTab === 'playoffs' && (
        <>
          {section(
            'Longest Playoff Streaks',
            ['Manager', 'Years in a Row'],
            filtered(recordsData.playoffStreaks || []),
            (row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-2">{row.manager}</td>
                <td className="px-4 py-2">{row.streak}</td>
              </tr>
            ),
            'No playoff streak data'
          )}
          {section(
            'Most Missed Playoffs',
            ['Manager', 'Misses'],
            filtered(recordsData.missedPlayoffs || []),
            (row, i) => (
              <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-2">{row.manager}</td>
                <td className="px-4 py-2">{row.misses}</td>
              </tr>
            ),
            'No missed playoff data'
          )}
        </>
      )}

      {modalManager && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6">
          <div className="bg-secondary text-white rounded-lg shadow-lg w-full max-w-2xl relative p-6">
            <button onClick={closeModal} className="absolute top-2 right-4 text-white text-2xl">×</button>
            <h2 className="text-xl font-bold text-accent mb-4 text-center">
              {modalManager.manager} – {modalType === 'trades' ? 'Trade History' : 'Move History'}
            </h2>
            <table className="w-full text-sm text-white">
              <thead className="text-gray-400 border-b border-gray-600">
                <tr>
                  <th className="px-3 py-1">Year</th>
                  <th className="px-3 py-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {modalManager.breakdown.sort((a, b) => b.count - a.count).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="px-3 py-1">{item.year}</td>
                    <td className="px-3 py-1">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}