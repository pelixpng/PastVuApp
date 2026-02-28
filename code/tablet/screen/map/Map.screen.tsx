import { StyleSheet, View } from 'react-native'
import MapVM, { mapRef, yamapRef } from './Map.vm'
import { LocationButton } from './components/LocationButton'
import { YearsSlider } from './components/yearsSlider/YearsSlider'
import { observer } from 'mobx-react'
import { SearchPlace } from './components/searchPlace/SearchPlace'
import { useVM } from '../../../core/hooks/useVM'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { GoogleAppleMaps } from '../../../core/components/map/GoogleAppleMaps'
import { YandexMaps } from '../../../core/components/map/YandexMaps'
import MapStore from '../../../core/store/Map.store'

export const MapScreen = observer(() => {
  const vm = useVM(MapVM)
  return (
    <View style={s.flexOne}>
      <SearchPlace
        places={vm.places}
        query={vm.queryPlace}
        setQueryPlace={vm.setQueryPlace}
        goToLocation={vm.goToLocation}
      />
      {MapStore.mapProvider === 'yandex' ? (
        <YandexMaps
          mapRef={yamapRef}
          markers={vm.photoCollection.markers}
          mapMarkerType={vm.mapMarkerType}
          initialRegion={vm.coordinates}
          onRegionChangeComplete={vm.setCoordinate}
          onShowPhoto={vm.showPhoto}
          onGoToLocation={vm.zoomToCluster}
        />
      ) : (
        <GoogleAppleMaps
          mapRef={mapRef}
          markers={vm.photoCollection.markers}
          mapType={vm.mapTypeSetting}
          mapMarkerType={vm.mapMarkerType}
          initialRegion={vm.coordinates}
          onRegionChangeComplete={vm.setCoordinate}
          onShowPhoto={vm.showPhoto}
          onGoToLocation={vm.zoomToCluster}
        />
      )}
      {vm.showPhotoDetail && (
        <PhotoDetail
          postInfo={vm.postInfo}
          users={vm.users}
          comments={vm.comments}
          closePhoto={vm.closePhoto}
          onImageLoaded={vm.onImageLoad}
          openFullScreen={vm.openFullScreenImage}
          saveImage={vm.saveImage}
          share={vm.share}
          imageLink={vm.imageLink}
          isImageLoaded={vm.isImageLoaded}
          onLinkPress={vm.openPhotoFromLink}
          isFavorite={vm.isFavorite}
          toggleFavorite={vm.toggleFavorite}
        />
      )}
      <LocationButton onPress={vm.getCurrentLocation} />
      <YearsSlider value={vm.yearsRange} setValue={vm.setYearsRange} />
    </View>
  )
})

const s = StyleSheet.create({
  flexOne: { flex: 1 },
})
