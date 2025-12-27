<template>
  <Popup :buttons="[{ name: t`Close` }]">
    <div class="my-1.25 flex flex-col flex-wrap gap-0.5">
      <h3 class="my-0!">{{ t`Built-in Library` }}</h3>
      <div class="mb-0.75 flex flex-col gap-0.75">
        <span class="inline-block text-left">{{
          t`Built-in libraries serve more as examples of what scripts can do. For more practical scripts, please visit the community's tools section.`
        }}</span>
        <span class="inline-block text-left"
          >{{ t`If you need to create a script, it is recommended to check the` }}
          <a
            href="https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html"
            target="_blank"
          >
            {{ t`Official Template Configuration Tutorial` }}
          </a>
        </span>
      </div>
      <!-- prettier-ignore-attribute -->
      <div
        v-for="builtin in builtins"
        :key="builtin.name"
        class="flex w-full items-center justify-between rounded-sm border border-(--SmartThemeBorderColor) p-0.25"
      >
        <div class="ml-0.5 grow overflow-hidden text-left! text-ellipsis! whitespace-nowrap!">
          {{ builtin.name }}
        </div>
        <div class="flex shrink-0! flex-nowrap! items-center gap-0.5">
          <DefineToolButton v-slot="{ name, icon }">
            <div class="menu_button interactable my-0! mr-0.5" :title="name">
              <i class="fa-solid" :class="icon"></i>
            </div>
          </DefineToolButton>
          <ToolButton name="View Author Notes" icon="fa-info-circle" @click="openInfo(builtin)" />
          <ToolButton name="Export Script" icon="fa-plus" @click="importScript(builtin)" />
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import Popup from '@/panel/component/Popup.vue';
import { useGlobalScriptsStore } from '@/store/scripts';
import { Script } from '@/type/scripts';
import { renderMarkdown } from '@/util/tavern';
import { uuidv4 } from '@sillytavern/scripts/utils';

const [DefineToolButton, ToolButton] = createReusableTemplate<{
  name: string;
  icon: string;
}>();

type BuiltinScript = {
  name: string;
  content_url: string;
  info_url: string;
};
async function getInfo(script: BuiltinScript): Promise<string> {
  const response = await fetch(script.info_url);
  if (!response.ok) {
    throw Error(`Failed to get script information: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
async function toScript(script: BuiltinScript): Promise<Script> {
  return {
    type: 'script',
    enabled: false,
    name: script.name,
    id: uuidv4(),
    content: `import '${script.content_url}'`,
    info: await getInfo(script),
    button: {
      enabled: true,
      buttons: [],
    },
    data: {},
  };
}

const builtins: BuiltinScript[] = [
  {
    name: t`Tagging: Automatically toggle regex and prompt entries based on world books, presets, or link configurations`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/标签化/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/标签化/README.md',
  },
  {
    name: t`Preset Accidental Touch Protection`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/预设防误触/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/预设防误触/README.md',
  },
  {
    name: t`World Book Forced Custom Sorting`,
    content_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/世界书强制自定义排序/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/世界书强制自定义排序/README.md',
  },
  {
    name: t`World Book Forced to use Recommended Global Settings`,
    content_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/世界书强制用推荐的全局设置/index.js',
    info_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/世界书强制用推荐的全局设置/README.md',
  },
  {
    name: t`One-click Disable Entry Recursion`,
    content_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/一键禁用条目递归/index.js',
    info_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/一键禁用条目递归/README.md',
  },
  {
    name: t`Save preset directly when saving preset entries`,
    content_url:
      'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/保存提示词时保存预设/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/保存提示词时保存预设/README.md',
  },
  {
    name: t`Preset Entry More Button: One-click add preset entries`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/预设条目更多按钮/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/预设条目更多按钮/README.md',
  },
  {
    name: t`Character Card Bound Presets: Switch to corresponding preset when switching to a character card`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/角色卡绑定预设/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/角色卡绑定预设/README.md',
  },
  {
    name: t`Input Assistant`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/输入助手/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/输入助手/README.md',
  },
  {
    name: t`Compress System Messages: Make AI understanding more coherent`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/压缩相邻消息/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/压缩相邻消息/README.md',
  },
  {
    name: t`Depth Entry Repeller: Force depth entries to be only at D0 or D9999`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/深度条目排斥器/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/深度条目排斥器/README.md',
  },
  {
    name: t`High Token Count Alert: Prevent AI degradation due to length`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/token数过多提醒/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/token数过多提醒/README.md',
  },
  {
    name: t`Delete bound main World Book when deleting character card`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/删除角色卡时删除绑定的主要世界书/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/删除角色卡时删除绑定的主要世界书/README.md',
  },
  {
    name: t`Disable Code Block Highlighting`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/取消代码块高亮/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/取消代码块高亮/README.md',
  },
  {
    name: t`World Book Traditional/Simplified Conversion: One-click conversion between Traditional and Simplified Chinese`,
    content_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/世界书繁简互换/index.js',
    info_url: 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/src/酒馆助手/世界书繁简互换/README.md',
  },
];

async function openInfo(builtin: BuiltinScript) {
  toastr.info(t`Loading author notes...`);
  useModal({
    component: Popup,
    attrs: {
      width: 'wide',
      buttons: [{ name: t`Close` }],
      onOpened: () => {
        toastr.clear();
      },
    },
    slots: {
      default: `<div class="p-1.5 text-left">${renderMarkdown(await getInfo(builtin))}</div>`,
    },
  }).open();
}

async function importScript(builtin: BuiltinScript) {
  toastr.info(t`Loading script...`);
  const script = await toScript(builtin);
  toastr.clear();
  useGlobalScriptsStore().script_trees.push(script);
  toastr.success(t`Successfully imported script: '${script.name}'`);
}
</script>
