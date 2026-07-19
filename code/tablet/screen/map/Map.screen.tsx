import { StyleSheet, View } from 'react-native'
import MapVM, { mapRef } from './Map.vm'
import { LocationButton } from '../../../core/components/map/LocationButton'
import { YearsSlider } from '../../../core/components/map/YearsSlider'
import { observer } from 'mobx-react'
import { SearchPlace } from '../../../core/components/map/SearchPlace'
import { useVM } from '../../../core/hooks/useVM'
import { PhotoDetail } from './components/photoDetail/PhotoDetail'
import { GoogleAppleMaps } from '../../../core/components/map/GoogleAppleMaps'

export const MapScreen = observer(() => {
  const vm = useVM(MapVM)
  return (
    <View style={s.flexOne}>
      <SearchPlace
        places={vm.places}
        query={vm.queryPlace}
        setQueryPlace={vm.setQueryPlace}
        goToLocation={vm.goToLocation}
        isTablet
      />
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
      <LocationButton onPress={vm.getCurrentLocation} isTablet />
      <YearsSlider value={vm.yearsRange} setValue={vm.setYearsRange} isTablet />
    </View>
  )
})

const s = StyleSheet.create({
  flexOne: { flex: 1 },
})
