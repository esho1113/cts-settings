import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dropzone,
  Flex,
  Form,
  Link,
  P,
  SettingsPage,
  Table,
  Typography,
  colors,
  useDropzone,
} from '@procore/core-react'
import { QuestionMark, Trash } from '@procore/core-icons'

export type PayrollSelectOption = { id: string; label: string }

export type PayrollTimeTypeRow = {
  id: string
  typeName: string
  abbreviation: string
  available: boolean
  /** help = question icon, remove = trash (custom row), none = empty cell */
  action: 'help' | 'remove' | 'none'
}

type PayrollTabContentProps = {
  timeTypeRows: PayrollTimeTypeRow[]
  onTimeTypeRowsChange: (rows: PayrollTimeTypeRow[]) => void
  payrollExportFiles: File[]
  onPayrollExportFilesChange: (files: File[]) => void
}

const getId = (o: PayrollSelectOption) => o.id
const getLabel = (o: PayrollSelectOption) => o.label

export const WORK_WEEK_OPTIONS: PayrollSelectOption[] = [
  { id: 'sun-sat', label: 'Sunday - Saturday' },
  { id: 'mon-sun', label: 'Monday - Sunday' },
  { id: 'tue-mon', label: 'Tuesday - Monday' },
  { id: 'wed-tue', label: 'Wednesday - Tuesday' },
]

export const PAY_PERIOD_OPTIONS: PayrollSelectOption[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'semi-monthly', label: 'Semi-monthly' },
  { id: 'monthly', label: 'Monthly' },
]

export const PAYROLL_EMAIL_OPTIONS: PayrollSelectOption[] = [
  { id: 'u1', label: 'testing-prod-hon...' },
  { id: 'u2', label: 'Aaron Kittle' },
  { id: 'u3', label: 'Clock In Clock out...' },
  { id: 'u4', label: 'De Ya' },
  { id: 'u5', label: 'Jo john' },
  { id: 'u6', label: 'Marc Duncan - 05...' },
  { id: 'u7', label: 'Pierre Pall - 876' },
  { id: 'u8', label: 'Silver Baja' },
  { id: 'u9', label: 'Theodore Anders' },
  { id: 'u10', label: 'Yuan Yao - yao@...' },
  { id: 'u11', label: 'Kory Admin' },
]

export const PAYROLL_SOFTWARE_OPTIONS: PayrollSelectOption[] = [
  {
    id: 'qb-desktop',
    label: 'QuickBooks® Desktop (2020 and later)',
  },
  { id: 'qb-online', label: 'QuickBooks® Online' },
  { id: 'sage', label: 'Sage' },
  { id: 'other', label: 'Other' },
]

export const INITIAL_PAYROLL_EMAIL_SELECTION: PayrollSelectOption[] = [
  ...PAYROLL_EMAIL_OPTIONS,
]

export const INITIAL_PAYROLL_TIME_TYPES: PayrollTimeTypeRow[] = [
  {
    id: 'tt-reg',
    typeName: 'Regular Time',
    abbreviation: 'REG',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-dou',
    typeName: 'Double Time',
    abbreviation: 'DOU',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-exe',
    typeName: 'Exempt',
    abbreviation: 'EXE',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-hol',
    typeName: 'Holiday',
    abbreviation: 'HOL',
    available: false,
    action: 'help',
  },
  {
    id: 'tt-ove',
    typeName: 'Overtime',
    abbreviation: 'OVE',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-pto',
    typeName: 'PTO',
    abbreviation: 'PTO',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-vac-1',
    typeName: 'Vacation',
    abbreviation: 'VAC',
    available: true,
    action: 'help',
  },
  {
    id: 'tt-vac-2',
    typeName: 'Vacation',
    abbreviation: 'VAC',
    available: false,
    action: 'remove',
  },
]

function PayrollExportDropzone({
  files,
  onFilesChange,
}: {
  files: File[]
  onFilesChange: (next: File[]) => void
}) {
  const dropzone = useDropzone({
    multiple: true,
    noClick: false,
    value: files,
    onDrop: (acceptedFiles) => {
      onFilesChange([...files, ...acceptedFiles])
    },
  })

  return <Dropzone {...dropzone} />
}

