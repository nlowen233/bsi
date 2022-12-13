import * as vscode from 'vscode';
import { BSIError } from '../misc/types';

export const WorkspaceListener = () => {
    let subscription : vscode.Disposable|undefined = undefined
    const sub = (onHandlebarsFileOpened: () => void) : BSIError => {
        if(!!subscription){
            return({
                err: true,
                message: 'Already subscribed'
            })
        }
        subscription = vscode.window.onDidChangeActiveTextEditor(ev => {
            if (ev?.document.languageId==='handlebars') {
                onHandlebarsFileOpened()
            }
        })
        return({
            err: false
        })
    }
    const unsub = () => {
        subscription?.dispose()
    }
    return {
        sub,
        unsub
    }
}