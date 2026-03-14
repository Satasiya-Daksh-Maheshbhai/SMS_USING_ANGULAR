import { Injectable, signal } from '@angular/core';
import { SessionUser, Student } from '../models';
import { StorageService } from './storage.service';

const SESSION_KEY = 'student-portal-session';
const COOKIE_NAME = 'student_portal_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<SessionUser | null>(null);

  constructor(private readonly storageService: StorageService) {
    this.restoreSession();
  }

  loginAsAdmin(username: string, password: string): boolean {
    const data = this.storageService.getData();
    if (data.admin.username !== username || data.admin.password !== password) {
      return false;
    }

    this.persistSession({
      role: 'admin',
      userId: 'admin',
      displayName: 'Administrator'
    });
    return true;
  }

  loginAsStudent(email: string, password: string): boolean {
    const student = this.storageService
      .getStudents()
      .find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

    if (!student) {
      return false;
    }

    this.persistSession({
      role: 'student',
      userId: student.id,
      displayName: student.name
    });
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    this.deleteCookie(COOKIE_NAME);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: 'admin' | 'student'): boolean {
    return this.currentUser()?.role === role;
  }

  getLoggedInStudent(): Student | undefined {
    const user = this.currentUser();
    if (!user || user.role !== 'student') {
      return undefined;
    }

    return this.storageService.getStudents().find((student) => student.id === user.userId);
  }

  private persistSession(user: SessionUser): void {
    const token = `${user.role}-${user.userId}-${Date.now()}`;
    this.currentUser.set(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.setCookie(COOKIE_NAME, token, 1);
  }

  private restoreSession(): void {
    const session = sessionStorage.getItem(SESSION_KEY);
    const hasCookie = this.getCookie(COOKIE_NAME);

    if (!session || !hasCookie) {
      this.logout();
      return;
    }

    try {
      const parsed = JSON.parse(session) as SessionUser;
      this.currentUser.set(parsed);
    } catch {
      this.logout();
    }
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const prefix = `${name}=`;
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));

    if (!cookie) {
      return null;
    }

    return decodeURIComponent(cookie.substring(prefix.length));
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
}
