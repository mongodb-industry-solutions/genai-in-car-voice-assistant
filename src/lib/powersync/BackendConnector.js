import { UpdateType } from '@powersync/web';

export class BackendConnector {
    powersyncUrl = "";
    powersyncToken = "";

    constructor() {
        this.powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;
        // This token is for development only.
        // For production applications, integrate with an auth provider or custom auth.
        this.powersyncToken = process.env.NEXT_PUBLIC_POWERSYNC_TOKEN;
    }

    async fetchCredentials() {
        // TODO: Use an authentication service or custom implementation here.
        if (this.powersyncToken == null || this.powersyncUrl == null) {
            return null;
        }

        return {
            endpoint: this.powersyncUrl,
            token: this.powersyncToken
        };
    }

    async uploadData(database) {
        const transaction = await database.getNextCrudTransaction();

        if (!transaction) {
            return;
        }

        try {
            for (const op of transaction.crud) {
                // The data that needs to be changed in the remote db
                const record = { ...op.opData, id: op.id };
                switch (op.op) {
                    case UpdateType.PUT:
                        // TODO: Instruct your backend API to CREATE a record
                        break;
                    case UpdateType.PATCH:
                        // TODO: Instruct your backend API to PATCH a record
                        break;
                    case UpdateType.DELETE:
                        //TODO: Instruct your backend API to DELETE a record
                        break;
                }
            }
            await transaction.complete();
        } catch (error) {
            console.error(`Data upload error - discarding`, error);
            await transaction.complete();
        }
    }
}
