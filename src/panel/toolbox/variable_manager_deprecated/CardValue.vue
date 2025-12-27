<template>
  <!-- prettier-ignore -->
  <CardBase
    v-model:name="name"
    v-model:content="content"
    v-model:collapsed="isCollapsed"
    :depth="props.depth"
    :type-label="
      contentType === 'string'
        ? t`String`
        : contentType === 'number'
          ? t`Number`
          : contentType === 'boolean'
            ? t`Boolean`
            : t`Null`
    "
    :icon="
      contentType === 'string'
        ? 'fa-regular fa-font'
        : contentType === 'number'
          ? 'fa-solid fa-hashtag'
          : contentType === 'boolean'
            ? 'fa-solid fa-toggle-on'
            : 'fa-regular fa-circle-dot'
    "
    collapsible
    :search-input="props.searchInput"
    @delete="emitDelete"
  >
    <div
      v-show="!isCollapsed"
      class="
        mt-0.25 th-text-xs leading-snug break-words break-all whitespace-normal text-(--SmartThemeBodyColor)
        sm:th-text-sm sm:leading-relaxed
        md:th-text-base md:leading-normal
      "
    >
      <template v-if="!isEditingValue">
        <div
          ref="valueDisplayRef"
          class="cursor-text break-words break-all whitespace-pre-wrap"
          @dblclick.stop.prevent="startValueEditing"
          @touchend="handleValueTouchEnd"
        >
          <Highlighter :query="props.searchInput">{{ formattedValue }}</Highlighter>
        </div>
      </template>
      <template v-else>
        <textarea
          ref="valueInputRef"
          v-model="valueDraft"
          :style="valueInputInlineStyle"
          class="
            w-full resize-none rounded border border-(--SmartThemeQuoteColor)/40 bg-transparent px-0.5 py-0.25 th-text-xs
            text-(--SmartThemeQuoteColor)
            focus:border-(--SmartThemeQuoteColor) focus:outline-none
            sm:th-text-sm
            md:th-text-base
          "
          @keydown="handleValueInputKeydown"
        ></textarea>
      </template>
    </div>
  </CardBase>
</template>

<script setup lang="ts">
import CardBase from '@/panel/toolbox/variable_manager/Card.vue';
import type { FiltersState } from '@/panel/toolbox/variable_manager/filter';
import { isSearching as isSearchingUtil, nodeMatchesSearch } from '@/panel/toolbox/variable_manager/search';
import { onClickOutside } from '@vueuse/core';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

const name = defineModel<number | string>('name', { required: true });
const content = defineModel<any>('content', { required: true });

const emit = defineEmits<{
  (e: 'delete', payload: { name: number | string; content: any }): void;
}>();

const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
    depth?: number;
    filters: FiltersState;
    searchInput: RegExp | null;
  }>(),
  {
    collapsed: false,
    depth: 0,
  },
);

const isCollapsed = ref(props.collapsed ?? false);

watch(
  () => props.collapsed,
  value => {
    if (value === undefined) return;
    if (value !== isCollapsed.value) {
      isCollapsed.value = value;
    }
  },
);

const valueDisplayRef = ref<HTMLElement | null>(null);
const valueInputRef = ref<HTMLTextAreaElement | null>(null);
const isEditingValue = ref(false);
const valueDraft = ref('');
const valueInputSize = ref<{ width: string; height: string } | null>(null);
let stopValueOutside: (() => void) | null = null;

const MIN_INPUT_WIDTH = 40;
const MIN_INPUT_HEIGHT = 24;
const DOUBLE_TAP_THRESHOLD = 300;

const computeInputSize = (el: HTMLElement | null) => {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const width = Math.max(rect.width || el.offsetWidth || MIN_INPUT_WIDTH, MIN_INPUT_WIDTH);
  const height = Math.max(rect.height || el.offsetHeight || MIN_INPUT_HEIGHT, MIN_INPUT_HEIGHT);
  return {
    width: `${width}px`,
    height: `${height}px`,
  };
};

type ContentType = 'string' | 'number' | 'boolean' | 'nil';
type Primitive = string | number | boolean | null | undefined;

/**
 * Emit delete event
 * Send delete current variable signal to parent, including variable name and content
 */
const emitDelete = () => {
  emit('delete', {
    name: name.value,
    content: content.value,
  });
};

/**
 * Calculate content type
 * Determine data type based on actual variable value, used for UI display and formatting
 * @returns {'string'|'number'|'boolean'|'nil'} Data type of content
 */
const contentType = computed<ContentType>(() => {
  const v = content.value;
  if (v === null || v === undefined) return 'nil';
  const t = typeof v;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  // Fallback to string display
  return 'string';
});

/**
 * Format display value
 * Convert variable raw value to string format suitable for UI display
 * @returns {string} Formatted display string
 */
