import '../css/style.css';

const KEY_WEATHERAPI = process.env.API_KEY_WEATHER;
const KEY_UNSPLASH = process.env.API_KEY_UNSPLASH;

const myLocation = document.querySelector(".myLocation");

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

async function start(lat,lon){

    const cidade = new WeatherForecast(lat,lon);
    
    await cidade.getForecast();
    
    await loadPage('clima.html');
    await printCurrentForecast(cidade);
    printWeekForecast(cidade);
    hideSkeleton();
};

async function loadPage(page){
    console.log('INICIO');
    try{
        const res = await fetch(page);

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
    const result = document.querySelector('.page');
    result.innerHTML = res;
}

async function makeSuggestion(inputValue){

    try{
        const request = await fetch(`https://api.weatherapi.com/v1/search.json?key=${KEY_WEATHERAPI}&q=${inputValue}&lang=pt`);

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

        if(suggestion.country === 'Brazil') suggestion.country = 'Brasil';

        div.textContent = `${suggestion.name}, ${suggestion.region} - ${suggestion.country}`;
        div.classList.add('suggestion-item');
        div.addEventListener('click', () => {
            input.value = suggestion.name;
            suggestionsDiv.innerHTML = '';
            input.setAttribute('lat',suggestion.lat);
            input.setAttribute('lon',suggestion.lon);
            start(suggestion.lat,suggestion.lon)
        });
        suggestionsDiv.appendChild(div);
    });
}

class WeatherForecast{
    constructor(lat,lon){
        this.lat = lat;
        this.lon = lon;
        this.previsao = '';
        this.unit='°'
    };

    async getForecast(){
        const request = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${KEY_WEATHERAPI}&q=${this.lat},${this.lon}&days=7&aqi=no&alerts=no&lang=pt`);

        const json = await request.json(); 

        if(json.location.country === 'Brazil') json.location.country = 'Brasil';
        console.log(json);
        
        this.previsao = json;
    };
};

async function printCurrentForecast(cidade){

    console.log(cidade);
    const location = cidade.previsao.location;
    const locationName = `${location.name}, ${location.region} - ${location.country}`;
    console.log(locationName);

    const elements = {
        title: document.querySelector('.title'),
        currentTitle: document.querySelector('.current-title'),
        currentTemperature: document.querySelector('.current-temperature'),
        currentTemperatureText: document.querySelector('.current-temperature-text'),
        currentIcon: document.querySelector('.icone-grande'),
    };

    const currentWeatherForecast = cidade.previsao.current;
    

    console.log(currentWeatherForecast);

    elements.title.innerHTML += locationName;
    elements.currentIcon.setAttribute('src', currentWeatherForecast.condition.icon);
    elements.currentTemperatureText.innerHTML = currentWeatherForecast.condition.text;
    elements.currentTemperature.innerHTML += currentWeatherForecast.temp_c.toFixed(0) + cidade.unit;

    // dynamicBG(currentWeatherCode);


    await setBackgroudImage(currentWeatherForecast.condition.text);
};

function printWeekForecast(cidade){

    cidade.previsao.forecast.forecastday.forEach((previsao, index)=>{

        if(!index) return;

        console.log(previsao.date);

        //Adiciona temperatura maxima
        const maxTemp = document.querySelector(`#card${index} .max-line p`);
        maxTemp.innerHTML = previsao.day.maxtemp_c.toFixed(0);

        //Adiciona temperatura maxima
        const minTemp = document.querySelector(`#card${index} .min-line p`);
        minTemp.innerHTML = previsao.day.mintemp_c.toFixed(0);

        //Adiciona icone e texto no card
        const card = document.querySelector(`#card${index} .card-icon`);
        const cardDescription = document.querySelector(`#card${index} .card-description`)

        card.setAttribute('src', previsao.day.condition.icon);
        cardDescription.innerText = previsao.day.condition.text


        //Adiciona dia da semana
        const dayOfWeek = document.querySelector(`#card${index} .day-of-week`);

        const week = {
            0 : 'Dom',
            1 : 'Seg',
            2 : 'Ter',
            3 : 'Qua',
            4 : 'Qui',
            5 : 'Sex',
            6 : 'Sab'
        };
        
        let day = previsao.date;
        day = day.split("-").join("/");
        day = new Date(day);
        day = day.getDay();

        console.log(week[day]);
        dayOfWeek.innerHTML = week[day];

        ajustarTamanhoFonte(`#card${index}`,`#card${index} .card-description`)

    })

}

function hideSkeleton(){
    const skeleton = document.querySelector('.skeleton');
    skeleton.style.display = 'none'
}

function getGeolocation(){

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log('Position: ', {position});

        input.setAttribute('lat',position.coords.latitude);
        input.setAttribute('lon',position.coords.longitude);
        start(position.coords.latitude,position.coords.longitude)

    })
    

};

myLocation.addEventListener('click', async()=>{
    getGeolocation()
});

async function setBackgroudImage(text){

    const body = document.querySelector("body");

    try {

        if(document.querySelector('#bg-img')) document.querySelector('#bg-img').remove();

        const request = await fetch(`https://api.unsplash.com/search/photos?client_id=${KEY_UNSPLASH}&lang=pt&query=clima/${text}&page=1&per_page=1`);

        const json = await request.json();
        const imagem = json.results[0].urls.regular;

        const img = document.createElement('img');

        img.setAttribute('id', 'bg-img');
        img.setAttribute(`src`, imagem);
        body.style.backgroundImage = `url('${imagem}')`;
        body.style.backgroundSize = `cover`;

        body.appendChild(img);

    } catch (error) {
        console.log(error);
        throw new ReferenceError('Falha na requisiçao da imagem');
    }
};

function ajustarTamanhoFonte(box, seletor) {

    let card = document.querySelector(box);
    let texto = document.querySelector(seletor);
    let tamanhoFonte = 40;
    texto.style.fontSize = tamanhoFonte + 'px';

    const medidas = {
        h: card.offsetHeight,
        w: card.offsetWidth
    }

    let pwidth = texto.offsetWidth;

    while(pwidth > medidas.w){
        
        tamanhoFonte--;
        console.log(tamanhoFonte + ' Tamanho da fonta para '+ box);
        texto.style.fontSize = tamanhoFonte + 'px';
        pwidth = texto.offsetWidth;

        if (tamanhoFonte <= 1){
            break;
        }
    }

  }