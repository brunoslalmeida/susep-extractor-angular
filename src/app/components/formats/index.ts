import { Injectable } from '@angular/core'; // 1. Importe o Injectable
import { NativeDateAdapter } from '@angular/material/core';

export const YEAR_FORMATS = {
  parse: {
    dateInput: { year: 'numeric' },
  },
  display: {
    dateInput: { year: 'numeric' }, // Aqui está o segredo: forçar apenas o ano
    monthYearLabel: { year: 'numeric' },
    dateA11yLabel: { year: 'numeric' },
    monthYearA11yLabel: { year: 'numeric' },
  },
};

@Injectable() // 2. Adicione o decorador aqui
export class CustomYearMonthAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    if (displayFormat === 'input') {
      return `${year}${month}`;
    }
    return date.toDateString();
  }
}

export const YYYYMM_FORMATS = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: 'LL',
    monthYearA11yLabel: { year: 'numeric', month: 'numeric' },
  },
};