#!/bin/bash

# PetTimer 開發環境一鍵啟動腳本
# 自動設置 Node/Rust 環境 + API key 檢查 + 熱重載

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  🐾 PetTimer 啟動程序${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 檢查 .env 配置
echo -e "\n${YELLOW}📋 檢查環境配置...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 文件不存在${NC}"
    echo -e "${YELLOW}正在從 .env.example 複製...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env 已創建${NC}"
fi

# 檢查 API key（支援 DASHSCOPE_API_KEY 或 VITE_DASHSCOPE_API_KEY）
dashscope_key=$(grep -E '^DASHSCOPE_API_KEY=' .env | head -1 | cut -d'=' -f2- | tr -d '"' | xargs)
vite_dashscope_key=$(grep -E '^VITE_DASHSCOPE_API_KEY=' .env | head -1 | cut -d'=' -f2- | tr -d '"' | xargs)

if [ -z "$dashscope_key" ] && [ -z "$vite_dashscope_key" ]; then
    echo -e "${RED}⚠️  AI API key 未設置（DASHSCOPE_API_KEY / VITE_DASHSCOPE_API_KEY）${NC}"
    echo -e "${YELLOW}請編輯 .env 文件，填入你的 DashScope API key${NC}"
    echo -e "${YELLOW}格式 1: DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx${NC}"
    echo -e "${YELLOW}格式 2: VITE_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx${NC}"
    echo ""
    echo -e "${BLUE}編輯命令: vim .env${NC}"
    echo -e "${BLUE}或使用 VS Code 打開 .env 文件${NC}"
    echo ""
    read -p "✋ 已填入 API key? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ 取消啟動${NC}"
        exit 1
    fi
else
    if [ -n "$dashscope_key" ]; then
        echo -e "${GREEN}✓ DASHSCOPE_API_KEY 已設置${NC}"
    fi
    if [ -n "$vite_dashscope_key" ]; then
        echo -e "${GREEN}✓ VITE_DASHSCOPE_API_KEY 已設置${NC}"
    fi
fi

# 2. 設置 Node 環境
echo -e "\n${YELLOW}📦 初始化 Node 環境...${NC}"
. ~/.nvm/nvm.sh
echo -e "${GREEN}✓ Node $(node -v) / npm $(npm -v)${NC}"

# 3. 設置 Rust 環境（用於 Tauri）
echo -e "\n${YELLOW}🦀 初始化 Rust 環境...${NC}"
if [ -f "$HOME/.cargo/env" ]; then
    . "$HOME/.cargo/env"
    echo -e "${GREEN}✓ Rust $(rustc --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Rust 未安裝，跳過${NC}"
fi

# 4. 檢查已安裝的依賴
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}📥 安裝 npm 依賴...${NC}"
    npm install
fi

# 5. 選擇運行模式
echo -e "\n${BLUE}選擇啟動模式:${NC}"
echo -e "  ${GREEN}1${NC}) Web 開發 (npm run dev)           - 瀏覽器模式，熱重載"
echo -e "  ${GREEN}2${NC}) 桌面應用 (npm run tauri:dev)    - Tauri 應用，熱重載"
echo -e "  ${GREEN}3${NC}) 打包桌面應用 (npm run tauri:build) - 生產版本"

read -p "選擇 (1/2/3): " choice

case $choice in
    1)
        echo -e "\n${BLUE}🌐 啟動 Web 開發服務器...${NC}"
        echo -e "${YELLOW}訪問: http://localhost:5173${NC}"
        echo -e "${YELLOW}代碼更新會自動熱重載 (無需重啟)${NC}"
        npm run dev
        ;;
    2)
        echo -e "\n${BLUE}🖥️  啟動 Tauri 桌面應用開發...${NC}"
        echo -e "${YELLOW}代碼更新會自動熱重載 (無需重啟)${NC}"
        npm run tauri:dev
        ;;
    3)
        echo -e "\n${BLUE}📦 構建生產版本...${NC}"
        echo -e "${YELLOW}此過程可能需要 5-10 分鐘 (首次會更慢)${NC}"
        npm run tauri:build
        echo -e "\n${GREEN}✓ 構建完成！${NC}"
        if [ -d "src-tauri/target/release/bundle" ]; then
            echo -e "${BLUE}生成的應用位於:${NC}"
            find "src-tauri/target/release/bundle" -type f \( -name "*.app" -o -name "*.dmg" -o -name "*.exe" -o -name "*.deb" \) | head -5
        fi
        ;;
    *)
        echo -e "${RED}❌ 無效選擇${NC}"
        exit 1
        ;;
esac
