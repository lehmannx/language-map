// NOTE: parts of this file were adapted from an existing GitHub project with an
// MIT License, available here:
// https://github.com/Covid-Self-report-Tool/cov-self-report-frontend/blob/master/LICENSE

import { ArrayOfStringArrays } from 'components/config/types'
import { PreppedCensusLUTrow, CensusQueryID } from 'components/spatial/types'

export type PanelState = 'default' | 'maximized' | 'minimized'
export type LangSchemaCol = keyof LangRecordSchema

export type StoreAction =
  | { type: 'CLEAR_FILTERS'; payload: number }
  | { type: 'SET_LANG_LAYER_FEATURES'; payload: InternalUse[] }
  | { type: 'SET_PANEL_STATE'; payload: PanelState }

export type InitialState = {
  clearFilters: number
  langFeatures: InternalUse[]
  langFeatsLenCache: number
  panelState: PanelState
}

export type Statuses =
  | 'Historical'
  | 'Community'
  | 'Liturgical'
  | 'Residential'
  | 'Reviving'

// Aka user doesn't really see them
export type InternalUse = {
  id: string // unique (ultimately)
  Latitude: number // nice convenience over geometry.coordinates
  Longitude: number // nice convenience over geometry.coordinates
}

export type LangLevelReqd = {
  name: string
  Endonym: string // often same as English name, may be an http link to image
  countryImg: { url: string }[]
  Country: string[]
  worldRegionColor: string
  'Language Family': string
  'World Region': string
  'Primary Locations': string[] // Town or primary Neighborhood
  instanceIDs: number[]
}

export type LangLevelOptional = CensusFields &
  Partial<{
    Font: string
    'Font Image Alt': { url: string }[] // e.g. ASL, Mongolian
    'Global Speaker Total': number
    addlNeighborhoods: string[] // suuuper shakes mcgee
    Audio: string
    Description: string // same column name in Data table
    Glottocode: string
    Macrocommunity: string
    Neighborhood: string[]
    Town: string[]
    Video: string
    'ISO 639-3': string
  }>

type InstanceLevelReqd = InternalUse & {
  Language: string
  Size: 'Smallest' | 'Small' | 'Medium' | 'Large' | 'Largest'
  Status: Statuses
  sizeColor: string
  'Primary Location': string // Town or primary Neighborhood convenience
} & Omit<LangLevelReqd, 'name'>

type InstanceLevelOptional = LangLevelOptional & {
  'Additional Neighborhoods': string[]
  Description: string // same column name in Language table
  Neighborhood: string // NYC-metro only
  Town: string
}

type CensusFields = {
  'PUMA Field'?: string
  'Tract Field'?: string
  'Census Pretty'?: string
}

export type InitialMapToolsState = {
  boundariesVisible: boolean
  geolocActive: boolean
  tractsField?: string
  pumaField?: string
  censusDropDownFields: {
    tracts: PreppedCensusLUTrow[]
    puma: PreppedCensusLUTrow[]
  }
  censusActiveFields: {
    tracts: string
    puma: string
  }
}

export type MapToolsAction =
  | { type: 'SET_LANG_CONFIG_VIA_SHEETS'; payload: ArrayOfStringArrays }
  | { type: 'SET_BOUNDARIES_VISIBLE'; payload: boolean }
  | { type: 'SET_GEOLOC_ACTIVE'; payload: boolean }
  | { type: 'CLEAR_CENSUS_FIELD' }
  | {
      type: 'SET_CENSUS_FIELD'
      payload?: string
      censusType: CensusQueryID
    }
  | {
      type: 'SET_CENSUS_FIELDS'
      payload: PreppedCensusLUTrow[]
      censusType: CensusQueryID
    }

export type MapToolsDispatch = React.Dispatch<MapToolsAction>

// Fields in the actual Airtable tables
export type LangLevelSchema = LangLevelOptional & LangLevelReqd
export type InstanceLevelSchema = InstanceLevelOptional & InstanceLevelReqd

// Dupes to avoid find-and-replace of originals
export type LangRecordSchema = InstanceLevelSchema
export type DetailsSchema = InstanceLevelSchema
