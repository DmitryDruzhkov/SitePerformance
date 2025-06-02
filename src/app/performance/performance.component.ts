import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { improvements, Improvement } from './solutions';
import { openDB } from 'idb';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('siteLoad', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
  styles: [
    `
      .title {
        font-size: 48px;
        margin-bottom: 24px;
      }
      .game-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #ccc;
        padding: 2rem;
        min-height: 100vh;
        font-family: sans-serif;
      }
      .start-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .input-info {
        font-size: 1.5rem;
      }
      input {
        font-size: 32px;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #999;
      }
      .leaderboard {
        margin-top: 5rem;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        width: 100%;
        max-width: 400px;
      }
      .leaderboard h3 {
        margin-top: 0;
      }
      .leaderboard-item {
        padding: 0.25rem 0;
        border-bottom: 1px solid #ccc;
      }
      .leaderboard-item:last-child {
        border-bottom: none;
      }
      button {
        background-color: #444;
        color: black;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      button:hover:not(:disabled) {
        background-color: #222;
      }
      button:disabled {
        opacity: 0.5;
      }
      button.start {
        color: white;
        font-size: 24px;
      }
      .applied {
        background-color: green !important;
      }
      .unaffordable {
        background-color: darkorange !important;
      }
      .category-title {
        font-size: 2.25rem;
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center;
      }
      .site-image {
        width: 100%;
        max-width: 500px;
        border: 2px solid #999;
        border-radius: 8px;
        transition: opacity 0.5s ease-in-out;
      }
      .site-visuals-title {
        text-align: center;
      }
      .site-visuals-container {
        overflow: hidden;
        height: 350px;
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        justify-content: center;
        margin-bottom: 3rem;
      }
      .vitals-box {
        margin-top: 1rem;
      }
      .improvement-title {
        font-size: 1.5rem;
        font-weight: bold;
      }
      .categories-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin-top: 2rem;
      }
      .category-column {
        flex: 1 1 300px;
        display: flex;
        flex-direction: column;
      }
      .chart-box {
        margin-top: 2rem;
        background: white;
        padding: 1rem;
        border: 1px solid #999;
        border-radius: 6px;
      }
      .circle-group {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .circle-group.progress {
        margin-bottom: 3rem;
      }
      .circle-item {
        text-align: center;
      }
      .timer-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.2rem;
        color: #333;
        margin: 0 auto 0.5rem auto;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        text-align: center;
        background-image: radial-gradient(
          circle at center,
          rgba(0, 0, 0, 0.05),
          rgba(0, 0, 0, 0)
        );
        background-blend-mode: luminosity;
      }
      .circle-label {
        font-size: 0.95rem;
        color: #444;
      }
      .improvement-item {
        display: block;
        text-align: left;
        border: 2px solid #a9a9a9;
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 1.5rem;
        background-color: white;
        transition: border 0.2s, background-color 0.2s;
        cursor: pointer;
      }
      .improvement-item:hover:not(:disabled) {
        border: 2px solid #696969;
        background-color: #f7f7f7;
      }
      .improvement-item:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .improvement-item.applied {
        border: 2px solid green;
        background-color: #eaffea;
      }
      .improvement-item.unaffordable {
        border: 2px solid darkorange;
        background-color: #fff3e0;
      }
      .end-block {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .end-block .circle-group {
        margin-top: 5rem;
        margin-bottom: 5rem;
      }
    `,
  ],
  template: `
    <div class="game-container">
      <div *ngIf="!gameStarted && !gameOver" class="start-info">
        <h1>Оптимизируй загрузку сайта</h1>
        <p class="input-info">Введите ваше имя и email:</p>
        <input [(ngModel)]="playerName" placeholder="Имя" />
        <input [(ngModel)]="playerEmail" placeholder="Email" type="email" />
        <button
          class="start"
          (click)="startGame()"
          [disabled]="!playerName || !playerEmail"
        >
          Начать игру
        </button>

        <div class="leaderboard" *ngIf="leaderboard.length">
          <h3>Топ 10 участников</h3>
          <div *ngFor="let entry of leaderboard" class="leaderboard-item">
            {{ entry.name }} — {{ entry.score }} очков
          </div>
        </div>
      </div>

      <div *ngIf="gameStarted">
        <div class="circle-group progress">
          <div class="circle-item" *ngFor="let metric of circleMetrics">
            <div
              class="timer-circle"
              [style.background]="
                'conic-gradient(' +
                metric.color +
                ' ' +
                metric.fill +
                'deg, #ddd 0deg)'
              "
            >
              {{ metric.value }}
            </div>
            <div class="circle-label">{{ metric.label }}</div>
          </div>
        </div>

        <div *ngIf="hint">{{ hint }}</div>

        <h2 class="site-visuals-title">Анимация открытия сайта</h2>

        <div class="site-visuals-container">
          <img
            [@siteLoad]
            [src]="'/assets/site-' + stage + '.png'"
            class="site-image"
            alt="Website stage"
          />

          <div class="vitals-box">
            <h3>Показатели Web Vitals</h3>
            <ul>
              <li>FCP: {{ currentVitals.fcp }} мс</li>
              <li>LCP: {{ currentVitals.lcp }} мс</li>
              <li>INP: {{ currentVitals.inp }} мс</li>
              <li>TTFB: {{ currentVitals.ttfb }} мс</li>
            </ul>
          </div>
        </div>

        <div class="categories-container">
          <div class="category-column" *ngFor="let category of categories">
            <div class="category-title">{{ category }}</div>
            <button
              *ngFor="let imp of improvementsByCategory[category]"
              class="improvement-item"
              [class.applied]="imp.applied"
              [class.unaffordable]="!canApply(imp) && !imp.applied"
              (click)="tryApplyAction(imp)"
              [disabled]="imp.applied || !canApply(imp)"
            >
              <div class="improvement-title">{{ imp.name }}</div>
              <div class="improvement-details">
                <div>Цена: {{ imp.costRub }}₽</div>
                <div>Время: {{ imp.timeDays }} дн</div>
                <div>Эффект: -{{ imp.effectMs }} мс</div>
              </div>
            </button>
          </div>
        </div>

        <div class="chart-box">
          <h3>График прогресса загрузки</h3>
          <canvas id="progressChart"></canvas>
        </div>
      </div>

      <div *ngIf="gameOver" class="end-block">
        <h1 *ngIf="gameWon">Поздравляем! Сайт стал супербыстрым! 🚀</h1>
        <h1 *ngIf="!gameWon">Игра окончена. Попробуйте ещё раз.</h1>

        <div class="circle-group">
          <div class="circle-item" *ngFor="let metric of circleMetrics">
            <div
              class="timer-circle"
              [style.background]="
                'conic-gradient(' +
                metric.color +
                ' ' +
                metric.fill +
                'deg, #ddd 0deg)'
              "
            >
              {{ metric.value }}
            </div>
            <div class="circle-label">{{ metric.label }}</div>
          </div>
        </div>

        <button class="start" (click)="reset()">Новая игра</button>
      </div>
    </div>
  `,
})
export class PerformanceComponent {
  playerName = '';
  playerEmail = '';
  leaderboard: { name: string; score: number }[] = [];

