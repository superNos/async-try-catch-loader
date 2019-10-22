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


const code1 = `
<div id="app-5">
  <p>{{ message }}</p>
  <button v-on:click="reverseMessage">反转消息</button>
</div>
var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
})


`

console.log(loader(code1))