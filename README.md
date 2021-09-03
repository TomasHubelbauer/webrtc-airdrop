# Webrtc AirDrop

I have an idea for using AirDrop as a signaling channel for WebRTC data channel.
I will prototype it for Firefox on macOS and Safari on iOS peers, but it should
work across any two browsers on iOS/macOS that support URL sharing over AirDrop.

Here's how I think it might work:

- The page is entered with no offer in the URL, Sync action is presented to user
- The user invokes the Share action
- The page generates an offer and sets its JSON to `location.hash`
- The page prompts the user to share the tab using AirDrop
- User shares the page's URL using AirDrop to another user/device
- The browser opens the page with the offer serialized in `location.hash`
- The page prepares an answer and serializes it as JSON in its `location.hash`
- The user is prompted to share the page over AirDrop back to the original peer
- The original pages' browser opens the URL and the original page connects to it
- The answer page closes itself after handing over the URL to the original page
- The orignal page uses the answer SDP to establish the data channel
