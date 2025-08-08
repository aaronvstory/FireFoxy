# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Firefox extension called "922Proxy FoxyProxy Generator" that generates FoxyProxy configurations for 922proxy residential proxies. The extension manages Firefox containers, generates unique proxy configurations, and provides real-time IP detection capabilities.

## Common Development Commands

### Extension Development
```bash
# Load extension in Firefox for development
# 1. Open Firefox and navigate to about:debugging
# 2. Click "This Firefox" in the sidebar
# 3. Click "Load Temporary Add-on..."
# 4. Select the manifest.json file

# Run extension diagnostics (in browser console)
window.debugExtension.runFullDiagnostics()

# Package for production (Windows)
package.bat

# Package for production (Linux/Mac)
bash package.sh
```

### Testing and Validation
```bash
# Test proxy generation functionality
# 1. Enter valid 922proxy credentials in the extension popup
# 2. Click "Generate New Proxies" 
# 3. Verify configuration is generated without errors

# Test container functionality
# 1. Install Multi-Account Containers extension
# 2. Create containers via the extension
# 3. Test "Open New Tab" and "Switch to Tab" buttons

# Test timer functionality
# 1. Mark any container as "Applied"
# 2. Verify timer displays in MM:SS format
# 3. Verify timer updates every second
```

## Architecture Overview

### Core Components

1. **PopupManager** (`popup.js:9-920`): Main UI controller handling all user interactions, credential management, and container operations
2. **FoxyProxyGenerator** (`foxyproxy-generator.js:7-284`): Proxy configuration engine that generates unique FoxyProxy JSON configs
3. **Background Service Worker** (`background.js:7-211`): Handles IP detection on ipinfo.io and manages container data
4. **ExtensionDebugger** (`debug.js:12-395`): Comprehensive diagnostic and testing utilities

### Key Architectural Patterns

- **Event-Driven Architecture**: All UI interactions use event listeners with async/await patterns
- **Container-Based State Management**: Uses localStorage for persisting container applied status and timers
- **Secure Credential Handling**: All credentials stored via browser.storage.local API, never in code
- **Modular Class Structure**: Each major functionality is encapsulated in separate classes

### Critical Data Flow

1. **Authentication Flow**: User credentials → browser.storage.local → FoxyProxyGenerator credentials object
2. **Proxy Generation**: Generator config → unique session IDs → FoxyProxy JSON → downloadable file
3. **Container Management**: Container API queries → DOM rendering → localStorage persistence
4. **Timer System**: Applied checkbox → localStorage timestamp → real-time updates via setInterval

## Development Guidelines

### Code Style Conventions
- Use ES6+ JavaScript with comprehensive error handling
- All browser API calls must use async/await patterns
- User-facing text must use escapeHtml() for XSS prevention
- Console logging should include descriptive prefixes (🚀, ✅, ❌, etc.)

### Security Requirements
- Never hardcode credentials, API keys, or sensitive data
- All user inputs must be validated using existing validation patterns
- Use browser.storage.local for any persistent data storage
- Implement proper error handling without exposing sensitive information

### Firefox Extension Specifics
- Use Manifest Version 2 for Firefox compatibility
- All browser APIs must be checked for availability before use
- Container features require Multi-Account Containers extension
- IP detection only activates on ipinfo.io pages to avoid unnecessary script execution

### Key Classes and Their Responsibilities

#### PopupManager (`popup.js:9-920`)
- Manages all UI state and interactions
- Handles credential storage/retrieval via browser APIs
- Coordinates with FoxyProxyGenerator for proxy creation
- Manages Firefox container lifecycle (create, rename, delete)
- Implements split button functionality for tab management
- Handles persistent timer system for applied containers

#### FoxyProxyGenerator (`foxyproxy-generator.js:7-284`)
- Generates cryptographically secure session IDs using crypto.getRandomValues()
- Creates FoxyProxy-compatible JSON configurations
- Validates credentials before generating configurations
- Supports 5-20 proxy configurations with unique visual styling
- Handles JSON download with proper blob creation and cleanup

#### ExtensionDebugger (`debug.js:12-395`)
- Performs comprehensive API availability checks
- Tests container, storage, and permission functionality
- Generates diagnostic reports with recommendations
- Validates DOM element presence and credential status
- Provides manual testing via window.debugExtension.runFullDiagnostics()

### Testing Strategy

The extension includes built-in diagnostic tools:
- Run `window.debugExtension.runFullDiagnostics()` in browser console
- Verify all APIs, permissions, and storage functionality
- Test container operations with Multi-Account Containers extension
- Validate proxy generation with real 922proxy credentials

### File Structure Notes

- Production files only - no development or test files in main directory
- `package.bat` and `package.sh` create distribution packages with security verification
- `test.html` serves as feature demonstration and verification
- All documentation is complete and production-ready in README.md

### Critical Environmental Requirements

- Firefox Browser (required - extension is Firefox-specific)
- FoxyProxy Standard extension (for importing generated configurations)
- Multi-Account Containers extension (optional, for container features)
- Valid 922proxy account with credentials (user-provided)

## Distribution and Packaging

The extension is production-ready with automated packaging scripts that:
- Verify all required files are present
- Perform security audits for hardcoded credentials
- Create timestamped distribution packages
- Generate installation documentation
- Support both Windows and Linux/Mac environments

When making changes, test thoroughly with `window.debugExtension.runFullDiagnostics()` and run packaging scripts to ensure production readiness.