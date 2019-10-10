
const { html } = require('../../utils/misc')

module.exports = () => 
    html`
        <head>
            <title>Brandon Smith's Website</title>
            <meta name="description" content="Personal website of Brandon Smtih">

            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <link rel="stylesheet" type="text/css" href="/css/article.css">
            <link rel="stylesheet" type="text/css" href="/css/base.css">
            <link rel="stylesheet" type="text/css" href="/css/utils.css">
            <link rel="stylesheet" type="text/css" href="/css/variables.css">

            <link rel="stylesheet" type="text/css" href="/css/fragments/bio.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/home-link.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/icons.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/post-preview.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/prism.css">
        </head>
    `