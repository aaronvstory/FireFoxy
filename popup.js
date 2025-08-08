/**
 * FireFoxy - Refactored Popup Manager
 * Modern architecture with service separation and security improvements
 * Version: 2.0.0
 */

class FireFoxyPopup {
  constructor() {
    console.log("🚀 FireFoxy v2.0.0 initializing...");

    // Initialize services
    this.containerService = new ContainerService();
    this.credentialService = new CredentialService();
    this.uiManager = new UIManager();

    // Initialize proxy generator
    this.proxyGenerator = null;
    this.initializeProxyGenerator();

    // State management
    this.state = {
      containers: [],
      credentials: null,
      isGenerating: false,
      isLoadingContainers: false,
    };

    // Performance timers
    this.performanceMetrics = {
      containerLoadTime: 0,
      credentialLoadTime: 0,
      uiInitTime: 0,
    };

    // Initialize UI and load data
    this.initialize();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    const startTime = performance.now();

    try {
      // Initialize UI
      this.uiManager.initializeElements();
      this.setupEventListeners();

      // Load data in parallel for better performance
      await Promise.all([this.loadCredentials(), this.loadContainers()]);

      // Setup container service listeners
      this.containerService.addEventListener(
        this.handleContainerEvent.bind(this)
      );

      // Record performance
      this.performanceMetrics.uiInitTime = performance.now() - startTime;
      console.log(
        `✅ FireFoxy initialized in ${this.performanceMetrics.uiInitTime.toFixed(
          2
        )}ms`
      );
    } catch (error) {
      console.error("❌ Failed to initialize FireFoxy:", error);
      this.uiManager.showError(
        "container-status",
        "Failed to initialize extension"
      );
    }
  }

  /**
   * Initialize proxy generator with secure configuration
   */
  initializeProxyGenerator() {
    try {
      if (typeof FoxyProxyGenerator === "undefined") {
        console.error("❌ FoxyProxyGenerator not loaded!");
        return;
      }

      this.proxyGenerator = new FoxyProxyGenerator({
        endpoint: "na.proxys5.net",
        port: "6200",
        region: "USA",
        proxyCount: 10,
      });

      console.log("✅ Proxy generator initialized");
    } catch (error) {
      console.error("❌ Failed to initialize proxy generator:", error);
    }
  }

  /**
   * Setup event listeners with proper delegation
   */
  setupEventListeners() {
    // Credentials form
    const saveBtn = this.uiManager.getElement("save-credentials-btn");
    if (saveBtn) {
      this.uiManager.addEventListener(
        saveBtn,
        "click",
        this.handleSaveCredentials.bind(this)
      );
    }

    const logoutBtn = this.uiManager.getElement("logout-btn");
    if (logoutBtn) {
      this.uiManager.addEventListener(
        logoutBtn,
        "click",
        this.handleLogout.bind(this)
      );
    }

    // Proxy generation
    const generateBtn = this.uiManager.getElement("generate-proxies-btn");
    if (generateBtn) {
      this.uiManager.addEventListener(
        generateBtn,
        "click",
        this.handleGenerateProxies.bind(this)
      );
    }

    const downloadBtn = this.uiManager.getElement("download-config-btn");
    if (downloadBtn) {
      this.uiManager.addEventListener(
        downloadBtn,
        "click",
        this.handleDownloadConfig.bind(this)
      );
    }

    // Container management
    const newContainerBtn = this.uiManager.getElement("create-container-btn");
    if (newContainerBtn) {
      this.uiManager.addEventListener(
        newContainerBtn,
        "click",
        this.handleNewContainer.bind(this)
      );
    }

    const deleteAllBtn = this.uiManager.getElement("delete-all-containers-btn");
    if (deleteAllBtn) {
      this.uiManager.addEventListener(
        deleteAllBtn,
        "click",
        this.handleDeleteAllContainers.bind(this)
      );
    }

    // Password visibility toggle
    const showPasswordBtn = this.uiManager.getElement("showPasswordBtn");
    if (showPasswordBtn) {
      this.uiManager.addEventListener(
        showPasswordBtn,
        "click",
        this.togglePasswordVisibility.bind(this)
      );
    }

    // Container list event delegation
    const containerList = this.uiManager.getElement("container-list");
    if (containerList) {
      this.uiManager.addEventListener(
        containerList,
        "click",
        this.handleContainerAction.bind(this)
      );
      this.uiManager.addEventListener(
        containerList,
        "change",
        this.handleAppliedToggle.bind(this)
      );
    }

    // Setup guide button
    const setupBtn = this.uiManager.getElement("setup-foxyproxy-btn");
    if (setupBtn) {
      this.uiManager.addEventListener(
        setupBtn,
        "click",
        this.openSetupGuide.bind(this)
      );
    }
  }

