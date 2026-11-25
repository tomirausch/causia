import type { Flujo, Via, Modalidad } from './types'

export const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const today = () => iso(new Date())
export const addDays = (n: number, from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + n)
  return iso(d)
}
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const diffDays = (a: string, b: string) =>
  Math.round((parse(a).getTime() - parse(b).getTime()) / 86400000)
export const fmt = (s: string) => {
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
export const fmtLargo = (s: string) => `${DIAS[parse(s).getDay()]} ${fmt(s).slice(0, 5)}`
export const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export const ETAPAS: Record<Flujo, string[]> = {
  A: ['Admisión y estrategia', 'Inicio o contestación', 'Prueba y audiencia preliminar', 'Sentencia y recursos', 'Liquidación y cobro'],
  B: ['Preparación y demanda', 'Intimación y embargo', 'Sentencia de trance y remate', 'Liquidación y percepción'],
  C: ['Recopilación y armado', 'Presentación o instancia administrativa', 'Audiencias o vistas', 'Resolución o acuerdo'],
}
export const FLUJO_NOMBRE: Record<Flujo, string> = {
  A: 'Proceso de conocimiento', B: 'Ejecutivo / ejecución de honorarios', C: 'Extrajudicial',
}
export const flujoDe = (via: Via, subtipo: string): Flujo => {
  if (via === 'extrajudicial') return 'C'
  return /ejecu/i.test(subtipo) ? 'B' : 'A'
}
export const etapasDe = (via: Via, subtipo: string, modalidad: Modalidad) =>
  modalidad === 'tramite' ? [] : ETAPAS[flujoDe(via, subtipo)]

export const PLANTILLAS: Record<string, string[]> = {
  'Ejecución de honorarios': ['Reunir regulación y liquidación', 'Pedir planilla de aportes', 'Redactar demanda ejecutiva', 'Presentar y abonar tasa de justicia', 'Controlar intimación de pago'],
  'Daños y perjuicios': ['Recopilar prueba documental', 'Pedir historia clínica o pericial', 'Redactar demanda', 'Ofrecer prueba', 'Preparar audiencia preliminar'],
  'Mediación': ['Solicitar mediador', 'Notificar a la contraparte', 'Preparar propuesta de acuerdo'],
  'Jubilaciones': ['Reunir DNI y constancia de CUIL', 'Solicitar historia laboral', 'Presentar el trámite', 'Seguimiento del expediente'],
  'Sociedades': ['Verificar nombre y estatuto', 'Redactar contrato social', 'Inscribir', 'Entregar documentación'],
}
export const PLANTILLA_TRAMITE = ['Reunir datos del trámite', 'Presentar', 'Controlar resultado']
export const plantillaDe = (subtipo: string, modalidad: Modalidad) =>
  modalidad === 'tramite' ? PLANTILLA_TRAMITE : PLANTILLAS[subtipo] ?? ['Reunir documentación', 'Definir estrategia', 'Presentar']

export const money = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
let n = 1000
export const uid = (p: string) => `${p}${++n}`
