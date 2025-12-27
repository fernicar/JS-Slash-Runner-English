<template>
  <DefineActionButton v-slot="{ icon, title, colorClass, onClick, disabled }">
    <div
      :class="[
        'inline-flex items-center justify-center px-0.25',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        colorClass,
      ]"
      :title="title"
      :disabled="disabled"
      @click.stop="
        () => {
          if (!disabled) onClick?.();
        }
      "
    >
      <i :class="icon"></i>
    </div>
  </DefineActionButton>
  <!-- prettier-ignore -->
  <div
    v-if="isRoot"
    class="
      flex flex-wrap items-center justify-between gap-0.5 rounded border border-(--SmartThemeQuoteColor)/40
      bg-(--SmartThemeBGColor)/60 px-0.5 py-0.25 th-text-sm
    "
  >
    <div
      class="flex flex-1 flex-wrap items-center gap-0.25 text-(--SmartThemeQuoteColor)"
      :title="selectedJsPath || undefined"
    >
      <template v-if="breadcrumbSegments.length">
        <template v-for="(segment, index) in breadcrumbSegments" :key="`${segment}-${index}`">
          <span class="font-medium">{{ segment }}</span>
          <span v-if="index !== breadcrumbSegments.length - 1" class="th-text-xs text-(--SmartThemeBodyColor)"> > </span>
        </template>
      </template>
      <span v-else class="text-(--SmartThemeBodyColor)/70">Click any key name to view path</span>
    </div>
    <div class="inline-flex items-center gap-0.25">
      <div
        class="
          inline-flex shrink-0 items-center gap-0.25 py-0.25 th-text-sm text-(--SmartThemeQuoteColor) transition-colors
          hover:bg-(--SmartThemeQuoteColor)/15
          disabled:cursor-not-allowed disabled:opacity-60
        "
        type="button"
        :disabled="!canCopySelectedPath"
        title="Copy Path"
        @click="copySelectedPath"
      >
        <i class="fa-solid fa-copy"></i>
      </div>


    </div>
  </div>
  <div v-if="shouldRender" class="th-text-sm select-text">
    <div :class="nodeRowClass" :style="indentStyle">
      <span
        v-if="!isPrimitive"
        class="inline-flex shrink-0 cursor-pointer items-center justify-center th-text-sm leading-none select-none"
        @click="toggleCollapse()"
      >
        <svg
          :style="{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }"
          class="transition-transform duration-200"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4.5 2L8.5 6L4.5 10V2Z" />
        </svg>
      </span>
      <span v-else class="inline-block shrink-0 pl-[12px]"></span>
      <span
        v-if="nodeKey !== null"
        class="flex shrink-0 items-center gap-0.25 self-start text-(--SmartThemeQuoteColor)"
      >
        <template v-if="!isEditingKey">
          <span
            ref="keyDisplayRef"
            :class="[
              'inline-flex items-center break-all whitespace-pre-wrap transition-colors duration-150',
              canEditKey ? 'cursor-text select-text' : 'cursor-pointer select-none',
              isSelected ? 'font-semibold text-(--SmartThemeQuoteColor)' : '',
            ]"
            @click="handleKeyAreaClick"
            @dblclick.stop.prevent="handleKeyAreaDoubleActivate"
            @touchend="handleKeyAreaTouchEnd"
          >
            <Highlighter :query="props.searchInput">
              {{ nodeKey }}
            </Highlighter>
          </span>
        </template>
        <template v-else>
          <!-- prettier-ignore -->
          <input
            ref="keyInputRef"
            v-model="keyDraft"
            :style="keyInputInlineStyle"
            class="
              rounded border border-(--SmartThemeQuoteColor)/40 bg-transparent px-0.25 th-text-sm!
              text-(--SmartThemeQuoteColor)
              focus:border-(--SmartThemeQuoteColor) focus:outline-none
            "
            @keydown="handleKeyInputKeydown"
          />
        </template>
        <span class="select-none">:</span>
      </span>

      <span v-if="isPrimitive">
        <span
          v-if="!isEditingValue"
          ref="valueDisplayRef"
          :class="['cursor-text break-words break-all whitespace-pre-wrap', valueTypeClass]"
          @dblclick.stop.prevent="startValueEditing"
          @touchend="handleValueTouchEnd"
        >
          <!-- Highlight matching fragments for string values during search, otherwise use original display -->
          <template v-if="isSearching && isStringValue">
            <Highlighter :query="props.searchInput">
              {{ stringValueWithQuotes }}
            </Highlighter>
          </template>
          <template v-else>
            {{ valuePreview }}
          </template>
        </span>
        <!-- prettier-ignore -->
        <textarea
          v-else
          ref="valueInputRef"
          v-model="valueDraft"
          :style="valueInputInlineStyle"
          class="
            resize-none rounded border border-(--SmartThemeQuoteColor)/40 bg-transparent px-0.25 th-text-sm!
            text-(--SmartThemeBodyColor)
            focus:border-(--SmartThemeQuoteColor) focus:outline-none
          "
          @keydown="handleValueInputKeydown"
        ></textarea>
      </span>

      <span v-else class="flex items-center gap-0.5">
        <span class="font-bold text-gray-500">{{ isArray ? '[' : '{' }}</span>
        <span v-if="collapsed" class="text-gray-500 italic">{{ valuePreview }}</span>
        <span v-if="collapsed" class="font-bold text-gray-500">{{ isArray ? ']' : '}' }}</span>
      </span>

      <span v-if="isSelected" class="ml-auto inline-flex items-center gap-0.25">
        <ActionButton
          v-if="!isPrimitive"
          icon="fa-solid fa-plus"
          title="Add Variable"
          color-class="text-(--SmartThemeQuoteColor)"
          :on-click="openAddChild"
        />
        <ActionButton
          v-if="nodeKey !== null && parentType !== null"
          icon="fa-solid fa-trash"
          :title="isArray ? 'Delete variable' : 'Delete key'"
          color-class="text-(--warning)"
          :on-click="confirmAndDeleteSelf"
        />
      </span>
      <!-- Top-level resident: Add and Clear -->
      <div v-if="!isSelected" class="ml-auto inline-flex items-center gap-0.25">
        <ActionButton
          v-if="isRoot && !isPrimitive"
          icon="fa-solid fa-plus"
          title="Add Variable"
          color-class="text-(--SmartThemeQuoteColor)"
          :on-click="openAddChild"
        />
        <ActionButton
          v-if="isRoot"
          icon="fa-solid fa-trash"
          title="Delete Variable"
          color-class="text-(--warning)"
          :on-click="clearRoot"
        />
      </div>
    </div>

    <template v-if="!isPrimitive && !collapsed">
      <TreeMode
        v-for="[key, value] in filteredEntries"
        :key="key"
        :data="value as any"
        :path="[...path, key]"
        :depth="depth + 1"
        :node-key="key"
        :filters="filters"
        :search-input="props.searchInput"
        :parent-type="isArray ? 'array' : isObject ? 'object' : null"
        @update:data="childValue => updateChildValue(key, childValue)"
        @rename-key="newKey => renameChildKey(key, newKey)"
        @delete-self="() => deleteChild(key)"
      />
      <div class="flex items-center gap-0.5" :style="indentStyle">
        <span class="font-bold text-gray-500">{{ isArray ? ']' : '}' }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Popup from '@/panel/component/Popup.vue';
import type { FilterType, FiltersState } from '@/panel/toolbox/variable_manager/filter';
import RootVariableCreator from '@/panel/toolbox/variable_manager/RootVariableCreator.vue';
import { treeControlKey, treeSelectionKey } from '@/panel/toolbox/variable_manager/types';
import { createReusableTemplate, onClickOutside, useToggle, whenever } from '@vueuse/core';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, toRef, watch } from 'vue';
import { useModal } from 'vue-final-modal';

