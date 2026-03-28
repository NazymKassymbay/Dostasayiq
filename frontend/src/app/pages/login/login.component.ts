import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrap">
      <div class="auth-visual">
        <div class="auth-visual-inner">
          <div class="big-emoji">👋</div>
          <h1>Welcome back!</h1>
          <p>Sign in to connect with your partners, check messages and explore new opportunities.</p>
          <div class="stats">
            <div class="stat"><span class="stat-num">500+</span><span>Users</span></div>
            <div class="stat"><span class="stat-num">1200+</span><span>Posts</span></div>
            <div class="stat"><span class="stat-num">300+</span><span>Matches</span></div>
          </div>
        </div>
      </div>
      <div class="auth-form-wrap">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Sign in</h2>
            <p>Good to see you again</p>
          </div>
          <div class="form-group">
            <label>Username</label>
            <input [(ngModel)]="username" type="text" placeholder="Enter your username" autocomplete="username" (keyup.enter)="onLogin()" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="pass-wrap">
              <input [(ngModel)]="password" [type]="showPass ? 'text' : 'password'" placeholder="Enter your password" autocomplete="current-password" (keyup.enter)="onLogin()" />
              <button type="button" class="pass-toggle" (click)="showPass = !showPass">{{ showPass ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          @if (error) { <div class="error-msg">{{ error }}</div> }
          <button class="btn-primary w-full" (click)="onLogin()" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
          <div class="auth-footer">
            Don't have an account? <a routerLink="/register">Create one</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { display: flex; min-height: calc(100vh - 64px); margin: -32px -24px; }
    .auth-visual { flex: 1; background: var(--gradient); display: flex; align-items: center; justify-content: center; padding: 48px; color: white; }
    @media (max-width: 768px) { .auth-visual { display: none; } }
    .auth-visual-inner { max-width: 360px; }
    .big-emoji { font-size: 4rem; margin-bottom: 20px; }
    .auth-visual h1 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
    .auth-visual p { font-size: 1rem; opacity: 0.85; margin-bottom: 32px; line-height: 1.6; }
    .stats { display: flex; gap: 32px; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .stat-num { font-size: 1.6rem; font-weight: 800; }
    .stat span:last-child { font-size: 0.78rem; opacity: 0.75; }
    .auth-form-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-header { margin-bottom: 28px; }
    .auth-header h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
    .auth-header p { color: var(--text2); }
    .pass-wrap { position: relative; }
    .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; width: auto; }
    .w-full { width: 100%; margin-top: 4px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.88rem; color: var(--text2); }
  `],
})
export class LoginComponent {
  username = ''; password = '';
  error = ''; loading = false; showPass = false;

  constructor(private api: ApiService, private router: Router) {}

  onLogin(): void {
    if (!this.username || !this.password) { this.error = 'Please fill all fields'; return; }
    this.loading = true; this.error = '';
    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.detail || 'Invalid username or password';
        this.loading = false;
      },
    });
  }
}
