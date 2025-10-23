# ScribblyAi - Feature Documentation

## ✅ Completed Features (MVP)

### Core Note Management
- ✅ Create, read, update, delete notes
- ✅ Rich text note editor
- ✅ Markdown support
- ✅ Auto-save functionality
- ✅ Note preview cards

### AI-Powered Features
- ✅ **Conversational AI Search** (Elastic + Vertex AI)
  - Natural language queries
  - Hybrid BM25 + vector search
  - Source citations
  - Context-aware responses
- ✅ **AI Summarization**
  - Automatic note summaries
  - Key points extraction
- ✅ **Task Extraction**
  - AI-powered task detection
  - Priority assignment
  - Due date extraction
- ✅ **Text Rephrasing**
  - Formal, casual, concise styles
  - Powered by Gemini 1.5 Pro

### User Interface
- ✅ Modern, responsive design
- ✅ Left sidebar navigation
- ✅ Search modal (Cmd/Ctrl+K)
- ✅ Grid/List view toggle
- ✅ Beautiful gradient theme
- ✅ Loading states & animations

### Authentication
- ✅ Google OAuth login
- ✅ Email/password authentication
- ✅ Demo mode (skip login)
- ✅ Session management with NextAuth

### Search & Indexing
- ✅ Real-time Elasticsearch indexing
- ✅ Automatic re-indexing on updates
- ✅ Vector embeddings (768 dimensions)
- ✅ Hybrid search (keyword + semantic)

## 🚧 In Progress (Hackathon Phase)

### Pages Being Implemented

#### 1. Folders Page
**Status**: 🚧 In Development
**Features**:
- Create, rename, delete folders
- Drag & drop notes into folders
- Nested folder structure
- Color coding & custom icons
- Folder statistics (note count, last updated)
- Smart collections (AI-suggested groupings)

**Database Schema**:
```prisma
model Folder {
  id          String   @id @default(uuid())
  name        String
  color       String?  // Hex color code
  icon        String?  // Emoji or icon name
  parentId    String?  // For nested folders
  parent      Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children    Folder[] @relation("FolderHierarchy")
  notes       Note[]
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 2. Quick Notes Page
**Status**: 🚧 In Development
**Features**:
- Sticky note style interface
- Fast capture (no title required)
- Color-coded cards
- Pin favorites
- Drag to reorder
- Convert to full note
- Auto-save every 2 seconds
- Archive old notes

**Use Cases**:
- Shopping lists
- Quick thoughts
- Meeting jotdowns
- Temporary reminders
- Links to read later

#### 3. Calendar Page
**Status**: 🚧 In Development
**Features**:
- Monthly calendar view
- Weekly view
- Notes grouped by date
- Visual indicators for note density
- Click date to see notes
- Create note for specific date

**Google Calendar Integration** (Phase 1.5):
- OAuth scope: `calendar.readonly`
- Read user's calendar events
- Display events alongside notes
- Link notes to calendar events
- Quick "Create meeting note" from event

#### 4. Settings Page
**Status**: 🚧 In Development
**Features**:

**Profile Section**:
- Name, email, avatar
- Change password
- Account statistics

**Appearance Section**:
- Theme toggle (light/dark mode)
- Accent color picker
- Font size preferences
- Compact/comfortable view density

**Connected Accounts**:
- Google account status
- Connected services list
- Disconnect/reconnect options

**Data & Privacy**:
- Export notes (JSON/Markdown)
- Import notes
- Clear all data
- Delete account

**AI Preferences**:
- Enable/disable AI features
- Choose AI model (future)
- Search result count

**Notifications**:
- Email notifications
- Browser notifications
- Notification preferences

## 📋 Planned Features (Post-Hackathon)

### Google Services Integration

#### Gmail Integration
**Priority**: High
**Estimated Time**: 8-12 hours

**Features**:
- OAuth scope: `gmail.readonly`
- Search email content
- Link emails to notes
- "Create note from email" button
- Email preview in search results
- Attachment indexing

**Implementation Notes**:
```typescript
// Gmail API client setup
import { gmail_v1, google } from 'googleapis';

