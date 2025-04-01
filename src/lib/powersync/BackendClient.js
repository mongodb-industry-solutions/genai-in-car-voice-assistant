export class BackendClient {
    baseUrl = "";

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getToken (powerSyncUrl) {
        const response = await fetch(`${this.baseUrl}/auth/token?userId=12345&powerSyncUrl=${powerSyncUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.ok) {
            return response.json();
        } else {
            throw new Error(`Failed to fetch token: ${response.status}`);
        }
    }

    async updateRow (data) {
        const response = await fetch(`${this.baseUrl}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if(!response.ok) {
            throw new Error(`BackendClient Failed to update row: ${response.status}`)
        }
    }
}
