export interface AndroidProjectFile {
  path: string;
  name: string;
  category: 'manifest' | 'gradle' | 'kotlin' | 'xml' | 'config' | 'doc';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  // 1. Root settings.gradle.kts
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Gradle project settings, plugin repositories, and module declarations.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "PoojaAssistant"
include(":app")
`
  },

  // 2. Root build.gradle.kts
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    category: 'gradle',
    description: 'Top-level build file configuring Android Gradle Plugin and Kotlin.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  },

  // 3. gradle.properties
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    category: 'config',
    description: 'JVM flags and AndroidX migration settings.',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },

  // 4. App-level build.gradle.kts
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts (Module)',
    category: 'gradle',
    description: 'App dependencies including Google Gen AI SDK, Coroutines, AndroidX, and Material3.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.pooja.assistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pooja.assistant"
        minSdk = 29 // Android 10 (Q)
        targetSdk = 35 // Android 15 (Vanilla Ice Cream)
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Build config field for Gemini API Key placeholder
        // Replace with your actual Gemini API key in local.properties or gradle.properties
        buildConfigField("String", "GEMINI_API_KEY", "\\"" + (project.findProperty("GEMINI_API_KEY") ?: "YOUR_GEMINI_API_KEY_HERE") + "\\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.activity:activity-ktx:1.9.3")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // Google Generative AI SDK (Official Gemini SDK for Android)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // OkHttp & Retrofit for robust networking / REST fallback
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.code.gson:gson:2.11.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
`
  },

  // 5. AndroidManifest.xml
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Declares permissions (SYSTEM_ALERT_WINDOW, RECORD_AUDIO, etc.) and PoojaAccessibilityService.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.pooja.assistant">

    <!-- Audio & Speech Recognition Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Overlay & Floating Window Permissions -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Device Control & Quick Settings -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Foreground Service permissions for Android 14+ -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />

    <!-- Query packages to launch apps like YouTube, WhatsApp, Camera -->
    <queries>
        <package android:name="com.google.android.youtube" />
        <package android:name="com.whatsapp" />
        <package android:name="com.facebook.katana" />
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.media.action.IMAGE_CAPTURE" />
        </intent>
        <intent>
            <action android:name="android.intent.action.DIAL" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@drawable/ic_pooja_logo"
        android:label="@string/app_name"
        android:roundIcon="@drawable/ic_pooja_logo"
        android:supportsRtl="true"
        android:theme="@style/Theme.PoojaAssistant"
        tools:targetApi="35">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.PoojaAssistant">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Pooja Accessibility Service -->
        <service
            android:name=".PoojaAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true"
            android:label="@string/accessibility_service_label"
            android:description="@string/accessibility_service_description">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>

</manifest>
`
  },

  // 6. MainActivity.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Handles runtime permissions, overlay permissions (Settings.canDrawOverlays), and accessibility enablement.',
    content: `package com.pooja.assistant

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.pooja.assistant.databinding.ActivityMainBinding

/**
 * MainActivity handles:
 * 1. Runtime permission requests (RECORD_AUDIO, CAMERA for flashlight).
 * 2. Overlay permission check and prompt (Settings.ACTION_MANAGE_OVERLAY_PERMISSION).
 * 3. Accessibility Service activation guide (Settings.ACTION_ACCESSIBILITY_SETTINGS).
 * 4. Testing & launching Pooja assistant directly.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    // Register audio & camera runtime permissions
    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (recordAudioGranted) {
            updatePermissionStatus()
            checkOverlayPermission()
        } else {
            Toast.makeText(this, R.string.audio_permission_required, Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
    }

    private fun setupListeners() {
        binding.btnGrantPermissions.setOnClickListener {
            checkAndRequestPermissions()
        }

        binding.btnEnableOverlay.setOnClickListener {
            requestOverlayPermission()
        }

        binding.btnEnableAccessibility.setOnClickListener {
            openAccessibilitySettings()
        }

        binding.btnTestVoice.setOnClickListener {
            triggerPoojaServiceVoiceTest()
        }
    }

    private fun updatePermissionStatus() {
        // 1. Audio Permission
        val audioGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        binding.tvAudioStatus.text = if (audioGranted) {
            getString(R.string.status_granted)
        } else {
            getString(R.string.status_not_granted)
        }
        binding.tvAudioStatus.setTextColor(
            getColor(if (audioGranted) R.color.emerald_green else R.color.rose_red)
        )

        // 2. Overlay Permission
        val overlayGranted = Settings.canDrawOverlays(this)
        binding.tvOverlayStatus.text = if (overlayGranted) {
            getString(R.string.status_granted)
        } else {
            getString(R.string.status_not_granted)
        }
        binding.tvOverlayStatus.setTextColor(
            getColor(if (overlayGranted) R.color.emerald_green else R.color.rose_red)
        )

        // 3. Accessibility Service Enabled
        val accessibilityEnabled = isAccessibilityServiceEnabled(
            this,
            PoojaAccessibilityService::class.java
        )
        binding.tvAccessibilityStatus.text = if (accessibilityEnabled) {
            getString(R.string.status_active)
        } else {
            getString(R.string.status_inactive)
        }
        binding.tvAccessibilityStatus.setTextColor(
            getColor(if (accessibilityEnabled) R.color.emerald_green else R.color.amber_orange)
        )

        // Ready Banner
        val allReady = audioGranted && overlayGranted && accessibilityEnabled
        binding.layoutAllReadyCard.visibility = if (allReady) android.view.View.VISIBLE else android.view.View.GONE
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        requestPermissionsLauncher.launch(permissions.toTypedArray())
    }

    private fun checkOverlayPermission() {
        if (!Settings.canDrawOverlays(this)) {
            AlertDialog.Builder(this)
                .setTitle(R.string.overlay_permission_title)
                .setMessage(R.string.overlay_permission_explanation)
                .setPositiveButton(R.string.enable_now) { _, _ ->
                    requestOverlayPermission()
                }
                .setNegativeButton(R.string.cancel, null)
                .show()
        }
    }

    private fun requestOverlayPermission() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:$packageName")
        )
        startActivity(intent)
    }

    private fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
        Toast.makeText(this, R.string.find_and_enable_pooja, Toast.LENGTH_LONG).show()
    }

    private fun triggerPoojaServiceVoiceTest() {
        if (!isAccessibilityServiceEnabled(this, PoojaAccessibilityService::class.java)) {
            Toast.makeText(this, R.string.please_enable_accessibility_first, Toast.LENGTH_SHORT).show()
            openAccessibilitySettings()
            return
        }

        val service = PoojaAccessibilityService.instance
        if (service != null) {
            service.startListeningForVoiceCommand()
            Toast.makeText(this, R.string.pooja_is_listening_prompt, Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, R.string.accessibility_service_not_running, Toast.LENGTH_SHORT).show()
        }
    }

    companion object {
        fun isAccessibilityServiceEnabled(
            context: Context,
            serviceClass: Class<out android.accessibilityservice.AccessibilityService>
        ): Boolean {
            val expectedComponentName = "\${context.packageName}/\${serviceClass.canonicalName}"
            val enabledServicesSetting = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            val colonSplitter = TextUtils.SimpleStringSplitter(':')
            colonSplitter.setString(enabledServicesSetting)

            while (colonSplitter.hasNext()) {
                val componentName = colonSplitter.next()
                if (componentName.equals(expectedComponentName, ignoreCase = true)) {
                    return true
                }
            }
            return false
        }
    }
}
`
  },

  // 7. PoojaAccessibilityService.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/PoojaAccessibilityService.kt',
    name: 'PoojaAccessibilityService.kt',
    category: 'kotlin',
    description: 'Core Accessibility Service managing floating overlay mic, voice activation, and screen reading.',
    content: `package com.pooja.assistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/**
 * PoojaAccessibilityService is the central automation spine:
 * 1. Attaches a floating draggable overlay button across all apps.
 * 2. Reads the active window's accessibility nodes ("Read screen aloud").
 * 3. Dispatches intents and device control commands.
 * 4. Coordinates VoiceManager and GeminiManager.
 */
class PoojaAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var overlayManager: PoojaOverlayManager
    private lateinit var voiceManager: VoiceManager
    private lateinit var geminiManager: GeminiManager
    private lateinit var commandExecutor: CommandExecutor
    private val mainHandler = Handler(Looper.getMainLooper())

    companion object {
        var instance: PoojaAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this

        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_VIEW_CLICKED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_SPOKEN or
                    AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 100
        }
        this.serviceInfo = info

        initializeComponents()
    }

    private fun initializeComponents() {
        voiceManager = VoiceManager(this)
        geminiManager = GeminiManager(this)
        commandExecutor = CommandExecutor(this, voiceManager, geminiManager)
        overlayManager = PoojaOverlayManager(this) {
            // Triggered when user taps the floating mic button
            startListeningForVoiceCommand()
        }

        // Initialize Text-To-Speech with Bengali voice
        voiceManager.initializeTTS { success ->
            if (success) {
                // Show floating overlay once service is ready
                overlayManager.showOverlay()
            }
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Can track active package names or window changes for contextual intelligence
    }

    override fun onInterrupt() {
        voiceManager.stopSpeech()
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        overlayManager.removeOverlay()
        voiceManager.destroy()
    }

    /**
     * Start listening to the user via SpeechRecognizer.
     */
    fun startListeningForVoiceCommand() {
        overlayManager.updateState(PoojaOverlayManager.State.LISTENING)
        voiceManager.listen(
            onReady = {
                // Mic is open
            },
            onResult = { recognizedText ->
                overlayManager.updateState(PoojaOverlayManager.State.PROCESSING)
                handleRecognizedVoice(recognizedText)
            },
            onError = { errorMessage ->
                overlayManager.updateState(PoojaOverlayManager.State.IDLE)
                voiceManager.speak(getString(R.string.speech_error_retry))
            }
        )
    }

    /**
     * Route user's recognized speech:
     * 1. Check if it matches device automation (launch apps, YouTube, flashlight, volume, read screen).
     * 2. If it's a general question or knowledge query, ask Gemini AI.
     */
    private fun handleRecognizedVoice(text: String) {
        val cleanText = text.trim()
        if (cleanText.isEmpty()) {
            overlayManager.updateState(PoojaOverlayManager.State.IDLE)
            return
        }

        serviceScope.launch {
            val handled = commandExecutor.tryExecuteCommand(cleanText)
            if (!handled) {
                // Not a device automation command -> Delegate to Gemini AI
                queryGeminiAI(cleanText)
            } else {
                overlayManager.updateState(PoojaOverlayManager.State.IDLE)
            }
        }
    }

    /**
     * Sends voice query to Gemini model and speaks out response in natural Bengali/English.
     */
    private fun queryGeminiAI(query: String) {
        serviceScope.launch {
            overlayManager.updateState(PoojaOverlayManager.State.PROCESSING)

            // Optional screen context if user asked "what is on my screen"
            val screenContext = if (query.contains("স্ক্রিন", ignoreCase = true) ||
                query.contains("screen", ignoreCase = true)) {
                readCurrentScreenHierarchy()
            } else {
                null
            }

            val response = geminiManager.generateResponse(query, screenContext)
            overlayManager.updateState(PoojaOverlayManager.State.SPEAKING)
            voiceManager.speak(response) {
                overlayManager.updateState(PoojaOverlayManager.State.IDLE)
            }
        }
    }

    /**
     * Traverses the active window's AccessibilityNodeInfo to extract visible screen text.
     */
    fun readCurrentScreenHierarchy(): String {
        val rootNode = rootInActiveWindow ?: return getString(R.string.no_screen_content_found)
        val textCollector = StringBuilder()
        traverseNodes(rootNode, textCollector)
        val result = textCollector.toString().trim()
        return if (result.isEmpty()) getString(R.string.no_readable_text_found) else result
    }

    private fun traverseNodes(node: AccessibilityNodeInfo?, collector: StringBuilder) {
        if (node == null) return

        if (!node.text.isNullOrBlank()) {
            collector.append(node.text).append(". ")
        } else if (!node.contentDescription.isNullOrBlank()) {
            collector.append(node.contentDescription).append(". ")
        }

        for (i in 0 until node.childCount) {
            traverseNodes(node.getChild(i), collector)
        }
    }
}
`
  },

  // 8. VoiceManager.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/VoiceManager.kt',
    name: 'VoiceManager.kt',
    category: 'kotlin',
    description: 'Speech-to-Text with Bengali (bn-BD / bn-IN) & English models, and native Android TextToSpeech.',
    content: `package com.pooja.assistant

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale

