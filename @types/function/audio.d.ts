type Audio = {
  /** Title */
  title: string;
  /** Audio URL */
  url: string;
};

type AudioWithOptionalTitle = {
  /** Title */
  title?: string;
  /** Audio URL */
  url: string;
};

/**
 * Plays the given audio; if the audio is not in the playlist, it will be added to the playlist.
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @param audio The audio to play; if no title is set (`title`), the filename will be extracted from the URL (`url`) as the title
 *
 * @example
 * // Play the given URL as background music
 * playAudio('bgm', { url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3' });
 *
 * @example
 * // Set a title for the given URL and play it as background music
 * playAudio('bgm', { title: 'Kangaroo Music', url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3' });
 */
declare function playAudio(type: 'bgm' | 'ambient', audio: AudioWithOptionalTitle): void;

/**
 * Pauses the audio
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 */
declare function pauseAudio(type: 'bgm' | 'ambient'): void;

/**
 * Gets the playlist
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @returns Playlist
 */
declare function getAudioList(type: 'bgm' | 'ambient'): Audio[];

/**
 * Replaces the playlist entirely with `audio_list`
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @param audio_list The new playlist; if any audio doesn't have a title set (`title`), the filename will be extracted from the URL (`url`) as the title
 */
declare function replaceAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;

/**
 * Appends non-existing audio to the end of the playlist; will not add audio with the same `title` or `url` duplicates
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @param audio_list The list of audio to insert; if any audio doesn't have a title set (`title`), the filename will be extracted from the URL (`url`) as the title
 */
declare function appendAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;

type AudioSettings = {
  /** Whether it is enabled */
  enabled: boolean;
  /**
   * Current playback mode
   * - repeat_one: Loop single track
   * - repeat_all: Loop all
   * - shuffle: Shuffle
   * - play_one_and_stop: Play one then stop
   */
  mode: 'repeat_one' | 'repeat_all' | 'shuffle' | 'play_one_and_stop';
  /** Whether it is muted */
  muted: boolean;
  /** Current volume (0-100) */
  volume: number;
};

/**
 * Gets audio settings
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @returns Audio settings
 */
declare function getAudioSettings(type: 'bgm' | 'ambient'): AudioSettings;

/**
 * Modifies audio settings; if a field does not exist, the original setting is used.
 *
 * @param type Background music ('bgm') or ambient sound ('ambient')
 * @param settings The audio settings to modify
 *
 * @example
 * // Set background music to single track loop
 * setAudioSettings('bgm', { mode: 'repeat_one' });
 *
 * @example
 * // Mute ambient sound
 * setAudioSettings('ambient', { muted: true });
 *
 * @example
 * // Set background music volume to 50%
 * setAudioSettings('bgm', { volume: 50 });
 */
declare function setAudioSettings(type: 'bgm' | 'ambient', settings: Partial<AudioSettings>): void;
