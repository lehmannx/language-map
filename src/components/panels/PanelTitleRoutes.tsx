import React, { FC } from 'react'
import { Route, Switch, Link as RouterLink } from 'react-router-dom'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { IconButton, Typography, Tooltip } from '@material-ui/core'

import { icons } from 'components/config'
import { routes } from 'components/config/api'
import { pluralize } from 'components/explore/utils'

type PanelTitleProps = {
  text: string
  icon?: React.ReactNode
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      display: 'flex',
      '& > svg': {
        color: theme.palette.text.hint,
        marginRight: 6,
      },
    },
    panelTitleText: {
      fontSize: '1.5rem',
      [theme.breakpoints.only('xs')]: {
        fontSize: '1.25rem',
      },
    },
    rightSideBtns: {
      '& > * + *': {
        marginLeft: 4,
      },
    },
  })
)

const PanelTitle: FC<PanelTitleProps> = (props) => {
  const { text, icon } = props
  const classes = useStyles({})

  return (
    <div className={classes.root}>
      {icon}
      <Typography
        variant="h6"
        component="h2"
        className={classes.panelTitleText}
      >
        {text}
      </Typography>
    </div>
  )
}

const LinkToHomeBtn: FC = (props) => {
  return (
    <Tooltip title="Search & Display Options">
      <IconButton
        size="small"
        aria-label="go home"
        color="inherit"
        to="/"
        component={RouterLink}
      >
        {icons.HomeLink}
      </IconButton>
    </Tooltip>
  )
}

export const PanelTitleRoutes: FC<{ panelTitle: string }> = (props) => {
  const { panelTitle } = props

  // TODO: add small logo to left side of bar
  return (
    <Switch>
      <Route path="/" exact>
        {/* Flex spacer */}
        <div />
        <PanelTitle text="Search and Display Sites" icon={icons.Home} />
      </Route>
      <Route path={routes.none}>
        <PanelTitle text="No site selected" />
      </Route>
      <Route path={routes.data}>
        <PanelTitle text=" " />
      </Route>
      <Route
        path={['/Explore/:field/:value/:language/:id', routes.details]}
        exact
      >
        <PanelTitle text="Site Details" icon={icons.SiteDetails} />
      </Route>
      <Route
        path={['/Explore/:field/:value/:language', routes.languageInstance]}
        exact
      >
        <PanelTitle text="Language" icon={icons.Language} />
      </Route>
      <Route path="/Explore/:field" exact>
        <PanelTitle text={pluralize(panelTitle)} icon={icons[panelTitle]} />
      </Route>
      <Route path="/Explore/:field/:value" exact>
        <PanelTitle text={panelTitle} icon={icons[panelTitle]} />
      </Route>
      <Route path="/Census">
        {/* Census just needs panel heading override */}
        <LinkToHomeBtn />
        <PanelTitle text="Census Language Data" icon={icons[panelTitle]} />
      </Route>
      <Route path="/:level1" exact>
        {/* Home btn on /TopLevelRoutes looks balanced on left */}
        <LinkToHomeBtn />
        <PanelTitle text={panelTitle} icon={icons[panelTitle]} />
      </Route>
    </Switch>
  )
}
