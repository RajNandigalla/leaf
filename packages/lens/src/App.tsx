import { useState, useEffect } from 'react';
import { Share } from '@capacitor/share';
import LensLoader from './plugins/LensLoader';
import styles from './App.module.scss';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  QrCode,
  Trash2,
  Sun,
  Moon,
  Circle,
  Info,
  AlertCircle,
  Loader2,
  Star,
  Package,
  Share2,
} from 'lucide-react';
import leafConfig from '../leaf.json';

// Helper function to validate URL
const validateUrl = (url: string): string => {
  if (!url.trim()) return 'URL cannot be empty';

  const urlPattern =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$|^(https?:\/\/)?((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(:\d+)?(\/.*)?$/;

  if (!urlPattern.test(url)) {
    return 'Please enter a valid URL or IP address';
  }

  return '';
};

// Helper function to format timestamp
const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

function App() {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [history, setHistory] = useState<
    { url: string; timestamp: number; isFavorite?: boolean }[]
  >([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [isClosingSettings, setIsClosingSettings] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClosingClearConfirm, setIsClosingClearConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isClosingHelp, setIsClosingHelp] = useState(false);
  const [theme, setTheme] = useState<'automatic' | 'light' | 'dark'>('automatic');
  const [deviceInfo, setDeviceInfo] = useState<{
    model: string;
    platform: string;
    osVersion: string;
    manufacturer: string;
  } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isClosingQR, setIsClosingQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [showPlugins, setShowPlugins] = useState(false);
  const [isClosingPlugins, setIsClosingPlugins] = useState(false);

  useEffect(() => {
    loadHistory();
    loadTheme();
    getDeviceInfo();

    // Add Deep Link Listener
    const addDeepLinkListener = async () => {
      CapacitorApp.addListener('appUrlOpen', (data) => {
        try {
          const urlObj = new URL(data.url);
          // Check if it's our scheme
          if (urlObj.protocol === 'leaflens:') {
            const targetUrl = urlObj.searchParams.get('url');
            if (targetUrl) {
              handleUrl(targetUrl);
            }
          }
        } catch (e) {
          console.error('Error parsing deep link:', e);
        }
      });
    };

    addDeepLinkListener();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  // Handle Back Button
  useEffect(() => {
    const handleBackButton = ({ canGoBack }: any) => {
      if (showSettings) {
        closeSettings();
      } else if (showPlugins) {
        closePlugins();
      } else if (showHelp) {
        closeHelp();
      } else if (showQR) {
        closeQR();
      } else if (showClearConfirm) {
        closeClearConfirm();
      } else if (isScanning) {
        stopScan();
      } else if (!canGoBack) {
        CapacitorApp.exitApp();
      }
    };

    const setupListener = async () => {
      const listener = await CapacitorApp.addListener('backButton', handleBackButton);
      return listener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [showSettings, showPlugins, showHelp, showQR, showClearConfirm, isScanning]);

  // Apply theme to document root and status bar
  useEffect(() => {
    const applyTheme = async () => {
      let isDark = false;

      if (theme === 'automatic') {
        document.documentElement.removeAttribute('data-theme');
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        document.documentElement.setAttribute('data-theme', theme);
        isDark = theme === 'dark';
      }

      if (Capacitor.isNativePlatform()) {
        try {
          if (isDark) {
            await StatusBar.setStyle({ style: Style.Dark });
          } else {
            await StatusBar.setStyle({ style: Style.Light });
          }
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (e) {
          console.error('Failed to set status bar', e);
        }
      }
    };

    applyTheme();
  }, [theme]);

  const loadHistory = async () => {
    const { value } = await Preferences.get({ key: 'history' });
    if (value) {
      setHistory(JSON.parse(value));
    }
  };

  const loadTheme = async () => {
    const { value } = await Preferences.get({ key: 'theme' });
    if (value) {
      setTheme(value as 'automatic' | 'light' | 'dark');
    }
  };

  const saveTheme = async (newTheme: 'automatic' | 'light' | 'dark') => {
    setTheme(newTheme);
    await Preferences.set({ key: 'theme', value: newTheme });

    // Apply theme immediately
    if (newTheme === 'automatic') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const saveHistory = async (newUrl: string) => {
    const newHistory = [
      { url: newUrl, timestamp: Date.now() },
      ...history.filter((h) => h.url !== newUrl),
    ].slice(0, 5);
    setHistory(newHistory);
    await Preferences.set({ key: 'history', value: JSON.stringify(newHistory) });
  };

  const deleteHistoryItem = async (urlToDelete: string) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    const newHistory = history.filter((h) => h.url !== urlToDelete);
    setHistory(newHistory);
    await Preferences.set({ key: 'history', value: JSON.stringify(newHistory) });
  };

  const getDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo({
        model: info.model,
        platform: info.platform,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
      });
    } catch (error) {
      console.error('Failed to get device info:', error);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl) {
      const error = validateUrl(newUrl);
      setUrlError(error);
    } else {
      setUrlError('');
    }
  };

  const toggleFavorite = async (url: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    const newHistory = history.map((h) =>
      h.url === url ? { ...h, isFavorite: !h.isFavorite } : h
    );
    setHistory(newHistory);
    await Preferences.set({ key: 'history', value: JSON.stringify(newHistory) });
  };

  // Sort history: favorites first, then by timestamp
  const getSortedHistory = () => {
    return [...history].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.timestamp - a.timestamp;
    });
  };

  const clearAllHistory = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    setHistory([]);
    await Preferences.set({ key: 'history', value: JSON.stringify([]) });
    closeClearConfirm();
  };

  const showClearConfirmation = () => {
    setShowClearConfirm(true);
  };

  const closeClearConfirm = () => {
    setIsClosingClearConfirm(true);
    setTimeout(() => {
      setShowClearConfirm(false);
      setIsClosingClearConfirm(false);
    }, 300);
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      await Haptics.impact({ style: ImpactStyle.Light });
      document.body.classList.add('barcode-scanner-active');

      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: 17,
      });

      if (result.ScanResult) {
        handleUrl(result.ScanResult);
      }

      stopScan();
    } catch (e) {
      console.error(e);
      stopScan();
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    document.body.classList.remove('barcode-scanner-active');
  };

  const handleUrl = async (inputUrl: string) => {
    // Validate URL first
    const error = validateUrl(inputUrl);
    if (error) {
      setUrlError(error);
      return;
    }

    let finalUrl = inputUrl;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'http://' + finalUrl;
    }

    setIsLoading(true);
    setUrlError('');

    await Haptics.impact({ style: ImpactStyle.Medium });
    await saveHistory(finalUrl);

    try {
      await LensLoader.setServerUrl({ url: finalUrl });
    } catch (error) {
      console.error('Failed to load URL:', error);
      setUrlError('Failed to connect to server. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSettings = () => {
    setIsClosingSettings(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosingSettings(false);
    }, 300); // Match animation duration
  };

  const closeHelp = () => {
    setIsClosingHelp(true);
    setTimeout(() => {
      setShowHelp(false);
      setIsClosingHelp(false);
    }, 300);
  };

  const showQRCode = (url: string) => {
    setQrUrl(url);
    setShowQR(true);
  };

  const closeQR = () => {
    setIsClosingQR(true);
    setTimeout(() => {
      setShowQR(false);
      setIsClosingQR(false);
      setQrUrl('');
    }, 300);
  };

  const closePlugins = () => {
    setIsClosingPlugins(true);
    setTimeout(() => {
      setShowPlugins(false);
      setIsClosingPlugins(false);
    }, 300);
  };

  const handleShare = async (url: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    console.log('LensLoader: handleShare called for', url);
    const deepLink = `leaflens://open?url=${url}`;
    console.log('LensLoader: Generated deep link', deepLink);
    try {
      const result = await Share.share({
        title: 'Open in Leaf Lens',
        text: `Check out this dev server: ${url}\nOpen in Leaf Lens: ${deepLink}`,
        dialogTitle: 'Share with team',
      });
      console.log('LensLoader: Share result', result);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={styles.container}>
      {!isScanning && (
        <>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logo}>
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    height: '1.5rem',
                    width: '1.5rem',
                    borderRadius: '0 10px 0px 10px',
                    background: 'rgb(43, 147, 72)',
                    border: '1px solid rgb(43, 147, 72)',
                  }}
                ></div>
                <div
                  style={{
                    height: '0.5rem',
                    width: '0.5rem',
                    borderRadius: '50%',
                    background: 'rgb(43, 147, 72)',
                    border: '1px solid rgb(43, 147, 72)',
                    marginLeft: '2px',
                  }}
                ></div>
              </div>
              <h1>Leaf Lens</h1>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => {
                  Haptics.impact({ style: ImpactStyle.Light });
                  setShowPlugins(true);
                }}
                className={styles.settingsButton}
              >
                <Package size={24} />
              </button>
              <button
                onClick={() => {
                  Haptics.impact({ style: ImpactStyle.Light });
                  setShowSettings(true);
                }}
                className={styles.settingsButton}
              >
                <Settings size={24} />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className={styles.main}>
            <div className={styles.historyHeader}>
              <h3>Development servers</h3>
              <button onClick={() => setShowHelp(true)} className={styles.helpButton}>
                <Info size={18} />
              </button>
            </div>

            <div className={styles.card}>
              <p className={styles.description}>
                Scan a QR code to preview your app or enter the URL manually to connect to your
                development server.
              </p>

              <div className={styles.actions}>
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={styles.actionButton}
                >
                  <span
                    className={`${styles.actionIcon} ${styles.chevron} ${showUrlInput ? styles.expanded : ''}`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <span>Enter URL manually</span>
                </button>

                {showUrlInput && (
                  <div className={styles.urlInput}>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="http://192.168.1.5:3000"
                      className={urlError ? styles.inputError : ''}
                    />
                    <button
                      onClick={() => handleUrl(url)}
                      disabled={!url || !!urlError || isLoading}
                      className={styles.goButton}
                    >
                      {isLoading ? <Loader2 size={16} className={styles.spinner} /> : 'Go'}
                    </button>
                  </div>
                )}
                {urlError && showUrlInput && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{urlError}</span>
                  </div>
                )}

                <button onClick={startScan} className={styles.actionButton}>
                  <span className={styles.actionIcon}>
                    <QrCode size={20} />
                  </span>
                  <span>Scan QR code</span>
                </button>
              </div>
            </div>

            {/* Recent History - Separate Cards */}
            {history.length > 0 ? (
              <div className={styles.historySection}>
                <div className={styles.historyHeader}>
                  <h3>Recent</h3>
                  <button onClick={showClearConfirmation} className={styles.clearAllButton}>
                    Clear All
                  </button>
                </div>
                <div className={styles.historyCards}>
                  {getSortedHistory().map((h, i) => (
                    <div key={i} className={styles.historyCard}>
                      <button
                        onClick={() => handleUrl(h.url)}
                        className={styles.historyCardContent}
                      >
                        <span className={styles.historyUrl}>{h.url}</span>
                        <span className={styles.historyTime}>{timeAgo(h.timestamp)}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(h.url);
                        }}
                        className={`${styles.favoriteButton} ${h.isFavorite ? styles.favorited : ''}`}
                        title={h.isFavorite ? 'Unpin' : 'Pin to top'}
                      >
                        <Star size={18} fill={h.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(h.url);
                        }}
                        className={styles.shareButton}
                        title="Share Deep Link"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showQRCode(h.url);
                        }}
                        className={styles.qrButton}
                        title="Show QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(h.url);
                        }}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <></>
            )}
          </main>
        </>
      )}

      {/* Settings Bottom Sheet */}
      {showSettings && (
        <div className={styles.bottomSheetOverlay} onClick={closeSettings}>
          <div
            className={`${styles.bottomSheet} ${isClosingSettings ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle}></div>
            <h2>Settings</h2>

            <section className={styles.settingsSection}>
              <h3>Theme</h3>
              <p className={styles.themeNote}>
                Automatic is only supported on operating systems that allow you to control the
                system-wide color scheme.
              </p>
              <div className={styles.themeOptions}>
                <button
                  onClick={() => saveTheme('automatic')}
                  className={`${styles.themeOption} ${theme === 'automatic' ? styles.active : ''}`}
                >
                  <span className={styles.themeIcon}>
                    <Circle size={20} />
                  </span>
                  <span>Automatic</span>
                  {theme === 'automatic' && <span className={styles.checkmark}>●</span>}
                </button>
                <button
                  onClick={() => saveTheme('light')}
                  className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                >
                  <span className={styles.themeIcon}>
                    <Sun size={20} />
                  </span>
                  <span>Light</span>
                  {theme === 'light' && <span className={styles.checkmark}>●</span>}
                </button>
                <button
                  onClick={() => saveTheme('dark')}
                  className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                >
                  <span className={styles.themeIcon}>
                    <Moon size={20} />
                  </span>
                  <span>Dark</span>
                  {theme === 'dark' && <span className={styles.checkmark}>●</span>}
                </button>
              </div>
            </section>

            {deviceInfo && (
              <section className={styles.settingsSection}>
                <h3>Device Info</h3>
                <div className={styles.appInfo}>
                  <div className={styles.infoRow}>
                    <span>Model</span>
                    <span>{deviceInfo.model}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Manufacturer</span>
                    <span>{deviceInfo.manufacturer}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>OS</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {deviceInfo.platform} {deviceInfo.osVersion}
                    </span>
                  </div>
                </div>
              </section>
            )}

            <section className={styles.settingsSection}>
              <h3>App Info</h3>
              <div className={styles.appInfo}>
                <div className={styles.infoRow}>
                  <span>Version</span>
                  <span>1.0.0</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Platform</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {deviceInfo?.platform || 'Web'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Bottom Sheet */}
      {showClearConfirm && (
        <div className={styles.bottomSheetOverlay} onClick={closeClearConfirm}>
          <div
            className={`${styles.bottomSheet} ${styles.confirmSheet} ${isClosingClearConfirm ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle}></div>
            <h2>Clear All History?</h2>
            <p className={styles.confirmMessage}>
              This will permanently delete all recent URLs from your history. This action cannot be
              undone.
            </p>
            <div className={styles.confirmButtons}>
              <button onClick={clearAllHistory} className={styles.confirmDelete}>
                Clear All
              </button>
              <button onClick={closeClearConfirm} className={styles.confirmCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <Loader2 size={48} className={styles.loadingSpinner} />
            <p>Connecting to server...</p>
          </div>
        </div>
      )}

      {/* Help Bottom Sheet */}
      {showHelp && (
        <div className={styles.bottomSheetOverlay} onClick={closeHelp}>
          <div
            className={`${styles.bottomSheet} ${styles.helpSheet} ${isClosingHelp ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle}></div>
            <h2>Network Connection</h2>
            <p className={styles.helpMessage}>
              To preview your app, ensure both your mobile device and development server are
              connected to the <strong>same WiFi network</strong>.
            </p>
            <div className={styles.helpSteps}>
              <div className={styles.helpStep}>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <h4>Start your dev server</h4>
                  <p>
                    Run your development server (e.g., <code>npm run dev</code>)
                  </p>
                </div>
              </div>
              <div className={styles.helpStep}>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <h4>Check your network</h4>
                  <p>Make sure your phone and computer are on the same WiFi</p>
                </div>
              </div>
              <div className={styles.helpStep}>
                <span className={styles.stepNumber}>3</span>
                <div>
                  <h4>Scan or enter URL</h4>
                  <p>Use the QR code or manually enter your server's local IP address</p>
                </div>
              </div>
            </div>
            <button onClick={closeHelp} className={styles.helpCloseButton}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Plugins Bottom Sheet */}
      {showPlugins && (
        <div className={styles.bottomSheetOverlay} onClick={closePlugins}>
          <div
            className={`${styles.bottomSheet} ${isClosingPlugins ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle}></div>
            <h2>Supported Plugins</h2>
            <div className={styles.appInfo}>
              {Object.entries(leafConfig.plugins).map(([name, version], index) => (
                <div key={index} className={styles.infoRow}>
                  <span>{name}</span>
                  <span>{version}</span>
                </div>
              ))}
            </div>
            <button onClick={closePlugins} className={styles.helpCloseButton}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Code Bottom Sheet */}
      {showQR && (
        <div className={styles.bottomSheetOverlay} onClick={closeQR}>
          <div
            className={`${styles.bottomSheet} ${styles.qrSheet} ${isClosingQR ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle}></div>
            <h2>QR Code</h2>
            <p className={styles.qrMessage}>Scan this QR code to open the URL</p>
            <div className={styles.qrCodeContainer}>
              <QRCodeSVG value={qrUrl} size={256} level="H" includeMargin={true} />
            </div>
            <div className={styles.qrUrl}>{qrUrl}</div>
            <button onClick={closeQR} className={styles.qrCloseButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
