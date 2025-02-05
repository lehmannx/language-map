import React, { FC } from 'react'
import { useParams, Route } from 'react-router-dom'

import {
  //  FlagFromHook,
  ColoredCircle,
} from 'components/generic/icons-and-swatches'
import { BasicExploreIntro } from 'components/panels'
import { LoadingIndicator } from 'components/generic/modals'
import { CardList } from './CardList'
import { useAirtable } from './hooks'
import { prepFormula, prepFields } from './utils'
import { TonsWithAddl, MidLevelExploreProps, RouteMatch } from './types'
import { LayerToggle } from './LayerToggle'

export const MidLevelExplore: FC<MidLevelExploreProps> = (props) => {
  const { field, value } = useParams<RouteMatch & { value: string }>()
  const { tableName = field, sortByField = 'name' } = props
  const filterByFormula = prepFormula(field, value)
  const fields = prepFields(tableName, field)

  const { data, error, isLoading } = useAirtable<TonsWithAddl>(tableName, {
    fields,
    ...(filterByFormula && { filterByFormula }),
    sort: [{ field: sortByField }],
  })

  if (error)
    return (
      <>
        Could not load {value}. {error?.message}
      </>
    )

  let primaryData
  let Icon = null // TODO: re-componentize

  if (field === 'World Region') {
    Icon = <ColoredCircle color={data[0]?.worldRegionColor || 'transparent'} />
  } // else if (field === 'Country') Icon = <FlagFromHook value={value} />

  // Gross extra steps for Airtable FIND issue, which returns in ARRAYJOIN
  // things like "Dominican Republic" in a "Dominica" query:
  if (data.length && Array.isArray(data[0][field]))
    primaryData = data.filter((row) => row[field]?.includes(value))
  else primaryData = data

  return (
    <>
      <BasicExploreIntro
        title={value}
        expand={!isLoading}
        noAppear={!isLoading}
        icon={Icon}
        extree={
          <Route path="/karte/Explore/County">
            <LayerToggle layerID="counties" />
          </Route>
        }
      />
      {(isLoading && <LoadingIndicator omitText />) || (
        <CardList data={primaryData} />
      )}
    </>
  )
}
