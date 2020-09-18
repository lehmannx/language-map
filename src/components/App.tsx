import React, { FC, useEffect, useState } from 'react'
import { Route } from 'react-router-dom'
import { queryCache } from 'react-query'
import { GoInfo } from 'react-icons/go'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

import { TopBar, OffCanvasNav } from 'components/nav'
import { MapWrap } from 'components/map'
import { MapPanel, PanelIntro } from 'components/panels'
import { AboutPageView, WelcomeDialog } from 'components/about'
import { ResultsModal } from 'components/results'
import { fetchAbout, fetchHelp, fetchWelcome } from 'components/about/utils'
import { paths as routes } from 'components/config/routes'
import { ABOUT_QUERY, HELP_QUERY, WELCOME_QUERY } from 'components/about/config'

export const App: FC = () => {
  const [tableOpen, setTableOpen] = useState<boolean>(false)

  const openTable = (): void => setTableOpen(true)
  const closeTable = (): void => setTableOpen(false)

  useEffect(() => {
    queryCache.prefetchQuery(WELCOME_QUERY, fetchWelcome)
    queryCache.prefetchQuery(ABOUT_QUERY, fetchAbout)
    queryCache.prefetchQuery(HELP_QUERY, fetchHelp)
  }, [])

  return (
    <>
      <OffCanvasNav />
      <TopBar />
      {!window.localStorage.hideWelcome && (
        <WelcomeDialog queryName={WELCOME_QUERY} />
      )}
      <Route path={routes.about}>
        <AboutPageView
          title="About"
          icon={<GoInfo />}
          queryName={ABOUT_QUERY}
        />
      </Route>
      <ResultsModal open={tableOpen} closeTable={closeTable} />
      <Route path={routes.help}>
        <AboutPageView
          title="Help"
          icon={<AiOutlineQuestionCircle />}
          queryName={HELP_QUERY}
        />
      </Route>
      <MapWrap>
        <MapPanel>
          <PanelIntro openTable={openTable} />
        </MapPanel>
      </MapWrap>
    </>
  )
}
