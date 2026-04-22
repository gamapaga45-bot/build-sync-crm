/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  PieChart,
  BarChart3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Invoice, ProjectFinances, InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Comments from "./Comments";

export default function BillingManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv1',
      number: 'INV-2024-001',
      projectId: '1',
      clientId: '1',
      amount: 1200000,
      tax: 240000,
      total: 1440000,
      issueDate: '2024-04-01',
      dueDate: '2024-04-15',
      status: 'paid',
      items: [{ description: 'Аванс за этап "Фундамент"', quantity: 1, price: 1200000, total: 1200000 }],
      createdAt: '2024-04-01'
    },
    {
      id: 'inv2',
      number: 'INV-2024-002',
      projectId: '1',
      clientId: '1',
      amount: 850000,
      tax: 170000,
      total: 1020000,
      issueDate: '2024-04-10',
      dueDate: '2024-04-24',
      status: 'sent',
      items: [{ description: 'Материалы: Арматура А500С', quantity: 10, price: 85000, total: 850000 }],
      createdAt: '2024-04-10'
    },
    {
      id: 'inv3',
      number: 'INV-2024-003',
      projectId: '2',
      clientId: '2',
      amount: 450000,
      tax: 90000,
      total: 540000,
      issueDate: '2024-03-15',
      dueDate: '2024-03-29',
      status: 'overdue',
      items: [{ description: 'Проектные работы', quantity: 1, price: 450000, total: 450000 }],
      createdAt: '2024-03-15'
    }
  ]);

  const [finances] = useState<ProjectFinances[]>([
    {
      projectId: '1',
      plannedRevenue: 15000000,
      plannedCost: 11000000,
      plannedMargin: 26.6,
      actualRevenue: 1440000,
      actualCost: 1250000,
      actualMargin: 13.2,
      receivables: 1020000
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Укажите корректную сумму счета");
      return;
    }
    if (!description || description.length < 5) {
      toast.error("Введите описание работ");
      return;
    }
    if (!dueDate) {
      toast.error("Укажите срок оплаты");
      return;
    }

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: `INV-2024-00${invoices.length + 1}`,
      projectId: '1',
      clientId: '1',
      amount: Number(amount),
      tax: Number(amount) * 0.2,
      total: Number(amount) * 1.2,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'draft',
      items: [{ description, quantity: 1, price: Number(amount), total: Number(amount) }],
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);
    toast.success("Счет успешно создан как черновик");
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700 border-none">Оплачен</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-700 border-none">Отправлен</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700 border-none">Просрочен</Badge>;
      case 'draft': return <Badge className="bg-slate-100 text-slate-700 border-none">Черновик</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Финансы и Биллинг</h2>
          <p className="text-slate-500">Управление счетами, отслеживание оплат и маржинальности проектов</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <PieChart className="w-4 h-4 mr-2" /> Фин. отчет
          </Button>
          <Dialog>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800" />}>
              <Plus className="w-4 h-4 mr-2" /> Выставить счет
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Выставить новый счет</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Сумма (без НДС, ₽)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="1000000" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание работ / материалов</Label>
                    <Textarea id="description" name="description" placeholder="Напр: Аванс за этап 'Кровля'" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Срок оплаты</Label>
                      <Input id="dueDate" name="dueDate" type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Проект</Label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue placeholder="Выбрать проект" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">ЖК "Северное Сияние"</SelectItem>
                          <SelectItem value="2">ТЦ "МегаПолис"</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button">Отмена</Button>
                  <Button className="bg-slate-900" type="submit">Создать счет</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedInvoice && getStatusBadge(selectedInvoice.status)}
              <span className="text-xs text-slate-400">ID: {selectedInvoice?.id}</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">Счет {selectedInvoice?.number}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Сумма</span>
              <div className="text-lg font-bold text-slate-900">{selectedInvoice?.total.toLocaleString()} ₽</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Дата выставления</span>
              <div className="text-lg font-bold text-slate-900">{selectedInvoice?.issueDate}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Срок оплаты</span>
              <div className="text-lg font-bold text-slate-900">{selectedInvoice?.dueDate}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Проект</span>
              <div className="text-lg font-bold text-slate-900">Проект #{selectedInvoice?.projectId}</div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-bold text-slate-900">Позиции счета</h4>
            <div className="space-y-2">
              {selectedInvoice?.items.map((item, i) => (
                <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="text-slate-700">{item.description}</span>
                  <span className="font-bold text-slate-900">{item.total.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>

          <Comments contextId={`invoice_${selectedInvoice?.id}`} />
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="invoices" className="space-y-8">
        <TabsList className="bg-white p-1 border border-slate-200">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-2" /> Счета
          </TabsTrigger>
          <TabsTrigger value="profitability" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" /> Маржинальность
          </TabsTrigger>
          <TabsTrigger value="receivables" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" /> Дебиторка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Всего выставлено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.0 млн ₽</div>
                <p className="text-xs text-slate-400 mt-1">за текущий месяц</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Оплачено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1.44 млн ₽</div>
                <Progress value={48} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Ожидается</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">1.02 млн ₽</div>
                <p className="text-xs text-slate-400 mt-1">2 активных счета</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Просрочено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">0.54 млн ₽</div>
                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle size={12} /> Требует внимания
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  placeholder="Поиск по номеру счета..." 
                  className="pl-10 bg-white border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" /> Фильтры
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Номер</th>
                    <th className="px-6 py-4 font-bold">Проект / Клиент</th>
                    <th className="px-6 py-4 font-bold">Дата</th>
                    <th className="px-6 py-4 font-bold">Срок</th>
                    <th className="px-6 py-4 font-bold text-right">Сумма</th>
                    <th className="px-6 py-4 font-bold">Статус</th>
                    <th className="px-6 py-4 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">{inv.number}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">Проект #{inv.projectId}</div>
                        <div className="text-xs text-slate-500">Клиент #{inv.clientId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{inv.issueDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{inv.dueDate}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {inv.total.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical size={16} className="text-slate-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Скачать PDF</DropdownMenuItem>
                            <DropdownMenuItem><Send className="w-4 h-4 mr-2" /> Отправить</DropdownMenuItem>
                            <DropdownMenuItem className="text-green-600"><CheckCircle2 className="w-4 h-4 mr-2" /> Отметить оплаченным</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finances.map((f) => (
              <Card key={f.projectId} className="border-none shadow-sm bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Проект #{f.projectId}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none">Construction</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Плановая маржа</div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {f.plannedMargin}% <TrendingUp className="text-green-500 w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">План. выручка: {f.plannedRevenue.toLocaleString()} ₽</div>
                      <div className="text-xs text-slate-500">План. расходы: {f.plannedCost.toLocaleString()} ₽</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Фактическая маржа</div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {f.actualMargin}% <TrendingDown className="text-red-500 w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Факт. выручка: {f.actualRevenue.toLocaleString()} ₽</div>
                      <div className="text-xs text-slate-500">Факт. расходы: {f.actualCost.toLocaleString()} ₽</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">Отклонение от плана</span>
                    <span className="text-red-600 font-bold">-{ (f.plannedMargin - f.actualMargin).toFixed(1) }%</span>
                  </div>
                  <Progress value={(f.actualMargin / f.plannedMargin) * 100} className="h-2 bg-slate-100" />
                  <p className="text-xs text-slate-400">Снижение маржинальности связано с ростом цен на арматуру и логистику.</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-6">
          <Card className="border-none shadow-sm bg-white p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Дебиторская задолженность</h3>
              <p className="text-slate-500">Общая сумма неоплаченных счетов составляет 1,560,000 ₽. Из них 540,000 ₽ просрочены более чем на 14 дней.</p>
              <div className="pt-4">
                <Button className="bg-slate-900">Сформировать акты сверки</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