/**
 * Manages native SpeechRecognizer (Bengali / English) and TextToSpeech (TTS).
 */
class VoiceManager(private val context: Context) : RecognitionListener {

    private val tag = "PoojaVoiceManager"
    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false

    private var onSpeechReadyCallback: (() -> Unit)? = null
    private var onSpeechResultCallback: ((String) -> Unit)? = null
    private var onSpeechErrorCallback: ((String) -> Unit)? = null
    private var onSpeechCompleteCallback: (() -> Unit)? = null

    init {
        initSpeechRecognizer()
    }

    private fun initSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(this@VoiceManager)
            }
        } else {
            Log.e(tag, "SpeechRecognizer is not available on this device")
        }
    }

    fun initializeTTS(onInitialized: (Boolean) -> Unit) {
        textToSpeech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Priority: Bengali (Bangladesh), Bengali (India), or fallback
                val bnLocaleBD = Locale("bn", "BD")
                val bnLocaleIN = Locale("bn", "IN")

                val result = when {
                    textToSpeech?.isLanguageAvailable(bnLocaleBD) == TextToSpeech.LANG_AVAILABLE ->
                        textToSpeech?.setLanguage(bnLocaleBD)
                    textToSpeech?.isLanguageAvailable(bnLocaleIN) == TextToSpeech.LANG_AVAILABLE ->
                        textToSpeech?.setLanguage(bnLocaleIN)
                    else -> textToSpeech?.setLanguage(Locale.getDefault())
                }

                textToSpeech?.setPitch(1.05f) // Natural friendly pitch for Pooja
                textToSpeech?.setSpeechRate(0.95f) // Clear pacing for Bengali & English

                textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {}
                    override fun onDone(utteranceId: String?) {
                        onSpeechCompleteCallback?.invoke()
                    }
                    override fun onError(utteranceId: String?) {
                        onSpeechCompleteCallback?.invoke()
                    }
                })

                isTtsReady = true
                onInitialized(true)
            } else {
                isTtsReady = false
                onInitialized(false)
            }
        }
    }

    /**
     * Start listening for voice input in Bengali or English.
     */
    fun listen(
        onReady: () -> Unit,
        onResult: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        this.onSpeechReadyCallback = onReady
        this.onSpeechResultCallback = onResult
        this.onSpeechErrorCallback = onError

        stopSpeech() // Stop any ongoing TTS audio before listening

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            // Primary language Bengali with English fallback
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
            putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("bn-IN", "en-US", "en-IN"))
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
        }

        speechRecognizer?.startListening(intent)
    }

    /**
     * Speak out text using TextToSpeech.
     */
    fun speak(text: String, onComplete: (() -> Unit)? = null) {
        this.onSpeechCompleteCallback = onComplete
        if (!isTtsReady || textToSpeech == null) {
            onComplete?.invoke()
            return
        }

        val utteranceId = "pooja_tts_\${System.currentTimeMillis()}"
        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    fun stopSpeech() {
        textToSpeech?.stop()
        speechRecognizer?.stopListening()
    }

    fun destroy() {
        stopSpeech()
        speechRecognizer?.destroy()
        textToSpeech?.shutdown()
    }

    // RecognitionListener Callbacks
    override fun onReadyForSpeech(params: Bundle?) {
        onSpeechReadyCallback?.invoke()
    }

    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}

    override fun onError(error: Int) {
        val errorMsg = when (error) {
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timed out"
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Permission denied"
            else -> "Speech recognition error ($error)"
        }
        onSpeechErrorCallback?.invoke(errorMsg)
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val bestMatch = matches?.firstOrNull() ?: ""
        onSpeechResultCallback?.invoke(bestMatch)
    }

    override fun onPartialResults(partialResults: Bundle?) {}
    override fun onEvent(eventType: Int, params: Bundle?) {}
}
`
  },

  // 9. GeminiManager.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/GeminiManager.kt',
    name: 'GeminiManager.kt',
    category: 'kotlin',
    description: 'Handles Google Gemini AI integration with system prompts for the Pooja Bengali persona and fallback logic.',
    content: `package com.pooja.assistant

import android.content.Context
import android.util.Log
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.generationConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * GeminiManager integrates Google Generative AI (Gemini 1.5/2.x/3.x SDK)
 * to answer user questions with a warm Bengali/English persona.
 */
class GeminiManager(private val context: Context) {

    private val tag = "PoojaGeminiManager"

    // Reads Gemini API Key from BuildConfig or local configuration
    private val apiKey = BuildConfig.GEMINI_API_KEY

    private val generativeModel: GenerativeModel by lazy {
        GenerativeModel(
            modelName = "gemini-1.5-flash", // Compatible with the Android client SDK
            apiKey = apiKey,
            generationConfig = generationConfig {
                temperature = 0.7f
                topK = 40
                topP = 0.95f
                maxOutputTokens = 250 // Concise for TTS voice playback
            },
            systemInstruction = com.google.ai.client.generativeai.type.content {
                text(
                    """
                    You are Pooja (পূজা), an affectionate, highly capable Android AI Voice Assistant.
                    1. When the user speaks in Bengali, reply in polite, natural Bengali (বাংলা).
                    2. When the user speaks in English, reply in concise, clear English.
                    3. Format responses for spoken Text-to-Speech (TTS):
                       - Maximum 2-3 sentences.
                       - No markdown, bold tags, bullet asterisks, or URLs.
                       - Start with friendly conversational phrases like "অবশ্যই", "হ্যাঁ", "আমি পূজা বলছি".
                    4. If screen content is attached, answer questions based on the visible screen text.
                    """.trimIndent()
                )
            }
        )
    }