defineOptions({ name: 'TreeMode' });

type Primitive = string | number | boolean | null | undefined;

const emit = defineEmits<{
  (event: 'update:data', value: Record<string, unknown> | unknown[] | Primitive): void;
  (event: 'rename-key', value: string | number): void;
  (event: 'delete-self'): void;
}>();

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown> | unknown[] | Primitive;
    filters: FiltersState;
    searchInput: RegExp | null;
    path?: (string | number)[];
    depth?: number;
    nodeKey?: string | number | null;
    parentType?: 'object' | 'array' | null;
  }>(),
  {
    path: () => [],
    depth: 0,
    nodeKey: null,
    parentType: null,
  },
);

const keyDisplayRef = ref<HTMLElement | null>(null);
const keyInputRef = ref<HTMLInputElement | null>(null);
const valueDisplayRef = ref<HTMLElement | null>(null);
const valueInputRef = ref<HTMLTextAreaElement | null>(null);

// Reusable operation buttons (Add/Delete etc.）
const [DefineActionButton, ActionButton] = createReusableTemplate<{
  icon: string;
  title: string;
  colorClass?: string;
  onClick?: () => void;
  disabled?: boolean;
}>();

const isEditingKey = ref(false);
const isEditingValue = ref(false);

const keyDraft = ref('');
const valueDraft = ref('');

