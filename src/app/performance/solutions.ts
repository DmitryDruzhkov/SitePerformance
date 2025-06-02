export interface Improvement {
  name: string;
  description: string;
  costRub: number;
  timeDays: number;
  effectMs: number;
  applied?: boolean;
  // Новые эффекты на Web Vitals:
  fcpEffect?: number;
  lcpEffect?: number;
  inpEffect?: number;
  ttfbEffect?: number;
}

export type ImprovementGroup = Map<string, Improvement[]>;

export const improvements: ImprovementGroup = new Map([
  ['frontend', [
    { name: 'Минификация CSS и JS', timeDays: 2, costRub: 70000, effectMs: 150, description: 'Уменьшение размера файлов за счет удаления пробелов и комментариев', tags: ['perf:load'] },
    { name: 'Использование lazy loading изображений', timeDays: 3, costRub: 90000, effectMs: 200, description: 'Загрузка изображений по мере прокрутки страницы', tags: ['perf:load'] },
    { name: 'Оптимизация шрифтов', timeDays: 1, costRub: 50000, effectMs: 120, description: 'Использование форматов WOFF2 и preload шрифтов', tags: ['perf:load'] },
    { name: 'Внедрение Service Worker', timeDays: 5, costRub: 180000, effectMs: 320, description: 'Кеширование статических ресурсов для офлайн-доступа', tags: ['perf:load', 'offline'] },
    { name: 'Разделение кода (Code Splitting)', timeDays: 4, costRub: 140000, effectMs: 280, description: 'Загрузка только нужных частей приложения', tags: ['perf:load'] },
    { name: 'Оптимизация работы с DOM', timeDays: 2, costRub: 80000, effectMs: 160, description: 'Минимизация перерисовок и пересчетов стилей', tags: ['perf:render'] },
    { name: 'Использование WebP изображений', timeDays: 3, costRub: 100000, effectMs: 220, description: 'Замена JPEG/PNG на WebP для уменьшения размера файлов', tags: ['perf:load'] },
    { name: 'Уменьшение количества HTTP-запросов', timeDays: 2, costRub: 75000, effectMs: 180, description: 'Объединение файлов и кеширование', tags: ['perf:load'] },
    { name: 'Установка Content Security Policy', timeDays: 2, costRub: 60000, effectMs: 0, description: 'Улучшение безопасности и производительности', tags: ['security'] },
    { name: 'Оптимизация анимаций CSS', timeDays: 2, costRub: 70000, effectMs: 140, description: 'Использование GPU-ускоренных анимаций', tags: ['perf:render'] },
    { name: 'Использование HTTP/2 Server Push', timeDays: 4, costRub: 120000, effectMs: 240, description: 'Предварительная отправка ресурсов браузеру', tags: ['perf:load'] },
    { name: 'Кеширование через Cache-Control', timeDays: 2, costRub: 70000, effectMs: 150, description: 'Эффективное управление кешированием', tags: ['perf:load'] },
    { name: 'Оптимизация JavaScript Event Listeners', timeDays: 2, costRub: 70000, effectMs: 150, description: 'Минимизация количества и задержки событий', tags: ['perf:render'] },
    { name: 'Использование WebAssembly', timeDays: 7, costRub: 250000, effectMs: 350, description: 'Перенос тяжелых вычислений в WebAssembly', tags: ['perf:compute', 'long-term'] },
    { name: 'Оптимизация изображений через CDN', timeDays: 3, costRub: 110000, effectMs: 210, description: 'Быстрая доставка изображений из ближайшего датацентра', tags: ['perf:load'] },
  ]],

  ['ssr', [
    { name: 'Кеширование SSR-результатов', timeDays: 5, costRub: 180000, effectMs: 350, description: 'Кеширование отрендеренных страниц', tags: ['perf:load'] },
    { name: 'Оптимизация шаблонов', timeDays: 3, costRub: 110000, effectMs: 200, description: 'Упрощение и оптимизация шаблонов', tags: ['perf:load'] },
    { name: 'Использование Incremental Static Regeneration', timeDays: 7, costRub: 250000, effectMs: 400, description: 'Часть страниц обновляется статически', tags: ['perf:load', 'scalability'] },
    { name: 'SSR с использованием Edge Rendering', timeDays: 6, costRub: 220000, effectMs: 380, description: 'Быстрая отрисовка ближе к пользователю', tags: ['perf:load'] },
    { name: 'Оптимизация рендеринга React/Angular', timeDays: 4, costRub: 140000, effectMs: 280, description: 'Ускорение виртуального DOM и серверного рендера', tags: ['perf:render'] },
    { name: 'Предварительная загрузка данных', timeDays: 3, costRub: 100000, effectMs: 230, description: 'Загрузка данных до рендеринга', tags: ['perf:load'] },
    { name: 'Использование Streamed SSR', timeDays: 5, costRub: 160000, effectMs: 300, description: 'Отправка частей страницы потоком', tags: ['perf:load'] },
    { name: 'Минимизация запросов к базе из SSR', timeDays: 4, costRub: 130000, effectMs: 250, description: 'Оптимизация запросов и кеширование', tags: ['perf:load'] },
    { name: 'Отложенная отрисовка (Defer SSR)', timeDays: 3, costRub: 110000, effectMs: 210, description: 'Рендеринг неважных частей позже', tags: ['perf:load'] },
    { name: 'Использование CDN для SSR', timeDays: 3, costRub: 100000, effectMs: 190, description: 'Быстрая доставка SSR-страниц', tags: ['perf:load'] },
  ]],

  ['network', [
    { name: 'Оптимизация TCP-коннекций', timeDays: 3, costRub: 100000, effectMs: 200, description: 'Уменьшение времени установки соединения', tags: ['perf:latency'] },
    { name: 'Использование HTTP/3 (QUIC)', timeDays: 6, costRub: 240000, effectMs: 400, description: 'Быстрый и надёжный протокол передачи данных', tags: ['perf:load', 'modern'] },
    { name: 'Сжатие данных (gzip, brotli)', timeDays: 2, costRub: 70000, effectMs: 150, description: 'Уменьшение объёма передаваемых данных', tags: ['perf:load'] },
    { name: 'Оптимизация DNS-запросов', timeDays: 1, costRub: 40000, effectMs: 100, description: 'Сокращение времени резолвинга DNS', tags: ['perf:latency'] },
    { name: 'Использование CDN', timeDays: 5, costRub: 180000, effectMs: 350, description: 'Ближайшая доставка контента', tags: ['perf:load', 'scalability'] },
    { name: 'Минимизация редиректов', timeDays: 1, costRub: 30000, effectMs: 80, description: 'Сокращение количества редиректов', tags: ['perf:load'] },
    { name: 'Предварительная установка соединения (Preconnect)', timeDays: 2, costRub: 70000, effectMs: 150, description: 'Ускорение установления соединений', tags: ['perf:latency'] },
    { name: 'Оптимизация Keep-Alive', timeDays: 1, costRub: 50000, effectMs: 120, description: 'Поддержка постоянных соединений', tags: ['perf:latency'] },
    { name: 'Удаление лишних заголовков', timeDays: 1, costRub: 40000, effectMs: 90, description: 'Уменьшение объёма HTTP-заголовков', tags: ['perf:load'] },
    { name: 'Настройка HSTS', timeDays: 1, costRub: 50000, effectMs: 0, description: 'Повышение безопасности и скорости HTTPS', tags: ['security'] },
  ]],

  ['backend', [
    { name: 'Оптимизация запросов к базе данных', timeDays: 6, costRub: 200000, effectMs: 350, description: 'Улучшение и оптимизация SQL-запросов', tags: ['perf:load', 'database'] },
    { name: 'Кеширование на уровне сервера', timeDays: 5, costRub: 180000, effectMs: 320, description: 'Кеширование часто запрашиваемых данных', tags: ['perf:load'] },
    { name: 'Масштабирование серверов', timeDays: 8, costRub: 300000, effectMs: 450, description: 'Добавление серверных мощностей', tags: ['scalability', 'long-term'] },
    { name: 'Оптимизация бизнес-логики', timeDays: 5, costRub: 170000, effectMs: 300, description: 'Снижение количества операций', tags: ['perf:compute'] },
    { name: 'Использование Redis/Memcached', timeDays: 6, costRub: 220000, effectMs: 350, description: 'Быстрый доступ к временным данным', tags: ['perf:load'] },
    { name: 'Оптимизация сериализации данных', timeDays: 4, costRub: 130000, effectMs: 230, description: 'Быстрая сериализация и десериализация данных', tags: ['perf:compute'] },
    { name: 'Минимизация вызовов к внешним API', timeDays: 3, costRub: 100000, effectMs: 180, description: 'Сокращение обращений к внешним сервисам', tags: ['perf:latency'] },
    { name: 'Внедрение очередей сообщений', timeDays: 6, costRub: 200000, effectMs: 340, description: 'Асинхронная обработка задач', tags: ['scalability'] },
    { name: 'Использование HTTP/2 для API', timeDays: 3, costRub: 90000, effectMs: 170, description: 'Быстрая передача данных', tags: ['perf:latency'] },
    { name: 'Настройка rate limiting', timeDays: 2, costRub: 60000, effectMs: 0, description: 'Ограничение количества запросов для защиты и стабильности', tags: ['security', 'stability'] },
  ]],

  ['database', [
    { name: 'Индексация часто используемых полей', timeDays: 5, costRub: 150000, effectMs: 350, description: 'Создание индексов для ускорения запросов', tags: ['perf:load'] },
    { name: 'Оптимизация SELECT-запросов', timeDays: 6, costRub: 180000, effectMs: 380, description: 'Переписывание запросов для скорости', tags: ['perf:load'] },
    { name: 'Партиционирование таблиц', timeDays: 7, costRub: 220000, effectMs: 400, description: 'Разделение таблиц для масштабирования', tags: ['scalability', 'long-term'] },
    { name: 'Использование репликации', timeDays: 8, costRub: 280000, effectMs: 450, description: 'Расширение масштабируемости чтения', tags: ['scalability', 'long-term'] },
    { name: 'Внедрение кеша запросов', timeDays: 4, costRub: 130000, effectMs: 280, description: 'Кеширование часто выполняемых запросов', tags: ['perf:load'] },
    { name: 'Использование In-Memory БД', timeDays: 7, costRub: 240000, effectMs: 420, description: 'Быстрый доступ к часто используемым данным', tags: ['perf:load'] },
    { name: 'Оптимизация JOIN-запросов', timeDays: 6, costRub: 200000, effectMs: 370, description: 'Снижение времени выполнения сложных запросов', tags: ['perf:load'] },
  ]],
]);