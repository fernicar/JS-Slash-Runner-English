<template>
  <Teleport :to="teleport_target">
    <div ref="dialog_ref" :style="dialog_style" :class="dialog_classes">
      <div
        class="TH-custom-tailwind flex h-full flex-col overflow-hidden bg-(--SmartThemeBlurTintColor) shadow-lg"
        role="dialog"
        aria-modal="true"
        :class="is_mobile ? '' : 'rounded-sm'"
      >
        <!-- prettier-ignore-attribute -->
        <div
          ref="header_ref"
          class="flex shrink-0 items-center justify-between bg-(--SmartThemeQuoteColor) px-1 select-none"
        >
          <div
            class="flex-1 cursor-move font-bold"
            style="touch-action: none"
            :style="{ color: getSmartThemeQuoteTextColor() }"
          >
            {{ title }}
          </div>
          <div class="flex shrink-0 gap-1" :style="{ color: getSmartThemeQuoteTextColor() }">
            <!-- prettier-ignore-attribute -->
            <div
              v-if="showGuide"
              class="
                flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent th-text-base!
              "
              @click="openGuidePopup"
            >
              <i class="fa-solid fa-question"></i>
            </div>
            <!-- prettier-ignore-attribute -->
            <div
              class="
                relative z-20 flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent
                th-text-base!
              "
              :title="is_collapsed ? t`Expand` : t`Collapse`"
              @click="toggleCollapse"
            >
              <i :class="is_collapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'"></i>
            </div>
            <!-- prettier-ignore-attribute -->
            <div
              class="
                fa-solid fa-close relative z-20 flex cursor-pointer items-center justify-center rounded-md border-none
                bg-transparent th-text-base!
              "
              :title="t`Close`"
              @click="emit('close')"
            ></div>
          </div>
        </div>
        <div v-show="!is_collapsed" class="flex flex-1 flex-col overflow-hidden">
          <slot> </slot>
        </div>
      </div>

      <!-- Resize handles -->
      <div
        v-for="handle in enabled_handles"
        :key="handle.name"
        :class="['absolute opacity-0', handle.cursor, handle.class]"
        :style="[handle.style, { touchAction: 'none' }]"
        @pointerdown="startResize(handle.name, $event)"
      ></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { getSmartThemeQuoteTextColor } from '@/util/color';
import { isMobile } from '@sillytavern/scripts/RossAscends-mods';
import {
  useDraggable,
  useEventListener,
  useLocalStorage,
  useResizeObserver,
  useThrottleFn,
  useWindowSize,
} from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watchEffect } from 'vue';

interface ResizeHandle {
  name: string;
  cursor: string;
  class: string;
  style: Record<string, string>;
}

/**
 * Dialog component props definition
 */
const props = withDefaults(
  defineProps<{
    // Desktop width, unit can be px, vw, etc.
    width?: string | number;
    // Desktop height, unit can be px, vh, etc.
    height?: string | number;
    // Mobile height, unit can be px, vh, etc.
    mobileHeight?: string | number;
    // Title text, passed from outside
    title?: string;
    // Whether to show usage guide
    showGuide?: boolean;
    // Whether it is draggable
    draggable?: boolean;
    // Whether it is resizable
    resizable?: boolean;
    // Minimum width
    minWidth?: string | number;
    // Minimum height
    minHeight?: string | number;
    // Maximum width
    maxWidth?: string | number;
    // Maximum height
    maxHeight?: string | number;
    // Enable edge snapping (PC only)
    edgeSnap?: boolean;
    // Edge snap trigger distance
    snapDistance?: number;
    // Resize handles
    handles?: Array<'tl' | 'tm' | 'tr' | 'mr' | 'br' | 'bm' | 'bl' | 'ml'>;
    // Initial X position (left)
    initialX?: number | string | (() => number);
    // Initial Y position (top)
    initialY?: number | (() => number);
    // Local storage ID
    storageId?: string;
  }>(),
  {
    width: '60dvw',
    height: '70dvh',
    mobileHeight: '90%',
    title: 'Untitled Floating Window',
    showGuide: false,
    draggable: true,
    resizable: true,
    minWidth: 300,
    minHeight: 200,
    maxWidth: '90dvw',
    maxHeight: '90dvh',
    edgeSnap: true,
    snapDistance: 100,
    handles: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
    initialX: '10%',
    initialY: () => Math.max(50, window.innerHeight * 0.15),
    storageId: undefined,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'dragging', payload: { left: number; top: number; width: number; height: number }): void;
  (e: 'dragstop', payload: { left: number; top: number; width: number; height: number }): void;
  (e: 'resizing', payload: { left: number; top: number; width: number; height: number }): void;
  (e: 'resizestop', payload: { left: number; top: number; width: number; height: number }): void;
  (e: 'activated'): void;
  (e: 'deactivated'): void;
  (e: 'openGuidePopup'): void;
}>();

