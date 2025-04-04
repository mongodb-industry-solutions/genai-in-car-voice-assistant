// public/worklets/recorderWorkletProcessor.js

class RecorderProcessor extends AudioWorkletProcessor {
  bufferSize = 2048;
  _bytesWritten = 0;
  _buffer = new Float32Array(this.bufferSize);

  constructor() {
    super();
    this.initBuffer();
  }

  initBuffer() {
    this._bytesWritten = 0;
  }

  isBufferEmpty() {
    return this._bytesWritten === 0;
  }

  isBufferFull() {
    return this._bytesWritten === this.bufferSize;
  }

  process(inputs) {
    this.append(inputs[0][0]); // Process audio from the first channel
    return true;
  }

  append(channelData) {
    if (this.isBufferFull()) {
      this.flush();
    }

    if (!channelData) return;

    for (let i = 0; i < channelData.length; i++) {
      this._buffer[this._bytesWritten++] = channelData[i];
    }
  }

  flush() {
    const buffer =
      this._bytesWritten < this.bufferSize
        ? this._buffer.slice(0, this._bytesWritten)
        : this._buffer;
    const result = this.downsampleBuffer(buffer, 44100, 16000); // Downsample to 16kHz
    this.port.postMessage(result);
    this.initBuffer();
  }

  downsampleBuffer(buffer, sampleRate, outSampleRate) {
    if (outSampleRate === sampleRate) return buffer;
    if (outSampleRate > sampleRate)
      throw new Error(
        "Downsampling rate should be smaller than original sample rate"
      );

    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;

      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer && i < buffer.length;
        i++
      ) {
        accum += buffer[i];
        count++;
      }

      result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result.buffer;
  }
}

registerProcessor("recorder.worklet", RecorderProcessor);
