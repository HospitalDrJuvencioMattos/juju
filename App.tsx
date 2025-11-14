





import React, { useState, useMemo, useContext, useEffect, createContext, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams, useLocation, Outlet, NavLink } from 'react-router-dom';
import { Patient, Category, Question, ChecklistAnswer, Answer, Device, Exam, Medication, Task, TaskStatus, PatientsContextType, TasksContextType, NotificationState, NotificationContextType, User, UserContextType, Theme, ThemeContextType, Surgery, CapdScale } from './types';
import { PATIENTS as initialPatients, CATEGORIES, QUESTIONS, TASKS as initialTasks, DEVICE_TYPES, DEVICE_LOCATIONS, EXAM_STATUSES, RESPONSIBLES, ALERT_DEADLINES, INITIAL_USER, SURGEON_NAMES, DOSAGE_UNITS } from './constants';
import { BackArrowIcon, PlusIcon, WarningIcon, ClockIcon, AlertIcon, CheckCircleIcon, BedIcon, UserIcon, PencilIcon, BellIcon, InfoIcon, EyeOffIcon, ClipboardIcon, FileTextIcon, LogOutIcon, ChevronRightIcon, MenuIcon, DashboardIcon, CpuIcon, PillIcon, BarChartIcon, AppleIcon, DropletIcon, HeartPulseIcon, BeakerIcon, LiverIcon, LungsIcon, DumbbellIcon, BrainIcon, ShieldIcon, UsersIcon, HomeIcon, CloseIcon, SettingsIcon, CameraIcon, ScalpelIcon, SearchIcon } from './components/icons';

// --- CONTEXT for Global State ---
const TasksContext = createContext<TasksContextType | null>(null);
const PatientsContext = createContext<PatientsContextType | null>(null);
const NotificationContext = createContext<NotificationContextType | null>(null);
const UserContext = createContext<UserContextType | null>(null);
const ThemeContext = createContext<ThemeContextType | null>(null);


// --- LOCAL STORAGE HELPERS for checklist completion ---

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getCompletedChecklists = (): Record<string, Record<string, number[]>> => {
  try {
    const data = localStorage.getItem('completedChecklists');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to parse completed checklists from localStorage", error);
    return {};
  }
};

