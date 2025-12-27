/**
 * Character card management class
 * Used to encapsulate character card data operations and provide convenient access methods
 */
declare class RawCharacter {
  constructor(characterData: SillyTavern.v1CharData);

  /**
   * Find character card data by name or avatar ID
   * @param options Search options
   * @returns Found character card data, or null if not found
   */
  static find({
    name,
    allowAvatar,
  }?: {
    name: LiteralUnion<'current', string>;
    allowAvatar?: boolean;
  }): SillyTavern.v1CharData;

  /**
   * Find the index of character card data in the characters array by name (similar to this_chid)
   * @param name Character name
   * @returns The index of the character card data in the characters array, returns -1 if not found
   */
  static findCharacterIndex(name: string): any;

  /**
   * Retrieves the chat content of each chat file from the server and compiles it into a dictionary.
   * This function iterates through the provided list of chat metadata and requests the actual chat content for each chat.
   *
   * @param {Array} data - An array containing metadata for each chat, such as filenames.
   * @param {boolean} isGroupChat - A flag indicating whether the chat is a group chat.
   * @returns {Promise<Object>} chat_dict - A dictionary where each key is a filename and the value is the
   * corresponding chat content retrieved from the server.
   */
  static getChatsFromFiles(data: any[], isGroupChat: boolean): Promise<Record<string, any>>;

  /**
   * Get data within character management
   * @returns Complete data object within character management
   */
  getCardData(): SillyTavern.v1CharData;

  /**
   * Get character avatar ID
   * @returns Avatar ID/filename
   */
  getAvatarId(): string;

  /**
   * Get regex scripts
   * @returns Array of regex scripts
   */
  getRegexScripts(): Array<{
    id: string;
    scriptName: string;
    findRegex: string;
    replaceString: string;
    trimStrings: string[];
    placement: number[];
    disabled: boolean;
    markdownOnly: boolean;
    promptOnly: boolean;
    runOnEdit: boolean;
    substituteRegex: number | boolean;
    minDepth: number;
    maxDepth: number;
  }>;

  /**
   * Get character book
   * @returns Character book data object or null
   */
  getCharacterBook(): {
    name: string;
    entries: Array<{
      keys: string[];
      secondary_keys?: string[];
      comment: string;
      content: string;
      constant: boolean;
      selective: boolean;
      insertion_order: number;
      enabled: boolean;
      position: string;
      extensions: any;
      id: number;
    }>;
  } | null;

  /**
   * Get character world name
   * @returns World name
   */
  getWorldName(): string;
}

/**
 * Get character card data
 * @param name Character name or avatar ID
 * @param allowAvatar Whether to allow searching by avatar ID
 * @returns Character card data
 */
declare function getCharData(
  name: LiteralUnion<'current', string>,
  allowAvatar?: boolean,
): SillyTavern.v1CharData | null;

/**
 * Get character avatar path
 * @param name Character name or avatar ID
 * @param allowAvatar Whether to allow searching by avatar ID
 * @returns Character avatar path
 */
declare function getCharAvatarPath(name: LiteralUnion<'current', string>, allowAvatar?: boolean): string | null;

/**
 * Get character chat history summary
 * @param name Character name or avatar ID
 * @param allowAvatar Whether to allow searching by avatar ID
 * @returns Array of chat history summaries
 */
declare function getChatHistoryBrief(
  name: LiteralUnion<'current', string>,
  allowAvatar?: boolean,
): Promise<any[] | null>;

/**
 * Get chat history details
 * @param data Array of chat data
 * @param isGroupChat Whether it is a group chat
 * @returns Chat history details
 */
declare function getChatHistoryDetail(data: any[], isGroupChat?: boolean): Promise<Record<string, any> | null>;