const { width: window_width } = useWindowSize();

const dialog_ref = useTemplateRef<HTMLElement>('dialog_ref');
const header_ref = useTemplateRef<HTMLElement>('header_ref');
const teleport_target = computed(() => (is_mobile ? '#movingDivs' : 'body'));
const mobile_dialog_index = ref(0);

const header_height = ref(32);
function updateHeaderHeight() {
  header_height.value = header_ref.value?.offsetHeight ?? 32;
}
watchEffect(() => {
  updateHeaderHeight();
});
useEventListener(window, 'resize', () => {
  updateHeaderHeight();
});

const dialog_size = ref({
  width: 0,
  height: 0,
});

const is_resizing = ref(false);
const resize_direction = ref<string>('');
const initial_aspect_ratio = ref(1);

const was_snapped = ref(false);
const pre_snap_rect = ref<{ left: number; top: number; width: number; height: number } | null>(null);

let dragStartPointerX = 0;
let dragStartPointerY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;
let dragHasRestoredFromSnap = false;
let dragLastMouseX = 0;
let dragLastMouseY = 0;

const is_collapsed = ref(false);

/**
 * Toggle floating window collapse/expand state
 * @description Toggles the collapse state of the floating window. When collapsed, only the title bar is displayed.
 * After toggling, it automatically checks and adjusts boundary positions.
 */
function toggleCollapse() {
  is_resizing.value = false;
  resize_direction.value = '';
  is_collapsed.value = !is_collapsed.value;

  // Check boundaries after collapse state change
  setTimeout(() => {
    checkAndAdjustBounds();
  }, 10);
}

/**
 * Open usage guide popup
 * @description Triggers the display of the usage guide popup by emitting an event to the parent component.
 */
function openGuidePopup() {
  emit('openGuidePopup');
}

/**
 * Unified unit conversion function - Converts any unit to pixel values
 * @param {string | number} value - Value to convert, supports units like px, vw, vh, %, rem, etc.
 * @param {'width' | 'height'} dimension - Dimension type used as reference for percentage calculations
 * @returns {number} Converted pixel value
 * @description Supports converting various CSS units to pixels, including viewport units, percentages, rem, etc.
 */
const convertToPixels = (value: string | number, dimension: 'width' | 'height' = 'width'): number => {
  if (typeof value === 'number') return value;
  if (value.endsWith('vw')) {
    return (parseFloat(value) * window_width.value) / 100;
  }
  if (value.endsWith('vh')) {
    return (parseFloat(value) * window.innerHeight) / 100;
  }
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  if (value.endsWith('%')) {
    const reference = dimension === 'width' ? window_width.value : window.innerHeight;
    return (parseFloat(value) * reference) / 100;
  }
  if (value.endsWith('rem')) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return parseFloat(value) * rootFontSize;
  }
  return parseFloat(value) || 400;
};

const is_mobile = isMobile();
const mobile_top_offset = computed(() => mobile_dialog_index.value * header_height.value);
const MOBILE_STACK_KEY = '__TH_MOBILE_DIALOG_STACK__' as const;
const MOBILE_STACK_EVENT = 'th-mobile-dialog-stack-change' as const;
const mobile_dialog_id = Symbol('THDialogInstance');

type MobileStackWindow = Window & { [key in typeof MOBILE_STACK_KEY]?: symbol[] };

function ensureMobileStack(): symbol[] {
  const win = window as MobileStackWindow;
  if (!win[MOBILE_STACK_KEY]) {
    win[MOBILE_STACK_KEY] = [];
  }
  return win[MOBILE_STACK_KEY]!;
}

