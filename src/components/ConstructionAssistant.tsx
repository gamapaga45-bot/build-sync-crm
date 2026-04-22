/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  Wrench,
  BookOpen,
  Download
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ConstructionAssistant() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string, image?: string}[]>([
    { 
      role: 'assistant', 
      content: 'Здравствуйте! Я ваш интеллектуальный помощник по строительству и техническому надзору. Я могу помочь вам с нормативной документацией, правилами приемки работ или создать иллюстрированную схему узла. Чем могу помочь?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const currentProjectData = localStorage.getItem('currentProject');
      const projectInfo = currentProjectData ? JSON.parse(currentProjectData) : null;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `Ты - эксперт в области строительства и технического надзора, интегрированный в CRM систему "СтройМастер". 
            Твоя задача: отвечать на вопросы пользователя, опираясь на актуальные СНиП, СП и ГОСТ.
            
            КОНТЕКСТ ТЕКУЩЕГО ПРОЕКТА:
            ${projectInfo ? `Название: ${projectInfo.name}, Статус: ${projectInfo.status}, Прогресс: ${projectInfo.progress}%, Тип: ${projectInfo.projectType}` : "Проект не выбран"}
            
            ПРАВИЛА ОТВЕТА:
            1. Если пользователь просит "иллюстрацию" или "схему", опиши её максимально подробно текстом, а в конце добавь специальный тег [GENERATE_IMAGE: описание для генерации на английском].
            2. Интегрируй данные о проекте в свои советы (например, если прогресс мал, напомни о сроках).
            3. Если вопрос касается зарплат или графиков, давай экспертные рекомендации по оптимизации ФОТ и критического пути.
            4. Отвечай на русском языке, профессионально, но доступно.
            
            Вопрос: ${userMessage}` }]
          }
        ],
      });

      const text = response.text || "Извините, я не смог обработать ваш запрос.";
      let finalContent = text;
      let generatedImageUrl = undefined;

      // Check if image generation is requested via tag
      const imageMatch = text.match(/\[GENERATE_IMAGE: (.*?)\]/);
      if (imageMatch) {
        finalContent = text.replace(imageMatch[0], "").trim();
        const imagePrompt = imageMatch[1];
        
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: `Technical construction diagram, professional architectural style, clear lines, labeled parts: ${imagePrompt}` }],
            },
          });
          
          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgErr) {
          console.error("Image generation failed:", imgErr);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalContent, image: generatedImageUrl }]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Произошла ошибка при обращении к ИИ. Проверьте подключение." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="text-blue-600" /> ИИ-Помощник СтройМастер
          </h2>
          <p className="text-slate-500 text-sm">Консультации по технадзору и нормативной базе</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" /> База знаний
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> История чата
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-none shadow-sm bg-white overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-blue-50 text-blue-600' : 'bg-slate-900 text-white'
              }`}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[80%] space-y-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant' ? 'bg-slate-50 text-slate-800' : 'bg-blue-600 text-white'
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={msg.image} alt="Generated illustration" className="w-full h-auto" />
                    <div className="p-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Иллюстрация создана ИИ</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Скачать</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="text-sm text-slate-400 animate-pulse">Изучаю нормативы...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input 
              placeholder="Спросите про СП, ГОСТ или попросите сделать схему узла..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="bg-white border-slate-200 h-12"
            />
            <Button onClick={handleSend} disabled={isLoading} className="h-12 bg-blue-600 hover:bg-blue-700 px-6">
              <Send size={18} />
            </Button>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <button onClick={() => setInput("Как правильно принимать арматурный каркас по СП 70.13330?")} className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors">СП 70.13330</button>
            <button onClick={() => setInput("Сделай схему гидроизоляции фундамента")} className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors">Схема гидроизоляции</button>
            <button onClick={() => setInput("Нормы отклонения кирпичной кладки")} className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors">Нормы кладки</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
