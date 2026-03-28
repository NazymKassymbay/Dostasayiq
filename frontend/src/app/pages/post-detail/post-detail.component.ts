import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Post } from '../../services/api.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (loading) {
      <div class="loading"><div class="spinner"></div><span>Loading...</span></div>
    } @else if (post) {
      <div class="detail-wrap">
        <a routerLink="/posts" class="back-link">← Back to Feed</a>

        <div class="detail-grid">
          <div class="main-col">
            <div class="card detail-card">
              <div class="post-cat-badge" [style.background]="(post.category_color || '#6366f1') + '18'" [style.color]="post.category_color || '#6366f1'">
                {{ post.category_icon || '📁' }} {{ post.category_name || 'General' }}
              </div>

              @if (!editing) {
                <h1>{{ post.title }}</h1>
                <div class="meta-row">
                  @if (post.city) { <span class="meta-chip">📍 {{ post.city }}</span> }
                  @if (post.sphere) { <span class="meta-chip">🏢 {{ post.sphere }}</span> }
                  @if (post.level) { <span class="meta-chip">{{ getLevelEmoji(post.level) }} {{ post.level }}</span> }
                  @if (post.experience_required && post.experience_required !== 'any') {
                    <span class="meta-chip">👤 {{ post.experience_required }}</span>
                  }
                  <span class="meta-chip meta-time">📅 {{ post.created_at | date:'longDate' }}</span>
                </div>

                @if (post.stack) {
                  <div class="stack-section">
                    <label>Tech Stack / Skills</label>
                    <div class="stack-chips">
                      @for (s of getStack(post.stack); track s) {
                        <span class="chip">{{ s }}</span>
                      }
                    </div>
                  </div>
                }

                <div class="description-section">
                  <label>Description</label>
                  <p class="description">{{ post.description }}</p>
                </div>

                @if (isOwner()) {
                  <div class="owner-actions">
                    <button class="btn-secondary" (click)="startEdit()">✏️ Edit</button>
                    <button class="btn-danger" (click)="onDelete()">🗑️ Delete</button>
                  </div>
                }
              } @else {
                <h2 style="margin-bottom:20px;font-size:1.1rem;font-weight:700;">Edit Post</h2>
                <div class="form-group"><label>Title</label><input [(ngModel)]="editTitle" /></div>
                <div class="form-group"><label>Description</label><textarea [(ngModel)]="editDesc" rows="6"></textarea></div>
                <div class="form-row">
                  <div class="form-group"><label>City</label><input [(ngModel)]="editCity" /></div>
                  <div class="form-group"><label>Stack</label><input [(ngModel)]="editStack" /></div>
                </div>
                <div class="form-group"><label>Preferred Time</label><input [(ngModel)]="editTime" /></div>
                @if (editError) { <div class="error-msg">{{ editError }}</div> }
                <div class="edit-btns">
                  <button class="btn-primary" (click)="onSave()">Save Changes</button>
                  <button class="btn-secondary" (click)="editing = false">Cancel</button>
                </div>
              }
            </div>
          </div>

          <div class="side-col">
            <!-- Author card -->
            <div class="card author-card">
              <div class="author-top">
                <div class="avatar avatar-lg" [style.background]="post.author_avatar_color || '#6366f1'">{{ post.author_username.charAt(0).toUpperCase() }}</div>
                <div>
                  <a [routerLink]="['/profile', post.author_username]" class="author-name">{{ post.author_username }}</a>
                  @if (post.author_experience) { <div class="author-exp">{{ post.author_experience }}</div> }
                </div>
              </div>
              @if (post.author_bio) { <p class="author-bio">{{ post.author_bio }}</p> }

              @if (!isOwner()) {
                <div class="contact-actions">
                  @if (isLoggedIn()) {
                    <a [routerLink]="['/messages', post.author_username]" class="btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;">
                      💬 Send Message
                    </a>
                  } @else {
                    <a routerLink="/login" class="btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;">
                      🔑 Login to Message
                    </a>
                  }
                  <a [routerLink]="['/profile', post.author_username]" class="btn-secondary" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;">
                    👤 View Profile
                  </a>
                </div>
              }
            </div>

            <!-- Like card -->
            <div class="card like-card">
              @if (isLoggedIn()) {
                <button class="like-big-btn" [class.liked]="post.is_liked" (click)="toggleLike()">
                  {{ post.is_liked ? '❤️' : '🤍' }}
                  <span>{{ post.is_liked ? 'Liked' : 'Interested' }}</span>
                </button>
              }
              <div class="like-count">{{ post.likes_count }} {{ post.likes_count === 1 ? 'person' : 'people' }} interested</div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-wrap { max-width: 900px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 16px; color: var(--text2); font-size: 0.88rem; text-decoration: none; }
    .back-link:hover { color: var(--primary); }
    .detail-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
    .detail-card { padding: 28px; }
    .post-cat-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin-bottom: 14px; }
    h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 14px; line-height: 1.3; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .meta-chip { padding: 5px 12px; background: var(--surface2); border-radius: 20px; font-size: 0.78rem; font-weight: 500; color: var(--text2); border: 1px solid var(--border); }
    .meta-time { color: var(--text3); }
    .stack-section { margin-bottom: 20px; }
    .stack-section label, .description-section label { font-size: 0.78rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 10px; }
    .stack-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .description { color: var(--text2); line-height: 1.8; font-size: 0.97rem; white-space: pre-wrap; }
    .description-section { margin-bottom: 24px; }
    .owner-actions { display: flex; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .edit-btns { display: flex; gap: 10px; margin-top: 16px; }

    .author-card { padding: 22px; margin-bottom: 14px; }
    .author-top { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
    .author-name { font-size: 1rem; font-weight: 700; color: var(--text); text-decoration: none; display: block; }
    .author-name:hover { color: var(--primary); }
    .author-exp { font-size: 0.78rem; color: var(--text3); margin-top: 3px; text-transform: capitalize; }
    .author-bio { font-size: 0.85rem; color: var(--text2); line-height: 1.6; margin-bottom: 16px; }
    .contact-actions { display: flex; flex-direction: column; gap: 8px; }

    .like-card { padding: 18px; text-align: center; }
    .like-big-btn { width: 100%; padding: 14px; border-radius: 12px; border: 2px solid var(--border); background: var(--surface2); font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; margin-bottom: 10px; }
    .like-big-btn:hover { border-color: var(--danger); background: #fef2f2; }
    .like-big-btn.liked { background: #fef2f2; border-color: var(--danger); color: var(--danger); }
    .like-count { font-size: 0.82rem; color: var(--text3); }
  `],
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null; loading = true; editing = false;
  editTitle = ''; editDesc = ''; editCity = ''; editTime = ''; editStack = ''; editError = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPost(id).subscribe({
      next: (p) => { this.post = p; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/posts']); },
    });
  }

  isOwner(): boolean { return localStorage.getItem('username') === this.post?.author_username; }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  getStack(s: string): string[] { return s.split(',').map(x => x.trim()).filter(Boolean); }
  getLevelEmoji(l: string): string { return { idea: '💡', mvp: '🚀', startup: '🏢' }[l] || ''; }

  startEdit(): void {
    if (!this.post) return;
    this.editTitle = this.post.title; this.editDesc = this.post.description;
    this.editCity = this.post.city; this.editTime = this.post.preferred_time;
    this.editStack = this.post.stack; this.editing = true;
  }

  onSave(): void {
    if (!this.post) return;
    this.api.updatePost(this.post.id, { title: this.editTitle, description: this.editDesc, city: this.editCity, preferred_time: this.editTime, stack: this.editStack }).subscribe({
      next: (p) => { this.post = p; this.editing = false; },
      error: () => this.editError = 'Failed to update post',
    });
  }

  onDelete(): void {
    if (!this.post || !confirm('Delete this post?')) return;
    this.api.deletePost(this.post.id).subscribe({ next: () => this.router.navigate(['/posts']) });
  }

  toggleLike(): void {
    if (!this.post) return;
    this.api.toggleLike(this.post.id).subscribe({ next: r => { if (this.post) { this.post.is_liked = r.liked; this.post.likes_count = r.likes_count; } } });
  }
}
