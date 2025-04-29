import * as XLSX from 'xlsx';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';

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
    selector: 'resseguro-component',
    standalone: true,
    templateUrl: './resseguro.html',
    styleUrl: './resseguro.scss',
    imports: [
        CommonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        ReactiveFormsModule
    ]
})
export class ResseguroCompoenent implements OnInit {
    private baseUrl = 'https://susep-extractor.bruno-s-l-almeida.workers.dev/resseguro';

    hasData = false;
    onHttp = false;

    log: string[] = [];

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
        company: new FormControl('', Validators.required),
        type: new FormControl('', Validators.required),
        start: new FormControl<Date | undefined>(undefined, Validators.required),
        end: new FormControl<Date | undefined>(undefined, Validators.required),
    });

    constructor(private http: HttpClient) { }


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
                error: (error) => {
                    console.error('Error fetching initial data:', error);
                    this.log.push('Error fetching initial data.');
                },
            });
    }

    onSubmit(): void {
        if (this.susepForm.invalid) {
            this.log.push('Form is invalid. Please fill all required fields.');
            return;
        }

        this.hasData = false;
        this.onHttp = true;
        this.log = [];

        const data = this.susepForm.value;
        const start = data.start;
        const end = data.end;
        const company = data.company;
        const type = data.type;

        if (!start || !end || !type || !company) {
            this.onHttp = false;
            this.log.push('Missing form data.');
            return;
        }

        if (start > end) {
            this.onHttp = false;
            this.log.push('Start date cannot be after end date.');
            return;
        }

        this.getReports(company, start, end, type);
    }

    getNextReport(
        company: string,
        start: Date,
        type: string,
        count: number,
        results: IResult[]
    ) {
        const month = `${start.getFullYear()}${('0' + (start.getMonth() + 1)).slice(
            -2
        )}`;
        this.log.push(`Fetching report for ${month}`);

        this.http.post(this.baseUrl, { company, month, type }).subscribe({
            next: (result) => {
                results.push({ month, values: <IValues[]>result });
                console.log(results);
                this.log.push(`Report for ${month} fetched successfully`);
            },
            error: (error) => {
                console.error(`Error fetching report for ${month}:`, error);
                this.onHttp = false;
                this.log.push(`Error fetching report for ${month}`);
            },
            complete: () => {
                count--;

                if (count === 0) {
                    this.onHttp = false;
                    this.table = this.transformData(results);
                    this.log.push('All reports fetched successfully');
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
        const results: IResult[] = [];
        this.getNextReport(company, start, type, count, results);
    }

    monthsBetweenDates(start: Date, end: Date) {
        if (!(start instanceof Date) || !(end instanceof Date)) {
            throw new Error('Invalid input: Both arguments must be Date objects.');
        }

        if (end < start) {
            [start, end] = [end, start];
        }

        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += end.getMonth();

        return months <= 0 ? 0 : months;
    }

    transformData(result: IResult[]) {
        if (!result || result.length === 0) {
            return { months: [], names: [], data: [] };
        }

        const months = result.map((item) => item.month);
        const allNamesWithDuplicates = result.flatMap((item) =>
            item.values.map((val) => val.name)
        );

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
                    const nameValue = monthData.values.find((val) => val.name === name);
                    row[month] = nameValue ? nameValue.value : '0';
                } else {
                    row[month] = '0';
                }
            });
            return row;
        });

        console.log(data);
        return { months, names, data };
    }

    exportToExcel(): void {
        if (!this.table) return;
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.table.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, 'report.xlsx');
    }

}