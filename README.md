# local-cdn

A node module for serving up concatenated javascript and css bundles in local development servers,
and generating compressed bundles for deployment to a CDN for production installs.

It can work standalone along side another web framework, or be embedded inside an existing node
project as [Connect Middleware](http://senchalabs.github.com/connect/).

The goal of local-cdn is to make it easy to build web app with a CDN in mind from Day 1, rather
than having to hack in this step later on.

Here's a good article on the Yahoo Developer Network explaining 
[why using a CDN is important](http://developer.yahoo.com/blogs/ydn/posts/2007/04/high_performanc_1/).

## Install

    npm install local-cdn

## How to Setup

The local-cdn source comes with an [example project](https://github.com/larrymyers/local-cdn/tree/master/example), 
which is suitable for using as a template for getting started.

### Creating a Config File

local-cdn requires a config file. It's a json formatted file that looks like this:

    {
        "staticDir": "public",
        "deployDir": "../deploy",
        "js": {
            "app.js": [
                "js/foo.js",
                "js/bar.js",
            ],
            "widgets.js": [
                "js/base.js",
                "js/animation.js",
            ]
        },
        "css": {
            "site.css": [
                "css/reset.css",
                "css/widget.css"
            ]
        }
    }

* staticDir : a relative (or absolute) path to directory that contains the static resources.
* deployDir : a relative (or absolute) path that will be created for generating deployment bundles.
* js : an object with String => Array key/value pairs, describing each javascript bundle name and its source files.
* css : an object with String => Array key/value pairs, describing each css bundle name and its source files.

### Run Standalone

To run in the live development mode, start local-cdn in "serve" mode, which will start a static server,
using the staticDir from the config file as the root:

    local-cdn serve MyProject/local-cdn.config
    
The static server in dev mode defaults to port 8000, but you can override it:

    local-cdn serve MyProject/local-cdn.config 9876

To build the generated bundles and create a deploy folder suitable for uploading to a CDN:

    local-cdn deploy MyProject/local-cdn.config

By default javascript and css compression is off, provide the --compress flag to enable it:

    local-cdn deploy MyProject/local-cdn.config --compress

### Run Embedded

local-cdn can be used with Connect just like any other middleware.

    var localcdn = require('local-cdn');
    
    var config = localcdn.config.fromFileSync('path/to/project/local-cdn.config');
    
    var server = connect.createServer(
        connect.logger({ format: ':method :url :response-time => :status'}),
        localcdn.serve(config)
    );

This is exactly what the [bin/local-cdn](https://github.com/larrymyers/local-cdn/blob/master/bin/local-cdn) 
script does that is used in standalone mode, and serves as a good reference implementation.

