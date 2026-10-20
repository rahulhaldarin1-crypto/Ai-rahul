package com.pooja.assistant

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
