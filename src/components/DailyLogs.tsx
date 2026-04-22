/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Cloud, 
  Users, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MoreVertical,
  Camera,
  Sparkles,
  Loader2,
  X,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import { geminiService } from "@/services/geminiService";
import { workTypeService, WorkType } from "@/services/workTypeService";
import { fileService } from "@/services/fileService";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Comments from "./Comments";

interface DailyLogWork {
  workId: string;
  title: string;
  volume: string;
  unit: string;
  baseValue: number;
}

interface DailyLog {
  id: string;
  date: string;
  author: string;
  weather: string;
  workforce: number;
  summary: string;
  photos: number;
  status: 'draft' | 'submitted' | 'approved';
  workEntries?: DailyLogWork[];
}

export default function DailyLogs() {
  const { profile } = useAuth();
  const [photosCount, setPhotosCount] = useState(0);
  const [summary, setSummary] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [selectedWorks, setSelectedWorks] = useState<DailyLogWork[]>([]);
  const projectWorkTypes = workTypeService.getWorks();
  const [logs, setLogs] = useState<DailyLog[]>([
    { 
      id: '1', 
      date: '2024-04-14', 
      author: 'Иван П.', 
      weather: 'Солнечно, +15°C', 
      workforce: 12, 
      summary: 'Завершена заливка фундамента секции А. Начаты работы по гидроизоляции.', 
      photos: 4,
      status: 'approved',
      workEntries: [
        { workId: 'w1', title: 'Заливка бетона', volume: '45', unit: 'м3', baseValue: 1 },
        { workId: 'w2', title: 'Гидроизоляция', volume: '120', unit: 'м2', baseValue: 1 }
      ]
    },
    { 
      id: '2', 
      date: '2024-04-15', 
      author: profile?.displayName || 'Пользователь', 
      weather: 'Облачно, +12°C', 
      workforce: 10, 
      summary: 'Продолжение работ по армированию стен 1-го этажа. Доставка бетона задержана на 2 часа.', 
      photos: 2,
      status: 'submitted',
      workEntries: [
        { workId: 'w3', title: 'Армирование стен', volume: '2.5', unit: 'т', baseValue: 1 }
      ]
    },
  ]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const dateVal = formData.get('date');
    const weatherVal = formData.get('weather');
    const workforceVal = formData.get('workforce');

    const newLog: DailyLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: typeof dateVal === 'string' ? dateVal : new Date().toISOString().split('T')[0],
      author: profile?.displayName || 'Пользователь',
      weather: typeof weatherVal === 'string' ? weatherVal : '',
      workforce: Number(workforceVal) || 0,
      summary: summary,
      photos: photosCount,
      status: 'submitted',
      workEntries: selectedWorks
    };
    setLogs([newLog, ...logs]);
    toast.success("Дневной отчет успешно создан");
    setSummary('');
    setPhotosCount(0);
    setSelectedWorks([]);
    
    // Close dialog by clicking outside or using state if managed
    // For now we rely on the component being re-rendered or unmounted if inside a controlled dialog
  };

  const handleEditLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const dateVal = formData.get('date');
    const weatherVal = formData.get('weather');
    const workforceVal = formData.get('workforce');

    const updatedLog: DailyLog = {
      ...editingLog,
      date: typeof dateVal === 'string' ? dateVal : editingLog.date,
      weather: typeof weatherVal === 'string' ? weatherVal : editingLog.weather,
      workforce: Number(workforceVal) || editingLog.workforce,
      summary: summary,
      photos: photosCount || editingLog.photos,
      workEntries: selectedWorks
    };
    
    setLogs(logs.map(l => l.id === editingLog.id ? updatedLog : l));
    toast.success("Отчет обновлен");
    setEditingLog(null);
    setSummary('');
    setPhotosCount(0);
    setSelectedWorks([]);
  };

  const handleAiRewrite = async () => {
    if (!summary || summary.trim().length < 5) {
      toast.error("Введите хотя бы несколько слов для улучшения");
      return;
    }

    setIsRewriting(true);
    try {
      const professionalText = await geminiService.rewriteProfessionally(summary);
      setSummary(professionalText);
      toast.success("Текст профессионально переработан ИИ");
    } catch (error) {
      toast.error("Не удалось переработать текст");
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Дневные отчеты</h2>
          <p className="text-slate-500">Ежедневная фиксация прогресса и условий на объекте</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button className="bg-slate-900 h-10 px-6" />}>
            <Plus size={18} className="mr-2" /> Создать отчет
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Новый дневной отчет</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLog} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Дата</Label>
                  <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weather">Погода</Label>
                  <Input id="weather" name="weather" placeholder="Напр: Солнечно, +20°C" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workforce">Количество рабочих на смене</Label>
                <Input id="workforce" name="workforce" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Виды выполненных работ</Label>
                <div className="space-y-4">
                   <Select onValueChange={(val: string) => {
                      const work = projectWorkTypes.find(w => w.id === val);
                      if (work && !selectedWorks.find(sw => sw.workId === val)) {
                         setSelectedWorks([...selectedWorks, {
                            workId: work.id,
                            title: work.title,
                            volume: '0',
                            unit: work.unit,
                            baseValue: work.baseUnitValue
                         }]);
                      }
                   }}>
                      <SelectTrigger>
                         <SelectValue placeholder="Добавить из реестра ГЭСН..." />
                      </SelectTrigger>
                      <SelectContent>
                         <ScrollArea className="h-40">
                            {projectWorkTypes.map(work => (
                               <SelectItem key={work.id} value={work.id}>
                                  {work.code} - {work.title} ({work.unit})
                               </SelectItem>
                            ))}
                         </ScrollArea>
                      </SelectContent>
                   </Select>
                   
                   <div className="space-y-2">
                      {selectedWorks.map((work, idx) => (
                         <div key={work.workId} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-900 truncate">{work.title}</span>
                               <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-400 hover:text-red-500 rounded-full"
                                  onClick={() => setSelectedWorks(selectedWorks.filter(sw => sw.workId !== work.workId))}
                               >
                                  <X size={14} />
                               </Button>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="flex-1">
                                  <Input 
                                     type="number" 
                                     placeholder="Объем" 
                                     className="h-8 text-xs bg-white"
                                     value={work.volume}
                                     onChange={(e) => {
                                        const newWorks = [...selectedWorks];
                                        newWorks[idx].volume = e.target.value;
                                        setSelectedWorks(newWorks);
                                     }}
                                  />
                               </div>
                               <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="h-8 bg-white text-[10px] px-2 font-normal">
                                     {work.unit}
                                  </Badge>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Краткое описание работ (дополнительно)</Label>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                    onClick={handleAiRewrite}
                    disabled={isRewriting}
                  >
                    {isRewriting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Улучшить с ИИ
                  </Button>
                </div>
                <Textarea 
                  placeholder="Что было сделано за сегодня..." 
                  className="min-h-[150px]" 
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Фотофиксация</Label>
                <div 
                   className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-400 transition-colors cursor-pointer justify-center text-slate-500 bg-slate-50/50"
                   onClick={() => document.getElementById('log-photo-upload')?.click()}
                >
                  <Camera className="w-6 h-6 opacity-50" />
                  <div className="text-center">
                    <span className="text-sm font-medium block">Добавить фотографии</span>
                    <span className="text-xs opacity-60">Прикреплено: {photosCount}</span>
                  </div>
                  <input 
                    id="log-photo-upload" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        Array.from(files).forEach(file => {
                          fileService.saveFile({
                            name: file.name,
                            type: file.type,
                            size: `${(file.size / 1024).toFixed(1)} KB`,
                            module: 'logs',
                            projectId: 'current'
                          });
                        });
                        setPhotosCount(prev => prev + files.length);
                        toast.success(`Прикреплено фото: ${files.length}. Сохранено в архив.`);
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={(e) => {
                  const closeBtn = e.currentTarget.closest('[role="dialog"]')?.querySelector('[data-radix-collection-item]');
                  (closeBtn as any)?.click();
                }}>Отмена</Button>
                <Button className="bg-slate-900" type="submit">Создать отчет</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {logs.map((log) => (
          <Card 
            key={log.id} 
            className="border-none shadow-sm bg-white hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer"
            onClick={() => setSelectedLog(log)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      "border-none",
                      log.status === 'approved' ? "bg-green-100 text-green-600" :
                      log.status === 'submitted' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {log.status === 'approved' ? 'Утвержден' : log.status === 'submitted' ? 'На проверке' : 'Черновик'}
                    </Badge>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <CalendarIcon size={14} className="text-slate-400" />
                      {log.date}
                    </span>
                    <span className="text-xs text-slate-400">• Автор: {log.author}</span>
                  </div>
                  
                  <p className="text-slate-700 leading-relaxed line-clamp-2">{log.summary}</p>

                  {log.workEntries && log.workEntries.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       {log.workEntries.slice(0, 3).map(w => (
                         <Badge key={w.workId} variant="outline" className="text-[10px] bg-indigo-50/30 text-indigo-600 border-indigo-100">
                           {w.title}: {w.volume} {w.unit}
                         </Badge>
                       ))}
                       {log.workEntries.length > 3 && (
                         <span className="text-[10px] text-slate-400 font-medium">+{log.workEntries.length - 3} еще</span>
                       )}
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Cloud size={14} className="text-blue-400" />
                      <span>{log.weather}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={14} className="text-slate-400" />
                      <span>{log.workforce} чел.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Camera size={14} className="text-slate-400" />
                      <span>{log.photos} фото</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    setEditingLog(log);
                    setSummary(log.summary);
                    setSelectedWorks(log.workEntries || []);
                    setPhotosCount(0);
                  }}>
                    <MoreVertical size={18} className="text-slate-400" />
                  </Button>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedLog && (
                <Badge variant="outline" className={cn(
                  "border-none",
                  selectedLog.status === 'approved' ? "bg-green-100 text-green-600" :
                  selectedLog.status === 'submitted' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                )}>
                  {selectedLog.status === 'approved' ? 'Утвержден' : selectedLog.status === 'submitted' ? 'На проверке' : 'Черновик'}
                </Badge>
              )}
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                <CalendarIcon size={14} className="text-slate-400" />
                {selectedLog?.date}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">Дневной отчет от {selectedLog?.date}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Автор</span>
              <div className="text-sm font-bold text-slate-900">{selectedLog?.author}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Погода</span>
              <div className="text-sm font-bold text-slate-900">{selectedLog?.weather}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Рабочих</span>
              <div className="text-sm font-bold text-slate-900">{selectedLog?.workforce} чел.</div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedLog?.workEntries && selectedLog.workEntries.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Выполненные работы</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLog.workEntries.map(work => (
                    <div key={work.workId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm text-slate-700">{work.title}</span>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                        {work.volume} {work.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Описание работ</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedLog?.summary}</p>
            </div>

            <Comments contextId={`daily_log_${selectedLog?.id}`} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать дневной отчет</DialogTitle>
          </DialogHeader>
          {editingLog && (
            <form onSubmit={handleEditLog} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Дата</Label>
                  <Input id="edit-date" name="date" type="date" defaultValue={editingLog.date} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weather">Погода</Label>
                  <Input id="edit-weather" name="weather" defaultValue={editingLog.weather} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workforce">Количество рабочих на смене</Label>
                <Input id="edit-workforce" name="workforce" type="number" defaultValue={editingLog.workforce} />
              </div>
              <div className="space-y-2">
                <Label>Виды выполненных работ</Label>
                <div className="space-y-4">
                   <Select onValueChange={(val: string) => {
                      const work = projectWorkTypes.find(w => w.id === val);
                      if (work && !selectedWorks.find(sw => sw.workId === val)) {
                         setSelectedWorks([...selectedWorks, {
                            workId: work.id,
                            title: work.title,
                            volume: '0',
                            unit: work.unit,
                            baseValue: work.baseUnitValue
                         }]);
                      }
                   }}>
                      <SelectTrigger>
                         <SelectValue placeholder="Добавить из реестра ГЭСН..." />
                      </SelectTrigger>
                      <SelectContent>
                         <ScrollArea className="h-40">
                            {projectWorkTypes.map(work => (
                               <SelectItem key={work.id} value={work.id}>
                                  {work.code} - {work.title} ({work.unit})
                               </SelectItem>
                            ))}
                         </ScrollArea>
                      </SelectContent>
                   </Select>
                   
                   <div className="space-y-2">
                      {selectedWorks.map((work, idx) => (
                         <div key={work.workId} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-900 truncate">{work.title}</span>
                               <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-400 hover:text-red-500 rounded-full"
                                  onClick={() => setSelectedWorks(selectedWorks.filter(sw => sw.workId !== work.workId))}
                               >
                                  <X size={14} />
                               </Button>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="flex-1">
                                  <Input 
                                     type="number" 
                                     placeholder="Объем" 
                                     className="h-8 text-xs bg-white"
                                     value={work.volume}
                                     onChange={(e) => {
                                        const newWorks = [...selectedWorks];
                                        newWorks[idx].volume = e.target.value;
                                        setSelectedWorks(newWorks);
                                     }}
                                  />
                               </div>
                               <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="h-8 bg-white text-[10px] px-2 font-normal">
                                     {work.unit}
                                  </Badge>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Краткое описание работ (дополнительно)</Label>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                    onClick={handleAiRewrite}
                    disabled={isRewriting}
                  >
                    {isRewriting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Улучшить с ИИ
                  </Button>
                </div>
                <Textarea 
                  placeholder="Что было сделано за сегодня..." 
                  className="min-h-[150px]" 
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={() => setEditingLog(null)}>Отмена</Button>
                <Button className="bg-slate-900" type="submit">Сохранить изменения</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
