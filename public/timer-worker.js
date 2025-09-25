// Timer Web Worker for accurate background timing
let timerInterval = null
let currentTime = 0
let isRunning = false

self.onmessage = function(e) {
  const { type, payload } = e.data

  switch (type) {
    case 'START':
      currentTime = payload.duration
      isRunning = true
      startTimer()
      break

    case 'PAUSE':
      isRunning = false
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      break

    case 'RESUME':
      isRunning = true
      startTimer()
      break

    case 'STOP':
      isRunning = false
      currentTime = 0
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      self.postMessage({ type: 'STOPPED' })
      break

    case 'GET_TIME':
      self.postMessage({ type: 'TIME_UPDATE', time: currentTime })
      break

    default:
      console.log('Unknown message type:', type)
  }
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  timerInterval = setInterval(() => {
    if (isRunning && currentTime > 0) {
      currentTime--
      self.postMessage({ type: 'TICK', time: currentTime })

      if (currentTime === 0) {
        self.postMessage({ type: 'COMPLETE' })
        isRunning = false
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }, 1000)
}