function updateMobileStackIndex() {
  if (!is_mobile || typeof window === 'undefined') {
    return;
  }
  const stack = ensureMobileStack();
  const idx = stack.indexOf(mobile_dialog_id);
  mobile_dialog_index.value = idx >= 0 ? idx : 0;
}

function broadcastMobileStackChange() {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(MOBILE_STACK_EVENT));
}

if (typeof window !== 'undefined') {
  useEventListener(window, MOBILE_STACK_EVENT, () => {
    if (!is_mobile) return;
    updateMobileStackIndex();
  });
}

/**
 * Initialize floating window size
 * @description Sets the initial size based on the width and height props, differentiating between mobile and desktop.
 * Also calculates and saves the initial aspect ratio.
 */
const initizeSize = () => {
  const target_width = is_mobile ? '100%' : props.width;
  const target_height = is_mobile ? (props.mobileHeight ?? '80%') : props.height;

  dialog_size.value.width = convertToPixels(target_width, 'width');
  dialog_size.value.height = convertToPixels(target_height, 'height');

  initial_aspect_ratio.value = dialog_size.value.width / dialog_size.value.height;
};

initizeSize();

const throttledEmitDragging = useThrottleFn((payload: { left: number; top: number; width: number; height: number }) => {
  emit('dragging', payload);
}, 16);
const throttledEmitResizing = useThrottleFn((payload: { left: number; top: number; width: number; height: number }) => {
  emit('resizing', payload);
}, 16);
const throttledAdjustBounds = useThrottleFn(() => {
  checkAndAdjustBounds();
}, 100);

/**
 * Get initial position of floating window
 * @returns {object} Returns position object containing x and y coordinates
 * @description Calculates the initial position of the floating window based on props, supporting function, string, and numeric formats.
 */
const getinitPosition = () => {
  const getInitValue = (value: number | string | (() => number), dimension: 'width' | 'height'): number => {
    if (typeof value === 'function') {
      return value();
    }
    if (typeof value === 'string') {
      return convertToPixels(value, dimension);
    }
    return value;
  };

  return {
    x: getInitValue(props.initialX, 'width') || Math.max(0, window_width.value * 0.1),
    y: getInitValue(props.initialY, 'height') || Math.max(20, window.innerHeight * 0.15),
  };
};

const initial_position = getinitPosition();
const x = ref(initial_position.x);
const y = ref(initial_position.y);

const is_dragging = ref(false);

/**
 * Get local storage key name
 * @returns {string | null} Returns storage key name, or null if storageId is not provided
 * @description Generates a unique local storage key based on storageId to persist the floating window state.
 */
function getStorageKey(): string | null {
  if (!props.storageId) {
    return null;
  }
  return `TH-Dialog-${props.storageId}`;
}

const __storage_key = getStorageKey();

if (!props.storageId) {
  console.warn('[TH-Dialog] storageId not provided, state will not be persisted to local storage.');
}

interface PositionStorage {
  left?: number;
  top?: number;
  mobileLeft?: number;
  mobileTop?: number;
}

interface SizeStorage {
  width?: number;
  height?: number;
  mobileHeight?: number;
}

const position_storage = props.storageId
  ? useLocalStorage<PositionStorage>(`TH-Dialog-${props.storageId}:pos`, {}, { mergeDefaults: true })
  : ref<PositionStorage>({});

const size_storage = props.storageId
  ? useLocalStorage<SizeStorage>(`TH-Dialog-${props.storageId}:size`, {}, { mergeDefaults: true })
  : ref<SizeStorage>({});

/**
 * Extract values from persisted data
 * @param {Record<string, any>} obj - Object containing persisted data
 * @param {readonly [string, string]} primary - Array of primary key names
 * @param {readonly [string, string]} fallback - Array of fallback key names
 * @returns {{a?: number, b?: number} | null} Returns extracted numeric values or null
 * @description Extracts numeric values from persistent storage, prioritizing primary keys, then fallbacks if necessary.
 */
