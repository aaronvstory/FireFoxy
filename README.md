# 922Proxy FoxyProxy Extension

A professional Firefox extension for managing 922proxy USA residential proxies through FoxyProxy. Generate unique proxy configurations, manage Firefox containers, and browse with complete IP isolation.

## 🚀 Features

- **Secure Credential Management**: Store your 922proxy credentials locally with persistent login
- **Dynamic Proxy Generation**: Create 5-20 unique proxy configurations with cryptographically secure session IDs
- **Firefox Container Integration**: Seamlessly manage Multi-Account Containers for IP isolation
- **One-Click Downloads**: Export FoxyProxy-compatible JSON configurations instantly
- **Real-time IP Detection**: Automatic IP verification when visiting ipinfo.io
- **Enhanced Security**: No hardcoded credentials, secure authentication, and local-only storage
- **Production Ready**: Comprehensive error handling, input validation, and user feedback

## 📋 Requirements

- **Firefox Browser**: This extension is designed exclusively for Firefox
- **922proxy Account**: Valid username and password required
- **FoxyProxy Standard**: Must be installed from Firefox Add-ons
- **Multi-Account Containers**: Recommended for container functionality

## 🔧 Installation

### For Users

1. **Download the Extension**
   - Download the latest release from the releases page
   - Or clone this repository: `git clone [repository-url]`

2. **Install in Firefox**
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the sidebar
   - Click "Load Temporary Add-on..."
   - Select the `manifest.json` file from the extension directory

