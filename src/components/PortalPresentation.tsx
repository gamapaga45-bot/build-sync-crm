/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Zap, 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  TrendingUp,
  Box,
  Map,
  Package,
  AlertTriangle,
  Bot,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PortalPresentation() {
  const [isExporting, setIsExporting] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!presentationRef.current) return;
    
    setIsExporting(true);
    toast.info("Подготовка PDF документа. Пожалуйста, не закрывайте вкладку...");
    
    try {
      // Ensure we're at the top and the element is fully visible for capturing
      const scrollContainer = document.querySelector('.custom-scrollbar');
      if (scrollContainer) scrollContainer.scrollTo(0, 0);
      
      const element = presentationRef.current;
      // Add a longer delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 1, // Use standard scale for maximum reliability in sandbox
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
          // Hide interactive elements in the PDF
          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(b => (b as HTMLElement).style.display = 'none');
          
          // Remove problematic styles that crash html2canvas (like backdrop-blur)
          const blurredElements = clonedDoc.querySelectorAll('[class*="backdrop-blur"]');
          blurredElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.backdropFilter = 'none';
            (htmlEl.style as any).webkitBackdropFilter = 'none';
          });

          // Extreme measure: search and replace unsupported color functions in all style tags
          // logic to prevent: "Attempting to parse an unsupported color function oklab"
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach(st => {
            if (st.textContent) {
              // Replace oklab/oklch with a fallback hex to prevent parser crash
              // Regex covers variants with commas or spaces as delimiters
              st.textContent = st.textContent
                .replace(/oklab\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)')
                .replace(/oklch\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)')
                .replace(/color-mix\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)'); // color-mix often uses oklab
            }
          });

          // Also check all elements' style attribute
          clonedDoc.querySelectorAll('[style]').forEach(el => {
            const htmlEl = el as HTMLElement;
            const style = htmlEl.getAttribute('style');
            if (style && (/oklab/i.test(style) || /oklch/i.test(style) || /color-mix/i.test(style))) {
              htmlEl.setAttribute('style', style
                .replace(/oklab\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)')
                .replace(/oklch\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)')
                .replace(/color-mix\s*\([^)]+\)/gi, 'rgba(0,0,0,0.1)')
              );
            }
          });

          // Hide toaster and other problematic UI elements that might use modern CSS
          const toasters = clonedDoc.querySelectorAll('.toaster, [data-sonner-toaster]');
          toasters.forEach(t => (t as HTMLElement).style.display = 'none');
          
          const dialogTriggers = clonedDoc.querySelectorAll('[data-slot="dialog-trigger"]');
          dialogTriggers.forEach(t => (t as HTMLElement).style.display = 'none');
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`BuildSync_Presentation_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Презентация успешно сохранена");
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error("Ошибка при генерации PDF. Попробуйте использовать функцию печати.");
    } finally {
      setIsExporting(false);
    }
  };

  const features = [
    { 
      title: "Пятиуровневый анализ ошибок", 
      desc: "Глубокая классификация инцидентов от L1 (инфо) до L5 (фатальный) с визуализацией рисков.",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50"
    },
    { 
      title: "Интерактивный помощник", 
      desc: "Сценарии работы для ГИПа, Прораба, Технадзора и Заказчика с пошаговыми инструкциями.",
      icon: Bot,
      color: "text-blue-600 bg-blue-50"
    },
    { 
      title: "BIM-моделирование", 
      desc: "Интеграция цифровых двойников для визуального контроля хода строительства и коммуникаций.",
      icon: Box,
      color: "text-indigo-600 bg-indigo-50"
    },
    { 
      title: "Реестр видов работ (СП/СНиП)", 
      desc: "Интеллектуальный подбор работ с помощью ИИ и гибкая настройка единиц измерения (1000м3 -> 1м3).",
      icon: Layers,
      color: "text-orange-600 bg-orange-50"
    },
    { 
      title: "Личный кабинет заказчика", 
      desc: "Прозрачный доступ к фотоотчетам, финансам и документам в режиме реального времени.",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50"
    },
    { 
      title: "Технадзор и Приемка", 
      desc: "Цифровой контроль качества, работа с чек-листами и автоматизация актов скрытых работ.",
      icon: ShieldCheck,
      color: "text-cyan-600 bg-cyan-50"
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 print:p-0 print:m-0 print:bg-white bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8 print:border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">BuildSync CRM</h1>
          <p className="text-slate-500 font-medium">Профессиональный строительный портал нового поколения</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="bg-white">
            <Printer size={18} className="mr-2" /> Печать
          </Button>
          <Button 
            className="bg-slate-900" 
            onClick={handleDownloadPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            Скачать презентацию (PDF)
          </Button>
        </div>
      </div>

      <div ref={presentationRef} className="space-y-12">
        <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">Интеллектуальное управление строительными проектами</h2>
            <p className="text-slate-600 leading-relaxed">
              BuildSync — это не просто CRM, а комплексная экосистема для автоматизации жизненного цикла объекта: от первого колышка до ввода в эксплуатацию. Мы объединили BIM-технологии, ИИ-аналитику и прозрачный контроль качества.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold italic">#PropTech</Badge>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold italic">#ConTech</Badge>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold italic">#BIM</Badge>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold italic">#AI</Badge>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 space-y-4">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">L5</div>
                  <div>
                     <p className="font-bold text-slate-900">Управление рисками</p>
                     <p className="text-xs text-slate-500">Система предупреждения аварийных ситуаций</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                     <span>Прогресс объекта</span>
                     <span className="font-bold text-blue-600">84%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-[84%] rounded-full" />
                  </div>
               </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 text-center">Ключевые возможности платформы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="border-none shadow-sm bg-white">
              <CardContent className="pt-6 space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", f.color)}>
                  <f.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-900">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] p-12 text-white overflow-hidden relative">
        <div className="relative z-10 max-w-2xl space-y-6">
           <h3 className="text-3xl font-bold leading-tight">Эффективность превыше всего</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
              <div className="space-y-1">
                 <p className="text-4xl font-black text-blue-400">30%</p>
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Экономия времени</p>
              </div>
              <div className="space-y-1">
                 <p className="text-4xl font-black text-emerald-400">15%</p>
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Снижение издержек</p>
              </div>
              <div className="space-y-1">
                 <p className="text-4xl font-black text-orange-400">100%</p>
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Прозрачность</p>
              </div>
           </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-white skew-x-12 translate-x-1/4" />
      </section>

      <footer className="text-center pt-12 border-t border-slate-200 text-slate-400 text-xs">
         <p>© 2026 Nikolai Rogozin. BuildSync CRM. Все права защищены. Документ сформирован автоматически.</p>
      </footer>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
