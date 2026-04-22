/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  AlertCircle, 
  Download, 
  MoreVertical,
  Clock,
  ShieldCheck,
  Building2,
  User,
  ExternalLink,
  Trash2,
  Bell
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LegalDocument, DocumentType } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { notificationService } from "@/services/NotificationService";
import Comments from "./Comments";

export default function DocumentManager() {
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: 'doc1',
      title: 'Договор генподряда №124-ГП',
      type: 'contract',
      fileUrl: '#',
      fileSize: '2.4 MB',
      projectId: '1',
      clientId: '1',
      issueDate: '2024-01-10',
      expiryDate: '2025-01-10',
      status: 'active',
      remindBeforeDays: 30,
      createdAt: '2024-01-10'
    },
    {
      id: 'doc2',
      title: 'Разрешение на строительство №RU-77-123',
      type: 'permit',
      fileUrl: '#',
      fileSize: '1.1 MB',
      projectId: '1',
      issueDate: '2023-05-15',
      expiryDate: '2024-05-15',
      status: 'active',
      remindBeforeDays: 60,
      createdAt: '2023-05-15'
    },
    {
      id: 'doc3',
      title: 'Страховой полис СМР',
      type: 'insurance',
      fileUrl: '#',
      fileSize: '850 KB',
      projectId: '2',
      issueDate: '2023-11-20',
      expiryDate: '2024-04-20',
      status: 'active',
      remindBeforeDays: 14,
      createdAt: '2023-11-20'
    },
    {
      id: 'doc4',
      title: 'Лицензия на изыскания',
      type: 'permit',
      fileUrl: '#',
      fileSize: '500 KB',
      issueDate: '2021-01-01',
      expiryDate: '2024-01-01',
      status: 'expired',
      createdAt: '2021-01-01'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  // Check for expirations on mount
  useEffect(() => {
    const today = new Date();
    documents.forEach(doc => {
      if (doc.expiryDate && doc.status === 'active') {
        const expiry = new Date(doc.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= (doc.remindBeforeDays || 30) && diffDays > 0) {
          notificationService.addNotification({
            title: "Срок документа истекает",
            message: `Документ "${doc.title}" истекает через ${diffDays} дн.`,
            type: "warning"
          });
        } else if (diffDays <= 0) {
          notificationService.addNotification({
            title: "Срок документа истек",
            message: `Документ "${doc.title}" больше не действителен!`,
            type: "error"
          });
        }
      }
    });
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, typeFilter]);

  const getStatusBadge = (doc: LegalDocument) => {
    const today = new Date();
    if (!doc.expiryDate) return <Badge className="bg-slate-100 text-slate-600 border-none">Бессрочно</Badge>;
    
    const expiry = new Date(doc.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <Badge className="bg-red-100 text-red-600 border-none">Истек</Badge>;
    if (diffDays <= 30) return <Badge className="bg-orange-100 text-orange-600 border-none">Истекает ({diffDays} дн.)</Badge>;
    return <Badge className="bg-green-100 text-green-600 border-none">Активен</Badge>;
  };

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'contract': return 'Договор';
      case 'permit': return 'Разрешение';
      case 'insurance': return 'Страховка';
      case 'technical': return 'Тех. док';
      default: return 'Прочее';
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Документы и Договоры</h2>
          <p className="text-slate-500">Централизованное хранилище юридических документов и контроль сроков</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <Bell className="w-4 h-4 mr-2" /> Настроить уведомления
          </Button>
          <Button className="bg-slate-900">
            <Plus className="w-4 h-4 mr-2" /> Загрузить документ
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Поиск по названию..." 
            className="pl-10 bg-slate-50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px] bg-slate-50 border-none">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Тип документа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="contract">Договоры</SelectItem>
            <SelectItem value="permit">Разрешения</SelectItem>
            <SelectItem value="insurance">Страхование</SelectItem>
            <SelectItem value="technical">Техническая док.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Document Grid */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedDoc && getStatusBadge(selectedDoc)}
              <Badge variant="outline" className="text-[10px] border-none bg-slate-100 text-slate-600">
                {selectedDoc && getTypeLabel(selectedDoc.type)}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900">{selectedDoc?.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Размер файла</span>
              <div className="text-lg font-bold text-slate-900">{selectedDoc?.fileSize}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Дата выдачи</span>
              <div className="text-lg font-bold text-slate-900">{selectedDoc?.issueDate}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Срок действия</span>
              <div className="text-lg font-bold text-slate-900">{selectedDoc?.expiryDate || 'Бессрочно'}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Документа</span>
              <div className="text-lg font-bold text-slate-900">{selectedDoc?.id}</div>
            </div>
          </div>

          <Comments contextId={`document_${selectedDoc?.id}`} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <Card 
            key={doc.id} 
            className="border-none shadow-sm bg-white hover:ring-2 hover:ring-slate-200 transition-all group cursor-pointer"
            onClick={() => setSelectedDoc(doc)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  doc.type === 'contract' ? "bg-blue-50 text-blue-600" :
                  doc.type === 'permit' ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-600"
                )}>
                  <FileText size={24} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" />}>
                    <MoreVertical size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Скачать</DropdownMenuItem>
                    <DropdownMenuItem><ExternalLink className="w-4 h-4 mr-2" /> Просмотр</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Удалить</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1 mb-4">
                <h4 className="font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{getTypeLabel(doc.type)}</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Срок действия:
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {doc.expiryDate || 'Бессрочно'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={12} /> Статус:
                  </span>
                  {getStatusBadge(doc)}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                {doc.projectId && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    <Building2 size={12} /> ПРОЕКТ #{doc.projectId}
                  </div>
                )}
                {doc.clientId && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                    <User size={12} /> КЛИЕНТ #{doc.clientId}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Upload Placeholder */}
        <button className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all bg-white/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <div className="text-sm font-bold">Добавить документ</div>
          <div className="text-xs">PDF, DOCX, JPG до 10MB</div>
        </button>
      </div>
    </div>
  );
}
