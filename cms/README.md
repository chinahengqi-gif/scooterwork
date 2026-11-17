# Scooter.work guides CMS

Public site: https://guides.scooter.work/
Administration: https://guides.scooter.work/_emdash/admin/
Media: https://media.scooter.work/

The original marketing site remains on Cloudflare Pages. This app runs on a separate Worker with D1 and R2. Cloudflare configuration is in `cloudflare.config.ts`.

## Publish articles

1. Open the administration URL. Use the HTTP access credentials in the ignored local `../cms-access.txt` file.
2. Complete EmDash setup using your own email and passkey. Do not share the passkey. The seeded Product guides collection is created automatically.
3. Create a guide and select its product category: battery, alarm, damper, speed-kit or scooter-trailer.
4. Add text, images and video blocks. Upload MP4 videos (H.264/AAC) to the media library, or enter an existing `https://media.scooter.work/...` video URL.
5. Use the translations panel for English, German and French. Save and publish; public pages read published content at request time, without a rebuild.

CMS uploads are limited to 90 MiB to stay below the proxied request limit. For larger videos, upload directly to the R2 bucket using Cloudflare's dashboard or S3 tools, then paste the media URL into the article. Prepare videos with MP4 fast-start for prompt playback. No Stream service is used.

## Develop and deploy

Install dependencies from the repository root with `npm ci`. Use a supported Node.js LTS release (24.15 or newer).

From this directory:

```sh
npm run dev
npm run build
../node_modules/.bin/cf deploy --prebuilt --secrets-file .dev.vars
```

`.dev.vars` holds `CMS_ADMIN_PASSWORD` and `EMDASH_ENCRYPTION_KEY`. Keep a protected backup. Do not rotate or lose the encryption key without migrating encrypted content. Both secret values are excluded from Git. The HTTP access gate protects the first-account setup and all management APIs in addition to EmDash's own authentication.

The build packaging script converts Astro's Worker output to the Cloudflare CLI Build Output Specification. No Wrangler source configuration is required.

R2 CORS allows GET/HEAD and Range requests from the main website and guides domain. Do not put private documents in the publicly accessible media bucket.
