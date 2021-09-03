window.addEventListener('load', async () => {
  const url = new URL(location);

  // Coerce hosted version to allow debugging on `file:` but sharing on `https:`
  if (url.protocol === 'file:') {
    url.protocol = 'https:';
    url.hostname = 'tomashubelbauer.github.io';
    url.pathname = 'webrtc-airdrop';
  }

  switch (url.searchParams.get('type')) {
    case null: {
      const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
      // peerConnection.onconnectionstatechange = () => console.log('onconnectionstatechange', peerConnection.connectionState);
      // peerConnection.ondatachannel = event => console.log('ondatachannel', event.channel);
      // peerConnection.onicecandidate = event => console.log('onicecandidate', event.candidate);
      // peerConnection.oniceconnectionstatechange = () => console.log('oniceconnectionstatechange', peerConnection.iceConnectionState);
      // peerConnection.onicegatheringstatechange = () => console.log('onicegatheringstatechange', peerConnection.iceGatheringState);
      // peerConnection.onnegotiationneeded = () => console.log('onnegotiationneeded');
      // peerConnection.onsignalingstatechange = () => console.log('onsignalingstatechange', peerConnection.signalingState);
      // peerConnection.ontrack = event => console.log('ontrack', event.track, event.receiver, event.transceiver, event.streams);

      peerConnection.addEventListener('icegatheringstatechange', () => {
        if (peerConnection.iceGatheringState === 'complete') {
          url.searchParams.set('type', peerConnection.localDescription.type);
          url.searchParams.set('sdp', peerConnection.localDescription.sdp);
          url.hash = 'guide';
          window.open(url);
        }
      });

      const dataChannel = peerConnection.createDataChannel('webrtc-airdrop');
      dataChannel.onbufferedamountlow = () => console.log('onbufferedamountlow');
      dataChannel.onclose = () => console.log('onclose');
      dataChannel.onerror = () => console.log('onerror');
      dataChannel.onmessage = event => console.log('onerror', event.data, event.lastEventId, event.origin, event.ports, event.source);
      dataChannel.onopen = () => console.log('onopen');

      await peerConnection.setLocalDescription(await peerConnection.createOffer());
      break;
    }
    case 'offer': {
      // Handle the URL on the offerer side: show sharing instructions
      if (url.hash === '#guide') {
        // Drop the `#guide` hash so that the AirDrop-shared URL lacks it
        location.hash = '';

        // TODO: Show a guide on how to do that depending on the browser
        document.body.textContent = 'Share this page via AirDrop!';
      }

      // Handle the URL on the answerer side: create answer for sharing back
      else {
        document.body.textContent = url.toString();
        alert('todo');
      }

      break;
    }
    case 'answer': {
      alert('todo');
      break;
    }
  }
});
