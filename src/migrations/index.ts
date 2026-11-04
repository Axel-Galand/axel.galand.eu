import * as migration_20261103_154609_initial from './20261103_154609_initial'
import * as migration_20261104_085809_content_model from './20261104_085809_content_model'

export const migrations = [
  {
    up: migration_20261103_154609_initial.up,
    down: migration_20261103_154609_initial.down,
    name: '20261103_154609_initial',
  },
  {
    up: migration_20261104_085809_content_model.up,
    down: migration_20261104_085809_content_model.down,
    name: '20261104_085809_content_model',
  },
]
