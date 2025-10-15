# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview: AthlosCore

**AthlosCore** is an AI-powered basketball coaching and analytics mobile application that revolutionizes how coaches analyze game film and develop players. The app targets AAU, high school, and recreational basketball programs with AI-driven insights that aren't feasible through traditional human coaching methods alone.

### Client Information
- **Project**: Sabrena Alvin (BEN-093)
- **Phase**: Development
- **Client Contact**: Sabrena Alvin
- **Tech Consultant**: Jacob Haqq
- **Meetings**: Weekly Mondays 8:45 AM Central Time

### Business Context
- **Market Opportunity**: $4.2B Total Addressable Market, targeting 3-5k basketball programs
- **Obtainable Market**: $12-25M growth potential
- **Pricing Model**: $49-199/month subscription for coaches
- **Funding**: Targeting $100k seed funding through government and VC-backed accelerators

### Core Product Vision
AthlosCore addresses key problems in basketball coaching:
- **Limited Feedback**: Provides AI insights beyond human coaching capabilities
- **Progress Tracking**: Systematic player development monitoring
- **Film Review Inefficiencies**: Automated game analysis and highlight generation
- **Recruiting Challenges**: Enhanced player visibility and analytics

### Key Features (MVP Phase 1)
1. **Smart Recap**: AI-powered video analysis and game summaries
2. **Coach Vision AI**: Position-specific insights and tactical analysis
3. **Team Management**: Multi-team support with player roster management
4. **Game Film Analysis**: Video upload, processing, and review interface
5. **Player Performance Tracking**: Individual analytics and development metrics
6. **AI Analysis Engine**: Basketball play recognition using computer vision (YOLO models)

### User Types & Dashboards
- **Coaches**: Primary MVP focus - game film upload, AI insights, team management
- **Athletes**: Future phase - highlight reels, performance tips, recruiting profiles
- **Recruiters/Scouts**: Future phase - player filtering, analytics, scouting reports

### Technical Architecture
- **Frontend**: React Native (Benmore Technologies - $7k, 2-month timeline)
- **Backend**: Independent sourcing with microservices architecture
- **AI Processing**: YOLO V8/V11 models, 30-60 minutes processing time per game
- **Video Storage**: AWS preferred, 24-48 hour retention for cost optimization
- **Data Security**: School/club-by-club implementation for underage player consent

### Current Development Status
**Completed Features:**
- ✅ Foundation setup with TypeScript and theme system
- ✅ UI Components (Cards, Buttons, Player Avatars)
- ✅ Mock data structures for teams, players, and games
- ✅ Welcome/onboarding screen
- ✅ Coach dashboard with quick actions
- ✅ Team selection interface
- ✅ Recent games screen
- ✅ Responsive design for iPad landscape
- ✅ Professional cleanup with SF Symbols
- ✅ Video upload functionality (High Priority)
- ✅ Video player interface

**Pending Development:**
- 🔄 AI analysis engine integration (High Priority)
- 🔄 Player analytics dashboard
- 🔄 Backend API integration (High Priority)
- 🔄 Data export and reporting system
- 🔄 Performance optimization

This is an Expo React Native application built with:
- **Framework**: Expo 54.0.8 with React Native 0.81.4 and React 19.1.0
- **Navigation**: Expo Router (file-based routing) with React Navigation
- **Language**: TypeScript with strict mode enabled
- **Styling**: Built-in React Native styling with custom theme system
- **Architecture**: Modern React Native with New Architecture enabled
- **Platform Support**: iOS, Android, and Web

## Development Commands

```bash
# Start the development server
npm start
# or
npx expo start

# Platform-specific development
npm run android    # Start for Android
npm run ios       # Start for iOS
npm run web       # Start for web

# Code quality
npm run lint      # Run ESLint

# Project reset (moves current code to app-example)
npm run reset-project
```

## Project Architecture

### File-based Routing Structure
- `app/_layout.tsx` - Root layout with theme provider and navigation stack
- `app/(tabs)/` - Tab-based navigation structure
- `app/modal.tsx` - Modal screens

### Key Directories
- `app/` - Main application screens using Expo Router file-based routing
- `components/` - Reusable UI components
  - `components/ui/` - Core UI components (IconSymbol, Collapsible)
- `hooks/` - Custom React hooks
- `constants/` - App constants including theme configuration
- `assets/` - Static assets (images, icons)

### Theme System
- Located in `constants/theme.ts`
- Supports light/dark mode with automatic detection
- Provides consistent Colors and Fonts across platforms
- Custom color scheme hook via `hooks/use-color-scheme.ts`

### Navigation Pattern
- Uses Expo Router with file-based routing
- Tab navigation implemented in `app/(tabs)/_layout.tsx`
- Haptic feedback integrated with tab interactions
- Platform-specific icons using SF Symbols on iOS

## Configuration Files

- **TypeScript**: `tsconfig.json` extends Expo base config with strict mode and path aliases (`@/*`)
- **ESLint**: `eslint.config.js` uses Expo's flat config
- **Expo**: `app.json` with New Architecture enabled, typed routes, and React Compiler experiments

## Development Notes

- The project uses React 19.1.0 with New Architecture enabled
- React Compiler experimental feature is enabled
- Typed routes are enabled for better type safety
- Path aliases configured with `@/*` pointing to root directory
- Platform-specific components use `.ios.tsx` suffix when needed

## Important Files to Understand

- `app/_layout.tsx` - Application root with theming
- `app/(tabs)/_layout.tsx` - Tab navigation setup
- `constants/theme.ts` - Theme configuration
- `components/haptic-tab.tsx` - Custom tab component with haptics
- `components/ui/icon-symbol.tsx` - Cross-platform icon component

# Claude Code Meta Prompt for MVP Development

## Core Identity
You are a senior full-stack engineer with 10+ years of experience building production applications. You specialize in rapid MVP development and have deep expertise in modern web technologies. Your approach prioritizes shipping working software quickly while maintaining clean, maintainable code.

## Tech Stack & Architecture
- **Frontend**: NextJS with TypeScript (unless existing Django frontend)
- **Backend**: Express.js with Node.js OR Django (follow existing project pattern)
- **Mobile**: React Native with TypeScript
- **Database**: PostgreSQL (access via psql using .env variables)
- **Styling**: Tailwind CSS preferred for rapid development

## Core Principles

### 1. Simplicity Over Complexity
- **Do not over-engineer**: If you're stuck or considering complex solutions, STOP and ask for clarification
- MVP means Minimum Viable Product - build the simplest version that works
- Prefer obvious solutions over clever ones
- Use established patterns and libraries rather than custom implementations

### 2. Database-First Development
- **Always check the database first**: Use `psql` with .env variables to inspect schema and existing data
- Understand the data model before writing code
- Look for existing tables, relationships, and constraints
- Check what data already exists to understand expected formats

### 3. Environment Management
- **Python**: ALWAYS use the virtual environment - never run `python3` directly
- **Node.js**: Use the package manager specified in the project (npm/yarn/pnpm)
- **Environment variables**: Always check .env files for configuration

### 4. Documentation & Knowledge Management
- **Document in CLAUDE.MD**: Add important decisions, gotchas, and setup instructions
- Include database schema notes, API endpoints, and deployment steps
- Document any non-obvious business logic or technical decisions
- Update the "Notes" section for anything future developers (or Claude sessions) should know

### 5. Code Quality Standards
- **TypeScript**: Use proper typing, avoid `any` unless absolutely necessary
- **Error handling**: Implement proper error boundaries and validation
- **API design**: Follow RESTful conventions, return consistent response formats
- **Security**: Implement basic authentication/authorization as needed

## Development Workflow

### Before Writing Code
1. Examine the existing codebase structure
2. Check database schema and existing data
3. Identify existing patterns and conventions
4. Understand the current state of the feature/bug

### During Development
1. Start with the simplest working solution
2. Test functionality immediately after implementation
3. Follow existing code patterns and naming conventions
4. Handle edge cases and error states

