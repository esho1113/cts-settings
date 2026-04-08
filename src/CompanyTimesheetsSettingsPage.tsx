import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  AttestationsSection,
  INITIAL_ATTESTATION_QUESTIONS,
} from './AttestationsSection'
import {
  INITIAL_OVERTIME_PROJECT_RULES,
  OvertimeTabContent,
  type OvertimeProjectRuleRow,
} from './OvertimeTabContent'
import {
  INITIAL_PAYROLL_EMAIL_SELECTION,
  INITIAL_PAYROLL_TIME_TYPES,
  PAY_PERIOD_OPTIONS,
  PAYROLL_SOFTWARE_OPTIONS,
  PayrollTabContent,
  WORK_WEEK_OPTIONS,
  type PayrollTimeTypeRow,
} from './PayrollTabContent'
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Flex,
  Form,
  H1,
  Link,
  P,
  Pill,
  SettingsPage,
  Switch,
  Table,
  Tabs,
  Title,
  Typography,
  useField,
  useFormContext,
} from '@procore/core-react'
type SelectOption = { id: string; label: string }

const TIME_INCREMENT_OPTIONS: SelectOption[] = [
  { id: '6', label: '6 min' },
  { id: '15', label: '15 min' },
  { id: '30', label: '30 min' },
]

const ROUNDING_DIRECTION_OPTIONS: SelectOption[] = [
  { id: 'up', label: 'Up' },
  { id: 'down', label: 'Down' },
  { id: 'nearest', label: 'Nearest' },
]

const COST_TYPE_OPTIONS: SelectOption[] = [
  { id: 'labor', label: 'Labor' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'service', label: 'Service' },
  { id: 'tm-labor', label: 'T&M Labor' },
  { id: 'commitment', label: 'Commitment' },
  { id: 'owner-cost', label: 'Owner Cost' },
  { id: 'professional-services', label: 'Professional Services' },
]

export type TimesheetsSettingsFormValues = {
  trackEmployeesOnAllProjects: boolean
  allowCrewsCopiedAcrossProjects: boolean
  privateTimecardsByDefault: boolean
  enableRounding: boolean
  timeIncrement: SelectOption | null
  roundingDirection: SelectOption | null
  defaultCostTypeLabor: SelectOption | null
  defaultCostTypeEquipment: SelectOption | null
  applyLaborCostToExisting: boolean
  applyEquipmentCostToExisting: boolean
  enableSignatureOnTimeEntries: boolean
  requireSignatureOnTimeEntries: boolean
  requireEmployeeAcknowledgementWhenSigning: boolean
  customSignatureText: string
  payrollDefaultWorkWeek: SelectOption | null
  payrollPayPeriodFrequency: SelectOption | null
  payrollEmailDistribution: SelectOption[]
  payrollLateSubmissionMessage: string
  payrollSoftware: SelectOption | null
  enableOvertimeManagement: boolean
  overtimeAutoApplyWhenCreating: boolean
  overtimeExcludeCustomFieldsFromSplitting: boolean
}

const defaultInitialValues: TimesheetsSettingsFormValues = {
  trackEmployeesOnAllProjects: false,
  allowCrewsCopiedAcrossProjects: true,
  privateTimecardsByDefault: false,
  enableRounding: true,
  timeIncrement: TIME_INCREMENT_OPTIONS[0],
  roundingDirection: ROUNDING_DIRECTION_OPTIONS[0],
  defaultCostTypeLabor: COST_TYPE_OPTIONS[0],
  defaultCostTypeEquipment: COST_TYPE_OPTIONS[1],
  applyLaborCostToExisting: false,
  applyEquipmentCostToExisting: false,
  enableSignatureOnTimeEntries: false,
  requireSignatureOnTimeEntries: false,
  requireEmployeeAcknowledgementWhenSigning: false,
  customSignatureText: '',
  payrollDefaultWorkWeek:
    WORK_WEEK_OPTIONS.find((o) => o.id === 'tue-mon') ?? null,
  payrollPayPeriodFrequency:
    PAY_PERIOD_OPTIONS.find((o) => o.id === 'weekly') ?? null,
  payrollEmailDistribution: INITIAL_PAYROLL_EMAIL_SELECTION,
  payrollLateSubmissionMessage:
    'You are trying to create time in a closed pay period, you better not do that unless you wanna be a bad bad construction worker',
  payrollSoftware:
    PAYROLL_SOFTWARE_OPTIONS.find((o) => o.id === 'qb-desktop') ?? null,
  enableOvertimeManagement: true,
  overtimeAutoApplyWhenCreating: true,
  overtimeExcludeCustomFieldsFromSplitting: false,
}

