/**
 * Import character cards as in the tavern interface
 *
 * @param filename Character card name
 * @param content Character card file content
 *
 * @example
 * // Import character card from a web link
 * const response = await fetch(characterCardWebLink);
 * await importRawCharacter(characterCardName, await response.blob());
 */
declare function importRawCharacter(filename: string, content: Blob): Promise<Response>;

/**
 * Import chat files as in the tavern interface, currently only imports to the currently selected character card
 *
 * @param filename Chat file name; due to tavern limitations, it will not actually serve as the final imported chat filename
 * @param content Chat file content
 *
 * @throws An error will be thrown if no character card is selected
 *
 * @example
 * // Import chat file from a web link
 * const response = await fetch(chatFileWebLink);
 * await importRawChat(chatFileName, await response.text());
 */
declare function importRawChat(filename: string, content: string): Promise<Response>;

/**
 * Import presets as in the tavern interface
 *
 * @param filename Preset name
 * @param content Preset file content
 *
 * @example
 * // Import preset from a web link
 * const response = await fetch(presetWebLink);
 * await importRawChat(presetName, await response.text());
 */
declare function importRawPreset(filename: string, content: string): Promise<boolean>;

/**
 * Import worldbooks as in the tavern interface
 *
 * @param filename Worldbook name
 * @param content Worldbook file content
 *
 * @example
 * // Import worldbook from a web link
 * const response = await fetch(worldbookWebLink);
 * await importRawChat(worldbookName, await response.text());
 */
declare function importRawWorldbook(filename: string, content: string): Promise<Response>;

/**
 * Import tavern regex as in the tavern interface
 *
 * @param filename Tavern regex name
 * @param content Tavern regex file content
 *
 * @example
 * // Import tavern regex from a web link
 * const response = await fetch(tavernRegexWebLink);
 * await importRawChat(tavernRegexName, await response.text());
 */
declare function importRawTavernRegex(filename: string, content: string): boolean;
