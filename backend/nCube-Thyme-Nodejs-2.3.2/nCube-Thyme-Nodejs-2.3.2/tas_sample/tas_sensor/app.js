/**

 * Created by ryeubi on 2015-08-31.

 * Updated 2017.03.06

 * Made compatible with Thyme v1.7.2

 */

 var net = require('net');
 var util = require('util');
 var fs = require('fs');
 var xml2js = require('xml2js');
 var wdt = require('./wdt');
 //var sh_serial = require('./serial');

 var {SerialPort}= require('serialport');
const { type } = require('os');
 var usecomport = '';
 var usebaudrate = '';
 var useparentport = '';
 var useparenthostname = '';

 var upload_arr = [];
 var download_arr = [];
 var conf = {};

 // This is an async file read

 fs.readFile('conf.xml', 'utf-8', function (err, data) {
     if (err) {
         console.log("FATAL An error occurred trying to read in the file: " + err);
         console.log("error : set to default for configuration")
     }
     else {
         var parser = new xml2js.Parser({explicitArray: false});
         parser.parseString(data, function (err, result) {
             if (err) {
                 console.log("Parsing An error occurred trying to read in the file: " + err);
                 console.log("error : set to default for configuration")
             }
             else {
                 var jsonString = JSON.stringify(result);
                 conf = JSON.parse(jsonString)['m2m:conf'];

                 usecomport = conf.tas.comport;
                 usebaudrate = conf.tas.baudrate;
                 useparenthostname = conf.tas.parenthostname;
                 useparentport = conf.tas.parentport;
 
                 if(conf.upload != null) {
                     if (conf.upload['ctname'] != null) {
                         upload_arr[0] = conf.upload;
                     }
                     else {
                         upload_arr = conf.upload;
                     }
                 }

                 if(conf.download != null) {
                     if (conf.download['ctname'] != null) {
                         download_arr[0] = conf.download;
                     }
                     else {
                         download_arr = conf.download;
                     }
                 }
             }
         });
     }

 });

 var tas_state = 'init';
 var upload_client = null;
 var t_count = 0;

 function table_upload_action(key, data) {
     if (tas_state == 'upload') {
         var con = {value: 'TAS' + data};
         if(key=="0202FF53") {
             var cin = {ctname: 'sensor', con: data};
             console.log(JSON.stringify(cin) + ' ---->');
             upload_client.write(JSON.stringify(cin) + '<EOF>');
         }
         else if(key =="0201FF73"){
             var cin = {ctname: 'ledfan', con: data};
             console.log(JSON.stringify(cin) + ' ---->');
             upload_client.write(JSON.stringify(cin) + '<EOF>');
         }
         else if(key =="0201FF53"){
            var cin = {ctname: 'ledfan2', con: data};
            console.log(JSON.stringify(cin) + ' ---->');
            upload_client.write(JSON.stringify(cin) + '<EOF>');
        }
     }
 }

 function sensor_upload_action() {
     if (tas_state == 'upload') {
             var sensor = "0202FF53FF00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03"; // 센서보드 상태체크
             var buf = hexToBytes(sensor);
             console.log('바이트 길이 : '+buf.length);
             myPort.write(buf);
             console.log("--> 센서 보드 확인 보낸 패킷 : "+sensor);
     }
 }

 function led_upload_action() {
     if (tas_state == 'upload') {
             var packet = "0201FF73FF00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03"; // led,fan 상태체크
             var buf = hexToBytes(packet);
             console.log('바이트 길이 : '+buf.length);
             myPort.write(buf);
             console.log("--> ledfan 확인 보낸 패킷 : "+packet);
     }
 }

 function ledfan_upload_action() {
    if (tas_state == 'upload') {
            var packet = "0201FF53FF00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03"; // led,fan 상태체크
            var buf = hexToBytes(packet);
            console.log('바이트 길이 : '+buf.length);
            myPort.write(buf);
            console.log("--> ledfan on/off 확인 보낸 패킷 : "+packet);
    }
}

 
 function hexToBytes(hex) {
     for (var bytes = [], c = 0; c < hex.length; c += 2)
         bytes.push(parseInt(hex.substr(c, 2), 16));
     return bytes;
 }

