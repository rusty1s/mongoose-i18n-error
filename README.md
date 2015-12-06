# mongoose-i18n-error

mongoose-i18n-error is a lightweight module for node.js/express.js to create beautiful mongoose i18n validation error messages.
It is built on top of the awesome [i18n-node](https://github.com/mashpie/i18n-node) translation module.

I never liked the mongoose/mongo error messages caused by mongoose validation or duplicate keys. So I decided to write a simple express middleware module to create consistent error messages with i18n support.

```js
{
	username: {
		type: 'required',
		message: 'is required',
		value: undefined
	},
	email: {
		type: 'regexp',
		message: 'is no valid email',
		value: 'johndoe.de'
	}
}
```

## Usage

```
npm install mongoose-i18n-error
```

Configure your app to support i18n:

```js
var i18n = require('i18n');

i18n.configure({
	locales: ['en', 'de'],
	directory: './locales'
});

app.use(i18n.init);
```

Then, simply add the module as an [express error handler middleware](http://expressjs.com/en/guide/error-handling.html):

```js
var i18nMongooseError = new (require('mongoose-i18n-error'))();

app.use(i18nMongooseError.handler(function(err, req, res, next) {
	res.status(422).json(err);
}));
```

## Options

By default, the plugin will prefix the error messages in your locale files with `'error.':

```
"error.required": "is required",
"error.minlength": "needs a minimum length of %s",
"error.user.password.regexp": "is no valid email",
"error.cast": "is not valid"
```

You can change the prefix by passing the prefix attribute as options:

```js
var i18nMongooseError = new (require('mongoose-i18n-error'))({
	prefix: 'err.'
});
```

## Custom validators

In your custom mongoose validators your error message should now apply to the key in your locales.

```js
var Schema = new mongoose.Schema({
	name: {
		type: String,
		validate: {
			validator: function(v) {
				return /^[A-Z]*$/i.test(v);
			},
			message: 'user.name.alpha'	// or simply 'alpha'
		}
	}
});
```

# Tests

To run the tests you need a local MongoDB instance available. Run with:

```
npm test
```

# Issues

Please use the GitHub issue tracker to raise any problems or feature requests.

If you would like to submit a pull request with any changes you make, please feel free!
