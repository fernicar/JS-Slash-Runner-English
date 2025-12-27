type VariableOptionNormal = {
  /** Operate on chat variables (`'chat'`), current preset (`'preset'`), or global variables (`'global'`) */
  type: 'chat' | 'preset' | 'global';
};
type VariableOptionCharacter = {
  /**
   * Operate on the current character card (`'character'`)
   *
   * @throws If no character card is open, an error will be thrown
   */
  type: 'character';
};
type VariableOptionMessage = {
  /** Operate on message entry variables (`message`) */
  type: 'message';
  /**
   * Specify the message entry number to get variables from. If it's a negative number, it acts as a depth index (e.g., `-1` means the latest message entry); defaults to `'latest'`
   *
   * @throws If the provided `message_id` is out of the range `[-chat.length, chat.length)`, an error will be thrown
   */
  message_id?: number | 'latest';
};
type VariableOptionScript = {
  /** Operate on script variables (`'script'`) */
  type: 'script';
  /** Specify the script ID to operate on; if called within a script, it does not need to be specified. You can also use `getScriptId()` to get the current script ID */
  script_id?: string;
};
type VariableOptionExtension = {
  /** Operate on extension variables (`'extension'`) */
  type: 'extension';
  /** Specify the extension ID to operate on */
  extension_id: string;
};
type VariableOption = VariableOptionNormal | VariableOptionCharacter | VariableOptionMessage | VariableOptionScript | VariableOptionExtension;

/**
 * Get the variable table
 *
 * @param option The variable type to operate on
 *
 * @returns The variable table
 *
 * @example
 * // Get all chat variables and output the result in an alert
 * const variables = getVariables({type: 'chat'});
 * alert(variables);
 *
 * @example
 * // Get all global variables
 * const variables = getVariables({type: 'global'});
 * // Tavern Assistant has a built-in lodash library, which you can use for many things, such as checking if a variable exists
 * if (_.has(variables, "HikariKagura.Affection")) {
 *   ...
 * }
 *
 * @example
 * // Get the chat variables for the second-to-last message entry
 * const variables = getVariables({type: 'message', message_id: -2});
 *
 * @example
 * // Get the variables bound to the current script from within the script
 * const variables = getVariables({type: 'script'});
 */
declare function getVariables(option: VariableOption): Record<string, any>;

/**
 * Completely replace the variable table with `variables`
 *
 * This direct function is provided because Tavern Assistant has a built-in lodash library:
 *   Functions like `insertOrAssignVariables` actually call `getVariables` first, process it with lodash, and then use `replaceVariables` to update the table.
 *
 * @param variables The variable table to use for replacement
 * @param option The variable type to operate on
 *
 * @example
 * // Chat variables before execution: `{KarenAijo: {Affection: 5}}`
 * replaceVariables({HikariKagura: {Affection: 5, Awareness: 0}});
 * // Chat variables after execution: `{HikariKagura: {Affection: 5, Awareness: 0}}`
 *
 * @example
 * // Delete the `{HikariKagura: {Affection: 5}}` variable
 * let variables = getVariables();
 * _.unset(variables, "HikariKagura.Affection");
 * replaceVariables(variables);
 *
 * @example
 * // Replace the variables bound to the current script from within the script
 * replaceVariables({HikariKagura: {Affection: 5, Awareness: 0}}, {type: 'script'});
 */
declare function replaceVariables(variables: Record<string, any>, option: VariableOption): void;

/**
 * Update the variable table using an `updater` function
 *
 * @param updater The function used to update the variable table. It should receive the current table as an argument and return the updated table.
 * @param option The variable type to operate on
 *
 * @returns The updated variable table
 *
 * @example
 * // Delete the `{HikariKagura: {Affection: 5}}` variable
 * updateVariablesWith(variables => {
 *   _.unset(variables, "HikariKagura.Affection");
 *   return variables;
 * });
 *
 * @example
 * // Update "KarenAijo.Affection" to double its value, or set to 0 if the variable doesn't exist
 * updateVariablesWith(variables => _.update(variables, "KarenAijo.Affection", value => value ? value * 2 : 0), {type: 'chat'});
 */
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any>,
  option: VariableOption,
): Record<string, any>;

/**
 * Update the variable table using an asynchronous `updater` function
 *
 * @param updater The function used to update the variable table. It should receive the table as an argument and return the updated table.
 * @param option The variable type to operate on
 *
 * @returns The updated variable table
 *
 * @example
 * await updateVariablesWith(async variables => {await update(variables); return variables;}, {type: 'chat'});
 */
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Promise<Record<string, any>>,
  option: VariableOption,
): Promise<Record<string, any>>;

/**
 * Insert or modify variable values, depending on whether the variables exist.
 *
 * @param variables The variables to update
 *   - If the variable does not exist, it will be added
 *   - If the variable already exists, its value will be modified
 * @param option The variable type to operate on
 *
 * @returns The updated variable table
 *
 * @example
 * // Variables before execution: `{KarenAijo: {Affection: 5}}`
 * await insertOrAssignVariables({KarenAijo: {Affection: 10}, HikariKagura: {Affection: 5, Awareness: 0}}, {type: 'chat'});
 * // Variables after execution: `{KarenAijo: {Affection: 10}, HikariKagura: {Affection: 5, Awareness: 0}}`
 */
declare function insertOrAssignVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;

/**
 * Insert new variables; does nothing if the variables already exist
 *
 * @param variables The variables to insert
 *   - If the variable does not exist, it will be added
 *   - If the variable already exists, nothing will be done
 * @param option The variable type to operate on
 *
 * @returns The updated variable table
 *
 * @example
 * // Variables before execution: `{KarenAijo: {Affection: 5}}`
 * await insertVariables({KarenAijo: {Affection: 10}, HikariKagura: {Affection: 5, Awareness: 0}}, {type: 'chat'});
 * // Variables after execution: `{KarenAijo: {Affection: 5}, HikariKagura: {Affection: 5, Awareness: 0}}`
 */
declare function insertVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;

/**
 * Delete a variable; does nothing if the variable does not exist
 *
 * @param variable_path The path of the variable to delete
 *   - If the variable does not exist, nothing will be done
 *   - If the variable exists, it will be deleted
 * @param option The variable type to operate on
 *
 * @returns The updated variable table and whether the deletion successfully occurred
 *
 * @example
 * // Variables before execution: `{KarenAijo: {Affection: 5}}`
 * await deleteVariable("KarenAijo.Affection", {type: 'chat'});
 * // Variables after execution: `{KarenAijo: {}}`
 */
declare function deleteVariable(
  variable_path: string,
  option: VariableOption,
): { variables: Record<string, any>; delete_occurred: boolean };

/**
 * Register a variable schema for the Variable Manager. Once registered, variables will be validated against this schema in the Variable Manager UI.
 *
 * **This is only for convenience when viewing and managing variables via the Variable Manager UI; it has no effect at the code level.**
 *
 * @param schema The variable structure represented using the zod library
 * @param option The variable type to register the schema for
 *
 * @example
 * // Register the schema for message entry variables where 'stat_data' contains an 'Affection' numeric variable
 * registerVariableSchema(z.object({
 *   stat_data: z.object({
 *     Affection: z.number(),
 *   }),
 * }), {type: 'message'});
 */
function registerVariableSchema(
  schema: z.ZodType<any>,
  option: { type: 'global' | 'preset' | 'character' | 'chat' | 'message' },
): void;
