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
    const matchesDay = selectedDay === 'All' || s.day_of_week === selectedDay
    const matchesSearch = searchTerm === '' || 
      s.bar_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDay && matchesSearch
  })

  if (loading) return <div className="p-10 text-xl text-center">Loading Pints... 🍺</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-emerald-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          <h1 className="text-2xl font-bold text-center text-white">
            Madison Daily Specials
          </h1>

          {/* Search Bar - Centered and limited width on desktop */}
          <div className="max-w-md mx-auto w-full">
            <input 
              type="text"
              placeholder="🔍 Find a bar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
            />
          </div>

          {/* Day Filters - Centered */}
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
              <button
                onClick={() => setSelectedDay('All')}
                className={`px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  selectedDay === 'All' 
                    ? 'bg-yellow-400 text-emerald-900' 
                    : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
                }`}
              >
                All
              </button>

              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    selectedDay === day 
                      ? 'bg-yellow-400 text-emerald-900' 
                      : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
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
      <div className="max-w-7xl mx-auto w-full p-4 flex-1">
        
        <div className="text-center text-gray-500 text-sm mb-6">
          {searchTerm ? (
            <span>Searching for <span className="font-bold text-emerald-700">&quot;{searchTerm}&quot;</span></span>
          ) : (
            <span>Showing <span className="font-bold text-emerald-700">{selectedDay}</span> specials</span>
          )}
        </div>

        {/* RESPONSIVE GRID: 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecials.length > 0 ? (
            filteredSpecials.map((special) => (
              <div key={special.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-md transition-shadow">
                {/* Decorative side accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  special.day_of_week === 'Friday' || special.day_of_week === 'Saturday' ? 'bg-yellow-400' : 'bg-emerald-500'
                }`}></div>
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {/* Clickable Bar Name */}
                      {special.source_url ? (
                        <a 
                          href={special.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-lg text-emerald-700 hover:underline flex items-center gap-1 leading-tight"
                        >
                          {special.bar_name} 
                          <span className="text-xs opacity-50">↗</span>
                        </a>
                      ) : (
                        <h2 className="font-bold text-lg text-gray-800 leading-tight">{special.bar_name}</h2>
                      )}

                      {selectedDay === 'All' && (
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide block mt-1">
                          {special.day_of_week}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded text-sm whitespace-nowrap ml-2">
                      {special.price === 'Varies' ? 'Variable' : `$${special.price}`}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {special.special_details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            /* Empty State spans all columns */
            <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              No specials found.<br/>Maybe try a different search?
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