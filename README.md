# 🚀 ScribblyAi - AI-Powered Memory Assistant

<div align="center">

![ScribblyAi Banner](https://img.shields.io/badge/ScribblyAi-AI%20Memory%20Assistant-6366f1?style=for-the-badge)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)

**🏆 Built for Elastic Challenge Hackathon**

*Your intelligent second brain that searches across notes, Gmail, Drive, and more using AI-powered hybrid search*

[Live Demo](https://scribble-ai-ten.vercel.app) · [Report Bug](https://github.com/Aadhavm10/ScribbleAi/issues) · [Request Feature](https://github.com/Aadhavm10/ScribbleAi/issues)

</div>

---

## 📖 Table of Contents

- [Why We Built This](#-why-we-built-this)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Future Integrations](#-future-integrations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why We Built This

### The Problem

In today's digital world, our information is scattered across multiple platforms:
- 📝 Notes in various apps
- ✉️ Important emails in Gmail
- 📄 Documents in Google Drive
- 📅 Events in Google Calendar

**The result?** We waste hours searching for that one piece of information we know exists *somewhere*.

### Our Solution

ScribblyAi is an **AI-powered memory assistant** that:
1. **Unifies** your data from multiple sources
2. **Understands** natural language queries using Google Vertex AI
3. **Searches** intelligently using Elasticsearch hybrid search (BM25 + vector embeddings)
4. **Answers** conversationally with source citations

### Hackathon Goals

Built for the **Elastic Challenge Hackathon**, ScribblyAi showcases:
- ✅ **Hybrid Search**: Combining keyword (BM25) and semantic (vector) search
- ✅ **AI Integration**: Google Vertex AI for embeddings and conversational responses
- ✅ **Multi-source Search**: Notes + Gmail + Google Drive in one place
- ✅ **Real-time Indexing**: Automatic content synchronization
- ✅ **Production-Ready**: Fully deployed and functional

---

## ✨ Features

### 🔍 **Intelligent Search**
- **Conversational AI Search**: Ask questions in natural language
- **Hybrid Search Engine**: BM25 keyword + 768-dimension vector embeddings
- **Multi-source Results**: Search across notes, Gmail, and Google Drive
- **Source Citations**: Always know where information came from
- **Context-Aware**: Maintains conversation history for follow-up questions

### 📝 **Smart Note Management**
- **Rich Text Editor**: Beautiful, responsive note editing
- **AI-Powered Features**:
  - 🤖 Automatic summarization
  - ✅ Task extraction with priorities
  - ✍️ Text rephrasing (formal/casual/concise)
- **Folder Organization**: Hierarchical folders with custom colors & icons
- **Quick Notes**: Sticky note-style rapid capture
- **Calendar View**: Timeline-based note browsing

### 🔐 **Secure Authentication**
- Google OAuth 2.0 integration
- Email/password authentication
- Secure token encryption (AES-256-GCM)
- Session management with NextAuth.js

### 🌐 **Google Services Integration**
- **Gmail**: Search email content, sync recent messages
- **Google Drive**: Index documents and files
- **Google Docs**: Full-text search across Docs
- **Automatic Sync**: Hourly background synchronization

### 🎨 **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Beautiful gradient themes
- Global search modal (⌘K / Ctrl+K)
- Smooth animations and transitions
- Loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **NextAuth.js** | Authentication |
| **React Big Calendar** | Calendar view |

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS** | Node.js framework |
| **Prisma ORM** | Database toolkit |
| **PostgreSQL** | Relational database |
| **Elasticsearch** | Hybrid search engine |
| **Google Vertex AI** | Gemini LLM + embeddings |
| **googleapis** | Google APIs integration |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **Supabase** | Managed PostgreSQL |
| **Elastic Cloud** | Managed Elasticsearch |
| **Google Cloud** | Vertex AI, OAuth |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  Next.js 15 + React 19 + Tailwind CSS (Vercel)                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ REST API
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      BACKEND (NestJS)                            │
│                     Railway / Cloud Run                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Notes      │  │   Folders    │  │   Search     │          │
│  │   Module     │  │   Module     │  │   Module     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   AI         │  │  Connectors  │  │   Auth       │          │
│  │   Module     │  │   Module     │  │   Module     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────┬──────────────┬──────────────┬─────────────────┬─────────┘
        │              │              │                 │
        │              │              │                 │
┌───────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐  ┌───────▼────────┐
│  PostgreSQL │ │Elasticsearch│ │ Vertex AI│  │ Google APIs    │
│  (Supabase) │ │(Elastic Cl.)│ │ Gemini   │  │ Gmail/Drive    │
└─────────────┘ └─────────────┘ └──────────┘  └────────────────┘
```

### Data Flow

1. **User Creates Note** → Saved to PostgreSQL → Generates embedding via Vertex AI → Indexed in Elasticsearch
2. **User Searches** → Hybrid query (BM25 + vector) → Elasticsearch returns results → Gemini generates conversational response
3. **Google Integration** → OAuth tokens stored (encrypted) → Periodic sync fetches Gmail/Drive → Content indexed in Elasticsearch

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Git**
- **PostgreSQL** (or use Supabase)
- **Google Cloud Project** (for OAuth and Vertex AI)
- **Elastic Cloud Account** (for Elasticsearch)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aadhavm10/ScribbleAi.git
cd ScribbleAi
```

#### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

**Create `backend/.env`:**

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"

# Server
PORT=4000
NODE_ENV=development
SKIP_PRISMA=false

# Google Cloud
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GCP_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# Elasticsearch
ELASTICSEARCH_URL=https://your-cluster.es.region.gcp.elastic.cloud:443
ELASTICSEARCH_API_KEY=your-api-key

# Token Encryption (generate with: openssl rand -base64 32)
TOKEN_ENCRYPTION_KEY=your-base64-encoded-key
```

**Run Database Migration:**

```bash
npx prisma generate
npx prisma db push
```

#### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
```

**Create `frontend/.env.local`:**

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Database (for NextAuth)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"

# API
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Generate Prisma Client:**

```bash
npx prisma generate --schema=../backend/prisma/schema.prisma
```

#### 4️⃣ Configure Google Cloud

1. **Create Project**: https://console.cloud.google.com/
2. **Enable APIs**:
   - Gmail API
   - Google Drive API
   - Google Docs API
   - Vertex AI API
3. **Configure OAuth Consent Screen**:
   - User Type: External
   - Add scopes:
     - `openid`
     - `email`
     - `profile`
     - `gmail.readonly`
     - `drive.readonly`
     - `documents.readonly`
4. **Create OAuth 2.0 Client**:
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google`
5. **Add Test Users** (during development):
   - OAuth Consent Screen → Test users → Add your email

#### 5️⃣ Setup Elasticsearch

1. **Create Cluster**: https://cloud.elastic.co/
2. **Choose**: Elastic Cloud Serverless
3. **Copy**: Cloud ID and API Key
4. **Add to** `backend/.env`

#### 6️⃣ Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Open Browser:**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
ScribblyAi/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── app.module.ts      # Root module
│   │   │
│   │   ├── notes/             # Notes CRUD
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   └── notes.module.ts
│   │   │
│   │   ├── folders/           # Folder management
│   │   │   ├── folders.controller.ts
│   │   │   ├── folders.service.ts
│   │   │   └── folders.module.ts
│   │   │
│   │   ├── ai/                # AI features (summarize, rephrase, tasks)
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── ai.module.ts
│   │   │
│   │   ├── search/            # Hybrid search
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts         # Hybrid search logic
│   │   │   ├── indexing.service.ts       # Elasticsearch indexing
│   │   │   ├── conversational.service.ts # AI conversations
│   │   │   └── search.module.ts
│   │   │
│   │   ├── connectors/        # Google integrations
│   │   │   ├── connectors.controller.ts
│   │   │   ├── google.service.ts         # Gmail/Drive sync
│   │   │   ├── sync-scheduler.service.ts # Hourly sync cron
│   │   │   └── connectors.module.ts
│   │   │
│   │   ├── elasticsearch/     # Elasticsearch client
│   │   │   ├── elasticsearch.service.ts
│   │   │   └── elasticsearch.module.ts
│   │   │
│   │   ├── vertex-ai/         # Vertex AI client
│   │   │   ├── vertex-ai.service.ts
│   │   │   └── vertex-ai.module.ts
│   │   │
│   │   └── prisma/            # Prisma ORM
│   │       ├── prisma.service.ts
│   │       └── prisma.module.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   │
│   ├── Dockerfile             # Docker config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Redirect to dashboard
│   │   │
│   │   ├── (dashboard)/       # Authenticated routes
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Main dashboard
│   │   │   ├── notes/
│   │   │   │   └── page.tsx   # All notes grid
│   │   │   ├── search/
│   │   │   │   └── page.tsx   # AI search page
│   │   │   ├── folders/
│   │   │   │   └── page.tsx   # Folder management
│   │   │   ├── connectors/
│   │   │   │   └── page.tsx   # Google integrations
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx   # Calendar view
│   │   │   └── settings/
│   │   │       └── page.tsx   # User settings
│   │   │
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── page.tsx   # OAuth callback
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts # NextAuth config
│   │   │
│   │   ├── globals.css        # Global styles
│   │   └── providers.tsx      # Context providers
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx  # Sidebar + navigation
│   │   ├── NoteCard.tsx       # Note preview card
│   │   ├── NoteEditor.tsx     # Note editing modal
│   │   ├── MiniCalendar.tsx   # Dashboard calendar
│   │   └── ConversationalSearch.tsx # AI search modal
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   │
│   ├── lib/
│   │   └── api.ts             # API client (NotesAPI, SearchAPI, etc.)
│   │
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   │
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── LICENSE                    # MIT License
├── README.md                  # This file
└── docker-compose.yml         # Local PostgreSQL (optional)
```

---

## 🔍 How It Works

### 1. **Note Creation & Indexing**

```typescript
// User creates a note
const note = await NotesAPI.createNote({
  title: "Meeting Notes",
  content: "Discussed Q1 roadmap...",
  userId: user.id
});

// Backend flow:
// 1. Save to PostgreSQL via Prisma
// 2. Generate embedding via Vertex AI (768 dimensions)
// 3. Index in Elasticsearch with both text and vector
await elasticsearchService.index({
  index: 'notes',
  document: {
    noteId: note.id,
    userId: user.id,
    title: note.title,
    content: note.content,
    content_embedding: embedding, // Vector from Vertex AI
    updatedAt: note.updatedAt,
  }
});
```

### 2. **Hybrid Search**

```typescript
// User searches: "What did we discuss about the roadmap?"
const results = await SearchAPI.hybridSearch(query, userId);

// Backend flow:
// 1. Generate query embedding
const queryEmbedding = await vertexAi.generateEmbedding(query);

// 2. Keyword search (BM25)
const keywordResults = await elasticsearch.search({
  query: {
    multi_match: {
      query,
      fields: ['title^3', 'content'],
      fuzziness: 'AUTO'
    }
  }
});

// 3. Vector search (cosine similarity)
const vectorResults = await elasticsearch.search({
  query: {
    script_score: {
      query: { match_all: {} },
      script: {
        source: "cosineSimilarity(params.queryVector, 'content_embedding') + 1.0",
        params: { queryVector: queryEmbedding }
      }
    }
  }
});

// 4. Merge with Reciprocal Rank Fusion (RRF)
const merged = reciprocalRankFusion(keywordResults, vectorResults);
```

### 3. **Conversational AI**

```typescript
// User asks: "Summarize the key points"
const response = await SearchAPI.conversationalSearch(query, userId);

// Backend flow:
// 1. Perform hybrid search to find relevant notes
// 2. Build context from top results
// 3. Call Vertex AI Gemini with context
const aiResponse = await vertexAi.generateResponse({
  prompt: `Based on these notes: ${context}\n\nUser question: ${query}`,
  temperature: 0.7
});

// 4. Return response with source citations
return {
  response: aiResponse.text,
  sources: topResults,
  conversationId: conversation.id
};
```

### 4. **Google Integration**

```typescript
// User connects Google account
// 1. OAuth flow stores encrypted tokens in SourceAccount table
await googleService.upsertSourceAccount({
  userId: user.id,
  accessToken: encrypt(tokens.access_token),
  refreshToken: encrypt(tokens.refresh_token),
  expiresAt: tokens.expiry_date
});

// 2. Periodic sync (hourly cron job)
@Cron(CronExpression.EVERY_HOUR)
async syncAllUsers() {
  // Gmail sync
  const emails = await gmail.users.messages.list({ userId: 'me' });
  for (const email of emails) {
    const content = await extractEmailContent(email);
    const embedding = await vertexAi.generateEmbedding(content);
    await elasticsearch.index({
      provider: 'gmail',
      itemType: 'email',
      content,
      embedding
    });
  }

  // Drive sync (similar process)
}
```

---

## 🔮 Future Integrations

### Short-term (1-2 months)

#### 📅 **Google Calendar Integration**
- Sync calendar events
- Create notes from meetings
- Show events in timeline view
- Smart reminders

#### 🌙 **Dark Mode**
- System preference detection
- Manual toggle
- Persistent user preference

#### 📤 **Export/Import**
- Export notes as JSON/Markdown
- Import from other note apps
- Backup automation

### Medium-term (3-6 months)

#### 📱 **Mobile Apps**
- React Native iOS/Android apps
- Offline mode with sync
- Push notifications
- Camera OCR for note capture

#### 🌐 **Browser Extension**
- Chrome/Firefox/Safari extensions
- Clip web pages to notes
- Quick capture popup
- Context menu integration

#### 🏷️ **Smart Tags & Organization**
- AI-powered auto-tagging
- Tag-based filtering
- Related notes suggestions
- Tag clouds and analytics

### Long-term (6+ months)

#### 👥 **Real-time Collaboration**
- Live multi-user editing (CRDT)
- Cursor positions and presence
- Comment threads
- Mention users (@username)
- Granular permissions

#### 🎤 **Voice & Vision**
- Voice-to-text notes
- Image OCR (extract text from photos)
- Diagram recognition
- Audio note recordings

#### 🧠 **Advanced AI**
- Sentiment analysis
- Language translation (50+ languages)
- Smart suggestions and auto-complete
- Meeting transcription & summarization
- Knowledge graph visualization

#### 🔗 **More Integrations**
- Slack messages
- Discord channels
- Notion import
- Obsidian sync
- Evernote migration
- Microsoft 365 (Outlook, OneDrive)
- Dropbox
- GitHub issues/PRs
- Trello boards

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```
5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Elastic** for the amazing search platform and hackathon opportunity
- **Google Cloud** for Vertex AI and generous free tier
- **Supabase** for managed PostgreSQL hosting
- **Vercel** for seamless Next.js deployment
- **Railway** for hassle-free backend hosting

---

## 📞 Contact & Support

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Aadhavm10/ScribbleAi/issues)
- **Email**: aadhavm10@gmail.com
- **Live Demo**: [scribble-ai-ten.vercel.app](https://scribble-ai-ten.vercel.app)

---

<div align="center">

**Built with ❤️ for the Elastic Challenge Hackathon**

⭐ **Star this repo if you find it useful!** ⭐

</div>