    /**
     * Sends prompt to Gemini and returns text for TTS speech.
     */
    suspend fun generateResponse(prompt: String, screenContext: String? = null): String {
        return withContext(Dispatchers.IO) {
            try {
                if (apiKey.isBlank() || apiKey == "YOUR_GEMINI_API_KEY_HERE") {
                    return@withContext getOfflineFallbackResponse(prompt)
                }

                val finalPrompt = if (!screenContext.isNullOrBlank()) {
                    "$prompt\\n[Active Screen Context]: $screenContext"
                } else {
                    prompt
                }

                val response = generativeModel.generateContent(finalPrompt)
                val reply = response.text?.trim()
                if (reply.isNullOrBlank()) {
                    context.getString(R.string.gemini_empty_response)
                } else {
                    reply
                }
            } catch (e: Exception) {
                Log.e(tag, "Gemini API call failed", e)
                getOfflineFallbackResponse(prompt)
            }
        }
    }

    private fun getOfflineFallbackResponse(prompt: String): String {
        val lower = prompt.lowercase()
        return when {
            lower.contains("কেমন আছো") || lower.contains("how are you") ->
                "আমি পূজা, আমি খুব ভালো আছি! আপনি কেমন আছেন? আপনাকে কীভাবে সাহায্য করতে পারি?"
            lower.contains("তোমার নাম") || lower.contains("who are you") ->
                "আমি পূজা, আপনার ব্যক্তিগত স্মার্ট ভয়েস অ্যাসিস্ট্যান্ট।"
            lower.contains("সময়") || lower.contains("time") -> {
                val sdf = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
                "এখন সময় \${sdf.format(java.util.Date())}"
            }
            else ->
                "আমি আপনার কথা শুনতে পেয়েছি। সম্পূর্ণ এআই উত্তরের জন্য দয়া করে আপনার জেমিনাই এপিআই কী সক্রিয় করুন।"
        }
    }
}
`
  },

  // 10. CommandExecutor.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/CommandExecutor.kt',
    name: 'CommandExecutor.kt',
    category: 'kotlin',
    description: 'Routes automation voice commands: YouTube search, app launching, torch, volume, screen reading.',
    content: `package com.pooja.assistant

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log

/**
 * Handles device automation commands (Bengali & English voice queries).
 */
class CommandExecutor(
    private val service: PoojaAccessibilityService,
    private val voiceManager: VoiceManager,
    private val geminiManager: GeminiManager
) {

    private val tag = "PoojaCommandExecutor"
    private var isTorchOn = false

    /**
     * Evaluates whether the voice string matches a device action.
     * Returns true if handled, false if it should be delegated to Gemini AI.
     */
    fun tryExecuteCommand(command: String): Boolean {
        val c = command.lowercase().trim()

        return when {
            // 1. YouTube Search & Play
            c.contains("youtube") || c.contains("ইউটিউব") || c.contains("গান চালাও") || c.contains("ভিডিও") -> {
                handleYouTubeCommand(command)
                true
            }

            // 2. Read Screen Aloud via AccessibilityNodeInfo
            c.contains("স্ক্রিন পড়") || c.contains("স্ক্রিন পরে শোনাও") || c.contains("read screen") || c.contains("what is on my screen") -> {
                handleReadScreen()
                true
            }

            // 3. Quick Settings: Flashlight / Torch
            c.contains("টর্চ") || c.contains("ফ্ল্যাশলাইট") || c.contains("flashlight") || c.contains("torch") -> {
                toggleFlashlight(c)
                true
            }

            // 4. Quick Settings: Volume
            c.contains("ভলিউম") || c.contains("volume") || c.contains("আওয়াজ") -> {
                handleVolume(c)
                true
            }

            // 5. App Launchers
            c.contains("whatsapp") || c.contains("হোয়াটসঅ্যাপ") -> {
                launchApp("com.whatsapp", "হোয়াটসঅ্যাপ খুলছি", "Opening WhatsApp")
                true
            }
            c.contains("facebook") || c.contains("ফেসবুক") -> {
                launchApp("com.facebook.katana", "ফেসবুক খুলছি", "Opening Facebook")
                true
            }
            c.contains("camera") || c.contains("ক্যামেরা") -> {
                launchCamera()
                true
            }
            c.contains("phone") || c.contains("ডায়াল") || c.contains("ফোন") || c.contains("dialer") || c.contains("call") -> {
                launchDialer()
                true
            }

            else -> false // Send to Gemini AI
        }
    }

    private fun handleYouTubeCommand(originalQuery: String) {
        // Strip trigger words to extract song or query
        var searchQuery = originalQuery
            .replace("youtube", "", ignoreCase = true)
            .replace("ইউটিউব", "", ignoreCase = true)
            .replace("গান চালাও", "", ignoreCase = true)
            .replace("প্লে করো", "", ignoreCase = true)
            .replace("খুলো", "", ignoreCase = true)
            .replace("search", "", ignoreCase = true)
            .replace("play", "", ignoreCase = true)
            .trim()

        if (searchQuery.isBlank()) {
            searchQuery = "Bengali songs"
        }

        voiceManager.speak("ইউটিউবে \${searchQuery} সার্চ করছি...")

        try {
            // Explicit YouTube app intent
            val intent = Intent(Intent.ACTION_SEARCH).apply {
                setPackage("com.google.android.youtube")
                putExtra("query", searchQuery)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            service.startActivity(intent)
        } catch (e: Exception) {
            // Fallback to browser YouTube URL
            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://www.youtube.com/results?search_query=" + Uri.encode(searchQuery))
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            service.startActivity(webIntent)
        }
    }

    private fun handleReadScreen() {
        voiceManager.speak("স্ক্রিনের তথ্য পড়ছি...")
        val text = service.readCurrentScreenHierarchy()
        if (text.isNotBlank()) {
            // Read up to first 250 characters or summarize
            val spokenPortion = if (text.length > 300) text.substring(0, 300) + "..." else text
            voiceManager.speak(spokenPortion)
        } else {
            voiceManager.speak("স্ক্রিনে কোনো পড়ার মতো লেখা পাওয়া যায়নি।")
        }
    }

    private fun toggleFlashlight(command: String) {
        try {
            val cameraManager = service.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = cameraManager.cameraIdList.firstOrNull() ?: return

            val shouldTurnOn = when {
                command.contains("off") || command.contains("বন্ধ") -> false
                command.contains("on") || command.contains("জ্বালাও") || command.contains("চালু") -> true
                else -> !isTorchOn
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                cameraManager.setTorchMode(cameraId, shouldTurnOn)
                isTorchOn = shouldTurnOn
                val feedback = if (isTorchOn) "ফ্ল্যাশলাইট জ্বালানো হয়েছে" else "ফ্ল্যাশলাইট বন্ধ করা হয়েছে"
                voiceManager.speak(feedback)
            }
        } catch (e: Exception) {
            Log.e(tag, "Flashlight error", e)
            voiceManager.speak("দুঃখিত, ফ্ল্যাশলাইট নিয়ন্ত্রণ করা সম্ভব হয়নি।")
        }
    }

    private fun handleVolume(command: String) {
        val audioManager = service.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        when {
            command.contains("বাড়াও") || command.contains("up") || command.contains("increase") -> {
                audioManager.adjustStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    AudioManager.ADJUST_RAISE,
                    AudioManager.FLAG_SHOW_UI
                )
                voiceManager.speak("ভলিউম বাড়ানো হয়েছে")
            }
            command.contains("কমাও") || command.contains("down") || command.contains("decrease") -> {
                audioManager.adjustStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    AudioManager.ADJUST_LOWER,
                    AudioManager.FLAG_SHOW_UI
                )
                voiceManager.speak("ভলিউম কমানো হয়েছে")
            }
            command.contains("মিউট") || command.contains("mute") -> {
                audioManager.adjustStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    AudioManager.ADJUST_MUTE,
                    AudioManager.FLAG_SHOW_UI
                )
                voiceManager.speak("সাউন্ড মিউট করা হয়েছে")
            }
            else -> {
                voiceManager.speak("ভলিউম নিয়ন্ত্রণ করছি")
            }
        }
    }

    private fun launchApp(packageName: String, bnFeedback: String, enFeedback: String) {
        val pm = service.packageManager
        val launchIntent = pm.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            voiceManager.speak(bnFeedback)
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            service.startActivity(launchIntent)
        } else {
            voiceManager.speak("অ্যাপটি আপনার ফোনে ইনস্টল করা নেই।")
        }
    }

    private fun launchCamera() {
        voiceManager.speak("ক্যামেরা চালু করছি...")
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        service.startActivity(intent)
    }

    private fun launchDialer() {
        voiceManager.speak("ফোন ডায়ালার খুলছি...")
        val intent = Intent(Intent.ACTION_DIAL).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        service.startActivity(intent)
    }
}
`
  },

  // 11. PoojaOverlayManager.kt
  {
    path: 'app/src/main/java/com/pooja/assistant/PoojaOverlayManager.kt',
    name: 'PoojaOverlayManager.kt',
    category: 'kotlin',
    description: 'Creates and manages the floating draggable mic bubble overlay over any app.',
    content: `package com.pooja.assistant

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import kotlin.math.abs

