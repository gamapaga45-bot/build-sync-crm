import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Box, 
  Search, 
  Filter, 
  Plus, 
  ArrowRightLeft, 
  Trash2, 
  History, 
  FileText, 
  QrCode, 
  Wrench,
  AlertTriangle,
  ClipboardList,
  MapPin,
  Calendar,
  DollarSign,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InventoryItem, InventoryStatus, Project, UserProfile } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface InventoryViewProps {
  projects: Project[];
  profile: UserProfile | null;
}

export default function InventoryView({ projects, profile }: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isWriteOffOpen, setIsWriteOffOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [writeOffData, setWriteOffData] = useState({ reason: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [transferData, setTransferData] = useState({ toProjectId: '', notes: '' });
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    serialNumber: '',
    price: 0,
    status: 'in-stock',
    condition: 'new'
  });

  // Mock data
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 'inv1',
      name: 'Перфоратор Bosch GBH 2-28',
      category: 'Электроинструмент',
      serialNumber: 'BS-991283',
      sku: 'EL-001',
      price: 15400,
      purchaseDate: '2023-12-10',
      status: 'on-site',
      currentProjectId: projects[0]?.id,
      condition: 'good',
      createdAt: '2023-12-10T09:00:00Z'
    },
    {
      id: 'inv2',
      name: 'Нивелир лазерный ADA Cube',
      category: 'Измерительный инструмент',
      serialNumber: 'ADA-2291',
      sku: 'MS-012',
      price: 8900,
      purchaseDate: '2024-01-15',
      status: 'in-stock',
      condition: 'new',
      createdAt: '2024-01-15T11:30:00Z'
    },
    {
      id: 'inv3',
      name: 'Сварочный инвертор Resanta SAI-190',
      category: 'Оборудование',
      serialNumber: 'RS-190-88',
      sku: 'EQ-044',
      price: 12000,
      purchaseDate: '2023-10-05',
      status: 'maintenance',
      condition: 'worn',
      createdAt: '2023-10-05T14:20:00Z'
    },
    {
      id: 'inv4',
      name: 'Виброплита бензиновая',
      category: 'Оборудование',
      serialNumber: 'VP-8821',
      sku: 'EQ-099',
      price: 45000,
      purchaseDate: '2023-08-20',
      status: 'on-site',
      currentProjectId: projects[1]?.id || projects[0]?.id,
      condition: 'good',
      createdAt: '2023-08-20T10:00:00Z'
    }
  ]);

  const categories = useMemo(() => {
    const cats = items.map(i => i.category);
    return ['all', ...Array.from(new Set(cats))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
                            item.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesProject = projectFilter === 'all' || item.currentProjectId === projectFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesProject;
    });
  }, [items, search, categoryFilter, statusFilter, projectFilter]);

  const handleWriteOff = () => {
    if (!selectedItem) return;
    setItems(prev => prev.map(i => i.id === selectedItem.id ? {
      ...i,
      status: 'written-off',
      writeOffReason: writeOffData.reason,
      writeOffDate: writeOffData.date
    } : i));
    toast.success(`${selectedItem.name} списан`);
    setIsWriteOffOpen(false);
  };

  const handleTransfer = () => {
    if (!selectedItem) return;
    const project = projects.find(p => p.id === transferData.toProjectId);
    setItems(prev => prev.map(i => i.id === selectedItem.id ? {
      ...i,
      status: 'on-site',
      currentProjectId: transferData.toProjectId
    } : i));
    toast.success(`${selectedItem.name} передан на объект: ${project?.name}`);
    setIsTransferOpen(false);
  };

  const handleAddItem = () => {
    const item: InventoryItem = {
      ...newItem as InventoryItem,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      purchaseDate: new Date().toISOString().split('T')[0]
    };
    setItems([...items, item]);
    setIsAddOpen(false);
    toast.success("Инструмент добавлен в реестр");
  };

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'in-stock': return <Badge className="bg-green-100 text-green-700 border-none">На складе</Badge>;
      case 'on-site': return <Badge className="bg-blue-100 text-blue-700 border-none">На объекте</Badge>;
      case 'maintenance': return <Badge className="bg-yellow-100 text-yellow-700 border-none">Сервис</Badge>;
      case 'broken': return <Badge className="bg-orange-100 text-orange-700 border-none">Поломка</Badge>;
      case 'written-off': return <Badge className="bg-slate-200 text-slate-500 border-none">Списан</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExport = () => {
    toast.info("Подготовка реестра инвентаря...");
    const headers = ["ID", "Наименование", "Категория", "S/N", "SKU", "Цена", "Дата закупки", "Статус", "Проект", "Состояние"];
    const rows = items.map(i => [
      i.id,
      i.name,
      i.category,
      i.serialNumber,
      i.sku,
      i.price,
      i.purchaseDate,
      i.status,
      i.currentProjectId || 'Склад',
      i.condition
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Реестр инвентаря успешно скачан");
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-emerald-500';
      case 'good': return 'text-blue-500';
      case 'worn': return 'text-amber-500';
      case 'bad': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Box size={32} className="text-slate-900" />
            Учет инвентаря и оборудования
          </h1>
          <p className="text-slate-500 mt-1">Полный контроль перемещения, состояния и списания основных средств</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download size={18} className="mr-2" /> Выгрузить реестр
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 shadow-lg shadow-slate-200">
            <Plus size={18} className="mr-2" /> Добавить позицию
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ClipboardList size={16} /> Всего позиций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{items.length}</div>
            <p className="text-xs text-slate-400 mt-1">На сумму {items.reduce((acc, i) => acc + i.price, 0).toLocaleString()} ₽</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <MapPin size={16} /> На объектах
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{items.filter(i => i.status === 'on-site').length}</div>
            <p className="text-xs text-blue-400 mt-1">В активной работе</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Wrench size={16} /> В ремонте
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-yellow-600">{items.filter(i => i.status === 'maintenance' || i.status === 'broken').length}</div>
            <p className="text-xs text-yellow-400 mt-1">Требуют внимания</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <History size={16} /> Списано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-400">{items.filter(i => i.status === 'written-off').length}</div>
            <p className="text-xs text-slate-400 mt-1">Убытки составили 124 т.р.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Поиск по названию, S/N или артикулу..."
                className="pl-10 h-10 bg-slate-50 border-none transition-all focus-visible:ring-1 focus-visible:ring-indigo-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-10 border-none bg-slate-50">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Все категории' : cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-10 border-none bg-slate-50">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="in-stock">На складе</SelectItem>
                  <SelectItem value="on-site">На объекте</SelectItem>
                  <SelectItem value="maintenance">Сервис</SelectItem>
                  <SelectItem value="written-off">Списано</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[160px] h-10 border-none bg-slate-50">
                  <SelectValue placeholder="Объект" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все объекты</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Наименование / S/N</th>
                  <th className="px-6 py-4">Категория</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Текущая локация</th>
                  <th className="px-6 py-4">Стоимость</th>
                  <th className="px-6 py-4">Состояние</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <QrCode size={10} /> {item.serialNumber || 'Без S/N'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">{item.category}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        {item.status === 'on-site' ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            {projects.find(p => p.id === item.currentProjectId)?.name || 'Неизвестно'}
                          </>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1 font-normal">
                            <Box size={14} /> Главный склад
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.price.toLocaleString()} ₽</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[10px] font-black uppercase tracking-wider", getConditionColor(item.condition))}>
                        {item.condition === 'new' ? 'Новое' : 
                         item.condition === 'good' ? 'Хорошее' : 
                         item.condition === 'worn' ? 'Износ' : 'Требует ремонта'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          title="Передать"
                          onClick={() => { setSelectedItem(item); setIsTransferOpen(true); }}
                        >
                          <ArrowRightLeft size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                          title="Документация"
                          onClick={() => toast.info("Генерация акта...")}
                        >
                          <FileText size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          title="Списать"
                          onClick={() => { setSelectedItem(item); setIsWriteOffOpen(true); }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="text-blue-600" /> Передача оборудования
            </DialogTitle>
            <DialogDescription>
              Переместите "{selectedItem?.name}" на другой строительный объект
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Выберите объект назначения</Label>
              <Select value={transferData.toProjectId} onValueChange={(v: string) => setTransferData({ ...transferData, toProjectId: v })}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Список проектов" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Примечание</Label>
              <Input 
                placeholder="Особые отметки (состояние, комплектность)..." 
                className="bg-slate-50 border-none"
                value={transferData.notes}
                onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-700 leading-relaxed font-medium">
              При подтверждении будет автоматически сформирован Акт приема-передачи (М-11) и отправлено уведомление прорабу принимающей стороны.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)}>Отмена</Button>
            <Button onClick={handleTransfer} className="bg-blue-600 hover:bg-blue-700">Подтвердить передачу</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write-off Modal */}
      <Dialog open={isWriteOffOpen} onOpenChange={setIsWriteOffOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 /> Списание инструмента
            </DialogTitle>
            <DialogDescription>
              Процедура вывода из эксплуатации "{selectedItem?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-xs">
              <AlertTriangle className="shrink-0" />
              <div>
                <p className="font-bold">Внимание!</p>
                <p className="opacity-80">Это действие нельзя отменить. Остаточная стоимость будет списана в расходы компании.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Причина списания</Label>
              <Select value={writeOffData.reason} onValueChange={(v: string) => setWriteOffData({ ...writeOffData, reason: v })}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damage">Неустранимая поломка</SelectItem>
                  <SelectItem value="loss">Утеря / Кража</SelectItem>
                  <SelectItem value="wear">Полный физический износ</SelectItem>
                  <SelectItem value="obsolete">Моральное устаревание</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Дата списания</Label>
              <Input 
                type="date" 
                className="bg-slate-50 border-none"
                value={writeOffData.date}
                onChange={(e) => setWriteOffData({ ...writeOffData, date: e.target.value })}
              />
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">К списанию (RUB)</div>
              <div className="text-lg font-black text-slate-900">{selectedItem?.price.toLocaleString()} ₽</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsWriteOffOpen(false)}>Отмена</Button>
            <Button onClick={handleWriteOff} className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100">Подтвердить списание</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавление в инвентарный реестр</DialogTitle>
            <DialogDescription>Заполните данные о новой единице оборудования</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Наименование</Label>
              <Input 
                placeholder="Напр: Перфоратор Makita HR2470" 
                className="bg-slate-50 border-none" 
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Input 
                placeholder="Электроинструмент" 
                className="bg-slate-50 border-none"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Серийный номер</Label>
              <Input 
                placeholder="S/N" 
                className="bg-slate-50 border-none"
                value={newItem.serialNumber}
                onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Стоимость закупки (₽)</Label>
              <Input 
                type="number" 
                className="bg-slate-50 border-none"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Состояние</Label>
              <Select value={newItem.condition} onValueChange={(v: any) => setNewItem({...newItem, condition: v})}>
                <SelectTrigger className="bg-slate-50 border-none">
                  <SelectValue placeholder="Состояние" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новое</SelectItem>
                  <SelectItem value="good">Хорошее</SelectItem>
                  <SelectItem value="worn">Изношено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Отмена</Button>
            <Button onClick={handleAddItem} className="bg-slate-900 px-8">Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
