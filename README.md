# WebRTC 一对一视频通话 Demo

基于 **React + TypeScript + Vite + Aceternity 风格 UI + WebRTC (PeerJS)** 的一对一视频聊天示例。

## 技术栈

- **React 18** + **TypeScript**
- **Vite** 构建
- **Tailwind CSS** + **Framer Motion**（Aceternity 风格动效）
- **PeerJS**：信令与 WebRTC 封装，使用公共服务器 `0.peerjs.com`，无需自建后端

## 使用方式

1. 安装依赖：`npm install`
2. 启动开发：`npm run dev`
3. 在浏览器打开页面，允许摄像头和麦克风
4. 将页面上显示的「你的设备 ID」发给对方
5. 在输入框填入对方的设备 ID，点击「拨打」即可建立一对一视频通话

## 脚本

- `npm run dev` — 开发环境
- `npm run build` — 生产构建
- `npm run preview` — 预览生产构建

## 说明

- 信令使用 PeerJS 官方免费服务器，仅适合本地/内网演示
- 如需生产使用，建议自建 PeerJS Server 或改用 WebSocket 信令
