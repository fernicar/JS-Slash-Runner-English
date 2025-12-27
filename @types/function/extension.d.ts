/** Check if the current user is an admin; only admins can update global extensions */
declare function isAdmin(): boolean;

/** Get the Tavern Helper extension ID */
declare function getTavernHelperExtensionId(): string;

/**
 * Get the type of the installed extension
 * - `'local'`: Local extension, available only to the current user
 * - `'global'`: Global extension, available to all users of the Tavern
 * - `'system'`: Built-in Tavern extension, such as Regex, etc.
 *
 * @param extension_id Extension ID, usually the extension folder name
 */
declare function getExtensionType(extension_id: string): 'local' | 'global' | 'system' | null;

type ExtensionInstallationInfo = {
  current_branch_name: string;
  current_commit_hash: string;
  is_up_to_date: boolean;
  remote_url: string;
};

/**
 * Get extension installation info
 *
 * @param extension_id Extension ID, usually the extension folder name
 */
declare function getExtensionInstallationInfo(extension_id: string): Promise<ExtensionInstallationInfo | null>;

/**
 * Check if a certain extension is installed
 *
 * @param extension_id Extension ID, usually the extension folder name
 *
 * @example
 * // Check if Tavern Helper is installed
 * const is_installed = isInstalledExtension(getTavernHelperExtensionId());
 */
declare function isInstalledExtension(extension_id: string): boolean;

/**
 * Install an extension; newly installed extensions require a page refresh (`triggerSlash('/reload-page')`) to take effect
 *
 * @param url Extension URL
 * @param type The type of extension to install as
 *   - `'local'`: Local extension, available only to the current user
 *   - `'global'`: Global extension, available to all users of the Tavern
 * @returns The response status of the installation
 *
 * @example
 * // Install Tavern Helper
 * const response = await installExtension('https://github.com/n0vi028/JS-Slash-Runner', 'local');
 * if (response.ok) {
 *   toastr.success(`Successfully installed Tavern Helper, preparing to refresh page to take effect...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function installExtension(url: string, type: 'local' | 'global'): Promise<Response>;

/**
 * Uninstall an extension; a page refresh (`triggerSlash('/reload-page')`) is required after uninstallation to take effect
 *
 * @param extension_id Extension ID, usually the extension folder name
 *
 * @example
 * // Uninstall Tavern Helper
 * const response = await uninstallExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`Successfully uninstalled Tavern Helper, preparing to refresh page to take effect...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function uninstallExtension(extension_id: string): Promise<Response>;

/**
 * Reinstall an extension; a page refresh (`triggerSlash('/reload-page')`) is required after reinstallation to take effect
 *
 * @param extension_id Extension ID, usually the extension folder name
 *
 * @example
 * // Reinstall Tavern Helper
 * const response = await reinstallExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`Successfully reinstalled Tavern Helper, preparing to refresh page to take effect...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function reinstallExtension(extension_id: string): Promise<Response>;

/**
 * Update an extension; a page refresh (`triggerSlash('/reload-page')`) is required after updating to take effect
 *
 * @param extension_id Extension ID, usually the extension folder name
 *
 * @example
 * // Update Tavern Helper
 * const response = await updateExtension('JS-Slash-Runner');
 * if (response.ok) {
 *   toastr.success(`Successfully updated Tavern Helper, preparing to refresh page to take effect...`);
 *   _.delay(() => triggerSlash('/reload-page'), 3000);
 * }
 */
declare function updateExtension(extension_id: string): Promise<Response>;
