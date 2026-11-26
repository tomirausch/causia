import { useState } from 'react'
import { useStore } from '../store'
import { Badge, DeadlineLine, Q, avisoTexto, estadoBadge } from '../ui'
import { FLUJO_NOMBRE, etapasDe, flujoDe, fmt, fmtLargo, money, today, uid } from '../lib'
import { go } from '../App'
import type { CaseFile, Estado } from '../types'

const TABS = ['Resumen', 'Notas', 'Checklist', 'Plazos y agenda', 'Económico', 'Documentos']

export default function CaseDetail({ id }: { id: string }) {
  const { s, set } = useStore()
  const [tab, setTab] = useState('Resumen')
  const c = s.cases.find(x => x.id === id)
  if (!c) return <><h1>Caso no encontrado</h1><a className="lnk" onClick={() => go('casos')}>Volver a casos</a></>
  const upd = (p: Partial<CaseFile>, log?: string) =>
    set(x => ({ ...x, cases: x.cases.map(k => (k.id === id ? { ...k, ...p, history: log ? [...k.history, { fecha: today(), texto: log }] : k.history } : k)) }))
  const cliente = s.clients.find(k => k.id === c.clientId)!.nombre
  const cartera = s.portfolios.find(p => p.id === c.portfolioId)!.nombre
  const etapas = etapasDe(c.via, c.subtipo, c.modalidad)
  const flujo = flujoDe(c.via, c.subtipo)

  return (
    <>
      <a className="lnk" onClick={() => go('casos')}>← Casos</a>
      <div className="row" style={{ marginTop: 6 }}>
        <div><h1>{c.caratula}</h1>
          <p className="sub">{c.id} · {cliente} · {cartera} {c.expediente && `· Expte. ${c.expediente}`}</p></div>
        <span className="spacer" />{estadoBadge(c.estado)}
        {c.modalidad === 'tramite' && <Badge c="blue">Trámite puntual</Badge>}
      </div>
      <div className="tabs">{TABS.map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'Resumen' && (
        <>
          <div className="card">
            <div className="row">
              <label className="f">Estado
                <select value={c.estado} onChange={e => upd({ estado: e.target.value as Estado }, `Estado: ${e.target.value.replace('_', ' ')}`)}>
                  <option value="activo">Activo</option><option value="en_espera">En espera</option><option value="finalizado">Finalizado / archivado</option>
                </select></label>
              {c.estado === 'finalizado' && <button className="btn" onClick={() => upd({ estado: 'activo' }, 'Reabierto / desarchivado')}>Reabrir caso</button>}
              <span className="spacer" />
              {c.via === 'extrajudicial' && c.modalidad === 'proceso' && (
                <button className="btn pri" onClick={() => {
                  if (confirm('¿Judicializar este caso? Se conservan historial, notas, documentos y gastos.'))
                    upd({ via: 'judicial', etapa: 0, subtipo: s.catalogs.subtiposJudicial.includes(c.subtipo) ? c.subtipo : s.catalogs.subtiposJudicial[0] }, 'Judicializado: pasa a vía judicial')
                }}>Judicializar</button>)}
            </div>
            <div className="q" style={{ marginTop: 12 }}>"En espera" queda sin motivo ni fecha de seguimiento, como pediste.</div>
          </div>

          <div className="card">
            <h2>Etapa procesal {etapas.length > 0 && <Badge>Flujo {flujo}: {FLUJO_NOMBRE[flujo]}</Badge>}</h2>
            {etapas.length === 0
              ? <div className="empty">Los trámites puntuales no tienen etapas: se gestionan con la checklist.</div>
              : <div className="steps">{etapas.map((e, i) => <span key={e} className={`step ${i < c.etapa ? 'done' : i === c.etapa ? 'cur' : ''}`} onClick={() => upd({ etapa: i }, `Etapa: ${e}`)}>{i + 1}. {e}</span>)}</div>}
            <div className="m" style={{ color: 'var(--mute)', fontSize: 13, marginTop: 6 }}>Tocá una etapa para cambiarla; queda registrada en el historial.</div>
          </div>

          <div className="grid2">
            <div className="card"><h2>Datos del caso</h2>
              <table><tbody>
                {([['ID', c.id], ['Cliente', cliente], ['Cartera', cartera], ['Expediente', c.expediente ?? '—'], ['Jurisdicción', c.jurisdiccion], ['Fuero', c.fuero], ['Juzgado / organismo', c.juzgado], ['Vía', c.via === 'judicial' ? 'Judicial' : 'Extrajudicial'], ['Subtipo', c.subtipo]] as [string, string][]).map(([k, v]) => <tr key={k}><td style={{ color: 'var(--mute)', width: 140 }}>{k}</td><td>{v}</td></tr>)}
              </tbody></table>
            </div>
            <div className="card"><h2>Historial</h2>
              {[...c.history].reverse().map((h, i) => <div key={i} className="item"><span style={{ color: 'var(--mute)', width: 84 }}>{fmt(h.fecha)}</span><div className="t">{h.texto}</div></div>)}
            </div>
          </div>
          <Q>¿Los flujos de etapas (A, B y C) reflejan cómo trabajás? Un proceso nuevo, como desalojo, ¿usaría uno de estos o necesita etapas propias?</Q>
        </>
      )}

      {tab === 'Notas' && <Notas caseId={id} />}
      {tab === 'Checklist' && <Checklist caseId={id} />}
      {tab === 'Plazos y agenda' && <PlazosAgenda caseId={id} />}
      {tab === 'Económico' && <Economico caseId={id} />}
      {tab === 'Documentos' && (
        <div className="card">
          <h2>Documentos</h2>
          <p>Los expedientes y escritos viven en tu Google Drive. Acá se guarda el enlace a la carpeta del caso.</p>
          <div className="row">
            <input style={{ flex: 1 }} placeholder="Pegá el enlace de la carpeta de Drive" value={c.driveUrl ?? ''} onChange={e => upd({ driveUrl: e.target.value })} />
            <button className="btn pri" disabled={!c.driveUrl} onClick={() => window.open(c.driveUrl, '_blank')}>Abrir carpeta en Drive</button>
          </div>
          <Q>¿Te alcanza con pegar el enlace en cada caso al principio? Crear las carpetas automáticamente requiere dar permisos a la aplicación sobre tu Drive.</Q>
        </div>
      )}
    </>
  )
}

