/* eslint-disable react/display-name */
import React from 'react'
import { Icons, Localization } from 'material-table'
import { FaFilter } from 'react-icons/fa'
import {
  MdArrowUpward,
  MdCheck,
  MdChevronLeft,
  MdChevronRight,
  MdClear,
  MdFileDownload,
  MdFirstPage,
  MdLastPage,
  MdSearch,
  MdViewColumn,
  MdRemove,
} from 'react-icons/md'

import { Statuses } from 'components/context/types'

import {
  UI_ADDL_NEIGHBORHOODS,
  UI_AUDIO,
  UI_COUNTY,
  UI_DOWNLOAD_AS_CSV,
  UI_DOWNLOAD_AS_PDF,
  UI_GLOBAL_SPEAKERS,
  UI_LANGUAGE,
  UI_LANGUAGE_FAMILY,
  UI_LOCATION,
  UI_NO_COMMUNITIES_FOUND,
  UI_SEARCH,
  UI_SIZE,
  UI_STATUS,
  UI_VIDEO,
  UI_WORLD_REGION,
} from 'components/config'
import * as Types from './types'
import * as utils from './utils'
import * as Cells from './Cells'

import { MediaColumnFilter } from './MediaColumnFilter'
import { LocalColumnTitle } from './LocalColumnTitle'

const COMM_STATUS_LOOKUP = {
  Community: 'Community',
  Historical: 'Historical',
  Liturgical: 'Liturgical',
  Residential: 'Residential',
  Reviving: 'Reviving',
} as {
  [key in Statuses]: Statuses
}

// TODO: pass this as fn arg instead of importing in export util
export const tableExportMeta = {
  pageTitle: 'Languages of Berlin',
  filename: 'nyc-language-data',
  fullDatasetURL: 'https://airtable.com/shrqQo5FJHvhKtffs',
}

// TODO: Enum??
const SIZE_MAP = {
  Smallest: 1,
  Small: 2,
  Medium: 3,
  Large: 4,
  Largest: 5,
}

const COMM_SIZES = {
  Smallest: 'Smallest',
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large',
  Largest: 'Largest',
}

export const localization: Localization = {
  body: {
    emptyDataSourceMessage: UI_NO_COMMUNITIES_FOUND,
  },
  header: {
    actions: '',
  },
  toolbar: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore // in newer version of material-table, which has laggy bug...
    exportCSVName: UI_DOWNLOAD_AS_CSV,
    exportPDFName: UI_DOWNLOAD_AS_PDF,
    searchPlaceholder: UI_SEARCH,
  },
}

// Table options for the <MaterialTable> component
export const options = {
  columnsButton: true,
  doubleHorizontalScroll: false,
  draggable: true, // kinda clunky
  exportAllData: true, // misleading, it actually exports all FILTERED data
  exportButton: true, // enable it in the toolbar
  filtering: true,
  grouping: false, // kinda clunky
  isLoading: true,
  maxBodyHeight: '100%',
  minBodyHeight: '100%',
  pageSize: 20,
  pageSizeOptions: [10, 20, 50],
  searchFieldAlignment: 'left',
  showTitle: false,
  thirdSortClick: false,
  // TODO: rm unused, or keep for reference
  // actionsCellStyle: {}, // semi-useful but ended up with `!important` anyway
  // actionsColumnIndex: 0,
  // fixedColumns: { left: 2, right: 0 }, // awful in so many ways
  // headerStyle: { position: 'sticky', top: 0 },
  // filterCellStyle: { backgroundColor: 'yellow' }, // works
  // filterRowStyle: { backgroundColor: 'red' }, // works, but sticky 2 tricky!
  // padding: 'dense', // dense leads to choppier inconsistent row height
  // rowStyle: { backgroundColor: 'turquoise' }, // works
  // searchFieldVariant: 'outlined', // meh, too big
  // searchFieldStyle: {}, // the actual text inside search box
  // tableLayout: 'fixed', // can set widths, but `fixed` = for bad Actions col
} as Types.TableOptions

export const icons = {
  Check: MdCheck,
  DetailPanel: MdChevronRight,
  Export: MdFileDownload,
  Filter: FaFilter,
  FirstPage: MdFirstPage,
  LastPage: MdLastPage,
  NextPage: MdChevronRight,
  PreviousPage: MdChevronLeft,
  ResetSearch: MdClear,
  Search: MdSearch,
  SortArrow: MdArrowUpward,
  ThirdStateCheck: MdRemove,
  ViewColumn: MdViewColumn,
} as Icons

const commonColProps = {
  editable: 'never',
  searchable: true,
  // cellStyle: {},
}

const hiddenCols = [
  {
    title: 'Glottocode',
    field: 'Glottocode',
    ...commonColProps,
    hidden: true,
  },
  {
    title: 'ISO 639-3',
    field: 'ISO 639-3',
    ...commonColProps,
    hidden: true,
  },
  {
    title: UI_ADDL_NEIGHBORHOODS,
    field: 'Additional Neighborhoods',
    ...commonColProps,
    hidden: true,
  },
]

// NOTE: did not want to attempt to deal with any of the multi-option cols like
// Size or Status in terms of filter-col-via-cell-click behavior, or the
// boolean-ish Video column. Wishlist...

// First and second column values are just buttons
const stickyColStyle = {
  position: 'sticky',
  zIndex: 250,
  backgroundColor: '#424242', // "paper" BG. Can't access theme from here 😞
}

const firstColStyle = {
  ...stickyColStyle,
  left: 0,
}