3. **Install Required Extensions**
   - [FoxyProxy Standard](https://addons.mozilla.org/firefox/addon/foxyproxy-standard/)
   - [Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) (optional)

### For Distribution

For permanent installation, the extension can be packaged and submitted to Firefox Add-ons:

```bash
# Install web-ext tool
npm install --global web-ext

# Build the extension
web-ext build

# The resulting .zip file can be uploaded to Firefox Add-ons
```

## 🎯 Quick Start

1. **Configure Credentials**
   - Click the extension icon in Firefox toolbar
   - Enter your 922proxy username and password
   - Click "Save Credentials" (they'll be remembered securely)

2. **Generate Proxy Configuration**
   - Select number of proxies (5-20)
   - Choose region (currently USA only)
   - Click "Generate New Proxies"
   - Click "Download Config" to save the configuration file

3. **Import to FoxyProxy**
   - Open FoxyProxy settings in Firefox
   - Click "Import Settings"
   - Select your downloaded configuration file
   - All proxies will be available in FoxyProxy

4. **Start Browsing**
   - Click FoxyProxy icon and select any proxy
   - Visit [ipinfo.io](https://ipinfo.io/what-is-my-ip) to verify your new IP
   - Switch between proxies for different IP addresses

## 🏗️ Architecture

### Core Components

- **`manifest.json`**: Extension metadata and permissions
- **`background.js`**: Service worker for IP detection and container management
- **`popup.html/js`**: Main user interface and interaction logic
- **`foxyproxy-generator.js`**: Proxy configuration generation engine
- **`foxyproxy-setup.html`**: Comprehensive setup guide
- **`debug.js`**: Production diagnostics and troubleshooting

### Security Features

- **No Hardcoded Credentials**: Users must provide their own 922proxy credentials
- **Local Storage Only**: Credentials stored locally in browser, never transmitted to third parties
- **Input Validation**: Comprehensive validation for all user inputs
- **Secure Session IDs**: Cryptographically secure random session generation
- **Error Handling**: Robust error handling with user-friendly messages

### Technical Specifications

- **Manifest Version**: 2 (for Firefox compatibility)
- **Minimum Firefox Version**: 60+
- **Permissions**: `contextualIdentities`, `cookies`, `storage`, `activeTab`, `tabs`, `downloads`, `webRequest`, `proxy`, `management`, `notifications`
- **Proxy Protocol**: SOCKS5
- **Endpoint**: na.proxys5.net:6200 (verified working)

## 🔐 Security & Privacy

### Data Handling

- **Credentials**: Stored locally using Firefox's `browser.storage.local` API
- **No Tracking**: Extension does not log or track browsing activity
- **No External Servers**: All processing done locally, only 922proxy receives authentication
- **Secure Transmission**: All proxy connections use authenticated SOCKS5

### Security Best Practices

- Credentials are encrypted by Firefox's storage system
- Session IDs are generated using `crypto.getRandomValues()` when available
- Input sanitization prevents XSS attacks
- No eval() or dynamic code execution
- Content Security Policy compliant

## 🛠️ Development

### Project Structure

```
922proxy-foxyproxy-extension-production/
├── manifest.json              # Extension manifest
├── background.js              # Background service worker
├── popup.html                 # Main UI
├── popup.js                   # UI logic and event handling
├── foxyproxy-generator.js     # Proxy configuration generator
├── foxyproxy-setup.html       # Setup instructions
├── debug.js                   # Diagnostic utilities
├── icon.svg                   # Extension icon (SVG)
├── icon16.png                 # 16px icon
├── icon48.png                 # 48px icon
└── README.md                  # This file
```

### Key Classes

#### `PopupManager`
- Handles all UI interactions
- Manages credential storage and validation
- Coordinates with FoxyProxyGenerator
- Manages Firefox containers

#### `FoxyProxyGenerator`
- Generates unique proxy configurations
- Creates session IDs and authentication strings
- Exports FoxyProxy-compatible JSON
- Validates credentials before generation

#### `ExtensionDebugger`
- Comprehensive diagnostic testing
- API availability checking
- Storage and permission validation
- Error reporting and recommendations

### Development Setup

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd 922proxy-foxyproxy-extension-production
   ```

2. **Load in Firefox**
   - Open `about:debugging`
   - Load temporary add-on using `manifest.json`

3. **Test Changes**
   - Modify files as needed
   - Reload extension in `about:debugging`
   - Test functionality thoroughly

### Code Standards

- ES6+ JavaScript with comprehensive error handling
- No external dependencies (except browser APIs)
- Comprehensive input validation
- User-friendly error messages
- Detailed console logging for debugging

## 🔍 Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Ensure you're using Firefox (not Chrome/Edge)
   - Check that the extension is enabled in `about:addons`
   - Try reloading the extension in `about:debugging`

2. **Container Features Not Working**
   - Install Multi-Account Containers extension
   - Check Firefox privacy settings allow extensions
   - Ensure containers API is available

3. **Proxy Generation Fails**
   - Verify your 922proxy credentials are correct
   - Check your 922proxy account status and data usage
   - Try generating fewer proxies (5 instead of 20)

4. **FoxyProxy Import Issues**
   - Ensure you're using FoxyProxy Standard (not Basic)
   - Check the downloaded JSON file is not corrupted
   - Try importing with fewer proxies

### Debug Tools

The extension includes comprehensive debugging tools:

```javascript
// Run in browser console
window.debugExtension.runFullDiagnostics()
```

This will check:
- Browser API availability
- Extension permissions
- DOM element presence
- Storage functionality
- Container API status
- Credential validation

### Support Resources

- **922proxy Dashboard**: [center.922proxy.com](https://center.922proxy.com/Dashboard/TrafficSetup)
- **FoxyProxy Help**: Check FoxyProxy documentation
- **Firefox Extensions**: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 📦 Distribution

### Building for Production

```bash
# Install build tools
npm install --global web-ext

# Build extension package
web-ext build

# Output: web-ext-artifacts/922_proxy_foxyproxy_generator-3.1.0.zip
```

### Packaging Notes

- Remove any test files or development tools
- Ensure all icons are optimized
- Verify manifest.json is complete
- Test thoroughly before distribution

### Sharing with Friends

The extension is ready to share! Simply:

1. **Zip the Directory**
   ```bash
   zip -r 922proxy-extension.zip 922proxy-foxyproxy-extension-production/
   ```

2. **Share Instructions**
   - Send the zip file
   - Include setup instructions (see foxyproxy-setup.html)
   - Remind them they need their own 922proxy credentials

3. **Installation for Recipients**
   - Extract the zip file
   - Follow installation instructions above
   - Enter their own 922proxy credentials

## 🔄 Version History

### v3.1.0 (Production Release)
- ✅ **Security**: Removed all hardcoded credentials
- ✅ **Enhanced**: Comprehensive error handling and validation
- ✅ **Improved**: User interface with better feedback
- ✅ **Added**: Production-ready debugging tools
- ✅ **Optimized**: Code structure and performance
- ✅ **Secured**: Input sanitization and XSS prevention

### v3.0.x (Previous Versions)
- Basic functionality
- Container management
- Proxy generation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This extension is designed to work with 922proxy residential proxy service. Users must:

- Have a valid 922proxy account
- Provide their own credentials
- Comply with 922proxy terms of service
- Use the service responsibly and legally

The extension developers are not affiliated with 922proxy and provide no guarantees about the proxy service itself.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add comprehensive error handling
- Include user-friendly error messages
- Test with various Firefox versions
- Document any new features

## 📞 Support

For technical issues with the extension:
1. Check the troubleshooting section above
2. Run the debug diagnostics
3. Check browser console for errors
4. Create an issue with detailed information

For 922proxy account issues:
- Contact 922proxy support directly
- Check your account dashboard
- Verify your subscription status

---

**Made with ❤️ for secure and private browsing**
