import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Copy,
  Layers,
  Sparkles,
  FileText,
  Trash2
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GoogleGenAI } from "@google/genai";
import { workTypeService, WorkType } from '@/services/workTypeService';

export default function WorkTypes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [allWorks, setAllWorks] = useState<WorkType[]>(workTypeService.getWorks());
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const filteredWorks = useMemo(() => {
    return allWorks.filter(work => 
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.code.includes(searchQuery) ||
      work.standard.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allWorks]);

  const handleAiSearch = async (query: string) => {
    if (!query) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const prompt = `Как эксперт в строительных нормативах (СП, СНиП, РДМ, МДС, НПРM), проанализируй запрос: "${query}". 
      Найди наиболее подходящие виды работ по ГЭСН или ФНЗ. 
      Для каждого укажи: "title", "code", "unit" (основная единица, например м3, т, м2), "baseUnitValue" (множитель: 1, 100 или 1000, если в ГЭСН единица 1000м3, то unit="м3" и baseUnitValue=1000), "standard".
      Верни ответ в формате JSON массива объектов. Только JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text || "";
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setAiSuggestions(parsed);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при работе AI ассистента");
    } finally {
      setAiLoading(false);
    }
  };

  const saveWork = (work: any) => {
    const newWork: WorkType = {
       ...work,
       id: work.id || Math.random().toString(36).substr(2, 9),
       baseUnitValue: Number(work.baseUnitValue) || 1
    };
    workTypeService.saveWork(newWork);
    setAllWorks(workTypeService.getWorks());
    setIsManualAddOpen(false);
  };

  const deleteWork = (id: string) => {
    workTypeService.deleteWork(id);
    setAllWorks(workTypeService.getWorks());
  };

  const toggleUnitScale = (work: WorkType) => {
    const nextScale = work.baseUnitValue === 1000 ? 1 : 1000;
    saveWork({ ...work, baseUnitValue: nextScale });
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Реестр видов работ</h2>
          <p className="text-slate-500">Нормативные показатели по НПРМ, СП и СНиП с AI-ассистентом</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 font-medium" 
            onClick={() => setIsAiDialogOpen(true)}
          >
            <Sparkles size={18} className="mr-2" />
            AI Подбор (СП/СНиП)
          </Button>
          <Button className="bg-slate-900 font-medium" onClick={() => setIsManualAddOpen(true)}>
            <Plus size={18} className="mr-2" />
            Добавить вручную
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main List */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Поиск по названию или коду ГЭСН..." 
                className="pl-10 bg-slate-50 border-none h-11" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-slate-100">
                {filteredWorks.map((work) => (
                  <div key={work.id} className="p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {work.code}
                          </code>
                          <span className="text-xs font-medium text-slate-400">{work.standard}</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 leading-tight">
                          {work.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => toggleUnitScale(work)}>
                            <Layers size={12} /> {work.baseUnitValue > 1 ? `${work.baseUnitValue} ` : ''}{work.unit} 
                            <span className="ml-1 text-[8px] opacity-60 font-bold uppercase">(смена ед.изм)</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-100 hover:bg-red-50 h-8"
                            onClick={() => deleteWork(work.id)}
                          >
                            <Trash2 size={14} className="mr-1" /> Удалить
                         </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Normative Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Нормативы НПРМ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <BookOpen size={16} /> ГЭСН 81-02-01-2017
                </div>
                <p className="text-xs text-slate-500">Сборник 1. Земляные работы. Часть 1. Общие требования.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Государственные акты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <BookOpen size={16} /> СП 45.13330.2017
                </div>
                <p className="text-xs text-slate-500">Земляные сооружения, основания и фундаменты.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Add Dialog */}
      <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить вид работ вручную</DialogTitle>
            <DialogDescription>Введите параметры работ согласно вашему проекту или нормативу</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            saveWork({
              title: formData.get('title'),
              code: formData.get('code'),
              unit: formData.get('unit'),
              baseUnitValue: formData.get('baseUnitValue'),
              standard: formData.get('standard')
            });
          }} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название работ</Label>
              <Input id="title" name="title" required placeholder="Напр: Кладка стен из кирпича" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Шифр ГЭСН / Код</Label>
                <Input id="code" name="code" placeholder="08-01-001-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard">Норматив (основание)</Label>
                <Input id="standard" name="standard" placeholder="ГЭСН 2020" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Ед. измерения</Label>
                <Input id="unit" name="unit" required placeholder="м3, м2, т..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUnitValue">Кратность (базовая ед.)</Label>
                <Select name="baseUnitValue" defaultValue="1">
                   <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="1">1 (например, м3)</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="100">100 (например, 100 м2)</SelectItem>
                      <SelectItem value="1000">1000 (например, 1000 м3)</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={() => setIsManualAddOpen(false)}>Отмена</Button>
               <Button type="submit" className="bg-slate-900">Сохранить в реестр</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-indigo-600 animate-pulse" />
              AI Ассистент по нормативам
            </DialogTitle>
            <DialogDescription>
              Введите описание работ, и я подберу подходящие позиции из ГЭСН/ФЕР согласно СП и СНиП
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Напр: забивка свай в мерзлый грунт..." 
                className="h-11"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch(e.currentTarget.value)}
              />
              <Button 
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement).value;
                  handleAiSearch(input);
                }}
                disabled={aiLoading}
              >
                {aiLoading ? <RefreshCw className="animate-spin mr-2" /> : <Bot size={18} className="mr-2" />}
                Найти
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b pb-2">Результаты AI анализа</h4>
                <div className="space-y-3">
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex justify-between items-center group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1 rounded">{s.code}</code>
                          <span className="text-[10px] uppercase font-bold text-slate-400">{s.standard}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm">{s.title}</h5>
                        <p className="text-xs text-slate-500">Ед. изм: {s.unit}</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600" onClick={() => saveWork(s)}>
                        Выбрать
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiLoading && (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-8 bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-8 bg-indigo-600 animate-bounce" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Анализирую базу нормативов...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("animate-spin", className)}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 21v-5h5"/>
    </svg>
  );
}

function X({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
