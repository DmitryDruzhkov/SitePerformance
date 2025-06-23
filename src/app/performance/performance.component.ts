import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { improvements, Improvement } from './solutions';
import { openDB } from 'idb';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { IndexedDbExportService } from './export';

const BaseLoadTime: number = 5000; // начальное время загрузки
const BasePrice: number = 2550000; // начальный бюджет
const BaseTime: number = 80; // начальное количество дней
const GameTime: number = 220; // начальное время игры

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatRadioModule,
  ],
  animations: [
    trigger('siteLoad', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styleUrls: ['./performance.component.css'],
  templateUrl: './performance.component.html',
})
export class PerformanceComponent {
  private indexedDbExport: IndexedDbExportService = inject(
    IndexedDbExportService
  );

  playerName: string = '';
  playerEmail: string = '';
  playerPhone: string = '';
  playerPersonalAgreement: boolean = false;
  playerPosition: string = '';
  playerScore: number = 0;
  leaderboard: { name: string; score: number }[] = [];

  gameStarted = false;
  gameOver = false;
  gameWon = false;

  timeLeft = BaseTime;
  budgetLeft = BasePrice;
  currentLoadTime = BaseLoadTime;
  progress: WritableSignal<string> = signal(`100%`);
  progressImg: WritableSignal<string> = signal(`0%`);
  timer = GameTime;
  timerString: WritableSignal<string> = signal('');
  stage: 'white' | 'header' | 'skeleton' | 'content' = 'white';

  public displayedColumns: string[] = [
    'position',
    'name',
    'demo-weight',
    'demo-symbol',
  ];

  countdownId: any;
  hint = '';
  animating = false;

  improvementsByCategory: { [key: string]: Improvement[] } = {};
  categories = Array.from(improvements.keys());

  initialVitals = {
    fcp: 4000,
    lcp: 5000,
    inp: 600,
    ttfb: 1400,
  };

  currentVitals = { ...this.initialVitals };

  constructor() {
    improvements.forEach((imprList, category) => {
      this.improvementsByCategory[category] = imprList;
    });
  }

  ngOnInit() {
    this.loadLeaderboard();
  }

  public toggleAgreement(): void {
    if (this.playerPersonalAgreement === true) {
      this.playerPersonalAgreement = false;
    } else {
      this.playerPersonalAgreement = true;
    }
  }

  get circleMetrics() {
    return [
      {
        label: 'Дней осталось',
        color: '#00A0FF',
        value: `${this.timeLeft} дн`,
        fill: ((BaseTime - this.timeLeft) / BaseTime) * 360,
      },
      {
        label: 'Оставшийся бюджет',
        color: '#001E64',
        value: `${this.budgetLeft.toLocaleString()} ₽`,
        fill: ((BasePrice - this.budgetLeft) / BasePrice) * 360,
      },
      {
        label: 'Текущая загрузка',
        color: '#00BF6A',
        value: `${this.currentLoadTime} мс`,
        fill: ((BaseLoadTime - this.currentLoadTime) / BaseLoadTime) * 360,
      },
    ];
  }

  get appliedImprovements(): Improvement[] {
    return Object.values(this.improvementsByCategory)
      .flat()
      .filter((imp) => imp.applied);
  }

