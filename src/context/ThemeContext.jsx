import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)
const KEY = 'ptd.theme'

// Dark-only dashboard. We force the `dark` class on every load and overwrite any
// previously-saved 'light' preference, so the app is always black. (To bring back
// a light theme + toggle later, restore the state-based version of this file.)
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    try {
      localStorage.setItem(KEY, 'dark')
    } catch (e) {
      /* ignore */
    }
  }, [])

  return <ThemeContext.Provider value={{ theme: 'dark', toggle: () => {}, setTheme: () => {} }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
