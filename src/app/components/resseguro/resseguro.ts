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

    table: {[key: string]: string;}[] | null = null;
    
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

    transformData(results: IResult[]): {[key: string]: string;}[] {
        const data: { [key: string]: string }[] = [];
        
        if (!results || results.length === 0) {
            return data;
        }

        for (const result of results) {
            for (const [index, value] of result.values.entries()) {
                if (value.value === null || value.value === undefined) continue;
                
                const row: { [key: string]: string } = data[index] || {};                
                row[result.month + ' - Value'] = value.value;
                row[result.month + ' - Category'] = value.name;

                data[index] = row;
            }
        }

        return data ;
    }

    exportToExcel() {
        if (!this.table) return;

            // Find the correct type name from this.types
    const selectedType = this.types.find(type => type.code === this.susepForm.value.type);
    const typeName = selectedType ? selectedType.value : 'Unknown Type';

        // Add a metadata row with requested information
        const metadataRow = {
            'Requested Company': this.susepForm.value.company ,
            'Requested Type': typeName ,
            'Start Date': this.susepForm.value.start ? `${this.susepForm.value.start?.getFullYear()}${('0' + (this.susepForm.value.start?.getMonth() + 1)).slice(
                -2
            )}` : '',
            'End Date': this.susepForm.value.end ? `${this.susepForm.value.end?.getFullYear()}${('0' + (this.susepForm.value.end?.getMonth() + 1)).slice(
                -2
            )}` : '' ,
        };

        // Combine metadata, empty rows, and the table data
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.table);
        const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet([metadataRow]);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.utils.book_append_sheet(wb, ws2, 'Metadata');
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        XLSX.writeFile(wb, `report_resseguro_${timestamp}.xlsx`);
    }

}


