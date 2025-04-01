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
            const tokenData = await this.backendClient.getToken(this.powersyncUrl);
            console.log("Got token", tokenData);
            return {
                endpoint: this.powersyncUrl,
                token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy1kZXYtMzIyM2Q0ZTMifQ.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNzQzNTM1NTQxLCJpc3MiOiJodHRwczovL3Bvd2Vyc3luYy1hcGkuam91cm5leWFwcHMuY29tIiwiYXVkIjoiaHR0cHM6Ly82N2U0ZDA3OTMwYmU0MTE1ZTBmMDk2ZjcucG93ZXJzeW5jLmpvdXJuZXlhcHBzLmNvbSIsImV4cCI6MTc0MzU3ODc0MX0.vTD8q-KE52hJUgCrFI9JTpdvR251gmBitRlmaq9vazUP1shFptkWXLzWXLp6tRlrnrnLmuAhuIyRJslLs6UfYQQzD4juk0yDApeLjWxHd1vBbizNQjmu6MIoXd0JQVhaHy9UxQOlmbBY9DmTDnGi-4XW1pz2660EL3k3RspAen5QCPl-7lmZj8THM_Xm-1WMMc2HAx76-sA0x1HPXvthey7ZiPnNQMrt4X_5-MDjwsvROlaTLUBEGC1x5Vc8suIZ_-QwQm16lPanRodNrbRq-d0_FSkM1XDGDP7-2Y4DAN302UJeP5U82KUsnScDSm7xdm7Cqub6ozxg9yccRpQyLQ"
                // token: tokenData.token,
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
            console.log(ops);
            await transaction.complete();
        } catch (error) {
            console.error(`Data upload error - discarding`, error);
            await transaction.complete();
        }
    }
}
