import { useState } from 'react'
import { useStore } from '../store'
import { Q } from '../ui'
import { MESES, iso, pad, today } from '../lib'
import { go } from '../App'

export default function CalendarPage() {
  const { s } = useStore()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const first = new Date(ym.y, ym.m, 1)
  const start = new Date(ym.y, ym.m, 1 - ((first.getDay() + 6) % 7)) // semana desde lunes
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const mv = (n: number) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const caseName = (id: string) => s.cases.find(c => c.id === id)!.id
  return (
    <>
      <div className="row"><div><h1>Calendario</h1><p className="sub">Plazos (rojo) y audiencias o reuniones (azul). Es un calendario interno de la aplicación.</p></div></div>
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn" onClick={() => mv(-1)}>←</button><b style={{ minWidth: 150, textAlign: 'center' }}>{MESES[ym.m]} {ym.y}</b><button className="btn" onClick={() => mv(1)}>→</button>
        <button className="btn" onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>Hoy</button>
      </div>
      <div className="cal">
        {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => <div key={d} className="h">{d}</div>)}
        {days.map(d => {
          const k = iso(d)
          const dl = s.deadlines.filter(x => x.fecha === k && !x.cumplido)
          const ev = s.events.filter(x => x.fecha === k)
          return (
            <div key={k} className={`c ${d.getMonth() !== ym.m ? 'out' : ''} ${k === today() ? 'td' : ''}`}>
              <b>{pad(d.getDate())}</b>
              {dl.map(x => <span key={x.id} className="ev p" title={x.descripcion} onClick={() => go('caso/' + x.caseId)}>{caseName(x.caseId)} · {x.descripcion}</span>)}
              {ev.map(x => <span key={x.id} className="ev a" title={x.descripcion} onClick={() => go('caso/' + x.caseId)}>{x.hora} {x.descripcion}</span>)}
            </div>
          )
        })}
      </div>
      <Q>¿Con ver las audiencias en este calendario y recibir el recordatorio por correo alcanza por ahora, sin pasarlas a tu Google Calendar?</Q>
    </>
  )
}