// n 
 var name = ["red", "blue", "fan"];

 function setLedFan(data){
    console.log('setLedFan data: ' +data);
    let packet;
    if(data.indexOf(':') !== -1){
        let split = data.split(":")[1];
        let send_data =[];
    
        let tem = split.split('/');
    
        console.log(tem);
        
        for(let i=0; i<name.length;i++){
            if(name[i] === tem[0]){
                    send_data[0] = i+1;
                    send_data[1] = tem[1];
                    console.log(send_data)
            }
        }
    
        let hex  = ((parseInt(tem[1])).toString(16));
    
        if(hex.length == 1){
            hex = '0'+hex;
        }
    
        console.log('LED/FAN VALUE CONTROL: '+send_data[0]+": "+send_data[1]+'('+hex+')값 으로 제어');
    
    
        packet = '0201FF50FF0'+ send_data[0]+'FF0000640000'+hex+'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03';
    
        let buf = hexToBytes(packet);
    
        console.log('tas to ireland(led value): '+ packet);
        myPort.write(buf);
    }
    

 }

 function setLedFan2(data){
    console.log('setLedFan2 data: ' +data);
    let packet;

    if(data.indexOf(':') !== -1){
        let split = data.split(":")[1];
        let value;
        let num;
    
        let tem = split.split('/');
        for(let i = 0;i<name.length;i++){
            if(tem[0] == name[i]){
                num = i+1;
            }
        }
    
        if(tem[1] == 'on')
            value = '01';
        else 
            value = '00';
        
        console.log('LED/FAN ON/OFF CONTROL: '+tem[0]+": "+value+'으로 제어');
        
    
        packet = '0201FF4CFF0'+num+'FF'+value+'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03';
        
        let buf = hexToBytes(packet);
    
        console.log('tas to ireland(led on/off): '+ packet);
        myPort.write(buf);
    }
 }

 function setLedFan3(data){
    console.log('setLedFan3 data: ' +data);
    let str;
    let packet ='020FF55FF0'

    let temp = data.split(',');
    if(temp[0] == 'red'){
        packet += '1';
        str = 'red';
    }
    else if(temp[0] == 'blue'){
        packet += '2';
        str = 'blue';
    }
    else if(temp[0] == 'fan'){
        packet += '3';
        str = 'fan';
    }

    packet += 'FF'
    let time = [];

    for(i=1;i<temp.length;i++){
        if(temp[i]<10){
            time[i-1] = '0'+temp[i];
        }
        else{
            time[i-1] = temp[i];
        }
    }

    console.log(str+': '+time[0]+":"+time[1]+ ' ~ ' + time[2]+":"+time[3])

    packet += time[0]+time[1]+time[2]+time[3]+ 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF03'
    let buf = hexToBytes(packet);
    
    console.log('tas to ireland(alram): '+ packet);
    myPort.write(buf);
    

 }



 function sleep(ms) {
   return new Promise((r) => setTimeout(r, ms));
 }

 function setON(buf){
     console.log("On 패킷 보냄");
     sleep(3000).then(() => myPort.write(buf))
 }

 function sleep3(){
     sleep(3000).then(() => console.log("3초 쉽니다"))
 }

 var tas_download_count = 0;

 function on_receive(data) {
     if (tas_state == 'connect' || tas_state == 'reconnect' || tas_state == 'upload') {
         var data_arr = data.toString().split('<EOF>');
         if(data_arr.length >= 2) {
             for (var i = 0; i < data_arr.length - 1; i++) {
                 var line = data_arr[i];
                 var sink_str = util.format('%s', line.toString());
                 var sink_obj = JSON.parse(sink_str);

                 console.log('sink_obj.ctname: '+sink_obj.ctname);

                 if (sink_obj.ctname == null || sink_obj.con == null) {
                     console.log('Received: data format mismatch');
                 }
                 else {
                     if (sink_obj.con == 'hello') {
                         console.log('Received: ' + line);

                         if (++tas_download_count >= download_arr.length) {
                             tas_state = 'upload';
                         }
                     }
                     else {
                         for (var j = 0; j < upload_arr.length; j++) {
                             if (upload_arr[j].ctname == sink_obj.ctname) {
                                 console.log('ACK : ' + line + ' <----');
                                 break;
                             }
                         }

                         /* Mobius-> &Cube -> Tas로 받아온 데이터 */
                        //  console.log(download_arr);
                         for (j = 0; j < download_arr.length; j++) {
                             if (download_arr[j].ctname == sink_obj.ctname) {
                                 g_down_buf = JSON.stringify({id: download_arr[i].id, con: sink_obj.con});
                                 console.log(g_down_buf + ' <----');
                                 console.log("con print : " +sink_obj.con);

                                 if(sink_obj.ctname == 'ledfan'){
                                    setLedFan(sink_obj.con);
                                 }
                                 else if(sink_obj.ctname == 'ledfan2'){
                                    setLedFan2(sink_obj.con);
                                 }
                                 else if(sink_obj.ctname == 'alram'){
                                    // console.log('alram data: '+ sink_obj.con);
                                    setLedFan3(sink_obj.con);
                                 }
                                 break;
                             }
                         }
                     }
                 }
             }
         }
     }
 }




 // var SerialPort = null;
 var myPort = null;
 function tas_watchdog() {
    // console.log(download_arr[0]);
     if(tas_state == 'init') {
         upload_client = new net.Socket();

         upload_client.on('data', on_receive);

         upload_client.on('error', function(err) {
             console.log(err);
             tas_state = 'reconnect';
         });

         upload_client.on('close', function() {
             console.log('Connection closed');
             upload_client.destroy();
             tas_state = 'reconnect';
         });


         if(upload_client) {
             console.log('tas init ok');
             tas_state = 'init_serial';
         }
     }

     else if(tas_state == 'init_serial') {

        myPort = new SerialPort({
            path: usecomport,
            baudRate: parseInt(usebaudrate,10),
            buffersize :1
        });
        
        console.log(usecomport+" 시리얼 포트 연결 완료");

         myPort.on('open', showPortOpen);
         myPort.on('data', saveLastestData);
         myPort.on('close', showPortClose);
         myPort.on('error', showError);

         if(myPort) {
             console.log('tas init serial ok');
             tas_state = 'connect';
             console.log('타스 상태 변경 ==> connect');
         }

     }

     else if(tas_state == 'connect' || tas_state == 'reconnect') {
         upload_client.connect(useparentport, useparenthostname, function() {
             console.log('upload Connected');
             tas_download_count = 0;
             for (var i = 0; i < download_arr.length; i++) {
                 console.log('download Connected - ' + download_arr[i].ctname + ' hello');
                 var cin = {ctname: download_arr[i].ctname, con: 'hello'};
                 upload_client.write(JSON.stringify(cin) + '<EOF>');
             }

 
             if (tas_download_count >= download_arr.length) {
                 tas_state = 'upload';
             }
         });

     }

 }

