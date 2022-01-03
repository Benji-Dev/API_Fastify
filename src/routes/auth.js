import bcrypt from 'bcrypt'
import jwt from 'JSONWebToken'

function getJWT(payload, options) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET, options, (err, jwt) => {
            if (err) return reject(err)
            return resolve(jwt)
        })
    })
}

/**
 * @type { import('fastify').FastifyPluginCallback }
 */
export async function authRoutes(app) {
    // PARTIE SIGN-UP

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
            },
        },

        async(request, reply) => {
            const email = request.body.email.toLowerCase()
            const { password, name, nickname } = request.body

            // permet de verifier que l'email n'est pas dans la base de donnée
            const emailexist = await app.supabase
                .from('users_blog')
                .select('id')
                .eq('email', email)
                .single()

            if (emailexist.data) {
                return reply.status(400).send({ error: 'Email is already used' })
            }

            // permet d'envoyer un nouvel user dans la base de donnée
            const newUser = await app.supabase
                .from('users_blog')
                .insert({
                    name,
                    nickname,
                    email,
                    password: await bcrypt.hash(password, 10),
                })
                .single()

            if (newUser.error) {
                return reply.status(400).send(newUser.error)
            }

            reply.send({
                success: true,
                id: newUser.data.id,
            })
        },
    )

    // PARTIE SIGN-IN

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
            },
        },

        async(request, reply) => {
            const email = request.body.email.toLowerCase()

            //
            const { data, error } = await app.supabase
                .from('users_blog')
                .select('id, password')
                .eq('email', email)
                .single()

            if (error) {
                return reply.status(400).send({ error: 'User not found' })
            }

            const { password } = data
            const passwordIsValid = await bcrypt.compare(
                request.body.password,
                password,
            )
            if (!passwordIsValid) {
                return reply.status(404).send({ error: 'User not found' })
            }
            reply.send({
                success: true,
                jwt: await getJWT({ id: data.id }, { expiresIn: "24h" }),
            })
        },
    )
}