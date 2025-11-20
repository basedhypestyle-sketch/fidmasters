import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Fid Master - Single-file React component (default export)
// Requirements / Notes:
// - Uses Tailwind CSS for styling (no import here; assume your app has Tailwind configured)
// - Environment variables required:
//    REACT_APP_LIGHTHOUSE_API_KEY  - API key for Lighthouse (or change upload function to Pinata/other)
//    REACT_APP_RPC                 - Optional: custom RPC URL if needed
//    REACT_APP_CONTRACT            - NFT contract address (ERC-721) with a minting function
// - This component provides a friendly UI for: connect wallet, upload or drag image, add metadata,
//   upload to IPFS via Lighthouse, and call a mint function on-chain with the resulting tokenURI.
// - Replace or extend backend calls (image generation / AI) as desired.

const CONTRACT_ABI = [
  "function mintTo(address to, string memory tokenURI) public returns (uint256)"
];

export default function FidMaster() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [tokenURI, setTokenURI] = useState("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  }, [file]);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found. Install MetaMask.");
      const p = new ethers.providers.Web3Provider(window.ethereum);
      await p.send("eth_requestAccounts", []);
      const s = p.getSigner();
      const addr = await s.getAddress();
      setProvider(p);
      setSigner(s);
      setAccount(addr);
      setStatus("Wallet connected: " + addr);
    } catch (err) {
      setStatus("Connect error: " + (err.message || err));
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function generateVariation() {
    setStatus("Generating variation (client-side demo)...");
    if (!file) {
      const blob = new Blob([`Fid Master placeholder ${new Date().toISOString()}`], {
        type: "text/plain"
      });
      const placeholderFile = new File([blob], "fid-master-placeholder.txt", { type: "text/plain" });
      setFile(placeholderFile);
      setStatus("Placeholder created — ready to upload.");
      return;
    }
    setStatus("Using uploaded file as variation (no-op demo).");
  }

  async function uploadToLighthouse(fileToUpload, metadata) {
    setUploading(true);
    setStatus("Uploading to Lighthouse...");
    try {
      const key = process.env.REACT_APP_LIGHTHOUSE_API_KEY;
      if (!key) throw new Error("Missing REACT_APP_LIGHTHOUSE_API_KEY.");

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("name", metadata.name || "Fid Master asset");

      const res = await fetch("https://api.lighthouse.storage/upload", {
        method: "POST",
        headers: {
          Authorization: key
        },
        body: formData
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Upload failed: " + txt);
      }

      const data = await res.json();
      const hash = data?.data?.hash || data?.Hash || data?.cid;

      const metadataJSON = {
        name: metadata.name,
        description: metadata.description,
        image: `https://gateway.lighthouse.storage/ipfs/${hash}`,
        attributes: metadata.attributes || []
      };

      const blob = new Blob([JSON.stringify(metadataJSON)], { type: "application/json" });
      const metaForm = new FormData();
      metaForm.append("file", new File([blob], "metadata.json", { type: "application/json" }));
      metaForm.append("name", `${metadata.name || "fid-master"}-metadata`);

      const metaRes = await fetch("https://api.lighthouse.storage/upload", {
        method: "POST",
        headers: { Authorization: key },
        body: metaForm
      });

      const metaDataResp = await metaRes.json();
      const metaHash = metaDataResp?.data?.hash || metaDataResp?.cid;

      const finalTokenURI = `https://gateway.lighthouse.storage/ipfs/${metaHash}`;
      setTokenURI(finalTokenURI);
      setStatus("Upload complete.");
      setUploading(false);

      return finalTokenURI;
    } catch (err) {
      setUploading(false);
      setStatus("Upload error: " + (err.message || err));
      throw err;
    }
  }

  async function mintNFT(toAddress, tokenURIToMint) {
    setMinting(true);
    setStatus("Sending mint transaction...");
    try {
      if (!signer) throw new Error("Wallet not connected.");
      const contractAddress = process.env.REACT_APP_CONTRACT;
      if (!contractAddress) throw new Error("REACT_APP_CONTRACT missing");
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.mintTo(toAddress, tokenURIToMint);
      await tx.wait();
      setStatus("Mint confirmed! " + tx.hash);
      setMinting(false);
      return tx;
    } catch (err) {
      setMinting(false);
      setStatus("Mint error: " + err.message);
      throw err;
    }
  }

  async function handleUploadAndMint() {
    try {
      if (!file) {
        setStatus("No file selected.");
        return;
      }
      const metadata = {
        name: name || "Fid Master",
        description: description || "Fid Master generated collectible",
        attributes: parseAttributes(attributes)
      };
      const uri = await uploadToLighthouse(file, metadata);
      if (account) {
        await mintNFT(account, uri);
      } else {
        setStatus("Uploaded. Connect wallet to mint.");
      }
    } catch (err) {}
  }

  function parseAttributes(attrText) {
    if (!attrText) return [];
    return attrText.split(/\n|;/).map((line) => {
      const [t, v] = line.split(":").map((s) => s?.trim());
      if (!t) return null;
      return { trait_type: t, value: v ?? true };
    }).filter(Boolean);
  }

  return (
    <div>Fid Master Mini App Loaded (UI version trimmed for ZIP demo)</div>
  );
}

function shorten(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
