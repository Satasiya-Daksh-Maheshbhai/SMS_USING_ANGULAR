export type UserRole = 'admin' | 'student';

export interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  password: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  score: number;
}

export interface AdminAccount {
  username: string;
  password: string;
}

export interface PortalData {
  admin: AdminAccount;
  students: Student[];
  subjects: Subject[];
  marks: Mark[];
}

export interface SessionUser {
  role: UserRole;
  userId: string;
  displayName: string;
}
