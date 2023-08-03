class WarningManager {
  messages: string[] = [];

  hasMessages() {
    return !!this.messages.length;
  }

  getMessages() {
    return this.messages;
  }

  addMessage(message: string) {
    this.messages.push(message);
  }

  clear() {
    this.messages = [];
  }
}

let warningManager: WarningManager;

export default function getWarningManager() {
  if (!warningManager) {
    warningManager = new WarningManager();
  }
  return warningManager;
}
