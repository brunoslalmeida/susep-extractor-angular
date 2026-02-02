import * as XLSX from 'xlsx';

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GenericSusepAPI } from '../../api';
import { ICompany, IResult, IType, IValues } from '../../models/common.models';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomYearMonthAdapter, YYYYMM_FORMATS } from '../formats';

@Component({
    selector: 'susep-component',
    standalone: true,
    templateUrl: './susep.html',
    styleUrl: './susep.scss',
    providers: [
        { provide: DateAdapter, useClass: CustomYearMonthAdapter },
        { provide: MAT_DATE_FORMATS, useValue: YYYYMM_FORMATS },
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        ReactiveFormsModule
    ]
})
export class SusepComponent implements OnInit {
    @Input() type: 'seguro' | 'resseguro' = 'seguro';

    api = new GenericSusepAPI(this.type)

    hasData = false;
    onHttp = false;

    log: string[] = [];

    table: { [key: string]: string; }[] | null = null;
    maxDate: Date = this.calculateMaxDate();

    private calculateMaxDate(): Date {
        const date = new Date();
        date.setMonth(date.getMonth() - 2);
        return date;
    }

    companies: ICompany[] = [];
    types: IType[] = [];

    susepForm = new FormGroup({
        company: new FormControl('', Validators.required),
        type: new FormControl('', Validators.required),
        start: new FormControl<Date | undefined>(undefined, Validators.required),
        end: new FormControl<Date | undefined>(undefined, Validators.required),
    });

    setMonthAndYear(normalizedMonthAndYear: Date, controlName: string, datepicker: any) {
        const ctrlValue = this.susepForm.get(controlName)?.value || new Date();
        ctrlValue.setFullYear(normalizedMonthAndYear.getFullYear());
        ctrlValue.setMonth(normalizedMonthAndYear.getMonth());

        this.susepForm.get(controlName)?.setValue(ctrlValue);
        datepicker.close();
    }

    get company_label() {
        return this.type === 'seguro' ? 'Empresas de Seguro Local' : 'Empresas de Resseguro Local'
    }

    ngOnInit(): void {
        this.api.get()
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

        this.susepForm.get('start')?.valueChanges.subscribe((start) => {
            const end = this.susepForm.get('end')?.value;
            if (start && end && start > end) {
                this.susepForm.get('end')?.setValue(new Date(start));
            }
        });

        this.susepForm.get('end')?.valueChanges.subscribe((end) => {
            const start = this.susepForm.get('start')?.value;
            if (start && end && end < start) {
                this.susepForm.get('start')?.setValue(new Date(end), { emitEvent: false });
            }
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
        this.table = null;

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
        const month = `${start.getFullYear()}${(
            '0' + (start.getMonth() + 1)
        ).slice(-2)}`;
        this.log.push(`Fetching report for ${month}`);

        this.api.post({ company, month, type }).subscribe({
            next: (result) => {
                results.push({ key: month, values: result });
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
                    this.table = this.api.transformData(results);
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

    public exportToExcel() {
        if (!this.table) return;

        const selectedType = this.types.find(
            (type) => type.code === this.susepForm.value.type
        );
        const typeName = selectedType ? selectedType.value : 'Unknown Type';

        const metadataTab = {
            'Requested Company': this.susepForm.value.company,
            'Requested Type': typeName,
            'Start Date': this.susepForm.value.start
                ? `${this.susepForm.value.start?.getFullYear()}${(
                    '0' + (this.susepForm.value.start?.getMonth() + 1)
                ).slice(-2)}`
                : '',
            'End Date': this.susepForm.value.end
                ? `${this.susepForm.value.end?.getFullYear()}${(
                    '0' + (this.susepForm.value.end?.getMonth() + 1)
                ).slice(-2)}`
                : '',
        };

        this.api.exportToExcel(
            typeName,
            this.table,
            metadataTab
        );
    }
}
