/**
 * Substitute macros in the string
 *
 * @param text The string to be substituted
 * @returns The substitution result
 *
 * @example
 * const text = substitudeMacros("{{char}} speaks in {{lastMessageId}}");
 * text == "Starlight Revue speaks in 5";
 */
declare function substitudeMacros(text: string): string;

/**
 * Get the latest message ID
 *
 * @returns The latest message ID
 */
declare function getLastMessageId(): number;

/**
 * Wraps any function and returns a function with the same functionality that displays error messages through Tavern notifications
 *
 * @param fn The function to be wrapped
 * @returns The wrapped function
 *
 * @example
 * // Wrap the `test` function to display the 'test' text in the Tavern notification
 * function test() {
 *   throw Error(`test`);
 * }
 * errorCatched(test)();
 */
declare function errorCatched<T extends any[], U>(fn: (...args: T) => U): (...args: T) => U;

/**
 * Get the message ID from the frontend iframe identifier name `iframe_name`. **Can only be used for frontend interface iframe identifier names**
 *
 * @param iframe_name The iframe identifier name of the frontend interface
 * @returns The message ID
 *
 * @throws Throws an error if the provided `iframe_name` is not a frontend interface iframe identifier name
 */
declare function getMessageId(iframe_name: string): number;