// led_upload_action();
 //wdt.set_wdt(require('shortid').generate(), 3, table_upload_action);
 wdt.set_wdt(require('shortid').generate(), 3, tas_watchdog);
 wdt.set_wdt(require('shortid').generate(), 20, sensor_upload_action);
 wdt.set_wdt(require('shortid').generate(), 60, led_upload_action);
 wdt.set_wdt(require('shortid').generate(), 65, ledfan_upload_action);



 var cur_c = '';
 var pre_c = '';
 var g_sink_buf = '';
 var g_sink_ready = [];
 var g_sink_buf_start = 0;
 var g_sink_buf_index = 0;
 var g_down_buf = '';

 function showPortOpen() {
     console.log('port open. Data rate: '+myPort.baudRate);
 }


 function saveLastestData(data) {

     var buff = Buffer.alloc(50);
     var receive_data = '';
     var hex_data = '';

     console.log();
     for(var i = 0; i <buff.length; i++){
         buff[i] = data[i];
         hex_data = buff[i].toString(16).toUpperCase();
         if(hex_data.length == 1){
             hex_data = '0'+hex_data;
         }
         receive_data += hex_data;
     }

     console.log('<-- 읽은 데이터 : ' + receive_data);
     packet_parsing(receive_data);

 }

 

 function packet_parsing(packet){
     var save_packet = '';
     var start = -1;
     var end = -1;


     for(var i = 0; i < packet.length; i++){
         start = packet.indexOf('02', start);
         end = packet.lastIndexOf('03');

         if(start > end || start == -1 || end == -1){
             continue;
         }

         packet = packet.substring(start, end+2);

         if(start < end && packet.length == 60){
             save_packet = packet;
             console.log('파싱된 패킷 : ' + save_packet);
             break;
         }

     }

     

     var key = '';
     key = save_packet.substring(0,8);
     console.log('키값 빼기'+key);
     var send_packet = '';

     if(key == "0202FF53"){
        
         var time = save_packet.substring(14,16)+":"+save_packet.substring(16,18);
         var temp = save_packet.substring(21, 22) + save_packet.substring(23, 24) + "." + save_packet.substring(25, 26);
         var humi = save_packet.substring(29, 30) + save_packet.substring(31, 32) + "." + save_packet.substring(33, 34);
         var co2 = save_packet.substring(39, 40) + save_packet.substring(41, 42) + save_packet.substring(42, 43);
         var illum = save_packet.substring(49, 50) + save_packet.substring(51, 52) + save_packet.substring(53, 54)
         var gas = save_packet.substring(56, 58);

         send_packet = "time/"+time+",temp/"+temp+",humi/"+humi+",co2/"+co2+",illum/"+ illum+ ",gas/"+gas;
         console.log("시간 : "+time+" 온도 : "+temp+" 습도 : "+humi+" co2 : "+co2+" 조도 : "+ illum+ " 가스 : "+gas);

     } else if(key=="0201FF73"){

       //  var hex = save_packet.substring(10,12);
         var red = parseInt(save_packet.substring(10,12), 16);
         var blue = parseInt(save_packet.substring(24,26), 16);
         var fan = parseInt(save_packet.substring(38,40), 16);

         send_packet = "red/"+red+",blue/"+blue+",fan/"+fan;
         
         console.log('LED VALUE SENSING: '+send_packet);
     }

     else if(key=='0201FF53'){

        var  red_on = parseInt(save_packet.substring(16,18), 16);
        var blue_on = parseInt(save_packet.substring(18,20), 16);
        var fan_on = parseInt(save_packet.substring(20,22), 16);

        send_packet = "red_onoff/"+red_on+",blue_onoff/"+blue_on+",fan_onoff/"+fan_on;
        console.log('LED ON/OFF SENSING'+send_packet);
     }

     else if(key == '0201FF52'){
        var red_alram =  parseInt(save_packet.substring(),16)
     }


     table_upload_action(key, send_packet);
 }

 

 function showPortClose() {
     console.log('port closed.');
 }

 

 function showError(error) {
     var error_str = util.format("%s", error);
     console.log(error.message);
     if (error_str.substring(0, 14) == "Error: Opening") {
     }

     else {
         console.log('SerialPort port error : ' + error);
     }

 }

 