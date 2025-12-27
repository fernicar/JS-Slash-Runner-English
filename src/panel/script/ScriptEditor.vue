<template>
  <Popup :buttons="[{ name: t`Confirm`, shouldEmphasize: true, onClick: close => submit(close) }, { name: t`Cancel` }]">
    <DefineMaximizeButton v-slot="{ activate }">
      <i class="fa-solid fa-maximize interactable cursor-pointer" @click="activate"></i>
    </DefineMaximizeButton>
    <div class="flex h-full flex-col flex-wrap items-center gap-0.25 overflow-y-auto text-left">
      <div class="my-0.5 th-text-md font-bold">{{ props.script !== undefined ? t`Edit Script` : t`Create New Script` }}</div>
      <div class="TH-script-editor-container">
        <strong>{{ t`Script Name` }}</strong>
        <input v-model="script.name" type="text" class="text_pole" />
      </div>
      <div class="TH-script-editor-container">
        <div class="flex items-center gap-[5px]">
          <strong>{{ t`Script Content` }}</strong>
          <MaximizeButton @click="() => openMaximize('content')"></MaximizeButton>
        </div>
        <textarea
          v-model="script.content"
          :placeholder="t`JavaScript code for the script`"
          rows="3"
          class="text_pole font-(family-name:--monoFontFamily)!"
        />
      </div>
      <div class="TH-script-editor-container">
        <div class="flex items-center gap-[5px]">
          <strong>{{ t`Author's Notes` }}</strong>
          <MaximizeButton @click="() => openMaximize('info')"></MaximizeButton>
        </div>
        <textarea
          v-model="script.info"
          :placeholder="t`Script notes, such as author name, version, and precautions, supports simple markdown and html`"
          rows="3"
          class="text_pole font-(family-name:--monoFontFamily)!"
        />
      </div>
      <div class="TH-script-editor-container">
        <div class="flex flex-wrap items-center justify-center gap-[5px]">
          <strong>{{ t`Variable List` }}</strong>
          <MaximizeButton @click="() => openMaximize('data')"></MaximizeButton>
        </div>
        <small>{{ t`Variables bound to the script will be exported with it` }}</small>
        <div
          :class="[
            `
              my-[5px] h-[150px] w-full overflow-hidden rounded-[5px] border border-(--SmartThemeBorderColor)
              bg-(--black30a)
            `,
            { 'pointer-events-none': hideInlineDataEditor },
          ]"
          :aria-hidden="hideInlineDataEditor"
        >
          <JsonEditor v-model="script.data" />
        </div>
      </div>
      <div class="TH-script-editor-container">
        <div class="flex w-full items-center justify-between">
          <div class="flex flex-col">
            <div class="flex flex-wrap items-center gap-[5px]">
              <strong>{{ t`Buttons` }}</strong>
              <div class="menu_button interactable" @click="addButton">
                <i class="fa-solid fa-plus"></i>
              </div>
            </div>
            <small>{{ t`Needs to be used with getButtonEvent in the code` }}</small>
          </div>
          <Toggle id="TH-script-editor-button-enabled-toggle" v-model="script.button.enabled" class="mr-[5px]" />
        </div>
        <div class="button-list">
          <VueDraggable
            v-model="script.button.buttons"
            handle=".TH-handle"
            class="flex flex-col"
            :animation="150"
            direction="vertical"
            :force-fallback="true"
            item-key="id"
          >
            <div
              v-for="(button, index) in script.button.buttons"
              :key="`button-${index}`"
              class="flex items-center justify-between gap-0.25"
            >
              <span class="TH-handle cursor-grab select-none">☰</span>
              <input v-model="button.visible" type="checkbox" />
              <input v-model="button.name" class="text_pole" type="text" :placeholder="t`Button Name`" />
              <div class="menu_button interactable" :data-index="index" @click="deleteButton(index)">
                <i class="fa-solid fa-trash"></i>
              </div>
            </div>
          </VueDraggable>
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import MaximizeEditor from '@/panel/script/MaximizeEditor.vue';
import { ScriptForm } from '@/panel/script/type';
import { createReusableTemplate } from '@vueuse/core';
import { VueDraggable } from 'vue-draggable-plus';

const [DefineMaximizeButton, MaximizeButton] = createReusableTemplate();

const props = defineProps<{ script?: ScriptForm }>();

const emit = defineEmits<{
  submit: [script: ScriptForm];
}>();

const script = ref<ScriptForm>(
  klona(
    props.script ?? {
      name: '',
      content: '',
      info: '',
      button: {
        enabled: true,
        buttons: [],
      },
      data: {},
    },
  ),
);

const submit = (close: () => void) => {
  const result = ScriptForm.safeParse(script.value);
  if (!result.success) {
    _(result.error.issues)
      .groupBy('path')
      .entries()
      .forEach(([path, issues]) => {
        toastr.error(issues.map(issue => issue.message).join('\n'), path);
      });
    return;
  }
  emit('submit', result.data);
  close();
};

// External "Maximize Editor" popup: Created on demand and written back upon confirmation to avoid conflicts with multiple Popups in a single file
type MaximizeTarget = 'content' | 'info' | 'data';
const hideInlineDataEditor = ref(false);

function openMaximize(target: MaximizeTarget) {
  console.log('openMaximize', target);
  if (target === 'data') hideInlineDataEditor.value = true;

  const modal = useModal({
    component: MaximizeEditor,
    attrs: {
      target,
      initialText: target === 'content' ? script.value.content : target === 'info' ? script.value.info : undefined,
      initialData: target === 'data' ? script.value.data : undefined,
      onConfirm: (payload: { target: MaximizeTarget; text?: string; data?: Record<string, any> }) => {
        if (payload.target === 'content' && typeof payload.text === 'string') {
          script.value.content = payload.text;
        } else if (payload.target === 'info' && typeof payload.text === 'string') {
          script.value.info = payload.text;
        } else if (payload.target === 'data' && payload.data) {
          // Replace all at once to reduce rendering/calculation costs from deep diffing
          script.value.data = klona(payload.data);
        }
        if (target === 'data') hideInlineDataEditor.value = false;
      },
      onClosed: () => {
        if (target === 'data') hideInlineDataEditor.value = false;
      },
    },
  });
  modal.open();
}

const addButton = () => {
  script.value.button.buttons.push({
    name: '',
    visible: true,
  });
};

const deleteButton = (index: number) => {
  script.value.button.buttons.splice(index, 1);
};
</script>

<style scoped>
@reference 'tailwindcss';

.TH-script-editor-container {
  @apply flex flex-col items-start mb-1 w-full;
}

.button-list {
  @apply mt-0.5;
}

.button-list input.text_pole {
  @apply m-0;
}
</style>
