/**
 * @type { import('fastify').FastifyPluginCallback }
 */

export async function routes(app) {

    app.get('/', function(request, reply) {
        reply.send({
            message: 'Voici notre blog '
        })
    })

}