function Notas({ caseId }: { caseId: string }) {
  const { s, set } = useStore()
  const [t, setT] = useState('')
  const list = s.notes.filter(n => n.caseId === caseId).sort((a, b) => b.fecha.localeCompare(a.fecha))
  return (
    <div className="card">
      <textarea value={t} placeholder="Nueva nota…" onChange={e => setT(e.target.value)} />
      <button className="btn pri" disabled={!t.trim()} onClick={() => { set(x => ({ ...x, notes: [{ id: uid('n'), caseId, fecha: today(), texto: t.trim() }, ...x.notes] })); setT('') }}>Agregar nota</button>
      {list.length === 0 && <div className="empty">Sin notas todavía.</div>}
      {list.map(n => <div key={n.id} className="item"><span style={{ color: 'var(--mute)', width: 84 }}>{fmt(n.fecha)}</span><div className="t">{n.texto}</div></div>)}
    </div>
  )
}

function Checklist({ caseId }: { caseId: string }) {
  const { s, set } = useStore()
  const [t, setT] = useState('')
  const list = s.tasks.filter(x => x.caseId === caseId)
  const hechas = list.filter(x => x.hecho).length
  return (
    <div className="card">
      <h2>Checklist <Badge>{hechas}/{list.length}</Badge></h2>
      {list.map(k => (
        <label key={k.id} className="item" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={k.hecho} onChange={() => set(x => ({ ...x, tasks: x.tasks.map(y => (y.id === k.id ? { ...y, hecho: !y.hecho } : y)) }))} />
          <span className="t" style={{ textDecoration: k.hecho ? 'line-through' : 'none', color: k.hecho ? 'var(--mute)' : undefined }}>{k.texto}</span>
          <button className="btn sm" onClick={e => { e.preventDefault(); set(x => ({ ...x, tasks: x.tasks.filter(y => y.id !== k.id) })) }}>Quitar</button>
        </label>
      ))}
      <div className="row" style={{ marginTop: 10 }}>
        <input style={{ flex: 1 }} placeholder="Agregar paso…" value={t} onChange={e => setT(e.target.value)} />
        <button className="btn" disabled={!t.trim()} onClick={() => { set(x => ({ ...x, tasks: [...x.tasks, { id: uid('t'), caseId, texto: t.trim(), hecho: false }] })); setT('') }}>Agregar</button>
      </div>
      <Q>¿Los pasos de la plantilla son los que usás? Se pueden editar por tipo de caso.</Q>
    </div>
  )
}

