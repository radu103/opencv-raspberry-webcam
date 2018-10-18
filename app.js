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
			
			var width = im.width();
			var height = im.height();
			
			if (width < 1 || height < 1) 
				throw new Error('Image has no size');

			var sectorWidth = Math.round(width / 6);
			
			for(var i = 1; i <= 6; i++)
			{
				let x1 = (i-1) * sectorWidth;
				let croppedImg = im.crop(x1, 0, sectorWidth - 1, height);
				
				let cropName = folder + name + "_c" + i + '.jpeg';
				croppedImg.save(cropName);
				console.log("Saved section image " + i + " : ", cropName);
				
				var im_canny = croppedImg.copy();

				var lowThresh = 0;
				var highThresh = 100;
				var nIters = 2;

				im_canny.canny(lowThresh, highThresh);
				im_canny.dilate(nIters);
			  
				var contours = im_canny.findContours();

				var cars = Math.ceil(contours.size() / 2);
				
				console.log("Cars " + i + " : ", cars);
				
				//var fileName2 = folder + name + "_" + i + '_canny.jpeg';
				//im_canny.save(fileName2);
				//console.log("Saved image : ", fileName2);
			}
		});
	}); 
	
}, 30000);
