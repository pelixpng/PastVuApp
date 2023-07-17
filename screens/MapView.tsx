import { FC, useMemo } from 'react'
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native';
import ApiServiceV2 from '../api/PastVuApi';
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types';
import { StartRoutes } from '../navigation/Routes';
import { PhotoPage } from './PhotoView';
import * as Location from 'expo-location';
import { observer } from 'mobx-react-lite';
import apiStore from '../mobxStore/apiStore';

const loc: Region = 
  {
    latitude: 55.476348,
    longitude: 60.202737,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  }


export const MapComponent: React.FC<MapScreenNavigationProp> = observer(({navigation}) => {
    const [items, setItems] = useState<itemPhotoArray[]>([]);
    const [coordinates, setCoordinates] = useState<Region>(loc);
    const {countPhoto, maxDistance} = apiStore;
    const handleButtonPress = async (cid: string) => {
      const url = await ApiServiceV2.getPhotoInfo(cid)
      navigation.navigate(StartRoutes.PhotoPage, {url})
    };

    const handleRegionChangeComplete = (region: Region) => {
      setCoordinates(region);
    };

    useMemo(() => {
      async function exampleUsage() {
        try {
          await Location.requestForegroundPermissionsAsync();
          const photoArray: itemPhotoArray[] = await ApiServiceV2.getAllGroups(coordinates.latitude, coordinates.longitude, countPhoto, maxDistance);
          setItems((prevItems) => [
            ...prevItems,
            ...photoArray.map((item) => ({
              title: item.title,
              cid: item.cid,
              location: {
                latitude: item.location.latitude,
                longitude: item.location.longitude,
              },
            })),
          ]);
        } catch (error) {
          console.error(error);
        }
      }
      exampleUsage();
    }, [coordinates]);
      
     
      return (
        <View style={styles.container}>
          <MapView style={styles.map}  initialRegion={coordinates}
            provider={PROVIDER_GOOGLE}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            >
            {items.map((marker, index)=>(
              <Marker
              key={index}
              coordinate={marker.location}
              title={marker.title}
              onPress={()=>handleButtonPress(marker.cid)}
              
            />
            ))}
          </MapView>
        </View>
      );
    })
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      map: {
        width: '100%',
        height: '100%',
      },
    });

