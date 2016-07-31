
// For test and demo: create a global var for dynamic access and demo purposes.
var sqs$ngapp = '';

// Some config vars, Namespaced. We can play with these.
var configs = {};
configs['num_buildings']		= 3; // How many buildings in this simulation?
configs['num_floors']			= 100; // How many floors does each(/TODO:Default) building have?
configs['num_elevators']		= 2; // How many elevators does each(/TODO:Default) building have?
configs['time_travel']			= .25; // Time (seconds) taken to travel 1 floor (e.g. from 1-2).
configs['time_stop']			= 20; // Time (seconds) taken per elevator stop.
configs['time_base']			= 100; // 1000 = 1 second. Time multiplier. How fast should the simulation run?
configs['time_request_cycle']	= 5000; // Time between cycles of new incoming requests. 1000 = 1s.


(function() {
	// From the makers of the StairMaster(tm), we bring you....
	var app = angular.module('elevatorMaster', [] );
	sqs$ngapp = app;

	app.controller('SimulationController', function($scope, $http) {
		var obj = this;

		// High level, a building is the unit being tested/simulated.
		// The simulation can compare multiple buildings at once.
			// Buildings contain elevators (1:1 shafts)
		obj.buildings				= [];

		var Building = function(name, algo) {
			$building				= this;

			this.name				= name;
			this.algorithm			= algo; // Which algorithm do the elevators here follow?
			this.score				= 0; // TBA: keep score of how each building does fulfilling requests.

			this.car_height			= 100; // Car height in pixels.
			this.building_height 	= 500; // Building height in pixels.
			
			// And computed values.
			this.floor_height 		= (this.building_height - this.car_height) / configs['num_floors']; // Floor height in pixels.

			// Set up the high-level containers and other building-level vars.
			$building.elevators		= [];
			$building.people		= [];
			$building.requests		= [];

			// Set up the elevators in this building!
			var initialize_elevators = function() {
				var els = [];
				for(var i = 0 ; i < configs['num_elevators']; i++) {
					els[i] = new Elevator("Car_" + i, $building);
				}
			}
			initialize_elevators();

			this.event_loop			= new EventLoop($building);

			obj.buildings.push(this);
			return this;
		}

		// This is where the magic happens - the main algorithmic event!
		Building.prototype.distribute_requests = function() {
			var $building = this;

			while($building.requests.length > 0) {
				var req				= $building.requests.splice(0,1)[0]; // Remove from pending requests: we'll assign it!
				// console.log(req);
				var el 				= req.find_best_elevator();
				var elev			= $building.elevators[el];
				elev.add_request(req);
			}
			console.log($building);
		}

		// Class outlines
		var Elevator = function(name, building) {
			this.name			= name;
			this.requests		= [];
			this.destinations	= [];
			this.people			= [];
			this.location		= 0;
			this.home_floor		= 0;
			this.status			= 'free';
			this.actionQueue	= [];

			this.building		= building; // parent object pointer.

			building.elevators.push(this);
			return this;
		}

		var Person = function(name, location, destination, building) {
			this.name			= name;
			this.location		= location;
			this.destination	= destination;
			this.building		= building;

			building.people.push(this);
			return this;
		}

		var Request = function(origin, destination, building) {
			this.origin			= origin;
			this.destination	= destination;
			this.building		= building;

			var diff 			= origin - destination;
			this.direction		= (diff > 0) ? 'down' : 'up';

			this.person			= new Person('Andy', origin, destination, building); 

			building.requests.push(this);
			return this;
		}

		// ToDo.
		Request.prototype.find_best_elevator = function() {
			var $request = this;
			var elevs = $request.building.elevators;

			return 1;
		}

		Request.prototype.summary = function() {
			// return this;

			var req = this;
			output = '';
			output += req.person.name + " on floor " + req.origin;
			output += " to " + req.destination;
			return output;
		}

		// Class container for the events going on (people making requests, move times, etc)
		var EventLoop = function(building) {
			var $eventLoop 		= this;

			this.building 		= building;

			// TODO: Generate requests around (normal/Poisson/other) distributions

			// Right now, this just generates a whole bunch of requests.
			this.generate_starting_requests = function() {
				for(var i = 10; i < configs['num_floors']; i+=10) {
					var req = new Request(0,i,$eventLoop.building);
				}
			}
			this.generate_starting_requests();

			// Make a bunch of random requests periodically. Distribution? Nah, pseudo-random.
			this.generate_random_requests = function() {
				var num_requests 	= Math.floor(Math.random() * 15) + 1;
				for(var i = 0; i < num_requests; i++) {
					var origin 		= Math.floor(Math.random() * configs['num_floors']) + 1;
					var dest 		= Math.floor(Math.random() * configs['num_floors']) + 1;
					if(origin == dest) { continue; }
					var req 		= new Request(origin,dest, $eventLoop.building);
				}
			}
			this.generate_random_requests();

			return this;
		}

		// Protos for Elevators
		Elevator.prototype.move_to_floor = function(new_floor) {
			if(new_floor < 0 || new_floor > configs['num_floors']) { return false; } // Invalid!

			var $elevator = this;
			var $building = this.building;

			var selector = "#" + $building.name + "_" + $elevator.name;
			// console.log(selector);

			jQuery(selector)
				.animate({'bottom': new_floor * $building.floor_height}, $elevator.compute_move_time(new_floor));

			$elevator.location = new_floor;
			return true; // Assuming all was fine; no error detecting yet.
		}
		Elevator.prototype.compute_move_time = function(new_floor) {
			return (Math.floor(Math.abs(new_floor - this.location) * configs['time_travel']) * configs['time_base']);
			// Har har, return the *floor* of the location-destination abs difference.
		}
		Elevator.prototype.add_request = function(request) {
			var $elev		= this;
			var dest		= request.destination;

			$elev.requests.push(request);
			$elev.destinations.push(dest);

			// ToDo: Sort the list? Determine the right format.
		}


		// Start the simulation!
		var initialize = function() {
			var buildings = [];
			for(var i = 0 ; i < configs['num_buildings']; i++) {
				buildings[i] = new Building("Building_" + i); // Construct pushes to master-list.
			}
		}

		initialize();

		return this;
	});

})();