import fastify from 'fastify'
import helmet from 'fastify-helmet'

import { jwtPlugin } from './plugins/jwt.js'
import { supabasePlugin } from './plugins/supabase.js'

import { routes } from './routes/index.js'
import { articlesRoutes } from './routes/articles.js'
import { categoriesRoutes } from './routes/categories.js'
import { authRoutes } from './routes/auth.js'


const { JWT_SECRET, SUPABASE_URL, SUPABASE_KEY } = process.env


/**
 * @param { import('fastify').FastifyServerOptions } options
 */
export function build(options = {}) {
    const app = fastify(options)
    app.server.setTimeout(1000)
    app.register(helmet)

    app.register(jwtPlugin, { secretKey: JWT_SECRET })
    app.register(supabasePlugin, {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
    })

    app.register(routes)
    app.register(articlesRoutes)
    app.register(categoriesRoutes)
    app.register(authRoutes)
    app.register(helmet)


    return app
}