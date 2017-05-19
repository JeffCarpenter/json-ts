import * as ts from 'typescript';

export interface ParsedNode {
    kind: ts.SyntaxKind
    _kind: string
    name?: string
    value?: any
    body?: ParsedNode[]
}

function walk(sourceFile: ts.SourceFile): ParsedNode[] {

    const stack : Array<ParsedNode> = [];
    const elementStack : Array<ParsedNode> = [];

    function push(element) {
        const parent = elementStack[elementStack.length - 1];
        const siblings = (parent && parent.body) ? parent.body : stack;
        siblings.push(element);
    }

    eachProp(sourceFile);

    return stack;

    function addFromArrayElement(incoming) {
        switch(incoming.kind) {
            case ts.SyntaxKind.NullKeyword: {
                const elem = {
                    kind: ts.SyntaxKind.NullKeyword,
                    _kind: `NullKeyword`,
                    name: incoming.text,
                    value: incoming.text,
                };
                push(elem);
                break;
            }
            case ts.SyntaxKind.TrueKeyword: {
                const elem = {
                    kind: ts.SyntaxKind.TrueKeyword,
                    _kind: `TrueKeyword`,
                    name: incoming.text,
                    value: incoming.text,
                };
                push(elem);
                break;
            }
            case ts.SyntaxKind.FalseKeyword: {
                const elem = {
                    kind: ts.SyntaxKind.FalseKeyword,
                    _kind: `FalseKeyword`,
                    name: incoming.text,
                    value: incoming.text,
                };
                push(elem);
                break;
            }
            case ts.SyntaxKind.NumericLiteral: {
                const elem = {
                    kind: ts.SyntaxKind.NumericLiteral,
                    _kind: `NumericLiteral`,
                    name: incoming.text,
                    value: incoming.text,
                };
                push(elem);
                break;
            }
            case ts.SyntaxKind.StringLiteral: {
                const elem = {
                    kind: ts.SyntaxKind.StringLiteral,
                    _kind: `StringLiteral`,
                    name: incoming.text,
                    value: incoming.text,
                };
                push(elem);
                // console.log(incoming);
                break;
            }
            case ts.SyntaxKind.ObjectLiteralExpression: {
                const elem = {
                    kind: ts.SyntaxKind.ObjectLiteralExpression,
                    _kind: `ObjectLiteralExpression`,
                    body: [],
                };
                push(elem);
                elementStack.push(elem);
                eachProp(incoming.properties);
                elementStack.pop();
                break;
            }
            case ts.SyntaxKind.ArrayLiteralExpression: {
                const elem = {
                    kind: ts.SyntaxKind.ArrayLiteralExpression,
                    _kind: `ArrayLiteralExpression`,
                    body: [],
                };
                push(elem);
                elementStack.push(elem);
                eachProp(incoming.elements);
                elementStack.pop();
                break;
            }
        }
    }

    function literalTypeFromProp(prop, kind) {
        return {
            name: prop.name.text,
            value: prop.initializer.text,
            kind: kind,
        }
    }

    function eachProp(properties) {
        properties.forEach(function (prop) {
            if (!prop.initializer) {
                return addFromArrayElement(prop);
            } else {
                switch (prop.initializer.kind) {
                    case ts.SyntaxKind.TrueKeyword: {
                        push(literalTypeFromProp(prop, ts.SyntaxKind.TrueKeyword));
                        break;
                    }
                    case ts.SyntaxKind.FalseKeyword: {
                        push(literalTypeFromProp(prop, ts.SyntaxKind.FalseKeyword));
                        break;
                    }
                    case ts.SyntaxKind.NullKeyword: {
                        push(literalTypeFromProp(prop, ts.SyntaxKind.NullKeyword));
                        break;
                    }
                    case ts.SyntaxKind.StringLiteral: {
                        push(literalTypeFromProp(prop, ts.SyntaxKind.StringLiteral));
                        break;
                    }
                    case ts.SyntaxKind.NumericLiteral: {
                        push(literalTypeFromProp(prop, ts.SyntaxKind.NumericLiteral));
                        break;
                    }
                    case ts.SyntaxKind.ObjectLiteralExpression: {
                        // console.log('OBJ', prop.name.text);
                        const elem = {
                            name: prop.name.text,
                            body: [],
                            kind: ts.SyntaxKind.ObjectLiteralExpression,
                            _kind: `ObjectLiteralExpression`
                        };
                        push(elem);
                        elementStack.push(elem);
                        eachProp(prop.initializer.properties);
                        elementStack.pop();
                        break;
                    }
                    case ts.SyntaxKind.ArrayLiteralExpression: {
                        const elem = {
                            name: prop.name.text,
                            body: [],
                            kind: ts.SyntaxKind.ArrayLiteralExpression,
                            _kind: `ArrayLiteralExpression`
                        };
                        push(elem);
                        elementStack.push(elem);
                        eachProp(prop.initializer.elements);
                        elementStack.pop();
                        break;
                    }
                }
            }
        });
    }
}

export function parse(string): any[] {
    const input = `const ROOTOBJ = ${string}`;
    let sourceFile : ts.SourceFile = ts.createSourceFile('json.ts', input, ts.ScriptTarget.ES2015, /*setParentNodes */ true);
    // delint it
    const _json = sourceFile.statements[0] as any;
    // console.log(sourceFile.statements[0].declarationList.declarations[0].initializer.properties);
    // elementStack.push({name: 'root', body: []});
    const stack = walk(_json.declarationList.declarations[0].initializer.properties);
    return stack;
}