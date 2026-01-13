import io from 'socket.io-client'

let socketInstance: any = null

const getSocket = () => {
  if (!socketInstance) {
    console.log('🔌 Creating new Socket.IO connection')
    socketInstance = io('https://pastvu.com', {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      withCredentials: true,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected, ID:', socketInstance.id)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected')
    })
  } else {
    console.log('♻️ Reusing existing Socket.IO connection, ID:', socketInstance.id)
  }
  return socketInstance
}

export const socketEmit = (event: string, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket()

    const onConnect = () => {
      socket.emit(event, data, (resp: any) => {
        if (resp?.result) {
          resolve(resp.result)
        } else {
          reject(new Error(`No result in response for ${event}`))
        }
      })
    }

    if (socket.connected) {
      onConnect()
    } else {
      socket.once('connect', onConnect)
      socket.once('connect_error', (error: any) => {
        reject(error)
      })
    }
  })
}

export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('🔌 Disconnecting Socket.IO')
    socketInstance.disconnect()
    socketInstance = null
  }
}
