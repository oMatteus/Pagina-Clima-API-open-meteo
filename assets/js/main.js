const ApiKey = process.env.API_KEY;

async function loadPage(){
    console.log('INICIO');
    try{
        const res = await fetch('clima.html');

        if(res.status !== 200){
            throw new Error('404 page not found');
        };
        const html = await res.text();

        loadResult(html)
    }catch(e){
        console.log(e);
    };
};

function loadResult(res){
    const result = document.querySelector('body');
    result.innerHTML = res;
}

const form = document.querySelector(".form");

const input = document.querySelector('#cidade');
let inputNumber = 0;

input.addEventListener('input',async(e)=>{

    console.log('input changed');
    inputNumber++;

    console.log(inputNumber);

    if(inputNumber > 4){

         const suggestion = await makeSuggestion(input.value);
        showSuggestion(suggestion);

    };      
})

async function makeSuggestion(inputValue){

    try{
        const request = await fetch(`https://api.weatherapi.com/v1/search.json?key=${ApiKey}&q=${inputValue}`);

        const json = await request.json();    

        // console.log(json);

        return json;

        // console.log(cidade)

    }catch(e){
        console.log(e + 'Geocoding error');
    }; 

}

async function showSuggestion(itens){
    
    console.log(itens);

    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    itens.forEach(suggestion => {

        const div = document.createElement('div');
        div.textContent = `${suggestion.name}, ${suggestion.region} - ${suggestion.country}`;

        div.classList.add('suggestion-item');

        div.addEventListener('click', () => {
            input.value = suggestion.name;
            suggestionsDiv.innerHTML = '';
        });
        suggestionsDiv.appendChild(div);
    });
}

async function getWeather(lat,lon){
   
    console.log(input.value);

    const request = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${ApiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`);

    const json = await request.json();  
    
    console.log(json);

    // console.log(json);

    // await loadPage();
    // await start(input.value)

    // return json;
};

class WeatherForecast{
    constructor(nome){
        this.nome = nome;
        this.result = '';
        this.lat = '';
        this.lng = '';
        this.previsao = '';
        this.unit='°';
    };

    async getForecast(){
        const request = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lng}&current=temperature_2m,apparent_temperature,precipitation,rain,showers,weather_code,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,precipitation_hours,precipitation_probability_max&timezone=America%2FSao_Paulo`);
    
        const json = await request.json();
    
        console.log(json);
        this.previsao = json
    };

    weatherCodeVerify(id){

        const weatherCode = {
            0 : {
                text:'Céu limpo', 
                icon:'assets/img/icones/wi-day-sunny.svg', 
                bg:'assets/img/bg/ceu-limpo.jpg'},
            1 : {
                text:'Parcialmente limpo', 
                icon:'assets/img/icones/wi-day-cloudy.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            2 : {
                text:'Parcialmente nublado', 
                icon:'assets/img/icones/wi-day-cloudy-high.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            3 : {
                text:'Nublado', 
                icon:'assets/img/icones/wi-cloudy.svg'},
                bg:'assets/img/bg/ceu-limpo.jpg',
            45 : {
                text:'Névoa', 
                icon:'assets/img/icones/wi-fog.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            51 : {
                text:'Garoa Leve', 
                icon:'assets/img/icones/wi-raindrop.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            53 : {
                text:'Garoa Moderada',  
                icon:'assets/img/icones/wi-raindrops.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            55 : {
                text:'Garoa Intensa', 
                icon:'assets/img/icones/wi-rain.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            61: {
                text:'Garoa Intensa', 
                icon:'assets/img/icones/wi-rain.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            63: {
                text:'Garoa Intensa', 
                icon:'assets/img/icones/wi-rain.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            80 : {
                text:'Leves pancadas de chuva', 
                icon:'assets/img/icones/wi-showers.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            81 : {
                text:'Pancadas de chuva', 
                icon:'assets/img/icones/wi-rain-wind.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            82 : {
                text:'Pancadas de chuva intensa', 
                icon:'assets/img/icones/wi-night-thunderstorm.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            95 : {
                text:'Pancadas de chuva intensa', 
                icon:'assets/img/icones/wi-night-thunderstorm.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            96 : {
                text:'Pancadas de chuva intensa', 
                icon:'assets/img/icones/wi-night-thunderstorm.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
            99 : {
                text:'Pancadas de chuva intensa', 
                icon:'assets/img/icones/wi-night-thunderstorm.svg',
                bg:'assets/img/bg/ceu-limpo.jpg'},
                
        
                
        };

        if( weatherCode[id] === 'undefined') console.log('Invalid code');
        
        return weatherCode[id];
    };
};

async function start(local){

    const cidade = new WeatherForecast(local);
    
    await cidade.geocoding();
    await cidade.getForecast();
    
    printCurrentForecast(cidade);
    printWeekForecast(cidade);
    hideSkeleton();
};
start()


function printCurrentForecast(cidade){

    console.log(cidade);

    const elements = {
        title: document.querySelector('.title'),
        currentTitle: document.querySelector('.current-title'),
        currentTemperature: document.querySelector('.current-temperature'),
        currentTemperatureText: document.querySelector('.current-temperature-text'),
        currentIcon: document.querySelector('.icone-grande'),
    };

    const currentWeatherForecast = cidade.previsao.current;
    const currentWeatherCode = cidade.weatherCodeVerify(currentWeatherForecast.weather_code);

    console.log(currentWeatherForecast);

    elements.title.innerHTML += cidade.result;
    elements.currentIcon.setAttribute('src', currentWeatherCode.icon);
    elements.currentTemperatureText.innerHTML = currentWeatherCode.text;
    elements.currentTemperature.innerHTML += currentWeatherForecast.temperature_2m.toFixed(0) + cidade.unit;

    dynamicBG(currentWeatherCode);


    function dynamicBG(e){

        // const bg = document.querySelector()
        // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        // console.log(e);


    }
};

function printWeekForecast(cidade){

    cidade.previsao.daily.temperature_2m_max.forEach((tempMax, index) => {
        if(!index) return;
        const maxTemp = document.querySelector(`#card${index} .max-line p`);
        maxTemp.innerHTML = tempMax.toFixed(0);
    });


    cidade.previsao.daily.temperature_2m_min.forEach((tempMin, index) => {
        if(!index) return;
        const minTemp = document.querySelector(`#card${index} .min-line p`);
        minTemp.innerHTML = tempMin.toFixed(0);
    });


    cidade.previsao.daily.weather_code.forEach((icon, index) => {
        if(!index) return;

        const card = document.querySelector(`#card${index} .card-icon`);
        const cardDescription = document.querySelector(`#card${index} .card-description`)

        const weekWeatherCode = cidade.weatherCodeVerify(icon);
        card.setAttribute('src', weekWeatherCode.icon);
        cardDescription.innerText = weekWeatherCode.text
    });

    cidade.previsao.daily.time.forEach((date, index) => {
        if(!index) return;

        const dayOfWeek = document.querySelector(`#card${index} .day-of-week`);

        week = {
            0 : 'Dom',
            1 : 'Seg',
            2 : 'Ter',
            3 : 'Qua',
            4 : 'Qui',
            5 : 'Sex',
            6 : 'Sab'
        };
        
        let day = new Date(date);
        day = day.getDay();

        console.log(week[day]);
        dayOfWeek.innerHTML = week[day];
    })   


}

function hideSkeleton(){
    const skeleton = document.querySelector('.skeleton');
    skeleton.style.display = 'none'
}

function getGeolocation(){

    if(navigator.geolocation.getCurrentPosition((position)=>{
        console.log('Position: ', {position});

    }));


};

// getGeolocation();