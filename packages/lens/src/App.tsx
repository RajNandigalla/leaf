import { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import styles from './App.module.scss';

function App() {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { value } = await Preferences.get({ key: 'history' });
    if (value) {
      setHistory(JSON.parse(value));
    }
  };

  const saveHistory = async (newUrl: string) => {
    const newHistory = [newUrl, ...history.filter((h) => h !== newUrl)].slice(0, 5);
    setHistory(newHistory);
    await Preferences.set({ key: 'history', value: JSON.stringify(newHistory) });
  };

  const startScan = async () => {
    try {
      const status = await Camera.requestPermissions();
      if (status.camera !== 'granted') {
        alert('Camera permission denied');
        return;
      }

      setIsScanning(true);
      document.body.classList.add('barcode-scanner-active');

      await BarcodeScanner.addListener('barcodesScanned', async (result) => {
        await stopScan();
        if (result.barcodes.length > 0 && result.barcodes[0].displayValue) {
          handleUrl(result.barcodes[0].displayValue);
        }
      });

      await BarcodeScanner.startScan();
    } catch (e) {
      console.error(e);
      stopScan();
    }
  };

  const stopScan = async () => {
    setIsScanning(false);
    document.body.classList.remove('barcode-scanner-active');
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  };

  const handleUrl = async (inputUrl: string) => {
    let finalUrl = inputUrl;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'http://' + finalUrl;
    }

    await Haptics.impact({ style: ImpactStyle.Medium });
    await saveHistory(finalUrl);
    window.location.href = finalUrl;
  };

  return (
    <div className={`${styles.container} ${isScanning ? styles.scanning : ''}`}>
      {!isScanning && (
        <>
          <div className={styles.header}>
            <h1>Leaf Lens</h1>
            <p>Preview your Leaf apps instantly</p>
          </div>

          <div className={styles.content}>
            <button onClick={startScan} className={styles.scanButton}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 20h.01M9 17h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Scan QR Code
            </button>

            <div className={styles.divider}>
              <span>or enter URL</span>
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://192.168.1.x:3000"
              />
              <button onClick={() => handleUrl(url)} disabled={!url}>
                Go
              </button>
            </div>

            {history.length > 0 && (
              <div className={styles.history}>
                <h3>Recent</h3>
                <div className={styles.historyList}>
                  {history.map((h, i) => (
                    <button key={i} onClick={() => handleUrl(h)} className={styles.historyItem}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isScanning && (
        <div className={styles.scannerOverlay}>
          <div className={styles.scannerFrame}></div>
          <div className={styles.scannerControls}>
            <button onClick={stopScan}>Cancel Scan</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
