/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus,
  ArrowUpRight,
  Download,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from 'react';
import Comments from "./Comments";
import { notificationService } from "@/services/NotificationService";
import { toast } from 'sonner';

const data = [
  { name: 'Материалы', value: 6500000, color: '#0f172a' },
  { name: 'Работы', value: 3200000, color: '#334155' },
  { name: 'Техника', value: 1200000, color: '#64748b' },
  { name: 'Прочее', value: 800000, color: '#94a3b8' },
];

import { workTypeService, WorkType } from '@/services/workTypeService';

export default function Budget() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isEstimateAddOpen, setIsEstimateAddOpen] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);
  const [estimateItems, setEstimateItems] = useState<any[]>([]);
  const projectWorkTypes = workTypeService.getWorks();
  const totalSpent = data.reduce((acc, item) => acc + item.value, 0);
  const totalBudget = 15000000;
  const remaining = totalBudget - totalSpent;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-indigo-950 text-white">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Сметный расчет</h3>
                    <Button 
                      onClick={() => setIsEstimateAddOpen(true)}
                      className="bg-white text-slate-900 hover:bg-slate-100 h-8 text-xs"
                    >
                      <Plus size={16} className="mr-2" /> Добавить
                    </Button>
                 </div>
                 <p className="text-slate-400 text-xs mb-4">Формирование позиций сметы из реестра ГЭСН/НПРМ</p>
                 <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                    {estimateItems.length === 0 ? (
                      <div className="text-center py-4 border border-white/10 rounded-lg dashed">
                         <p className="text-[10px] text-slate-500 italic">Позиции не выбраны</p>
                      </div>
                    ) : (
                      estimateItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-[11px] border border-white/5">
                           <span className="truncate mr-2">{item.title}</span>
                           <span className="font-bold shrink-0">{item.qty} {item.unit}</span>
                        </div>
                      ))
                    )}
                 </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-slate-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-[10px] text-white/50 hover:text-white hover:bg-white/10 h-7"
                      onClick={() => {
                        notificationService.addNotification({
                          title: "Изменение бюджета проекта",
                          message: "Зарегистрирован крупный расход (1.2M ₽) по статье 'Материалы'. Требуется подтверждение.",
                          type: "warning",
                          category: "budget"
                        });
                        toast.info("Симулировано уведомление об изменении бюджета");
                      }}
                    >
                      Симулировать расход
                    </Button>
                    <Badge className="bg-green-500/20 text-green-400 border-none">В рамках бюджета</Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">Остаток бюджета</p>
                <h3 className="text-3xl font-bold">{remaining.toLocaleString()} ₽</h3>
                <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-1000" 
                    style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Потрачено: {((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
                  <span>Всего: {totalBudget.toLocaleString()} ₽</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm mb-1">Расходы за месяц</p>
                      <h4 className="text-xl font-bold text-slate-900">840,000 ₽</h4>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm mb-1">Средний чек закупки</p>
                      <h4 className="text-xl font-bold text-slate-900">45,200 ₽</h4>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Последние транзакции</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const csv = "Описание,Категория,Сумма,Дата\n" + 
              [
                { desc: 'Оплата работ по фундаменту', cat: 'Работы', amount: -450000, date: '12.04.2024' },
                { desc: 'Закупка цемента (50 мешков)', cat: 'Материалы', amount: -28500, date: '10.04.2024' },
                { desc: 'Аренда экскаватора', cat: 'Техника', amount: -15000, date: '08.04.2024' },
                { desc: 'Возврат излишков арматуры', cat: 'Материалы', amount: 12000, date: '05.04.2024' },
              ].map(t => `${t.desc},${t.cat},${t.amount},${t.date}`).join("\n");
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "budget_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Экспорт завершен");
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Экспорт (CSV)
        </Button>
      </CardHeader>
            <CardContent>
              <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={cn(
                        "text-[10px] border-none",
                        selectedTransaction?.amount < 0 ? "bg-slate-100 text-slate-600" : "bg-green-100 text-green-600"
                      )}>
                        {selectedTransaction?.amount < 0 ? 'Расход' : 'Доход'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-none bg-slate-100 text-slate-600">
                        {selectedTransaction?.cat}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">{selectedTransaction?.desc}</DialogTitle>
                    <DialogDescription>Детали транзакции и обсуждение</DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Сумма</span>
                      <div className={cn(
                        "text-lg font-bold",
                        selectedTransaction?.amount < 0 ? "text-slate-900" : "text-green-600"
                      )}>
                        {selectedTransaction?.amount > 0 ? '+' : ''}{selectedTransaction?.amount.toLocaleString()} ₽
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Дата</span>
                      <div className="text-lg font-bold text-slate-900">{selectedTransaction?.date}</div>
                    </div>
                  </div>

                  <Comments contextId={`transaction_${selectedTransaction?.date}_${selectedTransaction?.desc}`} />
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {[
                  { desc: 'Оплата работ по фундаменту', cat: 'Работы', amount: -450000, date: '12.04.2024' },
                  { desc: 'Закупка цемента (50 мешков)', cat: 'Материалы', amount: -28500, date: '10.04.2024' },
                  { desc: 'Аренда экскаватора', cat: 'Техника', amount: -15000, date: '08.04.2024' },
                  { desc: 'Возврат излишков арматуры', cat: 'Материалы', amount: 12000, date: '05.04.2024' },
                ].map((t, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTransaction(t)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        t.amount < 0 ? "bg-slate-100 text-slate-600" : "bg-green-100 text-green-600"
                      )}>
                        {t.amount < 0 ? <TrendingUp size={18} className="rotate-45" /> : <TrendingDown size={18} className="-rotate-45" />}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-900">{t.desc}</h5>
                        <p className="text-xs text-slate-500">{t.cat} • {t.date}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-bold",
                      t.amount < 0 ? "text-slate-900" : "text-green-600"
                    )}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} ₽
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Структура расходов</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Распределение затрат %</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{((item.value / totalSpent) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Add Estimate Item Dialog */}
      <Dialog open={isEstimateAddOpen} onOpenChange={setIsEstimateAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить позицию в смету</DialogTitle>
            <DialogDescription>Выберите вид работ из реестра и укажите планируемые объемы</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Выберите вид работ</Label>
              <Select onValueChange={(val) => setSelectedWorkType(projectWorkTypes.find(w => w.id === val) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Поиск в реестре ГЭСН..." />
                </SelectTrigger>
                <SelectContent>
                   <ScrollArea className="h-48">
                      {projectWorkTypes.map(work => (
                        <SelectItem key={work.id} value={work.id}>
                          {work.code} - {work.title}
                        </SelectItem>
                      ))}
                   </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {selectedWorkType && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedWorkType.title}</h4>
                      <p className="text-[10px] text-slate-500 uppercase">{selectedWorkType.standard} • {selectedWorkType.code}</p>
                   </div>
                   <Badge variant="outline" className="bg-white">{selectedWorkType.baseUnitValue > 1 ? `${selectedWorkType.baseUnitValue} ` : ''}{selectedWorkType.unit}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimate-qty">Объем ({selectedWorkType.unit})</Label>
                    <Input id="estimate-qty" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ед. измерения</Label>
                    <div className="h-10 flex items-center px-3 bg-white border rounded text-sm text-slate-500">
                      {selectedWorkType.baseUnitValue > 1 ? `база ${selectedWorkType.baseUnitValue}` : 'стандарт'}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  * Объем будет рассчитан кратно базисной единице {selectedWorkType.baseUnitValue} {selectedWorkType.unit}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button variant="outline" onClick={() => setIsEstimateAddOpen(false)}>Отмена</Button>
             <Button 
                className="bg-slate-900" 
                onClick={() => {
                  if (!selectedWorkType) return;
                  const qtyInput = document.getElementById('estimate-qty') as HTMLInputElement;
                  const item = {
                    title: selectedWorkType.title,
                    unit: selectedWorkType.unit,
                    qty: qtyInput.value,
                    baseValue: selectedWorkType.baseUnitValue
                  };
                  setEstimateItems([...estimateItems, item]);
                  setIsEstimateAddOpen(false);
                  toast.success("Позиция добавлена в смету");
                }}
             >Применить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
