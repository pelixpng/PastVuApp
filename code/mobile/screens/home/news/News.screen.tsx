import { FlatList, StyleSheet, Text } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import NewsVM, { NewsTab } from './News.vm'
import { useVM } from '../../../../core/hooks/useVM'
import { SegmentedControl } from '../../../../core/components/ui/segmentedControl/SegmentedControl'
import io from 'socket.io-client'

interface NewsItem {
  _id: string
  title: string
  cid: number
  pdate: string
  notice: string
  txt: string
  ccount: number
}

export const NewsScreen = observer(() => {
  const vm = useVM(NewsVM)
  const { colors } = useTheme()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log('🔍 Fetching news page HTML...')
        const response = await fetch('https://pastvu.com/news')
        const html = await response.text()

        console.log('📄 HTML length:', html.length)

        // Ищем данные в HTML - обычно они в window.init или в script теге
        const initMatch = html.match(/window\.init\s*=\s*({.+?});/s)
        if (initMatch) {
          console.log('✅ Found window.init data')
          const initData = JSON.parse(initMatch[1])
          console.log('Init data keys:', Object.keys(initData))

          if (initData.news) {
            console.log(`📰 Found ${initData.news.length} news in init data`)
            setNews(initData.news)
            setLoading(false)
            return
          }
        }

        // Если не нашли в window.init, ищем другие варианты
        console.log('⚠️ News not found in window.init, trying Socket.IO...')

        // Fallback на Socket.IO
        const socket = io('https://pastvu.com', {
          path: '/socket.io/',
          transports: ['polling', 'websocket'],
          withCredentials: true,
        })

        socket.on('connect', () => {
          console.log('✅ Connected via Socket.IO')
          socket.emit('index.giveAllNews', undefined, (resp: any) => {
            if (resp?.result?.news) {
              setNews(resp.result.news)
              setLoading(false)
              console.log(`📊 Loaded ${resp.result.news.length} news via Socket.IO`)
            }
          })
        })

      } catch (error) {
        console.log('❌ Error fetching news:', error)
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <FlatList
      data={news}
      style={[{ backgroundColor: colors.backgroundApp }, s.container]}
      keyExtractor={item => item._id}
      ListHeaderComponent={
        <SegmentedControl
          options={vm.segmentOptions}
          selectedValue={vm.selectedTab}
          onChange={value => vm.setSelectedTab(value as NewsTab)}
        />
      }
      renderItem={({ item }) => (
        <Text style={{ padding: 16, fontSize: 16, color: colors.text }}>{item.title}</Text>
      )}
      ListEmptyComponent={
        <Text style={{ padding: 16, color: colors.text }}>
          {loading ? 'Загрузка новостей...' : 'Нет новостей'}
        </Text>
      }
    />
  )
})

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
})
