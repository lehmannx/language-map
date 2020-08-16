import React, { FC, useContext } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Link, Typography, Divider } from '@material-ui/core'

import { GlobalContext, LoadingIndicator, PanelIntro } from 'components'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    intro: {
      textAlign: 'center',
      paddingBottom: theme.spacing(1),
    },
    subheading: {
      marginBottom: theme.spacing(1),
    },
    description: {
      marginTop: theme.spacing(1),
      fontSize: theme.typography.caption.fontSize,
    },
  })
)

export const DetailsPanel: FC = () => {
  const history = useHistory()
  const getLocation = useLocation() // must exist for routing to work?
  const classes = useStyles()
  const { state } = useContext(GlobalContext)

  // Shaky check to see if features have loaded and are stored globally
  // TODO: use MB's loading events to set this instead
  if (!state.langFeaturesCached.length) {
    return <LoadingIndicator />
  }

  const { selFeatAttribs } = state

  // No sel feat details
  if (!selFeatAttribs) {
    return (
      <PanelIntro>
        Click a language community in the map or the{' '}
        <b>MAKE DATA MODAL LINKABLE</b> to learn more.
      </PanelIntro>
    )
  }

  // TODO: deal with `id` present in URL but no match found
  // const parsed = queryString.parse(window.location.search)
  // const matchingRecord = state.langFeatures.find(
  //   (feature) => feature.ID === parsed.id
  // )

  return (
    <>
      <Typography
        href="javascript;"
        variant="caption"
        component={Link}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          history.push(`/${getLocation.search}`)
        }}
      >
        {`<`} Back to results
      </Typography>
      <div className={classes.intro}>
        <Typography component="h3" variant="h4">
          {selFeatAttribs.Endonym}
        </Typography>
        {selFeatAttribs.Endonym !== selFeatAttribs.Language && (
          <Typography variant="caption" className={classes.subheading}>
            {`(${selFeatAttribs.Language})`}
          </Typography>
        )}
        {selFeatAttribs.Neighborhoods && (
          <small>
            <i>{selFeatAttribs.Neighborhoods.split(', ')[0]}</i>
          </small>
        )}
      </div>
      <Divider />
      <Typography variant="body2" className={classes.description}>
        {selFeatAttribs.Description}
      </Typography>
    </>
  )
}
