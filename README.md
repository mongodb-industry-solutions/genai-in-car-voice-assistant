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
