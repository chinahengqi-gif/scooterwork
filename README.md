# scooter.work

A compact Astro landing page for scooter.work.

## Start locally

```sh
npm install
npm run dev
```

## Replace product images

The current SVG files in `public/images/` are placeholders. Replace them with your own images and
update the paths in `src/pages/index.astro` if you use different filenames. Recommended image ratio:
`720 × 520` for product images and `900 × 620` for the hero image.

## External store links

Store links are configured in the `stores` array at the top of `src/components/HomePage.astro`.

## Languages

English uses `/` and `/privacy/`. German uses `/de/` and `/de/privacy/`; French uses `/fr/` and `/fr/privacy/`.
Translations live in `src/i18n.ts`; page templates and store links live in `src/components/`.
On English entry pages, the browser's preferred supported language selects the language automatically.
The language switcher remembers an explicit selection in local storage. Direct German and French links keep their language.
