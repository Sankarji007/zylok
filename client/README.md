# Zylo Client

A React-based frontend application for the Zylo chat platform, built with Vite and TypeScript.

## Features

- **Authentication**: Integrated with Keycloak for secure user authentication
- **Signup Flow**: Custom signup form that integrates with the backend API
- **Protected Routes**: Route protection based on authentication status
- **Modern UI**: Built with Tailwind CSS for a clean, responsive design
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Keycloak JS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend services running (auth-service, keycloak)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Configuration

The application is configured to work with:
- **Backend API**: `http://localhost:8081` (proxied through Vite)
- **Keycloak**: `http://localhost:8080` (realm: master, client: zylo-web)

## Authentication Flow

1. **Signup**: Users can create accounts using the custom signup form
2. **Login**: Authentication is handled by Keycloak's login UI
3. **Token Management**: JWT tokens are automatically managed and refreshed
4. **API Calls**: All API requests include the bearer token for authentication

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
