import { Routes } from '@angular/router';
import { SeguroCompoenent } from './components/seguro/seguro';
import { ResseguroCompoenent } from './components/resseguro/resseguro';

export const routes: Routes = [
    {
        path: 'seguro',
        component: SeguroCompoenent,
    },
    {
        path: 'resseguro',
        component: ResseguroCompoenent,
    },
    {
        path: '',
        redirectTo: 'seguro',
        pathMatch: 'full'
    }
];
