<template>
  <DefineIconButton v-slot="{ title, icon, onClick, active, disabled }">
    <div
      :class="[
        'flex items-center justify-center rounded-sm transition-colors duration-200',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ]"
      :title="title"
      :disabled="disabled"
      @click="
        () => {
          if (disabled) return;
          onClick?.();
        }
      "
    >
      <i :class="[icon, active ? 'text-(--SmartThemeQuoteColor)' : '']"></i>
    </div>
  </DefineIconButton>
  <!-- prettier-ignore -->
  <div class="mx-0.75 flex flex-col flex-wrap rounded-sm bg-(--SmartThemeQuoteColor)/50 p-0.5 pr-0.75 th-text-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <div class="inline-flex overflow-hidden rounded border border-white">
          <div
            v-for="option in viewOptions"
            :key="option.value"
            class="min-w-3 px-0.5 py-[3px] text-center th-text-sm! transition-colors duration-200"
            :style="
              option.value === currentView
                ? 'background-color: white; color: var(--SmartThemeQuoteColor);'
                : 'background-color: transparent; color: white;'
            "
            @click="setView(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
        <div class="h-1 w-px bg-(--SmartThemeBodyColor)"></div>
        <div class="flex items-center gap-0.75">
          <IconButton
            title="Expand All"
            icon="fa-solid fa-expand"
            :on-click="expandAll"
            :disabled="currentView === 'text'"
          />
          <IconButton
            title="Collapse All"
            icon="fa-solid fa-compress"
            :on-click="collapseAll"
            :disabled="currentView === 'text'"
          />
          <IconButton
            title="Filter"
            icon="fa-solid fa-filter"
            :on-click="showFilter"
            :active="isFilterActive"
            :disabled="currentView === 'text'"
          />
          <IconButton title="Search Variable" icon="fa-solid fa-magnifying-glass" :on-click="showSearch" />
        </div>
      </div>
      <div class="flex items-center gap-0.75">
        <IconButton
          title="Undo"
          icon="fa-solid fa-rotate-left"
          :on-click="() => emit('undo')"
          :disabled="!canUndo"
        />
        <IconButton
          title="Redo"
          icon="fa-solid fa-rotate-right"
          :on-click="() => emit('redo')"
          :disabled="!canRedo"
        />
      </div>
    </div>
    <div ref="teleportTarget"></div>
  </div>
  <!-- Search Variable -->
  <Teleport :to="teleportTarget" :disabled="!teleportTarget">
    <transition name="vm-toolbar-teleport">
      <SearchBar
        v-if="isSearchVisible"
        v-model="search_input"
        :placeholder="t`Search variables (supports regex )`"
        :clearable="true"
        class="mt-0.5 w-full"
      />
    </transition>
  </Teleport>
  <!-- Filter -->
  <Teleport :to="teleportTarget" :disabled="!teleportTarget">
    <transition name="vm-toolbar-teleport">
      <div v-if="isFilterVisible" class="mt-0.5 flex flex-wrap gap-0.5 rounded-sm text-(--SmartThemeBodyColor)">
        <template v-for="filter in filterDefinitions" :key="filter.type">
          <div class="flex items-center gap-0.25">
            <input
              :id="`filter-${filter.type}`"
              type="checkbox"
              class="m-0"
              :data-type="filter.type"
              :checked="filters[filter.type]"
              @change="onFilterChange(filter.type, $event)"
            />
            <label :for="`filter-${filter.type}`">{{ filter.name }}</label>
          </div>
        </template>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { FilterType, FiltersState } from '@/panel/toolbox/variable_manager/filter';
import { createDefaultFilters } from '@/panel/toolbox/variable_manager/filter';
import { createReusableTemplate, useToggle } from '@vueuse/core';
import { computed, ref, toRefs } from 'vue';

const props = defineProps<{
  canUndo?: boolean;
  canRedo?: boolean;
  // Remove top-level add entry, hosted by root node row instead
}>();
const { canUndo, canRedo } = toRefs(props);

const [DefineIconButton, IconButton] = createReusableTemplate<{
  title: string;
  icon: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}>();

const search_input = defineModel<RegExp | null>('search_input', { required: true });
const emit = defineEmits<{
  (e: 'collapse-all'): void;
  (e: 'expand-all'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
}>();

type ViewMode = 'tree' | 'card' | 'text';
const viewOptions: { label: string; value: ViewMode }[] = [
  { label: 'Tree', value: 'tree' },
  { label: 'Card', value: 'card' },
  { label: 'Text', value: 'text' },
];

const filterDefinitions: { type: FilterType; name: string }[] = [
  { type: 'string', name: t`String` },
  { type: 'number', name: t`Number` },
  { type: 'array', name: t`Array` },
  { type: 'boolean', name: t`Boolean` },
  { type: 'object', name: t`Object` },
];

const filters = defineModel<FiltersState>('filters', {
  default: createDefaultFilters,
});

const currentView = defineModel<ViewMode>('currentView', { default: 'tree' });
const [isSearchVisible, toggleSearchVisible] = useToggle(false);
const [isFilterVisible, toggleFilterVisible] = useToggle(false);
const teleportTarget = ref<HTMLElement | null>(null);
const isFilterActive = computed(() => Object.values(filters.value).some(value => !value));

/**
 * Set display view mode of Variable Manager
 * @param {ViewMode} mode - View Mode ('tree' | 'card' | 'text')
 */
const setView = (mode: ViewMode) => {
  currentView.value = mode;
};

const showSearch = () => toggleSearchVisible();
const showFilter = () => toggleFilterVisible();

/**
 * Collapse all expanded variable nodes
 * Trigger collapse-all event for parent component handling
 */
const collapseAll = () => {
  emit('collapse-all');
};

/**
 * Expand all expandable variable nodes
 * Trigger expand-all event for parent component handling
 */
const expandAll = () => {
  emit('expand-all');
};

/**
 * Handle filter checkbox status change
 * @param {FilterType} filterType - Filter Type ('string' | 'number' | 'array' | 'boolean' | 'object')
 * @param {Event} event - Checkbox change event
 */
const onFilterChange = (filterType: FilterType, event: Event) => {
  const target = event.target as HTMLInputElement;
  filters.value = {
    ...filters.value,
    [filterType]: target.checked,
  };
};
</script>

<style scoped>
.vm-toolbar-teleport-enter-active,
.vm-toolbar-teleport-leave-active {
  transition: all 200ms ease;
}

.vm-toolbar-search-enter-from,
.vm-toolbar-search-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
