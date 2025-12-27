/**
 * Get the merged variable table
 * - If this function is called within a message floor iframe, it retrieves the merged result of Global → Character Card → Chat → Message Floor 0 → All intermediate message floors → Current message floor
 * - If this function is called within the global variable iframe, it retrieves the merged result of Global → Character Card → Script → Chat → Message Floor 0 → All intermediate message floors → Latest message floor
 *
 * @example
 * const variables = getAllVariables();
 */
declare function getAllVariables(): Record<string, any>;
