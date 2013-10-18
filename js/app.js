var app = angular.module('gamesApp', ['ngResource', 'ui.bootstrap']);

app.config(function ($routeProvider) {
	$routeProvider
		.when('/games/page/:page', 
			{
				controller: 'GamesController',
				templateUrl: 'views/home.html'
			})
		.when('/game/:id',
			{
			controller: 'GameController',
			templateUrl: 'views/game.html'
			})
		.when('/games/search//page/:page', { redirectTo: '/games/page/1' })
		.when('/games/search/:search', { redirectTo: '/games/search/:search/page/1'})
		.when('/games/search/:search/page/:page',
			{
			controller: 'GamesController',
			templateUrl: 'views/search.html',
			})
		.otherwise({ redirectTo: '/games/page/1' });
});

app.factory({
		gamesResource: function($resource) {			
			var default_api_url = 'api.php';
			var api = $resource(default_api_url, 
				{
					resource: 'games',				
					limit: 20,
					offset: 0,
					format: 'json',
					field_list: 'deck,name,image,id',
					filter: 'platforms:20,35,94',
					sort: 'name'
				}				
			);

			return api;			
		},
		filterService: function($rootScope) {
			var filterService = {};			
			var filters = Array;
			filterService.params = {};

			filterService.setFilter = function(filter, values) {
				filters[filter] = values;
				filterService.params['filter'] = '';

				$.each(filters, function(_filter, _values) {
					if (!(_values == '' || _values == undefined)) {
						filterService.params['filter'] += _filter + ':' + _values + ',';
					}
				});

				$rootScope.$broadcast('filtersLoaded');
			};

			return filterService;
		}
	})
	.controller(
		{
			GamesController: function ($scope, gamesResource, filterService, $routeParams, $location) {
				$scope.viewLoading = true;

				var route = '/games/page/';
				params = {};

				$scope.load = function() {
					params = filterService.params;
					if ($routeParams.search != undefined) {
						$scope.search = $routeParams.search;
						route = '/games/search/' + $scope.search + '/page/';
						
						params['resource']  = 'search';
						params['query'] 	= $routeParams.search;
						params['resources'] = 'game';
						params['page'] 		= $routeParams.page;
					}  else {
						params['offset'] = ($routeParams.page - 1) * 20;
					}

					gamesResource.get(params, 
						function (games) {
							$scope.games = games.results;
							$scope.totalItems = games.number_of_total_results;
							$scope.itemsPerPage = games.limit;
							$scope.offset = games.offset;
							$scope.numPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
							$scope.viewLoading = false;
						}
					);				
				};

				$scope.currentPage = $routeParams.page;
				
				$scope.pageChanged = function(page) {
					$location.path(route + page);
				};			

				$scope.$on('filtersLoaded', function() {
					params = filterService.params;
					$scope.load();
				});

				$scope.load();
			},
			GameController: function ($scope, gamesResource, $routeParams) {
				$scope.viewLoading = true;
				gamesResource.get({resource: 'game/' + $routeParams.id}, function (game) {
					$scope.game = game.results;
					$scope.viewLoading = false;
				});								
			},
			FilterController: function ($scope, $filter, filterService) {
				$scope.platforms = [
					{
						id: 20,
						name: 'Xbox 360',
					},
					{
						id: 35,
						name: 'PlayStation 3',
					},
					{
						id: 94,
						name: 'PC',
					},
				];

				$scope.selectPlatforms = function() {
					selectedPlatforms = [];
					$.each($filter('filter')($scope.platforms, {checked: true}), function(index, platform) {
						selectedPlatforms.push(platform.id);
					});

					filterService.setFilter('platforms', selectedPlatforms.join());
				};

				
			}
		}
	).directive('backButton', function(){
		// Runs during compile
		return {
			restrict: 'A',
			template: '<a ng-click="$back()" class="btn btn-default">Back</a>',
			link: function($scope, iElm, iAttrs, controller) {
				$scope.$back = function() { 
					window.history.back();
				};
			}
		};
	});