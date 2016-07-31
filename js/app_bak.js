
// For test and demo: create a global var for dynamic access and demo purposes.
var sqs$ngapp = '';

// Some config vars, Namespaced. We can play with these.
var configs = {};
configs['num_buildings']		= 2; // How many buildings in this simulation?
configs['num_floors']			= 100; // How many floors does each(/TODO:Default) building have?
configs['num_elevators']		= 2; // How many elevators does each(/TODO:Default) building have?
configs['time_travel']			= .25; // Time (seconds) taken to travel 1 floor (e.g. from 1-2).
configs['time_stop']			= 20; // Time (seconds) taken per elevator stop.
configs['time_base']			= 100; // 1000 = 1 second. Time multiplier. How fast should the simulation run?


(function() {
	// From the makers of the StairMaster(tm), we bring you....
	var app = angular.module('elevatorMaster', [] );
	sqs$ngapp = app;

	app.controller('SimulationController', function($scope, $http) {
		var obj = this;

		// High level, a building is the unit being tested/simulated.
		// The simulation can compare multiple buildings.
		obj.buildings			= [];

		var Building = function(name, algo) {
			this.name			= name;
			this.algorithm		= algo; // Which algorithm do the elevators here follow?
			this.elevators		= configs['num_elevators'];
			this.score			= 0; // TBA: keep score of how each building does fulfilling requests.

			obj.buildings.push(this);
			return this;
		}

		// Start the simulation!
		var initialize = function() {
			var buildings = [];
			for(var i = 0 ; i < configs['num_buildings']; i++) {
				buildings[i] = new Building("Building_" + i); // Construct pushes to master-list.
			}
		}

		initialize();

	// });
	// // app.controller('UserController', ['$scope', '$http', function($scope, $http){
	// app.controller('BuildingController', function($scope, $http) {
		var obj = this;

		this.car_height			= 60; // Car height in pixels.
		this.building_height 	= 500; // Building height in pixels.

		// And computed private values.
		var floor_height 		= (this.building_height - this.car_height) / configs['num_floors']; // Floor height in pixels.

		// Set up the high-level containers and other building-level vars.
		obj.elevators			= [];
		obj.people				= [];
		obj.requests			= [];


		// Class outlines
		var Elevator = function(name) {
			this.name			= name;
			this.requests		= [];
			this.location		= 0;
			this.home_floor		= 0;
			this.status			= 'free';

			obj.elevators.push(this);
			return this;
		}

		var Person = function(name, location, destination) {
			this.name			= name;
			this.location		= location;
			this.destination	= destination;

			obj.people.push(this);
			return this;
		}
		var Request = function(origin, destination) {
			this.origin			= origin;
			this.destination	= destination;

			obj.requests.push(this);
			return this;
		}

		// Protos for Elevators
		Elevator.prototype.move_to_floor = function(new_floor) {
			if(new_floor < 0 || new_floor > configs['num_floors']) { return false; } // Invalid!

			$(".elevator_car.elevName_" + this.name)
				.animate({'bottom': new_floor * floor_height}, this.compute_move_time(new_floor));

			this.location = new_floor;
			return;
		}
		Elevator.prototype.compute_move_time = function(new_floor) {
			return (Math.abs(new_floor - this.location) * configs['time_travel']) * configs['time_base'];
		}


		// Start up this building!
		var initialize = function() {
			var els = [];
			for(var i = 0 ; i < configs['num_elevators']; i++) {
				els[i] = new Elevator("Car_" + i);
			}
		}

		initialize();

		return this;
	});

})();
