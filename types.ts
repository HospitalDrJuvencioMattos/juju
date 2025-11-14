import React from 'react';

export interface Device {
  id: number;
  name: string;
  location: string;
  startDate: string; // "YYYY-MM-DD"
  removalDate?: string; // "YYYY-MM-DD"
  isArchived?: boolean;
}

export interface Exam {
  id: number;
  name: string;
  date: string; // "YYYY-MM-DD"
  result: 'Pendente' | 'Normal' | 'Alterado';
  observation?: string;
  isArchived?: boolean;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  isArchived?: boolean;
}

export interface Surgery {
  id: number;
  name: string;
  surgeon: string;
  date: string; // "YYYY-MM-DD"
}

export interface CapdScale {
  id: number;
  date: string; // ISO String for date and time
  score: number;
}

export interface Patient {
  id: number;
  name: string;
  bedNumber: number;
  motherName: string;
  dob: string; // "YYYY-MM-DD"
  ctd: string;
  devices: Device[];
  exams: Exam[];
  medications: Medication[];
  surgeries: Surgery[];
  capdScales: CapdScale[];
}

export interface Category {
  id: number;
  name:string;
  icon?: React.FC<{className?: string;}>;
}

export interface Question {
  id: number;
  text: string;
  categoryId: number;
}

export type Answer = 'sim' | 'não' | 'nao_se_aplica';

export interface ChecklistAnswer {
  [questionId: number]: Answer;
}

export interface Alert {
  id: number;
  text: string;
  categoryId: number;
  patientId: number;
}

export type TaskStatus = 'alerta' | 'no_prazo' | 'fora_do_prazo' | 'concluido';

export interface Task {
  id: number;
  patientId: number;
  categoryId: number;
  description: string;
  responsible: string;
  deadline: string; // ISO String for date and time
  status: TaskStatus;
  justification?: string;
}

// --- USER & THEME ---
export interface User {
    name: string;
    role: string;
    department: string;
    avatarUrl: string;
}

export type Theme = 'light' | 'dark';


// --- CONTEXT TYPE DEFINITIONS ---

export interface TasksContextType {
  tasks: Task[];
  updateTaskJustification: (taskId: number, justification: string) => void;
  updateTaskStatus: (taskId: number, status: TaskStatus) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => void;
}

export interface PatientsContextType {
    patients: Patient[];
    addDeviceToPatient: (patientId: number, device: Omit<Device, 'id'>) => void;
    updateDeviceInPatient: (patientId: number, deviceData: Device) => void;
    addExamToPatient: (patientId: number, exam: Omit<Exam, 'id'>) => void;
    addMedicationToPatient: (patientId: number, medication: Omit<Medication, 'id'>) => void;
    updateMedicationInPatient: (patientId: number, medicationData: Medication) => void;
    addSurgeryToPatient: (patientId: number, surgery: Omit<Surgery, 'id'>) => void;
    updateSurgeryInPatient: (patientId: number, surgeryData: Surgery) => void;
    addRemovalDateToDevice: (patientId: number, deviceId: number, removalDate: string) => void;
    deleteDeviceFromPatient: (patientId: number, deviceId: number) => void;
    addEndDateToMedication: (patientId: number, medicationId: number, endDate: string) => void;
    deleteMedicationFromPatient: (patientId: number, medicationId: number) => void;
    updateExamInPatient: (patientId: number, examData: Pick<Exam, 'id' | 'observation' | 'date'>) => void;
    deleteExamFromPatient: (patientId: number, examId: number) => void;
    addCapdScaleToPatient: (patientId: number, scaleData: Omit<CapdScale, 'id'>) => void;
}

// --- NOTIFICATION TYPES ---
export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (notification: NotificationState) => void;
  hideNotification: () => void;
}

export interface UserContextType {
    user: User;
    updateUser: (userData: Partial<User>) => void;
}

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}