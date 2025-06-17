import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { improvements, Improvement } from './solutions';
import { openDB } from 'idb';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';

const BaseLoadTime: number = 5000;
const BasePrice: number = 2600000;
const BaseTime: number = 80;
const GameTime: number = 120;

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatCheckboxModule],
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
        text-align: center;
        vertical-align: middle;
      }
      input {
        font-weight: 400;
        font-size: 32px;
        line-height: 100%;
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
        flex-wrap: wrap;
        width: 350px;
        gap: 30px 40px;
      }
      .vitals-item {
        display: flex;
        flex-direction: column;
      }
      .vitals-container {
        width: 144px;
        display: flex;
        position: relative;
        /* overflow: hidden; */
      }
      .vitals-red {
        width: 48px;
        height: 13px;
        background-color: #f44336;
        border-radius: 6px 0 0 6px;
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
        border-radius: 0 6px 6px 0;
      }

      .vitals-label {
        font-weight: 700;
        font-size: 24px;
        line-height: 100%;
        vertical-align: middle;
        margin-top: 6px;
      }
      .vitals-indicator {
        position: absolute;
        width: 12px;
        height: 12px;
        top: -3px;
        right: 0;
        z-index: 10;
        border-radius: 20px;
        border: 4px solid white;
        transition: 0.5s ease-in-out;
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
        <input [(ngModel)]="playerName" placeholder="ФИО" />

        <input [(ngModel)]="playerEmail" placeholder="Email" type="email" />

        <input [(ngModel)]="playerPhone" placeholder="Телефон" type="tel" placeholder="8-987-654-3210" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"/>

        <input [(ngModel)]="playerPosition" placeholder="Должность" />

        <mat-checkbox class="example-margin">Cогласен на обработку персональных данных</mat-checkbox> <a href="https://lenta.com/i/pokupatelyam/privacy-policy/">Политика конфиденциальности</a>

        <button
          class="start"
          (click)="startGame()"
          [disabled]="!playerName || !playerEmail || !playerPhone || !playerPosition"
        >
          Начать игру
        </button>

        <div class="leaderboard" *ngIf="leaderboard.length">
          <p class="input-info">Топ 10 участников:</p>
          <div *ngFor="let entry of leaderboard" class="leaderboard-item">
            {{ entry.name }}: {{ entry.score }} очков
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
              <img src="assets/uh_bike.svg" />
            </div>
          </div>
        </div>

        <div *ngIf="hint">{{ hint }}</div>

        <!-- <h2 class="site-visuals-title">Анимация открытия сайта</h2> -->

        <div class="site-visuals-container">
          <img
            [@siteLoad]
            [src]="'assets/site-' + stage + '.png'"
            class="site-image"
            alt="Website stage"
          />

          <div class="vitals-box">
            <div class="vitals-box-title">Показатели Web Vitals</div>
            <div class="vitals">
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                  <div
                    class="vitals-indicator"
                    [style.right.px]="calculateVitalPosition('fcp')"
                  ></div>
                </div>
                <div class="vitals-label">FCP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                  <div
                    class="vitals-indicator"
                    [style.right.px]="calculateVitalPosition('inp')"
                  ></div>
                </div>
                <div class="vitals-label">INP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                  <div
                    class="vitals-indicator"
                    [style.right.px]="calculateVitalPosition('lcp')"
                  ></div>
                </div>
                <div class="vitals-label">LCP</div>
              </div>
              <div class="vitals-item">
                <div class="vitals-container">
                  <div class="vitals-red"></div>
                  <div class="vitals-orange"></div>
                  <div class="vitals-green"></div>
                  <div
                    class="vitals-indicator"
                    [style.right.px]="calculateVitalPosition('ttfb')"
                  ></div>
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
              [matTooltip]="imp.description"
              matTooltipPosition="above"
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
                <!-- <div class="improvement-details-item improvement-details-price">
                  Эффект: -{{ imp.effectMs }} мс
                </div> -->
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

        <h2>Ваш счёт {{ playerScore }}</h2>

        <button class="start" (click)="reset()">Новая игра</button>
      </div>
    </div>
  `,
})
export class PerformanceComponent {
  playerName: string = '';
  playerEmail: string = '';
  playerPhone: string = '';
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
        fill: ((BaseTime - this.timeLeft) / BaseTime) * 360,
      },
      {
        label: 'Оставшийся бюджет',
        color: '#001E64',
        value: `${this.budgetLeft.toLocaleString()}₽`,
        fill: ((BasePrice - this.budgetLeft) / BasePrice) * 360,
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

    this.saveResult(
      this.playerName,
      this.playerEmail,
      this.playerPhone,
      this.playerPosition,
      this.totalImprovedMs,
      this.timeLeft,
      this.budgetLeft
    );
  }

  reset() {
    this.playerName = '';
    this.playerEmail = '';
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

  async saveResult(
    playerName: string,
    playerEmail: string,
    playerPhone: string,
    playerPosition: string,
    totalImprovedMs: number,
    timeLeft: number,
    budgetLeft: number
  ) {
    const db = await openDB('SpeedUpGameDB', 1, {
      upgrade(db) {
        db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
      },
    });
    this.playerScore = this.calculateScore(totalImprovedMs, timeLeft, budgetLeft);
    await db.add('results', {
      name: playerName,
      email: playerEmail,
      phone: playerPhone,
      position: playerPosition,
      score: this.playerScore,
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
