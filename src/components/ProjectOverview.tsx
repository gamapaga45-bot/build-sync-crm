/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Calendar as CalendarIcon,
  PieChart,
  ArrowRight,
  AlertCircle,
  Box
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/AuthContext";
import { Project } from "@/types";

interface ProjectOverviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
}

export default function ProjectOverview({ projects, onSelectProject, onDeleteProject, onNewProject }: ProjectOverviewProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Мои проекты</h2>
          <p className="text-slate-500">Управление всеми строительными объектами в одном месте</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Поиск по названию или адресу..." 
              className="pl-10 w-full sm:w-[300px] bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={onNewProject} className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm shadow-lg shadow-slate-200">
            <Plus className="w-4 h-4 mr-2" /> Новый проект
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-transparent py-20">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Проекты не найдены</h3>
              <p className="text-slate-500 max-w-xs">Попробуйте изменить параметры поиска или создайте новый проект.</p>
            </div>
            <Button variant="outline" onClick={() => setSearchQuery('')}>Сбросить поиск</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="group border-none shadow-sm bg-white hover:ring-2 hover:ring-slate-900 transition-all cursor-pointer overflow-hidden flex flex-col"
              onClick={() => onSelectProject(project)}
            >
              <div className="h-2 w-full bg-slate-100">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    project.progress > 80 ? "bg-green-500" : project.progress > 40 ? "bg-blue-500" : "bg-orange-500"
                  )} 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "border-none text-[10px] font-bold uppercase",
                        project.projectType === 'construction' ? "bg-blue-50 text-blue-600" :
                        project.projectType === 'inspection' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                      )}>
                        {project.projectType === 'construction' ? 'Стройка' : 
                         project.projectType === 'inspection' ? 'Замеры' : 'План'}
                      </Badge>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin size={12} />
                        {project.address}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectProject(project); }}>
                        <ExternalLink size={14} className="mr-2" /> Открыть
                      </DropdownMenuItem>
                      {profile?.role === 'admin' && (
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        >
                          <Trash2 size={14} className="mr-2" /> Удалить проект
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Бюджет</p>
                    <p className="text-sm font-bold text-slate-900">{(project.budget / 1000000).toFixed(1)}M ₽</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Освоено</p>
                    <p className="text-sm font-bold text-slate-900">{((project.spent / project.budget) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                   <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <Box size={16} />
                   </div>
                   <div className="flex flex-col justify-center">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-none">Оборудование</span>
                     <span className="text-sm font-black text-slate-900">4 ед. на объекте</span>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarIcon size={14} />
                    <span>Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                    Перейти <ArrowRight size={14} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
