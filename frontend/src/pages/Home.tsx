import { useState } from 'react'
import { useStore } from '../store'
import { DeadlineLine, Badge, Q, avisoTexto } from '../ui'
import { today, diffDays, fmt, fmtLargo } from '../lib'
import { go } from '../App'

export default function Home() {
  const { s, set } = useStore()
  const [pf, setPf] = useState('')
  const caseOf = (id: string) => s.cases.find(c => c.id === id)!
  const ok = (caseId: string) => !pf || caseOf(caseId).portfolioId === pf
  const pend = s.deadlines.filter(d => !d.cumplido && ok(d.caseId) && caseOf(d.caseId).estado !== 'finalizado').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const t = today()
  const atras = pend.filter(d => d.fecha < t)
  const hoy = pend.filter(d => d.fecha === t)
  const semana = pend.filter(d => diffDays(d.fecha, t) > 0 && diffDays(d.fecha, t) <= 7)
  const mes = pend.filter(d => diffDays(d.fecha, t) > 7 && diffDays(d.fecha, t) <= 30)
  const evs = s.events.filter(e => ok(e.caseId) && diffDays(e.fecha, t) >= 0 && diffDays(e.fecha, t) <= 14).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  const activos = s.cases.filter(c => c.estado === 'activo' && (!pf || c.portfolioId === pf)).length

  const cumplir = (id: string) => set(x => ({ ...x, deadlines: x.deadlines.map(d => (d.id === id ? { ...d, cumplido: true } : d)) }))
  const grupo = (titulo: string, lista: typeof pend, vacio: string) => (
    <div className="card">
      <h2>{titulo} <Badge c={lista.length && titulo === 'Atrasados' ? 'red' : 'gray'}>{lista.length}</Badge></h2>
      {lista.length === 0 && <div className="empty">{vacio}</div>}
      {lista.map(d => (
        <DeadlineLine key={d.id} dl={d} onClick={() => go('caso/' + d.caseId)}
          extra={<>· <a className="lnk">{caseOf(d.caseId).caratula}</a><br />{avisoTexto(d, s.settings)}</>}
          right={<button className="btn sm" onClick={e => { e.stopPropagation(); cumplir(d.id) }}>Cumplido</button>} />
      ))}
    </div>
  )

  return (
    <>
      <div className="row"><div><h1>Inicio</h1><p className="sub">Lo que vence y lo que viene, ordenado por urgencia.</p></div><span className="spacer" />
        <label className="f">Cartera
          <select value={pf} onChange={e => setPf(e.target.value)}>
            <option value="">Todas</option>
            {s.portfolios.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </label>
      </div>
      <div className="grid3" style={{ marginBottom: 16 }}>
        <div className="kpi"><b style={{ color: atras.length ? 'var(--red)' : undefined }}>{atras.length}</b><span>plazos atrasados</span></div>
        <div className="kpi"><b>{hoy.length + evs.filter(e => e.fecha === t).length}</b><span>cosas para hoy</span></div>
        <div className="kpi"><b>{activos}</b><span>casos activos</span></div>
      </div>
      <div className="grid2">
        <div>
          {grupo('Atrasados', atras, 'Nada atrasado.')}
          {grupo('Hoy', hoy, 'Sin plazos para hoy.')}
          {grupo('Esta semana', semana, 'Sin plazos en los próximos 7 días.')}
          {grupo('Este mes', mes, 'Sin otros plazos este mes.')}
        </div>
        <div>
          <div className="card">
            <h2>Audiencias y reuniones (14 días)</h2>
            {evs.length === 0 && <div className="empty">Sin audiencias próximas.</div>}
            {evs.map(e => (
              <div key={e.id} className="item link" onClick={() => go('caso/' + e.caseId)}>
                <Badge c={e.fecha === today() ? 'amb' : 'blue'}>{e.fecha === today() ? 'Hoy' : fmtLargo(e.fecha)}</Badge>
                <div className="t">{e.hora} · {e.descripcion}
                  <div className="m">{caseOf(e.caseId).caratula}<br />{e.modalidad === 'virtual' ? 'Virtual' : 'Presencial'} · {e.lugar}</div>
                </div>
              </div>
            ))}
            <div className="m" style={{ color: 'var(--mute)', fontSize: 13, marginTop: 8 }}>El día de cada audiencia se envía un recordatorio y un correo con el resumen de lo que hay ese día ({fmt(today())}).</div>
          </div>
          <Q>¿Este orden del inicio te sirve? ¿Qué agregarías o sacarías para ver de un vistazo al abrir?</Q>
        </div>
      </div>
    </>
  )
}
