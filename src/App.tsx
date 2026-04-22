/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Package, 
  PieChart, 
  Calendar as CalendarIcon, 
  FileText, 
  Settings, 
  Plus, 
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  Radio,
  Box,
  ArrowRight,
  Settings as SettingsIcon,
  Bot,
  BookOpen,
  Bell,
  Users,
  AlertTriangle,
  Map as MapIcon,
  TrendingUp,
  Zap,
  BarChart3,
  Truck,
  Layers,
  Archive,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import Dashboard from '@/components/Dashboard';
import Tasks from '@/components/Tasks';
import Materials from '@/components/Materials';
import Budget from '@/components/Budget';
import CalendarView from '@/components/CalendarView';
import Reports from '@/components/Reports';
import AcceptanceModule from '@/components/AcceptanceModule';
import KnowledgeBase from '@/components/KnowledgeBase';
import SettingsView from '@/components/Settings';
import ProjectSetup from '@/components/ProjectSetup';
import ProjectOverview from '@/components/ProjectOverview';
import BimViewer from '@/components/BimViewer';
import ConstructionAssistant from '@/components/ConstructionAssistant';
import TeamView from '@/components/TeamView';
import DailyLogs from '@/components/DailyLogs';
import Incidents from '@/components/Incidents';
import ProjectMap from '@/components/ProjectMap';
import SalesCRM from '@/components/SalesCRM';
import ClientDatabase from '@/components/ClientDatabase';
import DocumentManager from '@/components/DocumentManager';
import BillingManager from '@/components/BillingManager';
import Payroll from '@/components/Payroll';
import GanttChart from '@/components/GanttChart';
import LiveStreamModule from '@/components/LiveStreamModule';
import ClientPortal from '@/components/ClientPortal';
import AutomationWorkflows from '@/components/AutomationWorkflows';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import InventoryView from '@/components/Inventory';
import WorkTypes from '@/components/WorkTypes';
import Logistics from '@/components/Logistics';
import PortalPresentation from '@/components/PortalPresentation';
import ControlPanelListing from '@/components/ControlPanelListing';
import Login from '@/components/Login';
import { GlobalSearch } from '@/components/GlobalSearch';
import { NotificationCenter } from '@/components/NotificationCenter';
import FileArchive from '@/components/FileArchive';
import StepAssistant from '@/components/StepAssistant';
import { useAuth } from '@/AuthContext';
import { Project } from '@/types';
import { notificationService, Notification } from '@/services/NotificationService';

