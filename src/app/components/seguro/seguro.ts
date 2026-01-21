import { Component } from '@angular/core';
import { SusepComponent } from '../susep/susep';

@Component({
    selector: 'seguro-component',
    standalone: true,
    template: '<susep-component type="seguro"></susep-component>',
    imports: [SusepComponent]
})
export class SeguroCompoenent { }