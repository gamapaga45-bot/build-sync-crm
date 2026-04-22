import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Trash2, MessageSquare, X, Maximize2, Pencil, Image as ImageIcon, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'motion/react';
import { PhotoDocumentation as TaskPhoto } from '@/types';
import { storageService } from '@/services/StorageService';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        toast.error("Не удалось получить доступ к камере");
        onClose();
      }
    }
    setupCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg');
    onCapture(base64);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={cn("w-full h-full object-cover", !isReady && "opacity-0")}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-white gap-2">
            <RotateCcw className="animate-spin" />
            <span className="text-sm font-bold uppercase tracking-widest">Запуск камеры...</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera Overlay UI */}
        <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
        <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
           Live Preview
        </div>
      </div>
      
      <div className="flex justify-between items-center px-2">
        <Button variant="ghost" onClick={onClose} className="rounded-full h-12 w-12 hover:bg-slate-100">
          <X size={24} />
        </Button>
        <button 
          onClick={takePhoto}
          disabled={!isReady}
          className="w-16 h-16 rounded-full border-4 border-slate-200 bg-white shadow-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900" />
        </button>
        <div className="w-12" /> {/* Placeholder for balance */}
      </div>
    </div>
  );
}

interface TaskPhotosProps {
  taskId: string;
  photos: TaskPhoto[];
  onPhotosChange: (newPhotos: TaskPhoto[]) => void;
}

export default function TaskPhotos({ taskId, photos, onPhotosChange }: TaskPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<TaskPhoto | null>(null);
  const [isAddingComment, setIsAddingComment] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    toast.promise(
      Promise.all(Array.from(files).map(async (file) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const url = await storageService.uploadPhoto(base64, file.type);
            
            const newPhoto: TaskPhoto = {
              id: Math.random().toString(36).substr(2, 9),
              url: url || base64,
              description: "",
              authorId: "currentUser",
              authorName: "Пользователь",
              createdAt: new Date().toISOString()
            };
            
            const updatedPhotos = [...photos, newPhoto];
            onPhotosChange(updatedPhotos);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      })),
      {
        loading: `Загрузка ${files.length} фото в облако...`,
        success: 'Все фото успешно загружены',
        error: 'Ошибка при загрузке некоторых фото'
      }
    );

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraCapture = async (base64: string) => {
    setIsCameraOpen(false);
    
    toast.promise(
      (async () => {
        const url = await storageService.uploadPhoto(base64);
        const newPhoto: TaskPhoto = {
          id: Math.random().toString(36).substr(2, 9),
          url: url || base64,
          description: "",
          authorId: "currentUser",
          authorName: "Пользователь",
          createdAt: new Date().toISOString()
        };
        onPhotosChange([...photos, newPhoto]);
      })(),
      {
        loading: 'Сохранение снимка в облако...',
        success: 'Снимок сохранен',
        error: 'Ошибка при сохранении в облако'
      }
    );
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotosChange(photos.filter(p => p.id !== id));
    toast.error("Фото удалено");
  };

  const handleUpdateComment = (id: string) => {
    onPhotosChange(photos.map(p => p.id === id ? { ...p, description: newComment } : p));
    setIsAddingComment(null);
    setNewComment("");
    toast.success("Комментарий обновлен");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Camera size={16} className="text-slate-400" />
          Фотофиксация хода работ
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {photos.length}
          </span>
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs bg-white border-slate-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={14} className="mr-1.5" /> Файл
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 text-xs bg-slate-900"
            onClick={() => setIsCameraOpen(true)}
          >
            <Camera size={14} className="mr-1.5" /> Снять
          </Button>
        </div>
      </div>

      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-slate-50 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
               <Camera className="text-blue-600" /> Прямая фотофиксация
            </DialogTitle>
          </DialogHeader>
          <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />
        </DialogContent>
      </Dialog>

      {photos.length === 0 ? (
        <div 
          className="group p-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
          onClick={() => setIsCameraOpen(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
            <Camera size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Сделайте первый снимок</p>
            <p className="text-xs text-slate-400 max-w-[240px] px-4">
              Фиксируйте скрытые работы, дефекты или прогресс этапа прямо с камеры.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {photos.map((photo) => (
              <motion.div 
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer shadow-sm"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt="Task fixation" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
                    <Maximize2 size={16} />
                  </div>
                  <button 
                    className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-colors"
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {photo.description && (
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-slate-900/80 backdrop-blur-sm text-[10px] text-white font-medium truncate flex items-center gap-1.5">
                    <MessageSquare size={10} className="text-blue-400" />
                    {photo.description}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Fullscreen Photo View Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none bg-slate-900">
          {selectedPhoto && (
            <div className="relative flex flex-col h-full max-h-[90vh]">
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[300px]">
                <img 
                  src={selectedPhoto.url} 
                  alt="Task fixation detail" 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button 
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 bg-white shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                             <ImageIcon size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Фотометка</p>
                            <p className="text-xs font-bold text-slate-600 mt-1">{new Date(selectedPhoto.createdAt).toLocaleString('ru-RU')}</p>
                          </div>
                       </div>
                       <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          ID: {selectedPhoto.id}
                       </Badge>
                    </div>
                    
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Описание / Замечание</Label>
                       {isAddingComment === selectedPhoto.id ? (
                        <div className="flex flex-col gap-3">
                          <Input 
                            autoFocus
                            placeholder="Напишите комментарий к этому снимку..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateComment(selectedPhoto.id)}
                            className="h-10 border-slate-200"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-slate-900 font-bold" onClick={() => handleUpdateComment(selectedPhoto.id)}>
                              <Check size={14} className="mr-1.5" /> Сохранить
                            </Button>
                            <Button variant="ghost" size="sm" className="font-bold text-slate-400" onClick={() => setIsAddingComment(null)}>
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="group relative flex items-start gap-3 cursor-pointer bg-slate-50 p-4 rounded-xl transition-all border border-transparent hover:border-blue-100 hover:shadow-sm"
                          onClick={() => {
                            setIsAddingComment(selectedPhoto.id);
                            setNewComment(selectedPhoto.description);
                          }}
                        >
                          <MessageSquare size={18} className="text-blue-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            {selectedPhoto.description ? (
                              <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedPhoto.description}</p>
                            ) : (
                              <p className="text-sm text-slate-400 font-medium italic">Нажмите, чтобы добавить описание или замечание к этой фотографии</p>
                            )}
                          </div>
                          <Pencil size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" className="h-10 border-slate-200 font-bold text-xs uppercase tracking-wider">
                       <Check size={14} className="mr-2 text-emerald-500" /> Принять узел
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 h-10 font-bold text-xs uppercase tracking-wider"
                      onClick={() => {
                        handleDeletePhoto(selectedPhoto.id, { stopPropagation: () => {} } as any);
                        setSelectedPhoto(null);
                      }}
                    >
                      <Trash2 size={14} className="mr-2" /> Удалить снимок
                    </Button>
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
