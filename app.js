var exec = require('executive');
var cv = require('opencv');

var folder = '/home/pi/webcam/images/';

setInterval(function(){

	var date = new Date();
	var name = date.toISOString();
	var fileName = folder + name + '.jpeg';
	console.log(fileName);

	exec('fswebcam -r 1920x1080 --no-banner ' +  fileName).then(function(res){
		cv.readImage(fileName, function(err, im){
			
			if(err) {
				console.log(err);
			}
			
			im.convertGrayscale();
			
			var contours = im.findContours();
			console.log(contours);
			console.log(' ');
		});
	}); 
	
}, 10000);
