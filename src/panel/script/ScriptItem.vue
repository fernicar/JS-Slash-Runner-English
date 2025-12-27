<template>
  <!-- prettier-ignore-attribute -->
  <div
    v-show="is_visible"
    class="
      flex w-full items-center justify-between rounded-[10px] border border-(--SmartThemeBorderColor)
      bg-(--SmartThemeBlurTintColor) p-[5px]
    "
    data-type="script"
    :data-script-id="script.id"
  >
    <span class="TH-handle cursor-grab select-none active:cursor-grabbing">☰</span>

    <div
      class="ml-0.5 w-0 grow overflow-hidden"
      :style="{
        textDecoration: script.enabled ? 'none' : 'line-through',
        filter: script.enabled ? 'none' : 'grayscale(0.5)',
      }"
    >
      <Highlighter :query="search_input">{{ script.name }}</Highlighter>
    </div>
    <div class="flex flex-nowrap items-center gap-[5px]">
      <!-- Script toggle -->
      <div class="cursor-pointer" :class="{ enabled: script.enabled }" @click="script.enabled = !script.enabled">
        <i class="fa-solid" :class="[script.enabled ? 'fa-toggle-on' : 'fa-toggle-off']" />
      </div>
      <DefineToolButton v-slot="{ name, icon }">
        <div class="menu_button interactable mt-0! mr-0.5 mb-0! p-[5px]!" :title="name">
          <i class="fa-solid" :class="icon"></i>
        </div>
      </DefineToolButton>
      <ToolButton :name="t`View Author's Notes`" icon="fa-info-circle" @click="openScriptInfo" />
      <ToolButton :name="t`Edit Script`" icon="fa-pencil" @click="openScriptEditor" />
      <ToolButton
        v-show="!showMoreActions"
        ref="moreActionsRef"
        :name="t`More Actions`"
        icon="fa-ellipsis-h"
        @click="showMoreActions = true"
      />
      <ToolButton v-show="showMoreActions" :name="t`Copy Script`" icon="fa-copy" @click="copyScript" />
      <ToolButton
        v-show="showMoreActions"
        :name="t`Move Script`"
        icon="fa-arrow-right-arrow-left"
        @click="openMoveConfirm"
      />
      <ToolButton v-show="showMoreActions" :name="t`Export Script`" icon="fa-file-export" @click="exportScript" />
      <ToolButton :name="t`Delete Script`" icon="fa-trash" @click="openDeleteConfirm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Popup from '@/panel/component/Popup.vue';
import ScriptEditor from '@/panel/script/ScriptEditor.vue';
import TargetSelector from '@/panel/script/TargetSelector.vue';
import { ScriptForm } from '@/panel/script/type';
import { useScriptIframeRuntimesStore } from '@/store/iframe_runtimes/script';
import { Script } from '@/type/scripts';
import { renderMarkdown } from '@/util/tavern';
import { download, getSanitizedFilename } from '@sillytavern/scripts/utils';
import { createReusableTemplate, onClickOutside } from '@vueuse/core';

const showMoreActions = ref(false);
const moreActionsRef = useTemplateRef<HTMLDivElement>('moreActionsRef');
onClickOutside(moreActionsRef, () => {
  showMoreActions.value = false;
});

const [DefineToolButton, ToolButton] = createReusableTemplate<{
  name: string;
  icon: string;
}>();

const script = defineModel<Script>({ required: true });
const props = defineProps<{
  target: 'global' | 'character' | 'preset';
}>();

const emit = defineEmits<{
  delete: [id: string];
  move: [id: string, target: 'global' | 'character' | 'preset'];
  copy: [id: string, target: 'global' | 'character' | 'preset'];
}>();

const search_input = inject<Ref<RegExp | null>>('search_input', ref(null));

const is_visible = computed(() => {
  return search_input.value === null || search_input.value.test(script.value.name);
});

const { open: openScriptEditor } = useModal({
  component: ScriptEditor,
  attrs: {
    script: script.value,
    onSubmit: (result: ScriptForm) => {
      const should_reload =
        script.value.enabled &&
        (!_.isEqual(_.pick(script.value, 'content', 'data'), _.pick(result, 'content', 'data')) ||
          !_.isEqual(
            script.value.button.buttons.map(button => button.name).toSorted(),
            result.button.buttons.map(button => button.name).toSorted(),
          ));
      _.assign(script.value, result);
      if (should_reload) {
        useScriptIframeRuntimesStore().reload(script.value.id);
      }
    },
  },
});

const openScriptInfo = () =>
  useModal({
    component: Popup,
    attrs: {
      width: 'wide',
      buttons: [{ name: t`Close` }],
    },
    slots: {
      default: `<div class='p-1.5 text-left'>${script.value.info ? renderMarkdown(script.value.info) : t`No author's notes provided`}</div>`,
    },
  }).open();

const { open: openDeleteConfirm } = useModal({
  component: Popup,
  attrs: {
    buttons: [
      {
        name: t`Confirm`,
        shouldEmphasize: true,
        onClick: close => {
          emit('delete', script.value.id);
          close();
        },
      },
      { name: t`Cancel` },
    ],
  },
  slots: {
    default: t`<div>Are you sure you want to delete this script? This action cannot be undone.</div>`,
  },
});

const { open: openMoveConfirm } = useModal({
  component: TargetSelector,
  attrs: {
    target: props.target,
    onSubmit: (target: 'global' | 'character' | 'preset') => {
      if (props.target === target) {
        return;
      }
      emit('move', script.value.id, target);
    },
  },
});

type ScriptExportOptions = {
  should_strip_data: boolean;
};

type ScriptExportPayload = {
  filename: string;
  data: string;
};

const createExportPayload = async (option: ScriptExportOptions): Promise<ScriptExportPayload> => {
  const to_export = klona(script.value);
  if (option.should_strip_data) {
    _.set(to_export, 'data', {});
  }
  const filename = await getSanitizedFilename(t`Tavern-Helper-Script-${to_export.name}.json`);
  const data = JSON.stringify(to_export, null, 2);
  return { filename, data };
};

const downloadExport = async (options: ScriptExportOptions) => {
  const { filename, data } = await createExportPayload(options);
  download(data, filename, 'application/json');
};

const exportScript = () => {
  const has_data = !_.isEmpty(script.value.data);
  if (!has_data) {
    downloadExport({ should_strip_data: false });
    return;
  }

  useModal({
    component: Popup,
    attrs: {
      buttons: [
        {
          name: t`Export with Data`,
          onClick: close => {
            void downloadExport({ should_strip_data: false });
            close();
          },
        },
        {
          name: t`Export without Data`,
          shouldEmphasize: true,
          onClick: close => {
            void downloadExport({ should_strip_data: true });
            close();
          },
        },
        { name: t`Cancel`, onClick: close => close() },
      ],
    },
    slots: {
      default: t`<div>The script '${script.value.name}' contains variables. Would you like to clear them? Please be careful to clear sensitive data such as API Keys.</div>`,
    },
  }).open();
};

const copyScript = () => {
  useModal({
    component: TargetSelector,
    attrs: {
      onSubmit: (target: 'global' | 'character' | 'preset') => {
        emit('copy', script.value.id, target);
      },
    },
  }).open();
};
</script>
