import * as vscode from "vscode";

import { WebViewProvider } from "./WebViewProvider";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "boid.webview",
      new WebViewProvider(context.extensionUri)
    )
	);
}
