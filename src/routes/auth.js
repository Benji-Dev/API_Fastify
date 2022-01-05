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
            const { password } = request.body

            // permet de verifier que l'email n'est pas dans la base de donnée
            const emailexist = await app.supabase
                .from('users_blog')
                .select('id')
                .eq('email', email)
                .single()

            if (emailexist.data) {
                return reply.status(400).send({ error: "Cet email est déjà utilisé, merci de trouver quelque chose de plus original, merci" })
            }

            // créer un nouvel user
            const newUser = await app.supabase
                .from('users_blog')
                .insert({
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
                message: "Votre utilisateur a été créé"
            })
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
                return reply.status(400).send({ error: "Cet utilisateur n'existe pas, veuillez vérifier votre email ou mot de passe s'il vous plaît, merci." })
            }

            const { password } = data
            const passwordIsValid = await bcrypt.compare(
                request.body.password,
                password,
            )
            if (!passwordIsValid) {
                return reply.status(404).send({ error: "Cet utilisateur n'existe pas, veuillez vérifier votre email ou mot de passe s'il vous plaît, merci." })
            }
            reply.send({
                success: true,
                jwt: await getJWT({ id: data.id }, { expiresIn: "24h" }),
            })
        },
    )
}