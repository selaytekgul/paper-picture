# Authentication setup

Paper Picture supports three optional sign-in paths while keeping anonymous play available:

- ChatGPT uses OpenAI Sites’ native identity headers.
- Google and GitHub use application-owned OAuth through Auth.js.

All three paths produce a verified email on the server. Paper Picture normalizes that email and applies HMAC-SHA256 with `PROFILE_ID_SECRET` to derive the private player key. If two providers return the same normalized email, they open the same Paper Picture profile. A different email creates a separate profile.

## Production callbacks

Use these exact values in the provider dashboards:

| Provider | Application / homepage URL | Callback URL |
| --- | --- | --- |
| Google | `https://paperpicture.net` | `https://paperpicture.net/api/auth/callback/google` |
| GitHub | `https://paperpicture.net` | `https://paperpicture.net/api/auth/callback/github` |

For Google, add `https://paperpicture.net` as an authorized JavaScript origin. Request only the standard OpenID Connect identity scopes: `openid`, `email`, and `profile`.

For GitHub, the application requests `read:user` and `user:email` so the server can reject an email that GitHub does not mark as verified.

## Runtime configuration

Configure these values in the hosting control plane, never in Git:

```text
AUTH_SECRET=<long random production secret>
AUTH_GOOGLE_ID=<Google OAuth client ID>
AUTH_GOOGLE_SECRET=<Google OAuth client secret>
AUTH_GITHUB_ID=<GitHub OAuth client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth client secret>
PROFILE_ID_SECRET=<existing stable HMAC secret>
ADMIN_EMAIL=<existing owner email>
```

`AUTH_SECRET` protects Auth.js cookies and tokens. Rotating it signs out Google and GitHub sessions. Rotating `PROFILE_ID_SECRET` is a breaking identity migration because existing private profiles would no longer map to their owners.

## Data boundary

The Auth.js session uses a secured, HTTP-only cookie and expires after at most 30 days. Provider access and refresh tokens are not copied into the JWT session, Paper Picture profile, D1 gameplay tables, logs, or repository. The OAuth access token supplied during a GitHub callback is used transiently to confirm that the selected address is verified.

Before enabling a provider publicly, verify its consent-screen name, privacy-policy URL, homepage URL, callback URL, and support contact. Test successful sign-in, declined consent, callback failure, sign-out, and profile deletion for each provider.