export default function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic Branding
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('companyBranding');
    return saved ? JSON.parse(saved) : { 
      name: 'СтройМастер', 
      logo: null,
      enabledSections: {
        basics: true,
        production: true,
        finance: true,
        service: true,
        logistics: true,
        workTypes: true
      },
      requisites: {
        inn: '',
        kpp: '',
        ogrn: '',
        address: '',
        legalAddress: '',
        bank: '',
        bik: '',
        account: '',
        corrAccount: '',
        phone: '',
        email: '',
        website: ''
      }
    };
  });

  const updateBranding = (data: any) => {
    const newBranding = { ...branding, ...data };
    setBranding(newBranding);
    localStorage.setItem('companyBranding', JSON.stringify(newBranding));
  };

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('allProjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { 
        id: '1', 
        name: 'ЖК "Северное Сияние"', 
        address: 'ул. Полярная, 12', 
        budget: 450000000, 
        spent: 280000000, 
        createdAt: '2024-01-15T10:00:00Z',
        status: 'active',
        projectType: 'construction',
        lat: 55.7558,
        lng: 37.6173,
        progress: 65,
        description: 'Строительство жилого комплекса бизнес-класса'
      },
      { 
        id: '2', 
        name: 'ТЦ "Мегаполис"', 
        address: 'пр. Ленина, 45', 
        budget: 1200000000, 
        spent: 450000000, 
        createdAt: '2023-11-20T14:30:00Z',
        status: 'active',
        projectType: 'construction',
        lat: 55.7000,
        lng: 37.5500,
        progress: 35,
        description: 'Реконструкция торгового центра'
      },
      { 
        id: '3', 
        name: 'Бизнес-центр "Кристалл"', 
        address: 'наб. Реки, 8', 
        budget: 850000000, 
        spent: 780000000, 
        createdAt: '2023-08-05T09:15:00Z',
        status: 'active',
        projectType: 'inspection',
        lat: 55.8000,
        lng: 37.7000,
        progress: 90,
        description: 'Техническое обследование фасадов'
      },
      { 
        id: '4', 
        name: 'Школа №15', 
        address: 'ул. Школьная, 5', 
        budget: 300000000, 
        spent: 0, 
        createdAt: '2024-04-01T12:00:00Z',
        status: 'on-hold',
        projectType: 'planned',
        lat: 55.7200,
        lng: 37.6500,
        progress: 0,
        description: 'Планируемое строительство новой школы'
      },
      { 
        id: '5', 
        name: 'Складской комплекс', 
        address: 'Промзона "Юг"', 
        budget: 200000000, 
        spent: 50000000, 
        createdAt: '2024-02-10T11:00:00Z',
        status: 'active',
        projectType: 'inspection',
        lat: 55.6500,
        lng: 37.6000,
        progress: 25,
        description: 'Замеры и обследование фундамента'
      }
    ];
  });
  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    const saved = localStorage.getItem('currentProject');
    try {
      if (saved) return JSON.parse(saved);
      // If no project saved, pick the first demo project
      const demoProjects = [
        { 
          id: '1', 
          name: 'ЖК "Северное Сияние"', 
          address: 'ул. Полярная, 12', 
          budget: 450000000, 
          spent: 280000000, 
          createdAt: '2024-01-15T10:00:00Z',
          status: 'active',
          projectType: 'construction',
          lat: 55.7558,
          lng: 37.6173,
          progress: 65,
          description: 'Строительство жилого комплекса бизнес-класса'
        },
        { 
          id: '2', 
          name: 'ТЦ "Мегаполис"', 
          address: 'пр. Ленина, 45', 
          budget: 1200000000, 
          spent: 450000000, 
          createdAt: '2023-11-20T14:30:00Z',
          status: 'active',
          projectType: 'construction',
          lat: 55.7000,
          lng: 37.5500,
          progress: 35,
          description: 'Реконструкция торгового центра'
        },
        { 
          id: '3', 
          name: 'Бизнес-центр "Кристалл"', 
          address: 'наб. Реки, 8', 
          budget: 850000000, 
          spent: 780000000, 
          createdAt: '2023-08-05T09:15:00Z',
          status: 'active',
          projectType: 'inspection',
          lat: 55.8000,
          lng: 37.7000,
          progress: 90,
          description: 'Техническое обследование фасадов'
        }
      ];
      return demoProjects[0];
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleTabChange = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    
    const handleLaunchProject = (e: any) => {
      const lead = e.detail;
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: lead.clientName,
        address: 'Уточняется',
        budget: lead.estimatedValue,
        spent: 0,
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        projectType: 'construction',
        lat: 55.7558,
        lng: 37.6173,
        progress: 0,
        description: lead.notes,
        ownerId: user?.uid || '',
        members: [user?.uid || '']
      };
      handleProjectCreated(newProject);
      setActiveTab('dashboard');
      toast.success(`Проект "${newProject.name}" успешно запущен!`);
    };
    window.addEventListener('launchProject', handleLaunchProject);

    const handleChangeProject = (e: any) => {
      const projectId = e.detail;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('changeProject', handleChangeProject);

    return () => {
      window.removeEventListener('changeTab', handleTabChange);
      window.removeEventListener('launchProject', handleLaunchProject);
      window.removeEventListener('changeProject', handleChangeProject);
    };
  }, [user, projects]);

  useEffect(() => {
    const updateNotifications = () => {
      const notifs = notificationService.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };

    updateNotifications();
    window.addEventListener('notificationsUpdated', updateNotifications);
    return () => window.removeEventListener('notificationsUpdated', updateNotifications);
  }, []);
  const [activeTab, setActiveTab] = useState(() => {
    if (profile?.role === 'client') return 'portal';
    return localStorage.getItem('activeTab') || 'index';
  });

  useEffect(() => {
    if (profile?.role === 'client' && activeTab !== 'portal') {
      setActiveTab('portal');
    }
  }, [profile, activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProjectSetupOpen, setIsProjectSetupOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) setIsSidebarOpen(false);
  };
  const [highlightBimId, setHighlightBimId] = useState<string | null>(null);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProject) {
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
      } else {
        localStorage.removeItem('currentProject');
      }
      localStorage.setItem('activeTab', activeTab);
      localStorage.setItem('allProjects', JSON.stringify(projects));
    }, 30000);

    return () => clearInterval(interval);
  }, [currentProject, activeTab, projects]);

  const navigateToBim = (elementId: string) => {
    setHighlightBimId(elementId);
    setActiveTab('bim');
  };

  const handleProjectCreated = (newProject: Project) => {
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    setIsProjectSetupOpen(false);
    localStorage.setItem('allProjects', JSON.stringify(updatedProjects));
  };

  const handleDeleteProject = (id: string) => {
    if (profile?.role !== 'admin') {
      toast.error("У вас нет прав для удаления проектов");
      return;
    }
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
    localStorage.setItem('allProjects', JSON.stringify(updatedProjects));
    toast.success("Проект успешно удален");
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setActiveTab('dashboard');
  };

  const menuGroups = useMemo(() => {
    const userRole = profile?.role || (user?.email === 'gamapaga45@gmail.com' ? 'admin' : '');
    const userPermissions = profile?.permissions || [];
    const enabled = branding.enabledSections || {};
    
    const groups = [
      {
        id: 'main',
        title: 'Главная',
        roles: ['admin', 'engineer', 'supervisor', 'foreman', 'manager'],
        items: [
          { id: 'index', label: 'Командный центр', icon: LayoutDashboard },
        ]
      },
      {
        id: 'project',
        title: 'Управление проектом',
        roles: ['admin', 'engineer', 'supervisor', 'foreman', 'manager'],
        items: [
          { id: 'dashboard', label: 'Обзор проекта', icon: LayoutDashboard },
          { id: 'tasks', label: 'Задачи и Сроки', icon: CheckSquare },
          { id: 'gantt', label: 'График Ганта', icon: BarChart3 },
          { id: 'live', label: 'Live-трансляция', icon: Radio },
          { id: 'budget', label: 'Сметы и Бюджет', icon: PieChart },
          { id: 'logs', label: 'Журнал производства', icon: FileText },
          { id: 'map', label: 'Карта объектов', icon: MapIcon },
          { id: 'team', label: 'Команда проекта', icon: Users },
          { id: 'bim', label: 'BIM-моделирование', icon: Box },
        ]
      },
      {
        id: 'production',
        title: 'Ресурсы и Производство',
        roles: ['admin', 'engineer', 'supervisor', 'foreman'],
        items: [
          { id: 'worktypes', label: 'Реестр видов работ', icon: Layers },
          { id: 'materials', label: 'Материалы и ТМЦ', icon: Package },
          { id: 'logistics', label: 'Логистика и ТТН', icon: Truck },
          { id: 'inventory', label: 'Склад и Инвентарь', icon: Box },
          { id: 'acceptance', label: 'Технадзор / Приемка', icon: ShieldCheck },
          { id: 'incidents', label: 'Инциденты и ТБ', icon: AlertTriangle },
        ]
      },
      {
        id: 'finance',
        title: 'Продажи и Клиенты',
        roles: ['admin', 'manager'],
        items: [
          { id: 'crm', label: 'Воронка продаж / CRM', icon: TrendingUp },
          { id: 'clients', label: 'База клиентов', icon: Users },
          { id: 'portal', label: 'Личный кабинет клиента', icon: LayoutDashboard },
          { id: 'billing', label: 'Финансы и Счета', icon: BarChart3 },
          { id: 'payroll', label: 'Зарплаты и ФОТ', icon: DollarSign },
          { id: 'documents', label: 'Реестр документов', icon: FileText },
        ]
      },
      {
        id: 'system',
        title: 'Центральная система',
        roles: ['admin', 'engineer', 'supervisor', 'foreman', 'manager'],
        items: [
          { id: 'archive', label: 'Файловый архив', icon: Archive },
          { id: 'knowledge', label: 'База знаний (СП/СНиП)', icon: BookOpen },
          { id: 'assistant', label: 'ИИ-Ассистент', icon: Bot },
          { id: 'presentation', label: 'Презентация системы', icon: FileText },
          { id: 'reports', label: 'Генератор отчетов', icon: FileText },
          { id: 'settings', label: 'Настройки системы', icon: SettingsIcon },
        ]
      }
    ];

    return groups
      .filter(group => group.roles.includes(userRole) && (group.id === 'system' || enabled[group.id] !== false))
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Additional sub-item enabled checks
          if (item.id === 'logistics' && enabled.logistics === false) return false;
          if (item.id === 'worktypes' && enabled.workTypes === false) return false;
          // If admin, show all
          if (userRole === 'admin') return true;
          
          // If user has specific permissions defined, check them
          if (userPermissions.length > 0) {
            // Note: some IDs in menu don't exactly match AppSection but most do or can be mapped
            const sectionMap: Record<string, string> = {
               'logs': 'daily-logs',
               'bim': 'dashboard', // BIM is usually part of project dashboard/tech
               'map': 'dashboard',
               'knowledge': 'dashboard',
               'assistant': 'dashboard',
               'automation': 'settings',
               'documents': 'docs',
               'analytics': 'reports'
            };
            const mappedId = sectionMap[item.id] || item.id;
            return userPermissions.includes(mappedId as any);
          }
          
          // Default: allow based on role if no specific permissions set
          return true;
        })
      }))
      .filter(group => group.items.length > 0);
  }, [profile, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    // If we're on a global tab, render it regardless of project selection
    const globalTabs = ['index', 'settings', 'portal', 'clients', 'crm', 'map', 'materials', 'inventory', 'worktypes', 'logistics', 'knowledge', 'assistant', 'archive', 'presentation', 'payroll'];
    if (globalTabs.includes(activeTab)) {
      switch (activeTab) {
        case 'index': return <ControlPanelListing onNavigate={handleTabSelect} groups={menuGroups} />;
        case 'settings': return <SettingsView onUpdateBranding={updateBranding} branding={branding} />;
        case 'portal': return <ClientPortal />;
        case 'clients': return <ClientDatabase />;
        case 'crm': return <SalesCRM />;
        case 'map': return <ProjectMap projects={projects} onSelectProject={handleSelectProject} />;
        case 'materials': return <Materials project={currentProject} />;
        case 'inventory': return <InventoryView projects={projects} profile={profile} />;
        case 'worktypes': return <WorkTypes />;
        case 'logistics': return <Logistics />;
        case 'payroll': return <Payroll />;
        case 'knowledge': return <KnowledgeBase />;
        case 'assistant': return <ConstructionAssistant />;
        case 'archive': return <FileArchive />;
        case 'presentation': return <PortalPresentation />;
      }
    }

    if (!currentProject) {
      return (
        <ProjectOverview 
          projects={projects} 
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onNewProject={() => setIsProjectSetupOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard project={currentProject} profile={profile} />;
      case 'tasks': return <Tasks onShowInBim={navigateToBim} />;
      case 'budget': return <Budget />;
      case 'calendar': return <CalendarView />;
      case 'reports': return <Reports />;
      case 'logs': return <DailyLogs />;
      case 'incidents': return <Incidents />;
      case 'documents': return <DocumentManager />;
      case 'billing': return <BillingManager />;
      case 'payroll': return <Payroll />;
      case 'gantt': return <GanttChart />;
      case 'live': return <LiveStreamModule projectId={currentProject.id} />;
      case 'automation': return <AutomationWorkflows />;
      case 'analytics': return <AdvancedAnalytics />;
      case 'acceptance': return <AcceptanceModule />;
      case 'bim': return <BimViewer highlightId={highlightBimId} onHighlightComplete={() => setHighlightBimId(null)} />;
      case 'team': return <TeamView />;
      default: return <Dashboard project={currentProject} profile={profile} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Toaster />
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 h-screen sticky top-0",
          isMobile ? (isSidebarOpen ? "fixed inset-y-0 left-0 w-72 shadow-2xl" : "fixed inset-y-0 -left-72 w-72") : (isSidebarOpen ? "w-64" : "w-20")
        )}
      >
        <div className="p-4 flex flex-col gap-1 items-start">
          <div className="flex items-center justify-between w-full">
            {isSidebarOpen && <span className="font-bold text-xl text-slate-900 tracking-tight text-left">{branding.name}</span>}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-slate-500"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500"
              >
                <X size={20} />
              </Button>
            )}
          </div>
          {isSidebarOpen && profile && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left">
                {profile.role === 'admin' ? 'Администратор' : profile.role}
              </span>
            </div>
          )}
        </div>

        {(isSidebarOpen || (!isMobile && isSidebarOpen)) && (
          <div className="px-3 mb-2">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {currentProject ? "Текущий проект" : "Проект не выбран"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 truncate mr-2">
                  {currentProject ? currentProject.name : "Выберите из списка"}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setCurrentProject(null)}
                >
                  <SettingsIcon size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-4">
            {menuGroups.map((group) => (
              <SidebarGroup 
                key={group.title}
                group={group}
                activeTab={activeTab}
                isSidebarOpen={isSidebarOpen}
                currentProject={currentProject}
                handleTabSelect={handleTabSelect}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              setCurrentProject(null);
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="w-full flex items-center p-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors justify-start"
          >
            <PieChart size={20} className={cn("text-slate-500", isSidebarOpen ? "mr-3" : "mx-auto")} />
            {isSidebarOpen && <span className="ml-0 font-medium text-left flex-1">Все проекты</span>}
          </button>
          <button 
            onClick={signOut}
            className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 justify-start"
          >
            <LogOut size={20} className={cn(isSidebarOpen ? "mr-3" : "mx-auto")} />
            {isSidebarOpen && <span className="ml-0 font-medium text-left flex-1">Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col h-screen relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-500"
              >
                <Menu size={20} />
              </Button>
            )}
            <div className="flex flex-col items-start">
              <h2 className="text-base lg:text-lg font-semibold text-slate-800 leading-none text-left">
                {!currentProject ? "Обзор проектов" : menuGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
              </h2>
              {currentProject && (
                <span className="text-[10px] lg:text-xs text-slate-400 mt-1 truncate max-w-[120px] sm:max-w-none text-left">
                  {currentProject.name} • {currentProject.address}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="hidden md:block">
              <GlobalSearch onSelect={(type, id) => {
                if (type === 'project') {
                  const proj = projects.find(p => p.id === id);
                  if (proj) handleSelectProject(proj);
                }
              }} />
            </div>
            
            <NotificationCenter />

            {!isMobile && (
              <Dialog open={isProjectSetupOpen} onOpenChange={setIsProjectSetupOpen}>
                <DialogTrigger render={<Button size="sm" className="bg-slate-900 hover:bg-slate-800" />}>
                  <Plus size={16} className="mr-2" /> Новый проект
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-0 border-none overflow-hidden">
                  <ProjectSetup onProjectCreated={handleProjectCreated} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
        <StepAssistant activeTab={activeTab} onNavigate={handleTabSelect} role={profile?.role || 'admin'} />
      </main>
    </div>
  );
}

function SidebarGroup({ 
  group, 
  activeTab, 
  isSidebarOpen, 
  currentProject, 
  handleTabSelect 
}: { 
  group: any; 
  activeTab: string; 
  isSidebarOpen: boolean; 
  currentProject: any; 
  handleTabSelect: (id: string) => void;
}) {
  const hasActiveItem = group.items.some((i: any) => i.id === activeTab);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Keep active group expanded
  useEffect(() => {
    if (hasActiveItem) setIsExpanded(true);
  }, [hasActiveItem]);

  return (
    <div key={group.title} className="space-y-1">
      {isSidebarOpen ? (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          {group.title}
          <ChevronDown size={12} className={cn("transition-transform duration-200", !isExpanded && "-rotate-90")} />
        </button>
      ) : (
        <div className="h-px bg-slate-100 my-4" />
      )}
      
      <div className={cn(
        "space-y-1 overflow-hidden transition-all duration-300",
        isExpanded || !isSidebarOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        {group.items.map((item: any) => {
          const isAlwaysEnabled = ['index', 'settings', 'archive', 'reports', 'portal', 'clients', 'crm', 'map', 'materials', 'inventory', 'worktypes', 'logistics', 'knowledge', 'assistant', 'presentation'].includes(item.id);
          const isDisabled = !currentProject && !isAlwaysEnabled;
          
          return (
            <button
              key={item.id}
              disabled={isDisabled}
              onClick={() => handleTabSelect(item.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-lg transition-colors group justify-start",
                activeTab === item.id 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-600 hover:bg-slate-100",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-900", isSidebarOpen ? "mr-3" : "mx-auto")} />
              {isSidebarOpen && <span className="ml-0 font-medium text-left flex-1">{item.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  );
}
