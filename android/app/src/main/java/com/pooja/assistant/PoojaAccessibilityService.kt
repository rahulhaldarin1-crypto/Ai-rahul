package com.pooja.assistant

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
