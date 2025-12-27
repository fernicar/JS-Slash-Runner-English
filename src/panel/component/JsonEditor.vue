<template>
  <div ref="editor" class="h-full w-full" />
</template>

<script setup lang="ts">
import { getCurrentLocale } from '@sillytavern/scripts/i18n';
import { detailedDiff } from 'deep-object-diff';
import { destr, safeDestr } from 'destr';
import { Content, createJSONEditor, JSONEditorPropsOptional, Mode, ValidationSeverity } from 'vanilla-jsoneditor';

const props = defineProps<{ schema?: z.ZodType<any> }>();

const content = defineModel<Record<string, any>>({ required: true });

const editor_ref = useTemplateRef('editor');

function updateModel(updated: Content) {
  prevent_updating_content = true;
  if (_.get(updated, 'text') !== undefined) {
    if (editor_instance.validate() === undefined) {
      const new_content = destr(_.get(updated, 'text'));
      if (_.isPlainObject(new_content)) {
        content.value = new_content as Record<string, any>;
      }
    }
    return;
  }
  const new_content = _.get(updated, 'json');
  if (_.isPlainObject(new_content)) {
    content.value = new_content as Record<string, any>;
  }
}
const updateModelDebounced = _.debounce(updateModel, 300);

let editor_instance: ReturnType<typeof createJSONEditor>;
let prevent_updating_content = false;
let mode: Mode = Mode.tree;
onMounted(() => {
  const ANIMATION_TIME = 1000;
  document.documentElement.style.setProperty('--jse-custom-anim-duration', `${ANIMATION_TIME}ms`);

  editor_instance = createJSONEditor({
    target: editor_ref.value!,
    props: {
      content: {
        json: content.value,
      },
      mode: mode,
      parser: {
        // @ts-expect-error destr is available for use
        parse: safeDestr,
        stringify: JSON.stringify,
      },
      validator: json => {
        if (!props.schema) {
          return [];
        }
        const result = props.schema.safeParse(json);
        if (result.success) {
          return [];
        }
        return result.error.issues.map(issue => ({
          path: issue.path.map(String),
          message: issue.message,
          severity: ValidationSeverity.error,
        }));
      },
      onChangeMode: new_mode => {
        mode = new_mode;
      },
      onChange: updated => {
        if (mode === Mode.text) {
          updateModelDebounced(updated);
        } else {
          updateModel(updated);
        }
      },
      language: getCurrentLocale().includes('zh') ? 'zh' : 'en',
    } satisfies JSONEditorPropsOptional,
  });

  watch(content, (new_content, old_content) => {
    if (prevent_updating_content) {
      prevent_updating_content = false;
      return;
    }

    // TODO: How is the performance?
    const diff = detailedDiff(old_content, new_content);

    const has_deletions = !_.isEmpty(diff.deleted);

    const play_addition_and_update_animation = () => {
      editor_instance.updateProps({
        content: {
          json: klona(new_content),
        },
        onClassName: path =>
          _.has(diff.updated, path) ? 'jse-custom-updated' : _.has(diff.added, path) ? 'jse-custom-added' : undefined,
      });

      _.delay(() => {
        editor_instance.updateProps({
          onClassName: () => undefined,
        });
      }, ANIMATION_TIME);
    };

    if (has_deletions) {
      // Add classes to nodes that will be deleted and play the deletion animation first
      editor_instance.updateProps({
        onClassName: path => (_.has(diff.deleted, path) ? 'jse-custom-deleted' : undefined),
      });
      // Play addition and update animations after a delay
      _.delay(play_addition_and_update_animation, ANIMATION_TIME);
    } else {
      play_addition_and_update_animation();
    }
  });
});
onBeforeUnmount(() => {
  editor_instance.destroy();
});
</script>

