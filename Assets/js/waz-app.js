$(document).ready(function() {
    //render weather only when everything is ready
    renderWather();
});
function renderWather() {
    //on click searbox get the value and clear the input imidately & render weather
    $("#search-button").on("click", function() {
        var searchValue = $("#search-value").val();
        $("#search-value").val("");
        searchWeather(searchValue);
    });
    //or if the history list is clicked then grab the name and search weather weather .
    $(".history").on("click", "li", function() {
      searchWeather($(this).text());
    });
    //create a row for results to be desplayed on the list
    function makeRow(name) {
      var li = $("<li>").addClass("list-group-item  list-group-item-action").text(name);
      li.attr('id',name);
      $(".history").prepend(li);
    }
    //important url and apike decleared in a variable
    var queryWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" ;
    var queryForcastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
    var queryUviURL = "http://api.openweathermap.org/data/2.5/uvi?"
    var apiKey = "&appid=d3b7c863f76c2face39c257aa031ae05";
    var imgURL = "https://openweathermap.org/img/w/";
    var weatherUnit = "&units=imperial";
    //search for the city input information and search city and country name and wind-sped, humidity and temp 
    // then call for 5-day forcast and  UVI index
    function searchWeather(searchValue) {
        queryURL = queryWeatherURL + searchValue + weatherUnit + apiKey;
        $.ajax({
            url: queryURL,
            method: "GET",
            error: function (){
                if (!searchValue){
                    alert("please enter city");
                } else {
                    alert('No city is found! Please check spelling error!');
                }
            }
        }).then(function(data) {
            //city and country is rendered to a variable and pushed into the local storage
            var cityCountry = data.name + ", " + data.sys.country;
            if (history.indexOf(searchValue) === -1 ) {
                history.push(cityCountry);
                window.localStorage.setItem("history", JSON.stringify(history));
                makeRow(cityCountry);
            } 
            //then clear any existing weather from current weather div to be replaced by the new weather for the new city
            $("#today").empty();
            // then create  apporoperate tags and pass class and id if needed and add the name, wind, humidity and temp and append the div that was cleared above
            var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
            var card = $("<div>").addClass("card");
            var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
            var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
            var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
            var cardBody = $("<div>").addClass("card-body");
            var img = $("<img>").attr("src", imgURL + data.weather[0].icon + ".png");
            title.append(img);
            cardBody.append(title, temp, humid, wind);
            card.append(cardBody);
            $("#today").append(card);
            // then call the next (render five day forcast and uv index)
            renderForecast(searchValue);
            renderUVIndex(data.coord.lat, data.coord.lon);
        });
    }
    function renderForecast(searchValue) {
        queryURL = queryForcastURL + searchValue + apiKey;
        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function(data) {
            //console.log(data);
            // populate the forcast div with 5-day forcast in h3 tag and apend a div for the five day weather.
            $("#forecast").html("<h3 id=\"forcastHeader\" class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
            // loop over all forecasts (by 3-hour increments)
            for (var i = 0; i < data.list.length; i++) {
                if ( data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    // create div for weather forcast
                    var col = $("<div>").addClass("xyz col-md-3");
                    var card = $("<div>").addClass("card bg-primary text-white");
                    var body = $("<div>").addClass("card-body p-3");
                    //create tags todays date, image, temp and humidity
                    var title = $("<h2>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                    var img = $("<img>").attr("src", imgURL + data.list[i].weather[0].icon + ".png");
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                    //apend the tags to the title, img, p1 & p2 to body, boy to card, card to col and finally col to the forcast div
                    $("#forecast .row").append(col.append(card.append(body.append(title, img, p1, p2))));
                }
            }
        });
    }
    function renderUVIndex(lat, lon) {
        var queryURL = queryUviURL + apiKey + "&lat="+lat+"&lon="+lon;
        $.ajax({
            url: queryURL,
            method: "GET", 
        })
        .then(function(data) {
            //console.log(data.value);
            //create pagragragh for the uv index text and span tag for the data value number and append it to today's forcast only
            var uvText = $("<p>").text("UV Index: ");
            var mySpan = $("<span>").addClass("btn btn-sm").text(data.value);
            // change color depending on uv value
            if (data.value < 3) {
                mySpan.addClass("btn-success");
            }else if (data.value < 7) {
                mySpan.addClass("btn-warning");
            }else {
            mySpan.addClass("btn-danger");
            }  
            $("#today .card-body").append(uvText.append(mySpan));
        });
    }
    // display history to be viewed if there is saved in local storage or from new search result
    var history = JSON.parse(window.localStorage.getItem("history")) || []; 
    if (history.length > 0) {
    searchWeather(history[history.length-1]);
    } 
    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }
    //clear local storage after confirmiton and if there is city saved else do nothing
    $('#clear').on('click', function(){
        if (localStorage.length !== 0) {
            var clear = confirm('Press OK to clear history!');
            if(clear){
                $('.history').empty();
                localStorage.clear();
            }
        }
    });
}
