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
      .category-title {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }
      .site-image {
        width: 100%;
        max-width: 500px;
        border: 2px solid #999;
        border-radius: 8px;
        transition: opacity 0.5s ease-in-out;
      }
      .site-visuals-container {
        overflow: hidden;
        height: 350px;
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        justify-content: center;
        margin-bottom: 2rem;
      }
      .vitals-box {
        margin-top: 1rem;
      }
      .improvement-title {
        font-size: 1.1rem;
        font-weight: bold;
        margin-top: 0.5rem;
      }
      .improvement-details {
        margin-bottom: 1.5rem;
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
      .timer-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.5rem;
        color: #333;
        margin: 0 auto 1rem;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      }
    `,
  ],
  template: `
    <div class="game-container">
      <div *ngIf="!gameStarted && !gameOver">
        <h1>Оптимизируй загрузку сайта</h1>
        <p>
          Выберите улучшения, чтобы сократить время загрузки. У вас ограничены
          бюджет и время.
        </p>
        <button (click)="startGame()">Начать игру</button>
      </div>

      <div *ngIf="gameStarted">
        <div
          class="timer-circle"
          [style.background]="
            'conic-gradient(#4caf50 ' +
            ((60 - timer) / 60) * 360 +
            'deg, #ddd 0deg)'
          "
        >
          {{ timer }} сек
        </div>
        <div>Дней осталось: {{ timeLeft }}</div>
        <div>Бюджет: {{ budgetLeft | number }}₽</div>
        <div>Текущая загрузка: {{ currentLoadTime }} мс</div>
        <div>Суммарное улучшение: -{{ totalImprovedMs }} мс</div>
        <div>
          Прогресс:
          {{ 100 - (currentLoadTime / 5000) * 100 | number : '1.0-0' }}%
        </div>
        <div *ngIf="hint">{{ hint }}</div>

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
            <div *ngFor="let imp of improvementsByCategory[category]">
              <div class="improvement-title">{{ imp.name }}</div>
              <div class="improvement-details">
                <div>Цена: {{ imp.costRub }}₽</div>
                <div>Время: {{ imp.timeDays }} дн</div>
                <div>Эффект: -{{ imp.effectMs }} мс</div>
                <button
                  (click)="tryApplyAction(imp)"
                  [disabled]="!canApply(imp)"
                  [class.applied]="imp.applied"
                  [class.unaffordable]="!canApply(imp) && !imp.applied"
                >
                  {{ imp.applied ? 'Применено' : 'Применить' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-box">
          <h3>График прогресса загрузки</h3>
          <!-- Здесь будет график с осями: время vs скорость загрузки -->
          <canvas id="progressChart"></canvas>
        </div>
      </div>

      <div *ngIf="gameOver">
        <div *ngIf="gameWon">Поздравляем! Сайт стал супербыстрым! 🚀</div>
        <div *ngIf="!gameWon">Игра окончена. Попробуйте ещё раз.</div>
        <button (click)="reset()">Сброс</button>
      </div>
    </div>
  `,
})
export class PerformanceComponent {
  gameStarted = false;
  gameOver = false;
  gameWon = false;

  timeLeft = 60;
  budgetLeft = 1_000_000;
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
    this.timeLeft = 60;
    this.budgetLeft = 1_000_000;
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
  }

  reset() {
    this.gameStarted = false;
    this.gameOver = false;
    this.gameWon = false;
    this.hint = '';
    this.animating = false;
    this.improvementsByCategory = {};
    improvements.forEach((imprList, category) => {
      this.improvementsByCategory[category] = imprList;
      imprList.forEach((i) => (i.applied = false));
    });
    this.currentVitals = { ...this.initialVitals };
  }
}
