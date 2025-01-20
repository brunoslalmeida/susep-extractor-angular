import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

interface ICompany {
  code: string;
  name: string;
}

interface IType {
  code: string;
  value: string;
}

interface IResult {
  month: string;
  values: IValues[];
}

interface IValues {
  name: string;
  value: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private baseUrl = 'https://susep-extractor.bruno-s-l-almeida.workers.dev/';

  hasData = false;
  onHttp = false;

  table: {
    months: string[];
    names: string[];
    data: {
      [key: string]: string;
    }[];
  } | null = null;
  companies: ICompany[] = [];
  types: IType[] = [];

  susepForm = new FormGroup({
    company: new FormControl(''),
    type: new FormControl(''),
    start: new FormControl<Date | undefined>(undefined),
    end: new FormControl<Date | undefined>(undefined),
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<{
        companies: ICompany[];
        types: IType[];
      }>(this.baseUrl)
      .subscribe({
        next: (data) => {
          this.companies = data.companies;
          this.types = data.types;
        },
      });
  }

  onSubmit() {
    console.log(this.susepForm.value);

    this.hasData = false;
    this.onHttp = true;

    const data = this.susepForm.value;

    if (
      data.start == undefined ||
      data.end == undefined ||
      data.type == undefined ||
      data.company == undefined
    )
      return;

    let count = this.monthsBetweenDates(data.start, data.end);

    this.getReports(data.company, data.start, data.end, data.type);
  }
  getNextReport(
    company: string,
    start: Date,
    type: string,
    count: number,
    results: IResult[]
  ) {
    const month = `${start?.getFullYear()}${(
      '0' +
      (start.getMonth() + 1)
    ).slice(-2)}`;

    this.http.post(this.baseUrl, { company, month, type }).subscribe({
      next: (result) => {
        results.push({ month, values: <IValues[]>result });
        console.log(results);
      },
      error: console.log,
      complete: () => {
        count--;

        if (count === 0) {
          this.onHttp = false;
          this.table = this.transformData(results);
        } else {
          const newStart = new Date(start);
          newStart.setMonth(newStart.getMonth() + 1);
          this.getNextReport(company, newStart, type, count, results);
        }
      },
    });
  }
  getReports(company: string, start: Date, end: Date, type: string) {
    const count = this.monthsBetweenDates(start, end) + 1;
    const results: IResult[] = <IResult[]>[];

    this.getNextReport(company, start, type, count, results);
  }

  monthsBetweenDates(start: Date, end: Date) {
    // Ensure dates are valid Date objects
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new Error('Invalid input: Both arguments must be Date objects.');
    }

    // Order dates to ensure end is later than start
    if (end < start) {
      [start, end] = [end, start]; // Swap dates using destructuring
    }

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();

    return months <= 0 ? 0 : months; // Return 0 if the difference is negative or zero
  }

  //Code from gemini :)
  transformData(result: IResult[]) {
    if (!result || result.length === 0) {
      return { months: [], names: [], data: [] };
    }

    const months = result.map((item) => item.month);
    // Get all names in their original order, including possible duplicates
    const allNamesWithDuplicates = result.flatMap((item) =>
      item.values.map((val) => val.name)
    );

    // Use a map to preserve order while removing duplicates and handling missing names
    const namesMap = new Map();
    allNamesWithDuplicates.forEach((name) => {
      if (name !== undefined) {
        namesMap.set(name, true);
      }
    });
    const names = Array.from(namesMap.keys());

    const data = names.map((name) => {
      const row: { [key: string]: string } = { name };
      months.forEach((month) => {
        const monthData = result.find((item) => item.month === month);

        if (monthData && monthData.values) {
          // Check if values exist
          const nameValue = monthData.values.find((val) => val.name === name);
          row[month] = nameValue ? nameValue.value : '0';
        } else {
          row[month] = '0'; //Default to 0 if monthData or monthData.values is missing
        }
      });
      return row;
    });

    console.log(data)
    return { months, names, data };
  }

  title = 'Susep Extractor';
}
