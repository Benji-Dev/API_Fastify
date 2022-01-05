export async function categoriesRoutes(app) {
    // Afficher toutes les catégories sur la route "categories"
    app.get('/categories', async(request, reply) => {

        const categories = await app.supabase
            .from('categories')
            .select()
        reply.send(categories)
    })


    app.get(
        '/categories/:id', {
            schema: {
                params: { type: 'object', properties: { id: { type: 'number' } } },
            },
        },
        async(request, reply) => {
            const id = request.params.id
            const categories = await app.supabase
                .from('categories')
                .select('id,title')
                .eq('id', id)
                .single()
            reply.send(categories)
            const categorie = categories.find((a) => a.id === id)
            if (categorie) {
                reply.send(categorie)
                return
            }
            reply.code(404).send({ error: `Article ${id} not found` })
        },
    )

    app.post('/categories',
        async(request, reply) => {
            const title = request.body.title

            // permet d'envoyer une nouvelle catégories dans la base de donnée
            const newArticles = await app.supabase
                .from('categories')
                .insert({
                    title,
                })
                .single()

            if (newArticles.error) {
                return reply.status(404).send(newArticles.error)
            }

            reply.send({
                success: true,
                id: newArticles.data.id,
                message: 'Une catégorie a été ajouté'
            })
        }, )

    app.delete(
        '/categories/:id', {
            schema: {
                params: { type: 'object', properties: { id: { type: 'number' } } },
            },
        },
        async(request, reply) => {
            const id = request.params.id
            const categories = await app.supabase
                .from('categories')
                .delete('id,title')
                .eq('id', id)
                .single()
            reply.send({ message: 'Votre categorie a bien supprimé' })
            const categorie = categories.find((a) => a.id === id)
            if (categorie) {
                reply.send({ message: 'Votre categorie a bien supprimé' })
                return
            }
            reply.code(404).send({ error: `La categorie ${id} n'existe pas` })
        },
    )
}