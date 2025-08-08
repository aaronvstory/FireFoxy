/**
 * 922Proxy FoxyProxy Extension - Background Script
 * Handles IP detection and container management
 * Version: 3.1.0
 */

// Initialize extension when browser starts
browser.runtime.onStartup.addListener(initialize);
browser.runtime.onInstalled.addListener(initialize);

// Initialize extension
function initialize() {
    console.log('922Proxy Extension: Background script initialized');
}

// Listen for tab updates to capture IP information from ipinfo.io
browser.tabs.onUpdated.addListener(handleTabUpdated);

/**
 * Handle tab updates to capture IP information from ipinfo.io
 * Only activates when visiting ipinfo.io to avoid unnecessary script execution
 */
async function handleTabUpdated(tabId, changeInfo, tabInfo) {
    try {
        // Only process when page is completely loaded and is ipinfo.io
        if (changeInfo.status === 'complete' && 
            tabInfo.url && 
            tabInfo.url.includes('ipinfo.io') && 
            tabInfo.cookieStoreId) {
            
            console.log(`Tab ${tabId} loaded ipinfo.io in container ${tabInfo.cookieStoreId}`);
            
            // Execute script to extract IP information from the page
            const ipData = await browser.tabs.executeScript(tabId, {
                code: `
                    (() => {
                        try {
                            // Find the IP element using multiple selectors
                            const ipElement = document.getElementById('ip-string') || 
                                              document.querySelector('.what-is-my-ip') || 
                                              document.querySelector('h1[data-testid="what-is-my-ip"]') ||
                                              document.querySelector('.ip-address');
                            
                            // Find the location data using multiple selectors
                            const locationElement = document.querySelector('.ip-address-location') || 
                                                   document.querySelector('[data-testid="what-is-my-ip-location"]') ||
                                                   document.querySelector('.location-text') ||
                                                   document.querySelector('.geo-info');
                            
                            if (ipElement) {
                                const ipText = ipElement.textContent.trim();
                                const locationText = locationElement ? locationElement.textContent.trim() : 'Location not detected';
                                
                                // Return the extracted data
                                return {
                                    ip: ipText,
                                    location: locationText,
                                    timestamp: new Date().toISOString(),
                                    success: true
                                };
                            } else {
                                return { 
                                    error: 'Could not find IP element on page',
                                    success: false,
                                    html: document.documentElement.innerHTML.substring(0, 500) + '...'
                                };
                            }
                        } catch (error) {
                            return { 
                                error: error.message,
                                success: false,
                                stack: error.stack
                            };
                        }
                    })()
                `
            });
            
            // Process the extracted data
            if (ipData && ipData[0]) {
                const containerIpData = ipData[0];
                
                if (containerIpData.success) {
                    console.log(`Successfully extracted IP data for container ${tabInfo.cookieStoreId}:`, {
                        ip: containerIpData.ip,
                        location: containerIpData.location
                    });
                    
                    // Store the IP data for this container
                    await browser.storage.local.set({
                        [`ip_${tabInfo.cookieStoreId}`]: {
                            ip: containerIpData.ip,
                            location: containerIpData.location,
                            timestamp: containerIpData.timestamp,
                            tabId: tabId
                        }
                    });
                    
                    // Show success notification
                    browser.notifications.create({
                        type: 'basic',
                        iconUrl: 'icon48.png',
                        title: '922Proxy - IP Detected',
                        message: `Container IP: ${containerIpData.ip}\\nLocation: ${containerIpData.location}`
                    });
                    
                } else {
                    console.error(`Failed to extract IP data: ${containerIpData.error}`);
                }
            }
        }
    } catch (error) {
        console.error('Error in handleTabUpdated:', error);
    }
}

/**
 * Handle runtime messages from popup or content scripts
 */
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {
        switch (message.action) {
            case 'refreshContainerIP':
                return await refreshContainerIP(message.containerId);
            
            case 'clearContainerData':
                return await clearContainerData(message.containerId);
                
            case 'getStoredCredentials':
                return await getStoredCredentials();
                
            default:
                console.warn('Unknown message action:', message.action);
                return { success: false, error: 'Unknown action' };
        }
    } catch (error) {
        console.error('Error handling runtime message:', error);
        return { success: false, error: error.message };
    }
});

/**
 * Refresh IP information for a specific container
 */
async function refreshContainerIP(containerId) {
    try {
        // Find tabs with this container
        const tabs = await browser.tabs.query({ cookieStoreId: containerId });
        
        if (tabs.length > 0) {
            // Navigate the first tab to ipinfo.io to trigger IP detection
            await browser.tabs.update(tabs[0].id, {
                url: 'https://ipinfo.io/what-is-my-ip',
                active: true
            });
            
            return { success: true, message: 'Refreshing IP information...' };
        } else {
            // Create a new tab if none exists
            const newTab = await browser.tabs.create({
                url: 'https://ipinfo.io/what-is-my-ip',
                cookieStoreId: containerId,
                active: true
            });
            
            return { success: true, message: 'Created new tab for IP detection' };
        }
    } catch (error) {
        console.error('Error refreshing container IP:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clear stored data for a specific container
 */
async function clearContainerData(containerId) {
    try {
        await browser.storage.local.remove(`ip_${containerId}`);
        return { success: true, message: 'Container data cleared' };
    } catch (error) {
        console.error('Error clearing container data:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get stored credentials (for validation purposes only)
 */
async function getStoredCredentials() {
    try {
        const result = await browser.storage.local.get('proxyCredentials');
        return {
            success: true,
            hasCredentials: !!(result.proxyCredentials && 
                             result.proxyCredentials.username && 
                             result.proxyCredentials.password)
        };
    } catch (error) {
        console.error('Error getting stored credentials:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle extension unload - cleanup
 */
browser.runtime.onSuspend.addListener(() => {
    console.log('922Proxy Extension: Background script suspended');
});