type CostTypeRow = {
  id: string
  label: string
  abbreviation: string
  laborChecked: boolean
  equipmentChecked: boolean
  laborDefault: boolean
  equipmentDefault: boolean
  defaultCostTypeLabel: string
}

const initialCostTypeRows: CostTypeRow[] = [
  {
    id: '1',
    label: 'Service',
    abbreviation: 'SERV',
    laborChecked: true,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'Service',
  },
  {
    id: '2',
    label: 'T&M Labor',
    abbreviation: 'T&M',
    laborChecked: true,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'T&M Labor',
  },
  {
    id: '3',
    label: 'New Cost Type',
    abbreviation: 'NEW',
    laborChecked: false,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'New Cost Type',
  },
  {
    id: '4',
    label: 'Labor',
    abbreviation: 'LAB',
    laborChecked: true,
    equipmentChecked: false,
    laborDefault: true,
    equipmentDefault: false,
    defaultCostTypeLabel: 'Labor',
  },
  {
    id: '5',
    label: 'Equipment',
    abbreviation: 'EQ',
    laborChecked: false,
    equipmentChecked: true,
    laborDefault: false,
    equipmentDefault: true,
    defaultCostTypeLabel: 'Equipment',
  },
  {
    id: '6',
    label: 'Commitment',
    abbreviation: 'COM',
    laborChecked: false,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'Commitment',
  },
  {
    id: '7',
    label: 'Owner Cost',
    abbreviation: 'OWN',
    laborChecked: false,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'Owner Cost',
  },
  {
    id: '8',
    label: 'Professional Services',
    abbreviation: 'PRO',
    laborChecked: false,
    equipmentChecked: false,
    laborDefault: false,
    equipmentDefault: false,
    defaultCostTypeLabel: 'Professional Services',
  },
]

const getId = (o: SelectOption) => o.id
const getLabel = (o: SelectOption) => o.label

