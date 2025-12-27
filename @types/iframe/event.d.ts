/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Events can be
 * - iframe events in `iframe_events`
 * - tavern events in `tavern_events`
 * - custom string events
 */
type EventType = IframeEventType | TavernEventType | string;

type EventOnReturn = {
  /** Stop listening */
  stop: () => void;
};

/**
 * Let `listener` listen to `event_type`; when the event occurs, automatically run `listener`.
 * If `listener` is already listening to `event_type`, calling this function will have no effect.
 *
 * When the frontend interface/script where `eventOn` is located is closed, the listener will be automatically uninstalled.
 *
 * @param event_type The event to listen for
 * @param listener The function to register
 *
 * @example
 * function hello() { alert("hello"); }
 * eventOn(Event to listen for, hello);
 *
 * @example
 * // Listen for message reception and pop up 'hello'
 * eventOn(tavern_events.MESSAGE_RECEIVED, () => alert('hello'));
 *
 * @example
 * // When a message is updated, listen for which message was modified
 * // The tavern event tavern_events.MESSAGE_UPDATED will pass the updated message ID (floor ID)
 * eventOn(tavern_events.MESSAGE_UPDATED, message_id => {
 *   alert(`You just updated chat message #${message_id}, didn't you? 😡`);
 * });
 *
 * @returns Subsequent operations
 *   - `stop`: Cancel this listener
 */
declare function eventOn<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;

/** @deprecated Please use `eventOn(getButtonEvent('Button Name'), function)` instead */
declare function eventOnButton<T extends EventType>(event_type: T, listener: ListenerType[T]): void;

/**
 * Let `listener` listen to `event_type`; when the event occurs, automatically run `listener` last.
 * If `listener` is already listening to `event_type`, calling this function will adjust `listener` to run last.
 *
 * When the frontend interface/script where `eventMakeLast` is located is closed, the listener will be automatically uninstalled.
 *
 * @param event_type The event to listen for
 * @param listener The function to register/adjust to run last
 *
 * @example
 * eventMakeLast(Event to listen for, Function to register);
 *
 * @returns Subsequent operations
 *   - `stop`: Cancel this listener
 */
declare function eventMakeLast<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;

/**
 * Let `listener` listen to `event_type`; when the event occurs, automatically run `listener` first.
 * If `listener` is already listening to `event_type`, calling this function will adjust `listener` to run first.
 *
 * When the frontend interface/script where `eventMakeFirst` is located is closed, the listener will be automatically uninstalled.
 *
 * @param event_type The event to listen for
 * @param listener The function to register/adjust to run first
 *
 * @example
 * eventMakeFirst(Event to listen for, Function to register);
 *
 * @returns Subsequent operations
 *   - `stop`: Cancel this listener
 */
declare function eventMakeFirst<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;

/**
 * Let `listener` listen to `event_type` only once; run `listener` when the event occurs, then cancel the listener.
 * If `listener` is already listening to `event_type`, calling this function will have no effect.
 *
 * When the frontend interface/script where `eventOnce` is located is closed, the listener will be automatically uninstalled.
 *
 * @param event_type The event to listen for
 * @param listener The function to register
 *
 * @example
 * eventOnce(Event to listen for, Function to register);
 *
 * @returns Subsequent operations
 *   - `stop`: Cancel this listener
 */
declare function eventOnce<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;

/**
 * Emit the `event_type` event, and optionally send some `data`.
 *
 * Anyone listening to the `event_type` message channel will receive the message and the `data`.
 *
 * @param event_type The event to emit
 * @param data The data to be sent with the event
 *
 * @example
 * // Emit "Character phase update completed" event; all listeners listening to this event will be run
 * eventEmit("Character phase update completed");
 *
 * @example
 * // Emit "Save" event and wait for all listeners (possibly functions responsible for saving) to finish executing before continuing
 * await eventEmit("Save");
 *
 * @example
 * // Emit with data ["Hello", 0]
 * eventEmit("Event", "Hello", 0);
 */