function pickPersistedValue(
  obj: Record<string, any>,
  primary: readonly [string, string],
  fallback: readonly [string, string],
): { a?: number; b?: number } | null {
  const [aKey, bKey] = primary;
  const [faKey, fbKey] = fallback;
  if (typeof obj[aKey] === 'number' && typeof obj[bKey] === 'number') {
    return { a: obj[aKey], b: obj[bKey] };
  }
  if (typeof obj[faKey] === 'number' && typeof obj[fbKey] === 'number') {
    return { a: obj[faKey], b: obj[fbKey] };
  }
  return null;
}

/**
 * Save floating window position to local storage
 * @param {number} left - Left margin
 * @param {number} top - Top margin
 * @description Saves current position to local storage; only active for non-mobile devices when storageId is present.
 */
function savePosition(left: number, top: number) {
  if (!__storage_key || is_mobile) return;
  try {
    position_storage.value.left = left;
    position_storage.value.top = top;
  } catch (err) {
    console.warn('[TH-Dialog] Failed to save position:', err);
  }
}

/**
 * Save floating window size to local storage
 * @param {number} width - Width
 * @param {number} height - Height
 * @description Saves current size to local storage, using different fields for mobile and desktop.
 */
function saveSize(width: number, height: number) {
  if (!__storage_key) return;
  try {
    if (is_mobile) {
      size_storage.value.mobileHeight = height;
    } else {
      size_storage.value.width = width;
      size_storage.value.height = height;
    }
  } catch (err) {
    console.warn('[TH-Dialog] Failed to save size:', err);
  }
}

/**
 * Load floating window position from local storage
 * @returns {{left: number, top: number} | null} Returns loaded position or null
 * @description Loads previously saved position from local storage; only active for non-mobile devices when storageId is present.
 */
function loadPosition(): { left: number; top: number } | null {
  if (!__storage_key || is_mobile) return null;
  try {
    const parsed = position_storage.value;
    const picked = pickPersistedValue(parsed, ['left', 'top'] as const, ['mobileLeft', 'mobileTop'] as const);
    if (picked && typeof picked.a === 'number' && typeof picked.b === 'number') {
      return { left: picked.a, top: picked.b };
    }
  } catch (err) {
    console.warn('[TH-Dialog] Failed to load position:', err);
  }
  return null;
}

/**
 * Load floating window size from local storage
 * @returns {{width: number, height: number} | null} Returns loaded size or null
 * @description Loads previously saved size from local storage, handling mobile and desktop storage fields separately.
 */
function loadSize(): { width: number; height: number } | null {
  if (!__storage_key) return null;
  try {
    const parsed = size_storage.value;
    if (is_mobile) {
      const heightValue =
        typeof parsed.mobileHeight === 'number'
          ? parsed.mobileHeight
          : typeof parsed.height === 'number'
            ? parsed.height
            : undefined;
      if (typeof heightValue === 'number') {
        return { width: dialog_size.value.width, height: heightValue };
      }
      return null;
    }
    const widthValue = typeof parsed.width === 'number' ? parsed.width : undefined;
    const heightValue = typeof parsed.height === 'number' ? parsed.height : undefined;
    if (widthValue !== undefined && heightValue !== undefined) {
      return { width: widthValue, height: heightValue };
    }
  } catch (err) {
    console.warn('[TH-Dialog] Failed to load size:', err);
  }
  return null;
}

/**
 * Check and adjust floating window bounds to ensure it stays within the viewport
 * @description Checks if position and size exceed viewport boundaries. If so, automatically adjusts them to a reasonable range.
 * Handles different boundary restriction logic for mobile vs desktop.
 */