function PlazosAgenda({ caseId }: { caseId: string }) {
  const { s, set } = useStore()
  const [d, setD] = useState({ descripcion: '', tipo: 'Plazo procesal', fecha: today(), admiteGracia: false })
  const [e, setE] = useState({ descripcion: '', fecha: today(), hora: '09:00', modalidad: 'presencial' as 'presencial' | 'virtual', lugar: '' })
  const dls = s.deadlines.filter(x => x.caseId === caseId).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const evs = s.events.filter(x => x.caseId === caseId).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  return (
    <div className="grid2">
      <div className="card">
        <h2>Plazos <span style={{ fontWeight: 400, color: 'var(--mute)', fontSize: 13 }}>solo fecha</span></h2>
        {dls.length === 0 && <div className="empty">Sin plazos.</div>}
        {dls.map(x => <DeadlineLine key={x.id} dl={x} extra={!x.cumplido && <><br />{avisoTexto(x, s.settings)}</>}
          right={!x.cumplido ? <button className="btn sm" onClick={() => set(y => ({ ...y, deadlines: y.deadlines.map(z => (z.id === x.id ? { ...z, cumplido: true } : z)) }))}>Cumplido</button> : undefined} />)}
        <div className="form" style={{ marginTop: 12 }}>
          <label className="f full">Descripción<input value={d.descripcion} onChange={ev => setD({ ...d, descripcion: ev.target.value })} /></label>
          <label className="f">Fecha<input type="date" value={d.fecha} onChange={ev => setD({ ...d, fecha: ev.target.value })} /></label>
          <label className="f">Tipo<select value={d.tipo} onChange={ev => setD({ ...d, tipo: ev.target.value })}><option>Plazo procesal</option><option>Plazo</option><option>Trámite</option><option>Prescripción</option></select></label>
          <label className="f full" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={d.admiteGracia} onChange={ev => setD({ ...d, admiteGracia: ev.target.checked })} />Admite gracia (primeras 2 horas del día hábil siguiente)</label>
          <button className="btn pri" disabled={!d.descripcion.trim()} onClick={() => { set(y => ({ ...y, deadlines: [...y.deadlines, { id: uid('d'), caseId, cumplido: false, ...d, descripcion: d.descripcion.trim() }] })); setD({ ...d, descripcion: '' }) }}>Agregar plazo</button>
        </div>
      </div>
      <div className="card">
        <h2>Agenda <span style={{ fontWeight: 400, color: 'var(--mute)', fontSize: 13 }}>fecha y hora</span></h2>
        {evs.length === 0 && <div className="empty">Sin audiencias ni reuniones.</div>}
        {evs.map(x => <div key={x.id} className="item"><Badge c="blue">{fmtLargo(x.fecha)}</Badge><div className="t">{x.hora} · {x.descripcion}<div className="m">{x.modalidad === 'virtual' ? 'Virtual' : 'Presencial'} · {x.lugar}</div></div></div>)}
        <div className="form" style={{ marginTop: 12 }}>
          <label className="f full">Descripción<input value={e.descripcion} onChange={ev => setE({ ...e, descripcion: ev.target.value })} /></label>
          <label className="f">Fecha<input type="date" value={e.fecha} onChange={ev => setE({ ...e, fecha: ev.target.value })} /></label>
          <label className="f">Hora<input type="time" value={e.hora} onChange={ev => setE({ ...e, hora: ev.target.value })} /></label>
          <label className="f">Modalidad<select value={e.modalidad} onChange={ev => setE({ ...e, modalidad: ev.target.value as 'presencial' | 'virtual' })}><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select></label>
          <label className="f">Lugar o enlace<input value={e.lugar} onChange={ev => setE({ ...e, lugar: ev.target.value })} /></label>
          <button className="btn pri" disabled={!e.descripcion.trim()} onClick={() => { set(y => ({ ...y, events: [...y.events, { id: uid('e'), caseId, ...e, descripcion: e.descripcion.trim() }] })); setE({ ...e, descripcion: '' }) }}>Agregar a la agenda</button>
        </div>
      </div>
      <div style={{ gridColumn: '1/-1' }}><Q>Los plazos llevan solo fecha y la audiencia fecha y hora. ¿Los avisos "24 hs antes" te sirven así? ¿A qué hora del día anterior querés el aviso de un plazo con solo fecha?</Q></div>
    </div>
  )
}

