<!-- markdownlint-disable MD041 MD036 -->
## 4.3.13

### 🗣 Prompt Viewer

- Added support for searching special characters in Prompt Viewer

## 4.3.12

### 📦 Function

- `generateRaw` Issue where injecting prompts with `inject` failed in some cases

### 🐛 Fix

- Compatibility for Tavern versions `1.12.10`~`1.12.12`

## 4.3.11

### 🎨 Renderer

- Fixed issue where iframe blob rendering height was incorrect under some extreme conditions

### 📦 Function

- Now TavernHelper macros registered by scripts via `registerMacroLike` will automatically unregister when the script is closed

## 4.3.10

### 💬 TavernHelper Macros

- Fixed issue where TavernHelper built-in variable macros could not retrieve variables normally in some extreme cases

### 📦 Function

- Added many events provided by the new version of Tavern
- Optimized display of errors caught by `errorCatched`

## 4.3.9

### 🎨 Renderer

- Fixed issue where iframe blob rendering height was incorrect under some extreme conditions

### 💬 TavernHelper Macros

- `{{get_message_variable:: variable}}` and `{{format_message_variable::variable}}` will ignore variables starting with `$`. For example, for `{ $meta: {}, Favorability: 0 }`, `{{get_message_variable::stat_data}}` will only return `{ Favorability : 0 }`

### 📦 Function

- Now `custom_api` parameter in `generate` and `generateRaw` supports `same_as_preset` and `unset` values, representing using the preset's value and unsetting the parameter respectively. E.g., the following code will unset frequency penalty and presence penalty, convenient for models that do not support these parameters.

  ```ts
  generate({
    custom_api: {
      frequency_penalty: 'unset',
      presence_penalty: 'unset',
    }
  })
  ```

## 4.3.8

### 🎨 Renderer

- Attempted to fix the issue where frontend code blocks could not be properly hidden under certain Tavern themes due to rendering optimizations after 4.0

## 4.3.7

### 🔢 Variable Manager

- You can now use `registerVariableSchema` in a script to register zod variable schemas for Variable Manager, e.g., `stat_data.Favorability` must be a number; after registration, if the actual variable does not meet requirements, Variable Manager will show error message.

## 4.3.6

### ⏫ Native Experience

- **`Messages to Load` can be set to any non-negative number**: Originally Tavern only allowed setting `Messages to Load` in the top `Person Icon` settings to multiples of 5; now you can set it to any non-negative number, e.g., `1` to only show the most recent message in chat, making Tavern gameplay smoother.

## 4.3.5

### 📕 Script Library

- Built-in `Delete Bound Main Lorebook when Deleting Character Card` script; once added, automatically deletes the main Lorebook bound to the character card when deleting the card

### 🐛 Fix

- `appendAudioList` Issue where the function could not be used in some versions
- `playAudio` Issue where function could not continue playing audio in some cases

## 4.3.4

### 🗣 Prompt Viewer

- Added icons to prompt entry roles (e.g., `⚙️ system`) to easily distinguish prompt entries of different roles
- Delayed Prompt Viewer's prompt listening phase so that more prompt processing scripts' handling of prompts can be correctly displayed

## 4.3.3

### 🗣 Prompt Viewer

- Added Copy Prompt function, allowing copying all prompts or individual prompts to clipboard

### 🔍 Log Viewer

- Optimized Log Viewer rendering performance

### 🐛 Fix

- Made search box correctly distinguish between normal string input and /regex /
- Fixed incorrect height in Blob render mode

## 4.3.2

### ⏫ Native Experience

- **`Messages to Load` will remove old messages in real-time, making Tavern gameplay smoother**: If `Messages to Load` is set to 5, the page will display at most 5 messages. When a new message is sent or received, old messages will be automatically removed.

## 4.3.1

### 🐛 Fix

- Fixed script compatibility on some devices

## 4.3.0

### 🔍 Log Viewer

- Added Log Viewer feature. All logs recorded via `console` (`console.info`, etc.) in the frontend and scripts can be viewed directly in the Log Viewer, **convenient for mobile players to report errors to frontend/script authors.**

## 4.2.1

### 🐛 Fix

- TavernHelper compatibility with Tavern 1.12.10, **but it is recommended to update Tavern to 1.13.3~1.13.4**
- Fixed some very low probability issues

## 4.2.0

### ⏫ Native Experience

- **`Replacing/Updating` character card will update Lorebook: You no longer need to delete the Lorebook before `Replacing/Updating` the character card !**
- **Exporting character card will always export the latest Lorebook**

### 📕 Script Library

- Reload character script when `Replacing/Updating` a character card

### 📦 Function

- Now `eventOn` and other event listening functions will return a `stop` function to easily cancel listening :

  ```ts
  // Listen for message reception, execute when a message is received listener
  const { stop } = eventOn(tavern_events.MESSAGE_RECEIVED, listener);

  // Cancel listening
  stop();
  ```

- Now `injectPrompts` returns an `uninject` function for easier prompt injection cancellation

## 4.1.5

### 🐛 Fix

- Adjusting a preset script will no longer reload the preset; for example, switch step buttons in the preset script will work normally

## 4.1.4

### 💬 TavernHelper Macros

- Added `{{format_message_variable::variable}}` and other `{{format_xxx_variable}}` macros. Compared to `{{get_xxx_variable}}` which displays variables as a one-line JSON string, `{{format_xxx_variable}}` displays variables as a formatted YAML block :

  ```json
  // {{get_message_variable::stat_data}}
  {"Qingkong Li":{"Gender":"Male"},"Luoluo":{"Intimacy":10,"NumberOfDiariesRead":0,"HasContactInfo":false},"World":{"CurrentDay":"Wednesday","CurrentDate":"April 4th","CurrentTimePhase":1,"NextResponseInterfaceSelectionJudgment":0,"CurrentMainStoryEventID":"None","CurrentMainStoryEventPhase":0,"CurrentMainStoryOutline":"None","MainStoryEventCooldownCount":0}}
  ```

  ```yaml
  # {{format_message_variable::stat_data}}
  Qingkong Li :
    Gender: Male
  Luoluo :
    Intimacy : 10
    Number of Diaries Read : 0
    Has Contact Info : false
  World :
    Current Day: Wednesday
    Current Date: April 4th
    Current Time Phase : 1
    Next Response Interface Selection Judgment : 0
    Current Main Story Event ID: None
    Current Main Story Event Phase : 0
    Current Main Story Outline: None
    Main Story Event Cooldown Count : 0
  ```

### 📦 Function

- Exported `builtin.parseRegexFromString` function to convert `/string/` into a regular expression

## 4.1.3

### 🐛 Fix

- Character Variable Manager title should display as "Character" instead of Character Card name

## 4.1.2

### 🐛 Fix

- `setChatMessages` Issue where errors occurred in some edge cases

## 4.1.1

### 🎨 Renderer

- Make code block collapsing function only take effect when Renderer is enabled

### 📕 Script Library

- Added a copy script button, click to copy the script to other script libraries
- Collapsed "Move", "Copy", "Export" buttons, click "More Actions" button to expand
- Modifying button names or increasing/decreasing buttons in the script editing interface will trigger a script restart

### 📦 Function

