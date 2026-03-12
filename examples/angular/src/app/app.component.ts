import { Component } from '@angular/core';
import { SampleComponent } from './sample/sample.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SampleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
