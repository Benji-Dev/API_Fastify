const categories = [
    { id: 1, title: 'Green' },
    { id: 2, title: 'Electrique' },
  ]
  
  export async function categoriesRoutes(app) {
    app.get('/categories', function(request, reply){
      reply.send(categories)
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
            },
          }
        }
      }
    }
  
    app.get('/categories/:id', { schema: schema}, function(request, reply) {
      const {id} = request.params
      const categorie = categories[id-1]
      
      if (id-1 <= categories.length) {
        reply.send(categorie)}
  
      else if (id-1 > categories.length){
          reply.statusCode = 404
          reply.send(
            { 
              error: `La catégorie ${id} n'éxiste pas `
            })      
      }
    })
  
    app.post('/categories', function(request, reply)  {
      const newTitle = request.body.title
      const newArticle = 
      {
        id: categories.length+1,
        title: newTitle
      }
      
      categories.push(newArticle)
      reply.statusCode = 201
      reply.send({message: 'La catégorie à été ajoutée'})
    })
  
    app.delete('/categories/:id', function(request, reply) {
      const {id} = request.params
      const find = categories.find(item => item.id === Number(id))
  
      if (find === undefined) {
        reply.statusCode = 404
        reply.send(
          {
            error: `La catégorie ${id} n'existe pas`
          }
          )}
  
      else {
          categories.splice(Number(id)-1,1)
          reply.statusCode = 200
          reply.send(
            { 
              message: `Catégorie supprimée !`
            }
            )}   
    })
  }