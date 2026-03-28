# 🤝 Dostasayıq

> A web platform for finding study, project, sport and activity partners — built for KBTU students.

**Stack:** Angular 19 · Django REST Framework · SQLite

---

## 👥 Team

| Member | Role | Responsibilities |
|--------|------|-----------------|
| 👩‍💻 **Kassymbay Nazym** |[NazymKassymbay](https://github.com/NazymKassymbay) | Backend Developer | Django models, serializers, FBV & CBV views, CRUD endpoints, CORS & token auth setup, database schema, Postman collection |
| 👩‍💻 **Aidarkyzy Dinara** |[Dinara011](https://github.com/Dinara011) | Full-Stack Developer | Token authentication (register/login/logout), JWT interceptor, AuthGuard, messaging system (backend + frontend), unread counter |
| 👩‍💻 **Maxat Mariyam** |[Mariyamchik](https://github.com/Mariyamchik)    | Frontend Developer | Angular components, routing, `[(ngModel)]` forms, `ApiService` with HttpClient, CSS styling, `@for`/`@if` templates, error handling UI |

**Practice Lesson:** __Wednesday 12:00-14:00

---

## 📌 About the Project

**Dostasayıq** — "find a friend" in Kazakh — is a platform where users post what kind of partner they are looking for (study buddy, project co-founder, sport partner, etc.) and connect with others who match their interests.

### Features

- 🔐 **Authentication** — register, login, logout with token-based security
- 📝 **Posts** — create, edit, delete posts with category, location, and tech stack
- 🔍 **Search & Filter** — filter by city, sphere, experience level, or keyword
- 👤 **Profiles** — skills, experience level, portfolio and GitHub links
- 💬 **Direct Messages** — real-time chat between users with unread badge
- 🤖 **Smart Matching** — recommended posts based on your city, skills and experience

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 19, TypeScript, FormsModule, HttpClient |
| Backend | Django 5, Django REST Framework |
| Database | SQLite |
| Auth | Token Authentication (`rest_framework.authtoken`) |
| API Docs | Postman Collection |

---

## 📁 Project Structure

```
Dostasayiq/
├── backend/
│   ├── config/                  # settings.py, urls.py, wsgi.py
│   ├── accounts/                # Auth + Messaging
│   │   ├── models.py            # Profile, Message
│   │   ├── serializers.py       # RegisterSerializer, ProfileSerializer, MessageSerializer
│   │   ├── views.py             # register, login, logout (FBV) · ProfileView, MessageView (CBV)
│   │   └── urls.py
│   ├── posts/                   # Posts + Categories
│   │   ├── models.py            # Category, Post, PostLike
│   │   ├── serializers.py       # PostSerializer, PostSearchSerializer, CategorySerializer
│   │   ├── views.py             # post_list, post_create, toggle_like (FBV) · PostDetailView, MyPostsView (CBV)
│   │   └── urls.py
│   ├── postman/
│   │   └── Dostasayiq.postman_collection.json
│   ├── manage.py
│   ├── seed_data.py
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── interceptors/        # auth.interceptor.ts  ← adds Token header
│       ├── guards/              # auth.guard.ts
│       ├── services/            # api.service.ts (HttpClient)
│       └── pages/
│           ├── login/           # LoginComponent
│           ├── register/        # RegisterComponent
│           ├── post-list/       # PostListComponent
│           ├── post-detail/     # PostDetailComponent
│           ├── create-post/     # CreatePostComponent
│           ├── profile/         # ProfileComponent
│           └── messages/        # MessagesComponent
└── README.md
```

---

## ✅ Requirements Coverage

### 🗄 Backend — Nazym

| Requirement | Status | Details |
|-------------|:------:|---------|
| ≥ 4 Django models | ✅ | `Category`, `Post`, `PostLike`, `Profile`, `Message` — **5 models** |
| ≥ 2 ForeignKey relationships | ✅ | Post→User, Post→Category, PostLike→User, PostLike→Post, Message→User×2 — **6 FKs** |
| 1 custom model Manager | ✅ | `ActivePostManager` on `Post` model |
| ≥ 2 `serializers.Serializer` | ✅ | `RegisterSerializer`, `PostSearchSerializer` |
| ≥ 2 `serializers.ModelSerializer` | ✅ | `PostSerializer`, `CategorySerializer`, `ProfileSerializer`, `UserSerializer`, `MessageSerializer` — **5 total** |
| ≥ 2 Function-Based Views | ✅ | `register`, `login`, `logout`, `post_list`, `post_create`, `toggle_like`, `recommended_posts` — **7 FBVs** |
| ≥ 2 Class-Based Views (APIView) | ✅ | `PostDetailView`, `MyPostsView`, `ProfileView`, `MessageView` — **4 CBVs** |
| Full CRUD for ≥ 1 model | ✅ | `Post`: `GET` / `POST` / `PUT` / `DELETE` |
| Link objects to `request.user` | ✅ | `serializer.save(author=request.user)` |
| CORS configured | ✅ | `django-cors-headers`, `CORS_ALLOWED_ORIGINS = ['http://localhost:4200']` |
| Postman collection | ✅ | `backend/postman/Dostasayiq.postman_collection.json` |

### 🔐 Authentication & Messaging — Dinara

| Requirement | Status | Details |
|-------------|:------:|---------|
| Token-based auth — login endpoint | ✅ | `POST /api/auth/login/` → returns token |
| Token-based auth — logout endpoint | ✅ | `POST /api/auth/logout/` → deletes token |
| JWT interceptor (frontend) | ✅ | `authInterceptor` automatically adds `Authorization: Token …` to every request |
| AuthGuard (frontend) | ✅ | Protects `/create`, `/profile`, `/messages` routes |
| Messaging backend (FBV + CBV) | ✅ | `MessageView` (CBV), `unread_count_view` (FBV) |
| Messaging frontend | ✅ | `MessagesComponent` with real-time polling every 5 seconds |
| Unread messages counter | ✅ | Badge in navbar updated automatically |

### 🖥 Frontend — Mariyam

| Requirement | Status | Details |
|-------------|:------:|---------|
| Interfaces & Services for API | ✅ | `ApiService` with fully typed TypeScript interfaces |
| ≥ 4 `(click)` events | ✅ | `onLogin`, `onRegister`, `onCreate`, `toggleLike`, `onSearch`, `onClear`, `logout`, `sendMessage`, `deletePost` — **10+ events** |
| ≥ 4 `[(ngModel)]` controls | ✅ | `username`, `password`, `title`, `description`, `stack`, `level`, `sphere`, `city`, `preferredTime`, `searchQ`, `content` — **12+ controls** |
| Basic CSS styling | ✅ | Global `styles.css` + per-component styles |
| Routing Module — ≥ 3 named routes | ✅ | `/posts`, `/posts/:id`, `/login`, `/register`, `/create`, `/profile`, `/profile/:username`, `/messages`, `/messages/:username` — **10 routes** |
| `@for` / `@if` (Angular 17+) | ✅ | Used across all list and conditional templates |
| ≥ 1 Angular Service with HttpClient | ✅ | `ApiService` — `providedIn: 'root'` |
| API error handling in UI | ✅ | Error messages displayed on all failed requests |

---

## 🗄 Database Schema

```
User  (Django built-in)
 ├── OneToOne ──▶  Profile
 │                   ├── bio, city, skills
 │                   ├── portfolio_url, github_url
 │                   └── experience_level, looking_for
 │
 ├── ForeignKey ──▶  Post  (author)
 │                   ├── ForeignKey ──▶  Category
 │                   └── related ──▶  PostLike
 │                                     ├── FK → User
 │                                     └── FK → Post
 │                                     unique_together: (user, post)
 │
 └── ForeignKey ──▶  Message  (sender / receiver)
                      ├── FK → User  (sender)
                      └── FK → User  (receiver)
```

---

## 🔗 API Endpoints

Base URL: `http://localhost:8000/api/`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register/` | — | Register a new user |
| `POST` | `/api/auth/login/` | — | Login — returns token |
| `POST` | `/api/auth/logout/` | 🔑 | Logout — invalidates token |
| `GET` | `/api/auth/profile/` | 🔑 | Get my profile |
| `PATCH` | `/api/auth/profile/` | 🔑 | Update my profile |
| `GET` | `/api/auth/profile/:username/` | — | Get any user's public profile |
| `GET` | `/api/auth/users/` | — | List all users |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/posts/` | — | List posts *(filters: `?q=` `?city=` `?sphere=` `?experience=` `?category=`)* |
| `POST` | `/api/posts/create/` | 🔑 | Create a post |
| `GET` | `/api/posts/:id/` | — | Post detail |
| `PUT` | `/api/posts/:id/` | 🔑 | Update post *(owner only)* |
| `DELETE` | `/api/posts/:id/` | 🔑 | Delete post *(owner only)* |
| `GET` | `/api/posts/mine/` | 🔑 | My posts |
| `POST` | `/api/posts/:id/like/` | 🔑 | Like / unlike |
| `GET` | `/api/posts/recommended/` | 🔑 | Recommended posts |
| `GET` | `/api/posts/categories/` | — | List categories |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/auth/messages/` | 🔑 | List conversations |
| `GET` | `/api/auth/messages/:username/` | 🔑 | Get chat with a user |
| `POST` | `/api/auth/messages/:username/` | 🔑 | Send a message |
| `GET` | `/api/auth/messages/unread/count/` | 🔑 | Unread messages count |

> 📬 Full request/response examples → `backend/postman/Dostasayiq.postman_collection.json`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Angular CLI 19

### Step 1 — Clone

```bash
git clone https://github.com/NazymKassymbay/Dostasayıq.git
cd Dostasayıq
```

### Step 2 — Backend

```bash
cd backend

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# Load initial categories (12 categories)
python manage.py shell < seed_data.py

python manage.py runserver
# → http://localhost:8000
```

### Step 3 — Frontend

```bash
cd frontend

npm install
ng serve --open
# → http://localhost:4200
```

---
