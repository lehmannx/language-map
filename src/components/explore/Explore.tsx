import React, { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@material-ui/core'

import { PanelContent } from 'components/panels'
import { LoadingIndicatorBar } from 'components/generic/modals'
import { DetailsSchema } from 'components/context/types'
import { CustomCard } from './CustomCard'
import { CardList } from './CardList'
import { useAirtable } from './hooks'

import * as config from './config'

// The top-level "/Explore" route as a landing page index to explorable fields
export const Explore: FC<{ icon: React.ReactNode }> = (props) => {
  const { icon } = props
  const { data, error, isLoading } = useAirtable('Schema', {
    filterByFormula: '{exploreSortOrder} > 0', // cheap check for Explore-ables
    sort: [{ field: 'exploreSortOrder' }],
  })
  // TODO: adapt or remove if not using
  // utils.pluralTextIfNeeded(uniqueInstances.length),

  const intro = (
    <>
      For an explanation of the options below, visit the{' '}
      <Link component={RouterLink} to="/help">
        Help page
      </Link>{' '}
      for definitions and additional info. You can also view and filter all
      language communities in the{' '}
      <Link component={RouterLink} to="/table">
        Data table
      </Link>{' '}
      as well.
    </>
  )

  return (
    <PanelContent title="Explore" icon={icon} introParagraph={intro}>
      {isLoading && <LoadingIndicatorBar omitText />}
      {error && 'Could not load'}
      <CardList>
        {data.map((category) => (
          <CustomCard
            key={category.name}
            icon={
              config.exploreIcons[
                category.name as keyof Partial<DetailsSchema>
              ] || null
            }
            title={category.plural || ''} // TODO: ugh
            url={`/Explore/${category.name}`}
            footer={category.definition}
          />
        ))}
      </CardList>
    </PanelContent>
  )
}
