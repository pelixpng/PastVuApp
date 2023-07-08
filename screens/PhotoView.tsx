import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types';


type Props = {
    route: { params: { url: string } };
  };


export const PhotoPage: React.FC<Props> = ({route}) => {
    const imageUri: string = route.params.url
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.photo}/>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 300,
    height: 300,
  },
});

