@echo off
echo ===================================================
echo   THE APOCALYPSE: REALITY QUEST - APK BUILD HELPER
echo ===================================================
echo.
echo Syncing latest web game assets into Android project...
call npx cap copy android

echo.
echo Building Android Debug APK with Gradle...
cd android
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] APK built successfully!
    echo Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo ===================================================
    pause
) else (
    echo.
    echo ===================================================
    echo [NOTE] If Gradle build requires internet or Android SDK,
    echo you can simply open the 'android' folder in Android Studio
    echo and click: Build -> Build Bundle(s) / APK(s) -> Build APK(s).
    echo ===================================================
    pause
)