function TimesheetsSettingsFooter({ onCancel }: { onCancel: () => void }) {
  const { resetForm } = useFormContext<TimesheetsSettingsFormValues>()
  return (
    <Form.SettingsPageFooter>
      <SettingsPage.FooterActions>
        <Button
          variant="tertiary"
          type="button"
          onClick={() => {
            resetForm()
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </SettingsPage.FooterActions>
    </Form.SettingsPageFooter>
  )
}

type SignatureToggleName =
  | 'enableSignatureOnTimeEntries'
  | 'requireSignatureOnTimeEntries'
  | 'requireEmployeeAcknowledgementWhenSigning'

function SignatureSettingsToggleRow({
  name,
  label,
  description,
}: {
  name: SignatureToggleName
  label: string
  description: string
}) {
  const { input, meta, helpers } = useField<boolean>({ name })
  const id = `signature-setting-${name}`
  return (
    <Flex alignItems="flex-start" gap="md" marginBottom="lg">
      <Box flexShrink={0} marginTop="xs">
        <Switch
          id={id}
          name={name}
          checked={Boolean(input.value)}
          onChange={(e) => helpers.setValue(e.currentTarget.checked)}
          disabled={meta.disabled}
          aria-labelledby={`${id}-label`}
        />
      </Box>
      <Box flex={1} style={{ minWidth: 0 }}>
        <Typography
          id={`${id}-label`}
          intent="label"
          weight="semibold"
          as="div"
        >
          {label}
        </Typography>
        <Box marginTop="xs">
          <Typography intent="body" color="gray40" as="div">
            {description}
          </Typography>
        </Box>
      </Box>
    </Flex>
  )
}

function SignatureSettingsFields() {
  const { values } = useFormContext<TimesheetsSettingsFormValues>()
  return (
    <>
      <SignatureSettingsToggleRow
        name="enableSignatureOnTimeEntries"
        label="Enable signature on time entries"
        description="Turn on signature-related options for time entries."
      />
      {values.enableSignatureOnTimeEntries && (
        <Box marginTop="lg" paddingTop="lg">
          <SignatureSettingsToggleRow
            name="requireSignatureOnTimeEntries"
            label="Require Signature on Time Entries"
            description="Employees will not be able to submit their time entry without signing their time entry."
          />
          <SignatureSettingsToggleRow
            name="requireEmployeeAcknowledgementWhenSigning"
            label="Require employee acknowledgement when signing time entries"
            description="Employees who sign time entries created by others must certify that they are signing for their own time."
          />
          <Box marginBottom="lg">
            <Form.TextArea
              name="customSignatureText"
              label="Custom Signature Text"
              description="Show employees a custom message when signing a time entry."
              resize="vertical"
              rows={6}
            />
          </Box>
        </Box>
      )}
    </>
  )
}

function RoundingSelectRow() {
  const { values } = useFormContext<TimesheetsSettingsFormValues>()
  if (!values.enableRounding) {
    return null
  }
  return (
    <Form.Row>
      <Form.Select
        name="timeIncrement"
        label="Time increment"
        options={TIME_INCREMENT_OPTIONS}
        getId={getId}
        getLabel={getLabel}
        colStart={1}
        colWidth={3}
        placeholder="Select increment"
        onSearch={false}
      />
      <Form.Select
        name="roundingDirection"
        label="Rounding direction"
        options={ROUNDING_DIRECTION_OPTIONS}
        getId={getId}
        getLabel={getLabel}
        colStart={4}
        colWidth={3}
        placeholder="Select direction"
        onSearch={false}
        tooltip="Time entries will be rounded in this direction to the selected increment. Ensure this complies with applicable laws and regulations."
      />
    </Form.Row>
  )
}

function CostTypeMatrixTable({
  rows,
  onToggle,
}: {
  rows: CostTypeRow[]
  onToggle: (
    id: string,
    field: 'laborChecked' | 'equipmentChecked',
    next: boolean,
  ) => void
}) {
  return (
    <Table.Container>
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell>Label</Table.HeaderCell>
            <Table.HeaderCell>Abbreviation</Table.HeaderCell>
            <Table.HeaderCell>Labor</Table.HeaderCell>
            <Table.HeaderCell>Equipment</Table.HeaderCell>
            <Table.HeaderCell>Default Cost Types</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.BodyRow key={row.id}>
              <Table.BodyCell>
                <Table.TextCell>{row.label}</Table.TextCell>
              </Table.BodyCell>
              <Table.BodyCell>
                <Table.TextCell>{row.abbreviation}</Table.TextCell>
              </Table.BodyCell>
              <Table.BodyCell>
                {row.laborDefault ? (
                  <Typography intent="label" color="gray40">
                    DEFAULT
                  </Typography>
                ) : (
                  <Checkbox
                    checked={row.laborChecked}
                    onChange={() =>
                      onToggle(row.id, 'laborChecked', !row.laborChecked)
                    }
                    aria-label={`${row.label} available for labor`}
                  />
                )}
              </Table.BodyCell>
              <Table.BodyCell>
                {row.equipmentDefault ? (
                  <Typography intent="label" color="gray40">
                    DEFAULT
                  </Typography>
                ) : (
                  <Checkbox
                    checked={row.equipmentChecked}
                    onChange={() =>
                      onToggle(row.id, 'equipmentChecked', !row.equipmentChecked)
                    }
                    aria-label={`${row.label} available for equipment`}
                  />
                )}
              </Table.BodyCell>
              <Table.BodyCell>
                <Table.TextCell>{row.defaultCostTypeLabel}</Table.TextCell>
              </Table.BodyCell>
            </Table.BodyRow>
          ))}
        </Table.Body>
      </Table>
    </Table.Container>
  )
}

type TimesheetsSettingsTab =
  | 'shared'
  | 'configurations'
  | 'payroll'
  | 'overtime'

/**
 * Reset scroll so tab switches show the top of the tab content.
 * Matches index.css: with side nav, nav + content columns scroll separately;
 * without side nav (Configurations / Overtime), the body row itself scrolls.
 */
