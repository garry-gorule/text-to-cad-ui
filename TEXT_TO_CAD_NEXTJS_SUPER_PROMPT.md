# Complete Text-to-CAD Generator - Next.js Super Prompt

You are tasked with building a complete Text-to-CAD Generator application from scratch using Next.js, Three.js, and modern web technologies. This is a comprehensive recreation of an existing SvelteKit application with enhanced features.

## 🎯 Project Overview

Build a professional Text-to-CAD Generator that converts natural language prompts into 3D CAD models. The application should have a modern, Apple-level design aesthetic with premium animations and micro-interactions.

## 🏗️ Tech Stack Requirements

### Core Framework
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Three.js** with React Three Fiber for 3D rendering
- **Framer Motion** for animations

### Database & Backend
- **Supabase** for database and authentication
- **Prisma** as ORM (optional, can use Supabase client directly)
- **Next.js API routes** for backend logic

### Payment & Billing
- **Stripe** for payment processing
- **Stripe Webhooks** for subscription management
- **Stripe Customer Portal** for billing management

### Additional Libraries
- **React Hook Form** for form handling
- **Zod** for schema validation
- **React Query/TanStack Query** for data fetching
- **Zustand** for state management
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--green: #29FFA4;
--blue: #3C73FF;
--yellow: #E4ED78;
--magenta: #FF00F6;

/* Chalkboard Scale (Neutral) */
--chalkboard-10: oklch(93% 0.017 125.7deg);
--chalkboard-20: oklch(86.75% 0.01564 132.2deg);
--chalkboard-30: oklch(80.49% 0.01427 138.7deg);
--chalkboard-40: oklch(74.24% 0.01291 145.2deg);
--chalkboard-50: oklch(67.98% 0.01155 151.7deg);
--chalkboard-60: oklch(61.73% 0.01018 158.2deg);
--chalkboard-70: oklch(55.47% 0.008818 164.7deg);
--chalkboard-80: oklch(49.22% 0.007455 171.2deg);
--chalkboard-90: oklch(42.96% 0.006091 177.7deg);
--chalkboard-100: oklch(36.71% 0.004727 184.2deg);
--chalkboard-110: oklch(30.45% 0.003364 190.7deg);
--chalkboard-120: oklch(24.2% 0.002 197.2deg);

/* Status Colors */
--destroy-10: oklch(88.21% 0.06281 14.85deg);
--destroy-40: oklch(73.27% 0.1297 21.01deg);
--destroy-80: oklch(53.35% 0.2189 29.23deg);

--succeed-10: oklch(89% 0.16 143.4deg);
--succeed-80: oklch(48.62% 0.1654 142.5deg);
```

### Typography
- **Display Font**: "Owners" (custom font)
- **Mono Font**: "OCR A Tribute Pro Monospaced"
- **Sans Font**: System font stack fallback

### Design Principles
- Apple-level design aesthetics
- Meticulous attention to detail
- Intuitive user experience
- Clean, sophisticated visual presentation
- Tasteful animations and micro-interactions
- Responsive design (mobile-first)

## 🔧 Project Setup Instructions

### 1. Initialize Next.js Project with shadcn/ui
```bash
npx create-next-app@latest text-to-cad-generator --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd text-to-cad-generator
npx shadcn-ui@latest init
```

### 2. Install Core Dependencies
```bash
# Core libraries
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @react-three/fiber @react-three/drei three
npm install framer-motion
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install react-hot-toast
npm install lucide-react

# Stripe
npm install stripe @stripe/stripe-js

# Development dependencies
npm install -D @types/three
```

### 3. Install shadcn/ui Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── view/[modelId]/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── convert/
│   │   ├── feedback/
│   │   └── stripe/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   ├── models/
│   ├── billing/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── utils/
│   ├── hooks/
│   ├── stores/
│   └── types/
├── styles/
└── public/
```

## 🔐 Authentication System

### Supabase Setup
1. Create Supabase project
2. Configure authentication providers (email/password)
3. Set up RLS policies
4. Create user profiles table

### Database Schema
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 10,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text-to-CAD generations
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  outputs JSONB,
  code TEXT,
  feedback TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- in cents
  credits INTEGER NOT NULL,
  stripe_price_id TEXT NOT NULL
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Generations policies
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

## 💳 Credits & Billing System

### Credit System
- **Free users**: Start with 10 credits
- **Pro users**: Unlimited credits (or higher limit)
- **Credit deduction**: 1 credit per generation
- **Credit tracking**: Real-time updates in UI

### Stripe Integration

#### Subscription Plans
```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 10,
    features: ['10 generations', 'Basic support']
  },
  pro: {
    name: 'Pro',
    price: 2000, // $20.00
    credits: -1, // unlimited
    features: ['Unlimited generations', 'Priority support', 'Advanced features']
  }
}
```

#### Stripe Webhook Handlers
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🎨 UI Components & Features

### 1. Landing Page
- Hero section with animated gradient background
- 3D model preview (spur gear example)
- Typing animation for example prompt
- Sign-in CTA button
- Responsive design

### 2. Dashboard Layout
- Sidebar with navigation
- Generation history list
- User account menu
- New prompt button
- Mobile-responsive sidebar

### 3. Prompt Form
- Auto-resizing textarea
- Submit button with loading states
- Example prompts section
- Prompt writing tips
- Real-time validation

