import * as migration_20261103_154609_initial from './20261103_154609_initial'
import * as migration_20261104_085809_content_model from './20261104_085809_content_model'
import * as migration_20261106_102557_localized_arrays from './20261106_102557_localized_arrays'
import * as migration_20261110_152020_design_foundations from './20261110_152020_design_foundations'
import * as migration_20261112_072720_language_scores from './20261112_072720_language_scores'

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
  {
    up: migration_20261106_102557_localized_arrays.up,
    down: migration_20261106_102557_localized_arrays.down,
    name: '20261106_102557_localized_arrays',
  },
  {
    up: migration_20261110_152020_design_foundations.up,
    down: migration_20261110_152020_design_foundations.down,
    name: '20261110_152020_design_foundations',
  },
  {
    up: migration_20261112_072720_language_scores.up,
    down: migration_20261112_072720_language_scores.down,
    name: '20261112_072720_language_scores',
  },
]
