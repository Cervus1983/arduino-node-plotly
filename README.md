Stream data from DS18B20 digital thermometer to a Plotly chart:
1) Upload ardu.ino to an Arduino board (requires OneWire.h and DallasTemperature.h)
2) Run node plot.js <title> to start listening to the serial port and streaming data to the Plotly chart (requires plotly, serialport, csv-write-stream)