declare function eventEmit<T extends EventType>(event_type: T, ...data: Parameters<ListenerType[T]>): Promise<void>;

/**
 * Emit the `event_type` event with `data` and wait for the event processing to finish.
 *
 * @param event_type The event to emit
 * @param data The data to be sent with the event
 */
declare function eventEmitAndWait<T extends EventType>(event_type: T, ...data: Parameters<ListenerType[T]>): void;

/**
 * Cancel the `listener`'s subscription to `event_type`; if `listener` is not listening to `event_type`, calling this function will have no effect.
 *
 * All event listeners will be automatically uninstalled when the frontend interface/script is closed; you don't need to call `eventRemoveListener` manually to remove them.
 *
 * @param event_type The event to listen for
 * @param listener The function to unregister
 *
 * @example
 * eventRemoveListener(Event to listen for, Function to unregister);
 */
declare function eventRemoveListener<T extends EventType>(event_type: T, listener: ListenerType[T]): void;

/**
 * Cancel all listeners for `event_type` in this iframe.
 *
 * All event listeners will be automatically uninstalled when the frontend interface/script is closed; you don't need to call `eventClearEvent` manually to remove them.
 *
 * @param event_type The event to cancel listening for
 */
declare function eventClearEvent(event_type: EventType): void;

/**
 * Cancel all subscriptions for `listener` in this iframe.
 *
 * All event listeners will be automatically uninstalled when the frontend interface/script is closed; you don't need to call `eventClearListener` manually to remove them.
 *
 * @param listener The function to unregister
 */
declare function eventClearListener(listener: Function): void;

/**
 * Cancel all listeners for all events in this iframe.
 *
 * All event listeners will be automatically uninstalled when the frontend interface/script is closed; you don't need to call `eventClearAll` manually to remove them.
 */
declare function eventClearAll(): void;

//------------------------------------------------------------------------------------------------------------------------
// Below are the available events; you can emit and listen to them

type IframeEventType = (typeof iframe_events)[keyof typeof iframe_events];

// iframe events
declare const iframe_events: {
  MESSAGE_IFRAME_RENDER_STARTED: 'message_iframe_render_started';
  MESSAGE_IFRAME_RENDER_ENDED: 'message_iframe_render_ended';
  /** `generate` function starts generating */
  GENERATION_STARTED: 'js_generation_started';
  /** Streaming-enabled `generate` function transmits current full text: "This is", "This is a", "This is a stream transmission" */
  STREAM_TOKEN_RECEIVED_FULLY: 'js_stream_token_received_fully';
  /** Streaming-enabled `generate` function transmits current incremental text: "This is", "a", "stream transmission" */
  STREAM_TOKEN_RECEIVED_INCREMENTALLY: 'js_stream_token_received_incrementally';
  /** `generate` function finished generating */
  GENERATION_ENDED: 'js_generation_ended';
};

type TavernEventType = (typeof tavern_events)[keyof typeof tavern_events];

