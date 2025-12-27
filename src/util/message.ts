import { chat } from '@sillytavern/script';

export function inMessageRange(message_id: number) {
  return _.inRange(message_id, 0, chat.length);
}

/**
 * Convert message_id to depth
 * - Depth 1 represents the latest floor
 * - Depth 2 represents second to last floor
 */
export function toMessageDepth(message_id: number) {
  return chat.length - message_id;
}
/**
 * Convert depth to message_id
 * - Depth 1 represents the latest floor
 * - Depth 2 represents second to last floor
 */
export function fromMessageDepth(depth: number) {
  return chat.length - depth;
}

/**
 * Convert message_id to backward index
 * - -1 Represents the latest floor
 * - -2 Represents second to last floor
 */
export function toBackwardMessageId(message_id: number) {
  return message_id - chat.length;
}
/**
 * Convert backward index to message_id
 * - -1 Represents the latest floor
 * - -2 Represents second to last floor
 */
export function fromBackwardMessageId(backward_message_id: number) {
  return chat.length + backward_message_id;
}
/**
 * Convert forward index or backward index to message_id
 * - Forward index: Normal message_id
 * - Backward index: -1 represents latest floor, -2 represents second to last floor
 */
export function normalizeMessageId(forward_or_backward_message_id: number) {
  return forward_or_backward_message_id < 0
    ? fromBackwardMessageId(forward_or_backward_message_id)
    : forward_or_backward_message_id;
}
export function inUnnormalizedMessageRange(forward_or_backward_message_id: number) {
  return _.inRange(forward_or_backward_message_id, -chat.length, chat.length);
}
