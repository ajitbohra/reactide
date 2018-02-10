import * as EventEmitter from 'events';
import { ipcRenderer } from 'electron';

const EditorEvents = new EventEmitter();
let _plugins: {[name: string]: ReactIDE.Plugin} = {};
let _fileTypes: {match: RegExp, type: string}[] = [];
let _completionProvider: ReactIDE.CompletionProvider;

type EditorEvent = "open" | "close" | "focus" | "save";


export namespace ReactIDE {
    export class Editor {
        static open(filePath: string) {
            EditorEvents.emit('open', filePath);
        }
        static saveAll() {
            EditorEvents.emit('save');
        }
        static close(filePath: string) {
            EditorEvents.emit('close', filePath);
        }
        static focus(filePath: string | boolean) {
            EditorEvents.emit('focus', filePath);
        }
        static externalChange(type: string, file: string): void {
            EditorEvents.emit('externalChange', type, file);
        }
        static on(name: EditorEvent, cb: (...data: any[]) => void) {
            EditorEvents.on(name, cb);
        }
        static once(...args) {
            EditorEvents.once.apply(this, arguments);
        }
    }
    export class Plugin {
        onLoad() {
            throw new Error("Not Implemented");
        }
        onUnload() {
            throw new Error("Not Implemented");
        }
    }
    export class Plugins {
        static load(name: string) {
            _plugins[name] = new (require('./plugins/'+name).default)();
            _plugins[name].onLoad();
        }
        static unload(name: string) {
            _plugins[name].onUnload();
        }
        static plugins(): {[name: string]: ReactIDE.Plugin} {
            return _plugins;
        }
    }
    export class FileTypes {
        static add(match: RegExp, type: string) {
            _fileTypes.push({
                match,
                type
            });
        }
        static remove(match: RegExp, type: string) {
            let i = _fileTypes.findIndex((fileType) => fileType.match == match && fileType.type == type);
            _fileTypes.splice(i, 1);
        }
        static getForFile(fileName: string) {
            var match = _fileTypes.find((fileType) => {
                return fileType.match.test(fileName);
            })
            return (match && match.type) || 'text/plain';
        }
    }
    export interface Completion {

    }
    export interface CompletionProvider {
        loadFile(file: string): boolean;
        getAtCursor(cur: CodeMirror.Position, file: string, cb: (list: string[]) => void);
    }
    export class CompletionProviders {
        static add(provider: CompletionProvider) {
            _completionProvider = provider;
        }
        static remove(provider: CompletionProvider) {
            _completionProvider = null;
        }
        static get() {
            return _completionProvider;
        }
    }
}

ipcRenderer.on('open', () => {
    EditorEvents.emit('open');
});

ipcRenderer.on('save', () => {
    EditorEvents.emit('save');
});

ipcRenderer.on('close', () => {
    EditorEvents.emit('close');
});

ipcRenderer.on('goToFile', () => {
    alert('Go To File');
});

ipcRenderer.on('commandPalette', () => {
    alert("Command Palette");
});