"use client";

import AppSchema from "@/lib/powersync/AppSchema";
import { BackendConnector } from "@/lib/powersync/BackendConnector";
import { PowerSyncContext } from "@powersync/react";
import { PowerSyncDatabase, WASQLiteOpenFactory } from "@powersync/web";
import Logger from "js-logger";
import React, { Suspense } from "react";

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Logger.useDefaults();
  Logger.setLevel(Logger.DEBUG);
}

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: "powersync.db",
    flags: {
      enableMultiTabs: typeof SharedWorker !== "undefined",
      ssrMode: false,
      disableSSRWarning: true,
    },
  }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
});

export const SystemProvider = ({ children }) => {
  const connector = new BackendConnector();

  // Only connect if PowerSync is configured
  if (connector.isConfigured()) {
    try {
      db.connect(connector);
    } catch (error) {
      console.warn("Failed to connect to PowerSync:", error);
    }
  }

  return (
    <Suspense>
      <PowerSyncContext.Provider value={db}>
        {children}
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export default SystemProvider;
