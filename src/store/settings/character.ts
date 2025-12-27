import { CharacterSettings as BackwardCharacterSettings } from '@/type/backward';
import { CharacterSettings, setting_field } from '@/type/settings';
import { fromCharacterBook, updateWorldInfoList } from '@/util/compatibility';
import { characters, event_types, eventSource, this_chid } from '@sillytavern/script';
import { writeExtensionField } from '@sillytavern/scripts/extensions';
import { loadWorldInfo, saveWorldInfo } from '@sillytavern/scripts/world-info';

function getSettings(id: string | undefined): CharacterSettings {
  const character = characters.at(id as unknown as number);
  if (character === undefined) {
    return CharacterSettings.parse({});
  }

  const backward_scripts = _.get(character, `data.extensions.TavernHelper_scripts`);
  const backward_variables = _.get(character, `data.extensions.TavernHelper_characterScriptVariables`);
  if (
    (backward_scripts !== undefined || backward_variables !== undefined) &&
    !_.has(character, `data.extensions.${setting_field}`)
  ) {
    const parsed = BackwardCharacterSettings.safeParse({
      scripts: backward_scripts ?? [],
      variables: backward_variables ?? {},
    } satisfies z.infer<typeof BackwardCharacterSettings>);
    if (parsed.success) {
      saveSettingsDebounced(id as string, parsed.data);
    } else {
      toastr.warning(parsed.error.message, t`[TavernHelper] Failed to migrate old data, will use empty data`);
    }
  }

  const settings = Object.fromEntries(_.get(character, `data.extensions.${setting_field}`, []));
  const parsed = CharacterSettings.safeParse(settings);
  if (!parsed.success) {
    toastr.warning(parsed.error.message, t`[TavernHelper] Failed to read character card data, will use empty data`);
    return CharacterSettings.parse({});
  }
  return CharacterSettings.parse(parsed.data);
}

const writeExtensionFieldDebounced = _.debounce(writeExtensionField, 1000);
function saveSettingsDebounced(id: string, settings: CharacterSettings) {
  // Tavern's `writeExtensionField` merges objects, so convert object to array before storing
  const entries = Object.entries(settings);
  _.set(characters[id as unknown as number], `data.extensions.${setting_field}`, entries);
  writeExtensionFieldDebounced(Number(id), setting_field, entries);
}

export const useCharacterSettingsStore = defineStore('character_setttings', () => {
  const id = ref<string | undefined>(this_chid);
  const name = ref<string | undefined>(characters?.[this_chid as unknown as number]?.name);
  // Refresh when switching character cards id
  eventSource.makeFirst(event_types.CHAT_CHANGED, () => {
    const new_name = characters?.[this_chid as unknown as number]?.name;
    if (name.value !== new_name) {
      id.value = this_chid;
      name.value = new_name;
    }
  });

  const settings = ref<CharacterSettings>(getSettings(id.value));

  // Refresh settings when switching character cards, but do not trigger settings save
  watch([id, name], ([new_id]) => {
    ignoreUpdates(() => {
      settings.value = getSettings(new_id);
    });
  });

  // Refresh settings when Replacing/Updating character card, but do not trigger settings save
  $('#character_replace_file').on('click', () => {
    eventSource.once(event_types.CHAT_CHANGED, () => {
      ignoreUpdates(async () => {
        const current_id = id.value;
        settings.value = getSettings(current_id);

        // And replace Lorebook
        if ($('#world_button').hasClass('world_set')) {
          const book = characters[Number(current_id)]?.data?.character_book;
          if (book) {
            const book_name = book.name || `${characters[Number(current_id)]?.name}'s Lorebook`;
            await saveWorldInfo(book_name, fromCharacterBook(book), true);
            await updateWorldInfoList();
            $('#character_world').val(book_name).trigger('change');
          }
        }
      });
    });
  });

  // Save latest Lorebook before exporting character card
  $('#export_button').on('click', async () => {
    const book_name = $('#character_world').val() as string;
    if (book_name) {
      await saveWorldInfo(book_name, await loadWorldInfo(book_name), true);
    }
  });

  // Save when modifying settings within a character card
  const { ignoreUpdates } = watchIgnorable(
    settings,
    new_settings => {
      if (id.value !== undefined) {
        saveSettingsDebounced(id.value, klona(new_settings));
      }
    },
    { deep: true },
  );

  // Listening to id does not correctly reflect import of new character card, should listen outside name
  return { id: readonly(id), name: readonly(name), settings };
});
