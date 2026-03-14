import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { LoginPageComponent } from './pages/login-page.component';
import { StudentDashboardComponent } from './pages/student-dashboard.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard('admin')]
  },
  {
    path: 'student',
    component: StudentDashboardComponent,
    canActivate: [authGuard, roleGuard('student')]
  },
  { path: '**', redirectTo: 'login' }
];
