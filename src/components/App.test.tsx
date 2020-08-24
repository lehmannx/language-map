import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { ProvidersWrap, App } from 'components'

// TODO: figure out how to restore this without breaking the route tests. It
// looks like it freaks out because <Router> has two instances this way.
// eslint-disable-next-line jest/no-commented-out-tests
// test('App is in the DOM using legit initial map state', async () => {
//   const component = await render(<App />)
//   expect(component.container).toBeInTheDocument()
// })

// Hoist helper functions (but not vars) to reuse between test cases
const renderApp = () => (
  <ProvidersWrap>
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>
  </ProvidersWrap>
)

describe('Testing routes', () => {
  test('title element links to home', async () => {
    await render(renderApp())

    // TODO: get by heading somehow? Really just want <h1>
    const homeTitleLink = screen.getByText(/of new york city/i)
    const aboutPageBackdrop = screen.getByTestId('about-page-backdrop')

    // Starting from /about page should have a backdrop, at least in tests.
    // Couldn't figure out how to get the useEffect fetch to show the WP output,
    // but that was kinda shaky approach anyway since the title is not
    // guaranteed. Probably a better approach out there... TODO: learn how to
    // make ^^^this^^^ happen
    expect(aboutPageBackdrop).toBeInTheDocument()

    fireEvent.click(homeTitleLink)

    expect(aboutPageBackdrop).not.toBeInTheDocument()
  })
})
