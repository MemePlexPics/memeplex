import { performance } from 'perf_hooks'
import axios from 'axios'
import { insertProxyToRequest } from '../utils'

import { PROXY_TEST_TIMEOUT, PROXY_TESTING_FILE } from '../constants'

export const getProxySpeed = async (ip, port, protocol, repeats = 1, logger) => {
  const proxy = `${ip}:${port}`
  const requestOptions = {
    timeout: PROXY_TEST_TIMEOUT,
  }
  try {
    insertProxyToRequest(requestOptions, protocol, ip, port)
    const axiosClient = axios.create(requestOptions)
    const measuredSpeeds = []
    for (let i = 0; i < repeats; i++) {
      const start = performance.now()
      const response = await axiosClient.get(PROXY_TESTING_FILE)
      const end = performance.now()

      if (response.status != 200) throw new Error(`status ${response.status}`, response?.data)

      measuredSpeeds.push(end - start)
    }
    const speed = measuredSpeeds.reduce((acc, speed) => acc + speed, 0) / repeats
    const roundedSpeed = Math.floor(speed)
    logger.verbose(
      `✅ Proxy ${proxy} (${protocol}) is working. Average response time: ${roundedSpeed}ms`,
    )

    return roundedSpeed
  } catch (error) {
    logger.verbose(`❌ Proxy ${proxy} (${protocol}) is not working. Error: ${error.message}`)
    return
  }
}