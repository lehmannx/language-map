import React, { FC } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Link, Button, Typography, Popover, Box } from '@material-ui/core'
import Geocoder from 'react-map-gl-geocoder'
import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  CloseReason,
} from '@material-ui/lab'
import { MdMoreVert, MdClose } from 'react-icons/md'
import { BiMapPin } from 'react-icons/bi'
import { FiHome, FiZoomIn, FiZoomOut, FiInfo } from 'react-icons/fi'

import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

import { flyToCoords } from './utils'
import { MapCtrlBtnsProps, CtrlBtnConfig, GeocodeResult } from './types'
import { MAPBOX_TOKEN, NYC_LAT_LONG } from './config'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapCtrlsRoot: {
      position: 'absolute',
      top: theme.spacing(1),
      right: 4, // same as left-side page title
      zIndex: 1100, // above app bar
      [theme.breakpoints.up('sm')]: {
        top: theme.spacing(3),
        right: theme.spacing(3),
      },
      '& svg': {
        height: '1.5em',
        width: '1.5em',
      },
    },
    speedDialAction: {
      margin: 4,
      '&:hover': {
        [theme.breakpoints.down('sm')]: {
          backgroundColor: theme.palette.background.default,
        },
      },
    },
    popoverContent: {
      padding: '1em',
      width: 300,
    },
    popoverContentHeading: {
      marginTop: '.5rem',
    },
    popoverContentText: {
      marginBottom: '.75em',
      fontSize: '0.8em',
    },
    layersMenuPaper: {
      overflow: 'visible',
    },
    locationBtnWrap: {
      display: 'flex',
      justifyContent: 'center',
    },
  })
)

const ctrlBtnsConfig = [
  { id: 'in', icon: <FiZoomIn />, name: 'Zoom in' },
  { id: 'out', icon: <FiZoomOut />, name: 'Zoom out' },
  { id: 'home', icon: <FiHome />, name: 'Zoom home' },
  {
    id: 'loc-search',
    icon: <BiMapPin />,
    name: 'Search by location',
    customFn: true,
  },
  { id: 'info', icon: <FiInfo />, name: 'About & Info' },
] as CtrlBtnConfig[]

export const LocationSearchContent: FC = (props) => {
  const { children } = props
  const classes = useStyles()

  return (
    <Box className={classes.popoverContent}>
      <Typography variant="h4" component="h3">
        Location Search
      </Typography>
      <Typography
        variant="h6"
        component="h4"
        className={classes.popoverContentHeading}
      >
        Search by place
      </Typography>
      <Typography className={classes.popoverContentText}>
        <small>
          Address, city, neighborhood, postal code, or landmark/placename.{' '}
          <Link
            href="https://docs.mapbox.com/api/search/#data-types"
            target="_blank"
          >
            @Ross maybe others?
          </Link>
        </small>
      </Typography>
      {children}
      <Typography
        variant="h6"
        component="h4"
        className={classes.popoverContentHeading}
      >
        My Location
      </Typography>
      <Typography className={classes.popoverContentText}>
        <small>
          Search by your current location (your info will not be stored or
          shared in any way).
        </small>
      </Typography>
      <div className={classes.locationBtnWrap}>
        <Button
          // eslint-disable-next-line no-alert
          onClick={() => alert('You. Are. Here. 🤯')}
          variant="contained"
          size="small"
          color="primary"
        >
          Zoom to current
        </Button>
      </div>
    </Box>
  )
}

export const MapCtrlBtns: FC<MapCtrlBtnsProps> = (props) => {
  const { isDesktop, onMapCtrlClick, mapRef, mapOffset } = props
  const classes = useStyles()
  const [speedDialOpen, setSpeedDialOpen] = React.useState(true)
  const size = isDesktop ? 'medium' : 'small'
  const geocoderContainerRef = React.useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const layersMenuOpen = Boolean(anchorEl)

  const handleSpeedDialRootClick = () => setSpeedDialOpen(!speedDialOpen)
  const handleLayersMenuClose = () => setAnchorEl(null)

  const handleGeocodeResult = (geocodeResult: GeocodeResult) => {
    handleLayersMenuClose()

    if (mapRef.current) {
      flyToCoords(
        mapRef.current.getMap(),
        {
          latitude: geocodeResult.result.center[1],
          longitude: geocodeResult.result.center[0],
          zoom: 13,
        },
        mapOffset,
        null
      )
    }
  }

  const handleClose = (
    e: React.SyntheticEvent<Record<string, unknown>, Event>,
    reason: CloseReason
  ) => {
    if (reason === 'mouseLeave' || reason === 'blur') {
      // Prevent closing the menu
      e.preventDefault()

      return
    }

    setSpeedDialOpen(false)
  }

  return (
    <>
      <Popover
        id="layers-menu"
        anchorEl={anchorEl}
        open={layersMenuOpen}
        onClose={handleLayersMenuClose}
        PaperProps={{
          className: classes.layersMenuPaper,
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
      >
        <LocationSearchContent>
          <div ref={geocoderContainerRef} />
          <Geocoder
            mapRef={mapRef}
            countries="us"
            // TODO: confirm:
            // https://docs.mapbox.com/api/search/#data-types
            types="address,poi,postcode,locality,place,neighborhood"
            placeholder="Search locations..."
            containerRef={geocoderContainerRef}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            proximity={NYC_LAT_LONG}
            onResult={handleGeocodeResult}
          />
        </LocationSearchContent>
      </Popover>
      <SpeedDial
        ariaLabel="Map control buttons"
        className={classes.mapCtrlsRoot}
        icon={<SpeedDialIcon openIcon={<MdClose />} icon={<MdMoreVert />} />}
        onClose={handleClose}
        open={speedDialOpen}
        direction="down"
        FabProps={{ size }}
        onClick={handleSpeedDialRootClick}
      >
        {ctrlBtnsConfig.map((action) => (
          <SpeedDialAction
            className={classes.speedDialAction}
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            FabProps={{ size }} // TODO: uhhhh breakpoints? Why is this needed?
            onClick={(e) => {
              e.stopPropagation() // prevent closing the menu

              // GROSS
              if (!action.customFn) {
                onMapCtrlClick(action.id)
              } else {
                setAnchorEl(e.currentTarget)
              }
            }}
          />
        ))}
      </SpeedDial>
    </>
  )
}
