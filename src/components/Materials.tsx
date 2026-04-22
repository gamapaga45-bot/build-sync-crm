/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
  Pencil,
  Trash2,
  MessageSquare,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  History,
  Info,
  ChevronRight,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Comments from "./Comments";

interface MaterialsProps {
  project?: any;
}

export default function Materials({ project }: MaterialsProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScrapOpen, setIsScrapOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [scrapMaterial, setScrapMaterial] = useState<any>(null);
  const [materials, setMaterials] = useState([
    { id: '1', name: 'Бетон Б25 (М350)', unit: 'м3', qty: 45, stock: 12, wastage: 2, price: 5200, status: 'delivered', date: '2024-04-10', workType: 'Фундамент' },
    { id: '2', name: 'Арматура 12мм A500C', unit: 'т', qty: 2.5, stock: 1.8, wastage: 0.1, price: 68000, status: 'ordered', date: '2024-04-15', workType: 'Фундамент' },
    { id: '3', name: 'Гидроизоляция Технониколь', unit: 'рул', qty: 15, stock: 5, wastage: 0, price: 2800, status: 'used', date: '2024-04-08', workType: 'Общее' },
    { id: '4', name: 'Кирпич рядовой М150', unit: 'шт', qty: 5000, stock: 4200, wastage: 45, price: 18, status: 'ordered', date: '2024-04-20', workType: 'Стены' },
  ]);

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const qty = Number(formData.get('qty'));
    const newMaterial = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      qty: qty,
      stock: qty,
      wastage: 0,
      unit: formData.get('unit') as string,
      workType: formData.get('workType') as string,
      price: Number(formData.get('price')),
      status: 'ordered',
      date: new Date().toISOString().split('T')[0]
    };
    setMaterials([newMaterial, ...materials]);
    toast.success("Материал успешно добавлен в реестр");
    setIsAddOpen(false);
  };

  const handleEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updatedMaterial = {
      ...editingMaterial,
      name: formData.get('name') as string,
      qty: Number(formData.get('qty')),
      unit: formData.get('unit') as string,
      workType: formData.get('workType') as string,
      price: Number(formData.get('price')),
      status: formData.get('status') as string,
    };
    setMaterials(materials.map(m => m.id === editingMaterial.id ? updatedMaterial : m));
    toast.success("Данные материала обновлены");
    setEditingMaterial(null);
  };

  const handleScrapMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const scrapQty = Number(formData.get('scrapQty'));
    
    if (scrapQty > (scrapMaterial.stock || 0)) {
      toast.error("Списание не может превышать текущий остаток");
      return;
    }

    const updatedMaterials = materials.map(m => {
      if (m.id === scrapMaterial.id) {
        return {
          ...m,
          stock: (m.stock || 0) - scrapQty,
          wastage: (m.wastage || 0) + scrapQty
        };
      }
      return m;
    });

    setMaterials(updatedMaterials);
    toast.warning(`Материал "${scrapMaterial.name}" списан по браку: ${scrapQty} ${scrapMaterial.unit}`);
    setIsScrapOpen(false);
    setScrapMaterial(null);
  };

  const filteredMaterials = useMemo(() => {
    return statusFilter === 'all' 
      ? materials 
      : materials.filter(m => m.status === statusFilter);
  }, [materials, statusFilter]);

  const stats = useMemo(() => {
    const totalPurchasedValue = materials.reduce((acc, m) => acc + (m.qty * m.price), 0);
    const currentStockValue = materials.reduce((acc, m) => acc + ((m.stock || 0) * m.price), 0);
    const totalWastageValue = materials.reduce((acc, m) => acc + ((m.wastage || 0) * m.price), 0);
    const stockPercentage = totalPurchasedValue > 0 ? (currentStockValue / totalPurchasedValue) * 100 : 0;

    return {
      totalPurchasedValue,
      currentStockValue,
      totalWastageValue,
      stockPercentage
    };
  }, [materials]);

  const handleExport = () => {
    toast.info("Подготовка реестра ТМЦ для экспорта...");
    const headers = ["ID", "Наименование", "Кол-во", "Остаток", "Брак", "Ед.изм", "Цена", "Статус", "Дата", "Раздел"];
    const rows = materials.map(m => [
      m.id, 
      m.name, 
      m.qty, 
      m.stock || 0, 
      m.wastage || 0, 
      m.unit, 
      m.price, 
      m.status, 
      m.date, 
      m.workType
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Materials_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Реестр ТМЦ успешно скачан");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ordered': return <Badge variant="outline" className="bg-blue-100 text-blue-600 border-none px-2">Заказано</Badge>;
      case 'delivered': return <Badge variant="outline" className="bg-green-100 text-green-600 border-none px-2">В наличии</Badge>;
      case 'used': return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-none px-2">Использовано</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Материалы и Склад</h2>
          <p className="text-slate-500">
            {project ? `Учет материалов для проекта: ${project.name}` : "Консолидированный отчет по всем объектам компании"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-slate-200" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Экспорт реестра
          </Button>
          <Button className="bg-slate-900" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Добавить поставку
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] uppercase font-bold text-slate-400">Оборот закупок</CardTitle>
            <Package size={16} className="text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPurchasedValue.toLocaleString()} ₽</div>
            <p className="text-xs text-slate-400 mt-1">Всего по проекту</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] uppercase font-bold text-slate-400">Остаток на складе</CardTitle>
            <ClipboardList size={16} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.currentStockValue.toLocaleString()} ₽</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${stats.stockPercentage}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{Math.round(stats.stockPercentage)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] uppercase font-bold text-red-400">Всего списано (Брак)</CardTitle>
            <AlertTriangle size={16} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalWastageValue.toLocaleString()} ₽</div>
            <p className="text-xs text-red-400 mt-1">Потери материалов</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute right-[-20px] top-[-20px] opacity-5">
             <BarChart3 size={150} />
          </div>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] uppercase font-bold text-slate-400">Ожидается</CardTitle>
            <Truck size={16} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3 поставки</div>
            <p className="text-xs text-blue-500 mt-1 font-medium">Ближайшая: Пятница</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 h-11 rounded-xl">
          <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Реестр материалов</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Отчеты и Аналитика</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">История движений</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-0">
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'ordered', 'delivered', 'used'].map((status) => (
                  <Button 
                    key={status}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "text-xs h-8 px-3 rounded-full transition-all",
                      statusFilter === status 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {status === 'all' ? 'Все' : 
                     status === 'ordered' ? 'В заказе' : 
                     status === 'delivered' ? 'На складе' : 'Использовано'}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto pb-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Поиск материалов..." className="pl-10 h-10 w-full bg-slate-50 border-none rounded-xl" />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-slate-100 rounded-xl">
                  <Filter size={18} className="text-slate-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/30">
                    <TableHead className="w-[300px]">Наименование / Вид работ</TableHead>
                    <TableHead>Всего закуплено</TableHead>
                    <TableHead>Остаток на складе</TableHead>
                    <TableHead>Брак / Списание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((m) => (
                    <TableRow 
                      key={m.id} 
                      className="border-slate-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      <TableCell onClick={() => setSelectedMaterial(m)} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{m.name}</span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase mt-0.5 tracking-wider">{m.workType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {m.qty} {m.unit}
                        <p className="text-[10px] text-slate-400 font-normal">{(m.qty * m.price).toLocaleString()} ₽</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-bold",
                            (m.stock || 0) < (m.qty * 0.2) ? "text-amber-600" : "text-slate-900"
                          )}>
                            {m.stock} {m.unit}
                          </span>
                          <p className="text-[10px] text-slate-400">~{Math.round(((m.stock || 0) / m.qty) * 100)}% в наличии</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1.5",
                          (m.wastage || 0) > 0 ? "text-red-600" : "text-slate-400"
                        )}>
                          <AlertCircle size={14} />
                          <span className="font-bold text-xs">{m.wastage || 0} {m.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(m.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:bg-red-50" 
                            title="Списать по браку"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScrapMaterial(m);
                              setIsScrapOpen(true);
                            }}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); setEditingMaterial(m); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={(e) => {
                            e.stopPropagation();
                            setMaterials(materials.filter(item => item.id !== m.id));
                            toast.error(`Удалено: ${m.name}`);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMaterials.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 italic">
                  По вашему запросу материалов не найдено
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Затраты по видам работ (₽)</CardTitle>
                <CardDescription>Распределение бюджета на материалы по категориям</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={['Фундамент', 'Стены', 'Общее', 'Кровля'].map(work => ({
                        name: work,
                        value: materials.filter(m => m.workType === work).reduce((acc, m) => acc + (m.qty * m.price), 0)
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Сумма']}
                      />
                      <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Структура остатков</CardTitle>
                <CardDescription>Доля каждого материала в общей стоимости склада</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={materials.filter(m => (m.stock || 0) > 0).map(m => ({
                          name: m.name,
                          value: (m.stock || 0) * m.price
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {materials.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[ '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444' ][index % 5]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Затраты по видам работ</CardTitle>
                <CardDescription>Распределение бюджета на материалы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Фундамент', 'Стены', 'Общее', 'Кровля'].map((work, i) => {
                    const workSum = materials.filter(m => m.workType === work).reduce((acc, m) => acc + (m.qty * m.price), 0);
                    const percentage = Math.round((workSum / stats.totalPurchasedValue) * 100);
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-700">{work}</span>
                          <span className="font-bold text-slate-900">{workSum.toLocaleString()} ₽ ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            i === 0 ? "bg-indigo-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-slate-400" : "bg-emerald-500"
                          )} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Детализация потерь и брака</CardTitle>
                <CardDescription>Сводные данные по причинам списания ТМЦ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                       <p className="text-[10px] font-bold text-red-400 uppercase">Наибольший брак</p>
                       <p className="font-bold text-red-700">Бетон Б25</p>
                       <p className="text-xs text-red-500 mt-1">~4.5% от объема</p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                       <p className="text-[10px] font-bold text-orange-400 uppercase">Основная причина</p>
                       <p className="font-bold text-orange-700">Транспортировка</p>
                       <p className="text-xs text-orange-500 mt-1">65% всех списаний</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Динамика списаний (Последние 30 дней)</h5>
                    <div className="flex items-end gap-1 h-24">
                       {[40, 65, 30, 85, 45, 20, 55, 35, 90, 40].map((h, i) => (
                          <div key={i} className="flex-1 bg-red-100 rounded-t-sm hover:bg-red-400 transition-colors cursor-help" style={{ height: `${h}%` }} title={`День ${i+1}: ${h*100} ₽`} />
                       ))}
                    </div>
                 </div>

                 <Button className="w-full text-xs variant-outline" variant="outline" onClick={() => toast.info("Генерация ПДФ-отчета по браку...")}>
                    Скачать детальный отчет по браку (PDF)
                 </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Анализ брака и потерь</CardTitle>
                <CardDescription>Статистика списаний по каждой позиции</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {materials.filter(m => (m.wastage || 0) > 0).map((m, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg text-red-500">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-slate-500">Списано {m.wastage} {m.unit} из {m.qty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">-{((m.wastage || 0) * m.price).toLocaleString()} ₽</p>
                        <p className="text-[10px] text-red-400 font-bold">{Math.round(((m.wastage || 0) / m.qty) * 100)}% потерь</p>
                      </div>
                    </div>
                  ))}
                  {materials.every(m => (m.wastage || 0) === 0) && (
                    <div className="p-12 text-center text-slate-400 italic">Списаний по браку не зафиксировано</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 outline-none">
           <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                 <CardTitle className="text-lg">Журнал движения ТМЦ</CardTitle>
                 <CardDescription>Все операции по складу за текущий проект</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-6">
                    {[
                      { type: 'in', title: 'Поступление', item: 'Арматура 12мм', qty: '+2.5 т', user: 'Иванов И.', date: 'Сегодня, 10:15' },
                      { type: 'out', title: 'Списание (Брак)', item: 'Кирпич рядовой', qty: '-45 шт', user: 'Петров С.', date: 'Вчера, 16:40' },
                      { type: 'use', title: 'Использовано', item: 'Бетон Б25', qty: '-33 м3', user: 'Сидоров А.', date: '15 Апр, 09:20' },
                      { type: 'in', title: 'Поступление', item: 'Бетон Б25', qty: '+45 м3', user: 'Иванов И.', date: '10 Апр, 11:00' },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== 3 && <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-slate-100" />}
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                          log.type === 'in' ? "bg-green-100 text-green-600" : log.type === 'out' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {log.type === 'in' ? <ArrowDownRight size={20} /> : log.type === 'out' ? <AlertTriangle size={18} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-bold text-slate-900 text-sm">{log.title}: {log.item}</h4>
                                <p className="text-xs text-slate-500 font-medium">Ответственный: {log.user}</p>
                             </div>
                             <div className="text-right">
                                <span className={cn(
                                  "font-bold text-sm",
                                  log.qty.startsWith('+') ? "text-green-600" : log.qty.startsWith('-') && log.type === 'out' ? "text-red-600" : "text-slate-900"
                                )}>{log.qty}</span>
                                <p className="text-[10px] text-slate-400">{log.date}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <Button variant="ghost" className="w-full text-slate-400 text-xs hover:text-slate-900">
                    <History size={14} className="mr-2" /> Показать всю историю
                 </Button>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* Write-off (Scrap) Dialog */}
      <Dialog open={isScrapOpen} onOpenChange={setIsScrapOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Списание по браку
            </DialogTitle>
            <DialogDescription>Укажите количество материала, пришедшее в негодность</DialogDescription>
          </DialogHeader>
          {scrapMaterial && (
            <form onSubmit={handleScrapMaterial} className="grid gap-6 py-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Материал</p>
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{scrapMaterial.name}</span>
                  <span>{scrapMaterial.stock} {scrapMaterial.unit} (остаток)</span>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="scrapQty">Количество для списания ({scrapMaterial.unit})</Label>
                <Input id="scrapQty" name="scrapQty" type="number" step="0.01" min="0.01" max={scrapMaterial.stock} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="scrapReason">Причина брака</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите одну из причин" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damage">Повреждение при разгрузке</SelectItem>
                    <SelectItem value="defect">Заводской брак</SelectItem>
                    <SelectItem value="storage">Неправильное хранение</SelectItem>
                    <SelectItem value="deadline">Истек срок годности</SelectItem>
                    <SelectItem value="error">Ошибка рабочих/замеры</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsScrapOpen(false)}>Отмена</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Подтвердить списание</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить поставку материала</DialogTitle>
            <DialogDescription>Данные о закупке и поступлении на объект</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMaterial} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Наименование</Label>
              <Input id="name" name="name" placeholder="Напр: Цемент М500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qty">Кол-во закупки</Label>
                <Input id="qty" name="qty" type="number" placeholder="0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Ед. изм.</Label>
                <Select name="unit" defaultValue="м3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="м3">м3</SelectItem>
                    <SelectItem value="т">т</SelectItem>
                    <SelectItem value="шт">шт</SelectItem>
                    <SelectItem value="рул">рул</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workType">Вид работ</Label>
              <Select name="workType" defaultValue="Общее">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вид работ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Общее">Общее</SelectItem>
                  <SelectItem value="Фундамент">Фундамент</SelectItem>
                  <SelectItem value="Стены">Стены</SelectItem>
                  <SelectItem value="Кровля">Кровля</SelectItem>
                  <SelectItem value="Инженерные сети">Инженерные сети</SelectItem>
                  <SelectItem value="Отделка">Отделка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Цена за единицу (₽)</Label>
              <Input id="price" name="price" type="number" placeholder="0" required />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-slate-900 w-full rounded-xl">Зафиксировать поступление</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedMaterial && getStatusBadge(selectedMaterial.status)}
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info size={12} /> ID: {selectedMaterial?.id}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">{selectedMaterial?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1 p-4 bg-slate-50 rounded-xl relative overflow-hidden group">
              <div className="absolute right-[-10px] bottom-[-10px] text-slate-200 group-hover:scale-110 transition-transform">
                 <Package size={50} />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Всего закуплено</span>
              <div className="text-lg font-bold text-slate-900">{selectedMaterial?.qty} {selectedMaterial?.unit}</div>
              <div className="text-xs text-slate-400">{(selectedMaterial?.qty * selectedMaterial?.price).toLocaleString()} ₽</div>
            </div>
            <div className="space-y-1 p-4 bg-emerald-50 rounded-xl relative overflow-hidden group">
              <div className="absolute right-[-10px] bottom-[-10px] text-emerald-100 group-hover:scale-110 transition-transform">
                 <ClipboardList size={50} />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Остаток</span>
              <div className="text-lg font-bold text-emerald-700">{selectedMaterial?.stock} {selectedMaterial?.unit}</div>
              <div className="text-xs text-emerald-600 font-medium">{Math.round(((selectedMaterial?.stock || 0) / selectedMaterial?.qty) * 100)}% от закупки</div>
            </div>
            <div className="space-y-1 p-4 bg-red-50 rounded-xl relative overflow-hidden group">
               <div className="absolute right-[-10px] bottom-[-10px] text-red-100 group-hover:scale-110 transition-transform">
                 <AlertTriangle size={50} />
              </div>
              <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Списано (Брак)</span>
              <div className="text-lg font-bold text-red-700">{selectedMaterial?.wastage || 0} {selectedMaterial?.unit}</div>
              <div className="text-xs text-red-600 font-medium">-{((selectedMaterial?.wastage || 0) * selectedMaterial?.price).toLocaleString()} ₽</div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                   <MessageSquare size={18} className="text-slate-400" />
                   Заметки и обсуждение
                </h4>
             </div>
             <Comments contextId={`material_${selectedMaterial?.id}`} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMaterial} onOpenChange={(open) => !open && setEditingMaterial(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать материал</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <form onSubmit={handleEditMaterial} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Наименование</Label>
                <Input id="edit-name" name="name" defaultValue={editingMaterial.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-qty">Количество</Label>
                  <Input id="edit-qty" name="qty" type="number" defaultValue={editingMaterial.qty} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Ед. изм.</Label>
                  <Select name="unit" defaultValue={editingMaterial.unit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="м3">м3</SelectItem>
                      <SelectItem value="т">т</SelectItem>
                      <SelectItem value="шт">шт</SelectItem>
                      <SelectItem value="рул">рул</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Цена за ед. (₽)</Label>
                  <Input id="edit-price" name="price" type="number" defaultValue={editingMaterial.price} required />
                </div>
                <div className="grid gap-2">
                  <Label>Вид работ</Label>
                  <Select name="workType" defaultValue={editingMaterial.workType || 'Общее'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Общее">Общее</SelectItem>
                      <SelectItem value="Фундамент">Фундамент</SelectItem>
                      <SelectItem value="Стены">Стены</SelectItem>
                      <SelectItem value="Кровля">Кровля</SelectItem>
                      <SelectItem value="Инженерные сети">Инженерные сети</SelectItem>
                      <SelectItem value="Отделка">Отделка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Статус</Label>
                <Select name="status" defaultValue={editingMaterial.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordered">Заказано</SelectItem>
                      <SelectItem value="delivered">Доставлено</SelectItem>
                      <SelectItem value="used">Использовано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingMaterial(null)}>Отмена</Button>
                <Button type="submit" className="bg-slate-900">Сохранить изменения</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
