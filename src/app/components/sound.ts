'use client'

import { Howl } from 'howler'

export type UiSound = 'control' | 'navigate' | 'music-select'

const sounds: Record<UiSound, Howl> = {
  control: new Howl({ src: ['/audio/ui/control.mp3'], volume: 0.2, preload: true }),
  navigate: new Howl({ src: ['/audio/ui/navigate.mp3'], volume: 0.17, preload: true }),
  'music-select': new Howl({ src: ['/audio/ui/music-select.mp3'], volume: 0.22, preload: true }),
}

/** Play a short, purpose-specific cue through Howler's cross-browser audio layer. */
export function playUiSound(sound: UiSound) {
  sounds[sound].play()
}
