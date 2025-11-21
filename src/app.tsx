import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import useFarcasterContext from './hooks/useFarcasterContext'

export default function App(){ 
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const farcaster = useFarcasterContext()

  return (
    <div style={{fontFamily:'Inter,system-ui',padding:20,background:'#071026',minHeight:'100vh',color:'#fff'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <header style={{textAlign:'center'}}>
          <h1>Fid Master</h1>
          <p style={{opacity:0.8}}>Secure your Master — join waitlist</p>
        </header>

        <div style={{marginTop:20,background:'rgba(255,255,255,0.03)',padding:16,borderRadius:12}}>
          {!isConnected ? (
            <div>
              <p>Connect your wallet</p>
              {connectors.map(c => (
                <button key={c.id} onClick={() => connect({connector:c})} style={{marginRight:8}}>{c.name}</button>
              ))}
            </div>
          ) : (
            <div>
              <div>Connected: {address}</div>
              <div>Farcaster: {farcaster?.username ?? '—'}</div>
              <button onClick={() => disconnect()}>Disconnect</button>
            </div>
          )}
        </div>

        <footer style={{marginTop:20,textAlign:'center'}}>
          <a href="https://opensea.io/collection/fidmaster/overview" target="_blank" rel="noreferrer">OpenSea</a>
        </footer>
      </div>
    </div>
  )
}
