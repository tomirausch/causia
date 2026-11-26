import { useState } from 'react'
import { useStore } from '../store'
import { Badge, Q } from '../ui'
import type { Catalogs } from '../types'

const LISTAS: [keyof Catalogs, string][] = [
  ['fueros', 'Fueros'], ['subtiposJudicial', 'Subtipos judiciales'], ['subtiposExtrajudicial', 'Subtipos extrajudiciales'],
  ['unidades', 'Unidades de valor'], ['categoriasGasto', 'Categorías de gasto'],
]

export default function Settings() {
  const { s, set } = useStore()
  const [txt, setTxt] = useState<Record<string, string>>({})
  const add = (k: keyof Catalogs) => {
    const v = (txt[k] ?? '').trim(); if (!v || s.catalogs[k].includes(v)) return
    set(x => ({ ...x, catalogs: { ...x.catalogs, [k]: [...x.catalogs[k], v] } })); setTxt({ ...txt, [k]: '' })
  }
  const del = (k: keyof Catalogs, v: string) => set(x => ({ ...x, catalogs: { ...x.catalogs, [k]: x.catalogs[k].filter(i => i !== v) } }))
  return (
    <>
      <h1>Ajustes</h1><p className="sub">Listas editables y avisos.</p>
      <div className="card">
        <h2>Avisos</h2>
        <div className="row">
          <label className="f">Anticipación por defecto (horas)<input type="number" min={1} value={s.settings.anticipacionHs} onChange={e => set(x => ({ ...x, settings: { ...x.settings, anticipacionHs: Number(e.target.value) || 24 } }))} /></label>
          <label className="f">Hora del aviso (plazos con solo fecha)<input type="time" value={s.settings.horaAvisoSoloFecha} onChange={e => set(x => ({ ...x, settings: { ...x.settings, horaAvisoSoloFecha: e.target.value } }))} /></label>
        </div>
        <Q>Cada profesional configura su propio aviso; por defecto 24 hs antes. Para plazos con solo fecha, ¿a qué hora del día anterior querés el aviso?</Q>
      </div>
      <div className="grid2">
        {LISTAS.map(([k, n]) => (
          <div className="card" key={k}>
            <h2>{n}</h2>
            <div className="row">{s.catalogs[k].map(v => <Badge key={v}>{v} <a className="lnk" style={{ textDecoration: 'none' }} title="Quitar" onClick={() => del(k, v)}>×</a></Badge>)}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <input placeholder="Agregar…" value={txt[k] ?? ''} onChange={e => setTxt({ ...txt, [k]: e.target.value })} onKeyDown={e => e.key === 'Enter' && add(k)} />
              <button className="btn" onClick={() => add(k)}>Agregar</button>
            </div>
          </div>))}
      </div>
      <Q>¿Qué es "MED" y falta alguna unidad en la lista? Los procesos nuevos (desalojo, cuota alimentaria) se agregan en "Subtipos judiciales".</Q>
    </>
  )
}
