#!/bin/bash

echo "🎮 启动以斯帖记剧本杀游戏"
echo "================================"

# 检查Node.js版本
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✅ Node.js 版本检查通过: $node_version"
else
    echo "❌ Node.js 版本过低，需要 >= 18.0.0，当前版本: $node_version"
    exit 1
fi

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo ""
echo "🚀 启动选项:"
echo "1. 启动完整开发环境 (前端+后端)"
echo "2. 仅启动前端开发服务器"
echo "3. 仅启动后端服务器"
echo "4. 构建生产版本"
echo ""

read -p "请选择启动选项 (1-4): " choice

case $choice in
    1)
        echo "🔄 启动完整开发环境..."
        npm run dev:full
        ;;
    2)
        echo "🖥️  启动前端开发服务器..."
        npm run dev
        ;;
    3)
        echo "🖥️  启动后端服务器..."
        npm run server
        ;;
    4)
        echo "📦 构建生产版本..."
        npm run build
        echo "构建完成！文件输出到 dist/ 目录"
        echo "预览构建版本: npm run preview"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac