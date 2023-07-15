
export type MenuButtonProps = {
    navigation: any; 
    route: string; 
    title: string; 
    discription: string;
    icon: 'mail' | 'info' | 'settings'
}


export type InsideMenuProps = {
    ButtonArray: ButtonLinkProps[];
    title: string; 
    discription: string;
  }


export type ButtonLinkProps = {
    title: string;
    url: string ;
}