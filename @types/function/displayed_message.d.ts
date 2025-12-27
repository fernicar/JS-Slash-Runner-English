/**
 * Gets the jQuery instance of the message content corresponding to the message ID.
 *
 * More than a utility function, this is more like an example showing you that you can use jQuery.
 *
 * @param message_id The message floor ID to retrieve. The message floor must be displayed on the SillyTavern page to be retrievable.
 * @returns If the HTML for the message floor can be retrieved, returns the corresponding jQuery instance; otherwise, returns an empty jQuery instance.
 *
 * @example
 * // Get the message content text of floor 0
 * const text = retrieveDisplayedMessage(0).text();
 *
 * @example
 * // Modify the message content text of floor 0
 * // - Such modifications only affect the current display and will not be saved to the message file. Therefore, they will revert to the original state after operations like reloading messages or refreshing the page;
 * // - If you need to actually modify the message file, please use `setChatMessage`
 * retrieveDisplayedMessage(0).text("new text");
 * retrieveDisplayedMessage(0).append("<pre>new text</pre>");
 * retrieveDisplayedMessage(0).append(formatAsDisplayedMessage("{{char}} speaks in {{lastMessageId}}"));
 */
declare function retrieveDisplayedMessage(message_id: number): JQuery<HTMLDivElement>;

type FormatAsDisplayedMessageOption = {
  /** The floor where the message is located. Requires the floor to already exist, i.e., within the range [0, getLastMessageId()]; defaults to 'last' */
  message_id?: 'last' | 'last_user' | 'last_char' | number;
};

/**
 * Processes a string into the HTML format used by SillyTavern for display. It will:
 * 1. Replace SillyTavern macros in the string
 * 2. Apply corresponding SillyTavern regex to the string
 * 3. Format the string into HTML
 *
 * @param text The string to be processed
 * @param option Optional options
 *   - `message_id?:number`: The floor where the message is located. Requires the floor to already exist, i.e., within the range [0, getLastMessageId()]; defaults to the latest floor.
 *
 * @returns Processing result
 *
 * @throws Throws an error if the provided message floor ID `message_id` is not within the range [0, getLastMessageId()].
 *
 * @example
 * const text = formatAsDisplayedMessage("{{char}} speaks in {{lastMessageId}}");
 * => "<p>Shojo Kageki speaks in 5</p>";
 */
declare function formatAsDisplayedMessage(text: string, { message_id }?: FormatAsDisplayedMessageOption): string;