function checkAndAdjustBounds() {
  const viewport_width = window.innerWidth;
  const viewport_height = window.innerHeight;

  let adjusted = false;

  const max_width = viewport_width * 0.95; // Leave 5% margin
  const max_height = viewport_height * 0.95;

  if (is_mobile) {
    const full_width = convertToPixels('100%', 'width');
    if (dialog_size.value.width !== full_width) {
      dialog_size.value.width = full_width;
      adjusted = true;
    }
  } else if (dialog_size.value.width > max_width) {
    dialog_size.value.width = max_width;
    adjusted = true;
  }

  // Mobile does not force height restrictions to prevent compression when input method pops up
  if (!is_mobile && dialog_size.value.height > max_height) {
    dialog_size.value.height = max_height;
    adjusted = true;
  }

  const min_x = 0;
  const max_x = viewport_width - dialog_size.value.width;
  const min_y = 0;
  const dialog_current_height = is_collapsed.value ? header_height.value : dialog_size.value.height;
  const max_y = Math.max(0, viewport_height - dialog_current_height);

  if (!is_mobile) {
    if (x.value < min_x) {
      x.value = min_x;
      adjusted = true;
    } else if (x.value > max_x) {
      x.value = Math.max(min_x, max_x);
      adjusted = true;
    }

    if (y.value < min_y) {
      y.value = min_y;
      adjusted = true;
    } else if (y.value > max_y) {
      y.value = Math.max(min_y, max_y);
      adjusted = true;
    }
  }

  if (adjusted) {
    savePosition(x.value, y.value);
    saveSize(dialog_size.value.width, dialog_size.value.height);
  }
}

onMounted(() => {
  const shouldHandleMobileStack = is_mobile && typeof window !== 'undefined';
  if (shouldHandleMobileStack) {
    const stack = ensureMobileStack();
    if (!stack.includes(mobile_dialog_id)) {
      stack.push(mobile_dialog_id);
    }
    updateMobileStackIndex();
  }

  const pos = loadPosition();
  if (pos) {
    x.value = pos.left;
    y.value = pos.top;
  }

  const size = loadSize();
  if (size) {
    dialog_size.value.width = size.width;
    dialog_size.value.height = size.height;
  }
  checkAndAdjustBounds();

  if (shouldHandleMobileStack) {
    broadcastMobileStackChange();
  }
});

onBeforeUnmount(() => {
  if (!is_mobile || typeof window === 'undefined') {
    return;
  }
  const stack = ensureMobileStack();
  const index = stack.indexOf(mobile_dialog_id);
  if (index !== -1) {
    stack.splice(index, 1);
    broadcastMobileStackChange();
  }
});

/*
 * Listen for viewport size changes
 */
useResizeObserver(document.body, () => {
  throttledAdjustBounds();
});

/**
 * Start drag operation
 * @param {PointerEvent} event - Mouse or touch event object
 * @description Handles start logic for dragging the floating window, including event handling, boundary checks, and edge snapping.
 * Supports real-time position updates and event emission during dragging.
 */
/**
 * Edge snap detection - Determines if the window should snap to screen edges based on mouse position
 * @param {number} mouseX - Mouse X coordinate
 * @param {number} _mouseY - Mouse Y coordinate (unused)
 * @param {number} left - Current floating window left margin
 * @param {number} top - Current floating window top margin
 * @param {number} width - Current floating window width
 * @param {number} height - Current floating window height
 * @returns {object} Returns snapped position and size information
 * @description Detects if mouse is near screen edges; if so, returns position snapped to edge and full height.
 */
const checkEdgeSnap = (mouseX: number, _mouseY: number, left: number, top: number, width: number, height: number) => {
  if (!props.edgeSnap || is_mobile) {
    return { left, top, width, height, snapped: false };
  }

  const screen_width = window.innerWidth;
  const screen_height = window.innerHeight;
  const snap_dist = props.snapDistance;

  // Determine if near left edge based on mouse position
  if (mouseX <= snap_dist) {
    return {
      left: 0,
      top: 0,
      width,
      height: screen_height,
      snapped: true,
    };
  }

  // Determine if near right edge based on mouse position
  if (mouseX >= screen_width - snap_dist) {
    return {
      left: screen_width - width,
      top: 0,
      width,
      height: screen_height,
      snapped: true,
    };
  }

  return { left, top, width, height, snapped: false };
};

