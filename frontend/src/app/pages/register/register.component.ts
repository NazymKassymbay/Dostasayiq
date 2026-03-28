import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrap">
      <div class="auth-visual">
        <div class="auth-visual-inner">
          <div class="big-emoji">🤝</div>
          <h1>Join Dostasayiq</h1>
          <p>Find your perfect partner for projects, studies, sports and more</p>
          <div class="features">
            <div class="feat-item">✨ Post what you're looking for</div>
            <div class="feat-item">🔍 Discover like-minded people</div>
            <div class="feat-item">💬 Chat directly</div>
            <div class="feat-item">🤖 AI-powered matching</div>
          </div>
        </div>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create account</h2>
            <p>Start your journey today</p>
          </div>

          @if (step === 1) {
            <div class="age-check">
              <div class="age-icon">🎂</div>
              <h3>Are you 18 or older?</h3>
              <p>This platform is for adults only (18+)</p>
              <div class="age-btns">
                <button class="age-btn age-yes" (click)="confirmAge(true)">
                  ✅ Yes, I'm 18+
                </button>
                <button class="age-btn age-no" (click)="confirmAge(false)">
                  ❌ No, I'm under 18
                </button>
              </div>
            </div>
          }

          @if (step === 'denied') {
            <div class="denied-msg">
              <div style="font-size:3rem;text-align:center;margin-bottom:16px">🚫</div>
              <h3>Access Restricted</h3>
              <p>Sorry, you must be 18 or older to use Dostasayiq.</p>
              <a routerLink="/login" class="btn-primary w-full" style="display:block;text-align:center;margin-top:16px;">Back to Login</a>
            </div>
          }

          @if (step === 2) {
            <div class="form-group">
              <label>Username</label>
              <input [(ngModel)]="username" type="text" placeholder="Choose a username" autocomplete="username" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input [(ngModel)]="email" type="email" placeholder="your@email.com" autocomplete="email" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="pass-wrap">
                <input [(ngModel)]="password" [type]="showPass ? 'text' : 'password'" placeholder="Min 6 characters" autocomplete="new-password" />
                <button type="button" class="pass-toggle" (click)="showPass = !showPass">{{ showPass ? '🙈' : '👁️' }}</button>
              </div>
            </div>

            @if (error) { <div class="error-msg">{{ error }}</div> }
            @if (success) { <div class="success-msg">✓ Account created! Redirecting...</div> }

            <button class="btn-primary w-full" (click)="onRegister()" [disabled]="loading">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>

            <div class="auth-footer">
              Already have an account? <a routerLink="/login">Sign in</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { display: flex; min-height: calc(100vh - 64px); margin: -32px -24px; }
    .auth-visual {
      flex: 1; background: var(--gradient);
      display: flex; align-items: center; justify-content: center;
      padding: 48px; color: white;
    }
    @media (max-width: 768px) { .auth-visual { display: none; } }
    .auth-visual-inner { max-width: 360px; }
    .big-emoji { font-size: 4rem; margin-bottom: 20px; }
    .auth-visual h1 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
    .auth-visual p { font-size: 1rem; opacity: 0.85; margin-bottom: 32px; line-height: 1.6; }
    .features { display: flex; flex-direction: column; gap: 10px; }
    .feat-item { padding: 10px 16px; background: rgba(255,255,255,0.15); border-radius: 10px; font-size: 0.9rem; font-weight: 500; }
    .auth-form-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-header { margin-bottom: 28px; }
    .auth-header h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
    .auth-header p { color: var(--text2); }
    .age-check { text-align: center; padding: 20px 0; }
    .age-icon { font-size: 3rem; margin-bottom: 16px; }
    .age-check h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
    .age-check p { color: var(--text2); margin-bottom: 28px; }
    .age-btns { display: flex; flex-direction: column; gap: 12px; }
    .age-btn { padding: 14px; border-radius: 12px; font-size: 1rem; font-weight: 600; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
    .age-yes { background: #f0fdf4; color: var(--success); border-color: var(--success); }
    .age-yes:hover { background: var(--success); color: white; }
    .age-no { background: #fef2f2; color: var(--danger); border-color: var(--danger); }
    .age-no:hover { background: var(--danger); color: white; }
    .denied-msg { text-align: center; padding: 20px 0; }
    .denied-msg h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
    .denied-msg p { color: var(--text2); }
    .pass-wrap { position: relative; }
    .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; width: auto; }
    .w-full { width: 100%; margin-top: 4px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.88rem; color: var(--text2); }
  `],
})
export class RegisterComponent {
  step: number | 'denied' = 1;
  username = ''; email = ''; password = '';
  error = ''; success = false; loading = false;
  showPass = false;

  constructor(private api: ApiService, private router: Router) {}

  confirmAge(isAdult: boolean): void {
    if (isAdult) this.step = 2;
    else this.step = 'denied';
  }

  onRegister(): void {
    if (!this.username || !this.email || !this.password) { this.error = 'Please fill all fields'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters'; return; }
    if (!this.email.includes('@')) { this.error = 'Please enter a valid email'; return; }
    this.loading = true; this.error = '';
    this.api.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        this.success = true;
        setTimeout(() => this.router.navigate(['/posts']), 900);
      },
      error: (err) => {
        const e = err.error;
        this.error = e?.username?.[0] || e?.email?.[0] || e?.password?.[0] || e?.detail || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
