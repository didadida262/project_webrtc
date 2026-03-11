import { motion } from "framer-motion";
import { CoolBackground } from "./components/CoolBackground";
import { MovingBorder } from "./components/MovingBorder";
import { useWebRTC } from "./hooks/useWebRTC";

export default function App() {
  const {
    myId,
    remoteId,
    setRemoteId,
    status,
    error,
    localStream,
    connectedRemoteId,
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
    <div className="relative min-h-screen h-screen text-white flex flex-col p-6 overflow-hidden">
      <CoolBackground />

      <header className="w-full py-4 mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          WebRTC 一对一视频通话
        </h1>
        <p className="text-zinc-400 text-center text-sm mt-1">
          请使用耳机以获得更好体验
        </p>
        {error && (
          <motion.p
            className="text-red-400 text-center text-sm mt-3 rounded-lg bg-red-500/10 py-2 px-4 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </header>

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <motion.aside
          className="w-full lg:w-80 shrink-0 min-h-0 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex-1 min-h-0 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 flex flex-col overflow-auto">
            <p className="text-zinc-400 text-sm mb-1">你的设备 ID（发给对方）</p>
            <p className="font-mono text-indigo-300 text-base break-all mb-6">
              {myId || "正在连接..."}
            </p>
            <label className="text-zinc-400 text-sm block mb-2">
              对方设备 ID
            </label>
            <input
              type="text"
              placeholder="输入对方的设备 ID"
              value={remoteId}
              onChange={(e) => setRemoteId(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-[var(--border)] px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex flex-col gap-3">
              <MovingBorder
                onClick={call}
                disabled={status === "connecting" || !myId}
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
              >
                {status === "connecting" ? "连接中…" : "拨打"}
              </MovingBorder>
              {status === "connected" && (
                <MovingBorder
                  onClick={hangUp}
                  borderClassName="!bg-gradient-to-r from-red-500 to-rose-500"
                  className="cursor-pointer bg-red-500/20 text-red-300 w-full justify-center"
                >
                  挂断
                </MovingBorder>
              )}
            </div>
            {status === "connected" && (
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`rounded-full p-2.5 transition-colors ${
                    isMuted ? "bg-red-500/30 text-red-300" : "bg-black/40 border border-[var(--border)] text-white"
                  }`}
                  title={isMuted ? "取消静音" : "静音"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`rounded-full p-2.5 transition-colors ${
                    isVideoOff ? "bg-red-500/30 text-red-300" : "bg-black/40 border border-[var(--border)] text-white"
                  }`}
                  title={isVideoOff ? "开启摄像头" : "关闭摄像头"}
                >
                  {isVideoOff ? "📷‍➖" : "📷"}
                </button>
              </div>
            )}
          </div>
        </motion.aside>

        <motion.section
          className="flex-1 min-w-0 min-h-0 flex flex-col gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 grid-rows-2 gap-4 flex-1 min-h-0">
            <div className="overflow-hidden border border-[var(--border)] bg-black min-h-0 relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                本机
              </span>
            </div>
            <div className="overflow-hidden border border-[var(--border)] bg-black min-h-0 relative flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover absolute inset-0"
              />
              {status !== "connected" && (
                <span className="relative z-10 flex flex-col items-center gap-2 text-zinc-500">
                  {status === "connecting" ? (
                    "连接中"
                  ) : (
                    <svg
                      className="w-12 h-12 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                      <path
                        strokeLinecap="round"
                        strokeWidth={1.5}
                        d="M4 4l16 16"
                      />
                    </svg>
                  )}
                </span>
              )}
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded z-10">
                {connectedRemoteId ? connectedRemoteId : "对方"}
              </span>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
