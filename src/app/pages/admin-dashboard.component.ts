import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Mark, Student, Subject } from '../models';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  private readonly fb = inject(FormBuilder);
  students: Student[] = [];
  subjects: Subject[] = [];
  marks: Mark[] = [];
  editingStudentId: string | null = null;
  activeTab: 'students' | 'subjects' | 'marks' = 'students';
  alert = '';

  readonly addStudentForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    className: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly editStudentForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    className: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly addSubjectForm = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    maxMarks: [100, [Validators.required, Validators.min(1), Validators.max(1000)]]
  });

  readonly marksForm = this.fb.group({
    studentId: ['', [Validators.required]],
    subjectId: ['', [Validators.required]],
    score: [0, [Validators.required, Validators.min(0), Validators.max(1000)]]
  });

  constructor(
    private readonly storageService: StorageService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loadAll();
  }

  setTab(tab: 'students' | 'subjects' | 'marks'): void {
    this.activeTab = tab;
  }

  addStudent(): void {
    if (this.addStudentForm.invalid) {
      this.addStudentForm.markAllAsTouched();
      return;
    }

    const values = this.addStudentForm.getRawValue();
    const email = (values.email ?? '').toLowerCase();

    if (this.students.some((student) => student.email.toLowerCase() === email)) {
      this.alert = 'A student with this email already exists.';
      return;
    }

    const next: Student = {
      id: this.storageService.createId(),
      name: values.name ?? '',
      email,
      className: values.className ?? '',
      password: values.password ?? ''
    };

    this.students = [next, ...this.students];
    this.storageService.saveStudents(this.students);
    this.addStudentForm.reset({
      name: '',
      email: '',
      className: '',
      password: ''
    });
    this.alert = 'Student added successfully.';
  }

  editStudent(student: Student): void {
    this.editingStudentId = student.id;
    this.editStudentForm.patchValue({
      name: student.name,
      email: student.email,
      className: student.className,
      password: student.password
    });
  }

  cancelEdit(): void {
    this.editingStudentId = null;
  }

  updateStudent(studentId: string): void {
    if (this.editStudentForm.invalid) {
      this.editStudentForm.markAllAsTouched();
      return;
    }

    const values = this.editStudentForm.getRawValue();
    const email = (values.email ?? '').toLowerCase();

    if (this.students.some((student) => student.id !== studentId && student.email.toLowerCase() === email)) {
      this.alert = 'Another student already uses this email.';
      return;
    }

    this.students = this.students.map((student) => {
      if (student.id !== studentId) {
        return student;
      }

      return {
        ...student,
        name: values.name ?? '',
        email,
        className: values.className ?? '',
        password: values.password ?? ''
      };
    });

    this.storageService.saveStudents(this.students);
    this.editingStudentId = null;
    this.alert = 'Student updated, including login password if changed.';
  }

  deleteStudent(studentId: string): void {
    this.students = this.students.filter((student) => student.id !== studentId);
    this.marks = this.marks.filter((mark) => mark.studentId !== studentId);
    this.storageService.saveStudents(this.students);
    this.storageService.saveMarks(this.marks);
    this.alert = 'Student removed successfully.';
  }

  addSubject(): void {
    if (this.addSubjectForm.invalid) {
      this.addSubjectForm.markAllAsTouched();
      return;
    }

    const values = this.addSubjectForm.getRawValue();
    const code = (values.code ?? '').toUpperCase();

    if (this.subjects.some((subject) => subject.code.toUpperCase() === code)) {
      this.alert = 'Subject code already exists.';
      return;
    }

    const next: Subject = {
      id: this.storageService.createId(),
      name: values.name ?? '',
      code,
      maxMarks: Number(values.maxMarks ?? 100)
    };

    this.subjects = [next, ...this.subjects];
    this.storageService.saveSubjects(this.subjects);
    this.addSubjectForm.reset({ maxMarks: 100 });
    this.alert = 'Subject added successfully.';
  }

  deleteSubject(subjectId: string): void {
    this.subjects = this.subjects.filter((subject) => subject.id !== subjectId);
    this.marks = this.marks.filter((mark) => mark.subjectId !== subjectId);
    this.storageService.saveSubjects(this.subjects);
    this.storageService.saveMarks(this.marks);
    this.alert = 'Subject removed and related marks cleared.';
  }

  saveMark(): void {
    if (this.marksForm.invalid) {
      this.marksForm.markAllAsTouched();
      return;
    }

    const values = this.marksForm.getRawValue();
    const subject = this.subjects.find((item) => item.id === values.subjectId);
    const score = Number(values.score ?? 0);

    if (!subject) {
      this.alert = 'Please select a valid subject.';
      return;
    }

    if (score > subject.maxMarks) {
      this.alert = `Marks cannot exceed ${subject.maxMarks} for ${subject.name}.`;
      return;
    }

    const existing = this.marks.find(
      (mark) => mark.studentId === values.studentId && mark.subjectId === values.subjectId
    );

    if (existing) {
      existing.score = score;
    } else {
      this.marks.push({
        id: this.storageService.createId(),
        studentId: values.studentId ?? '',
        subjectId: values.subjectId ?? '',
        score
      });
    }

    this.storageService.saveMarks(this.marks);
    this.alert = 'Marks saved successfully.';
    this.marksForm.reset({ score: 0, studentId: '', subjectId: '' });
  }

  getStudentMarks(studentId: string): Array<{ subjectName: string; score: number; maxMarks: number }> {
    return this.marks
      .filter((mark) => mark.studentId === studentId)
      .map((mark) => {
        const subject = this.subjects.find((item) => item.id === mark.subjectId);
        return {
          subjectName: subject?.name ?? 'Unknown',
          score: mark.score,
          maxMarks: subject?.maxMarks ?? 0
        };
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadAll(): void {
    this.students = this.storageService.getStudents();
    this.subjects = this.storageService.getSubjects();
    this.marks = this.storageService.getMarks();
  }
}


