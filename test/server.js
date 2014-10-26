/**
 * Created with JetBrains WebStorm.
 * User: Den
 * Date: 26.10.14
 * Time: 1:30
 * To change this template use File | Settings | File Templates.
 */
var
    SyncServer = require('../lib/server'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.listen(8881);
app.use(bodyParser.json());
new SyncServer({attachTo: app});

console.log('listening on 8881');