  /**
   * Load credentials from service
   */
  async loadCredentials() {
    const startTime = performance.now();

    try {
      this.state.credentials = await this.credentialService.loadCredentials();

      if (this.state.credentials) {
        // Populate form fields
        const usernameField = this.uiManager.getElement("proxy-username");
        const passwordField = this.uiManager.getElement("proxy-password");

        if (usernameField)
          usernameField.value = this.state.credentials.username || "";
        if (passwordField)
          passwordField.value = this.state.credentials.password || "";

        this.uiManager.showSuccess(
          "credentialStatus",
          "Credentials loaded successfully"
        );
        console.log("✅ Credentials loaded");
      } else {
        this.uiManager.showStatus(
          "credentialStatus",
          "No saved credentials found",
          "info"
        );
      }

      this.performanceMetrics.credentialLoadTime =
        performance.now() - startTime;
    } catch (error) {
      console.error("❌ Failed to load credentials:", error);
      this.uiManager.showError(
        "credentialStatus",
        "Failed to load credentials"
      );
    }
  }

  /**
   * Load containers with caching
   */
  async loadContainers() {
    const startTime = performance.now();
    this.state.isLoadingContainers = true;

    try {
      // Show loading state
      const loadingElement = document.getElementById("loading-containers");
      if (loadingElement) loadingElement.style.display = "block";

      // Get containers from service (uses caching)
      const containers = await this.containerService.getContainers();
      this.state.containers = containers;

      // Get applied statuses
      const appliedStatuses = {};
      containers.forEach((container) => {
        const status = this.containerService.getAppliedStatus(
          container.cookieStoreId
        );
        if (status) {
          appliedStatuses[container.cookieStoreId] = status;
        }
      });

      // Update UI
      this.uiManager.updateContainerList(containers, appliedStatuses);

      // Start timers for applied containers
      Object.entries(appliedStatuses).forEach(([containerId, data]) => {
        this.uiManager.startTimer(containerId, data.timestamp);
      });

      // Hide loading
      if (loadingElement) loadingElement.style.display = "none";

      this.performanceMetrics.containerLoadTime = performance.now() - startTime;
      console.log(
        `✅ Loaded ${
          containers.length
        } containers in ${this.performanceMetrics.containerLoadTime.toFixed(
          2
        )}ms`
      );
    } catch (error) {
      console.error("❌ Failed to load containers:", error);
      // Hide loading on error
      const loadingElement = document.getElementById("loading-containers");
      if (loadingElement) loadingElement.style.display = "none";
    } finally {
      this.state.isLoadingContainers = false;
    }
  }

  /**
   * Handle container service events
   */
  handleContainerEvent(event, data) {
    switch (event) {
      case "containerCreated":
      case "containerUpdated":
      case "containerDeleted":
        // Refresh container list
        this.loadContainers();
        break;
      case "appliedStatusChanged":
        // Update timer
        if (data.applied) {
          const status = this.containerService.getAppliedStatus(
            data.cookieStoreId
          );
          if (status) {
            this.uiManager.startTimer(data.cookieStoreId, status.timestamp);
          }
        } else {
          this.uiManager.stopTimer(data.cookieStoreId);
        }
        break;
    }
  }

  /**
   * Handle save credentials
   */
  async handleSaveCredentials(event) {
    event.preventDefault();

    const usernameField = this.uiManager.getElement("proxy-username");
    const passwordField = this.uiManager.getElement("proxy-password");

    if (!usernameField || !passwordField) {
      console.error("Form fields not found");
      return;
    }

    const username = usernameField.value.trim();
    const password = passwordField.value.trim();

    if (!username || !password) {
      const statusElement = document.getElementById("credentials-status");
      if (statusElement) {
        statusElement.innerHTML =
          '<span class="error">Please enter both username and password</span>';
      }
      return;
    }

    try {
      const statusElement = document.getElementById("credentials-status");
      if (statusElement) {
        statusElement.innerHTML = "Saving credentials...";
      }

      await this.credentialService.saveCredentials(username, password);
      this.state.credentials = { username, password };

      // Update proxy generator credentials
      if (this.proxyGenerator) {
        this.proxyGenerator.credentials.username = username;
        this.proxyGenerator.credentials.password = password;
      }

      if (statusElement) {
        statusElement.innerHTML =
          '<span class="success">Credentials saved successfully</span>';
      }
      console.log("✅ Credentials saved");
    } catch (error) {
      console.error("❌ Failed to save credentials:", error);
      const statusElement = document.getElementById("credentials-status");
      if (statusElement) {
        statusElement.innerHTML =
          '<span class="error">Failed to save credentials</span>';
      }
    }
  }

