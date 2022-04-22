var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {
		event.preventDefault();
		// showPanel( ++ mode % (container.children.length + 1));

		//this is a hack to turn this into a toggle instead of cycling through modes
		if (mode ===0){
			mode = container.children.length
		} else {
			mode = 0
		}
		showPanel(mode)
	}, false );

	function addPanel( panel ) {
		container.appendChild( panel.dom );
		return panel;
	}

	function showPanel( id ) {
		if (id === 'all'){
			id = container.children.length
		}

		for ( var i = 0; i < container.children.length; i ++ ) {
			if (id === container.children.length) {
				container.children[ i ].style.display = 'block';
			} else {
				container.children[ i ].style.display = i === id ? 'block' : 'none';
			}
		}

		mode = id;
	}

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );
	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	
	if ( self.performance && self.performance.memory ) {
		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );
	}

	var batteryPanel = addPanel( new Stats.Panel( '% Batt', '#0f9', '#022' ) );

	showPanel( 0 );

	return {

		REVISION: 16,
		dom: container,
		addPanel: addPanel,
		showPanel: showPanel,
		begin: function () {
			beginTime = ( performance || Date ).now();
		},
		end: function () {
			frames ++;
			var time = ( performance || Date ).now();
			msPanel.update( time - beginTime, 200 );
			

			if ( time >= prevTime + 1000 ) {

				if ( memPanel ) {
					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );
				}
				
				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				navigator.getBattery().then((battery)=>{
					// console.dir(battery.level)
					batteryPanel.update( battery.level * 100, 100 );

					if (battery.charging){
						batteryPanel.changeColors('orange')
					}
					else if (battery.level < 0.15){
						batteryPanel.changeColors('red')
					} else {
						batteryPanel.changeColors('#0f9')
					}
					
				})
				prevTime = time;
				frames = 0;
			}
			return time;
		},

		update: function () {
			beginTime = this.end();
		},

		// Backwards Compatibility
		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, 
		HEIGHT = 48 * PR,
		TEXT_X = 3 * PR, 
		TEXT_Y = 2 * PR,
		GRAPH_X = 3 * PR, 
		GRAPH_Y = 15 * PR,
		GRAPH_WIDTH = 74 * PR, 
		GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	//Draw Container
	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	//Draw Title
	context.fillText( name, TEXT_X, TEXT_Y );

	//Draw Graphing Box (Full FG)
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;

	//Draw Graphing Box (Partial BG)
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,
		changeColors: function(newFg){
			fg = newFg;
		},
		update: function ( value, maxValue ) {
			// let BAR_THICKNESS = 5
			// let BAR_SPACING = GRAPH_X - 2 

			let BAR_THICKNESS = PR
			let BAR_SPACING = GRAPH_X
			
			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;

			// CLEARS Over TITLE FOR SOME REASON AND GRAPH?
			context.fillRect( 
				0, 
				0, 
				WIDTH, 
				GRAPH_Y 
			);

			//Draw Dynamic Title
			context.fillStyle = fg;
			context.fillText( 
				round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', 
				TEXT_X, 
				TEXT_Y 
			);

			//Responsible for moving the graph somehow
			//Seemd to take in canvas as the source image, so redraw itself
			//Then use graph_x + pr and graph width - pr to move the image.
			//Line 6 draws the offset, movement.
			//So GRAPH_X - 2 will draw a gap between bars

			let BAR_MOVEMENT_OVER_TIME = GRAPH_WIDTH - BAR_THICKNESS
			let GRAPH_ANGLE_1 = GRAPH_Y
			let GRAPH_ANGLE_2 = GRAPH_Y
			let GRAPH_CURVE = GRAPH_HEIGHT // +/- will add a curve to the graph over time
			// let BAR_MOVEMENT_OVER_TIME = GRAPH_WIDTH - PR /2 //I believe this is the width of the verticle slice as it moves to the left
			context.drawImage( 
				canvas, 
				GRAPH_X + BAR_THICKNESS, 
				GRAPH_ANGLE_1, 
				GRAPH_WIDTH - BAR_THICKNESS, 
				GRAPH_CURVE, 
				BAR_SPACING, 
				GRAPH_ANGLE_2, 
				BAR_MOVEMENT_OVER_TIME, 
				GRAPH_HEIGHT 
			);

			//DRAW full bars somehow
			context.fillRect( 
				GRAPH_X + GRAPH_WIDTH - BAR_THICKNESS, 
				GRAPH_Y, 
				BAR_THICKNESS, 
				GRAPH_HEIGHT 
			);

			context.fillStyle = bg;
			context.globalAlpha = 0.9;

			//Draw back over partial background to make lines
			context.fillRect( 
				GRAPH_X + GRAPH_WIDTH - BAR_THICKNESS, 
				GRAPH_Y, 
				BAR_THICKNESS, 
				round( 
					( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT 
				) 
			);

		}

	};

};

Stats.Init = function(){
	var stats = new Stats();
	console.log("NEW STATS")
	stats.showPanel('all');
	document.body.appendChild(stats.dom);
	requestAnimationFrame(function loop(){
		stats.update();
		requestAnimationFrame(loop)
	});
}

export default Stats;