  get totalImprovedMs(): number {
    return this.appliedImprovements.reduce((sum, i) => sum + i.effectMs, 0);
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.gameWon = false;
    this.timer = GameTime;
    this.timeLeft = BaseTime;
    this.budgetLeft = BasePrice;
    this.currentLoadTime = BaseLoadTime;
    this.stage = 'white';
    this.hint = '';
    this.animating = false;

    this.currentVitals = { ...this.initialVitals };

    Object.values(this.improvementsByCategory).forEach((list) => {
      list.forEach((i) => (i.applied = false));
    });

    this.animateStage();

    this.countdownId = setInterval(() => {
      this.timer--;
      this.timerString.set(this.formatSeconds(this.timer));
      if (this.timer <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  canApply(action: Improvement): boolean {
    return (
      action.costRub <= this.budgetLeft &&
      action.timeDays <= this.timeLeft &&
      !action.applied &&
      !this.gameOver
    );
  }

  tryApplyAction(action: Improvement) {
    if (!this.canApply(action)) {
      if (action.applied) {
        this.hint = `Улучшение "${action.name}" уже применено.`;
      } else if (
        action.costRub > this.budgetLeft &&
        action.timeDays > this.timeLeft
      ) {
        this.hint = `Недостаточно бюджета и времени для "${action.name}". Нужно ${action.costRub}₽ и ${action.timeDays} дн.`;
      } else if (action.costRub > this.budgetLeft) {
        this.hint = `Недостаточно бюджета для "${action.name}". Нужно ${action.costRub}₽, осталось ${this.budgetLeft}₽.`;
      } else if (action.timeDays > this.timeLeft) {
        this.hint = `Недостаточно времени для "${action.name}". Нужно ${action.timeDays} дн., осталось ${this.timeLeft} дн.`;
      }
      return;
    }

    this.applyAction(action);
    this.hint = '';

    if (this.budgetLeft < 100_000) {
      this.hint = `Осталось мало бюджета: ${this.budgetLeft}₽.`;
    }
    if (this.timeLeft < 5) {
      this.hint = `Осталось мало времени: ${this.timeLeft} дн.`;
    }
  }

  calculateVitalPosition(metric: keyof typeof this.currentVitals): number {
    const value = this.currentVitals[metric];
    let position = 0;

    switch (metric) {
      case 'fcp':
        if (value <= 1800) {
          // Зелёная зона: 0-48px (0-1800 мс)
          position = (value / 1800) * 48;
        } else if (value <= 3000) {
          // Оранжевая зона: 48-96px (1800-3000 мс)
          position = 48 + ((value - 1800) / (3000 - 1800)) * 48;
        } else {
          // Красная зона: 96-144px (3000+ мс)
          position = Math.min(96 + ((value - 3000) / 1000) * 48, 144);
        }
        break;

      case 'lcp':
        if (value <= 2500) {
          position = (value / 2500) * 48;
        } else if (value <= 4000) {
          position = 48 + ((value - 2500) / (4000 - 2500)) * 48;
        } else {
          position = Math.min(96 + ((value - 4000) / 1000) * 48, 144);
        }
        break;

      case 'inp':
        if (value <= 200) {
          position = (value / 200) * 48;
        } else if (value <= 500) {
          position = 48 + ((value - 200) / (500 - 200)) * 48;
        } else {
          position = Math.min(96 + ((value - 500) / 100) * 48, 144);
        }
        break;

      case 'ttfb':
        if (value <= 800) {
          position = (value / 800) * 48;
        } else if (value <= 1200) {
          position = 48 + ((value - 800) / (1200 - 800)) * 48;
        } else {
          position = Math.min(96 + ((value - 1200) / 200) * 48, 144);
        }
        break;
    }

    return position - 16;
  }

  applyAction(action: Improvement) {
    if (
      action.applied ||
      this.budgetLeft < action.costRub ||
      this.timeLeft < action.timeDays ||
      this.gameOver
    )
      return;

    action.applied = true;
    this.budgetLeft -= action.costRub;
    this.timeLeft -= action.timeDays;
    this.currentLoadTime = Math.max(
      200,
      this.currentLoadTime - action.effectMs
    );
    this.progress.set(`${(this.currentLoadTime * 100) / BaseLoadTime}%`);
    this.progressImg.set(
      `${((this.currentLoadTime - BaseLoadTime) * 100) / BaseLoadTime}%`
    );

    this.animateStage();

    this.updateVitals();

    if (this.currentLoadTime <= 200) {
      this.endGame(true);
    } else if (
      this.budgetLeft <= 0 ||
      this.timeLeft <= 0 ||
      !this.hasAvailableActions()
    ) {
      this.endGame(false);
    }
  }

  updateVitals() {
    // Рассчитываем общий фактор улучшений (0-1)
    const totalImprovementFactor = this.totalImprovedMs / BaseLoadTime;

    // Применяем улучшения к каждой метрике
    this.currentVitals = {
      fcp: Math.max(100, this.initialVitals.fcp * (1 - totalImprovementFactor)),
      lcp: Math.max(100, this.initialVitals.lcp * (1 - totalImprovementFactor)),
      inp: Math.max(
        10,
        this.initialVitals.inp * (1 - totalImprovementFactor * 0.7)
      ),
      ttfb: Math.max(
        50,
        this.initialVitals.ttfb * (1 - totalImprovementFactor * 0.8)
      ),
    };

    // Обновляем визуализацию в UI
    /* this.updateVitalsVisualization(); */
  }

  hasAvailableActions(): boolean {
    return Object.values(this.improvementsByCategory)
      .flat()
      .some(
        (a) =>
          !a.applied &&
          a.costRub <= this.budgetLeft &&
          a.timeDays <= this.timeLeft
      );
  }

  animateStage() {
    const loadTime = this.currentLoadTime;
    const stageDuration = loadTime / 4;

    const stages: ('white' | 'header' | 'skeleton' | 'content')[] = [
      'white',
      'header',
      'skeleton',
      'content',
    ];

    let i = 0;
    const animateNext = () => {
      if (i >= stages.length) {
        return;
      }
      this.stage = stages[i];
      setTimeout(() => {
        i++;
        animateNext();
      }, stageDuration);
    };

    animateNext();
  }

  endGame(won: boolean = false) {
    this.gameOver = true;
    this.gameWon = won;
    this.gameStarted = false;

    clearInterval(this.countdownId);

    this.saveResult();
  }

  reset() {
    this.playerName = '';
    this.playerEmail = '';
    this.playerPhone = '';
    this.playerPersonalAgreement = false;
    this.playerPosition = '';
    this.playerScore = 0;
    this.timer = 60;
    this.timeLeft = 60;
    this.budgetLeft = 1000000;
    this.currentLoadTime = BaseLoadTime;
    this.progress.set(`100%`);
    this.progressImg.set(`0%`);
    this.gameStarted = false;
    this.gameOver = false;
    this.gameWon = false;
    this.loadLeaderboard();

    this.hint = '';
    this.animating = false;
    this.improvementsByCategory = {};
    improvements.forEach((imprList, category) => {
      this.improvementsByCategory[category] = imprList;
      imprList.forEach((i) => (i.applied = false));
    });
    this.currentVitals = { ...this.initialVitals };
  }

  async saveResult() {
    const db = await openDB('SpeedUpGameDB', 1, {
      upgrade(db) {
        db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
      },
    });
    this.playerScore = this.calculateScore(
      this.totalImprovedMs,
      this.budgetLeft,
      this.timeLeft
    );
    await db.add('results', {
      name: this.playerName,
      email: this.playerEmail,
      phone: this.playerPhone,
      personalAgreement: this.playerPersonalAgreement,
      position: this.playerPosition,
      score: this.playerScore,
      timestamp: Date.now(),
      totalImprovedMs: this.totalImprovedMs,
      budgetLeft: this.budgetLeft,
      timeLeft: this.timeLeft,
    });
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    const db = await openDB('SpeedUpGameDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
    const all = await db.getAll('results');
    this.leaderboard = all.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private calculateScore(
    finalTime: number, // конечное время загрузки (например, 200 мс)
    remainingBudget: number, // оставшийся бюджет
    remainingDays: number // оставшиеся дни
  ) {
    // Нормализованные параметры (чем ближе к 1, тем лучше)
    const speedImprovement =
      (BaseLoadTime - (BaseLoadTime - finalTime)) / (BaseLoadTime - 200);
    const budgetUsage = remainingBudget / BasePrice;
    const timeUsage = 1 - (GameTime - this.timer) / GameTime;
    const daysUsage = remainingDays / BaseTime;

    // Весовые коэффициенты (можно настроить)
    const speedWeight = 0.8; // важность скорости
    const budgetWeight = 0.2; // важность бюджета на улучшение
    const daysWeight = 0.2; // важность оставшихся дней на улучшение
    const timeWeight = 0.1; // важность времени таймера игры

    // Итоговый score (0-100)
    const score =
      1000 *
      (speedImprovement * speedWeight +
        budgetUsage * budgetWeight +
        timeUsage * timeWeight +
        daysUsage * daysWeight);

    return Math.max(0, Math.min(1000, Math.round(score)));
  }

  public formatSeconds(seconds: number): string {
    const absSeconds = Math.abs(seconds); // Учитываем отрицательное время
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;

    const sign = seconds < 0 ? '-' : '';

    return `${sign}${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  public exportResults(): void {
    this.indexedDbExport
      .exportToJson()
      .then(() => {
        /* console.log('Экспорт завершен!') */
      })
      .catch((err) => console.error('Ошибка экспорта:', err));
  }
}
