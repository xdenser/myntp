/**
 * Created with JetBrains WebStorm.
 * User: Den
 * Date: 25.10.14
 * Time: 23:48
 * To change this template use File | Settings | File Templates.
 */


function Server(options){
    this.now = options.nowFunc||Date.now.bind(Date);
    options.attachTo.post(options.path||'/ntp',this.processRequest.bind(this));
}

Server.prototype.processRequest = function(req,res){
    var obj = req.body;
    obj.serverSendTime = this.now();
    res.send(obj);
}

Server.Client = require('./client');

module.exports = Server;
