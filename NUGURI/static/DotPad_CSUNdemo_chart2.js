import { DotPad } from "./DotPad_Class.js";
let myDotPad = new DotPad();



document.getElementById("connectbutton")?.addEventListener("click", onConnectButtonClick);
document.getElementById("disconnectbutton")?.addEventListener("click", onDisconnectButtonClick);


//블루투스 연결을 위한 함수들
async function onConnectButtonClick() {
  try {
    console.log('Requesting Bluetooth Device...');
    //console.log('with ' + JSON.stringify(options));
    myDotPad.connect();

  } catch (error) {
    console.log('> Error:' + error);
  }
}
async function onDisconnectButtonClick() {
  try {
    myDotPad.disconnect();
  }
  catch (error) {
    console.log('> Error:' + error);
  }
}


//닷 패드에 보내기 위해 2진수를 16진수로 변환
function hexa(a) {
  let b = parseInt(a, 2);
  b = b.toString(16);
  return b;
}


//닷 패드의 4*1의 핀을 두 개씩 읽어서 전송할 데이터에 저장 (한 개의 핀 씩 저장 4*2)
function trans_hex_pad(a) {
  let trans_list = '';
  const J = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36];
  for (let j of J) {

    let s = '';
    let ss = '';
    for (let i = 0; i < a[0].length - 1; i += 2) {
      s = '' + a[j + 3][i] + a[j + 2][i] + a[j + 1][i] + a[j][i];
      ss = '' + a[j + 3][i + 1] + a[j + 2][i + 1] + a[j + 1][i + 1] + a[j][i + 1];

      trans_list += hexa(ss) + hexa(s);
    }

  }
  return trans_list;
}

//닷 패드의 상단 그래픽 부분에서 객체가 x 범위를 넘어가지 않는지 확인하는 함수
function ind_ok_x(x, icon_li) {
  const icon_x = Math.floor(icon_li.length / 2) - 1;
  if (x - icon_x < 0) {
    x = icon_x + 1;
  } else if (x + icon_x > 39) {
    x = li_dot.length - icon_x - 2;
  }
  return x;
}

//닷 패드의 상단 그래픽 부분에서 객체가 y범위를 넘어가지 않는지 확인하는 함수
function ind_ok_y(y, icon_li) {
  const icon_y = Math.floor(icon_li[0].length / 2);

  if (y - icon_y - 1 < 0) {
    y = icon_y + 1 - (y - icon_y - 1);
  } else if (y + icon_y > 59) {
    y = y + (59 - (y + icon_y));
  }
  return y;
}

//상단 그래픽 부분의 아이콘이 겹치는지 확인하는 함수
function ind_re(x, y, icon_li, li_dot) {
  const icon_x = Math.floor(icon_li.length / 2) - 1;
  const icon_y = Math.floor(icon_li[0].length / 2) - 1;


  let c_x = 0;
  for (let i = x - icon_x; i < icon_li.length + x - icon_x; i++) {
    let c_y = 0;
    for (let j = y - icon_y; j < icon_li[0].length + y - icon_y; j++) {
      if (i >= 0 && i < li_dot.length && j >= 0 && j < li_dot[0].length) {
        if (li_dot[i][j] == 1) {
          return true;
        }
      }
      c_y++;
    }
    c_x++;
  }

  return false;
}


