package com.pooja.assistant

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

        val utteranceId = "pooja_tts_${System.currentTimeMillis()}"
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
