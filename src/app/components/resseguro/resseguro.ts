import { Component } from '@angular/core';
import { SusepComponent } from '../susep/susep';

@Component({
    selector: 'resseguro-component',
    standalone: true,
    template: '<susep-component type="resseguro"></susep-component>',
    imports: [SusepComponent]
})
export class ResseguroCompoenent { }