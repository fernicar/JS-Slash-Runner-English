type MacroLikeContext = {
  message_id?: number;
  role?: 'user' | 'assistant' | 'system';
};

type RegisterMacroLikeReturn = {
  /** Unregister */
  unregister: () => void;
};

/**
 * Register a new assistant macro
 *
 * @param regex The regular expression to match
 * @param replace The replacement to perform on the matched text
 *
 * @example
 * // Register a macro that counts lines
 * registerMacros(
 *   /<count_lines>(.*?)<count_lines>/gi,
 *   context => content.split('\n').length
 * );
 *
 * @returns Subsequent actions
 *   - `unregister`: Unregister
 */
declare function registerMacroLike(
  regex: RegExp,
  replace: (context: MacroLikeContext, substring: string, ...args: any[]) => string,
): RegisterMacroLikeReturn;

/**
 * Unregister an assistant macro
 *
 * @param regex The regular expression of the assistant macro
 */
declare function unregisterMacroLike(regex: RegExp): void;
