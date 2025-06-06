import nunjucks from "nunjucks"

nunjucks.configure("views", {})

export const render = nunjucks.render
