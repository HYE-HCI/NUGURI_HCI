class DotPad {
  /**
   * @param {!(number|string)} [serviceUuid= '49535343-fe7d-4ae5-8fa9-9fafd205e455'] - Service UUID
   * @param {!(number|string)} [characteristicUuid='49535343-1e4d-4bd9-ba61-23c647249616'] 49535343-8841-43f4-a8d4-ecbe34729bb3, 49535343-4c8a-39b3-2f49-511cff073b7e] - Characteristic UUID
   */

  constructor(serviceUuid = '49535343-fe7d-4ae5-8fa9-9fafd205e455', characteristicUuid = '49535343-1e4d-4bd9-ba61-23c647249616') {
    // Used private variables.
    this._receiveBuffer = ''; // Buffer containing not separated data.
    this._device = null; // Device object cache.
    this._service = null; // Service object cache.
    this._characteristics = null; // Characteristic object cache.
    // Bound functions used to add and remove appropriate event handlers.
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
  
    this._boundHandleCharacteristicValueChanged = this._handleCharacteristicValueChanged.bind(this);


    // Button input variables
    // Stores 'which' button has been pushed.
    this.currentbtninput = 0; //0: idle, 1,2,3,4: btn 1-4, 98,99: left (prev), right (next)

    /* Data for rendering (JSON, image pixel, variables) declaration */

    // Image object, height/width, path information
    this.imageObj = new Image();
    this.imageHeight = 0;
    this.imageWidth = 0;
    this.imageRatio = 1;
    this.imagePath = "";
    this.jsonPath = "";
    this.ind = 0;

    this.tutorial = 0;
    this.tutorial_ind = 0;
    this.tutorial_state = "F1";

    this.play_state = "REPLAY";
    this.playing = 0;
    this.reset = 0;
    this.send_sound = 0;
    this.resend = 0;
    this.target = 0;
    this.did_s = [];

    //JSON object declaration (JS doesn't need to declare type here, but anticipating that for TS)
    this.JSONObj;
    this.tactonJSONObj;
    this.audioJSONObj;
    //Single-played audio
    this.audioplayed = false;

    //JSON page (layering) info, for photo handler
    this.totalpages = 0;
    this.semsegpages = 0;
    this.groupeditemspages = 0;
    this.ungroupeditemspages = 0;
    this.currentpage = 0;
    this.sorting;

    //variable for partial json data 
    this.semseg;
    this.objdetected;

    //chart data info, fitted to hichart json.
    this.chart;
    this.charttitle;
    this.chartsubtitle;
    this.chartxAxis;
    this.chartyAxis;
    this.chartdata;
    this.charttype;
    this.chartxzoom = 1;
    this.chartyzoom = 1;
    this.zoommode;

    //variable that decide 
    this.datatype;

    //rendering data declaration for braille text line
    this.layeritemnames;
    this.layertactonnames;

    //text data (actual 20byte braille (text) header) to be combined with 300byte image (pixel) data
    this.hexData = "";

    //pixel data initialization
    // 60 bytes per each of 4 lines * 40 lines = 600 byte
    this.pixel = new Array(60);
    for (var i = 0; i < this.pixel.length; i++) {
      this.pixel[i] = new Int8Array(40);
    }

    //rendering mode variables for photos (zoom or not, if zoom, which page, segment/tacton, fill/contour)
    this.zoom = false; //T or F
    this.zoompage = 0; //0-5, Full, LT, RT, RB, LB, Center
    this.mode = 0; // 0: segment, 1: tacton mode
    this.fillmode = 1; //0: fill 1: contour


    // Configure with specified parameters.
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);

    // Load predetermined Tactons
    this.loadTactons('./preprocessor_JSON/tactons.json');
  }

  //preloading of the tacton fronm json
  loadTactons(tactonPath) {
    loadJSON(tactonPath, callbackfunction.bind(this));
    //console.log(this.tactonJSONObj);

    function callbackfunction(response) {
      var JSONObject = JSON.parse(response);
      //console.log(JSONObject);
      this.tactonJSONObj = JSONObject;
      //console.log(this.tactonJSONObj);
    }

    function loadJSON(jsonpath, callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', jsonpath, true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function () {
        if (xobj.readyState === XMLHttpRequest.DONE && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
      };
      //xobj.send(null);
    }
  }

  //audio list load from the json file (list).
  loadAudio(audioPath) {
    loadJSON(audioPath, callbackfunction.bind(this));
    //console.log(this.tactonJSONObj);

    function callbackfunction(response) {
      var JSONObject = JSON.parse(response);
      //console.log(JSONObject);
      this.audioJSONObj = JSONObject;
      //console.log(this.tactonJSONObj);
    }

    function loadJSON(jsonpath, callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', jsonpath, true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function () {
        if (xobj.readyState === XMLHttpRequest.DONE && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
      };
      //xobj.send(null);
    }
  }

  /**
   * Set number or string representing service UUID used.
   * @param {!(number|string)} uuid - Service UUID
   */
  setServiceUuid(uuid) {
    if (!Number.isInteger(uuid) &&
      !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._serviceUuid = uuid;
  }

  /**
   * Set number or string representing characteristic UUID used.
   * @param {!(number|string)} uuid - Characteristic UUID
   */
  setCharacteristicUuid(uuid) {
    if (!Number.isInteger(uuid) &&
      !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._characteristicUuid = uuid;
  }


  /**
   * Launch Bluetooth device chooser and connect to the selected device.
   */
  async connect() {
    console.log('bluetooth' in navigator)
    console.log(navigator)
    this._device = await navigator.bluetooth.requestDevice({
      // filters: [...] <- Prefer filters to save energy & show relevant devices.
      // acceptAllDevices: true,
      filters: [
        { namePrefix: "DotPad" } //here and the service uuid if we need to revise/add for supporting other bluetooth devices
      ],
      optionalServices: ['49535343-fe7d-4ae5-8fa9-9fafd205e455']
    }
    );

    this._log('Connecting to GATT Server...');
    const server = await this._device.gatt.connect();
    //this._log(server);
    this._log('Getting Service...');
    const services = await server.getPrimaryServices('49535343-fe7d-4ae5-8fa9-9fafd205e455'); //fixed for dot pad BLE communication
    //this._log(services);

    //there are multiple characteristics (not sure what they are) but reading all the characteristics.
    this._log('Getting Characteristics...');
    for (const service of services) {
      this._log('> Service: ' + service.uuid);
      //this._log(service);
      //const characteristics = await service.getCharacteristics();
      const characteristics = await service.getCharacteristics();
      this._characteristics = characteristics;
      characteristics.forEach(characteristic => {
        this._log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
        if (characteristic.properties.notify == true) { //finding the notification channel (charactersitics)
          characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged); //set the bluetooth to react with characteristics value changed (means, button pushed)
        }
        //this._log(characteristic);
        //this._characteristic = characteristic;
      });

    }

    //function for logging
    function getSupportedProperties(characteristic) {
      let supportedProperties = [];
      for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
          supportedProperties.push(p.toUpperCase());
        }
      }
      return '[' + supportedProperties.join(', ') + ']';
    }
  }
  /**
   * Disconnect from the connected device.
   */
  async disconnect() {
    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
      this._characteristic = null;
    }

    this._device = null;
    //this._worker.terminate();
  }

  /**
   * Send data to the connected device.
   * @param {string} data - Data
   * @return {Promise} Promise which will be fulfilled when data will be sent or
   *                   rejected if something went wrong
   */
  send(data) {
    
    var audio = new Audio('/static/tts/beep.mp3');
    audio.load();
    audio.volume = 1;
    audio.play();



    // HERE the protocol and composition of byte set start. basic declaration of the default value. 
    var dot_protocol_header = "AA55000500011000"
    // counted by 2*4 cell-wise: 30 cells in a row, 10 cells for a column (30 * 10 cells = 60 (30*2) * 40 (10*4) pins). variable name just from Swift code.
    var length = 10;
    var numCell = 30;
    // braille text line length
    let numTextCell = 20;
    // Convert data to the string using global object.
    data = String(data || '');
    //this._log(data);
    // Return rejected promise immediately if data is empty.
    if (!data) {
      return Promise.reject(new Error('Data must be not empty'));
    }

    //this._log(this._characteristics);

    //Init. padding variable (if the data is not came as a fixed length.)
    let stringwithPadding = '';
    var padding = '';
    //filling 0s if the message is shorter than a line.
    for (var i = 0; i < length * numCell * 2 - data.length; i++) {
      padding += '0';
    }
    stringwithPadding = data + padding; // added padding. Now it has the same length of 40+600 hex letters (finally converted to 20+300 bytes).
    if (stringwithPadding.length != (length * numCell * 2 + numTextCell * 2)) {
      this._log("Error: length not correct: " + stringwithPadding.length);
      return;
    }
    //this._log(stringwithPadding);

    //composing header of the data to be sent
    let indexPadding = (length == 1) ? 0 : 1;
    let Textheadercount = (10 + numTextCell - 4);
    let hex_Textheadercount = Textheadercount.toString(16).toUpperCase(); //converting to hex code.
    if (hex_Textheadercount.length == 1) {
      hex_Textheadercount = '0' + hex_Textheadercount;
    }

    //Actual assembly of header
    dot_protocol_header = "AA5500" // SYNC BYTE
      + hex_Textheadercount
      //+ "\(String(format: "%02X", 10 + numTextCell - 4))" // (Header(10) ) + DataCount - (SYNC BYTE(2) + LEN(2))
      + "00"
      + "0200" // CMD_LINE_DISP_LINECOMMAND
      + "00" // Mode (GrapicMode: 0x00, TextMode: 0x80)
      + "00"; // Offset = 0

    //slice the data line by line
    //YY Hardcoded. Text part (first 40 hex letters) for braille line.
    let rangestart = 0;
    let rangeend = 40;

    var writeString_Wrap = dot_protocol_header + stringwithPadding.slice(rangestart, rangeend);
    //this._log('Text wrapped: ' + writeString_Wrap);

    //CheckSum (calculation by checkSum function). 
    let cSum_start = 8;
    let cSum_end = writeString_Wrap.length;
    //Original swift code
    //let start = writeString_Wrap.index(writeString_Wrap.startIndex, offsetBy: 8)
    //let end = writeString_Wrap.index(writeString_Wrap.startIndex, offsetBy: writeString_Wrap.count - 1)
    //let checksumRange = start...end
    //this._log('Text sliced: ' + writeString_Wrap.slice(cSum_start, cSum_end));
    let dot_protocol_tail = this.checkSum(writeString_Wrap.slice(cSum_start, cSum_end));

    if (dot_protocol_tail.length != 2) {
      this._log('Error: Invalid CheckSum');
      return
    }

    //hex to byte array conversion hexStringToByteArray
    writeString_Wrap = writeString_Wrap + dot_protocol_tail;
    //this._log(writeString_Wrap);        
    let writeArray = this.hexStringToByteArray(writeString_Wrap);
    let writeData = new Uint8Array(writeArray);
    //this._log ('Sending data:'+ writeArray);

    // Calling promise, checking Data validity and connection establishment.
    // Return rejected promise immediately if data is empty.
    if (!data) {
      return Promise.reject(new Error('Data must be not empty'));
    }
    // Return rejected promise immediately if there is no connected device.
    if (!this._characteristics) {
      return Promise.reject(new Error('There is no connected device'));
    }

    //if no error, sending the 1st chunk (text line) and then call chain of promise to send next lines.
    // Write first chunk to the characteristic immediately.
    for (const characteristic of this._characteristics) {
      let promise = characteristic.writeValueWithoutResponse(writeData);
      //this._log('1st promise');
      // Iterate over chunks if there are more than one of it.

      //Graphics line output
      let Graphicsheadercount = (10 + numCell - 4);
      let hex_Graphicsheadercount = Graphicsheadercount.toString(16).toUpperCase();
      if (hex_Graphicsheadercount.length == 1) {
        hex_Graphicsheadercount = '0' + hex_Graphicsheadercount;
      }
      //each line (0~9th)
      for (var i = 0; i < length; i++) {
        //the same formatting of header
        let ind = indexPadding + i;
        let hex_ind = (ind.toString(16)).toUpperCase();
        if (hex_ind.length == 1) {
          hex_ind = '0' + hex_ind;
        }
        let dot_protocol_header = "AA5500" // SYNC BYTE
          + (Graphicsheadercount.toString(16)).toUpperCase()
          //+ "\(String(format: "%02X", 10 + numCell - 4))" // (Header(10) ) + DataCount - (SYNC BYTE(2) + LEN(2))
          + hex_ind
          //+ "\(String(format: "%02X", i + indexPadding))"
          + "0200" // CMD_LINE_DISP_LINECOMMAND
          + "00" // Mode (GrapicMode: 0x00, TextMode: 0x80)
          + "00"; // Offset = 0

        //also the same formatting for each line. extracting hex data from string.
        let range_start = i * numCell * 2 + (numTextCell * 2);
        let range_end = (i + 1) * numCell * 2 + (numTextCell * 2);

        var writeString_Wrap = dot_protocol_header + stringwithPadding.slice(range_start, range_end);

        //Extimate checkSum for extracted line of hex data.
        let cSum_start = 8;
        let cSum_end = writeString_Wrap.length;
        let dot_protocol_tail = this.checkSum(writeString_Wrap.slice(cSum_start, cSum_end));

        if (dot_protocol_tail.length != 2) {
          this._log('Error: Invalid CheckSum');
          return
        }

        writeString_Wrap = writeString_Wrap + dot_protocol_tail;

        //converting hex to Byte array, similar to the braille text transmission.
        let writeArray = this.hexStringToByteArray(writeString_Wrap);
        let writeData = new Uint8Array(writeArray);
        //this._log('Write line ' + i + ' : ' + writeData);
        //let writeData = Data(bytes: writeArray, count: writeArray.count)

        // then, send the Byte-converted line data.
        // Chain new promise.
        promise = promise.then(() => new Promise((resolve, reject) => {
          // Reject promise if the device has been disconnected.
          if (!characteristic) {
            reject(new Error('Device has been disconnected'));
          }


          // Write chunk to the characteristic and resolve the promise. (actual transmission occurs here)
          characteristic.writeValueWithResponse(writeData).
            then(resolve).
            catch(reject);
        }));
      }

      return promise;
    }
  }

  /**
   * Get the connected device name.
   * @return {string} Device name or empty string if not connected
   */
  getDeviceName() {
    if (!this._device) {
      return '';
    }

    return this._device.name;
  }


  /**
   * Disconnect from device.
   * @param {Object} device
   * @private
   */
  _disconnectFromDevice(device) {
    if (!device) {
      return;
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected',
      this._boundHandleDisconnection);

    if (!device.gatt.connected) {
      this._log('"' + device.name +
        '" bluetooth device is already disconnected');
      return;
    }

    device.gatt.disconnect();

    this._log('"' + device.name + '" bluetooth device disconnected');
  }


  /**
   * Start notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _startNotifications(characteristic) {
    this._log('Starting notifications...');

    return characteristic.startNotifications().
      then(() => {
        this._log('Notifications started');

        characteristic.addEventListener('characteristicvaluechanged',
          this._boundHandleCharacteristicValueChanged);
      });
  }

  /**
   * Stop notifications.
   * @param {Object} characteristic
   * @return {Promise}
   * @private
   */
  _stopNotifications(characteristic) {
    this._log('Stopping notifications...');

    return characteristic.stopNotifications().
      then(() => {
        this._log('Notifications stopped');

        characteristic.removeEventListener('characteristicvaluechanged',
          this._boundHandleCharacteristicValueChanged);
      });
  }

  /**
   * Handle disconnection.
   * @param {Object} event
   * @private
   */
  _handleDisconnection(event) {
    const device = event.target;

    this._log(device.name + 'device disconnected, trying to reconnect...');

    this._connectDeviceAndCacheCharacteristic(device).
      then((characteristic) => this._startNotifications(characteristic)).
      catch((error) => this._log(error));
  }

  /**
   * Handle characteristic value changed. (button input control by loading bluetooth channel's characteristic values)
   * @param {Object} event
   * @private
   */
  _handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    const length = event.target.value.byteLength;
    var intvalue = new Uint8Array(length);

    //var i = 0;
    for (var i = 0; i < length; i++) {
      intvalue[i] = value.getUint8(i);
    }
    //console.log('> Event target uuid is: ' + event.target.uuid);
    //console.log('> Input is: ' + intvalue);

    // 6th, 8th, 9th, 12th bytes are important (from 0); 
    /* from Dot Pad input bytes: (hacked by external (Android) tools on my tablet... Web BLE does not support broadcasting, allows accessing "unspecified" channels. 
    Means, we must know the unique uuid (from the chip supplier or other external tools).)
    Stored the channel characteristic value in intvalue array, and [6-9]th data represents which button was pushed.
    Left down: 18, 0, 4, 176 up = 18, 0, 0, 180
    Right down: 18, 0, 2, 182 up = 18, 0, 0, 180
    Btn 1-4 down: 50, [128,64,32,16], 0, [20,212,180,132]
    Btn up: 50, 0, 0, 148
    */
   

    // 튜토리얼 실행
    if (this.tutorial == 1) {
      if (intvalue[6] == 18) {
        //화살표 버튼, 장면 전환
        if (intvalue[9] == 4 && intvalue[12] == 176) {

          this.playing = 1;
          this.tutorial_ind -= 1;
          if (this.tutorial_ind == -1 && this.tutorial_state == "F1") {
            this.tutorial_ind = 3;
          } else if (this.tutorial_ind == -1 && this.tutorial_state == "F2") {
            this.tutorial_ind = 8;
          }

          console.log("왼쪽 화살표 누름", this.tutorial_ind);

        }

        else if (intvalue[9] == 2 && intvalue[12] == 182) {
          this.tutorial_ind += 1;
          this.playing = 1;
          if ((this.tutorial_ind == 4 && this.tutorial_state == "F1") || (this.tutorial_ind == 9 && this.tutorial_state == "F2")) {
            this.tutorial_ind = 0;
          }

          console.log("오른쪽 화살표 누름", this.tutorial_ind);
        }


        //evoke functions when buttons down to up (of left/right)
        setTimeout(() => {
          this.playing = 0;
        }, 2500);
        console.log("2500 이후 playing: " + this.playing);
      }

      //corresponding for button 1-4

      else if (intvalue[6] == 50) {
        switch (intvalue[8]) {
          case 128:
            //btn 1: sound output
            this.send_sound = 1;
            break;
          case 64:
            //btn 2
            this.tutorial_state = "F1";


            break;
          case 32:
            //btn 3
            this.tutorial_state = "F2";

            break;
          case 16:
            //btn 4 리프래쉬
            var audio = new Audio('/static/button_tts/초기화.wav');
            // load
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();

            this.resend = 1;
            break;
        }

      }

    }

    // 영상 실행을 위한 버튼 설계
    else if (this.tutorial == 0) {
      if (intvalue[6] == 18) {
        //direction buttons. Left and right. saving "which button" was pushed.
        if (intvalue[9] == 4 && intvalue[12] == 176) {
          console.log("현재 playing: " + this.playing);
          if (this.ind != 0 && this.playing == 0 && this.play_state == "STOP") {
            this.ind -= 1;
            this.playing = 1;
            //var audio = new Audio('button_tts/beyond.wav');
            var audio = new Audio('/static/button_tts/이전.wav');
            // load
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();

          } else if (this.ind == 0 && this.playing == 0 && this.play_state == "STOP") {
            var audio = new Audio('/static/tts/noneS.wav');
            // load
            this.playing = 1;
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();
          }


        }
        else if (intvalue[9] == 2 && intvalue[12] == 182) {
          console.log("현재 playing: " + this.playing);
          if (this.ind < this.did_s.length - 1 && this.playing == 0 && this.play_state == "STOP") {
            this.ind += 1;
            this.playing = 1;
            //var audio = new Audio('button_tts/next.wav');
            var audio = new Audio('/static/button_tts/다음.wav');
            // load
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();

          } else if (this.ind == this.did_s.length - 1 && this.playing == 0 && this.play_state == "STOP") {
            var audio = new Audio('/static/tts/noneS.wav');
            // load
            this.playing = 1;
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();
          }

        }
        //연속 눌림 방지
        setTimeout(() => {
          this.playing = 0;
        }, 2500);

        console.log("2500 이후 playing: " + this.playing);
      }

      //corresponding for button 1-4

      else if (intvalue[6] == 50) {
        switch (intvalue[8]) {
          case 128:
            //btn 1: sound output
            if (this.play_state == "STOP") {
              this.send_sound = 1;
              console.log("sound");
            }
            break;
          case 64:
            //btn 2: 영상 실행 및 정지
            if (this.play_state == "REPLAY") {
              this.play_state = "STOP"
              //var audio = new Audio('button_tts/pause.wav');
              var audio = new Audio('/static/button_tts/일시정지.wav');
              // load
              audio.load();

              // 볼륨 설정
              audio.volume = 1;

              // 실행
              audio.play();
            }
            else if (this.play_state == "STOP") {
              this.play_state = "REPLAY"
              //var audio = new Audio('button_tts/resume.wav');
              var audio = new Audio('/static/button_tts/재생.wav');
              // load
              audio.load();

              // 볼륨 설정
              audio.volume = 1;

              // 실행
              audio.play();
            }

            break;
          case 32:
            //btn 2: 영상 처음부터 다시 실행
            console.log("버튼누름 리셋", this.reset);

            //var audio = new Audio('button_tts/replay.wav');
            var audio = new Audio('/static/button_tts/처음부터.wav');
            // load
            audio.load();

            // 볼륨 설정
            audio.volume = 1;

            // 실행
            audio.play();

            this.reset = 1;
            //btn 3: switch tacton/segment modes (map and photo)

            break;
          case 16:
            //btn 4: 리프레쉬
            //var audio = new Audio('button_tts/make.wav');
            if (this.play_state == "STOP") {
              var audio = new Audio('/static/button_tts/초기화.wav');
              // load
              audio.load();

              // 볼륨 설정
              audio.volume = 1;

              // 실행
              audio.play();

              this.resend = 1;
            }
            break;

        }

      }
    }


  }

  state() {
    return this.play_state;
  }


  /* UTILITIES */
  /**
   * Log.
   * @param {Array} messages
   * @private
   */
  _log(...messages) {
    console.log(...messages); // eslint-disable-line no-console
  }

  /* data conversion */
  charPairToByte(a, b) {
    var byte;
    byte = a * 16 + b;
    return byte;
  }
  hexStringToByteArray(str) { //_ str: String, -> Array<UInt8> {
    //this._log('String: '+ str);
    var upperstring = str.toUpperCase();
    var hexString = new Uint8Array(str.length);

    var j = 0;
    for (var i = 0; i < upperstring.length; i++) {
      let character = upperstring[i];
      //this._log('character: ' + character);
      if (character != " ") {
        hexString[j] = Number.parseInt(character, 16);
        j = j + 1;
      }
    }
    //this._log('Hex: ' + hexString);
    var bytes = new Uint8Array(Math.floor(str.length / 2));// [UInt8]()
    var stringLength = hexString.length;

    if (stringLength % 2 != 0) {
      stringLength -= 1;
    }

    j = 0;
    for (var i = 0; i < stringLength; i = i + 2) {
      let byte = this.charPairToByte(hexString[i], hexString[i + 1]);
      bytes[j] = byte;
      j = j + 1;
    }
    //this._log('Bytes: ' + bytes);
    return bytes;
  }
  //checksum calculation for dot pad protocol
  checkSum(str) {
    let writeArray = this.hexStringToByteArray(str)
    //this._log('Checksum bytes: ' + writeArray);
    var checksum = 0xA5

    for (let i = 0; i < writeArray.length; i++) {
      checksum = checksum ^ (writeArray[i]);
      //this._log('Checksum pow: ' + checksum);
    }
    let ret = checksum.toString(16);
    if (ret.length == 1) {
      ret = '0' + ret;
    }
    //this._log('Checksum result: ' + ret);
    return ret;
  }
  //hex conversion for checksum
  checkSumHex(hexValue) { // hexValue: [UInt8] -> UInt8
    var checksum = 0xA5;

    for (let i = 0; i < hexValue.length; i++) {
      checksum = checksum ^ hexValue[i];
    }

    return checksum;
  }
  //examining checksum for the packet (line or text)
  checkPacket(data) {
    let syncLen = 2;
    let lengthLen = 2;
    let checkSumLen = 1;
    let sync = [0xaa, 0x55];

    for (let i = 0; i < syncLen; i++) {
      if (data[i] != sync[i]) {
        return false;
      }
    }

    var checkSumData = new Uint8Array;
    checkSumData.fill(0, 0, data.length - syncLen - lengthLen - checkSumLen);

    for (let i = 0; i < (data.length - syncLen - lengthLen - checkSumLen); i++) {
      checkSumData[i] = data[syncLen + lengthLen + i];

    }

    if (this.checkSumHex(checkSumData) != data[data.length - 1]) {
      return false;
    }

    return true;
  }

 


  
}

export { DotPad };