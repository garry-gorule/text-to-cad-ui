# Complete Text-to-CAD Generator - Next.js Super Prompt

You are tasked with building a complete Text-to-CAD Generator application from scratch using Next.js, Three.js, and modern web technologies. This is a comprehensive recreation of an existing SvelteKit application with enhanced features, powered by the **Zoo KittyCAD API**.

## 🎯 Project Overview

Build a professional Text-to-CAD Generator that converts natural language prompts into 3D CAD models using the **Zoo KittyCAD ML-ephant API**. The application should have a modern, Apple-level design aesthetic with premium animations and micro-interactions.

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

## 🦣 Zoo KittyCAD API Integration

### API Overview
The application uses the **Zoo KittyCAD ML-ephant API** for:
- Text-to-CAD generation
- CAD file format conversion
- 3D model processing

### API Endpoints
```typescript
// Zoo KittyCAD API Configuration
const KITTYCAD_API_BASE_URL = 'https://api.zoo.dev'

// Main endpoints used:
// POST /ai/text-to-cad/{output_format} - Generate CAD from text
// GET /user/text-to-cad - List user generations
// GET /user/text-to-cad/{id} - Get specific generation
// POST /user/text-to-cad/{id}?feedback={feedback} - Submit feedback
// POST /file/conversion/{input_format}/{output_format} - Convert formats
```

### Supported CAD Formats
```typescript
export type CADFormat = 
  | 'gltf' 
  | 'glb' 
  | 'stl' 
  | 'obj' 
  | 'step' 
  | 'ply' 
  | 'fbx'

export const CADMIMETypes: Record<CADFormat, string> = {
  fbx: 'application/octet-stream',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  obj: 'application/octet-stream',
  ply: 'application/octet-stream',
  stl: 'application/sla',
  step: 'application/STEP'
}
```

### API Integration Service
```typescript
// lib/kittycad/api.ts
export class KittyCADAPI {
  private baseURL = process.env.KITTYCAD_API_BASE_URL!
  private apiToken = process.env.KITTYCAD_API_TOKEN!

  async generateCAD(prompt: string, format: CADFormat = 'gltf') {
    const response = await fetch(`${this.baseURL}/ai/text-to-cad/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      },
      body: JSON.stringify({ prompt })
    })
    return response.json()
  }

  async convertFormat(data: Blob, outputFormat: CADFormat) {
    const response = await fetch(`${this.baseURL}/file/conversion/gltf/${outputFormat}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${this.apiToken}`
      },
      body: data
    })
    return response.json()
  }

  async getUserGenerations(pageToken?: string) {
    const url = new URL(`${this.baseURL}/user/text-to-cad`)
    if (pageToken) url.searchParams.set('page_token', pageToken)
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    })
    return response.json()
  }

  async getGeneration(id: string) {
    const response = await fetch(`${this.baseURL}/user/text-to-cad/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    })
    return response.json()
  }

  async submitFeedback(id: string, feedback: 'thumbs_up' | 'thumbs_down') {
    const response = await fetch(`${this.baseURL}/user/text-to-cad/${id}?feedback=${feedback}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    })
    return response.json()
  }
}
```

## 💬 AI Chat Interface

### Chat Component Features
- **Conversational UI** for prompt refinement
- **Prompt suggestions** and examples
- **Real-time typing indicators**
- **Message history** with context
- **Prompt optimization** suggestions

### Chat Implementation
```typescript
// components/chat/ChatInterface.tsx
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    promptSuggestions?: string[]
    generationId?: string
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Show typing indicator
    setIsTyping(true)

    try {
      // Process with AI assistant for prompt optimization
      const optimizedPrompt = await optimizePrompt(message)
      
      // Generate CAD model
      const generation = await generateCAD(optimizedPrompt)
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I've generated a CAD model based on your prompt: "${optimizedPrompt}"`,
        timestamp: new Date(),
        metadata: {
          generationId: generation.id,
          promptSuggestions: generateSuggestions(message)
        }
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Handle error
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ChatMessages messages={messages} isTyping={isTyping} />
      <ChatInput onSend={handleSendMessage} />
    </div>
  )
}
```

### Prompt Optimization
```typescript
// lib/ai/promptOptimizer.ts
export async function optimizePrompt(userInput: string): Promise<string> {
  // Analyze user input and suggest improvements
  const optimizations = [
    addDimensionsIfMissing(userInput),
    clarifyGeometry(userInput),
    addMaterialProperties(userInput),
    improveSpecificity(userInput)
  ]
  
  return optimizations.reduce((prompt, optimization) => 
    optimization(prompt), userInput
  )
}

