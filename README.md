# Northline

Transit arrivals board for the Northline city rail network. Operators and riders see live-looking station boards, service status, and upcoming arrivals.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Page | Route |
| --- | --- |
| Station list | `/` |
| Station board | `/stations/<id>` |
| Operator panel | `/operator` |

Healthy data is seeded in memory (eight stations). Arrivals tick down from due timestamps and are replenished as trains depart.

## Demo controls

Demo Director / scripts can inject a repeatable disruption and restore the healthy baseline. The app must already be running (`npm run dev`).

| Action | Endpoint | npm script |
| --- | --- | --- |
| Inject disruption | `POST /api/demo/break` | `npm run demo:break` |
| Restore healthy baseline | `POST /api/demo/reset` | `npm run demo:reset` |
| Verify current mode | `GET /api/demo/status` | — |

`GET /api/demo/status` returns:

```json
{ "broken": false, "mode": "normal" }
```

When broken, `mode` is `"disruption"`.

Both **break** and **reset** are idempotent.

- **Break** sets service status to Disruption, freezes ETAs, remaps platforms, marks some destinations `SIGNAL LOST`, and takes Midtown / University boards offline.
- **Reset** clears the disruption and reseeds stations and arrivals to the healthy baseline.

The Operator panel at `/operator` shows the current mode and can call the same endpoints. Do not remove the HTTP routes — scripts should keep using them.

## Tests

```bash
npm test
```

Covers break/reset toggling of network state.
