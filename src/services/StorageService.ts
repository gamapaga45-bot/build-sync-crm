/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from "sonner";

class StorageService {
  /**
   * Uploads a base64 image to the backend, which forwards it to Cloudflare R2
   */
  async uploadPhoto(base64Image: string, contentType: string = 'image/jpeg'): Promise<string | null> {
    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          contentType: contentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Fallback to local storage if R2 is not configured
        if (response.status === 503) {
          console.warn("Storage service not configured on backend. Falling back to local storage.");
          return base64Image;
        }
        throw new Error(errorData.details || "Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error("Storage upload error:", error);
      toast.error(`Ошибка загрузки: ${error.message}. Фото сохранено локально.`);
      // Return base64 as fallback so the app continues working
      return base64Image;
    }
  }

  /**
   * Checks if the storage service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
