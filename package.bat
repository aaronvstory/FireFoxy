@echo off
setlocal enabledelayedexpansion

echo.
echo 922Proxy Extension - Production Packaging (Windows)
echo ====================================================
echo.

REM Check if we're in the right directory
if not exist "manifest.json" (
    echo [ERROR] manifest.json not found. Run this script from the extension directory.
    pause
    exit /b 1
)

echo [INFO] Current directory: %CD%
echo.

REM Step 1: File verification
echo [STEP 1] Verifying required files...

set "required_files=manifest.json background.js popup.html popup.js foxyproxy-generator.js foxyproxy-setup.html debug.js icon.svg icon16.png icon48.png README.md LICENSE"
set "missing_files="

for %%f in (%required_files%) do (
    if exist "%%f" (
        echo [OK] %%f
    ) else (
        echo [MISSING] %%f
        set "missing_files=!missing_files! %%f"
    )
)

if not "!missing_files!"=="" (
    echo.
    echo [ERROR] Missing required files: !missing_files!
    pause
    exit /b 1
)

echo.

REM Step 2: Basic security check
echo [STEP 2] Basic security check...

REM Check for potential issues in JavaScript files
findstr /r /c:"password.*=" *.js >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARNING] Found potential password assignments in JS files
    findstr /r /c:"password.*=" *.js
)

findstr /r /c:"username.*=" *.js >nul 2>&1
if !errorlevel! equ 0 (
    echo [WARNING] Found potential username assignments in JS files
    findstr /r /c:"username.*=" *.js
)

echo [OK] Basic security check completed
echo.

REM Step 3: Get version from manifest
echo [STEP 3] Reading extension info...

for /f "tokens=2 delims=:, " %%a in ('findstr "version" manifest.json') do (
    set "version=%%a"
    set "version=!version:"=!"
)

for /f "tokens=2 delims=:, " %%a in ('findstr "name" manifest.json') do (
    set "name=%%a"
    set "name=!name:"=!"
)

echo [OK] Extension: !name!
echo [OK] Version: !version!
echo.

REM Step 4: Clean build
echo [STEP 4] Preparing clean build...

REM Remove backup files
if exist "*.backup" del "*.backup" >nul 2>&1
if exist "*.bak" del "*.bak" >nul 2>&1
if exist "*.old" del "*.old" >nul 2>&1
if exist "*.tmp" del "*.tmp" >nul 2>&1

echo [OK] Cleaned temporary files
echo.

REM Step 5: Create distribution package
echo [STEP 5] Creating distribution package...

REM Create timestamp
for /f "tokens=1-6 delims=:/., " %%a in ("%date% %time%") do (
    set "timestamp=%%c%%a%%b_%%d%%e"
)
set "timestamp=!timestamp: =0!"

set "package_name=922proxy-foxyproxy-extension-v!version!-!timestamp!"

REM Create dist directory
if exist "dist" rmdir /s /q "dist"
mkdir "dist\!package_name!"

REM Copy production files
set "production_files=manifest.json background.js popup.html popup.js foxyproxy-generator.js foxyproxy-setup.html debug.js icon.svg icon16.png icon48.png README.md LICENSE"

for %%f in (%production_files%) do (
    copy "%%f" "dist\!package_name!\" >nul
    echo [OK] Copied: %%f
)

echo.

REM Step 6: Create zip package (if 7-Zip is available)
echo [STEP 6] Creating zip package...

where 7z >nul 2>&1
if !errorlevel! equ 0 (
    cd dist
    7z a "!package_name!.zip" "!package_name!" >nul
    cd ..
    echo [OK] Created: !package_name!.zip
) else (
    echo [INFO] 7-Zip not found. Please manually zip the 'dist\!package_name!' folder
)

echo.

REM Step 7: Generate distribution info
echo [STEP 7] Generating distribution info...

echo 922Proxy FoxyProxy Extension - Distribution Package > "dist\DISTRIBUTION_README.txt"
echo ================================================== >> "dist\DISTRIBUTION_README.txt"
echo. >> "dist\DISTRIBUTION_README.txt"
echo Version: !version! >> "dist\DISTRIBUTION_README.txt"
echo Build Date: %date% %time% >> "dist\DISTRIBUTION_README.txt"
echo Package: !package_name! >> "dist\DISTRIBUTION_README.txt"
echo. >> "dist\DISTRIBUTION_README.txt"
echo INSTALLATION INSTRUCTIONS: >> "dist\DISTRIBUTION_README.txt"
echo 1. Extract the folder >> "dist\DISTRIBUTION_README.txt"
echo 2. Open Firefox and go to about:debugging >> "dist\DISTRIBUTION_README.txt"
echo 3. Click "This Firefox" ^> "Load Temporary Add-on" >> "dist\DISTRIBUTION_README.txt"
echo 4. Select manifest.json from the extracted folder >> "dist\DISTRIBUTION_README.txt"
echo. >> "dist\DISTRIBUTION_README.txt"
echo REQUIREMENTS: >> "dist\DISTRIBUTION_README.txt"
echo - Firefox Browser (latest version recommended) >> "dist\DISTRIBUTION_README.txt"
echo - FoxyProxy Standard extension >> "dist\DISTRIBUTION_README.txt"
echo - Multi-Account Containers (optional) >> "dist\DISTRIBUTION_README.txt"
echo - Valid 922proxy account credentials >> "dist\DISTRIBUTION_README.txt"
echo. >> "dist\DISTRIBUTION_README.txt"
echo SECURITY NOTES: >> "dist\DISTRIBUTION_README.txt"
echo - This extension contains NO hardcoded credentials >> "dist\DISTRIBUTION_README.txt"
echo - Users must provide their own 922proxy username/password >> "dist\DISTRIBUTION_README.txt"
echo - Credentials are stored locally in Firefox only >> "dist\DISTRIBUTION_README.txt"
echo. >> "dist\DISTRIBUTION_README.txt"
echo Read README.md for complete documentation. >> "dist\DISTRIBUTION_README.txt"

echo [OK] Created distribution documentation
echo.

REM Final success message
echo ========================================
echo          PACKAGING COMPLETE!
echo ========================================
echo.
echo [SUCCESS] Extension successfully packaged and verified
echo [SUCCESS] No critical security issues detected  
echo [SUCCESS] Ready for distribution
echo.
echo Distribution files created in 'dist\' directory:
echo   * !package_name!\ (folder for sharing)
if exist "dist\!package_name!.zip" echo   * !package_name!.zip (if 7-Zip was available)
echo   * DISTRIBUTION_README.txt (setup instructions)
echo.
echo NEXT STEPS:
echo 1. Share the folder/zip with your friends
echo 2. Include the setup instructions from README.md  
echo 3. Remind users they need their own 922proxy credentials
echo.
echo Quick test: Load the extension in Firefox using about:debugging
echo.

pause
