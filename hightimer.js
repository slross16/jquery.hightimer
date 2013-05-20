// Hard dependancy on Highcharts.js
(function($) {
	$.fn.hightimer = function( options ) {
		var defaults = {
			title: 'hightimer',		// timer title
			prefix: 'hightimer', 	// DOM prefix
			totalTime: 60*60, 		// seconds
			initTime: 0,			// date TODO: seconds
			tickInterval: 15,
			maxTick: 60,
			dynamicBack: false,
			labelFormatter: function() { return this.value },
			enabled: true,
			hidden: true,
			hideTime: 4.5*60*60
		}

		var settings = $.extend({}, defaults, options);

		// public
		this.updateTime = function(deltaSeconds) {
			settings.initTime = new Date(settings.initTime.getTime() + (deltaSeconds*1000));
		}

		this.setInitTime = function(time) {
			settings.initTime = time;
		}

		this.hideTimer = function() {
				this.delay(1000).animate({'top': "-175px"}, 400, "easeOutCubic", function(){}); 
				settings.hidden = true;
			}

		this.showTimer = function() {
				this.delay(1000).animate({'top': "-15px"}, 400, "easeOutCubic", function(){});
				settings.hidden = false;
			}

		return this.each( function() {

			// private 
			var $this = $(this),
				now = getNow(),
				data = {};

			$this.html("<div class='hightimer-back'></div><div id='" + settings.prefix + "-timer' class='hightimer'></div><div class='hightimer-frame'></div><div class='hightimer-title'>"+settings.title+"</div>");
		
			// Set the chart's data object which will show initial time
			if (settings.totalTime > 3600) {
				data = { id: 'hour', y: now.hours };
				if (now.hours > settings.totalTime/3600) {
					data.y = settings.totalTime/3600;
				}
			} else {
				data = {id: 'minute', y: now.minutes};
				if (settings.totalTime > now.minutes && now.hours < 1) {
					data.y = settings.totalTime/60
				}
			}

			// Create our chart to act as the actual timer mechanism
			chart = new Highcharts.Chart({
			
			    chart: {
			        renderTo: settings.prefix + '-timer',
			        type: 'gauge',
			        backgroundColor: "rgba(255,255,255,0)",
			        plotBackgroundColor: "rgba(255,255,255,0)",
			        plotBackgroundImage: null,
			        plotBorderWidth: 0,
			        plotShadow: false,
			        height: 116,
			        width: 116
			    },
			    
			    credits: {
			        enabled: false
			    },
			    
			    title: {
			    	text: null
			    },
			    
			    pane: {
			    	background: [{
			    		// default background
			    		backgroundColor: "rgba(255,255,255,0)"
			    	}, {
			    		// reflex for supported browsers
			    		backgroundColor: Highcharts.svg ? {
				    		radialGradient: {
				    			cx: 0.5,
				    			cy: -0.4,
				    			r: 1.9
				    		},
				    		stops: [
				    			[0.5, 'rgba(255, 255, 255, 0.2)'],
				    			[0.5, 'rgba(200, 200, 200, 0.2)']
				    		]
				    	} : null
			    	}]
			    },
			    plotOptions: {
			    	gauge: {
			    		dial: {
			                radius: '90%',
			                baseWidth: 3,
			                baseLength: '90%',
			                rearLength: 0,
			                backgroundColor: '#ac3123'	
			    		},
			    		pivot: {
			    			backgroundColor: '#ac3123'
			    		}
			    	}	
			    },
			    yAxis: {
			        labels: {
			            distance: -16,
			            style: {
			            	color: '#000',
			            	fontWeight:'normal',
			            	fontSize: '10px'
		            	},
		            	formatter: settings.labelFormatter
			        },
			        min: 0,
			        max: settings.maxTick,
			        lineWidth: 0,
			        lineColor: 'rgba(255,255,255,0)',
			        showFirstLabel: false,
			        
			        minorTickInterval: 'auto',
			        minorTickWidth: 1,
			        minorTickLength: 3,
			        minorTickPosition: 'inside',
			        minorGridLineWidth: 0,
			        minorTickColor: '#333',
			        
			        tickInterval: settings.tickInterval,
			        tickWidth: 2,
			        tickPosition: 'inside',
			        tickLength: 8,
			        tickColor: '#333',
			        title: {
			            text: '',
			            style: {
			                color: '#333',
			                fontWeight: 'bold',
			                fontSize: '12px',
			                lineHeight: '14px',
			                fontFamily: 'arial'                
			            },
			            y: 79
			        }       
			    },
			    
			    tooltip: {
			    	enabled:false,
			    	snap:80,
			    	shared:true,
			    	positioner: function() {
			    		return {x:38, y:66};
			    	},
			    	formatter: function () {
			    		return chart.tooltipText;
			    	}
			    },
			
			    series: [{
			        data: [data],
			        animation: false,
			        dataLabels: {
			            enabled: false
			        }
			    }]
			}, 
			                                 
			// Update the timer every 2 seconds
			function (chart) {
			    setInterval(function () {
			        var hour = chart.get('hour'),
			            minute = chart.get('minute'),
			            now = getNow(settings),
			            $el_back = $('#' + $this.attr('id') + ' div.hightimer-back');
			                
			    	
			    	if (settings.dynamicBack) {
				    	if (now.hours >= 3.0)
				    		$el_back.css('background-position', '0 -370px');
				    	else if (now.hours < 3.0 && now.hours >= 2.0)
				    		$el_back.css('background-position', '0 -285px');
				    	else if (now.hours < 2.0)
				    		$el_back.css('background-position', '0 -200px');
			    	}

			        if (now.hours > settings.hideTime/3600) {
			        	if (!settings.hidden) {
			       			$this.data('hightimer').hideTimer();
			       			settings.hidden = true;
			       		}
			        } else {
			        	// timer should be shown and updated
			        	if (settings.hidden) {
			        		$this.data('hightimer').showTimer();
			        		settings.hidden = false;
			        	}

			        	// Cache the tooltip text
				        //chart.tooltipText = 
							//pad(Math.floor(now.hours), 2) + ':' + 
				    		//pad(Math.floor(now.minutes), 2);

				    	if (settings.totalTime > 3600) {
				    		// if this is a timer with range greater than an hour
				    		if (settings.totalTime/3600 > now.hours) {
				    			// update our timer hand
				        		hour.update(now.hours, true, false);
				        	} else {
				        		// we are at the maximum range or beyond of this timer,
				        		// just leave the hand at the max range / 0 position.
				        		hour.update(settings.totalTime/3600, true, false);
				        	}
				        }
				        else {
				        	// this is a timer with range in minutes
				        	if (settings.totalTime > now.minutes && now.hours < 1) {
				        		// update our timer hand
				        		minute.update(now.minutes, true, false);
				        		if ($el_back.css('background-position') != '0 -115px') { 
				        			$el_back.css('background-position', '0 -115px'); 
				        			$this.css('opacity', '1.0');
				        		}

				        	} else {
				        		// we are at the maximum range
				        		minute.update(settings.totalTime/60, true, false);
				        		if ($el_back.css('background-position') != '0 -370px') { 
				        			$el_back.css('background-position', '0 -370px'); 
				        			$this.css('opacity', '0.40');
				        		}
				        	}
				        }
			        }
			    }, 2*1000);
			
			});	

			/**** utility functions ****/
			// get elapsed time in {hours:hh, minutes:mm, seconds:ss}
			function getNow() {
			    var now = new Date();
			    var ms_dif = (now - settings.initTime);
			    var hrs = ms_dif / (60*60*1000);   
			    var minutes = (ms_dif / (60*1000)) - Math.floor(hrs)*60;
			    var seconds = (ms_dif / 1000) - Math.floor(minutes)*60 - Math.floor(hrs)*60*60;
			    return {
			        hours: hrs,
			        minutes: minutes,
			        seconds: seconds
			    };
			};			

			// Pad numbers
			function pad(number, length) {
				// Create an array of the remaining length +1 and join it with 0's
				return new Array((length || 2) + 1 - String(number).length).join(0) + number;
			}				

		});

	};
})(jQuery);