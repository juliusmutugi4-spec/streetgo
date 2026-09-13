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
   * Keep the encoder active.
   */
  encoding.active = true

  /*
   * Screen recording:
   * prioritize keeping the original resolution.
   *
   * Camera:
   * use balanced adaptation.
   */
  ;(
    encoding as RTCRtpEncodingParameters & {
      degradationPreference?:
        | 'maintain-resolution'
        | 'balanced'
        | 'maintain-framerate'
    }
  ).degradationPreference =
    mode === 'screen'
      ? 'maintain-resolution'
      : 'balanced'

  /*
   * Keep both camera and screen
   * recording smooth at 30 FPS.
   */
  encoding.maxFramerate = 30

  /*
   * High-quality initial bitrate.
   *
   * Screen:
   * 5 Mbps
   *
   * Camera:
   * 2.5 Mbps
   *
   * Adaptive quality can change this
   * later when network conditions change.
   */
  if (
    typeof encoding.maxBitrate !==
    'number'
  ) {
    encoding.maxBitrate =
      mode === 'screen'
        ? 5_000_000
        : 2_500_000
  }

  /*
   * Use one encoding layer.
   *
   * Simulcast is intentionally disabled
   * because the current backend expects
   * a single video stream.
   */
  parameters.encodings =
    [encoding]

  try {
    await sender.setParameters(
      parameters,
    )
  } catch (error) {
    /*
     * Some browsers may reject
     * degradationPreference.
     *
     * Retry using essential parameters.
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
        ? 5_000_000
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
   * Screen recording:
   * VP9 is preferred because it is
   * generally efficient for detailed
   * screen content.
   *
   * Camera:
   * VP8 remains the first preference
   * in the current StreetGO setup.
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