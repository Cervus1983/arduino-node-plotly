var flatline = {
		count: 0,
		threshold: 30 // stop if T flatlines
	},

	plotly = require("plotly")("username", "apiKey"),

	data = [{
		x: [],
		y: [],
		stream: {
			token: "token",
			maxpoints: 10000
		}
	}],

	settings = {
		filename: (process.argv.length > 2 ? process.argv[2] : getTimeString().substring(0, 19)),
		layout: {
			title: (process.argv.length > 2 ? process.argv[2] : ""),
			yaxis: { range: [0, 100] }
		}
	},

	SerialPort = require("serialport").SerialPort,
	serialPort = new SerialPort("COM3"); // yours may be different


serialPort.on("open", function() {
	plotly.plot(data, settings, function(err, res) {
		if(err) { console.log(err); }
		console.log(res);

		var stream = plotly.stream("token"),

			reading = "",
			prev = "",

			// write to CSV file
			fs = require("fs"),
			csv = require("csv-write-stream"),
			writer = csv({ headers: ["t", "T"] }),
			filename = (process.argv.length > 2 ? process.argv[2] : getTimeString().replace(/:/g, "_").substring(0, 19))

		writer.pipe(fs.createWriteStream("csv/" + filename + ".csv"))

		serialPort.on("data", function(input) {
			reading = reading + input;

			if(reading.indexOf("\n") > -1) {
				var data = {
					x: getTimeString(),
					y: parseFloat(reading.slice(0, -1))
				};

				console.log(data.x + " " + data.y);
				writer.write([data.x, data.y])
				stream.write(JSON.stringify(data)+"\n");

				// stop if T flatlines
				if(reading == prev) { flatline.count++ } else { flatline.count = 0 }
				if(flatline.count >= flatline.threshold - 1) {
					writer.end();
					process.exit()
				}

				prev = reading;
				reading = "";
			}
		})
	})
})


function getTimeString() {
	var time = new Date(),
		timeString = time.toISOString().replace(/T/, " ").replace(/Z/, "");

	return timeString;
}