// Search emails
const gmail = google.gmail({ version: 'v1', auth });
const messages = await gmail.users.messages.list({
  userId: 'me',
  q: 'subject:meeting notes',
});

// Index in Elasticsearch
await elasticsearchService.indexEmail({
  id: message.id,
  subject: emailData.subject,
  from: emailData.from,
  body: emailData.body,
  date: emailData.date,
  userId: userId,
});
```

#### Google Drive Integration
**Priority**: High
**Estimated Time**: 8-12 hours

**Features**:
- OAuth scope: `drive.readonly`
- Search Google Docs, Sheets, Slides
- Preview files in search
- "Create note from Doc" import
- File attachment to notes
- Automatic sync

**Implementation Notes**:
```typescript
// Drive API client setup
const drive = google.drive({ version: 'v3', auth });

// Search files
const files = await drive.files.list({
  q: "mimeType='application/vnd.google-apps.document'",
  fields: 'files(id, name, modifiedTime, webViewLink)',
});

// Get file content
const doc = await drive.files.export({
  fileId: file.id,
  mimeType: 'text/plain',
});

// Index in Elasticsearch
await elasticsearchService.indexDriveFile({
  id: file.id,
  name: file.name,
  content: doc.data,
  type: 'document',
  link: file.webViewLink,
  userId: userId,
});
```

#### Unified Search Experience
**Priority**: Critical for multi-service
**Features**:
- Search across Notes + Gmail + Drive + Calendar
- Tabbed results (All, Notes, Emails, Files, Events)
- Unified ranking algorithm
- Cross-reference suggestions
- "Related content" from different sources

**Search Result Structure**:
```typescript
interface UnifiedSearchResult {
  type: 'note' | 'email' | 'drive_file' | 'calendar_event';
  id: string;
  title: string;
  preview: string;
  source: string;
  date: Date;
  relevanceScore: number;
  metadata: {
    // Type-specific fields
    author?: string;
    folder?: string;
    attachments?: number;
  };
}
```

### Real-time Collaboration
**Priority**: Medium
**Estimated Time**: 20-30 hours

**Features**:
- WebSocket-based live editing
- Multiple users per note
- Live cursor positions
- User presence indicators
- Conflict resolution
- Version history
- Comment threads
- Mention users (@username)
- Permissions (view/edit/comment)

**Tech Stack**:
- Socket.io for WebSocket
- Yjs or Automerge for CRDT
- Redis for presence tracking
- Operational Transform (OT) or CRDT

**Implementation Notes**:
```typescript
// Backend: NestJS WebSocket Gateway
@WebSocketGateway()
export class CollaborationGateway {
  @SubscribeMessage('join-note')
  handleJoinNote(client: Socket, noteId: string) {
    client.join(`note-${noteId}`);
    // Broadcast user joined
  }

  @SubscribeMessage('note-update')
  handleNoteUpdate(client: Socket, data: { noteId: string; delta: any }) {
    // Apply operational transform
    // Broadcast to other users
    client.to(`note-${data.noteId}`).emit('note-updated', data.delta);
  }
}
```

### Additional Features

#### Tags & Smart Organization
- Auto-tagging with AI
- Tag-based filtering
- Tag clouds
- Related notes suggestions

#### Templates
- Note templates library
- Meeting notes template
- Project planning template
- Daily journal template
- Custom templates

#### Sharing & Collaboration (Non-realtime)
- Share note via link
- Public/private toggle
- View-only vs edit permissions
- Embed notes in websites

#### Mobile Apps
- React Native apps (iOS/Android)
- Offline mode
- Push notifications
- Camera note capture

#### Browser Extensions
- Chrome/Firefox extension
- Clip web pages to notes
- Quick capture
- Context menu integration

#### AI Enhancements
- Voice-to-text notes
- Image OCR (extract text from images)
- Smart suggestions
- Auto-categorization
- Sentiment analysis
- Language translation

## 🏗️ Technical Architecture

### Current Stack
```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS 4
└── NextAuth.js

Backend:
├── NestJS
├── Prisma ORM
├── PostgreSQL (Supabase)
├── Elasticsearch (Hybrid Search)
└── Google Vertex AI (Gemini + Embeddings)

