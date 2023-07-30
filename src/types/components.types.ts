import { JSXElementConstructor, ReactNode } from "react";
import { Root } from "./apiPhotoInfo";

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
    CustomComponent?: ReactNode;
    CustomComponent2?: ReactNode;
    HTMLdiscription?: ReactNode;
    HTMLsource?: ReactNode;
    HTMLautor?: ReactNode;
    button?: ReactNode;
  }


export type ButtonLinkProps = {
    title: string;
    url: string ;
}


export type PhotoPageProps = {
    route: { params: { PhotoJson: Root } };
};

export type SliderComponentProps = {
    value: number;
    setValue: (value: number) => void;
    title: string;
    minValue: number;
    maxValue:number
}

export type YearsSliderComponentProps = {
    value: YearsRangeType;
    setValue: (value: YearsRangeType) => void;
  }