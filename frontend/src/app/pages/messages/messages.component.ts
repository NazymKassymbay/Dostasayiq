import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService, Message, Conversation } from '../../services/api.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="messages-wrap">
      <!-- Conversations list -->
      <div class="convos-panel" [class.hidden-mobile]="activeChat">
        <div class="convos-header">
          <h2>Messages</h2>
          <span class="msg-count">{{ conversations.length }}</span>
        </div>
        <div class="convos-search">
          <input [(ngModel)]="searchUser" placeholder="Search or start new chat..." (keyup.enter)="startNewChat()" />
          <button class="btn-start" (click)="startNewChat()" title="Start chat">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div class="convos-list">
          @if (conversations.length === 0) {
            <div class="no-convos">
              <div class="no-convos-icon">💬</div>
              <p>No conversations yet</p>
              <span>Start chatting with someone!</span>
            </div>
          }
          @for (c of conversations; track c.username) {
            <div class="convo-item" [class.active]="activeChat === c.username" (click)="openChat(c.username)">
              <div class="avatar avatar-sm" [style.background]="c.avatar_color || '#6366f1'">{{ c.username.charAt(0).toUpperCase() }}</div>
              <div class="convo-info">
                <div class="convo-name">{{ c.username }}</div>
                <div class="convo-preview">{{ c.last_message || 'No messages yet' }}</div>
              </div>
              @if (c.unread > 0) {
                <span class="unread-badge">{{ c.unread }}</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Chat panel -->
      <div class="chat-panel" [class.hidden-mobile]="!activeChat">
        @if (!activeChat) {
          <div class="no-chat">
            <div class="no-chat-icon">✉️</div>
            <h3>Select a conversation</h3>
            <p>Choose someone from the left or start a new chat</p>
          </div>
        } @else {
          <div class="chat-header">
            <button class="back-mobile" (click)="activeChat = null">←</button>
            <a [routerLink]="['/profile', activeChat]" class="chat-user">
              <div class="avatar avatar-sm" [style.background]="getChatColor()">{{ activeChat.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="chat-username">{{ activeChat }}</div>
                <div class="chat-status">Active</div>
              </div>
            </a>
            <a [routerLink]="['/profile', activeChat]" class="btn-ghost view-profile-btn" style="text-decoration:none;">👤 Profile</a>
          </div>

          <div class="messages-list" #scrollContainer>
            @if (loadingMessages) {
              <div class="loading"><div class="spinner"></div></div>
            }
            @for (msg of messages; track msg.id) {
              <div class="msg-wrapper" [class.own]="msg.sender_username === currentUser">
                @if (msg.sender_username !== currentUser) {
                  <div class="avatar avatar-sm" [style.background]="getChatColor()">{{ activeChat.charAt(0).toUpperCase() }}</div>
                }
                <div class="msg-bubble" [class.own-bubble]="msg.sender_username === currentUser">
                  <div class="msg-text">{{ msg.content }}</div>
                  <div class="msg-time">{{ getTime(msg.created_at) }}</div>
                </div>
              </div>
            }
          </div>

          <div class="msg-input-row">
            <textarea [(ngModel)]="newMessage" placeholder="Type a message..." rows="1"
              (keydown.enter)="$event.preventDefault(); onSend()"
              (keydown.shift.enter)="null"
              class="msg-input"></textarea>
            <button class="send-btn" (click)="onSend()" [disabled]="!newMessage.trim()">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .messages-wrap { display: grid; grid-template-columns: 300px 1fr; height: calc(100vh - 128px); background: var(--surface); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; }
    @media (max-width: 640px) { .messages-wrap { grid-template-columns: 1fr; } .hidden-mobile { display: none !important; } }

    .convos-panel { border-right: 1px solid var(--border); display: flex; flex-direction: column; }
    .convos-header { display: flex; align-items: center; gap: 10px; padding: 20px 16px 12px; border-bottom: 1px solid var(--border); }
    .convos-header h2 { font-size: 1rem; font-weight: 700; flex: 1; }
    .msg-count { background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; }
    .convos-search { display: flex; gap: 6px; padding: 12px 12px 8px; }
    .convos-search input { flex: 1; padding: 8px 12px; font-size: 0.85rem; border-radius: 10px; }
    .btn-start { width: 36px; height: 36px; border-radius: 10px; background: var(--gradient); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .convos-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
    .no-convos { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: var(--text3); text-align: center; }
    .no-convos-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .no-convos p { font-size: 0.9rem; font-weight: 600; color: var(--text2); margin-bottom: 4px; }
    .no-convos span { font-size: 0.8rem; }
    .convo-item { display: flex; align-items: center; gap: 10px; padding: 10px 10px; border-radius: 12px; cursor: pointer; transition: all 0.15s; }
    .convo-item:hover { background: var(--surface2); }
    .convo-item.active { background: var(--primary-light); }
    .convo-info { flex: 1; min-width: 0; }
    .convo-name { font-size: 0.88rem; font-weight: 600; }
    .convo-preview { font-size: 0.77rem; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
    .unread-badge { background: var(--primary); color: white; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center; }

    .chat-panel { display: flex; flex-direction: column; }
    .no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text3); text-align: center; padding: 40px; }
    .no-chat-icon { font-size: 3rem; margin-bottom: 16px; }
    .no-chat h3 { font-size: 1rem; font-weight: 700; color: var(--text2); margin-bottom: 6px; }
    .chat-header { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
    .back-mobile { display: none; background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0 4px; color: var(--text2); }
    @media (max-width: 640px) { .back-mobile { display: block; } }
    .chat-user { display: flex; align-items: center; gap: 10px; flex: 1; text-decoration: none; }
    .chat-user:hover { text-decoration: none; }
    .chat-username { font-size: 0.92rem; font-weight: 700; color: var(--text); }
    .chat-status { font-size: 0.72rem; color: var(--success); }
    .view-profile-btn { font-size: 0.8rem; color: var(--text2); white-space: nowrap; }
    .messages-list { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 12px; }
    .msg-wrapper { display: flex; align-items: flex-end; gap: 8px; }
    .msg-wrapper.own { flex-direction: row-reverse; }
    .msg-bubble { max-width: 70%; padding: 10px 14px; border-radius: 16px 16px 16px 4px; background: var(--surface2); border: 1px solid var(--border); }
    .own-bubble { border-radius: 16px 16px 4px 16px; background: var(--gradient); color: white; border: none; }
    .msg-text { font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
    .msg-time { font-size: 0.68rem; margin-top: 4px; color: var(--text3); }
    .own-bubble .msg-time { color: rgba(255,255,255,0.7); }
    .msg-input-row { display: flex; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border); align-items: flex-end; }
    .msg-input { flex: 1; resize: none; border-radius: 14px; padding: 10px 14px; font-size: 0.9rem; max-height: 120px; overflow-y: auto; line-height: 1.5; }
    .send-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--gradient); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
    .send-btn:hover { transform: scale(1.05); }
    .send-btn:disabled { background: var(--border); box-shadow: none; transform: none; cursor: not-allowed; }
  `],
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  conversations: Conversation[] = [];
  messages: Message[] = [];
  activeChat: string | null = null;
  newMessage = '';
  searchUser = '';
  loadingMessages = false;
  currentUser = localStorage.getItem('username') || '';
  private interval: any;
  private shouldScroll = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadConversations();
    const username = this.route.snapshot.paramMap.get('username');
    if (username) this.openChat(username);
    this.interval = setInterval(() => {
      if (this.activeChat) this.loadMessages(this.activeChat, false);
    }, 5000);
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  loadConversations(): void {
    this.api.getConversations().subscribe({ next: c => this.conversations = c, error: () => {} });
  }

  openChat(username: string): void {
    this.activeChat = username;
    this.loadMessages(username, true);
    if (!this.conversations.find(c => c.username === username)) {
      this.conversations.unshift({ username, last_message: '', last_time: '', unread: 0, avatar_color: '#6366f1' });
    }
  }

  loadMessages(username: string, scroll: boolean): void {
    if (scroll) this.loadingMessages = true;
    this.api.getMessages(username).subscribe({
      next: msgs => {
        this.messages = msgs;
        this.loadingMessages = false;
        if (scroll) this.shouldScroll = true;
        this.loadConversations();
      },
      error: () => this.loadingMessages = false,
    });
  }

  onSend(): void {
    if (!this.newMessage.trim() || !this.activeChat) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.api.sendMessage(this.activeChat, content).subscribe({
      next: msg => {
        this.messages.push(msg);
        this.shouldScroll = true;
        this.loadConversations();
      },
    });
  }

  startNewChat(): void {
    if (this.searchUser.trim()) {
      this.openChat(this.searchUser.trim());
      this.searchUser = '';
    }
  }

  getChatColor(): string {
    return this.conversations.find(c => c.username === this.activeChat)?.avatar_color || '#6366f1';
  }

  getTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
