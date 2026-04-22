/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Camera, 
  Clock,
  Box,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  ArrowUpDown,
  Trash2,
  ExternalLink,
  ShieldCheck,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/NotificationService";
import { reportService } from "@/services/ReportService";
import { useAuth } from "@/AuthContext";
import Comments from "./Comments";
import TaskPhotos from "./TaskPhotos";
import { PhotoDocumentation as TaskPhoto } from '@/types';
import { useEffect } from 'react';
import { FileDown } from 'lucide-react';

interface TasksProps {
  onShowInBim?: (elementId: string) => void;
}

export default function Tasks({ onShowInBim }: TasksProps) {
  const { profile } = useAuth();
  const [photosCount, setPhotosCount] = useState(0);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'category'>('category');
  const [sortBy, setSortBy] = useState<'date' | 'deadline' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Фундамент': true,
    'Стены': true,
    'Кровля': true,
    'Общее': true
  });

  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      title: 'Армирование плиты фундамента', 
      description: 'Укладка арматурного каркаса согласно проекту КЖ',
      status: 'in-progress', 
      priority: 'high', 
      category: 'Фундамент',
      dueDate: '2024-04-15',
      createdAt: '2024-04-01',
      comments: 4,
      photos: [
        { id: 'p1', url: 'https://picsum.photos/seed/construction1/800/600', description: 'Основное армирование завершено', authorId: 'e1', authorName: 'Сергей С.', createdAt: '2024-04-10T10:00:00Z' },
        { id: 'p2', url: 'https://picsum.photos/seed/construction2/800/600', description: 'Проверка узлов примыкания', authorId: 'e1', authorName: 'Сергей С.', createdAt: '2024-04-10T11:30:00Z' }
      ],
      assignedTo: 'Сергей С.',
      bimElementId: '1245',
      progress: 65
    },
    { 
      id: '2', 
      title: 'Гидроизоляция цоколя', 
      description: 'Нанесение битумной мастики в два слоя',
      status: 'todo', 
      priority: 'medium', 
      category: 'Фундамент',
      dueDate: '2024-04-18',
      createdAt: '2024-04-05',
      comments: 0,
      photos: [],
      assignedTo: 'Алексей И.',
      progress: 0
    },
    { 
      id: '3', 
      title: 'Ошибка в кладке 1-го этажа', 
      description: 'Отклонение от вертикали более 10мм на 3 метра',
      status: 'error', 
      priority: 'critical', 
      category: 'Стены',
      dueDate: '2024-04-14',
      createdAt: '2024-04-10',
      comments: 12,
      photos: [
        { id: 'p3', url: 'https://picsum.photos/seed/wall-error/800/600', description: 'Замер отклонения на углу здания', authorId: 'i1', authorName: 'Иван П.', createdAt: '2024-04-13T09:00:00Z' }
      ],
      assignedTo: 'Иван П.',
      errorType: 'critical',
      progress: 15
    },
    { 
      id: '4', 
      title: 'Заливка бетона (Б25)', 
      description: 'Приемка бетона и вибрирование',
      status: 'done', 
      priority: 'high', 
      category: 'Фундамент',
      dueDate: '2024-04-12',
      createdAt: '2024-04-02',
      comments: 2,
      photos: [
        { id: 'p4', url: 'https://picsum.photos/seed/concrete1/800/600', description: 'Начало приемки бетона', authorId: 'e1', authorName: 'Сергей С.', createdAt: '2024-04-12T08:00:00Z' },
        { id: 'p5', url: 'https://picsum.photos/seed/concrete2/800/600', description: 'Образцы для лаборатории взяты', authorId: 'e1', authorName: 'Сергей С.', createdAt: '2024-04-12T09:30:00Z' },
        { id: 'p6', url: 'https://picsum.photos/seed/concrete3/800/600', description: 'Заливка завершена', authorId: 'e1', authorName: 'Сергей С.', createdAt: '2024-04-12T14:00:00Z' }
      ],
      assignedTo: 'Сергей С.',
      progress: 100
    },
    { 
      id: '5', 
      title: 'Монтаж стропильной системы', 
      description: 'Установка стропил и обрешетки',
      status: 'todo', 
      priority: 'high', 
      category: 'Кровля',
      dueDate: '2024-04-25',
      createdAt: '2024-04-12',
      comments: 1,
      photos: [],
      assignedTo: 'Алексей И.',
      progress: 0
    },
  ]);

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && progress > task.progress) {
        notificationService.addNotification({
          title: "Прогресс задачи обновлен",
          message: `Задача "${task.title}" теперь выполнена на ${progress}%`,
          type: "success"
        });
      }
      
      return prev.map(t => t.id === id ? { 
        ...t, 
        progress,
        status: progress === 100 ? 'done' : (progress > 0 ? 'in-progress' : t.status)
      } : t);
    });
  };

  const priorityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const assignees = useMemo(() => {
    const unique = new Set(tasks.map(t => t.assignedTo).filter(Boolean));
    return Array.from(unique).sort();
  }, [tasks]);

  const filteredTasks = tasks.filter(t => {
    const matchesMine = !showOnlyMine || t.assignedTo === profile?.displayName || t.assignedTo === 'Пользователь';
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                         (t.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assignedTo === assigneeFilter;
    
    return matchesMine && matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  useEffect(() => {
    // Check deadlines on mount
    notificationService.checkTaskDeadlines(tasks);
  }, []);

  const sortedTasks = [...filteredTasks]
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'deadline') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        comparison = priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const key = groupBy === 'none' ? 'Все задачи' : (task[groupBy] || 'Без категории');
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const getGroupLabel = (key: string) => {
    if (groupBy === 'status') {
      switch (key) {
        case 'todo': return 'К выполнению';
        case 'in-progress': return 'В работе';
        case 'done': return 'Готово';
        case 'error': return 'Ошибки';
        default: return key;
      }
    }
    if (groupBy === 'priority') {
      switch (key) {
        case 'critical': return 'Критический приоритет';
        case 'high': return 'Высокий приоритет';
        case 'medium': return 'Средний приоритет';
        case 'low': return 'Низкий приоритет';
        default: return key;
      }
    }
    return key;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-none">К выполнению</Badge>;
      case 'in-progress': return <Badge variant="outline" className="bg-blue-100 text-blue-600 border-none">В работе</Badge>;
      case 'done': return <Badge variant="outline" className="bg-green-100 text-green-600 border-none">Готово</Badge>;
      case 'error': return <Badge variant="outline" className="bg-red-100 text-red-600 border-none">Ошибка</Badge>;
      default: return null;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const dueDate = formData.get('dueDate') as string;
    const assignedTo = formData.get('assignedTo') as string;

    // Validation
    if (!title || title.length < 3) {
      toast.error("Название задачи слишком короткое");
      return;
    }
    if (!category) {
      toast.error("Выберите категорию");
      return;
    }
    if (!dueDate) {
      toast.error("Укажите срок выполнения");
      return;
    }

    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'todo',
      priority: priority || 'medium',
      category,
      dueDate,
      createdAt: new Date().toISOString(),
      comments: 0,
      photos: [] as TaskPhoto[],
      assignedTo: assignedTo === '1' ? 'Сергей С.' : (assignedTo === '2' ? 'Алексей И.' : 'Пользователь'),
      progress: 0
    };

    setTasks(prev => [newTask, ...prev]);
    setPhotosCount(0);
    
    notificationService.addNotification({
      title: "Новая задача создана",
      message: `В категорию "${category}" добавлена задача: ${title}`,
      type: "info"
    });
    toast.success("Задача успешно создана");
    
    // Reset form or close dialog logic would go here if controlled
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Поиск задач..." 
                className="pl-10 bg-white border-slate-200 w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
              <Button 
                variant={!showOnlyMine ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setShowOnlyMine(false)}
                className="text-xs h-8 flex-1 sm:flex-none"
              >
                Все задачи
              </Button>
              <Button 
                variant={showOnlyMine ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setShowOnlyMine(true)}
                className="text-xs h-8 flex-1 sm:flex-none"
              >
                Мои задачи
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
              <Button 
                variant={groupBy === 'none' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setGroupBy('none')}
                className="text-xs h-8 flex-1 sm:flex-none"
              >
                Список
              </Button>
              <Button 
                variant={groupBy === 'category' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setGroupBy('category')}
                className="text-xs h-8 flex-1 sm:flex-none"
              >
                Группы
              </Button>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm shadow-lg shadow-slate-200" />}>
              <Plus className="w-4 h-4 mr-2" /> Создать задачу
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Название</Label>
                    <Input id="title" name="title" placeholder="Напр: Установка опалубки" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea id="description" name="description" placeholder="Детали задачи..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Фундамент">Фундамент</SelectItem>
                        <SelectItem value="Стены">Стены</SelectItem>
                        <SelectItem value="Кровля">Кровля</SelectItem>
                        <SelectItem value="Инженерные сети">Инженерные сети</SelectItem>
                        <SelectItem value="Общее">Общее</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Приоритет</Label>
                      <Select name="priority">
                        <SelectTrigger>
                          <SelectValue placeholder="Выбрать" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="critical">Критический</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Срок выполнения</Label>
                      <Input id="dueDate" name="dueDate" type="date" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Исполнитель</Label>
                    <Select name="assignedTo">
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Сергей С.</SelectItem>
                        <SelectItem value="2">Алексей И.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Фотофиксация</Label>
                    <div 
                      className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-400 transition-colors cursor-pointer justify-center text-slate-500 bg-slate-50/50"
                      onClick={() => document.getElementById('task-photo-upload')?.click()}
                    >
                      <Camera className="w-6 h-6 opacity-50" />
                      <div className="text-center">
                        <span className="text-sm font-medium block">Добавить фотографии</span>
                        <span className="text-xs opacity-60">Прикреплено: {photosCount}</span>
                      </div>
                      <input 
                        id="task-photo-upload" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setPhotosCount(prev => prev + files.length);
                            toast.success(`Прикреплено фото: ${files.length}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" type="button" className="h-12 sm:h-10 text-base sm:text-sm">Отмена</Button>
                  <Button className="bg-slate-900 h-12 sm:h-10 text-base sm:text-sm" type="submit">Создать</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Фильтры:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[200px]">
            <div className="w-full sm:w-[140px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 bg-slate-50 border-none">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="todo">К выполнению</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="done">Готово</SelectItem>
                  <SelectItem value="error">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[140px]">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 bg-slate-50 border-none">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[160px]">
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 bg-slate-50 border-none">
                  <SelectValue placeholder="Исполнитель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все исполнители</SelectItem>
                  {assignees.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-[180px]">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-9 bg-slate-50 border-none">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">По дате создания</SelectItem>
                    <SelectItem value="deadline">По крайнему сроку</SelectItem>
                    <SelectItem value="priority">По приоритету</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 bg-slate-50 border-none shrink-0"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="rotate-180" />}
              </Button>
            </div>

            {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || searchQuery !== '') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAssigneeFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Task Details Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {selectedTask && getStatusBadge(selectedTask.status)}
                <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-tight border-slate-200 text-slate-500">
                  {selectedTask?.category}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <DialogTitle className="text-2xl font-bold text-slate-900">{selectedTask?.title}</DialogTitle>
                <Button 
                  onClick={() => {
                    const promise = reportService.generateTaskReport(selectedTask);
                    toast.promise(promise, {
                      loading: 'Генерация PDF...',
                      success: 'Отчет успешно создан',
                      error: 'Ошибка при генерации PDF'
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Скачать PDF Отчёт
                </Button>
              </div>
              <DialogDescription className="text-slate-500 mt-2">
                {selectedTask?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-slate-100 my-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Исполнитель</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {selectedTask?.assignedTo.split(' ')[0][0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{selectedTask?.assignedTo}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Срок выполнения</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock size={14} className="text-slate-400" />
                  {selectedTask?.dueDate}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Приоритет</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {selectedTask && getPriorityIcon(selectedTask.priority)}
                  {selectedTask?.priority === 'critical' ? 'Критический' : 
                   selectedTask?.priority === 'high' ? 'Высокий' : 'Средний'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Прогресс выполнения</span>
                  <span className="text-slate-900 font-bold">{selectedTask?.progress}%</span>
                </div>
                <Progress value={selectedTask?.progress} className="h-2" />
              </div>

              <TaskPhotos 
                taskId={selectedTask?.id} 
                photos={selectedTask?.photos || []} 
                onPhotosChange={(newPhotos) => {
                  setTasks(prev => prev.map(t => t.id === selectedTask.id ? { 
                    ...t, 
                    photos: newPhotos
                  } : t));
                  setSelectedTask((prev: any) => ({ ...prev, photos: newPhotos }));
                }}
              />

              <Comments contextId={`task_${selectedTask?.id}`} />
            </div>
          </DialogContent>
        </Dialog>

        {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
          <div key={groupKey} className="space-y-4">
            <button 
              onClick={() => toggleGroup(groupKey)}
              className="flex items-center gap-2 text-slate-900 hover:text-slate-600 transition-colors group"
            >
              {expandedGroups[groupKey] !== false ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                {getGroupLabel(groupKey)}
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {groupTasks.length}
                </span>
              </h3>
            </button>

            {(expandedGroups[groupKey] !== false) && (
              <div className="grid grid-cols-1 gap-4">
                {groupTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="border-none shadow-sm bg-white hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(task.status)}
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              {getPriorityIcon(task.priority)}
                              {task.priority === 'critical' ? 'Критично' : 'Срок: ' + task.dueDate}
                            </span>
                            {groupBy !== 'category' && task.category && (
                              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-tight border-slate-200 text-slate-500">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                          
                          <div className="space-y-2 w-full max-w-md">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Прогресс выполнения</span>
                              <span className="text-slate-900 font-bold">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-500",
                                  task.status === 'error' ? "bg-red-500" : 
                                  task.progress === 100 ? "bg-green-500" : "bg-blue-600"
                                )} 
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            {(profile?.role === 'admin' || task.assignedTo === profile?.displayName || task.assignedTo === 'Пользователь') && (
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="5"
                                value={task.progress}
                                onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>{task.comments}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                              <Camera className="w-4 h-4" />
                              <span>{task.photos.length}</span>
                            </div>
                            {task.bimElementId && (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                                  <Box className="w-4 h-4" />
                                  <span>BIM: {task.bimElementId}</span>
                                </div>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="h-auto p-0 text-xs text-blue-500 hover:text-blue-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onShowInBim?.(task.bimElementId!);
                                  }}
                                >
                                  Показать в BIM
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {task.assignedTo.split(' ')[0][0]}
                              </div>
                              <span className="text-sm text-slate-600">{task.assignedTo}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(profile?.role === 'admin' || task.assignedTo === profile?.displayName || task.assignedTo === 'Пользователь') ? (
                            <>
                              <Dialog open={!!editingTask && editingTask.id === task.id} onOpenChange={(open) => !open && setEditingTask(null)}>
                                <DialogTrigger render={<Button variant="ghost" size="icon" onClick={() => setEditingTask(task)} />}>
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать задачу</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-title">Название</Label>
                                      <Input id="edit-title" defaultValue={editingTask?.title} disabled={profile?.role !== 'admin'} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-description">Описание</Label>
                                      <Textarea id="edit-description" defaultValue={editingTask?.description} placeholder="Детали задачи..." disabled={profile?.role !== 'admin'} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label>Статус</Label>
                                        <Select defaultValue={editingTask?.status}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Выбрать" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="todo">К выполнению</SelectItem>
                                            <SelectItem value="in-progress">В работе</SelectItem>
                                            <SelectItem value="done">Готово</SelectItem>
                                            <SelectItem value="error">Ошибка</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label>Приоритет</Label>
                                        <Select defaultValue={editingTask?.priority} disabled={profile?.role !== 'admin'}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Выбрать" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">Низкий</SelectItem>
                                            <SelectItem value="medium">Средний</SelectItem>
                                            <SelectItem value="high">Высокий</SelectItem>
                                            <SelectItem value="critical">Критический</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-category">Категория</Label>
                                      <Select defaultValue={editingTask?.category} disabled={profile?.role !== 'admin'}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Выбрать категорию" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Фундамент">Фундамент</SelectItem>
                                          <SelectItem value="Стены">Стены</SelectItem>
                                          <SelectItem value="Кровля">Кровля</SelectItem>
                                          <SelectItem value="Инженерные сети">Инженерные сети</SelectItem>
                                          <SelectItem value="Общее">Общее</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label>Исполнитель</Label>
                                        <Select defaultValue={editingTask?.assignedTo === 'Сергей С.' ? '1' : '2'} disabled={profile?.role !== 'admin'}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Выбрать" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">Сергей С.</SelectItem>
                                            <SelectItem value="2">Алексей И.</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-dueDate">Срок выполнения</Label>
                                        <Input 
                                          id="edit-dueDate" 
                                          type="date" 
                                          defaultValue={editingTask?.dueDate}
                                          onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid gap-2">
                                      <div className="flex justify-between items-center">
                                        <Label htmlFor="edit-progress">Прогресс: {editingTask?.progress}%</Label>
                                      </div>
                                      <input 
                                        id="edit-progress"
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        step="5"
                                        defaultValue={editingTask?.progress}
                                        onChange={(e) => setEditingTask({...editingTask, progress: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setEditingTask(null)}>Отмена</Button>
                                    <Button className="bg-slate-900" onClick={() => {
                                      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
                                        ...editingTask,
                                        status: editingTask.progress === 100 ? 'done' : (editingTask.progress > 0 ? 'in-progress' : editingTask.status)
                                      } : t));
                                      setEditingTask(null);
                                      toast.success("Задача обновлена");
                                    }}>Сохранить изменения</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuGroup>
                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                      <Pencil className="w-4 h-4 mr-2" /> Редактировать
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast.info("Задача открыта во внешнем окне")}>
                                      <ExternalLink className="w-4 h-4 mr-2" /> Открыть
                                    </DropdownMenuItem>
                                    {profile?.role === 'admin' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => {
                                          toast.error("Задача удалена");
                                          notificationService.addNotification({
                                            title: "Задача удалена",
                                            message: `Задача "${task.title}" была удалена из проекта.`,
                                            type: "warning"
                                          });
                                        }}>
                                          <Trash2 className="w-4 h-4 mr-2" /> Удалить
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          ) : (
                            <Button variant="ghost" size="icon" disabled>
                              <ShieldCheck className="w-4 h-4 text-slate-300" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