//닷 패드에 전송할 데이터에 아이콘 추가
function merge(x, y, icon_li, li_dot) {
  var y_m = 0;
  var y_a = 0;
  var x_m = 0;
  var x_a = 0;

  const icon_x = Math.floor(icon_li.length / 2) - 1;
  const icon_y = Math.floor(icon_li[0].length / 2) - 1;

  if (x - icon_x < 0) {
    x = icon_x + 1;
  } else if (x + icon_x > 39) {
    x = li_dot.length - icon_x - 2;
  }

  if (y - icon_y < 0) {
    y = icon_y + 1;
  } else if (y + icon_y > 59) {
    y = li_dot[0].length - icon_y - 3;
  }


  while (ind_re(x, y, icon_li, li_dot)) { //원래 있던 아이콘과 겹치면 겹치지 않도록 위치 조정
    if (y_a == 0) {
      y += 5;
      if (y > 59 - icon_y) {
        y_a = 1;
        y = ind_ok_y(y, icon_li);
      }
    } else if (y_m == 0) {
      y -= 5;
      if (y < 0 + icon_y) {
        y_m = 1;
        y = ind_ok_y(y, icon_li);
      }
    } else if (x_m == 0) {
      x -= 5;
      if (x < 0 + icon_x) {
        x_m = 1;
        x = ind_ok_x(x, icon_li);
      }
    } else if (x_a == 0) {
      x -= 5;
      if (x > 39 - icon_x) {
        x_a = 1;
        x = ind_ok_x(x, icon_li);
      }
    }
  }

  let c_x = 0;
  for (let i = x - icon_x; i < icon_li.length + x - icon_x; i++) { // 기존 데이터에 아이콘 추가
    let c_y = 0;
    for (let j = y - icon_y; j < icon_li[0].length + y - icon_y; j++) {
      if (i >= 0 && i < li_dot.length && j >= 0 && j < li_dot[0].length) {
        if (li_dot[i][j] == 0) {
          li_dot[i][j] = icon_li[c_x][c_y];
        }
      }
      c_y++;
    }
    c_x++;
  }
  return li_dot;
}


//json으로 이루어진 음성파일 실행 함수
async function loadAndPlayAudio(jsonFilePath) {
  try {
    const response = await fetch(jsonFilePath);
    const data = await response.json();

    // Base64 인코딩된 오디오 데이터를 추출합니다.
    const base64Audio = data.audio_base64;

    // 오디오 객체를 생성하고 src를 설정합니다.
    const audio = new Audio('data:audio/mp3;base64,' + base64Audio);

    // 오디오를 재생합니다.
    audio.play();
  } catch (error) {
    console.error('Failed to load or play audio:', error);
  }
}

//지연 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//닷패드의 리프래쉬 시간을 고려한 지연함수
function performGattOperation() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2700);
  });
}

