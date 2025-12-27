import { eventSource } from '@sillytavern/script';
import { SlashCommand } from '@sillytavern/scripts/slash-commands/SlashCommand';
import { ARGUMENT_TYPE, SlashCommandNamedArgument } from '@sillytavern/scripts/slash-commands/SlashCommandArgument';
import { SlashCommandParser } from '@sillytavern/scripts/slash-commands/SlashCommandParser';

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export async function slashEventEmit(named_args: any): Promise<any> {
  const event: string = named_args.event;
  const data: string[] = named_args.data ?? [];

  await eventSource.emit(event, ...data);

  return event;
}

/** @deprecated TavernHelper script already has buttons, no longer needed /STScript */
export function initSlashEventEmit() {
  SlashCommandParser.addCommandObject(
    SlashCommand.fromProps({
      name: 'event-emit',
      callback: slashEventEmit,
      returns: 'Name of event to send',
      namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
          name: 'event',
          description: 'Event Name',
          typeList: [ARGUMENT_TYPE.STRING],
          isRequired: true,
        }),
        SlashCommandNamedArgument.fromProps({
          name: 'data',
          description: 'Data to transfer',
          typeList: [ARGUMENT_TYPE.STRING],
          isRequired: false,
          acceptsMultiple: true,
        }),
      ],
      unnamedArgumentList: [],
      helpString: `
    <div>
        Send \`event\` event, and can also send some data.
        All listener functions listening to this message channel will run automatically and can receive sent data via function parameters.
        Due to limitations of Tavern STScript input, all data will be received as string type; if number type etc. is needed, please convert it yourself.
    </div>
    <div>
        <strong>Example:</strong>
        <ul>
            <li>
                <pre><code class="language-stscript">/event-emit event="Load Save"</code></pre>
            </li>
            <li>
                <pre><code class="language-stscript">/event-emit event="Save" data={{getvar::data}} data=8 data=Hello {{user}}</code></pre>
            </li>
            <li>
                <pre><code class="language-stscript">/event-emit event="Any Name" data="This is data" data={{user}}</code></pre>
            </li>
        </ul>
    </div>
  `,
    }),
  );
}