const keyInputSize = ref<{ width: string; height: string } | null>(null);
const valueInputSize = ref<{ width: string; height: string } | null>(null);

const isRootNode = (props.depth ?? 0) === 0;
const isRoot = computed(() => isRootNode);

const identifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const numericSegmentPattern = /^\d+$/;

const formatSegmentForDisplay = (segment: string | number) => {
  if (typeof segment === 'number') return `[${segment}]`;
  const segmentString = String(segment);
  if (numericSegmentPattern.test(segmentString)) {
    return `[${segmentString}]`;
  }
  return segmentString;
};

const buildJsPath = (path: (string | number)[]) => {
  if (!path.length) return '';
  return path.reduce((acc: string, segment) => {
    if (typeof segment === 'number') {
      return `${acc}${acc.length ? '' : ''}[${segment}]`;
    }
    const segmentString = String(segment);
    if (!acc.length) {
      if (identifierPattern.test(segmentString)) return segmentString;
      if (numericSegmentPattern.test(segmentString)) return `[${segmentString}]`;
      return `[${JSON.stringify(segmentString)}]`;
    }
    if (numericSegmentPattern.test(segmentString)) {
      return `${acc}[${segmentString}]`;
    }
    if (identifierPattern.test(segmentString)) {
      return `${acc}.${segmentString}`;
    }
    return `${acc}[${JSON.stringify(segmentString)}]`;
  }, '');
};

let selectionContext = inject(treeSelectionKey, null);

if (!selectionContext && isRootNode) {
  const selectedPath = ref<(string | number)[] | null>(null);
  const selectedSegments = ref<string[]>([]);
  const selectedJsPath = ref('');
  const selectPath = (path: (string | number)[]) => {
    const cloned = [...path];
    selectedPath.value = cloned.length ? cloned : null;
    selectedSegments.value = cloned.map(segment => formatSegmentForDisplay(segment));
    selectedJsPath.value = cloned.length ? buildJsPath(cloned) : '';
  };
  selectionContext = {
    selectedPath,
    selectedSegments,
    selectedJsPath,
    selectPath,
  };
  provide(treeSelectionKey, selectionContext);
}

const selectedPath = computed(() => selectionContext?.selectedPath.value ?? null);
const breadcrumbSegments = computed(() => selectionContext?.selectedSegments.value ?? []);
const selectedJsPath = computed(() => selectionContext?.selectedJsPath.value ?? '');
const canCopySelectedPath = computed(() => breadcrumbSegments.value.length > 0 && !!selectedJsPath.value.length);
const nodePath = computed<(string | number)[]>(() => props.path ?? []);

