function App() {
  return (
    <div className="font-inter min-h-screen bg-primary text-white p-6">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold text-accent mb-2">Fantasy Football League Stats</h1>
        <p className="text-gray-400">Explore 14 seasons of rivalries, upsets, and legends</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          { title: 'Manager Profiles', desc: 'Stats, rivalries, and win/loss records.' },
          { title: 'Matchups', desc: 'Relive epic showdowns.' },
          { title: 'League Drafts', desc: 'See who drafted goats or busts.' },
          { title: 'Transactions', desc: 'Adds, drops, and trades.' },
          { title: 'Standings', desc: 'Year-by-year rankings.' },
          { title: 'Fun Records', desc: 'Streaks, high scores, and chaos.' },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-secondary rounded-xl p-6 shadow hover:shadow-xl transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold text-accent mb-2">{item.title}</h2>
            <p className="text-gray-300">{item.desc}</p>
          </div>
        ))}
      </div>

      <footer className="text-center text-gray-500 text-sm mt-16">
        Built with ❤️ using React + Tailwind — Inspired by ffawards.app
      </footer>
    </div>
  );
}
export default App;