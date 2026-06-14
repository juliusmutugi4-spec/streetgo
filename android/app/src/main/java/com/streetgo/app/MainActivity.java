package com.streetgo.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

        final long startTime = System.currentTimeMillis();

        splashScreen.setKeepOnScreenCondition(() ->
            System.currentTimeMillis() - startTime < 5000
        );

        super.onCreate(savedInstanceState);
    }
}