/**
 * Manages the floating draggable overlay button across all screens using WindowManager.
 */
class PoojaOverlayManager(
    private val context: Context,
    private val onBubbleClick: () -> Unit
) {

    enum class State {
        IDLE,
        LISTENING,
        PROCESSING,
        SPEAKING
    }

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null
    private var ivBubbleMic: ImageView? = null
    private var isOverlayAttached = false

    private lateinit var layoutParams: WindowManager.LayoutParams

    fun showOverlay() {
        if (isOverlayAttached || !Settings.canDrawOverlays(context)) return

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 350
        }

        val inflater = LayoutInflater.from(context)
        overlayView = inflater.inflate(R.layout.layout_floating_mic, null)
        ivBubbleMic = overlayView?.findViewById(R.id.ivBubbleMic)

        setupTouchListener()

        try {
            windowManager.addView(overlayView, layoutParams)
            isOverlayAttached = true
            updateState(State.IDLE)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupTouchListener() {
        val view = overlayView ?: return

        view.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isDragging = false

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = layoutParams.x
                        initialY = layoutParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isDragging = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()

                        if (abs(dx) > 10 || abs(dy) > 10) {
                            isDragging = true
                            layoutParams.x = initialX + dx
                            layoutParams.y = initialY + dy
                            windowManager.updateViewLayout(overlayView, layoutParams)
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (!isDragging) {
                            onBubbleClick()
                        }
                        return true
                    }
                }
                return false
            }
        })
    }

    fun updateState(state: State) {
        val mic = ivBubbleMic ?: return
        when (state) {
            State.IDLE -> {
                mic.setImageResource(R.drawable.ic_floating_mic)
                mic.animate().scaleX(1.0f).scaleY(1.0f).setDuration(200).start()
            }
            State.LISTENING -> {
                mic.setImageResource(R.drawable.ic_mic)
                mic.animate().scaleX(1.25f).scaleY(1.25f).setDuration(250).start()
            }
            State.PROCESSING -> {
                mic.animate().rotationBy(360f).setDuration(600).start()
            }
            State.SPEAKING -> {
                mic.animate().scaleX(1.15f).scaleY(1.15f).setDuration(300).start()
            }
        }
    }

    fun removeOverlay() {
        if (isOverlayAttached && overlayView != null) {
            try {
                windowManager.removeView(overlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            isOverlayAttached = false
            overlayView = null
        }
    }
}
`
  },

  // 12. accessibility_service_config.xml
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    category: 'xml',
    description: 'Accessibility Service configuration enabling window content inspection and voice feedback.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeViewClicked|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackSpoken|feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagReportViewIds|flagRetrieveInteractiveWindows"
    android:canRetrieveWindowContent="true"
    android:canRequestFilterKeyEvents="false"
    android:canRequestTouchExplorationMode="false"
    android:canPerformGestures="true"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="100"
    android:settingsActivity="com.pooja.assistant.MainActivity" />
`
  },

  // 13. strings.xml
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'xml',
    description: 'App strings in Bengali and English for titles, permissions, and status feedback.',
    content: `<resources>
    <string name="app_name">Pooja Assistant</string>
    <string name="app_subtitle">আপনার ব্যক্তিগত এআই ভয়েস সহকারী</string>
    <string name="accessibility_service_label">Pooja AI Voice Service</string>
    <string name="accessibility_service_description">Pooja Assistant provides floating voice mic activation and screen reading capabilities to automate actions across your smartphone.</string>

    <!-- Permissions -->
    <string name="permissions_header">প্রয়োজনীয় অনুমতিসমূহ (Permissions)</string>
    <string name="audio_permission_title">মাইক্রোফোন অনুমতি (Microphone)</string>
    <string name="audio_permission_desc">বাংলা ও ইংরেজি ভয়েস নির্দেশ শোনার জন্য প্রয়োজনীয়।</string>
    <string name="audio_permission_required">ভয়েস শোনার জন্য মাইক্রোফোন অনুমতি আবশ্যক।</string>
    <string name="overlay_permission_title">অন্যান্য অ্যাপের উপর প্রদর্শন (Draw Overlays)</string>
    <string name="overlay_permission_desc">যেকোনো স্ক্রিন থেকে দ্রুত কথা বলার জন্য ফ্লোটিং বাটন।</string>
    <string name="overlay_permission_explanation">পূজা অ্যাসিস্ট্যান্টের ফ্লোটিং মাইক বাটনটি যেকোনো অ্যাপের উপরে সক্রিয় রাখতে ডিসপ্লে ওভারলে অনুমতি প্রয়োজন।</string>
    <string name="accessibility_title">অ্যাক্সেসিবিলিটি সার্ভিস (Accessibility Service)</string>
    <string name="accessibility_desc">স্ক্রিন পড়ে শোনানো ও সরাসরি অ্যাপ নিয়ন্ত্রণের জন্য।</string>

    <!-- Buttons & Actions -->
    <string name="btn_grant_permissions">অনুমতি প্রদান করুন</string>
    <string name="btn_enable_overlay">ওভারলে সক্রিয় করুন</string>
    <string name="btn_enable_accessibility">অ্যাক্সেসিবিলিটি চালু করুন</string>
    <string name="btn_test_voice">পূজার সাথে কথা বলুন (Test Voice)</string>
    <string name="enable_now">অনুমতি দিন</string>
    <string name="cancel">বাতিল</string>

    <!-- Status -->
    <string name="status_granted">অনুমোদিত (Granted)</string>
    <string name="status_not_granted">অনুমতি বাকি (Missing)</string>
    <string name="status_active">সক্রিয় (Active)</string>
    <string name="status_inactive">নিষ্ক্রিয় (Inactive)</string>
    <string name="all_systems_ready">পূজা সম্পূর্ণ প্রস্তুত!</string>
    <string name="ready_hint">স্ক্রিনের ফ্লোটিং আইকনে ট্যাপ করে কথা বলুন।</string>

    <!-- Assistant Prompts -->
    <string name="pooja_is_listening_prompt">পূজা শুনছে... বলুন!</string>
    <string name="speech_error_retry">দুঃখিত, শুনতে পারিনি। দয়া করে আবার বলুন।</string>
    <string name="gemini_empty_response">দুঃখিত, কোনো উত্তর পাওয়া যায়নি।</string>
    <string name="no_screen_content_found">স্ক্রিনে কোনো বিষয়বস্তু পাওয়া যায়নি।</string>
    <string name="no_readable_text_found">পড়ার মতো কোনো লেখা পাওয়া যায়নি।</string>
    <string name="find_and_enable_pooja">তালিকা থেকে "Pooja AI Voice Service" খুঁজে চালু করুন।</string>
    <string name="please_enable_accessibility_first">প্রথমে অ্যাক্সেসিবিলিটি সার্ভিস চালু করুন।</string>
    <string name="accessibility_service_not_running">সার্ভিসটি এখনো সক্রিয় হয়নি।</string>
</resources>
`
  },

  // 14. colors.xml
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    category: 'xml',
    description: 'Color palette with dark modern purple, neon violet, emerald, and dark accents.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_primary">#7C3AED</color>
    <color name="purple_primary_dark">#6D28D9</color>
    <color name="purple_accent">#A78BFA</color>
    <color name="purple_light">#DDD6FE</color>

    <color name="slate_900">#0F172A</color>
    <color name="slate_800">#1E293B</color>
    <color name="slate_700">#334155</color>
    <color name="slate_100">#F1F5F9</color>
    <color name="white">#FFFFFF</color>

    <color name="emerald_green">#10B981</color>
    <color name="rose_red">#F43F5E</color>
    <color name="amber_orange">#F59E0B</color>

    <color name="overlay_bubble_gradient_start">#9333EA</color>
    <color name="overlay_bubble_gradient_end">#4F46E5</color>
