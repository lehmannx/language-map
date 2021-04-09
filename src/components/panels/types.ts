import { InteractiveMap } from 'react-map-gl'
import { RouteLocation } from 'components/config/types'
import { MapProps } from 'components/map/types'

export type MapPanel = {
  component: React.ReactNode
  rootPath: RouteLocation
  heading?: string
  exact?: boolean
  icon?: React.ReactNode
}

export type PanelWrapProps = Pick<MapProps, 'mapRef'>

export type SearchTabsProps = {
  mapRef: React.RefObject<InteractiveMap>
  fixed?: boolean // non-Home panels have a hidden SearcTabs component
  open?: boolean
}

export type TabPanelProps = {
  index: number
  value: number
}
