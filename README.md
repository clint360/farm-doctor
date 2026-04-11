# Farm Doctor 🌾

AI-powered crop disease diagnosis platform for African farmers. Get instant expert advice on crop health via WhatsApp, Telegram, or voice calls in English, French & Pidgin.

## Features

- **AI Disease Detection** - Send crop photos to get instant AI diagnosis and treatment recommendations
- **Multi-Channel Support** - Access via WhatsApp, Telegram, or voice calls
- **Multi-Language** - Support for English, French, and Cameroon Pidgin English
- **Expert Network** - Connect with agricultural experts for personalized advice
- **Subscription Plans** - Flexible pricing from free tier to professional plans
- **Real-Time Insights** - Get actionable advice tailored to your location and season

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI**: React 19.2 with TypeScript
- **Styling**: Tailwind CSS 4
- **Internationalization**: Custom i18n context for multi-language support
- **Voice Integration**: Retell SDK for AI-powered voice calls
- **Backend**: External Fastify API

## Project Structure

```
├── app/
│   ├── page.tsx                 # Home page
│   ├── HomeClient.tsx           # Marketing hero section
│   ├── layout.tsx               # Root layout with metadata
│   ├── globals.css              # Global styles
│   ├── call/                    # AI voice call feature
│   ├── subscribe/               # Subscription management
│   ├── expert-apply/            # Expert application flow
│   └── insights/                # Crop disease search & insights
├── components/
│   ├── Navbar.tsx               # Navigation with language switcher
│   ├── Footer.tsx               # Footer with links
│   ├── FAQ.tsx                  # Frequently asked questions
│   ├── ScrollReveal.tsx         # Scroll animation observer
│   └── icons.tsx                # SVG icon exports
├── lib/
│   ├── i18n.tsx                 # Internationalization provider
│   └── contacts.ts              # Centralized contact details
└── public/                      # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Environment variables configured (see `.env.example`)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.farm-doctor.com
NEXT_PUBLIC_RETELL_BACKEND_URL=https://api.farm-doctor.com

# Contact Details (displayed on site)
NEXT_PUBLIC_WHATSAPP_NUMBER=237693477577
NEXT_PUBLIC_CALL_NUMBER=237680612360
NEXT_PUBLIC_COMPANY_PHONE=237693477577
NEXT_PUBLIC_TELEGRAM_BOT=Farm_doctor_bot
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/farm-doctor
```

**Note**: Only `NEXT_PUBLIC_*` variables are exposed to the client bundle at build time.

## API Endpoints

The frontend communicates with a Fastify backend at `NEXT_PUBLIC_API_URL`:

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/api/retell/create-web-call` | POST | Create AI voice call session |
| `/api/retell/call-ended` | POST | Report call duration |
| `/api/subscription` | GET/POST | Check/initiate subscription |
| `/api/expert-apply` | POST | Submit expert application |
| `/api/insights/search` | GET | Search crop disease insights |

## Features in Detail

### AI Voice Calls
- Real-time voice interaction with AI agricultural expert
- 3-minute daily free tier with subscription options
- Supports multiple languages

### Subscriptions
- Free, Starter, Pro, and Cooperative plans
- Payment via MTN Mobile Money and Orange Money
- Features unlocked by plan (voice minutes, image analyses, expert access)

### Expert Applications
- Join Farm Doctor's expert network
- Application fee: 5,000 FCFA (paid via mobile money)
- Link LinkedIn profile for credibility

### Crop Insights
- Search for any crop disease or condition
- Location-specific and season-aware advice
- Step-by-step treatment and prevention guides
- Community signals and weather considerations

## Security

Please review [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for security recommendations and best practices.

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Push and create a pull request
4. Deploy to Vercel on merge to main

## Deployment

The application is deployed on [Vercel](https://vercel.com):

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Environment variables configured in Vercel dashboard

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript strict mode
- ESLint passes (`npm run lint`)
- Changes work on mobile and desktop
- Multi-language compatibility is maintained

## License

Copyright © Farm Doctor. All rights reserved.

## Support

- **WhatsApp**: [Chat with us](https://wa.me/237693477577)
- **Telegram**: [@Farm_doctor_bot](https://t.me/Farm_doctor_bot)
- **Email**: support@farm-doctor.com
