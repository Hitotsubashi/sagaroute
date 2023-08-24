import * as path from 'path';
import { ExtensionContext } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
let client: LanguageClient;

export function initClient(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascriptreact' },
      { scheme: 'file', language: 'typescriptreact' },
    ],
  };

  client = new LanguageClient('languageServer', 'Language Server', serverOptions, clientOptions);
  client.start();
}

export function stopClient() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

export function getClient() {
  if (!client) {
    throw new Error('client is not init yet.');
  }
  return client;
}
