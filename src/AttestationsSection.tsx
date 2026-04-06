import { useCallback, useState } from 'react'
import {
  Box,
  borderRadius,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Input,
  MultiSelect,
  Panel,
  Pill,
  Select,
  Switch,
  Tearsheet,
  TextArea,
  Typography,
  colors,
  spacing,
} from '@procore/core-react'
import { Grip, Pencil, Plus } from '@procore/core-icons'

export type AttestationSelectOption = { id: string; label: string }

export type AttestationResponseConfig = {
  id: string
  label: string
  isDefault: boolean
  actionId: string
  notifyDescription: string
}

export type AttestationQuestion = {
  id: string
  description: string
  enabled: boolean
  questionTypeId: string
  required: boolean
  tools: AttestationSelectOption[]
  projects: AttestationSelectOption[]
  responses: AttestationResponseConfig[]
}

const QUESTION_TYPE_OPTIONS: AttestationSelectOption[] = [
  { id: 'yes-no', label: 'Yes / No' },
  { id: 'short-text', label: 'Short text' },
]

const REQUIRED_OPTIONS: AttestationSelectOption[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
]

const TOOL_OPTIONS: AttestationSelectOption[] = [
  { id: 'kiosk', label: 'Kiosk' },
  { id: 'my-time', label: 'My Time' },
]

const PROJECT_OPTIONS: AttestationSelectOption[] = [
  { id: 'all', label: 'All projects' },
  { id: 'alpha', label: 'Project Alpha' },
  { id: 'beta', label: 'Project Beta' },
]

const ACTION_OPTIONS: AttestationSelectOption[] = [
  { id: 'do-nothing', label: 'Do Nothing' },
  { id: 'notify-supervisor', label: 'Notify supervisor' },
  { id: 'block-submit', label: 'Block submission' },
]

