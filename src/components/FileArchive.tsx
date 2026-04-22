/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  File, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  FolderOpen,
  Eye,
  Calendar,
  Layers,
  Archive
} from "lucide-react";
import { fileService, AppFile } from "@/services/fileService";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

export default function FileArchive() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  useEffect(() => {
    setFiles(fileService.getFiles());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      fileService.deleteFile(id);
      setFiles(fileService.getFiles());
      toast.success('Файл удален');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || file.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Archive className="text-slate-400" /> Файловый архив
          </h2>
          <p className="text-slate-500">Централизованное хранилище всех загруженных документов и фотографий проекта</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Поиск по названию..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'logs', 'materials', 'documents'].map((m) => (
            <Button
              key={m}
              variant={moduleFilter === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModuleFilter(m)}
              className="capitalize"
            >
              {m === 'all' ? 'Все' : m === 'logs' ? 'Журналы' : m === 'materials' ? 'Материалы' : 'Документы'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Файлы не найдены</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className="group border-none shadow-sm bg-white hover:ring-2 hover:ring-slate-900 transition-all cursor-pointer overflow-hidden"
              onClick={() => setSelectedFile(file)}
            >
              <CardContent className="p-0">
                <div className="aspect-video bg-slate-50 flex items-center justify-center relative overflow-hidden">
                   {file.type.includes('image') ? (
                     <img 
                       src={file.url} 
                       alt={file.name} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <FileText className="w-12 h-12 text-slate-300" />
                   )}
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Download size={18} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="rounded-full"
                        onClick={(e) => handleDelete(file.id, e)}
                      >
                        <Trash2 size={18} />
                      </Button>
                   </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 text-sm truncate flex-1">{file.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold">
                      {file.module}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <Calendar size={10} />
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none bg-black">
          {selectedFile && (
            <div className="relative">
              {selectedFile.type.includes('image') ? (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name} 
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-white space-y-4">
                   <FileText size={64} className="opacity-50" />
                   <p className="text-xl font-bold">{selectedFile.name}</p>
                   <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      <Download className="mr-2" /> Скачать файл
                   </Button>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{selectedFile.name}</h4>
                    <p className="text-sm opacity-70">Загружено {new Date(selectedFile.uploadedAt).toLocaleString()} • {selectedFile.module}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
