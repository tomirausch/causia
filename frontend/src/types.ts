export type Via = 'judicial' | 'extrajudicial'
export type Modalidad = 'proceso' | 'tramite'
export type Estado = 'activo' | 'en_espera' | 'finalizado'
export type Flujo = 'A' | 'B' | 'C'

export interface Portfolio { id: string; nombre: string; propia: boolean }
export interface Client { id: string; nombre: string; portfolioId: string }
export interface HistoryEntry { fecha: string; texto: string }
export interface CaseFile {
  id: string
  clientId: string
  portfolioId: string
  caratula: string
  expediente?: string
  jurisdiccion: string
  fuero: string
  juzgado: string
  modalidad: Modalidad
  via: Via
  subtipo: string
  etapa: number
  estado: Estado
  driveUrl?: string
  history: HistoryEntry[]
}
export interface Deadline {
  id: string; caseId: string; descripcion: string; tipo: string
  fecha: string; admiteGracia: boolean; cumplido: boolean
}
export interface AgendaEvent {
  id: string; caseId: string; descripcion: string; fecha: string; hora: string
  modalidad: 'presencial' | 'virtual'; lugar: string
}
export interface Note { id: string; caseId: string; fecha: string; texto: string }
export interface Task { id: string; caseId: string; texto: string; hecho: boolean }
export interface Fee {
  id: string; caseId: string; concepto: string; unidad: string; monto: number
  estado: 'pactado' | 'regulado' | 'en_ejecucion' | 'cobrado'; mesCobro?: string
}
export interface Expense {
  id: string; caseId: string; categoria: string; fecha: string; monto: number
  estado: 'pendiente' | 'pagado'
}
export interface Contribution {
  id: string; caseId: string; fecha: string; monto: number
  estado: 'generado' | 'abonado'; trasladado: boolean; boleta: boolean; ticket: boolean
}
export interface Catalogs {
  fueros: string[]
  subtiposJudicial: string[]
  subtiposExtrajudicial: string[]
  unidades: string[]
  categoriasGasto: string[]
}
export interface Settings { anticipacionHs: number; horaAvisoSoloFecha: string }
export interface State {
  portfolios: Portfolio[]
  clients: Client[]
  cases: CaseFile[]
  deadlines: Deadline[]
  events: AgendaEvent[]
  notes: Note[]
  tasks: Task[]
  fees: Fee[]
  expenses: Expense[]
  contribs: Contribution[]
  catalogs: Catalogs
  settings: Settings
}
