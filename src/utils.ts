import { useState, useEffect, Dispatch } from 'react'
import { Theme } from '@material-ui/core/styles'

import {
  MetadataGroup,
  MbResponse,
  LayerPropsNonBGlayer,
} from 'components/map/types'
import { StoreAction, LangRecordSchema } from './context/types'

// TODO: into config since it's used in multiple places...
const DEFAULT_DELIM = ', ' // e.g. for multi-value Neighborhoods and Countries

export const getGroupNames = (groupObject: MetadataGroup): string[] =>
  Object.keys(groupObject).map((groupId: string) => groupObject[groupId].name)

// TODO: react-query
export const getMbStyleDocument = async (
  symbStyleUrl: string,
  dispatch: Dispatch<StoreAction>,
  setSymbLayers: Dispatch<LayerPropsNonBGlayer[]>,
  setLabelLayers: Dispatch<LayerPropsNonBGlayer[]>
): Promise<void> => {
  const response = await fetch(symbStyleUrl) // TODO: handle errors
  const { metadata, layers: allLayers }: MbResponse = await response.json()
  const allLayerGroups = metadata['mapbox:groups']
  const nonLabelsGroups: MetadataGroup = {}
  let labelsGroupId = ''

  for (const key in allLayerGroups) {
    if (allLayerGroups[key].name === 'Labels') {
      labelsGroupId = key
    } else {
      nonLabelsGroups[key] = allLayerGroups[key]
    }
  }

  // Default symbology to show first
  const firstGroupId = Object.keys(nonLabelsGroups)[0]

  const nonBgLayersWithMeta = allLayers.filter(
    (layer) => layer.metadata && layer.type !== 'background'
  )
  const notTheBgLayerOrLabels = nonBgLayersWithMeta.filter(
    (layer) => layer.metadata['mapbox:group'] !== labelsGroupId
  ) as LayerPropsNonBGlayer[]
  const labelsLayers = nonBgLayersWithMeta.filter(
    (layer) => layer.metadata['mapbox:group'] === labelsGroupId
  ) as LayerPropsNonBGlayer[]

  // The field names that will populate the "Label by" dropdown
  const labelFields = labelsLayers.map((layer) => layer.id as string)

  // Populate symb dropdown
  dispatch({
    type: 'INIT_LANG_LAYER_SYMB_OPTIONS',
    payload: nonLabelsGroups,
  })

  // TODO: consider orig. Region colors for `Status`: https://bit.ly/34szqZe
  // Set group ID of initial active MB Styles group
  dispatch({
    type: 'SET_LANG_LAYER_SYMBOLOGY',
    payload: firstGroupId,
  })

  // Populate labels dropdown
  dispatch({
    type: 'INIT_LANG_LAYER_LABEL_OPTIONS',
    payload: labelFields,
  })

  setLabelLayers(labelsLayers)
  setSymbLayers(notTheBgLayerOrLabels)

  const legend = notTheBgLayerOrLabels.reduce((all, thisOne) => {
    return {
      ...all,
      [thisOne.id as string]: {
        paint: thisOne.paint,
        type: thisOne.type,
        layout: thisOne.layout,
      },
    }
  }, {})

  dispatch({
    type: 'INIT_LEGEND_SYMBOLS',
    payload: legend,
  })
}

export const findFeatureByID = (
  langLayerRecords: LangRecordSchema[],
  id: number,
  idField?: keyof LangRecordSchema
): LangRecordSchema | undefined =>
  langLayerRecords.find((record) => record[idField || 'ID'] === id)

export const getIDfromURLparams = (url: string): number => {
  const urlParams = new URLSearchParams(url)
  const idAsString = urlParams.get('id') as string

  return parseInt(idAsString, 10)
}

export const isURL = (text: string): boolean => text.slice(0, 4) === 'http'

// CRED:
// https://github.com/mbrn/material-table/issues/709#issuecomment-566097441
export function useWindowResize(): { width: number; height: number } {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  const listener = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }

  useEffect(() => {
    window.addEventListener('resize', listener)

    return () => {
      window.removeEventListener('resize', listener)
    }
  }, [])

  return {
    width,
    height,
  }
}

// TODO: look into cookie warnings regarding Dropbox:
// https://web.dev/samesite-cookies-explained/?utm_source=devtools
// "dl" stuff takes you to the downloadable version, raw and www to raw. Could
// just change this in the data but Ross is away and Jason already gave faulty
// instructions...
export function correctDropboxURL(url: string): string {
  const badDropboxHost = 'dl.dropboxusercontent.com'
  const goodDropboxHost = 'www.dropbox.com'
  const badDropboxSuffix = 'dl=0'
  const goodDropboxSuffix = 'raw=1'

  return url
    .replace(badDropboxHost, goodDropboxHost)
    .replace(badDropboxSuffix, goodDropboxSuffix)
}

// e.g. convert "Woodside, Queens" into "Woodside (+1 more)"
export function prettyTruncateList(
  text: string,
  delimiter: string = DEFAULT_DELIM
): string {
  const asArray = text.split(delimiter)
  const firstItem = asArray[0]

  // Single-items do not make sense to have (+0)...
  if (asArray.length === 1) {
    return firstItem
  }

  return `${firstItem} (+${asArray.length - 1} more)`
}

// CRED: for `theme.transitions.create` example:
// https://medium.com/@octaviocoria/custom-css-transitions-with-react-material-ui-5d41cb2e7c5#fecb
export const smoothToggleTransition = (
  theme: Theme,
  open?: boolean
): string => {
  const { transitions } = theme
  /* eslint-disable operator-linebreak */
  const duration = open
    ? transitions.duration.leavingScreen
    : transitions.duration.enteringScreen
  /* eslint-enable operator-linebreak */
  const easing = open ? transitions.easing.easeIn : transitions.easing.easeOut

  return transitions.create('all', { duration, easing })
}

export const createMarkup = (content: string): { __html: string } => ({
  __html: content,
})

// CRED: https://lowrey.me/test-if-a-string-is-alphanumeric-in-javascript/
export const isAlphaNumeric = (ch: string): boolean =>
  ch.match(/^[a-z0-9]+$/i) !== null
