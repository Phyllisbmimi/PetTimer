import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Home, TreePine, Building2, Castle, Shirt, Bone, Gamepad2, Mic, Volume2, X } from 'lucide-react';
import { Pet, PetItem } from '../types';
import { speechService } from '../services/speechService';
import { chatWithPet } from '../services/qwenService';

interface AnimalsPageProps {
  pet: Pet;
  onFeed: () => void;
  onPet: () => void;
  onConsumeItem: (itemId: string) => void;
}

type Background = 'home' | 'forest' | 'city' | 'castle';

const AnimalsPage: React.FC<AnimalsPageProps> = ({ pet, onFeed, onPet, onConsumeItem }) => {
  const { t, i18n } = useTranslation();
  const [selectedBackground, setSelectedBackground] = useState<Background>('home');
  const [showReaction, setShowReaction] = useState(false);
  const [reaction, setReaction] = useState('');
  const [selectedClothing, setSelectedClothing] = useState<PetItem | null>(null);
  const [selectedFood, setSelectedFood] = useState<PetItem | null>(null);
  const [selectedToy, setSelectedToy] = useState<PetItem | null>(null);
  const [isEating, setIsEating] = useState(false);
  const [feedResponse, setFeedResponse] = useState('');
  const [activeTab, setActiveTab] = useState<'clothing' | 'food' | 'toy'>('food');
  
  // 語音對話狀態
  const [isListening, setIsListening] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [useTextMode, setUseTextMode] = useState(!speechService.isRecognitionSupported());
  const imageBaseUrl = import.meta.env.BASE_URL;
  const [petImageIndex, setPetImageIndex] = useState(0);
  const [petPosition, setPetPosition] = useState({ x: 50, y: 52 });
  const [isDraggingPet, setIsDraggingPet] = useState(false);
  const sceneRef = React.useRef<HTMLDivElement | null>(null);
  const petRef = React.useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPetImageIndex(0);
  }, [pet.type]);

  // 根據當前語言設置語音識別語言
  useEffect(() => {
    const langMap: Record<string, 'zh-HK' | 'zh-CN' | 'en-US'> = {
      'zh-HK': 'zh-HK',
      'zh-CN': 'zh-CN',
      'en': 'en-US',
    };
    const voiceLang = langMap[i18n.language] || 'en-US';
    speechService.setLanguage(voiceLang);
  }, [i18n.language]);

  const backgrounds = [
    { id: 'home' as Background, icon: Home, label: t('animals.backgrounds.home'), gradient: 'from-orange-200 via-yellow-100 to-orange-200', image: `${imageBaseUrl}backgrounds/home.png` },
    { id: 'forest' as Background, icon: TreePine, label: t('animals.backgrounds.forest'), gradient: 'from-green-300 via-emerald-200 to-green-300', image: `${imageBaseUrl}backgrounds/forest.png` },
    { id: 'city' as Background, icon: Building2, label: t('animals.backgrounds.city'), gradient: 'from-blue-300 via-sky-200 to-blue-300', image: `${imageBaseUrl}backgrounds/city.png` },
    { id: 'castle' as Background, icon: Castle, label: t('animals.backgrounds.castle'), gradient: 'from-purple-300 via-pink-200 to-purple-300', image: `${imageBaseUrl}backgrounds/castle.png` },
  ];

  const clothingItems = pet.items.filter(item => item.type === 'clothing');
  const foodItems = pet.items.filter(item => item.type === 'food');
  const toyItems = pet.items.filter(item => item.type === 'toy');

  const handlePetClick = () => {
    const reactions = ['❤️', '😊', '✨', '🌟', '💕', '😄', '🎉'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setReaction(randomReaction);
    setShowReaction(true);
    onPet();
    setTimeout(() => setShowReaction(false), 2000);
  };

  const handleFeedPet = (foodItem: PetItem) => {
    setSelectedFood(foodItem);
    setIsEating(true);
    setFeedResponse(t('animals.yummy') || 'Yummy!');
    onFeed();
    onConsumeItem(foodItem.id);

    setTimeout(() => setSelectedFood(null), 900);
    setTimeout(() => setIsEating(false), 1200);
    setTimeout(() => setFeedResponse(''), 1800);
  };

  const handleWearClothing = (clothingItem: PetItem) => {
    setSelectedClothing(clothingItem);
  };

  const handlePlayWithToy = (toyItem: PetItem) => {
    setSelectedToy(toyItem);
    setTimeout(() => setSelectedToy(null), 3000);
  };

  // 開始語音對話
  const handleStartVoiceChat = async () => {
    if (!speechService.isRecognitionSupported()) {
      setUseTextMode(true);
      setShowChatDialog(true);
      return;
    }

    try {
      setIsListening(true);
      setChatMessage(t('animals.listening') || '聆聽中...');
      setShowChatDialog(true);

      // 語音識別
      const userText = await speechService.startListening();
      setChatMessage(`${t('animals.youSaid') || '你說'}: "${userText}"`);

      // AI 回應
      await handleChatWithAI(userText);

    } catch (error) {
      console.error('Voice chat error:', error);
      setChatMessage(t('animals.voiceError') || '語音對話出錯了');
      setTimeout(() => setShowChatDialog(false), 2000);
    } finally {
      setIsListening(false);
    }
  };

  // 文字輸入對話
  const handleTextChat = async () => {
    if (!textInput.trim()) return;

    try {
      setChatMessage(`${t('animals.youSaid') || '你說'}: "${textInput}"`);
      setShowChatDialog(true);

      // AI 回應
      await handleChatWithAI(textInput);
      setTextInput('');

    } catch (error) {
      console.error('Text chat error:', error);
      setChatMessage(t('animals.voiceError') || '對話出錯了');
      setTimeout(() => setShowChatDialog(false), 2000);
    }
  };

  // 與 AI 對話的通用處理
  const handleChatWithAI = async (userText: string) => {
    setChatMessage(t('animals.thinking') || '思考中...');
    
    // 根據界面語言設置 AI 回應語言
    const langMap: Record<string, 'en' | 'zh-HK' | 'zh-CN'> = {
      'zh-HK': 'zh-HK',
      'zh-CN': 'zh-CN',
      'en': 'en',
    };
    const aiLang = langMap[i18n.language] || 'en';
    
    const petResponse = await chatWithPet(userText, pet.type, pet.name, pet.level, aiLang);
    setChatMessage(petResponse);

    // 移除自動語音播放，因為聽起來太像機器人
    // 用戶可以自己閱讀寵物的回應
    
    // 3秒後自動關閉
    setTimeout(() => {
      setShowChatDialog(false);
      setChatMessage('');
    }, 5000); // 增加到5秒，讓用戶有更多時間閱讀
  };

  // 停止語音
  const handleStopVoice = () => {
    speechService.stopListening();
    setIsListening(false);
    setShowChatDialog(false);
  };

  const getBackgroundStyle = () => {
    const bg = backgrounds.find(b => b.id === selectedBackground);
    return bg ? bg.image : backgrounds[0].image;
  };

  const getPetImageCandidates = () => {
    if (pet.type === 'dog') return [`${imageBaseUrl}backgrounds/dog.png`, `${imageBaseUrl}backgrounds/dog.jpg`];
    if (pet.type === 'cat') return [`${imageBaseUrl}backgrounds/cat.png`, `${imageBaseUrl}backgrounds/cat.jpg`];
    return [`${imageBaseUrl}backgrounds/fox.png`, `${imageBaseUrl}backgrounds/fox.jpg`];
  };

  const getPetImageSrc = () => {
    const candidates = getPetImageCandidates();
    return candidates[Math.min(petImageIndex, candidates.length - 1)];
  };

  const handlePetImageError = () => {
    const candidates = getPetImageCandidates();
    if (petImageIndex < candidates.length - 1) {
      setPetImageIndex((index) => index + 1);
    }
  };

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  const handlePetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const sceneElement = sceneRef.current;
    const petElement = petRef.current;
    if (!sceneElement || !petElement) return;

    const sceneRect = sceneElement.getBoundingClientRect();
    const petRect = petElement.getBoundingClientRect();
    const petCenterX = petRect.left - sceneRect.left + petRect.width / 2;
    const petCenterY = petRect.top - sceneRect.top + petRect.height / 2;
    const pointerX = e.clientX - sceneRect.left;
    const pointerY = e.clientY - sceneRect.top;

    dragOffsetRef.current = {
      x: pointerX - petCenterX,
      y: pointerY - petCenterY,
    };

    e.preventDefault();
    setIsDraggingPet(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPet) return;

    const sceneElement = sceneRef.current;
    const petElement = petRef.current;
    if (!sceneElement || !petElement) return;

    const sceneRect = sceneElement.getBoundingClientRect();
    const petRect = petElement.getBoundingClientRect();
    const halfPetWidth = petRect.width / 2;
    const halfPetHeight = petRect.height / 2;

    const rawCenterX = e.clientX - sceneRect.left - dragOffsetRef.current.x;
    const rawCenterY = e.clientY - sceneRect.top - dragOffsetRef.current.y;

    const clampedCenterX = clamp(rawCenterX, halfPetWidth, sceneRect.width - halfPetWidth);
    const clampedCenterY = clamp(rawCenterY, halfPetHeight, sceneRect.height - halfPetHeight);

    setPetPosition({
      x: (clampedCenterX / sceneRect.width) * 100,
      y: (clampedCenterY / sceneRect.height) * 100,
    });
  };

  const handlePetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPet) {
      setIsDraggingPet(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  // 获取衣服图片路径（如果存在）
  const getClothingImagePath = () => {
    if (!selectedClothing) return null;
    const clothingKey = getClothingKey();
    
    // 所有衣服都有自定义SVG图片
    const clothingItems = ['hat', 'cloak', 'crown', 'bow', 'sunglasses', 'scarf', 'superhero'];
    if (clothingItems.includes(clothingKey)) {
      return `${imageBaseUrl}clothing/${pet.type}-${clothingKey}.svg`;
    }
    
    return null; // 如果找不到对应的衣服类型，返回null
  };

  const getClothingEmoji = () => {
    if (!selectedClothing) return null;
    const clothingMap: Record<string, string> = {
      hat: '🎩',
      cloak: '🧥',
      crown: '👑',
      bow: '🎀',
      sunglasses: '🕶️',
      scarf: '🧣',
      superhero: '🦸',
      小帽子: '🎩',
      披風: '🧥',
      皇冠: '👑',
      蝴蝶結: '🎀',
      太陽眼鏡: '🕶️',
      圍巾: '🧣',
      超級英雄套裝: '🦸',
    };
    return clothingMap[selectedClothing.name] || '👕';
  };

  // 渲染衣服（优先使用图片，否则使用emoji）
  const renderClothing = () => {
    const imagePath = getClothingImagePath();
    if (imagePath) {
      return (
        <img 
          src={imagePath} 
          alt="clothing" 
          className="w-full h-full object-contain filter drop-shadow-lg"
          style={{ opacity: 0.95 }}
        />
      );
    }
    return <span>{getClothingEmoji()}</span>;
  };

  const getFoodEmoji = () => {
    if (!selectedFood) return null;
    const foodMap: Record<string, string> = {
      bone: '🦴',
      fish: '🐟',
      cake: '🎂',
      sushi: '🍣',
      carrot: '🥕',
      donut: '🍩',
      milk: '🥛',
      honey: '🍯',
      royalMeal: '🍱',
      骨頭: '🦴',
      魚: '🐟',
      蛋糕: '🎂',
      壽司: '🍣',
      胡蘿蔔: '🥕',
      甜甜圈: '🍩',
      牛奶: '🥛',
      蜂蜜罐: '🍯',
      皇家大餐: '🍱',
    };
    return foodMap[selectedFood.name] || '🍖';
  };

  const getToyEmoji = () => {
    if (!selectedToy) return null;
    const toyMap: Record<string, string> = {
      ball: '🎾',
      yarn: '🧶',
      frisbee: '🥏',
      duck: '🦆',
      puzzle: '🧩',
      piano: '🎹',
      car: '🚗',
      wand: '🪄',
      球: '🎾',
      毛球: '🧶',
      飛盤: '🥏',
      橡皮鴨: '🦆',
      拼圖盒: '🧩',
      迷你鋼琴: '🎹',
      遙控車: '🚗',
      星星魔杖: '🪄',
    };
    return toyMap[selectedToy.name] || '🎮';
  };

  const isHatSelected =
    selectedClothing?.name === 'hat' || selectedClothing?.name === '小帽子';
  const isSunglassesSelected =
    selectedClothing?.name === 'sunglasses' || selectedClothing?.name === '太陽眼鏡';

  const getClothingKey = () => {
    if (!selectedClothing) return '';

    const map: Record<string, string> = {
      hat: 'hat',
      小帽子: 'hat',
      cloak: 'cloak',
      披風: 'cloak',
      crown: 'crown',
      皇冠: 'crown',
      bow: 'bow',
      蝴蝶結: 'bow',
      sunglasses: 'sunglasses',
      太陽眼鏡: 'sunglasses',
      scarf: 'scarf',
      圍巾: 'scarf',
      superhero: 'superhero',
      超級英雄套裝: 'superhero',
    };

    return map[selectedClothing.name] || '';
  };

  const getClothingPositionClass = () => {
    const clothingKey = getClothingKey();
    const hasImage = getClothingImagePath() !== null;

    // 所有衣服使用图片时的样式
    if (hasImage) {
      if (clothingKey === 'hat') {
        if (pet.type === 'dog') return 'absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-20';
        if (pet.type === 'cat') return 'absolute -top-7 left-1/2 -translate-x-1/2 w-22 h-19';
        return 'absolute -top-7 left-1/2 -translate-x-1/2 w-23 h-19'; // fox
      }
      
      if (clothingKey === 'cloak') {
        if (pet.type === 'dog') return 'absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-36';
        if (pet.type === 'cat') return 'absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-32';
        return 'absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-38 h-34'; // fox
      }
      
      if (clothingKey === 'crown') {
        if (pet.type === 'dog') return 'absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-20';
        if (pet.type === 'cat') return 'absolute -top-5 left-1/2 -translate-x-1/2 w-24 h-17';
        return 'absolute -top-5 left-1/2 -translate-x-1/2 w-26 h-18'; // fox
      }
      
      if (clothingKey === 'bow') {
        if (pet.type === 'dog') return 'absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-14';
        if (pet.type === 'cat') return 'absolute top-[64%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-18 h-12';
        return 'absolute top-[63%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-19 h-13'; // fox
      }
      
      if (clothingKey === 'sunglasses') {
        if (pet.type === 'dog') return 'absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-10';
        if (pet.type === 'cat') return 'absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-8';
        return 'absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-22 h-9'; // fox
      }
      
      if (clothingKey === 'scarf') {
        if (pet.type === 'dog') return 'absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-22';
        if (pet.type === 'cat') return 'absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-25 h-20';
        return 'absolute top-[69%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-26 h-21'; // fox
      }
      
      if (clothingKey === 'superhero') {
        if (pet.type === 'dog') return 'absolute top-[76%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-32';
        if (pet.type === 'cat') return 'absolute top-[76%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-28';
        return 'absolute top-[76%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-34 h-30'; // fox
      }
      
    }

    // Fallback for emoji (如果没有图片)
    if (clothingKey === 'cloak') {
      return 'absolute top-[64%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg';
    }

    if (clothingKey === 'scarf') {
      return 'absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-lg';
    }

    if (clothingKey === 'superhero') {
      return 'absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg';
    }


    if (clothingKey === 'bow') {
      return 'absolute top-[66%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-lg';
    }

    if (clothingKey === 'crown') {
      return 'absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-lg';
    }

    if (isSunglassesSelected) {
      if (pet.type === 'dog') {
        return 'absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-lg';
      }

      return 'absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg';
    }

    if (!isHatSelected) {
      return 'absolute top-[24%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-lg';
    }

    if (pet.type === 'dog') {
      return 'absolute -top-12 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg';
    }

    return 'absolute -top-10 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg';
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="card-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7" />
              {t('animals.title')}
            </h2>
            <p className="text-white/70 mt-2">{t('animals.subtitle')}</p>
          </div>
          
          {/* 語音對話按鈕 */}
          <button
            onClick={handleStartVoiceChat}
            disabled={isListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
            }`}
          >
            {isListening ? (
              <>
                <Volume2 className="w-5 h-5 animate-pulse" />
                {t('animals.voiceChatting')}
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {speechService.isRecognitionSupported() ? t('animals.voiceChat') : t('animals.textChat')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 語音對話對話框 */}
      {showChatDialog && (
        <div className="card-blur bg-white/30 backdrop-blur-xl border-2 border-white/50">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5" />
              {t('animals.chatWith')} {pet.name}
            </h3>
            <button
              onClick={handleStopVoice}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 對話顯示區域 */}
          <div className="bg-white/20 rounded-xl p-4 min-h-[100px] flex items-center justify-center mb-3">
            <p className="text-white text-center text-lg leading-relaxed">{chatMessage}</p>
          </div>

          {/* 提示：點擊 X 可以關閉 */}
          {chatMessage && chatMessage !== (t('animals.listening') || '聆聽中...') && chatMessage !== (t('animals.thinking') || '思考中...') && !textInput && (
            <p className="text-white/60 text-xs text-center mt-2">
              {t('animals.autoCloseIn5sec') || '5秒後自動關閉，或點擊 X 立即關閉'}
            </p>
          )}

          {/* 文字輸入模式 */}
          {useTextMode && !isListening && (
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextChat()}
                placeholder={t('animals.typeMessage') || '輸入訊息...'}
                className="flex-1 px-4 py-2 rounded-lg bg-white/80 text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleTextChat}
                disabled={!textInput.trim()}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('animals.send') || '發送'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 背景選擇器 */}
      <div className="card-blur">
        <h3 className="text-lg font-bold text-white mb-3">{t('animals.selectBackground')}</h3>
        <div className="grid grid-cols-4 gap-3">
          {backgrounds.map((bg) => {
            const Icon = bg.icon;
            return (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                className={`p-4 rounded-xl transition-all ${
                  selectedBackground === bg.id
                    ? 'bg-white/30 ring-2 ring-white scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white text-xs font-semibold">{bg.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 主要動物展示區域 */}
      <div 
        ref={sceneRef}
        className="relative overflow-hidden rounded-3xl p-8 min-h-[400px] flex items-center justify-center border-4 border-white/30 shadow-2xl"
        style={{
          backgroundImage: `url(${getBackgroundStyle()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 半透明覆盖层增强可读性 */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* 裝飾元素根據背景變化 */}
        {selectedBackground === 'home' && (
          <>
            <div className="absolute top-6 left-6 text-5xl z-10 drop-shadow-lg">🏠</div>
            <div className="absolute top-6 right-6 text-4xl z-10 drop-shadow-lg">🖼️</div>
            <div className="absolute bottom-6 left-6 text-4xl z-10 drop-shadow-lg">🛋️</div>
            <div className="absolute bottom-6 right-6 text-3xl z-10 drop-shadow-lg">🪴</div>
            <div className="absolute top-1/2 left-8 text-3xl z-10 drop-shadow-lg">💡</div>
            <div className="absolute top-1/2 right-8 text-3xl z-10 drop-shadow-lg">📺</div>
            <div className="absolute bottom-20 left-1/4 text-2xl z-10 drop-shadow-lg">🧸</div>
          </>
        )}
        {selectedBackground === 'forest' && (
          <>
            <div className="absolute top-6 left-6 text-5xl z-10 drop-shadow-lg">🌲</div>
            <div className="absolute top-6 right-6 text-5xl z-10 drop-shadow-lg">🌳</div>
            <div className="absolute bottom-6 left-6 text-4xl z-10 drop-shadow-lg">🌲</div>
            <div className="absolute bottom-6 right-6 text-4xl z-10 drop-shadow-lg">🌳</div>
            <div className="absolute top-1/3 right-12 text-3xl animate-bounce z-10 drop-shadow-lg">🦋</div>
            <div className="absolute bottom-16 left-12 text-3xl z-10 drop-shadow-lg">🍄</div>
            <div className="absolute top-1/2 left-16 text-3xl z-10 drop-shadow-lg">🌺</div>
            <div className="absolute bottom-1/3 right-16 text-2xl z-10 drop-shadow-lg">🐿️</div>
          </>
        )}
        {selectedBackground === 'city' && (
          <>
            <div className="absolute top-6 left-6 text-5xl z-10 drop-shadow-lg">🏢</div>
            <div className="absolute top-6 right-6 text-5xl z-10 drop-shadow-lg">🏙️</div>
            <div className="absolute bottom-6 left-6 text-4xl z-10 drop-shadow-lg">🚗</div>
            <div className="absolute bottom-6 right-6 text-4xl z-10 drop-shadow-lg">🚦</div>
            <div className="absolute top-1/3 right-12 text-3xl z-10 drop-shadow-lg">🚁</div>
            <div className="absolute bottom-1/3 left-12 text-3xl z-10 drop-shadow-lg">🚌</div>
            <div className="absolute top-1/2 left-20 text-2xl z-10 drop-shadow-lg">☁️</div>
            <div className="absolute top-1/4 right-20 text-2xl z-10 drop-shadow-lg">☁️</div>
          </>
        )}
        {selectedBackground === 'castle' && (
          <>
            <div className="absolute top-6 left-6 text-5xl z-10 drop-shadow-lg">🏰</div>
            <div className="absolute top-6 right-6 text-4xl z-10 drop-shadow-lg">🗡️</div>
            <div className="absolute bottom-6 left-6 text-4xl z-10 drop-shadow-lg">🛡️</div>
            <div className="absolute bottom-6 right-6 text-4xl z-10 drop-shadow-lg">⚔️</div>
            <div className="absolute top-1/3 right-12 text-3xl z-10 drop-shadow-lg">👑</div>
            <div className="absolute bottom-1/3 left-12 text-3xl z-10 drop-shadow-lg">🔮</div>
            <div className="absolute top-1/2 right-20 text-2xl animate-pulse z-10 drop-shadow-lg">✨</div>
            <div className="absolute bottom-1/4 right-16 text-2xl z-10 drop-shadow-lg">🏺</div>
          </>
        )}

        {/* 動物主體（可點擊） */}
        <div 
          ref={petRef}
          onClick={handlePetClick}
          onPointerDown={handlePetPointerDown}
          onPointerMove={handlePetPointerMove}
          onPointerUp={handlePetPointerUp}
          onPointerCancel={handlePetPointerUp}
          className={`absolute cursor-grab select-none touch-none transform transition-transform active:scale-95 z-20 ${
            isDraggingPet ? 'scale-110 cursor-grabbing' : 'hover:scale-110'
          }`}
          style={{
            left: `${petPosition.x}%`,
            top: `${petPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            touchAction: 'none',
          }}
        >
          {/* 動物完整形象 */}
          <div className="flex flex-col items-center gap-4">
            {/* 主要動物圖片 */}
            <div className="relative">
              <img
                src={getPetImageSrc()}
                alt={pet.name}
                className="w-56 h-56 object-contain drop-shadow-2xl"
                draggable={false}
                onError={handlePetImageError}
              />
              
              {/* 衣服配飾 */}
              {selectedClothing && (
                <div className={getClothingPositionClass()}>
                  {renderClothing()}
                </div>
              )}

              {isEating && (
                <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-8 h-4 bg-black/70 rounded-b-full animate-pulse"></div>
              )}
            </div>
            
            {/* 可愛的腳印裝飾 */}
            <div className="flex gap-3 text-3xl opacity-70">
              <span>🐾</span>
              <span>🐾</span>
            </div>
          </div>

          {/* 反應氣泡（只在點擊時顯示） */}
          {showReaction && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce drop-shadow-xl">
              {reaction}
            </div>
          )}

          {feedResponse && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/90 text-dark font-bold px-4 py-1 rounded-full shadow-lg animate-bounce">
              {feedResponse}
            </div>
          )}

          {/* 食物動畫 - 飛向動物 */}
          {selectedFood && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce">
              {getFoodEmoji()}
            </div>
          )}

          {/* 玩具動畫 - 在旁邊旋轉 */}
          {selectedToy && (
            <div className="absolute top-1/4 -right-20 text-5xl animate-spin">
              {getToyEmoji()}
            </div>
          )}
        </div>

        {/* 寵物資訊 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-6 py-2 shadow-xl border-2 border-white z-20">
          <p className="text-gray-800 font-bold text-center text-lg">
            {pet.name} | Lv.{pet.level}
          </p>
        </div>
      </div>

      {/* 物品使用區域 */}
      <div className="card-blur">
        <h3 className="text-lg font-bold text-white mb-3">{t('animals.useItems')}</h3>
        
        {/* 標籤切換 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('food')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'food' ? 'bg-accent text-dark' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Bone className="w-4 h-4" />
            {t('animals.food')} ({foodItems.length})
          </button>
          <button
            onClick={() => setActiveTab('clothing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'clothing' ? 'bg-accent text-dark' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Shirt className="w-4 h-4" />
            {t('animals.clothing')} ({clothingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('toy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'toy' ? 'bg-accent text-dark' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            {t('animals.toys')} ({toyItems.length})
          </button>
        </div>

        {/* 物品列表 */}
        <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
          {activeTab === 'food' && foodItems.length === 0 && (
            <p className="col-span-4 text-white/60 text-center py-8">{t('animals.noItems')}</p>
          )}
          {activeTab === 'food' && foodItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleFeedPet(item)}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-1">
                {(item.name === 'bone' || item.name === '骨頭') && '🦴'}
                {(item.name === 'fish' || item.name === '魚') && '🐟'}
                {(item.name === 'cake' || item.name === '蛋糕') && '🎂'}
                {(item.name === 'sushi' || item.name === '壽司') && '🍣'}
                {(item.name === 'carrot' || item.name === '胡蘿蔔') && '🥕'}
                {(item.name === 'donut' || item.name === '甜甜圈') && '🍩'}
                {(item.name === 'milk' || item.name === '牛奶') && '🥛'}
                {(item.name === 'honey' || item.name === '蜂蜜罐') && '🍯'}
                {(item.name === 'royalMeal' || item.name === '皇家大餐') && '🍱'}
              </div>
              <p className="text-white text-xs font-semibold truncate">{item.name}</p>
            </button>
          ))}

          {activeTab === 'clothing' && clothingItems.length === 0 && (
            <p className="col-span-4 text-white/60 text-center py-8">{t('animals.noItems')}</p>
          )}
          {activeTab === 'clothing' && clothingItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleWearClothing(item)}
              className={`rounded-xl p-3 transition-all transform hover:scale-105 ${
                selectedClothing?.id === item.id 
                  ? 'bg-accent ring-2 ring-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="text-3xl mb-1">
                {(item.name === 'hat' || item.name === '小帽子') && '🎩'}
                {(item.name === 'cloak' || item.name === '披風') && '🧥'}
                {(item.name === 'crown' || item.name === '皇冠') && '👑'}
                {(item.name === 'bow' || item.name === '蝴蝶結') && '🎀'}
                {(item.name === 'sunglasses' || item.name === '太陽眼鏡') && '🕶️'}
                {(item.name === 'scarf' || item.name === '圍巾') && '🧣'}
                {(item.name === 'superhero' || item.name === '超級英雄套裝') && '🦸'}
              </div>
              <p className={`text-xs font-semibold truncate ${selectedClothing?.id === item.id ? 'text-dark' : 'text-white'}`}>
                {item.name}
              </p>
            </button>
          ))}

          {activeTab === 'toy' && toyItems.length === 0 && (
            <p className="col-span-4 text-white/60 text-center py-8">{t('animals.noItems')}</p>
          )}
          {activeTab === 'toy' && toyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePlayWithToy(item)}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-1">
                {(item.name === 'ball' || item.name === '球') && '🎾'}
                {(item.name === 'yarn' || item.name === '毛球') && '🧶'}
                {(item.name === 'frisbee' || item.name === '飛盤') && '🥏'}
                {(item.name === 'duck' || item.name === '橡皮鴨') && '🦆'}
                {(item.name === 'puzzle' || item.name === '拼圖盒') && '🧩'}
                {(item.name === 'piano' || item.name === '迷你鋼琴') && '🎹'}
                {(item.name === 'car' || item.name === '遙控車') && '🚗'}
                {(item.name === 'wand' || item.name === '星星魔杖') && '🪄'}
              </div>
              <p className="text-white text-xs font-semibold truncate">{item.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimalsPage;
