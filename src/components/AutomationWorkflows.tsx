/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Bell, 
  FileText, 
  Settings, 
  Plus, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Wand2,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  History,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkflowReminder, DocumentTemplate } from "@/types";

export default function AutomationWorkflows() {
  const [reminders, setReminders] = useState<WorkflowReminder[]>([
    {
      id: 'r1',
      leadId: '1',
      title: 'Перезвонить ООО "СтройИнвест"',
      description: 'Уточнить решение по коммерческому предложению на склад',
      dueDate: '2024-04-16T10:00:00',
      status: 'pending',
      priority: 'high',
      assignedTo: 'u1',
      createdAt: '2024-04-14'
    },
    {
      id: 'r2',
      clientId: '2',
      title: 'Встреча с ИП Ивановым',
      description: 'Подписание актов скрытых работ по фундаменту',
      dueDate: '2024-04-15T14:30:00',
      status: 'overdue',
      priority: 'medium',
      assignedTo: 'u1',
      createdAt: '2024-04-10'
    }
  ]);

  const [templates] = useState<DocumentTemplate[]>([
    {
      id: 't1',
      name: 'Коммерческое предложение (Стандарт)',
      type: 'other',
      content: 'Уважаемый {{clientName}}, предлагаем вам строительство {{projectName}}...',
      placeholders: ['clientName', 'projectName', 'estimatedValue'],
      createdAt: '2024-01-01'
    },
    {
      id: 't2',
      name: 'Договор подряда (Физ. лица)',
      type: 'contract',
      content: 'Договор между {{companyName}} и {{clientName}} на сумму {{totalAmount}}...',
      placeholders: ['clientName', 'totalAmount', 'address'],
      createdAt: '2024-02-15'
    }
  ]);

  const [activeTab, setActiveTab] = useState('reminders');

  const completeReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    toast.success("Задача выполнена");
  };

  const generateFromTemplate = (templateName: string) => {
    toast.info(`Генерация документа по шаблону: ${templateName}`);
    setTimeout(() => {
      toast.success("Документ успешно сформирован и сохранен в разделе 'Документы'");
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Автоматизация и Workflows</h2>
          <p className="text-slate-500">Умные напоминания и генерация документов по шаблонам</p>
        </div>
        <Button className="bg-slate-900">
          <Settings className="w-4 h-4 mr-2" /> Настроить правила
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white p-1 border border-slate-200">
          <TabsTrigger value="reminders" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" /> Напоминания
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" /> Шаблоны документов
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" /> Авто-правила
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Активные задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reminders.filter(r => r.status === 'pending').length}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Просрочено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reminders.filter(r => r.status === 'overdue').length}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Выполнено сегодня</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">5</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className={cn(
                "border-none shadow-sm transition-all",
                reminder.status === 'completed' ? "opacity-60" : "hover:ring-1 hover:ring-slate-200"
              )}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      reminder.status === 'overdue' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {reminder.title.includes('Перезвонить') ? <Phone size={20} /> : <Calendar size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{reminder.title}</h4>
                        {reminder.status === 'overdue' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Просрочено</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{reminder.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {new Date(reminder.dueDate).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Plus size={10} /> Создано: {reminder.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => completeReminder(reminder.id)}
                      >
                        <CheckCircle2 size={14} className="mr-2" /> Выполнено
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border-none shadow-sm bg-white group hover:ring-2 hover:ring-slate-200 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <FileText size={20} />
                    </div>
                    <Badge variant="outline" className="text-[10px]">{template.type}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Переменные: {template.placeholders.map(p => `{{${p}}}`).join(', ')}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-slate-900" 
                      onClick={() => generateFromTemplate(template.name)}
                    >
                      <Wand2 size={14} className="mr-2" /> Сгенерировать
                    </Button>
                    <Button variant="outline" size="icon">
                      <Copy size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <button className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all bg-white/50">
              <Plus size={24} />
              <div className="text-sm font-bold">Создать новый шаблон</div>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle>Активные правила автоматизации</CardTitle>
              <CardDescription>Настройте автоматические действия при изменении статусов сделок или объектов</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Новый лид с сайта</div>
                      <div className="text-xs text-slate-500">Создать напоминание "Перезвонить" через 15 минут</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none">Активно</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Статус сделки: "Предложение"</div>
                      <div className="text-xs text-slate-500">Сгенерировать КП по шаблону и отправить на email</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none">Активно</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Завершение этапа строительства</div>
                      <div className="text-xs text-slate-500">Уведомить заказчика через портал и выставить счет</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-400 border-slate-200">Выключено</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
