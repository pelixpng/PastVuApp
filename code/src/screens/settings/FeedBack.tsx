import { ViewContainer } from '../../components/ui/Containers'
import { LinkProps, UICardProps } from '../../types/components'
import { UICard } from '../../components/ui/UICards'

const ButtonArray: LinkProps[] = [
  { title: 'Telegram', url: 'https://t.me/semenKuzminWork' },
  { title: 'Почта', url: 'mailto:semeonky@gmail.com' },
]

const InsideMenuText: UICardProps[] = [
  {
    title: 'Нужна помощь?',
    description:
      'Если у вас возникли проблемы во время использования приложения, вы можете связаться с разработчиком через почту или телеграмм.',
  },
]

export const FeedBack = () => {
  return (
    <ViewContainer>
      <UICard
        ButtonArray={ButtonArray}
        title={InsideMenuText[0].title}
        description={InsideMenuText[0].description}
      />
    </ViewContainer>
  )
}