useDraggable(dialog_ref, {
  handle: header_ref,
  preventDefault: true,
  stopPropagation: true,
  disabled: computed(() => !props.draggable || is_mobile),
  initialValue: computed(() => ({ x: x.value, y: y.value })),
  onStart: (_position, event) => {
    if (!props.draggable || is_mobile) {
      return;
    }
    is_dragging.value = true;
    dragStartPointerX = event.clientX;
    dragStartPointerY = event.clientY;
    dragStartLeft = x.value;
    dragStartTop = y.value;
    dragHasRestoredFromSnap = false;
    dragLastMouseX = event.clientX;
    dragLastMouseY = event.clientY;
  },
  onMove: (_position, event) => {
    if (!props.draggable || is_mobile) {
      return;
    }
    const newX = dragStartLeft + (event.clientX - dragStartPointerX);
    const newY = dragStartTop + (event.clientY - dragStartPointerY);

    if (was_snapped.value && !dragHasRestoredFromSnap && pre_snap_rect.value) {
      const snapDist = props.snapDistance;
      const mouseNearLeft = event.clientX <= snapDist;
      const mouseNearRight = event.clientX >= window.innerWidth - snapDist;
      if (!mouseNearLeft && !mouseNearRight) {
        const { width: prevWidth, height: prevHeight } = pre_snap_rect.value;
        dialog_size.value.width = prevWidth;
        dialog_size.value.height = prevHeight;
        dragHasRestoredFromSnap = true;
        was_snapped.value = false;
      }
    }

    const screenHeight = window.innerHeight;
    const dialogHeight = is_collapsed.value ? header_height.value : dialog_size.value.height;
    const clampedY = Math.max(0, Math.min(newY, screenHeight - dialogHeight));

    x.value = newX;
    y.value = clampedY;
    dragLastMouseX = event.clientX;
    dragLastMouseY = event.clientY;

    throttledEmitDragging({
      left: newX,
      top: clampedY,
      width: dialog_size.value.width,
      height: dialog_size.value.height,
    });
  },
  onEnd: () => {
    if (!is_dragging.value) {
      return;
    }
    is_dragging.value = false;

    const snapResult = checkEdgeSnap(
      dragLastMouseX,
      dragLastMouseY,
      x.value,
      y.value,
      dialog_size.value.width,
      dialog_size.value.height,
    );

    if (snapResult.snapped) {
      pre_snap_rect.value = {
        left: x.value,
        top: y.value,
        width: dialog_size.value.width,
        height: dialog_size.value.height,
      };
      was_snapped.value = true;
    } else {
      was_snapped.value = false;
    }

    x.value = snapResult.left;
    y.value = snapResult.top;

    if (snapResult.snapped) {
      dialog_size.value.width = snapResult.width;
      dialog_size.value.height = snapResult.height;
    }

    emit('dragstop', {
      left: x.value,
      top: y.value,
      width: dialog_size.value.width,
      height: dialog_size.value.height,
    });

    savePosition(x.value, y.value);
    dragHasRestoredFromSnap = false;
  },
});

/**
 * Resize handle configuration
 * @description Defines the style and position configuration for each resize handle on the floating window.
 * Includes 8 directions: top-left, top, top-right, right, bottom-right, bottom, bottom-left, left.
 */
const handle_configs: Record<string, ResizeHandle> = {
  tl: {
    name: 'top-left',
    cursor: 'cursor-nw-resize',
    class: 'z-20 top-0 left-0 h-[7px] w-[7px]',
    style: { top: '0', left: '0' },
  },
  tm: {
    name: 'top',
    cursor: 'cursor-ns-resize',
    class: 'z-10 top-0 left-0 h-[7px]',
    style: { top: '0', left: '0', width: '100%' },
  },
  tr: {
    name: 'top-right',
    cursor: 'cursor-ne-resize',
    class: 'z-20 top-0 right-0 h-[7px] w-[7px]',
    style: { top: '0', right: '0' },
  },
  mr: {
    name: 'right',
    cursor: 'cursor-ew-resize',
    class: 'z-10 top-0 right-0 w-[7px]',
    style: { top: '0', right: '0', height: '100%' },
  },
  br: {
    name: 'bottom-right',
    cursor: 'cursor-nw-resize',
    class: 'z-20 bottom-0 right-0 h-[7px] w-[7px]',
    style: { bottom: '0', right: '0' },
  },
  bm: {
    name: 'bottom',
    cursor: 'cursor-ns-resize',
    class: 'z-10 bottom-0 left-0 h-[7px]',
    style: { bottom: '0', left: '0', width: '100%' },
  },
  bl: {
    name: 'bottom-left',
    cursor: 'cursor-ne-resize',
    class: 'z-20 bottom-0 left-0 h-[7px] w-[7px]',
    style: { bottom: '0', left: '0' },
  },
  ml: {
    name: 'left',
    cursor: 'cursor-ew-resize',
    class: 'z-10 top-0 left-0 w-[7px]',
    style: { top: '0', left: '0', height: '100%' },
  },
};

