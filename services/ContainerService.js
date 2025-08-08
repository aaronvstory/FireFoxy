/**
 * ContainerService - Manages Firefox container operations
 * Handles all container-related functionality with caching and optimization
 */

class ContainerService {
  constructor() {
    this.cache = {
      containers: null,
      lastFetch: 0,
      cacheDuration: 5000, // 5 seconds cache
    };
    this.listeners = new Set();
  }

  /**
   * Get all containers with caching
   */
  async getContainers(forceRefresh = false) {
    const now = Date.now();

    // Return cached data if valid
    if (
      !forceRefresh &&
      this.cache.containers &&
      now - this.cache.lastFetch < this.cache.cacheDuration
    ) {
      return this.cache.containers;
    }

    try {
      if (!browser.contextualIdentities) {
        console.warn("⚠️ Container API not available");
        return [];
      }

      const containers = await browser.contextualIdentities.query({});

      // Update cache
      this.cache.containers = containers;
      this.cache.lastFetch = now;

      return containers;
    } catch (error) {
      console.error("❌ Failed to get containers:", error);
      return this.cache.containers || [];
    }
  }

  /**
   * Create a new container
   */
  async createContainer(name, color = "blue", icon = "fingerprint") {
    if (!browser.contextualIdentities) {
      throw new Error("Container API not available");
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Container name is required");
    }

    try {
      const container = await browser.contextualIdentities.create({
        name: name.trim(),
        color,
        icon,
      });

      // Invalidate cache
      this.cache.containers = null;
      this.notifyListeners("containerCreated", container);

      return container;
    } catch (error) {
      console.error("❌ Failed to create container:", error);
      throw error;
    }
  }

  /**
   * Update an existing container
   */
  async updateContainer(cookieStoreId, updates) {
    if (!browser.contextualIdentities) {
      throw new Error("Container API not available");
    }

    try {
      const container = await browser.contextualIdentities.update(
        cookieStoreId,
        updates
      );

      // Invalidate cache
      this.cache.containers = null;
      this.notifyListeners("containerUpdated", container);

      return container;
    } catch (error) {
      console.error("❌ Failed to update container:", error);
      throw error;
    }
  }

  /**
   * Delete a container
   */
  async deleteContainer(cookieStoreId) {
    if (!browser.contextualIdentities) {
      throw new Error("Container API not available");
    }

    try {
      await browser.contextualIdentities.remove(cookieStoreId);

      // Clean up applied status when deleting container
      const key = `container_applied_${cookieStoreId}`;
      localStorage.removeItem(key);

      // Invalidate cache
      this.cache.containers = null;
      this.notifyListeners("containerDeleted", { cookieStoreId });

      return true;
    } catch (error) {
      console.error("❌ Failed to delete container:", error);
      throw error;
    }
  }

  /**
   * Open a new tab in a specific container
   */
  async openInContainer(
    cookieStoreId,
    url = "https://ipinfo.io/what-is-my-ip"
  ) {
    try {
      // Validate container exists first
      const containers = await this.getContainers();
      const container = containers.find(
        (c) => c.cookieStoreId === cookieStoreId
      );

      if (!container) {
        throw new Error(`Container with ID ${cookieStoreId} not found`);
      }

      const tab = await browser.tabs.create({
        url,
        cookieStoreId,
        active: true,
      });

      console.log(`✅ Opened new tab in container "${container.name}": ${url}`);
      return tab;
    } catch (error) {
      console.error("❌ Failed to open tab in container:", error);
      throw error;
    }
  }
  /**
   * Switch to an existing tab in a container or create new one
   */
  async switchToContainer(cookieStoreId, url = null) {
    try {
      // Validate container exists first
      const containers = await this.getContainers();
      const container = containers.find(
        (c) => c.cookieStoreId === cookieStoreId
      );

      if (!container) {
        throw new Error(`Container with ID ${cookieStoreId} not found`);
      }

      // Check for existing tabs in this container
      const tabs = await browser.tabs.query({ cookieStoreId });

      if (tabs && tabs.length > 0) {
        // Focus on the first tab
        await browser.tabs.update(tabs[0].id, { active: true });

        // Also switch to the window containing this tab
        const tab = await browser.tabs.get(tabs[0].id);
        await browser.windows.update(tab.windowId, { focused: true });

        // Update URL if provided
        if (url) {
          await browser.tabs.update(tabs[0].id, { url });
        }

        console.log(
          `✅ Switched to existing tab in container "${container.name}"`
        );
        return tabs[0];
      } else {
        // Create new tab in container with default URL
        console.log(
          `📝 No existing tabs found, creating new tab in container "${container.name}"`
        );
        return await this.openInContainer(
          cookieStoreId,
          url || "https://ipinfo.io/what-is-my-ip"
        );
      }
    } catch (error) {
      console.error("❌ Failed to switch to container:", error);
      throw error;
    }
  }

  /**
   * Get container applied status from storage
   */
  getAppliedStatus(cookieStoreId) {
    const key = `container_applied_${cookieStoreId}`;
    const data = localStorage.getItem(key);

    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Set container applied status in storage
   */
  setAppliedStatus(cookieStoreId, applied) {
    const key = `container_applied_${cookieStoreId}`;

    if (applied) {
      const data = {
        applied: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.removeItem(key);
    }

    this.notifyListeners("appliedStatusChanged", { cookieStoreId, applied });
  }

  /**
   * Add event listener
   */
  addEventListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error("Error notifying listener:", error);
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.containers = null;
    this.cache.lastFetch = 0;
  }

  /**
   * Clear all applied statuses from localStorage
   */
  clearAllAppliedStatuses() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("container_applied_")) {
        localStorage.removeItem(key);
      }
    });
    console.log("✅ Cleared all applied statuses");
  }
}

// Export for use in popup.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = ContainerService;
}
