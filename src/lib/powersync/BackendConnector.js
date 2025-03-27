import {BackendClient} from "@/lib/powersync/BackendClient";

export class BackendConnector {
    powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;
    backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    backendClient = new BackendClient(this.backendBaseUrl);

    async fetchCredentials() {
        if (this.powersyncUrl == null) {
            throw new Error("PowerSync URL not set");
        }
        try {
            const tokenData = await this.backendClient.getToken();
            return {
                endpoint: this.powersyncUrl,
                token: tokenData.token
            };
        } catch (error) {
            throw new Error("Failed to fetch token", error);
        }
    }

    async uploadData(database) {
        const transaction = await database.getNextCrudTransaction();
        if (!transaction) {
            return;
        }
        try {
            let ops = [];
            for (const crudEvent of transaction.crud) {
                // The data that needs to be changed in the remote db
                const record = { ...crudEvent.opData, id: crudEvent.id };
                ops.push({id: crudEvent.id, table: crudEvent.table, data: record, op: crudEvent.op});
            }
            await this.backendClient.updateRow(ops);
            await transaction.complete();
        } catch (error) {
            console.error(`Data upload error - discarding`, error);
            await transaction.complete();
        }
    }
}
