const loader = require('../src')

const code = `
    async function test() {
        let a = await new Promise()
    }

    const fn = async function(n) {
        let a = void 0
        a = await new Promise()
        console.log(a)
    }

    const fn1 = async (n) => {
        let a = void 0
        a = await new Promise()
        console.log(a)
    }

    let obj = {
        async fn() {
            let a = await new Promise()
        }
    }

    class cls{
        async fn() {
            let a = await new Promise()
        }
    }
`

console.log(loader(code))