  gameStarted = false;
  gameOver = false;
  gameWon = false;

  timeLeft = 40;
  budgetLeft = 1_500_000;
  currentLoadTime = 5000;
  timer = 1200;
  stage: 'white' | 'header' | 'skeleton' | 'content' = 'white';

  countdownId: any;
  hint = '';
  animating = false;

  improvementsByCategory: { [key: string]: Improvement[] } = {};
  categories = Array.from(improvements.keys());

  initialVitals = {
    fcp: 3000,
    lcp: 4000,
    inp: 150,
    ttfb: 600,
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

  get circleMetrics() {
    return [
      {
        label: 'Оставшееся время',
        color: '#4caf50',
        value: `${this.timer} сек`,
        fill: ((60 - this.timer) / 60) * 360,
      },
      {
        label: 'Дней осталось',
        color: '#03a9f4',
        value: `${this.timeLeft} дн`,
        fill: ((40 - this.timeLeft) / 40) * 360,
      },
      {
        label: 'Оставшийся бюджет',
        color: '#ff9800',
        value: `${this.budgetLeft.toLocaleString()}₽`,
        fill: ((1500000 - this.budgetLeft) / 1500000) * 360,
      },
      {
        label: 'Текущая загрузка',
        color: '#f44336',
        value: `${this.currentLoadTime} мс`,
        fill: ((5000 - this.currentLoadTime) / 5000) * 360,
      },
      {
        label: 'Суммарное улучшение',
        color: '#8bc34a',
        value: `-${this.totalImprovedMs} мс`,
        fill: (this.totalImprovedMs / 5000) * 360,
      },
      {
        label: 'Прогресс',
        color: '#673ab7',
        value: `${(100 - (this.currentLoadTime / 5000) * 100).toFixed(0)}%`,
        fill: (100 - (this.currentLoadTime / 5000) * 100) * 3.6,
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
    this.timer = 3000;
    this.timeLeft = 40;
    this.budgetLeft = 1_500_000;
    this.currentLoadTime = 5000;
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
    this.animateStage();

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

    this.saveResult(
      this.playerName,
      this.playerEmail,
      this.totalImprovedMs,
      this.timeLeft,
      this.budgetLeft
    );
  }

  reset() {
    this.playerName = '';
    this.playerEmail = '';
    this.timer = 60;
    this.timeLeft = 60;
    this.budgetLeft = 1000000;
    this.currentLoadTime = 5000;
    /* this.totalImprovedMs = 0; */
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

  async saveResult(
    playerName: string,
    playerEmail: string,
    totalImprovedMs: number,
    timeLeft: number,
    budgetLeft: number
  ) {
    const db = await openDB('SpeedUpGameDB', 1, {
      upgrade(db) {
        db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
      },
    });
    const score = this.calculateScore(totalImprovedMs, timeLeft, budgetLeft);
    await db.add('results', {
      name: playerName,
      email: playerEmail,
      score,
      timestamp: Date.now(),
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

  calculateScore(
    totalImprovedMs: number,
    timeLeft: number,
    budgetLeft: number
  ) {
    const efficiency = totalImprovedMs;
    const timeBonus = Math.max(0, timeLeft);
    const budgetBonus = Math.max(0, budgetLeft / 10000);
    return Math.round(efficiency + timeBonus * 50 + budgetBonus);
  }
}
