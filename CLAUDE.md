# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CRM system for a beer distribution network called "Жидкое Золото" (Golden Liquid). It is a **polyglot benchmark project** with 3 backend implementations (Java, Go, Python) sharing a common Next.js frontend. The purpose is to compare backend implementations across different languages and databases.

## Architecture

**Frontend** (Next.js 16, React 19, TypeScript, Tailwind CSS v4):
- Uses shadcn/ui components (`frontend/components/ui/`)
- Custom CRM components in `frontend/components/crm/`
- API client at `frontend/lib/api-client.ts` with mock data fallback (`NEXT_PUBLIC_USE_MOCKS=true`)
- React Context for state management via `frontend/lib/store.ts`
- API hooks in `frontend/hooks/api/`
- Type definitions in `frontend/lib/types.ts`

**Backends** (3 implementations, same API):
| Backend | Language/Framework | Database | Status |
|---------|-------------------|----------|--------|
| **Java** | Spring Boot 3.2 | MongoDB | **Primary - actively developed** |
| Go | (placeholder) | MySQL | Not implemented |
| Python | (placeholder) | PostgreSQL | Not implemented |

**User's focus**: Java + MongoDB stack. Implement features in Java first; other backends are for comparison.

## Common Commands

Java + MongoDB (primary stack):
```bash
# Full build and run
make all-java

# Step by step
make build java
make up java

# Seed MongoDB with demo data
make migrate DB=mongo
```

Java development (local):
```bash
cd java
mvn package              # build JAR
mvn spring-boot:run      # run locally (requires MongoDB on localhost:27017)
mvn test                 # run tests
```

Frontend development:
```bash
cd frontend
npm install
npm run dev              # localhost:3000, talks to Java backend at :8080
npm run build
npm run lint
```

## Configuration

Copy `.env.example` to `.env`:
```
FRONTEND_PORT=3000
BACKEND_PORT=8080
API_URL=http://localhost:8080

DB_PASSWORD=pass
```

## Java Backend Structure

```
java/src/main/java/goldenliquid/backend/
├── JavaBackendApplication.java
├── controller/          # REST endpoints
│   ├── ProductController.java
│   ├── StoreController.java
│   └── ReportController.java
├── model/              # MongoDB documents
│   ├── Product.java
│   └── Store.java
├── repository/         # Spring Data MongoRepository
│   ├── ProductRepository.java
│   └── StoreRepository.java
└── service/            # Business logic (empty)
```

## Key Implementation Notes

- **Base path**: All controllers use `@RequestMapping("/api/v1")` prefix
- **MongoDB**: Uses Spring Data MongoDB with `@Document` annotations
- **CORS**: Enabled with `@CrossOrigin(origins = "*")` on controllers
- **Java 17**, **Spring Boot 3.2.4**
- **Lombok** is used for boilerplate reduction
- Frontend talks to Java backend at `http://localhost:8080`
- API specification is in `ENDPOINTS.md` (Russian language)
- Frontend has Russian UI; all entity names should match API docs