const pathsEqual = (a: (string | number)[] | null, b: (string | number)[]) => {
  if (!a) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const isSelected = computed(() => pathsEqual(selectedPath.value, nodePath.value));

const nodeRowClass = computed(() => [
  'flex items-center gap-0.25 py-0.25 rounded px-0.25 transition-colors duration-150',
  isSelected.value ? 'bg-(--SmartThemeQuoteColor)/15' : '',
]);

const selectCurrentNode = () => {
  if (!selectionContext) return;
  const currentPath = Array.isArray(props.path) ? [...props.path] : [];
  if (!currentPath.length) return;
  selectionContext.selectPath(currentPath);
};

const copyUsingFallback = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const copySelectedPath = async () => {
  if (!canCopySelectedPath.value) return;
  const text = selectedJsPath.value;
  if (!text.length) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      copyUsingFallback(text);
    }
    toastr.success(t`Path copied`);
  } catch {
    try {
      copyUsingFallback(text);
      toastr.success(t`Path copied`);
    } catch {
      toastr.error(t`Cannot copy path, please copy manually`);
    }
  }
};

/**
 * Ensure integrity of inline size object
 * @param {Object|null} size - Size object, containing width and height
 * @param {string} size.width - Width value
 * @param {string} size.height - Height value
 * @returns {Object} Style object containing width and height
 */
const ensureInlineSize = (size: { width: string; height: string } | null) => {
  if (!size) return {};
  return {
    width: size.width,
    height: size.height,
  };
};

const keyInputInlineStyle = computed(() => ensureInlineSize(keyInputSize.value));
const valueInputInlineStyle = computed(() => ensureInlineSize(valueInputSize.value));

let stopKeyOutside: (() => void) | null = null;
let stopValueOutside: (() => void) | null = null;

const [collapsed, toggleCollapse] = useToggle((props.depth ?? 0) > 1);
const filters = toRef(props, 'filters');

const isObject = computed(() => {
  return props.data !== null && typeof props.data === 'object' && !Array.isArray(props.data);
});

const isArray = computed(() => Array.isArray(props.data));

const isPrimitive = computed(() => !isObject.value && !isArray.value);

const canEditKey = computed(() => props.parentType === 'object' && props.nodeKey !== null);

const MIN_INPUT_WIDTH = 40;
const MIN_INPUT_HEIGHT = 24;

/**
 * Calculate input box size
 * @param {HTMLElement|null} el - HTML element to calculate size
 * @returns {Object|null} Size object containing width and height, return if element does not exist null
 * @returns {string} returns.width - Width value (pixels ）
 * @returns {string} returns.height - Height value (pixels ）
 */
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

const treeControl = inject(treeControlKey, null);

if (treeControl) {
  onMounted(() => {
    if (isPrimitive.value) return;
    if (treeControl.lastAction.value === 'expand') {
      collapsed.value = false;
    } else if (treeControl.lastAction.value === 'collapse') {
      collapsed.value = true;
    }
  });

  whenever(
    () => treeControl.collapseAllSignal.value,
    () => {
      if (!isPrimitive.value) {
        collapsed.value = true;
      }
    },
  );

  whenever(
    () => treeControl.expandAllSignal.value,
    () => {
      if (!isPrimitive.value) {
        collapsed.value = false;
      }
    },
  );
}

const valueType = computed(() => {
  if (props.data === null) return 'null';
  if (Array.isArray(props.data)) return 'array';
  return typeof props.data;
});

// Search, highlight and auto-expand logic
const isSearching = computed(() => props.searchInput !== null);
const isStringValue = computed(() => valueType.value === 'string');
const stringValueWithQuotes = computed(() => (typeof props.data === 'string' ? `"${props.data}"` : ''));

/**
 * Judge if text hits query condition (case-insensitive string, or regex ）
 */
const testQuery = (text: string): boolean => {
  const q = props.searchInput as string | RegExp | undefined;
  if (!q || q === '') return false;
  try {
    if (q instanceof RegExp) return q.test(text);
  } catch {
    return false;
  }
  const s = String(q).toLowerCase();
  return text.toLowerCase().includes(s);
};

