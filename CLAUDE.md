# Focal - Design & Development Guidelines

## Design Philosophy

### Typography Rules
- **NO gradients on text** - Avoid the oversaturated SaaS gradient text trend
- **Solid colors only** for text - Use our primary/secondary colors directly
- **Compact, professional typography** - Less rounded, more geometric
- **Clear hierarchy** - Distinguished heading sizes and weights
- **High readability** - Ensure proper contrast ratios at all times

### Gradient Usage
Gradients should be used sparingly and only for:
- Subtle backgrounds
- Card overlays with low opacity
- Progress bars and indicators
- Decorative elements (not text)

### Color Principles - Mental Health Focused
- **Primary (Sage Green #6B8E7F)** - Growth, balance, calm - main actions
- **Secondary (Soft Teal #5EEAD4)** - Clarity, freshness - highlights
- **Accent (Dusty Rose #D4A5A5)** - Warmth, comfort - special elements
- **Success (Soft Mint #86EFAC)** - Positive reinforcement without intensity
- **Warning (Warm Amber #FCD34D)** - Gentle alerts
- **Destructive (Soft Coral #F87171)** - Errors without harshness
- **Background (Warm Off-white #FAFAF9)** - Softer than pure white
- **Foreground (Deep Teal-gray #2D3E40)** - Readable without being harsh
- Use opacity variations for subtlety rather than new colors
- Avoid oversaturated colors that create anxiety

### UI Components
- **Cards** - Semi-transparent with subtle borders, no harsh shadows
- **Buttons** - Clear states, subtle hover effects
- **Inputs** - Clean borders, clear focus states
- **Animations** - Subtle and purposeful, never distracting

### General Principles
- **Calm over energetic** - Reduce anxiety, not create it
- **Clarity over cleverness** - Function before form
- **Consistency over variety** - Unified experience throughout
- **Whitespace is luxury** - Give elements room to breathe

## Development Guidelines

### Code Style
- Use Tailwind classes for styling
- Prefer composition over complex components
- Keep components small and focused
- Use TypeScript for type safety

### State Management
- Use Zustand for global state
- Keep server state in Supabase
- Optimistic updates for better UX

### Performance
- Use Next.js server components by default
- Client components only when necessary
- Lazy load heavy components
- Optimize images and assets

### Accessibility
- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance

## Project-Specific Rules

### Focus Sessions
- Multiple sessions per day allowed
- One active session at a time
- Session number increments throughout the day

### Database
- All queries use RLS policies
- Soft deletes for data recovery
- UTC timestamps everywhere

### Authentication
- Magic links as primary method
- OAuth as convenience option
- 30-day session persistence