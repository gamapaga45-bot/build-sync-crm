/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  MessageSquare, 
  Users, 
  Building2,
  MoreVertical,
  History,
  ExternalLink,
  ChevronRight,
  Clock,
  Video,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client, Interaction } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Comments from "./Comments";

export default function ClientDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'ООО "ГазПромСтрой"',
      type: 'company',
      industry: 'Энергетика',
      email: 'info@gazpromstroy.ru',
      phone: '+7 (495) 123-45-67',
      address: 'г. Москва, ул. Строителей, д. 10',
      website: 'www.gazpromstroy.ru',
      status: 'active',
      totalRevenue: 150000000,
      createdAt: '2023-01-15',
      projects: ['1', '4'],
      interactions: [
        { id: 'i1', type: 'call', date: '2024-04-14 10:30', summary: 'Обсуждение сметы по объекту "Мегаполис"', userId: 'u1' },
        { id: 'i2', type: 'email', date: '2024-04-12 15:45', summary: 'Отправлено коммерческое предложение', userId: 'u1' },
        { id: 'i3', type: 'meeting', date: '2024-04-10 11:00', summary: 'Очная встреча в офисе заказчика', userId: 'u1' }
      ]
    },
    {
      id: '2',
      name: 'ИП Иванов Иван Иванович',
      type: 'individual',
      industry: 'Частное строительство',
      email: 'ivanov@mail.ru',
      phone: '+7 (900) 111-22-33',
      address: 'Московская обл., г. Одинцово',
      status: 'active',
      totalRevenue: 12000000,
      createdAt: '2023-05-20',
      projects: ['2'],
      interactions: [
        { id: 'i4', type: 'call', date: '2024-04-15 09:00', summary: 'Запрос статуса заливки фундамента', userId: 'u2' }
      ]
    },
    {
      id: '3',
      name: 'АО "РЖД"',
      type: 'company',
      industry: 'Транспорт',
      email: 'contact@rzd-stroy.ru',
      phone: '+7 (495) 000-11-22',
      address: 'г. Москва, Новая Басманная ул., д. 2',
      website: 'www.rzd.ru',
      status: 'lead',
      totalRevenue: 0,
      createdAt: '2024-03-01',
      projects: [],
      interactions: [
        { id: 'i5', type: 'email', date: '2024-04-13 14:20', summary: 'Входящий запрос на тендер', userId: 'u1' }
      ]
    }
  ]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId) || clients[0],
  [clients, selectedClientId]);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'meeting': return <Users className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Sidebar: Client List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Клиенты</h3>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Поиск..." 
              className="pl-9 h-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group",
                  selectedClient?.id === client.id 
                    ? "bg-white shadow-sm ring-1 ring-slate-200" 
                    : "hover:bg-slate-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    client.type === 'company' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {client.type === 'company' ? <Building2 size={20} /> : <Users size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm truncate">{client.name}</div>
                    <div className="text-xs text-slate-500 truncate">{client.industry || 'Частное лицо'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 border-none",
                        client.status === 'active' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {client.status === 'active' ? 'Активен' : 'Лид'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Client Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedClient ? (
          <>
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div className="flex gap-5">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold",
                  selectedClient.type === 'company' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                )}>
                  {selectedClient.name[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
                    <Badge className="bg-slate-100 text-slate-600 border-none">ID: {selectedClient.id}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedClient.address}</span>
                    {selectedClient.website && (
                      <a href={`https://${selectedClient.website}`} target="_blank" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                        <Globe size={14} /> {selectedClient.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success(`Доступ в личный кабинет отправлен клиенту ${selectedClient.name}`);
                  // In a real app, this would send an email with a magic link or create a user account
                }}>
                  <ShieldCheck size={16} className="mr-2" /> Доступ в портал
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeTab', { detail: 'portal' }));
                  toast.info(`Режим предпросмотра портала для: ${selectedClient.name}`);
                }}>
                  <ExternalLink size={16} className="mr-2" /> Предпросмотр
                </Button>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" /> Договоры
                </Button>
                <Button className="bg-slate-900" size="sm">
                  <Plus size={16} className="mr-2" /> Новая сделка
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                    <MoreVertical size={18} className="text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Редактировать</DropdownMenuItem>
                    <DropdownMenuItem>Объединить</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Архивировать</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto">
                <Tabs defaultValue="interactions" className="space-y-6">
                  <TabsList className="bg-slate-100/50 p-1">
                    <TabsTrigger value="interactions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <History size={14} className="mr-2" /> История
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Calendar size={14} className="mr-2" /> Объекты
                    </TabsTrigger>
                    <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <FileText size={14} className="mr-2" /> Реквизиты
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <MessageSquare size={14} className="mr-2" /> Комментарии
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="interactions" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Лента взаимодействий</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Phone size={14} className="mr-2" /> Звонок
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Mail size={14} className="mr-2" /> Email
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Calendar size={14} className="mr-2" /> Встреча
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                      {selectedClient.interactions.map((interaction) => (
                        <div key={interaction.id} className="relative pl-12">
                          <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10 shadow-sm">
                            {getInteractionIcon(interaction.type)}
                          </div>
                          <Card className="border-none shadow-sm bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  {interaction.type === 'call' ? 'Телефонный звонок' : 
                                   interaction.type === 'email' ? 'Электронное письмо' : 'Встреча'}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock size={10} /> {interaction.date}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium">{interaction.summary}</p>
                              <div className="mt-3 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                  {interaction.userId[0]}
                                </div>
                                <span className="text-[10px] text-slate-500">Ответственный: Менеджер</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="grid grid-cols-2 gap-4">
                    {selectedClient.projects.length > 0 ? (
                      selectedClient.projects.map(pid => (
                        <Card key={pid} className="border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <Building2 size={20} />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-slate-900">Объект #{pid}</div>
                                <div className="text-xs text-slate-500">В процессе строительства</div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ExternalLink size={16} />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 text-center text-slate-400">
                        <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                        <p>У данного клиента пока нет активных объектов</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-6">
                    <Comments contextId={`client_${selectedClient?.id}`} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Sidebar: Quick Info */}
              <div className="w-72 border-l border-slate-200 p-6 space-y-8 bg-slate-50/30">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Контакты</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Phone size={14} />
                      </div>
                      <div className="text-sm font-medium text-slate-700">{selectedClient.phone}</div>
                    </div>
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Mail size={14} />
                      </div>
                      <div className="text-sm font-medium text-slate-700 truncate">{selectedClient.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Финансы</h4>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Общая выручка</div>
                    <div className="text-xl font-bold text-slate-900">
                      {selectedClient.totalRevenue.toLocaleString()} ₽
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">LTV (Life Time Value)</span>
                      <Badge className="bg-green-100 text-green-700 text-[10px] border-none">High</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Телефония / IP</h4>
                  <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Phone size={14} />
                      </div>
                      <Badge className="bg-white/20 text-white border-none text-[10px]">Ready</Badge>
                    </div>
                    <div className="text-xs opacity-80 mb-1">Интеграция активна</div>
                    <div className="text-sm font-bold">Автофиксация звонков</div>
                    <Button variant="ghost" className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white text-xs h-8 border-none">
                      Журнал звонков
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Выберите клиента из списка для просмотра деталей
          </div>
        )}
      </div>
    </div>
  );
}
