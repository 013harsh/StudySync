/**
 * WebRTC Configuration Utility
 * Provides ICE server configuration for production-ready WebRTC connections
 */

/**
 * Get ICE servers configuration from environment variables
 * @returns {RTCConfiguration} WebRTC configuration object
 */
export const getIceServers = () => {
  const config = {
    iceServers: [],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all', // 'all' or 'relay' (relay forces TURN)
  };

  // Add STUN server (helps discover public IP)
  const stunUrl = import.meta.env.VITE_STUN_URL;
  if (stunUrl) {
    config.iceServers.push({
      urls: stunUrl,
    });
  }

  // Add backup STUN servers
  const stunUrl2 = import.meta.env.VITE_STUN_URL_2;
  const stunUrl3 = import.meta.env.VITE_STUN_URL_3;
  
  if (stunUrl2) {
    config.iceServers.push({ urls: stunUrl2 });
  }
  
  if (stunUrl3) {
    config.iceServers.push({ urls: stunUrl3 });
  }

  // Add TURN server (relays traffic when direct connection fails)
  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUser = import.meta.env.VITE_TURN_USER;
  const turnCred = import.meta.env.VITE_TURN_CRED;

  if (turnUrl && turnUser && turnCred) {
    config.iceServers.push({
      urls: turnUrl,
      username: turnUser,
      credential: turnCred,
    });
  }

  // Fallback to public STUN servers if no config provided
  if (config.iceServers.length === 0) {
    console.warn('⚠️ No ICE servers configured. Using default STUN servers.');
    config.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  return config;
};

/**
 * Create a new RTCPeerConnection with proper configuration
 * @returns {RTCPeerConnection} Configured peer connection
 */
export const createPeerConnection = () => {
  const config = getIceServers();
  
  console.log('🔧 Creating RTCPeerConnection with config:', {
    iceServers: config.iceServers.map(server => ({
      urls: server.urls,
      hasCredentials: !!(server.username && server.credential),
    })),
  });

  return new RTCPeerConnection(config);
};

/**
 * Check if WebRTC is supported in the current browser
 * @returns {boolean} True if WebRTC is supported
 */
export const isWebRTCSupported = () => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  );
};

/**
 * Get user media with error handling
 * @param {MediaStreamConstraints} constraints Media constraints
 * @returns {Promise<MediaStream>} Media stream
 */
export const getUserMedia = async (constraints = { video: true, audio: true }) => {
  if (!isWebRTCSupported()) {
    throw new Error('WebRTC is not supported in this browser');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ Got user media:', {
      video: stream.getVideoTracks().length > 0,
      audio: stream.getAudioTracks().length > 0,
    });
    return stream;
  } catch (error) {
    console.error('❌ Failed to get user media:', error);
    
    // Provide user-friendly error messages
    if (error.name === 'NotAllowedError') {
      throw new Error('Camera/microphone access denied. Please allow access and try again.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No camera or microphone found. Please connect a device and try again.');
    } else if (error.name === 'NotReadableError') {
      throw new Error('Camera/microphone is already in use by another application.');
    } else {
      throw new Error(`Failed to access camera/microphone: ${error.message}`);
    }
  }
};

/**
 * Stop all tracks in a media stream
 * @param {MediaStream} stream Media stream to stop
 */
export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`🛑 Stopped ${track.kind} track`);
    });
  }
};

/**
 * Log ICE connection state changes for debugging
 * @param {RTCPeerConnection} peerConnection Peer connection to monitor
 */
export const monitorConnectionState = (peerConnection) => {
  peerConnection.oniceconnectionstatechange = () => {
    console.log('🔌 ICE connection state:', peerConnection.iceConnectionState);
    
    if (peerConnection.iceConnectionState === 'failed') {
      console.error('❌ ICE connection failed. Check TURN server configuration.');
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log('🔗 Connection state:', peerConnection.connectionState);
  };

  peerConnection.onsignalingstatechange = () => {
    console.log('📡 Signaling state:', peerConnection.signalingState);
  };
};

/**
 * Validate ICE server configuration
 * @returns {Object} Validation result
 */
export const validateIceConfig = () => {
  const stunUrl = import.meta.env.VITE_STUN_URL;
  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUser = import.meta.env.VITE_TURN_USER;
  const turnCred = import.meta.env.VITE_TURN_CRED;

  const result = {
    hasStun: !!stunUrl,
    hasTurn: !!(turnUrl && turnUser && turnCred),
    warnings: [],
    errors: [],
  };

  if (!stunUrl) {
    result.warnings.push('No STUN server configured. Using default Google STUN.');
  }

  if (!turnUrl || !turnUser || !turnCred) {
    result.warnings.push(
      'No TURN server configured. WebRTC may not work behind restrictive firewalls or NATs.'
    );
  }

  if (turnUrl && (!turnUser || !turnCred)) {
    result.errors.push('TURN server URL provided but missing username or credential.');
  }

  return result;
};

/**
 * Test ICE server connectivity
 * @returns {Promise<Object>} Test results
 */
export const testIceServers = async () => {
  const config = getIceServers();
  const pc = new RTCPeerConnection(config);
  
  return new Promise((resolve) => {
    const results = {
      stun: false,
      turn: false,
      candidates: [],
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        results.candidates.push(event.candidate.type);
        
        if (event.candidate.type === 'srflx') {
          results.stun = true;
        } else if (event.candidate.type === 'relay') {
          results.turn = true;
        }
      } else {
        // All candidates gathered
        pc.close();
        resolve(results);
      }
    };

    // Create a dummy offer to trigger ICE gathering
    pc.createOffer().then(offer => pc.setLocalDescription(offer));

    // Timeout after 5 seconds
    setTimeout(() => {
      pc.close();
      resolve(results);
    }, 5000);
  });
};

export default {
  getIceServers,
  createPeerConnection,
  isWebRTCSupported,
  getUserMedia,
  stopMediaStream,
  monitorConnectionState,
  validateIceConfig,
  testIceServers,
};
