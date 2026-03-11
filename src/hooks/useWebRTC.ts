import Peer, { type MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";

const PEER_HOST = "0.peerjs.com";
const PEER_CONFIG = { host: PEER_HOST, secure: true, debug: 0 };

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
      call.answer(localStreamRef.current ?? undefined);
      call.on("stream", (stream) => {
        setRemoteStream(stream);
        setStatus("connected");
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      });
      call.on("close", () => {
        setRemoteStream(null);
        setStatus("idle");
      });
      currentCallRef.current = call;
    });

    peer.on("error", (err) => {
      setError(err.message);
      setStatus("error");
    });
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
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
    call.on("stream", (stream) => {
      setRemoteStream(stream);
      setStatus("connected");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    });
    call.on("close", () => {
      setRemoteStream(null);
      setStatus("idle");
    });
    call.on("error", (err) => {
      setError(err.message ?? "连接失败");
      setStatus("idle");
    });
    currentCallRef.current = call;
  }, [remoteId, localStream]);

  const hangUp = useCallback(() => {
    currentCallRef.current?.close();
    currentCallRef.current = null;
    setRemoteStream(null);
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