// Tavern events. **It is not recommended to emit tavern events yourself, as you may not know what data they require**
declare const tavern_events: {
  APP_READY: 'app_ready';
  EXTRAS_CONNECTED: 'extras_connected';
  MESSAGE_SWIPED: 'message_swiped';
  MESSAGE_SENT: 'message_sent';
  MESSAGE_RECEIVED: 'message_received';
  MESSAGE_EDITED: 'message_edited';
  MESSAGE_DELETED: 'message_deleted';
  MESSAGE_UPDATED: 'message_updated';
  MESSAGE_FILE_EMBEDDED: 'message_file_embedded';
  MESSAGE_REASONING_EDITED: 'message_reasoning_edited';
  MESSAGE_REASONING_DELETED: 'message_reasoning_deleted';
  /** since SillyTavern v1.13.5 */
  MESSAGE_SWIPE_DELETED: 'message_swipe_deleted';
  MORE_MESSAGES_LOADED: 'more_messages_loaded';
  IMPERSONATE_READY: 'impersonate_ready';
  CHAT_CHANGED: 'chat_id_changed';
  GENERATION_AFTER_COMMANDS: 'GENERATION_AFTER_COMMANDS';
  GENERATION_STARTED: 'generation_started';
  GENERATION_STOPPED: 'generation_stopped';
  GENERATION_ENDED: 'generation_ended';
  SD_PROMPT_PROCESSING: 'sd_prompt_processing';
  EXTENSIONS_FIRST_LOAD: 'extensions_first_load';
  EXTENSION_SETTINGS_LOADED: 'extension_settings_loaded';
  SETTINGS_LOADED: 'settings_loaded';
  SETTINGS_UPDATED: 'settings_updated';
  MOVABLE_PANELS_RESET: 'movable_panels_reset';
  SETTINGS_LOADED_BEFORE: 'settings_loaded_before';
  SETTINGS_LOADED_AFTER: 'settings_loaded_after';
  CHATCOMPLETION_SOURCE_CHANGED: 'chatcompletion_source_changed';
  CHATCOMPLETION_MODEL_CHANGED: 'chatcompletion_model_changed';
  OAI_PRESET_CHANGED_BEFORE: 'oai_preset_changed_before';
  OAI_PRESET_CHANGED_AFTER: 'oai_preset_changed_after';
  OAI_PRESET_EXPORT_READY: 'oai_preset_export_ready';
  OAI_PRESET_IMPORT_READY: 'oai_preset_import_ready';
  WORLDINFO_SETTINGS_UPDATED: 'worldinfo_settings_updated';
  WORLDINFO_UPDATED: 'worldinfo_updated';
  /** since SillyTavern v1.13.5 */
  CHARACTER_EDITOR_OPENED: 'character_editor_opened';
  CHARACTER_EDITED: 'character_edited';
  CHARACTER_PAGE_LOADED: 'character_page_loaded';
  USER_MESSAGE_RENDERED: 'user_message_rendered';
  CHARACTER_MESSAGE_RENDERED: 'character_message_rendered';
  FORCE_SET_BACKGROUND: 'force_set_background';
  CHAT_DELETED: 'chat_deleted';
  CHAT_CREATED: 'chat_created';
  GENERATE_BEFORE_COMBINE_PROMPTS: 'generate_before_combine_prompts';
  GENERATE_AFTER_COMBINE_PROMPTS: 'generate_after_combine_prompts';
  GENERATE_AFTER_DATA: 'generate_after_data';
  WORLD_INFO_ACTIVATED: 'world_info_activated';
  TEXT_COMPLETION_SETTINGS_READY: 'text_completion_settings_ready';
  CHAT_COMPLETION_SETTINGS_READY: 'chat_completion_settings_ready';
  CHAT_COMPLETION_PROMPT_READY: 'chat_completion_prompt_ready';
  CHARACTER_FIRST_MESSAGE_SELECTED: 'character_first_message_selected';
  CHARACTER_DELETED: 'characterDeleted';
  CHARACTER_DUPLICATED: 'character_duplicated';
  CHARACTER_RENAMED: 'character_renamed';
  CHARACTER_RENAMED_IN_PAST_CHAT: 'character_renamed_in_past_chat';
  SMOOTH_STREAM_TOKEN_RECEIVED: 'stream_token_received';
  STREAM_TOKEN_RECEIVED: 'stream_token_received';
  STREAM_REASONING_DONE: 'stream_reasoning_done';
  FILE_ATTACHMENT_DELETED: 'file_attachment_deleted';
  WORLDINFO_FORCE_ACTIVATE: 'worldinfo_force_activate';
  OPEN_CHARACTER_LIBRARY: 'open_character_library';
  ONLINE_STATUS_CHANGED: 'online_status_changed';
  IMAGE_SWIPED: 'image_swiped';
  CONNECTION_PROFILE_LOADED: 'connection_profile_loaded';
  CONNECTION_PROFILE_CREATED: 'connection_profile_created';
  CONNECTION_PROFILE_DELETED: 'connection_profile_deleted';
  CONNECTION_PROFILE_UPDATED: 'connection_profile_updated';
  TOOL_CALLS_PERFORMED: 'tool_calls_performed';
  TOOL_CALLS_RENDERED: 'tool_calls_rendered';
  CHARACTER_MANAGEMENT_DROPDOWN: 'charManagementDropdown';
  SECRET_WRITTEN: 'secret_written';
  SECRET_DELETED: 'secret_deleted';
  SECRET_ROTATED: 'secret_rotated';
  SECRET_EDITED: 'secret_edited';
  PRESET_CHANGED: 'preset_changed';
  PRESET_DELETED: 'preset_deleted';
  /** since SillyTavern v1.13.5 */
  PRESET_RENAMED: 'preset_renamed';
  /** since SillyTavern v1.13.5 */
  PRESET_RENAMED_BEFORE: 'preset_renamed_before';
  MAIN_API_CHANGED: 'main_api_changed';
  WORLDINFO_ENTRIES_LOADED: 'worldinfo_entries_loaded';
  WORLDINFO_SCAN_DONE: 'worldinfo_scan_done';
  /** since SillyTavern v1.14.0 */
  MEDIA_ATTACHMENT_DELETED: 'media_attachment_deleted';
};

