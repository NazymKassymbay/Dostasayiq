import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, Category } from '../../services/api.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="create-wrap">
      <div class="page-header">
        <a routerLink="/posts" class="back-link">← Back to Feed</a>
        <h1>Create a Post ✍️</h1>
        <p>Tell the community what kind of partner you're looking for</p>
      </div>

      <div class="form-layout">
        <div class="card form-card">
          <div class="form-section">
            <div class="section-title">📝 Basic Info</div>
            <div class="form-group">
              <label>Post Title *</label>
              <input [(ngModel)]="title" placeholder="e.g. Looking for a co-founder for AI startup" />
            </div>
            <div class="form-group">
              <label>Category *</label>
              <div class="cat-grid">
                @for (cat of categories; track cat.id) {
                  <button type="button" class="cat-card" [class.selected]="categoryId === cat.id" (click)="categoryId = cat.id" [style.--c]="cat.color">
                    <span class="cat-card-icon">{{ cat.icon }}</span>
                    <span class="cat-card-name">{{ cat.name }}</span>
                  </button>
                }
              </div>
            </div>
            <div class="form-group">
              <label>Description *</label>
              <textarea [(ngModel)]="description" rows="5" placeholder="Describe your project/goal, what kind of partner you need, what you'll do together..."></textarea>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-section">
            <div class="section-title">🛠️ Project Details</div>
            <div class="form-row">
              <div class="form-group">
                <label>Tech Stack / Skills</label>
                <input [(ngModel)]="stack" placeholder="e.g. React, Node.js, Python" />
                <span class="hint">Separate with commas</span>
              </div>
              <div class="form-group">
                <label>Project Level</label>
                <select [(ngModel)]="level">
                  <option value="">Select level</option>
                  <option value="idea">💡 Idea stage</option>
                  <option value="mvp">🚀 MVP stage</option>
                  <option value="startup">🏢 Startup</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Sphere</label>
                <select [(ngModel)]="sphere">
                  <option value="">Any sphere</option>
                  <option value="fintech">💰 Fintech</option>
                  <option value="edtech">📚 EdTech</option>
                  <option value="gamedev">🎮 GameDev</option>
                  <option value="healthcare">🏥 Healthcare</option>
                  <option value="ecommerce">🛒 E-Commerce</option>
                  <option value="social">🌐 Social</option>
                  <option value="other">💡 Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Experience Required</label>
                <select [(ngModel)]="experienceRequired">
                  <option value="any">Any level</option>
                  <option value="junior">🌱 Junior</option>
                  <option value="middle">🌿 Middle</option>
                  <option value="senior">🌳 Senior</option>
                </select>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-section">
            <div class="section-title">📍 Location & Time</div>
            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <select [(ngModel)]="city">
                  <option value="">Select city</option>
                  <option value="Almaty">📍 Almaty</option>
                  <option value="Astana">📍 Astana</option>
                  <option value="Remote">🌐 Remote</option>
                  <option value="Shymkent">📍 Shymkent</option>
                  <option value="Other">🗺️ Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Preferred Time</label>
                <input [(ngModel)]="preferredTime" placeholder="e.g. Evenings, Weekends" />
              </div>
            </div>
          </div>

          @if (error) { <div class="error-msg">{{ error }}</div> }
          @if (success) { <div class="success-msg">✓ Post created! Redirecting to feed...</div> }

          <div class="form-actions">
            <button class="btn-primary" (click)="onCreate()" [disabled]="loading" style="min-width:160px;">
              {{ loading ? 'Publishing...' : '🚀 Publish Post' }}
            </button>
            <a routerLink="/posts" class="btn-secondary" style="display:inline-flex;align-items:center;padding:11px 22px;text-decoration:none;">Cancel</a>
          </div>
        </div>

        <!-- Tips sidebar -->
        <div class="tips-card card">
          <h3>💡 Tips for a great post</h3>
          <div class="tip-list">
            <div class="tip-item">
              <span class="tip-num">1</span>
              <div>
                <strong>Be specific</strong>
                <p>Clear titles get more responses. Say exactly what you need.</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-num">2</span>
              <div>
                <strong>Mention your stack</strong>
                <p>Tech keywords help the right person find your post.</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-num">3</span>
              <div>
                <strong>Set your location</strong>
                <p>People prefer partners in the same city.</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-num">4</span>
              <div>
                <strong>Describe your vision</strong>
                <p>Share your goals so the right partner gets excited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-wrap { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .back-link { font-size: 0.85rem; color: var(--text2); text-decoration: none; display: inline-block; margin-bottom: 12px; }
    .back-link:hover { color: var(--primary); }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
    .page-header p { color: var(--text2); }
    .form-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
    @media (max-width: 768px) { .form-layout { grid-template-columns: 1fr; } .tips-card { display: none; } }
    .form-card { padding: 28px; }
    .form-section { margin-bottom: 4px; }
    .section-title { font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
    .divider { height: 1px; background: var(--border); margin: 24px 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }
    .hint { font-size: 0.75rem; color: var(--text3); margin-top: 4px; display: block; }
    .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; margin-bottom: 4px; }
    .cat-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 12px 8px; border-radius: 12px;
      background: var(--surface2); border: 1.5px solid var(--border);
      cursor: pointer; transition: all 0.15s;
    }
    .cat-card:hover { border-color: var(--c, var(--primary)); background: color-mix(in srgb, var(--c, var(--primary)) 10%, white); }
    .cat-card.selected { background: color-mix(in srgb, var(--c, var(--primary)) 15%, white); border-color: var(--c, var(--primary)); }
    .cat-card-icon { font-size: 1.3rem; }
    .cat-card-name { font-size: 0.72rem; font-weight: 600; color: var(--text2); }
    .form-actions { display: flex; gap: 12px; margin-top: 24px; }
    .tips-card { padding: 24px; height: fit-content; }
    .tips-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 20px; }
    .tip-list { display: flex; flex-direction: column; gap: 16px; }
    .tip-item { display: flex; gap: 12px; align-items: flex-start; }
    .tip-num { width: 24px; height: 24px; border-radius: 50%; background: var(--gradient); color: white; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tip-item strong { font-size: 0.85rem; display: block; margin-bottom: 2px; }
    .tip-item p { font-size: 0.78rem; color: var(--text2); line-height: 1.5; }
  `],
})
export class CreatePostComponent implements OnInit {
  title = ''; description = ''; city = ''; preferredTime = '';
  stack = ''; level = ''; sphere = ''; experienceRequired = 'any';
  categoryId: number | null = null;
  categories: Category[] = [];
  error = ''; success = false; loading = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe({ next: cats => this.categories = cats, error: () => {} });
  }

  onCreate(): void {
    if (!this.title.trim()) { this.error = 'Title is required'; return; }
    if (!this.description.trim()) { this.error = 'Description is required'; return; }
    this.loading = true; this.error = '';
    this.api.createPost({
      title: this.title, description: this.description,
      city: this.city, preferred_time: this.preferredTime,
      stack: this.stack, level: this.level, sphere: this.sphere,
      experience_required: this.experienceRequired,
      category: this.categoryId,
    }).subscribe({
      next: () => { this.success = true; setTimeout(() => this.router.navigate(['/posts']), 1000); },
      error: (err) => {
        const e = err.error;
        this.error = (typeof e === 'object' ? Object.values(e).flat().join(' ') : null) || 'Failed to create post. Please try again.';
        this.loading = false;
      },
    });
  }
}
