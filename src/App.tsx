import { motion } from "framer-motion";
import { MovingBorder } from "./components/MovingBorder";
import { useWebRTC } from "./hooks/useWebRTC";

export default function App() {
  const {
    myId,
    remoteId,
    setRemoteId,
    status,
    error,
    isMuted,
    isVideoOff,
    call,
    hangUp,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
  } = useWebRTC();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          WebRTC 一对一视频通话
        </h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          请使用耳机以获得更好体验
        </p>

        {error && (
          <motion.p
            className="text-red-400 text-center text-sm mb-4 rounded-lg bg-red-500/10 py-2 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 mb-6">
          <p className="text-zinc-400 text-sm mb-1">你的设备 ID（发给对方）</p>
          <p className="font-mono text-indigo-300 text-lg break-all mb-6">
            {myId || "正在连接..."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-zinc-400 text-sm block mb-2">
                对方设备 ID
              </label>
              <input
                type="text"
                placeholder="输入对方的设备 ID"
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-[var(--border)] px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <MovingBorder
                onClick={call}
                disabled={status === "connecting" || !myId}
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "connecting" ? "连接中…" : "拨打"}
              </MovingBorder>
              {status === "connected" && (
                <MovingBorder
                  onClick={hangUp}
                  borderClassName="!bg-gradient-to-r from-red-500 to-rose-500"
                  className="cursor-pointer bg-red-500/20 text-red-300"
                >
                  挂断
                </MovingBorder>
              )}
            </div>
          </div>
        </div>

        {status === "connected" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-[var(--border)]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                你
              </span>
            </div>
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                对方
              </span>
            </div>
          </motion.div>
        )}

        {status === "connected" && (
          <motion.div
            className="flex justify-center gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={toggleMute}
              className={`rounded-full p-3 transition-colors ${
                isMuted ? "bg-red-500/30 text-red-300" : "bg-[var(--card)] border border-[var(--border)] text-white"
              }`}
              title={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button
              type="button"
              onClick={toggleVideo}
              className={`rounded-full p-3 transition-colors ${
                isVideoOff ? "bg-red-500/30 text-red-300" : "bg-[var(--card)] border border-[var(--border)] text-white"
              }`}
              title={isVideoOff ? "开启摄像头" : "关闭摄像头"}
            >
              {isVideoOff ? "📷‍➖" : "📷"}
            </button>
          </motion.div>
        )}

        {status !== "connected" && localStream && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border)] max-w-xs mx-auto aspect-video bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            <p className="text-center text-zinc-500 text-sm py-2">本地预览</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
