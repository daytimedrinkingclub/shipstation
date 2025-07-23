# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShipStation is an AI-powered portfolio management service that generates personal websites through natural language prompts. Users interact through a chat interface to create and manage their websites.

**Live URL**: https://shipstation.ai

## Tech Stack

- **Backend**: Node.js + Express.js with Anthropic Claude API integration
- **Frontend**: React 18 + Vite + Tailwind CSS + Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3 for assets, Supabase for data
- **Real-time**: Socket.io for live progress tracking
- **Payments**: PayPal and Razorpay integration
- **Monitoring**: Sentry for error tracking

## Development Commands

```bash
# Backend development
npm run dev

# Frontend development
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Linting
npm run lint                # Backend
cd client && npm run lint   # Frontend

# Production
npm start
```

## Architecture

### Full-Stack Structure
- **Frontend**: `/client/` - React SPA with Vite
- **Backend**: `/server/` - Express API server
- **Public**: `/public/` - Built frontend served by Express
- **Database**: `/supabase/` - Migrations and config

### Key Backend Patterns
- **Service Layer**: Business logic in `/server/services/`
- **AI Tools**: Structured AI integrations in `/server/config/tools/`
- **Storage Strategy**: Abstracted storage with multiple backends
- **Real-time**: WebSocket integration for live website generation

### Key Frontend Patterns
- **Redux Store**: Centralized state with multiple slices
- **Context Providers**: AuthContext and SocketProvider for global state
- **Custom Hooks**: Reusable logic (`useDisclosure`, `useProject`)
- **Page-Based Routing**: Routes organized by main application flows

## Core Functionality

### AI-Powered Generation
- Uses Anthropic Claude API for website generation
- Structured tools for different AI capabilities
- Real-time progress tracking via WebSocket
- Code version control for generated websites

### User Flow
1. **Ship Creation**: Users describe their desired website
2. **AI Generation**: Claude generates HTML/CSS/JS code
3. **Live Preview**: Real-time preview with Monaco editor
4. **Deployment**: Websites deployed with custom domains

### Data Models
- **ships**: Generated websites with metadata
- **user_profiles**: User data and quota management
- **conversations**: AI chat history
- **code_versions**: Version control for code changes

## File Organization

### Frontend (`/client/src/`)
- `/pages/` - Main routes (Home, Ship, Edit, Portfolio)
- `/components/` - Reusable UI components
- `/store/` - Redux slices and configuration
- `/hooks/` - Custom React hooks
- `/lib/` - Utilities and API clients

### Backend (`/server/`)
- `/controllers/` - Request handlers
- `/services/` - Core business logic and AI integration
- `/routes/` - API endpoint definitions
- `/config/tools/` - AI tool configurations
- `/middleware/` - Express middleware

## Database Integration

- **Supabase Client**: Configured in both frontend and backend
- **Auth Integration**: User authentication with profiles
- **Real-time Subscriptions**: Live data updates where needed
- **Row Level Security**: Implemented for data protection

## Deployment

- **Platform**: Heroku (see Procfile)
- **Build Process**: Frontend builds to `/public/`, backend serves static files
- **Environment**: Multiple `.env` files for different stages
- **Static Assets**: Served from S3 bucket with CDN

## Testing Strategy

Check existing scripts in package.json for test commands. The project uses standard testing patterns but verify specific test runners before implementing new tests.