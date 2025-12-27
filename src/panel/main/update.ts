import { getTavernHelperExtensionId, reinstallExtension, updateExtension } from '@/function/extension';
import { getTavernHelperVersion } from '@/function/version';
import { renderMarkdown } from '@/util/tavern';
import { callGenericPopup, POPUP_TYPE } from '@sillytavern/scripts/popup';
import { compare } from 'compare-versions';

let max_version: string;
export async function getLatestVersion(): Promise<string> {
  if (!max_version) {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${encodeURIComponent('novi028/JS-Slash-Runner')}/repository/files/manifest.json/raw?ref=main`,
    );
    if (!response.ok) {
      throw new Error(`Failed to get the latest version number: ${response.status} ${response.statusText}`);
    }
    max_version = _.get(JSON.parse(await response.text()), 'version');
  }
  return max_version;
}

export async function hasUpdate(): Promise<boolean> {
  return compare(await getLatestVersion(), getTavernHelperVersion(), '>');
}

async function getFullChangelog(): Promise<string> {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent('novi028/JS-Slash-Runner')}/repository/files/CHANGELOG.md/raw?ref=main`,
  );
  if (!response.ok) {
    throw new Error(`Failed to get the latest changelog: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function getChangelogBetween(min_version: string, max_version: string): Promise<string> {
  const changelog = await getFullChangelog();

  const matches = [...changelog.matchAll(/(?:^|\n)(?:#{1,3}\s*|\[)([0-9]+\.[0-9]+\.[0-9]+)(?:\]|\s|$)/g)];

  let start_index: number;
  let end_index: number;
  if (compare(min_version, max_version, '>=')) {
    const max_version_match = matches.find(match => match[1] === max_version);
    if (!max_version_match) {
      const info = t`Failed to get changelog`;
      toastr.error(info, t`Tavern Helper`);
      throw new Error(info);
    }
    start_index = max_version_match.index;

    const next_version_match = matches.find(match => match.index > start_index);
    end_index = next_version_match ? next_version_match.index : changelog.length;
  } else {
    const min_version_match = matches.find(match => match[1] === min_version);
    if (!min_version_match) {
      const info = t`Could not find changelog for version '${min_version}'`;
      toastr.error(info, t`Tavern Helper`);
      throw new Error(info);
    }
    start_index = min_version_match.index;

    const max_version_match = matches.find(match => match[1] === max_version);
    if (!max_version_match) {
      const info = t`Could not find changelog for version '${max_version}'`;
      toastr.error(info, t`Tavern Helper`);
      throw new Error(info);
    }
    end_index = max_version_match.index;
  }

  return changelog.substring(start_index, end_index).trim();
}

export async function getChangelogHtml(): Promise<string> {
  return renderMarkdown(await getChangelogBetween(getTavernHelperVersion(), await getLatestVersion()));
}

export async function update() {
  const reload = () => {
    toastr.success(t`Tavern Helper updated successfully. Preparing to refresh the page to take effect...`, t`Tavern Helper`);
    setTimeout(() => location.reload(), 3000);
  };

  const extension_id = getTavernHelperExtensionId();

  toastr.info(t`Updating Tavern Helper...`, t`Tavern Helper`);
  const update_response = await updateExtension(extension_id);
  if (update_response.ok) {
    if ((await update_response.json()).isUpToDate) {
      toastr.success(t`Tavern Helper is already the latest version, no update needed`, t`Tavern Helper`);
    } else {
      reload();
    }
    return true;
  }
  const comfirm_reinstall = await callGenericPopup(
    t`Update failed: ${(await update_response.text()) || update_response.statusText}` +
      '\n' +
      t`Would you like to try updating by uninstalling and reinstalling? (In case the reinstallation fails due to network issues, please copy \`https://gitlab.com/novi028/JS-Slash-Runner\` first)`,
    POPUP_TYPE.CONFIRM,
  );
  if (!comfirm_reinstall) {
    return;
  }

  toastr.info(t`Uninstalling and reinstalling Tavern Helper...`, t`Tavern Helper`);
  const reinstall_response = await reinstallExtension(extension_id);
  if (!reinstall_response.ok) {
    const text = await reinstall_response.text();
    toastr.error(text || reinstall_response.statusText, t`Failed to update Tavern Helper`, { timeOut: 5000 });
    return false;
  }

  reload();
  return true;
}
