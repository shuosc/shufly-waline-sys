# SHUFly Waline Server

Originally developed by [@EthanH3514](https://github.com/EthanH3514) and later contributed to and maintained by [ShuOSC](https://github.com/shuosc).

This repository contains the Waline backend used by the
[SHUFly website](https://shuosc.github.io/fly/).

- Website repository: <https://github.com/shuosc/fly>
- Production service: <https://shufly-waline-sys.vercel.app/>
- Related issue: <https://github.com/shuosc/fly/issues/132>
- Waline documentation: <https://waline.js.org/>

## Architecture

```text
shuosc/fly (Hugo on GitHub Pages)
          |
          | serverURL
          v
this repository (Waline on Vercel)
          |
          +-- LeanCloud: comments and users
          +-- SMTP: new-comment and reply notifications
```

The browser never receives the LeanCloud master key or SMTP credentials. Store
all real credentials as Vercel Environment Variables.

## Runtime

- Node.js 22
- npm 10
- An explicitly pinned `@waline/vercel` version

Install the locked dependencies and run the source check with:

```sh
npm ci
npm run check
```

## Environment variables

Use [`.env.example`](./.env.example) only as a reference. Never commit a
populated `.env` file.

### LeanCloud

| Variable | Required | Purpose |
| --- | --- | --- |
| `LEAN_ID` | Yes | LeanCloud application ID |
| `LEAN_KEY` | Yes | LeanCloud application key |
| `LEAN_MASTER_KEY` | Yes | LeanCloud master key used by the server |
| `LEAN_SERVER` | Depends | LeanCloud REST API domain; required for applicable regions |
| `SECURE_DOMAINS` | Recommended | Comma-separated request origins without protocols or paths |

### Site and notifications

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_NAME` | Recommended | Site name included in notification messages |
| `SITE_URL` | Recommended | Canonical SHUFly URL included in messages |
| `AUTHOR_EMAIL` | Yes for admin mail | Recipient of new-comment notifications |
| `DISABLE_AUTHOR_NOTIFY` | No | Keep `false` to enable administrator notifications |

### SMTP

| Variable | Required | Purpose |
| --- | --- | --- |
| `SMTP_SERVICE` | Conditional | Nodemailer service name; use this or host/port |
| `SMTP_HOST` | Conditional | SMTP server hostname when no service preset is used |
| `SMTP_PORT` | Conditional | SMTP server port, commonly 465 or 587 |
| `SMTP_SECURE` | Yes | Usually `true` for port 465 and `false` for port 587 |
| `SMTP_USER` | Yes | SMTP login account |
| `SMTP_PASS` | Yes | SMTP application password or authorization code |
| `SENDER_NAME` | Recommended | Human-readable sender name |
| `SENDER_EMAIL` | Recommended | From address accepted by the SMTP provider |

`AUTHOR_EMAIL` may be a forwarding address used to receive administrator
notifications. `SMTP_USER` and `SENDER_EMAIL`, however, must be backed by a mail
provider that supports authenticated SMTP.

Once SMTP is configured, Waline sends:

1. A new-comment notification to `AUTHOR_EMAIL`.
2. A reply notification to the email stored on the parent comment.

## Vercel deployment

1. Connect this repository to the existing `shufly-waline-sys` Vercel project.
2. Configure database and mail variables separately for Preview and Production.
3. Create a Preview deployment first.
4. Verify that existing comments load from LeanCloud and `/ui/` opens.
5. Test email delivery with two non-production test addresses.
6. Promote the verified commit to Production.

Reuse the existing Vercel project so its environment variables, deployment
history, rollback points, and `shufly-waline-sys.vercel.app` domain remain
intact. The `shuosc/fly` repository does not need a `serverURL` change.

## Verification checklist

- The service root renders the Waline example without a function error.
- Existing SHUFly article comments and counts still load.
- An administrator can sign in at `/ui/`.
- A new comment reaches `AUTHOR_EMAIL`.
- Replying from a different address notifies the parent commenter.
- Notification links point to `https://shuosc.github.io/fly/` pages.
- Vercel Runtime Logs contain no database, SMTP, or module-loading errors.
- SMTP failures do not prevent comments from being stored.

## Rollback

If a production deployment fails, restore the last known-good deployment from
the Vercel project dashboard. Do not delete or replace the LeanCloud application
during a code rollback.

## Security

- Never commit LeanCloud keys, SMTP passwords, Vercel tokens, or populated env files.
- Prefer SMTP-specific authorization codes over mailbox login passwords.
- Review Vercel access whenever maintainers join or leave the project.
- Keep `@waline/vercel` on a patched, explicitly pinned version.
- Validate dependency and template upgrades in Preview before Production.
- Run `npm audit` during maintenance, but review upstream compatibility before
  applying any `--force` remediation.
