/**
 * FoxyProxy Configuration Generator for 922proxy
 * Generates secure FoxyProxy JSON configurations with multiple proxies
 * Version: 3.1.0
 */

class FoxyProxyGenerator {
  constructor(config = {}) {
    // Default configuration - using verified working endpoints
    this.config = Object.assign(
      {
        endpoint: "na.proxys5.net",
        port: "6200",
        region: "US",
        proxyCount: 10,
      },
      config
    );

    // Normalize region - accept both 'US' and 'USA'
    if (this.config.region === "USA") {
      this.config.region = "US";
    }

    // Credentials object - NEVER store actual credentials here
    // Values must be provided by user through the extension UI
    this.credentials = {
      username: "",
      password: "",
    };

    // Predefined colors for visual distinction
    this.colors = [
      "#FF5722",
      "#FF9800",
      "#FFC107",
      "#FFEB3B",
      "#CDDC39",
      "#8BC34A",
      "#4CAF50",
      "#009688",
      "#00BCD4",
      "#03A9F4",
      "#2196F3",
      "#3F51B5",
      "#1E90FF",
      "#FF69B4",
      "#FF8C00",
      "#9C27B0",
      "#E91E63",
      "#795548",
      "#607D8B",
      "#455A64",
    ];

    // Unique icons for visual identification
    this.icons = [
      "🌟",
      "🔮",
      "🚀",
      "🌈",
      "⚡",
      "🔥",
      "💎",
      "🌊",
      "🔶",
      "",
      "🚩",
      "⭐",
      "🎯",
      "🎨",
      "🎪",
      "🎭",
      "🎸",
      "🎹",
      "🎺",
      "🎻",
    ];
  }

  /**
   * Generate a cryptographically secure session ID
   */
  generateSessionId() {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    // Use crypto.getRandomValues for better randomness
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(8);
      crypto.getRandomValues(array);
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
    } else {
      // Fallback to Math.random
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return result;
  }

  /**
   * Format current date as YYMMDD-HHMM for file naming
   */
  formatDate() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}${month}${day}-${hours}${minutes}`;
  }

  /**
   * Validate credentials before generating configuration
   */
  validateCredentials() {
    if (!this.credentials.username || !this.credentials.password) {
      throw new Error("Username and password are required");
    }

    if (this.credentials.username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (this.credentials.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    return true;
  }

  /**
   * Generate a single proxy configuration with enhanced security
   */
  generateProxyConfig(index) {
    this.validateCredentials();

    const dateStr = this.formatDate();
    const sessionId = this.generateSessionId();
    const colorIndex = index % this.colors.length;
    const iconIndex = index % this.icons.length;

    // Create unique authentication username with session info
    const authUsername = `${this.credentials.username}-region-${this.config.region}-sessid-${sessionId}-sessTime-120`;

    return {
      active: true,
      title: `${index + 1} ${this.icons[iconIndex]}`,
      type: "socks5",
      hostname: this.config.endpoint,
      port: parseInt(this.config.port, 10),
      username: authUsername,
      password: this.credentials.password,
      cc: "",
      city: "",
      color: this.colors[colorIndex],
      pac: "",
      pacString: "",
      proxyDNS: true,
      include: [],
      exclude: [],
      tabProxy: [],
    };
  }

  /**
   * Generate complete FoxyProxy JSON configuration
   */
  generateFullConfig() {
    this.validateCredentials();

    const proxyCount = Math.max(
      1,
      Math.min(50, parseInt(this.config.proxyCount, 10) || 10)
    );
    console.log(`Generating ${proxyCount} proxy configurations`);

    const proxyConfigs = [];

    for (let i = 0; i < proxyCount; i++) {
      try {
        proxyConfigs.push(this.generateProxyConfig(i));
      } catch (error) {
        console.error(`Error generating proxy config ${i}:`, error);
        throw new Error(
          `Failed to generate proxy configuration ${i + 1}: ${error.message}`
        );
      }
    }

    return {
      mode: `${this.config.endpoint}:${this.config.port}`,
      sync: false,
      autoBackup: false,
      passthrough: "",
      theme: "",
      container: {},
      commands: {
        setProxy: "",
        setTabProxy: "",
        includeHost: "",
        excludeHost: "",
      },
      data: proxyConfigs,
    };
  }

  /**
   * Get configuration as formatted JSON string
   */
  getConfigAsJson() {
    try {
      const config = this.generateFullConfig();
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error("Error generating config JSON:", error);
      throw new Error(`Failed to generate configuration: ${error.message}`);
    }
  }

  /**
   * Download configuration as JSON file with enhanced error handling
   */
  downloadConfig() {
    try {
      const config = this.generateFullConfig();
      const jsonStr = JSON.stringify(config, null, 2);

      // Validate JSON before download
      try {
        JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error("Generated configuration is not valid JSON");
      }

      const blob = new Blob([jsonStr], {
        type: "application/json;charset=utf-8",
      });

      const dateStr = this.formatDate();
      const filename = `922proxy-foxyproxy-config-${dateStr}.json`;

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`Configuration downloaded successfully: ${filename}`);
      return { success: true, filename: filename };
    } catch (error) {
      console.error("Error downloading configuration:", error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Update credentials securely
   */
  updateCredentials(username, password) {
    if (!username || !password) {
      throw new Error("Both username and password are required");
    }

    this.credentials = {
      username: username.trim(),
      password: password.trim(),
    };

    console.log("Credentials updated successfully");
    return true;
  }

  /**
   * Clear credentials from memory (for security)
   */
  clearCredentials() {
    this.credentials = {
      username: "",
      password: "",
    };
    console.log("Credentials cleared from memory");
  }

  /**
   * Get configuration info without sensitive data
   */
  getConfigInfo() {
    return {
      endpoint: this.config.endpoint,
      port: this.config.port,
      region: this.config.region,
      proxyCount: this.config.proxyCount,
      hasCredentials: !!(
        this.credentials.username && this.credentials.password
      ),
    };
  }
}

// Export for both browser and module environments
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = FoxyProxyGenerator;
} else {
  window.FoxyProxyGenerator = FoxyProxyGenerator;
}