function performGattOperation2(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

//닷패드의 하단 그래픽 부분을 위한 함수 (35개는 데이터, 마지막 5개는 질감으로 표현)
async function head_(headjson, texture) {

  var head = ""
  if (headjson[0] == "0") {
    head += num() + num0();
  }
  else if (headjson[0] == "1") {
    head += num() + num1();
  }
  else if (headjson[0] == "2") {
    head += num() + num2();
  }
  else if (headjson[0] == "3") {
    head += num() + num3();
  }
  else if (headjson[0] == "4") {
    head += num() + num4();
  }
  else if (headjson[0] == "5") {
    head += num() + num5();
  }
  else if (headjson[0] == "6") {
    head += num() + num6();
  }
  else if (headjson[0] == "7") {
    head += num() + num7();
  }
  else if (headjson[0] == "8") {
    head += num() + num8();
  }
  else if (headjson[0] == "9") {
    head += num() + num9();
  }

  if (headjson[1] == "PAR4") {
    head += PAR4();
  }

  head += "0".repeat(35 - head.length);

  if (texture == '러프') {
    head += "F0F0F";
  }
  else if (texture == '페어웨이') {
    head = "ccccc";
  }
  else if (texture == '그린') {
    head += "FcFcF";
  }
  else if (texture == '벙커') {
    head += "a5a5a";
  }
  else if (texture == '워터해저드') {
    head += "c3c3c";
  }
  head += "0".repeat(40 - head.length);
  console.log(head);

  return head;
}


//json을 읽은 후 좌표와 아이콘의 값에 따라 한 장면을 그리는 함수
async function drawing_(padjson) {
  const obj = await fetch('/static/obj.json'); // JSON 파일을 가져옵니다.
  const objData = await obj.json(); // JSON 데이터를 파싱합니다.
  let result = pad_test();
  console.log(padjson);
  for (let j = 0; j < padjson.length; j += 1) {
    if (padjson[j][0] == "홀" && padjson[j][1] != 0 && padjson[j][2] != 0) {
      let x = padjson[j][2];
      let y = padjson[j][1];
      result = merge(x, y, objData[2][1], result);

    }
    else if (padjson[j][0] == "골프공" && (padjson[j][1] != 0 || padjson[j][2] != 0)) {
      let x = padjson[j][2];
      let y = padjson[j][1];
      result = merge(x, y, objData[1][1], result);

    }
    else if (padjson[j][0] == "사람" && (padjson[j][1] != 0 || padjson[j][2] != 0)) {
      let x = padjson[j][2];
      let y = padjson[j][1];
      result = merge(x, y, objData[0][1], result);

    }

  }
  //console.log(result);
  return result;
}

//tee shot과 러프샷의 총거리에 대한 궤적을 그리는 함수
async function trajectory_drawing_1(a, state) {
  var one = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
  ]
  // Flags 배열과 베지어 곡선 계산을 위한 초기 설정
  let flags = [];

  // Flags 설정
  for (let row_index = 0; row_index < one.length; row_index++) {
    for (let col_index = 0; col_index < one[row_index].length; col_index++) {
      if (one[row_index][col_index] === 1) {
        flags.push([row_index, col_index]);
      }
    }
  }

  // des와 to_des 설정
  let des = a[0];
  let to_des = a[1];
  let right = Math.floor(56 * (des - to_des) / des);

  // 좌표 설정
  let bot = [39, right - 1];
  let top = [39, 0];
  let mid = [0, Math.floor((right - 1) / 2)];

  let coordinates = [top, mid, bot];
  let result = coordinates;

  // 베지어 곡선 계산
  function calculateBezierCurve(top, mid, bottom, curve) {

    let t_values = Array(100).fill().map((_, i) => i / 99);

    t_values.forEach(t => {
      let curve_x = Math.floor((1 - t) ** 2 * top[1] + 2 * (1 - t) * t * mid[1] + t ** 2 * bottom[1]);
      let curve_y = Math.floor((1 - t) ** 2 * top[0] + 2 * (1 - t) * t * mid[0] + t ** 2 * bottom[0]);

      if (!curve.some(coord => coord[0] === curve_x && coord[1] === curve_y)) {
        curve.push([curve_y, curve_x]);  // Notice the order of Y and X
      }
    });

    return curve;
  }

  let curve_coordinates = calculateBezierCurve(top, mid, bot, []);

  // 그리드 생성 및 그리기
  let width = 60;
  let height = 40;

  let grid = Array.from({ length: height }, () => Array(width).fill(0));

  curve_coordinates.forEach(coord => {
    if (coord[0] < height && coord[1] < width) {
      grid[coord[0]][coord[1]] = 1;
    }
  });

  flags.forEach(flag => {
    if (flag[0] < height && flag[1] < width) {
      grid[flag[0]][flag[1]] = 1;
    }
  });

  if (state == "tee_shot") { //티샷의 궤적을 그릴 시 값 반환
    return grid;
  }

  //기존에 그린 티샷 궤적에 대해서 러프샷 부분을 추가로 그리는 코드
  let bot1 = [39, 55];

  let top1 = [39, right];
  let mid1 = [20, Math.floor((55 + right) / 2)];
  top = top1;
  mid = mid1;
  let bottom = bot1;

  curve_coordinates = calculateBezierCurve(top, mid, bottom, curve_coordinates);

  grid = Array.from({ length: height }, () => new Array(width).fill(0));

  curve_coordinates.forEach(coord => {
    if (coord[0] < height && coord[1] < width) {
      grid[coord[0]][coord[1]] = 1;
    }
  });

  flags.forEach(flag => {
    if (flag[0] < height && flag[1] < width) {
      grid[flag[0]][flag[1]] = 1;
    }
  });

  return grid; //러프샷까지 날아간 궤적을 그린 후 반환
}


