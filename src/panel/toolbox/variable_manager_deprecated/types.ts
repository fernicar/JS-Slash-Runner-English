import type { InjectionKey, Ref } from 'vue';

export const rootVariableTypes = ['string', 'number', 'boolean', 'array', 'object', 'null'] as const;
export type RootVariableType = (typeof rootVariableTypes)[number];

export const rootVariableKeySchema = z.string().trim().min(1, 'Key name cannot be empty');

export interface RootVariablePayload {
  key: string;
  type: RootVariableType;
  value: unknown;
}

/** Tree selection context interface */
export interface TreeSelectionContext {
  /** Currently selected path, saving keys or indices in hierarchical order */
  selectedPath: Ref<(string | number)[] | null>;
  /** Path fragments for breadcrumb display (string format ） */
  selectedSegments: Ref<string[]>;
  /** JavaScript access path corresponding to currently selected node */
  selectedJsPath: Ref<string>;
  /** Trigger path selection */
  selectPath: (path: (string | number)[]) => void;
}

export const treeSelectionKey: InjectionKey<TreeSelectionContext> = Symbol('TreeSelectionContext');

/** Global collapse control context provided for tree component */
export interface TreeControlContext {
  collapseAllSignal: Ref<number>;
  expandAllSignal: Ref<number>;
  lastAction: Ref<'collapse' | 'expand' | null>;
}

export const treeControlKey: InjectionKey<TreeControlContext> = Symbol('TreeControlContext');
