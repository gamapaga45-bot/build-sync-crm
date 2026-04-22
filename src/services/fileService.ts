/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  module: 'logs' | 'materials' | 'documents' | 'other';
  projectId?: string;
  url: string;
}

class FileService {
  private storageKey = 'buildsync_files';

  getFiles(): AppFile[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveFile(file: Omit<AppFile, 'id' | 'uploadedAt' | 'url'>): AppFile {
    const files = this.getFiles();
    const newFile: AppFile = {
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
      url: `https://picsum.photos/seed/${Math.random()}/800/600` // Mock URL
    };
    files.unshift(newFile);
    localStorage.setItem(this.storageKey, JSON.stringify(files));
    return newFile;
  }

  deleteFile(id: string) {
    const files = this.getFiles().filter(f => f.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(files));
  }

  getFilesByProject(projectId: string): AppFile[] {
    return this.getFiles().filter(f => f.projectId === projectId);
  }
}

export const fileService = new FileService();