function addDimensionsIfMissing(prompt: string): string {
  // Add default dimensions if not specified
  if (!hasDimensions(prompt)) {
    return `${prompt} (assume standard dimensions if not specified)`
  }
  return prompt
}

function clarifyGeometry(prompt: string): string {
  // Clarify geometric terms
  const geometryMappings = {
    'round': 'circular',
    'square': 'rectangular with equal sides',
    'hole': 'cylindrical through-hole'
  }
  
  let optimized = prompt
  Object.entries(geometryMappings).forEach(([term, clarification]) => {
    optimized = optimized.replace(new RegExp(term, 'gi'), clarification)
  })
  
  return optimized
}
```

## 🎨 Advanced CAD Viewer

### Enhanced 3D Viewer Features
- **Multi-format support** (GLTF, GLB, STL, OBJ, STEP)
- **Advanced camera controls** (orbit, pan, zoom, fly-to)
- **Measurement tools** for dimensions
- **Cross-sectioning** capabilities
- **Material and lighting controls**
- **Animation timeline** for complex models
- **Annotation system** for model features

### CAD Viewer Implementation
```typescript
// components/cad/CADViewer.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  Grid, 
  Edges, 
  Text,
  Html,
  useGLTF,
  useFBX,
  Center,
  Bounds
} from '@react-three/drei'

interface CADViewerProps {
  modelUrl: string
  format: CADFormat
  showGrid?: boolean
  showEdges?: boolean
  showMeasurements?: boolean
  enableCrossSections?: boolean
  annotations?: ModelAnnotation[]
}

export function CADViewer({ 
  modelUrl, 
  format, 
  showGrid = true,
  showEdges = true,
  showMeasurements = false,
  enableCrossSections = false,
  annotations = []
}: CADViewerProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<ModelLoadingFallback />}>
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <ModelRenderer 
                url={modelUrl} 
                format={format}
                showEdges={showEdges}
              />
            </Center>
          </Bounds>
          
          {showGrid && <Grid infiniteGrid />}
          
          <Environment preset="studio" />
          
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={100}
          />
          
          {showMeasurements && <MeasurementTools />}
          {enableCrossSections && <CrossSectionControls />}
          
          {annotations.map(annotation => (
            <ModelAnnotation key={annotation.id} {...annotation} />
          ))}
        </Suspense>
      </Canvas>
      
      <CADViewerControls 
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleEdges={() => setShowEdges(!showEdges)}
        onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
      />
    </div>
  )
}

function ModelRenderer({ url, format, showEdges }: {
  url: string
  format: CADFormat
  showEdges: boolean
}) {
  const model = useModelLoader(url, format)
  
  useEffect(() => {
    if (model) {
      // Apply Zoo's signature green color
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.color.setHex(0x29FFA4) // Zoo green
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [model])

  return (
    <group>
      {model && <primitive object={model} />}
      {showEdges && model && (
        <Edges 
          geometry={model.geometry} 
          color="#ffffff" 
          threshold={30}
        />
      )}
    </group>
  )
}

// Custom hook for loading different CAD formats
function useModelLoader(url: string, format: CADFormat) {
  const gltf = useGLTF(format === 'gltf' || format === 'glb' ? url : '')
  const fbx = useFBX(format === 'fbx' ? url : '')
  // Add other format loaders as needed
  
  return format === 'gltf' || format === 'glb' ? gltf.scene : 
         format === 'fbx' ? fbx : null
}
```

### Measurement Tools
```typescript
// components/cad/MeasurementTools.tsx
export function MeasurementTools() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isActive, setIsActive] = useState(false)
  
  return (
    <>
      {measurements.map(measurement => (
        <MeasurementLine key={measurement.id} {...measurement} />
      ))}
      
      {isActive && <MeasurementCursor />}
    </>
  )
}

