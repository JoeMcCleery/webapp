import nunjucks from "nunjucks"

nunjucks.configure(__dirname + "/views")

export const render = nunjucks.render
