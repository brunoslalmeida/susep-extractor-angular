
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { DemonstrativoComponent, ResseguroComponent, SeguroComponent } from './components';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [provideNativeDateAdapter(), ResseguroComponent, SeguroComponent, DemonstrativoComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    RouterModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Susep Extractor';
}
