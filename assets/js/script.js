// My OpenWeather API key f155825c2d9975029ce899c709c33acf
var APIKey = "f155825c2d9975029ce899c709c33acf";
var city = "";
var sCity = [];

// jQuery selectors
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWSpeed = $("#wind-speed");

// Event listeners
$(document).on("click", invokePastSearch);
$("#search-button").on("click", displayWeather);
$(window).on("load", loadLastCity);

function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}

function currentWeather(city) {
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);

    var weatherIcon = response.weather[0].icon;
    var iconUrl = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
    var date = new Date(response.dt * 1000).toLocaleDateString();

    $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconUrl + ">");
    var tempF = (response.main.temp - 273.15) * 1.80 + 32;
    $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
    $(currentHumidity).html(response.main.humidity + "%");
    var ws = response.wind.speed;
    var windSpeedMPH = (ws * 2.237).toFixed(1);
    $(currentWSpeed).html(windSpeedMPH + "MPH");
    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);

    if (response.cod == 200) {
      sCity = JSON.parse(localStorage.getItem("cityname")) || [];

      if (find(city) > 0) {
        sCity.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(sCity));
        addToList(city);
      }
    }
  });
}

function UVIndex(ln, lt) {
  var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;

  $.ajax({
    url: uvqURL,
    method: "GET"
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

function forecast(cityId) {
  var queryForcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + APIKey;

  $.ajax({
    url: queryForcastURL,
    method: "GET"
  }).then(function (response) {
    for (var i = 0; i < 5; i++) {
      var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
      var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
      var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + ".png";
      var tempK = response.list[((i + 1) * 8) - 1].main.temp;
      var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
      var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

      $("#Date" + i).html(date);
      $("#Temp" + i).html(tempF + "&#8457");
      $("#Humidity" + i).html(humidity + "%");
    }
  });
}
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
      city = liEl.textContent.trim();
      currentWeather(city);
    }
  }

function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

function loadLastCity() {
  $("ul").empty();
  sCity = JSON.parse(localStorage.getItem("cityname")) || [];
  if (sCity.length > 0) {
    for (var i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[sCity.length - 1];
    currentWeather(city);
  }
}
