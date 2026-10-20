# Pooja Assistant - Android Voice AI

Production-grade Android AI Voice Assistant powered by Google Gemini AI, native Android SpeechRecognizer (Bengali `bn-BD` / `bn-IN` & English), and an Android Accessibility Service with a persistent floating overlay mic.

---

## 🚀 Capabilities

1. **Floating Overlay Activation**: Draggable floating bubble accessible across any app screen (`SYSTEM_ALERT_WINDOW`).
2. **Dual-Language Voice AI**: Bengali (`bn-BD`, `bn-IN`) and English speech input with natural Bengali Text-To-Speech (TTS).
3. **Google Gemini AI**: Answers real-world queries, provides advice, and analyzes screen content.
4. **App & Device Automation**:
   - **YouTube**: Voice search and direct video playback intents.
   - **App Launcher**: Instant launch for WhatsApp, Facebook, Camera, Phone Dialer.
   - **Device Control**: Camera flashlight toggle via `CameraManager`, media volume adjustments via `AudioManager`.
   - **Screen Reader**: Reads active window text aloud via `AccessibilityNodeInfo` traversal.

---

## 🛠️ Requirements & Setup

- **Android Studio**: Hedgehog (2023.1.1) / Iguana / Koala or newer.
- **Minimum SDK**: Android 10 (API 29).
- **Target SDK**: Android 15 (API 35).
- **JDK**: Java 17.

### Building via Terminal
```bash
./gradlew assembleDebug
```

### Quick Permissions Setup via ADB (Emulator / Physical Device)
For rapid testing without manual UI navigation in settings:
```bash
# Grant Audio Recording Permission
adb shell pm grant com.pooja.assistant android.permission.RECORD_AUDIO

# Grant Overlay Window Permission
adb shell appops set com.pooja.assistant SYSTEM_ALERT_WINDOW allow

# Enable Accessibility Service
adb shell settings put secure enabled_accessibility_services com.pooja.assistant/com.pooja.assistant.PoojaAccessibilityService
adb shell settings put secure accessibility_enabled 1
```