const saveCompletedChecklists = (data: Record<string, Record<string, number[]>>) => {
  try {
    localStorage.setItem('completedChecklists', JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save completed checklists to localStorage", error);
  }
};

const getCompletedCategoriesForPatient = (patientId: string): number[] => {
  const today = getTodayDateString();
  const allCompleted = getCompletedChecklists();
  return allCompleted[patientId]?.[today] || [];
};

const markCategoryAsCompletedForPatient = (patientId: string, categoryId: number) => {
  const today = getTodayDateString();
  const allCompleted = getCompletedChecklists();
  
  if (!allCompleted[patientId]) {
    allCompleted[patientId] = {};
  }
  if (!allCompleted[patientId][today]) {
    allCompleted[patientId][today] = [];
  }

  if (!allCompleted[patientId][today].includes(categoryId)) {
    allCompleted[patientId][today].push(categoryId);
  }

  saveCompletedChecklists(allCompleted);
};


// --- LAYOUT & NAVIGATION ---

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext)!;
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/patients', label: 'Leitos', icon: BedIcon },
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <ClipboardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Round Juju</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition ${
                                isActive 
                                    ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                     <img src={user.avatarUrl} alt="User avatar" className="w-12 h-12 rounded-full object-cover"/>
                     <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                     </div>
                </div>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                    <LogOutIcon className="w-5 h-5"/>
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

interface HeaderContextType {
    setTitle: (title: string) => void;
}
const HeaderContext = React.createContext<HeaderContextType | null>(null);

const useHeader = (title: string) => {
    const context = useContext(HeaderContext);
    useEffect(() => {
        if (context) {
            context.setTitle(title);
        }
        return () => {
            if (context) {
                context.setTitle('');
            }
        };
    }, [context, title]);
};

const Header: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getBackPath = (): string | number => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts.length > 1) {
            if(pathParts[0] === 'status') {
                return '/dashboard';
            }
            if(pathParts[2] === 'history') {
                return `/patient/${pathParts[1]}`;
            }
            if(pathParts.includes('create-alert')) {
                 if(pathParts.includes('category')) {
                    const fromQuestionIndex = location.state?.fromQuestionIndex;
                    if (fromQuestionIndex !== undefined) {
                        return `/patient/${pathParts[1]}/round/category/${pathParts[3]}?question=${fromQuestionIndex}`;
                    }
                    return `/patient/${pathParts[1]}/round/category/${pathParts[3]}`; // Go back to checklist
                 }
                 return `/patient/${pathParts[1]}`; // Go back to patient detail
            }
            if (pathParts.includes('category')) {
                return `/patient/${pathParts[1]}/round/categories`;
            }
            if (pathParts.includes('categories')) {
                return `/patient/${pathParts[1]}`;
            }
            if (pathParts[0] === 'patient') {
                return '/patients';
            }
        }
         if (location.pathname === '/patients' || location.pathname === '/settings' || location.pathname === '/dashboard') {
             return '/dashboard';
         }
        return -1;
    };
    
    const backPath = getBackPath();
    const showBackButton = backPath !== -1 && location.pathname !== '/dashboard';

    return (
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 flex items-center shrink-0">
             <button
                onClick={showBackButton ? () => (typeof backPath === 'string' ? navigate(backPath, { state: location.state }) : navigate(-1)) : onMenuClick}
                className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mr-2 lg:hidden"
            >
                {showBackButton ? <BackArrowIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <div className="hidden lg:block mr-4">
                 {showBackButton && (
                    <button onClick={() => typeof backPath === 'string' ? navigate(backPath, { state: location.state }) : navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition">
                        <BackArrowIcon className="w-6 h-6" />
                    </button>
                 )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">{title}</h1>
        </header>
    );
};


const AppLayout: React.FC = () => {
    const [title, setTitle] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const contextValue = useMemo(() => ({ setTitle }), []);
    const { notification, hideNotification } = useContext(NotificationContext)!;
    
    // Refs for swipe gesture handling
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 75;

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    // Touch event handlers for mobile sidebar swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null; // Reset on new touch
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    
    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // Swipe right to open menu
        if (isRightSwipe && !isSidebarOpen && touchStartX.current < 50) { // Only trigger if swipe starts near the edge
            setSidebarOpen(true);
        }
        
        // Swipe left to close menu
        if (isLeftSwipe && isSidebarOpen) {
            setSidebarOpen(false);
        }

        // Reset refs
        touchStartX.current = null;
        touchEndX.current = null;
    };


    return (
        <HeaderContext.Provider value={contextValue}>
            <div 
                className="flex h-screen bg-slate-50 dark:bg-slate-950" 
                onTouchStart={handleTouchStart} 
                onTouchMove={handleTouchMove} 
                onTouchEnd={handleTouchEnd}
            >
                {/* Mobile Sidebar */}
                <div className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
                <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                </div>
                
                {/* Desktop Sidebar */}
                <div className="hidden lg:flex lg:shrink-0">
                    <Sidebar />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                    <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        { location.pathname.includes('/round/category/') || location.pathname.includes('create-alert') ? <Outlet/> :
                            <div className="max-w-4xl mx-auto">
                                <Outlet />
                            </div>
                        }
                    </main>
                </div>
            </div>
            {notification && (
                 <Notification message={notification.message} type={notification.type} onClose={hideNotification} />
            )}
        </HeaderContext.Provider>
    );
};

// --- Notification Component ---
const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: <CheckCircleIcon className="w-6 h-6 text-white" />,
        error: <WarningIcon className="w-6 h-6 text-white" />,
        info: <InfoIcon className="w-6 h-6 text-white" />,
    }[type];

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-notification-in`}>
            {icon}
            <span className="ml-3 font-semibold">{message}</span>
        </div>
    );
};

// --- SCREENS ---

const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, any input allows login
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-sm w-full m-4">
                <div className="text-center mb-8">
                    <ClipboardIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Bem-vindo de volta!</h1>
                    <p className="text-slate-500 dark:text-slate-400">Faça login para continuar.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

const DashboardScreen: React.FC = () => {
    useHeader('Dashboard');
    const navigate = useNavigate();
    const { tasks } = useContext(TasksContext)!;

    const summaryData = useMemo(() => {
        const counts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);
        return [
            { title: 'Alertas', count: counts.alerta || 0, icon: WarningIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', status: 'alerta' },
            { title: 'No Prazo', count: counts.no_prazo || 0, icon: ClockIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50', status: 'no_prazo' },
            { title: 'Fora do Prazo', count: counts.fora_do_prazo || 0, icon: AlertIcon, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/50', status: 'fora_do_prazo' },
            { title: 'Concluídos', count: counts.concluido || 0, icon: CheckCircleIcon, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50', status: 'concluido' },
        ];
    }, [tasks]);

    const alertChartData = useMemo(() => {
        // Fix: Refactored the reduce call to a for...of loop to avoid type inference issues.
        const counts: Record<string, number> = {};
        for (const task of tasks.filter(t => t.status === 'alerta')) {
            counts[task.categoryId] = (counts[task.categoryId] || 0) + 1;
        }

        const sorted = (Object.entries(counts) as [string, number][]).sort(([, countA], [, countB]) => countB - countA);
        const maxCount = Math.max(...sorted.map(([, count]) => count), 0);
        
        return sorted.map(([categoryId, count]) => {
            const category = CATEGORIES.find(c => c.id === Number(categoryId));
            return {
                name: category?.name || 'Desconhecido',
                count,
                percentage: maxCount > 0 ? (count / maxCount) * 100 : 0,
            };
        });
    }, [tasks]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Resumo do Dia</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summaryData.map(item => (
                        <div key={item.title} onClick={() => navigate(`/status/${item.status}`)} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center space-y-2">
                            <div className={`p-3 rounded-full ${item.bgColor}`}>
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.title}</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Alertas por Categoria</h2>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                    {alertChartData.length > 0 ? (
                        <div className="space-y-4">
                            {alertChartData.map(item => (
                                <div key={item.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum alerta hoje.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PatientListScreen: React.FC = () => {
    useHeader('Leitos');
    const { patients } = useContext(PatientsContext)!;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        return patients.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.bedNumber.toString().includes(searchTerm)
        );
    }, [patients, searchTerm]);
    
    const calculateProgress = (patientId: number) => {
        const completed = getCompletedCategoriesForPatient(patientId.toString());
        return (completed.length / CATEGORIES.length) * 100;
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome ou leito..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                />
            </div>
            <div className="space-y-3">
                {filteredPatients.map(patient => {
                     const progress = calculateProgress(patient.id);
                     return(
                        <Link to={`/patient/${patient.id}`} key={patient.id} className="block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg">
                                    {patient.bedNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 break-words">{patient.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nasc: {new Date(patient.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                        </Link>
                     );
                })}
            </div>
        </div>
    );
};

const formatHistoryDate = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    const [year, month, day] = dateString.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    const displayDate = new Date(dateString + 'T00:00:00');

    if (eventDate.getTime() === today.getTime()) {
        return `Hoje, ${displayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`;
    }
    if (eventDate.getTime() === yesterday.getTime()) {
        return `Ontem, ${displayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`;
    }
    return displayDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const PatientHistoryScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients } = useContext(PatientsContext)!;
    const { tasks } = useContext(TasksContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader(patient ? `Histórico: ${patient.name}` : 'Histórico do Paciente');

    type TimelineEvent = {
        timestamp: string;
        icon: React.FC<{className?: string;}>;
        description: string;
        hasTime: boolean;
    };

    const patientHistory = useMemo(() => {
        if (!patient) return {};

        const events: TimelineEvent[] = [];

        patient.devices.forEach(device => {
            events.push({
                timestamp: new Date(device.startDate + 'T00:00:00').toISOString(),
                icon: CpuIcon,
                description: `Dispositivo Inserido: ${device.name} em ${device.location}.`,
                hasTime: false,
            });
            if (device.removalDate) {
                events.push({
                    timestamp: new Date(device.removalDate + 'T00:00:00').toISOString(),
                    icon: CpuIcon,
                    description: `Dispositivo Retirado: ${device.name}.`,
                    hasTime: false,
                });
            }
        });
        
        patient.surgeries.forEach(surgery => {
            events.push({
                timestamp: new Date(surgery.date + 'T00:00:00').toISOString(),
                icon: ScalpelIcon,
                description: `Cirurgia Realizada: ${surgery.name} por ${surgery.surgeon}.`,
                hasTime: false,
            });
        });

        patient.medications.forEach(med => {
            events.push({
                timestamp: new Date(med.startDate + 'T00:00:00').toISOString(),
                icon: PillIcon,
                description: `Início Medicação: ${med.name} (${med.dosage}).`,
                hasTime: false,
            });
            if (med.endDate) {
                events.push({
                    timestamp: new Date(med.endDate + 'T00:00:00').toISOString(),
                    icon: PillIcon,
                    description: `Fim Medicação: ${med.name}.`,
                    hasTime: false,
                });
            }
        });

        patient.exams.forEach(exam => {
            events.push({
                timestamp: new Date(exam.date + 'T00:00:00').toISOString(),
                icon: FileTextIcon,
                description: `Exame Realizado: ${exam.name} - Resultado: ${exam.result}.`,
                hasTime: false,
            });
        });

        patient.capdScales.forEach(scale => {
            events.push({
                timestamp: scale.date,
                icon: BarChartIcon,
                description: `Avaliação CAP-D realizada: Pontuação ${scale.score}.`,
                hasTime: true,
            });
        });

        const patientAlerts = tasks.filter(task => task.patientId === patient.id && task.status === 'alerta');
        patientAlerts.forEach(alert => {
            events.push({
                timestamp: alert.deadline,
                icon: BellIcon,
                description: `Alerta Criado: ${alert.description}.`,
                hasTime: true,
            });
        });
        
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const groupedEvents = events.reduce((acc, event) => {
            const dateKey = event.timestamp.split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);
        
        return groupedEvents;
    }, [patient, tasks]);

    const handleGeneratePdf = () => {
        if (!patient) return;
        
        const activeAlerts = tasks.filter(task => task.patientId === patient.id && task.status === 'alerta');

        const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

        const generateDeviceList = () => patient.devices.filter(d => !d.isArchived).map(d => `
            <li>
                <strong>${d.name} (${d.location})</strong><br>
                Início: ${formatDate(d.startDate)}
                ${d.removalDate ? `<br>Retirada: ${formatDate(d.removalDate)}` : ''}
            </li>
        `).join('');

        const generateMedicationList = () => patient.medications.filter(m => !m.isArchived).map(m => `
            <li>
                <strong>${m.name} (${m.dosage})</strong><br>
                Início: ${formatDate(m.startDate)}
                ${m.endDate ? `<br>Fim: ${formatDate(m.endDate)}` : ''}
            </li>
        `).join('');
        
        const generateExamList = () => patient.exams.filter(e => !e.isArchived).map(e => `
            <li>
                <strong>${e.name}</strong> - Resultado: ${e.result}<br>
                Data: ${formatDate(e.date)}
                ${e.observation ? `<br><em>Obs: ${e.observation}</em>` : ''}
            </li>
        `).join('');
        
        const generateSurgeryList = () => patient.surgeries.map(s => `
            <li>
                <strong>${s.name}</strong> - Dr(a). ${s.surgeon}<br>
                Data: ${formatDate(s.date)}
            </li>
        `).join('');

        const generateCapdScaleList = () => patient.capdScales.map(s => `
            <li>
                <strong>Pontuação: ${s.score}</strong><br>
                Data: ${new Date(s.date).toLocaleString('pt-BR')}
            </li>
        `).join('');
        
        const generateAlertList = () => activeAlerts.map(a => `
             <li>
                <strong>${a.description}</strong><br>
                Responsável: ${a.responsible} <br>
                Prazo: ${new Date(a.deadline).toLocaleString('pt-BR')}
            </li>
        `).join('');

        const generateHistoryList = () => Object.entries(patientHistory).map(([date, eventsOnDate]) => `
            <div class="history-group">
                <h3>${formatHistoryDate(date)}</h3>
                <ul>
                    ${(eventsOnDate as TimelineEvent[]).map(event => `
                        <li>
                            ${event.hasTime ? `[${new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] ` : ''}
                            ${event.description}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        const htmlContent = `
            <html>
            <head>
                <title>Relatório do Paciente - ${patient.name}</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; color: #333; }
                    h1, h2, h3 { color: #00796b; border-bottom: 2px solid #e0f2f1; padding-bottom: 5px; }
                    h1 { font-size: 24px; }
                    h2 { font-size: 20px; margin-top: 30px; }
                    h3 { font-size: 16px; margin-top: 20px; border-bottom: 1px solid #e0f2f1; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #e0f2f1; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { background-color: #f7f7f7; border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 4px; }
                    .history-group ul { padding-left: 20px; }
                    .history-group li { background-color: transparent; border: none; padding: 5px 0; margin-bottom: 0; border-bottom: 1px dotted #ccc; }
                    .section-empty { color: #888; font-style: italic; }
                </style>
            </head>
            <body>
                <h1>Relatório do Paciente</h1>
                
                <h2>Dados do Paciente</h2>
                <table>
                    <tr><th>Nome</th><td>${patient.name}</td></tr>
                    <tr><th>Leito</th><td>${patient.bedNumber}</td></tr>
                    <tr><th>Nascimento</th><td>${formatDate(patient.dob)}</td></tr>
                    <tr><th>Nome da Mãe</th><td>${patient.motherName}</td></tr>
                    <tr><th>CTD</th><td>${patient.ctd}</td></tr>
                </table>

                <h2>Alertas Ativos</h2>
                ${activeAlerts.length > 0 ? `<ul>${generateAlertList()}</ul>` : '<p class="section-empty">Nenhum alerta ativo.</p>'}

                <h2>Dispositivos</h2>
                ${patient.devices.filter(d => !d.isArchived).length > 0 ? `<ul>${generateDeviceList()}</ul>` : '<p class="section-empty">Nenhum dispositivo ativo.</p>'}
                
                <h2>Medicações</h2>
                ${patient.medications.filter(m => !m.isArchived).length > 0 ? `<ul>${generateMedicationList()}</ul>` : '<p class="section-empty">Nenhuma medicação ativa.</p>'}

                <h2>Exames</h2>
                ${patient.exams.filter(e => !e.isArchived).length > 0 ? `<ul>${generateExamList()}</ul>` : '<p class="section-empty">Nenhum exame recente.</p>'}

                <h2>Cirurgias</h2>
                ${patient.surgeries.length > 0 ? `<ul>${generateSurgeryList()}</ul>` : '<p class="section-empty">Nenhuma cirurgia registrada.</p>'}
                
                <h2>Escala CAP-D</h2>
                ${patient.capdScales.length > 0 ? `<ul>${generateCapdScaleList()}</ul>` : '<p class="section-empty">Nenhuma avaliação registrada.</p>'}

                <h2>Histórico de Eventos</h2>
                ${generateHistoryList()}

            </body>
            </html>
        `;

        const pdfWindow = window.open('', '_blank');
        if (pdfWindow) {
            pdfWindow.document.write(htmlContent);
            pdfWindow.document.close();
            pdfWindow.focus();
            setTimeout(() => {
                pdfWindow.print();
            }, 500);
        } else {
            alert('Por favor, habilite pop-ups para gerar o PDF.');
        }
    };


    if (!patient) {
        return <p>Paciente não encontrado.</p>;
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                 <button
                    onClick={handleGeneratePdf}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                 >
                    <FileTextIcon className="w-5 h-5" />
                    Gerar PDF
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                {Object.keys(patientHistory).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(patientHistory).map(([date, eventsOnDate]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">{formatHistoryDate(date)}</h3>
                                <div className="space-y-3">
                                    {(eventsOnDate as TimelineEvent[]).map((event, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 rounded-full mt-1">
                                                <event.icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-800 dark:text-slate-200 text-sm">{event.description}</p>
                                                {event.hasTime && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum histórico de eventos para este paciente.</p>
                )}
            </div>
        </div>
    );
};

const CapdScaleCalculator: React.FC<{ patientId: number }> = ({ patientId }) => {
    type Screen = 'lista' | 'form' | 'resultado';
    const [screen, setScreen] = useState<Screen>('lista');
    const { patients, addCapdScaleToPatient } = useContext(PatientsContext)!;
    
    const patient = patients.find(p => p.id === patientId);

    const scaleItems = [
        'Estado de Consciência',
        'Atenção',
        'Conforto / Agitação',
        'Movimentos',
        'Tônus Muscular',
        'Expressão Facial',
        'Ciclo Sono–Vigília',
        'Interação com Ambiente'
    ];

    const scaleItemDetails = {
        'Estado de Consciência': [
            { value: 0, label: '0: Alerta adequado' },
            { value: 1, label: '1: Sonolento mas desperta' },
            { value: 2, label: '2: Hipoalerta' },
            { value: 3, label: '3: Letárgico' },
            { value: 4, label: '4: Muito rebaixado' },
        ],
        'Atenção': [
            { value: 0, label: '0: Normal' },
            { value: 1, label: '1: Levemente desatento' },
            { value: 2, label: '2: Moderadamente desatento' },
            { value: 3, label: '3: Gravemente desatento' },
            { value: 4, label: '4: Não responde' },
        ],
        'Conforto / Agitação': [
            { value: 0, label: '0: Confortável' },
            { value: 1, label: '1: Inquieto' },
            { value: 2, label: '2: Agitado' },
            { value: 3, label: '3: Muito agitado' },
            { value: 4, label: '4: Agitação perigosa' },
        ],
        'Movimentos': [
            { value: 0, label: '0: Normais' },
            { value: 1, label: '1: Movimentos diminuídos' },
            { value: 2, label: '2: Movimentos anormais leves' },
            { value: 3, label: '3: Movimentos anormais moderados' },
            { value: 4, label: '4: Movimentos anormais graves' },
        ],
        'Tônus Muscular': [
            { value: 0, label: '0: Normal' },
            { value: 1, label: '1: Hipotonia leve' },
            { value: 2, label: '2: Hipertonia/Hipotonia moderada' },
            { value: 3, label: '3: Hipertonia/Hipotonia grave' },
            { value: 4, label: '4: Flácido / Rígido' },
        ],
        'Expressão Facial': [
            { value: 0, label: '0: Normal' },
            { value: 1, label: '1: Expressão diminuída' },
            { value: 2, label: '2: Expressão ausente' },
            { value: 3, label: '3: Caretas leves' },
            { value: 4, label: '4: Caretas graves / face paralisada' },
        ],
        'Ciclo Sono–Vigília': [
            { value: 0, label: '0: Normal' },
            { value: 1, label: '1: Sonolência diurna leve' },
            { value: 2, label: '2: Sonolência diurna/Insônia noturna' },
            { value: 3, label: '3: Ciclo invertido' },
            { value: 4, label: '4: Fragmentado / Inexistente' },
        ],
        'Interação com Ambiente': [
            { value: 0, label: '0: Apropriada' },
            { value: 1, label: '1: Interação diminuída' },
            { value: 2, label: '2: Interação inapropriada' },
            { value: 3, label: '3: Sem interação' },
            { value: 4, label: '4: Não responsivo' },
        ],
    };
    
    const initialScores = scaleItems.reduce((acc, item) => {
        acc[item] = 0;
        return acc;
    }, {} as Record<string, number>);

    const [scores, setScores] = useState<Record<string, number>>(initialScores);
    const [totalScore, setTotalScore] = useState<number | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const lastEvaluation = useMemo(() => {
        if (!patient?.capdScales || patient.capdScales.length === 0) {
            return null;
        }
        return patient.capdScales.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [patient]);
    
    const lastEvaluationScore = lastEvaluation ? lastEvaluation.score : null;

    const handleScoreChange = (item: string, value: string) => {
        setScores(prev => ({ ...prev, [item]: parseInt(value, 10) }));
        setTouched(prev => ({...prev, [item]: true}));
    };

    const handleCalculate = () => {
        const sum = Object.values(scores).reduce((acc: number, current: number) => acc + current, 0);
        setTotalScore(sum);
        setScreen('resultado');
    };
    
    const handleSaveAndClose = () => {
        if (totalScore !== null) {
            addCapdScaleToPatient(patientId, { date: new Date().toISOString(), score: totalScore });
        }
        setScores(initialScores);
        setTotalScore(null);
        setTouched({});
        setScreen('lista');
    };

    const sedationResult = useMemo(() => {
        const score = screen === 'lista' ? lastEvaluationScore : totalScore;
        if (score === null) return null;

        if (score <= 10) return { 
            title: 'Sedação profunda', 
            subtitle: 'Acima do alvo na maioria dos casos', 
            color: 'text-red-600 dark:text-red-400',
            iconColor: 'bg-red-500'
        };
        if (score >= 11 && score <= 16) return { 
            title: 'Alvo de sedação leve/moderada', 
            subtitle: 'UTI pediátrica padrão', 
            color: 'text-green-600 dark:text-green-400',
            iconColor: 'bg-green-500'
        };
        if (score >= 17) return { 
            title: 'Sub-sedação / dor / agitação', 
            subtitle: 'Avaliar dor, delirium, desconforto', 
            color: 'text-orange-600 dark:text-orange-400',
            iconColor: 'bg-orange-500'
        };
        return null;
    }, [totalScore, lastEvaluationScore, screen]);

    const deliriumResult = useMemo(() => {
        const score = screen === 'lista' ? lastEvaluationScore : totalScore;
        if (score === null) return null;
        
        if (score >= 16) return { text: 'Delirium provável', color: 'text-red-600 dark:text-red-400', iconType: WarningIcon };
        if (score >= 9) return { text: 'Alto risco de delirium', color: 'text-yellow-600 dark:text-yellow-400', iconType: WarningIcon };
        if (score <= 8) return { text: 'Baixo risco de delirium', color: 'text-green-600 dark:text-green-400', iconType: CheckCircleIcon };
        return null;
    }, [totalScore, lastEvaluationScore, screen]);


    if (screen === 'lista') {
        return (
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm text-center">
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-gray-300 mb-2">ÚLTIMA AVALIAÇÃO CAP-D</h3>
                    {lastEvaluationScore !== null ? (
                        <>
                            <p className="text-5xl font-bold text-slate-800 dark:text-white my-4">{lastEvaluationScore}</p>
                            <div className="grid grid-cols-1 gap-4">
                                {sedationResult && (
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${sedationResult.iconColor}`}></div>
                                                <p className={`font-semibold ${sedationResult.color}`}>{sedationResult.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{sedationResult.subtitle}</p>
                                        </div>
                                    </div>
                                )}
                                {deliriumResult && (
                                     <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                        <div className="flex items-center justify-center gap-2">
                                            <deliriumResult.iconType className={`w-5 h-5 ${deliriumResult.color}`} />
                                            <p className={`font-semibold ${deliriumResult.color}`}>{deliriumResult.text}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                         <p className="text-slate-500 dark:text-gray-400 my-10">Nenhuma avaliação registrada ainda.</p>
                    )}
                </div>
                <button
                    onClick={() => setScreen('form')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg"
                >
                    Registrar Nova Avaliação CAP-D
                </button>
            </div>
        );
    }

    if (screen === 'form') {
        return (
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setScreen('lista')} className="p-2 -ml-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition">
                            <BackArrowIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nova Avaliação CAP-D</h2>
                    </div>
                    {patient && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-10">Paciente: {patient.name}</p>}
                </div>

                <div className="space-y-3">
                    {scaleItems.map((item, index) => {
                        const options = scaleItemDetails[item as keyof typeof scaleItemDetails];
                        return (
                            <div key={item} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                                <label className="flex items-center justify-between font-medium text-slate-700 dark:text-gray-300 mb-2">
                                    <span>{`${index + 1}. ${item}`}</span>
                                    {touched[item] && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                </label>
                                <select
                                    value={scores[item]}
                                    onChange={(e) => handleScoreChange(item, e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={handleCalculate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg !mt-6"
                >
                    Calcular Pontuação
                </button>
            </div>
        );
    }
    
    if (screen === 'resultado') {
        return (
            <div className="space-y-6">
                 <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setScreen('form')} className="p-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition">
                        <BackArrowIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Resultado da Avaliação</h2>
                </div>
                <div className="text-center">
                    <p className="text-8xl font-bold text-slate-800 dark:text-white">{totalScore}</p>
                </div>
                 <div className="space-y-4">
                    {sedationResult && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${sedationResult.iconColor}`}></div>
                                    <p className={`text-lg font-semibold ${sedationResult.color}`}>{sedationResult.title}</p>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{sedationResult.subtitle}</p>
                            </div>
                        </div>
                    )}
                    {deliriumResult && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-2">
                                <deliriumResult.iconType className={`w-5 h-5 ${deliriumResult.color}`} />
                                <p className={`text-lg font-semibold ${deliriumResult.color}`}>{deliriumResult.text}</p>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSaveAndClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg mt-4"
                >
                    Salvar e Fechar
                </button>
            </div>
        );
    }

    return null;
}

const EditSurgeryModal: React.FC<{ surgery: Surgery; patientId: number; onClose: () => void;}> = ({ surgery, patientId, onClose }) => {
    const { updateSurgeryInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    
    const [name, setName] = useState(surgery.name);
    const [surgeon, setSurgeon] = useState(surgery.surgeon);
    const [date, setDate] = useState(surgery.date);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !surgeon || !date) return;
        updateSurgeryInPatient(patientId, { ...surgery, name, surgeon, date });
        showNotification({ message: 'Cirurgia atualizada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Cirurgia</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Cirurgia</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cirurgião</label>
                        <select value={surgeon} onChange={e => setSurgeon(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {SURGEON_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Cirurgia</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const PatientDetailScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, addRemovalDateToDevice, deleteDeviceFromPatient, addEndDateToMedication, deleteExamFromPatient, deleteMedicationFromPatient } = useContext(PatientsContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);
    
    useHeader(patient ? patient.name : 'Paciente não encontrado');

    const [activeTab, setActiveTab] = useState<'devices' | 'exams' | 'medications' | 'surgeries' | 'scales'>('medications');
    const [isAddDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [isAddExamModalOpen, setAddExamModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [isAddMedicationModalOpen, setAddMedicationModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [isAddSurgeryModalOpen, setAddSurgeryModalOpen] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState<number | null>(null);
    const [isEndDateModalOpen, setEndDateModalOpen] = useState<number | null>(null);

    const { showNotification } = useContext(NotificationContext)!;

    if (!patient) {
        return <p>Paciente não encontrado.</p>;
    }
    
    const handleDeleteDevice = (patientId: number, deviceId: number) => {
        deleteDeviceFromPatient(patientId, deviceId);
        showNotification({ message: 'Dispositivo arquivado, mantido no histórico.', type: 'info' });
    };

    const handleDeleteExam = (patientId: number, examId: number) => {
        deleteExamFromPatient(patientId, examId);
        showNotification({ message: 'Exame arquivado com sucesso.', type: 'info' });
    };

    const handleDeleteMedication = (patientId: number, medicationId: number) => {
        deleteMedicationFromPatient(patientId, medicationId);
        showNotification({ message: 'Medicação arquivada com sucesso.', type: 'info' });
    };

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateDays = (startDate: string) => {
        const start = new Date(startDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        if (start > today) {
            return 0;
        }
        const diffTime = today.getTime() - start.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const tabs = [
        { id: 'devices', label: 'Dispositivos', icon: CpuIcon },
        { id: 'exams', label: 'Exames', icon: FileTextIcon },
        { id: 'medications', label: 'Medicações', icon: PillIcon },
        { id: 'surgeries', label: 'Cirúrgico', icon: ScalpelIcon },
        { id: 'scales', label: 'Escalas', icon: BarChartIcon },
    ];
    
    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{patient.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    <span>{calculateAge(patient.dob)} anos</span>
                    <span>Mãe: {patient.motherName}</span>
                    <span>CTD: {patient.ctd}</span>
                </div>
            </div>

            <Link to={`/patient/${patient.id}/history`} className="w-full block text-center bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-4 rounded-lg transition text-md">
                <div className="flex items-center justify-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    Ver Histórico Completo
                </div>
            </Link>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="-mb-px overflow-x-auto no-scrollbar whitespace-nowrap px-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-5 text-center font-semibold inline-flex items-center justify-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                <tab.icon className="w-5 h-5"/>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-4 space-y-3">
                    {activeTab === 'devices' && (
                        <>
                            {patient.devices.filter(device => !device.isArchived).map(device => (
                                <div key={device.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <CpuIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{device.name} - {device.location}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Início: {new Date(device.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                {device.removalDate ? (
                                                     <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Retirada: {new Date(device.removalDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                ) : (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(device.startDate)}</p>
                                                )}
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                            {!device.removalDate ? (
                                                <>
                                                    <button onClick={() => setEditingDevice(device)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar dispositivo">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setRemovalModalOpen(device.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleDeleteDevice(patient.id, device.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Apagar dispositivo">
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                         </div>
                                     </div>
                                </div>
                            ))}
                             <button onClick={() => setAddDeviceModalOpen(true)} className="w-full mt-3 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-3 rounded-lg transition">Cadastrar Dispositivo</button>
                        </>
                    )}
                     {activeTab === 'exams' && (
                        <>
                            {patient.exams.filter(exam => !exam.isArchived).map(exam => (
                                <div key={exam.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{exam.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Data: {new Date(exam.date + 'T00:00:00').toLocaleDateString('pt-BR')} - {exam.result}</p>
                                                {exam.observation && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {exam.observation}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            <button onClick={() => setEditingExam(exam)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar exame">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteExam(patient.id, exam.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar exame">
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                     </div>
                                </div>
                            ))}
                            <button onClick={() => setAddExamModalOpen(true)} className="w-full mt-3 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-3 rounded-lg transition">Cadastrar Exame</button>
                        </>
                    )}
                     {activeTab === 'medications' && (
                        <>
                            {patient.medications.filter(medication => !medication.isArchived).map(medication => (
                                <div key={medication.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <PillIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{medication.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{medication.dosage}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Início: {new Date(medication.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                 {medication.endDate && (
                                                     <p className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Fim: {new Date(medication.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                 )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            {!medication.endDate && (
                                                <button onClick={() => setEndDateModalOpen(medication.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Suspender</button>
                                            )}
                                            <button onClick={() => setEditingMedication(medication)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar medicação">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteMedication(patient.id, medication.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar medicação">
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setAddMedicationModalOpen(true)} className="w-full mt-3 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-3 rounded-lg transition">Prescrever Medicação</button>
                        </>
                    )}
                    {activeTab === 'surgeries' && (
                         <>
                            {patient.surgeries.map(surgery => (
                                <div key={surgery.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <ScalpelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{surgery.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Data: {new Date(surgery.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Cirurgião(ã): {surgery.surgeon}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            <button onClick={() => setEditingSurgery(surgery)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar cirurgia">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setAddSurgeryModalOpen(true)} className="w-full mt-3 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-3 rounded-lg transition">Cadastrar Cirurgia</button>
                         </>
                    )}
                    {activeTab === 'scales' && <CapdScaleCalculator patientId={patient.id} />}
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                 <Link to={`/patient/${patient.id}/round/categories`} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg">
                    <ClipboardIcon className="w-6 h-6"/>
                    <span>Iniciar Round</span>
                </Link>
                <Link to={`/patient/${patient.id}/create-alert`} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition text-lg">
                    <BellIcon className="w-6 h-6"/>
                    <span>Criar Alerta</span>
                </Link>
            </div>
            
             {isRemovalModalOpen && (
                <DateInputModal 
                    title="Registrar Retirada de Dispositivo"
                    onClose={() => setRemovalModalOpen(null)}
                    onSave={(date) => {
                        addRemovalDateToDevice(patient.id, isRemovalModalOpen, date);
                        setRemovalModalOpen(null);
                        showNotification({ message: 'Retirada registrada!', type: 'success' });
                    }}
                />
            )}
            {isEndDateModalOpen && (
                <DateInputModal 
                    title="Suspender Medicação"
                    onClose={() => setEndDateModalOpen(null)}
                    onSave={(date) => {
                        addEndDateToMedication(patient.id, isEndDateModalOpen, date);
                        setEndDateModalOpen(null);
                        showNotification({ message: 'Medicação suspensa!', type: 'success' });
                    }}
                />
            )}
            
            {editingDevice && <AddDeviceModal isOpen={!!editingDevice} onClose={() => setEditingDevice(null)} patientId={patient.id} deviceToEdit={editingDevice} />}
            {isAddDeviceModalOpen && <AddDeviceModal isOpen={isAddDeviceModalOpen} onClose={() => setAddDeviceModalOpen(false)} patientId={patient.id} />}
            
            {editingExam && <AddExamModal isOpen={!!editingExam} onClose={() => setEditingExam(null)} patientId={patient.id} examToEdit={editingExam} />}
            {isAddExamModalOpen && <AddExamModal isOpen={isAddExamModalOpen} onClose={() => setAddExamModalOpen(false)} patientId={patient.id} />}
            
            {editingMedication && <AddMedicationModal isOpen={!!editingMedication} onClose={() => setEditingMedication(null)} patientId={patient.id} medicationToEdit={editingMedication} />}
            {isAddMedicationModalOpen && <AddMedicationModal isOpen={isAddMedicationModalOpen} onClose={() => setAddMedicationModalOpen(false)} patientId={patient.id} />}
            
            {editingSurgery && <EditSurgeryModal surgery={editingSurgery} patientId={patient.id} onClose={() => setEditingSurgery(null)} />}
            {isAddSurgeryModalOpen && <AddSurgeryModal isOpen={isAddSurgeryModalOpen} onClose={() => setAddSurgeryModalOpen(false)} patientId={patient.id} />}
        </div>
    );
};

const DateInputModal: React.FC<{ title: string; onClose: () => void; onSave: (date: string) => void; }> = ({ title, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const handleSave = () => {
        if (date) {
            onSave(date);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};


const AddDeviceModal: React.FC<{ isOpen: boolean; onClose: () => void; patientId: number; deviceToEdit?: Device | null; }> = ({ isOpen, onClose, patientId, deviceToEdit }) => {
    const { addDeviceToPatient, updateDeviceInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState(deviceToEdit?.name || '');
    const [location, setLocation] = useState(deviceToEdit?.location || '');
    const [startDate, setStartDate] = useState(deviceToEdit?.startDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (deviceToEdit) {
            setName(deviceToEdit.name);
            setLocation(deviceToEdit.location);
            setStartDate(deviceToEdit.startDate);
        } else {
             setName('');
             setLocation('');
             setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [deviceToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location || !startDate) return;
        
        const deviceData = { name, location, startDate };
        
        if (deviceToEdit) {
             updateDeviceInPatient(patientId, { ...deviceToEdit, ...deviceData });
             showNotification({ message: 'Dispositivo atualizado!', type: 'success' });
        } else {
             addDeviceToPatient(patientId, deviceData);
             showNotification({ message: 'Dispositivo adicionado!', type: 'success' });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{deviceToEdit ? 'Editar' : 'Adicionar'} Dispositivo</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Dispositivo</label>
                        <select value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {DEVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Localização</label>
                        <select value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                             <option value="" disabled>Selecione...</option>
                            {DEVICE_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                </form>
            </div>
        </div>
    );
};

const AddExamModal: React.FC<{ isOpen: boolean; onClose: () => void; patientId: number; examToEdit?: Exam | null; }> = ({ isOpen, onClose, patientId, examToEdit }) => {
    const { addExamToPatient, updateExamInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    
    const [name, setName] = useState(examToEdit?.name || '');
    const [date, setDate] = useState(examToEdit?.date || new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<Exam['result']>(examToEdit?.result || 'Pendente');
    const [observation, setObservation] = useState(examToEdit?.observation || '');

    useEffect(() => {
        if(examToEdit) {
            setName(examToEdit.name);
            setDate(examToEdit.date);
            setResult(examToEdit.result);
            setObservation(examToEdit.observation || '');
        } else {
            setName('');
            setDate(new Date().toISOString().split('T')[0]);
            setResult('Pendente');
            setObservation('');
        }
    }, [examToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !date) return;
        
        if (examToEdit) {
            updateExamInPatient(patientId, { id: examToEdit.id, date, observation });
            showNotification({ message: 'Observação do exame atualizada!', type: 'success' });
        } else {
            addExamToPatient(patientId, { name, date, result, observation });
            showNotification({ message: 'Exame adicionado!', type: 'success' });
        }
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{examToEdit ? 'Editar Observação do Exame' : 'Adicionar Exame'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Exame</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={!!examToEdit} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                     {!examToEdit && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Resultado</label>
                            <select value={result} onChange={e => setResult(e.target.value as Exam['result'])} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                                {EXAM_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                     )}
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação</label>
                        <textarea value={observation} onChange={e => setObservation(e.target.value)} rows={3} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                </form>
            </div>
        </div>
    );
};

const AddMedicationModal: React.FC<{ isOpen: boolean; onClose: () => void; patientId: number; medicationToEdit?: Medication | null; }> = ({ isOpen, onClose, patientId, medicationToEdit }) => {
    const { addMedicationToPatient, updateMedicationInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    
    const [name, setName] = useState(medicationToEdit?.name || '');
    const [dosage, setDosage] = useState(medicationToEdit?.dosage || '');
    const [startDate, setStartDate] = useState(medicationToEdit?.startDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (medicationToEdit) {
            setName(medicationToEdit.name);
            setDosage(medicationToEdit.dosage);
            setStartDate(medicationToEdit.startDate);
        } else {
            setName('');
            setDosage('');
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [medicationToEdit]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !dosage || !startDate) return;
        
        const medicationData = { name, dosage, startDate };
        
        if (medicationToEdit) {
            updateMedicationInPatient(patientId, { ...medicationToEdit, ...medicationData });
            showNotification({ message: 'Medicação atualizada!', type: 'success' });
        } else {
            addMedicationToPatient(patientId, medicationData);
            showNotification({ message: 'Medicação adicionada!', type: 'success' });
        }
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{medicationToEdit ? 'Editar' : 'Adicionar'} Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Medicação</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosagem e Frequência</label>
                        <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                </form>
            </div>
        </div>
    );
};

const AddSurgeryModal: React.FC<{ isOpen: boolean; onClose: () => void; patientId: number;}> = ({ isOpen, onClose, patientId }) => {
    const { addSurgeryToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    
    const [name, setName] = useState('');
    const [surgeon, setSurgeon] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !surgeon || !date) return;
        addSurgeryToPatient(patientId, { name, surgeon, date });
        showNotification({ message: 'Cirurgia adicionada com sucesso!', type: 'success' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Adicionar Cirurgia</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Cirurgia</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cirurgião</label>
                        <select value={surgeon} onChange={e => setSurgeon(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {SURGEON_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Cirurgia</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                </form>
            </div>
        </div>
    );
};


const CategoryListScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients } = useContext(PatientsContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);
    useHeader(patient ? `Round: ${patient.name}` : 'Round');
    
    if (!patientId) return <p>ID do paciente não encontrado.</p>;

    const completedCategories = getCompletedCategoriesForPatient(patientId);
    
    return (
        <div className="space-y-3">
            {CATEGORIES.map(category => {
                const isCompleted = completedCategories.includes(category.id);
                return (
                    <Link to={`/patient/${patientId}/round/category/${category.id}`} key={category.id} className="block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                             {category.icon && <category.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0"/>}
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex-1">{category.name}</span>
                            {isCompleted ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <ChevronRightIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

const ChecklistScreen: React.FC = () => {
    const { patientId, categoryId } = useParams<{ patientId: string; categoryId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const searchParams = new URLSearchParams(location.search);
    const initialQuestionIndex = parseInt(searchParams.get('question') || '0', 10);

    const category = CATEGORIES.find(c => c.id.toString() === categoryId);
    useHeader(category ? `Checklist: ${category.name}` : 'Checklist');

    const questions = useMemo(() => {
        return QUESTIONS.filter(q => q.categoryId.toString() === categoryId);
    }, [categoryId]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
    const [answers, setAnswers] = useState<ChecklistAnswer>({});
    const [isExiting, setIsExiting] = useState(false);

    const handleAnswerChange = (questionId: number, answer: Answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };
    
    const handleSave = () => {
        if (patientId && categoryId) {
            markCategoryAsCompletedForPatient(patientId, parseInt(categoryId, 10));
        }
        setIsExiting(true);
        setTimeout(() => navigate(`/patient/${patientId}/round/categories`), 300);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (!patientId || !categoryId || questions.length === 0) {
        return <p>Checklist não encontrado ou categoria sem perguntas.</p>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const currentAnswer = answers[currentQuestion.id];

    return (
        <div className="flex items-center justify-center -m-4 md:-m-6 lg:-m-8 bg-slate-50 dark:bg-slate-950" style={{ minHeight: 'calc(100vh - 73px)' }}>
            <div className={`bg-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transition-all duration-300 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                
                <div className="text-center mb-8">
                    <span className="bg-blue-700 text-xs font-bold px-4 py-1.5 rounded-full">
                        Pergunta {currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center uppercase mb-8 h-24 flex items-center justify-center">
                    {currentQuestion.text}
                </h2>

                <div className="space-y-3 mb-8">
                    {(['sim', 'não', 'nao_se_aplica'] as Answer[]).map(answer => {
                        const isSelected = currentAnswer === answer;
                        return (
                             <button
                                key={answer}
                                onClick={() => handleAnswerChange(currentQuestion.id, answer)}
                                className={`w-full text-center font-bold py-4 px-4 rounded-lg transition text-base uppercase
                                    ${isSelected 
                                        ? 'bg-white text-blue-700 ring-2 ring-white shadow-lg' 
                                        : 'bg-blue-500 hover:bg-blue-400'}`
                                    }
                            >
                                {answer.replace('_', ' ').toUpperCase()}
                            </button>
                        );
                    })}
                </div>

                <div className="mb-6 text-center">
                    <Link
                        to={`/patient/${patientId}/round/category/${categoryId}/create-alert`}
                        state={{ fromQuestionIndex: currentQuestionIndex }}
                        className="inline-flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 shadow-md"
                    >
                        <BellIcon className="w-5 h-5" />
                        Criar Alerta
                    </Link>
                </div>
                
                <hr className="border-blue-500 mb-6" />

                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="px-8 py-3 rounded-lg font-bold transition bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentQuestionIndex === 0}
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!currentAnswer}
                        className="px-8 py-3 rounded-lg font-bold transition bg-white text-blue-700 hover:bg-blue-100 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {isLastQuestion ? 'Finalizar' : 'Próximo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateAlertScreen: React.FC = () => {
    const { patientId, categoryId } = useParams<{ patientId: string, categoryId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { addTask } = useContext(TasksContext)!;
    const { patients } = useContext(PatientsContext)!;

    const patient = patients.find(p => p.id.toString() === patientId);
    
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categoryId || '');
    const [responsible, setResponsible] = useState('');
    const [deadline, setDeadline] = useState('');

    const fromQuestionIndex = location.state?.fromQuestionIndex;

    const categoryForHeader = CATEGORIES.find(c => c.id.toString() === category);
    useHeader(categoryForHeader ? `Alerta: ${categoryForHeader.name}` : (patient ? `Criar Alerta: ${patient.name}` : 'Criar Alerta'));
    
    const handleGoBack = () => {
        if (categoryId && fromQuestionIndex !== undefined) {
            navigate(`/patient/${patientId}/round/category/${categoryId}?question=${fromQuestionIndex}`);
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!patientId || !description || !category || !responsible || !deadline) return;

        const deadlineHours = parseInt(deadline.split(' ')[0], 10);
        const deadlineDate = new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString();

        addTask({
            patientId: parseInt(patientId, 10),
            categoryId: parseInt(category, 10),
            description,
            responsible,
            deadline: deadlineDate,
        });
        
        handleGoBack();
    };

    if (!patient) {
        return <p>Paciente não encontrado.</p>;
    }

    return (
        <div className="flex justify-center items-start pt-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md relative">
                 <button 
                    onClick={handleGoBack} 
                    className="absolute top-3 right-3 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
                    aria-label="Fechar"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
                <div className="bg-blue-600 text-white p-4 text-center rounded-t-lg">
                    <h2 className="text-xl font-bold uppercase">{patient.name}</h2>
                    {categoryForHeader && <p className="text-sm">{categoryForHeader.name}</p>}
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="alerta-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alerta</label>
                        <input 
                            id="alerta-desc"
                            type="text"
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Digite o alerta identificado..."
                            className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" required
                        />
                    </div>
                    
                    {!categoryId && (
                        <div>
                            <label htmlFor="alerta-cat" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                            <select id="alerta-cat" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" required>
                                <option value="" disabled>Selecione uma categoria...</option>
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="alerta-resp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                        <select id="alerta-resp" value={responsible} onChange={e => setResponsible(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" required>
                             <option value="" disabled>Selecione...</option>
                            {RESPONSIBLES.map(resp => <option key={resp} value={resp}>{resp}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="alerta-prazo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a hora</label>
                        <select id="alerta-prazo" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" required>
                            <option value="" disabled>Selecione...</option>
                            {ALERT_DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2">
                        <PencilIcon className="w-5 h-5"/>
                        Criar alerta
                    </button>
                </form>
            </div>
        </div>
    );
};


const TasksByStatusScreen: React.FC = () => {
    const { status } = useParams<{ status: TaskStatus }>();
    const { tasks, updateTaskJustification, updateTaskStatus } = useContext(TasksContext)!;
    const { patients } = useContext(PatientsContext)!;

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [justificationText, setJustificationText] = useState('');

    const titleMap: Record<TaskStatus, string> = {
        alerta: 'Tarefas em Alerta',
        no_prazo: 'Tarefas no Prazo',
        fora_do_prazo: 'Tarefas Fora do Prazo',
        concluido: 'Tarefas Concluídas'
    };

    useHeader(titleMap[status as TaskStatus] || 'Tarefas');
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => t.status === status).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }, [tasks, status]);

    const handleStartEdit = (task: Task) => {
        setEditingTaskId(task.id);
        setJustificationText(task.justification || '');
    };

    const handleSaveJustification = (taskId: number) => {
        updateTaskJustification(taskId, justificationText);
        setEditingTaskId(null);
        setJustificationText('');
    };

    const handleMarkAsDone = (taskId: number) => {
        updateTaskStatus(taskId, 'concluido');
    };
    
    const getPatientName = (patientId: number) => {
        return patients.find(p => p.id === patientId)?.name || 'Desconhecido';
    }

    if (!status) return <p>Status não especificado.</p>;

    return (
        <div className="space-y-4">
            {filteredTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{task.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Paciente: {getPatientName(task.patientId)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Responsável: {task.responsible}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Prazo: {new Date(task.deadline).toLocaleString('pt-BR')}</p>
                    {task.justification && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Justificativa: {task.justification}</p>
                    )}
                    {status === 'fora_do_prazo' && (
                        <div className="mt-2">
                            {editingTaskId === task.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={justificationText}
                                        onChange={(e) => setJustificationText(e.target.value)}
                                        placeholder="Adicionar justificativa..."
                                        className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSaveJustification(task.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md">Salvar</button>
                                        <button onClick={() => setEditingTaskId(null)} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleStartEdit(task)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                        {task.justification ? 'Editar Justificativa' : 'Justificar Atraso'}
                                    </button>
                                    <button onClick={() => handleMarkAsDone(task.id)} className="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline">
                                        Marcar como Concluído
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                     {status === 'alerta' && (
                         <div className="mt-2 flex items-center gap-4">
                            <button onClick={() => handleMarkAsDone(task.id)} className="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline">
                                Marcar como Concluído
                            </button>
                         </div>
                     )}
                </div>
            ))}
        </div>
    );
};

const SettingsScreen: React.FC = () => {
    useHeader('Ajustes');
    const { user, updateUser } = useContext(UserContext)!;
    const { theme, toggleTheme } = useContext(ThemeContext)!;

    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [department, setDepartment] = useState(user.department);

    const handleSaveProfile = () => {
        updateUser({ name, role, department });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ avatarUrl: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Perfil</h2>
                <div className="flex items-center space-x-4 mb-6">
                    <label htmlFor="avatar-upload" className="relative cursor-pointer group">
                        <img src={user.avatarUrl} alt="User avatar" className="w-20 h-20 rounded-full object-cover group-hover:opacity-75 transition-opacity"/>
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CameraIcon className="w-8 h-8 text-white"/>
                        </div>
                    </label>
                     <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Função</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Setor</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <button onClick={handleSaveProfile} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        Salvar Perfil
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Preferências</h2>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Tema Escuro</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                             theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}/>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- PROVIDERS for Global State ---
const PatientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const { showNotification } = useContext(NotificationContext)!;

    const addDeviceToPatient = (patientId: number, device: Omit<Device, 'id'>) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newDevice: Device = { ...device, id: Date.now() };
                return { ...p, devices: [...p.devices, newDevice] };
            }
            return p;
        }));
    };
    
    const updateDeviceInPatient = (patientId: number, deviceData: Device) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedDevices = p.devices.map(d => d.id === deviceData.id ? deviceData : d);
                return { ...p, devices: updatedDevices };
            }
            return p;
        }));
    };
    
    const addRemovalDateToDevice = (patientId: number, deviceId: number, removalDate: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedDevices = p.devices.map(d => d.id === deviceId ? { ...d, removalDate } : d);
                return { ...p, devices: updatedDevices };
            }
            return p;
        }));
    };
    
    const deleteDeviceFromPatient = (patientId: number, deviceId: number) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedDevices = p.devices.map(d => d.id === deviceId ? { ...d, isArchived: true } : d);
                return { ...p, devices: updatedDevices };
            }
            return p;
        }));
    };
    
    const addExamToPatient = (patientId: number, exam: Omit<Exam, 'id'>) => {
         setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newExam: Exam = { ...exam, id: Date.now() };
                return { ...p, exams: [...p.exams, newExam] };
            }
            return p;
        }));
    };
    
    const updateExamInPatient = (patientId: number, examData: Pick<Exam, 'id' | 'observation' | 'date'>) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedExams = p.exams.map(e => e.id === examData.id ? { ...e, observation: examData.observation, date: examData.date } : e);
                return { ...p, exams: updatedExams };
            }
            return p;
        }));
    };

    const deleteExamFromPatient = (patientId: number, examId: number) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedExams = p.exams.map(e => e.id === examId ? { ...e, isArchived: true } : e);
                return { ...p, exams: updatedExams };
            }
            return p;
        }));
    };

    const addMedicationToPatient = (patientId: number, medication: Omit<Medication, 'id'>) => {
         setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newMedication: Medication = { ...medication, id: Date.now() };
                return { ...p, medications: [...p.medications, newMedication] };
            }
            return p;
        }));
    };

    const updateMedicationInPatient = (patientId: number, medicationData: Medication) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedMeds = p.medications.map(m => m.id === medicationData.id ? medicationData : m);
                return { ...p, medications: updatedMeds };
            }
            return p;
        }));
    };

    const addEndDateToMedication = (patientId: number, medicationId: number, endDate: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedMeds = p.medications.map(m => m.id === medicationId ? { ...m, endDate } : m);
                return { ...p, medications: updatedMeds };
            }
            return p;
        }));
    };

    const deleteMedicationFromPatient = (patientId: number, medicationId: number) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedMeds = p.medications.map(m => m.id === medicationId ? { ...m, isArchived: true } : m);
                return { ...p, medications: updatedMeds };
            }
            return p;
        }));
    };
    
    const addSurgeryToPatient = (patientId: number, surgery: Omit<Surgery, 'id'>) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newSurgery: Surgery = { ...surgery, id: Date.now() };
                return { ...p, surgeries: [...p.surgeries, newSurgery] };
            }
            return p;
        }));
    };

    const updateSurgeryInPatient = (patientId: number, surgeryData: Surgery) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedSurgeries = p.surgeries.map(s => s.id === surgeryData.id ? surgeryData : s);
                return { ...p, surgeries: updatedSurgeries };
            }
            return p;
        }));
    };

    const addCapdScaleToPatient = (patientId: number, scaleData: Omit<CapdScale, 'id'>) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newScale: CapdScale = { ...scaleData, id: Date.now() };
                return { ...p, capdScales: [...p.capdScales, newScale] };
            }
            return p;
        }));
        showNotification({ message: 'Avaliação CAP-D salva com sucesso!', type: 'success' });
    };

    const contextValue = { patients, addDeviceToPatient, updateDeviceInPatient, addExamToPatient, addMedicationToPatient, updateMedicationInPatient, addSurgeryToPatient, updateSurgeryInPatient, addRemovalDateToDevice, deleteDeviceFromPatient, addEndDateToMedication, deleteMedicationFromPatient, updateExamInPatient, deleteExamFromPatient, addCapdScaleToPatient };

    return <PatientsContext.Provider value={contextValue}>{children}</PatientsContext.Provider>;
};

