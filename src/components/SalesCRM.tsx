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
  Phone, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  ArrowRight,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/AuthContext";
import { Lead, LeadStatus } from "@/types";
import Comments from "./Comments";

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Новые', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Контакт установлен', color: 'bg-indigo-500' },
  { id: 'qualified', label: 'Квалифицирован', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Предложение', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Переговоры', color: 'bg-yellow-500' },
  { id: 'closed-won', label: 'Выиграно', color: 'bg-green-500' },
];

export default function SalesCRM() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      clientName: 'ООО "СтройИнвест"',
      contactPerson: 'Михаил Волков',
      email: 'm.volkov@stroyinvest.ru',
      phone: '+7 (900) 111-22-33',
      source: 'Сайт',
      status: 'new',
      estimatedValue: 15000000,
      probability: 20,
      score: 85,
      notes: 'Интересует строительство складского комплекса 2000 м2',
      assignedTo: 'Алексей И.',
      lastContactDate: '2024-04-14',
      createdAt: '2024-04-10'
    },
    {
      id: '2',
      clientName: 'ЖК "Зеленый Берег"',
      contactPerson: 'Анна Петрова',
      email: 'a.petrova@green-coast.ru',
      phone: '+7 (900) 444-55-66',
      source: 'Рекомендация',
      status: 'proposal',
      estimatedValue: 45000000,
      probability: 60,
      score: 92,
      notes: 'Тендер на фасадные работы 3-х корпусов',
      assignedTo: 'Алексей И.',
      lastContactDate: '2024-04-15',
      createdAt: '2024-03-25'
    },
    {
      id: '3',
      clientName: 'Частный заказчик',
      contactPerson: 'Дмитрий С.',
      email: 'dmitry@mail.ru',
      phone: '+7 (900) 777-88-99',
      source: 'Instagram',
      status: 'negotiation',
      estimatedValue: 8000000,
      probability: 85,
      score: 45,
      notes: 'Загородный дом, проект готов, обсуждаем смету',
      assignedTo: 'Сергей С.',
      lastContactDate: '2024-04-12',
      createdAt: '2024-04-01'
    },
    {
      id: '4',
      clientName: 'ТЦ "МегаПолис"',
      contactPerson: 'Игорь К.',
      email: 'i.k@megapolis.ru',
      phone: '+7 (900) 000-11-22',
      source: 'Холодный звонок',
      status: 'contacted',
      estimatedValue: 12000000,
      probability: 40,
      score: 68,
      notes: 'Реконструкция парковки',
      assignedTo: 'Сергей С.',
      lastContactDate: '2024-04-13',
      createdAt: '2024-04-05'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const stats = useMemo(() => {
    const totalValue = leads.reduce((sum, l) => sum + (l.status !== 'closed-lost' ? l.estimatedValue : 0), 0);
    const wonValue = leads.filter(l => l.status === 'closed-won').reduce((sum, l) => sum + l.estimatedValue, 0);
    const avgScore = leads.reduce((sum, l) => sum + l.score, 0) / leads.length;
    return { totalValue, wonValue, avgScore };
  }, [leads]);

  const moveLead = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, lastContactDate: new Date().toISOString().split('T')[0] } : l));
    toast.success("Статус сделки обновлен");
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientName = formData.get('clientName') as string;
    const contactPerson = formData.get('contactPerson') as string;
    const email = formData.get('email') as string;
    const estimatedValue = formData.get('estimatedValue') as string;

    if (!clientName || clientName.length < 2) {
      toast.error("Введите название компании или имя клиента");
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error("Введите корректный email");
      return;
    }
    if (!estimatedValue || isNaN(Number(estimatedValue))) {
      toast.error("Укажите примерную стоимость сделки");
      return;
    }

    const newLead: any = {
      id: Math.random().toString(36).substr(2, 9),
      clientName,
      contactPerson,
      email,
      phone: formData.get('phone') as string || '+7 (000) 000-00-00',
      source: 'Прямой заход',
      status: 'new',
      estimatedValue: Number(estimatedValue),
      probability: 20,
      score: 50,
      notes: formData.get('notes') as string || '',
      assignedTo: profile?.displayName || 'Менеджер',
      lastContactDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeads(prev => [...prev, newLead]);
    toast.success("Новая сделка создана");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Продажи и Лиды</h2>
          <p className="text-slate-500 text-sm sm:text-base">Управление воронкой продаж и оценка потенциальных объектов</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white h-10">
            <BarChart3 className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Отчеты</span>
          </Button>
          <Dialog>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 h-12 sm:h-10 text-base sm:text-sm px-6" />}>
              <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Новый лид</span><span className="sm:hidden">Лид</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Добавить новую сделку</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLead}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clientName">Компания / Клиент</Label>
                    <Input id="clientName" name="clientName" placeholder="Напр: ООО СтройИнвест" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Контактное лицо</Label>
                    <Input id="contactPerson" name="contactPerson" placeholder="Иван Иванов" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="client@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" name="phone" placeholder="+7 (___) ___-__-__" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedValue">Ожидаемая сумма (₽)</Label>
                    <Input id="estimatedValue" name="estimatedValue" type="number" placeholder="5000000" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Заметки</Label>
                    <Textarea id="notes" name="notes" placeholder="Детали сделки..." />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" type="button" className="h-12 sm:h-10 text-base sm:text-sm">Отмена</Button>
                  <Button className="bg-slate-900 h-12 sm:h-10 text-base sm:text-sm" type="submit">Создать сделку</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Объем воронки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalValue / 1000000).toFixed(1)} млн ₽</div>
            <p className="text-xs text-slate-400 mt-1">{leads.length} активных сделок</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Target size={16} className="text-purple-500" /> Средний скоринг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore.toFixed(0)} / 100</div>
            <Progress value={stats.avgScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <DollarSign size={16} className="text-green-500" /> Конверсия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-green-500 mt-1">+5% к прошлому месяцу</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" /> Ср. цикл сделки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 дней</div>
            <p className="text-xs text-slate-400 mt-1">от лида до договора</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Поиск по клиенту или контакту..." 
            className="pl-10 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white">
          <Filter className="w-4 h-4 mr-2" /> Фильтры
        </Button>
      </div>

      {/* Kanban Board */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={cn("text-[10px] border-none", STAGES.find(s => s.id === selectedLead?.status)?.color)}>
                {STAGES.find(s => s.id === selectedLead?.status)?.label}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] border", selectedLead && getScoreColor(selectedLead.score))}>
                Score: {selectedLead?.score}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">{selectedLead?.clientName}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Контактное лицо</span>
              <div className="text-lg font-bold text-slate-900">{selectedLead?.contactPerson}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Сумма сделки</span>
              <div className="text-lg font-bold text-slate-900">{selectedLead?.estimatedValue.toLocaleString()} ₽</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Вероятность</span>
              <div className="text-lg font-bold text-slate-900">{selectedLead?.probability}%</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ответственный</span>
              <div className="text-lg font-bold text-slate-900">{selectedLead?.assignedTo}</div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-bold text-slate-900">Заметки</h4>
            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed">
              {selectedLead?.notes || 'Нет заметок'}
            </div>
          </div>

          <Comments contextId={`lead_${selectedLead?.id}`} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 min-h-[600px]">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", stage.color)}></div>
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{stage.label}</h3>
                <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 text-[10px]">
                  {filteredLeads.filter(l => l.status === stage.id).length}
                </Badge>
              </div>
              <div className="text-xs font-bold text-slate-400">
                {(filteredLeads.filter(l => l.status === stage.id).reduce((sum, l) => sum + l.estimatedValue, 0) / 1000000).toFixed(1)}M
              </div>
            </div>

            <div className="space-y-3 min-h-[200px] rounded-xl bg-slate-100/50 p-2">
              <AnimatePresence mode="popLayout">
                {filteredLeads
                  .filter(lead => lead.status === stage.id)
                  .map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Card className="border-none shadow-sm bg-white hover:ring-2 hover:ring-slate-200 transition-all cursor-grab active:cursor-grabbing group">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{lead.clientName}</h4>
                              <p className="text-xs text-slate-500">{lead.contactPerson}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />}>
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => moveLead(lead.id, 'closed-won')}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Выиграно
                                </DropdownMenuItem>
                                {lead.status === 'closed-won' && (
                                  <DropdownMenuItem className="text-blue-600 font-bold" onClick={() => {
                                    toast.success("Запуск проекта...");
                                    window.dispatchEvent(new CustomEvent('launchProject', { detail: lead }));
                                  }}>
                                    <Zap className="w-4 h-4 mr-2" /> Запустить проект
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => moveLead(lead.id, 'closed-lost')}>
                                  <XCircle className="w-4 h-4 mr-2 text-red-500" /> Проиграно
                                </DropdownMenuItem>
                                {STAGES.map(s => s.id !== lead.status && (
                                  <DropdownMenuItem key={s.id} onClick={() => moveLead(lead.id, s.id)}>
                                    <ArrowRight className="w-4 h-4 mr-2" /> В {s.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">
                                {(lead.estimatedValue / 1000000).toFixed(1)} млн ₽
                              </span>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", getScoreColor(lead.score))}>
                              Score: {lead.score}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {lead.assignedTo[0]}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-500">
                                <Phone className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-500">
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
