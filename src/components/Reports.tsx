/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  Plus,
  Camera,
  X,
  Loader2,
  Settings2,
  Trello,
  Layers,
  FileEdit,
  PieChart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { toast } from "sonner";
import { useState } from 'react';
import Comments from "./Comments";

export default function Reports() {
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'templates' | 'summary'>('history');
  
  const [templates, setTemplates] = useState<any[]>([
    { id: 't1', name: 'Полный инженерный аудит', type: 'work', fields: ['tasks', 'workers', 'materials', 'photos'] },
    { id: 't2', name: 'Еженедельный фин. отчет', type: 'budget', fields: ['summary', 'expenses', 'projections'] },
  ]);

  const [reports, setReports] = useState<any[]>([
    { 
      id: '1', 
      name: 'Еженедельный отчет по работам', 
      type: 'PDF', 
      date: '12.04.2024', 
      status: 'ready', 
      size: '2.4 MB', 
      author: 'Иванов А.',
      reportType: 'work',
      data: {
        summary: 'За отчетный период выполнены работы по заливке фундамента секции А и монтажу опалубки секции Б.',
        stats: [
          { label: 'Выполнено задач', value: '24' },
          { label: 'Задействовано рабочих', value: '42' },
          { label: 'Машино-часы', value: '156' },
          { label: 'Отклонение от графика', value: '-2 дня' }
        ],
        details: [
          { task: 'Армирование плиты', progress: 100, status: 'Completed' },
          { task: 'Бетонирование', progress: 85, status: 'In Progress' },
          { task: 'Гидроизоляция', progress: 30, status: 'Started' }
        ]
      }
    },
    { 
      id: '2', 
      name: 'Сводный отчет по портфелю проектов', 
      type: 'XLSX', 
      date: '14.04.2024', 
      status: 'ready', 
      size: '4.5 MB', 
      author: 'Система',
      reportType: 'summary',
      data: {
        summary: 'Агрегированные показатели по 5 активным проектам.',
        stats: [
          { label: 'Проекты', value: '5' },
          { label: 'Общий бюджет', value: '250M ₽' },
          { label: 'Средний прогресс', value: '64%' },
          { label: 'Риски', value: 'Низкие' }
        ],
        projects: [
          { name: 'ЖК "Лазурный"', budget: '80M', progress: 45, status: 'On Track' },
          { name: 'БЦ "Олимп"', budget: '120M', progress: 82, status: 'Finished Soon' },
          { name: 'Вилла "Прибрежная"', budget: '15M', progress: 15, status: 'Early Stage' }
        ]
      }
    },
    { 
      id: '3', 
      name: 'Смета материалов (актуальная)', 
      type: 'XLSX', 
      date: '10.04.2024', 
      status: 'ready', 
      size: '1.1 MB', 
      author: 'Петров С.',
      reportType: 'budget',
      data: {
        summary: 'Анализ закупок за апрель. Наблюдается рост цен на арматуру на 5%.',
        stats: [
          { label: 'Общий бюджет', value: '15.2M ₽' },
          { label: 'Потрачено', value: '8.4M ₽' },
          { label: 'Остаток', value: '6.8M ₽' },
          { label: 'Экономия', value: '120k ₽' }
        ],
        items: [
          { category: 'Бетон М400', planned: '2.1M', actual: '2.05M', diff: '-50k' },
          { category: 'Арматура A500C', planned: '1.5M', actual: '1.62M', diff: '+120k' },
          { category: 'Пиломатериалы', planned: '400k', actual: '380k', diff: '-20k' }
        ]
      }
    },
  ]);

  const [newReportData, setNewReportData] = useState({
    type: 'work',
    period: 'week',
    format: 'pdf',
    includePhotos: true,
    includeBim: false,
    fields: ['summary', 'stats', 'details']
  });

  const handleGenerateReport = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const format = newReportData.format.toUpperCase();
      const newReport = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${newReportData.type === 'work' ? 'Отчет по работам' : 
                newReportData.type === 'budget' ? 'Смета и бюджет' : 
                newReportData.type === 'photos' ? 'Фотофиксация' : 
                newReportData.type === 'summary' ? 'Сводный отчет' : 'Данные BIM'} (${new Date().toLocaleDateString('ru-RU')})`,
        type: format,
        date: new Date().toLocaleDateString('ru-RU'),
        status: 'ready',
        size: format === 'PDF' ? '2.1 MB' : format === 'XLSX' ? '1.2 MB' : '3.4 MB',
        author: 'Текущий пользователь',
        reportType: newReportData.type,
        data: {
          summary: 'Отчет сформирован автоматически по индивидуальному шаблону.',
          stats: [
            { label: 'Поля', value: newReportData.fields.length.toString() },
            { label: 'Период', value: newReportData.period },
            { label: 'Статус', value: 'Завершено' }
          ]
        }
      };
      setReports([newReport, ...reports]);
      setIsGenerating(false);
      setIsNewReportOpen(false);
      toast.success(`Отчет в формате ${format} успешно сформирован`);
    }, 2000);
  };

  const renderReportPreview = (report: any) => {
    if (!report || !report.data) return null;

    const { data, reportType } = report;

    return (
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Резюме</h5>
          <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
        </div>

        {data.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.stats.map((stat: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{stat.label}</div>
                <div className="text-sm font-bold text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {reportType === 'summary' && data.projects && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase">Сводка по проектам</h5>
            <div className="space-y-3">
              {data.projects.map((proj: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{proj.name}</span>
                    <Badge variant="outline" className="text-[10px]">{proj.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold">{proj.progress}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Бюджет: {proj.budget} ₽</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'work' && data.details && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase">Детализация задач</h5>
            <div className="space-y-2">
              {data.details.map((detail: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-50 text-xs">
                  <span className="font-medium text-slate-700">{detail.task}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${detail.progress}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-900 w-8 text-right">{detail.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'budget' && data.items && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase">Анализ по категориям</h5>
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="p-2">Категория</th>
                    <th className="p-2">План</th>
                    <th className="p-2">Факт</th>
                    <th className="p-2">Откл.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{item.category}</td>
                      <td className="p-2">{item.planned}</td>
                      <td className="p-2">{item.actual}</td>
                      <td className={cn("p-2 font-bold", item.diff.startsWith('+') ? "text-red-500" : "text-green-500")}>
                        {item.diff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'photos' && data.photos && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase">Фотофиксация</h5>
            <div className="grid grid-cols-2 gap-3">
              {data.photos.map((photo: any, i: number) => (
                <div key={i} className="group relative rounded-lg overflow-hidden border border-slate-100 bg-slate-200 aspect-video">
                  <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 text-[10px] text-white backdrop-blur-sm">
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center p-4 border-t border-slate-100">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Download className="w-3 h-3 mr-2" /> Скачать полную версию ({report.size})
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Генерация отчетов</h2>
          <p className="text-slate-500 text-sm">Создавайте и скачивайте документацию по проекту</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <Filter className="w-4 h-4 mr-2" /> Фильтры
          </Button>
          <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
            <DialogTrigger render={<Button className="bg-slate-900 h-12 sm:h-10 text-base sm:text-sm px-6" />}>
              <Plus className="w-4 h-4 mr-2" /> Новый отчет
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Сформировать новый отчет</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGenerateReport} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Шаблон (опционально)</Label>
                  <Select onValueChange={(v) => {
                    const t = templates.find(t => t.id === v);
                    if (t) setNewReportData({...newReportData, type: t.type, fields: t.fields});
                  }}>
                    <SelectTrigger className="bg-slate-50 border-none">
                      <SelectValue placeholder="Выберите готовый шаблон" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Тип отчета</Label>
                  <Select 
                    value={newReportData.type} 
                    onValueChange={(v) => setNewReportData({...newReportData, type: v})}
                  >
                    <SelectTrigger className="bg-slate-50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Отчет по работам</SelectItem>
                      <SelectItem value="budget">Смета и бюджет</SelectItem>
                      <SelectItem value="photos">Фотофиксация</SelectItem>
                      <SelectItem value="summary">Сводный по проектам</SelectItem>
                      <SelectItem value="bim">Данные BIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Поля для включения</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                    {['summary', 'stats', 'details', 'photos', 'budget_items', 'charts'].map(f => (
                      <label key={f} className="flex items-center gap-2 text-[10px] cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newReportData.fields.includes(f)}
                          onChange={(e) => {
                            const fields = e.target.checked 
                              ? [...newReportData.fields, f]
                              : newReportData.fields.filter(x => x !== f);
                            setNewReportData({...newReportData, fields});
                          }}
                          className="rounded border-slate-300"
                        />
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Формат файла</Label>
                  <Select 
                    value={newReportData.format} 
                    onValueChange={(v) => setNewReportData({...newReportData, format: v})}
                  >
                    <SelectTrigger className="bg-slate-50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReportData.includePhotos} 
                      onChange={(e) => setNewReportData({...newReportData, includePhotos: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    Включить фото
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReportData.includeBim} 
                      onChange={(e) => setNewReportData({...newReportData, includeBim: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    Данные BIM
                  </label>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100">
                  <Button type="submit" className="bg-slate-900 w-full h-12 sm:h-10 text-base sm:text-sm" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Генерация...
                      </>
                    ) : 'Сгенерировать'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Отчет по работам', icon: FileText, color: 'bg-blue-50 text-blue-600', type: 'work' },
          { title: 'Смета и бюджет', icon: FileSpreadsheet, color: 'bg-green-50 text-green-600', type: 'budget' },
          { title: 'Сводный (Портфель)', icon: PieChart, color: 'bg-indigo-50 text-indigo-600', type: 'summary' },
          { title: 'Фотофиксация', icon: Camera, color: 'bg-purple-50 text-purple-600', type: 'photos' },
        ].map((item, i) => (
          <Card 
            key={i} 
            className="border-none shadow-sm bg-white hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer group"
            onClick={() => {
              setNewReportData({...newReportData, type: item.type as any});
              setIsNewReportOpen(true);
              toast.info(`Настройка параметров для: ${item.title}`);
            }}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500">Сгенерировать за период</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">История отчетов</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className={cn(
                "text-[10px] border-none",
                selectedReport?.status === 'ready' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
              )}>
                {selectedReport?.status === 'ready' ? 'Готов' : 'Архив'}
              </Badge>
              <span className="text-xs text-slate-400">ID: {selectedReport?.id}</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">{selectedReport?.name}</DialogTitle>
            <DialogDescription>Детальная информация об отчете и обсуждение</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Тип файла</span>
              <div className="text-lg font-bold text-slate-900">{selectedReport?.type}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Размер</span>
              <div className="text-lg font-bold text-slate-900">{selectedReport?.size}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Дата создания</span>
              <div className="text-lg font-bold text-slate-900">{selectedReport?.date}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Автор</span>
              <div className="text-lg font-bold text-slate-900">{selectedReport?.author}</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Предпросмотр содержания</h4>
            {renderReportPreview(selectedReport)}
          </div>

          <Comments contextId={`report_${selectedReport?.id}`} />
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-3 font-bold">Название отчета</th>
                  <th className="px-6 py-3 font-bold">Дата</th>
                  <th className="px-6 py-3 font-bold">Размер</th>
                  <th className="px-6 py-3 font-bold">Автор</th>
                  <th className="px-6 py-3 font-bold">Статус</th>
                  <th className="px-6 py-3 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                          {report.type === 'PDF' && <FileText size={16} />}
                          {report.type === 'XLSX' && <FileSpreadsheet size={16} />}
                          {report.type === 'DOCX' && <FileEdit size={16} />}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{report.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{report.size}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{report.author}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn(
                        "text-[10px] border-none",
                        report.status === 'ready' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {report.status === 'ready' ? 'Готов' : 'Архив'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => toast.info(`Просмотр отчета: ${report.name}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => toast.success(`Отчет ${report.name} скачан`)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => toast.info("Ссылка на отчет скопирована")}>
                          <Share2 className="w-4 h-4" />
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
    </div>
  );
}
