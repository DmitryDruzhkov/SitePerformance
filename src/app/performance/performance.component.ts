import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { improvements, Improvement } from './solutions';
import { openDB } from 'idb';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

const BaseLoadTime: number = 5000;

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
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
      h1 {
        font-weight: 700;
        font-size: 31px;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
      }
      .title {
        font-size: 48px;
        margin-bottom: 24px;
      }
      .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        min-height: 100vh;
        font-family: sans-serif;
        padding: 32px;
      }
      .start-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .input-info {
        font-weight: 400;
        font-size: 24px;
        line-height: 100%;
        letter-spacing: 0%;
        text-align: center;
        vertical-align: middle;
      }
      input {
        font-weight: 400;
        font-size: 32px;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border-radius: 16px;
        border: 2px solid #00bf6a;
        color: #00bf6a;

        &::placeholder {
          color: #00bf6a40;
        }

        &:focus {
          border: 2px solid #00bf6a;
        }
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
        cursor: pointer;
        background-color: #444;
        color: black;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      button:hover:not(:disabled) {
        background-color: #00a0ff;
      }
      button:disabled {
        opacity: 0.5;
      }
      button.start {
        border-radius: 16px;
        font-weight: 700;
        font-size: 24px;
        line-height: 100%;
        letter-spacing: 0%;
        text-align: center;
        vertical-align: middle;
        padding: 8px 20px;
        background-color: #001e64;
        color: #ffffff;
        margin-top: 32px;
        /* :hover {
          background-color: #001e64;
        } */
      }
      /* .applied {
        background-color: green !important;
      } */
      /* .unaffordable {
        background-color: darkorange !important;
      } */
      .category-title {
        font-size: 34px;
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center;
        border-radius: 16px;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-left: 14px;
        background-color: #001e64;
        color: #ffffff;
      }
      .site-image {
        width: 100%;
        max-width: 500px;
        border: 2px solid #999;
        border-radius: 8px;
        transition: opacity 0.5s ease-in-out;
      }
      /* .site-visuals-title {
        text-align: center;
      } */
      .site-visuals-container {
        overflow: hidden;
        height: 350px;
        display: flex;
        gap: 2rem;
        align-items: center;
        /* justify-content: center; */
        margin-bottom: 3rem;
      }
      .vitals-box {
        margin-top: 1rem;
      }
      .vitals-box-title {
        font-weight: 700;
        font-size: 24px;
        line-height: 100%;
        color: #001e64;
        margin-bottom: 26px;
      }
      .vitals {
        display: flex;
        flex-direction: column;
      }
      .vitals-item {
        display: flex;
        flex-direction: column;
      }
      .vitals-container {
        width: 144px;
        display: flex;
        overflow: hidden;
        border-radius: 6px;
      }
      .vitals-red {
        width: 48px;
        height: 13px;
        background-color: #f44336;
      }
      .vitals-orange {
        width: 48px;
        height: 13px;
        background-color: #ff9800;
      }
      .vitals-green {
        width: 48px;
        height: 13px;
        background-color: #00bf6a;
      }

      .vitals-label {
        font-weight: 700;
        font-size: 24px;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        margin-top: 6px;
      }
      .improvement-title {
        font-weight: 400;
        font-size: 24px;
        vertical-align: middle;
        margin-bottom: 8px;
      }
      .improvement-details {
        display: flex;
      }
      .improvement-details-item:last-child {
        margin-left: 12px;
      }
      .improvement-details-item {
        font-weight: 700;
        font-size: 15px;
        line-height: 100%;
        padding: 8px 16px;
        background-color: #001e64;
        border-radius: 16px;
        width: fit-content;
        color: white;
      }
      .improvement-details-price {
        background-color: #001e64;
      }
      .improvement-details-time {
        background-color: #00a0ff;
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
      .game-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .metrics {
        display: flex;
        flex-direction: column;
        width: 1090px;
      }
      .metrics-timers {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
      }
      .metrics-timer {
        font-weight: 700;
        font-size: 136px;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: bottom;
        color: #03a9f459;
      }
      .circle-group {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
      }
      .circle-item {
        text-align: center;
      }
      .timer-circle {
        width: 154px;
        height: 154px;
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
        font-weight: bold;
        color: #444;
      }
      .improvement-item {
        display: block;
        text-align: left;
        border: 2px solid #00bf6a;
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 1.5rem;
        background-color: white;
        transition: border 0.2s, background-color 0.2s;
        cursor: pointer;
      }
      .improvement-item:hover:not(:disabled) {
        /* border: 2px solid #696969;
        background-color: #f7f7f7; */
        border: 2px solid #00bf6a;
        background-color: #00bf6a40;

        .improvement-details-time,
        .improvement-details-price {
          background-color: #00bf6a40;
        }
      }
      .improvement-item:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .improvement-item.applied {
        border: 2px solid #00bf6a;
        background-color: #00bf6a;

        .improvement-details-time,
        .improvement-details-price {
          background-color: #00bf6a;
          color: #0000004d;
        }
        .improvement-title {
          color: #0000004d;
        }
      }
      .improvement-item.unaffordable {
        border: 2px solid #cccccc80;
        background-color: #cccccc80;

        .improvement-details-time,
        .improvement-details-price {
          background-color: #cccccc80;
          color: #0000004d;
        }
        .improvement-title {
          color: #0000004d;
        }
      }
      .end-block {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Radial progress bar styles */
      .radial-progress {
        width: 154px;
        height: 154px;
        position: relative;
        margin: 0 auto 0.5rem auto;
      }
      .radial-progress__percent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        font-size: 1.2rem;
        color: #333;
      }
      .radial-progress__svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }
      .radial-progress__background {
        fill: none;
        stroke: #ddd;
        stroke-width: 3px;
      }
      .radial-progress__fill {
        fill: none;
        stroke: currentColor;
        stroke-width: 3px;
        stroke-linecap: round;
        transition: 0.5s ease-in-out;
      }
      .progress-group {
        position: relative;
      }
      .progress-group-back {
        height: 24px;
        width: 100%;
        background-color: #cccccc80;
        border-radius: 12px;
        overflow: hidden;
      }
      .progress-group-bar {
        height: 24px;
        width: 100%;
        background-color: #ff982c;
        border-radius: 12px;
        position: relative;
        top: 0;
        right: 100%;
        transition: 0.5s ease-in-out;
      }
      .progress-group-img {
        width: 91px;
        height: 91px;
        position: relative;
        top: -53px;
        right: 0%;
        transition: 0.5s ease-in-out;

        img {
          position: relative;
          right: 91px;
        }
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

      <div *ngIf="gameStarted" class="game-content">
        <div class="metrics">
          <div class="metrics-timers">
            <div class="circle-group progress">
              <div class="circle-item" *ngFor="let metric of circleMetrics">
                <div class="radial-progress">
                  <span class="radial-progress__percent">{{
                    metric.value
                  }}</span>
                  <svg class="radial-progress__svg" viewBox="0 0 36 36">
                    <circle
                      class="radial-progress__background"
                      cx="18"
                      cy="18"
                      r="15.9155"
                    ></circle>
                    <circle
                      class="radial-progress__fill"
                      [attr.stroke-dasharray]="'100, 100'"
                      [attr.stroke-dashoffset]="100 - metric.fill / 3.6"
                      [style.color]="metric.color"
                      cx="18"
                      cy="18"
                      r="15.9155"
                    ></circle>
                  </svg>
                </div>
                <!-- <div class="circle-label">{{ metric.label }}</div> -->
              </div>
            </div>

            <div class="metrics-timer">
              {{ timerString() }}
            </div>
          </div>
          <div class="progress-group">
            <div class="progress-group-back">
              <div [style.right]="progress()" class="progress-group-bar"></div>
            </div>
            <div [style.right]="progressImg()" class="progress-group-img">
              <img src="/assets/uh_bike.svg" />
            </div>
          </div>
        </div>

        <div *ngIf="hint">{{ hint }}</div>

        <!-- <h2 class="site-visuals-title">Анимация открытия сайта</h2> -->

        <div class="site-visuals-container">
          <img
            [@siteLoad]
            [src]="'/assets/site-' + stage + '.png'"
            class="site-image"
            alt="Website stage"
          />

          <div class="vitals-box">
            <div class="vitals-box-title">Показатели Web Vitals</div>
            <!-- <ul>
              <li>FCP: {{ currentVitals.fcp }} мс</li>
              <li>LCP: {{ currentVitals.lcp }} мс</li>
              <li>INP: {{ currentVitals.inp }} мс</li>
              <li>TTFB: {{ currentVitals.ttfb }} мс</li>
            </ul> -->
            <div class="vitals">
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                </div>
                <div class="vitals-label">FCP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                </div>
                <div class="vitals-label">INP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                </div>
                <div class="vitals-label">LCP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                </div>
                <div class="vitals-label">TTFB</div>
              </div>
            </div>
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
                <div class="improvement-details-item improvement-details-time">
                  {{ imp.timeDays }} дн
                </div>
                <div class="improvement-details-item improvement-details-price">
                  {{ imp.costRub }} ₽
                </div>
                <!-- <div>Эффект: -{{ imp.effectMs }} мс</div> -->
              </div>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="gameOver" class="end-block">
        <h1 *ngIf="gameWon">Поздравляем! Сайт стал супербыстрым! 🚀</h1>
        <h1 *ngIf="!gameWon">Игра окончена. Попробуйте ещё раз.</h1>

        <div class="circle-group">
          <div class="circle-item" *ngFor="let metric of circleMetrics">
            <div class="radial-progress">
              <span class="radial-progress__percent">{{ metric.value }}</span>
              <svg class="radial-progress__svg" viewBox="0 0 36 36">
                <circle
                  class="radial-progress__background"
                  cx="18"
                  cy="18"
                  r="15.9155"
                ></circle>
                <circle
                  class="radial-progress__fill"
                  [attr.stroke-dasharray]="'100, 100'"
                  [attr.stroke-dashoffset]="100 - metric.fill / 3.6"
                  [style.color]="metric.color"
                  cx="18"
                  cy="18"
                  r="15.9155"
                ></circle>
              </svg>
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
  currentLoadTime = BaseLoadTime;
  progress: WritableSignal<string> = signal(`100%`);
  progressImg: WritableSignal<string> = signal(`0%`);
  timer = 1200;
  timerString: WritableSignal<string> = signal('');
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
      /* {
        label: 'Оставшееся время',
        color: '#4caf50',
        value: `${this.timer} сек`,
        fill: ((60 - this.timer) / 60) * 360,
      }, */
      {
        label: 'Дней осталось',
        color: '#00A0FF',
        value: `${this.timeLeft} дн`,
        fill: ((40 - this.timeLeft) / 40) * 360,
      },
      {
        label: 'Оставшийся бюджет',
        color: '#001E64',
        value: `${this.budgetLeft.toLocaleString()}₽`,
        fill: ((1500000 - this.budgetLeft) / 1500000) * 360,
      },
      {
        label: 'Текущая загрузка',
        color: '#00BF6A',
        value: `${this.currentLoadTime} мс`,
        fill: ((BaseLoadTime - this.currentLoadTime) / BaseLoadTime) * 360,
      },
      /* {
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
      }, */
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

  public formatSeconds(seconds: number): string {
    const absSeconds = Math.abs(seconds); // Учитываем отрицательное время
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;

    const sign = seconds < 0 ? '-' : '';

    return `${sign}${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }
}
