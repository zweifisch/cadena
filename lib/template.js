const assert = require('assert')

module.exports = class Template {

    constructor (template) {
        assert(template, "Template is empty")
        this.template = template
        this.tokens = []
        this.types = []
        let token = ''
        let type = 0  // 0 for static content, 1 for variable
        let escape = false
        for (let i = 0; i < this.template.length; i++) {
            let char = this.template.charAt(i)
            if (escape) {
                escape = false
                token += char
            } else if ('\\' === char) {
                escape = true
            } else if ('{' === char) {
                assert(type !== 1, `Unclosed curly brackets in '${this.template}'`)
                if (token) {
                    this.tokens.push(token)
                    this.types.push(type)
                }
                token = ''
                type = 1
            } else if ('}' === char) {
                assert(type !== 0, `Unmatched curly brackets '${this.template}'`)
                if (token) {
                    this.tokens.push(token)
                    this.types.push(type)
                }
                token = ''
                type = 0
            } else {
                token += char
            }
        }
        if (token) {
            this.tokens.push(token)
            this.types.push(type)
        }
        assert(type !== 1, `unclosed curly brackets '${this.template}'`)
        this.len = this.types.length
    }

    render (vars) {
        let ret = ''
        for (let i = 0; i < this.len; i ++) {
            if (this.types[i] === 0)
                ret += this.tokens[i]
            else {
                if (vars && this.tokens[i] in vars)
                    ret += vars[this.tokens[i]]
                else
                    throw new Error(`var '${this.tokens[i]}' missing, required in '${this.template}'`)
            }
        }
        return ret
    }
}
