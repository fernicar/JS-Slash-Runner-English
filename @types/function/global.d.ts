/**
 * Share the interface globally so that it can be used in other frontend interfaces or scripts.
 *
 * Other frontend interfaces or scripts will be able to wait for initialization to complete via `await waitGlobalInitialized(global)`,
 * and then access the interface using `global` as the variable name.
 *
 * @param global The name of the interface to share
 * @param value The content of the interface to share
 *
 * @example
 * // Share the Mvu interface globally
 * initializeGlobal('Mvu', Mvu);
 * // After this, other frontend interfaces or scripts can use `await waitGlobalInitialized('Mvu')` to wait for initialization and then access the interface using `Mvu` as the variable name.
 */
declare function initializeGlobal(global: LiteralUnion<'Mvu', string>, value: any): void;

/**
 * Wait for the global interface shared from other frontend interfaces or scripts to finish initialization, and make it available in the current frontend interface or script.
 *
 * This requires other frontend interfaces or scripts to share the interface via `initializeGlobal(global, value)`.
 *
 * @param global The name of the global interface to initialize
 *
 * @example
 * await waitGlobalInitialized('Mvu');
 * ...After this, the Mvu interface can be used directly
 */
declare function waitGlobalInitialized<T>(global: LiteralUnion<'Mvu', string>): Promise<T>;
