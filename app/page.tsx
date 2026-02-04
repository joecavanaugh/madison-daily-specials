'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [specials, setSpecials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search and Filter State
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

  // --- FILTERING LOGIC ---
  const filteredSpecials = specials.filter(s => {
    // 1. Check Day (Pass if "All" is selected OR matches specific day)
    const matchesDay = selectedDay === 'All' || s.day_of_week === selectedDay
    
    // 2. Check Search Text (Pass if search is empty OR bar name matches)
    const matchesSearch = searchTerm === '' || 
      s.bar_name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesDay && matchesSearch
  })

  if (loading) return <div className="p-10 text-xl text-center">Loading Pints... 🍺</div>

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-emerald-800 p-4 shadow-lg sticky top-0 z-10 space-y-3">
        <h1 className="text-2xl font-bold text-center text-white">
          Madison Daily Specials
        </h1>

        {/* Search Bar */}
        <input 
          type="text"
          placeholder="🔍 Find a bar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* Day Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {/* 'All' Button */}
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

          {/* Day Buttons */}
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

      {/* CONTENT */}
      <div className="p-4 space-y-4 flex-1">
        <div className="text-center text-gray-500 text-sm mb-2">
          {searchTerm ? (
            <span>Searching for <span className="font-bold text-emerald-700">&quot;{searchTerm}&quot;</span></span>
          ) : (
            <span>Showing <span className="font-bold text-emerald-700">{selectedDay}</span> specials</span>
          )}
        </div>

        {filteredSpecials.length > 0 ? (
          filteredSpecials.map((special) => (
            <div key={special.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              {/* Decorative side accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                special.day_of_week === 'Friday' || special.day_of_week === 'Saturday' ? 'bg-yellow-400' : 'bg-emerald-500'
              }`}></div>
              
              <div className="pl-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">{special.bar_name}</h2>
                    {/* Show Day Tag if viewing 'All' */}
                    {selectedDay === 'All' && (
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                        {special.day_of_week}
                      </span>
                    )}
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded text-sm whitespace-nowrap">
                    {special.price === 'Varies' ? '$?' : `$${special.price}`}
                  </div>
                </div>
                <p className="text-gray-600 mt-1 leading-snug">{special.special_details}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            No specials found.<br/>Maybe try a different search?
          </div>
        )}
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