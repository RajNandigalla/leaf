package com.leafink.lens;

import android.content.SharedPreferences;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.CapConfig;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Register the plugin we just created
    registerPlugin(LensLoaderPlugin.class);
    super.onCreate(savedInstanceState);
  }

  @Override
  protected void load() {
    String dynamicUrl = getIntent().getStringExtra("dynamic_url");

    // 2. If a custom URL exists, create a dynamic configuration
    if (dynamicUrl != null && !dynamicUrl.isEmpty()) {
      // We use the Builder to create a new config based on the current context
      // and override the Server URL.
      this.config = new CapConfig.Builder(this)
        .setServerUrl(dynamicUrl)
        // You might need to set 'hostname' to allow CORS/Cookies if your server expects it
        // .setHostname("your-api-domain.com")
        .create();
    }

    // 3. Proceed with standard loading (which uses this.config)
    super.load();
  }
}
