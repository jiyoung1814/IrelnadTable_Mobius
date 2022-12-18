import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './Control.css';
var target, btn, color, tooltip;
var percentPosition, targetRect;
var control_value = [];
var control2_value = [];
var name = ['red','blue','fan'];


function Control(){
    const [control, setControl] = useState(50);
    const [control2, setControl2] = useState('off');
    
    

    const handleControl = async (e) =>{
        let data = '';
        let sensing_target = '';

        let control_led_id = ['switch-1','switch-2','switch-3'];
        let control_led_name = ['red_onoff','blue_onoff','fan_onoff'];


        for(let i=0;i<3;i++){
            if(e.target.id === control_led_id[i]){
                if(control2_value[i]==='on'){
                    control2_value[i] = 'off';
                }
                else{
                    control2_value[i] = 'on';
                }     
                sensing_target = control_led_name[i].split('_')[0]+'/'+control2_value[i];
            }
            data += control_led_name[i]+'/'+ control2_value[i]+',';
        }
        
        console.log('led_level_data: ' + data);
        console.log('sensing_target: ' + sensing_target);
        
        let control2_send_data = [];

        for(let i=0;i<control2_value.length;i++){
            if(control2_value[i] === 'on')
            control2_send_data[i] = 'true';
            else  
            control2_send_data[i] = '';
        }

        console.log('control2_send_data: '+control2_send_data);

        setControl2(control2_send_data);

        data += ':'+sensing_target;

        let body = {"m2m:cin": {"con": data}};

        axios.post(
            '/Mobius/ireland/ledfan2', JSON.stringify(body), {
                headers: {
                    'Accept': 'application/json',
                    'x-m2m-ri': '12345',
                    'x-m2m-origin': 'Sireland',
                    'content-type': 'application/json; ty=4'
                }
              
            }
        );
    
        // console.log(response);
    }
    
    const onMouseDown = (e) =>{
        // console.log("target: "+e.target.id);
        target  = e.target;
    
        if(target.id === 'slider_red_box' || target.id ==='slider_blue_box' || target.id ==='slider_fan_box'){
            btn = e.target.children[0];
            color = e.target.children[1];
            tooltip =  e.target.children[2];
        }
        else{
            target = e.target.parentElement;
            btn = target.children[0];
            color = target.children[1];
            tooltip =  target.children[2];
        }
        
        onMouseMove(e);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        
        
    }
    
    const onMouseMove = (e) => {
        e.preventDefault();
        // console.log(target);
        targetRect = target.getBoundingClientRect();
        let x = e.pageX - targetRect.left + 10;
        if (x > targetRect.width) { x = targetRect.width};
        if (x < 0){ x = 0};
        // let btnRect = btn.getBoundingClientRect();
        btn.x = x - 10;
        btn.style.left = btn.x + 'px';
    
        // get the position of the button inside the container (%)
        percentPosition = (btn.x + 10) / targetRect.width * 100;
        
        // color width = position of button (%)
        color.style.width = percentPosition + "%";
    
        // move the tooltip when button moves, and show the tooltip
        tooltip.style.left = btn.x - 5 + 'px';
        tooltip.style.opacity = 1;
    
        // show the percentage in the tooltip
        tooltip.textContent = Math.round(percentPosition) + '%';
    
    };
    

    const onMouseUp  = (e) => {
        let target_control ='';
        window.removeEventListener('mousemove', onMouseMove);
        tooltip.style.opacity = 0;
    
        btn.addEventListener('mouseover', function() {
          tooltip.style.opacity = 1;
        });
        
        btn.addEventListener('mouseout', function() {
          tooltip.style.opacity = 0;
        });
    
        if(target.id === 'slider_red_box'){
            control_value[0] = Math.round(percentPosition);
            target_control = 'red/'+control_value[0]
        }
        else if (target.id === 'slider_blue_box'){
            control_value[1] = Math.round(percentPosition);
            target_control = 'blue/'+control_value[1]
        }
        else if(target.id === 'slider_fan_box'){
            control_value[2] = Math.round(percentPosition);
            target_control = 'fan/'+control_value[2]
        }
            
    
        console.log('control red value: red-'+control_value[0]+ ' blue-'+control_value[1]+' fan-'+control_value[2]);
        
        let data = 'red/'+control_value[0]+ ',blue/'+control_value[1]+ ',fan/'+control_value[2];

        data += ':'+target_control;

        let body = {"m2m:cin": {"con": data}};
            
        axios.post(
            '/Mobius/ireland/ledfan', JSON.stringify(body), {
                headers: {
                    'Accept': 'application/json',
                    'x-m2m-ri': '12345',
                    'x-m2m-origin': 'Sireland',
                    'content-type': 'application/json; ty=4'
                }
              
            }
        );
    
    
        // var str = onoff[0] + " " + value[0]+ "/"+ onoff[1] + " " + value[1]+ "/"+ onoff[2] + " " + value[2];
        // console.log(str)

        // console.log(Math.round(percentPosition/100*targetRect.width-10));
        // console.log(btn.x);
    };

    const getControl = async () => {
        // control_value.splice(0);
        let indices = [];
        let indices2 = [];
        
        //led fan 세기 확인
        try {
        const response = await axios.get(
            '/Mobius/ireland/ledfan/latest',{
            headers: {
                'Accept': 'application/json',
                'X-M2M-RI': '12345',
                'X-M2M-Origin': 'Sireland'
              }
            }
        );
        console.log(response.data);
        let str = JSON.stringify(response.data);
        let obj = JSON.parse(str);
        let con = obj['m2m:cin'].con;
        con = con.split(':')[0];

        let idx = con.indexOf('/');
        while (idx !== -1) {
            indices.push(idx);
            idx = con.indexOf('/', idx + 1);
        }
        idx = con.indexOf(',');
        while (idx !== -1) {
            indices2.push(idx);
            idx = con.indexOf(',', idx + 1);
        }
    
        for(let i=0;i<3;i++){
                control_value.push(con.substring(indices[i]+1,indices2[i]));
        }

        console.log('sensing red value: red-'+control_value[0]+ ' blue-'+control_value[1]+' fan-'+control_value[2]);

        setControl(control_value);

        }catch (e) {
            // console.log("Control.js error: "+e.getMessae());
        }

    };

    const getControl2 = async () => {
        let sensing_target = ['red_onoff','blue_onoff','fan_onoff'];
        let control2_send_data = [];
        let indices = [];
        let indices2 = [];

        try {
        const response = await axios.get( //led fan on/off 확인
            '/Mobius/ireland/ledfan2/latest',{
            headers: {
                'Accept': 'application/json',
                'X-M2M-RI': '12345',
                'X-M2M-Origin': 'Sireland'
              }
            }
        );
        console.log(response.data);
        let str = JSON.stringify(response.data);
        let obj = JSON.parse(str);
        let con = obj['m2m:cin'].con;
        con = con.split(':')[0];

        let idx = con.indexOf('/');
        while (idx !== -1) {
            indices.push(idx);
            idx = con.indexOf('/', idx + 1);
        }
        idx = con.indexOf(',');
        while (idx !== -1) {
            indices2.push(idx);
            idx = con.indexOf(',', idx + 1);
        }
    
        for(let i=0;i<3;i++){
                control2_value.push(con.substring(indices[i]+1,indices2[i]));
        }

        console.log('control2_value: ' + control2_value);

        for(let i=0;i<3;i++){
            if(control2_value[i] === 'on')
            control2_send_data[i] = 'true';
            else  
            control2_send_data[i] = '';
        }
        }catch (e) {
            // console.log("Control.js error: "+e.getMessae());
        }

        console.log('control2: '+control2_value);
        console.log('control2_send_data: '+control2_send_data);

        setControl2(control2_send_data);

    };
    
    useEffect(() => {
        getControl();
        getControl2();
    },[]);

    return(
        <div class = "box_control">
    
        <div class="slider">
            <div class="slider_blank">
                <div class="slider_title">RED LED</div>
                <div class="switch">
                <div class="switch__1">
                  <input id="switch-1" type="checkbox" onChange={handleControl} checked={control2[0]}/>
                  <label for="switch-1"></label>
                </div>
              </div>
            </div>

            <div onMouseDown={onMouseDown} class="slider__box" id="slider_red_box" >
                <div class="slider__btn" id="red_btn" style={{left: control[0]+'%'}}></div>
                <span class="slider__color" id='red_color' style={{width: control[0]+'%'}}></span>
                <span class="slider__tooltip" id='red_toolip'>{control[0]}%</span>
            </div>
        </div>

        <div class="slider">
        <div class="slider_blank">
            <div class="slider_title">BLUE LED</div>
            <div class="switch">
            <div class="switch__2">
                <input onChange={handleControl} id="switch-2" type="checkbox" checked={control2[1]} ></input>
                <label for="switch-2"></label>
            </div>
            </div>
        </div>

        <div onMouseDown={onMouseDown} class="slider__box" id="slider_blue_box">
            <div class="slider__btn" id="blue_btn" style={{left: control[1]+'%'}}></div>
            <span class="slider__color" id='blue_color' style={{width: control[1]+'%'}}></span>
            <span class="slider__tooltip" id='blue_toolip'>{control[1]}%</span>
        </div>
        </div>

        <div class="slider">
        <div class="slider_blank">
            <div class="slider_title">FAN</div>
            <div class="switch">
            <div class="switch__3">
                <input onChange={handleControl} id="switch-3" type="checkbox" checked={control2[2]}></input>
                <label for="switch-3"></label>
            </div>
            </div>
        </div>


        <div onMouseDown={onMouseDown} class="slider__box" id="slider_fan_box">
            <div class="slider__btn" id="fan_btn" style={{left: control[2]+'%'}}></div>
            <span class="slider__color" id='fan_color' style={{width: control[2]+'%'}}></span>
            <span class="slider__tooltip" id='fan_toolip'>{control[2]}%</span>
        </div>
        </div>


    </div>
    );

}

