type ChatMessage = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  message: string;
  data: Record<string, any>;
  extra: Record<string, any>;
};

type ChatMessageSwiped = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  swipe_id: number;
  swipes: string[];
  swipes_data: Record<string, any>[];
  swipes_info: Record<string, any>[];
};

type GetChatMessagesOption = {
  /** Filter messages by role; defaults to `'all'` */
  role?: 'all' | 'system' | 'assistant' | 'user';
  /** Filter messages by visibility state; defaults to `'all'` */
  hide_state?: 'all' | 'hidden' | 'unhidden';
  /** Whether to include swiped message pages not used by AI, such as unselected starters or floors rerolled by clicking arrows. If not included, the return type is `ChatMessage`, otherwise the return type is `ChatMessageSwiped`; defaults to `false` */
  include_swipes?: boolean;
};

/**
 * Get chat messages, retrieving only the message page used by AI for each floor
 *
 * @param range The message floor number or floor range to retrieve, such as `0`, `'0-{{lastMessageId}}'`, `-1`, etc. Negative numbers represent depth; e.g., `-1` represents the latest message floor, and `-2` represents the second-to-last message floor.
 * @param option Optional options
 *   - `role:'all'|'system'|'assistant'|'user'`: Filter messages by role; defaults to `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: Filter messages by visibility state; defaults to `'all'`
 *   - `include_swipes:false`: Does not include message page information not used by AI
 *
 * @returns An array of `ChatMessage`, sorted by message_id from low to high
 *
 * @throws An error will be thrown if the provided `range` is invalid
 *
 * @example
 * // Get only the message page used by AI for floor 10
 * const chat_messages = getChatMessages(10);
 * const chat_messages = getChatMessages('10');
 * const chat_messages = getChatMessages('10', { include_swipes: false });
 *
 * @example
 * // Get the message page used by AI for the latest floor
 * const chat_message = getChatMessages(-1)[0];  // Or getChatMessages('{{lastMessageId}}')[0]
 *
 * @example
 * // Get message pages used by AI for all floors
 * const chat_messages = getChatMessages('0-{{lastMessageId}}');
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: false },
): ChatMessage[];

/**
 * Get chat messages, retrieving all message pages for each floor, including message pages not used by AI
 *
 * @param range The message floor number or floor range to retrieve, such as `0`, `'0-{{lastMessageId}}'`, `-1`, etc. Negative numbers represent depth; e.g., `-1` represents the latest message floor, and `-2` represents the second-to-last message floor.
 * @param option Optional options
 *   - `role:'all'|'system'|'assistant'|'user'`: Filter messages by role; defaults to `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: Filter messages by visibility state; defaults to `'all'`
 *   - `include_swipes:true`: Includes message page information not used by AI
 *
 * @returns An array of `ChatMessageSwiped`, sorted by message_id from low to high
 *
 * @example
 * // Get all message pages for floor 10
 * const chat_messages = getChatMessages(10, { include_swipes: true });
 * const chat_messages = getChatMessages('10', { include_swipes: true });
 *
 * @example
 * // Get all message pages for the latest floor
 * const chat_message = getChatMessages(-1, { include_swipes: true })[0];  // Or getChatMessages('{{lastMessageId}}', { include_swipes: true })[0]
 *
 * @example
 * // Get all message pages for all floors
 * const chat_messages = getChatMessages('0-{{lastMessageId}}', { include_swipes: true });
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: true },
): ChatMessageSwiped[];

/**
 * Get chat messages
 *
 * @param range The message floor number or floor range to retrieve, such as `0`, `'0-{{lastMessageId}}'`, `-1`, etc. Negative numbers represent depth; e.g., `-1` represents the latest message floor, and `-2` represents the second-to-last message floor.
 * @param option Optional options
 *   - `role:'all'|'system'|'assistant'|'user'`: Filter messages by role; defaults to `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: Filter messages by visibility state; defaults to `'all'`
 *   - `include_swipes:boolean`: Whether to include swiped message pages not used by AI, such as unselected starters or floors rerolled by clicking arrows. If not included, the return type is `ChatMessage`, otherwise the return type is `ChatMessageSwiped`; defaults to `false`
 *
 * @returns An array where each element is the message for a floor, sorted by message_id from low to high, with type `ChatMessage` or `ChatMessageSwiped` (depending on the value of `include_swipes`, defaults to `ChatMessage`).
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: GetChatMessagesOption,
): (ChatMessage | ChatMessageSwiped)[];

type SetChatMessagesOption = {
  /**
   * Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'affected'`
   * - `'none'`: Do not update the page display
   * - `'affected'`: Only update the display of affected floors; triggers `tavern_events.USER_MESSAGE_RENDERED` or `tavern_events.CHARACTER_MESSAGE_RENDERED` events during update
   * - `'all'`: Reload all chat messages; triggers the `tavern_events.CHAT_CHANGED` event
   */
  refresh?: 'none' | 'affected' | 'all';
};

