declare namespace Mvu {
  type MvuData = {
    /** List of lorebooks with initvar entries initialized by mvu */
    initialized_lorebooks: string[];

    /** Actual variable data */
    stat_data: Record<string, any>;
  };

  type CommandInfo = SetCommandInfo | InsertCommandInfo | DeleteCommandInfo | AddCommandInfo;
  type SetCommandInfo = {
    type: 'set';
    full_match: string;
    args:
      | [path: string, new_value_literal: string]
      | [path: string, expected_old_value_literal: string, new_value_literal: string];
    reason: string;
  };
  type InsertCommandInfo = {
    type: 'insert';
    full_match: string;
    args:
      | [path: string, value_literal: string] // Append value at the end
      | [path: string, index_or_key_literal: string, value_literal: string]; // Insert value at specific index/key
    reason: string;
  };
  type DeleteCommandInfo = {
    type: 'delete';
    full_match: string;
    args: [path: string] | [path: string, index_or_key_or_value_literal: string];
    reason: string;
  };
  type AddCommandInfo = {
    type: 'add';
    full_match: string;
    args: [path: string, delta_or_toggle_literal: string];
    reason: string;
  };
}

/**
 * Extra functionality provided by the mvu variable framework script. The mvu variable framework script must be installed separately. See details at https://github.com/MagicalAstrogy/MagVarUpdate/blob/master/src/export_globals.ts
 * **Before using it, you should first wait for Mvu to complete initialization via `await waitGlobalInitialized('Mvu')`**
 * You can also press f12 on the Tavern page and enter `window.Mvu` in the console to view the interfaces provided by the current Mvu variable framework
 */
