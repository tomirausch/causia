import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store'
import Home from './pages/Home'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import CalendarPage from './pages/CalendarPage'
import Money from './pages/Money'
import Settings from './pages/Settings'

const useHash = () => {
  const [h, setH] = useState(location.hash || '#/')
  useEffect(() => {
    const f = () => setH(location.hash || '#/')
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return h.replace(/^#\/?/, '').split('/')
}
export const go = (p: string) => { location.hash = '#/' + p }

function Shell() {
  const [a, b] = useHash()
  const { reset } = useStore()
  const nav: [string, string][] = [['', 'Inicio'], ['casos', 'Casos'], ['calendario', 'Calendario'], ['economico', 'Económico'], ['ajustes', 'Ajustes']]
  const on = (k: string) => (k === '' ? !a : a === k || (k === 'casos' && a === 'caso'))
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">Causia<small>Prototipo · datos ficticios</small></div>
        <nav className="nav">
          {nav.map(([k, n]) => <a key={k} href={'#/' + k} className={on(k) ? 'on' : ''}>{n}</a>)}
        </nav>
        <div className="proto">
          Todo lo que ves es de ejemplo y se pierde al recargar.
          <br /><button className="btn sm" style={{ marginTop: 8 }} onClick={reset}>Restablecer datos</button>
        </div>
      </aside>
      <main>
        {!a && <Home />}
        {a === 'casos' && <Cases />}
        {a === 'caso' && <CaseDetail id={b} />}
        {a === 'calendario' && <CalendarPage />}
        {a === 'economico' && <Money />}
        {a === 'ajustes' && <Settings />}
      </main>
    </div>
  )
}
export default function App() { return <StoreProvider><Shell /></StoreProvider> }
