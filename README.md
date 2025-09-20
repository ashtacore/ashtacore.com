# Modern Blog Platform

A full-featured blog application built with React, TypeScript, and Convex. Features real-time updates, markdown support, and a modern dark/light theme.

![Blog Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19.0-blue)
![Convex](https://img.shields.io/badge/Convex-Backend-purple)

## ✨ Features

### 📝 Content Creation & Management
- **Markdown-enabled posts** with full GitHub Flavored Markdown support
- **Live preview editor** with side-by-side editing and preview
- **Drag & drop image uploads** with automatic markdown insertion
- **Copy/paste image support** for seamless content creation
- **Syntax highlighting** for code blocks with language detection
- **Tag-based organization** with automatic tag aggregation

### 🔍 Discovery & Navigation
- **React Router** for navigating directly to posts
- **Full-text search** across all post content
- **Tag filtering** with post counts
- **Real-time updates** using Convex's reactive queries
- **Responsive design** optimized for all device sizes

### 💬 Interactive Features
- **Real-time commenting system** with threaded discussions
- **User authentication** with secure session management
- **Admin controls** for content management
- **Dark/light theme toggle** with system preference detection

### 🔐 Security & Authentication
- **Convex Auth integration** for secure authentication
- **Cloudflare Turnstile CAPTCHA** for bot protection during signup
- **Role-based access control** (admin/user permissions)
- **Secure image uploads** with file validation

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Markdown** - Markdown rendering with plugins

### Backend & Database
- **Convex** - Serverless backend with real-time updates
- **Convex Auth** - Authentication and session management
- **File Storage** - Integrated file/image storage

### Additional Libraries
- **react-markdown** - Markdown parsing and rendering
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-highlight** - Code syntax highlighting
- **@marsidev/react-turnstile** - Cloudflare Turnstile integration
- **sonner** - Beautiful toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Convex account ([sign up here](https://www.convex.dev/))
- A Cloudflare account for Turnstile CAPTCHA

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Convex Configuration
CONVEX_DEPLOY_KEY=your-convex-deploy-key

# Cloudflare Turnstile (required for user registration)
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

#### Getting Convex Credentials:
1. Sign up at [convex.dev](https://www.convex.dev/)
2. Create a new project
4. Get your deploy key from the Convex dashboard
3. Run `npx convex dev` to get your deployment URL

#### Getting Turnstile Credentials:
1. Sign up at [Cloudflare](https://cloudflare.com/)
2. Go to Turnstile in your dashboard
3. Create a new site key
4. Copy both the site key and secret key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ashtacore.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create your Convex deployment
   - Set up the database schema
   - Start the development backend

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/             # React components
│   ├── AboutPage.tsx       # About page content
│   ├── BlogLayout.tsx      # Main layout wrapper
│   ├── CommentSection.tsx  # Real-time comments
│   ├── CreatePostForm.tsx  # Post creation with live preview
│   ├── DarkModeToggle.tsx  # Theme switcher
│   ├── MarkdownContent.tsx # Markdown renderer
│   ├── PostCard.tsx        # Post preview cards
│   ├── PostView.tsx        # Post view page
│   ├── Sidebar.tsx         # Search and filtering
│   ├── SignInModal.tsx     # Authentication modal
│   └── SignUpForm.tsx      # Registration with Turnstile
├── hooks/
│   └── useDarkMode.ts      # Dark mode state management
└── lib/
    └── utils.ts            # Utility functions

convex/
├── auth.config.ts          # Authentication configuration
├── auth.ts                 # Auth helper functions
├── comments.ts             # Comment queries and mutations
├── posts.ts                # Post management with search
├── schema.ts               # Database schema definition
└── users.ts                # User management
```

## 🔧 Configuration

### Admin Setup
To create posts, you need admin privileges:

1. Sign up for an account through the application
2. In your Convex dashboard, find the `userProfiles` table
3. Create a profile entry for your user with `role: "admin"`

### Customization
- **Styling**: Modify `src/index.css` and Tailwind classes
- **Branding**: Update the sidebar content in `src/components/Sidebar.tsx`
- **Authentication**: Configure providers in `convex/auth.config.ts`

## 📝 Usage

### Creating Posts
1. Sign in with an admin account
2. Navigate to the create post page
3. Write your content using markdown
4. Use the live preview to see how it will look
5. Add tags for organization
6. Drag/drop or paste images directly into the editor

### Managing Content
- Posts are automatically published when created
- Tags are generated automatically from all posts
- Search indexes content in real-time
- Comments appear instantly across all clients

## 🚀 Deployment

### Deploy to Convex Production

1. **Deploy your backend**
   ```bash
   npx convex deploy --prod
   ```

2. **Update environment variables** for production
   ```bash
   VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
   ```

3. **Build and deploy frontend** to your preferred platform:
   ```bash
   npm run build
   ```

### Deployment Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Cloudflare Agents**: Edge deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Convex Documentation](https://docs.convex.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

---

Built with ❤️ using modern web technologies
