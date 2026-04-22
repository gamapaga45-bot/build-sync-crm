/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Radio, 
  Users, 
  History, 
  Play, 
  StopCircle, 
  Maximize2, 
  ShieldCheck,
  Eye,
  Clock,
  MessageCircle,
  Share2,
  Calendar,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from "@/AuthContext";
import { liveStreamService, StreamRecord } from '@/services/LiveStreamService';

export default function LiveStreamModule({ projectId }: { projectId: string }) {
  const { profile } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeStream, setActiveStream] = useState<any>(null);
  const [history, setHistory] = useState<StreamRecord[]>([]);
  const [streamTitle, setStreamTitle] = useState("Технический осмотр объекта");
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null); // For broadcaster
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // For viewer
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);
    
    // Join project-specific room
    s.emit("join-room", `project_${projectId}`);

    s.on("stream-started", (data) => {
      setActiveStream(data);
      toast.info(`Начался прямой эфир: ${data.title}`);
    });

    s.on("stream-stopped", () => {
      setActiveStream(null);
      toast.warning("Прямой эфир завершен");
    });

    s.on("signal", (data) => {
       // WebRTC signaling logic would go here
       console.log("Received signal:", data);
    });

    // Load initial state
    fetchActiveStreams();
    setHistory(liveStreamService.getHistory(projectId));

    return () => {
      s.disconnect();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [projectId]);

  const fetchActiveStreams = async () => {
    const active = await liveStreamService.getActiveStreams();
    const current = active.find(s => s.roomId === `project_${projectId}`);
    if (current) setActiveStream(current);
  };

  const startBroadcast = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      
      setIsBroadcasting(true);
      
      const streamRecord: StreamRecord = {
        id: `stream_${Date.now()}`,
        title: streamTitle,
        startTime: new Date().toISOString(),
        authorName: profile?.displayName || "Инженер",
        authorId: profile?.uid || "tech",
        projectId,
        status: 'live'
      };

      socket?.emit("start-stream", {
        roomId: `project_${projectId}`,
        userId: profile?.uid,
        userName: profile?.displayName,
        title: streamTitle
      });

      liveStreamService.saveStream(streamRecord);
      toast.success("Эфир запущен");
    } catch (err) {
      console.error("Camera access failed:", err);
      toast.error("Не удалось запустить камеру для трансляции");
    }
  };

  const stopBroadcast = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsBroadcasting(false);
    
    socket?.emit("stop-stream", `project_${projectId}`);
    
    // Update history
    const history = liveStreamService.getHistory(projectId);
    const current = history.find(s => s.status === 'live');
    if (current) {
        liveStreamService.saveStream({ ...current, status: 'finished', endTime: new Date().toISOString() });
        setHistory(liveStreamService.getHistory(projectId));
    }
  };

  const joinStream = () => {
    toast.info("Подключение к трансляции...");
    // Signaling and P2P connection logic would be expanded here
  };

  const canBroadcast = profile?.role === 'admin' || profile?.role === 'engineer';

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className={cn("w-5 h-5", activeStream ? "text-red-600 animate-pulse" : "text-slate-400")} />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">On-Site Live</h2>
          </div>
          <p className="text-sm font-medium text-slate-500">Прямые трансляции и видео-инспекции с объекта</p>
        </div>
        
        {canBroadcast && !isBroadcasting && (
          <Dialog>
             <DialogTrigger render={
                <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 font-bold px-6">
                  <Video className="w-4 h-4 mr-2" /> Выйти в эфир
                </Button>
             } />
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Запуск трансляции</DialogTitle>
                  <DialogDescription>Укажите тему эфира для участников проекта</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Название эфира</Label>
                    <Input 
                      value={streamTitle} 
                      onChange={(e) => setStreamTitle(e.target.value)} 
                      placeholder="Например: Приемка 4 этажа"
                    />
                  </div>
                </div>
                <Button onClick={startBroadcast} className="bg-slate-900">Начать вещание</Button>
             </DialogContent>
          </Dialog>
        )}

        {isBroadcasting && (
          <Button variant="destructive" onClick={stopBroadcast} className="font-bold">
            <StopCircle className="w-4 h-4 mr-2" /> Завершить эфир
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main View Area */}
        <div className="lg:col-span-8 space-y-6">
           {isBroadcasting ? (
             <Card className="border-none shadow-2xl overflow-hidden bg-slate-950 ring-4 ring-red-500/20">
               <div className="relative aspect-video">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted 
                   className="w-full h-full object-cover" 
                 />
                 <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-red-600 border-none px-3 py-1 animate-pulse">REC</Badge>
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/20">00:15:20</Badge>
                 </div>
                 <div className="absolute bottom-4 left-4">
                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                       <p className="text-xs font-black uppercase tracking-widest text-white/60">Тема эфира</p>
                       <p className="font-bold">{streamTitle}</p>
                    </div>
                 </div>
               </div>
             </Card>
           ) : activeStream ? (
             <Card className="border-none shadow-2xl overflow-hidden bg-slate-950 ring-4 ring-blue-500/20">
                <div className="relative aspect-video flex flex-col items-center justify-center text-white gap-6">
                   <div className="p-10 bg-blue-600/10 rounded-full border border-blue-500/20 animate-pulse">
                      <Radio size={48} className="text-blue-500" />
                   </div>
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Обнаружена трансляция</h3>
                      <p className="text-slate-400">Вещает: <span className="text-white font-bold">{activeStream.userName}</span></p>
                      <Button size="lg" className="mt-4 bg-blue-600 hover:bg-blue-700 font-black px-8" onClick={joinStream}>
                        <Play className="w-4 h-4 mr-2 fill-current" /> СМОТРЕТЬ ЭФИР
                      </Button>
                   </div>
                </div>
             </Card>
           ) : (
             <div className="aspect-video rounded-3xl bg-slate-100 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 gap-4">
                <div className="p-6 bg-white rounded-2xl shadow-sm text-slate-300">
                   <VideoOff size={48} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-slate-900">Нет активных трансляций</h3>
                   <p className="text-sm text-slate-500 max-w-sm">
                     В данный момент на объекте не проводится видео-фиксация. 
                     Администраторы и инженеры могут запустить эфир в любой момент.
                   </p>
                </div>
             </div>
           )}

           <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">История эфиров</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 {history.length > 0 ? (
                   <div className="divide-y divide-slate-50">
                      {history.map((record) => (
                        <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                 <Video size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-900 leading-tight">{record.title}</h4>
                                 <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.startTime).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1 font-bold text-slate-600 uppercase tracking-tighter">{record.authorName}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400">Archive</Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                 <Eye size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                 <Share2 size={16} />
                              </Button>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="p-12 text-center">
                      <p className="text-sm text-slate-400 italic">История записей пуста</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Controls/Stats */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden">
              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-4">Участники эфира</h3>
                    <div className="space-y-3">
                       {[
                         { name: "Алексей И.", role: "Гл. Инженер", active: true },
                         { name: "Сергей С.", role: "Технадзор", active: true },
                         { name: "Владимир К.", role: "Рабочий", active: false },
                         { name: "Анна М.", role: "Архитектор", active: false },
                       ].map((user, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                 {user.name.split(' ')[0][0]}{user.name.split(' ')[1][0]}
                               </div>
                               <div>
                                  <p className="text-xs font-bold leading-none">{user.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{user.role}</p>
                               </div>
                            </div>
                            {user.active ? (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-4">Чат объекта</h3>
                    <div className="h-[200px] overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase">Технадзор</p>
                          <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                             <p className="text-xs leading-relaxed">Покажите узел армирования на 4-й колонне крупнее, пожалуйста.</p>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Система</p>
                          <p className="text-[10px] italic text-slate-500">Пользователь Владимир К. подключился к просмотру</p>
                       </div>
                    </div>
                    <div className="relative">
                       <Input 
                         className="bg-slate-800 border-none text-xs h-10 pr-10 focus-visible:ring-blue-500" 
                         placeholder="Сообщение в эфир..." 
                       />
                       <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-blue-500">
                          <Share2 size={14} />
                       </Button>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-sm bg-blue-50">
              <CardContent className="p-6 flex gap-4 items-start">
                 <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <ShieldCheck size={24} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-black uppercase tracking-tight text-blue-900 text-sm">Безопасность</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                       Все эфиры записываются и хранятся в течение 90 дней согласно протоколу безопасности ООО "СтройМастер".
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
