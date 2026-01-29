import { Routes } from '@angular/router';
import { 
  ResseguroComponent, // Ajustado de Compoenent para Component
  SeguroComponent, 
  DemonstrativoComponent 
} from './components/';

export const routes: Routes = [
    // Redireciona a raiz (/) para /seguro automaticamente
    { path: '', redirectTo: 'demonstrativo', pathMatch: 'full' }, 
    
    { path: 'seguro', component: SeguroComponent },
    { path: 'resseguro', component: ResseguroComponent },
    { path: 'demonstrativo', component: DemonstrativoComponent },
    
    // Opcional: Rota de wildcard para evitar erros 404 caso o usuário digite algo errado
    { path: '**', redirectTo: 'seguro' }
];