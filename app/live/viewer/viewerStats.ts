export interface ViewerStats {
  timestamp: number
  packetsLost: number
  packetsReceived: number
  jitter: number
  rtt: number | null
  framesReceived: number
  framesDecoded: number
  bytesReceived: number
  bitrate: number
}

export async function collectViewerStats(
  peer: RTCPeerConnection,
  previous?: ViewerStats
): Promise<ViewerStats> {
  const reports = await peer.getStats()

  let packetsLost = 0
  let packetsReceived = 0
  let jitter = 0
  let rtt: number | null = null
  let framesReceived = 0
  let framesDecoded = 0
  let bytesReceived = 0

  reports.forEach((report) => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      packetsLost += report.packetsLost ?? 0
      packetsReceived += report.packetsReceived ?? 0
      jitter = report.jitter ?? 0
      framesReceived = report.framesReceived ?? 0
      framesDecoded = report.framesDecoded ?? 0
      bytesReceived = report.bytesReceived ?? 0
    }

    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      if (typeof report.currentRoundTripTime === 'number') {
        rtt = report.currentRoundTripTime
      }
    }
  })

  const timestamp = Date.now()

  let bitrate = 0

  if (previous) {
    const elapsed = (timestamp - previous.timestamp) / 1000
    const bytesDelta = bytesReceived - previous.bytesReceived

    if (elapsed > 0 && bytesDelta >= 0) {
      bitrate = (bytesDelta * 8) / elapsed
    }
  }

  return {
    timestamp,
    packetsLost,
    packetsReceived,
    jitter,
    rtt,
    framesReceived,
    framesDecoded,
    bytesReceived,
    bitrate,
  }
}

export function getPacketLossRate(stats: ViewerStats) {
  const total = stats.packetsLost + stats.packetsReceived

  if (total <= 0) return 0

  return stats.packetsLost / total
}

export function hasViewerFrames(stats: ViewerStats) {
  return stats.framesReceived > 0 || stats.framesDecoded > 0
}

export function hasViewerProgress(
  current: ViewerStats,
  previous: ViewerStats
) {
  return (
    current.framesDecoded > previous.framesDecoded ||
    current.framesReceived > previous.framesReceived
  )
}