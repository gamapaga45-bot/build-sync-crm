/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Wallet, 
  Calculator, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download,
  Plus,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkerPayroll } from '@/types';
import { toast } from 'sonner';

const demoWorkers: WorkerPayroll[] = [
  {
    id: '1',
    name: 'Иван Петров',
    role: 'Бригадир',
    dailyRate: 4500,
    daysWorked: 22,
    overtimeHours: 10,
    overtimeRate: 600,
    bonuses: 5000,
    deductions: 0,
    totalPay: 109000,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-04-01'
  },
  {
    id: '2',
    name: 'Алексей Сидоров',
    role: 'Бетонщик 4р',
    dailyRate: 3500,
    daysWorked: 20,
    overtimeHours: 15,
    overtimeRate: 500,
    bonuses: 2000,
    deductions: 500,
    totalPay: 79000,
    paymentStatus: 'pending'
  },
  {
    id: '3',
    name: 'Сергей Волков',
    role: 'Арматурщик',
    dailyRate: 3200,
    daysWorked: 24,
    overtimeHours: 5,
    overtimeRate: 450,
    bonuses: 0,
    deductions: 1000,
    totalPay: 78050,
    paymentStatus: 'pending'
  }
];

export default function Payroll() {
  const [workers, setWorkers] = useState<WorkerPayroll[]>(demoWorkers);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const total = workers.reduce((acc, w) => acc + w.totalPay, 0);
    const paid = workers.filter(w => w.paymentStatus === 'paid').reduce((acc, w) => acc + w.totalPay, 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workers, searchQuery]);

  const handlePay = (id: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === id ? { ...w, paymentStatus: 'paid', lastPaymentDate: new Date().toISOString().split('T')[0] } : w
    ));
    toast.success("Выплата успешно зафиксирована");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Зарплатная ведомость</h2>
          <p className="text-slate-500 font-medium italic">Учет рабочего времени и финальные расчеты с персоналом</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 bg-white" onClick={() => toast.success("Выгрузка Excel ведомости начата")}>
            <Download className="w-4 h-4 mr-2" /> Экспорт
          </Button>
          <Button 
            className="bg-slate-900 h-10 px-6 font-bold shadow-lg shadow-slate-200"
            onClick={() => toast.success("Переход в базу кадров для назначения на проект")}
          >
            <Plus className="w-4 h-4 mr-2" /> Добавить сотрудника
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Общая сумма выплат</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.total.toLocaleString()} ₽</div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
              <ArrowUpRight size={14} /> +12% к прошлому месяцу
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Выплачено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-600">{stats.paid.toLocaleString()} ₽</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">Закрыто 42% ведомости</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white ring-1 ring-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">В ожидании</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">{stats.pending.toLocaleString()} ₽</div>
            <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs font-bold">
              <Clock size={14} /> Срок выплат до 10.05
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Поиск по ФИО или должности..." 
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button 
               variant="outline" 
               className="h-10 rounded-xl bg-white flex-1 sm:flex-none"
               onClick={() => toast.info("Фильтрация по бригадам и участкам")}
             >
               <Filter className="w-4 h-4 mr-2" /> Фильтры
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-[0.1em] text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">Сотрудник</th>
                <th className="px-6 py-4">Ставка</th>
                <th className="px-6 py-4">Отработано</th>
                <th className="px-6 py-4">Бонусы/Уд.</th>
                <th className="px-6 py-4 text-right">К выплате</th>
                <th className="px-6 py-4 text-center">Статус</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-none mb-1">{worker.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight opacity-70 italic">{worker.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{worker.dailyRate.toLocaleString()} ₽/день</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">Сверхурочные: {worker.overtimeRate} ₽/ч</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{worker.daysWorked} дн.</div>
                    <div className="text-[10px] text-slate-500 font-medium">+{worker.overtimeHours} ч переработок</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {worker.bonuses > 0 && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none text-[9px]">+ {worker.bonuses} 🔥</Badge>}
                      {worker.deductions > 0 && <Badge variant="outline" className="bg-red-50 text-red-700 border-none text-[9px]">- {worker.deductions}</Badge>}
                      {worker.bonuses === 0 && worker.deductions === 0 && <span className="text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-base font-black text-slate-900">{worker.totalPay.toLocaleString()} ₽</div>
                    {worker.lastPaymentDate && <div className="text-[9px] text-slate-400 font-medium">Последняя: {worker.lastPaymentDate}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {worker.paymentStatus === 'paid' ? (
                      <Badge className="bg-green-100 text-green-700 border-none font-bold text-[9px] uppercase tracking-wider px-2">Выплачено</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[9px] uppercase tracking-wider px-2">В очереди</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-900 transition-colors" />}>
                        <MoreVertical size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="py-2.5 font-bold text-xs" onClick={() => handlePay(worker.id)} disabled={worker.paymentStatus === 'paid'}>
                          <Calculator className="w-4 h-4 mr-2 text-blue-500" /> Сформировать выплату
                        </DropdownMenuItem>
                        <DropdownMenuItem className="py-2.5 font-bold text-xs">
                          <Download className="w-4 h-4 mr-2" /> Справка 2-НДФЛ
                        </DropdownMenuItem>
                        <DropdownMenuItem className="py-2.5 font-bold text-xs text-red-600">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Оштрафовать
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <Card className="border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">График платежей</h4>
              <p className="text-sm text-slate-500 font-medium">Ближайшие даты массовых выплат</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-l-4 border-l-blue-500">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">25</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">апр</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-none">Аванс за 2-ю половину месяца</div>
                    <div className="text-xs text-slate-500 mt-1">Ожидаемая сумма: 450,000 ₽</div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-none text-[10px]">Планируется</Badge>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-l-4 border-l-emerald-500 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">10</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">апр</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-none">Основная ЗП за Март</div>
                    <div className="text-xs text-slate-500 mt-1">Проведен платеж на 1.2 млн ₽</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none text-[10px]">Исполнено</Badge>
             </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <DollarSign size={200} />
          </div>
          <h4 className="text-xl font-black mb-2 tracking-tight">ИИ-Прогноз ФОТ</h4>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Система проанализировала темпы работ и прогнозирует увеличение фонда оплаты труда на 15% в следующем месяце из-за привлечения субподрядчиков на кровлю.</p>
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400">Прогноз на Май:</span>
                <span className="text-xl font-black text-emerald-400">≈ 1.45 млн ₽</span>
             </div>
             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]" />
             </div>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-right">На основе данных ГЭСН</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
