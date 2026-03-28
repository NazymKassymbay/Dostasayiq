import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/posts" class="brand">
          <span class="brand-icon">🤝</span>
          <span class="brand-text">Dostasayiq</span>
        </a>

        <div class="nav-links">
          <a routerLink="/posts" class="nav-link">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Feed
          </a>
          @if (isLoggedIn()) {
            <a routerLink="/create" class="nav-link nav-create">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post
            </a>
            <a routerLink="/messages" class="nav-link nav-msg-link">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              @if (unreadCount > 0) { <span class="badge-dot">{{ unreadCount }}</span> }
              Messages
            </a>
            <a routerLink="/profile" class="nav-profile">
              <div class="nav-avatar" [style.background]="userColor">{{ getInitial() }}</div>
              <span class="nav-username">{{ getUsername() }}</span>
            </a>
            <button class="btn-logout" (click)="logout()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          } @else {
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/register" class="btn-nav-reg">Register</a>
          }
        </div>
      </div>
    </nav>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 64px;
    }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .brand-icon { font-size: 1.4rem; }
    .brand-text {
      font-size: 1.15rem; font-weight: 800; letter-spacing: -0.5px;
      background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .nav-links { display: flex; align-items: center; gap: 6px; }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 10px;
      color: var(--text2); font-size: 0.88rem; font-weight: 500;
      text-decoration: none; transition: all 0.15s;
    }
    .nav-link:hover { background: var(--surface2); color: var(--text); text-decoration: none; }
    .nav-msg-link { position: relative; }
    .badge-dot {
      background: var(--danger); color: white;
      font-size: 0.65rem; font-weight: 700;
      padding: 1px 5px; border-radius: 10px; min-width: 18px; text-align: center;
    }
    .nav-create {
      background: var(--gradient); color: white !important;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(99,102,241,0.3);
    }
    .nav-create:hover { opacity: 0.9; background: var(--gradient) !important; text-decoration: none; }
    .nav-profile {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px 5px 5px; border-radius: 25px;
      border: 1.5px solid var(--border);
      text-decoration: none; color: var(--text);
      transition: all 0.15s;
    }
    .nav-profile:hover { border-color: var(--primary); background: var(--primary-light); text-decoration: none; }
    .nav-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.78rem; color: white;
    }
    .nav-username { font-size: 0.85rem; font-weight: 600; }
    .btn-nav-reg {
      padding: 8px 18px; border-radius: 10px;
      background: var(--gradient); color: white;
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      border: none; box-shadow: 0 2px 8px rgba(99,102,241,0.3);
      text-decoration: none; transition: all 0.15s;
    }
    .btn-nav-reg:hover { opacity: 0.9; text-decoration: none; }
    .btn-logout {
      padding: 8px; border-radius: 10px; cursor: pointer;
      background: transparent; border: none; color: var(--text3);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .btn-logout:hover { background: #fef2f2; color: var(--danger); }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    @media (max-width: 640px) {
      .nav-inner { padding: 0 16px; }
      .container { padding: 20px 16px; }
      .nav-username { display: none; }
      .nav-link span:not(.badge-dot) { display: none; }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  userColor = '#6366f1';
  private interval: any;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (this.isLoggedIn()) this.loadUnread();
    });
    if (this.isLoggedIn()) {
      this.loadUnread();
      this.interval = setInterval(() => { if (this.isLoggedIn()) this.loadUnread(); }, 15000);
    }
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  loadUnread(): void {
    this.api.getUnreadCount().subscribe({ next: r => this.unreadCount = r.unread, error: () => {} });
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  getUsername(): string { return localStorage.getItem('username') || 'Profile'; }
  getInitial(): string { return (localStorage.getItem('username') || 'U').charAt(0).toUpperCase(); }

  logout(): void {
    this.api.logout().subscribe({
      complete: () => this.clearAndRedirect(),
      error: () => this.clearAndRedirect(),
    });
  }
  private clearAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.unreadCount = 0;
    this.router.navigate(['/login']);
  }
}