  /**
   * Handle logout
   */
  async handleLogout(event) {
    event.preventDefault();

    try {
      await this.credentialService.clearCredentials();
      this.state.credentials = null;

      // Clear form fields
      const usernameField = this.uiManager.getElement("proxy-username");
      const passwordField = this.uiManager.getElement("proxy-password");

      if (usernameField) usernameField.value = "";
      if (passwordField) passwordField.value = "";

      // Clear proxy generator credentials
      if (this.proxyGenerator) {
        this.proxyGenerator.credentials.username = "";
        this.proxyGenerator.credentials.password = "";
      }

      const statusElement = document.getElementById("credentials-status");
      if (statusElement) {
        statusElement.innerHTML =
          '<span class="success">Logged out successfully</span>';
      }
      console.log("✅ Logged out");
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      const statusElement = document.getElementById("credentials-status");
      if (statusElement) {
        statusElement.innerHTML = '<span class="error">Failed to logout</span>';
      }
    }
  }

  /**
   * Handle proxy generation
   */
  async handleGenerateProxies(event) {
    event.preventDefault();

    if (this.state.isGenerating) {
      return;
    }

    if (!this.state.credentials) {
      const errorMsg = document.getElementById("generation-error");
      if (errorMsg) {
        errorMsg.textContent = "Please save credentials first";
        errorMsg.style.display = "block";
        setTimeout(() => (errorMsg.style.display = "none"), 5000);
      }
      return;
    }

    if (!this.proxyGenerator) {
      const errorMsg = document.getElementById("generation-error");
      if (errorMsg) {
        errorMsg.textContent = "Proxy generator not available";
        errorMsg.style.display = "block";
        setTimeout(() => (errorMsg.style.display = "none"), 5000);
      }
      return;
    }

    try {
      this.state.isGenerating = true;
      const generateBtn = this.uiManager.getElement("generate-proxies-btn");
      if (generateBtn) generateBtn.disabled = true;

      // Get configuration options
      const proxyCountSelect = this.uiManager.getElement("proxy-count");
      const proxyRegionSelect = this.uiManager.getElement("proxy-region");

      const proxyCount = proxyCountSelect
        ? parseInt(proxyCountSelect.value)
        : 10;
      const region = proxyRegionSelect ? proxyRegionSelect.value : "US";

      // Update generator configuration
      this.proxyGenerator.config.proxyCount = proxyCount;
      this.proxyGenerator.config.region = region;
      this.proxyGenerator.credentials.username =
        this.state.credentials.username;
      this.proxyGenerator.credentials.password =
        this.state.credentials.password;

      // Generate configuration
      const config = this.proxyGenerator.generateFullConfig();
      if (config) {
        const successMsg = document.getElementById("generation-status");
        if (successMsg) {
          successMsg.textContent = `Generated ${proxyCount} proxy configurations`;
          successMsg.style.display = "block";
          setTimeout(() => (successMsg.style.display = "none"), 5000);
        }

        // Enable download button
        const downloadBtn = this.uiManager.getElement("download-config-btn");
        if (downloadBtn) downloadBtn.disabled = false;

        console.log("✅ Proxy configuration generated");
      } else {
        throw new Error("Failed to generate configuration");
      }
    } catch (error) {
      console.error("❌ Failed to generate proxies:", error);
      const errorMsg = document.getElementById("generation-error");
      if (errorMsg) {
        errorMsg.textContent =
          error.message || "Failed to generate proxy configuration";
        errorMsg.style.display = "block";
        setTimeout(() => (errorMsg.style.display = "none"), 5000);
      }
    } finally {
      this.state.isGenerating = false;
      const generateBtn = this.uiManager.getElement("generate-proxies-btn");
      if (generateBtn) generateBtn.disabled = false;
    }
  }

