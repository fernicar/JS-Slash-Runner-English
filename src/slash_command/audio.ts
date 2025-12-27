import { get_store_by_type, handle_url_to_title } from '@/function/audio';
import { SlashCommand } from '@sillytavern/scripts/slash-commands/SlashCommand';
import {
  ARGUMENT_TYPE,
  SlashCommandArgument,
  SlashCommandNamedArgument,
} from '@sillytavern/scripts/slash-commands/SlashCommandArgument';
import { commonEnumProviders, enumIcons } from '@sillytavern/scripts/slash-commands/SlashCommandCommonEnumsProvider';
import { SlashCommandEnumValue, enumTypes } from '@sillytavern/scripts/slash-commands/SlashCommandEnumValue';
import { SlashCommandParser } from '@sillytavern/scripts/slash-commands/SlashCommandParser';

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function audioEnable(_args: { type: string; state?: string }): string {
  return '';
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function audioPlay(args: { type: string; play?: string }): string {
  if (!['bgm', 'ambient'].includes(args.type)) {
    console.warn('WARN: Invalid arguments for /audioplaypause command');
    return '';
  }

  const type = args.type.toLowerCase() as 'bgm' | 'ambient';
  const play = Boolean(args.play ?? 'true');

  get_store_by_type(type).playing = play;
  return '';
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function audioMode(args: any): string {
  if (!['bgm', 'ambient'].includes(args.type) || !['repeat', 'random', 'single', 'stop'].includes(args.mode)) {
    console.warn('WARN: Invalid arguments for /audiomode command');
    return '';
  }

  const type = args.type.toLowerCase() as 'bgm' | 'ambient';
  const mode = args.mode.toLowerCase() as 'single' | 'repeat' | 'random' | 'stop';

  get_store_by_type(type).mode = (
    {
      single: 'repeat_one',
      repeat: 'repeat_all',
      random: 'shuffle',
      stop: 'play_one_and_stop',
    } as const
  )[mode];
  return '';
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function audioImport(args: { type: string; play?: string }, url: string): string {
  if (!['bgm', 'ambient'].includes(args.type)) {
    console.warn('WARN: Invalid arguments for /audioplaypause command');
    return '';
  }
  const type = args.type.toLowerCase() as 'bgm' | 'ambient';
  const play = Boolean(args.play ?? 'true');

  const store = get_store_by_type(type);

  const urls = _(url)
    .split(',')
    .map(url => url.trim())
    .filter(url => url !== '')
    .uniq()
    .filter(url => !store.playlist.some(item => item.url === url))
    .map(url => ({ url, title: handle_url_to_title(url) }))
    .value();
  if (urls.length === 0) {
    console.warn('WARN: Invalid or empty URLs provided for /audioimport command');
    return '';
  }

  store.playlist.push(...urls);
  if (play) {
    store.src = urls[0].url;
    store.progress = 0;
    store.playing = play;
  }
  return '';
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function audioSelect(args: { type: string }, url: string): string {
  if (!url) {
    console.warn('WARN: Missing URL for /audioselect command');
    return '';
  }
  const type = args.type.toLowerCase() as 'bgm' | 'ambient';
  const store = get_store_by_type(type);
  if (!store.playlist.some(item => item.url === url)) {
    store.playlist.push({ url, title: handle_url_to_title(url) });
  }
  store.src = url;
  store.progress = 0;
  store.playing = true;
  return '';
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function initSlashAudio() {
  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'audioenable',
      // @ts-expect-error Actually usable, only for compatibility with old apps, so ignoring type error fixes
      callback: audioEnable,
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'type',
          description: 'Select player to control (bgm or ambient)',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('bgm', null, enumTypes.enum, enumIcons.file),
            new SlashCommandEnumValue('ambient', null, enumTypes.enum, enumIcons.file),
          ],
          isRequired: true,
        }),
        new SlashCommandNamedArgument(
          'state',
          'Open or close player',
          [ARGUMENT_TYPE.STRING],
          false,
          false,
          'true',
          commonEnumProviders.boolean('trueFalse')(),
        ),
      ],
      helpString: `
        <div>
            Control opening and closing of music player or sound effect player 。
        </div>
        <div>
            <strong>Example:</strong>
            <ul>
                <li>
                    <pre><code>/audioenable type=bgm state=true</code></pre>
                    Open music player 。
                </li>
                <li>
                    <pre><code>/audioenable type=ambient state=false</code></pre>
                    Close sound effect player 。
                </li>
            </ul>
        </div>
    `,
    }),
  );

  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'audioplay',
      // @ts-expect-error Actually usable, only for compatibility with old apps, so ignoring type error fixes
      callback: audioPlay,
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'type',
          description: 'Select player to control (bgm or ambient)',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('bgm', null, enumTypes.enum, enumIcons.file),
            new SlashCommandEnumValue('ambient', null, enumTypes.enum, enumIcons.file),
          ],
          isRequired: true,
        }),
        new SlashCommandNamedArgument(
          'play',
          'Play or pause',
          [ARGUMENT_TYPE.STRING],
          true,
          false,
          'true',
          commonEnumProviders.boolean('trueFalse')(),
        ),
      ],
      helpString: `
        <div>
            Control play and pause of music player or sound effect player 。
        </div>
        <div>
            <strong>Example:</strong>
            <ul>
                <li>
                    <pre><code>/audioplay type=bgm</code></pre>
                    Play current music 。
                </li>
                <li>
                    <pre><code>/audioplay type=ambient play=false</code></pre>
                    Pause current sound effect 。
                </li>
            </ul>
        </div>
      `,
    }),
  );

  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'audioselect',
      // @ts-expect-error Actually usable, only for compatibility with old apps, so ignoring type error fixes
      callback: audioSelect,
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'type',
          description: 'Select player type (bgm or ambient)',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('bgm', null, enumTypes.enum, enumIcons.file),
            new SlashCommandEnumValue('ambient', null, enumTypes.enum, enumIcons.file),
          ],
          isRequired: true,
        }),
      ],
      unnamedArgumentList: [new SlashCommandArgument('url', [ARGUMENT_TYPE.STRING], true)],
      helpString: `
        <div>
            Select and play audio. If audio link does not exist, import first then play 。
        </div>
        <div>
            <strong>Example:</strong>
            <ul>
                <li>
                    <pre><code>/audioselect type=bgm https://example.com/song.mp3</code></pre>
                    Select and play specified music 。
                </li>
                <li>
                    <pre><code>/audioselect type=ambient https://example.com/sound.mp3</code></pre>
                    Select and play specified sound effect 。
                </li>
            </ul>
        </div>
      `,
    }),
  );

  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'audioimport',
      // @ts-expect-error Actually usable, only for compatibility with old apps, so ignoring type error fixes
      callback: audioImport,
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'type',
          description: 'Select import type (bgm or ambient)',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('bgm', null, enumTypes.enum, enumIcons.file),
            new SlashCommandEnumValue('ambient', null, enumTypes.enum, enumIcons.file),
          ],
          isRequired: true,
        }),
        SlashCommandNamedArgument.fromProps({
          name: 'play',
          description: 'Whether to play the first link immediately after import',
          typeList: [ARGUMENT_TYPE.BOOLEAN],
          defaultValue: 'true',
          isRequired: false,
        }),
      ],
      unnamedArgumentList: [new SlashCommandArgument('url', [ARGUMENT_TYPE.STRING], true)],
      helpString: `
        <div>
            Import audio or music links and decide whether to play immediately, defaults to auto-play. Can batch import links, separated by commas 。
        </div>
        <div>
            <strong>Example:</strong>
            <ul>
                <li>
                    <pre><code>/audioimport type=bgm https://example.com/song1.mp3,https://example.com/song2.mp3</code></pre>
                    Import BGM music and immediately play the first link 。
                </li>
                <li>
                    <pre><code>/audioimport type=ambient play=false url=https://example.com/sound1.mp3,https://example.com/sound2.mp3 </code></pre>
                    Import sound effect link (do not auto-play)。
                </li>
            </ul>
        </div>
      `,
    }),
  );

  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'audiomode',
      callback: audioMode,
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'type',
          description: 'Select player to control (bgm or ambient)',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('bgm', null, enumTypes.enum, enumIcons.file),
            new SlashCommandEnumValue('ambient', null, enumTypes.enum, enumIcons.file),
          ],
          isRequired: true,
        }),
        SlashCommandNamedArgument.fromProps({
          name: 'mode',
          description: 'Select playback mode',
          typeList: [ARGUMENT_TYPE.STRING],
          enumList: [
            new SlashCommandEnumValue('repeat', null, enumTypes.enum),
            new SlashCommandEnumValue('random', null, enumTypes.enum),
            new SlashCommandEnumValue('single', null, enumTypes.enum),
            new SlashCommandEnumValue('stop', null, enumTypes.enum),
          ],
          isRequired: true,
        }),
      ],
      helpString: `
        <div>
            Set audio playback mode 。
        </div>
        <div>
            <strong>Example:</strong>
            <ul>
                <li>
                    <pre><code>/audiomode type=bgm mode=repeat</code></pre>
                    Set music to loop mode 。
                </li>
                <li>
                    <pre><code>/audiomode type=ambient mode=random</code></pre>
                    Set sound effect to shuffle mode 。
                </li>
                <li>
                    <pre><code>/audiomode type=bgm mode=single</code></pre>
                    Set music to single loop mode 。
                </li>
                <li>
                    <pre><code>/audiomode type=ambient mode=stop</code></pre>
                    Set sound effect to stop mode 。
                </li>
            </ul>
        </div>
    `,
    }),
  );
}
