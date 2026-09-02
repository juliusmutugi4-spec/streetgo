'use client'

export interface BroadcasterStats {
  timestamp: number
  bytesSent: number
  packetsSent: number
  packetsLost: number
  bitrate: number
  framesSent: number
  framesEncoded: number
  frameWidth: number
  frameHeight: number
  framesPerSecond: number
  rtt: number | null
}

export async function collectBroadcasterStats(
  peer: RTCPeerConnection,
  previous?: BroadcasterStats,
): Promise<BroadcasterStats> {
  const reports = await peer.getStats()

  let bytesSent = 0
  let packetsSent = 0
  let packetsLost = 0
  let framesSent = 0
  let framesEncoded = 0
  let frameWidth = 0
  let frameHeight = 0
  let framesPerSecond = 0
  let rtt: number | null = null

  reports.forEach((report) => {
    if (
      report.type === 'outbound-rtp' &&
      report.kind === 'video'
    ) {
      bytesSent +=
        report.bytesSent ?? 0

      packetsSent +=
        report.packetsSent ?? 0

      framesSent +=
        report.framesSent ?? 0

      framesEncoded +=
        report.framesEncoded ?? 0

      frameWidth =
        report.frameWidth ??
        frameWidth

      frameHeight =
        report.frameHeight ??
        frameHeight

      framesPerSecond =
        report.framesPerSecond ??
        framesPerSecond
    }

    if (
      report.type === 'remote-inbound-rtp' &&
      report.kind === 'video'
    ) {
      packetsLost +=
        report.packetsLost ?? 0

      if (
        typeof report.roundTripTime ===
        'number'
      ) {
        rtt =
          report.roundTripTime
      }
    }

    if (
      report.type === 'candidate-pair' &&
      report.state === 'succeeded'
    ) {
      if (
        typeof report.currentRoundTripTime ===
        'number'
      ) {
        rtt =
          report.currentRoundTripTime
      }
    }
  })

  const timestamp = Date.now()

  let bitrate = 0

  if (previous) {
    const elapsed =
      (timestamp -
        previous.timestamp) /
      1000

    const bytesDelta =
      bytesSent -
      previous.bytesSent

    if (
      elapsed > 0 &&
      bytesDelta >= 0
    ) {
      bitrate =
        (bytesDelta * 8) /
        elapsed
    }
  }

  return {
    timestamp,
    bytesSent,
    packetsSent,
    packetsLost,
    bitrate,
    framesSent,
    framesEncoded,
    frameWidth,
    frameHeight,
    framesPerSecond,
    rtt,
  }
}

export function getBroadcasterPacketLossRate(
  stats: BroadcasterStats,
) {
  const total =
    stats.packetsSent +
    stats.packetsLost

  if (total <= 0) {
    return 0
  }

  return (
    stats.packetsLost /
    total
  )
}

export function hasBroadcasterVideo(
  stats: BroadcasterStats,
) {
  return (
    stats.framesSent > 0 ||
    stats.framesEncoded > 0
  )
}

export function isBroadcasterQualityPoor(
  stats: BroadcasterStats,
) {
  const packetLoss =
    getBroadcasterPacketLossRate(
      stats,
    )

  const lowBitrate =
    stats.bitrate > 0 &&
    stats.bitrate <
      300_000

  const highRtt =
    stats.rtt !== null &&
    stats.rtt > 0.5

  return (
    packetLoss > 0.05 ||
    lowBitrate ||
    highRtt
  )
}