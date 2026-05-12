import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: SentinelLanding,
})

function SentinelLanding() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-mono selection:bg-red-500/30">
      {/* NAVBAR - TACTICAL STYLE */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-red-600 animate-pulse"></div>
          <span className="text-xl font-black tracking-widest text-white uppercase italic">
            SENTINEL
          </span>
        </div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <a href="#" className="hover:text-red-500 transition-colors">System_Status</a>
          <a href="#" className="hover:text-red-500 transition-colors">Database_Logs</a>
        </div>
      </nav>

      {/* MAIN CONTENT - COMMAND CENTER AESTHETIC */}
      <main className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-32 px-6 text-center">
        
        {/* HEADER SECTION */}
        <div className="mb-16 space-y-4">
          <div className="inline-block px-3 py-1 border border-red-900/30 bg-red-900/10 rounded text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase mb-4">
            AI-Powered CISO Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase">
            Defense <span className="text-red-600">Simulated</span>.
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed tracking-wide">
            Sentinel scanează amprenta ta digitală, simulează atacuri reale prin AI și îți oferă un plan de apărare personalizat.
          </p>
        </div>

        {/* SINGLE CENTERED INPUT - AS PER BRIEF */}
        <div className="relative w-full max-w-xl group">
          {/* ANIMATED RINGS (Subtle Pulse) */}
          <div className="absolute -inset-4 bg-red-600/5 rounded-full blur-2xl group-focus-within:bg-red-600/10 transition-all duration-700"></div>
          
          <form className="relative flex flex-col items-center gap-8">
            <div className="w-full relative">
              <input 
                type="text" 
                placeholder="ENTER_EMAIL_OR_USERNAME..." 
                className="w-full bg-black/40 border border-white/10 p-6 rounded-none text-center text-white font-bold tracking-[0.1em] focus:border-red-600 focus:ring-0 outline-none transition-all placeholder:text-slate-800"
              />
              {/* CORNER ACCENTS */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600"></div>
            </div>

            <button 
              type="submit" 
              className="px-12 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              Initiate_Scan
            </button>
          </form>
        </div>

        {/* SYSTEM DECODING TEXT */}
        <div className="mt-20 grid grid-cols-3 gap-8 w-full max-w-2xl opacity-20 text-[10px] font-bold text-slate-500 uppercase">
          <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
            <span>OSINT_AGGREGATOR</span>
            <span className="text-slate-700 italic">v1.4.2_ONLINE</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
            <span>AI_RED_TEAM</span>
            <span className="text-slate-700 italic">CLAUDE_SONNET_4_READY</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
            <span>VULNERABILITY_SCORE</span>
            <span className="text-slate-700 italic">WAITING_FOR_INPUT</span>
          </div>
        </div>
      </main>
    </div>
  )
}