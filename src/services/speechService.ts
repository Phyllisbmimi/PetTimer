// 語音服務 - 使用瀏覽器 Web Speech API
export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    // 初始化語音合成
    this.synthesis = window.speechSynthesis;

    // 初始化語音識別（如果瀏覽器支持）
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'zh-HK'; // 默認廣東話
    }
  }

  // 設置語言
  setLanguage(lang: 'zh-HK' | 'zh-CN' | 'en-US') {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // 開始聆聽
  async startListening(): Promise<string> {
    if (!this.recognition) {
      throw new Error('語音識別不支持');
    }

    if (this.isListening) {
      throw new Error('正在聆聽中');
    }

    return new Promise((resolve, reject) => {
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`語音識別錯誤: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // 停止聆聽
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // 文字轉語音
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number; lang?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      // 取消所有正在播放的語音
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // 設置參數
      utterance.rate = options?.rate || 1.0; // 語速 (0.1 - 10)
      utterance.pitch = options?.pitch || 1.0; // 音調 (0 - 2)
      utterance.volume = options?.volume || 1.0; // 音量 (0 - 1)
      utterance.lang = options?.lang || 'zh-HK'; // 語言

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  // 停止語音播放
  stopSpeaking() {
    this.synthesis.cancel();
  }

  // 檢查是否支持語音識別
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // 檢查是否支持語音合成
  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // 獲取可用的語音列表
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}

// 單例模式
export const speechService = new SpeechService();
