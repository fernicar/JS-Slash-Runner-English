/**
 * Extra functionality provided by the Prompt Template Syntax plugin. The Prompt Template Syntax plugin must be installed separately; see https://github.com/zonde306/ST-Prompt-Template for details.
 * You can also press F12 on the SillyTavern page and type `window.EjsTemplate` in the console to view the interfaces provided by the current prompt template syntax.
 */
declare const EjsTemplate: {
  /**
   * Performs template syntax processing on text
   * @note `context` is generally obtained from `prepareContext`; if modification is needed, the original object should be modified directly.
   *
   * @param code Template code
   * @param context Execution environment (context)
   * @param options EJS parameters
   * @returns The content after template evaluation
   *
   * @example
   * // Use a function provided by the Prompt Template Syntax plugin to create a temporary SillyTavern regex to process message floors once
   * await EjsTemplate.evalTemplate('<%_ await activateRegex(/<thinking>.*?<\/thinking>/gs, '') _%>')
   *
   * @example
   * const env    = await EjsTemplate.prepareContext({ a: 1 });
   * const result = await EjsTemplate.evalTemplate('a is <%= a _%>', env);
   * => result === 'a is 1'
   * // However, it is recommended to use _.template for this type of usage; see https://lodash.com/docs/4.17.15#template for details
   * const compiled = _.template('hello <%= user %>!');
   * const result   = compiled({ 'user': 'fred' });;
   * => result === 'hello user!'
   */
  evaltemplate: (code: string, context?: Record<string, any>, options?: Record<string, any>) => Promise<string>;

  /**
   * Creates an execution environment (context) for template syntax processing
   *
   * @param additional_context Additional execution environment (context)
   * @param last_message_id Maximum ID for merging message variables; defaults to all
   * @returns Execution environment (context)
   */
  prepareContext: (additional_context?: Record<string, any>, last_message_id?: number) => Promise<Record<string, any>>;

  /**
   * Checks if the template has syntax errors
   * Does not actually execute
   *
   * @param content Template code
   * @param output_line_count Number of surrounding lines to output when an error occurs; defaults to 4
   * @returns Syntax error information, returns an empty string if no error
   */
  getSyntaxErrorInfo: (code: string, output_line_count?: number) => Promise<string>;

  /**
   * Gets the union of global variables, chat variables, and message floor variables
   *
   * @param end_message_id Maximum floor number of message floor variables to merge
   * @returns Merged variables
   */
  allVariables: (end_message_id?: number) => Record<string, any>;

  /**
   * Updates the settings for the Prompt Template Syntax plugin
   *
   * @param features Settings
   */
  setFeatures: (
    features: Partial<{
      /** Whether to enable the extension */
      enabled: boolean;

      /** Process generated content */
      generate_enabled: boolean;
      /** Inject [GENERATE] World Info entries during generation */
      generate_loader_enabled: boolean;
      /** Inject @INJECT World Info entries during generation */
      inject_loader_enabled: boolean;

      /** Process floor messages */
      render_enabled: boolean;
      /** Inject [RENDER] World Info entries during floor rendering */
      render_loader_enabled: boolean;
      /** Process code blocks */
      code_blocks_enabled: boolean;
      /** Process raw message content */
      raw_message_evaluation_enabled: boolean;
      /** Ignore floor message processing during generation */
      filter_message_enabled: boolean;
      /** Floor depth limit processing (-1=unlimited) */
      depth_limit: number;

      /** Auto-save variable updates */
      autosave_enabled: boolean;
      /** Preload World Info immediately */
      preload_worldinfo_enabled: boolean;
      /** Disable 'with' blocks */
      with_context_disabled: boolean;
      /** Show detailed info in console */
      debug_enabled: boolean;
      /** Legacy compatibility mode: GENERATE/RENDER/INJECT entries in World Info are treated as enabled when disabled */
      invert_enabled: boolean;

      /** Cache (experimental) (0=disabled, 1=all, 2=World Info only) */
      cache_enabled: number;
      /** Cache size */
      cache_size: number;
      /** Cache Hash function */
      cache_hasher: 'h32ToString' | 'h64ToString';
    }>,
  ) => void;

  /**
   * Resets the settings for the Prompt Template Syntax plugin
   */
  resetFeatures: () => void;
};
