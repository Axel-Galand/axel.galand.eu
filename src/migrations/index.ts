import * as migration_20261103_154609_initial from './20261103_154609_initial'

export const migrations = [
  {
    up: migration_20261103_154609_initial.up,
    down: migration_20261103_154609_initial.down,
    name: '20261103_154609_initial',
  },
]
