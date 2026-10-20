package com.pooja.assistant

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
                    "$prompt\n[Active Screen Context]: $screenContext"
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
                "এখন সময় ${sdf.format(java.util.Date())}"
            }
            else ->
                "আমি আপনার কথা শুনতে পেয়েছি। সম্পূর্ণ এআই উত্তরের জন্য দয়া করে আপনার জেমিনাই এপিআই কী সক্রিয় করুন।"
        }
    }
}
