import type { State } from './types'
import { addDays, today } from './lib'

// Todos los datos son ficticios. Las fechas se calculan respecto del día actual.
const d = (n: number) => addDays(n)
const month = (n: number) => addDays(n).slice(0, 7)

export const initialState = (): State => ({
  portfolios: [
    { id: 'p1', nombre: 'Estudio propio', propia: true },
    { id: 'p2', nombre: 'Cartera Colega A', propia: false },
    { id: 'p3', nombre: 'Cartera Colega B', propia: false },
  ],
  clients: [
    { id: 'c1', nombre: 'Marta Ledesma', portfolioId: 'p1' },
    { id: 'c2', nombre: 'Constructora Río Sur S.A.', portfolioId: 'p1' },
    { id: 'c3', nombre: 'Julián Benítez', portfolioId: 'p2' },
    { id: 'c4', nombre: 'Estudio Colega A (honorarios)', portfolioId: 'p2' },
    { id: 'c5', nombre: 'Lucía Armand', portfolioId: 'p3' },
    { id: 'c6', nombre: 'Distribuidora Litoral S.R.L.', portfolioId: 'p3' },
  ],
  cases: [
    { id: 'CASO-001', clientId: 'c1', portfolioId: 'p1', caratula: 'Ledesma c. Seguros del Plata S.A. s/ Daños y perjuicios', expediente: '12345/2025', jurisdiccion: 'Provincial', fuero: 'Civil y Comercial', juzgado: 'Juzgado Civil y Comercial N.º 4', modalidad: 'proceso', via: 'judicial', subtipo: 'Daños y perjuicios', etapa: 2, estado: 'activo', driveUrl: 'https://drive.google.com/', history: [{ fecha: d(-120), texto: 'Caso creado' }, { fecha: d(-60), texto: 'Etapa: Inicio o contestación' }, { fecha: d(-20), texto: 'Etapa: Prueba y audiencia preliminar' }] },
    { id: 'CASO-002', clientId: 'c2', portfolioId: 'p1', caratula: 'Río Sur S.A. c. Municipalidad s/ Cobro de pesos', expediente: '8890/2025', jurisdiccion: 'Provincial', fuero: 'Civil y Comercial', juzgado: 'Juzgado Civil y Comercial N.º 2', modalidad: 'proceso', via: 'judicial', subtipo: 'Ejecutivo', etapa: 1, estado: 'activo', history: [{ fecha: d(-45), texto: 'Caso creado' }, { fecha: d(-30), texto: 'Etapa: Intimación y embargo' }] },
    { id: 'CASO-003', clientId: 'c3', portfolioId: 'p2', caratula: 'Benítez c. Frigorífico del Sur s/ Despido', expediente: '4567/2024', jurisdiccion: 'Provincial', fuero: 'Laboral', juzgado: 'Juzgado Laboral N.º 1', modalidad: 'proceso', via: 'judicial', subtipo: 'Laboral', etapa: 3, estado: 'en_espera', history: [{ fecha: d(-300), texto: 'Caso creado' }, { fecha: d(-15), texto: 'Estado: en espera' }] },
    { id: 'CASO-004', clientId: 'c4', portfolioId: 'p2', caratula: 'Estudio Colega A c. Gutiérrez s/ Ejecución de honorarios', expediente: '77/2026', jurisdiccion: 'Federal', fuero: 'Civil y Comercial', juzgado: 'Juzgado Federal N.º 1', modalidad: 'proceso', via: 'judicial', subtipo: 'Ejecución de honorarios', etapa: 0, estado: 'activo', history: [{ fecha: d(-10), texto: 'Caso creado' }] },
    { id: 'CASO-005', clientId: 'c5', portfolioId: 'p3', caratula: 'Armand — Jubilación', jurisdiccion: 'Federal', fuero: 'Previsional', juzgado: 'ANSES', modalidad: 'proceso', via: 'extrajudicial', subtipo: 'Jubilaciones', etapa: 1, estado: 'activo', history: [{ fecha: d(-70), texto: 'Caso creado' }] },
    { id: 'CASO-006', clientId: 'c6', portfolioId: 'p3', caratula: 'Distribuidora Litoral — Reclamo de cobro', jurisdiccion: 'Provincial', fuero: 'Civil y Comercial', juzgado: '—', modalidad: 'proceso', via: 'extrajudicial', subtipo: 'Cobro de pesos', etapa: 0, estado: 'activo', history: [{ fecha: d(-5), texto: 'Caso creado' }] },
    { id: 'CASO-007', clientId: 'c1', portfolioId: 'p1', caratula: 'Ledesma — Desarchivo de expediente', modalidad: 'tramite', jurisdiccion: 'Provincial', fuero: 'Civil y Comercial', juzgado: 'Archivo Judicial', via: 'judicial', subtipo: 'Daños y perjuicios', etapa: 0, estado: 'activo', history: [{ fecha: d(-3), texto: 'Caso creado' }] },
    { id: 'CASO-008', clientId: 'c2', portfolioId: 'p1', caratula: 'Río Sur — Mediación por incumplimiento', jurisdiccion: 'Provincial', fuero: 'Civil y Comercial', juzgado: 'Centro de Mediación', modalidad: 'proceso', via: 'extrajudicial', subtipo: 'Mediación', etapa: 3, estado: 'finalizado', history: [{ fecha: d(-200), texto: 'Caso creado' }, { fecha: d(-90), texto: 'Estado: finalizado' }] },
  ],
  deadlines: [
    { id: 'd1', caseId: 'CASO-001', descripcion: 'Contestar traslado de pericia', tipo: 'Plazo procesal', fecha: d(-1), admiteGracia: true, cumplido: false },
    { id: 'd2', caseId: 'CASO-002', descripcion: 'Acreditar diligenciamiento de oficio', tipo: 'Plazo procesal', fecha: today(), admiteGracia: true, cumplido: false },
    { id: 'd3', caseId: 'CASO-004', descripcion: 'Presentar demanda de ejecución', tipo: 'Plazo procesal', fecha: d(2), admiteGracia: true, cumplido: false },
    { id: 'd4', caseId: 'CASO-003', descripcion: 'Impulsar el proceso', tipo: 'Plazo procesal', fecha: d(5), admiteGracia: false, cumplido: false },
    { id: 'd5', caseId: 'CASO-005', descripcion: 'Presentar certificación de servicios', tipo: 'Trámite', fecha: d(9), admiteGracia: false, cumplido: false },
    { id: 'd6', caseId: 'CASO-006', descripcion: 'Vence plazo de intimación extrajudicial', tipo: 'Plazo', fecha: d(12), admiteGracia: false, cumplido: false },
    { id: 'd7', caseId: 'CASO-001', descripcion: 'Ofrecimiento de prueba', tipo: 'Plazo procesal', fecha: d(-12), admiteGracia: true, cumplido: true },
  ],
  events: [
    { id: 'e1', caseId: 'CASO-001', descripcion: 'Audiencia preliminar', fecha: today(), hora: '10:30', modalidad: 'presencial', lugar: 'Juzgado Civil y Comercial N.º 4' },
    { id: 'e2', caseId: 'CASO-003', descripcion: 'Audiencia de conciliación', fecha: d(3), hora: '09:00', modalidad: 'virtual', lugar: 'https://meet.example/ficticio' },
    { id: 'e3', caseId: 'CASO-006', descripcion: 'Reunión con cliente', fecha: d(4), hora: '16:00', modalidad: 'presencial', lugar: 'Estudio' },
    { id: 'e4', caseId: 'CASO-002', descripcion: 'Audiencia de vista de causa', fecha: d(14), hora: '11:00', modalidad: 'presencial', lugar: 'Juzgado Civil y Comercial N.º 2' },
  ],
  notes: [
    { id: 'n1', caseId: 'CASO-001', fecha: d(-20), texto: 'Se fijó audiencia preliminar. Llevar poder y documentación original.' },
    { id: 'n2', caseId: 'CASO-001', fecha: d(-60), texto: 'Cliente envió fotos y presupuesto de reparación.' },
    { id: 'n3', caseId: 'CASO-004', fecha: d(-9), texto: 'La regulación está firme. Falta planilla de aportes.' },
  ],
  tasks: [
    { id: 't1', caseId: 'CASO-001', texto: 'Recopilar prueba documental', hecho: true },
    { id: 't2', caseId: 'CASO-001', texto: 'Pedir historia clínica o pericial', hecho: true },
    { id: 't3', caseId: 'CASO-001', texto: 'Redactar demanda', hecho: true },
    { id: 't4', caseId: 'CASO-001', texto: 'Ofrecer prueba', hecho: true },
    { id: 't5', caseId: 'CASO-001', texto: 'Preparar audiencia preliminar', hecho: false },
    { id: 't6', caseId: 'CASO-004', texto: 'Reunir regulación y liquidación', hecho: true },
    { id: 't7', caseId: 'CASO-004', texto: 'Pedir planilla de aportes', hecho: false },
    { id: 't8', caseId: 'CASO-004', texto: 'Redactar demanda ejecutiva', hecho: false },
    { id: 't9', caseId: 'CASO-007', texto: 'Reunir datos del trámite', hecho: true },
    { id: 't10', caseId: 'CASO-007', texto: 'Presentar', hecho: false },
    { id: 't11', caseId: 'CASO-007', texto: 'Controlar resultado', hecho: false },
  ],
  fees: [
    { id: 'f1', caseId: 'CASO-004', concepto: 'Regulación judicial', unidad: 'JUS previsional', monto: 28, estado: 'regulado' },
    { id: 'f2', caseId: 'CASO-001', concepto: 'Cuota litis', unidad: 'Pesos', monto: 1500000, estado: 'pactado' },
    { id: 'f3', caseId: 'CASO-002', concepto: 'Regulación judicial', unidad: 'UMA', monto: 120, estado: 'en_ejecucion' },
    { id: 'f4', caseId: 'CASO-008', concepto: 'Convenio inicial', unidad: 'Pesos', monto: 400000, estado: 'cobrado', mesCobro: month(-90) },
    { id: 'f5', caseId: 'CASO-005', concepto: 'Honorario por trámite', unidad: 'Dólares', monto: 300, estado: 'cobrado', mesCobro: month(0) },
  ],
  expenses: [
    { id: 'x1', caseId: 'CASO-001', categoria: 'Tasa de justicia', fecha: d(-100), monto: 85000, estado: 'pagado' },
    { id: 'x2', caseId: 'CASO-004', categoria: 'Bono / sellado', fecha: d(-6), monto: 12000, estado: 'pendiente' },
    { id: 'x3', caseId: 'CASO-001', categoria: 'Movilidad', fecha: d(-18), monto: 9000, estado: 'pagado' },
  ],
  contribs: [
    { id: 'a1', caseId: 'CASO-004', fecha: d(-6), monto: 18000, estado: 'generado', trasladado: true, boleta: false, ticket: false },
    { id: 'a2', caseId: 'CASO-001', fecha: d(-100), monto: 32000, estado: 'abonado', trasladado: false, boleta: true, ticket: true },
    { id: 'a3', caseId: 'CASO-002', fecha: d(-25), monto: 21000, estado: 'abonado', trasladado: true, boleta: true, ticket: false },
  ],
  catalogs: {
    fueros: ['Civil y Comercial', 'Laboral', 'Familia', 'Previsional', 'Penal'],
    subtiposJudicial: ['Daños y perjuicios', 'Laboral', 'Amparo', 'Ejecutivo', 'Ejecución de honorarios', 'Sucesorio'],
    subtiposExtrajudicial: ['Mediación', 'ART/SRT', 'Sociedades', 'Jubilaciones', 'Cobro de pesos', 'Asesoramiento'],
    unidades: ['Pesos', 'Dólares', 'UMA', 'Jurista', 'JUS previsional', 'MED'],
    categoriasGasto: ['Tasa de justicia', 'Bono / sellado', 'Movilidad', 'Otros'],
  },
  settings: { anticipacionHs: 24, horaAvisoSoloFecha: '18:00' },
})
