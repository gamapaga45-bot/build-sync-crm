/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  Wallet,
  ArrowRight,
  Eye,
  Flag,
  Layers,
  Calendar as CalendarIcon,
  Activity,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Box
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { Project, UserProfile } from "@/types";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { notificationService } from "@/services/NotificationService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const data = [
  { name: 'Янв', budget: 4000, spent: 3800, materials: 2000, labor: 1800 },
  { name: 'Фев', budget: 5000, spent: 4200, materials: 2500, labor: 1700 },
  { name: 'Мар', budget: 6000, spent: 5800, materials: 3000, labor: 2800 },
  { name: 'Апр', budget: 5500, spent: 6100, materials: 3500, labor: 2600 },
  { name: 'Май', budget: 7000, spent: 4500, materials: 2200, labor: 2300 },
  { name: 'Июн', budget: 8000, spent: 3000, materials: 1500, labor: 1500 },
];

interface DashboardProps {
  project: Project | null;
  profile: UserProfile | null;
}

export default function Dashboard({ project, profile }: DashboardProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [chartMetric, setChartMetric] = useState<'total' | 'detailed' | 'trend'>('total');
  const [progressMetric, setProgressMetric] = useState<'percent' | 'days'>('percent');
  
  const budget = project?.budget || 15000000;
  const spent = project?.spent || 8400000;

  const handleTabChange = (tab: string) => {
    window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));
  };

  const handleCompleteTask = (id: string) => {
    setMyTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
    toast.success("Задача отмечена как выполненная");
    notificationService.addNotification({
      title: "Задача выполнена",
      message: `Вы завершили задачу в проекте ${project?.name || ''}`,
      type: "success"
    });
  };

  useEffect(() => {
    // In a real app, this would be a query to Firestore
    // For now, we simulate filtering tasks assigned to the current user
    const allTasks = [
      { id: '1', title: 'Армирование плиты фундамента', status: 'in-progress', date: 'Сегодня, 10:00', assignedTo: 'Сергей С.' },
      { id: '2', title: 'Закупка арматуры', status: 'in-progress', date: 'Вчера, 16:45', assignedTo: 'Алексей И.' },
      { id: '3', title: 'Проверка гидроизоляции', status: 'error', date: '12 Апр, 11:20', assignedTo: 'Иван П.' },
      { id: '4', title: 'Установка опалубки', status: 'todo', date: '14 Апр, 09:00', assignedTo: profile?.displayName || 'Пользователь' },
      { id: '5', title: 'Подготовка исполнительной документации', status: 'in-progress', date: 'Сегодня, 08:30', assignedTo: profile?.displayName || 'Пользователь' },
    ];

    const filtered = allTasks.filter(t => 
      t.assignedTo === profile?.displayName || 
      t.assignedTo === 'Пользователь' ||
      (profile?.displayName && t.assignedTo.includes(profile.displayName.split(' ')[0]))
    );
    setMyTasks(filtered);
  }, [profile]);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {!project && (
        <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Глобальный обзор объектов</h1>
            <p className="text-blue-100 max-w-xl text-sm sm:text-base">Управляйте всеми текущими проектами, следите за технадзором и используйте ИИ-помощника для формирования отчетов без привязки к конкретному объекту.</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-1/2"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="border-none shadow-sm bg-white overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-green-100 transition-all"
          onClick={() => handleTabChange('analytics')}
        >
          <div className="absolute top-0 right-0 p-2">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg">
              92
            </div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Здоровье проекта
            </CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Отличное</div>
            <p className="text-xs text-slate-500 mt-1">На основе 12 показателей</p>
          </CardContent>
        </Card>
        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all"
          onClick={() => handleTabChange('tasks')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Общий прогресс</CardTitle>
            <Zap className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{project?.progress || 65}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project?.progress || 65}%` }}></div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-slate-100 transition-all"
          onClick={() => handleTabChange('billing')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Бюджет</CardTitle>
            <Wallet className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{(spent / 1000000).toFixed(1)}M / {(budget / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-500 mt-1">Освоено {( (spent/budget) * 100 ).toFixed(0)}% средств</p>
          </CardContent>
        </Card>
        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-red-100 transition-all"
          onClick={() => handleTabChange('incidents')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Критические ошибки</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-xs text-red-500 mt-1">Требуют немедленного устранения</p>
          </CardContent>
        </Card>
      </div>

      {!project && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Текущие объекты в работе</h3>
            <Button variant="ghost" size="sm" className="text-blue-600">Все объекты</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: '1', name: 'ЖК "Северное Сияние"', address: 'ул. Полярная, 12', progress: 65, status: 'Активен' },
              { id: '2', name: 'ТЦ "Мегаполис"', address: 'пр. Ленина, 45', progress: 30, status: 'Активен' },
              { id: '3', name: 'Бизнес-центр "Кристалл"', address: 'наб. Реки, 8', progress: 90, status: 'Завершение' },
            ].map(p => (
              <Card 
                key={p.id} 
                className="border-none shadow-sm hover:ring-2 hover:ring-blue-600 transition-all cursor-pointer group"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeProject', { detail: p.id }));
                  handleTabChange('dashboard');
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Package size={24} />
                    </div>
                    <Badge variant="outline" className="bg-slate-50 border-none text-[10px]">{p.status}</Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{p.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{p.address}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Прогресс</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Динамика расходов</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={chartMetric === 'total' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="text-[10px] h-7"
                onClick={() => setChartMetric('total')}
              >
                Общие
              </Button>
              <Button 
                variant={chartMetric === 'detailed' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="text-[10px] h-7"
                onClick={() => setChartMetric('detailed')}
              >
                Детализация
              </Button>
              <Button 
                variant={chartMetric === 'trend' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="text-[10px] h-7"
                onClick={() => setChartMetric('trend')}
              >
                Тренд
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'trend' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Area type="monotone" dataKey="spent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpent)" name="Расходы" />
                  <Line type="monotone" dataKey="budget" stroke="#94a3b8" strokeDasharray="5 5" name="Бюджет" />
                </AreaChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  {chartMetric === 'total' ? (
                    <>
                      <Bar dataKey="spent" fill="#0f172a" radius={[4, 4, 0, 0]} name="Факт" />
                      <Bar dataKey="budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="План" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="materials" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Материалы" />
                      <Bar dataKey="labor" fill="#f97316" radius={[4, 4, 0, 0]} name="Работы" />
                    </>
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Прогресс по этапам</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={progressMetric === 'percent' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="text-[10px] h-7"
                onClick={() => setProgressMetric('percent')}
              >
                %
              </Button>
              <Button 
                variant={progressMetric === 'days' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="text-[10px] h-7"
                onClick={() => setProgressMetric('days')}
              >
                Дни
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { phase: 'Нулевой цикл', progress: 100, status: 'Завершено', details: 'Фундамент готов, гидроизоляция выполнена', daysLeft: 0, totalDays: 45 },
              { phase: 'Возведение каркаса', progress: 75, status: 'В работе', details: 'Монтаж перекрытий 3-го этажа', daysLeft: 12, totalDays: 60 },
              { phase: 'Инженерные сети', progress: 20, status: 'Начало', details: 'Прокладка магистральных труб', daysLeft: 45, totalDays: 55 },
              { phase: 'Отделочные работы', progress: 0, status: 'Ожидание', details: 'Старт после закрытия контура', daysLeft: 90, totalDays: 120 },
            ].map((p, i) => (
              <Dialog key={i}>
                <DialogTrigger nativeButton={false} render={<div className="space-y-2 cursor-pointer group" />}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.phase}</span>
                    <span className="text-xs font-bold text-slate-900">
                      {progressMetric === 'percent' ? `${p.progress}%` : `${p.daysLeft} дн. осталось`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        p.progress === 100 ? "bg-green-500" : "bg-blue-600"
                      )} 
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{p.phase}</DialogTitle>
                    <DialogDescription>Детальный прогресс этапа строительства</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-500">Текущий статус</span>
                      <Badge variant="outline" className={cn(
                        "border-none",
                        p.progress === 100 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Осталось дней</div>
                        <div className="text-lg font-bold text-slate-900">{p.daysLeft}</div>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Всего по плану</div>
                        <div className="text-lg font-bold text-slate-900">{p.totalDays}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{p.details}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Выполнение</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                    <Button className="w-full bg-slate-900" onClick={() => handleTabChange('tasks')}>
                      Перейти к задачам этапа
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Equipment on Site */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <Box size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Оборудование на объекте</CardTitle>
              <CardDescription>Закрепленный инструмент и техника</CardDescription>
            </div>
          </div>
          <Button variant="link" onClick={() => handleTabChange('inventory')}>Весь реестр</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Перфоратор Bosch', sn: 'BS-991283', condition: 'good', user: 'Иван П.' },
              { name: 'Лазерный нивелир', sn: 'ADA-2291', condition: 'new', user: 'Сергей С.' },
              { name: 'Сварочный аппарат', sn: 'RS-190-88', condition: 'worn', user: 'Алексей И.' },
              { name: 'Виброплита', sn: 'VP-8821', condition: 'good', user: 'Петр В.' },
            ].map((i, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                   <div className="font-bold text-sm text-slate-900">{i.name}</div>
                   <Badge className={cn(
                     "text-[8px] border-none uppercase",
                     i.condition === 'new' ? "bg-emerald-100 text-emerald-600" :
                     i.condition === 'good' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                   )}>{i.condition === 'new' ? 'Новое' : i.condition === 'good' ? 'Норм' : 'Износ'}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">S/N: {i.sn}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">{i.user[0]}</div>
                    {i.user}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Timeline */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-500" />
            Ключевые вехи проекта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            <div className="space-y-8 relative">
              {[
                { title: 'Завершение фундамента', date: '15 Мар 2024', status: 'completed' },
                { title: 'Монтаж 1-го этажа', date: '10 Апр 2024', status: 'completed' },
                { title: 'Кровельные работы', date: '25 Май 2024', status: 'upcoming' },
                { title: 'Сдача объекта', date: '30 Авг 2024', status: 'upcoming' },
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-6 pl-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 z-10 mt-1",
                    m.status === 'completed' ? "bg-green-500 border-green-200" : "bg-white border-slate-200"
                  )}></div>
                  <div className="flex-1 pb-2 border-b border-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={cn("font-bold text-sm", m.status === 'completed' ? "text-slate-900" : "text-slate-400")}>
                        {m.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CalendarIcon size={10} />
                        {m.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Мои задачи</CardTitle>
              <CardDescription>Задачи, распределенные на вас</CardDescription>
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-none">{myTasks.length} задач</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.length > 0 ? (
                myTasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        task.status === 'done' ? "bg-green-100 text-green-600" :
                        task.status === 'error' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {task.status === 'done' ? <CheckCircle2 size={20} /> :
                         task.status === 'error' ? <AlertCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <p className="text-xs text-slate-500">{task.date}</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
                        Детали
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{task.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-500">Статус</span>
                            <Badge variant="outline" className={cn(
                              "border-none",
                              task.status === 'done' ? "bg-green-100 text-green-600" :
                              task.status === 'error' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {task.status === 'done' ? 'Завершено' : task.status === 'error' ? 'Ошибка' : 'В работе'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Описание</p>
                            <p className="text-sm text-slate-600">Подробная информация о выполнении данной задачи на объекте. Включает в себя отчеты технадзора и фотофиксацию.</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={14} />
                            <span>Последнее обновление: {task.date}</span>
                          </div>
                          <div className="flex gap-3">
                            {task.status !== 'done' && (
                              <Button className="flex-1 bg-slate-900" onClick={() => {
                                handleCompleteTask(task.id);
                              }}>
                                Завершить задачу
                              </Button>
                            )}
                            <Button variant="outline" className="flex-1" onClick={() => handleTabChange('tasks')}>
                              Открыть в задачах
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>У вас нет назначенных задач</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Распределение нагрузки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Иван Петров', role: 'Инженер', tasks: 12, color: 'bg-blue-500' },
                { name: 'Сергей Сидоров', role: 'Бригадир', tasks: 8, color: 'bg-green-500' },
                { name: 'Алексей Иванов', role: 'Технадзор', tasks: 4, color: 'bg-orange-500' },
                { name: profile?.displayName || 'Вы', role: profile?.role || 'Пользователь', tasks: 5, color: 'bg-purple-500' },
              ].map((member, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", member.color)}></div>
                      <span className="font-medium text-slate-700">{member.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{member.tasks} задач</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={cn("h-full", member.color)} style={{ width: `${(member.tasks / 15) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs" onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'team' }))}>
              Управление командой
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
