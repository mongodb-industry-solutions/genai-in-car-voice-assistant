'use client';

import AppSchema from '@/lib/powersync/AppSchema';
import { BackendConnector } from '@/lib/powersync/BackendConnector';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase, WASQLiteOpenFactory, WASQLiteVFS } from '@powersync/web';
import Logger from 'js-logger';
import React, { Suspense } from 'react';

// eslint-disable-next-line react-hooks/rules-of-hooks
Logger.useDefaults();
Logger.setLevel(Logger.DEBUG);

export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: new WASQLiteOpenFactory({
        dbFilename: 'exampleVFS.db',
        vfs: WASQLiteVFS.OPFSCoopSyncVFS,
        flags: {
            enableMultiTabs: typeof SharedWorker !== 'undefined',
            ssrMode: false
        }
    }),
    flags: {
        enableMultiTabs: typeof SharedWorker !== 'undefined',
    }
});

const connector = new BackendConnector();
db.connect(connector);
console.log(db.currentStatus);

export const SystemProvider = ({ children }) => {

    return (
        <Suspense>
            <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
        </Suspense>
    );
};

export default SystemProvider;
