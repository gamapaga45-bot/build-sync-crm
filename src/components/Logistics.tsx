import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Plus, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Calendar,
  MoreVertical,
  Navigation,
  ExternalLink,
  Table as TableIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SHIPMENTS = [
  { id: '1', item: 'Бетон Б25', vehicle: 'АБС К-700', status: 'delivered', time: '10:30', origin: 'Завод ЖБИ-1', destination: 'Секция А', weight: '8 м3' },
  { id: '2', item: 'Арматура 12мм', vehicle: 'КАМАЗ 5320', status: 'transit', time: '14:20', origin: 'МеталлСервис', destination: 'Склад №2', weight: '2.5 т' },
  { id: '3', item: 'Опалубка стен', vehicle: 'MAN 10т', status: 'loading', time: '16:00', origin: 'Склад аренды', destination: 'Секция Б', weight: '45 м2' },
  { id: '4', item: 'Щебень 20-40', vehicle: 'Scania 20т', status: 'delayed', time: '11:00', origin: 'Карьер "Запад"', destination: 'Площадка', weight: '20 т' },
];

export default function Logistics() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeShipments, setActiveShipments] = useState(SHIPMENTS);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <Badge className="bg-green-100 text-green-600 border-none">Доставлено</Badge>;
      case 'transit': return <Badge className="bg-blue-100 text-blue-600 border-none">В пути</Badge>;
      case 'loading': return <Badge className="bg-amber-100 text-amber-600 border-none">Погрузка</Badge>;
      case 'delayed': return <Badge className="bg-red-100 text-red-600 border-none">Задержка</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Логистика и ТТН</h2>
          <p className="text-slate-500">Управление поставками, отслеживание машин и товарно-транспортных накладных</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'map' : 'list')}>
            {view === 'list' ? <Navigation size={18} className="mr-2" /> : <TableIcon size={18} className="mr-2" />}
            {view === 'list' ? 'Карта' : 'Список'}
          </Button>
          <Button className="bg-slate-900">
            <Plus size={18} className="mr-2" />
            Создать ТТН
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего рейсов', value: '42', icon: Truck, color: 'indigo' },
          { label: 'В пути', value: '8', icon: Navigation, color: 'blue' },
          { label: 'Доставлено (сегодня)', value: '14', icon: CheckCircle2, color: 'emerald' },
          { label: 'Проблемные', value: '2', icon: AlertTriangle, color: 'red' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                  <stat.icon size={20} />
                </div>
                <Badge variant="ghost" className="text-slate-400">Сегодня</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Текущие поставки</CardTitle>
              <CardDescription>Активные рейсы на сегодня</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Номер авто или груз..." className="pl-10 h-9 bg-slate-50 border-none w-48" />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Filter size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-slate-100">
                  <TableHead>Груз</TableHead>
                  <TableHead>Транспорт</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Время</TableHead>
                  <TableHead>Куда</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeShipments.map((s) => (
                  <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{s.item}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{s.weight}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{s.vehicle}</TableCell>
                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={14} /> {s.time}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={14} /> {s.destination}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="bg-slate-900 h-1" />
            <CardHeader>
              <CardTitle className="text-lg">Детали ТТН</CardTitle>
              <CardDescription>Последняя накладная №8492-А</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400 font-medium">Поставщик</span>
                     <span className="font-bold text-slate-900">БСУ-Контакт</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400 font-medium">Грузополучатель</span>
                     <span className="font-bold text-slate-900">ООО СтройТех</span>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-2">
                     <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Груз</p>
                     <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium">Бетон Б25 (М350) W8</span>
                        <span className="font-bold">8.0 м3</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Водитель</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">СП</div>
                        <div>
                           <p className="text-sm font-bold text-slate-900">Сидоров П.В.</p>
                           <p className="text-xs text-slate-500">+7 (900) 123-44-55</p>
                        </div>
                     </div>
                  </div>
               </div>
               <Button className="w-full bg-slate-900 h-11">
                  <FileText size={18} className="mr-2" /> Просмотр ТТН
               </Button>
               <Button variant="outline" className="w-full border-slate-200">
                  <ExternalLink size={16} className="mr-2" /> Поделиться ссылкой
               </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
               <CardTitle className="text-sm font-bold uppercase text-slate-400 tracking-wider">График поставок</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100">
                  {[
                    { time: 'Завтра 08:00', task: 'Арматура 16мм', qty: '12 т' },
                    { time: 'Завтра 12:00', task: 'Пеноплекс 50мм', qty: '150 м2' },
                    { time: '20 Апр 09:00', task: 'Кирпич М150', qty: '8000 шт' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-blue-600">{item.time}</p>
                          <p className="text-sm font-medium text-slate-900">{item.task}</p>
                       </div>
                       <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold">{item.qty}</Badge>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full", className)} />;
}
