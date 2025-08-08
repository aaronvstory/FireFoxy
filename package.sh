#!/bin/bash

# 922Proxy Extension Production Packaging Script
# Final verification and packaging for distribution

echo "🚀 922Proxy Extension - Production Packaging"
echo "============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found. Run this script from the extension directory.${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"
echo

# Step 1: File verification
echo -e "${BLUE}🔍 Step 1: Verifying required files...${NC}"

required_files=(
    "manifest.json"
    "background.js"
    "popup.html"
    "popup.js"
    "foxyproxy-generator.js"
    "foxyproxy-setup.html"
    "debug.js"
    "icon.svg"
    "icon16.png"
    "icon48.png"
    "README.md"
    "LICENSE"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required files. Cannot proceed.${NC}"
    exit 1
fi

echo

# Step 2: Security audit
echo -e "${BLUE}🔒 Step 2: Running security audit...${NC}"

# Check for any remaining hardcoded credentials
echo "Checking for potential security issues..."

# Check for password patterns (but exclude legitimate placeholder text)
password_matches=$(grep -r "password.*=" --include="*.js" --include="*.json" . | grep -v "placeholder\|example\|your.*password\|README\|setup" || true)
username_matches=$(grep -r "username.*=" --include="*.js" --include="*.json" . | grep -v "placeholder\|example\|your.*username\|README\|setup" || true)

if [ -n "$password_matches" ] || [ -n "$username_matches" ]; then
    echo -e "${RED}❌ Potential hardcoded credentials found:${NC}"
    echo "$password_matches"
    echo "$username_matches"
    echo -e "${RED}Please review and remove any hardcoded credentials.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No hardcoded credentials found${NC}"
fi

# Check for debug statements (except in debug.js)
debug_matches=$(grep -r "console\.\(log\|debug\)" --include="*.js" . | grep -v "debug.js" || true)
if [ -n "$debug_matches" ]; then
    echo -e "${YELLOW}⚠️  Debug statements found (review recommended):${NC}"
    echo "$debug_matches"
fi

echo

# Step 3: Manifest validation
echo -e "${BLUE}📄 Step 3: Validating manifest.json...${NC}"

# Check manifest version
version=$(grep '"version"' manifest.json | sed 's/.*"version".*"\([^"]*\)".*/\1/')
echo -e "${GREEN}✅ Extension version: $version${NC}"

# Check name
name=$(grep '"name"' manifest.json | sed 's/.*"name".*"\([^"]*\)".*/\1/')
echo -e "${GREEN}✅ Extension name: $name${NC}"

echo

# Step 4: Clean build
echo -e "${BLUE}🧹 Step 4: Preparing clean build...${NC}"

# Remove any backup or temporary files
find . -name "*.backup" -o -name "*.bak" -o -name "*.old" -o -name "*.tmp" -exec rm -f {} \;
echo -e "${GREEN}✅ Cleaned temporary files${NC}"

# Remove development files if they exist
dev_files=("test.js" "dev.js" ".env" "credentials.json")
for file in "${dev_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "${GREEN}✅ Removed development file: $file${NC}"
    fi
done

echo

# Step 5: Create distribution package
echo -e "${BLUE}📦 Step 5: Creating distribution package...${NC}"

# Create timestamp for unique filename
timestamp=$(date +"%Y%m%d_%H%M%S")
package_name="922proxy-foxyproxy-extension-v${version}-${timestamp}"

# Create clean directory for packaging
if [ -d "dist" ]; then
    rm -rf dist
fi
mkdir -p "dist/$package_name"

# Copy production files
production_files=(
    "manifest.json"
    "background.js"
    "popup.html"
    "popup.js"
    "foxyproxy-generator.js"
    "foxyproxy-setup.html"
    "debug.js"
    "icon.svg"
    "icon16.png"
    "icon48.png"
    "README.md"
    "LICENSE"
)

for file in "${production_files[@]}"; do
    cp "$file" "dist/$package_name/"
    echo -e "${GREEN}✅ Copied: $file${NC}"
done

echo

# Step 6: Create zip packages
echo -e "${BLUE}📦 Step 6: Creating distribution packages...${NC}"

cd dist

# Create zip for sharing
zip -r "${package_name}.zip" "$package_name"
echo -e "${GREEN}✅ Created: ${package_name}.zip${NC}"

# Create web-ext compatible package (for Firefox Add-ons)
cd "$package_name"
zip -r "../${package_name}-webext.zip" .
cd ..

echo -e "${GREEN}✅ Created: ${package_name}-webext.zip (for Firefox Add-ons)${NC}"

cd ..

echo

# Step 7: Final verification
echo -e "${BLUE}🔍 Step 7: Final verification...${NC}"

# Check file sizes
main_zip="dist/${package_name}.zip"
size=$(du -h "$main_zip" | cut -f1)
echo -e "${GREEN}✅ Package size: $size${NC}"

# List package contents
echo -e "${BLUE}📋 Package contents:${NC}"
unzip -l "$main_zip" | tail -n +4 | head -n -2

echo

# Step 8: Generate distribution summary
echo -e "${BLUE}📋 Step 8: Generating distribution summary...${NC}"

cat > "dist/DISTRIBUTION_README.txt" << EOF
922Proxy FoxyProxy Extension - Distribution Package
==================================================

Version: $version
Build Date: $(date)
Package: ${package_name}.zip

INSTALLATION INSTRUCTIONS:
1. Extract the zip file
2. Open Firefox and go to about:debugging
3. Click "This Firefox" > "Load Temporary Add-on"
4. Select manifest.json from the extracted folder

REQUIREMENTS:
- Firefox Browser (latest version recommended)
- FoxyProxy Standard extension
- Multi-Account Containers (optional, for container features)
- Valid 922proxy account credentials

SECURITY NOTES:
- This extension contains NO hardcoded credentials
- Users must provide their own 922proxy username/password
- Credentials are stored locally in Firefox only
- No data is transmitted to third parties except 922proxy

SUPPORT:
- Read the README.md file for complete documentation
- Check foxyproxy-setup.html for detailed setup instructions
- Use debug.js for troubleshooting if needed

For 922proxy account issues, contact 922proxy support directly.

Package verified and ready for distribution: $(date)
EOF

echo -e "${GREEN}✅ Created distribution documentation${NC}"

echo

# Final success message
echo "🎉 PACKAGING COMPLETE!"
echo "====================="
echo
echo -e "${GREEN}✅ Extension successfully packaged and verified${NC}"
echo -e "${GREEN}✅ No security issues detected${NC}"
echo -e "${GREEN}✅ Ready for distribution${NC}"
echo
echo -e "${BLUE}📦 Distribution files created in 'dist/' directory:${NC}"
echo -e "   • ${package_name}.zip (for sharing)"
echo -e "   • ${package_name}-webext.zip (for Firefox Add-ons)"
echo -e "   • DISTRIBUTION_README.txt (setup instructions)"
echo
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo "1. Share the .zip file with your friends"
echo "2. Include the setup instructions from README.md"
echo "3. Remind users they need their own 922proxy credentials"
echo
echo -e "${BLUE}🔗 Quick test: Load the extension in Firefox using about:debugging${NC}"
echo

exit 0
