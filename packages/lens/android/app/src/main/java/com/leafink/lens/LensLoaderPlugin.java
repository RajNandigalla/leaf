package com.leafink.lens;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LensLoader")
public class LensLoaderPlugin extends Plugin {

  private static final String PREFS_NAME = "CapServerPrefs";
  private static final String KEY_SERVER_URL = "server_url";

  @PluginMethod
  public void setServerUrl(PluginCall call) {
    String newUrl = call.getString("url");

    if (newUrl == null || newUrl.isEmpty()) {
      call.reject("URL is required");
      return;
    }

    // 1. Save the URL to SharedPreferences
    Context context = getContext();
    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    prefs.edit().putString(KEY_SERVER_URL, newUrl).apply();

    // 2. Respond to JS success (before restarting)
    call.resolve();

    // 3. Restart the Activity on the main thread to apply changes
    getActivity().runOnUiThread(() -> {
      Intent intent = new Intent(getContext(), getActivity().getClass());
      intent.putExtra("dynamic_url", newUrl);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
      getContext().startActivity(intent);
      getActivity().finish();
    });
  }

  @PluginMethod
  public void getServerUrl(PluginCall call) {
    Context context = getContext();
    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    String savedUrl = prefs.getString(KEY_SERVER_URL, null);

    // If no custom URL is saved, return "default" or the current config URL
    if (savedUrl == null) {
      savedUrl = this.getBridge().getConfig().getServerUrl();
    }

    com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
    ret.put("url", savedUrl);
    call.resolve(ret);
  }

  @PluginMethod
  public void resetServerUrl(PluginCall call) {
    // Clear the preference
    Context context = getContext();
    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    prefs.edit().remove(KEY_SERVER_URL).apply();

    call.resolve();

    // Restart to load default capacitor.config.json values
    getActivity().runOnUiThread(() -> {
      getActivity().recreate();
    });
  }
}