/**
 * Recursively check if current node (and descendants) has matching string fields
 */
const hasSearchHit = (value: unknown, visited: WeakSet<object> = new WeakSet<object>()): boolean => {
  if (typeof value === 'string') return testQuery(value);
  if (value && typeof value === 'object') {
    if (visited.has(value as object)) return false;
    visited.add(value as object);
    if (Array.isArray(value)) return (value as unknown[]).some(v => hasSearchHit(v, visited));
    const obj = value as Record<string, unknown>;
    return Object.values(obj).some(v => hasSearchHit(v, visited));
  }
  return false;
};

const hasMatchInSubtree = computed(() => (isSearching.value ? hasSearchHit(props.data) : false));

// When searching, auto-expand if hit (do not force reclaim collapse state, only expand ）
watch(
  () => hasMatchInSubtree.value,
  val => {
    if (!isPrimitive.value && val) {
      collapsed.value = false;
    }
  },
  { immediate: true },
);

/**
 * Format raw value to string displayed during editing
 * @param {Primitive} value - Raw value to format
 * @returns {string} Formatted string representation
 */
const formatValueForEdit = (value: Primitive): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return String(value);
};

/**
 * Loosely parse string value to corresponding JavaScript value
 * @param {string} raw - Raw string to parse
 * @returns {unknown} Parsed value, supports null, undefined, boolean, number, JSON object/array or raw string
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
 * @param {string} raw - Raw string to convert
 * @returns {Object} Conversion result object
 * @returns {unknown} returns.value - Converted value
 * @returns {boolean} returns.success - Whether conversion successful
 */
const coerceValue = (raw: string): { value: unknown; success: boolean } => {
  const currentType = valueType.value;
  const trimmed = raw.trim();

  if (currentType === 'string') {
    return { value: raw, success: true };
  }

  if (currentType === 'number') {
    if (!trimmed.length) {
      return { value: props.data, success: false };
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
      return { value: props.data, success: false };
    }
    return { value: parseLooseValue(raw), success: true };
  }

  return { value: parseLooseValue(raw), success: true };
};

/**
 * Finish key edit state, clean up related resources
 */
const finishKeyEditing = () => {
  isEditingKey.value = false;
  if (stopKeyOutside) {
    stopKeyOutside();
    stopKeyOutside = null;
  }
  keyInputSize.value = null;
  toastr.success(t`Successfully edited key name`);
};

/**
 * Start editing key name, initialize edit state and event listeners
 */
const startKeyEditing = () => {
  if (!canEditKey.value || props.nodeKey === null) return;
  keyDraft.value = String(props.nodeKey);
  keyInputSize.value = computeInputSize(keyDisplayRef.value);
  isEditingKey.value = true;
  nextTick(() => {
    if (keyInputRef.value) {
      keyInputRef.value.focus();
      keyInputRef.value.select();
    }
  });
  if (stopKeyOutside) {
    stopKeyOutside();
  }
  stopKeyOutside = onClickOutside(keyInputRef, () => {
    saveKeyEditing();
  });
};

/**
 * Save key edit result, trigger rename event if key name changed
 */
const saveKeyEditing = () => {
  if (!isEditingKey.value) return;
  const oldKey = props.nodeKey;
  const newKey = keyDraft.value.trim();
  finishKeyEditing();
  if (oldKey === null || !newKey.length) return;
  if (newKey === String(oldKey)) return;
  emit('rename-key', newKey);
};

/**
 * Cancel key edit, restore raw key name
 */
const cancelKeyEditing = () => {
  if (!isEditingKey.value) return;
  keyDraft.value = props.nodeKey === null ? '' : String(props.nodeKey);
  finishKeyEditing();
};

/**
 * Handle keyboard events in key input box
 * @param {KeyboardEvent} event - Keyboard event object
 */
const handleKeyInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveKeyEditing();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelKeyEditing();
  }
};

/**
 * Handle click event in key area, distinguish single and double click via delay
 * @param {MouseEvent} event - Mouse event object
 */
const handleKeyAreaClick = (event: MouseEvent) => {
  if (isEditingKey.value) return;
  selectCurrentNode();
  if (!isPrimitive.value) {
    if (event.detail > 1) {
      clearKeyClickTimer();
      return;
    }
    clearKeyClickTimer();
    keyClickTimer = window.setTimeout(() => {
      keyClickTimer = null;
    }, SINGLE_CLICK_DELAY);
  }
};

/**
 * Handle double click in key area, trigger edit
 */
const handleKeyAreaDoubleActivate = () => {
  clearKeyClickTimer();
  if (isEditingKey.value) return;
  selectCurrentNode();
  if (canEditKey.value) {
    startKeyEditing();
    return;
  }
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
  if (!isPrimitive.value || isEditingValue.value) return;
  valueDraft.value = formatValueForEdit(props.data as Primitive);
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
 * Save value edit result, trigger update event if value changed
 */
const saveValueEditing = () => {
  if (!isEditingValue.value) return;
  const original = props.data;
  const { value: parsedValue, success } = coerceValue(valueDraft.value);
  finishValueEditing();
  if (!success) {
    valueDraft.value = formatValueForEdit(original as Primitive);
    return;
  }
  if (!Object.is(parsedValue, original)) {
    emit('update:data', parsedValue as Record<string, unknown> | unknown[] | Primitive);
  }
};

/**
 * Cancel value edit, restore raw value
 */
const cancelValueEditing = () => {
  if (!isEditingValue.value) return;
  valueDraft.value = formatValueForEdit(props.data as Primitive);
  finishValueEditing();
};

/**
 * Handle keyboard events in value input box
 * @param {KeyboardEvent} event - Keyboard event object
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

/**
 * Update child node value
 * @param {string|number} childKey - Key name or index of child node
 * @param {unknown} newValue - New value
 */
const updateChildValue = (childKey: string | number, newValue: unknown) => {
  if (isObject.value) {
    const source = props.data as Record<string, unknown>;
    const targetKey = String(childKey);
    if (Object.prototype.hasOwnProperty.call(source, targetKey) && Object.is(source[targetKey], newValue)) {
      return;
    }
    const updatedEntries = Object.entries(source).map(([key, value]) =>
      key === targetKey ? [key, newValue] : [key, value],
    );
    emit('update:data', Object.fromEntries(updatedEntries) as Record<string, unknown>);
    return;
  }
  if (isArray.value) {
    const source = props.data as unknown[];
    const index = Number(childKey);
    if (Number.isNaN(index) || !Object.prototype.hasOwnProperty.call(source, index)) return;
    if (Object.is(source[index], newValue)) return;
    const cloned = source.slice();
    cloned[index] = newValue;
    emit('update:data', cloned as unknown[]);
    return;
  }
  if (!Object.is(props.data, newValue)) {
    emit('update:data', newValue as Primitive);
  }
};

/**
 * Delete child node (object key or array element ）
 * @param {string|number} childKey - Key name or index of child node
 */
const deleteChild = (childKey: string | number) => {
  if (isObject.value) {
    const source = (props.data || {}) as Record<string, unknown>;
    const targetKey = String(childKey);
    if (!Object.prototype.hasOwnProperty.call(source, targetKey)) return;
    const entries = Object.entries(source).filter(([key]) => key !== targetKey);
    emit('update:data', Object.fromEntries(entries) as Record<string, unknown>);
    toastr.success(t`Deleted variable`);
    return;
  }
  if (isArray.value) {
    const source = Array.isArray(props.data) ? (props.data as unknown[]) : [];
    const index = Number(childKey);
    if (Number.isNaN(index) || index < 0 || index >= source.length) return;
    const cloned = source.slice();
    cloned.splice(index, 1);
    emit('update:data', cloned as unknown[]);
    toastr.success(t`Deleted variable`);
    return;
  }
};

/**
 * Rename sub-key of object
 * @param {string|number} oldKey - Raw key name
 * @param {string|number} newKey - New key name
 */
const renameChildKey = (oldKey: string | number, newKey: string | number) => {
  if (!isObject.value) return;
  const source = props.data as Record<string, unknown>;
  const oldKeyStr = String(oldKey);
  const newKeyStr = String(newKey).trim();
  if (!newKeyStr.length || oldKeyStr === newKeyStr) return;
  if (!Object.prototype.hasOwnProperty.call(source, oldKeyStr)) return;
  if (Object.prototype.hasOwnProperty.call(source, newKeyStr)) return;
  const updatedEntries = Object.entries(source).map(([key, value]) =>
    key === oldKeyStr ? [newKeyStr, value] : [key, value],
  );
  emit('update:data', Object.fromEntries(updatedEntries) as Record<string, unknown>);
};

watch(
  () => props.nodeKey,
  newKey => {
    if (isEditingKey.value) {
      keyDraft.value = newKey === null ? '' : String(newKey);
    }
  },
);

watch(
  () => props.data,
  newValue => {
    if (isEditingValue.value && isPrimitive.value) {
      valueDraft.value = formatValueForEdit(newValue as Primitive);
    }
    if (!isPrimitive.value && isEditingValue.value) {
      finishValueEditing();
    }
  },
);

onBeforeUnmount(() => {
  clearKeyClickTimer();
  if (stopKeyOutside) {
    stopKeyOutside();
    stopKeyOutside = null;
  }
  if (stopValueOutside) {
    stopValueOutside();
    stopValueOutside = null;
  }
});

const entries = computed<[string | number, unknown][]>(() => {
  if (isObject.value) {
    const source = props.data as Record<string, unknown>;
    return Object.keys(source).map(key => [key, source[key]]);
  }
  if (isArray.value) {
    return (props.data as unknown[]).map((item, index) => [index, item]);
  }
  return [] as [string | number, unknown][];
});

/**
 * Get filter type of value
 * @param {unknown} value - Value to get type of
 * @returns {FilterType|null} Filter type, return if unrecognized null
 */
const getFilterType = (value: unknown): FilterType | null => {
  if (Array.isArray(value)) return 'array';
  if (value === null || value === undefined) return 'object';
  const type = typeof value;
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'object') return 'object';
  return null;
};

