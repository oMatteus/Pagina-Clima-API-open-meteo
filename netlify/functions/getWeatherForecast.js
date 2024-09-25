const fetch = require('node-fetch');

exports.handler = async(lat,lon)=>{

    const apiKey = process.env.API_KEY;

    const request = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no&lang=pt`);

    const json = await request.json();  

    return json;
};