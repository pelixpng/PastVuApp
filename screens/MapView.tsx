import { FC } from 'react'
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StyleSheet, View, Button, Text } from 'react-native';
import ApiServiceV2 from '../api/PastVuApi';
import { MapScreenNavigationProp, Propss } from '../types/Navigation.types';
import { StartRoutes } from '../navigation/Routes';
import { PhotoPage } from './PhotoView';


const loc: Region = 
  {
    latitude: 55.476348,
    longitude: 60.202737,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  }


export const MapComponent: React.FC<MapScreenNavigationProp> = ({navigation}) => {
    const [items, setItems] = useState<itemPhotoArray[]>([]);
    const [coordinates, setCoordinates] = useState<Region>(loc);
    
    const handleButtonPress = async (cid: string) => {
      const url = await ApiServiceV2.getPhotoInfo(cid)
      navigation.navigate(StartRoutes.PhotoPage, {url})
    };

    const handleRegionChangeComplete = (region: Region) => {
      setCoordinates(region);
    };

    useEffect(() => {
      async function exampleUsage() {
        try {
          const photoArray: itemPhotoArray[] = await ApiServiceV2.getAllGroups(coordinates.latitude, coordinates.longitude);
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
          <MapView style={styles.map}  initialRegion={loc}
            provider={PROVIDER_GOOGLE}
            onRegionChangeComplete={handleRegionChangeComplete}
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
          {coordinates && (
            <View style={{ position: 'absolute', top: 16, left: 16 }}>
              <Text style={{ color: 'white', fontSize: 16 }}>
                {`Latitude: ${coordinates.latitude}`}
              </Text>
              <Text style={{ color: 'white', fontSize: 16 }}>
                {`Longitude: ${coordinates.longitude}`}
              </Text>
            </View>
          )}
        
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      map: {
        width: '100%',
        height: '100%',
      },
    });

