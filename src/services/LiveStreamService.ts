/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from "sonner";

export interface StreamRecord {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  authorName: string;
  authorId: string;
  projectId: string;
  snapshotUrl?: string; // Could be a thumbnail in cloud storage
  notes?: string;
  status: 'live' | 'finished';
}

class LiveStreamService {
  private STORAGE_KEY = 'construction_broadcast_history';

  getHistory(projectId?: string): StreamRecord[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const history: StreamRecord[] = saved ? JSON.parse(saved) : [];
    if (projectId) {
      return history.filter(s => s.projectId === projectId);
    }
    return history;
  }

  saveStream(record: StreamRecord) {
    const history = this.getHistory();
    const existing = history.findIndex(s => s.id === record.id);
    
    if (existing >= 0) {
      history[existing] = record;
    } else {
      history.unshift(record);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    
    if (record.status === 'finished') {
       toast.success("Эфир завершен и сохранен в историю");
    }
  }

  async getActiveStreams(): Promise<any[]> {
    try {
      const response = await fetch('/api/streams/active');
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }
}

export const liveStreamService = new LiveStreamService();
