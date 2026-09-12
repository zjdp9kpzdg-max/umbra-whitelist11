# UMBRA Whitelist

Petition site for UMBRA. Visitors open the page from the X post, complete the quest, leave an ETH wallet, and submit for consideration. Submission is not a whitelist. Jeremy reviews and approves who is added to the mint list.

Tagline: *Relics worn in shadow.*

Official X: [@UMBRAStudio11](https://x.com/UMBRAStudio11)

**Visitors only click Connect X. Project owner sets Twitter OAuth env vars in hosting — never in the chat.**

End users never enter API keys. There is no secrets field in the UI. Tokens live only in `.env.local` or the host’s project settings (for example Vercel). Do not paste Twitter keys into chat with an assistant.

UMBRA is an independent project. Minting on Ethereum mainnet.

## Visitor flow

1. Open `/`, `/list`, or `/whitelist`
2. Connect X **or**, if OAuth is not configured, leave an X handle
3. Like + retweet the quest post
4. Leave a required ETH wallet
5. Submit a petition (status: **pending**). Selection is not guaranteed.

## Auth modes

### Bearer token (app-only) — what Jeremy has now

Set `TWITTER_BEARER_TOKEN` in hosting. This is an **app-only** token.

It can:

- Resolve an X handle to a user id (`GET /2/users/by/username/:username`)
- Check retweets of the quest post (`GET /2/tweets/:id/retweeted_by`)
- Attempt likes (`GET /2/tweets/:id/liking_users`) — X often rejects this for app-only auth

**A Bearer token cannot power Connect X.** Sign in with X requires User authentication and an OAuth 2.0 Client ID + Client Secret from the Developer Portal. Visitors still enter a handle. Verify Marks uses the Bearer token. If like reads are forbidden, the like box stays as honor-system for that mark only.

### OAuth 2.0 (Connect X)

Set `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` in hosting.

- Visitors only click **Connect X**
- Sign in with X (OAuth 2.0 PKCE)
- Server verifies like + RT with the user access token (`liked_tweets` + `retweeted_by`)

You can set Bearer and OAuth together. Connect X still uses the OAuth client. Bearer is the fallback when the visitor is not signed in.

### Honor-system (no OAuth client)

If Client ID/Secret are missing, Connect X stays disabled. Visitors leave a handle, open Like / Repost, mark complete, leave a wallet. Registration still writes the CSV.

If Bearer is also missing, both like and RT are honor-system.

`TARGET_TWEET_ID` is TBD until the Coming Soon RT is posted on [@UMBRAStudio11](https://x.com/UMBRAStudio11). Like / Repost stay dark until that id is set in hosting. It is a public status id, not a secret.

## Run locally (port 43147)

OAuth callback path is always:

`/api/auth/twitter/callback`

Full local callback URL (must match the Developer Portal exactly):

`http://127.0.0.1:43147/api/auth/twitter/callback`

```bash
cp .env.example .env.local
```

In `.env.local` (never paste these into chat):

```bash
TWITTER_CLIENT_ID=your_oauth_client_id
TWITTER_CLIENT_SECRET=your_oauth_client_secret
TWITTER_CALLBACK_URL=http://127.0.0.1:43147/api/auth/twitter/callback
SESSION_SECRET=a-long-random-secret-at-least-32-chars
ADMIN_TOKEN=a-long-random-admin-token
DATABASE_URL=file:./data/umbra.sqlite
# TARGET_TWEET_ID=   # leave empty until the Coming Soon RT is posted
# TWITTER_BEARER_TOKEN=   # optional app-only token
```

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147). The same UI is at `/list` and `/whitelist`.

Developer Portal callback for local must be exactly `http://127.0.0.1:43147/api/auth/twitter/callback` (127.0.0.1, not localhost, unless you change both sides).

Put tokens only in `.env.local` or Vercel — never send them in chat.

## Public preview (live now)

While Vercel is not yet connected, the app is on a public HTTPS tunnel:

**Site:** https://editor-recent-movies-gis.trycloudflare.com  
**OAuth callback:** `https://editor-recent-movies-gis.trycloudflare.com/api/auth/twitter/callback`  
**Website URL for the X portal:** `https://editor-recent-movies-gis.trycloudflare.com`

`/`, `/list`, and `/whitelist` all work. This tunnel is bound to the current cloud agent machine and can change if the session restarts. For a stable `*.vercel.app` URL, Jeremy must connect Vercel (below).

## Why “Redeploy” fails on the claimed site

The first `*.vercel.app` URL was an **anonymous prebuilt** upload (`next build` ran here, then the output was uploaded). Vercel cannot Redeploy those: **“Prebuilt deployments cannot be redeployed.”** Adding Production env vars does not change that bundle, which is why `/api/session` still shows `"oauthEnabled": false`.

You need a **new source build** on Vercel (Git connect or `vercel deploy` from a linked repo), not Redeploy on the old deployment.

### Create a source Production deploy (claimed project)

1. Open the claimed project in Vercel (the one that owns `temporary-brisk-redwood-h71v4qh` / `*-phi-vert`).
2. **Settings → Git → Connect Git Repository**.
   - **Hobby:** connect **GitHub** (Origin private repos cannot deploy on Hobby). Push this repo to GitHub, then import it.
   - **Pro:** **Continue with Origin** and select this repo.
3. Confirm Production env vars are on **Production** (not Preview only): `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `TWITTER_CALLBACK_URL`, `SESSION_SECRET`, `ADMIN_TOKEN`, optional `TWITTER_BEARER_TOKEN` / `TARGET_TWEET_ID`.
4. **Deployments → Create Deployment** → branch `main` (or the GitHub commit) → Production.
5. Wait until the new deployment is **Ready**. Ignore Redeploy on the old prebuilt row.
6. **Settings → Domains** → add `umbra-whitelist.vercel.app` if it is still free.
7. Open `https://<that-host>/api/session` and confirm `"oauthEnabled":true`.
8. X Developer Portal website + callback must match that host: `https://<that-host>/api/auth/twitter/callback`.

## Deploy on Vercel (`*.vercel.app`)

This agent cannot stay logged into Jeremy’s Vercel account. Origin → Vercel exists, but **Origin repos are private and cannot deploy from a Vercel Hobby team**. Use a **Vercel Pro** team, or push a copy to GitHub and import that on Hobby.

### Clicks on Vercel (Pro + Origin)

1. Name this project with the **Create repo** pill in Cursor (Origin).
2. Open [vercel.com/new](https://vercel.com/new).
3. Click **Continue with Origin**.
4. Choose the Origin team → allow the Vercel team to see its repos.
5. Select this whitelist repo.
6. Framework preset: **Next.js**.
7. Add env vars (Production + Preview), then **Deploy**.
8. Copy the `https://<name>.vercel.app` URL. In the X Developer Portal add:
   - Website URL: `https://<name>.vercel.app`
   - Callback: `https://<name>.vercel.app/api/auth/twitter/callback`

### Clicks if you only have Vercel Hobby

Hobby cannot import Origin private repos. Instead:

1. Create a GitHub repo and push this project.
2. Vercel → **Add New… → Project** → **Import** the GitHub repo.
3. Same env vars as below → **Deploy**.

### Environment variables (Vercel dashboard only — never in chat)

| Name | What to paste |
| --- | --- |
| `TWITTER_CLIENT_ID` | OAuth 2.0 client id |
| `TWITTER_CLIENT_SECRET` | OAuth 2.0 client secret |
| `TWITTER_CALLBACK_URL` | `https://<name>.vercel.app/api/auth/twitter/callback` |
| `TWITTER_BEARER_TOKEN` | Optional app-only token |
| `TARGET_TWEET_ID` | Leave empty until the Coming Soon RT is posted |
| `SESSION_SECRET` | Generate 32+ random characters |
| `ADMIN_TOKEN` | CSV export secret |
| `DATABASE_URL` | Hosted Postgres URL. SQLite does not persist on Vercel. |

After the Coming Soon RT ships, set `TARGET_TWEET_ID` and redeploy.

## Environment

See `.env.example`. All of these are for the **project owner**.

| Variable | Purpose |
| --- | --- |
| `TWITTER_BEARER_TOKEN` | App-only token. Handle lookup + RT (and like if X allows). Cannot sign in. |
| `TWITTER_CLIENT_ID` | OAuth 2.0 client id — required for Connect X |
| `TWITTER_CLIENT_SECRET` | OAuth 2.0 client secret — required for Connect X |
| `TWITTER_CALLBACK_URL` | Must match the Developer Portal callback exactly |
| `TARGET_TWEET_ID` | Numeric id of the post to like and retweet |
| `SESSION_SECRET` | Cookie encryption key, 32+ characters |
| `DATABASE_URL` | `file:./data/umbra.sqlite` or a Postgres URL |
| `ADMIN_TOKEN` | Shared secret for CSV export |

## Twitter Developer Portal (owner)

### Bearer only (current)

1. Developer Portal → project app → Keys and tokens → Bearer Token.
2. Put it in hosting as `TWITTER_BEARER_TOKEN`.
3. Set `TARGET_TWEET_ID`.
4. Visitors use handle + Verify Marks. Connect X stays off.

### Connect X (needed for true Sign in with X)

1. App → User authentication settings → **OAuth 2.0**.
2. Type **Web App**, confidential client.
3. Callback (exact path `/api/auth/twitter/callback`):
   - Local: `http://127.0.0.1:43147/api/auth/twitter/callback`
   - Production: `https://YOUR_DOMAIN/api/auth/twitter/callback`
4. Scopes: `tweet.read`, `users.read`, `like.read`, `offline.access`
5. Put **Client ID** and **Client Secret** in hosting as `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET`.
6. A Bearer token is not a substitute for these two values.

When OAuth is present, `/api/verify` and `/api/register` check likes via `GET /2/users/:id/liked_tweets` and retweets via `GET /2/tweets/:id/retweeted_by`.

## Routes

| Path | Role |
| --- | --- |
| `/`, `/list`, `/whitelist` | Petition UI |
| `/admin` | Jeremy’s review desk (token-gated) |
| `/api/auth/twitter` | Start OAuth (disabled when client id/secret are absent) |
| `/api/auth/twitter/callback` | OAuth callback |
| `/api/auth/logout` | Clear session |
| `/api/session` | Current user + petition state |
| `/api/verify` | Like + RT check (user token or Bearer + handle) |
| `/api/register` | Create a **pending** petition |
| `/api/admin/submissions` | List or approve/reject petitions |
| `/api/admin/export` | CSV, optional `?status=pending\|approved\|rejected` |

## Review (Jeremy)

Open `/admin`, paste `ADMIN_TOKEN`, open the ledger. Approve or reject each petition. Export approved wallets when you are ready to build the real mint list.

```bash
# All petitions
curl -H "ADMIN_TOKEN: $ADMIN_TOKEN" \
  http://127.0.0.1:43147/api/admin/submissions

# Pending only
curl -H "ADMIN_TOKEN: $ADMIN_TOKEN" \
  "http://127.0.0.1:43147/api/admin/submissions?status=pending"

# Approve
curl -H "ADMIN_TOKEN: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"twitterUserId":"ID","status":"approved"}' \
  http://127.0.0.1:43147/api/admin/submissions

# CSV of approved wallets
curl -H "ADMIN_TOKEN: $ADMIN_TOKEN" \
  "http://127.0.0.1:43147/api/admin/export?status=approved" -o umbra-approved.csv
```

Columns: `status`, `wallet_address`, `twitter_handle`, `twitter_user_id`, `liked`, `retweeted`, `submitted_at`, `reviewed_at`.

## Scope

v1 is a petition: X identity, like + retweet one quest post, required ETH wallet, submit for consideration. Jeremy chooses who is added to the mint whitelist. There is no follow task, reply task, manifesto, essay, or Zcash address. Visitors are never asked for API keys.

## Notes

- Wallet is required. Mixed-case values are checksum-checked.
- A petition is not a promise and not an automatic whitelist.
- SQLite is the local default (`data/umbra.sqlite`). Postgres is used when `DATABASE_URL` starts with `postgres://` or `postgresql://`.
