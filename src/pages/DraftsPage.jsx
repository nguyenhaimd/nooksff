import React, { useState, useEffect } from "react";
import draftData from "@/data/draft_stats_combined.json";

const TABS = [
  { key: "rankings", label: "📊 Rankings" },
  { key: "steals", label: "💎 Top Picks" },
  { key: "busts", label: "💀 Busts" },
  { key: "awards", label: "🏆 Awards" },
  { key: "players", label: "📋 Players" }
];

function Avatar({ name }) {
  return (
    <div className="bg-accent text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

function formatFinish(value) {
  if (value === undefined || value === null) return "—";
  const icon =
    value === 1 ? "🥇" :
    value === 2 ? "🥈" :
    value === 3 ? "🥉" :
    value <= 5 ? "🎯" :
    value >= 12 ? "😵" : "";
  return `${value} ${icon}`;
}

export default function DraftsPage() {
  const [activeTab, setActiveTab] = useState("rankings");
  const [spotlight, setSpotlight] = useState(() => localStorage.getItem("draftSpotlight") || "");
  const [expandedManager, setExpandedManager] = useState(null);
  const [draftHistory, setDraftHistory] = useState([]);

  const [allTimeDraftRankings, setAllTimeDraftRankings] = useState([]);
  const [topDraftSteals, setTopDraftSteals] = useState([]);
  const [topDraftBusts, setTopDraftBusts] = useState([]);
  const [draftAwards, setDraftAwards] = useState([]);
  const [bestValuePicks, setBestValuePicks] = useState([]);
  const [biggestReaches, setBiggestReaches] = useState([]);
  const [mostDraftedPlayers, setMostDraftedPlayers] = useState([]);

  useEffect(() => {
    const sorted = [...(draftData.allTimeDraftRankings || [])].sort((a, b) => {
      if (b.Championships !== a.Championships) return b.Championships - a.Championships;
      return b.Years_Played - a.Years_Played;
    });
    setAllTimeDraftRankings(sorted);
    setTopDraftSteals(draftData.topDraftSteals || []);
    setTopDraftBusts(draftData.topDraftBusts || []);
    setDraftAwards(draftData.draftAwards || []);
    setBestValuePicks(draftData.bestValuePicks || []);
    setBiggestReaches(draftData.biggestReaches || []);
    setMostDraftedPlayers(draftData.mostDraftedPlayers || []);

    fetch("/data/draftPerformance.json")
      .then(res => res.json())
      .then(json => setDraftHistory(json?.entries ?? []))
      .catch(err => {
        console.error("Failed to load draftPerformance.json:", err);
        setDraftHistory([]);
      });
  }, []);

  const normalize = (name) => name?.toLowerCase().replace(/[^a-z0-9]/gi, "");
  const filtered = (list) => spotlight ? list.filter(r => normalize(r.manager) === normalize(spotlight)) : list;
  const allManagerNames = [...new Set(allTimeDraftRankings.map(r => r.manager))].sort();

  const renderHistory = (manager) => {
    const rows = draftHistory.filter(e => normalize(e.manager) === normalize(manager));
    if (!rows.length) return null;
    return (
      <table className="w-full text-sm text-white mt-2">
        <thead className="text-gray-400 border-b border-gray-600">
          <tr>
            <th className="px-2 py-1">Year</th>
            <th className="px-2 py-1">Team</th>
            <th className="px-2 py-1">Finish</th>
            <th className="px-2 py-1">Record</th>
            <th className="px-2 py-1">Players</th>
          </tr>
        </thead>
        <tbody>
          {rows.sort((a, b) => a.year - b.year).map((entry, i) => (
            <tr key={i}>
              <td className="px-2 py-1">{entry.year}</td>
              <td className="px-2 py-1">{entry.team || "—"}</td>
              <td className="px-2 py-1">{formatFinish(entry.finish)}</td>
              <td className="px-2 py-1">{entry.record || "—"}</td>
              <td className="px-2 py-1">
                {Array.isArray(entry.players) ? entry.players.map(p => p?.name ?? p).join(", ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const Table = ({ columns, rows, expandable = false }) => (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
      <table className="w-full text-sm text-left text-white">
        <thead className="bg-secondary text-gray-300 border-b border-gray-600">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isExpanded = expandedManager === row.manager;
            return (
              <React.Fragment key={i}>
                <tr
                  className={`border-b border-gray-700 hover:bg-gray-800 ${expandable ? 'cursor-pointer' : ''}`}
                  onClick={() => expandable && setExpandedManager(isExpanded ? null : row.manager)}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-2">
                      {col === "Manager" ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={row.manager} /> {row.manager}
                        </div>
                      ) : col === "Finish" || col === "Final Standing" ? formatFinish(row.finish ?? row.Final_Standing) : row[col.replace(/ /g, "_")] ?? "—"}
                    </td>
                  ))}
                </tr>
                {expandable && isExpanded && (
                  <tr className="bg-gray-900 border-b border-gray-700">
                    <td colSpan={columns.length} className="px-6 py-2">
                      {renderHistory(row.manager)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="font-inter bg-primary text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-accent text-center mb-6">📋 Drafts</h1>

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
              localStorage.setItem("draftSpotlight", value);
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
              setSpotlight("");
              localStorage.removeItem("draftSpotlight");
            }} className="text-sm text-accent underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {activeTab === "rankings" && (
        <Table
          columns={["Manager", "Years Played", "Total Picks", "Avg Final Standing", "Championships"]}
          rows={filtered(allTimeDraftRankings)}
          expandable={true}
        />
      )}

      {activeTab === "steals" && (
        <Table
          columns={["Year", "Manager", "Player Name", "Round", "Overall", "Final Standing"]}
          rows={filtered(topDraftSteals)}
        />
      )}

      {activeTab === "busts" && (
        <Table
          columns={["Year", "Manager", "Player Name", "Round", "Overall", "Final Standing"]}
          rows={filtered(topDraftBusts)}
        />
      )}

      {activeTab === "awards" && (
        <>
          <h2 className="text-xl font-bold text-accent mb-3">🏆 Draft Awards</h2>
          <Table
            columns={["Year", "Manager", "Final Standing", "Avg Draft Round", "Award"]}
            rows={filtered(draftAwards)}
          />

          <h2 className="text-xl font-bold text-accent mt-6 mb-3">💰 Best Value Picks</h2>
          <Table
            columns={["Year", "Manager", "Player Name", "Round", "Overall", "Final Standing"]}
            rows={filtered(bestValuePicks)}
          />

          <h2 className="text-xl font-bold text-accent mt-6 mb-3">🚨 Biggest Reaches</h2>
          <Table
            columns={["Year", "Manager", "Player Name", "Round", "Overall", "Final Standing"]}
            rows={filtered(biggestReaches)}
          />
        </>
      )}

      {activeTab === "players" && (
        <Table
          columns={["Player Name", "Times Drafted"]}
          rows={filtered(mostDraftedPlayers)}
        />
      )}
    </div>
  );
}
