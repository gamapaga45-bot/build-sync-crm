/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  MessageSquare,
  Clock,
  ArrowRight,
  Wrench,
  FileText,
  Info,
  Loader2,
  Download,
  Ruler,
  Lightbulb,
  Maximize2,
  Sparkles,
  Pencil,
  X,
  Share2,
  Eye,
  History,
  Calendar
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import { geminiService } from "@/services/geminiService";
import { notificationService } from "@/services/NotificationService";
import Comments from "./Comments";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AcceptanceModule() {
  const { profile } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fixPhotosCount, setFixPhotosCount] = useState(0);
  const [defectDescription, setDefectDescription] = useState('');
  const [fixDescription, setFixDescription] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRewritingFix, setIsRewritingFix] = useState(false);
  const [editingInspection, setEditingInspection] = useState<any>(null);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed' | 'pending'>('all');
  const [reports, setReports] = useState<any[]>([
    { id: 'R1', title: 'Отчет по армированию', date: '2024-04-14', type: 'Дефект', status: 'critical', author: 'Сергей С.' },
    { id: 'R2', title: 'Контроль бетонирования', date: '2024-04-12', type: 'Плановый', status: 'passed', author: 'Алексей И.' },
  ]);
  const [newReportData, setNewReportData] = useState({
    objectSection: '',
    workType: '',
    contractor: '',
    weather: '',
    temperature: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inspections, setInspections] = useState([
    { 
      id: '1', 
      title: 'Приемка арматурного каркаса', 
      status: 'failed', 
      errors: 2, 
      critical: true,
      deadline: '2024-04-14',
      assignedTo: 'Сергей С.'
    },
    { 
      id: '2', 
      title: 'Проверка гидроизоляции фундамента', 
      status: 'passed', 
      errors: 0, 
      critical: false,
      deadline: '2024-04-12',
      assignedTo: 'Алексей И.'
    },
    { 
      id: '3', 
      title: 'Контроль качества бетона', 
      status: 'pending', 
      errors: 0, 
      critical: false,
      deadline: '2024-04-16',
      assignedTo: 'Иван П.'
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: `Проведи профессиональный технический анализ данной фотографии со строительной площадки. 
              ${defectDescription ? `Дополнительная информация от инспектора: "${defectDescription}"` : ''}
              1. Идентифицируй конструктивный элемент.
              2. Найди возможные нарушения и ошибки.
              3. Сошлись на конкретные пункты нормативных документов (СП, СНиП, ГОСТ, РДС, МДС), если это возможно.
              4. Дай рекомендации по устранению.
              Ответ предоставь в формате структурированного технического отчета на русском языке.`,
            },
          ],
        },
      });
      
      setAnalysisResult(response.text || "Анализ не выявил явных нарушений или недостаточно данных.");
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult("Ошибка при анализе изображения. Попробуйте еще раз.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDefectRewrite = async () => {
    if (!defectDescription || defectDescription.trim().length < 5) {
      toast.error("Введите описание дефекта для улучшения");
      return;
    }

    setIsRewriting(true);
    try {
      const professionalText = await geminiService.rewriteDefectDescription(defectDescription);
      setDefectDescription(professionalText);
      toast.success("Описание дефекта профессионально переработано");
    } catch (error) {
      toast.error("Не удалось переработать текст");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleFixRewrite = async () => {
    if (!fixDescription || fixDescription.trim().length < 5) {
      toast.error("Введите описание работ для улучшения");
      return;
    }

    setIsRewritingFix(true);
    try {
      const professionalText = await geminiService.rewriteProfessionally(fixDescription);
      setFixDescription(professionalText);
      toast.success("Описание работ профессионально переработано");
    } catch (error) {
      toast.error("Не удалось переработать текст");
    } finally {
      setIsRewritingFix(false);
    }
  };

  const handleEditInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInspection) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updated = {
      ...editingInspection,
      title: formData.get('title') as string,
      status: formData.get('status') as string,
      deadline: formData.get('deadline') as string,
      critical: formData.get('critical') === 'on',
    };
    
    setInspections(inspections.map(i => i.id === editingInspection.id ? updated : i));
    
    if (updated.status === 'failed' && updated.critical) {
      notificationService.addNotification({
        title: "Критическая ошибка приемки",
        message: `Обнаружено критическое нарушение в: ${updated.title}. Требуется немедленное вмешательство.`,
        type: "error",
        category: "critical_error"
      });
    }

    toast.success("Проверка обновлена");
    setEditingInspection(null);
  };

  const filteredInspections = filter === 'all' 
    ? inspections 
    : inspections.filter(i => i.status === filter);

  const stats = {
    failed: inspections.filter(i => i.status === 'failed').length,
    passed: inspections.filter(i => i.status === 'passed').length,
    pending: inspections.filter(i => i.status === 'pending').length
  };

  const handleSaveToHistory = () => {
    if (!analysisResult) return;
    
    const newReport = {
      id: `R${Date.now()}`,
      title: defectDescription || "Технический отчет",
      date: new Date().toISOString().split('T')[0],
      type: 'ИИ-Анализ',
      status: 'pending',
      author: profile?.displayName || 'Инженер',
      details: {
        ...newReportData,
        analysis: analysisResult
      }
    };
    
    setReports([newReport, ...reports]);
    toast.success("Отчет сохранен в историю");
    setSelectedImage(null);
    setAnalysisResult(null);
    setDefectDescription('');
  };

  const handleShare = (report: any) => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: `Технический отчет от ${report.date}. Статус: ${report.status}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${report.title} - ${report.date}`);
      toast.success("Ссылка скопирована в буфер обмена");
    }
  };

  const generateReport = () => {
    if (!analysisResult) {
      toast.error("Сначала проведите анализ изображения");
      return;
    }
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const blob = new Blob([analysisResult], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Technical_Report_${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(true);
        }, 1500);
      }),
      {
        loading: 'Подготовка отчета...',
        success: 'Отчет успешно скачан',
        error: 'Ошибка при генерации отчета',
      }
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Технический надзор</h2>
          <p className="text-slate-500 text-sm">Приемка работ и контроль качества</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="border-slate-200" />}>
              <Info className="w-4 h-4 mr-2" /> Инструкция по фото
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Как делать фото для анализа</DialogTitle>
                <DialogDescription>
                  Для корректной работы ИИ-анализатора следуйте этим правилам
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 h-fit">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Используйте масштаб</h4>
                    <p className="text-sm text-slate-500">Прикладывайте рулетку или строительную линейку к узлу. Это позволит ИИ оценить размеры, шаги армирования или толщину швов.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 h-fit">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Освещение и фокус</h4>
                    <p className="text-sm text-slate-500">Избегайте сильных теней и засветов. Сфокусируйтесь на конкретной детали, которую нужно проверить.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600 h-fit">
                    <Maximize2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Разные ракурсы</h4>
                    <p className="text-sm text-slate-500">Сделайте общий план (для контекста) и 2-3 детальных снимка под разными углами.</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-600 font-medium mb-1 uppercase tracking-wider">Что прикладывать:</p>
                  <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
                    <li>Рулетка (развернутая)</li>
                    <li>Уровень (для проверки вертикалей/горизонталей)</li>
                    <li>Маркер (для обозначения места дефекта)</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={<Button className="bg-red-600 hover:bg-red-700" disabled={profile?.role !== 'admin' && profile?.role !== 'engineer'} />}>
              <ShieldCheck className="w-4 h-4 mr-2" /> Начать осмотр
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Интеллектуальный осмотр объекта</DialogTitle>
                <DialogDescription>
                  Загрузите фото для автоматического анализа на соответствие нормативам
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-red-400 hover:bg-red-50/30 transition-all cursor-pointer overflow-hidden group"
                >
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">Сменить фото</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-red-50 rounded-full text-red-600">
                        <Camera size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-900">Нажмите для загрузки фото</p>
                        <p className="text-xs text-slate-500">JPG, PNG до 10МБ</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Описание дефекта / Пояснение</Label>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                      onClick={handleDefectRewrite}
                      disabled={isRewriting}
                    >
                      {isRewriting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Улучшить с ИИ
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Опишите выявленный дефект своими словами..." 
                    className="min-h-[80px]" 
                    value={defectDescription}
                    onChange={(e) => setDefectDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Сектор / Участок</Label>
                    <Select onValueChange={(v: string) => setNewReportData({...newReportData, objectSection: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sect-a">Сектор А</SelectItem>
                        <SelectItem value="sect-b">Сектор Б</SelectItem>
                        <SelectItem value="foundation">Фундамент</SelectItem>
                        <SelectItem value="roof">Кровля</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Вид работ</Label>
                    <Select onValueChange={(v: string) => setNewReportData({...newReportData, workType: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concrete">Бетонные работы</SelectItem>
                        <SelectItem value="reinforcement">Армирование</SelectItem>
                        <SelectItem value="hydro">Гидроизоляция</SelectItem>
                        <SelectItem value="masonry">Кладка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Подрядчик</Label>
                    <Input 
                      placeholder="Название организации" 
                      onChange={(e) => setNewReportData({...newReportData, contractor: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Погода</Label>
                      <Input 
                        placeholder="Ясно" 
                        onChange={(e) => setNewReportData({...newReportData, weather: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>t°C</Label>
                      <Input 
                        placeholder="+15" 
                        onChange={(e) => setNewReportData({...newReportData, temperature: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {selectedImage && !analysisResult && (
                  <Button 
                    onClick={analyzePhoto} 
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 h-12"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Анализируем изображение...
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4 mr-2" />
                        Запустить анализ на ошибки
                      </>
                    )}
                  </Button>
                )}

                {analysisResult && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        Результаты анализа
                      </h4>
                      <Button variant="outline" size="sm" onClick={generateReport}>
                        <Download className="w-4 h-4 mr-2" /> Скачать отчет
                      </Button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {analysisResult}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}>Сбросить</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveToHistory}>Сохранить в журнал</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={<Button variant="outline">
              <History className="w-4 h-4 mr-2" /> История отчетов
            </Button>} />
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>История технических отчетов</DialogTitle>
                <DialogDescription>Архив всех сформированных отчетов технадзора</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex gap-2 pb-2 overflow-x-auto">
                  <Badge variant="outline" className="cursor-pointer bg-slate-100">Все типы</Badge>
                  <Badge variant="outline" className="cursor-pointer">Дефекты</Badge>
                  <Badge variant="outline" className="cursor-pointer">Плановые</Badge>
                  <Badge variant="outline" className="cursor-pointer">ИИ-Анализ</Badge>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Название / Тема</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Автор</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell className="text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {report.date}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{report.author}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Просмотр отчета...")}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("Загрузка PDF...")}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare(report)}>
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={cn(
            "border-none shadow-sm bg-white cursor-pointer transition-all hover:ring-2 hover:ring-red-100",
            filter === 'failed' && "ring-2 ring-red-500"
          )}
          onClick={() => setFilter(filter === 'failed' ? 'all' : 'failed')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Критические ошибки</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.failed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "border-none shadow-sm bg-white cursor-pointer transition-all hover:ring-2 hover:ring-green-100",
            filter === 'passed' && "ring-2 ring-green-500"
          )}
          onClick={() => setFilter(filter === 'passed' ? 'all' : 'passed')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Принято без замечаний</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.passed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "border-none shadow-sm bg-white cursor-pointer transition-all hover:ring-2 hover:ring-blue-100",
            filter === 'pending' && "ring-2 ring-blue-500"
          )}
          onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ожидают проверки</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Dialog open={!!selectedInspection} onOpenChange={(open) => !open && setSelectedInspection(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {selectedInspection && (
                  <Badge className={cn(
                    "border-none",
                    selectedInspection.status === 'passed' ? "bg-green-100 text-green-600" :
                    selectedInspection.status === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {selectedInspection.status === 'passed' ? 'Принято' : selectedInspection.status === 'failed' ? 'Не принято' : 'В процессе'}
                  </Badge>
                )}
                {selectedInspection?.critical && <Badge className="bg-red-600 text-white border-none">Критично</Badge>}
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">{selectedInspection?.title}</DialogTitle>
              <DialogDescription>Результаты инспекции и история обсуждений</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ответственный</span>
                <div className="text-sm font-bold text-slate-900">{selectedInspection?.assignedTo}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Срок устранения</span>
                <div className="text-sm font-bold text-slate-900">{selectedInspection?.deadline}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ошибок выявлено</span>
                <div className="text-sm font-bold text-red-600">{selectedInspection?.errors}</div>
              </div>
            </div>

            <Comments contextId={`inspection_${selectedInspection?.id}`} />
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Журнал проверок</h3>
            {filter !== 'all' && (
              <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200" onClick={() => setFilter('all')}>
                <X className="w-3 h-3 mr-1" /> Сбросить фильтр
              </Badge>
            )}
          </div>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm">
              <ShieldCheck className="w-4 h-4 mr-2" /> Чек-лист ТБ
            </Button>} />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Чек-лист техники безопасности</DialogTitle>
                <DialogDescription>Ежедневная проверка соблюдения норм ТБ на площадке</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {[
                  "Наличие и использование СИЗ (каски, жилеты)",
                  "Исправность ограждений на высоте",
                  "Освещенность рабочих мест и проходов",
                  "Наличие и доступность средств пожаротушения",
                  "Состояние лесов и подмостей",
                  "Порядок на рабочих местах (отсутствие мусора)"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
                <div className="pt-4">
                  <Button className="w-full bg-slate-900" onClick={() => {
                    toast.success("Чек-лист ТБ успешно сохранен");
                  }}>Завершить проверку</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {filteredInspections.map((item) => (
          <Card 
            key={item.id} 
            className="border-none shadow-sm bg-white overflow-hidden group cursor-pointer hover:ring-1 hover:ring-slate-200 transition-all"
            onClick={() => setSelectedInspection(item)}
          >
            <div className={cn(
              "h-1 w-full",
              item.status === 'passed' ? "bg-green-500" :
              item.status === 'failed' ? "bg-red-500" : "bg-blue-500"
            )} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      "border-none",
                      item.status === 'passed' ? "bg-green-100 text-green-600" :
                      item.status === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {item.status === 'passed' ? 'Принято' : item.status === 'failed' ? 'Не принято' : 'В процессе'}
                    </Badge>
                    {item.critical && <Badge className="bg-red-600 text-white border-none">Критично</Badge>}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Срок устранения: {item.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Ошибок: {item.errors}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingInspection(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {item.status === 'failed' && (
                      <Dialog>
                        <DialogTrigger render={<Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" />}>
                          <Wrench className="w-4 h-4 mr-2" /> Исправить
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Устранение замечания</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between">
                                <Label>Описание работ по устранению</Label>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                                  onClick={handleFixRewrite}
                                  disabled={isRewritingFix}
                                >
                                  {isRewritingFix ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3 h-3" />
                                  )}
                                  Улучшить с ИИ
                                </Button>
                              </div>
                              <Textarea 
                                placeholder="Что было сделано..." 
                                value={fixDescription}
                                onChange={(e) => setFixDescription(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Фотофиксация результата</Label>
                              <div 
                                className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50"
                                onClick={() => document.getElementById('fix-photo-upload')?.click()}
                              >
                                <Camera size={24} />
                                <span className="text-xs font-medium">Загрузить фото ({fixPhotosCount})</span>
                                <input 
                                  id="fix-photo-upload" 
                                  type="file" 
                                  accept="image/*" 
                                  multiple 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                      setFixPhotosCount(prev => prev + files.length);
                                      toast.success(`Прикреплено фото: ${files.length}`);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline">Отмена</Button>
                              <Button className="bg-slate-900" onClick={() => toast.success("Отчет об устранении отправлен на проверку")}>Отправить на проверку</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Dialog>
                      <DialogTrigger render={<Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" />}>
                        Подробнее <ArrowRight className="w-4 h-4 ml-2" />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{item.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Статус</p>
                              <Badge className={cn(
                                "border-none",
                                item.status === 'passed' ? "bg-green-100 text-green-600" :
                                item.status === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                              )}>
                                {item.status === 'passed' ? 'Принято' : item.status === 'failed' ? 'Не принято' : 'В процессе'}
                              </Badge>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Срок устранения</p>
                              <p className="text-sm font-medium">{item.deadline}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold">Выявленные нарушения</p>
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
                              <ul className="list-disc list-inside space-y-1">
                                <li>Несоответствие проектной документации</li>
                                <li>Нарушение технологии укладки</li>
                                <li>Отсутствие актов скрытых работ</li>
                              </ul>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold">Фотофиксация</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                                  <img 
                                    src={`https://picsum.photos/seed/const${i}/400/400`} 
                                    alt="Inspection" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingInspection} onOpenChange={(open) => !open && setEditingInspection(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать проверку</DialogTitle>
          </DialogHeader>
          {editingInspection && (
            <form onSubmit={handleEditInspection} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Название проверки</Label>
                <Input name="title" defaultValue={editingInspection.title} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select name="status" defaultValue={editingInspection.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">В процессе</SelectItem>
                      <SelectItem value="passed">Принято</SelectItem>
                      <SelectItem value="failed">Не принято</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Срок устранения</Label>
                  <Input name="deadline" type="date" defaultValue={editingInspection.deadline} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  name="critical" 
                  id="edit-critical" 
                  defaultChecked={editingInspection.critical}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600" 
                />
                <Label htmlFor="edit-critical">Критическая важность</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setEditingInspection(null)}>Отмена</Button>
                <Button className="bg-slate-900" type="submit">Сохранить изменения</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