const secondColStyle = {
  ...stickyColStyle,
  left: 42,
  paddingLeft: 0,
  boxShadow: '5px 0px 8px 0px rgba(0,0,0,0.08)',
}

// "View in map" and details modal can't use `hidden`, but without a title they
// show up as blanks in the column toggle/reorder menu. Handy workaround.
const hidden = {
  color: 'transparent',
  fontSize: 0,
}

// 25px : 200char = decent ratio
export const columns = [
  {
    title: 'View in map',
    field: 'id',
    ...commonColProps,
    filtering: false,
    export: false,
    render: utils.renderIDcolumn,
    cellStyle: firstColStyle,
    headerStyle: { ...firstColStyle, ...hidden },
    filterCellStyle: firstColStyle,
  },
  {
    // It's not actully county, just a sneaky way to allow county/borough search
    // AND a "view details modal" icon. Two birds, one stone.
    title: UI_COUNTY,
    field: 'County',
    ...commonColProps,
    sorting: false,
    filtering: false,
    export: false,
    render: utils.renderDescripCol,
    cellStyle: secondColStyle,
    headerStyle: { ...firstColStyle, ...hidden },
    filterCellStyle: secondColStyle,
  },
  {
    // Average: 9.3, Longest: 31
    title: UI_LANGUAGE,
    field: 'Language',
    ...commonColProps,
    defaultSort: 'asc',
    cellStyle: { paddingLeft: '1.25rem' }, // give room to 2nd col shadow
    headerStyle: { paddingLeft: '1.25rem' }, // give room to 2nd col shadow
    filterCellStyle: { paddingLeft: '1.25rem' }, // give room to 2nd col shadow
  },
  {
    // Average: 8.5, Longest: 26, Longest full: Anashinaabemowin
    title: 'Endonym',
    field: 'Endonym',
    ...commonColProps,
    render: utils.renderEndoColumn,
  },
  {
    // Average: 13, Longest: 25 (thanks AUS & NZ...)
    title: UI_WORLD_REGION,
    field: 'World Region',
    ...commonColProps,
    // TODO: instead of open-search filters, custom `filterComponent` with this:
    // https://material-ui.com/components/autocomplete/#checkboxes
    render: (data) => <Cells.WorldRegion data={data} />,
    headerStyle: {
      paddingRight: 25, // enough for `Southeastern Asia` cells to not wrap
      whiteSpace: 'nowrap',
    },
  },
  // {
  //  // Average: 8.5, Longest: 35 (w/o big Congos: Average: 8, Longest: 24)
  //  // ...plus emoji flag and margin
  //  // TODO: for Country selection:
  //  // https://material-ui.com/components/autocomplete/#country-select
  //  title: 'Country',
  //  field: 'Country',
  //  ...commonColProps,
  //  render: utils.renderCountryColumn,
  //  headerStyle: {
  //    paddingRight: 30, // enough for `South Africa` cells to not wrap
  //  },
  // },
  {
    // Longest: 20
    title: UI_GLOBAL_SPEAKERS, // the only abbrev so far
    field: 'Global Speaker Total',
    ...commonColProps,
    // customSort: utils.sortNeighbs, // TODO: blanks last
    render: (data) => <Cells.GlobalSpeakers data={data} />,
    searchable: false,
    filtering: false,
    disableClick: true,
    type: 'numeric',
    // Right-aligned number w/left-aligned column heading was requested
    headerStyle: {
      whiteSpace: 'nowrap',
      paddingRight: 0,
      flexDirection: 'row',
    },
  },
  {
    // Average: 10, Longest: 23 but preserve hyphenated Athabaskan-Eyak-Tlingit
    title: UI_LANGUAGE_FAMILY,
    field: 'Language Family',
    ...commonColProps,
    headerStyle: { whiteSpace: 'nowrap' },
  },
  {
    title: UI_VIDEO,
    field: 'Video',
    ...commonColProps,
    export: false,
    filterComponent: MediaColumnFilter,
    headerStyle: { whiteSpace: 'nowrap' },
    render: (data) => <Cells.MediaColumnCell data={data} columnName="Video" />,
    searchable: false,
    disableClick: true,
  },
  {
    title: UI_AUDIO,
    field: 'Audio',
    ...commonColProps,
    export: false,
    filterComponent: MediaColumnFilter,
    headerStyle: { whiteSpace: 'nowrap' },
    render: (data) => <Cells.MediaColumnCell data={data} columnName="Audio" />,
    searchable: false,
    disableClick: true,
  },
  {
    // Average: 12, Longest: 26
    title: <LocalColumnTitle text={UI_LOCATION} />,
    field: 'Primary Location',
    ...commonColProps,
  },
  {
    // Longest: 14
    title: <LocalColumnTitle text={UI_SIZE} />,
    field: 'Size',
    ...commonColProps,
    align: 'left',
    lookup: COMM_SIZES,
    customSort: (a, b) => {
      if (SIZE_MAP[a.Size] === SIZE_MAP[b.Size]) return 0
      if (SIZE_MAP[a.Size] > SIZE_MAP[b.Size]) return 1

      return -1
    },
    render: (data) => <Cells.CommSize data={data} />,
    searchable: false,
    headerStyle: {
      paddingRight: 25, // "Smallest" is ironically the longest
    },
  },
  {
    title: <LocalColumnTitle text={UI_STATUS} />,
    field: 'Status',
    ...commonColProps,
    searchable: false,
    render: (data) => <Cells.CommStatus data={data} />,
    lookup: COMM_STATUS_LOOKUP,
  },
  ...hiddenCols,
] as Types.ColumnsConfig[]