/**
 * Modify chat message data
 *
 * @param chat_messages The messages to modify, must contain the `message_id` field
 * @param option Optional options
 *   - `refresh:'none'|'affected'|'all'`: Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'affected'`
 *
 * @example
 * // Modify the text of the message page used by AI for floor 10
 * await setChatMessages([{message_id: 10, message: 'New message'}]);
 *
 * @example
 * // Set starters
 * await setChatMessages([{message_id: 0, swipes: ['Starter 1', 'Starter 2']}])
 *
 * @example
 * // Switch to starter 3
 * await setChatMessages([{message_id: 0, swipe_id: 2}]);
 *
 * @example
 * // Re-render the UI for floor 4 (using `{render: 'affected'}`)
 * await setChatMessages([{message_id: 4}]);
 *
 * @example
 * // Supplement floor variables for the second-to-last floor
 * const chat_message = getChatMessages(-2)[0];
 * _.set(chat_message.data, 'Kagura Hikari Affection', 5);
 * await setChatMessages([{message_id: 0, data: chat_message.data}], {refresh: 'none'});
 *
 * @example
 * // Hide all floors
 * const last_message_id = getLastMessageId();
 * await setChatMessages(_.range(last_message_id + 1).map(message_id => ({message_id, is_hidden: true})));
 */
declare function setChatMessages(
  chat_messages: Array<{ message_id: number } & (Partial<ChatMessage> | Partial<ChatMessageSwiped>)>,
  { refresh }?: SetChatMessagesOption,
): Promise<void>;

type ChatMessageCreating = {
  name?: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden?: boolean;
  message: string;
  data?: Record<string, any>;
  extra?: Record<string, any>;
};

type CreateChatMessagesOption = {
  /** Insert before a specific floor or at the end; defaults to the end */
  insert_at?: number | 'end';

  /**
   * Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'affected'`
   * - `'none'`: Do not update the page display
   * - `'affected'`: Only update the display of affected floors
   * - `'all'`: Reload all chat messages; triggers the `tavern_events.CHAT_CHANGED` event
   */
  refresh?: 'none' | 'affected' | 'all';
};

/**
 * Create chat messages
 *
 * @param chat_messages The messages to create, must contain `role` and `message` fields
 * @param option Optional options
 *   - `insert_at:number|'end'`: Insert before a specific floor or at the end; defaults to the end
 *   - `refresh:'none'|'affected'|'all'`: Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'affected'`
 *
 * @example
 * // Insert a message before floor 10
 * await createChatMessages([{role: 'user', message: 'Hello'}], {insert_at: 10});
 *
 * @example
 * // Insert a message at the end
 * await createChatMessages([{role: 'user', message: 'Hello'}]);
 */
declare function createChatMessages(
  chat_messages: ChatMessageCreating[],
  { insert_at, refresh }?: CreateChatMessagesOption,
): Promise<void>;

type DeleteChatMessagesOption = {
  /**
   * Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'all'`
   * - `'none'`: Do not update the page display
   * - `'all'`: Reload all chat messages; triggers the `tavern_events.CHAT_CHANGED` event
   */
  refresh?: 'none' | 'all';
};

/**
 * Delete chat messages
 *
 * @param message_ids Array of floor numbers of messages to delete
 * @param option Optional options
 *   - `refresh:'none'|'all'`: Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'all'`
 *
 * @example
 * // Delete floor 10, floor 15, the second-to-last floor, and the last floor
 * await deleteChatMessages([10, 15, -2, getLastMessageId()]);
 *
 * @example
 * // Delete all floors
 * await deleteChatMessages(_.range(getLastMessageId() + 1));
 */
declare function deleteChatMessages(message_ids: number[], { refresh }?: DeleteChatMessagesOption): Promise<void>;

type RotateChatMessagesOption = {
  /**
   * Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'all'`
   * - `'none'`: Do not update the page display
   * - `'all'`: Reload all chat messages; triggers the `tavern_events.CHAT_CHANGED` event
   */
  refresh?: 'none' | 'all';
};

/**
 * Rotate floors from original order `[begin, middle) [middle, end)` to `[middle, end) [begin, middle)`
 *
 * @param begin Floor number of the start floor before rotation
 * @param middle Floor number that will be moved to the beginning after rotation
 * @param end Floor number of the end floor before rotation + 1
 * @param option Optional options
 *   - `refresh:'none'|'all'`: Whether to update the display of floors on the page; only updates floors already loaded in the browser and triggers the "Format display only" regex for updated floors; defaults to `'all'`
 *
 * @example
 * // Move the last floor before floor 5
 * await rotateChatMessages(5, getLastMessageId(), getLastMessageId() + 1);
 *
 * // Move the last 3 floors before floor 1
 * await rotateChatMessages(1, getLastMessageId() - 2, getLastMessageId() + 1);
 *
 * // Move the first 3 floors to the end
 * await rotateChatMessages(0, 3, getLastMessageId() + 1);
 */
declare function rotateChatMessages(
  begin: number,
  middle: number,
  end: number,
  { refresh }?: RotateChatMessagesOption,
): Promise<void>;
