import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Sensing.css';


function Sensing(){
    const [sensing, setSensing] = useState(0);


    const getSensing = async () => {
        var sensing = [];
        var indices = [];
        var indices2 = [];
        
        try {
            setSensing(0);// 요청이 시작 할 때에는 sensing을 초기화
            const response = await axios.get(
                '/Mobius/ireland/sensor/latest',{
                headers: {
                    'Accept': 'application/json',
                    'X-M2M-RI': '12345',
                    'X-M2M-Origin': 'Sireland'
                  }
                }
            );
            var str = JSON.stringify(response.data);
            var obj = JSON.parse(str);
            var con = obj['m2m:cin'].con;

            var idx = con.indexOf('/');
            while (idx !== -1) {
              indices.push(idx);
              idx = con.indexOf('/', idx + 1);
            }
            idx = con.indexOf(',');
            while (idx !== -1) {
              indices2.push(idx);
              idx = con.indexOf(',', idx + 1);
            }
      
            for(var i=0;i<indices.length;i++){
                if(i===4)
                    sensing.push(con.substring(indices[i]+2,indices2[i]));
                else
                    sensing.push(con.substring(indices[i]+1,indices2[i]));
            }
            console.log("sensing Sensor board:"+sensing);

            setSensing(sensing);
          } catch (e) {
        }
    };

        // axios.get('http://localhost:7579/Mobius/ireland/sensor/latest',{
        //     headers: {
        //         'Accept': 'application/json',
        //         'X-M2M-RI': '12345',
        //         'X-M2M-Origin': 'Sireland'
        //     }
        //     })
        //     .then((res) => {
        //     console.log(res.data)
        //     var str = JSON.stringify(res.data);
        //     var obj = JSON.parse(str);
        //     var con = obj['m2m:cin'].con;
        //     console.log(con);

        //     var idx = con.indexOf('/');
        //     while (idx !== -1) {
        //         indices.push(idx);
        //         idx = con.indexOf('/', idx + 1);
        //     }
        //     idx = con.indexOf(',');
        //     while (idx !== -1) {
        //         indices2.push(idx);
        //         idx = con.indexOf(',', idx + 1);
        //     }

        //     for(var i=0;i<indices.length;i++){
        //         sensing.push(con.substring(indices[i]+1,indices2[i]));
        //     }

        //     console.log(sensing);

        //     setSensing(sensing);
        //     });

        useEffect(() => {
            getSensing();
            setInterval(() => {
                getSensing();
            }, 10000);
            // let timer = setTimeout(()=>{ getSensing() }, 2000);
            // getSensing();
        },[]);
        return (
            <div class ="sensing_box">
                <div class="sensing_tem1">
                    <div class= "sensing_temp">
                    <div class="temp_title"><p>Temperature</p></div>
                    <div class="temp_value"><p class="temp">{sensing[1]}℃</p></div>
                    </div>
        
                    <div class="sensing_blank">
                    <div class="sensing_humi">
                        <div class="humi_title"><p>Humidity</p></div>
                        <div class="humi_value"><p class="humi">{sensing[2]}%</p></div>
                    </div>
        
                    </div>
                </div>

                <div class="sensing_tem2">
                    <div class="sensing_illum">
                    <div class="title"><p>Illuminance</p></div>
                    <div class="value"><p class="illum">{sensing[3]}[lux]</p></div>
                    </div>
                    <div class="sensing_co2">
                    <div class="title"><p>Co2</p></div>
                    <div class="value"><p class="co2">{sensing[4]}ppm</p></div>
                    </div>
                    <div class="sensing_gas">
                    <div class="title"><p>Gas</p></div>
                    <div class="value"><p class="gas">{sensing[5]}</p></div>
                    </div>
                </div>

            </div>
            
        );
}


export default Sensing;