</resources>
`
  },

  // 15. themes.xml
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    category: 'xml',
    description: 'Material3 Edge-to-Edge Dark theme for Pooja Assistant.',
    content: `<resources>
    <style name="Theme.PoojaAssistant" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/purple_primary</item>
        <item name="colorPrimaryVariant">@color/purple_primary_dark</item>
        <item name="colorSecondary">@color/purple_accent</item>
        <item name="android:statusBarColor">@color/slate_900</item>
        <item name="android:navigationBarColor">@color/slate_900</item>
        <item name="android:windowBackground">@color/slate_900</item>
    </style>
</resources>
`
  },

  // 16. ic_pooja_logo.xml (Vector Drawable)
  {
    path: 'app/src/main/res/drawable/ic_pooja_logo.xml',
    name: 'ic_pooja_logo.xml',
    category: 'xml',
    description: 'Custom crisp vector logo for Pooja Assistant (Gradient AI aura and sound wave mic).',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Outer Glow Circle -->
    <path
        android:fillColor="#7C3AED"
        android:pathData="M54,4 C81.61,4 104,26.39 104,54 C104,81.61 81.61,104 54,104 C26.39,104 4,81.61 4,54 C4,26.39 26.39,4 54,4 Z" />
    <!-- Inner Radiant Core -->
    <path
        android:fillColor="#4F46E5"
        android:pathData="M54,12 C77.2,12 96,30.8 96,54 C96,77.2 77.2,96 54,96 C30.8,96 12,77.2 12,54 C12,30.8 30.8,12 54,12 Z" />
    <!-- Microphone Silhouette -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,26 C47.37,26 42,31.37 42,38 L42,54 C42,60.63 47.37,66 54,66 C60.63,66 66,60.63 66,54 L66,38 C66,31.37 60.63,26 54,26 Z" />
    <!-- Microphone Cradle -->
    <path
        android:fillColor="#DDD6FE"
        android:pathData="M72,50 C72,59.94 63.94,68 54,68 C44.06,68 36,59.94 36,50 L32,50 C32,61.4 40.71,70.76 51.8,71.86 L51.8,80 L44,80 L44,84 L64,84 L64,80 L56.2,80 L56.2,71.86 C67.29,70.76 76,61.4 76,50 L72,50 Z" />
    <!-- Bengali / AI Sparkle Star -->
    <path
        android:fillColor="#FBBF24"
        android:pathData="M78,24 L80,30 L86,32 L80,34 L78,40 L76,34 L70,32 L76,30 Z" />
</vector>
`
  },

  // 17. ic_floating_mic.xml
  {
    path: 'app/src/main/res/drawable/ic_floating_mic.xml',
    name: 'ic_floating_mic.xml',
    category: 'xml',
    description: 'Vector icon for the floating overlay button with circular gradient aura.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="64dp"
    android:height="64dp"
    android:viewportWidth="64"
    android:viewportHeight="64">
    <path
        android:fillColor="#8B5CF6"
        android:pathData="M32,2 C48.57,2 62,15.43 62,32 C62,48.57 48.57,62 32,62 C15.43,62 2,48.57 2,32 C2,15.43 15.43,2 32,2 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M32,16 C27.58,16 24,19.58 24,24 L24,34 C24,38.42 27.58,42 32,42 C36.42,42 40,38.42 40,34 L40,24 C40,19.58 36.42,16 32,16 Z" />
    <path
        android:fillColor="#EDE9FE"
        android:pathData="M44,32 C44,38.63 38.63,44 32,44 C25.37,44 20,38.63 20,32 L17,32 C17,39.63 22.82,45.89 30.2,46.88 L30.2,52 L26,52 L26,55 L38,55 L38,52 L33.8,52 L33.8,46.88 C41.18,45.89 47,39.63 47,32 L44,32 Z" />
</vector>
`
  },

  // 18. ic_mic.xml
  {
    path: 'app/src/main/res/drawable/ic_mic.xml',
    name: 'ic_mic.xml',
    category: 'xml',
    description: 'Active glowing microphone vector icon.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <path
        android:fillColor="#EC4899"
        android:pathData="M24,2 C36.15,2 46,11.85 46,24 C46,36.15 36.15,46 24,46 C11.85,46 2,36.15 2,24 C2,11.85 11.85,2 24,2 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M24,11 C20.69,11 18,13.69 18,17 L18,25 C18,28.31 20.69,31 24,31 C27.31,31 30,28.31 30,25 L30,17 C30,13.69 27.31,11 24,11 Z" />
    <path
        android:fillColor="#FCE7F3"
        android:pathData="M33,23 C33,27.97 28.97,32 24,32 C19.03,32 15,27.97 15,23 L13,23 C13,28.52 17.06,33.11 22.4,33.88 L22.4,38 L19,38 L19,40 L29,40 L29,38 L25.6,38 L25.6,33.88 C30.94,33.11 35,28.52 35,23 L33,23 Z" />
</vector>
`
  },

  // 19. overlay_bubble_bg.xml
  {
    path: 'app/src/main/res/drawable/overlay_bubble_bg.xml',
    name: 'overlay_bubble_bg.xml',
    category: 'xml',
    description: 'Shape drawable for floating overlay bubble with gradient and drop shadow styling.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <gradient
        android:angle="135"
        android:startColor="#8B5CF6"
        android:centerColor="#7C3AED"
        android:endColor="#4F46E5"
        android:type="linear" />
    <size
        android:width="60dp"
        android:height="60dp" />
    <stroke
        android:width="2dp"
        android:color="#C4B5FD" />
</shape>
`
  },

  // 20. layout_floating_mic.xml
  {
    path: 'app/src/main/res/layout/layout_floating_mic.xml',
    name: 'layout_floating_mic.xml',
    category: 'xml',
    description: 'Floating overlay view layout inflated by WindowManager.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="64dp"
    android:layout_height="64dp"
    android:clipChildren="false"
    android:clipToPadding="false">

    <ImageView
        android:id="@+id/ivBubbleMic"
        android:layout_width="56dp"
        android:layout_height="56dp"
        android:layout_gravity="center"
        android:background="@drawable/overlay_bubble_bg"
        android:elevation="8dp"
        android:padding="12dp"
        android:src="@drawable/ic_floating_mic"
        android:contentDescription="@string/app_name" />

</FrameLayout>
`
  },

  // 21. activity_main.xml
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    category: 'xml',
    description: 'MainActivity UI layout with permissions cards, status chips, and voice test launcher.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/slate_900"
    android:fillViewport="true">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="20dp">

        <!-- Header Card -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="20dp"
            app:cardBackgroundColor="@color/slate_800"
            app:cardCornerRadius="16dp"
            app:cardElevation="4dp"
            app:strokeColor="@color/purple_primary"
            app:strokeWidth="1dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:gravity="center"
                android:orientation="vertical"
                android:padding="24dp">

                <ImageView
                    android:layout_width="80dp"
                    android:layout_height="80dp"
                    android:src="@drawable/ic_pooja_logo"
                    android:contentDescription="@string/app_name" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="12dp"
                    android:text="@string/app_name"
                    android:textColor="@color/white"
                    android:textSize="24sp"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="4dp"
                    android:text="@string/app_subtitle"
                    android:textColor="@color/purple_accent"
                    android:textSize="14sp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- All Ready Card -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/layoutAllReadyCard"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="16dp"
            android:visibility="gone"
            app:cardBackgroundColor="#064E3B"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/all_systems_ready"
                    android:textColor="@color/white"
                    android:textSize="18sp"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="4dp"
                    android:text="@string/ready_hint"
                    android:textColor="@color/slate_100"
                    android:textSize="13sp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Section: Permissions -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            android:text="@string/permissions_header"
            android:textColor="@color/slate_100"
            android:textSize="16sp"
            android:textStyle="bold" />

        <!-- 1. Audio Card -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardBackgroundColor="@color/slate_800"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:padding="16dp">

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/audio_permission_title"
                        android:textColor="@color/white"
                        android:textSize="15sp"
                        android:textStyle="bold" />

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="@string/audio_permission_desc"
                        android:textColor="@color/slate_100"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/tvAudioStatus"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="6dp"
                        android:text="@string/status_not_granted"
                        android:textSize="12sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <Button
                    android:id="@+id/btnGrantPermissions"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_gravity="center_vertical"
                    android:text="@string/btn_grant_permissions"
                    android:textSize="12sp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- 2. Overlay Card -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardBackgroundColor="@color/slate_800"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:padding="16dp">

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/overlay_permission_title"
                        android:textColor="@color/white"
                        android:textSize="15sp"
                        android:textStyle="bold" />

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="@string/overlay_permission_desc"
                        android:textColor="@color/slate_100"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/tvOverlayStatus"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="6dp"
                        android:text="@string/status_not_granted"
                        android:textSize="12sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <Button
                    android:id="@+id/btnEnableOverlay"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_gravity="center_vertical"
                    android:text="@string/btn_enable_overlay"
                    android:textSize="12sp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- 3. Accessibility Card -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="20dp"
            app:cardBackgroundColor="@color/slate_800"
            app:cardCornerRadius="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:padding="16dp">

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/accessibility_title"
                        android:textColor="@color/white"
                        android:textSize="15sp"
                        android:textStyle="bold" />

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="@string/accessibility_desc"
                        android:textColor="@color/slate_100"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/tvAccessibilityStatus"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="6dp"
                        android:text="@string/status_inactive"
                        android:textSize="12sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <Button
                    android:id="@+id/btnEnableAccessibility"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_gravity="center_vertical"
                    android:text="@string/btn_enable_accessibility"
                    android:textSize="12sp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Action: Test Voice Assistant -->
        <Button
            android:id="@+id/btnTestVoice"
            style="@style/Widget.Material3.Button"
            android:layout_width="match_parent"
            android:layout_height="56dp"
            android:backgroundTint="@color/purple_primary"
            android:text="@string/btn_test_voice"
            android:textColor="@color/white"
            android:textSize="16sp" />

    </LinearLayout>
