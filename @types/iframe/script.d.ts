/**
 * Get the event type corresponding to the button, **can only be used within scripts**
 *
 * @param button_name Button name
 * @returns Event type
 *
 * @example
 * const event_type = getButtonEvent('Button Name');
 * eventOn(event_type, () => {
 *   console.log('Button clicked');
 * });
 */
declare function getButtonEvent(button_name: string): string;

type ScriptButton = {
  name: string;
  visible: boolean;
};

/**
 * Get the script's button list, **can only be used within scripts**
 *
 * @returns Button array
 *
 * @example
 * // Get the button settings of the current script within the script
 * const buttons = getScriptButtons();
 */
declare function getScriptButtons(): ScriptButton[];

/**
 * Completely replace the script's button list, **can only be used within scripts**
 *
 * @param buttons Button array
 *
 * @example
 * // Set script buttons to a "Start Game" button within the script
 * replaceScriptButtons([{name: 'Start Game', visible: true}])
 *
 * @example
 * // After clicking the "Go to Location" button, switch to location option buttons
 * eventOnButton("Go to Location", () => {
 *   replaceScriptButtons([{name: 'School', visible: true}, {name: 'Shop', visible: true}])
 * })
 */
declare function replaceScriptButtons(buttons: ScriptButton[]): void;

/**
 * Append non-existent buttons to the end of the script button list; will not add duplicate buttons with the same name. **Can only be used within scripts**
 *
 * @param buttons
 *
 * @exmaple
 * // Add a new "Restart" button
 * appendInexistentScriptButtons([{name: 'Restart', visible: true}]);
 */
declare function appendInexistentScriptButtons(buttons: ScriptButton[]): void;

/** Get script author comments */
declare function getScriptInfo(): string;

/**
 * Replace script author comments
 *
 * @param info New author comments
 */
declare function replaceScriptInfo(info: string): void;
