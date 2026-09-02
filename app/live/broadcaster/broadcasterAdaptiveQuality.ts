'use client'

import type { BroadcasterStats } from './broadcasterStats'

export type BroadcasterQualityLevel =
  | 'high'
  | 'medium'
  | 'low'

export type BroadcasterCaptureMode =
  | 'camera'
  | 'screen'

export interface AdaptiveQualityState {
  level: BroadcasterQualityLevel
  maxBitrate: number
  maxFramerate: number
  scaleDown: number
}

const CAMERA_HIGH: AdaptiveQualityState = {
  level: 'high',
  maxBitrate: 2_500_000,
  maxFramerate: 30,
  scaleDown: 1,
}

const CAMERA_MEDIUM: AdaptiveQualityState = {
  level: 'medium',
  maxBitrate: 1_200_000,
  maxFramerate: 30,
  scaleDown: 1,
}

const CAMERA_LOW: AdaptiveQualityState = {
  level: 'low',
  maxBitrate: 600_000,
  maxFramerate: 24,
  scaleDown: 1.5,
}

const SCREEN_HIGH: AdaptiveQualityState = {
  level: 'high',
  maxBitrate: 3_500_000,
  maxFramerate: 30,
  scaleDown: 1,
}

const SCREEN_MEDIUM: AdaptiveQualityState = {
  level: 'medium',
  maxBitrate: 1_800_000,
  maxFramerate: 30,
  scaleDown: 1,
}

const SCREEN_LOW: AdaptiveQualityState = {
  level: 'low',
  maxBitrate: 900_000,
  maxFramerate: 24,
  scaleDown: 1,
}

const MIN_LEVEL_HOLD_MS = 8_000
const BAD_SAMPLE_COUNT = 2
const GOOD_SAMPLE_COUNT = 4

export interface AdaptiveQualityController {
  evaluate: (
    stats: BroadcasterStats,
  ) => void
  getLevel: () => BroadcasterQualityLevel
  applyHigh: () => Promise<void>
  applyMedium: () => Promise<void>
  applyLow: () => Promise<void>
}

export function createAdaptiveQualityController(
  peer: RTCPeerConnection,
  mode: BroadcasterCaptureMode = 'camera',
  onQualityChange?: (
    state: AdaptiveQualityState,
  ) => void,
): AdaptiveQualityController {
  let currentLevel: BroadcasterQualityLevel =
    'high'

  let badSamples = 0
  let goodSamples = 0
  let lastChangeAt = 0

  function getQualityState(
    level: BroadcasterQualityLevel,
  ): AdaptiveQualityState {
    if (mode === 'screen') {
      if (level === 'high') {
        return SCREEN_HIGH
      }

      if (level === 'medium') {
        return SCREEN_MEDIUM
      }

      return SCREEN_LOW
    }

    if (level === 'high') {
      return CAMERA_HIGH
    }

    if (level === 'medium') {
      return CAMERA_MEDIUM
    }

    return CAMERA_LOW
  }

  async function applyQuality(
    state: AdaptiveQualityState,
  ) {
    const sender =
      peer
        .getSenders()
        .find(
          (item) =>
            item.track?.kind ===
            'video',
        )

    if (!sender) {
      return
    }

    const parameters =
      sender.getParameters()

    if (!parameters.encodings?.length) {
      parameters.encodings = [{}]
    }

    const encoding =
      parameters.encodings[0]

    encoding.maxBitrate =
      state.maxBitrate

    encoding.maxFramerate =
      state.maxFramerate

    encoding.scaleResolutionDownBy =
      state.scaleDown

    try {
      await sender.setParameters(
        parameters,
      )

      currentLevel =
        state.level

      lastChangeAt =
        Date.now()

      console.log(
        'StreetGO Adaptive Quality:',
        {
          mode,
          level:
            state.level,
          bitrate:
            state.maxBitrate,
          fps:
            state.maxFramerate,
          scaleDown:
            state.scaleDown,
        },
      )

      onQualityChange?.(
        state,
      )
    } catch (error) {
      console.warn(
        'StreetGO Adaptive Quality: unable to apply quality:',
        error,
      )
    }
  }

  function evaluate(
    stats: BroadcasterStats,
  ) {
    if (
      peer.connectionState ===
        'closed' ||
      peer.connectionState ===
        'failed'
    ) {
      return
    }

    const packetLoss =
      getPacketLoss(stats)

    const rtt =
      stats.rtt ?? 0

    const bitrate =
      stats.bitrate

    /*
     * Screen sharing gets a little
     * more bitrate because text and
     * UI details need to remain sharp.
     */
    const poorNetwork =
      packetLoss >= 0.08 ||
      rtt >= 0.8 ||
      (
        bitrate > 0 &&
        (
          mode === 'screen'
            ? bitrate < 500_000
            : bitrate < 350_000
        )
      )

    const goodNetwork =
      packetLoss <= 0.02 &&
      rtt < 0.3 &&
      bitrate >=
        (
          mode === 'screen'
            ? 1_000_000
            : 700_000
        )

    if (poorNetwork) {
      badSamples++
      goodSamples = 0
    } else if (goodNetwork) {
      goodSamples++
      badSamples = 0
    } else {
      badSamples = 0
      goodSamples = 0
    }

    const now =
      Date.now()

    if (
      now -
        lastChangeAt <
      MIN_LEVEL_HOLD_MS
    ) {
      return
    }

    if (
      badSamples >=
      BAD_SAMPLE_COUNT
    ) {
      badSamples = 0

      if (
        currentLevel ===
        'high'
      ) {
        void applyQuality(
          getQualityState(
            'medium',
          ),
        )

        return
      }

      if (
        currentLevel ===
        'medium'
      ) {
        void applyQuality(
          getQualityState(
            'low',
          ),
        )

        return
      }
    }

    if (
      goodSamples >=
      GOOD_SAMPLE_COUNT
    ) {
      goodSamples = 0

      if (
        currentLevel ===
        'low'
      ) {
        void applyQuality(
          getQualityState(
            'medium',
          ),
        )

        return
      }

      if (
        currentLevel ===
        'medium'
      ) {
        void applyQuality(
          getQualityState(
            'high',
          ),
        )
      }
    }
  }

  return {
    evaluate,

    getLevel: () =>
      currentLevel,

    applyHigh: () =>
      applyQuality(
        getQualityState(
          'high',
        ),
      ),

    applyMedium: () =>
      applyQuality(
        getQualityState(
          'medium',
        ),
      ),

    applyLow: () =>
      applyQuality(
        getQualityState(
          'low',
        ),
      ),
  }
}

function getPacketLoss(
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