import { useState } from 'react'
import { useStore } from '../store'
import { Badge, Modal, Q, estadoBadge } from '../ui'
import { etapasDe, plantillaDe, today, uid } from '../lib'
import { go } from '../App'
import type { CaseFile, Estado, Modalidad, Via } from '../types'

export default function Cases() {
  const { s, set } = useStore()
  const [q, setQ] = useState('')
  const [pf, setPf] = useState('')
  const [est, setEst] = useState<'' | Estado>('')
  const [via, setVia] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const cl = (id: string) => s.clients.find(c => c.id === id)!.nombre
  const list = s.cases.filter(c => {
    const t = (c.caratula + c.expediente + cl(c.clientId) + c.id).toLowerCase()
    return (!q || t.includes(q.toLowerCase())) && (!pf || c.portfolioId === pf) && (!est || c.estado === est) && (!via || c.via === via)
      && (est || c.estado !== 'finalizado')
  })
  return (
    <>
      <div className="row"><div><h1>Casos</h1><p className="sub">Los finalizados se ocultan por defecto; elegí el estado "Finalizado" para verlos.</p></div><span className="spacer" />
        <button className="btn pri" onClick={() => setNuevo(true)}>Nuevo caso</button></div>
      <div className="card row">
        <input placeholder="Buscar por carátula, cliente, expediente o ID" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <select value={pf} onChange={e => setPf(e.target.value)}><option value="">Todas las carteras</option>{s.portfolios.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
        <select value={est} onChange={e => setEst(e.target.value as Estado | '')}><option value="">Activos y en espera</option><option value="activo">Activo</option><option value="en_espera">En espera</option><option value="finalizado">Finalizado</option></select>
        <select value={via} onChange={e => setVia(e.target.value)}><option value="">Judicial y extrajudicial</option><option value="judicial">Judicial</option><option value="extrajudicial">Extrajudicial</option></select>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead><tr><th>ID</th><th>Carátula</th><th>Cliente</th><th>Cartera</th><th>Vía / subtipo</th><th>Etapa</th><th>Estado</th></tr></thead>
          <tbody>
            {list.map(c => {
              const e = etapasDe(c.via, c.subtipo, c.modalidad)
              return (
                <tr key={c.id} className="click" onClick={() => go('caso/' + c.id)}>
                  <td>{c.id}</td><td>{c.caratula}{c.modalidad === 'tramite' && <> <Badge c="blue">Trámite puntual</Badge></>}</td>
                  <td>{cl(c.clientId)}</td><td>{s.portfolios.find(p => p.id === c.portfolioId)!.nombre}</td>
                  <td>{c.via === 'judicial' ? 'Judicial' : 'Extrajudicial'} · {c.subtipo}</td>
                  <td>{e.length ? e[c.etapa] : '—'}</td><td>{estadoBadge(c.estado)}</td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={7} className="empty">No hay casos con ese filtro.</td></tr>}
          </tbody>
        </table>
      </div>
      <Q>¿Falta alguna columna o filtro que uses a diario (por ejemplo juzgado o fecha de último movimiento)?</Q>
      {nuevo && <NuevoCaso onClose={() => setNuevo(false)} onCreate={(c, tareas) => {
        set(x => ({ ...x, cases: [c, ...x.cases], tasks: [...tareas.map(t => ({ id: uid('t'), caseId: c.id, texto: t, hecho: false })), ...x.tasks] }))
        setNuevo(false); go('caso/' + c.id)
      }} />}
    </>
  )
}

function NuevoCaso({ onClose, onCreate }: { onClose: () => void; onCreate: (c: CaseFile, tareas: string[]) => void }) {
  const { s } = useStore()
  const [clientId, setClientId] = useState(s.clients[0].id)
  const [caratula, setCaratula] = useState('')
  const [via, setVia] = useState<Via>('judicial')
  const [modalidad, setModalidad] = useState<Modalidad>('proceso')
  const subs = via === 'judicial' ? s.catalogs.subtiposJudicial : s.catalogs.subtiposExtrajudicial
  const [subtipo, setSubtipo] = useState(subs[0])
  const [fuero, setFuero] = useState(s.catalogs.fueros[0])
  const [jur, setJur] = useState('Provincial')
  const tareas = plantillaDe(subtipo, modalidad)
  const n = s.cases.length + 1
  return (
    <Modal title="Nuevo caso" onClose={onClose}>
      <div className="form">
        <label className="f full">Cliente<select value={clientId} onChange={e => setClientId(e.target.value)}>{s.clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
        <label className="f full">Carátula<input value={caratula} placeholder="Actor c. Demandado s/ …" onChange={e => setCaratula(e.target.value)} /></label>
        <label className="f">Modalidad<select value={modalidad} onChange={e => setModalidad(e.target.value as Modalidad)}><option value="proceso">Proceso completo</option><option value="tramite">Trámite puntual</option></select></label>
        <label className="f">Vía<select value={via} onChange={e => { const v = e.target.value as Via; setVia(v); setSubtipo((v === 'judicial' ? s.catalogs.subtiposJudicial : s.catalogs.subtiposExtrajudicial)[0]) }}><option value="judicial">Judicial</option><option value="extrajudicial">Extrajudicial</option></select></label>
        <label className="f">Subtipo<select value={subtipo} onChange={e => setSubtipo(e.target.value)}>{subs.map(x => <option key={x}>{x}</option>)}</select></label>
        <label className="f">Fuero<select value={fuero} onChange={e => setFuero(e.target.value)}>{s.catalogs.fueros.map(x => <option key={x}>{x}</option>)}</select></label>
        <label className="f">Jurisdicción<select value={jur} onChange={e => setJur(e.target.value)}><option>Provincial</option><option>Federal</option><option>Otra</option></select></label>
      </div>
      <div className="q">Se crea como <b>CASO-{String(n).padStart(3, '0')}</b> y se carga esta checklist (editable): {tareas.join(' · ')}</div>
      <button className="btn pri" disabled={!caratula.trim()} onClick={() => onCreate({
        id: `CASO-${String(n).padStart(3, '0')}`, clientId, portfolioId: s.clients.find(c => c.id === clientId)!.portfolioId,
        caratula: caratula.trim(), jurisdiccion: jur, fuero, juzgado: '—', modalidad, via, subtipo, etapa: 0, estado: 'activo',
        history: [{ fecha: today(), texto: 'Caso creado' }],
      }, tareas)}>Crear caso</button>
    </Modal>
  )
}
