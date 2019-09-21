const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const core = require('@babel/core')
const loaderUtils = require('loader-utils')

const defaultOps = {
    catchCode: identifier => `console.error(${identifier})`,
    identifier: "e",
    finallyCode: null
}
const isAsyncExpression = (node) => {
    const ops = { async: true }
    return t.isArrowFunctionExpression(node, ops) ||
    t.isFunctionDeclaration(node, ops) ||
    t.isFunctionExpression(node, ops) ||
    t.isObjectMethod(node, ops)
}

module.exports = function (code) {
    let options = loaderUtils.getOptions(this)
    options = { ...defaultOps, ...options }

    if (typeof options.catchCode === "function") {
        options.catchCode = options.catchCode(options.identifier);
    }
    let catchNode = parser.parse(options.catchCode).program.body;
    let finallyNode = options.finallyCode && parser.parse(options.finallyCode).program.body;

    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['dynamicImport']
    })

    traverse(ast, {
        AwaitExpression(path) {
            while(path && path.node) {
                let parent = path.parentPath
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
                    return;
                } else if(t.isBlockStatement(path.node) && t.isTryStatement(parent.node)) {
                    return;
                }
                path = parent
            }
        }
    })

    let result = core.transformFromAstSync(ast, null, {
        configFile: false
    }).code

    return result
}

