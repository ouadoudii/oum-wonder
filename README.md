# Oum Wonder

Oum Wonder turns a room photo and a short intention into a coherent renovation/design concept.

## MVP journey

1. Add a room photo.
2. Choose **Überrasch mich** or **Gezielt verbessern**.
3. Give only the minimum context.
4. Receive one unified vision covering lighting, proportions, layout, surfaces, palette, priorities and first steps.

The photo is analysed **locally in the browser** for brightness, warmth and saturation. No photo leaves the device in this MVP and no API key is required.

## Product principles

- Mobile-first and camera-first.
- Architecture before decoration.
- High-impact moves instead of generic checklists.
- Photo signals influence the concept immediately.
- No secrets in the browser or repository.
- A future generative-image/LLM layer belongs server-side with structured validation.

## Quality gate

```bash
npm run quality
```

The gate performs strict TypeScript checking, source lint/security checks, unit tests, zero-dependency audit, production build and real Chromium flows on desktop and mobile.
