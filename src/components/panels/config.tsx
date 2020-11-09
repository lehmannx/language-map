import React from 'react'
import { TiDocumentText, TiThList } from 'react-icons/ti'
import { FaBinoculars } from 'react-icons/fa'
import { BiHomeAlt } from 'react-icons/bi'

import { FiltersPanel } from 'components/filters'
import { DetailsPanel } from 'components/details'
import { Explore, PreDeets, SomeMidLevel } from 'components/sift'

import { MapPanel } from 'components/panels/types'
import { NavItemWithBadge } from './NavItemWithBadge'

export const MOBILE_PANEL_HEADER_HT = '3rem'
export const panelWidths = { mid: 450, midLarge: 600 }

export const panelsConfig = [
  {
    heading: 'Home',
    icon: <BiHomeAlt />,
    component: <FiltersPanel />,
    rootPath: '/',
    exact: true,
  },
  {
    heading: 'Language dead-end',
    component: <PreDeets />,
    rootPath: '/Explore/Language/:value',
  },
  {
    heading: 'Pre-details, nested w/extra params',
    component: <PreDeets />,
    rootPath: '/Explore/:field/:value/:language',
  },
  {
    heading: 'Level 2 cat',
    component: <SomeMidLevel />,
    rootPath: '/Explore/:field/:value',
  },
  {
    heading: 'Level 1 cat',
    component: <SomeMidLevel />,
    rootPath: '/Explore/:field',
  },
  {
    heading: 'Explore',
    icon: <FaBinoculars />,
    component: <Explore icon={<FaBinoculars />} />,
    rootPath: '/Explore',
  },
  {
    heading: 'Data',
    icon: (
      <NavItemWithBadge>
        <TiThList />
      </NavItemWithBadge>
    ),
    component: null,
    rootPath: '/table',
  },
  {
    heading: 'Details',
    icon: <TiDocumentText />,
    component: <DetailsPanel />,
    rootPath: '/details',
  },
] as MapPanel[]
