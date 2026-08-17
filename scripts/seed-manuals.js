/**
 * Seeds the `manuals` collection with sample car manual content, embedded with
 * the same Vertex AI model (VERTEXAI_EMBEDDINGS_MODEL) and dimensionality (768)
 * that `consultManual` queries against at chat time -- see
 * src/lib/gcp/genai.js#createEmbedding and src/lib/mongodb/vectorSearch.js.
 *
 * Requires the `manual_vector_index` vector search index to already exist on
 * `manuals` (path: embedding, 768 dims, cosine). Create it in the Atlas UI or
 * via the driver before running this script -- see README.md's Quick Start.
 *
 * Safe to run again: skips seeding if the collection already has documents.
 *
 * Run from the repo root:
 *   node scripts/seed-manuals.js
 */
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const MANUAL_CHUNKS = [
  "Engine Oil Pressure Warning Light: If the oil pressure warning light illuminates, pull over safely as soon as possible and turn off the engine. Check the oil level using the dipstick. If the oil level is low, add oil of the recommended grade. If the light remains on after topping up, do not continue driving -- have the vehicle inspected by a qualified technician, as continuing to drive with low oil pressure can cause severe engine damage.",
  "Low Tire Pressure Warning: This light indicates one or more tires are below the recommended pressure. Check all four tires with a pressure gauge and inflate them to the pressure listed on the driver-side door jamb placard. Under-inflated tires reduce fuel efficiency and increase the risk of a blowout.",
  "Brake System Warning Light: This light can indicate low brake fluid, worn brake pads, or an issue with the anti-lock braking system (ABS). Check the brake fluid reservoir level first. If the fluid is low, top it up with the manufacturer-specified brake fluid. If the light persists, have the brake system inspected immediately, as this affects vehicle safety.",
  "Battery Warning Light: This light indicates the charging system is not functioning correctly, often due to a failing alternator or a loose/corroded battery connection. Check that the battery terminals are clean and tightly connected. If the light stays on while driving, minimize electrical load (radio, AC) and get to a service station, as the vehicle may lose power once the battery is depleted.",
  "Recommended Service Intervals: Engine oil and filter should be changed every 8,000-10,000 km or as indicated by the maintenance reminder system. Tire rotation is recommended every 10,000 km to ensure even wear. Brake pads should be inspected at every oil change and replaced when the friction material is less than 3mm thick.",
];

async function seed() {
  const { MONGODB_URI, DATABASE_NAME, GCP_PROJECT_ID, GCP_LOCATION, VERTEXAI_EMBEDDINGS_MODEL, APP_NAME } =
    process.env;

  if (!MONGODB_URI || !DATABASE_NAME) {
    throw new Error("MONGODB_URI and DATABASE_NAME must be set (see .env.local)");
  }

  const client = new MongoClient(MONGODB_URI, {
    appName: APP_NAME || "devrel-demo-nextjs-vertexai-automotive",
  });
  await client.connect();
  const manuals = client.db(DATABASE_NAME).collection("manuals");

  const existing = await manuals.countDocuments();
  if (existing > 0) {
    console.log(`manuals already has ${existing} document(s), skipping seed.`);
    await client.close();
    return;
  }

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT_ID,
    location: GCP_LOCATION || "us-central1",
  });
  const embeddingsModel = VERTEXAI_EMBEDDINGS_MODEL || "text-embedding-005";

  for (const text of MANUAL_CHUNKS) {
    const response = await ai.models.embedContent({
      model: embeddingsModel,
      contents: [text],
      config: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 },
    });
    const embedding = response.embeddings[0].values;
    await manuals.insertOne({ text, embedding });
    console.log(`inserted: ${text.slice(0, 60)}...`);
  }

  console.log(`done. manuals now has ${await manuals.countDocuments()} document(s).`);
  await client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
