import Foundation
import Capacitor

@objc(LensLoaderPlugin)
public class LensLoaderPlugin: CAPPlugin {
    
    private let PREFS_KEY = "server_url"
    
    @objc func setServerUrl(_ call: CAPPluginCall) {
        guard let newUrl = call.getString("url"), !newUrl.isEmpty else {
            call.reject("URL is required")
            return
        }
        
        // 1. Save URL to UserDefaults
        UserDefaults.standard.set(newUrl, forKey: PREFS_KEY)
        UserDefaults.standard.synchronize()
        
        // 2. Resolve call
        call.resolve()
        
        // 3. Reload the app on main thread
        DispatchQueue.main.async {
            // We need to reload the bridge to pick up the new URL
            // The actual URL switching happens in ViewController.swift
            if let bridge = self.bridge {
                // Reloading the webview isn't enough because we need to change the server URL
                // The easiest way is to trigger a view controller reload or app restart
                // For now, let's try reloading the bridge's webview, but the config change needs to happen first
                // Since we can't easily restart the whole app, we rely on the user manually restarting
                // OR we can try to force a reload if we can access the ViewController
                
                // Better approach: Notify the ViewController to reload
                NotificationCenter.default.post(name: NSNotification.Name("LensLoaderReload"), object: nil)
            }
        }
    }
    
    @objc func getServerUrl(_ call: CAPPluginCall) {
        let savedUrl = UserDefaults.standard.string(forKey: PREFS_KEY)
        
        // If no custom URL, get the default from config
        let url = savedUrl ?? (self.bridge?.config.getString("server.url") ?? "")
        
        call.resolve([
            "url": url
        ])
    }
    
    @objc func resetServerUrl(_ call: CAPPluginCall) {
        UserDefaults.standard.removeObject(forKey: PREFS_KEY)
        UserDefaults.standard.synchronize()
        
        call.resolve()
        
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: NSNotification.Name("LensLoaderReload"), object: nil)
        }
    }
}
