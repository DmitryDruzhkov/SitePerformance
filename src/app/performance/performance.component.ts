import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { improvements, Improvement } from './solutions';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
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
    .game-container {
      background-color: #ccc;
      padding: 2rem;
      min-height: 100vh;
      font-family: sans-serif;
    }
    button {
      background-color: #444;
      color: white;
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
    .applied {
      background-color: green !important;
    }
    .unaffordable {
      background-color: darkorange !important;
    }
    `,
  ],
  template: `
    <div class="game-container">
      <div *ngIf="!gameStarted" class="intro">
        <h2>Добро пожаловать в симулятор ускорения сайта!</h2>
        <p>
          Цель: уменьшить время загрузки страницы с 5 секунд до 200 мс, не
          потратив более 2 месяцев и 1 млн рублей.
        </p>
        <button (click)="startGame()">Начать игру</button>
      </div>

      <div *ngIf="gameStarted" class="game-content">
        <div class="status-bar" style="display:flex; gap:2rem; flex-wrap: wrap;">
          <div>⏱ Осталось времени: {{ timeLeft }} дн.</div>
          <div>💰 Бюджет: {{ budgetLeft | currency : 'RUB' }}</div>
          <div>🚀 Текущая скорость: {{ currentLoadTime }} мс</div>
          <div>🕒 Таймер: {{ timer }} сек.</div>
        </div>

        <div class="webvitals" style="margin-top:1rem;">
          <h4>Web Vitals показатели (мс):</h4>
          <ul>
            <li>FCP: {{ currentVitals.fcp }}</li>
            <li>LCP: {{ currentVitals.lcp }}</li>
            <li>INP: {{ currentVitals.inp }}</li>
            <li>TTFB: {{ currentVitals.ttfb }}</li>
          </ul>
        </div>

        <div class="hint" *ngIf="hint" style="color:orange; margin:0.5rem 0;">
          ⚠️ {{ hint }}
        </div>

        <div class="site-simulator" [@siteLoad]="stage">
          <div *ngIf="stage === 'white'" class="white-screen">
            Белый экран...
          </div>
          <div *ngIf="stage === 'header'" class="header">
            Заголовок загружается...
          </div>
          <div *ngIf="stage === 'skeleton'" class="skeletons">
            Скелеты контента...
          </div>
          <div *ngIf="stage === 'content'" class="content">
            Полный контент загружен!
          </div>
        </div>

        <div class="actions" style="margin-top:1rem;">
          <h3>Улучшения по категориям</h3>
          <div class="action-columns" style="display:flex; gap:1rem;">
            <div *ngFor="let category of categories" style="flex:1;">
              <h4>{{ category | titlecase }}</h4>
              <ng-container *ngFor="let action of improvementsByCategory[category]">
                <button
                  (click)="tryApplyAction(action)"
                  [disabled]="action.applied || gameOver || !canApply(action)"
                  [ngClass]="{
                    'applied': action.applied,
                    'unaffordable': !canApply(action) && !action.applied
                  }"
                  title="{{ action.description }}"
                  style="width:100%; margin-bottom:4px;"
                >
                  {{ action.name }} ({{ action.effectMs }}мс,
                  {{ action.costRub | currency : 'RUB' : 'symbol' : '1.0-0' }},
                  {{ action.timeDays }} дн)
                </button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="gameOver" class="result" style="margin-top:1rem;">
        <h2 *ngIf="gameWon">
          🎉 Победа! Вы достигли скорости 200мс и не потратили все ресурсы!
        </h2>
        <h2 *ngIf="!gameWon">
          😢 Игра окончена. У вас закончились ресурсы или не достигнута цель.
        </h2>
        <button (click)="reset()">Попробовать снова</button>
      </div>
    </div>
  `,
})
export class PerformanceComponent {
  gameStarted = false;
  gameOver = false;
  gameWon = false;

  timeLeft = 60; // дней
  budgetLeft = 1_000_000;
  currentLoadTime = 5000; // мс
  timer = 30;
  stage: 'white' | 'header' | 'skeleton' | 'content' = 'white';

  countdownId: any;
  hint = '';

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

  get allActions(): Improvement[] {
    return Object.values(this.improvementsByCategory).flat();
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.gameWon = false;
    this.timer = 30;
    this.timeLeft = 60;
    this.budgetLeft = 1_000_000;
    this.currentLoadTime = 5000;
    this.stage = 'white';
    this.hint = '';
    this.currentVitals = { ...this.initialVitals };
    this.allActions.forEach((i) => (i.applied = false));
    this.updateStage();

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
        this.hint = `Недостаточно бюджета и времени для "${action.name}".`;
      } else if (action.costRub > this.budgetLeft) {
        this.hint = `Недостаточно бюджета для "${action.name}".`;
      } else if (action.timeDays > this.timeLeft) {
        this.hint = `Недостаточно времени для "${action.name}".`;
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
    this.currentLoadTime = Math.max(200, this.currentLoadTime - action.effectMs);
    this.updateStage();

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
    return this.allActions.some(
      (a) => !a.applied && a.costRub <= this.budgetLeft && a.timeDays <= this.timeLeft
    );
  }

  updateStage() {
    if (this.currentLoadTime > 4000) this.stage = 'white';
    else if (this.currentLoadTime > 2500) this.stage = 'header';
    else if (this.currentLoadTime > 1000) this.stage = 'skeleton';
    else this.stage = 'content';
  }

  endGame(won: boolean = false) {
    this.gameOver = true;
    this.gameWon = won;
    this.gameStarted = false;
    clearInterval(this.countdownId);
  }

  reset() {
    this.gameStarted = false;
    this.gameOver = false;
    this.gameWon = false;
    this.hint = '';
    this.improvementsByCategory = {};
    improvements.forEach((imprList, category) => {
      this.improvementsByCategory[category] = imprList;
      imprList.forEach((i) => (i.applied = false));
    });
    this.currentVitals = { ...this.initialVitals };
  }
}
