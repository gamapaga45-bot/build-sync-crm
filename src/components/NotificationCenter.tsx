/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  CreditCard,
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService, Notification } from '@/services/NotificationService';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifications = () => {
      const notifs = notificationService.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };

    updateNotifications();
    window.addEventListener('notificationsUpdated', updateNotifications);
    return () => window.removeEventListener('notificationsUpdated', updateNotifications);
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) notificationService.markAsRead(n.id);
    });
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'info': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Уведомления</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0"
              onClick={handleMarkAllAsRead}
            >
              Прочитать все
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={cn(
                    "p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                    !notif.read && "bg-blue-50/30"
                  )}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-bold", !notif.read ? "text-slate-900" : "text-slate-600")}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Bell className="w-12 h-12 mb-2 opacity-10" />
              <p className="text-sm">Уведомлений пока нет</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-slate-100">
          <Button variant="ghost" className="w-full text-xs text-slate-500 h-8">
            Показать все уведомления
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
