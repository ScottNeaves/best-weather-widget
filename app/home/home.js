'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl'
  });
  $routeProvider.when('/', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
  $scope.query = '';
  $scope.forecasts = [];
  $scope.loading_state = 'initial';
  $scope.error = '';
  $scope.current_location = '';
  d3.select(window).on('resize', resize);

  $scope.search = function() {
    $scope.reset_temp_chart();
    $scope.loading_state = 'loading';
    //Note: cors-anywhere.herokuapp.com is a proxy that passes requests through to APIs that don't have CORS enabled.
    $http.get('https://cors-anywhere.herokuapp.com/http://www.metaweather.com/api/location/search/?query='.concat($scope.query))
      .then(function(location_info){
        if (location_info.data.length == 0){
          $scope.error = 'No location results for that query! Please try a different search.';
          throw $scope.error;
        }
        $scope.current_location = location_info.data[0].title;
        return location_info.data[0].woeid;
      }).then(function(woeid){
        return $http.get('https://cors-anywhere.herokuapp.com/http://www.metaweather.com/api/location/'.concat(woeid));
      }).then(function(weather_data){
        $scope.forecasts = weather_data.data.consolidated_weather.slice(1, 6);
        $scope.average_temp = $scope.forecasts.reduce(function(sum, value){ return sum + value['the_temp']; }, 0) / 5;
        $scope.create_temp_chart();
        $scope.loading_state = 'finished';
      }).catch(function(error){
        $scope.loading_state = 'initial';
      });
  }
  $scope.create_temp_chart = function() {

    // Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = parseInt(d3.select('body').style('width'), 10) - 100,
        width = width - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the high_temp line
    var high_temp_line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.high_temp); });

    // Define the low_temp line
    var low_temp_line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.low_temp); });

    // Adds the svg canvas
    var svg = d3.select(".temp-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    // Process the data
    $scope.forecasts.forEach(function(d) {
        d.date = parseDate(d.applicable_date);
        d.high_temp = +d.max_temp;
        d.low_temp = +d.min_temp;
    });

    // Scale the range of the data
    x.domain(d3.extent($scope.forecasts, function(d) { return d.date; }));
    y.domain([0, d3.max($scope.forecasts, function(d) { return d.high_temp; })]);

    // Add the paths.
    svg.append("path")
        .attr("class", "high_temp_line")
        .attr("d", high_temp_line($scope.forecasts));
    svg.append("path")
        .attr("class", "low_temp_line")
        .attr("d", low_temp_line($scope.forecasts));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
  }

  $scope.reset_temp_chart = function(){
    $(".temp-chart").empty();
  }

  function resize(){
    console.log('resize');
    $scope.reset_temp_chart();
    $scope.create_temp_chart();
  }

}]);