  /**
   * Handle config download
   */
  async handleDownloadConfig(event) {
    event.preventDefault();

    if (!this.proxyGenerator || !this.proxyGenerator.config) {
      const errorMsg = document.getElementById("generation-error");
      if (errorMsg) {
        errorMsg.textContent =
          "No configuration available. Generate proxies first.";
        errorMsg.style.display = "block";
        setTimeout(() => (errorMsg.style.display = "none"), 5000);
      }
      return;
    }

    try {
      this.proxyGenerator.downloadConfig();
      const successMsg = document.getElementById("generation-status");
      if (successMsg) {
        successMsg.textContent = "Configuration downloaded successfully";
        successMsg.style.display = "block";
        setTimeout(() => (successMsg.style.display = "none"), 5000);
      }
      console.log("✅ Configuration downloaded");
    } catch (error) {
      console.error("❌ Failed to download config:", error);
      const errorMsg = document.getElementById("generation-error");
      if (errorMsg) {
        errorMsg.textContent = "Failed to download configuration";
        errorMsg.style.display = "block";
        setTimeout(() => (errorMsg.style.display = "none"), 5000);
      }
    }
  }

  /**
   * Generate a random container name
   */
  generateRandomContainerName() {
    const adjectives = [
      "Swift",
      "Silent",
      "Mystic",
      "Blazing",
      "Crystal",
      "Thunder",
      "Shadow",
      "Golden",
      "Crimson",
      "Azure",
      "Emerald",
      "Silver",
      "Midnight",
      "Dawn",
      "Storm",
      "Frozen",
      "Neon",
      "Cosmic",
      "Electric",
      "Stealth",
      "Phantom",
      "Velocity",
      "Quantum",
      "Cyber",
    ];

    const nouns = [
      "Fox",
      "Wolf",
      "Eagle",
      "Dragon",
      "Phoenix",
      "Tiger",
      "Panther",
      "Falcon",
      "Shark",
      "Lightning",
      "Comet",
      "Galaxy",
      "Nova",
      "Blade",
      "Arrow",
      "Shield",
      "Proxy",
      "Tunnel",
      "Bridge",
      "Portal",
      "Gateway",
      "Node",
      "Server",
      "Hub",
    ];

    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;

    return `${randomAdjective} ${randomNoun} ${randomNumber}`;
  }

