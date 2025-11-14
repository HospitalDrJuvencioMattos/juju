import { Patient, Category, Question, Device, Exam, Medication, Alert, Task, User, Surgery, CapdScale } from './types';
import { 
    AppleIcon, 
    DropletIcon,
    HeartPulseIcon,
    BeakerIcon,
    LiverIcon,
    LungsIcon,
    DumbbellIcon,
    BrainIcon,
    PillIcon,
    ShieldIcon,
    UsersIcon,
    HomeIcon
} from './components/icons';

// Sample data for the new fields for Patient 1
const devices1: Device[] = [
  { id: 1, name: 'CVC 1', location: 'VJID', startDate: '2024-07-20' },
  { id: 2, name: 'SNE', location: 'Nasal', startDate: '2024-07-22' },
  { id: 3, name: 'AVP1', location: 'Braço Esquerdo', startDate: '2024-07-18', removalDate: '2024-07-21' },
];

const exams1: Exam[] = [
  { id: 1, name: 'Hemograma completo', date: '2024-07-23', result: 'Pendente', observation: 'Aguardando resultado laboratorial.' },
  { id: 2, name: 'Raio-X de tórax', date: '2024-07-22', result: 'Normal' },
];

const medications1: Medication[] = [
  { id: 1, name: 'Dipirona', dosage: '500mg 6/6h', startDate: '2024-07-20' },
  { id: 2, name: 'Amoxicilina', dosage: '250mg 8/8h', startDate: '2024-07-21' },
];

const surgeries1: Surgery[] = [
  { id: 1, name: 'Apendicectomia', surgeon: 'Dr. House', date: '2024-07-21' },
  { id: 2, name: 'Colecistectomia', surgeon: 'Dr. Grey', date: '2024-07-23' },
];

const capdScales1: CapdScale[] = [
    { id: 1, date: new Date('2024-07-23T10:00:00Z').toISOString(), score: 14 }
];


export const DEVICE_TYPES: string[] = [
    'CVC 1', 
    'CVC 2', 
    'PICC1', 
    'PICC2', 
    'AVP1', 
    'AVP2', 
    'TOT', 
    'SVD', 
    'DVE', 
    'SNE',
    'SNG',
    'Dreno toráxico D',
    'Dreno toráxico E',
    'OUTROS DRENOS',
    'Curativo à vácuo'
];
export const DEVICE_LOCATIONS: string[] = [
    'VJID', 
    'VJIE', 
    'VSD', 
    'VSE', 
    'VFD', 
    'VFE', 
    'Nasal', 
    'Braço Esquerdo', 
    'Braço Direito',
    'Oral',
    'Uretral',
    'Craniano',
    'Torácico Direito',
    'Torácico Esquerdo',
    'Abdominal, Membro Inferior E/D',
    'Abdominal, Lombar, Cervical'
];
export const EXAM_STATUSES: Array<'Pendente' | 'Normal' | 'Alterado'> = ['Pendente', 'Normal', 'Alterado'];
export const SURGEON_NAMES: string[] = ['Dr. House', 'Dr. Grey', 'Dr. Yang', 'Dr. Shepherd'];
export const DOSAGE_UNITS: string[] = [
    'mg/kg/h',
    'μg/kg/min',
    'UI/kg/h',
    'μg/kg/h',
    'UI/kg/min',
    'mg/h',
    'mg/dia',
];


export const PATIENTS: Patient[] = [
  { id: 1, name: 'ANNY VICTORIA SOARES DE SOUSA', bedNumber: 98, motherName: 'mãe', dob: '2021-06-28', ctd: 'intercorrencia', devices: devices1, exams: exams1, medications: medications1, surgeries: surgeries1, capdScales: capdScales1 },
  { id: 2, name: 'NATANAEL RIKELMY DE AGUIAR LIMA', bedNumber: 99, motherName: 'mãe', dob: '2012-06-20', ctd: 'observação', devices: [], exams: [], medications: [], surgeries: [], capdScales: [] },
  { id: 3, name: 'HEYTOR CONRADO SILVA', bedNumber: 100, motherName: 'mãe', dob: '2019-03-15', ctd: 'estável', devices: [], exams: [], medications: [], surgeries: [], capdScales: [] },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Sistema Nutricional', icon: AppleIcon },
  { id: 2, name: 'Hídrico', icon: DropletIcon },
  { id: 3, name: 'Hemodinâmico', icon: HeartPulseIcon },
  { id: 4, name: 'Hematológico', icon: BeakerIcon },
  { id: 5, name: 'Hepático', icon: LiverIcon },
  { id: 6, name: 'Respiratório', icon: LungsIcon },
  { id: 7, name: 'Fisioterapia', icon: DumbbellIcon },
  { id: 8, name: 'Neurológico', icon: BrainIcon },
  { id: 9, name: 'Farmácia', icon: PillIcon },
  { id: 10, name: 'Gerenciamento de Risco', icon: ShieldIcon },
  { id: 11, name: 'Família', icon: UsersIcon },
  { id: 12, name: 'Avaliação de Alta', icon: HomeIcon },
];

