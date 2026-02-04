'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [specials, setSpecials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    // 1. Set the default day to "Today"
    const todayIndex = new Date().getDay()
    // adjust because JS says Sunday is 0, but our list has Sunday at the end
    const currentDay = days[todayIndex === 0 ? 6 : todayIndex - 1] 
    setSelectedDay(currentDay)
    
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

  // Filter the list based on the button clicked
  const filteredSpecials = specials.filter(s => 
    s.day_of_week === selectedDay
  )

  if (loading) return <div className="p-10 text-xl text-center">Loading Pints... 🍺</div>

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-emerald-800 p-4 shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-white">
          Madison Daily Specials
        </h1>
        {/* Day Filters */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 no-scrollbar">
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
          Showing specials for <span className="font-bold text-emerald-700">{selectedDay}</span>
        </div>

        {filteredSpecials.length > 0 ? (
          filteredSpecials.map((special) => (
            <div key={special.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg text-gray-800">{special.bar_name}</h2>
                <div className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded text-sm">
                  {special.price === 'Varies' ? '$?' : `$${special.price}`}
                </div>
              </div>
              <p className="text-gray-600 mt-2 leading-snug">{special.special_details}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            No specials found for {selectedDay}.<br/>Maybe try another day?
          </div>
        )}
      </div>

      {/* FOOTER & MONETIZATION */}
      <footer className="p-8 text-center text-gray-500 text-sm bg-white border-t border-gray-100 mt-auto">
        <p className="mb-4">Built with ❤️ in Madison</p>
        
        {/* The Money Button */}
        <a 
          href="https://buymeacoffee.com/spinkrith" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-md hover:bg-yellow-300 transition-transform hover:-translate-y-1"
        >
          <span>🍺</span>
          <span>Buy the developer a beer</span>
        </a>
        
        <p className="mt-6 text-xs text-gray-300">
          Ads coming soon to cover server costs.
        </p>
      </footer>
    </div>
  )
}