type ListenerType = {
  [iframe_events.MESSAGE_IFRAME_RENDER_STARTED]: (iframe_name: string) => void;
  [iframe_events.MESSAGE_IFRAME_RENDER_ENDED]: (iframe_name: string) => void;
  [iframe_events.GENERATION_STARTED]: (generation_id: string) => void;
  [iframe_events.STREAM_TOKEN_RECEIVED_FULLY]: (full_text: string, generation_id: string) => void;
  [iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY]: (incremental_text: string, generation_id: string) => void;
  [iframe_events.GENERATION_ENDED]: (text: string, generation_id: string) => void;

  [tavern_events.APP_READY]: () => void;
  [tavern_events.EXTRAS_CONNECTED]: (modules: any) => void;
  [tavern_events.MESSAGE_SWIPED]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_SENT]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_RECEIVED]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_EDITED]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_DELETED]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_UPDATED]: (message_id: number | string) => void;
  [tavern_events.MESSAGE_FILE_EMBEDDED]: (message_id: number) => void;
  [tavern_events.MESSAGE_REASONING_EDITED]: (message_id: number) => void;
  [tavern_events.MESSAGE_REASONING_DELETED]: (message_id: number) => void;
  [tavern_events.MESSAGE_SWIPE_DELETED]: (event_data: {
    messageId: number;
    swipeId: number;
    newSwipeId: number;
  }) => void;
  [tavern_events.MORE_MESSAGES_LOADED]: () => void;
  [tavern_events.IMPERSONATE_READY]: (message: string) => void;
  [tavern_events.CHAT_CHANGED]: (chat_file_name: string) => void;
  [tavern_events.GENERATION_AFTER_COMMANDS]: (
    type: string,
    option: {
      automatic_trigger?: boolean;
      force_name2?: boolean;
      quiet_prompt?: string;
      quietToLoud?: boolean;
      skipWIAN?: boolean;
      force_chid?: number;
      signal?: AbortSignal;
      quietImage?: string;
      quietName?: string;
      depth?: number;
    },
    dry_run: boolean,
  ) => void;
  [tavern_events.GENERATION_STARTED]: (
    type: string,
    option: {
      automatic_trigger?: boolean;
      force_name2?: boolean;
      quiet_prompt?: string;
      quietToLoud?: boolean;
      skipWIAN?: boolean;
      force_chid?: number;
      signal?: AbortSignal;
      quietImage?: string;
      quietName?: string;
      depth?: number;
    },
    dry_run: boolean,
  ) => void;
  [tavern_events.GENERATION_STOPPED]: () => void;
  [tavern_events.GENERATION_ENDED]: (message_id: number) => void;
  [tavern_events.SD_PROMPT_PROCESSING]: (event_data: {
    prompt: string;
    generationType: number;
    message: string;
    trigger: string;
  }) => void;
  [tavern_events.EXTENSIONS_FIRST_LOAD]: () => void;
  [tavern_events.EXTENSION_SETTINGS_LOADED]: () => void;
  [tavern_events.SETTINGS_LOADED]: () => void;
  [tavern_events.SETTINGS_UPDATED]: () => void;
  [tavern_events.MOVABLE_PANELS_RESET]: () => void;
  [tavern_events.SETTINGS_LOADED_BEFORE]: (settings: object) => void;
  [tavern_events.SETTINGS_LOADED_AFTER]: (settings: object) => void;
  [tavern_events.CHATCOMPLETION_SOURCE_CHANGED]: (source: string) => void;
  [tavern_events.CHATCOMPLETION_MODEL_CHANGED]: (model: string) => void;
  [tavern_events.OAI_PRESET_CHANGED_BEFORE]: (result: {
    preset: object;
    presetName: string;
    settingsToUpdate: object;
    settings: object;
    savePreset: Function;
  }) => void;
  [tavern_events.OAI_PRESET_CHANGED_AFTER]: () => void;
  [tavern_events.OAI_PRESET_EXPORT_READY]: (preset: object) => void;
  [tavern_events.OAI_PRESET_IMPORT_READY]: (result: { data: object; presetName: string }) => void;
  [tavern_events.WORLDINFO_SETTINGS_UPDATED]: () => void;
  [tavern_events.WORLDINFO_UPDATED]: (
    name: string,
    data: { entries: { [uid: number]: SillyTavern.FlattenedWorldInfoEntry } },
  ) => void;
  [tavern_events.CHARACTER_EDITOR_OPENED]: (chid: string) => void;
  [tavern_events.CHARACTER_EDITED]: (result: { detail: { id: string; character: SillyTavern.v1CharData } }) => void;
  [tavern_events.CHARACTER_PAGE_LOADED]: () => void;
  [tavern_events.USER_MESSAGE_RENDERED]: (message_id: number) => void;
  [tavern_events.CHARACTER_MESSAGE_RENDERED]: (message_id: number) => void;
  [tavern_events.FORCE_SET_BACKGROUND]: (background: { url: string; path: string }) => void;
  [tavern_events.CHAT_DELETED]: (chat_file_name: string) => void;
  [tavern_events.CHAT_CREATED]: () => void;
  [tavern_events.GENERATE_BEFORE_COMBINE_PROMPTS]: () => void;
  [tavern_events.GENERATE_AFTER_COMBINE_PROMPTS]: (result: { prompt: string; dryRun: boolean }) => void;
  /** dry_run is only available in SillyTavern 1.13.15 and later */
  [tavern_events.GENERATE_AFTER_DATA]: (
    generate_data: {
      prompt: SillyTavern.SendingMessage[];
    },
    dry_run: boolean,
  ) => void;
  [tavern_events.WORLD_INFO_ACTIVATED]: (entries: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[]) => void;
  [tavern_events.TEXT_COMPLETION_SETTINGS_READY]: () => void;
  [tavern_events.CHAT_COMPLETION_SETTINGS_READY]: (generate_data: {
    messages: SillyTavern.SendingMessage[];
    model: string;
    temprature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
    max_tokens: number;
    stream: boolean;
    logit_bias: object;
    stop: string[];
    chat_comletion_source: string;
    n?: number;
    user_name: string;
    char_name: string;
    group_names: string[];
    include_reasoning: boolean;
    reasoning_effort: string;
    json_schema: {
      name: string;
      value: Record<string, any>;
      description?: string;
      strict?: boolean;
    };
    [others: string]: any;
  }) => void;
  [tavern_events.CHAT_COMPLETION_PROMPT_READY]: (event_data: {
    chat: SillyTavern.SendingMessage[];
    dryRun: boolean;
  }) => void;
  [tavern_events.CHARACTER_FIRST_MESSAGE_SELECTED]: (event_args: {
    input: string;
    output: string;
    character: object;
  }) => void;
  [tavern_events.CHARACTER_DELETED]: (result: { id: string; character: SillyTavern.v1CharData }) => void;
  [tavern_events.CHARACTER_DUPLICATED]: (result: { oldAvatar: string; newAvatar: string }) => void;
  [tavern_events.CHARACTER_RENAMED]: (old_avatar: string, new_avatar: string) => void;
  [tavern_events.CHARACTER_RENAMED_IN_PAST_CHAT]: (
    current_chat: Record<string, any>,
    old_avatar: string,
    new_avatar: string,
  ) => void;
  [tavern_events.STREAM_TOKEN_RECEIVED]: (text: string) => void;
  [tavern_events.STREAM_REASONING_DONE]: (
    reasoning: string,
    duration: number | null,
    message_id: number,
    state: 'none' | 'thinking' | 'done' | 'hidden',
  ) => void;
  [tavern_events.FILE_ATTACHMENT_DELETED]: (url: string) => void;
  [tavern_events.WORLDINFO_FORCE_ACTIVATE]: (entries: object[]) => void;
  [tavern_events.OPEN_CHARACTER_LIBRARY]: () => void;
  [tavern_events.ONLINE_STATUS_CHANGED]: () => void;
  [tavern_events.IMAGE_SWIPED]: (result: {
    message: object;
    element: JQuery<HTMLElement>;
    direction: 'left' | 'right';
  }) => void;
  [tavern_events.CONNECTION_PROFILE_LOADED]: (profile_name: string) => void;
  [tavern_events.CONNECTION_PROFILE_CREATED]: (profile: Record<string, any>) => void;
  [tavern_events.CONNECTION_PROFILE_DELETED]: (profile: Record<string, any>) => void;
  [tavern_events.CONNECTION_PROFILE_UPDATED]: (
    old_profile: Record<string, any>,
    new_profile: Record<string, any>,
  ) => void;
  [tavern_events.TOOL_CALLS_PERFORMED]: (tool_invocations: object[]) => void;
  [tavern_events.TOOL_CALLS_RENDERED]: (tool_invocations: object[]) => void;
  [tavern_events.WORLDINFO_ENTRIES_LOADED]: (lores: {
    globalLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    characterLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    chatLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    personaLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
  }) => void;
  [tavern_events.CHARACTER_MANAGEMENT_DROPDOWN]: (target: JQuery) => void;
  [tavern_events.SECRET_WRITTEN]: (secret: string) => void;
  [tavern_events.SECRET_DELETED]: (secret: string) => void;
  [tavern_events.SECRET_ROTATED]: (secret: string) => void;
  [tavern_events.SECRET_EDITED]: (secret: string) => void;
  [tavern_events.PRESET_CHANGED]: (data: { apiId: string; name: string }) => void;
  [tavern_events.PRESET_DELETED]: (data: { apiId: string; name: string }) => void;
  [tavern_events.PRESET_RENAMED]: (data: { apiId: string; oldName: string; newName: string }) => void;
  [tavern_events.PRESET_RENAMED_BEFORE]: (data: { apiId: string; oldName: string; newName: string }) => void;
  [tavern_events.MAIN_API_CHANGED]: (data: { apiId: string }) => void;
  [tavern_events.WORLDINFO_ENTRIES_LOADED]: (lores: {
    globalLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    characterLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    chatLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
    personaLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
  }) => void;
  [tavern_events.WORLDINFO_SCAN_DONE]: (event_data: {
    state: {
      current: number;
      next: number;
      loopCount: number;
    };
    new: {
      all: SillyTavern.FlattenedWorldInfoEntry[];
      successful: SillyTavern.FlattenedWorldInfoEntry[];
    };
    activated: {
      entries: Map<`${string}.${string}`, SillyTavern.FlattenedWorldInfoEntry>;
      text: string;
    };
    sortedEntries: SillyTavern.FlattenedWorldInfoEntry[];
    recursionDelay: {
      availableLevels: number[];
      currentLevel: number;
    };
    budget: {
      current: number;
      overflowed: boolean;
    };
    timedEffects: Record<string, any>;
  }) => void;
  [custom_event: string]: (...args: any) => any;
};
