const loader = require('../src')

const code = `
    async function test() {
        let a = await new Promise()
    }
`
console.log(loader(code))