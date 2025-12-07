# PARTH AGROTECH

A modern agricultural commerce platform connecting farmers with factories and cold storage facilities.

![PARTH AGROTECH](https://img.shields.io/badge/PARTH-AGROTECH-green?style=for-the-badge)

## 🌱 Features

- **Farmer Registration** - Easy onboarding for farmers
- **Factory Dashboard** - Manage procurement and inventory
- **Admin Panel** - Comprehensive oversight and analytics
- **Cold Storage Management** - Track storage capacity and inventory
- **Bilingual Support** - English and Gujarati

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Vercel Serverless Functions
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/parth-agrotech.git
cd parth-agrotech
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your Supabase database URL
```

4. Push database schema
```bash
npm run db:push
```

5. Start development server
```bash
npm run dev
```

Visit `http://localhost:5000` to see the app.

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
│   ├── _lib/           # Shared utilities
│   ├── farmers.ts      # Farmer endpoints
│   ├── factories.ts    # Factory endpoints
│   ├── cold-storages.ts
│   ├── inventory.ts
│   ├── contact.ts
│   └── stats.ts
├── client/             # React frontend
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Page components
│       └── lib/        # Utilities & contexts
├── server/             # Express server (local dev)
├── shared/             # Shared types & schemas
└── vercel.json         # Vercel configuration
```

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable:
   - `DATABASE_URL` - Your Supabase connection string
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 💚 in Gujarat, India