function TimeTypesTable({
  rows,
  onChange,
}: {
  rows: PayrollTimeTypeRow[]
  onChange: (rows: PayrollTimeTypeRow[]) => void
}) {
  const addRowId = useId()
  const [draftType, setDraftType] = useState('')
  const [draftAbbr, setDraftAbbr] = useState('')
  const [draftAvailable, setDraftAvailable] = useState(false)

  const setAvailable = useCallback(
    (id: string, available: boolean) => {
      onChange(rows.map((r) => (r.id === id ? { ...r, available } : r)))
    },
    [onChange, rows],
  )

  const removeRow = useCallback(
    (id: string) => {
      onChange(rows.filter((r) => r.id !== id))
    },
    [onChange, rows],
  )

  const addRowCellProps = {
    style: {
      verticalAlign: 'middle' as const,
    },
  }

  const addRow = useCallback(() => {
    const typeName = draftType.trim()
    const abbreviation = draftAbbr.trim().toUpperCase()
    if (!typeName || !abbreviation) {
      return
    }
    onChange([
      ...rows,
      {
        id: `tt-${Date.now()}`,
        typeName,
        abbreviation,
        available: draftAvailable,
        action: 'remove',
      },
    ])
    setDraftType('')
    setDraftAbbr('')
    setDraftAvailable(false)
  }, [draftAbbr, draftAvailable, draftType, onChange, rows])

  return (
    <Table.Container>
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Abbreviation</Table.HeaderCell>
            <Table.HeaderCell>Available</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.BodyRow key={row.id}>
              <Table.BodyCell>
                <Table.TextCell>{row.typeName}</Table.TextCell>
              </Table.BodyCell>
              <Table.BodyCell>
                <Table.TextCell>{row.abbreviation}</Table.TextCell>
              </Table.BodyCell>
              <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                <Flex alignItems="center" style={{ minHeight: 40 }}>
                  <Checkbox
                    checked={row.available}
                    onChange={() => setAvailable(row.id, !row.available)}
                    aria-label={`${row.typeName} available`}
                  />
                </Flex>
              </Table.BodyCell>
              <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                <Flex alignItems="center" style={{ minHeight: 40 }}>
                  {row.action === 'help' && (
                    <span
                      style={{ color: colors.gray50, display: 'inline-flex' }}
                      aria-label="More information"
                    >
                      <QuestionMark style={{ width: 20, height: 20 }} />
                    </span>
                  )}
                  {row.action === 'remove' && (
                    <Button
                      type="button"
                      variant="tertiary"
                      icon={<Trash />}
                      aria-label={`Remove ${row.typeName}`}
                      onClick={() => removeRow(row.id)}
                    />
                  )}
                </Flex>
              </Table.BodyCell>
            </Table.BodyRow>
          ))}
          <Table.BodyRow>
            <Table.BodyCell {...addRowCellProps}>
              <Table.InputCell
                id={`${addRowId}-type`}
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                placeholder="Type"
                aria-label="New time type name"
                size="block"
              />
            </Table.BodyCell>
            <Table.BodyCell {...addRowCellProps}>
              <Box style={{ width: 160 }}>
                <Table.InputCell
                  id={`${addRowId}-abbr`}
                  value={draftAbbr}
                  onChange={(e) => setDraftAbbr(e.target.value)}
                  placeholder="Abbreviation"
                  aria-label="New time type abbreviation"
                  size="block"
                />
              </Box>
            </Table.BodyCell>
            <Table.BodyCell {...addRowCellProps}>
              <Flex alignItems="center" style={{ minHeight: 40 }}>
                <Checkbox
                  checked={draftAvailable}
                  onChange={() => setDraftAvailable(!draftAvailable)}
                  aria-label="New row available"
                />
              </Flex>
            </Table.BodyCell>
            <Table.BodyCell {...addRowCellProps}>
              <Flex alignItems="center" style={{ minHeight: 40 }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addRow}
                  disabled={!draftType.trim() || !draftAbbr.trim()}
                >
                  Add
                </Button>
              </Flex>
            </Table.BodyCell>
          </Table.BodyRow>
        </Table.Body>
      </Table>
    </Table.Container>
  )
}

