/**
 * Executes a Slash command; note that if the command is incorrect, no feedback will be provided.
 *
 * For available commands, please refer to `slash_command.txt` in [Writing Templates](https://stagedog.github.io/青空莉/工具经验/实时编写前端界面或脚本/) or the [Command Manual](https://rentry.org/sillytavern-script-book).
 *
 * @param command The Slash command to run
 * @returns The Slash pipe result; returns `undefined` if the command fails or `/abort` is executed.
 *
 * @throws An error will be thrown if the Slash command fails.
 *
 * @example
 * // Pop up a notification "Run successful!" on the tavern interface
 * triggerSlash('/echo severity=success Run successful!');
 * // However, it is recommended to use toastr directly for notifications
 * toastr.success('Run successful!');
 *
 * @example
 * // Get the ID of the last message in the current chat
 * const last_message_id = await triggerSlash('/pass {{lastMessageId}}');
 * // However, it is recommended to use the tavern helper functions
 * const last_message = getLastMessageId();
 *
 * @example
 * // Create a user input at the end of the message list
 * await createChatMessages([{ role: 'user', content: 'Hello' }]);
 * // Trigger AI reply
 * await triggerSlash('/trigger');
 */
declare function triggerSlash(command: string): Promise<string>;
