import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDbExportService {
    private dbName = 'SpeedUpGameDB';
    private storeName = 'results';
  /**
   * Экспортирует данные из IndexedDB в JSON-файл
   * @param dbName Название базы данных
   * @param storeName Название хранилища
   * @param fileName Имя файла для экспорта (по умолчанию 'exported_data.json')
   */
  exportToJson(fileName: string = 'exported_data.json'): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const data = getAllRequest.result;
          this.downloadAsJson(data, fileName);
          resolve();
        };

        getAllRequest.onerror = (error: any) => {
          console.error('Ошибка при чтении данных:', error);
          reject(error);
        };
      };

      request.onerror = (event: any) => {
        console.error('Ошибка при открытии IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Скачивает данные как JSON-файл
   * @param data Данные для экспорта
   * @param fileName Имя файла
   */
  private downloadAsJson(data: any, fileName: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