const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const { showNotification } = useContext(NotificationContext)!;

    const updateTaskJustification = (taskId: number, justification: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, justification } : t));
        showNotification({ message: 'Justificativa salva!', type: 'success' });
    };
    
    const updateTaskStatus = (taskId: number, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
        if (status === 'concluido') {
             showNotification({ message: 'Tarefa concluída!', type: 'success' });
        }
    };

    const addTask = (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => {
        const newTask: Task = {
            ...taskData,
            id: Date.now(),
            status: 'alerta',
        };
        setTasks(prev => [newTask, ...prev]);
        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });
    };

    const contextValue = { tasks, updateTaskJustification, updateTaskStatus, addTask };

    return <TasksContext.Provider value={contextValue}>{children}</TasksContext.Provider>;
};

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (notification: NotificationState) => {
        setNotification(notification);
    };

    const hideNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const { showNotification } = useContext(NotificationContext)!;

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => ({...prev, ...userData}));
        if (Object.keys(userData).length === 1 && 'name' in userData) {
             showNotification({ message: 'Nome atualizado!', type: 'success' });
        } else if (Object.keys(userData).length === 1 && 'avatarUrl' in userData) {
             showNotification({ message: 'Foto atualizada!', type: 'success' });
        } else {
             showNotification({ message: 'Perfil atualizado!', type: 'success' });
        }
    };

    return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <UserProvider>
                    <PatientsProvider>
                        <TasksProvider>
                            <HashRouter>
                                <Routes>
                                    <Route path="/" element={<LoginScreen />} />
                                    <Route path="/" element={<AppLayout />}>
                                        <Route path="dashboard" element={<DashboardScreen />} />
                                        <Route path="status/:status" element={<TasksByStatusScreen />} />
                                        <Route path="patients" element={<PatientListScreen />} />
                                        <Route path="patient/:patientId" element={<PatientDetailScreen />} />
                                        <Route path="patient/:patientId/history" element={<PatientHistoryScreen />} />
                                        <Route path="patient/:patientId/round/categories" element={<CategoryListScreen />} />
                                        <Route path="patient/:patientId/round/category/:categoryId" element={<ChecklistScreen />} />
                                        <Route path="patient/:patientId/create-alert" element={<CreateAlertScreen />} />
                                        <Route path="patient/:patientId/round/category/:categoryId/create-alert" element={<CreateAlertScreen />} />
                                        <Route path="settings" element={<SettingsScreen />} />
                                    </Route>
                                </Routes>
                            </HashRouter>
                        </TasksProvider>
                    </PatientsProvider>
                </UserProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
};

// FIX: Add default export for the App component.
export default App;