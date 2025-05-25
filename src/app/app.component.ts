import { Component } from '@angular/core';
import { PerformanceComponent } from './performance/performance.component';

@Component({
  selector: 'app-root',
  imports: [PerformanceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