### 4. 3D Model Viewer
- Three.js integration with React Three Fiber
- Orbit controls (zoom, pan, rotate)
- Auto-rotate functionality
- Edge geometry rendering
- Green material coloring
- Responsive canvas

### 5. Generation List
- Time-bucketed organization (Today, Past 7 Days, etc.)
- Infinite scroll loading
- Status indicators (pending, completed, failed)
- Click to view details
- Unread indicators

### 6. Model View Page
- Full-screen 3D viewer
- Download options (GLB, STL, OBJ, etc.)
- Feedback system (thumbs up/down)
- Retry functionality
- Model metadata display

### 7. Billing Components
- Credit counter in header
- Upgrade prompts for free users
- Stripe Checkout integration
- Customer portal access
- Usage analytics

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/auth/user`

### Models
- `POST /api/models/generate` - Create new generation
- `GET /api/models` - List user generations
- `GET /api/models/[id]` - Get specific generation
- `POST /api/models/[id]/feedback` - Submit feedback
- `POST /api/models/convert` - Convert between formats

### Billing
- `POST /api/billing/create-checkout` - Create Stripe checkout
- `POST /api/billing/create-portal` - Create customer portal
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `GET /api/billing/usage` - Get usage statistics

## 🎭 Animation & Interactions

### Framer Motion Animations
- Page transitions
- Component entrance animations
- Loading states
- Hover effects
- Micro-interactions

### Three.js Interactions
- Smooth camera transitions
- Auto-rotate with pause on interaction
- Responsive canvas sizing
- Progressive loading

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

### Mobile Optimizations
- Collapsible sidebar
- Touch-friendly controls
- Optimized 3D performance
- Simplified navigation

## 🔒 Security Features

### Authentication Security
- JWT token validation
- Secure cookie handling
- CSRF protection
- Rate limiting

### API Security
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚀 Performance Optimizations

### Next.js Features
- App Router with streaming
- Server components where possible
- Image optimization
- Code splitting

### 3D Performance
- LOD (Level of Detail) for complex models
- Frustum culling
- Texture compression
- Progressive loading

## 📊 Analytics & Monitoring

### User Analytics
- Generation success rates
- Popular prompts
- User engagement metrics
- Conversion tracking

### Error Monitoring
- Sentry integration
- API error tracking
- 3D rendering errors
- Performance monitoring

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Jest/RTL
- API endpoint testing
- Utility function testing

### Integration Tests
- Authentication flows
- Payment processing
- 3D rendering
- Database operations

### E2E Tests
- User journey testing
- Cross-browser compatibility
- Mobile responsiveness

## 🚀 Deployment

### Vercel Deployment
- Environment variables setup
- Database migrations
- Stripe webhook configuration
- Domain configuration

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# API
KITTYCAD_API_TOKEN=
KITTYCAD_API_BASE_URL=

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Next.js project setup with shadcn/ui
- [ ] Tailwind CSS configuration
- [ ] TypeScript configuration
- [ ] Basic routing structure
- [ ] Supabase integration

### Phase 2: Authentication
- [ ] Supabase Auth setup
- [ ] Sign-in/sign-up pages
- [ ] Protected routes
- [ ] User profile management
- [ ] Session handling

### Phase 3: Core Features
- [ ] Prompt form component
- [ ] Text-to-CAD API integration
- [ ] 3D model viewer with Three.js
- [ ] Generation history
- [ ] Model download functionality

### Phase 4: Billing System
- [ ] Stripe integration
- [ ] Credit system
- [ ] Subscription management
- [ ] Webhook handlers
- [ ] Customer portal

### Phase 5: UI/UX Polish
- [ ] Responsive design
- [ ] Animations with Framer Motion
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility improvements

### Phase 6: Advanced Features
- [ ] Model feedback system
- [ ] Advanced 3D controls
- [ ] Batch operations
- [ ] Export options
- [ ] Usage analytics

### Phase 7: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Production deployment

## 🎯 Key Implementation Notes

1. **Start with the shadcn/ui setup** - This provides the foundation for consistent UI components
2. **Implement authentication first** - Everything else depends on user management
3. **Use TypeScript strictly** - Define interfaces for all data structures
4. **Implement the credit system early** - It affects user experience throughout the app
5. **Focus on mobile experience** - Many users will access on mobile devices
6. **Optimize 3D performance** - Use React.memo, useMemo, and Three.js best practices
7. **Handle loading states gracefully** - 3D model generation can take time
8. **Implement proper error boundaries** - Graceful degradation for failed operations
9. **Use React Query for data fetching** - Provides caching and synchronization
10. **Test Stripe integration thoroughly** - Use test mode extensively before going live

## 🔗 External Integrations

### KittyCAD/Zoo API
- Text-to-CAD generation endpoint
- Model conversion endpoints
- Authentication with API tokens
- Rate limiting handling

### Stripe Services
- Checkout Sessions
- Customer Portal
- Webhook Events
- Subscription Management

### Supabase Services
- Authentication
- Database
- Real-time subscriptions
- Storage (for model files)

This comprehensive prompt covers every aspect of building a professional Text-to-CAD Generator application with Next.js, including authentication, billing, 3D rendering, and modern UI/UX practices. Follow the implementation phases and checklist to build a production-ready application.