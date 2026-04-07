import {
  Box,
  Button,
  Flex,
  Link,
  P,
  SettingsPage,
  Switch,
  Table,
  Typography,
  colors,
  useField,
  useFormContext,
} from '@procore/core-react'
import { Plus, Trash } from '@procore/core-icons'

type OvertimeSwitchName =
  | 'enableOvertimeManagement'
  | 'overtimeAutoApplyWhenCreating'
  | 'overtimeExcludeCustomFieldsFromSplitting'

function OvertimeSwitchRow({
  name,
  label,
  description,
}: {
  name: OvertimeSwitchName
  label: string
  description: string
}) {
  const { input, meta, helpers } = useField<boolean>({ name })
  const id = `overtime-switch-${name}`
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
        {description ? (
          <Box marginTop="xs">
            <Typography intent="body" color="gray40" as="div">
              {description}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Flex>
  )
}

const overtimeSettingsDividerStyle = {
  borderTop: `1px solid ${colors.gray85}`,
} as const

const COMPANY_DEFAULT_RULE_LINES = [
  'Weekly overtime will apply after 40 hours',
  'Daily overtime will apply after 8 hours (Monday, Tuesday, Wednesday, Thursday, Friday)',
  'Daily overtime will apply after 0 hours (Saturday, Sunday)',
  'Daily double time will apply after 12 hours (Monday, Tuesday, Wednesday, Thursday, Friday)',
  'Daily double time will apply after 8 hours (Saturday, Sunday)',
]

const OVERTIME_TIME_TYPE_ROW = {
  regular: 'RT - Regular Time',
  overtime: 'OT - Overtime',
  doubleTime: 'DT - Double Time',
}

export type OvertimeProjectRuleRow = {
  id: string
  name: string
  rules: string[]
  assignedProjectsLabel: string
  lastModified: string
}

export const INITIAL_OVERTIME_PROJECT_RULES: OvertimeProjectRuleRow[] = [
  {
    id: 'pr-ca-1000',
    name: 'CA Local 1000',
    rules: [
      'Weekly overtime will apply after 40 hours',
      'Daily overtime will apply after 8 hours',
      'Daily double time will apply after 12 hours',
    ],
    assignedProjectsLabel: '0/12 Projects',
    lastModified: '8/20/2024 at 8:14 AM PDT by Marc Duncan',
  },
]

function RulesBulletList({ lines }: { lines: string[] }) {
  return (
    <Box as="ul" paddingLeft="lg" style={{ margin: 0, marginBlock: 0 }}>
      {lines.map((line) => (
        <Box as="li" key={line} marginBottom="xs">
          <Typography intent="body" as="span">
            {line}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

type OvertimeTabContentProps = {
  projectRules: OvertimeProjectRuleRow[]
  onProjectRulesChange: (rows: OvertimeProjectRuleRow[]) => void
}

export function OvertimeTabContent({
  projectRules,
  onProjectRulesChange,
}: OvertimeTabContentProps) {
  const { values } = useFormContext<{
    enableOvertimeManagement: boolean
  }>()

  const removeProjectRule = (id: string) => {
    onProjectRulesChange(projectRules.filter((r) => r.id !== id))
  }

  const addProjectRule = () => {
    const nextId = `pr-new-${Date.now()}`
    onProjectRulesChange([
      ...projectRules,
      {
        id: nextId,
        name: 'New project rule',
        rules: ['Configure this rule after creation.'],
        assignedProjectsLabel: '0/0 Projects',
        lastModified: 'Just now',
      },
    ])
  }

  return (
    <>
      <SettingsPage.Card
        id="overtime-management"
        navigationLabel="Overtime Management"
      >
        <SettingsPage.Section
          heading="Overtime Management"
          subtext="Set rules for your workforce and assign them to projects."
        >
          <OvertimeSwitchRow
            name="enableOvertimeManagement"
            label="Enable Overtime Management"
            description=""
          />

          {values.enableOvertimeManagement && (
            <>
              <Box
                marginTop="lg"
                paddingTop="lg"
                style={overtimeSettingsDividerStyle}
              >
                <Typography intent="h3" weight="semibold" as="div">
                  Creating Time Entries
                </Typography>
                <Box marginTop="sm" marginBottom="md">
                  <P>
                    If enabled, users will not be allowed to override time type when
                    creating new time entries. Configurable fieldsets will still be
                    respected.{' '}
                    <Link href="#">Click here for more info</Link> on configuration.
                  </P>
                </Box>
                <OvertimeSwitchRow
                  name="overtimeAutoApplyWhenCreating"
                  label="Always automatically apply overtime rules when creating time entries"
                  description=""
                />
              </Box>

              <Box
                marginTop="lg"
                paddingTop="lg"
                style={overtimeSettingsDividerStyle}
              >
                <Typography intent="h3" weight="semibold" as="div">
                  Custom Field Handling
                </Typography>
                <Box marginTop="sm" marginBottom="md">
                  <P>
                    If enabled, you can choose which specific custom fields should be
                    excluded from being split by the overtime engine.
                  </P>
                </Box>
                <OvertimeSwitchRow
                  name="overtimeExcludeCustomFieldsFromSplitting"
                  label="Exclude specific custom fields from overtime splitting"
                  description=""
                />
              </Box>
            </>
          )}
        </SettingsPage.Section>
      </SettingsPage.Card>

      <SettingsPage.Card
        id="overtime-time-types"
        navigationLabel="Overtime Time Types"
      >
        <SettingsPage.Section
          heading="Overtime Time Types"
          subtext="Selected time types will apply to all created rules."
        >
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell />
                  <Table.HeaderCell>Regular Time</Table.HeaderCell>
                  <Table.HeaderCell>Overtime (wage x 1.5)</Table.HeaderCell>
                  <Table.HeaderCell>Double Time (wage x 2)</Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                <Table.BodyRow>
                  <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                    <Button type="button" variant="secondary">
                      Edit
                    </Button>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell>{OVERTIME_TIME_TYPE_ROW.regular}</Table.TextCell>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell>{OVERTIME_TIME_TYPE_ROW.overtime}</Table.TextCell>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell>
                      {OVERTIME_TIME_TYPE_ROW.doubleTime}
                    </Table.TextCell>
                  </Table.BodyCell>
                </Table.BodyRow>
              </Table.Body>
            </Table>
          </Table.Container>
        </SettingsPage.Section>
      </SettingsPage.Card>

      <SettingsPage.Card id="overtime-company-rules" navigationLabel="Company Rules">
        <SettingsPage.Section
          heading="Company Rules"
          subtext="These default rules apply to all employees and projects. Company rules may be modified but not deleted."
        >
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell />
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Rules</Table.HeaderCell>
                  <Table.HeaderCell>Last Modified</Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                <Table.BodyRow>
                  <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                    <Button type="button" variant="secondary">
                      Edit
                    </Button>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell>Company Default</Table.TextCell>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <RulesBulletList lines={COMPANY_DEFAULT_RULE_LINES} />
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell>
                      1/20/2025 at 7:52 AM PDT by Marc Duncan
                    </Table.TextCell>
                  </Table.BodyCell>
                </Table.BodyRow>
              </Table.Body>
            </Table>
          </Table.Container>
        </SettingsPage.Section>
      </SettingsPage.Card>

      <SettingsPage.Card id="overtime-project-rules" navigationLabel="Project Rules">
        <SettingsPage.Section
          heading="Project Rules"
          subtext="Create and apply rules to individual projects. Project rules will override the default rules set at the company level."
        >
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell />
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Rules</Table.HeaderCell>
                  <Table.HeaderCell>Assigned Projects</Table.HeaderCell>
                  <Table.HeaderCell>Last Modified</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                {projectRules.map((row) => (
                  <Table.BodyRow key={row.id}>
                    <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                      <Button type="button" variant="secondary">
                        Edit
                      </Button>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell>{row.name}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <RulesBulletList lines={row.rules} />
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Link href="#">{row.assignedProjectsLabel}</Link>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell>{row.lastModified}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell style={{ verticalAlign: 'middle' }}>
                      <Button
                        type="button"
                        variant="tertiary"
                        icon={<Trash />}
                        aria-label={`Delete ${row.name}`}
                        onClick={() => removeProjectRule(row.id)}
                      />
                    </Table.BodyCell>
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table>
          </Table.Container>
          <Box marginTop="md">
            <Button
              type="button"
              variant="secondary"
              icon={<Plus />}
              onClick={addProjectRule}
            >
              Create New
            </Button>
          </Box>
        </SettingsPage.Section>
      </SettingsPage.Card>
    </>
  )
}
