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

// 统一媒体约束，避免 Windows 等设备默认高分辨率导致主叫时 offer 过重、对方卡死
const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, max: 1280 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 24, max: 30 },
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
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

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
      // 接听方延迟 answer，缓解 Windows 主叫时 offer 与 answer 时序冲突导致的卡死
      const answerTimer = setTimeout(() => {
        call.answer(streamToSend);
        call.on("stream", (stream) => {
          setRemoteStream(stream);
          setStatus("connected");
          const el = remoteVideoRef.current;
          if (el) {
            el.srcObject = stream;
            el.play().catch(() => {});
          }
        });
        call.on("close", () => {
          setRemoteStream(null);
          setConnectedRemoteId("");
          setStatus("idle");
        });
        currentCallRef.current = call;
      }, 150);
      call.on("close", () => clearTimeout(answerTimer));
    });

    peer.on("error", (err) => {
      setError(err.message);
      setStatus("error");
    });
  }, []);

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
    const call = peerRef.current.call(remoteId, localStream);
    setConnectedRemoteId(remoteId.trim());
    call.on("stream", (stream) => {
      setRemoteStream(stream);
      setStatus("connected");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    });
    call.on("close", () => {
      setRemoteStream(null);
      setConnectedRemoteId("");
      setStatus("idle");
    });
    call.on("error", (err) => {
      setError(err.message ?? "连接失败");
      setConnectedRemoteId("");
      setStatus("idle");
    });
    currentCallRef.current = call;
  }, [remoteId, localStream]);

  const hangUp = useCallback(() => {
    currentCallRef.current?.close();
    currentCallRef.current = null;
    setRemoteStream(null);
    setConnectedRemoteId("");
    setStatus("idle");
  }, []);

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
