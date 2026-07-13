# Paper Picture architecture

## System view

```mermaid
flowchart TB
    Player["Player browser"]
    Owner["Owner browser"]
    Worker["Paper Picture worker\nvinext + React routes"]
    Content["Immutable content registry\npapers, modes, collection versions"]
    Assets["Publisher figure assets"]
    Evidence["Rights audits + SHA-256 evidence"]
    Identity["Optional identity\nChatGPT headers or Auth.js OAuth"]
    Providers["Google and GitHub\nOAuth providers"]
    Service["Profile service\nauthorization, validation, scoring"]
    D1[("D1 private application data")]

    Player -->|"anonymous pages and play"| Worker
    Player -->|"optional authenticated save/feedback"| Identity
    Owner -->|"authenticated owner routes"| Identity
    Identity -->|"OAuth exchange"| Providers
    Identity --> Worker
    Worker --> Content
    Content --> Assets
    Content -. "release invariant" .-> Evidence
    Worker --> Service
    Service --> D1
    Owner -->|"feedback, metrics, backup"| Service
```

## Trust and privacy boundaries

- Anonymous play runs entirely from public, immutable collection data. A failed save request does not block the game.
- Authenticated APIs accept native ChatGPT identity headers or a Google/GitHub Auth.js session, then derive a pseudonymous player key with HMAC-SHA256. Raw email and provider access tokens are not written to gameplay tables.
- Google and GitHub identities are accepted only when the provider confirms the selected email is verified. The OAuth session is a secured, HTTP-only site cookie with a 30-day maximum lifetime.
- The service recalculates saved answers and scores from the immutable collection; the browser’s claimed score is never trusted.
- Owner APIs require both an authenticated identity and an exact configured owner email. Non-owners receive a not-found response.
- D1 stores profiles, games, attempts, feedback, short-lived rate limits, and aggregate event counters.
- Operational counters have only an event name, hourly bucket, and count. They do not contain a user, IP, URL, paper, or message field.
- Public health data is generated from the content registry and never queries player tables.

## Content boundary

Each collection is independently versioned and fails closed: only papers and figures marked `approved`, with sufficient figures and matching evidence, become playable. Release tests verify the IDs, expected asset count, license records, and exact SHA-256 hashes.

```mermaid
flowchart LR
    Candidate["Candidate paper"] --> License{"Explicit reusable\narticle license?"}
    License -->|"no"| Reject["Reject"]
    License -->|"yes"| Credit{"Separate figure\ncredit or exclusion?"}
    Credit -->|"yes / uncertain"| Reject
    Credit -->|"no"| Metadata["Verify authors, affiliation, venue, year"]
    Metadata --> Accessibility["Caption + alt text review"]
    Accessibility --> Hash["Store publisher asset + checksum"]
    Hash --> Collection["Freeze new collection version"]
```

## Request paths

| Path | Identity | Data touched |
| --- | --- | --- |
| `/`, `/privacy`, `/test-guide`, `/sign-in`, `/api/health` | None | Public collection metadata only |
| `/api/auth/*` | Google or GitHub | Temporary OAuth exchange and secured session cookie |
| `/api/game-sessions*`, `/api/profile`, `/api/feedback` | Player | That player’s pseudonymous rows |
| `/admin/feedback`, `/api/admin/feedback`, `/api/admin/metrics`, `/api/admin/backup` | Owner | Owner-authorized private operational data |

## Deployment

The repository builds a Cloudflare Workers-compatible bundle through vinext. OpenAI Sites owns the production project, D1 binding, environment values, saved deployment versions, custom-domain routing, and managed certificate. Google and GitHub credentials remain portable application secrets, so the same Auth.js routes can move with a later hosting decision. Generated Drizzle migrations are committed with the code that uses them.
