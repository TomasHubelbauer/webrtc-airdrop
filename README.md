# Webrtc AirDrop

I have an idea for using AirDrop as a signaling channel for WebRTC data channel.
I will prototype it for Firefox on macOS and Safari on iOS peers, but it should
work across any two browsers on iOS/macOS that support URL sharing over AirDrop.

## Flow

- The user opens the page
  - Development: `file://…/webrtc-airdrop/index.html`
  - Production: `https://tomashubelbauer.github.io/webrtc-airdrop`
- The page recognizes it has no URL search params and it should start the flow
- The page generates an offer SDP and sets the URL search params `type` & `sdp`
- The page opens `https://tomashubelbauer.github.io/webrtc-airdrop?…#guide`
  - This happens in development too as we need a web-accessible URL for sharing
- The opened page instructs the user to share it via AirDrop and drops `#guide`
- The user shares the page via AirDrop
- The browser of the other peer opens: `type=offer`, `sdp` no `#guide`
- The page recognizes this is an offer and it should reply with an answer
- The page generates an answer SDP and sets the URL search params `type` & `sdp`
- The page opens `https://tomashubelbauer.github.io/webrtc-airdrop?…#guide`
  - This happens in development too as we need a web-accessible URL for sharing
- The opened page instructs the user to share it via AirDrop and drops `#guide`
- The user shares the page via AirDrop back to the original peer
- The browser of the original peer opens: `type=answer`, `sdp` no `#guide`
- The page recognizes this is an answer and it should finalize the flow
  - It hands over the information to the original tab (web worker, storage?)
  - Both the to-share offer and received-answer tabs close on original peer
  - Both The received-offer tab closes on the other peer
- The data channel opens
