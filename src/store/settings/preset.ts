import { PresetSettings, setting_field } from '@/type/settings';
import { preset_manager } from '@/util/tavern';
import { eventSource, event_types, saveSettingsDebounced } from '@sillytavern/script';
import { oai_settings } from '@sillytavern/scripts/openai';

function getSettings(id: string): PresetSettings {
  const settings = _.get(preset_manager.getPresetList().presets[Number(id)], 'extensions.tavern_helper', {});
  const parsed = PresetSettings.safeParse(settings);
  if (!parsed.success) {
    toastr.warning(parsed.error.message, t`[TavernHelper] Failed to read preset data, will use empty data`);
    return PresetSettings.parse({});
  }
  return PresetSettings.parse(parsed.data);
}

function saveSettingsToMemoryDebounced(settings: PresetSettings) {
  _.set(oai_settings, `extensions.${setting_field}`, settings);
  saveSettingsDebounced();
}

async function saveSettingsToFile(id: string, settings: PresetSettings) {
  _.set(preset_manager.getPresetList().presets[Number(id)], `extensions.${setting_field}`, settings);
  await preset_manager.savePreset(
    Object.keys(preset_manager.getPresetList().preset_names)[Number(id)],
    preset_manager.getPresetList().presets[Number(id)],
    { skipUpdate: true },
  );
}
const saveSettingsToFileDebounced = _.debounce(saveSettingsToFile, 1000);

export const usePresetSettingsStore = defineStore('preset_settings', () => {
  const id = ref<string>(preset_manager.getSelectedPreset());
  const name = ref<string>(Object.keys(preset_manager.getPresetList().preset_names)[Number(id.value)]);
  // Refresh id and ... when switching preset settings
  eventSource.makeFirst(event_types.OAI_PRESET_CHANGED_AFTER, () => {
    const new_id = preset_manager.getSelectedPreset();
    const new_name = Object.keys(preset_manager.getPresetList().preset_names)[Number(new_id)];
    if (name.value !== new_name) {
      id.value = new_id;
      name.value = new_name;
    }
  });

  const settings = ref<PresetSettings>(getSettings(id.value));
  // Refresh settings when switching preset, but do not trigger settings save
  watch([id, name], ([new_id]) => {
    ignoreUpdates(() => {
      settings.value = getSettings(new_id);
    });
  });

  // Save when modifying settings within a preset
  const { ignoreUpdates } = watchIgnorable(
    settings,
    new_settings => {
      if (id.value === preset_manager.getSelectedPreset()) {
        saveSettingsToMemoryDebounced(klona(new_settings));
      }
      saveSettingsToFileDebounced(id.value, klona(new_settings));
    },
    { deep: true },
  );

  // Listening to id does not correctly reflect import of new preset, should listen outside name
  return { id: readonly(id), name: readonly(name), settings };
});
