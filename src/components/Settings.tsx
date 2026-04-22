/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Box, 
  Upload, 
  Database, 
  Globe, 
  Shield, 
  Users,
  Link as LinkIcon,
  FileJson,
  FileSpreadsheet,
  FileText,
  File,
  Download,
  Trash2,
  MoreVertical,
  FileCode,
  Bell,
  MessageSquare,
  Send,
  Moon,
  Sun,
  Palette,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Cpu,
  Wifi,
  Clock,
  Truck,
  Layers,
  LayoutDashboard,
  PieChart
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { notificationService } from "@/services/NotificationService";
import { useAuth } from "@/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyDetails } from "@/types";

interface SettingsProps {
  branding: CompanyDetails;
  onUpdateBranding: (data: any) => void;
}

export default function Settings({ branding, onUpdateBranding }: SettingsProps) {
  const { profile } = useAuth();
  const [files, setFiles] = useState([
    { id: '1', name: 'Архитектурный_план_этаж1.pdf', size: '12.4 MB', type: 'pdf', date: '10.04.2024' },
    { id: '2', name: 'Спецификация_арматуры.xlsx', size: '1.2 MB', type: 'excel', date: '11.04.2024' },
    { id: '3', name: 'Схема_электрики_финал.dwg', size: '8.5 MB', type: 'dwg', date: '12.04.2024' },
  ]);

  const [darkMode, setDarkMode] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{name: string, status: 'ok' | 'error' | 'warning', message: string}[]>([]);

  const runDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticResults([]);
    
    // Simulate diagnostic steps
    const steps = [
      { name: 'Firestore Connection', status: 'ok', message: 'Соединение установлено. Пинг 45мс.' },
      { name: 'Firebase Auth', status: 'ok', message: 'Авторизация работает корректно.' },
      { name: 'BIM Viewer WASM', status: 'ok', message: 'WASM модули загружены (web-ifc 0.0.36).' },
      { name: 'Storage API', status: 'warning', message: 'Параметры CORS в Storage требуют проверки.' },
      { name: 'Notification Service', status: 'ok', message: 'Сервис активен. Очередь пуста.' },
      { name: 'API Latency', status: 'ok', message: 'Средняя задержка 120мс.' }
    ] as const;

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setDiagnosticResults(prev => [...prev, steps[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsDiagnosticRunning(false);
        toast.success("Диагностика системы завершена");
      }
    }, 600);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    toast.info(darkMode ? "Светлая тема включена" : "Темная тема включена");
  };

  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) return JSON.parse(saved);
    return {
      email: true,
      push: true,
      sms: false,
      telegram: false,
      phone: '',
      telegramId: '',
      deadlines: true,
      overdue: true,
      comments: true,
      budget: true,
      critical: true,
      updates: true
    };
  });

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifSettings));
  }, [notifSettings]);

  const handleSaveNotif = () => {
    toast.success("Настройки уведомлений сохранены");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'excel': return <FileSpreadsheet className="text-green-600" />;
      case 'dwg': return <FileCode className="text-orange-500" />;
      default: return <File className="text-slate-400" />;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Настройки системы</h2>
          <p className="text-slate-500">Управление параметрами, диагностика и контроль доступа</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => toast.info("Справка по системе...")}>
              Справка
           </Button>
           <Button className="bg-slate-900" size="sm" onClick={() => toast.success("Все настройки сохранены")}>
              Сохранить всё
           </Button>
        </div>
      </div>

      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11">
          <TabsTrigger value="general" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Основное</TabsTrigger>
          <TabsTrigger value="sections" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Модули</TabsTrigger>
          <TabsTrigger value="portal" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Портал</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Уведомления</TabsTrigger>
          <TabsTrigger value="access" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Доступы</TabsTrigger>
          <TabsTrigger value="diagnostics" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">Диагностика</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 mt-0 outline-none">
          {/* Appearance Settings */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-indigo-600 h-1" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Palette size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Оформление и Брендинг</CardTitle>
                  <CardDescription>Персонализация интерфейса под вашу компанию</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Название компании</Label>
                  <Input 
                    id="company-name" 
                    value={branding.name} 
                    onChange={(e) => onUpdateBranding({ name: e.target.value })}
                    placeholder="Введите название компании..."
                    className="bg-slate-50 border-none h-11"
                  />
                  <p className="text-[10px] text-slate-400">Это название будет отображаться в боковой панели</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      darkMode ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Темная тема</div>
                      <div className="text-xs text-slate-500">Переключить интерфейс в ночной режим</div>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Requisites */}
          {profile?.role === 'admin' && (
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-900 h-1" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-900">
                    <FileText size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Реквизиты компании</CardTitle>
                    <CardDescription>Официальные данные для документов</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="req-inn">ИНН</Label>
                    <Input 
                      id="req-inn" 
                      value={branding.requisites.inn} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, inn: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-kpp">КПП</Label>
                    <Input 
                      id="req-kpp" 
                      value={branding.requisites.kpp} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, kpp: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-ogrn">ОГРН</Label>
                    <Input 
                      id="req-ogrn" 
                      value={branding.requisites.ogrn} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, ogrn: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-bik">БИК</Label>
                    <Input 
                      id="req-bik" 
                      value={branding.requisites.bik} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, bik: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="req-bank">Банк</Label>
                    <Input 
                      id="req-bank" 
                      value={branding.requisites.bank} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, bank: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-account">Расчетный счет</Label>
                    <Input 
                      id="req-account" 
                      value={branding.requisites.account} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, account: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-corr">Корр. счет</Label>
                    <Input 
                      id="req-corr" 
                      value={branding.requisites.corrAccount} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, corrAccount: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="req-address">Фактический адрес</Label>
                    <Input 
                      id="req-address" 
                      value={branding.requisites.address} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, address: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="req-legal">Юридический адрес</Label>
                    <Input 
                      id="req-legal" 
                      value={branding.requisites.legalAddress} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, legalAddress: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-phone">Телефон</Label>
                    <Input 
                      id="req-phone" 
                      value={branding.requisites.phone} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, phone: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-email">Email</Label>
                    <Input 
                      id="req-email" 
                      value={branding.requisites.email} 
                      onChange={(e) => onUpdateBranding({ requisites: { ...branding.requisites, email: e.target.value } })}
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={() => toast.success("Реквизиты сохранены")} 
                    className="bg-slate-900 px-8"
                  >
                    Сохранить изменения
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BIM Integration */}
          {profile?.role === 'admin' && (
            <Card className="border-none shadow-sm bg-white overflow-hidden">
               <div className="bg-blue-600 h-1" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Box size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">BIM Интеграция</CardTitle>
                    <CardDescription>Подключение внешних 3D моделей и сервисов</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="URL модели (IFC/FBX)..." className="bg-slate-50 border-none flex-1 h-11" />
                  <Button className="bg-slate-900 h-11 px-6">Подключить</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-8 mt-0 outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-slate-900 h-1" />
            <CardHeader>
              <CardTitle>Управление разделами панели</CardTitle>
              <CardDescription>Включение и выключение модулей системы для всех пользователей</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'basics', label: 'Основной блок (Обзор, Задачи, Карта)', icon: LayoutDashboard },
                  { id: 'production', label: 'Производственный блок (BIM, Материалы)', icon: Box },
                  { id: 'finance', label: 'Блок Финансы и Продажи', icon: PieChart },
                  { id: 'logistics', label: 'Модуль Логистики', icon: Truck },
                  { id: 'workTypes', label: 'Реестр видов работ', icon: Layers },
                ].map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <section.icon size={18} />
                      </div>
                      <span className="font-medium text-slate-900">{section.label}</span>
                    </div>
                    <Switch 
                      checked={branding.enabledSections?.[section.id as keyof typeof branding.enabledSections] ?? true} 
                      onCheckedChange={(checked) => onUpdateBranding({ 
                        enabledSections: { 
                          ...(branding.enabledSections || {}), 
                          [section.id]: checked 
                        } 
                      })} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-8 mt-0 outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-indigo-600 h-1" />
            <CardHeader>
              <CardTitle>Тонкие настройки Клиентского Портала</CardTitle>
              <CardDescription>Параметры отображения данных для ваших клиентов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Показывать бюджет проекта</Label>
                    <p className="text-sm text-slate-500">Клиент будет видеть общую сумму и расход</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Доступ к BIM модели</Label>
                    <p className="text-sm text-slate-500">Разрешить клиенту просматривать 3D модель в портале</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Чат с поддержкой</Label>
                    <p className="text-sm text-slate-500">Включить виджет обратной связи в личном кабинете</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-8 mt-0 outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-yellow-500 h-1" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                  <Bell size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Каналы уведомлений</CardTitle>
                  <CardDescription>Где вы хотите получать оповещения</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email уведомления</Label>
                    <p className="text-sm text-slate-500">Отчеты и сводки по проекту</p>
                  </div>
                  <Switch checked={notifSettings.email} onCheckedChange={(v) => setNotifSettings({...notifSettings, email: v})} />
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Telegram</Label>
                    <p className="text-sm text-slate-500">Уведомления о задачах через бота</p>
                  </div>
                  <Switch checked={notifSettings.telegram} onCheckedChange={(v) => setNotifSettings({...notifSettings, telegram: v})} />
                </div>
              </div>
              
              {notifSettings.telegram && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-3">
                   <Label className="text-blue-900">Telegram Username / ID</Label>
                   <div className="flex gap-2">
                      <Input 
                        placeholder="@username..." 
                        className="bg-white border-blue-200 h-11" 
                        value={notifSettings.telegramId}
                        onChange={(e) => setNotifSettings({...notifSettings, telegramId: e.target.value})}
                      />
                      <Button className="bg-blue-600 h-11">Активировать</Button>
                   </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                <Button onClick={handleSaveNotif} className="w-full bg-slate-900 h-11 font-bold">Сохранить настройки каналов</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Типы событий</CardTitle>
              <CardDescription>Выберите о чем вы хотите знать</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { id: 'deadlines', label: 'Сроки задач', icon: Clock },
                 { id: 'overdue', label: 'Просрочки', icon: AlertTriangle },
                 { id: 'comments', label: 'Комментарии', icon: MessageSquare },
                 { id: 'critical', label: 'Критические ошибки', icon: Shield },
               ].map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <item.icon size={18} className="text-slate-400" />
                       <span className="font-medium text-slate-700">{item.label}</span>
                    </div>
                    <Switch 
                      checked={notifSettings[item.id as keyof typeof notifSettings] as boolean} 
                      onCheckedChange={(v) => setNotifSettings({...notifSettings, [item.id]: v})} 
                    />
                 </div>
               ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-8 mt-0 outline-none">
           <Card className="border-none shadow-sm bg-white overflow-hidden">
             <div className="bg-purple-600 h-1" />
             <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Разграничение доступа</CardTitle>
                    <CardDescription>Управление правами участников команды</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Переход в раздел Команда...")}>
                   Управление командой
                </Button>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm flex gap-3">
                   <AlertTriangle className="shrink-0" />
                   <div>
                      <p className="font-bold">Внимание к правам доступа</p>
                      <p className="opacity-80">Удаление прав доступа вступит в силу немедленно. Приглашенные участники видят только те разделы, которые вы отметили при отправке инвайта.</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-bold text-slate-900">Активные права по ролям (Default)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">Инженер</span>
                            <Badge className="bg-blue-100 text-blue-600">Full Project</Badge>
                         </div>
                         <p className="text-xs text-slate-500">Задачи, материалы, приемка, журналы, документы, BIM.</p>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">Прораб</span>
                            <Badge className="bg-yellow-100 text-yellow-600">Field Only</Badge>
                         </div>
                         <p className="text-xs text-slate-500">Задачи, журналы работ, приемка.</p>
                      </div>
                   </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-8 mt-0 outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-emerald-600 h-1" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Activity size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Диагностика системы</CardTitle>
                  <CardDescription>Проверка работоспособности модулей и связи с БД</CardDescription>
                </div>
              </div>
              <Button 
                onClick={runDiagnostics} 
                disabled={isDiagnosticRunning}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isDiagnosticRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                Запустить тест
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                    <Wifi className="text-emerald-500" size={20} />
                    <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">Сеть</p>
                       <p className="text-sm font-bold">Stable</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                    <Database className="text-blue-500" size={20} />
                    <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">База данных</p>
                       <p className="text-sm font-bold">Connected</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                    <HardDrive className="text-purple-500" size={20} />
                    <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">Хранилище</p>
                       <p className="text-sm font-bold">84% Free</p>
                    </div>
                 </div>
              </div>

              {diagnosticResults.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Результаты проверки</h4>
                  <div className="space-y-2">
                    {diagnosticResults.map((result, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-3">
                          {result?.status === 'ok' ? (
                            <CheckCircle2 className="text-green-500" size={18} />
                          ) : (
                            <AlertTriangle className={result?.status === 'warning' ? "text-amber-500" : "text-red-500"} size={18} />
                          )}
                          <span className="text-sm font-medium">{result?.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{result?.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isDiagnosticRunning && (
                <div className="space-y-4 py-8 flex flex-col items-center">
                   <div className="flex gap-1">
                      <div className="w-2 h-8 bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-8 bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-8 bg-emerald-600 animate-bounce" />
                   </div>
                   <p className="text-sm text-slate-500 font-medium animate-pulse">Сканирование модулей...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Management */}
      {profile?.role === 'admin' && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Команда проекта</CardTitle>
                <CardDescription>Управление доступом и ролями</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Email пользователя..." className="bg-slate-50 border-none h-12 sm:h-10" />
              <Button className="bg-slate-900 h-12 sm:h-10 text-base sm:text-sm">Пригласить</Button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Иван Петров', email: 'ivan@example.com', role: 'Инженер' },
                { name: 'Сергей Сидоров', email: 'sergey@example.com', role: 'Бригадир' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-slate-100 border-none">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Files */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <FileText size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Документация проекта</CardTitle>
                <CardDescription>Чертежи, спецификации и другие важные файлы</CardDescription>
              </div>
            </div>
            <Button className="bg-slate-900 h-12 sm:h-10 text-sm sm:text-xs">
              <Upload className="w-4 h-4 mr-2" /> Загрузить файл
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.size} • Загружено {file.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                    <Download size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-slate-200 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Перетащите файлы сюда</p>
              <p className="text-xs text-slate-500">Поддерживаются PDF, Excel, DWG, JPG до 50MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