Infrastructure:
├── Vercel (Frontend)
├── Google Cloud Run (Backend)
└── Supabase (Database)
```

### Adding New Google Service - Template

**Step 1: Add OAuth Scopes**
```typescript
// frontend/app/api/auth/[...nextauth]/route.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly', // Add new scope
        'https://www.googleapis.com/auth/drive.readonly',
      ].join(' '),
    },
  },
}),
```

**Step 2: Create Service Module**
```typescript
// backend/src/google-services/gmail.service.ts
@Injectable()
export class GmailService {
  private gmail: gmail_v1.Gmail;

  constructor() {
    this.gmail = google.gmail({ version: 'v1' });
  }

  async searchEmails(query: string, accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const result = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      auth,
    });

    return result.data.messages;
  }
}
```

**Step 3: Index in Elasticsearch**
```typescript
// backend/src/search/indexing.service.ts
async indexGmailMessage(message: GmailMessage, userId: string) {
  await this.elasticsearchService.index({
    index: 'unified_search',
    id: `email-${message.id}`,
    document: {
      type: 'email',
      userId,
      subject: message.subject,
      from: message.from,
      body: message.body,
      date: message.date,
      embedding: await this.generateEmbedding(message.body),
    },
  });
}
```

**Step 4: Update Search API**
```typescript
// Include in hybrid search
const results = await this.elasticsearchService.search({
  index: 'unified_search',
  query: {
    bool: {
      must: [{ match: { userId } }],
      should: [
        { multi_match: { query, fields: ['title', 'content', 'subject', 'body'] } },
        { knn: { field: 'embedding', query_vector: embedding } },
      ],
    },
  },
});
```

## 📊 Metrics & Analytics

### Current Metrics (Available)
- Total notes count
- Recent notes count
- Search queries
- AI feature usage

### Planned Metrics
- User engagement (daily active users)
- Feature usage statistics
- Search result relevance
- AI accuracy metrics
- Performance monitoring

## 🚀 Deployment Strategy

### Current Deployment
- Frontend: Vercel (automatic deployments)
- Backend: Local development
- Database: Supabase (managed PostgreSQL)

### Production Deployment Plan
- Frontend: Vercel (✅ Ready)
- Backend: Google Cloud Run (Docker containerized)
- Database: Supabase (✅ Production-ready)
- Elasticsearch: Elastic Cloud (✅ Production-ready)
- Monitoring: Google Cloud Logging + Sentry

## 📝 Development Notes

### Code Organization
```
frontend/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home dashboard
│   ├── notes/             # All notes
│   ├── folders/           # Folder organization
│   ├── quick/             # Quick notes
│   ├── calendar/          # Calendar view
│   └── settings/          # Settings
├── components/
│   ├── layout/            # Sidebar, AppLayout
│   ├── folders/           # Folder components
│   ├── calendar/          # Calendar components
│   └── settings/          # Settings components
└── lib/
    ├── api.ts             # API client
    └── google-api.ts      # Google API client

backend/
├── src/
│   ├── notes/             # Notes CRUD
│   ├── folders/           # Folders CRUD
│   ├── google-services/   # Gmail, Drive, Calendar
│   ├── search/            # Unified search
│   └── collaboration/     # WebSocket (future)
└── prisma/
    └── schema.prisma      # Database models
```

### Best Practices
- Feature flags for new features
- Comprehensive error handling
- Loading states everywhere
- Optimistic UI updates
- Proper TypeScript types
- Unit tests for critical paths
- E2E tests for user flows

## 🎯 Success Metrics for Hackathon

### Must Have (P0)
- ✅ All pages functional
- ✅ No broken links
- ✅ Smooth demo flow
- ✅ Error handling
- ✅ Professional UI

### Nice to Have (P1)
- ⚪ Google Calendar integration working
- ⚪ Dark mode toggle
- ⚪ Data export feature
- ⚪ Smooth animations

### Future (P2)
- ⚪ Gmail integration
- ⚪ Drive integration
- ⚪ Real-time collaboration

---

**Last Updated**: October 22, 2024
**Status**: 🚧 Active Development
**Target**: Hackathon Ready