<style>
:root {
  /* Overall background */
  --jse-background-color: var(--SmartThemeBlurTintColor);
  /* Theme color */
  --jse-theme-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent);
  /* Text color */
  --jse-text-color: var(--SmartThemeBodyColor);
  /* Toolbar text color */
  --jse-menu-color: var(--SmartThemeEmColor);
  /* Toolbar button theme color highlight */
  --jse-theme-color-highlight: var(--white20a);
  /* Key name color */
  --jse-key-color: var(--SmartThemeQuoteColor);
  /* Background color for selected variables */
  --jse-selection-background-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent);
  --jse-selection-background-inactive-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent);
  /* Background color for dropdown arrows */
  --jse-context-menu-pointer-hover-background: #b2b2b2;
  --jse-context-menu-pointer-background: #b2b2b2;
  /* Delimiter (i.e., colon) color */
  --jse-delimiter-color: var(--SmartThemeEmColor);
  /* Path display panel text color */
  --jse-panel-button-color: var(--SmartThemeEmColor);
  /* Path display panel background color */
  --jse-panel-background: var(--SmartThemeBlurTintColor);
  /* Path display panel text color */
  --jse-panel-color-readonly: var(--SmartThemeEmColor);
  /* Path display panel border color */
  --jse-panel-border: var(--SmartThemeEmColor);
  /* Path display panel background highlight color */
  --jse-panel-button-background-highlight: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent);
  /* Indent marker color */
  --indent-markers: var(--SmartThemeEmColor);

  /* Modal (not context menu) background */
  --jse-modal-background: var(--SmartThemeBlurTintColor);
  /* Dropdown list font size */
  --jse-svelte-select-font-size: var(--mainFontSize);
  /* Context menu font size */
  --jse-font-size: var(--mainFontSize);
  /* Context menu padding */
  --jse-padding: calc(var(--mainFontSize) * 0.5);
  /* Text mode search panel font size */
  --jse-font-size-text-mode-search: calc(var(--mainFontSize) * 0.9);

  /* Modal select box background */
  --jse-svelte-select-background: var(--SmartThemeShadowColor);
  /* Dropdown list background */
  --list-background: var(--SmartThemeShadowColor);
  /* Dropdown list item active background */
  --jse-item-is-active-bg: var(--SmartThemeQuoteColor);
  /* Dropdown list item focused border */
  --border-focused: var(--SmartThemeQuoteColor);
  /* Dropdown list item hover background */
  --item-hover-bg: rgb(from var(--SmartThemeChatTintColor) r g b / 1);
  /* Button text color */
  --jse-button-primary-color: var(--SmartThemeBodyColor);
  /* Key-value font size */
  --jse-font-size-mono: var(--mainFontSize);

  /* Variable: String color */
  --jse-value-color-string: var(--SmartThemeBodyColor);
  /* Variable: Number color */
  --jse-value-color-number: rgb(255 79 79);
  /* Variable: Boolean color */
  --jse-value-color-boolean: rgb(195 118 210);
  /* Variable: Null color */
  --jse-value-color-null: var(--crimson70a);
  /* Variable: URL color */
  --jse-value-color-url: rgb(122 151 90);

  /* Editor box outline */
  --jse-edit-outline: (1px solid var(--grey5050a));
  /* Active line background color */
  --jse-active-line-background-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent);

  /* Indent marker background color */
  --jse-indent-marker-bg-color: var(--grey5050a);
  /* Indent marker active background color */
  --jse-indent-marker-active-bg-color: var(--grey5050a);
  /* Link color for collapsed items */
  --jse-collapsed-items-link-color: var(--SmartThemeEmColor);
  /* Tag background color */
  --jse-tag-background: var(--grey5050a);
}

@media screen and (max-width: 500px) {
  :root {
    --jse-font-size: calc(var(--mainFontSize) * 0.8);
    --jse-font-size-main-menu: calc(var(--mainFontSize) * 0.8);
    --jse-svelte-select-font-size: calc(var(--mainFontSize) * 0.8);
    --jse-font-size-mono: calc(var(--mainFontSize) * 0.8);
    --jse-font-size-text-mode-search: calc(var(--mainFontSize) * 0.7);
  }

  .jse-header button svg {
    width: calc(var(--mainFontSize) * 0.8);
    height: calc(var(--mainFontSize) * 0.8);
  }
}

.jse-modal {
  z-index: 10000;
}

.jse-selected {
  color: var(--SmartThemeBlurTintColor) !important;
}

.jse-navigation-bar {
  margin: 5px 0 !important;
  border-radius: 3px;
  border-left: 1px solid var(--SmartThemeQuoteColor) !important;
  border-right: 1px solid var(--SmartThemeQuoteColor) !important;
  border: 1px solid var(--SmartThemeQuoteColor);
}

.jse-context-menu-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.jse-contents,
.jse-status-bar {
  border: none !important;
}

.jse-context-menu-button {
  font-size: calc(var(--mainFontSize) * 0.8) !important;
}

.jse-context-menu-button svg {
  width: calc(var(--mainFontSize) * 0.8) !important;
  height: calc(var(--mainFontSize) * 0.8) !important;
}

.jse-navigation-bar-arrow svg,
.jse-navigation-bar-edit svg {
  width: 10px;
}

.jse-modal-contents .svelte-select input {
  background-color: transparent !important;
  border: none !important;
}

.cm-search label {
  display: inline-flex;
  padding-left: 0 !important;
  color: var(--jse-panel-button-color) !important;
}

.cm-search input.cm-textfield {
  width: 100px;
}

.jse-description {
  white-space: normal;
}

.jse-contextmenu .jse-row .jse-dropdown-button {
  gap: 5px;
}

.jse-contextmenu .jse-label {
  font-size: calc(var(--mainFontSize) * 0.7);
  font-weight: 700;
}

.jse-key {
  white-space: nowrap !important;
}

.jse-collapsed-items {
  margin-left: 0 !important;
  background-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent) !important;
  background-image: none !important;
  white-space: normal;
}

.jse-message {
  white-space: normal;
}

.jse-modal-wrapper .jse-modal-contents .jse-modal-inline-editor {
  --jse-theme-color: color-mix(in srgb, var(--SmartThemeQuoteColor) 20%, transparent) !important;
}

.jse-custom-added {
  animation: background-flash-green var(--jse-custom-anim-duration) ease-in-out;
  animation-fill-mode: forwards;
}

.jse-custom-deleted {
  animation: background-flash-red var(--jse-custom-anim-duration) ease-in-out;
  animation-fill-mode: forwards;
}

.jse-custom-updated {
  animation: background-flash-blue var(--jse-custom-anim-duration) ease-in-out;
  animation-fill-mode: forwards;
}

@keyframes background-flash-green {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(34, 197, 94, 0.3);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes background-flash-red {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(239, 68, 68, 0.3);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes background-flash-blue {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(16, 104, 247, 0.3);
  }
  100% {
    background-color: transparent;
  }
}
</style>
