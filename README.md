# boston-weather-d3

A dashboard that visualizes weather forecast and history in Boston.
It's built with D3.js using the Visual Crossing weather API.

This project also has a simple Express.js web server that requests data from Visual Crossing on a 30-minute interval, stores it, and serves it to the dashboard through its own API. 
This controls costs by limiting the number of direct requests made to the Visual Crossing API (less than 1000 per day is free) and adds a layer of security.

Link to the live page: https://pmbaker712.github.io/boston-weather-d3/
