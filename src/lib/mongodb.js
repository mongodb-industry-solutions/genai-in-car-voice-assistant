import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

async function vectorSearch(queryVector) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const manualsCollection = db.collection("manuals");

    const relevantChunks = await manualsCollection
      .aggregate([
        {
          $vectorSearch: {
            index: "manual_vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 50,
            limit: 5,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
          },
        },
      ])
      .toArray();

    return relevantChunks;
  } catch (error) {
    console.error(
      `Error performing vector search for product ${productId}:`,
      error
    );
    throw error;
  }
}

export { clientPromise, vectorSearch };
