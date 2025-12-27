import { processImageArrayDirectly, processUserInput, setupImageArrayProcessing } from '@/function/generate/utils';
import { substituteParams } from '@sillytavern/script';

/**
 * User input processing result interface
 */
export interface ProcessedInputResult {
  processedUserInput: string;
  imageProcessingSetup?: ReturnType<typeof setupImageArrayProcessing>;
  processedImageArray?: { type: string; text?: string; image_url?: { url: string; detail: string } }[];
}

/**
 * The first step of processing user input
 * Includes preprocessing operations such as macro replacement, regex processing, etc.
 * @param user_input Original user input
 * @returns Processed user input
 */
export function processInitialUserInput(user_input = ''): string {
  // 1. Handle macro replacement
  const substitutedInput = substituteParams(user_input);

  // 2. Handle regex and other preprocessing
  const processedUserInput = processUserInput(substitutedInput) || '';

  return processedUserInput;
}

/**
 * Complete user input and image processing
 * Includes user input preprocessing and image array processing logic
 * @param user_input User input text
 * @param use_preset Whether to use presets
 * @param image Image parameters, can be a single image (File|string) or an image array (File|string)[]
 * @returns Processing result, containing processed user input and image processing related data
 */
export async function processUserInputWithImages(
  user_input = '',
  use_preset = true,
  image: File | string | (File | string)[] | undefined = undefined,
): Promise<ProcessedInputResult> {
  // 1. Process user input (regex, macros)
  let processedUserInput = processInitialUserInput(user_input);

  // Handle cases of potential image arrays
  let imageProcessingSetup: ReturnType<typeof setupImageArrayProcessing> | undefined = undefined;
  let processedImageArray: { type: string; text?: string; image_url?: { url: string; detail: string } }[] | undefined =
    undefined;

  if (Array.isArray(image) && image.length > 0) {
    if (use_preset) {
      // When using presets, use event listener method to process image array
      imageProcessingSetup = setupImageArrayProcessing(processedUserInput, image);
      processedUserInput = imageProcessingSetup.userInputWithMarker;
    } else {
      // When using raw mode, process image array directly
      processedImageArray = await processImageArrayDirectly(processedUserInput, image);
      // Keep original user input unchanged; the image array will be used directly in subsequent steps
    }
  }

  return {
    processedUserInput,
    imageProcessingSetup,
    processedImageArray,
  };
}
