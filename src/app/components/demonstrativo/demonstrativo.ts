import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DemonstrativoAPI } from '../../api/demonstrativo';
import { IEntity, IResult, IType } from '../../models/common.models';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { YEAR_FORMATS } from '../formats';

@Component({
    selector: 'demonstrativo-component',
    standalone: true,
    templateUrl: './demonstrativo.html',
    styleUrl: './demonstrativo.scss',
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: YEAR_FORMATS }
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
export class DemonstrativoComponent {
    susepForm = new FormGroup({
        entity: new FormControl('', Validators.required),
        type: new FormControl('', Validators.required),
        start: new FormControl(<Date | undefined>(undefined), Validators.required),
        end: new FormControl(<Date | undefined>(undefined), Validators.required),
    });

    hasData = false;
    onHttp = false;

    api = new DemonstrativoAPI();

    log: string[] = [];
    table: { [key: string]: string; }[] = [];

    entities: IEntity[] = [];
    types: IType[] = [];

    minDate: Date = new Date(2011, 0, 1);
    maxDate: Date = new Date(new Date().getFullYear() - 1, 11, 31);

    ngOnInit(): void {
        this.api.get()
            .subscribe({
                next: (data) => {
                    this.entities = data.entities
                    this.types = data.types
                },
                error: (error) => {
                    console.error('Error fetching initial data:', error);
                    this.log.push('Error fetching initial data.');
                },
            })
    }

    setYear(normalizedYear: Date, controlName: string, datepicker: MatDatepicker<any>) {
        const ctrlValue = this.susepForm.get(controlName)?.value || new Date();
        ctrlValue.setFullYear(normalizedYear.getFullYear());
        this.susepForm.get(controlName)?.setValue(ctrlValue);
        datepicker.close();
    }

    onSubmit() {
        if (this.susepForm.invalid) {
            this.log.push('Form is invalid. Please fill all required fields.');
            return;
        }

        this.hasData = false;
        this.onHttp = true;

        this.log = [];
        this.table = [];

        const data = this.susepForm.value;
        const start = data.start?.getFullYear();
        const end = data.end?.getFullYear();
        const entity = data.entity;
        const type = data.type;

        if (!start || !end || !type || !entity) {
            this.onHttp = false;
            this.log.push('Missing form data.');
            return;
        }

        if (start > end) {
            this.onHttp = false;
            this.log.push('Start date cannot be after end date.');
            return;
        }

        const links = this.generateLinks(entity, start, end, type);
    }

    generateLinks(entity: string, start: number, end: number, type: string) {
        const links: string[] = [];
        for (let year = start; year <= end; year++) {
            const link = `https://www2.susep.gov.br/download/comoc/${entity}-${type}-${year}${type === 'IN' ? '12' : '06'}.pdf`;
            this.log.push(`Generating link for ${entity} ${type} ${year}: ${link}`);
            links.push(link);
        }
        return links;
    }

}