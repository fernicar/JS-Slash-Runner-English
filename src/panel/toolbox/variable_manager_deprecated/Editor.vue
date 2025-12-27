<template>
  <!-- prettier-ignore -->
  <div class="flex-1 overflow-y-auto p-1">
    <div class="flex h-full w-full flex-col gap-0.5">
      <template v-if="writable_variables.length > 0 || props.currentView === 'text' || props.currentView === 'card'">
        <TreeMode
          v-if="props.currentView === 'tree'"
          v-model:data="variables"
          :filters="props.filters"
          :search-input="props.searchInput"
        />
        <template v-else-if="props.currentView === 'card'">
          <div
            class="
              flex items-center justify-center gap-0.5 rounded border border-(--SmartThemeQuoteColor)/40
              bg-(--SmartThemeBGColor)/60 px-0.5 py-0.25 th-text-sm
            "
          >
            <div
              class="
                inline-flex cursor-pointer items-center gap-0.25 rounded px-0.5 py-0.25 text-(--SmartThemeQuoteColor)
                transition-colors
                hover:bg-(--SmartThemeQuoteColor)/15
              "
              @click="openRootCreatorModal"
            >
              <i class="fa-solid fa-plus"></i>
              <span>{{ t`Add Variable` }}</span>
            </div>
            <div
              :class="[
                'inline-flex items-center gap-0.25 rounded px-0.5 py-0.25 transition-colors',
                hasVariables
                  ? 'cursor-pointer text-(--warning) hover:bg-(--warning)/15'
                  : 'cursor-not-allowed text-(--warning)/60 opacity-60',
              ]"
              :title="hasVariables ? t`Delete All` : t`No variables to delete`"
              @click="clearAllVariables"
            >
              <i class="fa-solid fa-trash"></i>
              <span>{{ t`Delete All` }}</span>
            </div>
          </div>
          <template v-if="writable_variables.length > 0">
            <template v-for="data in writable_variables" :key="data[0]">
              <CardMode
                :name="data[0]"
                :content="data[1]"
                :filters="props.filters"
                :search-input="props.searchInput"
                @update:name="renameVariable(data[0], $event)"
                @update:content="updateVariable(data[0], $event)"
                @delete="removeVariable(data[0])"
              />
            </template>
          </template>
          <div
            v-else
            class="
              flex items-center justify-center rounded border border-dashed border-(--SmartThemeQuoteColor)/40 py-1
              th-text-sm text-(--SmartThemeBodyColor)/70
            "
          >
            {{ t`No variables, click "Add Variable" above to create` }}
          </div>
        </template>
        <TextMode v-else-if="props.currentView === 'text'" v-model:data="variables" :search-input="props.searchInput" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRefHistory } from '@vueuse/core';
import { computed } from 'vue';

import CardMode from '@/panel/toolbox/variable_manager/CardMode.vue';
import type { FiltersState } from '@/panel/toolbox/variable_manager/filter';
import RootVariableCreator from '@/panel/toolbox/variable_manager/RootVariableCreator.vue';
import TextMode from '@/panel/toolbox/variable_manager/TextMode.vue';
import TreeMode from '@/panel/toolbox/variable_manager/TreeMode.vue';
import type { RootVariablePayload } from '@/panel/toolbox/variable_manager/types';
import { rootVariableKeySchema } from '@/panel/toolbox/variable_manager/types';
import { useModal } from 'vue-final-modal';

const props = defineProps<{
  filters: FiltersState;
  currentView: 'tree' | 'card' | 'text';
  searchInput: RegExp | null;
}>();

const variables = defineModel<Record<string, any>>({ required: true });

/**
 * Create history manager for variables
 * Configure deep watch, capacity limit, and snapshot options
 */
const { history, commit, undo, redo, canUndo, canRedo } = useRefHistory(variables, {
  deep: true,
  clone: true,
  capacity: 20,
  flush: 'post',
});

watchDebounced(variables, () => commit(), { debounce: 300, deep: true });

const createRootVariable = (payload: RootVariablePayload): boolean => {
  const keyResult = rootVariableKeySchema.safeParse(payload.key);
  if (!keyResult.success) {
    keyResult.error.issues.forEach(issue => {
      toastr.error(issue.message, 'Key name validation failed');
    });
    return false;
  }

  const key = keyResult.data;
  if (Object.prototype.hasOwnProperty.call(variables.value, key)) {
    toastr.error(`Key name "${key}" already exists`, 'Add variable failed');
    return false;
  }

  variables.value = {
    [key]: payload.value,
    ...variables.value,
  };

  toastr.success(`Created root variable "${key}"`, 'Add variable successful');
  return true;
};

const hasVariables = computed(() => Object.keys(variables.value).length > 0);

const openRootCreatorModal = () => {
  const { open: openCreatorModal } = useModal({
    component: RootVariableCreator,
    attrs: {
      onSubmit: async (payload: RootVariablePayload) => createRootVariable(payload),
    },
  });

  openCreatorModal();
};

const clearAllVariables = () => {
  if (!hasVariables.value) {
    toastr.info(t`No variables to delete`, t`Delete all`);
    return;
  }

  variables.value = {};
  toastr.success(t`Deleted all variables`, t`Delete successful`);
};

defineExpose({
  undo,
  redo,
  canUndo,
  canRedo,
  history,
  createRootVariable,
});

const writable_variables = computed({
  get: () => Object.entries(variables.value),
  set: entries => {
    variables.value = Object.fromEntries(entries);
  },
});

const removeVariable = (nameToRemove: string | number) => {
  const target = String(nameToRemove);
  writable_variables.value = writable_variables.value.filter(([key]) => String(key) !== target);
};

const updateVariable = (key: string | number, newValue: unknown) => {
  const k = String(key);
  variables.value = { ...variables.value, [k]: newValue };
};

const renameVariable = (oldKey: string | number, newKey: string | number) => {
  const source = String(oldKey);
  const target = String(newKey || '').trim();
  if (!target) {
    toastr.error('Key name cannot be empty', 'Rename failed');
    return;
  }
  if (source === target) return;
  if (Object.prototype.hasOwnProperty.call(variables.value, target)) {
    toastr.error(`Key name "${target}" already exists`, 'Rename failed');
    return;
  }
  const entries = Object.entries(variables.value).map(([k, v]) => (k === source ? [target, v] : [k, v]));
  variables.value = Object.fromEntries(entries);
};
</script>