//bbox.py 파이썬 파일을 실행 후 결과값(점에 대해서 궤적을 그린 2차원 배열) 받아오기
async function trajectory_drawing_2(a) {
  fetch('/run_script')
    .then(response => response.text())
    .then(data => {
      console.log(data); // Python 스크립트의 결과를 콘솔에 출력합니다.
    })
    .catch(error => {
      console.error('Error:', error);
    });

  const audio_ = await fetch('/static/grid_content.json'); //이 파일에 그려진 결과를 받아옴
  const audio_list = await audio_.json();
  //console.log(audio_list);

  return audio_list;
}

//json의 데이터를 읽은 후 닷패드에 전송할 데이터로 가공
async function jsonread(json_name) {
  var head_data = await fetch('/static/shot_number0.json'); //헤드에 들어갈 값(현 영상에서는 값이 일정함)
  head_data = await head_data.json();
  console.log("head_data", head_data)
  let head = "";
  const response = await fetch(json_name); //영상에 대한 데이터 정보를 담고 있는 파일을 읽음
  const jsonData = await response.json();

  const odj = await fetch('/static/obj.json'); //닷패드에 그릴 객체의 정보가 담겨 있는 파일
  const odjData = await odj.json();

  var result_json = [];
  var trajectory = [];

  //영상 시간대에 대한 닷패드의 핀 정보를 담아서 반환해주는 함수
  function result_push(time, result, head) {
    let re = "";
    re = trans_hex_pad(result);

    var data;
    data = head + re;
    //console.log([time, data]);
    return [time, data];

  }

  //영상 데이터 정보를 하나씩 읽어서 닷패드에 전송할 값을 모두 정리
  for (let i = 0; i < jsonData.length; i += 1) {

    let drawing = 0;

    let result = pad_test();

    let time = parseInt(jsonData[i][1].match(/\d+/)[0], 10); 

    let padjson = jsonData[i][2];
    let headjson = jsonData[i][0];


    time = parseInt(time);

    if (headjson == "tee_shot") { //티샷을 친다는 정보

      // 주어진 배열
      const arr = jsonData[i][3];

      // 숫자만 추출하여 저장할 새 배열
      const nums = arr.map(item => parseInt(item.match(/\d+/)[0], 10));

      // 결과 출력
      console.log(nums); // [409, 120]
      trajectory = await trajectory_drawing_1(nums, "tee_shot");

      result = await drawing_(padjson);
      head = await head_(head_data, "");
      result_json.push(result_push(time, result, head));

      //티샷 궤적을 추가 하기 위해 작성
      result_json.push(result_push(time + 5, odjData[7][1], head));
    }

    else if (headjson == "rough") { // 러프 위에 있다는 정보
      result = await drawing_(padjson);
      head = await head_(head_data, "러프");
      result_json.push(result_push(time, result, head));
    }

    else if (headjson == "just_human") { // 사람만 나오는 아무 정보가 없을 떄, 총거리에 대한 궤적이 나옴
      drawing = 1;
      result = trajectory;
      //console.log(result);
      head = await head_(head_data, "");
      result_json.push(result_push(time, result, head));
    }

    else if (headjson == "rough_shot") { // 러프샷을 친다는 정보
      const arr = jsonData[i][3];
      const nums = arr.map(item => parseInt(item.match(/\d+/)[0], 10));
      trajectory = await trajectory_drawing_1(nums, "rough_shot");
      result = await drawing_(padjson);
      head = await head_(head_data, "");
      result_json.push(result_push(time, result, head));
      //러프샷 궤적 추가로 제공
      result_json.push(result_push(time + 4, odjData[9][1], head));
    }

    else if (headjson == "on_green") { // 그린 위에 있다는 정보
      result = await drawing_(padjson);
      head = await head_(head_data, "그린");
      result_json.push(result_push(time, result, head));
    }

    else if (headjson == "putting_shot") { // 퍼팅샷을 친다는 정보
      result = await drawing_(padjson);
      head = await head_(head_data, "");
      result_json.push(result_push(time, result, head));
      const bboxresult = await fetch('/static/bboxresult.json'); // 컴퓨터 비전으로 인식한 골프공의 퍼팅샷의 골프공 좌표를 받아옴
      const bboxresult_ = await bboxresult.json();
      var a = await trajectory_drawing_2(bboxresult_); // 공의 좌표 값을 받아와 
      result_json.push(result_push(time + 4, a, head));
    }

    else if (headjson == "end") {  //홀인을 하여 끝이남
      let x;
      let y;
      for (let j = 0; j < padjson.length; j += 1) {
        x = padjson[j][1];
        y = padjson[j][2];
      }
      result = merge(x, y, odjData[3][1], result);
      head = await head_(head_data, "");
      result_json.push(result_push(time, result, head));
    }

  }
  console.log(result_json);


  return result_json;
}

