export async function articlesRoutes(app) {
    // Afficher tous les articles sur la route "articles"
    app.get('/articles', async(request, reply) => {

        const articles = await app.supabase
            .from('articles')
            .select()
        reply.send(articles)
    })

    app.get(
        '/articles/:id', {
            schema: {
                params: { type: 'object', properties: { id: { type: 'number' } } },
            },
        },
        async(request, reply) => {
            const id = request.params.id
            const articles = await app.supabase
                .from('articles')
                .select('id,title,description,categorie')
                .eq('id', id)
                .single()
            reply.send(articles)
            const article = articles.find((a) => a.id === id)
            if (article) {
                reply.send(article)
                return
            }
            reply.code(404).send({ error: `Cet article ${id} n'existe pas, sorry.` })
        },
    )

    app.post('/articles',
        async(request, reply) => {
            const title = request.body.title
            const description = request.body.description
            const categorie = request.body.categorie

            // permet d'envoyer un nouvel article dans la base de donnée
            const newArticles = await app.supabase
                .from('articles')
                .insert({
                    title,
                    description,
                    categorie,
                })
                .single()

            if (newArticles.error) {
                return reply.status(404).send(newArticles.error)
            }

            reply.send({
                success: true,
                id: newArticles.data.id,
                message: "Votre article a été ajouté"
            })
        }, )

    app.delete(
        '/articles/:id', {
            schema: {
                params: { type: 'object', properties: { id: { type: 'number' } } },
            },
        },
        async(request, reply) => {
            const id = request.params.id
            const articles = await app.supabase
                .from('articles')
                .delete('id,title,description,categorie')
                .eq('id', id)
                .single()
            reply.send({ message: 'Votre article a bien été supprimé' })
            const article = articles.find((a) => a.id === id)
            if (article) {
                reply.send({ message: 'Votre article a bien été supprimé' })
                return
            }
            reply.code(404).send({ error: `Cet article ${id} n'existe pas, sorry.` })
        },
    )
}