import * as vscode from 'vscode';
import { BSIError, PossibleArray, Primitive } from '../misc/types';
import { Utils } from '../misc/utils';

export const CompletionSubscriber = (root: string) => {
    let dictionary: Record<string, any> | undefined = undefined
    let subscription: vscode.Disposable | undefined = undefined

    const provideCompletionItems = async (doc: vscode.TextDocument, pos: vscode.Position, tok: vscode.CancellationToken): Promise<vscode.CompletionItem[]> => {
        const currentWord = getCurrentWord(doc.lineAt(pos).text, pos.character)
        const filteredDictionary = searchDictionary(dictionary as Record<string, any>, currentWord)
        return filteredDictionary.map(toCompletionItem)
    }

    const sub = async (): Promise<BSIError> => {
        unsub()
        dictionary = await Utils.getStandardizedActiveJSON(root)
        if (!!dictionary) {
            subscription = vscode.languages.registerCompletionItemProvider(['handlebars'], { provideCompletionItems }, '.')
            return ({
                err: false
            })
        } else {
            return ({
                err: true,
                message: 'Error creating variable tree for active .hbs file'
            })
        }
    }

    const unsub = () => {
        dictionary = undefined
        subscription?.dispose()
        subscription = undefined
    }

    return {
        sub,
        unsub
    }
}

const searchDictionary = (dictionary: Record<string, any>, term?: string): Record<string, any>[] => {
    const keys = Object.keys(dictionary)
    return keys.flatMap(key => {
        const node = dictionary[key]
        if (!term || key.includes(term)) {
            return [{ [key]: node }]
        } else {
            return []
        }
    })
}

const getCurrentWord = (line: string, pos: number) => {
    const upToPos = line.substring(0, pos + 1)
    const length = upToPos.length
    let range = 0
    for (let i = length - 1; i > 0; i--) {
        const char = upToPos[i]
        if (char.match(/[\w]/)) {
            range++
        } else {
            break
        }
    }
    return upToPos.substring(length - range)
}

const toCompletionItem = (record: Record<string, any>): vscode.CompletionItem => ({
    label: Object.keys(record)[0],
    kind: vscode.CompletionItemKind.Variable,
    documentation: createMarkdown(record)
})

const createMarkdown = (record: Record<string, any>): vscode.MarkdownString => {
    const key = Object.keys(record)[0]
    const value = record[key]
    const type = typeof value
    return new vscode.MarkdownString(`.hbs variable of type: *${type}*\n\ntemplate value: ${createValueMarkdown(value)}`)
}

const createValueMarkdown = (value: PossibleArray<Primitive | Record<string, any>>): string => {
    if (Array.isArray(value)) {
        return `**array of length ${value.length}**`
    } else if (!!value && typeof value === 'object') {
        return `**object with keys (${createKeyList(value)})**`
    } else if (value === "") {
        return ""
    } else {
        return `*${value}*`
    }
}

const createKeyList = (obj: Record<string, any>) => {
    const keys = Object.keys(obj)
    if (keys.length > 4) {
        return keys.slice(0, 4).join(', ') + ', etc...'
    } else {
        return keys.join(', ')
    }
}