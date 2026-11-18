# Scooter.work guides CMS

Public site: https://guides.scooter.work/
Administration: https://guides.scooter.work/_emdash/admin/
Media: https://media.scooter.work/

The original marketing site remains on Cloudflare Pages. This app runs on a separate Worker with D1 and R2. Cloudflare configuration is in `cloudflare.config.ts`.

## Publish articles

1. Open the administration URL. Use the HTTP access credentials in the ignored local `../cms-access.txt` file.
2. Sign in using your own EmDash account and passkey. Do not share the passkey.
3. Create a guide and choose a Product category from the reference picker. Categories are managed under Product categories, not in the field's schema.
4. Add text, images and video blocks. Upload MP4 videos (H.264/AAC) to the media library, or enter an existing `https://media.scooter.work/...` video URL.
5. Use the translations panel for English, German and French. Save and publish; public pages read published content at request time, without a rebuild.

The standard media uploader is limited to 90 MiB to stay below the proxied request limit. For larger videos use the **大视频上传** page described below. You can still upload externally using S3 tools, but those files are not automatically registered in the media library. Prepare videos with MP4 fast-start for prompt playback. No Stream service is used.

## Large video uploads

Open **大视频上传** in the admin sidebar (or `/_emdash/admin/plugins/large-videos/upload`). Select an original MP4 or WebM file and start uploading. This separate entry supports files up to 20 GiB using 16 MiB R2 multipart requests; the normal 90 MiB uploader is unchanged. No S3 access keys or additional server are needed.

Keep the page open while uploading. Failed parts retry automatically up to three times. Pause before switching pages. Progress is stored in the CMS for 24 hours; after a refresh, browser restart or network failure, return using the same browser and select the same original file to continue. A local fingerprint checks that you selected the original file. Closing/reloading does not automatically resume uploading until you select the file again. Do not edit or rename the source file during an upload.

After completion, the video is registered in the EmDash media library. In an article's Portable Text editor choose **+ → Video**, select it from the library and insert it. Multiple video blocks can be placed among the text. The upload page also provides the public video URL. R2 serves the original bytes, not a transcoded version; use MP4 H.264/AAC with fast-start for broad playback compatibility.

Cancel removes unfinished parts and any unregistered object. The existing minute cron cleans up expired unfinished uploads and retains completed upload receipts for seven days; deleting a receipt never deletes its published video. Videos already in the media library must be deleted through the normal media-management flow. All upload operations require an authenticated EmDash user with `media:upload`, CSRF verification and upload ownership, in addition to the existing HTTP access gate.

## Manage product cards and categories

Open **Product categories** in the admin sidebar. Each entry controls a homepage product card and a guides directory category:

- Product name and Card description are the card's text.
- Product image opens the media library; upload a white-background image or select an existing image. Image description supplies accessible alt text.
- Display order sorts smaller numbers first.
- Show on website hides or shows the category in both public directories. Battery is initially hidden; its category is retained.
- Slug is the stable URL segment. Set it once when creating a category; changing it changes its public URL.
- Guides connects the category's articles. The same relation can be edited using Product category in an article.

Edit shared image, order and visibility on the English entry. Use the translations panel for German and French product names and descriptions; untranslated categories fall back to English. Publish changes when ready; drafts are not public. New categories should have a published English entry.

The main homepage requests `/api/product-categories?locale=en|de|fr` from the guides Worker on page load. Publishing category changes does not require a Pages rebuild. Refresh the page to see changes. The endpoint exposes only published, enabled categories and explicitly allows the main site's origin. The static homepage retains four fallback cards if the CMS cannot be reached or JavaScript is disabled.

The one-time migration is `node --experimental-strip-types scripts/migrate-product-categories.mjs` from the repository root, using the signed-in Cloudflare account (or `CLOUDFLARE_API_TOKEN`). It snapshots affected schema/data into ignored `cms/.emdash/backups/`, uses EmDash's schema/seed APIs, refuses to remove the old select field if articles exist, and does not overwrite previously seeded category entries. Do not use it to edit content after launch. Seed changes alone do not migrate an already-initialized database.

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
