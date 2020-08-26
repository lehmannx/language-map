import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core'

// Always have a hard time finding the Typography variant docs for some reason:
// https://material-ui.com/components/typography/#component

const HEADING_FONT = "'Gentium Basic', Times, serif"
const headings = {
  h1: { fontFamily: HEADING_FONT },
  h2: { fontFamily: HEADING_FONT },
  h3: { fontFamily: HEADING_FONT },
  h4: { fontFamily: HEADING_FONT },
  h5: { fontFamily: HEADING_FONT },
  h6: { fontFamily: HEADING_FONT },
}

// BREAKPOINTS: material-ui.com/customization/breakpoints/#default-breakpoints
// xs, extra-small: 0px
// sm, small: 600px
// md, medium: 960px
// lg, large: 1280px
// xl, extra-large: 1920px

// Easy access to theme properties when used in `createMuiTheme` overrides
// CRED: https://stackoverflow.com/a/57127040/1048518
const customTheme = createMuiTheme({
  palette: {
    primary: {
      light: '#66ab9d',
      main: '#409685',
      dark: '#2c695d',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ab6673',
      main: '#964051',
      dark: '#692c38',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 16,
    ...headings,
  },
})

// Global overrides of MUI components that need to be re-styled often. More
// examples available at:
// https://github.com/Covid-Self-report-Tool/cov-self-report-frontend/blob/4523287b5c2a4f0dea1fe918b985aa6b6ca1efc6/src/theme.ts

// Global overrides of MUI components that need to be re-styled often
customTheme.overrides = {
  MuiInput: {
    root: {
      fontSize: customTheme.typography.body2.fontSize,
    },
  },
  MuiDialog: {
    // Outside boundary of all dialogs
    paper: {
      margin: 12,
    },
  },
}

export const GlobalCss = withStyles({
  // @global is handled by jss-plugin-global.
  '@global': {
    body: {
      margin: 0,
    },
    p: {
      fontSize: customTheme.typography.fontSize,
    },
    '.simpler-font': {
      fontFamily: "'Roboto', sans-serif",
    },
    'a:not([role="button"]), .obvious-link': {
      color: customTheme.palette.info.main,
      textDecoration: 'none',
    },
  },
})(() => null)

export const theme = responsiveFontSizes(customTheme)
