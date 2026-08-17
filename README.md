# GenAI-Powered In-Car Voice Assistant

This demo showcases an AI-driven voice assistant for vehicles, leveraging **Generative AI** and **MongoDB Atlas** to provide a smarter, more intuitive in-car experience. Unlike traditional voice assistants that are limited to basic commands, this solution enables **context-aware** interactions, **real-time vehicle diagnostics**, and **personalized recommendations** for drivers.

## About the Solution

### 🚘 Automotive Innovation is Accelerating

The industry is rapidly evolving with **EVs, autonomous driving, and advanced safety** features, driving demand for **intelligent in-car assistants**.

### 🔊 Current Voice Assistants Are Underutilized

Most drivers use in-car voice assistants, but they are **limited to basic tasks** like navigation, calls, and simple commands.

### 🤖 GenAI: The Future of In-Car Assistants

Generative AI transforms **voice assistants from basic command-response systems** into **dynamic, interactive** copilots that:

- Understand driver needs in **real time**
- Provide **relevant insights** using vehicle data
- Enhance overall **user experience**

## How MongoDB Helps

MongoDB Atlas plays a key role in this demo by providing:

- **Flexible Data Storage:** Easily stores and organizes operational, metadata and vector data, including vehicle signal data, car manual embeddings, and user interactions.
- **Vector Search for Context-Aware Responses:** Enhances voice assistant capabilities by retrieving relevant sections of the car manual based on user queries.
- **Real-Time Syncing:** PowerSync’s MongoDB Connector ensures vehicle signal data is always up-to-date, whether on the cloud or in the vehicle.