// export async function testDisplayOnDotPad(characters,positions) {
//   const response = await fetch("./static/woonk.json");
//   const jsonData = await response.json();

//   characters.forEach(characterName => {
//     let targetArray = null;

//     // JSON 데이터에서 해당 캐릭터 이름 찾기
//     jsonData.forEach(item => {
//       const [name, array] = item;
//       if (name === characterName) {  
//         targetArray = array;
//       }
//     });

//     if (targetArray) {
//       console.log(`Found character array for ${characterName}:`, targetArray);

//       var F1 = [];
//       var result = merge(20, 30, targetArray, pad_test());
//       F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));

//       myDotPad.send(F1[0]);
//     } else {
//       console.error(`Character ${characterName} not found in JSON data.`);
//     }
//   });

// }
export async function testDisplayOnDotPad(characters, positions) {
  const response = await fetch("./static/woonk.json");
  const jsonData = await response.json();
  let result = []; 
  console.log(characters);

  for (let i = 0; i < characters.length; i++) {
      const characterName = characters[i]; 
      const x = positions[i]; 
      const y = 35; 

      let targetArray = null;

      jsonData.forEach(item => {
          const [name, array] = item;
          if (name === characterName) {  
              targetArray = array;
          }
      });

      if (targetArray) {
          console.log(`Found character array for ${characterName}:`, targetArray);

          if (result.length === 0) {
              result = merge(y, x, targetArray, pad_test()); 
          } else {
              result = merge(y, x, targetArray, result); 
          }

          console.log(`Result after merging ${characterName}:`, result);

          var F1 = [];
  
      } else {
          console.error(`Character ${characterName} not found in JSON data.`);
      }
  } F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));
    myDotPad.send(F1[0]);
}


