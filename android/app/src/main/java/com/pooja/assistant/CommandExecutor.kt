package com.pooja.assistant

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

        voiceManager.speak("ইউটিউবে ${searchQuery} সার্চ করছি...")

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
