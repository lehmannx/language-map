import React, { FC, useState, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import MapGL, { InteractiveMap, MapLoadEvent } from 'react-map-gl'
import * as mbGlFull from 'mapbox-gl'
import { Theme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import 'mapbox-gl/dist/mapbox-gl.css'

import { GlobalContext, LoadingBackdrop } from 'components'
import { LangMbSrcAndLayer, MapPopup, MapTooltip } from 'components/map'
import { initLegend } from 'components/legend/utils'
import * as MapTypes from './types'
import * as mapUtils from './utils'
import * as mapConfig from './config'
import { LangRecordSchema } from '../../context/types'
import { getIDfromURLparams, findFeatureByID } from '../../utils'

const { layerId, internalSrcID } = mapConfig.mbStyleTileConfig

export const Map: FC<MapTypes.MapComponent> = ({
  symbLayers,
  labelLayers,
  baselayer,
}) => {
  const history = useHistory()
  const { state, dispatch } = useContext(GlobalContext)
  const mapRef: React.RefObject<InteractiveMap> = React.createRef()
  const { selFeatAttribs } = state
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const [viewport, setViewport] = useState(mapConfig.initialMapState)
  const [mapOffset, setMapOffset] = useState<[number, number]>([0, 0])
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [popupOpen, setPopupOpen] = useState<MapTypes.MapPopup | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState<MapTypes.MapTooltip | null>(
    null
  )

  // Set the offset for transitions like `flyTo` and `easeTo`
  useEffect((): void => {
    const offset = mapUtils.prepMapOffset(isDesktop)

    setMapOffset(offset)
  }, [isDesktop])

  useEffect((): void => {
    initLegend(dispatch, state.activeLangSymbGroupId, symbLayers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeLangSymbGroupId])

  // (Re)load symbol icons. Must be done whenever `baselayer` is changed,
  // otherwise the images no longer exist.
  // TODO: chuck it into utils, and recycle the icons if it makes sense
  useEffect((): void => {
    // Map not ready
    if (!mapRef.current) {
      return
    }

    const map: mbGlFull.Map = mapRef.current.getMap()

    // CRED:
    // https://github.com/mapbox/mapbox-gl-js/issues/5529#issuecomment-340011876
    mapConfig.langTypeIconsConfig.forEach((config) => {
      const { id, icon } = config

      if (map.hasImage(id)) {
        map.removeImage(id)
      }

      const img = new Image(48, 48) // src files are 24x24 viewbox

      img.onload = () => map.addImage(id, img)
      img.src = icon
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselayer])

  // Do selected feature stuff on sel feat change or map load
  useEffect((): void => {
    // Map not ready
    if (!mapRef.current || !mapLoaded) {
      return
    }

    const map: mbGlFull.Map = mapRef.current.getMap()

    // Deselect all features
    clearAllSelFeats(map)

    if (!selFeatAttribs) {
      return
    }

    // NOTE: won't get this far on load even if feature is selected. The timing
    // and order of the whole process prevent that. Make feature appear selected
    const { ID, Latitude, Longitude } = selFeatAttribs

    setSelFeatState(map, ID, true)

    mapUtils.flyToCoords(
      map,
      {
        lat: Latitude,
        lng: Longitude,
        zoom: 12,
      },
      mapOffset,
      selFeatAttribs
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selFeatAttribs, mapLoaded])

  // TODO: chuck it into utils
  function setSelFeatState(map: mbGlFull.Map, id: number, selected: boolean) {
    map.setFeatureState(
      {
        sourceLayer: layerId,
        source: internalSrcID,
        id,
      },
      { selected }
    )
  }

  function onHover(event: MapTypes.MapEvent) {
    mapUtils.handleHover(event, internalSrcID, setTooltipOpen)
  }

  // Runs only once and kicks off the whole thinig
  function onLoad(mapLoadEvent: MapLoadEvent) {
    const { target: map } = mapLoadEvent

    // Maintain viewport state sync if needed (e.g. after things like `flyTo`),
    // otherwise the map shifts back to previous position after panning or
    // zooming.
    map.on('moveend', function onMoveEnd(zoomEndEvent) {
      // No custom event data, regular move event
      if (zoomEndEvent.forceViewportUpdate) {
        setViewport({
          ...viewport,
          zoom: map.getZoom(),
          latitude: map.getCenter().lat,
          longitude: map.getCenter().lng,
        })
      }
    })

    map.on('zoomend', function onMoveEnd(zoomEndEvent) {
      if (zoomEndEvent.selFeatAttribs) {
        setPopupOpen({
          latitude: zoomEndEvent.selFeatAttribs.Latitude,
          longitude: zoomEndEvent.selFeatAttribs.Longitude,
          selFeatAttribs: zoomEndEvent.selFeatAttribs,
        })
      }
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const langSrcBounds = map.getSource('languages-src').bounds
    map.fitBounds(langSrcBounds) // ensure all feats are visible

    const idFromUrl = getIDfromURLparams(window.location.search)
    const cacheOfIDs: number[] = []
    const uniqueRecords: LangRecordSchema[] = []
    const rawLangFeats = map.querySourceFeatures(internalSrcID, {
      sourceLayer: layerId,
    })

    // Just the properties for table/results, don't need GeoJSON cruft. Also
    // need to make sure each ID is unique as there have been initial data
    // inconsistencies, and more importantly MB may have feature duplication if
    // there is a tile overlap.
    rawLangFeats.forEach((thisFeat) => {
      if (
        !thisFeat.properties ||
        cacheOfIDs.indexOf(thisFeat.properties.ID) !== -1
      ) {
        return
      }

      const justTheProps = thisFeat.properties as LangRecordSchema

      cacheOfIDs.push(justTheProps.ID)
      uniqueRecords.push(justTheProps)
    })

    const matchingRecord = findFeatureByID(uniqueRecords, idFromUrl)

    // NOTE: could not get this into the same `useEffect` that handles when
    // selFeatAttribs or mapLoaded are changed with an MB error/crash.
    if (!matchingRecord) {
      const configKey = isDesktop ? 'desktop' : 'mobile'

      mapUtils.flyToCoords(
        map,
        { ...mapConfig.postLoadMapView[configKey] },
        mapOffset,
        null
      )
    }

    // TODO: set paint property
    // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setpaintproperty

    dispatch({
      type: 'INIT_LANG_LAYER_FEATURES',
      payload: uniqueRecords,
    })

    setMapLoaded(true)
  }

  // TODO: chuck it into utils
  function onNativeClick(event: MapTypes.MapEvent): void {
    // Map not ready
    if (!mapRef || !mapRef.current || !mapLoaded) {
      return
    }

    // No language features under click, clear the route
    if (!mapUtils.areLangFeatsUnderCursor(event.features, internalSrcID)) {
      history.push(`${window.location.pathname}?id=-1`) // TODO: better solution

      return
    }

    setTooltipOpen(null) // super annoying if tooltip stays intact after a click

    // TODO: use `initialEntries` in <MemoryRouter> to test routing
    history.push(`/details?id=${event.features[0].properties.ID}`)
  }

  // Assumes map is ready
  function clearAllSelFeats(map: mbGlFull.Map) {
    map.removeFeatureState({
      source: internalSrcID,
      sourceLayer: layerId,
    }) // TODO: add `selected` key?
  }

  return (
    <>
      {!mapLoaded && <LoadingBackdrop />}
      <MapGL
        // TODO: show MB attribution text (not logo) on mobile
        className="mb-language-map"
        {...viewport}
        clickRadius={4} // much comfier for small points on small screens
        ref={mapRef}
        height="100%"
        width="100%"
        mapboxApiAccessToken={mapConfig.MAPBOX_TOKEN}
        mapStyle={`mapbox://styles/mapbox/${baselayer}-v9`}
        onViewportChange={setViewport}
        onClick={onNativeClick} // TODO: mv into utils
        onHover={onHover}
        onLoad={(mapLoadEvent) => {
          onLoad(mapLoadEvent)
        }}
      >
        {symbLayers && labelLayers && (
          <LangMbSrcAndLayer
            symbLayers={symbLayers}
            labelLayers={labelLayers}
            activeLangSymbGroupId={state.activeLangSymbGroupId}
            activeLangLabelId={state.activeLangLabelId}
          />
        )}
        {selFeatAttribs && popupOpen && (
          <MapPopup
            setPopupOpen={setPopupOpen}
            longitude={popupOpen.longitude}
            latitude={popupOpen.latitude}
            selFeatAttribs={selFeatAttribs}
          />
        )}
        {isDesktop && tooltipOpen && (
          <MapTooltip
            setTooltipOpen={setTooltipOpen}
            longitude={tooltipOpen.longitude}
            latitude={tooltipOpen.latitude}
            heading={tooltipOpen.heading}
            subHeading={tooltipOpen.subHeading}
          />
        )}
      </MapGL>
    </>
  )
}
