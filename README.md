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

Learn more about MongoDB [here](https://www.mongodb.com/docs/manual/).

## High-Level Architecture

![High-Level Architecture Diagram](/public/high-level-architecture.png)

## Tech Stack

- **[Next.js](https://nextjs.org/)** for the frontend framework
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** for the database and vector search
- **[Google Cloud Platform](https://cloud.google.com/)** for the LLM, speech-to-text, and embeddings
- **[PowerSync](https://www.powersync.com/)** to persist vehicle data in MongoDB Atlas and keep it in sync

## Prerequisites

Before running the demo, ensure you have the following:

- A **MongoDB Atlas Cluster**
- **Node.js 20** or higher
- A **GCP account** with access to Vertex AI APIs
- A **PowerSync account** for real-time data syncing

## Environment Variables

To configure the environment for this demo, you need to set up the following variables in a `.env.local` file. These variables ensure seamless integration with MongoDB Atlas, Google Cloud Platform, and other services used in the application. Below is an example configuration:

```dotenv
MONGODB_URI="<your-mongodb-connection-string>"
DATABASE_NAME="car_assistant_demo"
GCP_PROJECT_ID="<your-gcp-project-id>"
GCP_LOCATION="us-central1"
VERTEXAI_COMPLETIONS_MODEL="gemini-2.0-flash-001"
VERTEXAI_EMBEDDINGS_MODEL="text-embedding-005"
VERTEXAI_API_ENDPOINT="us-central1-aiplatform.googleapis.com"
NEXT_PUBLIC_ENV="local"
```

## Run it Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open **http://localhost:3000** in your browser to access the assistant and vehicle dashboard.

## Common Errors

- Ensure you've created an `.env.local` file with valid API keys and environment variables.
- Check that your MongoDB Atlas cluster is properly set up and accessible.
- Verify that your Google Cloud Vertex AI and Speech-to-Text APIs are enabled.

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