function newQuestionId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) {
    return c.randomUUID()
  }
  return `aq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function responsesForQuestionType(typeId: string): AttestationResponseConfig[] {
  if (typeId === 'yes-no') {
    return [
      {
        id: 'yes',
        label: 'Yes',
        isDefault: true,
        actionId: 'do-nothing',
        notifyDescription: '',
      },
      {
        id: 'no',
        label: 'No',
        isDefault: false,
        actionId: 'do-nothing',
        notifyDescription: '',
      },
    ]
  }
  return [
    {
      id: 'text',
      label: 'Response',
      isDefault: true,
      actionId: 'do-nothing',
      notifyDescription: '',
    },
  ]
}

export function createEmptyAttestationQuestion(): AttestationQuestion {
  return {
    id: newQuestionId(),
    description: '',
    enabled: true,
    questionTypeId: 'yes-no',
    required: false,
    tools: [...TOOL_OPTIONS],
    projects: [],
    responses: responsesForQuestionType('yes-no'),
  }
}

export const INITIAL_ATTESTATION_QUESTIONS: AttestationQuestion[] = [
  {
    id: 'sample-1',
    description: 'I certify that I was not injured during this shift.',
    enabled: true,
    questionTypeId: 'yes-no',
    required: true,
    tools: [...TOOL_OPTIONS],
    projects: [{ id: 'all', label: 'All projects' }],
    responses: responsesForQuestionType('yes-no'),
  },
  {
    id: 'sample-2',
    description:
      'I confirm that all hours entered today are accurate to the best of my knowledge.',
    enabled: true,
    questionTypeId: 'yes-no',
    required: false,
    tools: [{ id: 'kiosk', label: 'Kiosk' }],
    projects: [],
    responses: responsesForQuestionType('yes-no'),
  },
]

function getOptionLabel(
  id: string,
  options: AttestationSelectOption[],
): string {
  return options.find((o) => o.id === id)?.label ?? id
}

function questionTypeLabel(questionTypeId: string): string {
  return getOptionLabel(questionTypeId, QUESTION_TYPE_OPTIONS)
}

type AttestationsSectionProps = {
  questions: AttestationQuestion[]
  onQuestionsChange: (next: AttestationQuestion[]) => void
}

export function AttestationsSection({
  questions,
  onQuestionsChange,
}: AttestationsSectionProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AttestationQuestion | null>(null)

  const openAdd = useCallback(() => {
    setEditingId(null)
    setDraft(createEmptyAttestationQuestion())
    setPanelOpen(true)
  }, [])

  const openEdit = useCallback((q: AttestationQuestion) => {
    setEditingId(q.id)
    setDraft({
      ...q,
      tools: [...q.tools],
      projects: [...q.projects],
      responses: q.responses.map((r) => ({ ...r })),
    })
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setDraft(null)
    setEditingId(null)
  }, [])

  const saveDraft = useCallback(() => {
    if (!draft) {
      return
    }
    const trimmed = {
      ...draft,
      description: draft.description.trim(),
    }
    if (editingId) {
      onQuestionsChange(
        questions.map((q) => (q.id === editingId ? trimmed : q)),
      )
    } else {
      onQuestionsChange([...questions, trimmed])
    }
    closePanel()
  }, [closePanel, draft, editingId, onQuestionsChange, questions])

  const setEnabled = useCallback(
    (id: string, enabled: boolean) => {
      onQuestionsChange(
        questions.map((q) => (q.id === id ? { ...q, enabled } : q)),
      )
    },
    [onQuestionsChange, questions],
  )

  return (
    <>
      <Flex justifyContent="space-between" alignItems="flex-start" gap="md">
        <Box flex={1}>
          <Typography intent="body" color="gray40" as="div">
            Configure questions that will be displayed to workers when they
            clock out from their shift using Kiosk or My Time.
          </Typography>
        </Box>
        <Button
          type="button"
          variant="secondary"
          icon={<Plus />}
          onClick={openAdd}
        >
          Add Question
        </Button>
      </Flex>

      <Box marginTop="lg" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {questions.map((q) => (
          <Box
            key={q.id}
            padding="md"
            style={{
              border: '1px solid rgba(172, 181, 185, 1)',
              borderRadius: 4,
              backgroundColor: colors.white,
            }}
          >
            <Flex alignItems="flex-start" gap="md">
              <Box
                flexShrink={0}
                marginTop="xs"
                style={{ color: colors.gray50, cursor: 'grab' }}
                aria-hidden
              >
                <Grip />
              </Box>
              <Box flexShrink={0} marginTop="xs">
                <Switch
                  checked={q.enabled}
                  onChange={(e) => setEnabled(q.id, e.currentTarget.checked)}
                  aria-label={`Enable question: ${q.description || 'Untitled'}`}
                />
              </Box>
              <Box flex={1} style={{ minWidth: 0 }}>
                <Typography intent="label" color="gray40" as="div">
                  Description
                </Typography>
                <Typography
                  intent="body"
                  weight="semibold"
                  as="div"
                  style={{ marginTop: spacing.xxs }}
                >
                  {q.description || 'Untitled question'}
                </Typography>

                <Flex
                  marginTop="sm"
                  gap="md"
                  alignItems="center"
                  style={{ flexWrap: 'wrap' }}
                  role="group"
                  aria-label="Question type and tools"
                >
                  <Flex
                    alignItems="center"
                    gap="xs"
                    style={{ flexWrap: 'wrap' }}
                  >
                    <Typography intent="label" color="gray40" as="span">
                      Question type
                    </Typography>
                    <Pill color="gray">
                      {questionTypeLabel(q.questionTypeId)}
                    </Pill>
                  </Flex>
                  <Flex
                    alignItems="center"
                    gap="xs"
                    style={{ flexWrap: 'wrap' }}
                  >
                    <Typography intent="label" color="gray40" as="span">
                      Tools
                    </Typography>
                    {q.tools.length > 0 ? (
                      q.tools.map((t) => (
                        <Pill key={t.id} color="blue">
                          {t.label}
                        </Pill>
                      ))
                    ) : (
                      <Pill color="gray">None selected</Pill>
                    )}
                  </Flex>
                </Flex>
              </Box>
              <Box flexShrink={0}>
                <Button
                  type="button"
                  variant="tertiary"
                  icon={<Pencil />}
                  aria-label={`Edit question`}
                  onClick={() => openEdit(q)}
                />
              </Box>
            </Flex>
          </Box>
        ))}
      </Box>

      <Tearsheet
        open={panelOpen}
        onClose={closePanel}
        role="dialog"
        aria-labelledby="attestation-panel-title"
        aria-describedby="attestation-panel-subtitle"
      >
        {draft && (
          <Box
            style={{
              width: '60vw',
              maxWidth: '60vw',
              flexShrink: 0,
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
          <Panel
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              height: '100%',
              width: '100%',
              minHeight: 0,
            }}
          >
            <Panel.Header onClose={closePanel}>
              <Box
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.xs,
                }}
              >
                <Panel.Title id="attestation-panel-title">
                  {editingId ? 'Edit Custom Question' : 'Add Custom Question'}
                </Panel.Title>
                <Typography
                  id="attestation-panel-subtitle"
                  intent="body"
                  color="gray40"
                  as="p"
                  style={{ margin: 0 }}
                >
                  Configure a new attestation question for workers.
                </Typography>
              </Box>
            </Panel.Header>

            <Panel.Body secondaryBgColor style={{ flex: 1, minHeight: 0 }}>
              <Box padding="lg xl">
                <Card
                  shadowStrength={2}
                  style={{
                    width: '100%',
                    padding: spacing.lg,
                    boxSizing: 'border-box',
                  }}
                >
                <Box>
                  <label htmlFor="attestation-description">
                    <Typography intent="label" weight="semibold" as="span">
                      Description
                    </Typography>
                  </label>
                  <TextArea
                    id="attestation-description"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    placeholder="Enter description"
                    resize="vertical"
                    rows={4}
                    style={{ marginTop: spacing.xs, width: '100%' }}
                  />
                </Box>

                <Box marginTop="lg">
                  <Grid gutterX="md" gutterY="md" colStackCap="tabletMd">
                    <Grid.Row>
                      <Grid.Col colWidth={6}>
                        <Box marginBottom="xs">
                          <Typography
                            id="attestation-label-question-type"
                            intent="label"
                            weight="semibold"
                            as="div"
                          >
                            Question Type
                          </Typography>
                        </Box>
                        <Select
                          block
                          label={
                            QUESTION_TYPE_OPTIONS.find(
                              (o) => o.id === draft.questionTypeId,
                            )?.label ?? ''
                          }
                          placeholder="Select type"
                          aria-labelledby="attestation-label-question-type"
                          onSelect={(sel) => {
                            const opt = sel.item as AttestationSelectOption
                            if (!opt) {
                              return
                            }
                            setDraft((d) =>
                              d
                                ? {
                                    ...d,
                                    questionTypeId: opt.id,
                                    responses: responsesForQuestionType(opt.id),
                                  }
                                : d,
                            )
                          }}
                        >
                          {QUESTION_TYPE_OPTIONS.map((opt) => (
                            <Select.Option
                              key={opt.id}
                              value={opt}
                              selected={draft.questionTypeId === opt.id}
                            >
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Grid.Col>
                      <Grid.Col colWidth={6}>
                        <Box marginBottom="xs">
                          <Typography
                            id="attestation-label-required"
                            intent="label"
                            weight="semibold"
                            as="div"
                          >
                            Required
                          </Typography>
                        </Box>
                        <Select
                          block
                          label={draft.required ? 'Yes' : 'No'}
                          placeholder="Select"
                          aria-labelledby="attestation-label-required"
                          onSelect={(sel) => {
                            const opt = sel.item as AttestationSelectOption
                            if (!opt) {
                              return
                            }
                            setDraft((d) =>
                              d ? { ...d, required: opt.id === 'yes' } : d,
                            )
                          }}
                        >
                          {REQUIRED_OPTIONS.map((opt) => (
                            <Select.Option
                              key={opt.id}
                              value={opt}
                              selected={
                                (draft.required && opt.id === 'yes') ||
                                (!draft.required && opt.id === 'no')
                              }
                            >
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Grid.Col>
                    </Grid.Row>
                  </Grid>
                </Box>

                <Box marginTop="lg">
                  <Box marginBottom="xs">
                    <Typography
                      id="attestation-label-tools"
                      intent="label"
                      weight="semibold"
                      as="div"
                    >
                      Tool
                    </Typography>
                  </Box>
                  <MultiSelect
                    block
                    options={TOOL_OPTIONS}
                    value={draft.tools}
                    onChange={(next) =>
                      setDraft((d) => (d ? { ...d, tools: next } : d))
                    }
                    getId={(o: AttestationSelectOption) => o.id}
                    getLabel={(o: AttestationSelectOption) => o.label}
                    placeholder="Select tools..."
                    aria-labelledby="attestation-label-tools"
                  />
                </Box>

                <Box marginTop="lg">
                  <Box marginBottom="xs">
                    <Typography
                      id="attestation-label-projects"
                      intent="label"
                      weight="semibold"
                      as="div"
                    >
                      Project
                    </Typography>
                  </Box>
                  <MultiSelect
                    block
                    options={PROJECT_OPTIONS}
                    value={draft.projects}
                    onChange={(next) =>
                      setDraft((d) => (d ? { ...d, projects: next } : d))
                    }
                    getId={(o: AttestationSelectOption) => o.id}
                    getLabel={(o: AttestationSelectOption) => o.label}
                    placeholder="Select projects..."
                    aria-labelledby="attestation-label-projects"
                  />
                </Box>

                <Box marginTop="xl">
                  <Panel.Section
                    heading="Configure Responses"
                    subtext="Configure an action to trigger based on each answer type."
                    style={{ paddingLeft: 0, paddingRight: 0 }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing.md,
                      }}
                    >
                      {draft.responses.map((response) => (
                        <Box
                          key={response.id}
                          padding="md"
                          style={{
                            border: '1px solid rgba(172, 181, 185, 1)',
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.white,
                          }}
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="flex-start"
                            marginBottom="md"
                          >
                            <Typography
                              intent="label"
                              weight="semibold"
                              as="div"
                            >
                              {response.label}
                            </Typography>
                            <Checkbox
                              checked={response.isDefault}
                              onChange={() => {
                                setDraft((d) => {
                                  if (!d) {
                                    return d
                                  }
                                  return {
                                    ...d,
                                    responses: d.responses.map((r) =>
                                      r.id === response.id
                                        ? { ...r, isDefault: true }
                                        : d.questionTypeId === 'yes-no'
                                          ? { ...r, isDefault: false }
                                          : r,
                                    ),
                                  }
                                })
                              }}
                            >
                              Default Answer
                            </Checkbox>
                          </Flex>
                          <Box marginBottom="xs">
                            <Typography
                              id={`attestation-label-action-${response.id}`}
                              intent="label"
                              weight="semibold"
                              as="div"
                            >
                              Action
                            </Typography>
                          </Box>
                          <Select
                            block
                            label={
                              ACTION_OPTIONS.find(
                                (o) => o.id === response.actionId,
                              )?.label ?? ''
                            }
                            placeholder="Select action"
                            aria-labelledby={`attestation-label-action-${response.id}`}
                            onSelect={(sel) => {
                              const opt = sel.item as AttestationSelectOption
                              if (!opt) {
                                return
                              }
                              setDraft((d) => {
                                if (!d) {
                                  return d
                                }
                                return {
                                  ...d,
                                  responses: d.responses.map((r) =>
                                    r.id === response.id
                                      ? { ...r, actionId: opt.id }
                                      : r,
                                  ),
                                }
                              })
                            }}
                          >
                            {ACTION_OPTIONS.map((opt) => (
                              <Select.Option
                                key={opt.id}
                                value={opt}
                                selected={response.actionId === opt.id}
                              >
                                {opt.label}
                              </Select.Option>
                            ))}
                          </Select>
                          <Box marginTop="md">
                            <Box marginBottom="xs">
                              <label htmlFor={`attestation-notify-${response.id}`}>
                                <Typography
                                  intent="label"
                                  weight="semibold"
                                  as="span"
                                >
                                  Notify
                                </Typography>
                              </label>
                            </Box>
                            <Input
                              id={`attestation-notify-${response.id}`}
                              value={response.notifyDescription}
                              onChange={(e) => {
                                const v = e.target.value
                                setDraft((d) => {
                                  if (!d) {
                                    return d
                                  }
                                  return {
                                    ...d,
                                    responses: d.responses.map((r) =>
                                      r.id === response.id
                                        ? { ...r, notifyDescription: v }
                                        : r,
                                    ),
                                  }
                                })
                              }}
                              placeholder="Enter notify recipients or roles"
                              style={{ width: '100%' }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Panel.Section>
                </Box>
                </Card>
              </Box>
            </Panel.Body>

            <Panel.Footer>
              <Panel.FooterActions>
                <Button type="button" variant="tertiary" onClick={closePanel}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveDraft}
                  disabled={!draft.description.trim()}
                >
                  {editingId ? 'Save Changes' : 'Add Question'}
                </Button>
              </Panel.FooterActions>
            </Panel.Footer>
          </Panel>
          </Box>
        )}
      </Tearsheet>
    </>
  )
}
