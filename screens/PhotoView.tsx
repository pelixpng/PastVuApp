import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

type PhotoProps = {
  url: string;
};

export const PhotoPage: React.FC<PhotoProps> = ({ url }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: url }} style={styles.photo} />
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

