# cached queries
This module creates a cache in a List allowing to save static queries results.

## cached queries.init (List)
The ``init`` method adds two static methods to the model to manage the queries cache.
It also adds two hooks to invalidate the current cache after an update to the list (creation, update, deletion of any collection document).
This method must be called after the list registration.
Example:
```
const keystoned = require('keystoned')
const Post = new keystone.List('Post', {....
    ...
});
Post.register();
Post.Cache.init(Post);
```

Successivamente all'esecuzione di ``init`` vengono aggiunti alla lista due metodi statici:
- Lista.schema.statics.query.set
- Lista.schema.statics.query.get

## Lista.schema.statics.query.set (cache_id, query)
Questo metodo crea nella cache della lista un oggetto identificato da cache_id al quale associa la query ed il suo risultatato
Esempio:
```
Post.register();
keystoned.model_queries.init(Post);
Post.schema.statics.query.set('last_post', Post.model.findOne({}).sort('createdAt')); // Memorizza la query per ottenere il post più recente
```
## Lista.schema.statics.query.get (cache_id)
Questo metodo, utilizzabile principalmente nelle routes, consente di richiamare una query salvata.
Alla prima esecuzione verrà eseguita la query ed i risultati saranno salvati nella cache corrispondente, alle esecuzioni successive verrà restituito il valore della cache.
In entrambi i casi il metodo ritorna una promise in modo da poter gestire abbastanza normalmente sia il caso di successo sia il caso di errore.
Esempio
```
...

view.on('init', function (next) {

    Post.schema.statics.query.get('last_post').then(
        (r) => {
            locals.last_post = r;
            next();
        },
        (err) => {
            next(err);
        }
    )

});

...
```

With async/await

```
...

view.on('init', async function (next) {

    try {
        locals.last_post = await Post.schema.statics.query.get('last_post');
        next();
    }
    catch (e) {
        next(e);
    }

});

...
```