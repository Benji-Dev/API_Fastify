const articles = [
  { id: 1, title: 'Fake article 1', description: 'Ahah' },
  { id: 2, title: 'Fake article 2', description: 'Hoho' },
]

export async function articlesRoutes(app) {
  app.get('/articles', function(request, reply){
    reply.send(articles)
  })

  const schema = {
    schema: {
      response: {
        200 : {
          type: 'object',
          properties: 
          {
            id: {type: 'integer'},
            title: {type: 'string'},
            description: {type: 'string'}
          },
        }
      }
    }
  }

  app.get('/articles/:id', { schema: schema}, function(request, reply) {
    const {id} = request.params
    const article = articles[id-1]
    
    if (id-1 <= articles.length) {
      reply.send(article)}

    else if (id-1 > articles.length){
        reply.statusCode = 404
        reply.send(
          { 
            error: `Article ${id} not found`
          })      
    }
  })

  app.post('/articles', function(request, reply)  {
    const newTitle = request.body.title
    const newDescription = request.body.description
    const newArticle = 
    {
      id: articles.length+1,
      title: newTitle,
      description : newDescription
    }
    
    articles.push(newArticle)
    reply.statusCode = 201
    reply.send({message: 'L artcile à é été ajouté'})
  })

  app.delete('/articles/:id', function(request, reply) {
    const {id} = request.params
    const find = articles.find(item => item.id === Number(id))

    if (find === undefined) {
      reply.statusCode = 404
      reply.send(
        {
          error: `L article ${id} n'existe pas`
        }
        )}

    else {
        articles.splice(Number(id)-1,1)
        reply.statusCode = 200
        reply.send(
          { 
            message: `Article deleted`
          }
          )}   
  })
}