'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [specials, setSpecials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState('All')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchSpecials()
  }, [])

  async function fetchSpecials() {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
    
    if (error) console.log('Error:', error)
    else setSpecials(data)
    setLoading(false)
  }

  // --- FILTERING ---
  const filteredSpecials = specials.filter(s => {
    // 1. Check Day 
    // Show if:
    // a) "All" is selected
    // b) The special is specifically for this day (e.g. "Monday")
    // c) The special is for "Every Night" (or "Daily", "Every Day")
    const matchesDay = selectedDay === 'All' || 
                       s.day_of_week === selectedDay || 
                       s.day_of_week === 'Every Night' ||
                       s.day_of_week === 'Every Day' ||
                       s.day_of_week === 'Daily'
    
    // 2. Check Search
    const matchesSearch = searchTerm === '' || 
      s.bar_name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesDay && matchesSearch
  })

  if (loading) return <div className="p-10 text-xl text-center">Loading Pints... 🍺</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-orange-600 shadow-xl sticky top-0 z-20">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto p-4 space-y-4 relative z-10">
          
          {/* Title Area */}
          <div className="text-center pt-2">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 backdrop-blur-sm border border-white/30">
              Madison, WI
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center justify-center gap-2">
              Daily Specials <span className="hover:animate-spin cursor-pointer transition-transform inline-block">🍻</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto w-full">
            <input 
              type="text"
              placeholder="🔍 Find a bar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-0 bg-white/95 text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-400 shadow-inner placeholder-gray-500 transition-all font-medium"
            />
          </div>

          {/* Day Filters */}
          <div className="flex justify-center pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full px-2">
              <button
                onClick={() => setSelectedDay('All')}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedDay === 'All' 
                    ? 'bg-amber-400 text-red-950 scale-105' 
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/10'
                }`}
              >
                All
              </button>

              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedDay === day 
                      ? 'bg-amber-400 text-red-950 scale-105' 
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

     {/* CONTENT AREA */}
     <div className="max-w-7xl mx-auto w-full p-6 flex-1 relative z-10 -mt-4">
        
        {/* Search/Filter Status Badge */}
        <div className="flex justify-center mb-8">
          <div className="text-center text-stone-500 text-sm bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-stone-200">
            {searchTerm ? (
              <span>Searching for <span className="font-bold text-red-700">&quot;{searchTerm}&quot;</span></span>
            ) : (
              <span>Showing <span className="font-bold text-red-700">{selectedDay}</span> specials</span>
            )}
          </div>
        </div>

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecials.length > 0 ? (
            filteredSpecials.map((special) => (
              <div 
                key={special.id} 
                className="group bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Accent Line: Amber for Weekends, Deep Red for Weekdays */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                  special.day_of_week === 'Friday' || special.day_of_week === 'Saturday' 
                    ? 'bg-amber-400 group-hover:bg-amber-500' 
                    : 'bg-red-800 group-hover:bg-red-600'
                }`}></div>
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex-1">
                      {/* Clickable Bar Name */}
                      {special.source_url ? (
                        <a 
                          href={special.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-extrabold text-xl text-stone-800 group-hover:text-red-700 transition-colors flex items-center gap-1 leading-tight"
                        >
                          {special.bar_name} 
                          {/* Arrow appears on hover */}
                          <span className="text-sm opacity-0 group-hover:opacity-100 transition-all text-red-500 -translate-x-2 group-hover:translate-x-0 duration-300">↗</span>
                        </a>
                      ) : (
                        <h2 className="font-extrabold text-xl text-stone-800 leading-tight">{special.bar_name}</h2>
                      )}

                      {/* Smart Badge (Days) */}
                      {(selectedDay === 'All' || special.day_of_week === 'Every Night' || special.day_of_week === 'Daily') && (
                        <span className="inline-block mt-2 text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded uppercase tracking-wider border border-stone-200">
                          {special.day_of_week}
                        </span>
                      )}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="bg-amber-100 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-lg text-sm whitespace-nowrap shadow-sm">
                      {special.price === 'Varies' ? 'Varies' : `$${special.price}`}
                    </div>
                  </div>
                  
                  {/* Special Details */}
                  <p className="text-stone-600 text-sm leading-relaxed font-medium">
                    {special.special_details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full text-center py-20 text-stone-400 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-stone-200">
              <div className="text-5xl mb-3 opacity-50">😴</div>
              <p className="font-medium text-lg">No specials found for {selectedDay}.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="p-8 text-center text-gray-500 text-sm bg-white border-t border-gray-100 mt-auto">
        <p className="mb-4">Built with ❤️ in Madison</p>
        <a 
          href="https://buymeacoffee.com/spinkrith" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-md hover:bg-yellow-300 transition-transform hover:-translate-y-1"
        >
          <span>🍺</span>
          <span>Buy the developer a beer</span>
        </a>
      </footer>
    </div>
  )
}