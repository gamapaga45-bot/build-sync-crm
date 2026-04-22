/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  X,
  Lock,
  Eye,
  Settings as SettingsIcon
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Comments from "./Comments";
import { AppSection } from "@/types";

interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'engineer' | 'manager' | 'worker' | 'supervisor' | 'foreman';
  email: string;
  phone: string;
  avatar?: string;
  tasksCount: number;
  completedTasks: number;
  status: 'online' | 'offline' | 'busy';
  permissions: AppSection[];
}

export default function TeamView() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'worker' as const,
    permissions: ['dashboard', 'tasks', 'calendar', 'daily-logs'] as AppSection[]
  });

  const availableSections: { id: AppSection; label: string }[] = [
    { id: 'dashboard', label: 'Панель управления' },
    { id: 'tasks', label: 'Задачи' },
    { id: 'materials', label: 'Материалы' },
    { id: 'team', label: 'Команда' },
    { id: 'acceptance', label: 'Приемка' },
    { id: 'incidents', label: 'Инциденты' },
    { id: 'reports', label: 'Отчеты' },
    { id: 'daily-logs', label: 'Журналы работ' },
    { id: 'calendar', label: 'Календарь' },
    { id: 'docs', label: 'Документы' },
    { id: 'crm', label: 'CRM / Лиды' },
    { id: 'clients', label: 'Клиенты' },
    { id: 'billing', label: 'Биллинг' },
    { id: 'settings', label: 'Настройки' },
    { id: 'portal', label: 'Портал клиента' },
  ];

  const [members, setMembers] = useState<TeamMember[]>([
    { 
      id: '1', 
      name: 'Сергей Сидоров', 
      role: 'engineer', 
      email: 'sergey@stroy.ru', 
      phone: '+7 (999) 123-45-67', 
      tasksCount: 8, 
      completedTasks: 5,
      status: 'online',
      permissions: ['dashboard', 'tasks', 'materials', 'acceptance', 'daily-logs', 'calendar', 'docs']
    },
    { 
      id: '2', 
      name: 'Алексей Иванов', 
      role: 'manager', 
      email: 'alex@stroy.ru', 
      phone: '+7 (999) 765-43-21', 
      tasksCount: 4, 
      completedTasks: 3,
      status: 'busy',
      permissions: ['dashboard', 'crm', 'clients', 'billing', 'reports', 'settings']
    },
    { 
      id: '3', 
      name: 'Иван Петров', 
      role: 'worker', 
      email: 'ivan@stroy.ru', 
      phone: '+7 (999) 000-11-22', 
      tasksCount: 12, 
      completedTasks: 10,
      status: 'offline',
      permissions: ['tasks', 'daily-logs']
    },
  ]);

  const togglePermission = (sectionId: AppSection) => {
    setNewMember(prev => ({
      ...prev,
      permissions: prev.permissions.includes(sectionId)
        ? prev.permissions.filter(p => p !== sectionId)
        : [...prev.permissions, sectionId]
    }));
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    const member: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      phone: '+7 (000) 000-00-00',
      tasksCount: 0,
      completedTasks: 0,
      status: 'offline',
      permissions: newMember.permissions
    };

    setMembers([...members, member]);
    setIsInviteOpen(false);
    setNewMember({ 
      name: '', 
      email: '', 
      role: 'worker', 
      permissions: ['dashboard', 'tasks', 'calendar', 'daily-logs'] 
    });
    toast.success(`Приглашение отправлено на ${member.email}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-purple-100 text-purple-600 border-none">Админ</Badge>;
      case 'engineer': return <Badge className="bg-blue-100 text-blue-600 border-none">Инженер</Badge>;
      case 'manager': return <Badge className="bg-green-100 text-green-600 border-none">Менеджер</Badge>;
      case 'worker': return <Badge className="bg-orange-100 text-orange-600 border-none">Рабочий</Badge>;
      case 'supervisor': return <Badge className="bg-indigo-100 text-indigo-600 border-none">Куратор</Badge>;
      case 'foreman': return <Badge className="bg-yellow-100 text-yellow-600 border-none">Прораб</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-slate-300';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Команда проекта</h2>
          <p className="text-slate-500">Управление участниками и распределение нагрузки</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger render={<Button className="bg-slate-900" />}>
            <UserPlus size={18} className="mr-2" /> Пригласить участника
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Пригласить в команду</DialogTitle>
              <DialogDescription>Отправьте приглашение новому участнику проекта</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label>ФИО</Label>
                <Input 
                  placeholder="Иван Иванов" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="bg-slate-50 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="ivan@example.com" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="bg-slate-50 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(v: any) => setNewMember({...newMember, role: v})}
                >
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="engineer">Инженер</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="supervisor">Куратор / Технадзор</SelectItem>
                    <SelectItem value="foreman">Прораб</SelectItem>
                    <SelectItem value="worker">Рабочий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Доступы к разделам</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`perm-${section.id}`} 
                        checked={newMember.permissions.includes(section.id)}
                        onCheckedChange={() => togglePermission(section.id)}
                      />
                      <label 
                        htmlFor={`perm-${section.id}`}
                        className="text-xs font-medium leading-none cursor-pointer text-slate-700"
                      >
                        {section.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 h-10">Отправить приглашение</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workload Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users size={16} /> Всего участников
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-slate-400 mt-1">2 активных сейчас</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle2 size={16} /> Выполнено задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-green-500 mt-1">+3 за сегодня</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <BarChart3 size={16} /> Средняя нагрузка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.2</div>
            <p className="text-xs text-slate-400 mt-1">задач на человека</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {selectedMember && getRoleBadge(selectedMember.role)}
                <Badge variant="outline" className={cn(
                  "text-[10px] border-none",
                  selectedMember?.status === 'online' ? "bg-green-100 text-green-600" :
                  selectedMember?.status === 'busy' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                )}>
                  {selectedMember?.status === 'online' ? 'В сети' : selectedMember?.status === 'busy' ? 'Занят' : 'Не в сети'}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">{selectedMember?.name}</DialogTitle>
              <DialogDescription>Информация об участнике и история взаимодействия</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</span>
                <div className="text-sm font-bold text-slate-900">{selectedMember?.email}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Телефон</span>
                <div className="text-sm font-bold text-slate-900">{selectedMember?.phone}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Задач в работе</span>
                <div className="text-sm font-bold text-slate-900">{selectedMember ? selectedMember.tasksCount - selectedMember.completedTasks : 0}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Выполнено</span>
                <div className="text-sm font-bold text-green-600">{selectedMember?.completedTasks}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Разрешенные разделы</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember?.permissions.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                    {availableSections.find(s => s.id === p)?.label || p}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-bold text-slate-900">Эффективность</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Процент выполнения</span>
                  <span className="text-slate-900 font-bold">{selectedMember ? Math.round((selectedMember.completedTasks / selectedMember.tasksCount) * 100) : 0}%</span>
                </div>
                <Progress value={selectedMember ? (selectedMember.completedTasks / selectedMember.tasksCount) * 100 : 0} className="h-2" />
              </div>
            </div>

            <Comments contextId={`team_member_${selectedMember?.id}`} />
          </DialogContent>
        </Dialog>

        {members.map((member) => (
          <Card 
            key={member.id} 
            className="border-none shadow-sm bg-white hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                      {member.name[0]}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{member.name}</h3>
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={12} /> {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={12} /> {member.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                    <MoreVertical size={18} className="text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Редактировать профиль</DropdownMenuItem>
                    <DropdownMenuItem>Изменить роль</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Удалить из команды</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Загрузка (задачи)</span>
                    <span className="font-bold">{member.completedTasks} / {member.tasksCount} выполнено</span>
                  </div>
                  <Progress value={(member.completedTasks / member.tasksCount) * 100} className="h-1.5" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={14} className="text-blue-500" />
                    <span>{member.tasksCount - member.completedTasks} в работе</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <AlertCircle size={14} className="text-orange-500" />
                    <span>2 просрочено</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
