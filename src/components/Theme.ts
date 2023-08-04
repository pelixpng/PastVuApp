import { DefaultTheme } from "styled-components";


export const LightTheme: DefaultTheme =  {
    colors: {
        backgroundApp: 'white',
        tabBarActiveTint: 'rgba(94, 157, 250, 0.90)',
        tabBarInactiveTintColor: 'rgba(199, 202, 207, 0.9)',
        titleMenuText: 'rgba(25, 28, 48, 0.90)',
        MenuDescriptionText: 'rgba(27, 31, 59, 0.65)',
        BackgroundMenuIcon: 'rgba(112, 182, 246, 0.12)',
        MenuContainer: 'white',
        SliderRangeBG: "#EDEDED",
        Delimetr: "#F4F4F4"
    },
    names:{
        themeName: 'LightTheme'
    }
};

export const DarkTheme: DefaultTheme =  {
    colors: {
        backgroundApp: 'black',
        tabBarActiveTint: 'rgba(59, 120, 213, 1)',
        tabBarInactiveTintColor: 'rgba(125, 132, 140, 1)',
        titleMenuText: 'white',
        MenuDescriptionText: 'rgba(255, 255, 255, 0.72)',
        BackgroundMenuIcon: 'rgba(112, 182, 246, 0.12)',
        MenuContainer: '#202020',
        SliderRangeBG: "#232325",
        Delimetr: '#202020'
    },
    names:{
        themeName: 'DarkTheme'
    }
};