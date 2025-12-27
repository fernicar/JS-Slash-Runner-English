/**
 * Used within the frontend interface or script to reload the frontend interface or script.
 *
 * This is equivalent to calling `window.location.reload()`, which will invalidate globally shared interfaces;
 *   If there is data that needs to be retained after reloading the frontend interface, you should write your own reload method instead of using this function.
 *
 * @example
 * // Reload the frontend interface or script when the chat file changes
 * let current_chat_id = SillyTavern.getCurrentChatId();
 * eventOn(tavern_events.CHAT_CHANGED, chat_id => {
 *   if (current_chat_id !== chat_id) {
 *     current_chat_id = chat_id;
 *     reloadIframe();
 *   }
 * })
 *
 * @example
 * // Writing your own reload method
 * function initailzie() { ... }
 * $(initialize);
 *
 * function destroy() { eventClearAll(); ... }
 * $(window).on('pagehide', destroy);
 *
 * function reload() {
 *   destory();
 *   initialize();
 * }
 */
declare function reloadIframe(): void;

/**
 * Get the identifier name of the frontend interface or script
 *
 * @returns For the frontend interface it is `TH-message--floor number--index of the interface in that floor`, for script libraries it is `TH-script--script name--script id`
 */
declare function getIframeName(): string;

/**
 * Get the floor ID of the floor where the current message iframe is located, **can only be used for message floor iframes**
 *
 * @returns Floor ID
 *
 * @throws An error will be thrown if not used within a message floor iframe
 */
declare function getCurrentMessageId(): number;

/**
 * Get the script library ID of the script, **can only be used within a script**
 *
 * @returns Script library ID
 *
 * @throws An error will be thrown if not used within a script
 */
declare function getScriptId(): string;