/**
 * Judge if node matches current filter
 * @param {unknown} value - Value to check
 * @param {number} depth - Depth of current node
 * @returns {boolean} Whether matches filter condition
 */
const getNodeMatches = (value: unknown, depth: number): boolean => {
  const type = getFilterType(value);
  if (!type) return false;

  if (type === 'array') {
    const arrayValue = value as unknown[];
    const childMatches = arrayValue.some(item => getNodeMatches(item, depth + 1));
    if (!filters.value.array) {
      return depth === 0 ? childMatches : false;
    }
    return arrayValue.length === 0 ? true : childMatches || filters.value.array;
  }

  if (type === 'object') {
    const objectValue = value as Record<string, unknown>;
    const values = Object.values(objectValue);
    const childMatches = values.some(item => getNodeMatches(item, depth + 1));
    if (!filters.value.object) {
      return depth === 0;
    }
    return values.length === 0 ? true : childMatches || filters.value.object;
  }

  return filters.value[type];
};

const filteredEntries = computed(() =>
  entries.value.filter(([, value]) => getNodeMatches(value, (props.depth ?? 0) + 1)),
);

const shouldRender = computed(() => {
  const currentDepth = props.depth ?? 0;
  if (currentDepth === 0) {
    return true;
  }
  return getNodeMatches(props.data, currentDepth);
});

const valuePreview = computed(() => {
  const value = props.data as Primitive | Record<string, unknown> | unknown[];

  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    return `Object {${keys.length} ${keys.length === 1 ? 'key' : 'keys'}}`;
  }

  return String(value);
});

