const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const loaderUtils = require('loader-utils')
const recast = require('recast')
const babel = require('babel-core')

const plugins = [
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exportExtensions',
    'functionSent',
    'functionBind',
    'jsx',
    'objectRestSpread',
    'dynamicImport'
]

const defaultOps = {
    catchCode: identifier => `console.error(${identifier})`,
    identifier: 'e',
    finallyCode: null
}

const isAsyncExpression = (node) => {
    const ops = { async: true }
    return t.isArrowFunctionExpression(node, ops) ||
    t.isFunctionDeclaration(node, ops) ||
    t.isFunctionExpression(node, ops) ||
    t.isObjectMethod(node, ops) ||
    t.isClassMethod(node, ops)
}

module.exports = function (code) {
    try {
        let options = loaderUtils.getOptions(this)
        options = { ...defaultOps, ...options }
    
        if (typeof options.catchCode === 'function') {
            options.catchCode = options.catchCode(options.identifier)
        }
    
        const catchNode = babylon.parse(options.catchCode).program.body
        const finallyNode = options.finallyCode && babylon.parse(options.finallyCode).program.body
    
        const ast = babylon.parse(code, {
            sourceType: 'module',
            allowImportExportEverywhere: false,
            allowReturnOutsideFunction: false,
            tokens: false,
            plugins
        })
        
        traverse(ast, {
            AwaitExpression(path) {
                while(path && path.node) {
                    const parent = path.parentPath
                    if(t.isBlockStatement(path.node) && isAsyncExpression(parent.node)) {
                        const tryCatchAst = t.tryStatement(
                            path.node,
                            t.catchClause(
                                t.identifier(defaultOps.identifier),
                                t.blockStatement(catchNode)
                            ),
                            options.finallyCode && t.blockStatement(finallyNode)
                        )
                        path.replaceWithMultiple([tryCatchAst])
                        return
                    } else if(t.isBlockStatement(path.node) && t.isTryStatement(parent.node)) {
                        return
                    }
                    path = parent
                }
            }
        })

        const result =  babel.transformFromAst(ast, null, {
            parserOpts: {
                parser: recast.parse,
                plugins
            },
            generatorOpts: {
                generator: recast.print,
            },
            sourceMaps: false,
            babelrc: false
        }).code
        return result
    } catch (error) {
        console.log(error)
        return code
    }
}

