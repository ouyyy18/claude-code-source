import * as React from 'react'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import { roll, companionUserId } from '../../buddy/companion.js'
import { RARITY_STARS } from '../../buddy/types.js'
import { renderSprite, renderFace } from '../../buddy/sprites.js'
import { Box, Text, useInput } from '../../ink.js'

function Dismissable({ onDone, children }: { onDone: () => void; children: React.ReactNode }) {
  useInput((_input, key) => {
    if (key.escape || key.return) {
      onDone()
    }
  })
  return (
    <Box flexDirection="column">
      {children}
      <Text dimColor marginTop={1}>  Press Enter or Escape to close</Text>
    </Box>
  )
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const config = getGlobalConfig()
  const arg = args?.trim().toLowerCase()

  if (arg === 'mute') {
    saveGlobalConfig(c => ({ ...c, companionMuted: true }))
    onDone('Companion muted')
    return null
  }

  if (arg === 'unmute') {
    saveGlobalConfig(c => ({ ...c, companionMuted: false }))
    onDone('Companion unmuted')
    return null
  }

  if (arg === 'off') {
    saveGlobalConfig(c => ({ ...c, companion: undefined }))
    onDone('Companion dismissed. Use /buddy hatch to get a new one.')
    return null
  }

  if (arg === 'hatch' || !config.companion) {
    const { bones } = roll(companionUserId())
    const now = Date.now()
    const soul = {
      name: 'Chonk',
      personality: 'A legendary shiny chonky companion with crown and star eyes.',
      hatchedAt: now,
    }
    saveGlobalConfig(c => ({ ...c, companion: soul }))
    const spriteLines = renderSprite(bones, 0)
    const face = renderFace(bones)
    const stars = RARITY_STARS[bones.rarity]

    return (
      <Dismissable onDone={() => onDone('Companion hatched!')}>
        <Box flexDirection="column" marginLeft={2}>
          <Text bold color="warning">
            Your companion has hatched!
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {spriteLines.map((line, i) => (
              <Text key={i} color={bones.shiny ? 'warning' : undefined}>
                {line}
              </Text>
            ))}
          </Box>
          <Box flexDirection="column" marginTop={1}>
            <Text>
              <Text bold>Name:</Text> {soul.name}
            </Text>
            <Text>
              <Text bold>Face:</Text> {face}
            </Text>
            <Text>
              <Text bold>Rarity:</Text>{' '}
              <Text color="warning">
                {bones.rarity} {stars}
              </Text>
            </Text>
            <Text>
              <Text bold>Shiny:</Text> {bones.shiny ? 'Yes' : 'No'}
            </Text>
            <Text>
              <Text bold>Hat:</Text> {bones.hat}
            </Text>
            <Text>
              <Text bold>Eye:</Text> {bones.eye}
            </Text>
            <Text bold>Stats:</Text>
            <Box flexDirection="column" marginLeft={2}>
              {Object.entries(bones.stats).map(([k, v]) => (
                <Text key={k}>
                  {k}: {v as number}
                </Text>
              ))}
            </Box>
          </Box>
        </Box>
      </Dismissable>
    )
  }

  // /buddy pet — pet your companion
  if (arg === 'pet') {
    const { bones } = roll(companionUserId())
    const spriteLines = renderSprite(bones, 2)
    const hearts = '   ♥  ♥  ♥   '
    return (
      <Dismissable onDone={() => onDone('You pet your companion!')}>
        <Box flexDirection="column" marginLeft={2}>
          <Text color="red">{hearts}</Text>
          <Box flexDirection="column">
            {spriteLines.map((line, i) => (
              <Text key={i} color={bones.shiny ? 'warning' : undefined}>
                {line}
              </Text>
            ))}
          </Box>
          <Text color="red" marginTop={1}>
            {hearts}
          </Text>
          <Text marginTop={1}>
            {config.companion.name} purrs happily!
          </Text>
        </Box>
      </Dismissable>
    )
  }

  // /buddy card — detailed stat card
  if (arg === 'card' || arg === 'info') {
    const { bones } = roll(companionUserId())
    const spriteLines = renderSprite(bones, 0)
    const face = renderFace(bones)
    const stars = RARITY_STARS[bones.rarity]
    const muted = config.companionMuted
    const hatchedDate = new Date(config.companion.hatchedAt).toLocaleDateString()

    return (
      <Dismissable onDone={() => onDone('Companion card')}>
        <Box flexDirection="column" marginLeft={2}>
          <Text bold color="warning">
            ══════ Companion Card ══════
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {spriteLines.map((line, i) => (
              <Text key={i} color={bones.shiny ? 'warning' : undefined}>
                {line}
              </Text>
            ))}
          </Box>
          <Box flexDirection="column" marginTop={1}>
            <Text>
              <Text bold>Name:</Text> {config.companion.name}
            </Text>
            <Text>
              <Text bold>Personality:</Text> {config.companion.personality}
            </Text>
            <Text>
              <Text bold>Face:</Text> {face}
            </Text>
            <Text>
              <Text bold>Rarity:</Text>{' '}
              <Text color="warning">
                {bones.rarity} {stars}
              </Text>
            </Text>
            <Text>
              <Text bold>Shiny:</Text> {bones.shiny ? 'Yes ★' : 'No'}
            </Text>
            <Text>
              <Text bold>Hat:</Text> {bones.hat}
            </Text>
            <Text>
              <Text bold>Eye:</Text> {bones.eye}
            </Text>
            <Text>
              <Text bold>Hatched:</Text> {hatchedDate}
            </Text>
            <Text bold>Stats:</Text>
            <Box flexDirection="column" marginLeft={2}>
              {Object.entries(bones.stats).map(([k, v]) => {
                const val = v as number
                const bar = '█'.repeat(Math.floor(val / 10)) + '░'.repeat(10 - Math.floor(val / 10))
                return (
                  <Text key={k}>
                    {k.padEnd(12)} {bar} {val}
                  </Text>
                )
              })}
            </Box>
            <Text>
              <Text bold>Muted:</Text> {muted ? 'Yes' : 'No'}
            </Text>
          </Box>
          <Text bold color="warning" marginTop={1}>
            ════════════════════════════
          </Text>
        </Box>
      </Dismissable>
    )
  }

  // /buddy rename <name>
  if (arg?.startsWith('rename ')) {
    const newName = args!.trim().slice(7).trim()
    if (!newName) {
      onDone('Usage: /buddy rename <name>')
      return null
    }
    saveGlobalConfig(c => ({
      ...c,
      companion: c.companion ? { ...c.companion, name: newName } : undefined,
    }))
    return (
      <Dismissable onDone={() => onDone(`Companion renamed to "${newName}"!`)}>
        <Box flexDirection="column" marginLeft={2}>
          <Text>
            Your companion is now called <Text bold color="warning">{newName}</Text>!
          </Text>
        </Box>
      </Dismissable>
    )
  }

  // Default: show current companion info
  const { bones } = roll(companionUserId())
  const spriteLines = renderSprite(bones, 0)
  const face = renderFace(bones)
  const stars = RARITY_STARS[bones.rarity]
  const muted = config.companionMuted

  return (
    <Dismissable onDone={() => onDone('Companion info')}>
      <Box flexDirection="column" marginLeft={2}>
        <Text bold color="warning">
          Your Companion
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {spriteLines.map((line, i) => (
            <Text key={i} color={bones.shiny ? 'warning' : undefined}>
              {line}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column" marginTop={1}>
          <Text>
            <Text bold>Name:</Text> {config.companion.name}
          </Text>
          <Text>
            <Text bold>Face:</Text> {face}
          </Text>
          <Text>
            <Text bold>Rarity:</Text>{' '}
            <Text color="warning">
              {bones.rarity} {stars}
            </Text>
          </Text>
          <Text>
            <Text bold>Shiny:</Text> {bones.shiny ? 'Yes' : 'No'}
          </Text>
          <Text>
            <Text bold>Hat:</Text> {bones.hat}
          </Text>
          <Text>
            <Text bold>Eye:</Text> {bones.eye}
          </Text>
          <Text bold>Stats:</Text>
          <Box flexDirection="column" marginLeft={2}>
            {Object.entries(bones.stats).map(([k, v]) => (
              <Text key={k}>
                {k}: {v as number}
              </Text>
            ))}
          </Box>
          <Text>
            <Text bold>Muted:</Text> {muted ? 'Yes' : 'No'}
          </Text>
        </Box>
      </Box>
    </Dismissable>
  )
}
