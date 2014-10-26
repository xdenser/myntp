/**
 * Created with JetBrains WebStorm.
 * User: Den
 * Date: 25.10.14
 * Time: 23:54
 * To change this template use File | Settings | File Templates.
 */
var
    http = require('http');

function Client(options){
    this.host = options.host;
    this.port = options.port;
    this.path = options.path||'/ntp';
    this.timeoutMs = options.timeoutMs||5000;
    this.samples = [];
    this.count = options.count||100;
    this.syncInterval = options.interval||10000;
    this.offset = options.offset||0;
    this.roundTrip = options.roundTrip||Infinity;
    this.storeCb = options.storeOffset||null;
    this.silent = options.silent;
    this.getServerTime();
}

Client.prototype.request =  function(obj,cb){

    var timedOut,
        tId = setTimeout(function(){
            timedOut = true;
            cb(new Error('request timeout'));
        },this.timeoutMs);

    function docb(err,res){
        clearTimeout(tId);
        cb(err,res);
    }

    var req = http.request({
        host: this.host,
        port: this.port,
        path: this.path,
        method: 'POST',
        headers:{
          'Content-Type':'application/json'
        },
        responseType: 'json'
    },function(res){
          if(timedOut) return;
          if(res.statusCode==200){
              var str = '';
              res.on('data',function(data){
                  str+=data;
              });
              res.on('end',function(){
                  if(timedOut) return;
                  try{
                      obj = JSON.parse(str);
                  }
                  catch(e){
                      return docb(e)
                  }
                  return docb(null,obj);
              })
             return;
          }

        docb(new Error('wrong response code'));
    });
    req.end(JSON.stringify(obj));
    req.on('error',function(err){
        docb(err);
    })
}

Client.prototype.getServerTime = function(){
  if(this.stopped) return;
  var self = this;
  function schedule(){
      setTimeout(self.getServerTime.bind(self),self.syncInterval);
  }
  this.request({
      clientSendTime: Date.now()
  },function(err,res){
      if(err) {
          if(!self.silent) console.log('failed to get server time',err);
          schedule();
          return;
      }
      res.clientReceiveTime = Date.now();
      res.roundtripTime = res.clientReceiveTime - res.clientSendTime;
      res.offset = res.serverSendTime  - (res.clientSendTime + (res.roundtripTime / 2));
      self.addSample(res);
      schedule();
  });
}

Client.prototype.addSample = function(sample){
    this.samples.push(sample);
    if(this.samples.length > this.count) this.samples.shift();
    var offsetTotal = 0, rtTotal = 0;
    this.samples.forEach(function(sample){
        offsetTotal += sample.offset;
        rtTotal += sample.roundtripTime;
    })
    this.offset = offsetTotal/this.samples.length;
    this.roundTrip = rtTotal/this.samples.length;
    this.lastSync = this.now();
    if(this.storeCb) this.storeCb(this.offset);
}

Client.prototype.now = function(){
    return Date.now() + this.offset;
}

Client.prototype.stop = function(){
  this.stopped = true;
}

module.exports = Client;