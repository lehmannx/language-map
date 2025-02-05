import React, { FC, useState } from 'react'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import {
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
  useTheme,
} from '@material-ui/core'

import { SearchByOmnibox } from 'components/home/SearchByOmnibox'
import { GeocoderPopout } from 'components/map'
import { PopoverWithUItext } from 'components/generic'
import { UItextTableID } from 'components/generic/types'
import { UI_SEARCH_LANGUAGES, UI_SEARCH_LOCATIONS } from 'components/config'
import { TabPanel } from './TabPanel'
import { SearchTabsProps } from './types'

const useStyles = makeStyles((theme: Theme) => {
  const { palette } = theme

  return createStyles({
    tabRoot: {
      fontSize: '0.85rem',
    },
    selected: {
      '&.search-tab': {
        color: palette.text.primary,
        borderColor: palette.secondary.light,
      },
    },
    quickFlex: {
      alignItems: 'center',
      display: 'grid',
      gridColumnGap: 4,
      justifyContent: 'center',
      gridTemplateColumns: 'minmax(350px, auto) 32px',
      [theme.breakpoints.only('xs')]: {
        gridTemplateColumns: '1fr 24px',
      },
    },
  })
})

const a11yProps = (index: number) => ({
  id: `search-tab-${index}`,
  'aria-controls': `search-tabpanel-${index}`,
})

const QuickFlex: FC<{ uiTextID: UItextTableID }> = (props) => {
  const { children, uiTextID } = props
  const classes = useStyles()

  return (
    <div className={classes.quickFlex}>
      {children}
      <PopoverWithUItext id={uiTextID} />
    </div>
  )
}

export const SearchTabs: FC<SearchTabsProps> = (props) => {
  const { mapRef } = props
  const classes = useStyles()
  const theme = useTheme()
  const [value, setValue] = useState<number>(0)

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index: number) => {
    setValue(index)
  }

  const TabAppBar = (
    <AppBar position="static" color="transparent" elevation={0}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="secondary"
        variant="fullWidth"
        aria-label="search panel"
      >
        <Tab
          className="search-tab"
          classes={{ selected: classes.selected, root: classes.tabRoot }}
          label={UI_SEARCH_LANGUAGES}
          {...a11yProps(0)}
        />
        <Tab
          className="search-tab"
          classes={{ selected: classes.selected, root: classes.tabRoot }}
          label={UI_SEARCH_LOCATIONS}
          {...a11yProps(1)}
        />
      </Tabs>
    </AppBar>
  )

  const TabMeat = (
    <SwipeableViews
      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
      index={value}
      onChangeIndex={handleChangeIndex}
    >
      <TabPanel value={value} index={0}>
        <QuickFlex uiTextID="omni-info-popout">
          <SearchByOmnibox />
        </QuickFlex>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <QuickFlex uiTextID="loc-search-info-popout">
          <GeocoderPopout mapRef={mapRef} />
        </QuickFlex>
      </TabPanel>
    </SwipeableViews>
  )

  return (
    <>
      {TabAppBar}
      {TabMeat}
    </>
  )
}
