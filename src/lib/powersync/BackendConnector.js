import { BackendClient } from "@/lib/powersync/BackendClient";

export class BackendConnector {
  powersyncUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_POWERSYNC_URL
      : undefined;
  backendBaseUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL
      : undefined;

  // Initialize backendClient only if backendBaseUrl is available
  get backendClient() {
    if (this._backendClient === undefined) {
      this._backendClient = this.backendBaseUrl
        ? new BackendClient(this.backendBaseUrl)
        : null;
    }
    return this._backendClient;
  }

  // Check if PowerSync configuration is available
  isConfigured() {
    return this.powersyncUrl && this.backendBaseUrl && this.backendClient;
  }

  async fetchCredentials() {
    if (!this.isConfigured()) {
      console.warn("PowerSync not configured: Missing URL or backend base URL");
      return null;
    }
    try {
      if (!this.backendClient) {
        console.warn("PowerSync not configured: BackendClient is null");
        return null;
      }
      const tokenData = await this.backendClient.getToken(this.powersyncUrl);
      return {
        endpoint: this.powersyncUrl,
        token: tokenData.token,
      };
    } catch (error) {
      console.warn("Failed to fetch PowerSync token:", error);
      return null;
    }
  }

  async uploadData(database) {
    if (!this.isConfigured()) {
      return;
    }

    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      return;
    }
    try {
      let ops = [];
      for (const crudEvent of transaction.crud) {
        // The data that needs to be changed in the remote db
        const record = { ...crudEvent.opData, id: crudEvent.id };
        ops.push({
          id: crudEvent.id,
          table: crudEvent.table,
          data: record,
          op: crudEvent.op,
        });
      }
      await this.backendClient.updateRow(ops);
      await transaction.complete();
    } catch (error) {
      console.error(`Data upload error - discarding`, error);
      await transaction.complete();
    }
  }
}
