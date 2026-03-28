import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8000/api';

export interface Post {
  id: number;
  title: string;
  description: string;
  stack: string;
  level: string;
  sphere: string;
  city: string;
  preferred_time: string;
  experience_required: string;
  is_active: boolean;
  author: number;
  author_username: string;
  author_avatar_color: string;
  author_bio: string;
  author_experience: string;
  category: number | null;
  category_name: string;
  category_icon: string;
  category_color: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface Category { id: number; name: string; icon: string; color: string; }
export interface AuthResponse { token: string; username: string; }
export interface Profile {
  id: number; bio: string; city: string; skills: string;
  portfolio_url: string; github_url: string;
  experience_level: string; looking_for: string; avatar_color: string; created_at: string;
}
export interface UserProfile { id: number; username: string; email: string; profile: Profile; }
export interface Message {
  id: number; sender: number; sender_username: string;
  receiver: number; receiver_username: string;
  content: string; is_read: boolean; created_at: string;
}
export interface Conversation {
  username: string; last_message: string; last_time: string; unread: number; avatar_color: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/register/`, data);
  }
  login(data: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/login/`, data);
  }
  logout(): Observable<any> {
    return this.http.post(`${BASE}/auth/logout/`, {});
  }
  getProfile(username?: string): Observable<UserProfile> {
    const url = username ? `${BASE}/auth/profile/${username}/` : `${BASE}/auth/profile/`;
    return this.http.get<UserProfile>(url);
  }
  updateProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.patch<Profile>(`${BASE}/auth/profile/`, data);
  }
  getPosts(filters?: { q?: string; city?: string; category?: number; sphere?: string; experience?: string }): Observable<Post[]> {
    let params = new HttpParams();
    if (filters?.q) params = params.set('q', filters.q);
    if (filters?.city) params = params.set('city', filters.city);
    if (filters?.category) params = params.set('category', filters.category.toString());
    if (filters?.sphere) params = params.set('sphere', filters.sphere);
    if (filters?.experience) params = params.set('experience', filters.experience);
    return this.http.get<Post[]>(`${BASE}/posts/`, { params });
  }
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${BASE}/posts/${id}/`);
  }
  createPost(data: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(`${BASE}/posts/create/`, data);
  }
  updatePost(id: number, data: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${BASE}/posts/${id}/`, data);
  }
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${BASE}/posts/${id}/`);
  }
  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${BASE}/posts/mine/`);
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${BASE}/posts/categories/`);
  }
  toggleLike(postId: number): Observable<{ liked: boolean; likes_count: number }> {
    return this.http.post<any>(`${BASE}/posts/${postId}/like/`, {});
  }
  getRecommended(): Observable<Post[]> {
    return this.http.get<Post[]>(`${BASE}/posts/recommended/`);
  }
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${BASE}/auth/messages/`);
  }
  getMessages(username: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${BASE}/auth/messages/${username}/`);
  }
  sendMessage(username: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${BASE}/auth/messages/${username}/`, { content });
  }
  getUnreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${BASE}/auth/messages/unread/count/`);
  }
}
