/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Box, 
  Camera, 
  FileText, 
  MessageSquare, 
  Download, 
  ExternalLink,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Send,
  User,
  Bell,
  Search,
  Filter,
  FileCheck,
  AlertTriangle,
  History,
  PieChart as PieChartIcon,
  ChevronRight,
  Maximize2,
  Plus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import BimViewer from './BimViewer';
import { cn } from "@/lib/utils";
import Comments from './Comments';
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import StepAssistant from './StepAssistant';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Доступ открыт', date: 'Сегодня, 09:30', category: 'system', desc: 'Вам открыт доступ в личный кабинет заказчика.', type: 'info', read: false },
    { id: 2, title: 'Новый отчет', date: 'Вчера, 17:15', category: 'report', desc: 'Сформирован еженедельный фотоотчет за 2-ю неделю апреля.', type: 'success', read: false },
    { id: 3, title: 'Оплата получена', date: '12 Апр 2024', category: 'finance', desc: 'Подтверждено получение платежа по этапу "Нулевой цикл".', type: 'success', read: true },
    { id: 4, title: 'Изменение графика', date: '10 Апр 2024', category: 'schedule', desc: 'Сдвиг сроков завершения остекления на 2 дня из-за погодных условий.', type: 'warning', read: false },
  ]);

  const financeData = [
    { name: 'Аванс', amount: 4500000, status: 'paid' },
    { name: 'Нулевой цикл', amount: 11250000, status: 'paid' },
    { name: 'Каркас', amount: 12750000, status: 'paid' },
    { name: 'Сети', amount: 9000000, status: 'pending' },
    { name: 'Отделка', amount: 7500000, status: 'pending' },
  ];

  const projectData = {
    name: 'ЖК "Зеленый Берег" - Корпус 1',
    address: 'наб. Реки, 8, Москва',
    progress: 68,
    status: 'active',
    nextMilestone: 'Завершение фасадных работ',
    milestoneDate: '2024-05-20',
    manager: 'Алексей Иванов',
    lastUpdate: 'Сегодня, 10:45',
    phases: [
      { name: 'Фундамент', progress: 100, status: 'completed' },
      { name: 'Каркас здания', progress: 100, status: 'completed' },
      { name: 'Фасадные работы', progress: 65, status: 'active' },
      { name: 'Инженерные системы', progress: 30, status: 'active' },
      { name: 'Внутренняя отделка', progress: 5, status: 'planned' },
    ]
  };

  const photos = [
    { id: 1, url: 'https://picsum.photos/seed/const1/800/600', date: '2024-04-15', title: 'Монтаж фасадных панелей' },
    { id: 2, url: 'https://picsum.photos/seed/const2/800/600', date: '2024-04-12', title: 'Остекление 5-го этажа' },
    { id: 3, url: 'https://picsum.photos/seed/const3/800/600', date: '2024-04-10', title: 'Внутренняя отделка МОП' },
    { id: 4, url: 'https://picsum.photos/seed/const4/800/600', date: '2024-04-05', title: 'Кровельные работы' },
  ];

  const documents = [
    { id: 'd1', title: 'Акт выполненных работ КС-2 (Март)', size: '1.2 MB', date: '2024-04-05' },
    { id: 'd2', title: 'Справка о стоимости КС-3 (Март)', size: '0.8 MB', date: '2024-04-05' },
    { id: 'd3', title: 'Фотоотчет за март 2024', size: '15.4 MB', date: '2024-04-01' },
    { id: 'd4', title: 'График производства работ (ред. 3)', size: '2.1 MB', date: '2024-03-15' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Client Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
              CP
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Портал Заказчика</h1>
              <p className="text-xs text-slate-500">Добро пожаловать, ООО "СтройИнвест"</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-900">{projectData.name}</div>
              <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                <MapPin size={10} /> {projectData.address}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100">
              <User size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide">
              <TabsList className="bg-white p-1 border border-slate-200 w-max min-w-full sm:w-fit flex">
                <TabsTrigger value="overview" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <LayoutDashboard size={16} className="mr-2" /> Обзор
                </TabsTrigger>
                <TabsTrigger value="bim" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <Box size={16} className="mr-2" /> BIM Модель
                </TabsTrigger>
                <TabsTrigger value="photos" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <Camera size={16} className="mr-2" /> Фотоотчеты
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <FileText size={16} className="mr-2" /> Документы
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <TrendingUp size={16} className="mr-2" /> Ход строительства
                </TabsTrigger>
                <TabsTrigger value="finance" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <TrendingUp size={16} className="mr-2" /> Финансы
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white whitespace-nowrap">
                  <Clock size={16} className="mr-2" /> Лента событий
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white relative whitespace-nowrap">
                  <Bell size={16} className="mr-2" /> Уведомления
                  <Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center bg-red-500 text-white border-white text-[8px]">
                    3
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
              <DialogTrigger render={
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 w-full sm:w-auto">
                  <MessageSquare size={16} className="mr-2" /> Задать вопрос менеджеру
                </Button>
              } />
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Задать вопрос менеджеру</DialogTitle>
                  <DialogDescription>
                    Мы ответим вам в течение рабочего дня. Ваше сообщение будет передано инженеру проекта.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Категория вопроса</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="justify-start">Ход работ</Button>
                      <Button variant="outline" size="sm" className="justify-start">Финансы</Button>
                      <Button variant="outline" size="sm" className="justify-start">Документация</Button>
                      <Button variant="outline" size="sm" className="justify-start">Другое</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ваше сообщение</label>
                    <Input 
                      className="min-h-[100px] text-start" 
                      placeholder="Опишите ваш вопрос максимально подробно..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsQuestionModalOpen(false)}>Отмена</Button>
                  <Button className="bg-slate-900" onClick={() => {
                    toast.success("Ваш вопрос отправлен менеджеру!");
                    setIsQuestionModalOpen(false);
                    setMessage('');
                  }}>Отправить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Progress Card */}
              <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Прогресс строительства</CardTitle>
                    <Badge className="bg-green-100 text-green-700 border-none">В графике</Badge>
                  </div>
                  <CardDescription>Общий статус выполнения работ по объекту</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-5xl font-black text-slate-900">{projectData.progress}%</div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Следующий этап</div>
                        <div className="text-sm font-bold text-slate-700">{projectData.nextMilestone}</div>
                      </div>
                    </div>
                    <Progress value={projectData.progress} className="h-4 bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 mb-1"><Clock size={16} /></div>
                      <div className="text-xs text-slate-500">Последнее обновление</div>
                      <div className="font-bold text-slate-900">{projectData.lastUpdate}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 mb-1"><Calendar size={16} /></div>
                      <div className="text-xs text-slate-500">Срок сдачи этапа</div>
                      <div className="font-bold text-slate-900">{projectData.milestoneDate}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 mb-1"><TrendingUp size={16} /></div>
                      <div className="text-xs text-slate-500">Динамика за неделю</div>
                      <div className="font-bold text-green-600">+4.2%</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Детализация по этапам</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectData.phases.map((phase, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">{phase.name}</span>
                            <Badge variant="outline" className={cn(
                              "text-[10px] border-none",
                              phase.status === 'completed' ? "bg-green-50 text-green-600" :
                              phase.status === 'active' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                            )}>
                              {phase.status === 'completed' ? 'Завершено' : 
                               phase.status === 'active' ? 'В работе' : 'В плане'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={phase.progress} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-bold text-slate-500">{phase.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manager Card */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Ваш менеджер</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {projectData.manager[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{projectData.manager}</div>
                      <div className="text-sm text-slate-500">Ведущий инженер проекта</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare size={16} className="mr-3 text-slate-400" /> Написать в чат
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink size={16} className="mr-3 text-slate-400" /> Заказать звонок
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Быстрая связь</h4>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ваш вопрос..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-slate-50 border-none"
                      />
                      <Button size="icon" className="bg-slate-900 shrink-0">
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Photos Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Последние фотоотчеты</CardTitle>
                  <Button variant="link" onClick={() => setActiveTab('photos')}>Все фото</Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {photos.slice(0, 2).map(photo => (
                      <div key={photo.id} className="group relative rounded-2xl overflow-hidden aspect-video">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                          <div className="text-white text-xs font-bold">{photo.title}</div>
                          <div className="text-white/70 text-[10px]">{photo.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Новые документы</CardTitle>
                  <Button variant="link" onClick={() => setActiveTab('docs')}>Все документы</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{doc.title}</div>
                            <div className="text-[10px] text-slate-400">{doc.date} • {doc.size}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                          <Download size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bim" className="h-[700px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
            <BimViewer onHighlightComplete={() => {}} />
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div>
                 <h3 className="text-xl font-bold text-slate-900">Фотоархив объекта</h3>
                 <p className="text-sm text-slate-500">История изменений и текущий статус в фотографиях</p>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm"><Filter size={14} className="mr-2" /> Фильтр</Button>
                 <Button variant="outline" size="sm"><Download size={14} className="mr-2" /> Скачать всё</Button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map(photo => (
                <Card key={photo.id} className="border-none shadow-sm bg-white overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden cursor-zoom-in" onClick={() => setSelectedPhoto(photo)}>
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-slate-900 border-none backdrop-blur-sm">
                        {photo.date}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-slate-900 mb-1">{photo.title}</h4>
                    <p className="text-xs text-slate-500">Фотофиксация этапа строительства</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedPhoto(photo)}>
                        <ExternalLink size={14} className="mr-2" /> Открыть
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Загрузка началась...")}>
                        <Download size={14} className="mr-2" /> Скачать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
              <DialogContent className="max-w-4xl p-0 border-none overflow-hidden bg-black/90">
                {selectedPhoto && (
                  <div className="relative aspect-video">
                    <img src={selectedPhoto.url} className="w-full h-full object-contain" alt={selectedPhoto.title} referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                       <h3 className="text-2xl font-bold text-white mb-2">{selectedPhoto.title}</h3>
                       <div className="flex items-center gap-4 text-white/60">
                         <span className="flex items-center gap-1 text-sm"><Calendar size={14} /> {selectedPhoto.date}</span>
                         <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> Секция 1, Этаж 4</span>
                       </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <div className="relative w-full sm:max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                 <Input 
                   placeholder="Поиск по названию или дате..." 
                   className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-600"
                   value={searchDoc}
                   onChange={(e) => setSearchDoc(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-2 w-full sm:w-auto">
                 <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Filter size={14} className="mr-2" /> Тип документа
                 </Button>
                 <Button className="bg-slate-900 flex-1 sm:flex-none" onClick={() => toast.info("Функция загрузки документов для клиента находится в разработке")}>
                    <Plus size={14} className="mr-2" /> Загрузить
                 </Button>
               </div>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">Название документа</th>
                      <th className="px-6 py-4 font-bold">Дата загрузки</th>
                      <th className="px-6 py-4 font-bold">Размер</th>
                      <th className="px-6 py-4 font-bold">Статус</th>
                      <th className="px-6 py-4 font-bold text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents
                      .filter(d => d.title.toLowerCase().includes(searchDoc.toLowerCase()))
                      .map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                               <FileText size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{doc.size}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-700 border-none text-[10px] items-center gap-1">
                             <FileCheck size={10} /> Подписано
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => toast.success("Начинаем загрузку...")}>
                              <Download size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => toast.info("Просмотр документа...")}>
                              <ExternalLink size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {documents.filter(d => d.title.toLowerCase().includes(searchDoc.toLowerCase())).length === 0 && (
                       <tr>
                         <td colSpan={5} className="text-center py-20 text-slate-400">
                            Ничего не найдено по вашему запросу
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>График производства работ</CardTitle>
                  <CardDescription>Актуальное состояние выполнения этапов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { name: 'Подготовительные работы', start: '01.01.2024', end: '15.01.2024', progress: 100, status: 'Завершено' },
                    { name: 'Земляные работы', start: '16.01.2024', end: '10.02.2024', progress: 100, status: 'Завершено' },
                    { name: 'Фундаментные работы', start: '11.02.2024', end: '15.03.2024', progress: 100, status: 'Завершено' },
                    { name: 'Возведение стен 1-го этажа', start: '16.03.2024', end: '10.04.2024', progress: 100, status: 'Завершено' },
                    { name: 'Перекрытия 1-го этажа', start: '11.04.2024', end: '20.04.2024', progress: 85, status: 'В работе' },
                    { name: 'Возведение стен 2-го этажа', start: '21.04.2024', end: '15.05.2024', progress: 0, status: 'Ожидание' },
                  ].map((task, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{task.name}</span>
                          <span className="text-[10px] text-slate-400">{task.start} — {task.end}</span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[10px] border-none",
                          task.status === 'Завершено' ? "bg-green-50 text-green-600" :
                          task.status === 'В работе' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                        )}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={task.progress} className="h-2 flex-1" />
                        <span className="text-[10px] font-bold text-slate-500">{task.progress}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Camera size={16} className="text-blue-500" />
                      Онлайн трансляция
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-slate-900 relative group">
                      <img 
                        src="https://picsum.photos/seed/construction_live/800/600" 
                        className="w-full h-full object-cover opacity-60" 
                        alt="Live Camera"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-all">
                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live • Камера 01</span>
                      </div>
                    </div>
                    <div className="p-4 flex gap-2 overflow-x-auto">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-20 aspect-video rounded-lg bg-slate-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all overflow-hidden">
                          <img src={`https://picsum.photos/seed/cam${i}/200/150`} className="w-full h-full object-cover" alt={`Cam ${i}`} referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Погодные условия</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-slate-900">+18°C</div>
                        <div className="text-xs text-slate-500">Ясно, без осадков</div>
                      </div>
                      <Badge className="bg-green-50 text-green-600 border-none">Благоприятно</Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 italic">Условия позволяют проводить бетонные и фасадные работы в штатном режиме.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle>Обсуждение хода работ</CardTitle>
              </CardHeader>
              <CardContent>
                <Comments contextId="client_portal_progress" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm bg-white overflow-hidden border-l-4 border-l-blue-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Общая сумма договора</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">45,000,000 ₽</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white overflow-hidden border-l-4 border-l-green-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Оплачено заказчиком</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-green-600 tracking-tight">28,500,000 ₽</div>
                  <p className="text-[10px] text-green-600 font-bold mt-1 tracking-wider uppercase">Освоено 63%</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white overflow-hidden border-l-4 border-l-orange-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Остаток к оплате</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-orange-600 tracking-tight">16,500,000 ₽</div>
                  <p className="text-[10px] text-orange-600 font-bold mt-1 tracking-wider uppercase">2 счета ожидают</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Динамика платежей</CardTitle>
                  <CardDescription>Распределение средств по этапам</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                        formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Сумма']}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                        {financeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'paid' ? '#16a34a' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>График платежей</CardTitle>
                  <Button variant="outline" size="sm">Скачать выписку</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Аванс (10%)', amount: '4,500,000 ₽', status: 'paid', date: '15.01.2024' },
                    { title: 'Нулевой цикл (25%)', amount: '11,250,000 ₽', status: 'paid', date: '20.03.2024' },
                    { title: 'Возведение каркаса (30%)', amount: '13,500,000 ₽', status: 'paid', date: '10.04.2024' },
                    { title: 'Инженерные сети (20%)', amount: '9,000,000 ₽', status: 'pending', date: 'Ожидается' },
                    { title: 'Чистовая отделка (15%)', amount: '6,750,000 ₽', status: 'pending', date: 'Ожидается' },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          payment.status === 'paid' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                          {payment.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{payment.title}</div>
                          <div className="text-[10px] text-slate-500">{payment.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{payment.amount}</div>
                        <Badge variant="outline" className={cn(
                          "border-none text-[10px] px-0 h-auto font-bold",
                          payment.status === 'paid' ? "text-green-600" : "text-slate-400"
                        )}>
                          {payment.status === 'paid' ? 'ИСПОЛНЕНО' : 'В ПЛАНЕ'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-none shadow-sm bg-white p-8">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                <div className="space-y-12 relative">
                  {[
                    { title: 'Договор подписан', date: '10 Янв 2024', desc: 'Официальное начало сотрудничества и запуск проектирования.', icon: FileText, color: 'bg-blue-500' },
                    { title: 'Нулевой цикл завершен', date: '15 Мар 2024', desc: 'Фундамент полностью готов и принят технадзором.', icon: CheckCircle2, color: 'bg-green-500' },
                    { title: 'Фотоотчет добавлен', date: '12 Апр 2024', desc: 'Добавлены новые фотографии процесса остекления.', icon: Camera, color: 'bg-purple-500' },
                    { title: 'Монтаж каркаса завершен', date: '15 Апр 2024', desc: 'Все несущие конструкции установлены.', icon: Box, color: 'bg-orange-500' },
                  ].reverse().map((event, i) => (
                    <div key={i} className="flex items-start gap-8 pl-2">
                      <div className={cn("w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 mt-1", event.color)}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-slate-900">{event.title}</h4>
                          <span className="text-xs text-slate-400">{event.date}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{event.desc}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 cursor-pointer hover:underline">
                          <event.icon size={14} /> Подробнее
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Обсуждение проекта</h3>
                <Comments contextId="client_portal_timeline" />
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-bold text-slate-900">Уведомления</h3>
                 <p className="text-sm text-slate-500">Важные изменения и системные сообщения</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => {
                 setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                 toast.success("Все уведомления прочитаны");
               }}>Прочитать все</Button>
            </div>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {notifications.map((n) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={n.id} 
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border border-slate-100 group transition-all relative overflow-hidden",
                      n.read ? "bg-white opacity-80" : "bg-blue-50/50 border-blue-100 shadow-sm"
                    )}
                    onClick={() => {
                      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                    }}
                  >
                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      n.type === 'success' ? "bg-green-100 text-green-600" :
                      n.type === 'warning' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {n.category === 'report' ? <FileText size={18} /> : 
                       n.category === 'finance' ? <TrendingUp size={18} /> : 
                       <Bell size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={cn("font-bold text-slate-900 truncate", !n.read && "text-blue-900")}>{n.title}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{n.desc}</p>
                      
                      <div className="mt-3 flex items-center gap-4">
                         <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-wider text-blue-600" onClick={(e) => {
                           e.stopPropagation();
                           toast.info("Переход к деталям...");
                         }}>Подробнее</Button>
                         {!n.read && (
                           <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-wider text-slate-400" onClick={(e) => {
                             e.stopPropagation();
                             setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                           }}>Отметить прочитанным</Button>
                         )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Interactive Step Assistant for Clients */}
      <StepAssistant 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        role="client"
      />
    </div>
  );
}
