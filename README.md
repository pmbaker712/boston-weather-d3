# boston-weather-d3

This is a dashboard that visualizes weather in Boston.
It is built with D3.js using the Visual Crossing weather API.

The project also has a simple Express.js web server that requests data from Visual Crossing on a 15-minute interval, stores it, and serves it to the dashboard through its own API.
This controls costs by limiting the number of direct requests made to the Visual Crossing API (less than 1000 per day is free), while securing my credentials.

Link to live page: https://pmbaker712.github.io/boston-weather-d3/
