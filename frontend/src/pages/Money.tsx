import { useState } from 'react'
import { useStore } from '../store'
import { Badge, Q } from '../ui'
import { fmt, money, today } from '../lib'
import { go } from '../App'

export default function Money() {
  const { s } = useStore()
  const [mes, setMes] = useState(today().slice(0, 7))
  const cobrados = s.fees.filter(f => f.estado === 'cobrado' && f.mesCobro === mes)
  const porUnidad = (xs: typeof s.fees) => { const r: Record<string, number> = {}; xs.forEach(f => (r[f.unidad] = (r[f.unidad] ?? 0) + f.monto)); return r }
  const pend = s.fees.filter(f => f.estado !== 'cobrado')
  const sum = (xs: { monto: number }[]) => xs.reduce((t, k) => t + k.monto, 0)
  const gen = s.contribs.filter(k => k.estado === 'generado')
  const abo = s.contribs.filter(k => k.estado === 'abonado')
  const fmtU = (r: Record<string, number>) => Object.keys(r).length ? Object.entries(r).map(([u, v]) => `${money(v)} ${u}`).join(' · ') : '—'
  return (
    <>
      <h1>Económico</h1><p className="sub">Honorarios, gastos y aportes de todos los casos. Las unidades no se mezclan ni se convierten.</p>
      <div className="grid2">
        <div className="card">
          <div className="row"><h2>Honorarios cobrados</h2><span className="spacer" /><input type="month" value={mes} onChange={e => setMes(e.target.value)} /></div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtU(porUnidad(cobrados))}</div>
          {cobrados.map(f => <div key={f.id} className="item link" onClick={() => go('caso/' + f.caseId)}><div className="t">{f.concepto}<div className="m">{f.caseId}</div></div>{money(f.monto)} {f.unidad}</div>)}
        </div>
        <div className="card">
          <h2>Honorarios pendientes de cobro</h2>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtU(porUnidad(pend))}</div>
          {pend.map(f => <div key={f.id} className="item link" onClick={() => go('caso/' + f.caseId)}><div className="t">{f.concepto}<div className="m">{f.caseId}</div></div><Badge c="amb">{f.estado.replace('_', ' ')}</Badge>&nbsp;{money(f.monto)} {f.unidad}</div>)}
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <h2>Aportes a la Caja Forense</h2>
          <div className="row"><div className="kpi"><b>$ {money(sum(gen))}</b><span>generados ({gen.length}) pendientes de abonar</span></div><div className="kpi"><b>$ {money(sum(abo))}</b><span>abonados ({abo.length})</span></div></div>
          {s.contribs.map(k => <div key={k.id} className="item link" onClick={() => go('caso/' + k.caseId)}><div className="t">{k.caseId} · {fmt(k.fecha)}<div className="m">{k.trasladado ? 'Trasladado al cliente' : 'Propio'}{k.estado === 'abonado' && ` · boleta ${k.boleta ? 'sí' : 'falta'} · ticket ${k.ticket ? 'sí' : 'falta'}`}</div></div>$ {money(k.monto)} <Badge c={k.estado === 'abonado' ? 'grn' : 'amb'}>{k.estado === 'abonado' ? 'Abonado' : 'Generado'}</Badge></div>)}
        </div>
        <div className="card">
          <h2>Gastos</h2>
          <div className="row"><div className="kpi"><b>$ {money(sum(s.expenses.filter(e => e.estado === 'pendiente')))}</b><span>pendientes</span></div><div className="kpi"><b>$ {money(sum(s.expenses.filter(e => e.estado === 'pagado')))}</b><span>pagados</span></div></div>
          {s.expenses.map(k => <div key={k.id} className="item link" onClick={() => go('caso/' + k.caseId)}><div className="t">{k.categoria}<div className="m">{k.caseId} · {fmt(k.fecha)}</div></div>$ {money(k.monto)}</div>)}
        </div>
      </div>
      <Q>¿Este resumen reemplaza tus planillas de honorarios y aportes? ¿Qué total o filtro necesitás que hoy sacás a mano?</Q>
    </>
  )
}
