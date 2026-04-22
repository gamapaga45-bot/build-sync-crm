/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/AuthContext';
import { toast } from 'sonner';
import { notificationService } from '@/services/NotificationService';

interface Comment {
  id: string;
  contextId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface CommentsProps {
  contextId: string;
  title?: string;
  className?: string;
}

export default function Comments({ contextId, title = "Комментарии", className }: CommentsProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${contextId}`);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        setComments([]);
      }
    } else {
      // Mock initial comments for demo
      const mockComments: Comment[] = [
        {
          id: 'm1',
          contextId,
          authorId: 'system',
          authorName: 'Система',
          text: 'Объект создан и готов к работе.',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setComments(mockComments);
    }
  }, [contextId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      contextId,
      authorId: user?.uid || 'guest',
      authorName: profile?.displayName || user?.email || 'Гость',
      text: newComment,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem(`comments_${contextId}`, JSON.stringify(updatedComments));
    setNewComment('');
    
    // Add notification
    notificationService.addNotification({
      title: "Новый комментарий",
      message: `${profile?.displayName || user?.email || 'Кто-то'} написал: ${newComment.substring(0, 30)}${newComment.length > 30 ? '...' : ''}`,
      type: "info",
      category: "comment"
    });

    toast.success("Комментарий добавлен");
  };

  return (
    <Card className={cn("border-none shadow-none bg-transparent", className)}>
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MessageSquare size={16} className="text-slate-400" />
          {title} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">Нет комментариев</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-100 text-[10px] font-bold">
                      {comment.authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleString('ru-RU', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 text-sm text-slate-700">
                      {comment.text}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-2">
          <Input 
            placeholder="Напишите комментарий..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            className="bg-white border-slate-200 rounded-xl text-sm"
          />
          <Button 
            size="icon" 
            className="bg-slate-900 shrink-0 rounded-xl"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
