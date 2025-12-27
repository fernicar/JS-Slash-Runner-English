<template>
  <Popup v-model="isVisible" :buttons="popupButtons">
    <div class="flex w-full flex-col gap-0.75 th-text-sm text-(--SmartThemeBodyColor)">
      <div class="th-text-md font-bold">New Variable</div>
      <div class="flex flex-col gap-0.25">
        <label class="font-semibold">Key Name</label>
        <input v-model="form.key" type="text" class="text_pole" placeholder="Please enter key name" />
      </div>
      <div class="flex flex-col gap-0.25">
        <label class="font-semibold">Data Type</label>
        <select v-model="form.type" class="text_pole">
          <option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div v-if="form.type === 'string'" class="flex flex-col gap-0.25">
        <label class="font-semibold">Variable Value</label>
        <textarea v-model="form.stringValue" rows="3" class="text_pole" placeholder="Please enter string, supports multi-line"></textarea>
      </div>
      <div v-else-if="form.type === 'number'" class="flex flex-col gap-0.25">
        <label class="font-semibold">Variable Value</label>
        <input v-model="form.numberValue" type="number" class="text_pole" placeholder="Please enter a number" />
      </div>
      <div v-else-if="form.type === 'boolean'" class="flex flex-col gap-0.25">
        <label class="font-semibold">Variable Value</label>
        <select v-model="form.booleanValue" class="text_pole">
          <option v-for="option in booleanOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div v-else-if="form.type === 'array'" class="flex flex-col gap-0.25">
        <label class="font-semibold">Variable Value</label>
        <textarea
          v-model="form.arrayValue"
          rows="4"
          class="text_pole font-[family-name:var(--monoFontFamily)]!"
          placeholder="Please enter a JSON array, e.g. [1, 2, 3]"
        ></textarea>
      </div>
      <div v-else-if="form.type === 'object'" class="flex flex-col gap-0.25">
        <label class="font-semibold">Variable Value</label>
        <textarea
          v-model="form.objectValue"
          rows="4"
          class="text_pole font-[family-name:var(--monoFontFamily)]!"
          placeholder='Please enter a JSON object, e.g. {"name": "Tavern"}'
        ></textarea>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import Popup from '@/panel/component/Popup.vue';
import type { RootVariablePayload, RootVariableType } from '@/panel/toolbox/variable_manager/types';
import { rootVariableTypes } from '@/panel/toolbox/variable_manager/types';

const props = defineProps<{
  onSubmit?: (payload: RootVariablePayload) => boolean | Promise<boolean>;
}>();

const isVisible = ref(true);

const typeOptions = rootVariableTypes.map(value => ({
  value,
  label:
    value === 'string'
      ? 'String'
      : value === 'number'
        ? 'Number'
        : value === 'boolean'
          ? 'Boolean'
          : value === 'array'
            ? 'Array'
            : value === 'object'
              ? 'Object'
              : 'Null',
}));

const booleanOptions = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
];

const form = reactive({
  key: '',
  type: 'string' as RootVariableType,
  stringValue: '',
  numberValue: '',
  booleanValue: 'true' as 'true' | 'false',
  arrayValue: '[]',
  objectValue: '{}',
});

const popupButtons = computed(() => [
  {
    name: 'Create Variable',
    shouldEmphasize: true,
    onClick: submit,
  },
  { name: 'Cancel' },
]);

interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Validate and convert user input value based on variable type
 * @param type Data type of variable
 * @returns Validation result object, containing success status, converted data or error info
 */
const validateValue = (type: RootVariableType): ValidationResult => {
  switch (type) {
    case 'string':
      return { success: true, data: form.stringValue };

    case 'number': {
      const trimmed = form.numberValue.toString().trim();
      return { success: true, data: trimmed === '' ? 0 : Number(trimmed) };
    }

    case 'boolean':
      return { success: true, data: form.booleanValue === 'true' };

    case 'array': {
      const trimmed = form.arrayValue.trim();
      if (!trimmed) {
        return { success: false, error: 'Array content cannot be empty' };
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) {
          return { success: false, error: 'Please enter a valid JSON array' };
        }
        return { success: true, data: parsed };
      } catch (error) {
        return { success: false, error: 'Please enter a valid JSON array' };
      }
    }

    case 'object': {
      const trimmed = form.objectValue.trim();
      if (!trimmed) {
        return { success: false, error: 'Object content cannot be empty' };
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
          return { success: false, error: 'Please enter a valid JSON object' };
        }
        return { success: true, data: parsed };
      } catch (error) {
        return { success: false, error: 'Please enter a valid JSON object' };
      }
    }

    case 'null':
      return { success: true, data: null };

    default:
      return { success: false, error: 'Unknown data type' };
  }
};

/**
 * Reset form to initial state, clear all input fields
 */
const resetForm = () => {
  form.key = '';
  form.type = 'string';
  form.stringValue = '';
  form.numberValue = '';
  form.booleanValue = 'true';
  form.arrayValue = '[]';
  form.objectValue = '{}';
};

/**
 * Handle form submission logic, validate input data and create root variable
 * @param close Callback function to close popup
 */
const submit = async (close: () => void) => {
  // Simple validate key name
  if (!form.key || !form.key.trim()) {
    toastr.error('Key name cannot be empty', 'Key name validation failed');
    return;
  }

  const valueResult = validateValue(form.type);
  if (!valueResult.success) {
    toastr.error(valueResult.error || 'Unknown error', 'Variable value validation failed');
    return;
  }

  const payload: RootVariablePayload = {
    key: form.key.trim(),
    type: form.type,
    value: valueResult.data,
  };

  const shouldClose = (await props.onSubmit?.(payload)) ?? true;
  if (shouldClose !== false) {
    close();
    resetForm();
  }
};
</script>