export default Control;






// export default class Control extends React.Component{
//     handleControl = (e) =>{
//         // console.log(e.target.checked);
//         var sendData;
//         var state;

//         if(e.target.checked){
//             state ='on';
//         }
//         else{
//             state = 'off';
//         }
        
//         if(e.target.id === 'switch-1'){
//             sendData = 'red: '+state;
//         }
//         else if(e.target.id === 'switch-2'){
//             sendData = 'blue: '+state;
//         }
//         else if(e.target.id === 'switch-3'){
//             sendData = 'fan: '+state;
//         }
//         else{
//             sendData ="null";
//         }       
//         console.log(sendData);


//         axios.post(
//             'http://localhost:7579/Mobius/ireland/sensor',{
//                 headers: {
//                     'Accept': 'application/json',
//                     'X-M2M-RI': '12345',
//                     'X-M2M-Origin': 'Sireland',
//                     'Content-Type': 'application/json; ty=4'
//                 },
//                 data: JSON.stringify({
//                     "m2m:cin": {
//                         "con": sendData
//                     }
//                 })

//             }
//         )
//         .catch(error =>{
//             console.log(error);
//         })
//     }

//     onMouseDown = (e) =>{
//         // console.log("target: "+e.target.id);
//         target  = e.target;

//         if(target.id === 'slider_red_box' || target.id ==='slider_blue_box' || target.id ==='slider_fan_box'){
//             btn = e.target.children[0];
//             color = e.target.children[1];
//             tooltip =  e.target.children[2];
//         }
//         else{
//             target = e.target.parentElement;
//             btn = target.children[0];
//             color = target.children[1];
//             tooltip =  target.children[2];
//         }
        

