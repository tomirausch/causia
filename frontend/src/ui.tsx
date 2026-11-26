import type { ReactNode } from 'react'
import type { Deadline, Estado, Settings } from './types'
import { diffDays, today, fmt, fmtLargo } from './lib'

export const Badge = ({ c = '', children }: { c?: string; children: ReactNode }) => <span className={`badge ${c}`}>{children}</span>

export const estadoBadge = (e: Estado) =>
  e === 'activo' ? <Badge c="grn">Activo</Badge> : e === 'en_espera' ? <Badge c="amb">En espera</Badge> : <Badge c="gray">Finalizado</Badge>

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="box" onClick={e => e.stopPropagation()}>
        <div className="row"><h2>{title}</h2><span className="spacer" /><button className="btn sm" onClick={onClose}>Cerrar</button></div>
        {children}
      </div>
    </div>
  )
}

export const Q = ({ children }: { children: ReactNode }) => <div className="q"><b>Para Florencia:</b> {children}</div>

export function urgency(f: string) {
  const n = diffDays(f, today())
  if (n < 0) return { c: 'red', t: `Atrasado ${-n} d` }
  if (n === 0) return { c: 'amb', t: 'Hoy' }
  if (n === 1) return { c: 'amb', t: 'Mañana' }
  return { c: 'blue', t: `En ${n} d` }
}

// Aviso: por defecto 24 hs antes (configurable). En plazos con solo fecha, se avisa el día anterior a una hora fija.
export function avisoTexto(dl: Deadline, st: Settings) {
  const dias = Math.max(1, Math.round(st.anticipacionHs / 24))
  const f = new Date(dl.fecha + 'T00:00:00')
  f.setDate(f.getDate() - dias)
  const s = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
  return `Aviso por correo: ${fmtLargo(s)} ${st.horaAvisoSoloFecha} hs`
}

export const DeadlineLine = ({ dl, extra, onClick, right }: { dl: Deadline; extra?: ReactNode; onClick?: () => void; right?: ReactNode }) => {
  const u = urgency(dl.fecha)
  return (
    <div className={`item ${onClick ? 'link' : ''}`} onClick={onClick}>
      <Badge c={dl.cumplido ? 'gray' : u.c}>{dl.cumplido ? 'Cumplido' : u.t}</Badge>
      <div className="t">
        {dl.descripcion} {dl.admiteGracia && <Badge c="amb">admite gracia</Badge>}
        <div className="m">{fmt(dl.fecha)} · {dl.tipo} {extra}</div>
      </div>
      {right}
    </div>
  )
}
