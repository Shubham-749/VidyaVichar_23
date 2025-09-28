
let ioInstance = null;

export function initSocket(server) {}

export function getIo() {
  if (!ioInstance) throw new Error("Socket not initialized");
  return ioInstance;
}
