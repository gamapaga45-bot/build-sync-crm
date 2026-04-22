/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Book, 
  FileText, 
  ExternalLink, 
  Bookmark,
  ChevronRight,
  Download,
  X,
  Info
} from "lucide-react";

import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  category: 'SP' | 'GOST' | 'SNiP' | 'Internal';
  description: string;
  lastUpdated: string;
  url: string;
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все документы');
  
  const documents: Document[] = [
    { 
      id: '1', 
      title: 'СП 70.13330.2012', 
      category: 'SP', 
      description: 'Несущие и ограждающие конструкции. Актуализированная редакция СНиП 3.03.01-87', 
      lastUpdated: '2022-12-01',
      url: 'https://docs.cntd.ru/document/1200097515'
    },
    { 
      id: '2', 
      title: 'ГОСТ 34028-2016', 
      category: 'GOST', 
      description: 'Прокат арматурный для железобетонных конструкций. Технические условия', 
      lastUpdated: '2023-05-15',
      url: 'https://docs.cntd.ru/document/1200143162'
    },
    { 
      id: '3', 
      title: 'СНиП 12-03-2001', 
      category: 'SNiP', 
      description: 'Безопасность труда в строительстве. Часть 1. Общие требования', 
      lastUpdated: '2021-10-10',
      url: 'https://docs.cntd.ru/document/901794520'
    },
    { 
      id: '4', 
      title: 'Регламент ТБ объекта', 
      category: 'Internal', 
      description: 'Внутренний регламент по технике безопасности на текущем объекте', 
      lastUpdated: '2024-01-20',
      url: '#'
    },
    { 
      id: '5', 
      title: 'СП 63.13330.2018', 
      category: 'SP', 
      description: 'Бетонные и железобетонные конструкции. Основные положения', 
      lastUpdated: '2023-08-11',
      url: 'https://docs.cntd.ru/document/552052100'
    },
    { 
      id: '6', 
      title: 'ГОСТ 26633-2015', 
      category: 'GOST', 
      description: 'Бетоны тяжелые и мелкозернистые. Технические условия', 
      lastUpdated: '2023-02-10',
      url: 'https://docs.cntd.ru/document/1200127533'
    },
    { 
      id: '7', 
      title: 'СП 48.13330.2019', 
      category: 'SP', 
      description: 'Организация строительства. СНиП 12-01-2004', 
      lastUpdated: '2024-03-01',
      url: 'https://docs.cntd.ru/document/564115454'
    },
  ];

  const categories = [
    { label: 'Все документы', value: 'all' },
    { label: 'СП (Своды правил)', value: 'SP' },
    { label: 'ГОСТы', value: 'GOST' },
    { label: 'СНиПы', value: 'SNiP' },
    { label: 'Внутренние регламенты', value: 'Internal' },
  ];

  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(query) || 
                         doc.description.toLowerCase().includes(query) ||
                         doc.category.toLowerCase().includes(query);
    const matchesCategory = activeCategory === 'Все документы' || 
                           categories.find(c => c.label === activeCategory)?.value === doc.category;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDoc = (url: string) => {
    if (url === '#') {
      toast.info("Внутренний документ доступен только в локальной сети объекта");
      return;
    }
    window.open(url, '_blank');
  };

  const handleAskAssistant = () => {
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'assistant' }));
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">База знаний</h2>
          <p className="text-slate-500 text-sm sm:text-base">Нормативная документация, ГОСТы, СНиПы и внутренние регламенты</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Интуитивный поиск (напр: бетон, СП, арматура)..." 
            className="pl-10 bg-white border-none shadow-sm h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Категории базы</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {categories.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveCategory(cat.label)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 text-sm transition-all hover:bg-slate-50 text-left border-l-4",
                      activeCategory === cat.label 
                        ? "text-red-600 font-bold bg-red-50/30 border-red-600" 
                        : "text-slate-600 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark size={16} className={activeCategory === cat.label ? "text-red-600" : "text-slate-400"} />
                      {cat.label}
                    </div>
                    <ChevronRight size={14} className={activeCategory === cat.label ? "text-red-600" : "text-slate-300"} />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="p-3 bg-white/10 rounded-xl w-fit">
                <Info size={24} className="text-red-400" />
              </div>
              <h4 className="font-bold">Интеллектуальный поиск</h4>
              <p className="text-sm text-slate-400 leading-relaxed">ИИ-ассистент проанализирует ваш запрос и найдет нужный пункт в тысячах страниц документации.</p>
              <Button 
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                onClick={handleAskAssistant}
              >
                Спросить ассистента
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Найдено документов: {filteredDocs.length}
            </span>
          </div>
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <Card 
                key={doc.id} 
                className="border-none shadow-sm bg-white hover:shadow-md hover:ring-1 hover:ring-red-100 transition-all group cursor-pointer"
                onClick={() => handleOpenDoc(doc.url)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-colors shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-slate-100 border-none text-[10px] font-bold uppercase">
                            {doc.category}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium">Обновлено: {doc.lastUpdated}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">{doc.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Документ "${doc.title}" добавлен в закладки`);
                        }}
                      >
                        <Bookmark size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Загрузка документа "${doc.title}"...`);
                        }}
                      >
                        <Download size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDoc(doc.url);
                        }}
                      >
                        <ExternalLink size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-100">
              <Book size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Документы не найдены</h3>
              <p className="text-slate-500">Попробуйте изменить параметры поиска или категорию</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Все документы');
                }}
              >
                Сбросить все фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
