'use client'

import { playSound, type LibrarySoundName } from 'react-sounds'

export type UiSound = 'control' | 'navigate' | 'card' | 'music-select'

// A restrained sound vocabulary: each action class has its own tactile cue,
// while the shared character keeps the interface from sounding like a soundboard.
const interactionSounds: Record<UiSound, LibrarySoundName> = {
  control: 'ui/button_soft',
  navigate: 'ui/input_focus',
  card: 'ui/item_select',
  'music-select': 'ui/input_focus',
}
const playbackRates: Record<UiSound, number> = {
  control: .99,
  navigate: 1,
  card: 1,
  'music-select': .96,
}
let lastPlayedAt = 0

export function playUiSound(sound: UiSound) {
  if (typeof window === 'undefined') return
  const now = performance.now()
  if (now - lastPlayedAt < 90) return
  lastPlayedAt = now

  void playSound(interactionSounds[sound], { volume: .1, rate: playbackRates[sound] }).catch(() => {
    // Sound is supplemental feedback; a failed lazy load must never block UI.
  })
}
