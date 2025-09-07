// made by 2ky(@s2skky)

//no touch
let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => {
    console.log("Successfully Connected");
};
socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onerror = error => {
    console.log("Socket Error: ", error);
};


let tick = [];
for (var t = 0; t < 30; t++) {
    tick[t] = document.querySelectorAll("[id^=tick]")[t];
}

let bar = document.getElementById("bar");
let center = document.getElementById("center");
let arrow = document.getElementById("arrow");

let early = document.getElementById("early");
let late = document.getElementById("late");

let hitcountBox = document.getElementById("hitcount_box");
let pp = document.getElementById("pp");
let ur = document.getElementById("ur");
let ratio = document.getElementById("ratio");

let h300g = document.getElementById("h300g");
let h300 = document.getElementById("h300");
let h200 = document.getElementById("h200");
let h100 = document.getElementById("h100");
let h50 = document.getElementById("h50");
let miss = document.getElementById("miss");

let state;
let cur_ur;
let cur_combo;
let curH320;
let curH300;
let curH200;
let curH100;
let curH50;
let curH0;
let curTotalNote = 0;
let curScore = 0;
let curPP;

let tempHitErrorArrayLength;
let OD = 0;
let tickPos;
let fullPos;
let tempAvg;
let tempSmooth;

if(hitcount_switch == false){ hitcountBox.style.display = 'none';}
if(hiterror_switch == false){ bar.style.display = 'none';}
hitcountBox.style.left = hitcount_horizontal_margin;
hitcountBox.style.top = hitcount_vertical_margin;
bar.style.left = hiterror_horizontal_margin;
bar.style.top = hiterror_vertical_margin;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    let menu = data.menu;
    let play = data.gameplay;

    if (state !== menu.state) {
        state = menu.state;
        if (state !== 2) {
            for (var y = 0; y < 30; y++) {
                tick[y].style.transform = "translateX(0)";
                tick[y].style.opacity = 0;
            }
            tickPos = 0;
            tempAvg = 0;
            arrow.style.transform = "translateX(0)";  
            bar.style.opacity = 0;
            early.style.opacity = 0;
            late.style.opacity = 0;
            hitcountBox.style.opacity = 0;
        } else {
            bar.style.opacity = 1;
            early.style.opacity = 1;
            late.style.opacity = 1;
            
            setTimeout(function(){
                early.style.opacity = 0;
                late.style.opacity = 0;
                hitcountBox.style.opacity = 1;
            }, 1200);
        }
    }
    if (data.gameplay.hits.unstableRate == 0) {
        for (var y = 0; y < 30; y++) {
            tick[y].style.transform = "translateX(0)";
            tick[y].style.opacity = 0;
        }
        arrow.style.transform = "translateX(0)";
    }
    if (cur_ur !== data.gameplay.hits.unstableRate) {
        cur_ur = data.gameplay.hits.unstableRate;
        tempAvg = 0;      
        ur.innerHTML = 'UR : ' + cur_ur.toFixed(2);
    }
    
    //source reference -> TryZCustomOverlay(made by FukutoTojido)
    if (cur_combo !== data.gameplay.combo.current) {
        OD = data.menu.bm.stats.memoryOD;
        cur_combo = data.gameplay.combo.current;
        tempSmooth = smooth(data.gameplay.hits.hitErrorArray, 4);
        if (tempHitErrorArrayLength !== tempSmooth.length) {
            tempHitErrorArrayLength = tempSmooth.length;
            for (var a = 0; a < tempHitErrorArrayLength; a++) {
                tempAvg = tempAvg * 0.90 + tempSmooth[a] * 0.1;
            }
            fullPos = (-10 * OD + 199.5);
            tickPos = data.gameplay.hits.hitErrorArray[tempHitErrorArrayLength - 1] / fullPos * 145;
            arrow.style.transform = `translateX(${(tempAvg / fullPos) * 150}px)`;
            if((tempAvg / fullPos) * 150 > 2.5){
                arrow.style.borderColor = "#FF4040 transparent transparent transparent"
            }
            else if((tempAvg / fullPos) * 150 < -2.5){
                arrow.style.borderColor = "#1985FF transparent transparent transparent"
            }
            else{
                arrow.style.borderColor = "white transparent transparent transparent"
            }
            for (var c = 0; c < 30; c++) {
                if ((tempHitErrorArrayLength % 30) == ((c + 1) % 30)) {
                    tick[c].style.opacity = 1;
                    tick[c].style.transform = `translateX(${tickPos}px)`;
                    var s = document.querySelectorAll("[id^=tick]")[c].style;
                    s.opacity = 1;
                    (function fade() {
                        (s.opacity -= .05) < 0 ? s.opacity = 0 : setTimeout(fade, 125)
                    })();
                }
            }
        }
    }
    if (curPP !== play.pp.current){
        curPP = play.pp.current;
        pp.innerHTML = curPP + 'pp';
    }
    if (curTotalNote !== play.hits.geki + play.hits[300] + play.hits.katu + play.hits[100] + play.hits[50] + play.hits[0]){
        curTotalNote = play.hits.geki + play.hits[300] + play.hits.katu + play.hits[100] + play.hits[50] + play.hits[0];
        let k;
        if(curTotalNote == 0){
            ratio.innerHTML = 'Ratio : NaN:1';
            ratio.style.color = 'white';
        }
        else if((curTotalNote - play.hits.geki) != 0){
            k = play.hits.geki / (curTotalNote - play.hits.geki);
            ratio.innerHTML = 'Ratio : ' + k.toFixed(1) + ':1';
            ratio.style.color = getRatioColor(k);
        }
        else{
            ratio.innerHTML = 'Ratio : ∞:1';
            ratio.style.color = '#A020F0'; // Purple for infinite
        }
    }
    if (curH320 !== play.hits.geki){
        curH320 = play.hits.geki;
        h300g.innerHTML = 'MAX : ' + curH320;
    }
    if (curH300 !== play.hits[300]){
        curH300 = play.hits[300];
        h300.innerHTML = 'Perf : ' + curH300;
    }
    if (curH200 !== play.hits.katu){
        curH200 = play.hits.katu;
        h200.innerHTML = 'Great : ' + curH200;
    }
    if (curH100 !== play.hits[100]){
        curH100 = play.hits[100];
        h100.innerHTML = 'Good : ' + curH100;
    }
    if (curH50 !== play.hits[50]){
        curH50 = play.hits[50];
        h50.innerHTML = 'Bad : ' + curH50;
    }
    if (curH0 !== play.hits[0]){
        curH0 = play.hits[0];
        miss.innerHTML = 'Miss : ' + curH0;
    }
    
    if(curScore !== play.score){
        curScore = play.score;
    }
}

function getRatioColor(k) {
    if (k >= 30) {
        return '#A020F0'; // Purple
    } else if (k >= 20) {
        // Gradient from light red (#FF8080) to bright red (#FF0000)
        let percent = (k - 20) / 9; // 20:1 to 29:1
        let r = 255;
        let g = Math.round(128 - percent * 128);
        let b = Math.round(128 - percent * 128);
        return `rgb(${r},${g},${b})`;
    } else if (k >= 15) {
        return '#FFA500'; // Orange
    } else if (k >= 10) {
        return '#00FF00'; // Green
    } else {
        return 'white';
    }
}