Learn more about MongoDB [here](https://www.mongodb.com/docs/manual/?utm_campaign=devrel&utm_source=github&utm_medium=referral&utm_content=genai_in_car_voice_assistant&utm_term=learning.fuel).

## High-Level Architecture

![High-Level Architecture Diagram](/public/high-level-architecture.png)

## Tech Stack

- **[Next.js](https://nextjs.org/)** for the frontend framework
- **[MongoDB Atlas](https://www.mongodb.com/atlas?utm_campaign=devrel&utm_source=github&utm_medium=referral&utm_content=genai_in_car_voice_assistant&utm_term=learning.fuel)** for the database and vector search
- **[Google Cloud Platform](https://cloud.google.com/)** for the LLM, speech-to-text, and embeddings
- **[PowerSync](https://www.powersync.com/)** to persist vehicle data in MongoDB Atlas and keep it in sync

## Prerequisites

Before running the demo, ensure you have the following:

- A **MongoDB Atlas Cluster**. If you don't have one yet, [sign up for free and deploy an M0 cluster](https://www.mongodb.com/cloud/atlas/register?utm_campaign=devrel&utm_source=github&utm_medium=referral&utm_content=genai_in_car_voice_assistant&utm_term=learning.fuel).
- **Node.js 22** or higher (see `.nvmrc`)
- A **GCP project** with billing enabled and the following APIs turned on: `aiplatform.googleapis.com` (Vertex AI), `speech.googleapis.com` (Speech-to-Text), and `texttospeech.googleapis.com` (Text-to-Speech):
  ```bash
  gcloud services enable aiplatform.googleapis.com speech.googleapis.com texttospeech.googleapis.com --project <your-gcp-project-id>
  ```
- Application Default Credentials for that project, so the app can call Vertex AI and Speech APIs locally:
  ```bash
  gcloud auth application-default login
  gcloud auth application-default set-quota-project <your-gcp-project-id>
  ```
- A **PowerSync account** for real-time data syncing (optional — see [PowerSync Integration](#powersync-integration-optional))

## Environment Variables

To configure the environment for this demo, you need to set up the following variables in a `.env.local` file. These variables ensure seamless integration with MongoDB Atlas, Google Cloud Platform, and other services used in the application. Below is an example configuration:

```dotenv
MONGODB_URI="<your-mongodb-connection-string>"
DATABASE_NAME="car_assistant_demo"
APP_NAME="devrel-demo-nextjs-vertexai-automotive"
GCP_PROJECT_ID="<your-gcp-project-id>"
GCP_LOCATION="us-central1"
VERTEXAI_COMPLETIONS_MODEL="gemini-2.5-flash"
VERTEXAI_EMBEDDINGS_MODEL="text-embedding-005"
NEXT_PUBLIC_ENV="local"
```

`APP_NAME` is passed as the MongoDB client's `appName` so Atlas can attribute traffic to this demo; it's optional; the value above is the default if unset.

## Run it Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the `manual_vector_index` search index on the `manuals` collection (the `consultManual` tool queries this at chat time — without it, the assistant can diagnose warning lights but can't answer "what do I do about it"). In the Atlas UI, create an Atlas Vector Search index on `manuals` with:
   ```json
   {
     "fields": [
       { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" }
     ]
   }
   ```
   Wait for the index status to show **Active** before continuing.
3. Seed sample car manual content into `manuals`:
   ```bash
   node scripts/seed-manuals.js
   ```
   Safe to run again — it skips seeding if `manuals` already has documents.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser to access the assistant and vehicle dashboard.

## Common Errors

- **"consultManual" returns nothing / assistant can't give follow-up advice**: the `manual_vector_index` doesn't exist yet, or `manuals` is empty. Redo steps 2-3 of [Run it Locally](#run-it-locally).
- **`PERMISSION_DENIED` calling Vertex AI or Speech APIs**: run `gcloud auth application-default login` for your GCP project, and confirm `aiplatform.googleapis.com`, `speech.googleapis.com`, and `texttospeech.googleapis.com` are enabled (see [Prerequisites](#prerequisites)).
- **`MongoServerError` on connect**: check that `MONGODB_URI` in `.env.local` is correct and that your Atlas cluster's network access list includes your current IP.

## PowerSync Integration (Optional)

For a more realistic setup, you can add additional onboard capabilities by using an embedded database to hold your data and seamlessly sync it to the cloud. Since this demo highlights mostly the cloud components of the assistant, you will be able to run it without PowerSync, but we encourage you to do the full setup for a more complete view of the demo.

The application has been integrated with PowerSync for local-first capabilities and uses the default IndexedDB VFS solution. The `./src/lib/powersync` directory contains all the files used for setup and talks to a separately hosted backend API for generating tokens, validating tokens and handling the upload to the source MongoDB database.

There are also two `providers` in the `./src/components/providers` directory which perform the connection and disable SSR. PowerSync will not work with SSR at this time due to assets that need to be present on the client device.

The PowerSync SDK is used in the `VehicleContext.js` context to write the changes to the `vehicle` variable to the local database and then PowerSync will push the changes to the Backend API, which then writes it to the source backend database.

### Set up the PowerSync backend

PowerSync requires a backend API interface to upload writes to MongoDB. There are currently two options:

- **Custom self-hosted backend:** If you already have a backend application as part of your stack, you should use your existing backend. If you don’t yet have one, PowerSync provides example implementations in Node.js, Django, and Rails. See [backend examples](https://docs.powersync.com/resources/demo-apps-example-projects#backend-examples).

- **Serverless cloud functions (hosted/managed):** Alternatively, you can use CloudCode, a serverless cloud functions environment provided by PowerSync. A template is available as a turnkey starting point. See the [CloudCode guide](https://docs.powersync.com/usage/tools/cloudcode).

**How writes work:**

- The client-side application performs writes directly on the local SQLite database. These writes are automatically placed into an upload queue by the PowerSync Client SDK.
- The SDK uses a developer-defined `uploadData()` function to manage uploading those writes sequentially to the backend.

### Add PowerSync ENV variables

After setting up the backend, there are two additional environment variables that need to be added to the project in order to connect successfully:

```dotenv
NEXT_PUBLIC_POWERSYNC_URL="<your-powersync-url>"
NEXT_PUBLIC_BACKEND_BASE_URL="<your-backend-base-url>"
```
