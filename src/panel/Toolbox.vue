<template>
  <div class="flex flex-col gap-0.75">
    <Item type="box">
      <template #title>{{ t`Prompt Viewer` }}</template>
      <template #description>{{ t`View current prompt transmission status; listens for new transmissions and updates display when window is open` }}</template>
      <template #content>
        <Button @click="enable_prompt_viewer = true">{{ t`Open` }}</Button>
      </template>
    </Item>

    <Item type="box">
      <template #title>{{ t`Variable Manager` }}</template>
      <template #description>{{ t`View and manage Global, Character, Chat, and Message Floor variables` }}</template>
      <template #content>
        <Button @click="enable_variable_manager = true">{{ t`Open` }}</Button>
      </template>
    </Item>

    <Item type="box">
      <template #title>{{ t`Log Viewer` }}</template>
      <template #description>{{ t`View console logs of scripts and rendered interfaces` }}</template>
      <template #content>
        <Button @click="enable_logger = true">{{ t`Open` }}</Button>
      </template>
    </Item>

    <AudioPlayer />
  </div>

  <Teleport defer to="#extensionsMenu">
    <div class="extension_container">
      <div
        class="list-group-item flex-container flexGap5 interactable"
        tabindex="0"
        role="listitem"
        @click="enable_prompt_viewer = true"
      >
        <div class="fa-solid fa-magnifying-glass extensionsMenuExtensionButton" />
        <span>{{ t`Prompt Viewer` }}</span>
      </div>
      <div
        class="list-group-item flex-container flexGap5 interactable"
        tabindex="0"
        role="listitem"
        @click="enable_variable_manager = true"
      >
        <div class="fa-solid fa-square-root-variable extensionsMenuExtensionButton" />
        <span>{{ t`Variable Manager` }}</span>
      </div>
      <div
        class="list-group-item flex-container flexGap5 interactable"
        tabindex="0"
        role="listitem"
        @click="enable_logger = true"
      >
        <div class="fa-solid fa-file-invoice extensionsMenuExtensionButton" />
        <span>{{ t`Log Viewer` }}</span>
      </div>
    </div>
  </Teleport>

  <Dialog
    v-if="enable_prompt_viewer"
    storage-id="prompt-viewer"
    :title="t`Prompt Viewer`"
    :show-guide="true"
    @close="enable_prompt_viewer = false"
    @open-guide-popup="showPromptViewerHelp"
  >
    <PromptViewer />
  </Dialog>
  <Dialog
    v-if="enable_variable_manager"
    storage-id="variable-manager"
    :title="t`Variable Manager`"
    @close="enable_variable_manager = false"
  >
    <VariableManager />
  </Dialog>
  <Dialog v-if="enable_logger" storage-id="logger" :title="t`Log Viewer`" @close="enable_logger = false">
    <Logger />
  </Dialog>
</template>

<script setup lang="ts">
import Popup from '@/panel/component/Popup.vue';
import AudioPlayer from '@/panel/toolbox/AudioPlayer.vue';
import Logger from '@/panel/toolbox/Logger.vue';
import help_en from '@/panel/toolbox/prompt_viewer/help_en.md?raw';
import help_zh from '@/panel/toolbox/prompt_viewer/help_zh.md?raw';
import PromptViewer from '@/panel/toolbox/PromptViewer.vue';
import VariableManager from '@/panel/toolbox/VariableManager.vue';
import { renderMarkdown } from '@/util/tavern';
import { getCurrentLocale } from '@sillytavern/scripts/i18n';

const enable_prompt_viewer = ref<boolean>(false);
const enable_variable_manager = ref<boolean>(false);
const enable_logger = ref<boolean>(false);

/**
 * Show Prompt Viewer help info
 */
const { open: showPromptViewerHelp } = useModal({
  component: Popup,
  attrs: {
    width: 'wide',
  },
  slots: {
    default: `<div class="text-left p-1.5">${renderMarkdown(getCurrentLocale().includes('zh') ? help_zh : help_en)}</div>`,
  },
});
</script>
