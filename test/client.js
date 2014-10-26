/**
 * Created with JetBrains WebStorm.
 * User: Den
 * Date: 26.10.14
 * Time: 1:36
 * To change this template use File | Settings | File Templates.
 */
var
    NTPClient = require('../lib/client');

var ntp  = new NTPClient({
    host: 'localhost',
    port: 8881,
    storeOffset: function(o){
       // console.log('offset',o);
    }
});

setInterval(function(){
    console.log(new Date(ntp.now()));
},1000)