package com.streetgo.app;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class StreetGoMessagingService extends FirebaseMessagingService {

@Override
public void onMessageReceived(RemoteMessage remoteMessage) {
    super.onMessageReceived(remoteMessage);

    String title = remoteMessage.getData().get("title");
    String body = remoteMessage.getData().get("body");

    Intent acceptIntent = new Intent(this, RideActionReceiver.class);
    acceptIntent.setAction("ACCEPT_RIDE");

    Intent rejectIntent = new Intent(this, RideActionReceiver.class);
    rejectIntent.setAction("REJECT_RIDE");

    PendingIntent acceptPendingIntent =
            PendingIntent.getBroadcast(
                    this,
                    100,
                    acceptIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

    PendingIntent rejectPendingIntent =
            PendingIntent.getBroadcast(
                    this,
                    101,
                    rejectIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

        NotificationChannel channel =
                new NotificationChannel(
                        "rides",
                        "Ride Requests",
                        NotificationManager.IMPORTANCE_HIGH
                );

        getSystemService(NotificationManager.class)
                .createNotificationChannel(channel);
    }

    NotificationCompat.Builder builder =
            new NotificationCompat.Builder(this, "rides")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .addAction(
                            0,
                            "❌ Reject",
                            rejectPendingIntent
                    )
                    .addAction(
                            0,
                            "✅ Accept",
                            acceptPendingIntent
                    );

    NotificationManagerCompat.from(this)
            .notify(1001, builder.build());
}

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);

        // Later we'll send the new FCM token to Supabase.
    }
}