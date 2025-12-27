<template>
  <!-- prettier-ignore -->
  <div class="relative h-full w-full overflow-hidden">
    <!-- Text edit: Normal mode display textarea -->
    <textarea
      v-show="!isSearching"
      ref="textareaRef"
      v-model="textContent"
      class="absolute inset-0 h-full w-full resize-none! th-text-sm!"
      spellcheck="false"
      @blur="handleSave"
    ></textarea>

    <!-- Search mode: Hide textarea, show highlighted div (style copied from textarea） -->
    <div
      v-show="isSearching"
      ref="highlightRef"
      class="absolute inset-0 overflow-auto whitespace-pre-wrap"
    >
      <Highlighter :query="props.searchInput">{{ textContent }}</Highlighter>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  data: Record<string, unknown> | unknown[];
  searchInput: RegExp | null;
}>();

const emit = defineEmits<{
  (event: 'update:data', value: Record<string, unknown> | unknown[]): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const highlightRef = ref<HTMLDivElement | null>(null);
const textContent = ref('');
const isDirty = ref(false);
const isInitialized = ref(false);
const isSearching = computed(() => props.searchInput !== null);

/**
 * Format object to readable JSON text
 * @param {any} data - Data to format
 * @returns {string} Formatted JSON string
 */
const formatDataToText = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to format data:', error);
    return '{}';
  }
};

/**
 * Parse text to object
 * @param {string} text - JSON text to parse
 * @returns {Object} Parse Result
 * @returns {any} returns.data - Parsed data
 * @returns {boolean} returns.success - Whether parse successful
 * @returns {string} returns.error - Error info (if any ）
 */
const parseTextToData = (text: string): { data: any; success: boolean; error?: string } => {
  try {
    const parsed = JSON.parse(text);
    return { data: parsed, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, success: false, error: errorMessage };
  }
};

/**
 * Save text content changes
 */
const handleSave = () => {
  if (!isDirty.value) return;

  const { data, success, error } = parseTextToData(textContent.value);

  if (!success) {
    toastr.error(`JSON Format error: ${error || 'Unknown error'}`);
    // Restore original content
    textContent.value = formatDataToText(props.data);
    isDirty.value = false;
    return;
  }

  // Check if data type matches
  const isOriginalArray = Array.isArray(props.data);
  const isParsedArray = Array.isArray(data);

  if (isOriginalArray !== isParsedArray) {
    toastr.error('Data type mismatch, cannot save');
    textContent.value = formatDataToText(props.data);
    isDirty.value = false;
    return;
  }

  emit('update:data', data);
  isDirty.value = false;
  toastr.success('Text content saved');
};

// Initialize text content
watch(
  () => props.data,
  newData => {
    if (!isDirty.value) {
      textContent.value = formatDataToText(newData);
      if (!isInitialized.value) {
        isInitialized.value = true;
      }
    }
  },
  { immediate: true, deep: true },
);

watch(textContent, () => {
  if (isInitialized.value) {
    isDirty.value = true;
  }
});

// Click outside to save
const stopClickOutside = onClickOutside(textareaRef, () => {
  handleSave();
});

onBeforeUnmount(() => {
  if (stopClickOutside) {
    stopClickOutside();
  }
});

/**
 * Copy textarea key styles to highlight container, ensure seamless switching
 */
function copyTextareaStyles() {
  const ta = textareaRef.value;
  const hi = highlightRef.value;
  if (!ta || !hi) return;
  const cs = window.getComputedStyle(ta);
  const keys: Array<string> = [
    'font-size',
    'line-height',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-radius',
    'background-color',
  ];
  for (const prop of keys) {
    const v = cs.getPropertyValue(prop);
    if (v) hi.style.setProperty(prop, v);
  }
  hi.style.whiteSpace = 'pre-wrap';
  hi.style.overflow = 'auto';
}

// Sync scroll position and copy style when switching search view
watch(isSearching, async val => {
  await nextTick();
  if (val) {
    copyTextareaStyles();
    if (textareaRef.value && highlightRef.value) {
      highlightRef.value.scrollTop = textareaRef.value.scrollTop;
      highlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
    }
  } else if (textareaRef.value && highlightRef.value) {
    textareaRef.value.scrollTop = highlightRef.value.scrollTop;
    textareaRef.value.scrollLeft = highlightRef.value.scrollLeft;
  }
});

onMounted(() => {
  if (isSearching.value) nextTick(copyTextareaStyles);
});
</script>
