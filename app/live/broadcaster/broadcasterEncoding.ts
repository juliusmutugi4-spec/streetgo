'use client'

export type BroadcasterEncodingMode =
  | 'camera'
  | 'screen'

export async function configureBroadcasterVideoSender(
  sender: RTCRtpSender,
  mode: BroadcasterEncodingMode,
) {
  const parameters =
    sender.getParameters()

  if (!parameters.encodings?.length) {
    parameters.encodings = [{}]
  }

  const encoding =
    parameters.encodings[0]

  /*
   * Keep the encoder active and let
   * WebRTC react to bandwidth changes.
   */
  encoding.active = true

  /*
   * Prefer maintaining frame rate
   * while allowing WebRTC to reduce
   * resolution when necessary.
   */
;(encoding as RTCRtpEncodingParameters & {
  degradationPreference?: 'maintain-resolution' | 'balanced' | 'maintain-framerate'
}).degradationPreference =
  mode === 'screen' ? 'maintain-resolution' : 'balanced'

  /*
   * Do not request an artificially
   * high frame rate from the encoder.
   */
  encoding.maxFramerate =
    mode === 'screen'
      ? 30
      : 30

  /*
   * Initial bitrate targets.
   *
   * Adaptive quality will modify
   * maxBitrate later.
   */
  if (
    typeof encoding.maxBitrate !==
    'number'
  ) {
    encoding.maxBitrate =
      mode === 'screen'
        ? 3_500_000
        : 2_500_000
  }

  /*
   * Keep one encoding layer.
   *
   * We are deliberately not enabling
   * simulcast yet because the current
   * backend expects a single stream.
   */
  parameters.encodings =
    [encoding]

  try {
    await sender.setParameters(
      parameters,
    )
  } catch (error) {
    /*
     * Some browsers expose only part
     * of RTCRtpEncodingParameters.
     *
     * If degradationPreference is not
     * accepted, retry with the essential
     * parameters only.
     */
    console.warn(
      'StreetGO Broadcaster: advanced encoding parameters were rejected. Retrying with safe parameters.',
      error,
    )

    const retryParameters =
      sender.getParameters()

    if (
      !retryParameters.encodings?.length
    ) {
      retryParameters.encodings =
        [{}]
    }

    const retryEncoding =
      retryParameters.encodings[0]

    retryEncoding.active =
      true

    retryEncoding.maxFramerate =
      30

    retryEncoding.maxBitrate =
      mode === 'screen'
        ? 3_500_000
        : 2_500_000

    try {
      await sender.setParameters(
        retryParameters,
      )
    } catch (retryError) {
      console.warn(
        'StreetGO Broadcaster: unable to configure video sender.',
        retryError,
      )
    }
  }
}

export function getBroadcasterCodecPreferences(
  transceiver: RTCRtpTransceiver,
  mode: BroadcasterEncodingMode,
) {
  const capabilities =
    RTCRtpSender.getCapabilities(
      'video',
    )

  if (!capabilities) {
    return
  }

  const codecs =
    capabilities.codecs

  /*
   * Prefer modern efficient codecs.
   *
   * We don't force a codec if the
   * browser/backend doesn't support it.
   */
  const preferredNames =
    mode === 'screen'
      ? [
          'video/VP9',
          'video/VP8',
          'video/H264',
        ]
      : [
          'video/VP8',
          'video/H264',
          'video/VP9',
        ]

  const preferred =
    preferredNames.flatMap(
      (name) =>
        codecs.filter(
          (codec) =>
            codec.mimeType.toLowerCase() ===
            name.toLowerCase(),
        ),
    )

  const remaining =
    codecs.filter(
      (codec) =>
        !preferred.includes(
          codec,
        ),
    )

  if (!preferred.length) {
    return
  }

  transceiver.setCodecPreferences([
    ...preferred,
    ...remaining,
  ])
}