//         this.onMouseMove(e);
//         window.addEventListener('mousemove', this.onMouseMove);
//         window.addEventListener('mouseup', this.onMouseUp);
        
        
//     }

//     onMouseMove = (e) => {
//         e.preventDefault();
//         // console.log(target);
//         targetRect = target.getBoundingClientRect();
//         let x = e.pageX - targetRect.left + 10;
//         if (x > targetRect.width) { x = targetRect.width};
//         if (x < 0){ x = 0};
//         // let btnRect = btn.getBoundingClientRect();
//         btn.x = x - 10;
//         btn.style.left = btn.x + 'px';
  
//         // get the position of the button inside the container (%)
//         percentPosition = (btn.x + 10) / targetRect.width * 100;
        
//         // color width = position of button (%)
//         color.style.width = percentPosition + "%";
  
//         // move the tooltip when button moves, and show the tooltip
//         tooltip.style.left = btn.x - 5 + 'px';
//         tooltip.style.opacity = 1;
  
//         // show the percentage in the tooltip
//         tooltip.textContent = Math.round(percentPosition) + '%';

//     };

//     onMouseUp  = (e) => {
//         window.removeEventListener('mousemove', this.onMouseMove);
//         tooltip.style.opacity = 0;
  
//         btn.addEventListener('mouseover', function() {
//           tooltip.style.opacity = 1;
//         });
        
