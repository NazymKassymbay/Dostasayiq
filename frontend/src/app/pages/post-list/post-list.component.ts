import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Post, Category } from '../../services/api.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Hero -->
    <div class="hero">
      <div class="hero-content">
        <h1>Find Your Perfect <span class="gradient-text">Partner</span> 🔍</h1>
        <p>Browse posts from people looking for study, project, sport and other partners</p>
        <div class="hero-search">
          <input [(ngModel)]="searchQ" placeholder="Search by title, description or tech stack..." (keyup.enter)="onSearch()" />
          <button class="btn-primary" (click)="onSearch()">Search</button>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="categories-bar">
      <button class="cat-pill" [class.active]="!activeCategory" (click)="selectCategory(null)">
        🌐 All
      </button>
      @for (cat of categories; track cat.id) {
        <button class="cat-pill" [class.active]="activeCategory === cat.id" (click)="selectCategory(cat.id)" [style.--cat-color]="cat.color">
          {{ cat.icon }} {{ cat.name }}
        </button>
      }
    </div>

    <!-- Advanced filters -->
    <div class="filters-row">
      <div class="filter-group">
        <label>City</label>
        <select [(ngModel)]="searchCity" (change)="onSearch()">
          <option value="">All cities</option>
          <option value="Almaty">📍 Almaty</option>
          <option value="Astana">📍 Astana</option>
          <option value="Remote">🌐 Remote</option>
          <option value="Shymkent">📍 Shymkent</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sphere</label>
        <select [(ngModel)]="searchSphere" (change)="onSearch()">
          <option value="">All spheres</option>
          <option value="fintech">💰 Fintech</option>
          <option value="edtech">📚 EdTech</option>
          <option value="gamedev">🎮 GameDev</option>
          <option value="healthcare">🏥 Healthcare</option>
          <option value="ecommerce">🛒 E-Commerce</option>
          <option value="social">🌐 Social</option>
          <option value="other">💡 Other</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Experience</label>
        <select [(ngModel)]="searchExp" (change)="onSearch()">
          <option value="">Any level</option>
          <option value="junior">🌱 Junior</option>
          <option value="middle">🌿 Middle</option>
          <option value="senior">🌳 Senior</option>
        </select>
      </div>
      @if (hasFilters()) {
        <button class="btn-clear" (click)="onClear()">✕ Clear</button>
      }
    </div>

    <!-- Recommended section (if logged in) -->
    @if (isLoggedIn() && recommended.length > 0) {
      <div class="section-header">
        <h2>🤖 Recommended for you</h2>
        <span class="section-sub">Based on your profile</span>
      </div>
      <div class="posts-scroll">
        @for (post of recommended; track post.id) {
          <ng-container *ngTemplateOutlet="postCardTpl; context: { post: post, compact: true }"></ng-container>
        }
      </div>
    }

    <!-- Main feed -->
    <div class="section-header">
      <h2>{{ activeCategory ? getCategoryName() : '🔥 All Posts' }}</h2>
      <span class="section-sub">{{ posts.length }} posts found</span>
    </div>

    @if (loading) {
      <div class="loading"><div class="spinner"></div><span>Loading posts...</span></div>
    } @else if (posts.length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No posts found</h3>
        <p>Try changing filters or <a routerLink="/create">be the first to post!</a></p>
      </div>
    } @else {
      <div class="posts-grid">
        @for (post of posts; track post.id) {
          <ng-container *ngTemplateOutlet="postCardTpl; context: { post: post, compact: false }"></ng-container>
        }
      </div>
    }

    <!-- Post card template -->
    <ng-template #postCardTpl let-post="post" let-compact="compact">
      <div class="post-card" [class.compact]="compact">
        <a [routerLink]="['/posts', post.id]" class="post-card-link">
          <div class="post-top">
            <div class="post-cat-badge" [style.background]="(post.category_color || '#6366f1') + '18'" [style.color]="post.category_color || '#6366f1'">
              {{ post.category_icon || '📁' }} {{ post.category_name || 'General' }}
            </div>
            <span class="post-time">{{ getTimeAgo(post.created_at) }}</span>
          </div>
          <h3>{{ post.title }}</h3>
          <p class="post-desc">{{ post.description.slice(0, compact ? 80 : 140) }}{{ post.description.length > (compact ? 80 : 140) ? '...' : '' }}</p>
          @if (post.stack && !compact) {
            <div class="stack-chips">
              @for (s of getStack(post.stack); track s) {
                <span class="chip">{{ s }}</span>
              }
            </div>
          }
        </a>
        <div class="post-footer">
          <div class="post-author">
            <div class="avatar avatar-sm" [style.background]="post.author_avatar_color || '#6366f1'">{{ post.author_username.charAt(0).toUpperCase() }}</div>
            <a [routerLink]="['/profile', post.author_username]" class="author-name">{{ post.author_username }}</a>
            @if (post.city) { <span class="post-meta-item">📍 {{ post.city }}</span> }
          </div>
          <div class="post-actions">
            @if (isLoggedIn()) {
              <button class="like-btn" [class.liked]="post.is_liked" (click)="toggleLike($event, post)">
                {{ post.is_liked ? '❤️' : '🤍' }} {{ post.likes_count }}
              </button>
            } @else {
              <span class="like-count">🤍 {{ post.likes_count }}</span>
            }
            @if (isLoggedIn() && post.author_username !== currentUser) {
              <a [routerLink]="['/messages', post.author_username]" class="msg-btn" (click)="$event.stopPropagation()">
                💬
              </a>
            }
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .hero {
      background: var(--gradient);
      border-radius: 24px;
      padding: 48px 40px;
      margin-bottom: 28px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -50%; right: -10%;
      width: 400px; height: 400px;
      background: rgba(255,255,255,0.08); border-radius: 50%;
    }
    .hero-content { position: relative; z-index: 1; max-width: 600px; }
    .hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; line-height: 1.2; }
    .hero p { opacity: 0.85; margin-bottom: 24px; font-size: 1.05rem; }
    .gradient-text { background: rgba(255,255,255,0.9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-search { display: flex; gap: 10px; }
    .hero-search input { flex: 1; background: rgba(255,255,255,0.95); border: none; color: var(--text); }
    .hero-search .btn-primary { background: white; color: var(--primary); box-shadow: none; white-space: nowrap; }
    .hero-search .btn-primary:hover { background: var(--primary-light); }

    .categories-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .cat-pill {
      padding: 7px 16px; border-radius: 20px;
      background: var(--surface); border: 1.5px solid var(--border);
      font-size: 0.82rem; font-weight: 500; color: var(--text2);
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .cat-pill:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .cat-pill.active { background: var(--cat-color, var(--primary)); color: white; border-color: transparent; }

    .filters-row {
      display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;
      padding: 16px 20px; background: var(--surface); border-radius: 14px;
      border: 1px solid var(--border); margin-bottom: 28px;
    }
    .filter-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
    .filter-group label { font-size: 0.78rem; font-weight: 600; color: var(--text2); }
    .filter-group select { padding: 9px 12px; font-size: 0.85rem; }
    .btn-clear { padding: 9px 16px; background: #fef2f2; color: var(--danger); border: 1.5px solid #fecaca; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; align-self: flex-end; }
    .btn-clear:hover { background: var(--danger); color: white; }

    .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px; }
    .section-header h2 { font-size: 1.15rem; font-weight: 700; }
    .section-sub { font-size: 0.82rem; color: var(--text3); }

    .posts-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 32px; }
    .posts-scroll::-webkit-scrollbar { height: 4px; }
    .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

    .post-card {
      background: var(--surface); border-radius: 16px;
      border: 1.5px solid var(--border); overflow: hidden;
      transition: all 0.2s; display: flex; flex-direction: column;
    }
    .post-card.compact { min-width: 240px; max-width: 260px; flex-shrink: 0; }
    .post-card:hover { border-color: var(--primary); box-shadow: 0 4px 20px rgba(99,102,241,0.12); transform: translateY(-2px); }
    .post-card-link { display: block; padding: 18px 18px 12px; text-decoration: none; color: inherit; flex: 1; }
    .post-card-link:hover { text-decoration: none; }
    .post-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .post-cat-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.73rem; font-weight: 600; }
    .post-time { font-size: 0.72rem; color: var(--text3); }
    .post-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 7px; color: var(--text); line-height: 1.4; }
    .post-desc { font-size: 0.83rem; color: var(--text2); line-height: 1.55; margin-bottom: 10px; }
    .stack-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
    .post-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 18px; border-top: 1px solid var(--border);
      background: var(--surface2);
    }
    .post-author { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .author-name { font-size: 0.8rem; font-weight: 600; color: var(--text2); text-decoration: none; white-space: nowrap; }
    .author-name:hover { color: var(--primary); text-decoration: none; }
    .post-meta-item { font-size: 0.75rem; color: var(--text3); white-space: nowrap; }
    .post-actions { display: flex; align-items: center; gap: 6px; }
    .like-btn { background: none; border: none; cursor: pointer; font-size: 0.82rem; padding: 4px 8px; border-radius: 8px; color: var(--text2); transition: all 0.15s; }
    .like-btn:hover { background: #fef2f2; color: var(--danger); }
    .like-btn.liked { color: var(--danger); }
    .like-count { font-size: 0.8rem; color: var(--text3); }
    .msg-btn { font-size: 1rem; padding: 4px 8px; border-radius: 8px; text-decoration: none; transition: all 0.15s; }
    .msg-btn:hover { background: var(--primary-light); text-decoration: none; }
    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
    .empty-state p { color: var(--text2); }
    @media (max-width: 640px) {
      .hero { padding: 32px 20px; }
      .hero h1 { font-size: 1.5rem; }
      .hero-search { flex-direction: column; }
    }
  `],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  recommended: Post[] = [];
  categories: Category[] = [];
  searchQ = ''; searchCity = ''; searchSphere = ''; searchExp = '';
  activeCategory: number | null = null;
  loading = true;
  currentUser = localStorage.getItem('username') || '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe(cats => this.categories = cats);
    this.loadPosts();
    if (this.isLoggedIn()) this.api.getRecommended().subscribe({ next: r => this.recommended = r, error: () => {} });
  }

  loadPosts(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchQ) filters.q = this.searchQ;
    if (this.searchCity) filters.city = this.searchCity;
    if (this.activeCategory) filters.category = this.activeCategory;
    if (this.searchSphere) filters.sphere = this.searchSphere;
    if (this.searchExp) filters.experience = this.searchExp;
    this.api.getPosts(filters).subscribe({
      next: (posts) => { this.posts = posts; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onSearch(): void { this.loadPosts(); }

  selectCategory(id: number | null): void {
    this.activeCategory = id;
    this.loadPosts();
  }

  onClear(): void {
    this.searchQ = ''; this.searchCity = ''; this.searchSphere = ''; this.searchExp = '';
    this.activeCategory = null;
    this.loadPosts();
  }

  hasFilters(): boolean { return !!(this.searchQ || this.searchCity || this.searchSphere || this.searchExp || this.activeCategory); }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  getCategoryName(): string { return this.categories.find(c => c.id === this.activeCategory)?.name || 'Posts'; }

  getStack(stack: string): string[] {
    return stack.split(',').map(s => s.trim()).filter(s => s).slice(0, 4);
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  toggleLike(event: Event, post: Post): void {
    event.preventDefault(); event.stopPropagation();
    this.api.toggleLike(post.id).subscribe({
      next: r => { post.is_liked = r.liked; post.likes_count = r.likes_count; },
    });
  }
}
