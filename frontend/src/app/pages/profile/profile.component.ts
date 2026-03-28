import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService, Post, UserProfile } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (loading) {
      <div class="loading"><div class="spinner"></div><span>Loading profile...</span></div>
    } @else if (profileData) {
      <div class="profile-wrap">
        <!-- Cover & avatar -->
        <div class="profile-hero">
          <div class="cover-bg" [style.background]="'linear-gradient(135deg,' + (profileData.profile?.avatar_color || '#6366f1') + '99, ' + (profileData.profile?.avatar_color || '#6366f1') + ')'" ></div>
          <div class="profile-hero-content">
            <div class="avatar avatar-xl profile-avatar" [style.background]="profileData.profile?.avatar_color || '#6366f1'">
              {{ profileData.username.charAt(0).toUpperCase() }}
            </div>
            <div class="profile-info">
              <h1>{{ profileData.username }}</h1>
              @if (profileData.profile?.experience_level) {
                <span class="exp-badge">{{ getExpEmoji(profileData.profile.experience_level) }} {{ profileData.profile.experience_level | titlecase }}</span>
              }
              @if (profileData.profile?.looking_for) {
                <div class="looking-for">🔍 {{ profileData.profile.looking_for }}</div>
              }
            </div>
            @if (isOwnProfile()) {
              <button class="btn-edit" (click)="editing = !editing">{{ editing ? '✕ Cancel' : '✏️ Edit Profile' }}</button>
            } @else if (isLoggedIn()) {
              <a [routerLink]="['/messages', profileData.username]" class="btn-msg" style="text-decoration:none;">💬 Message</a>
            }
          </div>
        </div>

        <div class="profile-grid">
          <div class="left-col">
            <!-- Edit form -->
            @if (editing && isOwnProfile()) {
              <div class="card edit-card">
                <h3>Edit Profile</h3>
                <div class="form-group"><label>Bio</label><textarea [(ngModel)]="bio" rows="3" placeholder="Tell others about yourself..."></textarea></div>
                <div class="form-group"><label>City</label>
                  <select [(ngModel)]="city">
                    <option value="">Select city</option>
                    <option value="Almaty">Almaty</option>
                    <option value="Astana">Astana</option>
                    <option value="Shymkent">Shymkent</option>
                    <option value="Remote">Remote</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group"><label>Skills</label><input [(ngModel)]="skills" placeholder="e.g. Python, React, Design" /></div>
                <div class="form-group"><label>Portfolio URL</label><input [(ngModel)]="portfolioUrl" placeholder="https://yourportfolio.com" /></div>
                <div class="form-group"><label>GitHub URL</label><input [(ngModel)]="githubUrl" placeholder="https://github.com/username" /></div>
                <div class="form-group"><label>Experience Level</label>
                  <select [(ngModel)]="experienceLevel">
                    <option value="">Select level</option>
                    <option value="junior">🌱 Junior</option>
                    <option value="middle">🌿 Middle</option>
                    <option value="senior">🌳 Senior</option>
                  </select>
                </div>
                <div class="form-group"><label>Looking For</label><input [(ngModel)]="lookingFor" placeholder="e.g. Looking for a Backend Developer" /></div>
                @if (editMsg) { <div class="success-msg">{{ editMsg }}</div> }
                <button class="btn-primary" (click)="onSaveProfile()">Save Changes</button>
              </div>
            }

            <!-- About -->
            @if (profileData.profile?.bio) {
              <div class="card about-card">
                <h3>About</h3>
                <p>{{ profileData.profile.bio }}</p>
              </div>
            }

            <!-- My Posts -->
            <div class="card posts-card">
              <div class="posts-header">
                <h3>Posts ({{ myPosts.length }})</h3>
                @if (isOwnProfile()) {
                  <a routerLink="/create" class="btn-new-post">+ New Post</a>
                }
              </div>
              @if (myPosts.length === 0) {
                <div class="no-posts">
                  <p>No posts yet.</p>
                  @if (isOwnProfile()) { <a routerLink="/create">Create your first post →</a> }
                </div>
              } @else {
                <div class="mini-posts">
                  @for (post of myPosts; track post.id) {
                    <a [routerLink]="['/posts', post.id]" class="mini-post">
                      <div class="mini-cat" [style.color]="post.category_color || '#6366f1'">{{ post.category_icon || '📁' }} {{ post.category_name || 'General' }}</div>
                      <div class="mini-title">{{ post.title }}</div>
                      <div class="mini-meta">
                        @if (post.city) { <span>📍 {{ post.city }}</span> }
                        <span>🤍 {{ post.likes_count }}</span>
                      </div>
                    </a>
                  }
                </div>
              }
            </div>
          </div>

          <div class="right-col">
            <!-- Quick Info -->
            <div class="card info-card">
              <h3>Info</h3>
              <div class="info-list">
                @if (profileData.profile?.city) {
                  <div class="info-item"><span class="info-icon">📍</span><span>{{ profileData.profile.city }}</span></div>
                }
                @if (profileData.profile?.experience_level) {
                  <div class="info-item"><span class="info-icon">🎯</span><span>{{ profileData.profile.experience_level | titlecase }}</span></div>
                }
                <div class="info-item"><span class="info-icon">📅</span><span>Joined {{ profileData.profile?.created_at | date:'MMM yyyy' }}</span></div>
              </div>
            </div>

            <!-- Skills -->
            @if (profileData.profile?.skills) {
              <div class="card skills-card">
                <h3>Skills</h3>
                <div class="skill-chips">
                  @for (skill of getSkills(profileData.profile.skills); track skill) {
                    <span class="chip">{{ skill }}</span>
                  }
                </div>
              </div>
            }

            <!-- Links -->
            @if (profileData.profile?.portfolio_url || profileData.profile?.github_url) {
              <div class="card links-card">
                <h3>Links</h3>
                @if (profileData.profile?.portfolio_url) {
                  <a [href]="profileData.profile.portfolio_url" target="_blank" class="link-item">🌐 Portfolio</a>
                }
                @if (profileData.profile?.github_url) {
                  <a [href]="profileData.profile.github_url" target="_blank" class="link-item">💻 GitHub</a>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-wrap { max-width: 900px; margin: 0 auto; }
    .profile-hero { border-radius: 20px; overflow: hidden; margin-bottom: 24px; border: 1px solid var(--border); background: var(--surface); }
    .cover-bg { height: 120px; }
    .profile-hero-content { display: flex; align-items: flex-end; gap: 16px; padding: 0 24px 24px; margin-top: -40px; flex-wrap: wrap; }
    .profile-avatar { border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .profile-info { flex: 1; padding-top: 44px; }
    .profile-info h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 6px; }
    .exp-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: var(--primary-light); color: var(--primary); text-transform: capitalize; }
    .looking-for { font-size: 0.85rem; color: var(--text2); margin-top: 6px; }
    .btn-edit { align-self: flex-end; padding: 9px 18px; border-radius: 10px; background: var(--surface2); border: 1.5px solid var(--border); font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-edit:hover { border-color: var(--primary); color: var(--primary); }
    .btn-msg { align-self: flex-end; padding: 9px 18px; border-radius: 10px; background: var(--gradient); color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
    .profile-grid { display: grid; grid-template-columns: 1fr 260px; gap: 20px; }
    @media (max-width: 700px) { .profile-grid { grid-template-columns: 1fr; } }
    .left-col, .right-col { display: flex; flex-direction: column; gap: 16px; }
    .edit-card h3, .about-card h3, .posts-card h3, .info-card h3, .skills-card h3, .links-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 14px; }
    .about-card p { color: var(--text2); line-height: 1.7; font-size: 0.92rem; }
    .posts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .posts-header h3 { margin-bottom: 0; }
    .btn-new-post { font-size: 0.8rem; font-weight: 600; color: var(--primary); background: var(--primary-light); padding: 5px 12px; border-radius: 20px; text-decoration: none; }
    .mini-posts { display: flex; flex-direction: column; gap: 10px; }
    .mini-post { padding: 14px; background: var(--surface2); border-radius: 12px; text-decoration: none; color: inherit; border: 1.5px solid var(--border); display: block; transition: all 0.15s; }
    .mini-post:hover { border-color: var(--primary); text-decoration: none; }
    .mini-cat { font-size: 0.72rem; font-weight: 600; margin-bottom: 5px; }
    .mini-title { font-size: 0.88rem; font-weight: 600; margin-bottom: 6px; }
    .mini-meta { font-size: 0.75rem; color: var(--text3); display: flex; gap: 10px; }
    .no-posts { padding: 20px; text-align: center; color: var(--text2); font-size: 0.88rem; }
    .no-posts p { margin-bottom: 6px; }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; }
    .info-icon { font-size: 1rem; }
    .skill-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .links-card { display: flex; flex-direction: column; gap: 2px; }
    .links-card h3 { margin-bottom: 10px; }
    .link-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 500; color: var(--primary); background: var(--primary-light); text-decoration: none; margin-bottom: 7px; transition: all 0.15s; }
    .link-item:hover { background: var(--primary); color: white; text-decoration: none; }
  `],
})
export class ProfileComponent implements OnInit {
  profileData: UserProfile | null = null;
  myPosts: Post[] = [];
  loading = true;
  editing = false;
  bio = ''; city = ''; skills = ''; portfolioUrl = ''; githubUrl = '';
  experienceLevel = ''; lookingFor = '';
  editMsg = '';
  viewUsername: string | null = null;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.viewUsername = this.route.snapshot.paramMap.get('username');
    this.api.getProfile(this.viewUsername || undefined).subscribe({
      next: data => {
        this.profileData = data;
        this.bio = data.profile?.bio || '';
        this.city = data.profile?.city || '';
        this.skills = data.profile?.skills || '';
        this.portfolioUrl = data.profile?.portfolio_url || '';
        this.githubUrl = data.profile?.github_url || '';
        this.experienceLevel = data.profile?.experience_level || '';
        this.lookingFor = data.profile?.looking_for || '';
        this.loading = false;
      },
      error: () => { this.loading = false; this.router.navigate(['/posts']); },
    });
    if (!this.viewUsername || this.viewUsername === localStorage.getItem('username')) {
      this.api.getMyPosts().subscribe({ next: posts => this.myPosts = posts, error: () => {} });
    } else {
      this.api.getPosts().subscribe({
        next: posts => this.myPosts = posts.filter(p => p.author_username === this.viewUsername),
        error: () => {},
      });
    }
  }

  isOwnProfile(): boolean {
    return !this.viewUsername || this.viewUsername === localStorage.getItem('username');
  }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  getSkills(s: string): string[] { return s.split(',').map(x => x.trim()).filter(Boolean); }
  getExpEmoji(l: string): string { return { junior: '🌱', middle: '🌿', senior: '🌳' }[l] || ''; }

  onSaveProfile(): void {
    this.api.updateProfile({
      bio: this.bio, city: this.city, skills: this.skills,
      portfolio_url: this.portfolioUrl, github_url: this.githubUrl,
      experience_level: this.experienceLevel, looking_for: this.lookingFor,
    }).subscribe({
      next: () => {
        this.editMsg = '✓ Profile updated!';
        this.api.getProfile().subscribe(data => { this.profileData = data; });
        setTimeout(() => { this.editMsg = ''; this.editing = false; }, 1500);
      },
      error: () => { this.editMsg = ''; },
    });
  }
}
