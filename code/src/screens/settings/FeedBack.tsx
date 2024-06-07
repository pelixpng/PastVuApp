import { ViewContainer } from '../../components/ui/UniversalComponents'
import { InsideMenuProps, LinkProps } from '../../types/components'
import { InsideMenuComponent } from '../../components/ui/InsideMenuComponent'

const ButtonArray: LinkProps[] = [
  { title: 'Telegram', url: 'https://t.me/semenKuzminWork' },
  { title: 'Почта', url: 'mailto:semeonky@gmail.com' },
]

const InsideMenuText: InsideMenuProps[] = [
  {
    title: 'Нужна помощь?',
    description:
      'Если у вас возникли проблемы во время использования приложения, вы можете связаться с разработчиком через почту или телеграмм.',
  },
]

export const FeedBack = () => {
  return (
    <ViewContainer>
      <InsideMenuComponent
        ButtonArray={ButtonArray}
        title={InsideMenuText[0].title}
        description={InsideMenuText[0].description}
      />
    </ViewContainer>
  )
}
