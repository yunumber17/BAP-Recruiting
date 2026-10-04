# API

Base path: `/api`. All bodies/responses are JSON. Auth is a bearer token
(`Authorization: Bearer <token>`) verified by the injected `TokenVerifier`.

Errors are uniform:
```json
{ "error": { "code": "NOT_FOUND", "message": "Player not found: <id>" }, "requestId": "…" }
```
Codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403),
`NOT_FOUND` (404), `CONFLICT` (409), `EXTERNAL_SERVICE_ERROR` (502),
`INTERNAL_ERROR` (500).

## Health
`GET /health` → `{ "status": "ok" }`

## Players
| Method | Path | Auth | Body / Query |
|---|---|---|---|
| GET | `/players/:id` | – | – |
| POST | `/players` | – | `{ userId, firstName, lastName, graduationYear, primaryPosition, gpa?, … }` |
| PATCH | `/players/:id` | owner/admin | partial player fields |
| DELETE | `/players/:id` | owner/admin | – |

`POST /players` → `201` player. Duplicate for a user → `409`.

## Schools (read-only, may be public; empty-safe before import)
| Method | Path | Query |
|---|---|---|
| GET | `/schools/search` | `page, pageSize, q?, division?, region?, state?` |
| GET | `/schools/compare` | `ids=<uuid>,<uuid>[,…]` (2–5) |
| GET | `/schools/:id` | – |

`search` → `{ items, total, page, pageSize }`. `compare` → `{ schools: [...] }`
in requested order (404 if any id missing).

## Saved schools
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/saved-schools` | player | – (uses auth playerId) |
| POST | `/saved-schools` | player | `{ playerId, schoolId, recruitingStatus?, personalRating?, isFavorite?, notes? }` |
| PATCH | `/saved-schools/:id` | player | `{ playerId, …patch }` |
| DELETE | `/saved-schools/:id` | player | `{ playerId }` |

Saving an unknown school → `404`; a duplicate → `409`; acting for another
player → `403`.

## Recruiting
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/recruiting/player/:playerId` | owner/admin | – |
| POST | `/recruiting/score` | owner/admin | `{ playerId, schoolId }` |

`GET …/player/:playerId` → `{ items: RecruitingScore[] }` (latest per school).
`POST /recruiting/score` computes + stores via the engine. **Until the engine is
wired it returns `502 EXTERNAL_SERVICE_ERROR`** by design.

## Example
```bash
# create a player
curl -sX POST localhost:8080/api/players -H 'content-type: application/json' \
  -d '{"userId":"<uuid>","firstName":"Taro","lastName":"Yamada","graduationYear":2027,"primaryPosition":"SHORTSTOP","gpa":3.8}'

# save a school (dev token: base64url of {"userId","role":"PLAYER","playerId"})
curl -sX POST localhost:8080/api/saved-schools \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"playerId":"<uuid>","schoolId":"<uuid>"}'
```
