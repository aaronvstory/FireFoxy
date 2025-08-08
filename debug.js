/**
 * 922Proxy Extension Debug Script
 * Production version with comprehensive diagnostics
 * Version: 3.1.0
 */

console.log('🔧 922Proxy Debug Script v3.1.0 Starting...');

/**
 * Debug utility class for comprehensive extension diagnostics
 */
class ExtensionDebugger {
    constructor() {
        this.results = {
            apis: false,
            dom: false,
            containers: null,
            storage: false,
            credentials: false,
            permissions: false
        };
        
        this.errors = [];
        this.warnings = [];
    }
    
    /**
     * Check if all required browser APIs are available
     */
    checkAPIs() {
        console.log('🔍 Checking Browser APIs...');
        
        try {
            if (typeof browser === 'undefined') {
                throw new Error('browser API not available - extension may not be running in Firefox');
            }
            
            const requiredAPIs = [
                'contextualIdentities',
                'storage',
                'tabs',
                'runtime',
                'notifications'
            ];
            
            const missingAPIs = [];
            
            for (const api of requiredAPIs) {
                if (!browser[api]) {
                    missingAPIs.push(api);
                }
            }
            
            if (missingAPIs.length > 0) {
                throw new Error(`Missing APIs: ${missingAPIs.join(', ')}`);
            }
            
            console.log('✅ All required APIs available');
            this.results.apis = true;
            return true;
            
        } catch (error) {
            console.error('❌ API check failed:', error.message);
            this.errors.push(`API Check: ${error.message}`);
            this.results.apis = false;
            return false;
        }
    }
    
    /**
     * Test container API functionality
     */
    async testContainerAPI() {
        console.log('🧪 Testing Container API...');
        
        try {
            if (!browser.contextualIdentities) {
                throw new Error('contextualIdentities API not available');
            }
            
            // Test with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Container query timed out')), 3000);
            });
            
            const queryPromise = browser.contextualIdentities.query({});
            const containers = await Promise.race([queryPromise, timeoutPromise]);
            
