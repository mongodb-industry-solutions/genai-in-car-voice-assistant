# AGENTS.md

Guidance for AI coding agents working in this repository.

This is a Next.js 15 app (App Router) simulating an in-car voice assistant. Gemini
(via Vertex AI) drives the conversation and calls functions for diagnostics, manual
lookup, navigation, and closing the chat; MongoDB Atlas stores the car manual
embeddings that back the `consultManual` function.

## Build and test commands

```bash
npm install                    # install dependencies
node scripts/seed-manuals.js   # seed manual_vector_index content (needs the index to exist first, see README)
npm run dev                    # start the dev server on :3000
npm run build                  # production build
npm run lint                   # eslint
```

**There is no automated test suite in this repository.** `npm test` does not exist.
To verify a change, run `npm run build` and `npm run lint`, then exercise the affected
flow in the browser. Do not claim tests pass — there are none.

Smoke check after a change:

1. `npm run dev`, open http://localhost:3000
2. Open the chat (microphone icon on the infotainment screen) and click through the
   suggested-answer prompts: they should trigger `fetchDTCCodes` (dashboard light
   diagnosis) and `consultManual` (manual excerpt) in sequence
3. Confirm no errors in the browser console or the terminal running `next dev`

## Project structure

```
src/
  app/
    (home)/page.js        # the infotainment + dashboard shell
    api/gcp/chat/          # POST, streams Gemini responses + handles function calls
    api/gcp/speechToText/  # WebSocket upgrade endpoint (next-ws), streams audio to GCP STT
    api/gcp/textToSpeech/  # POST, text -> audio via GCP TTS
    api/action/[action]/   # POST, generic MongoDB proxy (find/update/aggregate) for frontend vehicle actions
  components/
    chatView/               # chat UI, message bubbles, suggested answers
    vehicleDashboard/       # warning lights, gauges
    navigationView/         # map / navigation UI
    infotainmentScreen/     # the screen shell that switches between the above views
    optionsView/            # settings (audio config, etc.)
    logConsole/             # debug log panel (bottom-right icon in the running app)
    providers/              # PowerSync connection providers; disable SSR, client-only
  context/                  # ChatSessionContext, VehicleContext, VideoProvider
  hooks/                    # useChat, useChatSimulate
  lib/
    gcp/genai.js            # Gemini chat session, function declarations, createEmbedding
    gcp/speech.js            # GCP Speech-to-Text / Text-to-Speech clients
    mongodb/vectorSearch.js  # MongoClient singleton + $vectorSearch against `manuals`
    powersync/                # PowerSync client setup (optional integration)
scripts/
  seed-manuals.js          # seeds sample car manual content, see README Quick Start
```

Notable files:

- `src/lib/gcp/genai.js` — the function-calling contract (`closeChat`, `recalculateRoute`,
  `consultManual`, `fetchDTCCodes`) and system prompt live here. Changing a function's
  `parameters` schema without updating its handler in `src/app/api/gcp/chat/route.js`
  will break that tool call silently (Gemini calls it, nothing handles the response).
- `src/lib/mongodb/vectorSearch.js` — the only MongoDB client in the app; also exports
  `clientPromise`, reused by `src/app/api/action/[action]/route.js`.
- `src/lib/const.js` — `SAMPLE_CONVERSATION` (drives the suggested-answer prompts in the
  UI) and `warningLights` (DTC-code-to-dashboard-light mapping) are both hardcoded here,
  not read from MongoDB.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/gcp/chat` | Send a user message, stream back the Gemini response; runs function calls (`consultManual` triggers vector search) |
| UPGRADE (WS) | `/api/gcp/speechToText` | Streams microphone audio to GCP Speech-to-Text, streams back transcripts |
| POST | `/api/gcp/textToSpeech` | Converts assistant text to audio via GCP Text-to-Speech |
| POST | `/api/action/[action]` | Generic MongoDB proxy (`find`, `update`, `aggregate`) used by the frontend for vehicle state |

## Environment variables and configuration

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | Atlas connection string |
| `DATABASE_NAME` | Yes | `car_assistant_demo` | Database holding `manuals` |
| `APP_NAME` | No | `devrel-demo-nextjs-vertexai-automotive` | MongoDB client `appName` for Atlas attribution |
| `GCP_PROJECT_ID` | Yes | `my-project-123` | GCP project with Vertex AI + Speech APIs enabled |
| `GCP_LOCATION` | No | `us-central1` | Vertex AI region |
| `VERTEXAI_COMPLETIONS_MODEL` | No | `gemini-2.5-flash` | Chat model |
| `VERTEXAI_EMBEDDINGS_MODEL` | No | `text-embedding-005` | Embeddings model, must match what `scripts/seed-manuals.js` used to embed `manuals` |
| `NEXT_PUBLIC_ENV` | No | `local` | Environment label read client-side |
| `NEXT_PUBLIC_POWERSYNC_URL` | No (PowerSync only) | | PowerSync instance URL |
| `NEXT_PUBLIC_BACKEND_BASE_URL` | No (PowerSync only) | | PowerSync backend API base URL |

Constraints worth knowing before you debug a failure:

- **`consultManual` depends on a search index that isn't created by any script.**
  `manual_vector_index` (768 dims, cosine, on `manuals.embedding`) must exist in Atlas
  before `scripts/seed-manuals.js` is useful and before the chat's manual-lookup
  function returns anything. See README Quick Start.
- **Vertex AI auth uses Application Default Credentials, not an API key.** Local
  development needs `gcloud auth application-default login` against the project in
  `GCP_PROJECT_ID` — a valid `MONGODB_URI` alone will not surface a Vertex AI auth
  failure until the first chat message is sent.
- **Embeddings model must match between seeding and querying.** `createEmbedding` in
  `genai.js` and `scripts/seed-manuals.js` both read `VERTEXAI_EMBEDDINGS_MODEL` and
  both request `outputDimensionality: 768` — changing one without the other produces a
  dimension mismatch at query time.
- **Vehicle dashboard state (`warningLights`, DTC codes) is hardcoded in `src/lib/const.js`,
  not read from MongoDB.** Only car manual content lives in Atlas.
- **PowerSync is optional and does not work with SSR.** The providers in
  `src/components/providers` disable SSR for that reason; the app runs fully without a
  PowerSync backend configured.
- **Atlas M0 clusters cap out at 3 search indexes total, shared across every database
  on the cluster.** If this demo shares a cluster with other repos, index creation can
  fail with "maximum number of FTS indexes has been reached" — check what else is on
  the cluster before assuming this repo's index definition is wrong.

## MongoDB Skills

Use the official MongoDB agent skills from https://github.com/mongodb/agent-skills
whenever the task is MongoDB-specific and a matching skill exists.

## When To Use EDD.md

Use [EDD.md](./EDD.md) as the source of truth for the MongoDB data model in this repository.

Consult [EDD.md](./EDD.md) before making changes that touch:

- MongoDB collections, document structure, or field names
- API routes that read or write database records
- Validation, form fields, API payloads, or UI that depend on persisted data
- Schema documentation, Mermaid diagrams, or entity modeling discussions
