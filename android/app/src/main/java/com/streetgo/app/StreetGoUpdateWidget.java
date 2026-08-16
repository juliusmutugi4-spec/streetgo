package com.streetgo.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class StreetGoUpdateWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(
            Context context,
            AppWidgetManager appWidgetManager,
            int[] appWidgetIds) {

        for (int appWidgetId : appWidgetIds) {

            RemoteViews views = new RemoteViews(
                    context.getPackageName(),
                    R.layout.streetgo_update_widget
            );

            views.setTextViewText(
                    R.id.widget_update_1,
                    "Welcome to StreetGO"
            );

            views.setTextViewText(
                    R.id.widget_update_2,
                    "Your latest updates will appear here"
            );

            appWidgetManager.updateAppWidget(
                    appWidgetId,
                    views
            );
        }
    }
}