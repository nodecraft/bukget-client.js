bukget.js
=========

    npm install h9



bukget.js - Node.js Wrapper for the [Bukget v3 API](http://bukget.org/documentation)


Code Examples
-------------
```javascript
   var bukget = require('bukget')({
      userAgent: 'my-custom-useragent' // usefull for stats on usage
   });
   
   bukget.getPlugin('worldguard', function(err, results){
      console.log(results);
   });
   
   bukget.basicSearch({
      field: 'slug',
      action: 'like',
      value: 'world',
      size: 5
   }, function(err, results){
      console.log(results);
   });
   
```

Documentation
--------------------

Other than the method names differing from the routes all data and required fields match the [Bukget v3 API](http://bukget.org/documentation).

* [General](https://github.com/nodecraft/bukget.js/wiki/General/)
* [Plugins](https://github.com/nodecraft/bukget.js/wiki/Plugins)
* [Update](https://github.com/nodecraft/bukget.js/wiki/Update)
* [Search](https://github.com/nodecraft/bukget.js/wiki/Search)
* [Stats](https://github.com/nodecraft/bukget.js/wiki/Stats)
