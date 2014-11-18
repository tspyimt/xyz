 var ffmpeg = require('fluent-ffmpeg');

 var source = '/home/sakshi/Desktop/Eminem_Space_Bound.mp4';
 var destination = '/home/sakshi/node_projects/ArtLock/web-app/testVideoWatermark.mp4';
 var text = ' THis is Watermark FFMPEG';


 var fontPath = '/home/sakshi/node_projects/ArtLock/web-app/fonts/';
 var proc1 = new ffmpeg({ source: source })
 .withAudioCodec('libvo_aacenc')
 .withAudioChannels(2)
 .withAudioFrequency(48000)
 .withAudioBitrate('128k')
 .withVideoCodec('libx264')
 .withVideoBitrate('1200k')
 .withSize('320x240')
 .toFormat('mp4')
 .addOption('-vf', 'drawtext=fontfile='+fontPath+'vollkorn-regular-webfont.ttf: text='+ text + ':fontcolor=black@1.0:fontsize=15:x=05: y=10')
 .saveToFile(destination, function (stdout, stderr) {
 console.log(stdout, stderr);
 });


/*
var PDF = require('pdfkit');
var fs = require('fs');
var PDFKit = require('pdfkitjs');
var ejs = require('ejs');

var user = {
  firstName: "Suroor",
  lastName: "Wijdan",
  city: "New Delhi",
  country: "India",
  _id: "12"
};

var buyer = {
  firstName: "David",
  lastName: "Dehaeck",
  city: "Paris",
  country: "France",
  zip: "112005",
  _id: "13"
};

var work = {
  title: "Game of Thornes",
  year: "2014",
  copyForArtRent: "20",
  copyForExhibition: "10",
  edition: "50",
  _id: "14"
};
var content;

fs.readFile(__dirname + '/web-app/views/contract.ejs', function (err, output) {
  content = output.toString('utf-8');
  var html = ejs.render(content, {user: user, buyer: buyer, work: work});
  var doc = new PDFKit('html', html);
  doc.toFile('/tmp/' + user._id + "_" + buyer._id + "_" + work._id + '.pdf', function (err, file) {
    console.log(err, file);
  });
});

*/
