// src/app.tsx
import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: connecting } = useConnect();
  const { disconnect } = useDisconnect();

  const [status, setStatus] = useState<string>("Not connected");
  const [joining, setJoining] = useState(false);

  // Auto-join when connected
  useEffect(() => {
    if (isConnected && address) {
      setStatus(`Connected: ${short(address)}`);
      // auto-join once per session / mount
      (async () => {
        await joinWaitlist(address, setStatus, setJoining);
      })();
    } else {
      setStatus("Not connected");
    }
  }, [isConnected, address]);

  return (
    <div className="page">
      <div className="logo" />
      <h2>Fid Master</h2>
      <p className="sub">Secure your Master — join waitlist</p>

      <div className="btns">
        {/* Connect using first available connector (Injected) */}
        <button
          onClick={() => {
            const injected = connectors.find((c) => c.id === "injected");
            if (injected) connect({ connector: injected });
            else connect();
          }}
        >
          Connect Wallet
        </button>

        {/* If you added a WalletConnect connector to wagmi.ts, this will show as an available connector */}
        {connectors
          .filter((c) => c.id !== "injected")
          .map((c) => (
            <button key={c.id} onClick={() => connect({ connector: c })}>
              {c.name}
            </button>
          ))}

        <button onClick={() => disconnect()}>Disconnect</button>

        <a className="btn" href="https://opensea.io/collection/fidmaster/overview" target="_blank" rel="noreferrer">
          OpenSea
        </a>

        <button className="primary" onClick={() => joinWaitlist(address, setStatus, setJoining)} disabled={joining}>
          {joining ? "Joining..." : "Join Waitlist"}
        </button>
      </div>

      <div id="status" className="status">
        {status}
      </div>

      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => {
            const text = encodeURIComponent(`I joined the Fid Master waitlist! ${address || ""}`);
            window.open(`https://warpcast.com/compose?text=${text}`, "_blank");
          }}
        >
          Share on Farcaster
        </button>
      </div>
    </div>
  );
}

/* helpers */
async function joinWaitlist(
  address: string | undefined,
  setStatus: (s: string) => void,
  setJoining: (b: boolean) => void
) {
  setJoining(true);
  try {
    setStatus("Joining waitlist...");
    // try server
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (res.ok) {
      const j = await res.json();
      setStatus(`Joined (server) ✔ ${short(address)}`);
      setJoining(false);
      return j;
    } else {
      throw new Error("server error " + res.status);
    }
  } catch (e) {
    // fallback local
    const list = JSON.parse(localStorage.getItem("fid_waitlist") || "[]");
    list.push({ address: address || null, ts: new Date().toISOString() });
    localStorage.setItem("fid_waitlist", JSON.stringify(list));
    setStatus(`Joined (local) ✔ ${short(address)}`);
    setJoining(false);
    return { local: true };
  }
}

function short(a?: string) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
