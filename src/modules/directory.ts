import * as vscode from 'vscode';
import { ENV } from '../ENV';
import { Utils } from '../misc/utils';

export const Directory = () =>{
    let root: string | undefined = undefined
    const getRoot = () => { return root }
    const initRoot = () => {
        const active = Utils.getActivePath()
        if (!active) { return undefined }
        const lengthOfENV = ENV.styleguideRoot.length
        const index = active.indexOf(`\\${ENV.styleguideRoot}`)
        root = active.substring(0, index + lengthOfENV + 1)
    }

    return {
        getRoot,
        initRoot
    }
}