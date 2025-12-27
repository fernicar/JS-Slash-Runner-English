<template>
  <Item type="plain">
    <template #title>{{ t`Enable Renderer` }}</template>
    <template #description>{{ t`When enabled, matching code blocks will be rendered` }}</template>
    <template #content>
      <Toggle id="TH-render-enabled" v-model="enabled" />
    </template>
  </Item>
  <Divider />
  <Item type="plain">
    <template #title>{{ t`Enable Code Folding` }}</template>
    <template #description>
      {{ t`Collapse specific types of code blocks. When "Frontend Only" is selected, only code blocks that can be rendered as frontend interfaces but aren't rendered will be collapsed` }}
    </template>
    <template #content>
      <RadioButtonGroup v-model="collapse_code_block" :options="collapse_code_block_options" />
    </template>
  </Item>
  <Divider />
  <Item type="plain">
    <template #title>{{ t`Enable Blob URL Rendering` }}</template>
    <template #description>
      {{ t`Use Blob URL to render frontend interface, more convenient for f12 developer tools debugging. If interface rendering issues occur, try disabling this option` }}
    </template>
    <template #content>
      <Toggle id="TH-render-use-blob-url" v-model="use_blob_url" />
    </template>
  </Item>
  <Divider />
  <Item type="plain">
    <template #title>{{ t`Render Depth` }}</template>
    <template #description>{{ t`Set the number of floors to render, counting from the latest floor. When 0, all floors will be rendered` }}</template>
    <template #content>
      <input v-model="depth" class="text_pole w-3.5!" type="number" :min="0" />
    </template>
  </Item>

  <template v-for="{ message_id, reload_memo, elements } in runtimes" :key="message_id + reload_memo">
    <Teleport v-for="(element, index) in elements" :key="index" defer :to="element">
      <Iframe :id="`${message_id}--${index}`" :element="element" :use-blob-url="use_blob_url" />
    </Teleport>
  </template>

  <Teleport defer to="#extensionsMenu">
    <div class="extension_container">
      <div
        class="list-group-item flex-container flexGap5 interactable"
        tabindex="0"
        role="listitem"
        @click="enabled = !enabled"
      >
        <div class="fa-solid fa-puzzle-piece extensionsMenuExtensionButton" />
        <span>{{ enabled ? t`Disable Frontend Rendering` : t`Enable Frontend Rendering` }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Iframe from '@/panel/render/Iframe.vue';
import { useMacroLike } from '@/panel/render/macro_like';
import { useOptimizeHljs } from '@/panel/render/optimize_hljs';
import { useCollapseCodeBlock } from '@/panel/render/use_collapse_code_block';
import { useMessageIframeRuntimesStore } from '@/store/iframe_runtimes';
import { useGlobalSettingsStore } from '@/store/settings';
import { useBetterChatTruncation } from './render/use_better_chat_truncation';

const global_settings = useGlobalSettingsStore();
const { enabled, collapse_code_block, use_blob_url, depth } = toRefs(global_settings.settings.render);
const { enabled: macro_enabled } = toRefs(global_settings.settings.macro);

const collapse_code_block_options = [
  {
    label: t`All`,
    value: 'all',
  },
  {
    label: t`Frontend Only`,
    value: 'frontend_only',
  },
  {
    label: t`Disable`,
    value: 'none',
  },
];

useBetterChatTruncation(enabled);
useOptimizeHljs(enabled);
const enable_collapse_code_block = computed(() => {
  if (!enabled.value) {
    return 'none';
  }
  return collapse_code_block.value;
});
useCollapseCodeBlock(enable_collapse_code_block);
useMacroLike(macro_enabled);
const runtimes = toRef(useMessageIframeRuntimesStore(), 'runtimes');
</script>

<style>
.TH-render:has(.TH-collapse-code-block-button:not(.hidden\!)):has(pre.hidden\!) {
  display: inline-block;
}
</style>
