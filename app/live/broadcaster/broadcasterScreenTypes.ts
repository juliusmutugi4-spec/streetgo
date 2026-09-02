export type ScreenCaptureOptions = {
  includeAudio?: boolean
  frameRate?: number
}

export type ScreenCaptureResult = {
  stream: MediaStream
  videoTrack: MediaStreamTrack
  audioTrack: MediaStreamTrack | null
}