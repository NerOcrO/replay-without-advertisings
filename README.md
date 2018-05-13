# Replay without advertisings

## CONFIGURATION

Just create a channels.json to the root like this:

```json
{
  "channels": [
    {
      "id": "arte",
      "label": "Arte"
    },
    {
      "id": "c8",
      "label": "C8"
    }
  ]
}
```

## HOW IT WORKS?

> node app.js

Then go to your web browser : http://localhost:8080/

## DEBUG MODE

> DEBUG=tools node app.js
or
> DEBUG=* node app.js

## HOW TO CREATE A PLUGIN?

Just make a directory and associate it a index.js file, that's all!
Take a look on arte or c8 for more example.

## LEARNED

* express
* http
* filesystem
* date
* error
* templating
* bootstrap
* ARIA
* responsive
* translating handler

## DOCUMENTATIONS

* https://nodejs.org/dist/latest-v10.x/docs/api/all.html
* https://expressjs.com/en/4x/api.html
* http://ejs.co/#docs