async function onS6ButtonClick() {
  
  const odj = await fetch("./static/woonk.json");
  const woonklocation = await fetch('/static/woonklocation.json'); // 좌표를 받아옴
  const speakerlocation = await fetch('/static/speaker.json');

  // 가로 60 세로 40
  const odjData = await odj.json();
  const woonklocation_ = await woonklocation.json();
  const speakerlocation_ = await speakerlocation.json();
  myDotPad.tutorial = 1;

  var F1 = [];
  var F1_sound = ['웅크test.mp3'];
  
  const speaker = speakerlocation_[0];
  const speakerItem = woonklocation_.find(item=>item[0]=== speaker);
  // const woonkItem = woonklocation_.find(item=>item[0]=== "웅크");
  // const jabiItem = woonklocation_.find(item=>item[0]=== "자비");

  var result_speaker;
  var result1;
  var result;

  result_speaker = merge(36, speakerItem[1], odjData[1][1], pad_test()); //Y좌표(고정), 캐릭터의 X좌표, 말풍선, 6040배열 - 화자말풍선
  result1 = result_speaker

  // for (let j = 0; j < woonklocation_.length; j++){
  //   const item_ = woonklocation_[j];
  //   const charName_ = item_[0];
  //   const x_ = item_[1];
  //   if (charName_ == speakerItem[0]){
  //     result1 = result1;
  //   } else {
  //     result1 = merge(37, x_, odjData[2][1], result1);
  //   }
  // }



  result = result1; // result초기값(말풍선이 들어있는 배열)

  for (let i = 0; i < woonklocation_.length; i++){
    const item = woonklocation_[i]; //캐릭터 위치 배열[캐릭터이름, x, y]
    const charName = item[0]; //캐릭터이름
    const x = item[1]; //캐릭터 x좌표
    const y = item[2]; //캐릭터 y좌표
    const charOdj = odjData.find(item=>item[0]=== charName);

    result = merge(y, x, charOdj[1], result);
  }
  F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));

  // result = [];
  // result = merge(woonkItem[1], woonkItem[2], odjData[1][1], pad_test());
  // F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));

  // result = [];
  // result = merge(jabiItem[1], jabiItem[2], odjData[5][1], pad_test());
  // F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));


  //myDotPad.send(F1[0]);
  //await performGattOperation();
  //playAudio(F1_sound[0]);

  let ok = myDotPad.tutorial_ind - 1;
  
  
  if (myDotPad.tutorial_state =='F1') {
    myDotPad.tutorial_ind = 0;
    myDotPad.send(F1[myDotPad.tutorial_ind]);
    ok = myDotPad.tutorial_ind;
    playAudio("/static/test/" + F1_sound[myDotPad.tutorial_ind]);
    await performGattOperation();
    playAudio('/static/tts/touch.mp3');
  } 
  // 화살표버튼 눌렀을 때  
  else if (myDotPad.test_state == 'F1' && ok != myDotPad.tutorial_ind){
    ok = myDotPad.test_ind;
    myDotPad.send(F1[myDotPad.tutorial_ind]);
    playAudio('/static/test/' + F1_sound[myDotPad.tutorial_ind]);
    await performGattOperation();
    playAudio('/static/tts/touch.mp3');
  }

  //음성 버튼을 눌렀을 때
  else if (myDotPad.send_sound == 1) {

    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => audio.pause());

    if (myDotPad.tutorial_state == 'F1') {
      playAudio('/static/test/' + F1_sound[myDotPad.tutorial_ind]);

    }
    myDotPad.send_sound = 0;
  }
  
}



