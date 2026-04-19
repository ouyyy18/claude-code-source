import type { Command } from '../../commands.js'
import { feature } from 'bun:bundle'

const buddy: Command = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Hatch or manage your companion buddy',
  isEnabled: feature('BUDDY') ? () => true : () => false,
  isHidden: false,
  argumentHint: '[hatch|pet|card|info|rename <name>|mute|unmute|off]',
  load: () => import('./buddy.js'),
}

export default buddy