const enabled_handles = computed(() => {
  if (!props.resizable || is_collapsed.value) {
    return [] as ResizeHandle[];
  }

  const inset = 8;
  const handleKeys = is_mobile ? ['bm'] : props.handles;
  const cloned = handleKeys
    .map(handle => ({ ...handle_configs[handle], style: { ...handle_configs[handle].style } }))
    .filter(Boolean) as ResizeHandle[];

  const top_handle = cloned.find(h => h.name === 'top');
  if (top_handle) {
    top_handle.style.top = `0px`;
    top_handle.style.left = `${inset}px`;
    top_handle.style.right = `${inset}px`;
    delete (top_handle.style as any).width;
  }

  const right_handle = cloned.find(h => h.name === 'right');
  if (right_handle) {
    right_handle.style.top = `${inset}px`;
    right_handle.style.bottom = `${inset}px`;
    delete (right_handle.style as any).height;
  }

  const left_handle = cloned.find(h => h.name === 'left');
  if (left_handle) {
    left_handle.style.top = `${inset}px`;
    left_handle.style.bottom = `${inset}px`;
    delete (left_handle.style as any).height;
  }

  const bottom_handle = cloned.find(h => h.name === 'bottom');
  if (bottom_handle) {
    bottom_handle.style.left = `${inset}px`;
    bottom_handle.style.right = `${inset}px`;
    delete (bottom_handle.style as any).width;
  }

  return cloned;
});

/**
 * Mobile-specific resize logic
 * @description Only allows height adjustment via the bottom handle, always maintaining full width.
 */
const startMobileResize = (direction: string, event: PointerEvent) => {
  if (direction !== 'bottom') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  is_resizing.value = true;
  resize_direction.value = direction;

  const startY = event.clientY;
  const start_height = dialog_size.value.height;

  const min_height_px = convertToPixels(props.minHeight, 'height');
  const max_height_px = props.maxHeight ? convertToPixels(props.maxHeight, 'height') : Infinity;

  emit('activated');

  const handlePointerMove = (e: PointerEvent) => {
    const delta_y = e.clientY - startY;

    let new_height = Math.max(min_height_px, start_height + delta_y);
    if (props.maxHeight) {
      new_height = Math.min(max_height_px, new_height);
    }

    dialog_size.value.height = new_height;
    x.value = 0;
    y.value = 0;

    throttledEmitResizing({
      left: 0,
      top: 0,
      width: dialog_size.value.width,
      height: new_height,
    });
  };

  const cleanup_stops: Array<() => void> = [];

  const handlePointerUp = () => {
    is_resizing.value = false;
    resize_direction.value = '';

    x.value = 0;
    y.value = 0;

    cleanup_stops.forEach(stop => stop());

    emit('resizestop', {
      left: x.value,
      top: y.value,
      width: dialog_size.value.width,
      height: dialog_size.value.height,
    });

    emit('deactivated');

    saveSize(dialog_size.value.width, dialog_size.value.height);
  };

  cleanup_stops.push(
    useEventListener(document, 'pointermove', handlePointerMove as any, { passive: false }),
    useEventListener(document, 'pointerup', handlePointerUp as any),
    useEventListener(document, 'pointercancel', handlePointerUp as any),
  );
};

/**
 * Start resize operation
 * @param {string} direction - Resize direction, e.g., 'tl', 'tm', 'tr', etc.
 * @param {PointerEvent} event - Mouse or touch event object
 * @description Handles start logic for resizing the floating window, supporting 8 directions.
 * Includes min/max size constraints, real-time updates, and event emission.
 */
