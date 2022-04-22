

      var statusElement = document.getElementById('status');
      var progressElement = document.getElementById('progress');
	  var diskBoxCombo = document.getElementById('diskbox_combo');
	  var networkStatusDiv = document.getElementById('network_status');
	  var highScoreStatus = document.getElementById('highScore_status');
	  var highScoreButton = document.getElementById('highScore_button');
	  var highScoreTitle = document.getElementById('highScore_title');
	  var helpElement = document.getElementById('help_div');
	  
	  
var Module = {
	keyboardListeningElement: document.getElementById('c64TextInputReceiver'),
	hasFocus: false,
	startSequence: 0,
	error: function(v) {
		console.log(v);
	},
    preRun: [ function(){Module.c64preRun();} ],
    postRun: [ function(){Module.c64postRun();} ],
	c64preRun: function() {
		try {
			FS.mkdir('/data');
			FS.mount(IDBFS, {}, '/data');
			FS.syncfs(true, function (err) {
				Module.c64FsSync();
			});		
		}
		catch(e) {
			Module.startSequence|= 2;
		}
	},
	c64postRun: function() {
		Module.startSequence|= 1;
		if( Module.startSequence == 3 ) Module.c64startup();
	},
	c64FsSync: function() {
		Module.startSequence|= 2;
		if( Module.startSequence == 3 ) Module.c64startup();
	},
	c64startup: function() {
		Module.keyboardListeningElement.focus();
		Module.hasFocus = true;
		Module.selectJoystick(0, 0);
		Module.setMute(true);
		
		document.getElementById('print_version').innerHTML = 'V'+Module.getProperty('version')+'/'+Module.getProperty('revision');
		
		var game = this.requestValue('game');
		var room = this.requestValue('room');
		if( game != null ) {
			this.loadSnapshot(game, false);
		}
		if( room != null ) {
			this.enableNetwork(room);
		}
	},
	requestValue: function(name) {
		if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
			return decodeURIComponent(name[1]);
		return null;
	},
	canvas: document.getElementById('canvas'),
	setStatus: function(text) {
	  if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
	  if (text === Module.setStatus.text) return;
	  var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
	  var now = Date.now();
	  if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
	  if (m) {
		text = m[1];
		progressElement.value = parseInt(m[2])*100;
		progressElement.max = parseInt(m[4])*100;
		progressElement.hidden = false;
	  } else {
		progressElement.value = null;
		progressElement.max = null;
		progressElement.hidden = true;
	  }
	  statusElement.innerHTML = text;
	},
	registerCallback: function(name, callback) {
		return Module.ccall('js_registerCallback', 'number', ['string', 'number'], [name, Runtime.addFunction(callback, 'vii')]);
	},
	totalDependencies: 0,
	monitorRunDependencies: function(left) {
	  this.totalDependencies = Math.max(this.totalDependencies, left);
	  Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
	},
	lastSnapshot: '',
	loadSnapshot: function(fileName, useStorage) {
		Module.keyboardListeningElement.focus();
		Module.hasFocus = true;
		Module.lastSnapshot = fileName;
		if( useStorage && fileName != '' && Module.snapshotStorage(0) ) {
			return;
		}
		Module.lastSnapshot = '';
		var request;
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
		} else {
			request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		// load
		request.open('GET', '/c64/pp_javascript_game.php?game='+fileName, true);
		request.responseType = "arraybuffer";
		request.onload = function (oEvent) {
		  if (request.readyState === 4 && request.status === 200 ) {
			var arrayBuffer = request.response;
			if (arrayBuffer) {
				var byteArray = new Uint8Array(arrayBuffer);
				if( Module.ccall('js_LoadSnapshot', 'number', ['array', 'number'], [byteArray, byteArray.byteLength]) ) {
					Module.lastSnapshot = fileName;
					highScoreButton.disabled = false;
					Module.uploadHighscore('', 'request', 'self');
				}
				Module.updateDiskBox();
			}
		  }
		};
		request.send();
	},
	loadFile: function(file, startup) {
		Module.keyboardListeningElement.focus();
		Module.hasFocus = true;
		Module.lastSnapshot = '';
		
		var fileReader  = new FileReader();
		fileReader.onload  = function() {
			var byteArray = new Uint8Array(this.result);
			if(startup) Module.ccall('js_removeDevice', 'number', ['number'], 0);
			Module.ccall('js_LoadFile', 'number', ['string', 'array', 'number', 'number'], [file.name, byteArray, byteArray.byteLength, startup]);
			//allowed: highScoreButton.disabled = true;
			highScoreTitle.innerHTML = '';
			Module.updateDiskBox();
		}
		fileReader.readAsArrayBuffer(file);
	},
	openHelp: function(lang) {		
		if( Module.lastSnapshot == '' ) return false;
		var helprequest;
		if (window.XMLHttpRequest) {
			helprequest = new XMLHttpRequest();
		} else {
			helprequest = new ActiveXObject('Microsoft.XMLHTTP');
		}
		helpElement.style.display = 'none';
		helprequest.open('GET', '/c64/pp_help.php?game='+Module.lastSnapshot+'&lang='+lang, true);
		helprequest.onload = function ()
		{
			if (helprequest.readyState == 4 && helprequest.status == 200)
			{
				helpElement.innerHTML = helprequest.responseText;
				if( helprequest.responseText != '' ) {
					helpElement.style.display = 'inline-block';
					window.clearTimeout(Module.helpTimer);
					Module.helpTimer = window.setTimeout(function(){document.getElementById('help_div').style.display='none';}, 20000);
				}
			}
		}
		helprequest.send();
		return true;
	},
	helpTimer: null,
	highscoreTimer: null,
	cancelHighscore: function() {
		Module.keyboardListeningElement.focus();
		Module.hasFocus = true;
		Module.setPause(false);
	},
	uploadHighscore: function(userName, scoreId, snapName) {
		Module.keyboardListeningElement.focus();
		Module.hasFocus = true;
		Module.setPause(false);
		var lang = document.head.querySelector("[name=Content-Language]").content;
		if( snapName == 'self' ) snapName = Module.lastSnapshot;
		if( snapName == '' && scoreId != '' ) return false;
		
		var boundary = "---------------------------7da24f2e50046";
		var hirequest;
		if (window.XMLHttpRequest) {
			hirequest = new XMLHttpRequest();
		} else {
			hirequest = new ActiveXObject('Microsoft.XMLHTTP');
		}
		hirequest.open('POST', '/c64/pp_highscore_upload.php', true);
		hirequest.setRequestHeader('Content-type', 'multipart/form-data; boundary='+boundary);
		hirequest.onreadystatechange = function ()
		{
			if (hirequest.readyState == 4)
			{
				var defaultText = 'Highscore Upload';
				if( hirequest.status == 200 && hirequest.responseText.substring(0, 5) == 'json:' ) {
					var obj = JSON.parse(hirequest.responseText.substring(5));
					if (typeof obj !== 'undefined')
					{
						if (typeof obj.status !== 'undefined') {
							highScoreTitle.innerHTML = obj.status;
						}
						else highScoreTitle.innerHTML = '';
						if (typeof obj.button !== 'undefined') {
							highScoreButton.innerHTML = obj.button;
							highScoreButton.className='button add bhighlight';
						}
						if (typeof obj.help !== 'undefined') {
							helpElement.innerHTML = obj.help;
							if( obj.help != '' ) {
								helpElement.style.display = 'inline-block';
								window.clearTimeout(Module.helpTimer);
								Module.helpTimer = window.setTimeout(function(){document.getElementById('help_div').style.display='none';}, 20000);
							}
						}
					}
				}
				else if( hirequest.status == 200 && hirequest.responseText.substring(0, 5) == 'form:' ) {
					highScoreStatus.innerHTML = hirequest.responseText.substring(5);
					document.getElementById('highSave').addEventListener("submit", function(e) {
						e.preventDefault();
						handleHighscore();
						}, false);
					document.getElementById('highCancel').addEventListener("click", function(e) {
						handleHighscoreCancel();
						}, false);
					Module.hasFocus = false;
					Module.setPause(true);
				}
				else {
					highScoreButton.innerHTML = hirequest.responseText;
					highScoreButton.className='button add bhighlight';
				}
				window.clearTimeout(Module.highscoreTimer);
				Module.highscoreTimer = window.setTimeout(function(){highScoreButton.innerHTML = defaultText; highScoreButton.className='button add';}, 3000);
			}
		}
		
		var body2 = '--' + boundary + '\r\n'
				 + 'Content-Disposition: form-data; name="game"\r\n\r\n'
				 + snapName + '\r\n'
				 + '--' + boundary + '\r\n'
				 + 'Content-Disposition: form-data; name="userName"\r\n\r\n'
				 + userName + '\r\n'
				 + '--' + boundary + '\r\n'
				 + 'Content-Disposition: form-data; name="scoreid"\r\n\r\n'
				 + scoreId + '\r\n'
				 + '--' + boundary + '\r\n'
				 + 'Content-Disposition: form-data; name="lang"\r\n\r\n'
				 + lang + '\r\n'
				 + '--' + boundary + '--' + '\r\n';

		var blob;
		if( scoreId == '' && snapName != '' )
		{
			var buffer = Module.ccall('js_SaveSnapshot', 'number', ['number'], [1]);
			var bsize = Module.ccall('js_SaveSnapshotSize', 'number', [], []);
			var imgData = new Uint8Array(Module.HEAPU8.buffer, buffer, bsize);
			
			var body = '--' + boundary + '\r\n'
					 + 'Content-Disposition: form-data; name="highscore";'
					 + 'filename="temp.s64"\r\n'
					 + 'Content-type: application/octet-stream\r\n'
					 + 'Content-length: ' + imgData.length + '\r\n\r\n';
					 
			blob = new Blob([body, imgData, '\r\n', body2]);
		}
		else
		{
			blob = new Blob([body2]);
		}
			
		var fileReader  = new FileReader();
		fileReader.onload  = function() {
			hirequest.send(this.result);
		}
		fileReader.readAsArrayBuffer(blob);
		return true;
	},
	getProperty: function(name) {
		return Module.ccall('js_getProperty', 'string', ['string'], [name]);
	},
	setProperty: function(name, value) {
		return Module.ccall('js_setProperty', 'number', ['string', 'string'], [name, value]);
	},
	setJoystick: function(key, down) {
		Module.ccall('js_setJoystick', 'number', ['number', 'number'], [key, down]);
	},
	selectJoystick: function(player1, player2) {
		Module.ccall('js_selectJoystick', 'number', ['number', 'number'], [player1, player2]);
	},
	setKey: function(key, down) {
		Module.ccall('js_setKey', 'number', ['number', 'number'], [key, down]);
	},
	handleDiskBoxClick: function(event) {
		if(event && event.preventDefault) event.preventDefault();
		Module.ccall('js_setDiskbox', 'number', ['number'], [document.getElementById("diskSelect").value]);
		document.getElementById("diskSelect").blur();
		return false;
	},
	getDiskBoxHtml: function() {
		return Module.ccall('js_getDiskboxHtml', 'string', ['number'], [1]);
	},
	updateDiskBox: function() {
		var db = Module.getDiskBoxHtml();
		if( db != '' ) {
			diskBoxCombo.innerHTML  = db;
			document.getElementsByName('diskbox')[0].addEventListener('submit', Module.handleDiskBoxClick, false);			
			document.getElementById('diskSelect').addEventListener('change', Module.handleDiskBoxClick, false);			
		}
		else {
			diskBoxCombo.innerHTML  = '';
		}
	},
	openAndUnlockAudioContext: function() {
		Module.SDL.openAudioContext();
		var buffer = Module.SDL.audioContext.createBuffer(1, 1, 48000);
		var source = Module.SDL.audioContext.createBufferSource();
		source.connect(Module.SDL.audioContext.destination);
		if (typeof source['start'] !== 'undefined') {
		  source['start'](0);
		} else if (typeof source['noteOn'] !== 'undefined') {
		  source['noteOn'](0);
		}
	},
	muteState: 0,
	toggleMute: function() {
		Module.setMute(Module.muteState^1);
		return Module.muteState;
	},
	setMute: function(mute) {
		if( !mute && Module.hasOwnProperty('SDL') && !Module.SDL.audioContext ) {	
			Module.openAndUnlockAudioContext();
		}
		Module.muteState = mute;
		Module.ccall('js_setMute', 'number', ['number'], [mute]);
	},
	setPause: function(pause) {
		Module.ccall('js_setPause', 'number', ['number'], [pause]);
	},
	snapshotStorage: function(save) {
		var storageSnapshot = Module.lastSnapshot;
		if( storageSnapshot == '' ) storageSnapshot = 'default.s64';
		var res = Module.ccall('js_snapshotStorage', 'number', ['number', 'string'], [save, 'data/'+storageSnapshot]);
		if( res && save ) {
			FS.syncfs(function (err) {
			});
		}
		else if( !save ) {
			if( res ) {
				highScoreButton.disabled = true;
				c64_checkfile_type( new File(["data"], storageSnapshot), true );
			}
			Module.updateDiskBox();
		}
		return res;
	},
	requestC64FullScreen: function() {
		Module.ccall('js_requestFullscreen', 'number', ['number', 'number'], [1, 0]);
	},
	onFullScreenExit: function(softFullscreen) {
		if(softFullscreen) {
			Module.keyboardListeningElement.focus();
			Module.hasFocus = true;	
		}
	},
    connection: null,
	isConnected: false,
    MODERATOR_SESSION_ID: "C64-8682F682-3230-4A4C-A1B6-FC49AD2DFE68",
    MODERATOR_SESSION: {
		          audio:     false, // by default, it is true
		          video:     false, // by default, it is true
		          screen:    false,
    		      
		          data:      true,
    		      
		          oneway:    false,
		          broadcast: false
		      },
    MODERATOR_EXTRA: {},
	enableNetwork: function(roomName) {
		networkStatusDiv.innerHTML = roomName!='' ? '<h3>Connecting to Network...</h3>' : '<h3>Network Off</h3>';
		return Module.ccall('js_enableNetwork', 'number', ['string'], ['c64emulator-'+roomName]);
	},
	connectionStatus: function(state) {
		var c_onopen = Module.cwrap('js_net_OnOpen', 'number', ['number']);
		this.isConnected = state;
		networkStatusDiv.innerHTML = state ? '<h3>Network Connected</h3>' : '<h3>Network Disconnected</h3>';
		c_onopen(state);
	},
	createConnection: function(roomName) {
	  var c_onopen = Module.cwrap('js_net_OnOpen', 'number', ['number']);
	  
      this.connection = new RTCMultiConnection( this.MODERATOR_SESSION_ID );
	  
		var SIGNALING_SERVER = 'https://webrtcweb.com:9559/';
		this.connection.openSignalingChannel = function(config) {
			var channel = config.channel || Module.connection.channel || 'default-namespace';
			var sender = Math.round(Math.random() * 9999999999) + 9999999999;
			io.connect(SIGNALING_SERVER).emit('new-channel', {
				channel: channel,
				sender: sender
			});
			var socket = io.connect(SIGNALING_SERVER + channel);
			socket.channel = channel;
			socket.on('connect', function() {
				if (config.callback) config.callback(socket);
			});
			socket.send = function(message) {
				socket.emit('message', {
					sender: sender,
					data: message
				});
			};
			socket.on('message', config.onmessage);
		};

      this.connection.join(roomName);

      this.connection.onopen = function(event) {
		Module.connectionStatus(1);
      }     
      this.connection.onerror = function(event) {
		Module.connectionStatus(0);
      }     
      this.connection.onclose = function() {
		Module.connectionStatus(0);
      }     
      
      this.connection.onmessage = function(event) {
		var c_onmessage = Module.cwrap('js_net_OnMessage', 'number', ['string', 'number']);
		c_onmessage(event.data, 0);
     }
  }
};


