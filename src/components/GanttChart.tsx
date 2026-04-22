/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GanttChartSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Maximize2,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { GanttTask } from '@/types';
import { cn } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

const demoGanttTasks: GanttTask[] = [
  {
    id: '1',
    title: 'Подготовка площадки',
    start: '2024-04-01',
    end: '2024-04-05',
    progress: 100,
    dependencies: [],
    color: 'bg-slate-900'
  },
  {
    id: '2',
    title: 'Земляные работы',
    start: '2024-04-04',
    end: '2024-04-12',
    progress: 75,
    dependencies: ['1'],
    color: 'bg-blue-600'
  },
  {
    id: '3',
    title: 'Устройство фундамента',
    start: '2024-04-10',
    end: '2024-04-25',
    progress: 30,
    dependencies: ['2'],
    color: 'bg-indigo-600'
  },
  {
    id: '4',
    title: 'Закупка арматуры',
    start: '2024-04-05',
    end: '2024-04-10',
    progress: 100,
    dependencies: [],
    color: 'bg-emerald-600'
  },
  {
    id: '5',
    title: 'Возведение опалубки',
    start: '2024-04-15',
    end: '2024-04-22',
    progress: 10,
    dependencies: ['3'],
    color: 'bg-amber-600'
  }
];

export default function GanttChart() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 3, 1)); // April 2024
  const [tasks] = useState<GanttTask[]>(demoGanttTasks);

  const daysInView = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getTaskStyle = (task: GanttTask) => {
    const viewStart = startOfMonth(currentDate);
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    
    const startOffset = Math.max(0, differenceInDays(taskStart, viewStart));
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    // Grid columns start from 1, and we have a label column first
    return {
      gridColumnStart: startOffset + 2,
      gridColumnEnd: `span ${duration}`,
    };
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-900 rounded-xl text-white">
                <GanttChartSquare size={20} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">График Ганта</h2>
          </div>
          <p className="text-slate-500 font-medium italic mt-1">Визуализация критического пути и сроков выполнения этапов</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 bg-white" onClick={() => toast.info("Сортировка будет доступна в следующем обновлении")}>
            <Filter className="w-4 h-4 mr-2" /> Сортировка
          </Button>
          <Button variant="outline" className="h-10 bg-white" onClick={() => toast.success("PDF-график сформирован и готов к печати")}>
            <Download className="w-4 h-4 mr-2" /> Отчет
          </Button>
          <Button 
            className="bg-slate-900 h-10 px-6 font-bold shadow-lg shadow-slate-200"
            onClick={() => toast.success("Окно планирования этапов открыто")}
          >
            <Plus className="w-4 h-4 mr-2" /> Новое событие
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-none shadow-sm overflow-hidden bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -30))}>
                <ChevronLeft size={20} />
             </Button>
             <div className="text-center min-w-[120px]">
                <div className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                  {format(currentDate, 'LLLL', { locale: ru })}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                  {format(currentDate, 'yyyy')}
                </div>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 30))}>
                <ChevronRight size={20} />
             </Button>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
                В графике
             </Badge>
             <Button variant="ghost" size="icon" className="text-slate-400">
                <Maximize2 size={18} />
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `250px repeat(${daysInView.length}, 40px)`,
              minWidth: `calc(250px + ${daysInView.length * 40}px)`
            }}
          >
            {/* Header Row */}
            <div className="sticky top-0 left-0 bg-white z-20 h-12 border-b border-r border-slate-100 p-4 font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center">
              Наименование работ
            </div>
            {daysInView.map((day) => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "sticky top-0 bg-white z-10 h-12 border-b border-r border-slate-100 flex flex-col items-center justify-center pt-1 transition-colors",
                  (day.getDay() === 0 || day.getDay() === 6) && "bg-slate-50/50"
                )}
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">
                  {format(day, 'eee', { locale: ru })}
                </span>
                <span className={cn(
                  "text-xs font-black mt-1",
                  isSameDay(day, new Date(2024, 3, 21)) ? "text-blue-600" : "text-slate-900"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}

            {/* Task Rows */}
            {tasks.map((task) => (
              <Fragment key={task.id}>
                <div className="sticky left-0 bg-white z-10 border-b border-r border-slate-50 p-4 min-h-[60px] flex flex-col justify-center">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{task.title}</span>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{task.progress}%</span>
                     <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900" style={{ width: `${task.progress}%` }} />
                     </div>
                  </div>
                </div>
                {daysInView.map((day) => (
                  <div 
                    key={`${task.id}-${day.toISOString()}`} 
                    className={cn(
                      "border-b border-r border-slate-50 min-h-[60px] transition-colors relative",
                      (day.getDay() === 0 || day.getDay() === 6) && "bg-slate-50/30"
                    )}
                  >
                    {/* Visual Vertical Line for Current Day */}
                    {isSameDay(day, new Date(2024, 3, 21)) && (
                      <div className="absolute inset-y-0 left-1/2 w-px bg-blue-400 opacity-20 pointer-events-none" />
                    )}
                  </div>
                ))}

                {/* Task Bar Overlay */}
                <div 
                  className={cn(
                    "relative -mt-[44px] h-7 rounded-lg shadow-sm border border-white/20 px-3 flex items-center overflow-hidden transition-all hover:brightness-110 cursor-pointer mb-5",
                    task.color
                  )}
                  style={getTaskStyle(task)}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-white/20 transition-all" 
                    style={{ width: `${task.progress}%` }}
                  />
                  <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-wider truncate">
                    {task.title}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
         <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="p-2 bg-blue-500 rounded-xl text-white">
               <Calendar size={20} />
            </div>
            <div>
               <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Критическая дата</p>
               <p className="text-sm font-bold text-blue-700">25 Апреля: Заливка плиты</p>
            </div>
         </div>
         <div className="flex items-start gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
            <div className="p-2 bg-amber-500 rounded-xl text-white">
               <AlertCircle size={20} />
            </div>
            <div>
               <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Риск просрочки</p>
               <p className="text-sm font-bold text-amber-700">Оставание от графика: 2 дня</p>
            </div>
         </div>
         <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="p-2 bg-emerald-500 rounded-xl text-white">
               <Plus size={20} />
            </div>
            <div>
               <p className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-1">Авто-оптимизация</p>
               <p className="text-sm font-bold text-emerald-700">ИИ пересчитал логистику (+4ч)</p>
            </div>
         </div>
      </div>
    </div>
  );
}
