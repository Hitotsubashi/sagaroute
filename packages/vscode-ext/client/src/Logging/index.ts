import { window } from 'vscode';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

class LoggingService {
  private outputChannel = window.createOutputChannel('Sagaroute');

  public show() {
    this.outputChannel.show();
  }

  public logObject(data: unknown): void {
    const message = JSON.stringify(
      data,
      function (k, v) {
        if (typeof v === 'function') {
          return 'fn';
        }
        return v;
      },
      2,
    );
    this.outputChannel.appendLine(message);
  }

  public logMessage(message: string, logLevel: LogLevel = 'INFO'): void {
    const title = new Date().toLocaleTimeString();
    this.outputChannel.appendLine(`["${logLevel}" - ${title}] ${message}`);
  }
}

let logging: LoggingService;

export default function getLogging() {
  if (!logging) {
    logging = new LoggingService();
  }
  return logging;
}
