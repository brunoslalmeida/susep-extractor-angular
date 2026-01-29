import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DemonstrativoAPI } from '../../api/demonstrativo';
import { IEntity, IType } from '../../models/common.models';
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
    table: { [key: string]: string; }[] | null = null;

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
        throw new Error('Method not implemented.');
    }
}