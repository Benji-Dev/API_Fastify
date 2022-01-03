import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

/**
 *
 * @param { { id: string } } payload
 * @param { import('jsonwebtoken').SignOptions } options
 * @returns { Promise<string> }
 */
function getJWT(payload, options) {
    return new Promise((resolve, reject) => {
        jsonwebtoken.sign(payload, process.env.JWT_SECRET, options, (err, jwt) => {
            if (err) return reject(err)
            return resolve(jwt)
        })
    })
}

/**
 * @type { import('fastify').FastifyPluginCallback }
 */
export async function authRoutes(app) {
    app.post(
        '/signup', {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                    required: ['email', 'password'],
                    additionalProperties: false,
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            success: { type: 'boolean' },
                        },
                        required: ['id', 'success'],
                    },
                },
            },
            preValidation: [app.checkNotAuthenticated],
        },
        async(req, reply) => {
            const { body } = req
            const { supabase } = app

            const email = body.email.toLowerCase()

            const found = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single()

            if (found.data) {
                return reply.code(400).send(new Error('Email already exists'))
            }

            const { data, error } = await supabase
                .from('users_blog')
                .insert({
                    email,
                    password: await bcrypt.hash(body.password, 10),
                })
                .single()

            if (error) {
                return reply.code(500).send(new Error(error.message))
            }

            return reply.send({ id: data.id, success: true })
        },
    )

    app.post(
        '/signin', {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                    required: ['email', 'password'],
                    additionalProperties: false,
                },
                reponse: {
                    200: {
                        type: 'object',
                        properties: {
                            jwt: { type: 'string' },
                        },
                        required: ['jwt'],
                    },
                },
            },
            preValidation: [app.checkNotAuthenticated],
        },
        async(req, reply) => {
            const { body } = req
            const { supabase } = app

            const user = await supabase
                .from('users_blog')
                .select('id, password')
                .eq('email', body.email.toLowerCase())
                .single()

            if (!user.data) {
                return reply.code(404).send(new Error('User not found'))
            }

            const passwordIsValid = await bcrypt.compare(
                body.password,
                user.data.password,
            )

            if (!passwordIsValid) {
                return reply.code(404).send(new Error('User not found'))
            }

            return reply.send({
                jwt: await getJWT({ id: user.data.id }, { expiresIn: '48h' }),
            })
        },
    )
}