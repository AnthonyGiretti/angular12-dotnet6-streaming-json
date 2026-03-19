# Angular 12 + .NET 6 — JSON Streaming Demo

> **⚠️ This is a sample/demo project. It is NOT intended for production use as-is.**
> See the [Security Considerations](#security-considerations) section for details.

## Overview

This repository is a full-stack demonstration of how to **stream JSON data** from a REST API to a web front-end in real time — without waiting for the entire response to finish before rendering.

The back-end exposes a single endpoint that returns an `IAsyncEnumerable<CountryModel>`, yielding one country object every 500 ms. The front-end consumes that stream using the [oboe.js](http://oboejs.com/) library and appends each country to a table as soon as it arrives, giving a live, progressive-rendering experience.

---

## Architecture

```
angular12-dotnet6-streaming-json/
├── back-end/   ← ASP.NET Core 6 Minimal API (.NET 6)
└── front-end/  ← Angular 12 SPA
```

| Layer | Technology | Role |
|---|---|---|
| Back-end | ASP.NET Core 6 Minimal API | Streams `CountryModel` objects via `IAsyncEnumerable` |
| Front-end | Angular 12 + oboe.js | Consumes the stream and progressively renders a table |

---

## How It Works

```
Angular Frontend  ──── HTTP GET ──►  ASP.NET Core 6 Minimal API
(oboe.js consumer)                   (IAsyncEnumerable stream)
       │                                      │
       │◄── JSON chunks arrive one-by-one ────┘
       │
       └── Each country is appended to an HTML table immediately
```

### Server-side (back-end)

The endpoint `/stream/countries` is registered with `MapGet` and returns an `IAsyncEnumerable<CountryModel>`.  
ASP.NET Core's JSON serialization layer writes each object to the HTTP response body as it is yielded, flushing the response incrementally.  
A 500 ms `Task.Delay` between items simulates a slow or paginated data source.

```csharp
app.MapGet("/stream/countries", async () =>
{
    async IAsyncEnumerable<CountryModel> StreamCountriesAsync()
    {
        foreach (var country in countries)
        {
            await Task.Delay(500);
            yield return country;
        }
    }
    return StreamCountriesAsync();
});
```

### Client-side (front-end)

[oboe.js](http://oboejs.com/) opens an HTTP connection and fires a callback for every complete JSON node that matches the pattern `!.*` (i.e., every element of the top-level array).  
Each country is pushed into the component's `countries` array, triggering Angular change detection and appending a new row to the table instantly.

```typescript
const oboeService = oboe({ url: 'https://localhost:5001/stream/countries', method: 'GET' });
oboeService.node('!.*', (country: CountryModel) => {
  this.countries.push(country);
});
```

---

## Data Model

Both layers share the same `CountryModel` shape:

| Field | Type | Description |
|---|---|---|
| `id` | `int` / `number` | Unique identifier |
| `name` | `string` | Country name |
| `description` | `string` | Short description |
| `capitalCity` | `string` | Name of the capital city |
| `anthem` | `string` | National anthem title |
| `languages` | `string[]` | Spoken languages |
| `flagUri` | `string` | URL or path to the flag image |

---

## Tech Stack / Dependencies

### Back-end

| Item | Version |
|---|---|
| .NET / ASP.NET Core | 6.0 (`net6.0`) |
| C# Language | `preview` (C# 10 features) |
| Microsoft.OpenApi | `1.3.0-preview` |
| Swashbuckle.AspNetCore | `6.1.5` |

### Front-end

| Package | Version |
|---|---|
| Angular (core, common, router, forms, …) | `~12.2.0` |
| Angular CLI | `~12.2.4` |
| oboe (JSON streaming) | `^2.1.5` |
| Bootstrap | `^5.1.1` |
| RxJS | `~6.6.0` |
| TypeScript | `~4.3.5` |
| Zone.js | `~0.11.4` |
| google-protobuf | `^3.18.0-rc.2` |
| Karma / Jasmine (testing) | `~6.3.0` / `~3.8.0` |

---

## Project Structure

```
angular12-dotnet6-streaming-json/
│
├── back-end/
│   ├── MinimalApiDemo.sln
│   └── MinimalApiDemo/
│       ├── MinimalApiDemo.csproj
│       ├── Program.cs              ← Minimal API wiring + streaming endpoint
│       ├── CountryModel.cs         ← Shared data model (record class)
│       ├── GlobalUsings.cs         ← Global using directives
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       └── Properties/
│           └── launchSettings.json
│
└── front-end/
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── app.module.ts
        │   ├── app-routing.module.ts
        │   ├── app.component.{ts,html,css,spec.ts}
        │   ├── models/
        │   │   └── countryModel.ts       ← TypeScript model matching back-end
        │   └── json-streaming/
        │       ├── json-streaming.component.ts   ← oboe.js streaming logic
        │       ├── json-streaming.component.html ← Progressive table rendering
        │       └── json-streaming.component.css
        └── environments/
            ├── environment.ts            ← Dev environment (API base URL)
            └── environment.prod.ts       ← Prod environment (API base URL)
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 6.0 |
| [Node.js](https://nodejs.org/) | 14.x or 16.x (LTS) |
| [Angular CLI](https://angular.io/cli) | 12.x (`npm install -g @angular/cli@12`) |

---

### 1 — Run the back-end

```bash
cd back-end/MinimalApiDemo
dotnet run
```

By default the API listens on `https://localhost:5001` and `http://localhost:5000` (see `Properties/launchSettings.json`).

The streaming endpoint is available at:

```
GET https://localhost:5001/stream/countries
```

---

### 2 — Run the front-end

```bash
cd front-end
npm install
npm start        # or: ng serve
```

The Angular dev server starts at `http://localhost:4200`.  
Open that URL in your browser and watch the country table populate row by row as the stream arrives.

---

## Security Considerations

> ⚠️ **This project is a learning demo and contains several known security issues that would need to be addressed before any production deployment.**

### 1 — Wildcard CORS policy (not applied)

`Program.cs` registers a CORS policy named `"AllowAll"` that permits any origin, any HTTP method, and any header:

```csharp
builder.Services.AddCors(o => o.AddPolicy("AllowAll", builder =>
{
    builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
}));
```

There are two problems here:
- The policy is **overly permissive** — suitable only for a completely public, unauthenticated demo.
- `app.UseCors("AllowAll")` is **never called**, so the CORS middleware is registered but **not applied**. Any cross-origin request will actually be blocked by default.

**Fix:** Call `app.UseCors("AllowAll")` (or better, replace the wildcard policy with a specific allowed-origins list) before `app.MapGet(...)`.

---

### 2 — Hardcoded `localhost` URL in the production environment file

`front-end/src/environments/environment.prod.ts` contains:

```typescript
export const environment = {
  production: true,
  host: "https://localhost:5001"   // ← same as dev!
};
```

In a real production build (`ng build --configuration production`), all API calls would target `localhost`, which is almost certainly wrong.

**Fix:** Replace the value with the actual production API base URL before building for production.

---

### 3 — No authentication or authorization

The `/stream/countries` endpoint is completely open — no API keys, no JWT tokens, no cookies, no OAuth scopes. Anyone who can reach the server can call the endpoint.

**Fix:** Add an authentication middleware (e.g., `app.UseAuthentication()` / `app.UseAuthorization()`) and protect the endpoint with `[Authorize]` or `.RequireAuthorization()`.

---

### 4 — Pre-release / preview dependency versions

Two dependencies use pre-release version identifiers:

| Package | Version | Risk |
|---|---|---|
| `Microsoft.OpenApi` | `1.3.0-preview` | May have breaking changes or known bugs not yet fixed in stable |
| `google-protobuf` | `^3.18.0-rc.2` | RC build; should be replaced with a stable release |

**Fix:** Pin stable, GA releases of all production dependencies.

---

### 5 — No HTTPS redirect middleware

`Program.cs` does not call `app.UseHttpsRedirection()`. HTTP requests sent to port 5000 are served over plain HTTP without any redirect to HTTPS.

**Fix:** Add `app.UseHttpsRedirection()` after `var app = builder.Build();`.

---

### 6 — No rate limiting

The streaming endpoint has no rate-limiting or throttling in place. A single client could open many long-lived connections simultaneously, making it trivially easy to exhaust server resources (a basic denial-of-service vector).

**Fix:** Add rate-limiting middleware using a third-party library such as [`AspNetCoreRateLimit`](https://github.com/stefanprodan/AspNetCoreRateLimit), which supports .NET 6. (The built-in `Microsoft.AspNetCore.RateLimiting` package was introduced in .NET 7 and is not available for this project's target framework.)

---

## License / Contributing

This repository is provided as a **learning sample**. Feel free to fork it, adapt it, or open issues and pull requests for improvements.

No formal license file is present — treat the code as sample/reference material.
