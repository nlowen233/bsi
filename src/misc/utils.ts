import * as vscode from 'vscode';
import { Directory } from '../modules/directory';
import { ENV } from '../ENV';
import { StringUtils } from './stringUtils';
import { PossibleArray, Primitive } from './types';

const getActivePath = () => {
    return vscode.window.activeTextEditor?.document.fileName
}

const deriveFileName = (path?: string) => {
    if (!path) { return undefined }
    const index = path.lastIndexOf('\\')
    return path.substring(index + 1)
}

const deriveActiveJSONURI = async () => {
    const fileName = deriveFileName(getActivePath())
    const path = getActivePath()
    if (!path || !fileName) { return undefined }
    const name = fileName.substring(0, fileName.lastIndexOf('.'))
    const JSONPath = [...path].join('').replace(fileName, `${name}.json`)
    let uri: vscode.Uri | undefined
    try {
        uri = vscode.Uri.file(JSONPath)
    } catch (e) { }
    return uri
}

const getActiveJSON = async () => {
    const uri = await deriveActiveJSONURI()
    if (!uri) { return undefined }
    const file = await vscode.workspace.fs.readFile(uri)
    const rawJSON = Buffer.from(file).toString()
    let formedJSON: undefined | JSON = undefined
    try {
        formedJSON = JSON.parse(rawJSON)
    } catch (e) { }
    return formedJSON
}

const getFullPathFromRelative = (path?: string,root?:string) => {
    if (!path||!root) { return undefined }
    const standardized = StringUtils.flipSlashes(path)
    return `${root}${standardized}`
}

const getURIFromPath = async (path?: string) => {
    if (!path) { return undefined }
    let uri: vscode.Uri | undefined
    try {
        uri = vscode.Uri.file(path)
    } catch (e) { }
    return uri
}

const getJSONFromURI = async (uri: vscode.Uri | undefined) => {
    if (!uri) { return undefined }
    const file = await vscode.workspace.fs.readFile(uri)
    const rawJSON = Buffer.from(file).toString()
    let formedJSON: undefined | Record<string, any> = undefined
    try {
        formedJSON = JSON.parse(rawJSON)
    } catch (e) { }
    return formedJSON
}

const getJSONFromRelativePath = async (path?: string,root?:string) => {
    if (!path) { return undefined }
    const full = getFullPathFromRelative(path,root)
    if (!full) { return undefined }
    const uri = await getURIFromPath(full)
    if (!uri) { return undefined }
    return await getJSONFromURI(uri)
}

const standardizeJSON = async (param: Record<any, any>,root?:string): Promise<Record<any, any>> => {
    let newJSON = {}
    for (let key in param) {
        const node = param[key]
        if (key === '_include') {
            if (typeof node === 'string') {
                const json = await getJSONFromRelativePath(node,root)
                if (!!json) {
                    const includedJSON = await standardizeJSON(json,root)
                    newJSON = { ...newJSON, ...includedJSON }
                }
            }
        } else if (Array.isArray(node)) {
            let newArr: any[] = []
            for (let sub of node) {
                if (!!sub && typeof sub === 'object') {
                    const includedJSON = await standardizeJSON(node,root)
                    newArr = [...newArr, includedJSON]
                }
                else {
                    newArr = [...newArr, sub]
                }
            }
            newJSON = { ...newJSON, [key]: newArr }
        } else if (!!node && typeof node === 'object') {
            const includedJSON = await standardizeJSON(node,root)
            newJSON = { ...newJSON, [key]: includedJSON }
        } else if (key[0] !== '_') {
            newJSON = { ...newJSON, [key]: node }
        }
    }
    return newJSON
}

const getStandardizedActiveJSON = async (root?:string) => {
    if(!root) {return undefined}
    const active = await getActiveJSON()
    if (!active) { return undefined }
    return await standardizeJSON(active,root)
}

export const Utils = {
    getActivePath,
    deriveFileName,
    deriveActiveJSONURI,
    getActiveJSON,
    getFullPathFromRelative,
    getURIFromPath,
    getJSONFromURI,
    getJSONFromRelativePath,
    getStandardizedActiveJSON,
    standardizeJSON
}