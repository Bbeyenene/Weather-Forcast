$(document).ready(function() {
    fetchWather();
   
});


function fetchWather() {
    //on click searbox get the value and clear the input imidately & go to search weather
    $("#search-button").on("click", function() {
        var searchValue = $("#search-value").val();
        $("#search-value").val("");
        searchWeather(searchValue);
    });
    //or if list is clicked then take that list to search weather for that.
    $(".history").on("click", "li", function() {
      searchWeather($(this).text());
    });
    //create a row for results to be desplayed on the list
    function makeRow(text) {
        //list-group-item  list-group-item-action
      var li = $("<li>").addClass("list-group-item  list-group-item-action").text(text);
      li.attr('id','myList');
      $(".history").prepend(li);
    }
    var queryWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" ;
    var queryForcastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
    var queryUviURL = "http://api.openweathermap.org/data/2.5/uvi?"// 
    var apiKey = "&appid=d3b7c863f76c2face39c257aa031ae05";
    var imgURL = "https://openweathermap.org/img/w/";
    function searchWeather(searchValue) {
        queryURL = queryWeatherURL + searchValue + "&units=imperial" + apiKey;
      $.ajax({
        url: queryURL,
        type: "GET",
      }).then(function(data) {
        //console.log(data.sys.country);
        // create history local storage and push the name of the city and country
        var cityCountry = data.name + ", " + data.sys.country;
        if (history.indexOf(searchValue) === -1) {
        history.push(cityCountry);
        window.localStorage.setItem("history", JSON.stringify(history));
        
        makeRow(cityCountry);
        }
        // clear any existing weather to be poputated by this result
        $("#today").empty();
        // create html content for current weather

        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", imgURL + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        });
    }
    
    function getForecast(searchValue) {
        queryURL = queryForcastURL + searchValue + apiKey;
        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function(data) {
            //console.log(data);
          // overwrite any existing content with title and empty row
          $("#forecast").html("<h3 id=\"forcastHeader\" class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
          // loop over all forecasts (by 3-hour increments)
          for (var i = 0; i < data.list.length; i++) {
                if ( data.list[i].dt_txt.indexOf("15:00:00") != -1) {
                    // create html elements for date, weather image, temp and humidity and append to the forcast div
                    var col = $("<div>").addClass("col-md-2");
                    var card = $("<div>").addClass("card bg-primary text-white");
                    var body = $("<div>").addClass("card-body p-3");
                    var title = $("<h2>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                    var img = $("<img>").attr("src", imgURL + data.list[i].weather[0].icon + ".png");
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#forecast .row").append(col);
                }
            }
        });
    }
  
    function getUVIndex(lat, lon) {
        var queryURL = queryUviURL+ apiKey + "&lat="+lat+"&lon="+lon;

        $.ajax({
            url: queryURL,
            method: "GET", 
        })
        .then(function(data) {
            var uv = $("<p>").text("UV Index: ");
            var btn = $("<span>").addClass("btn btn-sm").text(data.value);
            // change color depending on uv value
            if (data.value < 3) {
                btn.addClass("btn-success");
            }else if (data.value < 7) {
                btn.addClass("btn-warning");
            }else {
            btn.addClass("btn-danger");
            }  
            $("#today .card-body").append(uv.append(btn));
        });
    }

    // display history to be viewed if there is saved in local storage or new search result
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
