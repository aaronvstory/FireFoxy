/**
 * CredentialService - Manages 922proxy credential storage and validation
 * Provides secure credential management with browser storage API
 */

class CredentialService {
    constructor() {
        this.storageKey = 'proxy_credentials';
        this.cache = null;
    }

    /**
     * Save credentials to secure browser storage
     */
    async saveCredentials(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Validate credentials format
        if (!this.validateCredentialFormat(username, password)) {
            throw new Error('Invalid credential format');
        }

        try {
            const credentials = {
                username: username.trim(),
                password: password.trim(),
                savedAt: Date.now()
            };

            await browser.storage.local.set({
                [this.storageKey]: credentials
            });

            // Update cache
            this.cache = credentials;

            console.log('✅ Credentials saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save credentials:', error);
            throw new Error('Failed to save credentials. Please try again.');
        }
    }

    /**
     * Load credentials from browser storage
     */
    async loadCredentials() {
        try {
            // Return cached credentials if available
            if (this.cache) {
                return this.cache;
            }

            const data = await browser.storage.local.get(this.storageKey);
            
            if (data && data[this.storageKey]) {
                this.cache = data[this.storageKey];
                return this.cache;
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to load credentials:', error);
            return null;
        }
    }

    /**
     * Clear stored credentials
     */
    async clearCredentials() {
        try {
            await browser.storage.local.remove(this.storageKey);
            this.cache = null;
            console.log('✅ Credentials cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear credentials:', error);
            throw error;
        }
    }

    /**
     * Validate credential format
     */
    validateCredentialFormat(username, password) {
        // Basic validation - adjust based on 922proxy requirements
        if (!username || username.length < 3) {
            return false;
        }

        if (!password || password.length < 6) {
            return false;
        }

        // Check for invalid characters
        const invalidChars = /[<>\"\']/;
        if (invalidChars.test(username) || invalidChars.test(password)) {
            return false;
        }

        return true;
    }

    /**
     * Check if credentials are saved
     */
    async hasCredentials() {
        const credentials = await this.loadCredentials();
        return credentials !== null;
    }

    /**
     * Get credential age in milliseconds
     */
    async getCredentialAge() {
        const credentials = await this.loadCredentials();
        
        if (credentials && credentials.savedAt) {
            return Date.now() - credentials.savedAt;
        }

        return null;
    }

    /**
     * Check if credentials need refresh (older than 30 days)
     */
    async needsRefresh() {
        const age = await this.getCredentialAge();
        
        if (age === null) {
            return true;
        }

        // Credentials older than 30 days
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        return age > thirtyDays;
    }

    /**
     * Validate credentials with 922proxy (placeholder for actual validation)
     */
    async validateWithProvider(username, password) {
        // This would normally make an API call to validate credentials
        // For now, we'll just check format
        return this.validateCredentialFormat(username, password);
    }

    /**
     * Export credentials for backup (returns encrypted string)
     */
    async exportCredentials() {
        const credentials = await this.loadCredentials();
        
        if (!credentials) {
            throw new Error('No credentials to export');
        }

        // Simple base64 encoding for export - in production, use proper encryption
        const exportData = {
            ...credentials,
            exportedAt: Date.now()
        };

        return btoa(JSON.stringify(exportData));
    }

    /**
     * Import credentials from backup
     */
    async importCredentials(exportedData) {
        try {
            const jsonString = atob(exportedData);
            const data = JSON.parse(jsonString);

            if (!data.username || !data.password) {
                throw new Error('Invalid import data');
            }

            return await this.saveCredentials(data.username, data.password);
        } catch (error) {
            console.error('❌ Failed to import credentials:', error);
            throw new Error('Invalid import data format');
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CredentialService;
}