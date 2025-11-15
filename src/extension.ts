import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentSelector = [
        { language: 'javascriptreact', scheme: 'file' },
        { language: 'typescriptreact', scheme: 'file' },
        { language: 'javascript', scheme: 'file' },
        { language: 'typescript', scheme: 'file' },
    ];

    const definitionProvider: vscode.DefinitionProvider = {
        provideDefinition(
            document: vscode.TextDocument,
            position: vscode.Position,
            _token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.Definition> {
            const range = document.getWordRangeAtPosition(
                position,
                /[-A-Za-z0-9_]+/
            );
            if (!range) {return;}

            const className = document.getText(range);

            const lineText = document.lineAt(position.line).text;
            const beforeWord = lineText.substring(0, range.start.character);

            if (!/\bclass(Name)?\s*=/.test(beforeWord)) {return;}

            return findCssClassLocation(className);
        }
    };

    // 2) Hover con el bloque CSS
    const hoverProvider: vscode.HoverProvider = {
        provideHover(
            document: vscode.TextDocument,
            position: vscode.Position,
            _token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.Hover> {
            const range = document.getWordRangeAtPosition(
                position,
                /[-A-Za-z0-9_]+/
            );
            if (!range) {return;}

            const className = document.getText(range);

            const lineText = document.lineAt(position.line).text;
            const beforeWord = lineText.substring(0, range.start.character);

            if (!/\bclass(Name)?\s*=/.test(beforeWord)) {return;}

            return createCssHover(className);
        }
    };

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(selector, definitionProvider),
        vscode.languages.registerHoverProvider(selector, hoverProvider)
    );

    console.log('React Sirius: definition + hover activos');
}

interface CssMatch {
    uri: vscode.Uri;
    line: number;
    character: number;
    lines: string[];
}

async function findCssClassMatch(className: string): Promise<CssMatch | undefined> {
    const regex = new RegExp('\\.' + escapeRegExp(className) + '\\b');
    const cssFiles = await vscode.workspace.findFiles('**/*.css', '**/node_modules/**');

    for (const uri of cssFiles) {
        const doc = await vscode.workspace.openTextDocument(uri);
        const text = doc.getText();
        const lines = text.split(/\r?\n/);

        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const lineText = lines[lineNumber];
            const match = regex.exec(lineText);
            if (match && match.index !== undefined) {
                const character = match.index + 1; // justo sobre el nombre de la clase
                return { uri, line: lineNumber, character, lines };
            }
        }
    }
    return;
}


async function findCssClassLocation(className: string): Promise<vscode.Location | undefined> {
    const match = await findCssClassMatch(className);
    if (!match) {return;}

    const position = new vscode.Position(match.line, match.character);
    return new vscode.Location(match.uri, position);
}


async function createCssHover(className: string): Promise<vscode.Hover | undefined> {
    const match = await findCssClassMatch(className);
    if (!match) {return;}

    const snippet = extractCssBlock(match.lines, match.line);

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**.${className}**\n\n`);
    md.appendCodeblock(snippet, 'css');

    return new vscode.Hover(md);
}


function extractCssBlock(lines: string[], startLine: number): string {
    let openBraces = 0;
    let endLine = startLine;

    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        const opens = (line.match(/{/g) || []).length;
        const closes = (line.match(/}/g) || []).length;

        openBraces += opens;
        openBraces -= closes;

        endLine = i;

        if (openBraces === 0 && i > startLine) {
            break;
        }
    }

    return lines.slice(startLine, endLine + 1).join('\n');
}


function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deactivate() {}
