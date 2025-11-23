#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LensLoaderPlugin, "LensLoader",
    CAP_PLUGIN_METHOD(setServerUrl, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getServerUrl, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(resetServerUrl, CAPPluginReturnPromise);
)
