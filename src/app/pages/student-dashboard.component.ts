import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Student } from '../models';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {
  student?: Student;
  marks: Array<{ subjectName: string; code: string; score: number; maxMarks: number }> = [];

  constructor(
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly router: Router
  ) {
    this.loadData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadData(): void {
    const student = this.authService.getLoggedInStudent();
    if (!student) {
      return;
    }

    this.student = student;
    const marks = this.storageService.getMarks().filter((item) => item.studentId === student.id);
    const subjects = this.storageService.getSubjects();

    this.marks = marks.map((mark) => {
      const subject = subjects.find((item) => item.id === mark.subjectId);
      return {
        subjectName: subject?.name ?? 'Unknown',
        code: subject?.code ?? '-',
        score: mark.score,
        maxMarks: subject?.maxMarks ?? 0
      };
    });
  }
}