export const QUESTIONS: Question[] = [
  // Sistema Nutricional
  { id: 1, categoryId: 1, text: 'NUTRIÇÃO ADEQUADA? (INICIAR ORAL/ENTERAL/NPT)' },
  { id: 2, categoryId: 1, text: 'TOLERÂNCIA À ALIMENTAÇÃO (VÔMITOS)?' },
  { id: 3, categoryId: 1, text: 'RELATA DIARRÉIA OU CONSTIPAÇÃO?' },
  { id: 4, categoryId: 1, text: 'GLICEMIA CONTROLADA? (DX 60-150)' },
  { id: 5, categoryId: 1, text: 'NECESSIDADE DE PROFILAXIA PARA ÚLCERA DE ESTRESSE?' },
  { id: 6, categoryId: 1, text: 'NECESSIDADE DE CONTROLE DE RESÍDUO GÁSTRICO?' },
  { id: 7, categoryId: 1, text: 'FIXAÇÃO DE SNGE/SNE OK?' },
  { id: 8, categoryId: 1, text: 'NECESSIDADE DE RX DE ABDOMEN PARA CHECAR SONDA?' },
  // Hídrico
  { id: 9, categoryId: 2, text: 'HÁ SINAIS DE SOBRECARGA HÍDRICA CLÍNICA?' },
  { id: 10, categoryId: 2, text: 'BH POSITIVO >3% NAS ÚLTIMAS 24 HORAS?' },
  // Hemodinâmico
  { id: 11, categoryId: 3, text: 'APARELHO DE PANI ADEQUADO?' },
  // ... add more questions for other categories
];

export const ALERTS: Alert[] = [
    { id: 1, text: "PA instável", categoryId: 3, patientId: 1 },
    { id: 2, text: "Saturação baixa", categoryId: 6, patientId: 2 },
    { id: 3, text: "Pico hipertensivo", categoryId: 3, patientId: 1 },
    { id: 4, text: "Necessidade de ajuste de ventilação", categoryId: 6, patientId: 2 },
    { id: 5, text: "Glicemia alta", categoryId: 1, patientId: 3 },
    { id: 6, text: "Taquicardia", categoryId: 3, patientId: 2 },
    { id: 7, text: "Risco de queda", categoryId: 10, patientId: 1 },
    { id: 8, text: "Interação medicamentosa", categoryId: 9, patientId: 3 },
    { id: 9, text: "Esforço respiratório", categoryId: 6, patientId: 1 },
    { id: 10, text: "Balanço hídrico muito positivo", categoryId: 2, patientId: 2 },
    { id: 11, text: "Hipotensão", categoryId: 3, patientId: 3 },
    { id: 12, text: "Anemia importante", categoryId: 4, patientId: 1 },
];

export const TASKS: Task[] = [
    // Alertas
    ...ALERTS.map((alert, index) => ({
        id: index + 1,
        patientId: alert.patientId,
        categoryId: alert.categoryId,
        description: alert.text,
        responsible: 'Dr. João',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'alerta' as const,
    })),
    // Fora do Prazo
    { id: 13, patientId: 1, categoryId: 1, description: 'Reavaliar necessidade de SNE', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo', justification: 'Aguardando avaliação do nutricionista.' },
    { id: 14, patientId: 2, categoryId: 9, description: 'Checar interação medicamentosa', responsible: 'Farm. Ana', deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 15, patientId: 3, categoryId: 7, description: 'Iniciar fisioterapia motora', responsible: 'Fisio. Carlos', deadline: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 16, patientId: 1, categoryId: 10, description: 'Aplicar escala de Braden', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo', justification: 'Paciente instável hemodinamicamente.' },
    { id: 17, patientId: 2, categoryId: 8, description: 'Avaliação neurológica completa', responsible: 'Dr. João', deadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 18, patientId: 3, categoryId: 2, description: 'Ajustar balanço hídrico', responsible: 'Dr. João', deadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 19, patientId: 1, categoryId: 4, description: 'Coletar nova amostra de sangue', responsible: 'Téc. Lúcia', deadline: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 20, patientId: 2, categoryId: 5, description: 'Solicitar ultrassom hepático', responsible: 'Dr. João', deadline: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    // No Prazo
    { id: 21, patientId: 3, categoryId: 1, description: 'Monitorar glicemia capilar 4x/dia', responsible: 'Enf. Maria', deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), status: 'no_prazo' },
    { id: 22, patientId: 1, categoryId: 6, description: 'Realizar aspiração de vias aéreas se necessário', responsible: 'Fisio. Carlos', deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: 'no_prazo' },
    // Concluídos
    { id: 23, patientId: 2, categoryId: 10, description: 'Avaliar risco de lesão por pressão', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), status: 'concluido' },
];

export const RESPONSIBLES: string[] = [
    'Médico', 
    'Enfermeiro', 
    'Fisioterapeuta', 
    'Farmacêutico', 
    'Odontólogo', 
    'Médico / Enfermeiro', 
    'Médico / Fisioterapeuta'
];

export const ALERT_DEADLINES: string[] = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1;
    return `${hour} hora${hour > 1 ? 's' : ''}`;
});

export const INITIAL_USER: User = {
    name: 'Noemi',
    role: 'Médica',
    department: 'UTI Pediátrica',
    avatarUrl: 'https://i.pravatar.cc/150?u=noemi',
};