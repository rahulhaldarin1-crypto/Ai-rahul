package com.pooja.assistant

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
            val expectedComponentName = "${context.packageName}/${serviceClass.canonicalName}"
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
