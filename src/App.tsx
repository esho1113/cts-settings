import { Box, Flex } from '@procore/core-react'
import { CompanyTimesheetsSettingsPage } from './CompanyTimesheetsSettingsPage'
import { GlobalNav } from './GlobalNav'

export default function App() {
  return (
    <Flex
      direction="column"
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <GlobalNav toolLabel="Timesheets" />
      <Box
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CompanyTimesheetsSettingsPage />
      </Box>
    </Flex>
  )
}
