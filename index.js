window.addEventListener('load', async () => {
  const { type, sdp } = JSON.parse(atob(location.hash.slice('#'.length)) || '{}');

  /** @type {RTCPeerConnection} */
  let peerConnection;

  /** @type {RTCDataChannel} */
  let dataChannel;

  switch (type) {
    // Create an offer and set it to the URL hash JSON payload for AirDrop share
    case undefined: {
      peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
      peerConnection.onconnectionstatechange = () => console.log('onconnectionstatechange', peerConnection.connectionState);
      peerConnection.ondatachannel = event => console.log('ondatachannel', event.channel);
      peerConnection.onicecandidate = event => console.log('onicecandidate', event.candidate);
      peerConnection.oniceconnectionstatechange = () => console.log('oniceconnectionstatechange', peerConnection.iceConnectionState);
      peerConnection.onicegatheringstatechange = () => console.log('onicegatheringstatechange', peerConnection.iceGatheringState);
      peerConnection.onnegotiationneeded = () => console.log('onnegotiationneeded');
      peerConnection.onsignalingstatechange = () => console.log('onsignalingstatechange', peerConnection.signalingState);
      peerConnection.ontrack = event => console.log('ontrack', event.track, event.receiver, event.transceiver, event.streams);

      peerConnection.addEventListener('icegatheringstatechange', () => {
        if (peerConnection.iceGatheringState === 'complete') {
          location.hash = btoa(JSON.stringify(peerConnection.localDescription.toJSON()));
          document.body.textContent = 'Share this page via AirDrop!';

          // Reset the `sdp` shared value in case it remained set errorneously
          localStorage.sdp = '';

          function wait() {
            if (!localStorage.payload) {
              window.requestAnimationFrame(wait);
              return;
            }

            const sdp = localStorage.payload;
            localStorage.payload = '';

            alert(sdp);
            await peerConnection.setRemoteDescription({ type: 'answer', sdp });
          }

          // Wait for the answer tab (AirDrop-ed) relays the SDP to this tab
          wait();
        }
      });

      dataChannel = peerConnection.createDataChannel('webrtc-airdrop');
      dataChannel.onbufferedamountlow = () => console.log('onbufferedamountlow');
      dataChannel.onclose = () => console.log('onclose');
      dataChannel.onerror = () => console.log('onerror');
      dataChannel.onmessage = event => console.log('onerror', event.data, event.lastEventId, event.origin, event.ports, event.source);
      dataChannel.onopen = () => console.log('onopen');

      await peerConnection.setLocalDescription(await peerConnection.createOffer());
      break;
    }

    // Receive the offer and create an answer shared via URL the same way
    case 'offer': {
      peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
      peerConnection.onconnectionstatechange = () => console.log('onconnectionstatechange', peerConnection.connectionState);
      peerConnection.ondatachannel = event => console.log('ondatachannel', event.channel);
      peerConnection.onicecandidate = event => console.log('onicecandidate', event.candidate);
      peerConnection.oniceconnectionstatechange = () => console.log('oniceconnectionstatechange', peerConnection.iceConnectionState);
      peerConnection.onicegatheringstatechange = () => console.log('onicegatheringstatechange', peerConnection.iceGatheringState);
      peerConnection.onnegotiationneeded = () => console.log('onnegotiationneeded');
      peerConnection.onsignalingstatechange = () => console.log('onsignalingstatechange', peerConnection.signalingState);
      peerConnection.ontrack = event => console.log('ontrack', event.track, event.receiver, event.transceiver, event.streams);

      peerConnection.addEventListener('icegatheringstatechange', () => {
        if (peerConnection.iceGatheringState === 'complete') {
          location.hash = btoa(JSON.stringify(peerConnection.localDescription.toJSON()));
          document.body.textContent = 'Share this page back via AirDrop!';
        }
      });

      await peerConnection.setRemoteDescription({ type, sdp });
      await peerConnection.setLocalDescription(await peerConnection.createAnswer());
      break;
    }


    case 'answer': {
      localStorage.payload = sdp;
      window.close();
      break;
    }
  }
});
