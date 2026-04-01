# Journi

India-focused trip planner: pick a destination, choose flights, stays, activities, and transfers. Uses live data where configured (Ignav flights, Xotelo hotels, OSRM transfers) with curated fallbacks.

## Setup

```bash
npm install
cp .env.example .env
# Add IGNAV_API_KEY in .env for live flights (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — end-to-end tests (Playwright; starts dev server)

## License

Private / your choice.
