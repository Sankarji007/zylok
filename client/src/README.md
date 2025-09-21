# Zylo Client - Clean Architecture Implementation

This client application follows **Uncle Bob's Clean Architecture** principles with modern React patterns and **shadcn/ui** components.

## 🏗️ Architecture Overview

```
src/
├── core/                   # Enterprise Business Rules (Innermost Layer)
│   ├── entities/          # Business entities and value objects
│   ├── use-cases/         # Application business rules
│   └── repositories/      # Repository interfaces (Dependency Inversion)
│
├── infrastructure/        # Frameworks & Drivers (Outermost Layer)
│   ├── api/              # HTTP client implementations
│   ├── auth/             # Authentication service implementations
│   └── di/               # Dependency injection container
│
├── presentation/          # Interface Adapters
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   └── hooks/           # Custom React hooks
│
├── shared/               # Shared utilities and types
│   ├── constants/       # Application constants
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Utility functions
│
└── components/ui/        # shadcn/ui components
```

## 🎯 Clean Architecture Principles Applied

### 1. **Dependency Inversion Principle**
- Core layer defines interfaces (repositories)
- Infrastructure layer implements these interfaces
- Presentation layer depends on abstractions, not concretions

### 2. **Single Responsibility Principle**
- Each use case handles one specific business operation
- Components have single, focused responsibilities
- Services are specialized for their domain

### 3. **Separation of Concerns**
- **Entities**: Pure business logic, no framework dependencies
- **Use Cases**: Application-specific business rules
- **Infrastructure**: Framework-specific implementations
- **Presentation**: UI logic and user interactions

### 4. **Interface Segregation**
- Small, focused interfaces
- Clients depend only on methods they use

### 5. **Open/Closed Principle**
- Easy to extend with new features
- Closed for modification of existing core logic

## 📁 Layer Breakdown

### Core Layer (`src/core/`)

**Entities** (`entities/`)
- `User.ts`: User business entity with value objects (Email, Username)
- `Auth.ts`: Authentication domain models and errors

**Use Cases** (`use-cases/`)
- `AuthUseCases.ts`: Application business rules for authentication
  - LoginUseCase
  - LogoutUseCase  
  - RegisterUseCase
  - InitializeAuthUseCase

**Repository Interfaces** (`repositories/`)
- `AuthRepository.ts`: Authentication repository contract
- Defines what the core needs, not how it's implemented

### Infrastructure Layer (`src/infrastructure/`)

**API Services** (`api/`)
- `ApiService.ts`: HTTP client with interceptors
- Handles API communication with backend services

**Auth Implementations** (`auth/`)
- `KeycloakAuthRepository.ts`: Keycloak-specific implementation
- Implements the AuthRepository interface

**Dependency Injection** (`di/`)
- `Container.ts`: Wires up all dependencies
- Provides singleton access to services

### Presentation Layer (`src/presentation/`)

**Components** (`components/`)
- `ProtectedRoute.tsx`: Route protection with role-based access
- `SignupForm.tsx`: User registration form with validation

**Pages** (`pages/`)
- `LoginPage.tsx`: Modern login interface with shadcn/ui
- `HomePage.tsx`: Dashboard with user profile and quick actions

**Contexts** (`contexts/`)
- `AuthContext.tsx`: React context using clean use cases
- Manages authentication state across the app

## 🎨 UI Components (shadcn/ui)

Modern, accessible components built with:
- **Radix UI** primitives
- **Tailwind CSS** styling
- **Lucide React** icons
- **TypeScript** support

Key components used:
- Button, Card, Input, Label
- Alert, Toast, Dropdown Menu
- Avatar, Badge, Separator
- Form validation components

## 🔄 Data Flow

```
User Interaction → Presentation Layer → Use Cases → Repository Interface → Infrastructure Implementation
                                    ↓
                              Business Logic (Entities)
```

1. **User interacts** with UI components (Presentation)
2. **Components call** use cases with business logic
3. **Use cases** operate on entities and call repository interfaces
4. **Infrastructure** implements repositories (Keycloak, API calls)
5. **Results flow back** through the layers

## 🚀 Key Features

### Authentication Flow
- **Keycloak integration** with proper error handling
- **Token management** with automatic refresh
- **Role-based access control**
- **Session persistence** across page reloads

### Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Accessible components** from shadcn/ui

### Type Safety
- **Full TypeScript** coverage
- **Strict type checking** enabled
- **Interface-based** dependency injection

## 🔧 Development Benefits

### Testability
- **Pure functions** in use cases
- **Mocked repositories** for unit tests
- **Isolated components** for testing

### Maintainability
- **Clear separation** of concerns
- **Easy to locate** business logic
- **Framework-agnostic** core layer

### Scalability
- **Easy to add** new features
- **Plugin architecture** for new auth providers
- **Modular component** structure

### Developer Experience
- **Auto-completion** with TypeScript
- **Clear file organization**
- **Consistent patterns** across the app

## 🎯 Next Steps

1. **Add unit tests** for use cases and entities
2. **Implement error boundaries** for better error handling
3. **Add internationalization** (i18n) support
4. **Create Storybook** for component documentation
5. **Add performance monitoring** and analytics

## 📚 Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