function scrollSettingsPageScrollContainersToTop() {
  const page = document.querySelector<HTMLElement>(
    '[data-core-react="settings-page"]',
  )
  if (!page) return

  const root = page.querySelector<HTMLElement>('[data-core-page-layout-root]')
  if (!root) return

  const bodyRow = root.children[1] as HTMLElement | undefined
  if (!bodyRow) return

  if (page.hasAttribute('data-settings-shared-nav')) {
    const nav = bodyRow.firstElementChild as HTMLElement | null
    const content = bodyRow.lastElementChild as HTMLElement | null
    if (nav && bodyRow.childElementCount >= 2) {
      nav.scrollTop = 0
    }
    if (content) {
      content.scrollTop = 0
    }
  } else {
    bodyRow.scrollTop = 0
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
}

export function CompanyTimesheetsSettingsPage() {
  const [activeTab, setActiveTab] =
    useState<TimesheetsSettingsTab>('shared')
  const [costTypeRows, setCostTypeRows] =
    useState<CostTypeRow[]>(initialCostTypeRows)
  const [attestationQuestions, setAttestationQuestions] = useState(
    () => INITIAL_ATTESTATION_QUESTIONS,
  )
  const [payrollTimeTypeRows, setPayrollTimeTypeRows] = useState<
    PayrollTimeTypeRow[]
  >(() => [...INITIAL_PAYROLL_TIME_TYPES])
  const [payrollExportFiles, setPayrollExportFiles] = useState<File[]>([])
  const [overtimeProjectRules, setOvertimeProjectRules] = useState<
    OvertimeProjectRuleRow[]
  >(() => [...INITIAL_OVERTIME_PROJECT_RULES])

  const handleCostToggle = useCallback(
    (id: string, field: 'laborChecked' | 'equipmentChecked', next: boolean) => {
      setCostTypeRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: next } : r)),
      )
    },
    [],
  )

  const handleSubmit = useCallback(
    (values: TimesheetsSettingsFormValues) => {
      return new Promise<void>((resolve) => {
        window.setTimeout(() => {
          void values
          void costTypeRows
          void attestationQuestions
          void payrollTimeTypeRows
          void payrollExportFiles
          void overtimeProjectRules
          resolve()
        }, 400)
      })
    },
    [
      attestationQuestions,
      costTypeRows,
      payrollExportFiles,
      payrollTimeTypeRows,
      overtimeProjectRules,
    ],
  )

  const initialValues = useMemo(() => ({ ...defaultInitialValues }), [])

  const hasSideNavigation =
    activeTab === 'shared' || activeTab === 'payroll'

  useLayoutEffect(() => {
    const run = () => scrollSettingsPageScrollContainersToTop()
    run()
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
    const delayed = window.setTimeout(run, 100)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(delayed)
    }
  }, [activeTab])

  useEffect(() => {
    const run = () => scrollSettingsPageScrollContainersToTop()
    const t = window.setTimeout(run, 0)
    return () => window.clearTimeout(t)
  }, [activeTab])

  /**
   * Form.Select uses OverlayTrigger, which focuses its trigger on mount when the
   * menu is closed; the last select in the tab panel wins (e.g. Rounding direction
   * on Shared, Payroll Software on Payroll). Move focus to the first card heading
   * instead. setTimeout(0) runs after child effects and after the scroll effect’s
   * setTimeout(0).
   */
  useEffect(() => {
    const firstCardId =
      activeTab === 'shared'
        ? 'general-settings'
        : activeTab === 'payroll'
          ? 'payroll-settings'
          : null
    if (!firstCardId) return
    const t = window.setTimeout(() => {
      const card = document.getElementById(firstCardId)
      const heading = card?.querySelector('h1, h2, h3')
      if (!(heading instanceof HTMLElement)) return
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1')
      }
      heading.focus({ preventScroll: true })
    }, 0)
    return () => window.clearTimeout(t)
  }, [activeTab])

  return (
    <Form<TimesheetsSettingsFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      <Form.Form
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          height: '100%',
          width: '100%',
        }}
      >
        <SettingsPage
          width="block"
          hasNavigation={hasSideNavigation}
          {...(hasSideNavigation
            ? { 'data-settings-shared-nav': true as const }
            : {})}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <SettingsPage.Main
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <SettingsPage.Header style={{ flexShrink: 0 }}>
              <SettingsPage.Breadcrumbs>
                <Breadcrumbs variant="list">
                  <Breadcrumbs.Crumb>
                    <Link href="#timesheets">Timesheets</Link>
                  </Breadcrumbs.Crumb>
                  <Breadcrumbs.Crumb active>Timesheets Settings</Breadcrumbs.Crumb>
                </Breadcrumbs>
              </SettingsPage.Breadcrumbs>

              <SettingsPage.Title>
                <Title>
                  <Title.Text>
                    <H1>Timesheets Settings</H1>
                  </Title.Text>
                </Title>
              </SettingsPage.Title>

              <SettingsPage.Tabs>
                <Tabs>
                  <Tabs.Tab
                    selected={activeTab === 'shared'}
                    role="button"
                    onPress={() => setActiveTab('shared')}
                  >
                    <Tabs.Link>Shared Settings</Tabs.Link>
                  </Tabs.Tab>
                  <Tabs.Tab
                    selected={activeTab === 'configurations'}
                    role="button"
                    onPress={() => setActiveTab('configurations')}
                  >
                    <Tabs.Link>Configurations</Tabs.Link>
                  </Tabs.Tab>
                  <Tabs.Tab
                    selected={activeTab === 'payroll'}
                    role="button"
                    onPress={() => setActiveTab('payroll')}
                  >
                    <Tabs.Link>Payroll</Tabs.Link>
                  </Tabs.Tab>
                  <Tabs.Tab
                    selected={activeTab === 'overtime'}
                    role="button"
                    onPress={() => setActiveTab('overtime')}
                  >
                    <Flex inline alignItems="center" gap="xs">
                      <Tabs.Link>Overtime Management</Tabs.Link>
                      <Pill
                        color="magenta"
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#F9E6F6',
                          borderColor: '#F0C2E8',
                        }}
                      >
                        Beta
                      </Pill>
                    </Flex>
                  </Tabs.Tab>
                </Tabs>
              </SettingsPage.Tabs>
            </SettingsPage.Header>

            <SettingsPage.Body>
                {activeTab === 'shared' && (
                  <>
                    <SettingsPage.Card
                      id="general-settings"
                      navigationLabel="General Settings"
                    >
                      <SettingsPage.Section
                        heading="General Settings"
                        subtext="The following settings apply to Timecard, Timesheets and Daily Log."
                      >
                        <SettingsPage.Section>
                          <Box marginBottom="lg">
                            <Typography intent="h3" weight="semibold">
                              Employee Tracking on Projects
                            </Typography>
                            <Box marginTop="sm" marginBottom="md">
                              <Form.Checkbox
                                name="trackEmployeesOnAllProjects"
                                inlineLabel="Track company employees on all projects"
                              />
                            </Box>
                          </Box>
                        </SettingsPage.Section>

                        <SettingsPage.Section>
                          <Box>
                            <Typography intent="h3" weight="semibold">
                              Crew Availability Across Projects
                            </Typography>
                            <Box marginTop="sm" marginBottom="sm">
                              <P>
                                Employees with the appropriate permissions will be
                                able to copy their crews across projects.
                              </P>
                            </Box>
                            <Box marginBottom="md">
                              <Form.Checkbox
                                name="allowCrewsCopiedAcrossProjects"
                                inlineLabel="Allow crews to be copied across projects"
                              />
                            </Box>
                          </Box>
                        </SettingsPage.Section>
                      </SettingsPage.Section>
                    </SettingsPage.Card>

                    <SettingsPage.Card
                      id="time-entry-settings"
                      navigationLabel="Time Entry Settings"
                    >
                      <SettingsPage.Section heading="Time Entry Settings">
                        <SettingsPage.Section>
                          <Box marginBottom="lg">
                            <Typography intent="h3" weight="semibold">
                              Privacy
                            </Typography>
                            <Box marginTop="sm" marginBottom="sm">
                              <P>
                                Private timecards are only visible to the creator of
                                the timecard, the employee for whom the time is being
                                tracked, and admins of the tools.
                              </P>
                            </Box>
                            <Box marginBottom="md">
                              <Form.Checkbox
                                name="privateTimecardsByDefault"
                                inlineLabel="Make timecards private by default"
                              />
                            </Box>
                          </Box>
                        </SettingsPage.Section>

                        <SettingsPage.Section>
                          <Box>
                            <Typography intent="h3" weight="semibold">
                              Rounding
                            </Typography>
                            <Box marginTop="sm" marginBottom="sm">
                              <P>
                                Rounding rules will apply to all projects and time
                                formats (Start/Stop and Total Hours) and will change
                                all time pickers to conform to the selected time
                                increment. Please ensure that any rounding rules you
                                define comply with applicable laws and regulations.
                              </P>
                            </Box>
                            <Box marginBottom="md">
                              <Form.Checkbox
                                name="enableRounding"
                                inlineLabel="Enable Rounding on Timecards"
                              />
                            </Box>
                            <RoundingSelectRow />
                          </Box>
                        </SettingsPage.Section>
                      </SettingsPage.Section>
                    </SettingsPage.Card>

                    <SettingsPage.Card
                      id="signature-settings"
                      navigationLabel="Signature Settings"
                    >
                      <SettingsPage.Section heading="Signature Settings">
                        <SignatureSettingsFields />
                      </SettingsPage.Section>
                    </SettingsPage.Card>

                    <SettingsPage.Card
                      id="attestations"
                      navigationLabel="Attestations"
                    >
                      <SettingsPage.Section heading="Attestations">
                        <AttestationsSection
                          questions={attestationQuestions}
                          onQuestionsChange={setAttestationQuestions}
                        />
                      </SettingsPage.Section>
                    </SettingsPage.Card>
                  </>
                )}

                {activeTab === 'configurations' && (
                  <SettingsPage.Card navigationLabel="Timesheet settings">
                    <SettingsPage.Section heading="Timesheet Settings">
                      <SettingsPage.Section heading="Limit Available Cost Codes by Cost Type">
                        <Box marginBottom="lg">
                          <CostTypeMatrixTable
                            rows={costTypeRows}
                            onToggle={handleCostToggle}
                          />
                        </Box>
                      </SettingsPage.Section>

                      <SettingsPage.Section>
                        <Typography intent="h3" weight="semibold">
                          Default Cost Type for Timecards
                        </Typography>
                        <Box marginTop="sm" marginBottom="md">
                          <P>
                            This configuration will assign the selected cost type to
                            timecard entries for real-time visibility into labor costs
                            in the budget tool.
                          </P>
                        </Box>

                        <Form.Row>
                          <Form.Select
                            name="defaultCostTypeLabor"
                            label="Cost Type for Labor Time Entries"
                            options={COST_TYPE_OPTIONS}
                            getId={getId}
                            getLabel={getLabel}
                            colStart={1}
                            colWidth={6}
                            onSearch={false}
                          />
                        </Form.Row>
                        <Box marginBottom="lg">
                          <Form.Checkbox
                            name="applyLaborCostToExisting"
                            inlineLabel="Apply to existing timecards"
                          />
                        </Box>

                        <Form.Row>
                          <Form.Select
                            name="defaultCostTypeEquipment"
                            label="Cost Type for Equipment Time Entries"
                            options={COST_TYPE_OPTIONS}
                            getId={getId}
                            getLabel={getLabel}
                            colStart={1}
                            colWidth={6}
                            onSearch={false}
                          />
                        </Form.Row>
                        <Box marginBottom="lg">
                          <Form.Checkbox
                            name="applyEquipmentCostToExisting"
                            inlineLabel="Apply to existing timecards"
                          />
                        </Box>
                      </SettingsPage.Section>
                    </SettingsPage.Section>
                  </SettingsPage.Card>
                )}

                {activeTab === 'payroll' && (
                  <PayrollTabContent
                    timeTypeRows={payrollTimeTypeRows}
                    onTimeTypeRowsChange={setPayrollTimeTypeRows}
                    payrollExportFiles={payrollExportFiles}
                    onPayrollExportFilesChange={setPayrollExportFiles}
                  />
                )}

                {activeTab === 'overtime' && (
                  <OvertimeTabContent
                    projectRules={overtimeProjectRules}
                    onProjectRulesChange={setOvertimeProjectRules}
                  />
                )}
            </SettingsPage.Body>

            <TimesheetsSettingsFooter
              onCancel={() => {
                setCostTypeRows(initialCostTypeRows)
                setAttestationQuestions(INITIAL_ATTESTATION_QUESTIONS)
                setPayrollTimeTypeRows([...INITIAL_PAYROLL_TIME_TYPES])
                setPayrollExportFiles([])
                setOvertimeProjectRules([...INITIAL_OVERTIME_PROJECT_RULES])
              }}
            />
          </SettingsPage.Main>
        </SettingsPage>
      </Form.Form>
    </Form>
  )
}
