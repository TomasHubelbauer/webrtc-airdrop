# Webrtc AirDrop

I have an idea for using AirDrop as a signaling channel for WebRTC data channel.
I will prototype it for Firefox on macOS and Safari on iOS peers, but it should
work across any two browsers on iOS/macOS that support URL sharing over AirDrop.

## Flow

- The user opens https://tomashubelbauer.github.io/webrtc-airdrop
- The page generates offer SDP and sets it as JSON to the URL
- The user shares the URL via AirDrop
- The browser at the peer side opens the page
- The page generates answer SDP and sets it as JSON to the URL
- The user shares the URL back via AirDrop
- The browser at the original peer side opens the page (in a new tab)
- The new tab page relays the answer data to the origin tab (service worker)
- The original tab page finalizes the connection
- The new tab page closes itself
- The data channel opens
