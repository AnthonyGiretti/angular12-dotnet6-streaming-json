# angular12-dotnet6-streaming-json

A full-stack demo project that showcases **JSON Streaming** between a .NET 6 Minimal API back-end and an Angular 12 front-end.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Versions & Main Dependencies](#versions--main-dependencies)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [How It Works](#how-it-works)
- [⚠️ Security Considerations](#️-security-considerations)

---

## Project Overview

Instead of waiting for all data to arrive in a single HTTP response, the server streams JSON objects one-by-one over a long-lived HTTP connection. The client parses and renders each item as it arrives — delivering a progressive, real-time feel **without** WebSockets or SignalR.

**Use case illustrated**: A "Country Wiki" page that progressively loads country records (id, name, description, flag URI, capital city, anthem, languages) as they are streamed from the API.

### Back-end (`back-end/`)

A **.NET 6 Minimal API** (`MinimalApiDemo`) with a single endpoint `GET /stream/countries` that yields `CountryModel` objects asynchronously using `IAsyncEnumerable<CountryModel>` and `Task.Delay(500)` between each item to simulate latency.

### Front-end (`front-end/`)

An **Angular 12** SPA (named `country-wiki-angular`) that uses the **[oboe.js](http://oboejs.com/)** library to consume the streamed JSON. The `JsonStreamingComponent` calls the API and appends each country to an array as it arrives, which Angular renders incrementally.

---

## Versions & Main Dependencies

### Back-end (.NET / C#)

| Component | Version |
|---|---|
| .NET / Target Framework | **net6.0** |
| C# Language Version | **preview** (C# 10 preview features) |
| Microsoft.OpenApi | 1.3.0-preview |
| Swashbuckle.AspNetCore | 6.1.5 |

Key back-end patterns used:

- ASP.NET Core **Minimal APIs** (no controllers)
- `IAsyncEnumerable<T>` for streaming responses
- Global CORS policy (`AllowAnyOrigin`, `AllowAnyMethod`, `AllowAnyHeader`) — **demo only**
- Global usings (`GlobalUsings.cs`)
- C# record classes (`CountryModel`)

### Front-end (Angular / TypeScript)

| Dependency | Version |
|---|---|
| Angular (all `@angular/*` packages) | ~12.2.0 |
| Angular CLI | ~12.2.4 |
| TypeScript | ~4.3.5 |
| RxJS | ~6.6.0 |
| Bootstrap | ^5.1.1 |
| **oboe** (JSON streaming client) | ^2.1.5 |
| google-protobuf (unused) | ^3.18.0-rc.2 |
| zone.js | ~0.11.4 |
| Karma (test runner) | ~6.3.0 |
| Jasmine | ~3.8.0 |

---

## Project Structure

```
angular12-dotnet6-streaming-json/
├── back-end/
│   ├── MinimalApiDemo.sln
│   └── MinimalApiDemo/
│       ├── MinimalApiDemo.csproj   # .NET 6 project file
│       ├── Program.cs              # Minimal API entry point + /stream/countries endpoint
│       ├── CountryModel.cs         # C# record model
│       ├── GlobalUsings.cs         # Global using directives
│       ├── appsettings.json
│       └── appsettings.Development.json
└── front-end/
    ├── package.json                # Angular 12 dependencies
    ├── angular.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── app.module.ts
        │   ├── app-routing.module.ts
        │   ├── app.component.*     # Root component
        │   ├── models/             # TypeScript model (CountryModel)
        │   └── json-streaming/     # Main streaming feature component
        │       ├── json-streaming.component.ts
        │       ├── json-streaming.component.html
        │       └── json-streaming.component.css
        └── environments/
            ├── environment.ts      # Dev environment config
            └── environment.prod.ts # Prod environment config
```

---

## How to Run

### Back-end

```bash
cd back-end
dotnet run --project MinimalApiDemo
# API will be available at https://localhost:5001
```

### Front-end

```bash
cd front-end
npm install
npm start
# App will be available at http://localhost:4200
```

---

## How It Works

The streaming flow works as follows:

1. The Angular component initializes **oboe.js** pointed at the configured API URL (e.g., `https://localhost:5001/stream/countries` in development — see [Security Issue 2](#-issue-2--hardcoded-localhost-url-in-production-code) for why this should be driven by environment configuration).
2. The .NET 6 Minimal API starts yielding `CountryModel` JSON objects one by one using `IAsyncEnumerable<CountryModel>`, with a 500 ms artificial delay between each item.
3. As each JSON object arrives over the HTTP stream, oboe.js fires a callback (`!.*` pattern matches each array element).
4. The callback appends the received `CountryModel` to the `countries` array.
5. Angular's change detection automatically updates the view to display each new country as it arrives.

---

## ⚠️ Security Considerations

This project is a **demo only** and contains several security issues that must be addressed before any production use.

### 🔴 Issue 1 — Wildcard CORS Policy

**File**: `back-end/MinimalApiDemo/Program.cs`

```csharp
builder.Services.AddCors(o => o.AddPolicy("AllowAll", builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
}));
```

**Problem**: The CORS policy allows **any origin, any method, and any header**. In a production environment this opens the API to cross-origin requests from any website, enabling potential CSRF-like data exfiltration.

**Recommendation**: Restrict `AllowAnyOrigin()` to specific, trusted origins:

```csharp
builder.WithOrigins("https://your-frontend-domain.com")
```

> **Note**: The CORS policy is also **registered but never applied** — `app.UseCors("AllowAll")` is missing from the middleware pipeline in `Program.cs`. This means CORS headers are not actually being sent, which would break the Angular front-end in a browser.

---

### 🔴 Issue 2 — Hardcoded `localhost` URL in Production Code

**File**: `front-end/src/app/json-streaming/json-streaming.component.ts`

```typescript
var config = {
  'url': "https://localhost:5001/stream/countries",
  ...
}
```

**Problem**: The API URL is **hardcoded to `localhost:5001`** directly in the component. This means the application will fail in any non-local environment (staging, production). It also leaks internal infrastructure details.

**Recommendation**: Use Angular's environment files (`environment.ts` / `environment.prod.ts`) to manage the API base URL per environment.

---

### 🟡 Issue 3 — `LangVersion=preview` in Production Project File

**File**: `back-end/MinimalApiDemo/MinimalApiDemo.csproj`

**Problem**: Using `<LangVersion>preview</LangVersion>` means the project relies on unstable, unreleased language features. This is fine for demos, but should not be used in production as preview features can change or be removed between previews.

**Recommendation**: Pin to a stable language version (e.g., `<LangVersion>10.0</LangVersion>` for .NET 6).

---

### 🟡 Issue 4 — No Authentication or Authorization

**Problem**: The `/stream/countries` endpoint has no authentication or authorization. Any anonymous caller on the network can access it. For a demo this is acceptable, but a production API should protect endpoints with appropriate auth (JWT Bearer, API keys, etc.).

---

### 🟡 Issue 5 — Outdated Dependencies (as of 2026)

**Problem**: All dependencies (Angular 12, .NET 6, oboe 2.1.5, Bootstrap 5.1.1, TypeScript 4.3.5) are **significantly outdated**. .NET 6 and Angular 12 have both reached **end-of-life**. Outdated dependencies may have known CVEs and no longer receive security patches.

**Recommendation**: Upgrade to currently supported versions.
