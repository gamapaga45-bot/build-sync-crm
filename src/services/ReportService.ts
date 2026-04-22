import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import { Task } from '../types';

class ReportService {
  async generateTaskReport(task: Task) {
    // Create a temporary container for the report
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    container.style.color = '#020617';
    container.style.fontFamily = 'sans-serif';
    container.style.padding = '40px';
    
    const htmlContent = `
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">СТРОЙМАСТЕР</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">ОТЧЕТ ПО ТЕХНИЧЕСКОМУ НАДЗОРУ</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 10px; font-weight: 700; opacity: 0.5;">ID ОТЧЕТА: ${task.id.toUpperCase()}</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600;">${new Date().toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">${task.title}</h2>
              <div style="display: flex; gap: 10px;">
                <span style="background-color: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${task.category || 'Общее'}</span>
                <span style="background-color: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${task.status}</span>
              </div>
            </div>
            <div style="text-align: right; width: 150px;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Прогресс</div>
              <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${task.progress}%</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <div>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Исполнитель</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">${task.assignedTo || 'Не назначен'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Крайний срок</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">${task.dueDate || 'Не указан'}</p>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Техническое описание</p>
            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">${task.description || 'Описание не предоставлено.'}</p>
          </div>

          <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">ФОТОФИКСАЦИЯ ОБЪЕКТА (${task.photos.length})</h3>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 30px;">
            ${task.photos.map(photo => `
              <div style="display: flex; gap: 20px; page-break-inside: avoid; border: 1px solid #f1f5f9; padding: 15px; border-radius: 12px;">
                <div style="width: 300px; height: 200px; border-radius: 8px; overflow: hidden; background-color: #f1f5f9;">
                  <img src="${photo.url}" style="width: 100%; height: 100%; object-cover: cover;" />
                </div>
                <div style="flex: 1;">
                   <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                      <div>
                        <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Автор снимка</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600;">${photo.authorName}</p>
                      </div>
                      <div style="text-align: right;">
                        <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Дата фиксации</p>
                        <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600;">${new Date(photo.createdAt).toLocaleString('ru-RU')}</p>
                      </div>
                   </div>
                   <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; height: calc(100% - 45px);">
                      <p style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Замечание / Комментарий:</p>
                      <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-style: ${photo.description ? 'normal' : 'italic'}">${photo.description || 'Инспектор не добавил текстовых замечаний.'}</p>
                   </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em;">ОТЧЕТ СГЕНЕРИРОВАН СИСТЕМОЙ BUILDSYNC CRM & ENTERPRISE PORTAL</p>
        </div>
      </div>
    `;
    
    container.innerHTML = DOMPurify.sanitize(htmlContent);
    document.body.appendChild(container);
    
    try {
      // Use html2canvas to render the container to an image
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgProps = (doc as any).getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      doc.save(`Отчет_${task.title.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('ru-RU')}.pdf`);
      return true;
    } catch (err) {
      console.error("PDF Generation failed:", err);
      throw err;
    } finally {
      document.body.removeChild(container);
    }
  }
}

export const reportService = new ReportService();
