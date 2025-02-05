// TODO: rename file and component to "BackBtn"
import React, { FC, useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { IconButton, Popover, Tooltip } from '@material-ui/core'
import { AiOutlineUnorderedList } from 'react-icons/ai'
import { BsArrow90DegUp } from 'react-icons/bs'

import { UI_EXPLORE_NAV_MENU, UI_UP_ONE_LEVEL } from 'components/config'
import { TimelineCrumbs } from './TimelineCrumbs'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      maxHeight: 350,
      minWidth: 200,
      overflowY: 'auto',
    },
  })
)

// TODO: use legit aria stuff
export const SplitCrumbs: FC = () => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const loc = useLocation<{ pathname: string }>()
  const { pathname = '/' } = loc

  // Cheap way to close the timeline on click
  useEffect(() => {
    handleClose()
  }, [pathname])

  const pathChunks = pathname.split('/').splice(1)
  const notHome = pathChunks.slice(1) // exclude Home
  const backLink = pathname.split('/').slice(0, -1).join('/') || '/'

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'show-explore-nav' : undefined

  return (
    <>
      <div>
        <Tooltip title={UI_UP_ONE_LEVEL}>
          <IconButton
            size="small"
            to={backLink}
            component={RouterLink}
            aria-label="up"
          >
            <BsArrow90DegUp />
          </IconButton>
        </Tooltip>
        <Tooltip title={UI_EXPLORE_NAV_MENU}>
          <IconButton
            aria-describedby={id}
            size="small"
            aria-label="explore nav"
            aria-haspopup="menu"
            onClick={handleClick}
          >
            <AiOutlineUnorderedList />
          </IconButton>
        </Tooltip>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{ className: classes.paper, elevation: 24 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <TimelineCrumbs pathChunks={notHome} />
        {/* TODO: UGGGGHHHH ^^^^^ */}
      </Popover>
    </>
  )
}