- Now `registerMacroLike` will only register the same regular expression once
- Added `unregisterMacroLike` to unregister TavernHelper macros
- Indicated exceptions that functions might throw in documentation, and used `@throws` to annotate potential exceptions in type definition files

### 🐛 Fix

- Made `getChatMessages` and `setChatMessages` determine swipe count solely from `chat_message.swipes.length` to avoid influence from other plugins
- Made `errorCatched` function handle Promise more correctly
- `createChatMessages` Issue where errors occurred in some edge cases
- `generate` and `generateRaw` could not customize presence penalty and frequency penalty to 0

## 4.1.0

### 📕 Script Library

- Added Transfer Script button, click to transfer script to other libraries; of course, you can also directly drag scripts to transfer
- Added animation effects for script dragging
- Optimized script folder dragging experience

## 4.0.21

### 🐛 Fix

- Incorrect link address for `Compress Adjacent Messages` script in built-in library
- Ensure `window.SillyTavern` in frontend or scripts always points to Tavern's latest context instead of the context at initialization
- Suppose a script shares an interface to other scripts via `initializeGlobal`, and other scripts wait for sharing via `waitGlobalInitialized`; then even if the sharing script restarts, the shared interface remains valid.

## 4.0.20

### 🗣 Prompt Viewer

- Prompt Viewer can now display images in messages

### 🐛 Fix

- Fixed incorrect nesting behavior where folders could be dragged into folders in Script Library; note that folders themselves do not support nesting
- Fixed a very low probability issue where character data did not switch when importing and switching character cards
- Ensured script buttons still display in some mysterious situations

## 4.0.19

### 🗣 Prompt Viewer

- Prompt Viewer can now display the model and preset in use

## 4.0.18

### 🐛 Fix

- 编写参考中的 "酒馆 /STScript" 参考文件无法下载的问题; 当然更建议你直接使用[酒馆助手前端 Interface 或脚本编写教程](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html)

## 4.0.17

### 🐛 Fix

- 4.0.15 Fixed issue where Prompt Viewer and Variable Manager could not be dragged or resized on PC after

## 4.0.16

### 🐛 Fix

- 4.0.14 Fixed issue where script variables couldn't be controlled if the script name contained '-'

## 4.0.15

### 🐛 Fix

- Issue where initial height of Prompt Viewer and Variable Manager was too small on mobile
- Compatibility with character cards containing scripts exported before 3.2.3

## 4.0.14

### 📦 Function

- Added `temperature` and other parameters for custom API in `generate` and `generateRaw`. Easier calling might require rewriting the whole function, will see later
- Exported `builtin.duringGenerating` function to check if Tavern is requesting generation
- Exported `builtin.renderMarkdown` function to convert markdown strings to HTML
- Exported `builtin.uuidv4` function to generate UUID
- Provided Tavern's built-in `showdown` library directly to frontend and scripts, and updated its type definitions in writing templates so AI knows about it
- Added `reloadIframe` function to facilitate reloading the frontend interface or script from within the frontend or script. E.g., when switching chat files :

  ```ts
  // Reload the frontend interface or script when the chat file changes
  let current_chat_id = SillyTavern.getCurrentChatId();
  eventOn(tavern_events.CHAT_CHANGED, chat_id => {
    if (current_chat_id !== chat_id) {
      current_chat_id = chat_id;
      reloadIframe();
    }
  })
  ```

### 🐛 Fix

- Issue where variables could not be exported when selecting "Export with Data" in Script Library
- 4.0.10 Issue where `replaceVariables` failed to save script variables after

### 🔧 Misc

- Changed the library used for parsing markdown to support raw html

## 4.0.13

### 🗣 Prompt Viewer

- Prompt Viewer can now correctly estimate token count for messages with images/videos

### 🐛 Fix

- Fixed issue where TavernHelper macros failed when Tavern messages contained images

### 📦 Function

