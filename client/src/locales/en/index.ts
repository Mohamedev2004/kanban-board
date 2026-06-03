import { shell } from './shell'
import { common } from './common'
import { auth } from './auth'
import { settings } from './settings'
import { system } from './system'
import { notifications } from './notifications'
import { logs } from './logs'
import { roles } from './roles'

export const en = {
  ...shell,
  ...common,
  ...auth,
  ...settings,
  ...system,
  ...notifications,
  ...logs,
  ...roles,
} as const
