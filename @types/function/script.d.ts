/**
 * Get all enabled SillyTavern script buttons, mainly to facilitate compatibility with script buttons for QR Assistant, etc.
 */
declare function getAllEnabledScriptButtons(): { [script_id: string]: { button_id: string; button_name: string }[] };