function Economico({ caseId }: { caseId: string }) {
  const { s, set } = useStore()
  const fees = s.fees.filter(x => x.caseId === caseId)
  const exps = s.expenses.filter(x => x.caseId === caseId)
  const cons = s.contribs.filter(x => x.caseId === caseId)
  const [f, setF] = useState({ concepto: 'Regulación judicial', unidad: s.catalogs.unidades[0], monto: '' })
  const [x, setX] = useState({ categoria: s.catalogs.categoriasGasto[0], monto: '' })
  const [a, setA] = useState({ monto: '' })
  const porUnidad: Record<string, number> = {}
  fees.forEach(k => (porUnidad[k.unidad] = (porUnidad[k.unidad] ?? 0) + k.monto))
  const gen = cons.filter(k => k.estado === 'generado').reduce((t, k) => t + k.monto, 0)
  const abo = cons.filter(k => k.estado === 'abonado').reduce((t, k) => t + k.monto, 0)
  const toggle = (id: string, k: 'boleta' | 'ticket' | 'trasladado') => set(y => ({ ...y, contribs: y.contribs.map(z => (z.id === id ? { ...z, [k]: !z[k] } : z)) }))
  return (
    <>
      <div className="card">
        <h2>Honorarios</h2>
        <table><thead><tr><th>Concepto</th><th>Monto</th><th>Estado</th><th>Mes de cobro</th></tr></thead><tbody>
          {fees.map(k => <tr key={k.id}><td>{k.concepto}</td><td>{money(k.monto)} {k.unidad}</td>
            <td><select value={k.estado} onChange={e => set(y => ({ ...y, fees: y.fees.map(z => (z.id === k.id ? { ...z, estado: e.target.value as typeof k.estado, mesCobro: e.target.value === 'cobrado' ? today().slice(0, 7) : z.mesCobro } : z)) }))}>
              <option value="pactado">Pactado</option><option value="regulado">Regulado</option><option value="en_ejecucion">En ejecución</option><option value="cobrado">Cobrado</option></select></td>
            <td>{k.mesCobro ?? '—'}</td></tr>)}
          {fees.length === 0 && <tr><td colSpan={4} className="empty">Sin honorarios.</td></tr>}
        </tbody></table>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="Concepto" value={f.concepto} onChange={e => setF({ ...f, concepto: e.target.value })} />
          <input placeholder="Monto" type="number" style={{ width: 110 }} value={f.monto} onChange={e => setF({ ...f, monto: e.target.value })} />
          <select value={f.unidad} onChange={e => setF({ ...f, unidad: e.target.value })}>{s.catalogs.unidades.map(u => <option key={u}>{u}</option>)}</select>
          <button className="btn" disabled={!f.monto} onClick={() => { set(y => ({ ...y, fees: [...y.fees, { id: uid('f'), caseId, concepto: f.concepto, unidad: f.unidad, monto: Number(f.monto), estado: 'pactado' }] })); setF({ ...f, monto: '' }) }}>Agregar</button>
        </div>
        <div className="m" style={{ color: 'var(--mute)', marginTop: 8, fontSize: 13 }}>Totales por unidad (sin convertir): {Object.keys(porUnidad).length ? Object.entries(porUnidad).map(([u, v]) => `${money(v)} ${u}`).join(' · ') : '—'}</div>
      </div>
      <div className="grid2">
        <div className="card">
          <h2>Gastos</h2>
          {exps.map(k => <div key={k.id} className="item"><div className="t">{k.categoria}<div className="m">{fmt(k.fecha)}</div></div><div>$ {money(k.monto)}</div><Badge c={k.estado === 'pagado' ? 'grn' : 'amb'}>{k.estado === 'pagado' ? 'Pagado' : 'Pendiente'}</Badge></div>)}
          {exps.length === 0 && <div className="empty">Sin gastos.</div>}
          <div className="row" style={{ marginTop: 8 }}>
            <select value={x.categoria} onChange={e => setX({ ...x, categoria: e.target.value })}>{s.catalogs.categoriasGasto.map(u => <option key={u}>{u}</option>)}</select>
            <input type="number" placeholder="Monto $" style={{ width: 110 }} value={x.monto} onChange={e => setX({ ...x, monto: e.target.value })} />
            <button className="btn" disabled={!x.monto} onClick={() => { set(y => ({ ...y, expenses: [...y.expenses, { id: uid('x'), caseId, categoria: x.categoria, fecha: today(), monto: Number(x.monto), estado: 'pendiente' }] })); setX({ ...x, monto: '' }) }}>Agregar</button>
          </div>
        </div>
        <div className="card">
          <h2>Aportes a la Caja Forense</h2>
          <div className="row" style={{ marginBottom: 8 }}><Badge c="amb">Generados: $ {money(gen)}</Badge><Badge c="grn">Abonados: $ {money(abo)}</Badge></div>
          {cons.map(k => (
            <div key={k.id} className="item"><div className="t">$ {money(k.monto)} · {k.estado === 'generado' ? 'Generado' : 'Abonado'}<div className="m">{fmt(k.fecha)}</div>
              <div className="row" style={{ gap: 12, fontSize: 13 }}>
                <label><input type="checkbox" checked={k.trasladado} onChange={() => toggle(k.id, 'trasladado')} /> Trasladado al cliente</label>
                {k.estado === 'abonado' && <><label><input type="checkbox" checked={k.boleta} onChange={() => toggle(k.id, 'boleta')} /> Boleta</label><label><input type="checkbox" checked={k.ticket} onChange={() => toggle(k.id, 'ticket')} /> Ticket</label></>}
              </div></div>
              {k.estado === 'generado' && <button className="btn sm" onClick={() => set(y => ({ ...y, contribs: y.contribs.map(z => (z.id === k.id ? { ...z, estado: 'abonado' } : z)) }))}>Marcar abonado</button>}
            </div>))}
          {cons.length === 0 && <div className="empty">Sin aportes.</div>}
          <div className="row" style={{ marginTop: 8 }}>
            <input type="number" placeholder="Monto $" style={{ width: 110 }} value={a.monto} onChange={e => setA({ monto: e.target.value })} />
            <button className="btn" disabled={!a.monto} onClick={() => { set(y => ({ ...y, contribs: [...y.contribs, { id: uid('a'), caseId, fecha: today(), monto: Number(a.monto), estado: 'generado', trasladado: false, boleta: false, ticket: false }] })); setA({ monto: '' }) }}>Registrar aporte generado</button>
          </div>
        </div>
      </div>
      <Q>Para cada aporte abonado, ¿qué datos tiene la boleta y el ticket? ¿Podés mostrarme un ejemplo?  Los honorarios solo registran la unidad (por ejemplo 28 JUS); la conversión a pesos la hacés vos.</Q>
    </>
  )
}

