import { useMessageIframeRuntimesStore, useScriptIframeRuntimesStore } from '@/store/iframe_runtimes';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null;
export function useListener(
  enabled: Readonly<Ref<boolean>>,
  enabled_echo: Readonly<Ref<boolean>>,
  url: Readonly<Ref<string>>,
  duration: Readonly<Ref<number>>,
): Ref<boolean> {
  const refreshMessageDebounced = useDebounceFn(() => {
    useMessageIframeRuntimesStore().reloadAll();
  }, duration);
  const refreshScriptDebounced = useDebounceFn(() => {
    useScriptIframeRuntimesStore().reloadAll();
  }, duration);
  const refreshAllDebounced = () => {
    refreshMessageDebounced();
    refreshScriptDebounced();
  };

  const connected = ref(false);

  watchEffect(() => {
    if (socket) {
      socket.close();
      socket = null;
      connected.value = false;
    }

    if (!enabled.value) {
      return;
    }

    socket = io(url.value, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.info('[Listener] Successfully connected to server');
      connected.value = true;
    });

    socket.on('connect_error', (error: Error) => {
      if (enabled_echo.value) {
        toastr.error(t`${error.name}: ${error.message}`, t`[Tavern Assistant] Error connecting to live listener, attempting to reconnect...`);
      }
      console.error(`${error.name}: ${error.message}${error.stack ?? ''}`);
      connected.value = socket?.connected ?? false;
    });
    socket.on('disconnect', (reason, details) => {
      if (enabled_echo.value) {
        toastr.warning(t`${reason}`, t`[Tavern Assistant] Live listener disconnected`);
      }
      console.info(`[Listener] Disconnected from server: ${reason}\n${details}`);
      connected.value = socket?.connected ?? false;
    });

    socket.on('iframe_updated', () => refreshAllDebounced());
    socket.on('script_iframe_updated', () => refreshScriptDebounced());
    socket.on('message_iframe_updated', () => refreshMessageDebounced());
  });

  return connected;
}