- Exported Tavern's image/video token calculation interfaces to `builtin.getImageTokenCost` and `builtin.getVideoTokenCost`
- 调整 `tavern_events.GENERATE_AFTER_DATA` 等事件的参数[类型定义](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/iframe/exported.sillytavern.d.ts#L23), Now 能正确反映酒馆发送图片、视频给 AI 的情况

## 4.0.12

### 📕 Script Library

- Moved Preset Script Library under Character Script Library as it is rarely used

### 📦 Function

- Added `initializeGlobal` and `waitGlobalInitialized` functions to the `TavernHelper` interface, making them available beyond just the frontend or scripts, facilitating extensions to share interfaces with scripts (e.g., `waitGlobalInitialized('Mvu')` to wait for the `Mvu` interface to initialize)

### 🔧 Misc

- Moved up the registration time of the global `TavernHelper` interface to try and solve issues when using plugins dependent on TavernHelper on some devices/network environments
- Cancelled use of a feature only available in Tavern 1.13.0, restoring compatibility with Tavern 1.12.10

## 4.0.11

### 🎨 Renderer

- Adjusted TavernHelper macro rendering logic to always render before the frontend interface

### 🔧 Misc

- Handled issues caused by some Tavern special settings

## 4.0.10

### 🎨 Renderer

- Adjusted frontend rendering logic to avoid re-rendering on some devices

### 📕 Script Library

- Adjusted script refresh logic to align with 3.0 refresh logic
- 调整 Script Button 的显示时延和插入逻辑, 使之与 [Samueras/GuidedGenerations-Extension](https://github.com/Samueras/GuidedGenerations-Extension) 等兼容, 不会让酒馆卡死

### 🔧 Misc

- Restored lodash library isolation between frontend and scripts to prevent AI from accidentally modifying commands like `_.remove`

## 4.0.9

### 📕 Script Library

- Issue where character scripts might fail to load when switching character cards

## 4.0.8

### 🎨 Renderer

- Fixed an issue causing repeated rendering of the frontend interface due to unknown reasons; although I still don't know the cause, it's fixed anyway ()

### 🔧 Misc

- Added `id` attribute to `<div class="qr--buttons">` for easier QR Helper compatibility.

## 4.0.7

### 🎨 Renderer

- Responsive rendering depth setting: adjust frontend interface rendering immediately after changing render depth
- Optimized the height adjustment mechanism for the frontend interface
- Avoid frontend interface duplicate rendering
- Adjusted the display style and logic of collapsed code blocks

### 🗣 Prompt Viewer

- Fixed a mysterious Vue issue causing the Prompt Viewer to occasionally be blank

## 4.0.6

### 🔧 Misc

- Adjusted TavernHelper loading order back to `"loading_order": 100` to solve some mysterious issues

## 4.0.5

### 🔢 Variable Manager

- Made floor variable update logic more intuitive when new messages appear

### 🗣 Prompt Viewer

- Now opening Prompt Viewer during AI reply will no longer interrupt AI reply

## 4.0.4

### 🎨 Renderer

- Now 'Collapse Code Blocks' function is also applied during streaming

## 4.0.3

### 🐛 Fix

- 4.0.0 Issue where `generate` returned empty response when requesting non-streaming reply after
- Now `generate` can perform tool calls normally when using non-streaming

## 4.0.2

### 🐛 Fix

- Fixed issue where the update button was unusable
- Made conversion of old data more correct

## 4.0.1

### 🐛 Fix

- Fixed conflict between frontend interface and some beautification themes

## 4.0.0

**Completely rewrote TavernHelper using Vue + Pinia + TailwindCSS.**

### 🎨 Renderer

- Removed [Enable Loading Animation] option added in 2.0.10. Changed rendering logic to display interface first then load network resources, avoiding users mistakenly thinking TavernHelper causes slow frontend loading (actually, slow loading is likely a network issue).
- Added option to [Collapse Code Blocks] to only collapse frontend interface code blocks, convenient for players who set render depth to view previous messages.

### 📕 Script Library

- Presets can now also bind TavernHelper scripts, facilitating presets with companion scripts like Gatekeeper's Card Writing Helper, and scripts like SPreset that can be bound to presets for easy import.
- Removed the [Move to another Script Library] button from the Script Library; you can now directly drag scripts to another Script Library.
- Removed rarely used script batch operation functions; please place scripts in the same folder and operate on them instead.
- Added a master switch for script buttons in the script editing interface, allowing you to easily enable/disable all script buttons with one click.
- Added full-screen buttons to script content, author notes, and variable list interfaces in script editor for easier viewing and editing.

### 🔢 Variable Manager

- 翻译并调整了 [svelte-jsoneditor](https://github.com/josdejong/svelte-jsoneditor) 作为新的 Variable Manager , 用 250mb 的数据进行测试没有卡顿.
- The new Variable Manager supports [Text] and [Tree] views, and will continue to support [Card] view in the future.
- You can now drag the Variable Manager window to the far left or right to snap it to the edge of the Tavern interface.
- Changed Variable Manager display logic on mobile to always stick to top.

### 🗣 Prompt Viewer

- Optimized Prompt Viewer performance. Tested with 28,179 chat messages (206.9mb); although Tavern itself became slow in processing prompts, the Prompt Viewer displayed them without lag.
- Added waiting screen and usage instructions to explain that Prompt Viewer **always displays the latest prompt**.
- Added Expand All/Collapse All buttons and memory for user collapse preferences to cater to different usage habits.
- You can now drag the Prompt Viewer window to the far left or right to snap it to the edge of the Tavern interface.
- Changed Prompt Viewer display logic on mobile to always stick to top.

### 🎧 Player

- Added audio title function. You can now set a title for imported audio to manage playlists more conveniently in the UI.
- Adjusted Audio Import UI, supporting single link import and batch import modes.
- Adjusted volume controller position for easier mobile operation.
- Removed cooldown and fade-in/fade-out functions from the player.
- 为音频 Player 制作了[新的 Function 接口](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/播放音频/播放状态.html)
- No longer maintaining Quick Reply commands like `/audioselect` (old character cards unaffected), as TavernHelper scripts are fully compatible and superior replacements for Quick Replies.
- No longer maintaining old commands like `audioenable`, `audioplay`, `audioMode`; assume using new functions like `playAudio`, `pauseAudio`, `setAudioSettings` instead.

### 🌐i18n Internationalization

- Translated TavernHelper into English. Now when Tavern's language is set to English, TavernHelper will also display in English.

### 💬 TavernHelper Macros

- Added `{{get_character_variable::variable}}` and `{{get_preset_variable::variable}}` to get variables for the current character card and preset

### 📦 Function

- `getVariables`、`replaceVariables` 等[Variable 相关 Function](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/ Variable / Variable 类型.html)Now 支持处理 Preset Variable (`'preset'`) 和第三方插件常用的扩展 Variable (`'extension'`).
- Now when manipulating script variables inside a script, you can just write `getVariables({type: 'script'})` without passing the `script_id` parameter.
- `replaceVariables` No longer needed `await`.
- 新增 [`getAllEnabledScriptButtons`](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/脚本额外 Function.html#getallenabledscriptbuttons) Function 用于获取当前处于启用状态的所有 Script Button , 方便 QR 助手对 Script Button 进行适配
- 新增 `installExtension` 等[安装酒馆插件](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/安装酒馆扩展.html)相关接口, Now 你可以简单地在酒馆助手中安装、更新、卸载酒馆插件了 (虽然已经有[自动安装插件脚本](https://stagedog.github.io/青空莉/作品集/)).
- Added `getTavernHelperExtensionId` function to get the TavernHelper extension ID.
- 新增 `getTavernVersion` Function 用于[获取酒馆版本](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/查询版本.html).
- 为音频 Player 制作了[新的 Function 接口](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/播放音频/播放状态.html)

### 🔧 Misc

- Removed the main TavernHelper toggle from the main interface. If you need to completely disable TavernHelper, please use the Tavern Extensions Manager button.
- Plugin main interface will remember the user's last selected function panel and automatically display it next time.
- 补充了一些酒馆事件的类型定义, 请使用酒馆助手前端 Interface 或脚本编写模板的作者[更新模板](https://stagedog.github.io/青空莉/工具经验/实时编写前端 Interface 或脚本/如何更新模板/).

### 3.6.13

### ⏫ Function

- Added `iframe_events.GENERATION_BEFORE_END` event for `generate` and `generateRaw`, allowing scripts like prompt templates to modify the result before generation ends

## 3.6.12

### 🐛 Fix

- 3.6.3 After `replaceTavernRegexes` successfully modified regex, the regex interface display did not refresh

## 3.6.11

### 💻 Interface

- Removed `Excessive Token Warning` feature from TavernHelper settings, as it didn't solve the issue of many people asking similar questions in the support channel; if you need this feature, please add the `Excessive Token Warning Script` from `TavernHelper - Built-in Library``

### ⏫ Function

**Built-in Library :**

- Added `Excessive Token Warning` script, which can remind you when token count is too high

## 3.6.10

### 💻 Interface

- Prompt info above Prompt Viewer now automatically disappears after 5 seconds to avoid taking up mobile screen space

## 3.6.9

### 💻 Interface

- Considering many people ask such questions in the support channel, added `Excessive Token Warning` in TavernHelper settings; it reminds you to summarize context when chat token count is too high

## 3.6.8

### 🐛 Fix

- Compatibility with message floor variables of the latest Prompt Template version

## 3.6.7

### 🐛 Fix

- Made `getChatMessages` and `replaceChatMessages` handle messages with multiple swipes more correctly

## 3.6.6

### 💻 Interface

- Added prompts in common FAQ areas stating **"TavernHelper is being completely rewritten"”**

## 3.6.5

### ⏫ Function

- 补充 @zonde306 在酒馆 1.13.4 新增的事件 `tavern_events.WORLDINFO_ENTRIES_LOADED` 的[类型定义](https://github.com/N0VI028/JS-Slash-Runner/blob/3eb2beaa13e5f11626ff37e20d55b0f8e4cb3a60/%40types/iframe/event.d.ts#L381-L386), 监听该事件可以在 Lorebook 激活前调整预激活的 Lorebook 条目
- 调整`tavern_events.WORLD_INFO_ACTIVATED` 的[类型定义](https://github.com/N0VI028/JS-Slash-Runner/blob/3eb2beaa13e5f11626ff37e20d55b0f8e4cb3a60/%40types/iframe/event.d.ts#L327-L329), 监听该事件可以在 Lorebook 激活后调整激活的 Lorebook 条目

## 3.6.4

### 💻 Interface

- Renamed `Message` tab in Variable Manager to `Message Floors` to avoid ambiguity
- Reduced the default number of messages displayed in the Variable Manager message tab to temporarily avoid lag; remaining issues will be optimized after TavernHelper is completely rewritten

## 3.6.3

### 💻 Interface

- Added a note in Prompt Viewer interface `💡 When this window is open, you can also send messages yourself to refresh prompt transmission status`, reminding that for `generate` and `generateRaw` you can also view transmission results via Prompt Viewer

### ⏫ Function

- Optimized `replaceTavernRegexes` performance

### 🐛 Fix

- Fixed rendering order conflict between prompt templates and TavernHelper macros in message floors, which caused macros like `{{get_message_variable::}}` to not display correctly

## 3.6.2

### ⏫ Function

- 为前端和脚本默认置入了 [`pixi.js` 库](https://pixijs.com/), 便于制作 live2d、动画、 Player 等.
- Added `waitGlobalInitialized` function to wait for global interfaces shared in other iframes to initialize and make them available in the current iframe. E.g. `Mvu`:

  ```typescript
  await waitGlobalInitialized('Mvu');
  ...Can be used directly hereafter Mvu
  ```

- Added `initializeGlobal` function to facilitate sharing interfaces globally, making them available in other iframes. E.g. `Mvu`:

  ```typescript
  initializeGlobal('Mvu', Mvu);
  ...Hereafter other iframes can wait for initialization via `await waitGlobalInitialized('Mvu')`, thus accessing the interface using `Mvu` as variable name
  ```

### 🐛 Fix

- Fixed `setLorebookSettings` not correctly setting certain settings

## 3.6.1

### ⏫ Function

- (Destructive) Renamed original `Character` to `RawCharacter` to make room for future character card interface `Character`, **Please try to migrate originally used `Character` to `RawCharacter`**

### 🐛 Fix

- Optimized the re-rendering method for scripts and frontend interface during real-time listening

## 3.6.0

### 💻 Interface

- Removed `Enable Rendering Optimization` switch from `Renderer` page; rendering optimization is now **always enabled** and will not affect highlighting of other code blocks.

### 🐛 Fix

- Ensured that replacement of TavernHelper macros in html code blocks happens before html code blocks are rendered into frontend interface

## 3.5.1

### 💻 Interface

- Split `Debug Mode` and `Blob URL Rendering` into two independent settings

### 🐛 Fix

- Fixed array merge handling in `insertOrAssignVariables`, `insertVariables`, and `getAllVariables`. Now inserting a new array will overwrite the old array instead of merging

## 3.5.0

### 💻 Interface

- You can now disable the loading animation added in 2.0.10 in TavernHelper settings, instead of expecting the author to add `<!-- disable-default-loading -->` in html
- Enabling Debug Mode now also renders scripts and frontend as Blob URLs, instead of manually adding `<!-- enable-blob-url-render -->` in html to enable it

### ⏫ Function

- Added `importRawChat` function to facilitate importing chat files just like in the Tavern interface
- Now `setChatMessages` supports using depth parameter, e.g., `setChatMessages([{ message_id: -1, message: 'New message' }])` means modifying the body of the last message

### 🐛 Fix

- Made `setChatMessages` rendering result closer to Tavern native

## 3.4.21

### ⏫ Function

- When using `stopGenerationById` and `stopAllGeneration`, `tavern_events.GENERATION_STOPPED` event will be sent, carrying the stopped generation ID

### 🐛 Fix

- Made character script handling more correct when switching cards; e.g., using `replaceScriptButtons` during script unload will not cause the script to be copied to other cards

## 3.4.20

### ⏫ Function

- Added `jquery-ui-touch-punch` library for scripts and frontend, allowing mobile devices to use jQuery UI components normally
- `generate`and `generateRaw` now support customizing generation ID via `generation_id` parameter, achieving simultaneous execution of multiple generation tasks, and support stopping specific generation via `stopGenerationById`, and `stopAllGeneration` to stop all generations requested via TavernHelper (excluding Tavern's own requests ）

### 🐛 Fix

- Prevented `createChatMessages` from setting `data` to an empty object when not requested/set, which made `{{get_message_variable}}` unusable
- Fixed rendering issue of TavernHelper macros on text containing `<user>` within code blocks
- Fixed `importRawPreset` not correctly importing presets in new Tavern versions
- Fixed potential unexpected issues when toggling TavernHelper macros too quickly

## 3.4.19

### 🐛 Fix

- Issue where script button names could not contain `"`
- Issue where clicking a script button on mobile would collapse the input method

## 3.4.18

### 🐛 Fix

- `getAllVariables` Issue where current floor variables might not be retrieved
- Fixed an issue where `replaceVariables` could not correctly save changes to script variables in other cases

## 3.4.17

### ⏫ Function

- Writing comment `<!--enable-blob-url-render-->` anywhere in the code will use `blob-url` rendering instead of `srcdoc`. This rendering is more convenient for viewing logs and debugging, but some domestic browsers do not support it.
- For better Vue compatibility, added global variables `Vue` and `VueRouter`

### 🐛 Fix

- Fixed compatibility with Tavern 1.12.10

## 3.4.16

### ⏫ Function

- 新增导入酒馆角色卡、 Preset 、 Lorebook 、酒馆正则 Function (`importRawCharacter` 等接口), 你可以直接从酒馆 Interface 导出角色卡、 Preset 、 Lorebook 、酒馆正则，而使用这些 Function 导入它们, 由此便于有人希望利用 gitlab、github 制作**自动更新角色卡、 Preset 、 Lorebook 酒馆正则 Function**, 具体见于[类型文件](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/function/import_raw.d.ts)

### 🐛 Fix

- Fixed an issue where `setChatMessage` would render incorrectly in some cases
- Fixed an issue where some frameworks relying on problematic code without using TavernHelper templates became unusable in the new version

## 3.4.15

### ⏫ Function

- Added `injectPrompts` and `uninjectPrompts` functions to facilitate injecting and removing prompts

### 🐛 Fix

- Fixed an issue where `replaceVariables` failed to correctly save changes to script variables in some cases

## 3.4.14

### ⏫ Function

- Added `getScriptInfo` and `replaceScriptInfo` functions to facilitate getting and replacing script author notes
- 对酒馆用于注册 Function 调用的 Function `SillyTavern.registerFunctionTool` 添加类型定义, 具体见于[类型文件](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/iframe/exported.sillytavern.d.ts)

## 3.4.13

### 💻 Interface

- Made closed scripts in Script Library have strikethrough names like regexes
- Added memory function for window size of Variable Manager and Prompt Viewer; it will automatically restore to the last size when opened next time

### ⏫ Function

- Removed `script_id` parameter from script button functions like `getScriptButtons`; now you can call them directly in scripts without passing `getScriptId()` (previous code remains valid):

  ```typescript
  // Before
  const buttons = getScriptButtons(getScriptId());

  // Now
  const buttons = getScriptButtons();
  ```

### 🐛 Fix

- Added `iframe_events.GENERATION_STARTED` event for streaming `generate` function
- Fixed `createChatMessages` handling of `system` messages

## 3.4.12

### 💻 Interface

- Adjusted display of `TavernHelper Settings - Writing Reference`
- Removed `TavernHelper Settings - Real-time Listening - Listening Address` to avoid people skipping tutorial steps and filling it wrong

### ⏫ Function

- Added tailwindcss CDN support for the frontend. It provides many predefined styles, e.g., `class="items-center"` for center alignment.
- Updated `font-awesome` icon library to `@fortawesome/fontawesome-free` version

### 🐛 Fix

- Cancelled the feature where preset functions implicitly converted Tavern System Prompts (Main Prompt, Auxiliary Prompt, Post-Instruction Prompt, Enhance Definition) to general prompts, as this seemed to cause Tavern to clear these entries.

  However, Tavern System Prompts offer no advantage over general prompts and even lack the ability to change insertion position into the chat, so it is not recommended to use them.

- Fixed `createChatMessages` handling of `refresh: none`
- Fixed `createChatMessages` not processing TavernHelper rendering when inserting messages at the end
- Cleaned up `recursion.delay_until`, `effect.sticky`, `effect.cooldown`, `effect.delay` etc. fields retrieved by `getWorldbook`, converting invalid values like `0` to `null`
- Fixed type errors in old presets extracted by `getPreset`

## 3.4.11

### ⏫ Function

- ~~ Since no one is using it yet~~ Adjusted the insertion field (`prompt.position`) for preset prompt entries, added the insertion order field for new Tavern (`prompt.injection_order`).
- Changed preset placeholder prompt IDs from `snake_case` to `camelCase` for easier interaction with Tavern interface.

### 🐛 Fix

- Fixed issues with the Prompt Viewer search function
- Fixed an issue where the `marker` field might not exist in preset files, causing preset functions to be unusable

## 3.4.10

### 💻 Interface

- Added `Disable TavernHelper Macros` in `TavernHelper Settings - Main Settings - Developer Tools`. This is convenient when using card creation presets/Lorebooks to send TavernHelper macros like `{{get_message_variable::variable}}` in character templates directly to AI without replacement. In other words :
  - When using Card Creation Preset: Turn ON 'Disable TavernHelper Macros' in "TavernHelper" and turn OFF "Prompt Template", to send character templates for AI to output character settings
  - When playing/testing character cards: Turn OFF 'Disable TavernHelper Macros' in "TavernHelper" and turn OFF "Prompt Template", so TavernHelper macros and Prompt Template EJS get replaced and executed, allowing dynamic prompts to take effect

## 3.4.9

### 🐛 Fix

- Made TavernHelper loading no longer depend on any network files, avoiding `failed to load: [object Event]`

## 3.4.8

### 💻 Interface

- Made Variable Manager more compact

### ⏫ Function

- **`generate`Function and `generateRaw` function now support custom APIs**

  ```typescript
  const result = await generate({
    user_input: 'Hello',
    custom_api: {
      apiurl: 'https://your-proxy-url.com',
      key: 'your-api-key',
      model: 'gpt-4',
      source: 'openai'
    }
  });
  ```

- Added `getButtonEvent` to get the event corresponding to a script button
- Deprecated `eventOnButton`, please use `eventOn(getButtonEvent('Button Name'), function)` instead
- `generate` and `generateRaw` can now customize the requested API

### 🐛 Fix

- `createWorldbookEntries` and `deleteWorldbookEntries` unavailable issue
- Modified layout of nested cards in Variable Manager to expand text display area

## 3.4.7

### ⏫ Function

- Optimized event listener performance

### 🐛 Fix

- Attempted to fix event listeners not properly unloading when switching character cards

## 3.4.6

### 🐛 Fix

- 移除不常使用的油猴兼容性设置，想要使用相关 Function 请直接安装原作者的[油猴脚本](https://greasyfork.org/zh-CN/scripts/503174-sillytavern-st%E9%85%92%E9%A6%86-html%E4%BB%A3%E7%A0%81%E6%B3%A8%E5%85%A5%E5%99%A8)
- Fixed issue where buttons failed to display correctly when QR is enabled but no QR groups are shown, and multiple scripts with buttons are enabled

## 3.4.5

### ⏫ Function

- Optimized performance of `replacePreset` and `updatePresetWith`

## 3.4.4

### 📚 Script Library

**Built-in Library :**

- Added `Preset Entry More Buttons` script, allowing one-click creation/copying of entries near a specific entry
- 移除了不太常用的[`样式加载`](https://discord.com/channels/1291925535324110879/1354783717910122496)和容易被误用的[`资源预载`](https://discord.com/channels/1291925535324110879/1354791063935520898)脚本, 需要请查看脚本原帖

### 🐛 Fix

- `replacePreset` Issue where preset prompt ID conflicts were not handled correctly

## 3.4.3

### ⏫ Function

- Added optional option `render:'debounced'|'immediate'` for Preset and Lorebook operations, controlling whether to use debounced rendering. Defaults to debounced rendering, as immediate rendering is not needed in most cases.
- Exported Tavern's `PromptManager` to `builtin`, and provided additional `builtin.renderPromptManager` and `builtin.renderPromptManagerDebounced` functions to refresh preset prompt rendering.

## 3.4.2

### 🐛 Fix

- `replareWorldbook` Issue where keywords could not be handled correctly

## 3.4.1

### ⏫ Function

**View Prompt Transmission Status :**

- "View Prompt Transmission" script in built-in library has been adjusted to a built-in feature, accessible via Toolbox or magic wand shortcut menu in bottom left. **It displays the final prompt sent to AI after Tavern processing**, thus correctly handling special mechanisms to get **real prompts and relatively real prompt token counts**. Special mechanisms include but are not limited to :
  - Activation of Lorebook green light entries
  - Preset's "Compress System Messages" function
  - Prompt Template
  - Tavern, TavernHelper Macros
  - Other scripts in the character card listening for prompt transmission

- Supports auto-refresh upon message sending
- Search by content (supports regex), and filter by message role
- Checking "Show Match Only" during search collapses context outside the matched part in search results

**Lorebook :**

- Added `createWorldbookEntries` and `deleteWorldbookEntries` functions to facilitate adding and deleting entries in Lorebook

  ```typescript
  // Create two entries, one titled "Kagura Hikari", one blank
  const { worldbook, new_entries } = await createWorldbookEntries('eramgt Revue Starlight', [{ name: 'Kagura Hikari' }, {}]);
  ```

  ```typescript
   // Delete all entries with names containing `Kagura Hikari`
   const { worldbook, deleted_entries } = await deleteWorldbookEntries('eramgt Revue Starlight', entry => entry.name.includes('Kagura Hikari'));
  ```

### 🐛 Fix

- Fixed default `refresh` option of `createChatMessages` to use `'affected'`, avoiding refreshing entire chat messages when creating messages at the end
- Allowed the `generate` function to also trigger prompt templates

## 3.4.0

### 📚 Script Library

**Built-in Library :**

- Added `Lorebook Forced Recommended Global Settings` script. This is the default setting for most authors when writing cards, and there is usually no need for players to modify it

### ⏫ Function

**Lorebook :**

- 重新制作 Lorebook 接口 `Worldbook`, 原本的所有 `Lorebook` Function 均被弃用 (但仍可运行), 请使用 `Worldbook` 接口, 具体见于[文档](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/%E5%8A%9F%E8%83%BD%E8%AF%A6%E6%83%85/%E4%B8%96%E7%95%8C%E4%B9%A6/%E4%BF%AE%E6%94%B9%E4%B8%96%E7%95%8C%E4%B9%A6.html)或[类型文件 (可以直接发给 ai)](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/function/worldbook.d.ts)
  - Removed `getLorebookSettings` and other global setting control functions as they are rarely needed; replaced by the new `Lorebook Forced Recommended Global Settings` script in the built-in library
  - `getWorldbook` Will directly return the array sorted by Lorebook "Custom Order" (Don't know what custom order is? Please check the "Lorebook Forced Custom Order" description in the built-in library)

**MVU Variable Framework :**

- 新增了 mvu 接口, Now 你可以通过 `Mvu` 来使用 MVU Variable Framework 中的 Function 了 (解析 ai 输出的更新命令、监听 mvu 更新 Variable 事件从而调整 Variable 或触发剧情等), 具体见于[文档](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/%E5%8A%9F%E8%83%BD%E8%AF%A6%E6%83%85/%E6%8E%A5%E5%8F%A3%E8%AE%BF%E9%97%AE.html#mvu-%E5%8F%98%E9%87%8F%E6%A1%86%E6%9E%B6)和[类型文件 (可以直接发给 ai)](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/iframe_client/exported.mvu.d.ts), 例如:

  ```typescript
  // Parse messages containing _.set() command, updating Luoluo Favorability to 30
  const old_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
  const new_data = await Mvu.parseMessage("_.set('Character.Luoluo.Favorability', 30); // Force modify", old_data);
  ```

  ```typescript
  // At the end of mvu variable update, keep Favorability not lower than 0
  eventOn('mag_variable_update_ended', (variables) => {
    if (_.get(variables, 'stat_data.Character.Luoluo.Favorability') < 0) {
      _.set(variables, 'stat_data.Character.Luoluo.Favorability', 0);
    }
  });
  ```

**Variable :**

- Made `insertOrAssignVariables` and other variable functions return the updated variable table for easier use in scripts

**Script Button :**

- 新增 `appendInexistentScriptButtons` Function , 便于为已经有按钮的脚本新增 Script Button , 例如角色卡作者可能在导入 mvu (`import 'https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/artifact/bundle.js'`) 的脚本中自己额外写了代码和按钮, mvu 则可以新增 "重新处理 Variable" 等按钮但不影响角色卡作者已经写的按钮.

### 🐛 Fix

- Fixed compatibility with Tavern 1.12.10
- Fixed the issue where the built-in library could not be opened via the Script Library
- Fixed the retrieval and modification of the currently loaded preset content (`'in_use'`)
- Fixed `getPreset` retrieval of enabled status for placeholder prompts (like Chat History) in preset prompt lists
- Added event sending, fixed issue where `generate` function would not trigger prompt template after prompt template change
- Attempted to fix event listeners not being removed when switching character cards

## 3.3.4

### 🐛 Fix

- `getLorebookEntries` Issue where it was unavailable in some situations

## 3.3.3

### 🐛 Fix

- `getLorebookEntries` Issue where it was unavailable in some situations

## 3.3.2

### ⏫ Function

- Changed network links for built-in script libraries etc. (from `fastly.jsdelivr.net` to `testingcf.jsdelivr.net`) for easier access in China
- 为前端和脚本默认置入了 [`zod` 库](https://zod.dev/basics). 通过这个库, 你可以更方便地解析 ai 输出的数据, 并对不符的数据进行**中文报错**. 如果已经配置了[编写模板](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html)请下载新的模板.

  ```typescript
  // Define a mobile message data type
  type PhoneMessage = z.infer<typeof PhoneMessage>;
  const PhoneMessage = z.object({
    name: z.string()       // `name` is a string
           .catch('Luoluo'),  // If AI incorrectly outputs numbers etc., use 'Luoluo'

    content: z.string()
              .default('Luoluo'),  // If AI forgets to output `content`, use 'Hello',

    reply_count: z.number().min(1),  // At least one reply

    time: z.iso.time(),
  });

  const data = JSON.parse(/*Suppose you extracted a mobile text message from the AI response*/);
  const phone_message = PhoneMessage.parse(message);
  console.info(data);
  // >> { name: 'Luoluo', content: 'Hello', reply_count: 1, time: '06:15' }
  // If parsing fails, an error will be thrown
  // >> Invalid input: expected string, actually received undefined
  ```

  Will use this library to modify TavernHelper's `@types` folder later, allowing you to check data types like `ChatMessage` in TavernHelper.

## 3.3.1

### ⏫ Function

- `{{get_message_variable::}}` Macros will not wrap content in quotes when replacing string variables with text. For example, `{{get_message_variable::World.TimePhase}}` will not be replaced with `"Morning"` but `Morning`

### 🐛 Fix

- `loadPreset` Issue where it could not work normally

## 3.3.0

### ⏫ Function

- 更新了一套操控 Preset 的 Function , Now 你可以**比酒馆接口更简单地**通过脚本操控酒馆的 Preset 了! 具体 Function 请自行参考[文档](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/ Function 详情/ Preset 操作/创建 Preset.html)或[类型文件 (可以直接发给 ai)](https://github.com/N0VI028/JS-Slash-Runner/blob/main/%40types/function/preset.d.ts), 如果已经配置了[编写模板](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html)请`pnpm add -D type-fest`并下载新的`@types`文件夹!

  ```typescript
  // Enabled streaming for the preset currently in use by Tavern
  await setPreset('in_use', { settings: { should_stream: true } });
  ```

  ```typescript
  // Copy entries of 'Preset A' in order to the beginning of 'Preset B'
  const preset_a = getPreset('Preset A');
  const preset_b = getPreset('Preset B');
  preset_b.prompts = [...preset_a.prompts, ...preset_b.prompts];
  await replacePreset('Preset B', preset_b);
  ```

  ```typescript
  // Reverse the entry order of 'Preset A'
  await updatePresetWith('Preset A', preset => {
    preset.prompts = preset.prompts.reverse();
    return preset;
  });
  ```

## 3.2.13

### ⏫ Function

- Added `formatAsTavernRegexedString()` function to get text result processed by Tavern Regex

  ```typescript
  // Get text of the last message, treat it as the upcoming displayed AI output, and apply Tavern Regex to it
  const message = getChatMessages(-1)[0];
  const result = formatAsTavernRegexedString(message.message, 'ai_output', 'display', { depth: 0 });
  ```

### 📚 Script Library

**Built-in Library :**

- Added `Lorebook Forced Custom Order` script. Many authors use custom order to write Lorebooks because it allows them to drag and reorder entries: categorize entries by function, put player-customizable entries at the top... **So please use custom order.**

### 🐛 Fix

- Lorebook entry functions mixed up `And Any` and `Not Any`

## 3.2.12

### 💻 Interface

- When switching Variable Manager to text view, use YAML instead of JSON format to display variable text, which is easier to edit

## 3.2.11

### ⏫ Function

- Added `getAllVariables()` function to directly get the merged variable table. Simply put, it contains the variable table that the frontend/script generally needs.

  ```typescript
  // You can directly write the following line :
  const variables = getAllVariables();
  ```

  ```typescript
  // whereas previously people unfamiliar with code might encounter this issue

  // Want to get stat_data.Favorability of current message floor
  const variables = _.get(getVariables({type: 'message', message_id: getCurrentMessageId()}), 'stat_data.Favorability');

  // But the new message floor did not update variables, so there is no stat_data.Favorability
  console.info(JSON.stringify(variables));
  // >> null
  ```

## 3.2.10

### 📚 Script Library

**Built-in Library :**

- Added `View Prompt Transmission` script. When enabled, you can open the `Prompt Transmission` interface from the magic wand in the bottom left corner to view the last sent prompt status.

### 🐛 Fix

- Render interface height issue
- Character card avatar retrieval issue

## 3.2.9

### 🐛 Fix

- Display issue when resizing the render interface

## 3.2.8

### 🐛 Fix

- Issue where some domestic browsers could not render

## 3.2.7

### 🐛 Fix

- Issue where some domestic browsers could not render

## 3.2.6

### ⏫ Function

- Disabled most non-error logs by default to optimize high-frequency performance; enable all logs by turning on "Debug Mode"

## 3.2.5

### ⏫ Function

- Added `getScriptButtons` and `replaceScriptButtons` to get and replace script button settings; for example, you can set secondary buttons like this :

  ```typescript
  eventOnButton('Go to Location', () => {
    replaceScriptButtons(getScriptId(), [
      { name: 'School', visible: true },
      { name: 'Shop', visible: true },
    ]);
  });
  ```

- Added `eventEmitAndWait` to listen for and wait for events in non-async functions.

## 3.2.4

### 💻 Interface

- Added collapse function for object types in Variable Manager

## 3.2.3

⚠️ Destructive change: After upgrading to this version, if you downgrade the extension, script functions will behave unexpectedly. If downgrade is needed, back up `sillytavern/data/username/settings.json` file before upgrading 。

### ⏫ Function

1. Scripts support folder grouping
   - Batch toggle scripts based on folders
   - Customize folder icon and icon color
   - Scripts can be moved directly to a specific folder by dragging the script control

2. Script Batch Management
   - Enter batch operation mode via the gear icon next to the Global/Character Script Library text
   - Can batch delete, move, export scripts
   - Script import/export supports zip format, preserving folder hierarchy
   - Support searching scripts
  
3. Scripts support storing data
   - Added script variable storage function. Scripts can store and read their own data; you can access script variables via `getVariables({type: 'script', script_id: getScriptId()})` etc.
   - Added visual variable management to the script editing interface
   - When a script contains data, a selection dialog will pop up upon export. Pay attention to sensitive data like API-KEYs; you can clear data before exporting

## 3.2.2

### 🐛 Fix

- Fixed `{{get_message_variable::stat_data}}` displaying the latest value in message #0 instead of the value corresponding to message #0

## 3.2.1

### 🐛 Fix

- Fix `{{get_message_variable::stat_data}}`

## 3.2.0

### ⏫ Function

Improved Helper Macro functionality ,

- Helper macros like `{{get_message_variable::stat_data}}` in messages will now display as their corresponding values, so you can create text status bars with variables directly using Tavern Regex :

  ```typescript
  Familiarity: {{get_message_variable::stat_data.Luoluo.Familiarity[0]}}
  Idiot Degree: {{get_message_variable::stat_data.Luoluo.IdiotDegree[0]}}
  ```

- Added `registerMacros` for registering new helper macros :

  ```typescript
  registerMacros(
    /<checkbox>(.*?)<checkbox>/gi,
    (context: Context, substring: string, content: string) => { return content; });
  ```

## 3.1.9

### 🐛 Fix

- Compatible with old Tavern versions, currently supported minimum Tavern version is 1.12.10

## 3.1.8

### 🐛 Fix

- Fixed `generateRaw` not injecting Lorebook depth entries
- Fixed the issue where a script enable prompt would pop up every time a new chat started when local scripts were closed
- Fixed some known issues in Variable Manager

## 3.1.7

### 🐛 Fix

- Fixed abnormal height of the Quick Reply button bar when Quick Reply is disabled but Merge Quick Replies is checked
- Fixed the issue where script buttons disappeared when adding or removing Quick Reply sets from the interface

## 3.1.6

### 🐛 Fix

- Fix `setLorebookEntries`

## 3.1.5

### 💻 Interface

- Added JSON parsing to Variable Manager

### ⏫ Function

- Added single-file TavernHelper function reference file, convenient for mobile

### 🐛 Fix

- Fixed Variable Manager array saving issue
- Fixed issue where local scripts were not correctly cleaned up when changing chat

## 3.1.4

### ⏫ Function

- Added `builtin.addOneMessage` to add a specific message floor to the page

## 3.1.3

### 💻 Interface

- Script buttons no longer occupy a separate line; they are now displayed with Quick Reply buttons. Whether multiple script buttons are merged into one line is controlled by the "Merge Quick Replies" button
- Player tab renamed to Toolbox; Player moved to Toolbox submenu
- Added a button to quickly open Variable Manager in the shortcut menu next to the input box

### ⏫ Function

- Added Variable Manager for visual management of Global, Character, Chat, and Message variables

### 🐛 Fix

- Fixed `setVariables` unexpectedly triggering render events when operating on message floor variables
- Fixed the issue where the previous character's script was incorrectly copied to the current character when switching characters
- Fixed issue where button container was created incorrectly

## 3.1.2

### 💻 Interface

- 在 Interface 中新增到[酒馆命令自查手册](https://rentry.org/sillytavern-script-book)的参考链接
- Split rendering optimization and code block collapsing options; now you can independently disable code block highlighting to optimize rendering speed

### ⏫ Function

- Added `extra` field to `ChatMessage` and `swipes_info` field to `ChatMessageSwiped`.
- Added `createChatMessages` interface to add new messages. Compared to `/send` and `/sendas`, it supports batch creation

  ```typescript
  // Insert a message at the end
  await createChatMessages([{role: 'user', message: 'Hello'}]);
  ```

  ```typescript
  // Insert two messages before message #10 without refreshing the display
  await createChatMessages([{role: 'user', message: 'Hello'}, {role: 'assistant', message: 'I am good'}], {insert_at: 10});
  ```

- Added `deleteChatMessages` interface to delete messages. Compared to `/del`, it supports batch deletion and scattered deletion

  ```typescript
  // Delete message #10, #15, second to last, and last message
  await deleteChatMessages([10, 15, -2, getLastMessageId()]);
  ```

  ```typescript
  // Delete all messages
  await deleteChatMessages(_.range(getLastMessageId() + 1));
  ```

- Added `rotateChatMessages` interface to adjust message order

  ```typescript
  // Move messages [4, 7) to before [2, 4), i.e., move messages 4-6 to before messages 2-3
  await rotateChatMessages(2, 4, 7);
  ```

  ```typescript
  // Move the last message to before message #5
  await rotateChatMessages(5, getLastMessageId(), getLastMessageId() + 1);
  ```

  ```typescript
  // Move the last 3 messages to before message #1
  await rotateChatMessages(1, getLastMessageId() - 2, getLastMessageId() + 1);
  ```

  ```typescript
  // Move the first 3 messages to the end
  await rotateChatMessages(0, 3, getLastMessageId() + 1);
  ```

- Added `getChatLorebook` and `setChatLorebook` for more direct control over chat Lorebooks
- Added an optional parameter to `getOrCreateChatLorebook`, allowing custom chat Lorebook names :

  ```typescript
  // If the chat Lorebook does not exist, attempt to create a Lorebook named 'Hello' as the chat Lorebook
  const lorebook = await getOrCreateChatLorebook('Hello');
  ```

### 🐛 Fix

- Fixed `getCharLorebooks` not being able to retrieve attached Lorebooks

## 3.1.1

### ⏫ Function

- Added `setChatMessages` interface, more flexible than the original `setChatMessage` — you can now directly jump to opening, hide messages, etc..

  ```typescript
  // Modified the body of the message page used by AI at message #10
  await setChatMessages([{message_id: 10, message: 'New message'}]);
  ```

  ```typescript
  // Added variable for the second to last floor
  const chat_message = getChatMessages(-2)[0];
  _.set(chat_message.data, 'Kagura Hikari Favorability', 5);
  await setChatMessages([{message_id: 0, data: chat_message.data}], {refresh: 'none'});
  ```

  ```typescript
  // Switch to Opening 3
  await setChatMessages([{message_id: 0, swipe_id: 2}]);
  ```

  ```typescript
  // Hide all messages
  const last_message_id = getLastMessageId();
  await setChatMessages(_.range(last_message_id + 1).map(message_id => ({message_id, is_hidden: true})));
  ```

- Adjusted `getChatMessage` interface. The return type will now be `ChatMessage[]` or depending on whether swipes are retrieved (`{ include_swipes: boolean }`) `ChatMessageSwiped[]`.

  ```typescript
  // Only get the message page used by AI for message #10
  const chat_messages = getChatMessages(10);
  const chat_messages = getChatMessages('10');
  const chat_messages = getChatMessages('10', { include_swipes: false });
  // Get all message pages for message #10
  const chat_messages = getChatMessages(10, { include_swipes: true });
  ```

  ```typescript
  // Get the message page used by AI for the latest message
  const chat_message = getChatMessages(-1)[0];  // 或 getChatMessages('{{lastMessageId}}')[0]
  // Get all message pages for the latest message
  const chat_message = getChatMessages(-1, { include_swipes: true })[0];  // 或 getChatMessages('{{lastMessageId}}', { include_swipes: true })[0]
  ```

  ```typescript
  // Get all message pages used by AI for all messages
  const chat_messages = getChatMessages('0-{{lastMessageId}}');
  // Get all message pages for all messages
  const chat_messages = getChatMessages('0-{{lastMessageId}}', { include_swipes: true });
  ```

### 🐛 Fix

- Now when `setChatMessage` uses `refresh: 'display_and_render_current'` option, it will send the corresponding Tavern render event to activate listeners, instead of just rendering iframe.

## 3.1.0

Now 所有 Built-in Library 脚本将使用 `import 'https://fastly.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/标签化/index.js'` 的形式从仓库直接获取最新代码, **因此脚本将永远保持最新**, 你 No longer needed 为了更新脚本重新导入脚本.

## 3.0.7

### ⏫ Function

- Exported `toastr` library; you can now use `toastr.error('Content', 'Title')` instead of `triggerSlash('/echo severity=error title=Title Content')` for Tavern notifications :
  - `toastr.info`
  - `toastr.success`
  - `toastr.warning`
  - `toastr.error`

## 3.0.6

### 🐛 Fix

- Fixed issue where previous versions of Tavern might not properly display Lorebook entries after Lorebook operations

## 3.0.5

### 💻 Interface

- Newly imported scripts will be added to the end instead of the beginning
- New buttons in script editing interface will be enabled by default

### 📚 Script Library

**Built-in Library :**

- Added `Preset Accidental Touch Protection` script. When enabled, it locks preset options except 'Streaming', 'Request CoT', and 'Specific Entries', preventing modification via the interface

### ⏫ Function

**Lorebook Entry Operations :**

- Added `replaceLorebookEntries` and `updateLorebookEntriesWith` functions, which are more convenient than the original `setLorebookEntries` functions

  ```typescript
  // Disable recursion for all entries, keep other settings unchanged
  const entries = await getLorebookEntries("eramgt Revue Starlight");
  await replaceLorebookEntries("eramgt Revue Starlight", entries.map(entry => ({ ...entry, prevent_recursion: true })));
  ```

  ```typescript
  // Delete all entries with names containing `Kagura Hikari`
  const entries = await getLorebookEntries("eramgt Revue Starlight");
  _.remove(entries, entry => entry.comment.includes('Kagura Hikari'));
  await replaceLorebookEntries("eramgt Revue Starlight", entries);
  ```

- Added array versions of `createLorebookEntry` and `deleteLorebookEntry`: `createLorebookEntries` and `deleteLorebookEntries`

### 🐛 Fix

- Issue where some functions were incompatible with previous versions

## 3.0.4

### 🐛 Fix

- Could not load correctly when depth input box is 0
- Quick Reply code editing interface failed to display correctly when frontend optimization was enabled

## 3.0.3

### 💻 Interface

- Now when script import conflict occurs, you can choose 'New Script' or 'Overwrite Original Script'.

### 📚 Script Library

**Built-in Library :**

- Enable `Tagging` to toggle TavernHelper scripts

### 🐛 Fix

- `replaceTavernRegexes` unexpectedly threw error when no character card was open

## 3.0.2

### 📚 Script Library

**Built-in Library :**

- Optimized the execution speed of `Tagging`
- Make `Automatically disable incompatible frontend options` also disable "Show tags in response""
- Added `Style Loader` script
- Added `Resource Preload` script

### ⏫ Function

- Added `getScriptId` function to get the script's unique id

- `getVariables` Variable operations now support getting and modifying variables bound to the character card; you can also manually modify character card variables via the "Variables" button in TavernHelper "Script Library" settings interface.

  ```typescript
  const variables = getVariables({type: 'character'});
  ```

- `getVariables` Variable operations now support getting and modifying variables of a specific message floor, and support negative numbers to get variables of counting-back floors (e.g., `-1` is the latest message ）

  ```typescript
  const variables = getVariables({type: 'message', message_id: -1});
  ```

- `getChatMessage` and `setChatMessage` also supports using negative numbers to access counting-back floors

### 🐛 Fix

- Real-time modification listener could not listen to scripts

## 3.0.1

### 🐛 Fix

- Some functions could not work properly
- Audio player unable to play normally
- getCharacterRegexes Incorrectly threw an exception when no character was selected

## 3.0.0

### 💻 Brand New User Interface

- Redesigned the overall interface layout; each functional module is independently controlled/enabled

### ⏫ Version Management

- Extension automatically checks version and prompts for update on startup; click update button to view changelog from local version to latest version

### 📚 Script Library Function

- Added Script Library function, supporting unified management of scripts
- Provided script import/export functionality
- Scripts can be exported with character cards and automatically imported when importing character cards
- Added variables bound to character cards, which can be read by extensions and exported with the character card
- Built-in library contains utility scripts provided by the extension

### 🔌 Enhanced Extensibility

- Registered TavernHelper core functions to global scope
- Supports other extensions calling TavernHelper functions

### ✍️ Card Creation Experience Improvement

请阅读 [【正确使用酒馆助手编写前端 Interface 教程】【直播】刚装好的win11喵从安装软件开始](https://discord.com/channels/1291925535324110879/1374317316631695370/1374330019446263879)

- Support true real-time modification; just modify code in the software, and Tavern will update content immediately
- Support split file writing to split logic for different interface functions
- Support using package.json to add third-party libraries
