# Keep Pooja Accessibility Service and Voice Managers
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
