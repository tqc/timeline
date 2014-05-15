/* jshint node:true */
"use strict";

var express = require('express');
var app = express();

app.use("/demo", express.static(__dirname + '/demo'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/src", express.static(__dirname + '/src'));


app.listen(3000);