import { jest } from '@jest/globals';

// Mocks for electron APIs
const sendMock = jest.fn();
const onMock = jest.fn();
const onceMock = jest.fn();
const removeListenerMock = jest.fn();
const exposeInMainWorldMock = jest.fn();

jest.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: exposeInMainWorldMock,
  },
  ipcRenderer: {
    send: sendMock,
    on: onMock,
    once: onceMock,
    removeListener: removeListenerMock,
  },
}));

describe('preload', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Re-import to re-run the preload script with fresh mocks
    jest.resetModules();
    await import('../../main/preload');
  });

  it('should expose the ipcBridge API in the main world', () => {
    expect(exposeInMainWorldMock).toHaveBeenCalledWith(
      'electron',
      expect.objectContaining({
        ipcBridge: expect.any(Object),
      })
    );
  });

  it('should call ipcRenderer.send when sendMessage is used', () => {
    const [[, api]] = exposeInMainWorldMock.mock.calls as any;
    api.ipcBridge.sendMessage('ipc-example', ['foo', 'bar']);
    expect(sendMock).toHaveBeenCalledWith('ipc-example', ['foo', 'bar']);
  });

  it('should call ipcRenderer.on and return a remover when on is used', () => {
    const [[, api]] = exposeInMainWorldMock.mock.calls as any;
    const handler = jest.fn();
    const remover = api.ipcBridge.on('ipc-example', handler);
    expect(onMock).toHaveBeenCalledWith('ipc-example', expect.any(Function));
    expect(typeof remover).toBe('function');
  });

  it('should call ipcRenderer.once when once is used', () => {
    const [[, api]] = exposeInMainWorldMock.mock.calls as any;
    const handler = jest.fn();
    api.ipcBridge.once('ipc-example', handler);
    expect(onceMock).toHaveBeenCalledWith('ipc-example', expect.any(Function));
  });

  it('should call ipcRenderer.removeListener when removeListener is used', () => {
    const [[, api]] = exposeInMainWorldMock.mock.calls as any;
    const handler = jest.fn();
    api.ipcBridge.removeListener('ipc-example', handler);
    expect(removeListenerMock).toHaveBeenCalledWith('ipc-example', handler);
  });
});
