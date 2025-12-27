<template>
  <iframe
    :id="prefixed_id"
    :name="prefixed_id"
    ref="iframe_ref"
    loading="lazy"
    v-bind="src_prop"
    class="w-full"
    frameborder="0"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
import { createSrcContent } from '@/panel/render/iframe';
import { eventSource } from '@sillytavern/script';

const props = defineProps<{
  id: string;
  element: HTMLElement;
  useBlobUrl: boolean;
}>();

const $div = $(props.element);
const $pre = $div.children('pre');

const iframe_ref = useTemplateRef<HTMLIFrameElement>('iframe');
onBeforeMount(() => {
  // For unknown reasons, on some devices, when first entering a character card, it triggers "Render Frontend - Replace Macros - Render Frontend", so extra rendered iframes need to be removed.
  $div.find('iframe').remove();
});

// Height adjustment
useEventListener('message', event => {
  if (event?.data?.type === 'TH_ADJUST_IFRAME_HEIGHT' && event?.data?.iframe_name === iframe_ref.value?.id) {
    iframe_ref.value!.style.height = `${event.data.height}px`;
  }
});
useEventListener(window, 'resize', () => {
  iframe_ref.value?.contentWindow?.postMessage({ type: 'TH_UPDATE_VIEWPORT_HEIGHT' }, '*');
});

// Code content
const src_prop = computed((old_src_prop?: { srcdoc?: string; src?: string }) => {
  if (old_src_prop?.src) {
    URL.revokeObjectURL(old_src_prop.src);
  }

  const content = createSrcContent($pre.find('code').text(), props.useBlobUrl);
  if (!props.useBlobUrl) {
    return { srcdoc: content };
  }
  return { src: URL.createObjectURL(new Blob([content], { type: 'text/html' })) };
});
onUnmounted(() => {
  if (src_prop.value.src) {
    URL.revokeObjectURL(src_prop.value.src);
  }
});

// Related events
const prefixed_id = computed(() => `TH-message--${props.id}`);
onMounted(() => {
  eventSource.emit('message_iframe_render_started', prefixed_id.value);
});
function onLoad() {
  eventSource.emit('message_iframe_render_ended', prefixed_id.value);
}

// Compatibility with collapsible code blocks
onMounted(() => {
  $div
    .children()
    .filter((_index, child) => !$(child).is('iframe'))
    .addClass('hidden!');
});
onBeforeUnmount(() => {
  const $button = $div.children('.TH-collapse-code-block-button');
  if ($button.length === 0) {
    $pre.removeClass('hidden!');
  } else {
    $button.text('Show frontend code block').removeClass('hidden!');
  }
});
</script>
