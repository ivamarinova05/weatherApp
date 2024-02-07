// ACCESSING ALL THE HTML COMPONENTS REQUIRED TO PERFORM ACTIONS ON.
let button = document.querySelector('.searchBtn');
let inputvalue = document.querySelector('.inputLocation');
let temp = document.querySelector('.temp');
let desc = document.querySelector('.desc');
let nameOfCity = document.querySelector('.city');
let highestTemp = document.querySelector('.highestTemp');
let lowestTemp = document.querySelector('.lowestTemp');
let rainfall = document.querySelector('.rainfall-chance');
let rainfallPrec = document.querySelector('.rainfall-precip');
let feelsLike = document.querySelector('.feels-like');
let relationToActTemp = document.querySelector('.relation-to-actual-temp');
let prevButton = document.querySelector('.prev-item-btn');
let nextButton = document.querySelector('.next-item-btn');

function getDefaultStartTime()
{
   let currentTime = new Date;
   let currentHours = currentTime.getHours();
   if(currentHours < 2) {
    return 0;
   }
   else if(currentHours > 21)
   {
    return 19;
   }
   else{
    return currentHours - 2;
   }
}

function checkUnablePrevNextBtns()
{
    let firstItemTime = document.querySelector(`.menu-item-1-time`).innerText;
    let secondItemTime = document.querySelector(`.menu-item-2-time`).innerText;
    let disablePrevButton = ( firstItemTime === "Now" && Number(secondItemTime) === 1) || Number(firstItemTime) === 0; 
    prevButton.disabled = disablePrevButton;
    if(!disablePrevButton)
    {
        prevButton.classList.remove('disabled');
    }
    else{
        prevButton.classList.add('disabled');
    }

    let lastItemTime = document.querySelector(`.menu-item-5-time`).innerText;
    let secondTolastItemTime = document.querySelector(`.menu-item-4-time`).innerText;
    let disableNextButton = (lastItemTime === "Now" && Number(secondTolastItemTime) == 22)  || Number(lastItemTime) === 23;
    nextButton.disabled = disableNextButton;
    if(!disableNextButton)
    {
        nextButton.classList.remove('disabled');
    }
    else{
        nextButton.classList.add('disabled');
    }
}

function displayMainWeatherData(weather)
{
    temp.innerText=`${weather.current.temp_c.toFixed()}°C`
    desc.innerText=`${weather.current.condition.text}`
}

function displayForecast(weather)
{
    const dayNames =["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for(let i=0; i < 5; i++)
    {
        let dailyForecast = weather.forecast.forecastday[i];
        if( i === 0)
        {
            highestTemp.innerText = `H : ${dailyForecast.day.maxtemp_c.toFixed()}°C`;
            lowestTemp.innerText = `L : ${dailyForecast.day.mintemp_c.toFixed()}°C`;

            rainfall.innerText = `Chance of rain: ${dailyForecast.day.daily_chance_of_rain}%`;
            rainfallPrec.innerText = `${dailyForecast.day.totalprecip_mm} mm expected today.`;
            feelsLike.innerText = `${weather.current.feelslike_c.toFixed()}°C`;
            relationToActTemp.innerText = `Similar to the actual temperature`;
        }
        let forecastDay = document.querySelector(`.day-${i+1}-day`);
        let forecastCond = document.querySelector(`.day-${i+1}-condition`);
        let forecastTemp = document.querySelector(`.day-${i+1}-temp`);

        let weekDay = new Date(dailyForecast.date).getUTCDay();
        let weekDayName = i === 0 ? `Today` : dayNames[weekDay];

        forecastDay.innerText=`${weekDayName}`;
        forecastCond.innerText=`${dailyForecast.day.condition.text}`;
        forecastTemp.innerText=`${dailyForecast.day.avgtemp_c.toFixed()}°C`;
    }
}

async function displayWeather(cityName) 
{
    nameOfCity.innerText = cityName;
    let weatherRes = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=d02fd2da13d14895b35210526240502&q=${cityName}&days=5&aqi=no`);
    let weatherJSON = await weatherRes.json();

    displayMainWeatherData(weatherJSON);
    displayForecast(weatherJSON);
}

async function getLocalData()
{
    let ipRes = await fetch(`https://api.ipgeolocation.io/getip`);
    let currIp = await ipRes.json();

    let cityRes = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=678a4b225457437f9c359e32a3febcd4&ip=${currIp.ip}&fields=city`)
    let cityJSON = await cityRes.json();

    return cityJSON;
}

//Carousel logic
async function displayCarouselData(cityName, startTime)
{   
    let currentTime = new Date;
    let currentHours = currentTime.getHours();
    let timeToSet = startTime;

   let weatherRes = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=d02fd2da13d14895b35210526240502&q=${cityName}&days=1&aqi=no`);
   let weatherJSON = await weatherRes.json();

   for(let i = 0; i < 5; i++)
   {
        let currTime = document.querySelector(`.menu-item-${i + 1}-time`);
        currTime.innerText = timeToSet === currentHours ? `Now` : timeToSet;

        let currIcon = document.querySelector(`.menu-item-${i + 1}-icon`).childNodes[0];
        currIcon.setAttribute('src', `https:${weatherJSON.forecast.forecastday[0].hour[timeToSet].condition.icon}`)
 
        let currTemp = document.querySelector(`.menu-item-${i + 1}-deg`);
        currTemp.innerText = `${weatherJSON.forecast.forecastday[0].hour[timeToSet].temp_c.toFixed()}°C`;
        timeToSet++;
   }
}

window.addEventListener('load', async function(){
    let cityJSON = await getLocalData();

    displayWeather(cityJSON.city);
    let startTime = getDefaultStartTime();
    await displayCarouselData(cityJSON.city, startTime);
    checkUnablePrevNextBtns();
} )

button.addEventListener('click', function() {
    displayWeather(inputvalue.value);
    let startTime = getDefaultStartTime();
    displayCarouselData(inputvalue.value, startTime);
})

inputvalue.addEventListener('keypress', function(event){
    if(event.key === "Enter")
    {
        event.preventDefault();
        displayWeather(inputvalue.value);
        let startTime = getDefaultStartTime();
        displayCarouselData(inputvalue.value, startTime);
    }
})

prevButton.addEventListener('click', async function() {
    let firstItemTime = document.querySelector(`.menu-item-1-time`).innerText;
    let cityName = inputvalue.value;
    if(!cityName)
    {
        let cityJSON = await getLocalData();
        cityName = cityJSON.city;
    }
    await displayCarouselData(cityName, Number(firstItemTime) - 1);
    checkUnablePrevNextBtns();
})

nextButton.addEventListener('click', async function() {
    let firstItemTime = document.querySelector(`.menu-item-1-time`).innerText;
    let cityName = inputvalue.value;
    if(!cityName)
    {
        let cityJSON = await getLocalData();
        cityName = cityJSON.city;
    }
    await displayCarouselData(cityName, Number(firstItemTime) + 1);
    checkUnablePrevNextBtns();
})
    