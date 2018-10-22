var exec = require('executive');
var cv = require('opencv');
var randomInt = require('random-int');

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

			var offset = 200;
			var offset2 = 80;
			var sectorWidth = 260;
			
			for(var i = 1; i <= 6; i++)
			{
				let x1 = 0;
				
				if(i <= 3){
					x1 = (i-1) * sectorWidth + offset;
				}
				else{
					x1 = width - offset2 - sectorWidth - (6 - i) * sectorWidth;
				}	
				
				let croppedImg = im.crop(x1, 0, sectorWidth - 1, height);
				
				let cropName = folder + name + "_c" + i + '.jpeg';
				croppedImg.save(cropName);
				console.log("Saved section image " + i + " : ", cropName);

				let cropNameBw = folder + name + "_c" + i + '_bw.jpeg';
				var limit = getAverageThreshold(croppedImg, 100);
				let bwImg = getBlackAndWhiteMask(croppedImg, limit);
				bwImg.save(folder + cropNameBw);
				console.log("Saved section BW image " + i + " : ", cropNameBw);
				
				var minCarArea =  90 * 90; // min car size
				var maxCarArea = width * height / 16;

				var contours = bwImg.findContours();

				var cars = 0;

				for (var j = 0; j < contours.size(); j++) {

					var area = contours.area(j);
					//console.log("Area " + j + " : " + area);

					if (area < minCarArea || area > maxCarArea) continue;

					cars += 1;
				}
				
				console.log("Cars " + i + " : ", cars);
			}
		});
	}); 
	
}, 30000);

function getAverageThreshold(cvImg, noPoints){

    var threshold = 0;

    var data = cvImg.getData();
    var height = cvImg.height();
    var width = cvImg.width();

    var sum = 0;
    var cnt = 0;

    for(var i = 0; i < noPoints; i++){
        
        var x = randomInt(width);
        var y = randomInt(height);

        var pos = 3 * (width * x + y);
        var val = data[pos] + data[pos + 1] + data[pos + 2];
        //console.log(val);

        if(!isNaN(val)){
            sum += val;
            cnt += 1;
        }
    }

    threshold = Math.round(sum / cnt);

    return threshold;
}

function getBlackAndWhiteMask(cvImg, limit){
    
    // B, G, R
    var WHITE = [255, 255, 255];

    var width = cvImg.width();
    var height = cvImg.height();

    var bwImg = new cv.Matrix(height, width, cv.Constants.CV_8UC1, WHITE);
    
    var oldData = cvImg.getData();
    var data = bwImg.getData();

    for(var x = 0; x < 3 * width; x++){
        for(var y = 0; y < 3 * height; y++){
            
            var pos = 3 * (width * x + y);
            var val = oldData[pos] + oldData[pos + 1] + oldData[pos + 2];
            
            var newPos = width * x + y;

            if(val < limit){
                data[newPos] = 0;
                data[newPos + 1] = 0;
                data[newPos + 2] = 0;
            }
            else{
                data[newPos] = 255;
                data[newPos + 1] = 255;
                data[newPos + 2] = 255;
            }
        }
    }

    bwImg.put(data);

    return bwImg;
}
