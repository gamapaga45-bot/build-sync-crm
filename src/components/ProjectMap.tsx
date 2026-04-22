/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Construction, 
  Search, 
  Calendar, 
  AlertTriangle,
  Navigation,
  Layers,
  Info,
  ChevronRight,
  Filter,
  Maximize2,
  Minimize2,
  MessageSquare,
  X
} from "lucide-react";
import { Project } from '@/types';
import { cn } from "@/lib/utils";
import Comments from './Comments';

// Fix Leaflet marker icon issue
// We use a CDN or just rely on the divIcon for markers
// To fix the default icon issue without imports:
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ProjectMapProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectMap({ projects, onSelectProject }: ProjectMapProps) {
  const [filter, setFilter] = useState<'all' | 'construction' | 'inspection' | 'planned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showComments, setShowComments] = useState<string | null>(null);

  const processedProjects = useMemo(() => {
    return projects.map((p, index) => {
      // If coordinates are missing, assign a spread around Moscow center
      if (p.lat === undefined || p.lng === undefined) {
        return {
          ...p,
          lat: 55.7558 + (Math.random() - 0.5) * 0.1,
          lng: 37.6173 + (Math.random() - 0.5) * 0.1
        };
      }
      return p;
    });
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return processedProjects.filter(p => {
      const matchesFilter = filter === 'all' || p.projectType === filter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [processedProjects, filter, searchQuery]);

  const activeProject = useMemo(() => 
    filteredProjects.find(p => p.id === selectedProjectId),
    [filteredProjects, selectedProjectId]
  );

  const getMarkerIcon = (type: string) => {
    const color = type === 'construction' ? '#3b82f6' : // blue-500
                  type === 'inspection' ? '#f97316' :   // orange-500
                  '#22c55e';                            // green-500
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Top Bar with Filters and Search */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 hidden sm:block">Карта объектов</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Все', color: 'bg-slate-500' },
              { id: 'construction', label: 'Стройка', color: 'bg-blue-500' },
              { id: 'inspection', label: 'Замеры', color: 'bg-orange-500' },
              { id: 'planned', label: 'План', color: 'bg-green-500' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  filter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", f.color)} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Поиск объекта..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl h-9"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          >
            {isSidebarVisible ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
            <span className="hidden sm:inline">{isSidebarVisible ? 'Скрыть список' : 'Показать список'}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Overlay style on mobile, side style on desktop */}
        <div className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-10 shadow-lg lg:shadow-none",
          isSidebarVisible ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        )}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Объекты ({filteredProjects.length})</h3>
            <Badge variant="outline" className="text-[10px]">{filter === 'all' ? 'Все типы' : filter}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-50">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className={cn(
                    "p-4 hover:bg-slate-50 transition-colors cursor-pointer group border-l-4",
                    selectedProjectId === project.id ? "border-blue-600 bg-blue-50/30" : "border-transparent"
                  )}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin size={10} />
                    {project.address}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Прогресс</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1" />
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Search size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Ничего не найдено</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer 
            center={[55.7558, 37.6173]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProjects.map((project) => (
              <Marker 
                key={project.id} 
                position={[project.lat!, project.lng!]}
                icon={getMarkerIcon(project.projectType)}
                eventHandlers={{
                  click: () => setSelectedProjectId(project.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 space-y-3 min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        "border-none text-[10px] font-bold uppercase",
                        project.projectType === 'construction' ? "bg-blue-50 text-blue-600" :
                        project.projectType === 'inspection' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                      )}>
                        {project.projectType === 'construction' ? 'Строительство' : 
                         project.projectType === 'inspection' ? 'Обследование' : 'Планирование'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold">ID: {project.id}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{project.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {project.address}
                      </p>
                    </div>
                    
                    <div className="space-y-2 bg-slate-50 p-2 rounded-lg">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Готовность:</span>
                        <span className="font-bold text-slate-900">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-slate-400 uppercase font-bold tracking-wider">Бюджет</span>
                        <span className="font-bold text-slate-900">{(project.budget / 1000000).toFixed(1)} млн ₽</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 uppercase font-bold tracking-wider">Создан</span>
                        <span className="text-slate-600 font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-9 text-[11px] font-bold border-slate-200"
                        onClick={() => setShowComments(project.id)}
                      >
                        <MessageSquare size={14} className="mr-1.5" /> Чат
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 text-[11px] font-bold bg-slate-900 hover:bg-slate-800"
                        onClick={() => onSelectProject(project)}
                      >
                        Параметры <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapController projects={filteredProjects} selectedProject={activeProject} />
          </MapContainer>

          {/* Comments Overlay */}
          {showComments && (
            <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl z-[1001] border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Обсуждение объекта
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowComments(null)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <Comments contextId={`project_map_${showComments}`} className="h-full" />
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
            <Button variant="outline" size="icon" className="shadow-lg bg-white hover:bg-slate-50 rounded-xl w-10 h-10 border-slate-200">
              <Navigation size={20} className="text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="shadow-lg bg-white hover:bg-slate-50 rounded-xl w-10 h-10 border-slate-200">
              <Layers size={20} className="text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="shadow-lg bg-white hover:bg-slate-50 rounded-xl w-10 h-10 border-slate-200">
              <Info size={20} className="text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to handle map view changes
function MapController({ projects, selectedProject }: { projects: Project[], selectedProject?: Project }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedProject && selectedProject.lat !== undefined && selectedProject.lng !== undefined) {
      map.setView([selectedProject.lat, selectedProject.lng], 15, {
        animate: true,
        duration: 1
      });
    } else {
      const validProjects = projects.filter(p => p.lat !== undefined && p.lng !== undefined);
      if (validProjects.length > 0) {
        const bounds = L.latLngBounds(validProjects.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [projects, selectedProject, map]);

  return null;
}
