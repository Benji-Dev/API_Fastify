import fp from 'fastify-plugin'
import jsonwebtoken from 'jsonwebtoken'

function jwt(fastify, options, next) {
    const { secretKey } = options
    if (!secretKey) return next(new Error('Missing JWT secret key'))

    function verify(token) {
        return new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return reject(err)
                return resolve(decoded)
            })
        })
    }

    fastify.addHook('onRequest', async function(req, reply) {
        const token = req.headers.authorization
        try {
            const user = await verify(token)
            if (user) {
                req.user = { id: user.id }
            }
        } catch (err) {
            /* silent error */
        }
    })

    fastify.decorate('authenticate', async function(req, reply) {
        if (!req.user) {
            reply.code(401).send({ error: 'Invalid user' })
        }
    })

    fastify.decorate('checkNotAuthenticated', async function(req, reply) {
        const token = req.headers.authorization
        if (token) {
            reply.code(401).send({ error: 'Unexpected authorization header' })
        }
    })

    next()
}

export const jwtPlugin = fp(jwt, { name: 'jwt' })