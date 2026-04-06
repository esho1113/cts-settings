import styled from 'styled-components'
import {
  Box,
  Button,
  Dropdown,
  Flex,
  Typography,
  colors,
  spacing,
} from '@procore/core-react'
import { Bell, Help, Person, Star, ViewGrid } from '@procore/core-icons'

/** Total block height for sticky offset (min-height + bottom border). */
export const GLOBAL_NAV_STICKY_TOP_PX = 53

const NavBar = styled(Flex)`
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 ${spacing.lg}px;
  background-color: ${colors.gray15};
  border-bottom: 1px solid ${colors.gray30};
  color: ${colors.white};

  button {
    color: ${colors.white};
  }

  button:hover:not(:disabled) {
    background-color: ${colors.gray30};
  }
`

const NavDivider = styled(Box)`
  width: 1px;
  align-self: stretch;
  min-height: 28px;
  margin: 0 ${spacing.sm}px;
  background-color: ${colors.gray40};
`

const LogoMark = styled(Box)`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${colors.orange50};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

type GlobalNavProps = {
  toolLabel?: string
}

export function GlobalNav({ toolLabel = 'Timesheets' }: GlobalNavProps) {
  return (
    <NavBar>
      <Flex alignItems="center" gap="sm">
        <Flex alignItems="center" gap="sm" marginRight="md">
          <LogoMark aria-hidden>
            <Typography intent="label" weight="bold" color="white">
              P
            </Typography>
          </LogoMark>
          <Typography intent="label" weight="semibold" color="white">
            procore
          </Typography>
        </Flex>

        <NavDivider aria-hidden />

        <Dropdown
          label="Select a Project"
          variant="tertiary"
          onSelect={() => {}}
          placement="bottom-left"
        >
          <Dropdown.Item item={{ id: 'demo-hq' }}>
            Demo Company — HQ
          </Dropdown.Item>
          <Dropdown.Item item={{ id: 'demo-field' }}>
            Demo Company — Field Office
          </Dropdown.Item>
        </Dropdown>

        <NavDivider aria-hidden />

        <Typography intent="label" weight="semibold" color="white">
          {toolLabel}
        </Typography>

        <Button
          variant="tertiary"
          icon={<Star />}
          aria-label="Add to favorites"
        />
      </Flex>

      <Flex alignItems="center" gap="xs">
        <Button variant="tertiary" icon={<Help />} aria-label="Help" />
        <Button
          variant="tertiary"
          icon={<Bell />}
          aria-label="Notifications"
        />
        <Button variant="tertiary" icon={<ViewGrid />} aria-label="Apps" />
        <Button variant="tertiary" icon={<Person />} aria-label="Account" />
      </Flex>
    </NavBar>
  )
}