const indentStyle = computed(() => `padding-left: ${props.depth * 3}px`);

const valueTypeClass = computed(() => {
  const type = valueType.value;
  if (type === 'string') return 'text-(--SmartThemeBodyColor)';
  if (type === 'number') return 'text-(--SmartThemeEmColor)';
  if (type === 'boolean') return 'text-(--SmartThemeUnderlineColor)';
  if (type === 'null') return 'text-gray-500';
  return '';
});

const SINGLE_CLICK_DELAY = 150;
const DOUBLE_TAP_THRESHOLD = 300;
let lastKeyTapTime = 0;
let lastValueTapTime = 0;
let keyClickTimer: number | null = null;

/**
 * Clear click timer in key area, avoid accidental collapse trigger
 */
const clearKeyClickTimer = () => {
  if (keyClickTimer !== null) {
    clearTimeout(keyClickTimer);
    keyClickTimer = null;
  }
};

/**
 * Handle touch events in key area, double tap to trigger edit
 * @param {TouchEvent} event - Touch event object
 */
const handleKeyAreaTouchEnd = (event: TouchEvent) => {
  selectCurrentNode();
  const now = event.timeStamp;
  if (now - lastKeyTapTime <= DOUBLE_TAP_THRESHOLD) {
    event.preventDefault();
    event.stopPropagation();
    handleKeyAreaDoubleActivate();
  }
  lastKeyTapTime = now;
};

/**
 * Handle touch events in value area, double tap to trigger edit
 * @param {TouchEvent} event - Touch event object
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

/**
 * Open "Add Sub-variable/Element" dialog, and add a new item under current object/array
 */
const openAddChild = () => {
  if (isPrimitive.value) return;
  const { open: openCreatorModal } = useModal({
    component: RootVariableCreator,
    attrs: {
      onSubmit: async (payload: { key: string; value: unknown }) => {
        if (isObject.value) {
          const source = (props.data || {}) as Record<string, unknown>;
          const key = String(payload.key || '').trim();
          if (!key) {
            toastr.error(t`Key name cannot be empty`, t`Add variable failed`);
            return false;
          }
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            toastr.error(t`Key name already exists`, t`Add variable failed`);
            return false;
          }
          const updated = { ...source, [key]: payload.value } as Record<string, unknown>;
          emit('update:data', updated);
          toastr.success(t`Added to object`);
          return true;
        }
        if (isArray.value) {
          const source = Array.isArray(props.data) ? (props.data as unknown[]) : [];
          const updated = source.slice();
          updated.push(payload.value);
          emit('update:data', updated);
          toastr.success(t`Added to array`);
          return true;
        }
        return false;
      },
    },
  });
  openCreatorModal();
};

/**
 * Clear top-level content: Object -> {}, Array -> [], Primitive -> {}
 */
const clearRoot = () => {
  if (!isRoot.value) return;
  if (isObject.value) {
    emit('update:data', {} as Record<string, unknown>);
    toastr.success(t`Cleared object`);
    return;
  }
  if (isArray.value) {
    emit('update:data', [] as unknown[]);
    toastr.success(t`Cleared array`);
    return;
  }
  emit('update:data', {} as Record<string, unknown>);
  toastr.success(t`Reset to object`);
};

/**
 * Delete current row (request parent deletion), with confirmation
 */
const confirmAndDeleteSelf = () => {
  if (props.nodeKey === null || props.parentType === null) return;
  const msg = t`Are you sure you want to delete this variable? This operation cannot be undone`;

  const { open: openDeleteConfirm } = useModal({
    component: Popup,
    attrs: {
      buttons: [
        {
          name: t`OK`,
          shouldEmphasize: true,
          onClick: close => {
            emit('delete-self');
            close();
          },
        },
        { name: t`Cancel` },
      ],
    },
    slots: {
      default: `<div>${msg}</div>`,
    },
  });
  openDeleteConfirm();
};
</script>
