package com.juanfeliperico.juegaencicla;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * Full-screen (immersive) game host. System bars are hidden (swipe to reveal them
 * temporarily) and the WebView is padded away from display cutouts / any visible
 * system bars, so the game never sits under a notch. Orientation stays unlocked.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        registerPlugin(BluetoothPlugin.class);
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        View content = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, windowInsets) -> {
            Insets i = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(i.left, i.top, i.right, i.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        hideSystemBars();
    }

    /* 3.9.1 · al salir de la app el juego se entera: el WebView pasa a «oculto» (la página se pausa sola) y el guardián del
       sonido (src/js/00b-sonido-guardian.js) calla la música y los efectos al instante; al volver, sigue lo que sonaba.
       Capacitor no pausa el WebView por su cuenta, así que antes la música seguía sonando con la app afuera. */
    @Override
    public void onPause() {
        WebView w = getBridge() != null ? getBridge().getWebView() : null;
        if (w != null) {
            w.evaluateJavascript("window.dispatchEvent(new Event('app:pausa'))", null);
            w.onPause();
        }
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        WebView w = getBridge() != null ? getBridge().getWebView() : null;
        if (w != null) {
            w.onResume();
            w.evaluateJavascript("window.dispatchEvent(new Event('app:sigue'))", null);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }
}