  /**
   * Generate random container color
   */
  generateRandomContainerColor() {
    const colors = [
      "blue",
      "turquoise",
      "green",
      "yellow",
      "orange",
      "red",
      "pink",
      "purple",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate random container icon
   */
  generateRandomContainerIcon() {
    const icons = [
      "fingerprint",
      "briefcase",
      "dollar",
      "cart",
      "vacation",
      "gift",
      "food",
      "fruit",
      "pet",
      "tree",
      "chill",
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  /**
   * Handle new container creation
   */
  async handleNewContainer(event) {
    event.preventDefault();

    // Generate a random name as default
    const randomName = this.generateRandomContainerName();

    // Allow user to edit the random name or use it as-is
    const name = prompt("Container name (edit if desired):", randomName);

    if (!name || name.trim().length === 0) {
      return;
    }

    try {
      // Generate random color and icon for each container
      const randomColor = this.generateRandomContainerColor();
      const randomIcon = this.generateRandomContainerIcon();

      await this.containerService.createContainer(
        name.trim(),
        randomColor,
        randomIcon
      );
      console.log(
        `✅ Container "${name}" created with color: ${randomColor}, icon: ${randomIcon}`
      );
    } catch (error) {
      console.error("❌ Failed to create container:", error);
    }
  }

  /**
   * Handle delete all containers
   */
  async handleDeleteAllContainers(event) {
    event.preventDefault();

    if (
      !confirm(
        "Are you sure you want to delete ALL containers? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Clear all applied statuses first to prevent issues
      this.containerService.clearAllAppliedStatuses();

      // Delete all containers
      const deletePromises = this.state.containers.map((container) =>
        this.containerService.deleteContainer(container.cookieStoreId)
      );

      await Promise.all(deletePromises);
      console.log("✅ All containers deleted");
    } catch (error) {
      console.error("❌ Failed to delete containers:", error);
    }
  }

  /**
   * Handle container action clicks
   */
  async handleContainerAction(event) {
    const target = event.target;
    const action =
      target.dataset.action || target.closest("[data-action]")?.dataset.action;
    const containerId =
      target.dataset.containerId ||
      target.closest("[data-container-id]")?.dataset.containerId;

    if (!action || !containerId) {
      return;
    }

    event.preventDefault();

    try {
      // Show loading feedback
      const button = target.closest("button");
      if (button) {
        button.disabled = true;
        button.style.opacity = "0.6";
      }

      switch (action) {
        case "open-tab":
          await this.containerService.openInContainer(containerId);
          console.log(`✅ Opened new tab in container: ${containerId}`);

          // Show success feedback
          if (button) {
            button.classList.add("btn-success-flash");
            setTimeout(() => {
              button.classList.remove("btn-success-flash");
            }, 1000);
          }
          break;

        case "switch-tab":
          await this.containerService.switchToContainer(containerId);
          console.log(`✅ Switched to container: ${containerId}`);

          // Show success feedback
          if (button) {
            button.classList.add("btn-info-flash");
            setTimeout(() => {
              button.classList.remove("btn-info-flash");
            }, 1000);
          }
          break;

        case "rename":
          await this.handleRenameContainer(containerId);
          break;

        case "delete":
          await this.handleDeleteContainer(containerId);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to perform action ${action}:`, error);

      // Show error feedback
      const button = target.closest("button");
      if (button) {
        button.classList.add("btn-error-flash");
        setTimeout(() => {
          button.classList.remove("btn-error-flash");
        }, 2000);
      }

      // Show user-friendly error message
      alert(`Failed to ${action.replace("-", " ")}: ${error.message}`);
    } finally {
      // Restore button state
      const button = target.closest("button");
      if (button) {
        button.disabled = false;
        button.style.opacity = "";
      }
    }
  }

  /**
   * Handle applied status toggle
   */
  handleAppliedToggle(event) {
    const target = event.target;

    if (!target.classList.contains("container-applied")) {
      return;
    }

    const containerId = target.dataset.containerId;
    const isApplied = target.checked;

    this.containerService.setAppliedStatus(containerId, isApplied);
    console.log(`✅ Container ${containerId} applied status: ${isApplied}`);
  }

  /**
   * Handle rename container
   */
  async handleRenameContainer(containerId) {
    const container = this.state.containers.find(
      (c) => c.cookieStoreId === containerId
    );

    if (!container) {
      return;
    }

    const newName = prompt("Enter new container name:", container.name);

    if (!newName || newName.trim() === container.name) {
      return;
    }

    try {
      await this.containerService.updateContainer(containerId, {
        name: newName.trim(),
      });
      console.log(`✅ Container renamed to: ${newName}`);
    } catch (error) {
      console.error("❌ Failed to rename container:", error);
    }
  }

  /**
   * Handle delete container
   */
  async handleDeleteContainer(containerId) {
    const container = this.state.containers.find(
      (c) => c.cookieStoreId === containerId
    );

    if (!container) {
      return;
    }

    if (!confirm(`Delete container "${container.name}"?`)) {
      return;
    }

    try {
      await this.containerService.deleteContainer(containerId);
      console.log(`✅ Container deleted: ${container.name}`);
    } catch (error) {
      console.error("❌ Failed to delete container:", error);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(event) {
    event.preventDefault();

    const passwordField = this.uiManager.getElement("proxy-password");

    if (!passwordField) {
      return;
    }

    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";

    // Update button icon (simplified)
    const button = event.target.closest("button");
    if (button) {
      button.title = isPassword ? "Hide Password" : "Show Password";
    }
  }

  /**
   * Open setup guide
   */
  openSetupGuide(event) {
    event.preventDefault();

    try {
      browser.tabs.create({
        url: browser.runtime.getURL("foxyproxy-setup.html"),
        active: true,
      });
    } catch (error) {
      console.error("❌ Failed to open setup guide:", error);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      totalInitTime:
        this.performanceMetrics.uiInitTime +
        this.performanceMetrics.containerLoadTime +
        this.performanceMetrics.credentialLoadTime,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop all timers
    this.uiManager.cleanup();

    // Clear service listeners
    this.containerService.removeEventListener(
      this.handleContainerEvent.bind(this)
    );

    console.log("✅ FireFoxy cleanup completed");
  }
}

// Initialize when DOM is ready
let popupManager = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    popupManager = new FireFoxyPopup();
  });
} else {
  popupManager = new FireFoxyPopup();
}

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  if (popupManager) {
    popupManager.cleanup();
  }
});

// Export for debugging
window.firefoxy = popupManager;