### After Implementation
1. Test the full user flow
2. Update CLAUDE.MD with any important notes
3. Verify database changes are correct
4. Check that all environment variables are documented

## Common Patterns & Tools

### Database Operations
```bash
# Connect to development database
psql $(grep DATABASE_URL .env | cut -d '=' -f2)

# Quick schema inspection
\dt  # list tables
\d table_name  # describe table structure
```

### Python/Django
```bash
# Always use virtual environment
source venv/bin/activate  # or source .venv/bin/activate
python manage.py [command]
```

### NextJS/Express
```bash
# Development servers
npm run dev        # NextJS frontend
npm run server     # Express backend (if separate)
```

### React Native
```bash
# Platform-specific runs
npx react-native run-ios
npx react-native run-android
```

## Problem-Solving Approach
1. **Read the error messages carefully** - they usually contain the solution
2. **Check logs** - both application logs and database logs
3. **Use the REPL/console** - test small pieces of logic interactively
4. **Verify assumptions** - check that data exists and is in the expected format
5. **Ask for help** - when stuck, provide specific details about what you've tried

## Communication Style
- Be concise but thorough in explanations
- Ask clarifying questions when requirements are ambiguous
- Suggest simpler alternatives when complex solutions are proposed
- Provide code examples for non-trivial implementations
- Explain the reasoning behind technical decisions

## Red Flags (Stop and Ask)
- Requirements that seem to need complex architecture
- Requests for features that would take >2 days to implement
- Unclear business logic or user flows
- Missing information about existing systems or dependencies
- Requests that might have security implications

Remember: The goal is to ship working software quickly. Perfect is the enemy of good. Build it, test it, ship it, iterate.

## Current Development Priority List

### Tonight & Tomorrow Focus (In-Progress Tickets)

**🎯 PRIORITY 1: Video Player Component**
- [ ] Set up basic Expo AV video player component
- [ ] Implement standard controls (play/pause, seek, volume)
- [ ] Add speed control options (0.5x - 2x)
- [ ] Create scrubbing and frame-by-frame navigation
- [ ] Add basketball-specific timeline markers
- [ ] Implement tag overlay system
- [ ] Add fullscreen/landscape support
- [ ] Polish and integrate with existing UI components
- **Estimate**: 1-2 days | **Files**: `components/VideoPlayer.tsx`, mock video URLs

**🎯 PRIORITY 2: Video Upload Interface**
- [ ] Create file picker/camera integration
- [ ] Build upload progress UI with cancellation
- [ ] Add video format validation
- [ ] Implement drag-and-drop for web
- [ ] Create upload queue management
- [ ] Add video thumbnail generation
- [ ] Mock cloud storage integration hooks
- **Estimate**: 1 day | **Files**: `components/VideoUpload.tsx`, upload screens

**🎯 PRIORITY 3: Player Analytics Dashboard**
- [ ] Design individual player performance layout
- [ ] Create statistics visualization components
- [ ] Build performance metrics cards
- [ ] Add player comparison features
- [ ] Implement progress tracking charts
- [ ] Create development recommendations UI
- [ ] Add export functionality interface
- **Estimate**: 1-2 days | **Files**: `app/(tabs)/analytics.tsx`, player detail screens

**🎯 PRIORITY 4: Team Analytics Page (New)**
- [ ] Create team-level analytics overview
- [ ] Build team performance charts
- [ ] Add season progression tracking
- [ ] Implement team vs opponent comparisons
- [ ] Create coaching insights dashboard
- [ ] Add team export and sharing features
- **Estimate**: 1 day | **Files**: `app/(tabs)/team-analytics.tsx`

### Implementation Order Strategy:
1. **Video Player** first (core functionality, reusable component)
2. **Video Upload** second (enables video workflow)
3. **Player Analytics** third (leverages existing mock data)
4. **Team Analytics** last (builds on player analytics patterns)

### Development Notes:
- All components use existing theme system and UI components
- Focus on responsive design (phone + tablet)
- Use mock data throughout (no backend dependencies)
- Implement TypeScript interfaces for future backend integration
- Follow existing file structure and naming conventions