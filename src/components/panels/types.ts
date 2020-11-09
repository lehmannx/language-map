import { RouteLocation } from 'components/config/types'

export type MapPanel = {
  heading: string
  component: React.ReactNode
  rootPath: RouteLocation
  exact?: boolean
  icon?: React.ReactNode
}

export type MapPanelProps = {
  openOffCanvasNav: (e: React.MouseEvent) => void
  panelOpen: boolean
  setPanelOpen: React.Dispatch<boolean>
}

// TODO: detangle this mess like a professional web developer
export type PanelContentProps = {
  icon?: React.ReactNode
  intro?: string | React.ReactNode
  subSubtitle?: string | React.ReactNode
  subtitle?: string | React.ReactNode
  title?: string
}

export type PanelTitleBarProps = Pick<MapPanelProps, 'openOffCanvasNav'>
