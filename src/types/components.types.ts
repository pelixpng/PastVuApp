import { JSXElementConstructor, ReactNode } from "react";

export type MenuButtonProps = {
    navigation: any; 
    route: string; 
    title: string; 
    discription: string;
    icon: 'mail' | 'info' | 'settings'
}

export type InsideMenuProps = {
    ButtonArray?: ButtonLinkProps[];
    title: string; 
    discription: string;
    child?: ReactNode;
    child2?: ReactNode;
  }


export type ButtonLinkProps = {
    title: string;
    url: string ;
}