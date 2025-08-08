/**
 * UIManager - Manages user interface interactions and DOM manipulation
 * Provides safe DOM methods and handles UI state management
 */

class UIManager {
  constructor() {
    this.elements = new Map();
    this.timers = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Initialize UI elements and cache references
   */
  initializeElements() {
    const elementIds = [
      "proxy-username",
      "proxy-password",
      "save-credentials-btn",
      "credentials-status",
      "proxy-count",
      "proxy-region",
      "generate-proxies-btn",
      "download-config-btn",
      "generation-status",
      "generation-error",
      "container-list",
      "create-container-btn",
      "delete-all-containers-btn",
      "loading-containers",
      "showPasswordBtn",
      "logout-btn",
      "setup-foxyproxy-btn",
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    });
  }

  /**
   * Get cached element by ID
   */
  getElement(id) {
    return this.elements.get(id);
  }

  /**
   * Create element safely with proper escaping
   */
  createElement(tagName, attributes = {}, textContent = "") {
    const element = document.createElement(tagName);

    // Set attributes safely
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "data") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = this.escapeHtml(String(dataValue));
        });
      } else {
        element.setAttribute(key, this.escapeHtml(String(value)));
      }
    });

    // Set text content safely
    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  /**
   * Create container element with safe DOM manipulation
   */
  createContainerElement(container, isApplied = false, appliedData = null) {
    // Use the actual container color from Firefox containers API
    const containerColor = this.getContainerColor(container.color);

    // Generate a subtle gradient background using the container color
    const gradientStart = this.adjustColorOpacity(containerColor, 0.08);
    const gradientEnd = this.adjustColorOpacity(containerColor, 0.03);
    const borderColor = this.adjustColorOpacity(containerColor, 0.6);

    const containerDiv = this.createElement("div", {
      className: "container-item",
      "data-container-id": container.cookieStoreId,
      style: `border-left: 4px solid ${borderColor}; background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}); box-shadow: 0 2px 4px ${this.adjustColorOpacity(
        containerColor,
        0.15
      )};`,
    });

    // Create header
    const header = this.createElement("div", {
      className: "container-header",
    });

    // Container info
    const info = this.createElement("div", {
      className: "container-info",
    });

    const icon = this.createElement(
      "span",
      {
        className: "container-icon",
        style: `color: ${containerColor}; text-shadow: 0 0 8px ${this.adjustColorOpacity(
          containerColor,
          0.4
        )}; filter: drop-shadow(0 0 2px ${this.adjustColorOpacity(
          containerColor,
          0.3
        )});`,
      },
      this.getContainerIcon(container.icon)
    );

    const name = this.createElement(
      "span",
      {
        className: "container-name",
        style: `color: ${this.adjustColorBrightness(containerColor, 1.2)};`,
      },
      container.name
    );

    info.appendChild(icon);
    info.appendChild(name);

    // Applied checkbox
    const appliedCheckbox = this.createElement("input", {
      type: "checkbox",
      className: "container-applied",
      "data-container-id": container.cookieStoreId,
    });

    if (isApplied) {
      appliedCheckbox.checked = true;
    }

    const appliedLabel = this.createElement(
      "label",
      {
        className: "applied-label",
      },
      "Applied"
    );

    header.appendChild(info);
    header.appendChild(appliedCheckbox);
    header.appendChild(appliedLabel);

    containerDiv.appendChild(header);

    // Timer display (if applied)
    if (isApplied && appliedData) {
      const timerDiv = this.createElement("div", {
        className: "container-timer",
        "data-container-id": container.cookieStoreId,
      });

      const elapsed = Math.floor((Date.now() - appliedData.timestamp) / 1000);
      timerDiv.textContent = this.formatTime(elapsed);

      containerDiv.appendChild(timerDiv);
    }

    // Action buttons - inline icon design with container color theming
    const actions = this.createElement("div", {
      className: "container-actions",
    });

    // Open tab button - themed with container color
    const openBtn = this.createElement("button", {
      className: "btn-icon btn-primary-icon",
      "data-container-id": container.cookieStoreId,
      "data-action": "open-tab",
      title: "Open New Tab in Container",
      style: `background: ${containerColor}; border-color: ${containerColor}; box-shadow: 0 2px 4px ${this.adjustColorOpacity(
        containerColor,
        0.3
      )};`,
    });
    openBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;

    // Switch tab button - themed with container color (secondary style)
    const switchBtn = this.createElement("button", {
      className: "btn-icon btn-secondary-icon",
      "data-container-id": container.cookieStoreId,
      "data-action": "switch-tab",
      title: "Switch to Container Tab",
      style: `background: ${this.adjustColorOpacity(
        containerColor,
        0.15
      )}; color: ${containerColor}; border-color: ${this.adjustColorOpacity(
        containerColor,
        0.4
      )};`,
    });
    switchBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`;

    // Rename button - Edit Pen Icon (sleek edit icon with document)
    const renameBtn = this.createElement("button", {
      className: "btn-icon btn-edit-icon",
      "data-container-id": container.cookieStoreId,
      "data-action": "rename",
      title: "Rename Container",
    });
    renameBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"/></svg>`;

    // Delete button - Trash Icon (minimal, professional delete icon)
    const deleteBtn = this.createElement("button", {
      className: "btn-icon btn-delete-icon",
      "data-container-id": container.cookieStoreId,
      "data-action": "delete",
      title: "Delete Container",
    });
    deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;

    actions.appendChild(openBtn);
    actions.appendChild(switchBtn);
    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    containerDiv.appendChild(actions);

    return containerDiv;
  }

  /**
   * Update container list display
   */
  updateContainerList(containers, appliedStatuses = {}) {
    const containerList = this.getElement("container-list");

    if (!containerList) {
      console.error("Container list element not found");
      return;
    }

    // Clear existing content
    containerList.innerHTML = "";

    if (!containers || containers.length === 0) {
      const emptyMessage = this.createElement(
        "div",
        {
          className: "empty-message",
        },
        "No containers found. Install Multi-Account Containers extension to create containers."
      );

      containerList.appendChild(emptyMessage);

      // Set minimum height for empty state
      containerList.style.height = "360px";
      return;
    }

    // Create container elements
    containers.forEach((container) => {
      const appliedData = appliedStatuses[container.cookieStoreId];
      const isApplied = appliedData !== null;

      const containerElement = this.createContainerElement(
        container,
        isApplied,
        appliedData
      );
      containerList.appendChild(containerElement);
    });

    // Dynamic height calculation based on container count
    this.adjustContainerListHeight(containers.length);
  }

  /**
   * Adjust container list height based on number of containers
   */
  adjustContainerListHeight(containerCount) {
    const containerList = this.getElement("container-list");
    if (!containerList) return;

    // Each container item is approximately 110px tall (includes padding, margins, etc)
    const containerItemHeight = 110;
    const baseHeight = 360; // Base minimum height for better visibility
    const maxVisibleContainers = 5; // Show 5 containers before scrolling

    let calculatedHeight;

    if (containerCount <= maxVisibleContainers) {
      // Show all containers without scrolling
      calculatedHeight = Math.max(
        baseHeight,
        containerCount * containerItemHeight + 70 // +70 for padding
      );
    } else {
      // Show 5 containers and enable scrolling
      calculatedHeight = maxVisibleContainers * containerItemHeight + 70;
    }

    containerList.style.height = `${calculatedHeight}px`;
    containerList.style.minHeight = `${baseHeight}px`;

    console.log(
      `📏 Container list adjusted: ${containerCount} containers, height: ${calculatedHeight}px`
    );
  }

  /**
   * Show status message
   */
  showStatus(elementId, message, type = "info", timeout = 5000) {
    const element = this.getElement(elementId);

    if (!element) {
      console.error(`Status element ${elementId} not found`);
      return;
    }

    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = "block";

    // Auto-hide after timeout
    if (timeout > 0) {
      setTimeout(() => {
        element.style.display = "none";
      }, timeout);
    }
  }

  /**
   * Show loading state
   */
  showLoading(elementId, message = "Loading...") {
    this.showStatus(elementId, message, "loading", 0);
  }

  /**
   * Show success message
   */
  showSuccess(elementId, message) {
    this.showStatus(elementId, message, "success");
  }

  /**
   * Show error message
   */
  showError(elementId, message) {
    this.showStatus(elementId, message, "error");
  }

  /**
   * Start timer for container
   */
  startTimer(containerId, startTime) {
    // Clear existing timer
    this.stopTimer(containerId);

    const timer = setInterval(() => {
      const timerElement = document.querySelector(
        `[data-container-id="${containerId}"] .container-timer`
      );

      if (timerElement) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerElement.textContent = this.formatTime(elapsed);
      } else {
        // Element no longer exists, clear timer
        this.stopTimer(containerId);
      }
    }, 1000);

    this.timers.set(containerId, timer);
  }

  /**
   * Stop timer for container
   */
  stopTimer(containerId) {
    const timer = this.timers.get(containerId);

    if (timer) {
      clearInterval(timer);
      this.timers.delete(containerId);
    }
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Get container color CSS value with enhanced variety
   */
  getContainerColor(color) {
    const colors = {
      blue: "#37adff",
      turquoise: "#00c79a",
      green: "#51cd00",
      yellow: "#ffcb00",
      orange: "#ff9f00",
      red: "#ff613d",
      pink: "#ff4bda",
      purple: "#af51f5",
    };

    return colors[color] || colors.blue;
  }

  /**
   * Adjust color opacity for better visual theming
   */
  adjustColorOpacity(color, opacity) {
    // Convert hex to rgb and add opacity
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Adjust color brightness for better contrast
   */
  adjustColorBrightness(color, factor) {
    const hex = color.replace("#", "");
    const r = Math.min(
      255,
      Math.floor(parseInt(hex.substr(0, 2), 16) * factor)
    );
    const g = Math.min(
      255,
      Math.floor(parseInt(hex.substr(2, 2), 16) * factor)
    );
    const b = Math.min(
      255,
      Math.floor(parseInt(hex.substr(4, 2), 16) * factor)
    );
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Get container icon
   */
  getContainerIcon(icon) {
    const icons = {
      fingerprint: "🔑",
      briefcase: "💼",
      dollar: "💰",
      cart: "🛒",
      vacation: "🏖️",
      gift: "🎁",
      food: "🍕",
      fruit: "🍎",
      pet: "🐕",
      tree: "🌲",
      chill: "❄️",
    };

    return icons[icon] || "📁";
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Add event listener with cleanup tracking
   */
  addEventListener(element, event, handler, options = false) {
    element.addEventListener(event, handler, options);

    // Track for cleanup
    const key = `${element.id || "unknown"}_${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    this.eventListeners.get(key).push({ element, event, handler, options });
  }

  /**
   * Remove all tracked event listeners
   */
  cleanup() {
    // Clear timers
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();

    // Remove event listeners
    this.eventListeners.forEach((listeners) => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this.eventListeners.clear();

    // Clear element cache
    this.elements.clear();
  }
}

// Export for use in popup.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = UIManager;
}