function num() {
  const num = [
    [0, 1],
    [0, 1],
    [1, 1],
    [0, 0]
  ]

  const r_num = hexa("0111") + hexa("0100");

  return r_num;
}
function num_() {
  const num = [
    [0, 0],
    [0, 0],
    [1, 1],
    [0, 0]
  ]
  const r_num = hexa("0100") + hexa("0100");

  return r_num;
}
function num0() {
  const num = [
    [0, 1],
    [1, 1],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0011") + hexa("0010");

  return r_num;
}
function num1() {
  const num1 = [
    [1, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0000") + hexa("0001");

  return r_num;
}
function num2() {
  const num = [
    [1, 0],
    [1, 0],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0000") + hexa("0011");

  return r_num;
}
function num3() {
  const num = [
    [1, 1],
    [0, 0],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0001") + hexa("0001");

  return r_num;
}
function num4() {
  const num = [
    [1, 1],
    [0, 1],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0011") + hexa("0001");

  return r_num;
}
function num5() {
  const num = [
    [1, 0],
    [0, 1],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0010") + hexa("0001");

  return r_num;
}
function num6() {
  const num = [
    [1, 1],
    [1, 0],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0001") + hexa("0011");

  return r_num;
}
function num7() {
  const num = [
    [1, 1],
    [1, 1],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0010") + hexa("0011");

  return r_num;
}
function num8() {
  const num = [
    [1, 0],
    [1, 1],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0011") + hexa("0011");

  return r_num;
}
function num9() {
  const num = [
    [0, 1],
    [1, 0],
    [0, 0],
    [0, 0]
  ]
  const r_num = hexa("0001") + hexa("0010");

  return r_num;
}


//원래 obj.json에 있어야하지만 값이 복사가 되어 따로 사용함. 깊은 복사는 성능 느리다 하여 추가
function pad_test() { 

  const pad_test = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  ]



  return pad_test;
}

// .mp3, .wav 등 음성파일 실행 함수
function playAudio(filePath) {
  const audioElement = document.createElement('audio');
  audioElement.src = filePath;

  audioElement.addEventListener('canplaythrough', () => {
    audioElement.play();
  });



  audioElement.addEventListener('ended', () => {
    audioElement.remove();
  });

  document.body.appendChild(audioElement);
}

// 삭제했던 부분...
// 음성파일이 저장 된 폴더를 읽어서 json에 목록을 저장하는 file.py를 실행하여 필요한 데이터만 추출
async function sound_tar1() {

  const response = await fetch('/run-python-script', { method: 'POST' });
  const data = await response.json();

  const audio_ = await fetch('/static/textlist.json'); 
  const audio_list = await audio_.json();
  console.log(audio_list);

  var result = [];

  for (var i = 0; i < audio_list.length; i++) {
    var filename = audio_list[i];
    var match = filename.match(/information(\d+)_tts\.json/);
    if (match && match[1]) {
      var time = parseInt(match[1], 10) * 5; // 기본적으로 10진수로 파싱합니다.
      result.push([time, filename]);

    }
  }

  console.log(result);
  return result;
}


//튜토리얼이 여러번 눌렸을 때를 대비한 변수
var tutorialnum = 0;

//튜토리얼 진행 함수
async function onS4ButtonClick() {
   var tutorial_current = tutorialnum + 1;
   const odj = await fetch("/static/obj.json");
   // const odj = await fetch("/static/webtoon.json"); 이렇게 해도 패드,소리 둘 다 X

  const odjData = await odj.json();
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => audio.pause());


  //튜토리얼 진행을 위한 데이터 저장
  myDotPad.tutorial = 1;
  myDotPad.target = 0;
  var F1 = [];
  var F2 = [];
  var F1_sound = ['F1_1.mp3', 'F1_4.mp3', 'F1_3.mp3', 'F1_2.mp3'];
  var F2_sound = ['F2_1.mp3', 'F2_2.mp3', 'F2_3.mp3', 'F2_4.mp3', 'F2_5.wav', 'F2_6.wav', 'F2_7.wav', 'F2_8.wav', 'F2_9.wav'];

  console.log(odjData);

  var result;
  result = merge(20, 30, odjData[0][1], pad_test());
  //myDotPad.send("0000000000000000000000000000000000000000"+ trans_hex_pad(result));
  F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));
  result = [];

  result = merge(20, 30, odjData[1][1], pad_test());
  F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));
  result = [];
  result = merge(20, 30, odjData[2][1], pad_test());
  F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));
  result = [];
  result = merge(20, 30, odjData[3][1], pad_test());
  F1.push("0000000000000000000000000000000000000000" + trans_hex_pad(result));
  result = [];

  F2.push("0000000000000000000000000000000000000000" + trans_hex_pad(odjData[5][1]));
  F2.push("0000000000000000000000000000000000000000" + trans_hex_pad(odjData[6][1]));
  F2.push("0000000000000000000000000000000000000000" + trans_hex_pad(odjData[7][1]));
  F2.push("0000000000000000000000000000000000000000" + trans_hex_pad(odjData[9][1]));

  F2.push(odjData[11][1] + trans_hex_pad(pad_test()));
  F2.push(odjData[12][1] + trans_hex_pad(pad_test()));
  F2.push(odjData[13][1] + trans_hex_pad(pad_test()));
  F2.push(odjData[14][1] + trans_hex_pad(pad_test()));
  F2.push(odjData[15][1] + trans_hex_pad(pad_test()));

  let ok = myDotPad.tutorial_ind - 1;
  let ok_state = myDotPad.tutorial_state;
 

  await new Promise(resolve => setTimeout(resolve, 2500)); // 버튼이 연속으로 눌렸을 때 마지막 호출만 실행하기 위한 지연
  tutorialnum = tutorial_current;

  //튜토리얼 외에 다른 버튼이 눌릴 때까지 반복
  while (myDotPad.tutorial == 1 && tutorial_current == tutorialnum) {
    console.log("딜레이");
    await delay(2000);

    //튜토리얼 변경 버튼을 눌렀을 때
    if (ok_state != myDotPad.tutorial_state && myDotPad.tutorial_state == "F1") {
      myDotPad.tutorial_ind = 0;
      ok_state = myDotPad.tutorial_state;
      myDotPad.send(F1[myDotPad.tutorial_ind]);
      ok = myDotPad.tutorial_ind;
      playAudio("/static/tutorial/" + F1_sound[myDotPad.tutorial_ind]);
      console.log(myDotPad.send_sound);
      await performGattOperation();
      playAudio("/static/tts/touch.mp3");
    }
    else if (ok_state != myDotPad.tutorial_state && myDotPad.tutorial_state == "F2") {
      myDotPad.tutorial_ind = 0;
      ok_state = myDotPad.tutorial_state;
      myDotPad.send(F2[myDotPad.tutorial_ind]);
      ok = myDotPad.tutorial_ind;
      playAudio("/static/tutorial/" + F2_sound[myDotPad.tutorial_ind]);

      console.log(myDotPad.send_sound);
      console.log('myDotPad.tutorial_state', myDotPad.tutorial_state);
      console.log('myDotPad.tutorial_ind', myDotPad.tutorial_ind);
      await performGattOperation();
      playAudio("/static/tts/touch.mp3");
      
    }
    //화살표 버튼을 눌렀을 때
    else if (myDotPad.tutorial_state == "F1" && ok != myDotPad.tutorial_ind) {
      ok = myDotPad.tutorial_ind;
      myDotPad.send(F1[myDotPad.tutorial_ind]);
      playAudio("/static/tutorial/" + F1_sound[myDotPad.tutorial_ind]);
      await performGattOperation();

     
      playAudio("/static/tts/touch.mp3");
    }
    else if (myDotPad.tutorial_state == "F2" && ok != myDotPad.tutorial_ind) {
      ok = myDotPad.tutorial_ind;
      myDotPad.send(F2[myDotPad.tutorial_ind]);
      playAudio("/static/tutorial/" + F2_sound[myDotPad.tutorial_ind]);
      await performGattOperation();
      console.log(myDotPad.send_sound);
      playAudio("/static/tts/touch.mp3");
      
    }
    //새로고침 버튼을 눌렀을 때
    else if (myDotPad.resend == 1) {
      if (myDotPad.tutorial_state == "F1") {
        myDotPad.send(F1[myDotPad.tutorial_ind]);
        await performGattOperation();
        playAudio("/static/tts/touch.mp3");
        myDotPad.resend = 0;
      } else if (myDotPad.tutorial_state == "F2") {
        myDotPad.send(F2[myDotPad.tutorial_ind]);
        await performGattOperation();
        playAudio("/static/tts/touch.mp3");
        console.log(myDotPad.send_sound);
        myDotPad.resend = 0;
      }

    }
    //음성 버튼을 눌렀을 때
    else if (myDotPad.send_sound == 1) {

      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => audio.pause());

      if (myDotPad.tutorial_state == "F1") {
        playAudio("/static/tutorial/" + F1_sound[myDotPad.tutorial_ind]);
      } else if (myDotPad.tutorial_state == "F2") {
        playAudio("/static/tutorial/" + F2_sound[myDotPad.tutorial_ind]);
      }

      myDotPad.send_sound = 0;
    }
  }


}