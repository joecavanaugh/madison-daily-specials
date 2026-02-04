import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elcikekczeaxnooncqjr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsY2lrZWtjemVheG5vb25jcWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTc0MTAsImV4cCI6MjA4NTc5MzQxMH0.JniHNE46X2GQWvPjslHFRjRo1mfKTRVeFh6iW2rF0kA'

export const supabase = createClient(supabaseUrl, supabaseKey)