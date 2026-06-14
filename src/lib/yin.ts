const DEFAULT_THRESHOLD = 0.1
const DEFAULT_PROBABILITY_THRESHOLD = 0.1

function parabolicInterpolation(array: Float32Array, tau: number): number {
  const x0 = tau > 1 ? tau - 1 : tau
  const x2 = tau + 1 < array.length ? tau + 1 : tau
  if (x0 === tau) return array[tau] <= array[x2] ? tau : x2
  if (x2 === tau) return array[tau] <= array[x0] ? tau : x0
  const s0 = array[x0]
  const s1 = array[tau]
  const s2 = array[x2]
  return tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
}

/**
 * YIN pitch detection algorithm.
 * Returns detected frequency in Hz, or -1 if silence/undetected.
 * @param buffer  Float32Array of PCM audio samples (mono)
 * @param sampleRate  e.g. 44100
 * @param threshold  aperiodicity threshold (0.1 typical)
 */
export function yin(
  buffer: Float32Array<ArrayBuffer>,
  sampleRate: number,
  threshold = DEFAULT_THRESHOLD
): number {
  const bufferSize = buffer.length
  const halfSize = Math.floor(bufferSize / 2)
  const yinBuffer = new Float32Array(halfSize)

  // Step 1: Difference function
  yinBuffer[0] = 1
  for (let tau = 1; tau < halfSize; tau++) {
    let sum = 0
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau]
      sum += delta * delta
    }
    yinBuffer[tau] = sum
  }

  // Step 2: Cumulative mean normalized difference
  let runningSum = 0
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] *= tau / runningSum
  }

  // Step 3: Absolute threshold — find first local minimum below threshold
  let tau = 2
  while (tau < halfSize) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++
      }
      break
    }
    tau++
  }

  if (tau === halfSize || yinBuffer[tau] >= DEFAULT_PROBABILITY_THRESHOLD) {
    return -1
  }

  // Step 4: Parabolic interpolation for sub-sample precision
  const betterTau = parabolicInterpolation(yinBuffer, tau)

  return sampleRate / betterTau
}

/** RMS amplitude — used for silence detection */
export function rms(buffer: Float32Array<ArrayBuffer>): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}