</ScrollView>
`
  },

  // 22. CI / GitHub Actions workflow
  {
    path: '.github/workflows/android.yml',
    name: 'android.yml (GitHub Actions CI)',
    category: 'config',
    description: 'Automated CI workflow to test and build debug APK on GitHub with JDK 17.',
    content: `name: Android CI Build

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew || true

    - name: Build with Gradle
      run: ./gradlew assembleDebug --stacktrace
      env:
        GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}

    - name: Upload Debug APK
      uses: actions/upload-artifact@v4
      with:
        name: pooja-assistant-debug-apk
        path: app/build/outputs/apk/debug/app-debug.apk
`
  },

  // 23. ProGuard rules
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    category: 'config',
    description: 'ProGuard / R8 rules preserving Generative AI SDK, Coroutines, and Accessibility classes.',
    content: `# Keep Pooja Accessibility Service and Voice Managers
-keep class com.pooja.assistant.PoojaAccessibilityService { *; }
-keep class com.pooja.assistant.VoiceManager { *; }
-keep class com.pooja.assistant.GeminiManager { *; }
-keep class com.pooja.assistant.CommandExecutor { *; }

# Google Generative AI SDK (Gemini)
-keep class com.google.ai.client.generativeai.** { *; }
-dontwarn com.google.ai.client.generativeai.**

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler { *; }

