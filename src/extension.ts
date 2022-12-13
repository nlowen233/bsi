import * as vscode from 'vscode';
import { CompletionSubscriber } from './completion/completionSubscriber';
import { Directory } from './modules/directory';
import { WorkspaceListener } from './modules/workspaceListener';

export function activate(context: vscode.ExtensionContext) {
	const directory = Directory()
	directory.initRoot()
	const root = directory.getRoot()
	if(!root){
		return vscode.window.showErrorMessage('Could not get root directory')
	}
	const completionSubscriber = CompletionSubscriber(root)
	const wsListener = WorkspaceListener()
	const attemptCompletionSubscribe =async () =>{
		const res = await completionSubscriber.sub()
		if(res.err){
			vscode.window.showErrorMessage(res.message as string)
		}
	}
	wsListener.sub(attemptCompletionSubscribe)
	attemptCompletionSubscribe()
}

export function deactivate() { }
