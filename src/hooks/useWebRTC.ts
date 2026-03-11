import Peer, { type MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";

const PEER_HOST = "0.peerjs.com";
const PEER_CONFIG = {
  host: PEER_HOST,
  secure: true,
  debug: 0,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  },
};

// 稍保守的约束，减轻偶发卡顿（尤其 Windows 主叫场景）
const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 960, max: 960 },
    height: { ideal: 540, max: 540 },
    frameRate: { ideal: 20, max: 24 },
  },
  audio: true,
};

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useWebRTC() {
  const [myId, setMyId] = useState<string>("");
  const [remoteId, setRemoteId] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectedRemoteId, setConnectedRemoteId] = useState<string>("");

  const peerRef = useRef<Peer | null>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const pendingCallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteRecoveryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const attachRemoteStream = useCallback((stream: MediaStream) => {
    const el = remoteVideoRef.current;
    if (!el) return;
    if (remoteRecoveryTimerRef.current) {
      clearInterval(remoteRecoveryTimerRef.current);
      remoteRecoveryTimerRef.current = null;
    }
    el.srcObject = stream;
    el.play().catch(() => {});
    remoteRecoveryTimerRef.current = setInterval(() => {
      const video = remoteVideoRef.current;
      if (!video?.srcObject) return;
      if (video.paused || video.readyState < 2) video.play().catch(() => {});
    }, 2500);
  }, []);

  const clearRemoteRecovery = useCallback(() => {
    if (remoteRecoveryTimerRef.current) {
      clearInterval(remoteRecoveryTimerRef.current);
      remoteRecoveryTimerRef.current = null;
    }
  }, []);

  const initPeer = useCallback(() => {
    if (peerRef.current) return;
    const id = randomId();
    const peer = new Peer(id, PEER_CONFIG);
    peerRef.current = peer;

    peer.on("open", () => {
      setMyId(peer.id);
      setStatus("idle");
    });

    peer.on("call", (call) => {
      setStatus("connecting");
      setConnectedRemoteId(call.peer);
      const streamToSend = localStreamRef.current;
      if (!streamToSend?.active) {
        setError("本地媒体未就绪，请刷新后重试");
        return;
      }
      const answerTimer = setTimeout(() => {
        call.answer(streamToSend);
        call.on("stream", (stream) => {
          setRemoteStream(stream);
          setStatus("connected");
          attachRemoteStream(stream);
        });
        call.on("close", () => {
          clearRemoteRecovery();
          setRemoteStream(null);
          setConnectedRemoteId("");
          setStatus("idle");
        });
        currentCallRef.current = call;
      }, 220);
      call.on("close", () => clearTimeout(answerTimer));
    });

    peer.on("error", (err: { message: string }) => {
      setError(err.message);
      setStatus("error");
    });
  }, [attachRemoteStream, clearRemoteRecovery]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia(MEDIA_CONSTRAINTS)
      .then((s) => {
        stream = s;
        localStreamRef.current = s;
        setLocalStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
        initPeer();
      })
      .catch((e) => {
        setError("无法获取摄像头/麦克风: " + (e?.message ?? String(e)));
        setStatus("error");
      });
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [initPeer]);

  const call = useCallback(() => {
    if (!peerRef.current || !remoteId.trim() || !localStream) {
      setError("请先输入对方 ID，并允许摄像头/麦克风");
      return;
    }
    setError(null);
    setStatus("connecting");
    setConnectedRemoteId(remoteId.trim());
    const id = remoteId.trim();
    const streamToSend = localStream;
    // 主叫端延迟发起 call，避免部分环境(如 Windows 主叫)下 offer 过早发出导致卡死
    pendingCallTimerRef.current = setTimeout(() => {
      pendingCallTimerRef.current = null;
      if (!peerRef.current || !streamToSend.active) return;
      const mediaCall = peerRef.current.call(id, streamToSend);
      mediaCall.on("stream", (stream) => {
        setRemoteStream(stream);
        setStatus("connected");
        attachRemoteStream(stream);
      });
      mediaCall.on("close", () => {
        clearRemoteRecovery();
        setRemoteStream(null);
        setConnectedRemoteId("");
        setStatus("idle");
      });
      mediaCall.on("error", (err: { message: string }) => {
        setError(err.message ?? "连接失败");
        setConnectedRemoteId("");
        setStatus("idle");
      });
      currentCallRef.current = mediaCall;
    }, 350);
  }, [remoteId, localStream, attachRemoteStream, clearRemoteRecovery]);

  const hangUp = useCallback(() => {
    if (pendingCallTimerRef.current) {
      clearTimeout(pendingCallTimerRef.current);
      pendingCallTimerRef.current = null;
    }
    clearRemoteRecovery();
    currentCallRef.current?.close();
    currentCallRef.current = null;
    setRemoteStream(null);
    setConnectedRemoteId("");
    setStatus("idle");
  }, [clearRemoteRecovery]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    const next = !isMuted;
    setIsMuted(next);
    localStream.getAudioTracks().forEach((t) => (t.enabled = !next));
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const next = !isVideoOff;
    setIsVideoOff(next);
    localStream.getVideoTracks().forEach((t) => (t.enabled = !next));
  }, [localStream, isVideoOff]);

  return {
    myId,
    remoteId,
    setRemoteId,
    status,
    error,
    localStream,
    remoteStream,
    connectedRemoteId,
    isMuted,
    isVideoOff,
    call,
    hangUp,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
  };
}
