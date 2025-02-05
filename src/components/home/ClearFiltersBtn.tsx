import React, { FC } from 'react'
import { Button } from '@material-ui/core'
import { IoMdCloseCircle } from 'react-icons/io'
import { UI_CLEAR_FILTERS } from 'components/config'

type ClearFiltersComponent = {
  onClick: () => void
  enabled?: boolean
}

export const ClearFiltersBtn: FC<ClearFiltersComponent> = (props) => {
  const { onClick, enabled } = props

  return (
    <Button
      color="primary"
      size="small"
      startIcon={<IoMdCloseCircle />}
      variant="outlined"
      onClick={onClick}
      disabled={!enabled}
    >
      {UI_CLEAR_FILTERS}
    </Button>
  )
}