const formattedValue = computed(() => {
  const v = content.value;
  switch (contentType.value) {
    case 'string':
      return v === '' ? '""' : String(v);
    case 'number':
      return String(v);
    case 'boolean':
      return v ? 'true' : 'false';
    case 'nil':
      return v === null ? 'null' : 'undefined';
    default:
      return String(v);
  }
});

const isSearching = computed(() => props.searchInput !== null);

// Auto-expand when search hit
const searchMatched = computed(() => {
  if (!isSearchingUtil(props.searchInput)) return false;
  const q = props.searchInput as string | RegExp;
  return nodeMatchesSearch(name.value as any, content.value, q);
});

watch(
  () => searchMatched.value,
  matched => {
    if (matched && isCollapsed.value) {
      isCollapsed.value = false;
    }
  },
  { immediate: true },
);

/**
 * Calculate inline style for input box
 */
const valueInputInlineStyle = computed(() => {
  if (!valueInputSize.value) return {};
  return {
    width: valueInputSize.value.width,
    height: valueInputSize.value.height,
  };
});

/**
 * Format raw value to string displayed during editing
 */
const formatValueForEdit = (value: Primitive): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return String(value);
};

/**
 * Loosely parse string value to corresponding JavaScript value
 */
const parseLooseValue = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed !== '' && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  return raw;
};

/**
 * Force convert input string value based on current value type
 */
const coerceValue = (raw: string): { value: unknown; success: boolean } => {
  const currentType = contentType.value;
  const trimmed = raw.trim();

  if (currentType === 'string') {
    return { value: raw, success: true };
  }

  if (currentType === 'number') {
    if (!trimmed.length) {
      return { value: content.value, success: false };
    }
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return { value: num, success: true };
    }
    return { value: parseLooseValue(raw), success: true };
  }

  if (currentType === 'boolean') {
    if (/^(true|false)$/i.test(trimmed)) {
      return { value: trimmed.toLowerCase() === 'true', success: true };
    }
    if (!trimmed.length) {
      return { value: content.value, success: false };
    }
    return { value: parseLooseValue(raw), success: true };
  }

  return { value: parseLooseValue(raw), success: true };
};

/**
 * Finish value edit state, clean up related resources
 */
const finishValueEditing = () => {
  isEditingValue.value = false;
  if (stopValueOutside) {
    stopValueOutside();
    stopValueOutside = null;
  }
  valueInputSize.value = null;
  toastr.success(t`Successfully edited value`);
};

/**
 * Start editing value, initialize edit state and event listeners
 */
const startValueEditing = () => {
  if (isEditingValue.value) return;
  valueDraft.value = formatValueForEdit(content.value as Primitive);
  valueInputSize.value = computeInputSize(valueDisplayRef.value);
  isEditingValue.value = true;
  nextTick(() => {
    if (valueInputRef.value) {
      valueInputRef.value.focus();
      valueInputRef.value.select();
    }
  });
  if (stopValueOutside) {
    stopValueOutside();
  }
  stopValueOutside = onClickOutside(valueInputRef, () => {
    saveValueEditing();
  });
};

/**
 * Save value edit result, trigger update if value changed
 */
const saveValueEditing = () => {
  if (!isEditingValue.value) return;
  const original = content.value;
  const { value: parsedValue, success } = coerceValue(valueDraft.value);
  finishValueEditing();
  if (!success) {
    valueDraft.value = formatValueForEdit(original as Primitive);
    return;
  }
  if (!Object.is(parsedValue, original)) {
    content.value = parsedValue;
  }
};

/**
 * Cancel value edit, restore raw value
 */
const cancelValueEditing = () => {
  if (!isEditingValue.value) return;
  valueDraft.value = formatValueForEdit(content.value as Primitive);
  finishValueEditing();
};

/**
 * Handle keyboard events in value input box
 */
const handleValueInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    saveValueEditing();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelValueEditing();
  }
};

let lastValueTapTime = 0;

/**
 * Handle touch events in value area, double tap to trigger edit
 */
const handleValueTouchEnd = (event: TouchEvent) => {
  const now = event.timeStamp;
  if (now - lastValueTapTime <= DOUBLE_TAP_THRESHOLD) {
    event.preventDefault();
    event.stopPropagation();
    startValueEditing();
  }
  lastValueTapTime = now;
};

// Listen for value changes, auto-update edit draft
watch(
  () => content.value,
  newValue => {
    if (isEditingValue.value) {
      valueDraft.value = formatValueForEdit(newValue as Primitive);
    }
  },
);

// Clean up resources before component unmount
onBeforeUnmount(() => {
  if (stopValueOutside) {
    stopValueOutside();
    stopValueOutside = null;
  }
});
</script>