const startResize = (direction: string, event: PointerEvent) => {
  if (!props.resizable || is_collapsed.value) return;
  if (is_mobile) {
    startMobileResize(direction, event);
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  is_resizing.value = true;
  resize_direction.value = direction;

  const startX = event.clientX;
  const startY = event.clientY;
  const start_width = dialog_size.value.width;
  const start_height = dialog_size.value.height;
  const start_left = x.value;
  const start_top = y.value;

  emit('activated');

  const handlePointerMove = (e: PointerEvent) => {
    const delta_x = e.clientX - startX;
    const delta_y = e.clientY - startY;

    const min_width_px = convertToPixels(props.minWidth, 'width');
    const max_width_px = props.maxWidth ? convertToPixels(props.maxWidth, 'width') : Infinity;
    const min_height_px = convertToPixels(props.minHeight, 'height');
    const max_height_px = props.maxHeight ? convertToPixels(props.maxHeight, 'height') : Infinity;

    let new_width = start_width;
    let new_height = start_height;
    let new_left = start_left;
    let new_top = start_top;

    if (direction.includes('right')) {
      new_width = Math.max(min_width_px, start_width + delta_x);
      if (props.maxWidth) {
        new_width = Math.min(max_width_px, new_width);
      }
    }
    if (direction.includes('left')) {
      new_width = Math.max(min_width_px, start_width - delta_x);
      if (props.maxWidth) {
        new_width = Math.min(max_width_px, new_width);
      }
      new_left = start_left + (start_width - new_width);
    }
    if (direction.includes('bottom')) {
      new_height = Math.max(min_height_px, start_height + delta_y);
      if (props.maxHeight) {
        new_height = Math.min(max_height_px, new_height);
      }
    }
    if (direction.includes('top')) {
      new_height = Math.max(min_height_px, start_height - delta_y);
      if (props.maxHeight) {
        new_height = Math.min(max_height_px, new_height);
      }
      new_top = start_top + (start_height - new_height);
    }

    x.value = new_left;
    y.value = new_top;
    dialog_size.value.width = new_width;
    dialog_size.value.height = new_height;

    throttledEmitResizing({
      left: new_left,
      top: new_top,
      width: new_width,
      height: new_height,
    });
  };

  const cleanup_stops: Array<() => void> = [];

  const handlePointerUp = () => {
    is_resizing.value = false;
    resize_direction.value = '';

    cleanup_stops.forEach(stop => stop());

    emit('resizestop', {
      left: x.value,
      top: y.value,
      width: dialog_size.value.width,
      height: dialog_size.value.height,
    });

    emit('deactivated');

    saveSize(dialog_size.value.width, dialog_size.value.height);
  };

  cleanup_stops.push(
    useEventListener(document, 'pointermove', handlePointerMove as any, { passive: false }),
    useEventListener(document, 'pointerup', handlePointerUp as any),
    useEventListener(document, 'pointercancel', handlePointerUp as any),
  );
};

/**
 * Dialog style calculation
 * @description Calculates the dialog style based on size, position, state, etc.
 * @returns {object} Returns the style object for the dialog
 */
const dialog_style = computed(() => {
  const user_select = is_dragging.value || is_resizing.value ? ('none' as const) : ('auto' as const);
  const position = 'absolute' as const;
  if (is_mobile) {
    return {
      position: position,
      transform: `translateY(${mobile_top_offset.value}px)`,
      height: `${is_collapsed.value ? header_height.value : dialog_size.value.height}px`,
      maxHeight: `calc(100dvh - 45px - ${mobile_top_offset.value}px)`,
      zIndex: 10000,
      userSelect: user_select,
      borderRadius: '0px 0px 5px 5px',
    };
  } else {
    return {
      position: position,
      // Avoid triggering layout and paint
      transform: `translate3d(${x.value}px, ${y.value}px, 0)`,
      willChange: 'transform',
      left: '0px',
      top: '0px',
      width: `${dialog_size.value.width}px`,
      height: is_collapsed.value ? `${header_height.value}px` : `${dialog_size.value.height}px`,
      zIndex: 10000,
      userSelect: user_select,
    };
  }
});

const dialog_classes = computed(() => ({
  'dialog-dragging': is_dragging.value,
  'dialog-resizing': is_resizing.value,
  'dialog-resizable': props.resizable,
  'dialog-teleported': teleport_target.value,
}));
</script>
