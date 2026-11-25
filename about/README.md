# about.scooter.work

Standalone static corporate website for **Hangzhou Scooter Technology Co., Ltd. (杭州斯古特科技有限公司)** / **Scooter.work**.

This project is completely isolated from the main `scooter.work` site, `guides.scooter.work` CMS, and `media.scooter.work`.

## Local Preview

```sh
cd about
npm install
npm run dev
```

Or build and preview the static output:

```sh
cd about
npm run build
npm run preview
```

## Routes & Languages

- `/` — English (auto-redirects Chinese browsers to `/zh/` unless English was explicitly selected)
- `/zh/` — 简体中文 (direct link always stays in Chinese)

## Deployment (`about.scooter.work`)

Deployed as an independent static-assets project (`scooterwork-about`) on Cloudflare via `cf` CLI ([cloudflare.config.ts](./cloudflare.config.ts)):

```sh
cd about
npm run deploy
```

Note: `npm run deploy` runs `astro build`, packages `dist/` into Cloudflare's static-assets build output via `scripts/package-cf.mjs`, and deploys to `about.scooter.work` without touching `scooter.work`, `guides.scooter.work`, or `media.scooter.work`.