declare const Mvu: {
  events: {
    /** Event triggered when variables are initialized for a new chat */
    VARIABLE_INITIALIZED: 'mag_variable_initiailized';

    /** Event triggered when a round of variable update starts */
    VARIABLE_UPDATE_STARTED: 'mag_variable_update_started';

    /**
     * Event triggered when all update commands are successfully parsed from text during a variable update round
     *
     * @example
     * // Fix the '-' added by Gemini between characters, e.g., fixing 'Role.Luo-Luo' to 'Role.LuoLuo'
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.forEach(command => {
     *     command.args[0] = command.args[0].replace(/-/g, '');
     *   });
     * });
     *
     * @example
     * // Fix traditional characters, e.g., fixing 'LuoLuo' to 'LuoLuo'
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.forEach(command => {
     *     command.args[0] = command.args[0].replaceAll('Luoluo', 'Luoluo');
     *   });
     * });
     *
     * @example
     * // Add new update command
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.push({
     *     type: 'set',
     *     full_match: `_.set('LuoLuo.Affinity', 5)`,
     *     args: ['LuoLuo.Affinity', 5],
     *     reason: 'Script forced update',
     *   });
     * });
     */
    COMMAND_PARSED: 'mag_command_parsed';

    /**
     * Event triggered when a round of variable update ends
     *
     * @example
     * // Keep affection not lower than 0
     * eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
     *   if (_.get(variables, 'stat_data.Role.LuoLuo.Affection') < 0) {
     *     _.set(variables, 'stat_data.Role.LuoLuo.Affection', 0);
     *   }
     * })
     *
     * @example
     * // Keep affection increase not exceeding 3
     * eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before_update) => {
     *   const old_value = _.get(variables_before_update, 'stat_data.Role.LuoLuo.Affection');
     *   const new_value = _.get(variables, 'stat_data.Role.LuoLuo.Affection');
     *
     *   // The new affection must be between old affection - 3 and old affection + 3
     *   _.set(variables, 'stat_data.Role.LuoLuo.Affection', _.clamp(new_value, old_value - 3, old_value + 3));
     * });
     */
    VARIABLE_UPDATE_ENDED: 'mag_variable_update_ended';

    /** Event triggered when the message floor is about to be updated with the updated variables */
    BEFORE_MESSAGE_UPDATE: 'mag_before_message_update';
  };

  /**
   * Get the variable table and treat it as MvuData containing mvu data
   *
   * @param options Optional options
   *   - `type?:'message'|'chat'|'character'|'global'`: Operate on chat variables of a specific floor (`message`), chat variable table (`'chat'`), character card variables (`'character'`), or global variable table (`'global'`); defaults to `'chat'`
   *   - `message_id?:number|'latest'`: When `type` is `'message'`, this parameter specifies the message floor number to retrieve; if negative, it is a depth index, e.g., `-1` means getting the latest message floor; defaults to `'latest'`
   *   - `script_id?:string`: When `type` is `'script'`, this parameter specifies the script ID to retrieve; if called within a script, you can use `getScriptId()` to get the script ID
   *
   * @returns MvuData table
   *
   * @example
   * // Get mvu data of the latest message floor
   * const message_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   *
   * // Get mvu data of the floor where the iframe is located within the message floor iframe
   * const message_data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
   */
  getMvuData: (options: VariableOption) => Mvu.MvuData;

  /**
   * Completely replace the variable table with `mvu_data` containing mvu data (but if you haven't processed variables yourself using parseMessages, it is recommended to listen to mvu events to modify mvu data!)
   *
   * @param variables Variable table to be used for replacement
   * @param option Optional options
   *   - `type?:'message'|'chat'|'character'|'global'`: Operate on chat variables of a specific floor (`message`), chat variable table (`'chat'`), character card variables (`'character'`), or global variable table (`'global'`); defaults to `'chat'`
   *   - `message_id?:number|'latest'`: When `type` is `'message'`, this parameter specifies the message floor number to retrieve; if negative, it is a depth index, e.g., `-1` means getting the latest message floor; defaults to `'latest'`
   *   - `script_id?:string`: When `type` is `'script'`, this parameter specifies the script ID to retrieve; if called within a script, you can use `getScriptId()` to get the script ID
   *
   * @example
   * // Modify LuoLuo's affection to 30
   * const mvu_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   * _.set(mvu_data, 'stat_data.Role.LuoLuo.Affection', 30);
   * await Mvu.replaceMvuData(mvu_data, { type: 'message', message_id: 'latest' });
   */
  replaceMvuData: (mvu_data: Mvu.MvuData, options: VariableOption) => Promise<void>;

  /**
   * Parse the message `message` containing variable update commands (`_.set`) and update the mvu variable data in `old_data` based on it
   *
   * @param message Message string containing _.set() commands
   * @param old_data Current MvuData data
   *
   * @returns Returns new MvuData if variables are updated, otherwise returns `undefined`
   *
   * @example
   * // Modify LuoLuo's affection to 30
   * const old_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   * const new_data = await Mvu.parseMessage("_.set('Role.LuoLuo.Affection', 30); // Force modify", old_data);
   * await Mvu.replaceMvuData(new_data, { type: 'message', message_id: 'latest' });
   */
  parseMessage: (message: string, old_data: Mvu.MvuData) => Promise<Mvu.MvuData>;

  /**
   * Reload initial variable data
   *
   * @param mvu_data MvuData table to reload initial data for
   *
   * @returns Whether loading was successful
   */
  reloadInitVar: (mvu_data: Mvu.MvuData) => Promise<boolean>;
};

interface ListenerType {
  [Mvu.events.VARIABLE_INITIALIZED]: (variables: Mvu.MvuData, swipe_id: number) => void;

  [Mvu.events.BEFORE_MESSAGE_UPDATE]: (context: { variables: Mvu.MvuData; message_content: string }) => void;

  [Mvu.events.VARIABLE_UPDATE_STARTED]: (variables: Mvu.MvuData) => void;

  [Mvu.events.COMMAND_PARSED]: (variables: Mvu.MvuData, commands: Mvu.CommandInfo[], message_content: string) => void;

  [Mvu.events.VARIABLE_UPDATE_ENDED]: (variables: Mvu.MvuData, variables_before_update: Mvu.MvuData) => void;
}
