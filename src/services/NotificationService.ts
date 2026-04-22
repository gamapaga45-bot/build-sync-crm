/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from "sonner";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'task_overdue' | 'task_deadline' | 'comment' | 'budget' | 'critical_error' | 'general';
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  private constructor() {
    const saved = localStorage.getItem('appNotifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved);
      } catch (e) {
        this.notifications = [];
      }
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'category'> & { category?: Notification['category'] }) {
    const newNotif: Notification = {
      ...notif,
      category: notif.category || 'general',
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotif);
    this.save();
    
    // Trigger in-app toast
    toast(newNotif.title, {
      description: newNotif.message,
    });

    // Simulate external notification sending based on user settings
    this.sendExternalNotifications(newNotif);
  }

  private async sendExternalNotifications(notif: Notification) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    // Check if this type of notification is enabled
    const categoryEnabled = {
      'task_overdue': settings.overdue,
      'task_deadline': settings.deadlines,
      'comment': settings.comments,
      'budget': settings.budget,
      'critical_error': settings.critical,
      'general': true
    }[notif.category] ?? true;

    if (!categoryEnabled) return;

    // Channels
    if (settings.email) {
      console.log(`[Email] Sending to user email: ${notif.title} - ${notif.message}`);
    }

    if (settings.push) {
      console.log(`[Push] Sending push notification: ${notif.title}`);
    }

    if (settings.sms && settings.phone) {
      console.log(`[SMS] Sending to ${settings.phone}: ${notif.title} - ${notif.message}`);
    }

    if (settings.telegram && settings.telegramId) {
      console.log(`[Telegram] Sending to ${settings.telegramId}: ${notif.title} - ${notif.message}`);
    }
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.save();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.save();
  }

  public checkTaskDeadlines(tasks: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (!task.dueDate || task.status === 'done') return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Overdue
        this.addNotification({
          title: "Просроченная задача",
          message: `Внимание! Срок выполнения задачи "${task.title}" истек (${task.dueDate})`,
          type: "error",
          category: "task_overdue"
        });
      } else if (diffDays <= 3 && diffDays >= 0) {
        // Approaching deadline
        const msg = diffDays === 0 ? "сегодня" : `через ${diffDays} дн.`;
        this.addNotification({
          title: "Приближение срока",
          message: `Задача "${task.title}" должна быть выполнена ${msg} (${task.dueDate})`,
          type: "warning",
          category: "task_deadline"
        });
      }
    });
  }

  public clearAll() {
    this.notifications = [];
    this.save();
  }

  private save() {
    localStorage.setItem('appNotifications', JSON.stringify(this.notifications));
    // Dispatch event for UI updates
    window.dispatchEvent(new Event('notificationsUpdated'));
  }
}

export const notificationService = NotificationService.getInstance();
