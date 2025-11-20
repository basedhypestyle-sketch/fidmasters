import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// declare window WalletConnectProvider for UMD usage
declare global {
  interface Window {
    WalletConnectProvider?: any;
  }
}

interface WalletState {
  address: string | null;
  short: string | null;
  connected: boolean;
}

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    short: null,
    connected: false,
  });

  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [msg, setMsg] = useState("I claimed an early whitelist spot for Fid Master!");
  const [frameOpen, setFrameOpen] = useState(false);

  const shorten = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  const connectMetaMask = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask not found");
      return;
    }
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const prov = new ethers.providers.Web3Provider((window as any).ethereum);
    const sign = prov.getSigner();
    const addr = await sign.getAddress();

    setProvider(prov);
    setSigner(sign);

    setWallet({ address: addr, short: shorten(addr), connected: true });
  };

  const connectWalletConnect = async () => {
    if (!window.WalletConnectProvider) {
      alert("WalletConnect not loaded yet");
      return;
    }
    const wc = new window.WalletConnectProvider.default({
      rpc: { 1: "https://rpc.ankr.com/eth" },
      qrcode: true,
    });
    await wc.enable();

    const prov = new ethers.providers.Web3Provider(wc);
    const sign = prov.getSigner();
    const addr = await sign.getAddress();

    setProvider(prov);
    setSigner(sign);

    setWallet({ address: addr, short: shorten(addr), connected: true });

    try { wc.on("disconnect", () => { disconnect(); }); } catch (e) {}
  };

  const disconnect = () => {
    setWallet({ address: null, short: null, connected: false });
    setProvider(null);
    setSigner(null);
    setFrameOpen(false);
  };

  const copyAddress = () => {
    if (wallet.address) navigator.clipboard.writeText(wallet.address);
  };

  const shareFarcaster = () => {
    const text = encodeURIComponent(`${msg} Wallet: ${wallet.address}`);
    window.open(`https://warpcast.com/compose?text=${text}`, "_blank");
  };

  const toggleFrame = () => setFrameOpen(s => !s);

  return (
    <div style={{ padding: 30, maxWidth: 760, margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="https://fid-master.vercel.app/icon.png" width={64} height={64} style={{ borderRadius: 14 }} />
        <div>
          <h1 style={{ margin: 0 }}>Fid Master</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Secure your Master — claim whitelist</p>
        </div>
      </header>

      {!wallet.connected ? (
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={connectMetaMask} className="btn">Connect MetaMask</button>
          <button onClick={connectWalletConnect} className="btn">WalletConnect</button>
          <a href="https://opensea.io/collection/fidmaster/overview" target="_blank" rel="noreferrer"><button className="btn">OpenSea</button></a>
        </div>
      ) : (
        <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Connected Wallet</div>
              <div style={{ padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, fontFamily: 'monospace' }}>{wallet.short}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>✓ You're on the whitelist!</div>
              <button onClick={copyAddress}>Copy</button>
            </div>
          </div>

          <button onClick={shareFarcaster} style={{ marginRight: 8 }} className="btn primary">Share on Farcaster</button>
          <button onClick={toggleFrame} className="btn">{frameOpen ? 'Close Frame' : 'Open Frame'}</button>

          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Message</label>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, marginTop: 6 }} />
          </div>

          {frameOpen && (
            <div style={{ overflow: 'hidden', borderRadius: 12, marginTop: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
              <iframe src={`https://warpcast.com/compose?text=${encodeURIComponent(msg + ' Wallet: ' + wallet.address)}`} width="100%" height={450} style={{ border: 'none' }}></iframe>
            </div>
          )}

          <button onClick={disconnect} style={{ marginTop: 20, background: '#ff4757' }} className="btn">Disconnect</button>
        </div>
      )}
    </div>
  );
}
