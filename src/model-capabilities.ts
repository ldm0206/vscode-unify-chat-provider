import type { ModelCapabilities, ModelEditTool } from './types';

export const MODEL_EDIT_TOOLS = [
  'find-replace',
  'multi-find-replace',
  'apply-patch',
  'code-rewrite',
] as const satisfies readonly ModelEditTool[];

const MODEL_EDIT_TOOL_VSCODE_MAP: Record<ModelEditTool, ModelEditTool[]> = {
  'find-replace': ['find-replace'],
  'multi-find-replace': ['find-replace', 'multi-find-replace'],
  'apply-patch': ['apply-patch'],
  'code-rewrite': ['code-rewrite'],
};

export function isModelEditTool(value: unknown): value is ModelEditTool {
  return (
    typeof value === 'string' &&
    MODEL_EDIT_TOOLS.some((editTool) => editTool === value)
  );
}

export function normalizeModelEditTool(
  editTool: unknown,
): ModelEditTool | undefined {
  return isModelEditTool(editTool) ? editTool : undefined;
}

export function normalizeConfiguredModelCapabilities(
  capabilities: unknown,
): ModelCapabilities | undefined {
  if (
    !capabilities ||
    typeof capabilities !== 'object' ||
    Array.isArray(capabilities)
  ) {
    return undefined;
  }

  const record = capabilities as Record<string, unknown>;
  const normalized: ModelCapabilities = {};

  const toolCalling = record['toolCalling'];
  if (
    typeof toolCalling === 'boolean' ||
    (typeof toolCalling === 'number' &&
      Number.isFinite(toolCalling) &&
      Number.isInteger(toolCalling))
  ) {
    normalized.toolCalling = toolCalling;
  }

  const imageInput = record['imageInput'];
  if (typeof imageInput === 'boolean') {
    normalized.imageInput = imageInput;
  }

  const editTools = normalizeModelEditTool(record['editTools']);
  if (editTools !== undefined) {
    normalized.editTools = editTools;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function normalizeComparableModelCapabilities(
  capabilities: ModelCapabilities | undefined,
): ModelCapabilities {
  const normalized: ModelCapabilities = {
    toolCalling: capabilities?.toolCalling ?? false,
    imageInput: capabilities?.imageInput ?? false,
  };

  const editTools = capabilities?.editTools;
  if (editTools !== undefined) {
    normalized.editTools = editTools;
  }

  return normalized;
}

export function mergeModelCapabilities(
  base: ModelCapabilities | undefined,
  override: ModelCapabilities | undefined,
): ModelCapabilities | undefined {
  const merged: ModelCapabilities = {};

  const toolCalling =
    override?.toolCalling !== undefined
      ? override.toolCalling
      : base?.toolCalling;
  if (toolCalling !== undefined) {
    merged.toolCalling = toolCalling;
  }

  const imageInput =
    override?.imageInput !== undefined
      ? override.imageInput
      : base?.imageInput;
  if (imageInput !== undefined) {
    merged.imageInput = imageInput;
  }

  const editTools =
    override?.editTools !== undefined ? override.editTools : base?.editTools;
  if (editTools !== undefined) {
    merged.editTools = editTools;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function resolveConfiguredEditToolsForVsCode(
  editTool: ModelEditTool | undefined,
): ModelEditTool[] | undefined {
  if (editTool === undefined) {
    return undefined;
  }

  return MODEL_EDIT_TOOL_VSCODE_MAP[editTool];
}
