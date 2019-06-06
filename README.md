# ![Vincent CMS](http://v3.keystonejs.com/images/logo.svg)

- [About Vincent](#about)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## About Vincent

[Vincent](http://keystonejs.com) is a powerful Node.js content management system based on the great [KeystoneJS](http://keystonejs.com) and it's built on the [Express](https://expressjs.com/) web framework and [Mongoose ODM](http://mongoosejs.com).

Check out the [demo site](http://demo.keystonejs.com) to see it in action.

### Documentation

Lot of the documentation can be found on the Keystone v4 website, see [keystonejs.com](https://keystonejs.com).

## Getting Started

This section provides a short intro to Keystone. Check out the [Getting Started Guide](https://keystonejs.com/getting-started) in the Keystone documentation for a more comprehensive introduction.

### Installation

To be ready to develop your website in few seconds use the Yeoman generator (also a fork from the KeystoneJS one):

```bash
$ npm install -g generator-vincent
$ yo vincent
```

Answer the questions, and the generator will create a new project based on the options you select, and install the required packages from **npm**.

Then read through the [Documentation](https://keystonejs.com/documentation) and the [Example Projects](http://v3.keystonejs.com/examples) to understand how to use it.

### Running Vincent in Production

When you deploy your Vincent website to production, be sure to set your `ENV` environment variable to `production`.

You can do this by setting `NODE_ENV=production` in your `.env` file, which gets handled by [dotenv](https://github.com/motdotla/dotenv).

Setting your environment enables certain features (including template caching, simpler error reporting, and HTML minification) that are important in production but annoying in development.


### Contributing

If you can, please contribute by reporting issues, discussing ideas and helping answer questions from other developers.


### Thanks

Keystone's development has been led by key contributors including [Jed Watson](https://github.com/JedWatson), [Joss Mackison](https://github.com/jossmac), and [Max Stoiber](https://github.com/mxstbr).

This fork and most of the additional customizations have been developed by myself, [Luca Zonarelli](https://github.com/lukezona)

## License

(The MIT License)

Copyright (c) 2016-2019 Jed Watson

Copyright (c) 2018-2019 Luca Zonarelli

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
