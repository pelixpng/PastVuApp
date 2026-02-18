import io from 'socket.io-client'

let socketInstance: any = null

const SOCKET_TIMEOUT = 15000

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io('https://pastvu.com', {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      withCredentials: true,
    })
  }
  return socketInstance
}

export const socketEmit = (event: string, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket()

    const cleanup = () => {
      clearTimeout(timer)
      socket.off('connect', onConnect)
      socket.off('connect_error', onError)
    }

    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Socket timeout for ${event} after ${SOCKET_TIMEOUT}ms`))
    }, SOCKET_TIMEOUT)

    const onConnect = () => {
      doEmit()
    }

    const onError = (error: any) => {
      cleanup()
      reject(error)
    }

    const doEmit = () => {
      socket.emit(event, data, (resp: any) => {
        cleanup()
        if (resp?.result) {
          resolve(resp.result)
        } else {
          reject(new Error(`No result in response for ${event}`))
        }
      })
    }

    if (socket.connected) {
      doEmit()
    } else {
      socket.once('connect', onConnect)
      socket.once('connect_error', onError)
    }
  })
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
