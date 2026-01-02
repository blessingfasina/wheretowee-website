# Where To Wee - Website

The official website for Where To Wee, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌐 Live Site

- Production: [wheretowee.uk](https://wheretowee.uk)
- Also accessible via: [wheretowee.co.uk](https://wheretowee.co.uk) (redirects to .uk)

## 🚀 Features

- **Homepage** - App showcase with features, stats, and download CTAs
- **Interactive Map** - Find toilets using Leaflet.js
- **City Directory** - SEO-optimized pages for 30+ UK cities
- **Blog** - Content hub for toilet tips and guides
- **About & Legal** - Company info, privacy policy, terms

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Maps**: Leaflet.js with React-Leaflet
- **Icons**: Lucide React
- **Hosting**: Vercel (recommended)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for toilet data)

### Installation

```bash
# Navigate to website directory
cd website

# Install dependencies
npm install

# Copy environment file
cp env.example.txt .env.local

# Edit .env.local with your Supabase credentials
```

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://wheretowee.uk
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── map/               # Interactive map
│   ├── toilets/           # City directory
│   │   └── [city]/        # Dynamic city pages
│   ├── download/          # App download page
│   ├── about/             # About page
│   ├── blog/              # Blog listing
│   ├── contact/           # Contact form
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt config
├── components/            # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ToiletMap.tsx
├── lib/                   # Utilities
│   └── supabase.ts        # Supabase client
├── public/                # Static assets
│   └── manifest.json      # PWA manifest
└── package.json
```

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial website commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/wheretowee-website.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Set the **Root Directory** to `website`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
7. Click "Deploy"

### 3. Connect Custom Domain

1. In Vercel project settings → Domains
2. Add `wheretowee.uk`
3. Add `wheretowee.co.uk`
4. Copy the DNS records
5. In Namecheap:
   - Go to Domain List → Manage → Advanced DNS
   - Add the records Vercel provides

## 🔍 SEO Features

- **Meta tags** - Dynamic titles and descriptions
- **Open Graph** - Social sharing optimization
- **Sitemap** - Auto-generated XML sitemap
- **Robots.txt** - Search engine directives
- **Structured data** - Ready for Schema.org markup
- **City pages** - SEO-optimized local landing pages

## 📱 PWA Support

The site includes a web app manifest for PWA capabilities. Add icons:

- `/public/icon-192.png` (192x192)
- `/public/icon-512.png` (512x512)
- `/public/apple-touch-icon.png` (180x180)
- `/public/favicon.ico`

## 🗺️ Map Markers

Add these Leaflet marker images to `/public/`:

- `marker-icon.png`
- `marker-icon-2x.png`
- `marker-shadow.png`

Download from: https://unpkg.com/leaflet@1.9.4/dist/images/

## 📝 Adding Blog Posts

Currently using static data in `app/blog/page.tsx`. For a CMS:

1. Use MDX with `@next/mdx`
2. Or integrate Contentful/Sanity/Notion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

© 2025 Where To Wee. All rights reserved.

