import { Injectable } from '@angular/core';
import { Mark, PortalData, Student, Subject } from '../models';

const STORAGE_KEY = 'student-portal-data-v1';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly defaultData: PortalData = {
    admin: {
      username: 'admin',
      password: 'admin123'
    },
    students: [
      {
        id: this.createId(),
        name: 'Aarav Singh',
        email: 'aarav@student.com',
        className: '10-A',
        password: 'stud123'
      }
    ],
    subjects: [
      {
        id: this.createId(),
        name: 'Mathematics',
        code: 'MATH101',
        maxMarks: 100
      }
    ],
    marks: []
  };

  constructor() {
    this.ensureSeedData();
  }

  getData(): PortalData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return this.defaultData;
    }

    try {
      const parsed = JSON.parse(raw) as PortalData;
      return {
        admin: parsed.admin,
        students: parsed.students ?? [],
        subjects: parsed.subjects ?? [],
        marks: parsed.marks ?? []
      };
    } catch {
      return this.defaultData;
    }
  }

  saveData(data: PortalData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getStudents(): Student[] {
    return this.getData().students;
  }

  saveStudents(students: Student[]): void {
    const data = this.getData();
    data.students = students;
    this.saveData(data);
  }

  getSubjects(): Subject[] {
    return this.getData().subjects;
  }

  saveSubjects(subjects: Subject[]): void {
    const data = this.getData();
    data.subjects = subjects;
    this.saveData(data);
  }

  getMarks(): Mark[] {
    return this.getData().marks;
  }

  saveMarks(marks: Mark[]): void {
    const data = this.getData();
    data.marks = marks;
    this.saveData(data);
  }

  updateAdminPassword(password: string): void {
    const data = this.getData();
    data.admin.password = password;
    this.saveData(data);
  }

  private ensureSeedData(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.saveData(this.defaultData);
    }
  }

  createId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}
