window.addEventListener('load', async () => {
  const statusDiv = document.querySelector('#statusDiv');
  const introP = document.querySelector('#introP');
  const offerP = document.querySelector('#offerP');
  const answerP = document.querySelector('#answerP');
  const channelP = document.querySelector('#channelP');
  const chatDiv = document.querySelector('#chatDiv');
  const messagesDiv = document.querySelector('#messagesDiv');
  const input = document.querySelector('input');

  const { type, sdp } = JSON.parse(atob(location.hash.slice('#'.length)) || '{}');

  /** @type {RTCPeerConnection} */
  let peerConnection;

  /** @type {RTCDataChannel} */
  let dataChannel;

  input.addEventListener('keypress', event => {
    if (event.key !== 'Enter') {
      return;
    }

    try {
      dataChannel.send(event.currentTarget.value);
    }
    catch (error) {
      alert(error.message);
    }

    const messageDiv = document.createElement('div');
    messageDiv.textContent = 'ME:' + event.currentTarget.value;
    messagesDiv.insertAdjacentElement('afterbegin', messageDiv);
    event.currentTarget.value = '';
  });

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

      peerConnection.addEventListener('icegatheringstatechange', async () => {
        if (peerConnection.iceGatheringState === 'complete') {
          location.hash = btoa(JSON.stringify(peerConnection.localDescription.toJSON()));
          offerP.classList.toggle('hidden', false);

          // Reset the `sdp` shared value in case it remained set errorneously
          localStorage.sdp = '';

          async function wait() {
            if (!localStorage.payload) {
              window.requestAnimationFrame(wait);
              return;
            }

            const sdp = localStorage.payload;
            await peerConnection.setRemoteDescription({ type: 'answer', sdp });
            localStorage.payload = '';
          }

          // Wait for the answer tab (AirDrop-ed) to relay the SDP to this tab
          await wait();
        }
      });

      peerConnection.addEventListener('iceconnectionstatechange', () => {
        statusDiv.textContent = peerConnection.iceConnectionState === 'connected' ? '' : peerConnection.iceConnectionState;
      });

      dataChannel = peerConnection.createDataChannel('webrtc-airdrop');
      dataChannel.onbufferedamountlow = () => console.log('onbufferedamountlow');
      dataChannel.onclose = () => console.log('onclose');
      dataChannel.onerror = () => console.log('onerror');
      dataChannel.onmessage = event => console.log('onmessage', event.data, event.lastEventId, event.origin, event.ports, event.source);
      dataChannel.onopen = () => console.log('onopen');

      dataChannel.addEventListener('open', () => {
        location.hash = '';
        introP.classList.toggle('hidden', true);
        offerP.classList.toggle('hidden', true);
        channelP.classList.toggle('hidden', false);
        setTimeout(() => channelP.classList.toggle('hidden', true), 5000);
        chatDiv.classList.toggle('hidden', false);
      });

      dataChannel.addEventListener('message', event => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = 'THEM:' + event.data;
        messagesDiv.insertAdjacentElement('afterbegin', messageDiv);
      });

      dataChannel.addEventListener('close', () => {
        input.disabled = true;
      });

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
          answerP.classList.toggle('hidden', false);
        }
      });

      peerConnection.addEventListener('iceconnectionstatechange', () => {
        statusDiv.textContent = peerConnection.iceConnectionState === 'connected' ? '' : peerConnection.iceConnectionState;
      });

      peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;

        dataChannel.onbufferedamountlow = () => console.log('onbufferedamountlow');
        dataChannel.onclose = () => console.log('onclose');
        dataChannel.onerror = () => console.log('onerror');
        dataChannel.onmessage = event => console.log('onmessage', event.data, event.lastEventId, event.origin, event.ports, event.source);
        dataChannel.onopen = () => console.log('onopen');

        dataChannel.addEventListener('open', () => {
          location.hash = '';
          introP.classList.toggle('hidden', true);
          answerP.classList.toggle('hidden', true);
          channelP.classList.toggle('hidden', false);
          setTimeout(() => channelP.classList.toggle('hidden', true), 5000);
          chatDiv.classList.toggle('hidden', false);
        });

        dataChannel.addEventListener('message', event => {
          const messageDiv = document.createElement('div');
          messageDiv.textContent = 'THEM:' + event.data;
          messagesDiv.insertAdjacentElement('afterbegin', messageDiv);
        });

        dataChannel.addEventListener('close', () => {
          input.disabled = true;
        });
      });

      await peerConnection.setRemoteDescription({ type, sdp });
      await peerConnection.setLocalDescription(await peerConnection.createAnswer());
      break;
    }

    // Receive the answer (in a new tab) and relay it to the original tab
    case 'answer': {
      localStorage.payload = sdp;
      window.close();
      break;
    }
  }
});
