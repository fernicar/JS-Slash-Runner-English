import { ChatSettings, setting_field } from '@/type/settings';
import { chat_metadata, eventSource, event_types, getCurrentChatId } from '@sillytavern/script';
import { saveMetadataDebounced } from '@sillytavern/scripts/extensions';

function getSettings(): ChatSettings {
  const settings = _.get(chat_metadata, setting_field, {});
  const parsed = ChatSettings.safeParse(settings);
  if (!parsed.success) {
    toastr.warning(parsed.error.message, t`[TavernHelper] Failed to read chat data, will use empty data`);
    return ChatSettings.parse({});
  }
  return ChatSettings.parse(parsed.data);
}

export const useChatSettingsStore = defineStore('chat_settings', () => {
  const id = ref<string | undefined>(getCurrentChatId());
  // Refresh id and ... when switching chat settings
  eventSource.makeFirst(event_types.CHAT_CHANGED, (new_chat_id: string | undefined) => {
    if (id.value !== new_chat_id) {
      id.value = new_chat_id;
    }
  });

  const settings = ref<ChatSettings>(getSettings());

  // Refresh settings when switching chat, but do not trigger settings save
  watch(id, () => {
    ignoreUpdates(() => {
      settings.value = getSettings();
    });
  });

  // Save when modifying settings within a chat
  const { ignoreUpdates } = watchIgnorable(
    settings,
    new_settings => {
      if (id.value !== undefined) {
        _.set(chat_metadata, setting_field, klona(new_settings));
        saveMetadataDebounced();
      }
    },
    { deep: true },
  );

  return { id: readonly(id), settings };
});