# OkHttp & Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn okhttp3.**
-dontwarn okio.**
`
  },

  // 24. README.md
  {
    path: 'README.md',
    name: 'README.md',
    category: 'doc',
    description: 'Complete documentation, ADB test commands, permissions guide, and architecture overview.',
    content: `# Pooja Assistant - Android Voice AI

Production-grade Android AI Voice Assistant powered by Google Gemini AI, native Android SpeechRecognizer (Bengali \`bn-BD\` / \`bn-IN\` & English), and an Android Accessibility Service with a persistent floating overlay mic.

---

## 🚀 Capabilities

1. **Floating Overlay Activation**: Draggable floating bubble accessible across any app screen (\`SYSTEM_ALERT_WINDOW\`).
2. **Dual-Language Voice AI**: Bengali (\`bn-BD\`, \`bn-IN\`) and English speech input with natural Bengali Text-To-Speech (TTS).
3. **Google Gemini AI**: Answers real-world queries, provides advice, and analyzes screen content.
4. **App & Device Automation**:
   - **YouTube**: Voice search and direct video playback intents.
   - **App Launcher**: Instant launch for WhatsApp, Facebook, Camera, Phone Dialer.
   - **Device Control**: Camera flashlight toggle via \`CameraManager\`, media volume adjustments via \`AudioManager\`.
   - **Screen Reader**: Reads active window text aloud via \`AccessibilityNodeInfo\` traversal.

---

## 🛠️ Requirements & Setup

- **Android Studio**: Hedgehog (2023.1.1) / Iguana / Koala or newer.
- **Minimum SDK**: Android 10 (API 29).
- **Target SDK**: Android 15 (API 35).
- **JDK**: Java 17.

### Building via Terminal
\`\`\`bash
./gradlew assembleDebug
\`\`\`

### Quick Permissions Setup via ADB (Emulator / Physical Device)
For rapid testing without manual UI navigation in settings:
\`\`\`bash
# Grant Audio Recording Permission
adb shell pm grant com.pooja.assistant android.permission.RECORD_AUDIO

# Grant Overlay Window Permission
adb shell appops set com.pooja.assistant SYSTEM_ALERT_WINDOW allow

# Enable Accessibility Service
adb shell settings put secure enabled_accessibility_services com.pooja.assistant/com.pooja.assistant.PoojaAccessibilityService
adb shell settings put secure accessibility_enabled 1
\`\`\`
`
  }
];