function MeasurementLine({ start, end, distance }: Measurement) {
  return (
    <group>
      <Line points={[start, end]} color="yellow" lineWidth={2} />
      <Html position={[(start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2]}>
        <div className="bg-black text-white px-2 py-1 rounded text-sm">
          {distance.toFixed(2)} mm
        </div>
      </Html>
    </group>
  )
}
```

### Cross-Section Controls
```typescript
// components/cad/CrossSectionControls.tsx
export function CrossSectionControls() {
  const [plane, setPlane] = useState({ normal: [1, 0, 0], constant: 0 })
  
  return (
    <group>
      <mesh>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          color="red" 
          transparent 
          opacity={0.3}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}
```

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
│   │   ├── chat/
│   │   ├── view/[modelId]/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── convert/
│   │   ├── feedback/
│   │   ├── chat/
│   │   └── stripe/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   ├── models/
│   ├── cad/
│   ├── chat/
│   ├── billing/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── kittycad/
│   ├── ai/
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
  kittycad_api_token TEXT, -- Store user's KittyCAD API token
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text-to-CAD generations
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  optimized_prompt TEXT, -- AI-optimized version
  status TEXT DEFAULT 'pending',
  outputs JSONB,
  code TEXT, -- KCL code if available
  feedback TEXT,
  error TEXT,
  kittycad_generation_id TEXT, -- Reference to KittyCAD API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Chat conversations
CREATE TABLE public.chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
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

-- Chat policies
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

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
    features: ['10 generations', 'Basic support', 'Standard CAD formats']
  },
  pro: {
    name: 'Pro',
    price: 2000, // $20.00
    credits: -1, // unlimited
    features: [
      'Unlimited generations', 
      'Priority support', 
      'Advanced CAD formats',
      'AI chat assistance',
      'Advanced 3D viewer tools'
    ]
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
- Hero section with animated gradient background (using the provided component)
- 3D model preview (spur gear example)
- Typing animation for example prompt
- Sign-in CTA button
- Responsive design

### 2. Dashboard Layout
- Sidebar with navigation
- Generation history list
- User account menu
- New prompt button
- Chat interface toggle
- Mobile-responsive sidebar

### 3. AI Chat Interface
- Conversational prompt refinement
- Real-time suggestions
- Message history
- Typing indicators
- Prompt optimization feedback

### 4. Prompt Form
- Auto-resizing textarea
- Submit button with loading states
- Example prompts section
- Prompt writing tips
- Real-time validation
- AI assistance integration

### 5. Advanced 3D CAD Viewer
- Multi-format support (GLTF, GLB, STL, OBJ, STEP)
- Orbit controls (zoom, pan, rotate)
- Auto-rotate functionality
- Edge geometry rendering
- Zoo signature green material coloring
- Measurement tools
- Cross-sectioning capabilities
- Annotation system
- Responsive canvas

### 6. Generation List
- Time-bucketed organization (Today, Past 7 Days, etc.)
- Infinite scroll loading
- Status indicators (pending, completed, failed)
- Click to view details
- Unread indicators
- Chat context integration

### 7. Model View Page
- Full-screen advanced 3D viewer
- Download options (GLB, STL, OBJ, STEP, etc.)
- Feedback system (thumbs up/down)
- Retry functionality
- Model metadata display
- KCL code viewer (if available)
- Zoo Design Studio integration

### 8. Billing Components
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

### Models (KittyCAD Integration)
- `POST /api/models/generate` - Create new generation via KittyCAD
- `GET /api/models` - List user generations
- `GET /api/models/[id]` - Get specific generation
- `POST /api/models/[id]/feedback` - Submit feedback to KittyCAD
- `POST /api/models/convert` - Convert between formats via KittyCAD

### Chat
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations` - List user conversations
- `POST /api/chat/messages` - Send message
- `GET /api/chat/conversations/[id]/messages` - Get conversation messages

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
- Chat message animations

### Three.js Interactions
- Smooth camera transitions
- Auto-rotate with pause on interaction
- Responsive canvas sizing
- Progressive loading
- Measurement tool interactions
- Cross-section plane manipulation

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

### Mobile Optimizations
- Collapsible sidebar
- Touch-friendly 3D controls
- Optimized CAD viewer performance
- Simplified navigation
- Mobile chat interface

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
- KittyCAD API token management

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
- WebGL optimization

### Chat Performance
- Message virtualization
- Debounced typing indicators
- Optimistic updates

## 📊 Analytics & Monitoring

### User Analytics
- Generation success rates
- Popular prompts
- User engagement metrics
- Conversion tracking
- Chat usage patterns

### Error Monitoring
- Sentry integration
- API error tracking
- 3D rendering errors
- Performance monitoring
- KittyCAD API error handling

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Jest/RTL
- API endpoint testing
- Utility function testing
- KittyCAD integration testing

### Integration Tests
- Authentication flows
- Payment processing
- 3D rendering
- Database operations
- Chat functionality

### E2E Tests
- User journey testing
- Cross-browser compatibility
- Mobile responsiveness
- CAD generation workflow

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

# KittyCAD API
KITTYCAD_API_TOKEN=
KITTYCAD_API_BASE_URL=https://api.zoo.dev

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Next.js project setup with shadcn/ui
- [ ] Tailwind CSS configuration with Zoo color palette
- [ ] TypeScript configuration
- [ ] Basic routing structure
- [ ] Supabase integration
- [ ] KittyCAD API service setup

### Phase 2: Authentication
- [ ] Supabase Auth setup
- [ ] Sign-in/sign-up pages
- [ ] Protected routes
- [ ] User profile management
- [ ] Session handling

### Phase 3: Core Features
- [ ] Prompt form component
- [ ] KittyCAD API integration for text-to-CAD
- [ ] Advanced 3D CAD viewer with React Three Fiber
- [ ] Generation history
- [ ] Multi-format download functionality

### Phase 4: AI Chat Interface
- [ ] Chat conversation system
- [ ] Real-time messaging
- [ ] Prompt optimization AI
- [ ] Chat history persistence
- [ ] Integration with CAD generation

### Phase 5: Advanced CAD Viewer
- [ ] Multi-format model loading
- [ ] Measurement tools
- [ ] Cross-sectioning capabilities
- [ ] Annotation system
- [ ] Advanced camera controls

### Phase 6: Billing System
- [ ] Stripe integration
- [ ] Credit system
- [ ] Subscription management
- [ ] Webhook handlers
- [ ] Customer portal

### Phase 7: UI/UX Polish
- [ ] Responsive design
- [ ] Animations with Framer Motion
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility improvements
- [ ] Zoo branding integration

### Phase 8: Advanced Features
- [ ] Model feedback system
- [ ] Batch operations
- [ ] Export options
- [ ] Usage analytics
- [ ] Zoo Design Studio integration

### Phase 9: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Production deployment

## 🎯 Key Implementation Notes

1. **Start with KittyCAD API integration** - This is the core functionality
2. **Implement authentication first** - Everything else depends on user management
3. **Use TypeScript strictly** - Define interfaces for all KittyCAD API responses
4. **Implement the credit system early** - It affects user experience throughout the app
5. **Focus on mobile experience** - Many users will access on mobile devices
6. **Optimize 3D performance** - Use React.memo, useMemo, and Three.js best practices
7. **Handle loading states gracefully** - CAD model generation can take time
8. **Implement proper error boundaries** - Graceful degradation for failed operations
9. **Use React Query for data fetching** - Provides caching and synchronization
10. **Test KittyCAD integration thoroughly** - Use proper error handling for API failures
11. **Implement chat interface progressively** - Start simple, add AI features gradually
12. **Test Stripe integration thoroughly** - Use test mode extensively before going live

## 🔗 External Integrations

### KittyCAD/Zoo API
- Text-to-CAD generation endpoint
- Model conversion endpoints
- Authentication with API tokens
- Rate limiting handling
- Error response handling

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

## 🎨 Zoo Branding Integration

### Logo and Branding
- Use Zoo logo and ML-ephant branding
- Implement Zoo color scheme
- Add "Powered by Zoo ML-ephant API" attribution
- Link to Zoo Design Studio for advanced editing

### Example Prompts
Include Zoo-specific examples:
- "A 320mm vented brake rotor with 5 M12 holes on 114.3mm PCD"
- "Gallows frame, 2400x1250x450 mm, 6 brackets, angle iron"
- "A bone plate for a human femur, 8 holes, 4.5 mm screws"
- "Wing spar section"
- "Sash window, 500mm wide, 1000mm high, frame 30x50, 1 vertical bar"

This comprehensive prompt covers every aspect of building a professional Text-to-CAD Generator application with Next.js, including KittyCAD API integration, AI chat interface, advanced CAD viewer, authentication, billing, and modern UI/UX practices. Follow the implementation phases and checklist to build a production-ready application that leverages the full power of the Zoo ML-ephant API.