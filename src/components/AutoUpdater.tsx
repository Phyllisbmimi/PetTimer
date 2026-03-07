import React, { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Download, RefreshCw } from 'lucide-react';

export const AutoUpdater: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();
      
      if (update?.available) {
        setUpdateAvailable(true);
        setUpdateInfo(update);
        console.log(`更新可用：${update.version} - ${update.date}`);
      }
    } catch (error) {
      console.error('檢查更新失敗：', error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsDownloading(true);

    try {
      // 下載並安裝更新
      await updateInfo.downloadAndInstall((progress: any) => {
        if (progress.event === 'Started') {
          console.log(`開始下載，檔案大小： ${progress.data.contentLength} bytes`);
        } else if (progress.event === 'Progress') {
          const percentage = Math.round((progress.data.chunkLength / progress.data.contentLength) * 100);
          setDownloadProgress(percentage);
        } else if (progress.event === 'Finished') {
          console.log('下載完成！');
        }
      });

      // 重啟應用以套用更新
      await relaunch();
    } catch (error) {
      console.error('更新失敗：', error);
      setIsDownloading(false);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="card-blur max-w-sm p-4 border-2 border-accent shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-accent/20 p-2 rounded-full">
            <Download className="w-6 h-6 text-accent" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">
              🎉 新版本可用！
            </h3>
            <p className="text-white/80 text-sm mb-2">
              版本 {updateInfo?.version} 已準備就緒
            </p>
            
            {isDownloading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>下載中... {downloadProgress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="btn-primary text-sm px-4 py-2"
                >
                  立即更新
                </button>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full font-semibold transition-colors"
                >
                  稍後提醒
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoUpdater;