//         btn.addEventListener('mouseout', function() {
//           tooltip.style.opacity = 0;
//         });

//         if(target.id === 'slider_red_box')
//             value[0] = Math.round(percentPosition);
//         else if (target.id === 'slider_blue_box')
//             value[1] = Math.round(percentPosition);
//         else if(target.id === 'slider_fan_box')
//             value[2] = Math.round(percentPosition);

//         console.log(value)

//         // console.log(Math.round(percentPosition/100*targetRect.width-10));
//         // console.log(btn.x);
//     };

    



//     render(){
//         return(
//             <div class="control">
    
//                 <div class="slider">
//                 <div class="slider_blank">
//                     <div class="slider_title">RED LED</div>
//                     <div class="switch">
//                     <div class="switch__1">
//                         <input onChange={this.handleControl} id="switch-1" type="checkbox"></input>
//                         <label for="switch-1"></label>
//                     </div>
//                     </div>
//                 </div>
    
//                 <div onMouseDown={this.onMouseDown} class="slider__box" id="slider_red_box">
//                     <div class="slider__btn" id="red_btn"></div>
//                     <span class="slider__color" id='red_color'></span>
//                     <span class="slider__tooltip" id='red_toolip'>50%</span>
//                 </div>
//                 </div>
    
//                 <div class="slider">
//                 <div class="slider_blank">
//                     <div class="slider_title">BLUE LED</div>
//                     <div class="switch">
//                     <div class="switch__2">
//                         <input onChange={this.handleControl} id="switch-2" type="checkbox"></input>
//                         <label for="switch-2"></label>
//                     </div>
//                     </div>
//                 </div>
    
//                 <div onMouseDown={this.onMouseDown} class="slider__box" id="slider_blue_box">
//                     <div class="slider__btn" id="blue_btn"></div>
//                     <span class="slider__color" id='blue_color'></span>
//                     <span class="slider__tooltip" id='blue_toolip'>50%</span>
//                 </div>
//                 </div>
    
//                 <div class="slider">
//                 <div class="slider_blank">
//                     <div class="slider_title">FAN</div>
//                     <div class="switch">
//                     <div class="switch__3">
//                         <input onChange={this.handleControl} id="switch-3" type="checkbox"></input>
//                         <label for="switch-3"></label>
//                     </div>
//                     </div>
//                 </div>
    
    
//                 <div onMouseDown={this.onMouseDown} class="slider__box" id="slider_fan_box">
//                     <div class="slider__btn" id="fan_btn"></div>
//                     <span class="slider__color" id='fan_color'></span>
//                     <span class="slider__tooltip" id='fan_toolip'>50%</span>
//                 </div>
//                 </div>
    
    
//             </div>
//         );
//     }
// }