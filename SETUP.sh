#!/bin/bash

# PetTimer 啟動指南

echo "🐾 PetTimer 專案設置完成！"
echo ""
echo "📋 已安裝的依賴:"
echo "  ✅ React 18.2.0"
echo "  ✅ TypeScript 5.1.0"
echo "  ✅ Tailwind CSS 3.3.0"
echo "  ✅ Vite 4.4.0"
echo "  ✅ Zustand 4.4.0"
echo ""

# 檢查 Node.js 和 npm
echo "🔧 環境檢查:"

# 載入 nvm
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh"
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo "  Node.js: $NODE_VERSION"
echo "  npm: $NPM_VERSION"
echo ""

# 提供啟動選項
echo "🚀 啟動選項:"
echo ""
echo "1️⃣  開發模式（帶熱重載）："
echo "   npm run dev"
echo ""
echo "2️⃣  生產構建："
echo "   npm run build"
echo ""
echo "3️⃣  預覽生產構建："
echo "   npm run preview"
echo ""
echo "4️⃣  Lint 代碼："
echo "   npm run lint"
echo ""

echo "📂 專案結構:"
cat <<'EOF'
PetTimer/
├── src/
│   ├── components/          # React 組件
│   ├── hooks/               # 自定義 Hooks
│   ├── store/               # Zustand 狀態管理
│   ├── types/               # TypeScript 定義
│   ├── App.tsx              # 主應用
│   ├── main.tsx             # 入口點
│   └── index.css            # 樣式
├── package.json             # 項目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
└── README.md                # 完整文檔
EOF

echo ""
echo "📖 文檔:"
echo "  📘 中文讀我：README.md"
echo "  📗 粵語指南：GUIDE_ZH_HK.md"
echo ""

echo "✨ 祝你遊戲愉快！🐾"
echo ""
echo "💡 提示：運行 'npm run dev' 來啟動開發伺服器"
echo ""
