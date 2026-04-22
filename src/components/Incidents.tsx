/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Plus, 
  Camera, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  MapPin,
  MoreVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import Comments from "./Comments";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'; // Пятиуровневый анализ
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  location: string;
  author: string;
  createdAt: string;
  photos: number;
}

export default function Incidents() {
  const { profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([
    { 
      id: '1', 
      title: 'Повреждение кабеля', 
      description: 'При проведении земляных работ был поврежден силовой кабель.', 
      severity: 'L4', 
      status: 'investigating', 
      location: 'Сектор Б-4', 
      author: 'Сергей С.', 
      createdAt: '2024-04-14 10:30',
      photos: 3
    },
    { 
      id: '2', 
      title: 'Отсутствие ограждения', 
      description: 'На 3-м этаже отсутствует временное ограждение лестничного марша.', 
      severity: 'L5', 
      status: 'open', 
      location: 'Корпус 1, эт. 3', 
      author: profile?.displayName || 'Пользователь', 
      createdAt: '2024-04-15 09:15',
      photos: 1
    },
    { 
      id: '3', 
      title: 'Задержка поставки кирпича', 
      description: 'Поставщик задерживает отгрузку на 2 рабочих дня.', 
      severity: 'L2', 
      status: 'resolved', 
      location: 'Склад', 
      author: 'Игорь К.', 
      createdAt: '2024-04-13 14:00',
      photos: 0
    },
  ]);

  const severityInfo = {
    L1: { label: 'L1: Инфо', color: 'bg-blue-500', full: 'Информационный - влияние минимально' },
    L2: { label: 'L2: Предупреждение', color: 'bg-yellow-500', full: 'Предупреждение - незначительное отклонение' },
    L3: { label: 'L3: Существенный', color: 'bg-orange-500', full: 'Существенный - требует внимания архитектора' },
    L4: { label: 'L4: Критический', color: 'bg-red-600', full: 'Критический - риск срыва этапа' },
    L5: { label: 'L5: Фатальный', color: 'bg-black', full: 'Фатальный - чрезвычайная ситуация / остановка работ' }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newIncidentData, setNewIncidentData] = useState({
    title: '',
    severity: 'L2' as Incident['severity'],
    location: '',
    description: '',
    photosCount: 0
  });

  const chartData = ['L1', 'L2', 'L3', 'L4', 'L5'].map(level => ({
    name: level,
    count: incidents.filter(i => i.severity === level).length,
    color: level === 'L1' ? '#3b82f6' : level === 'L2' ? '#eab308' : level === 'L3' ? '#f97316' : level === 'L4' ? '#dc2626' : '#000'
  }));

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      title: newIncidentData.title,
      description: newIncidentData.description,
      severity: newIncidentData.severity,
      status: 'open',
      location: newIncidentData.location,
      author: profile?.displayName || 'Пользователь',
      createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      photos: newIncidentData.photosCount
    };
    setIncidents([incident, ...incidents]);
    toast.success("Инцидент успешно зарегистрирован");
    setIsAddDialogOpen(false);
    setNewIncidentData({ title: '', severity: 'L2', location: '', description: '', photosCount: 0 });
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status: 'resolved' as const } : inc
    ));
    toast.success("Статус инцидента изменен на 'Решен'");
  };

  const handleEditIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updatedIncident: Incident = {
      ...editingIncident,
      title: formData.get('title') as string,
      severity: formData.get('severity') as Incident['severity'],
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as Incident['status'],
    };
    
    setIncidents(incidents.map(inc => inc.id === editingIncident.id ? updatedIncident : inc));
    toast.success("Инцидент обновлен");
    setEditingIncident(null);
  };

  const handleOpenDetail = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailDialogOpen(true);
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    const info = severityInfo[severity];
    return <Badge className={cn(info.color, "text-white border-none")}>{info.label}</Badge>;
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Пятиуровневый анализ ошибок</h2>
          <p className="text-slate-500 text-sm sm:text-base">Глубокая классификация инцидентов, рисков и нарушений ТБ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-slate-200">
             <BarChart3 className="w-4 h-4 mr-2" /> Аналитика рисков
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger nativeButton={false} render={
              <Button className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                <Plus size={18} className="mr-2" /> Фиксировать нарушение
              </Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Регистрация нарушения / риска</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddIncident} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input 
                    placeholder="Краткое описание проблемы" 
                    required 
                    value={newIncidentData.title}
                    onChange={(e) => setNewIncidentData({...newIncidentData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Уровень анализа (L1-L5)</Label>
                    <Select 
                      value={newIncidentData.severity} 
                      onValueChange={(v: any) => setNewIncidentData({...newIncidentData, severity: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(severityInfo).map(([key, info]) => (
                          <SelectItem key={key} value={key}>{info.full}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Местоположение</Label>
                    <Input 
                      placeholder="Напр: Сектор А-2" 
                      required 
                      value={newIncidentData.location}
                      onChange={(e) => setNewIncidentData({...newIncidentData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Подробное описание</Label>
                  <Textarea 
                    placeholder="Опишите обстоятельства происшествия..." 
                    className="min-h-[120px]" 
                    value={newIncidentData.description}
                    onChange={(e) => setNewIncidentData({...newIncidentData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Фотофиксация</Label>
                  <div 
                    className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-400 transition-colors cursor-pointer justify-center text-slate-500 bg-slate-50/50"
                    onClick={() => document.getElementById('incident-photo-upload')?.click()}
                  >
                    <Camera className="w-8 h-8 opacity-50" />
                    <div className="text-center">
                      <span className="text-sm font-medium block">Нажмите для загрузки фото</span>
                      <span className="text-xs opacity-60">PNG, JPG до 10МБ</span>
                    </div>
                    <input 
                      id="incident-photo-upload" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setNewIncidentData(prev => ({ ...prev, photosCount: (prev.photosCount || 0) + files.length }));
                          toast.success(`Прикреплено фото: ${files.length}`);
                        }
                      }}
                    />
                  </div>
                  {newIncidentData.photosCount > 0 && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} /> Прикреплено файлов: {newIncidentData.photosCount}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
                  <Button className="bg-red-600 text-white" type="submit">Зарегистрировать</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div>
                  <CardTitle className="text-lg">Профиль ошибок объекта</CardTitle>
                  <CardDescription>Распределение инцидентов по уровням L1-L5</CardDescription>
               </div>
               <div className="p-2 bg-slate-50 rounded-lg">
                  <BarChart3 size={18} className="text-slate-400" />
               </div>
            </CardHeader>
            <CardContent>
               <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                           labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader>
               <CardTitle className="text-lg">Легенда анализа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {Object.entries(severityInfo).map(([key, info]) => (
                  <div key={key} className="flex gap-3">
                     <div className={cn("w-2 h-10 shrink-0 rounded-full", info.color)} />
                     <div>
                        <p className="text-xs font-bold uppercase">{info.label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{info.full}</p>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{incidents.length}</p>
                <p className="text-xs text-slate-500">Активных</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1</p>
                <p className="text-xs text-slate-500">Критических</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">12</p>
                <p className="text-xs text-slate-500">Решено за месяц</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">4.2ч</p>
                <p className="text-xs text-slate-500">Ср. время реакции</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="border-none shadow-sm bg-white overflow-hidden">
              <div className={cn(
                "h-1 w-full",
                severityInfo[incident.severity]?.color || "bg-slate-200"
              )} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(incident.severity)}
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none uppercase text-[10px] font-bold">
                        {incident.status === 'open' ? 'Открыт' : incident.status === 'investigating' ? 'Расследование' : 'Решен'}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {incident.createdAt}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{incident.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{incident.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User size={14} className="text-slate-400" />
                        <span>Автор: {incident.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Camera size={14} className="text-slate-400" />
                        <span>{incident.photos} фото</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetail(incident)}>Подробнее</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingIncident(incident)}>
                      <MoreVertical size={16} />
                    </Button>
                    {incident.status !== 'resolved' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleResolveIncident(incident.id)}
                      >
                        Решить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                {getSeverityBadge(selectedIncident.severity)}
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none uppercase text-[10px] font-bold">
                  {selectedIncident.status === 'open' ? 'Открыт' : selectedIncident.status === 'investigating' ? 'Расследование' : 'Решен'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-400">Дата создания</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock size={14} /> {selectedIncident.createdAt}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Местоположение</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin size={14} /> {selectedIncident.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Автор</p>
                  <p className="font-medium flex items-center gap-2">
                    <User size={14} /> {selectedIncident.author}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Фотофиксация</p>
                  <p className="font-medium flex items-center gap-2">
                    <Camera size={14} /> {selectedIncident.photos} фото
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">Описание инцидента</p>
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              <Comments contextId={`incident_${selectedIncident.id}`} />

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Закрыть</Button>
                {selectedIncident.status !== 'resolved' && (
                  <Button 
                    className="bg-green-600 text-white" 
                    onClick={() => {
                      handleResolveIncident(selectedIncident.id);
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    Отметить как решенный
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingIncident} onOpenChange={(open) => !open && setEditingIncident(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать инцидент</DialogTitle>
          </DialogHeader>
          {editingIncident && (
            <form onSubmit={handleEditIncident} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input name="title" defaultValue={editingIncident.title} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Уровень анализа (L1-L5)</Label>
                  <Select name="severity" defaultValue={editingIncident.severity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.full}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select name="status" defaultValue={editingIncident.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Открыт</SelectItem>
                      <SelectItem value="investigating">Расследование</SelectItem>
                      <SelectItem value="resolved">Решен</SelectItem>
                      <SelectItem value="closed">Закрыт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Местоположение</Label>
                <Input name="location" defaultValue={editingIncident.location} required />
              </div>
              <div className="space-y-2">
                <Label>Подробное описание</Label>
                <Textarea name="description" defaultValue={editingIncident.description} className="min-h-[120px]" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setEditingIncident(null)}>Отмена</Button>
                <Button className="bg-slate-900" type="submit">Сохранить изменения</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
