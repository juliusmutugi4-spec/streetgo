const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL!

export async function getBroadcasterIceServers(): Promise<
  RTCIceServer[]
> {
  const fallback: RTCIceServer[] = [
    {
      urls:
        'stun:stun.l.google.com:19302',
    },
    {
      urls:
        'stun:stun1.l.google.com:19302',
    },
  ]

  try {
    const response =
      await fetch(
        `${API_URL}/live/webrtc/ice-servers`,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },

          cache:
            'no-store',
        }
      )

    if (!response.ok) {
      const body =
        await response.text()

      console.warn(
        'STREETGO BROADCASTER ICE SERVER REQUEST FAILED:',
        response.status,
        body
      )

      return fallback
    }

    const result =
      await response.json()

    const servers =
      Array.isArray(
        result?.iceServers
      )
        ? result.iceServers
        : []

    if (
      servers.length === 0
    ) {
      console.warn(
        'STREETGO BROADCASTER ICE SERVER RESPONSE WAS EMPTY.'
      )

      return fallback
    }

    console.log(
      '=== STREETGO BROADCASTER ICE SERVERS RECEIVED ===',
      servers
    )

    return servers as RTCIceServer[]
  } catch (err) {
    console.warn(
      'STREETGO BROADCASTER ICE SERVER FETCH ERROR:',
      err
    )

    return fallback
  }
}