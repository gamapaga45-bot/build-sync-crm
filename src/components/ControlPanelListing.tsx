/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Package, 
  PieChart, 
  FileText, 
  Settings, 
  Users, 
  ShieldCheck, 
  Box, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Truck, 
  Layers, 
  Archive,
  BookOpen,
  Bot,
  AlertTriangle,
  Map as MapIcon,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface ControlPanelListingProps {
  onNavigate: (tabId: string) => void;
  groups: any[];
}

export default function ControlPanelListing({ onNavigate, groups }: ControlPanelListingProps) {
  // Mock live stats for context
  const getStat = (id: string) => {
    switch(id) {
      case 'dashboard': return { label: 'Активно', value: '5 объектов', color: 'text-emerald-500' };
      case 'crm': return { label: 'Лиды', value: '+12 новых', color: 'text-blue-500' };
      case 'budget': return { label: 'Освоено', value: '72%', color: 'text-orange-500' };
      case 'incidents': return { label: 'Риски', value: '3 откр.', color: 'text-red-500' };
      case 'materials': return { label: 'Склад', value: 'Запрос КП', color: 'text-amber-500' };
      case 'assistant': return { label: 'AI', value: 'Online', color: 'text-purple-500' };
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Командный центр</h2>
          <p className="text-slate-500 font-medium">Глобальный обзор всех системных модулей и потоков данных</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Текущая сессия</p>
                <p className="text-sm font-bold text-slate-900">2 ч. 14 мин.</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Нагрузка системы</p>
                <p className="text-sm font-bold text-emerald-600">Оптимально</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="h-5 w-1 bg-slate-900 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {group.title}
                </h3>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-400 bg-white">
                {group.items.length} мод.
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {group.items.map((item: any) => {
                const stat = getStat(item.id);
                return (
                  <Card 
                    key={item.id} 
                    className="group border-none shadow-sm hover:shadow-md hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer bg-white overflow-hidden"
                    onClick={() => onNavigate(item.id)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                          <item.icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate leading-tight">{item.label}</h4>
                          <p className="text-[9px] text-slate-400 font-medium truncate uppercase tracking-wider opacity-60">
                             SYS / {item.id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {stat && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[8px] uppercase font-bold text-slate-300 leading-none mb-1">{stat.label}</p>
                            <p className={cn("text-[10px] font-bold leading-none", stat.color)}>{stat.value}</p>
                          </div>
                        )}
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-medium transition-opacity">
         <p>© 2026 Nikolai Rogozin. BuildSync CRM. Все права защищены. Документ сформирован автоматически.</p>
         <div className="flex gap-6">
            <span>Версия 2.4.0-enterprise</span>
            <span>Статус: Стабильно</span>
         </div>
      </footer>
    </div>
  );
}
