package com.streetgo.app

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class RideActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {

        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        manager.cancel(1001)

        when (intent.action) {

            "ACCEPT_RIDE" -> {
                // We'll add the accept logic next.
            }

            "REJECT_RIDE" -> {
                // Notification dismissed.
            }
        }
    }
}