import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Listen for reload notification from LensLoaderPlugin
        NotificationCenter.default.addObserver(self, selector: #selector(handleReload), name: NSNotification.Name("LensLoaderReload"), object: nil)
    }
    
    @objc func handleReload() {
        // When URL changes, we need to reload the app.
        // Since we can't fully restart the app programmatically, we'll try to load the new URL directly.
        // If the user wants a full "clean" start, they might need to force quit.
        
        DispatchQueue.main.async {
            if let savedUrl = UserDefaults.standard.string(forKey: "server_url"), 
            let url = URL(string: savedUrl) {
                print("LensLoader: Reloading to custom URL: \(savedUrl)")
                self.bridge?.webView?.load(URLRequest(url: url))
            } else {
                // Resetting to default.
                // We try to get the default URL from the bridge config, but it might be stale if we overrode it.
                // Best fallback is to ask user to restart, or try to read capacitor.config.json manually (hard).
                // For now, let's try to load the default bundle or server url if we can find it.
                // A simple reload might work if we didn't persist the override in the bridge instance permanently.
                
                print("LensLoader: Resetting to default URL")
                // This might just reload the CURRENT url if we don't change it.
                // Ideally, we should show an alert saying "Please restart the app".
                if let defaultUrl = self.bridge?.config.appStartServerURL {
                    self.webView?.load(URLRequest(url: defaultUrl))
                }
            }
        }
    }
}
