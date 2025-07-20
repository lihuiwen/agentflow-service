# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Uses `pnpm` as package manager (version 10.11.0+)
- Install dependencies: `pnpm install`

### Development
- Start development server: `pnpm start:dev` (with hot reload)
- Start with debugging: `pnpm start:debug`
- API documentation available at: http://localhost:3000/api-docs (development only)

### Build and Production
- Development build: `pnpm build:dev`
- Production build: `pnpm build:prod`
- Start production server: `pnpm start:prod`

### Testing
- Run unit tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`
- Run test coverage: `pnpm test:cov`
- Run e2e tests: `pnpm test:e2e`

### Code Quality
- Format code: `pnpm format`
- Lint and fix: `pnpm lint`

### Database (Prisma)
- Generate Prisma client: `npx prisma generate`
- Create database tables: `npx prisma db push`
- Run migrations: `npx prisma migrate dev`
- View database: `npx prisma studio`

## Architecture Overview

### Tech Stack
- **Framework**: NestJS v11 with TypeScript
- **Database**: PostgreSQL with Prisma ORM v6
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Validation**: class-validator and class-transformer

### Core Domain Models
This is an AI job distribution platform with three main entities:

1. **Agent**: AI agents that can accept and execute jobs
   - Contains agent metadata, wallet address, reputation, success rate
   - Supports private/public agents with auto-accept capabilities

2. **Job**: Tasks that need to be completed by agents
   - Includes budget, deadline, deliverables, and distribution settings
   - Supports both bidding and automatic distribution modes

3. **Job Distribution System**: Manages how jobs are assigned to agents
   - `JobDistributionRecord`: Tracks job distribution metadata
   - `JobDistributionAgent`: Many-to-many relationship tracking agent assignments
   - Supports parallel execution and detailed progress tracking

### Database Schema Key Features
- Uses PostgreSQL with Prisma ORM
- CUID for primary keys
- Enums for job status (`JobStatus`) and agent work status (`AgentWorkStatus`)
- JSON fields for flexible data storage (budget, match criteria)
- Comprehensive relationship tracking with cascade deletes

### Module Structure
- `src/agents/`: Agent management (CRUD, filtering, pagination)
- `src/jobs/`: Job management with distribution logic
- `src/category/`: Job categorization system
- `src/prisma/`: Database service with Lambda optimization
- `src/common/`: Shared DTOs, filters, and utilities

### Key Patterns
- **Global Exception Filter**: Centralized error handling with structured responses
- **Validation Pipeline**: Auto-transformation and validation for all requests
- **Prisma Service**: Optimized for Lambda with connection pooling and retry logic
- **Swagger Integration**: Auto-generated API documentation in development

### Environment-Specific Behavior
- Development: Enables query logging, Swagger docs
- Production: Minimal logging, no API docs
- Lambda: Special connection handling and health checks

### Service Layer Patterns
- Standard CRUD operations with pagination support
- Advanced filtering with `buildWhereClause` methods
- Consistent error handling with `NotFoundException`
- DTO validation for all inputs and outputs

## Development Notes

### Database Connections
The `PrismaService` is optimized for serverless environments with:
- Connection retry logic
- Lambda-specific connection handling
- Health check and warm-up methods

### Error Handling
All exceptions are processed through `GlobalExceptionFilter` which:
- Provides consistent error response format
- Logs errors appropriately based on severity
- Handles both HTTP and unexpected errors

### API Documentation
Swagger is automatically configured in development mode with:
- Organized tags for different modules
- Comprehensive endpoint documentation
- Available at `/api-docs` endpoint