function PayrollSettingsSection() {
  return (
    <SettingsPage.Card id="payroll-settings" navigationLabel="Payroll settings">
      <SettingsPage.Section
        heading="Payroll Settings"
        subtext="Configure timekeeping to adhere to your company policies and payroll solution."
      >
        <Form.Row>
          <Form.Select
            name="payrollDefaultWorkWeek"
            label="Default Work Week"
            options={WORK_WEEK_OPTIONS}
            getId={getId}
            getLabel={getLabel}
            colStart={1}
            colWidth={4}
            onSearch={false}
          />
        </Form.Row>
        <Form.Row>
          <Form.Select
            name="payrollPayPeriodFrequency"
            label="Pay Period Frequency"
            options={PAY_PERIOD_OPTIONS}
            getId={getId}
            getLabel={getLabel}
            colStart={1}
            colWidth={4}
            onSearch={false}
          />
        </Form.Row>
        <Box marginTop="lg">
          <Form.MultiSelect
            name="payrollEmailDistribution"
            label="Email Distribution"
            description="Recipients for payroll-related notifications."
            options={PAYROLL_EMAIL_OPTIONS}
            getId={getId}
            getLabel={getLabel}
            block
            placeholder="Select users..."
          />
        </Box>
        <Box marginTop="lg">
          <Form.TextArea
            name="payrollLateSubmissionMessage"
            label="Custom Message for Late Time Submission"
            description="Customize the message that will be sent to employees when they submit timecards after the due date."
            resize="vertical"
            rows={4}
          />
        </Box>
      </SettingsPage.Section>
    </SettingsPage.Card>
  )
}

function ManageTimeTypesSection({
  timeTypeRows,
  onTimeTypeRowsChange,
}: Pick<PayrollTabContentProps, 'timeTypeRows' | 'onTimeTypeRowsChange'>) {
  return (
    <SettingsPage.Card
      id="payroll-manage-time-types"
      navigationLabel="Manage time types"
    >
      <SettingsPage.Section
        heading="Manage Time Types"
        subtext="Select which time types your workers can choose when logging their timesheets. You can also add more time types."
      >
        <TimeTypesTable rows={timeTypeRows} onChange={onTimeTypeRowsChange} />
      </SettingsPage.Section>
    </SettingsPage.Card>
  )
}

function PayrollExportSection({
  payrollExportFiles,
  onPayrollExportFilesChange,
  exportInstructions,
}: Pick<
  PayrollTabContentProps,
  'payrollExportFiles' | 'onPayrollExportFilesChange'
> & { exportInstructions: ReactNode }) {
  return (
    <SettingsPage.Card id="payroll-export" navigationLabel="Payroll export">
      <SettingsPage.Section heading="Payroll Export Settings">
        <Form.Row>
          <Form.Select
            name="payrollSoftware"
            label="Payroll Software"
            options={PAYROLL_SOFTWARE_OPTIONS}
            getId={getId}
            getLabel={getLabel}
            colStart={1}
            colWidth={4}
            onSearch={false}
          />
        </Form.Row>
        <Box marginTop="md">
          <Typography intent="label" weight="semibold" as="div">
            Instructions
          </Typography>
        </Box>
        {exportInstructions}
        <Box marginTop="lg">
          <PayrollExportDropzone
            files={payrollExportFiles}
            onFilesChange={onPayrollExportFilesChange}
          />
        </Box>
      </SettingsPage.Section>
    </SettingsPage.Card>
  )
}

export function PayrollTabContent({
  timeTypeRows,
  onTimeTypeRowsChange,
  payrollExportFiles,
  onPayrollExportFilesChange,
}: PayrollTabContentProps) {
  const exportInstructions = useMemo(
    () => (
      <>
        <Box id="payroll-export-step-1" marginTop="md" tabIndex={-1}>
          <P>
            <Link href="#payroll-export-step-1">
              Step 1: Export Time as an IIF file
            </Link>
            {' — '}
            download the file and import it into QuickBooks Desktop.
          </P>
        </Box>
        <Box id="payroll-export-step-2" marginTop="sm" tabIndex={-1}>
          <P>
            <Link href="#payroll-export-step-2">
              Step 2: Map the Time Types
            </Link>
            {' — '}
            align Procore time types with your QuickBooks payroll items.
          </P>
        </Box>
      </>
    ),
    [],
  )

  return (
    <>
      <PayrollSettingsSection />
      <ManageTimeTypesSection
        timeTypeRows={timeTypeRows}
        onTimeTypeRowsChange={onTimeTypeRowsChange}
      />
      <PayrollExportSection
        payrollExportFiles={payrollExportFiles}
        onPayrollExportFilesChange={onPayrollExportFilesChange}
        exportInstructions={exportInstructions}
      />
    </>
  )
}