            console.log(`✅ Container API working - found ${containers.length} containers`);
            this.results.containers = containers;
            return containers;
            
        } catch (error) {
            console.error('❌ Container API test failed:', error.message);
            this.errors.push(`Container API: ${error.message}`);
            this.results.containers = null;
            
            if (error.message.includes('not available')) {
                this.warnings.push('Install Multi-Account Containers extension for full functionality');
            }
            
            return null;
        }
    }
    
    /**
     * Test storage API functionality
     */
    async testStorageAPI() {
        console.log('🧪 Testing Storage API...');
        
        try {
            if (!browser.storage || !browser.storage.local) {
                throw new Error('storage.local API not available');
            }
            
            // Test read
            const testKey = 'debug_test_' + Date.now();
            const testValue = { test: true, timestamp: Date.now() };
            
            // Test write
            await browser.storage.local.set({ [testKey]: testValue });
            console.log('✅ Storage write successful');
            
            // Test read
            const result = await browser.storage.local.get(testKey);
            if (!result[testKey] || result[testKey].test !== true) {
                throw new Error('Storage read verification failed');
            }
            console.log('✅ Storage read successful');
            
            // Cleanup
            await browser.storage.local.remove(testKey);
            console.log('✅ Storage cleanup successful');
            
            this.results.storage = true;
            return true;
            
        } catch (error) {
            console.error('❌ Storage API test failed:', error.message);
            this.errors.push(`Storage API: ${error.message}`);
            this.results.storage = false;
            return false;
        }
    }
    
    /**
     * Check for stored credentials
     */
    async checkStoredCredentials() {
        console.log('🔑 Checking Stored Credentials...');
        
        try {
            const result = await browser.storage.local.get('proxyCredentials');
            
            if (result.proxyCredentials) {
                const creds = result.proxyCredentials;
                const hasUsername = !!(creds.username && creds.username.length > 0);
                const hasPassword = !!(creds.password && creds.password.length > 0);
                const isPersistent = !!creds.persistent;
                
                console.log('✅ Credentials found:', {
                    hasUsername,
                    hasPassword,
                    isPersistent,
                    timestamp: creds.timestamp
                });
                
                this.results.credentials = hasUsername && hasPassword;
                return { hasUsername, hasPassword, isPersistent };
            } else {
                console.log('ℹ️ No stored credentials found');
                this.results.credentials = false;
                return null;
            }
            
        } catch (error) {
            console.error('❌ Credential check failed:', error.message);
            this.errors.push(`Credentials: ${error.message}`);
            this.results.credentials = false;
            return null;
        }
    }
    
    /**
     * Check DOM elements
     */
    checkDOMElements() {
        console.log('🔍 Checking DOM Elements...');
        
        const requiredElements = [
            'generateBtn',
            'downloadBtn',
            'proxyUsername',
            'proxyPassword',
            'containerList',
            'credentialStatus',
            'successMsg',
            'errorMsg'
        ];
        
        const missingElements = [];
        const foundElements = [];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (element) {
                foundElements.push(elementId);
            } else {
                missingElements.push(elementId);
            }
        }
        
        if (missingElements.length > 0) {
            console.error('❌ Missing DOM elements:', missingElements);
            this.errors.push(`Missing DOM elements: ${missingElements.join(', ')}`);
            this.results.dom = false;
            return false;
        } else {
            console.log('✅ All required DOM elements found');
            this.results.dom = true;
            return true;
        }
    }
    
    /**
     * Test extension permissions
     */
    async checkPermissions() {
        console.log('🔐 Checking Extension Permissions...');
        
        try {
            const requiredPermissions = [
                'storage',
                'tabs',
                'contextualIdentities'
            ];
            
            for (const permission of requiredPermissions) {
                const hasPermission = await browser.permissions.contains({
                    permissions: [permission]
                });
                
                if (!hasPermission) {
                    throw new Error(`Missing permission: ${permission}`);
                }
            }
            
            console.log('✅ All required permissions granted');
            this.results.permissions = true;
            return true;
            
        } catch (error) {
            console.error('❌ Permission check failed:', error.message);
            this.errors.push(`Permissions: ${error.message}`);
            this.results.permissions = false;
            return false;
        }
    }
    
    /**
     * Test FoxyProxy Generator functionality
     */
    testProxyGenerator() {
        console.log('🔧 Testing Proxy Generator...');
        
        try {
            if (typeof FoxyProxyGenerator === 'undefined') {
                throw new Error('FoxyProxyGenerator class not loaded');
            }
            
            // Test basic instantiation
            const generator = new FoxyProxyGenerator();
            
            // Test configuration
            const config = generator.getConfigInfo();
            console.log('✅ Proxy generator working:', config);
            
            return true;
            
        } catch (error) {
            console.error('❌ Proxy generator test failed:', error.message);
            this.errors.push(`Proxy Generator: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Generate comprehensive diagnostic report
     */
    generateReport() {
        console.log('📊 Generating Diagnostic Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            version: '3.1.0',
            browser: this.getBrowserInfo(),
            results: this.results,
            errors: this.errors,
            warnings: this.warnings,
            recommendations: this.generateRecommendations()
        };
        
        console.log('📋 Diagnostic Report:', report);
        return report;
    }
    
    /**
     * Get browser information
     */
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            isFirefox: navigator.userAgent.includes('Firefox'),
            platform: navigator.platform,
            language: navigator.language
        };
    }
    
    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.results.apis) {
            recommendations.push('Ensure you are using Firefox browser');
            recommendations.push('Check that the extension is properly installed and enabled');
        }
        
        if (this.results.containers === null) {
            recommendations.push('Install Multi-Account Containers extension from Firefox Add-ons');
        }
        
        if (!this.results.storage) {
            recommendations.push('Check Firefox privacy settings - ensure storage is not blocked');
        }
        
        if (!this.results.credentials) {
            recommendations.push('Enter your 922proxy credentials in the Settings section');
        }
        
        if (!this.results.dom) {
            recommendations.push('Reload the extension popup');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('All systems operational! Extension ready to use.');
        }
        
        return recommendations;
    }
    
    /**
     * Run all diagnostic tests
     */
    async runFullDiagnostics() {
        console.log('🚀 Starting Full Diagnostic Suite...');
        
        // Run all tests
        this.checkAPIs();
        this.checkDOMElements();
        
        if (this.results.apis) {
            await this.testContainerAPI();
            await this.testStorageAPI();
            await this.checkStoredCredentials();
            await this.checkPermissions();
        }
        
        this.testProxyGenerator();
        
        // Generate and return report
        const report = this.generateReport();
        
        console.log('✅ Diagnostic suite complete');
        return report;
    }
}

// Create global debugger instance
const extensionDebugger = new ExtensionDebugger();

// Auto-run diagnostics when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => extensionDebugger.runFullDiagnostics(), 100);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => extensionDebugger.runFullDiagnostics(), 100);
    });
}

// Export for manual use
window.debugExtension = extensionDebugger;

console.log('🔧 Debug script loaded. Use window.debugExtension.runFullDiagnostics() for manual testing.');
