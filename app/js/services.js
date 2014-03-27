'use strict';

/* Services */

var analyticsServices = angular.module('analyticsServices', [ 'ngResource' ]);


analyticsServices.factory('KS',
		['$location',
		 	function KSFactory($location) {
				//TODO remove this!!
		 		var ks = 'M2Q5M2NjNDM2NDAzNGRiNTFlZTA0ZGUxYjVkNjc3OGZmNjdmYjU4M3wzNDYxNTE7MzQ2MTUxOzM1NDI0NDk4NTI7MjsxMzk0OTY2MjA1LjcwMTQ7YXRhci5zaGFkbWlAa2FsdHVyYS5jb207Ozs=';
		 		try {
	                var kmc = window.parent.kmc;
	                if (kmc && kmc.vars) {
	                    // got ks from KMC - save to local storage
	                    if (kmc.vars.ks)
	                        ks = kmc.vars.ks;
	                }
	            } catch (e) {
	                console.log('Could not located parent.kmc: ' + e);
	            }
	            
	            if (!ks) { //navigate to login
	                $location.path("/login");
	                return false;
	            } 
		 		
		 		return ks;
		 	} 
	 	]);
		
		
analyticsServices.factory('KApi',
		['$http', '$q', 'KS',
		 	function KApiFactory ($http, $q, KS) {
		 		var KApi = {};
		 		
		 		/**
		 		 * @param request 	request params
		 		 * @returns	promise object
		 		 */
		 		KApi.doRequest = function doRequest (request) {
		 			// Creating a deferred object
		            var deferred = $q.defer();
		            
			 		// add required params
		            request.ks = KS;
			 		var sParams = this.serializeParams(request);
			 		$http({
			 			data: sParams,
			 			url: "http://www.kaltura.com/api_v3/index.php",
				 		method: "POST",
			 			params: {'format' : '1'},
			 			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			 		}).success(function (data, status) {
			 			if (data.objectType === "KalturaAPIException") {
			 				deferred.reject(data.message);
			 			}
			 			else {
			 				deferred.resolve(data);
			 			}
			 		}).error(function(data, status) {
			 			deferred.reject(data.message);
			 		});
			 		
			 		// Returning the promise object
		            return deferred.promise;
		 		};
		 		
		 		
		 		/**
		 		 * format params as &key1=val1&key2=val2
		 		 * @param params
		 		 * @returns {String}
		 		 */
		 		KApi.serializeParams = function serializeParams(params) {
		 			var s = '';
		 			for (var key in params) {
		 				s += '&' + key + '=' + params[key];
		 			}
		 			return s;
		 		};
		 		
		 		return KApi;
		 	}
		]);

analyticsServices.factory('DashboardSvc',
		['KApi', '$resource', 
		 	function DashboardSvcFactory(KApi, $resource) {
		 		var DashboardSvc = {};
		 		
		 		DashboardSvc.getAggregates = function getAggregates() {
		 			var ar = [{'title': 'audience',
		 						'value': 36},
		 					{'title': 'minutes_viewed',
			 				'value': 512},
			 				{'title': 'buffertime',
				 			'value': 2},
				 			{'title': 'bitrate',
					 		'value': 10}
				 	];
		 			return ar;
		 		};
		 		
		 		
		 		DashboardSvc.getDummyEntries = function getDummyEntries(liveOnly, pageNumber) {
		 			return $resource('data/entries:page.json', {}, {
		 			      query: {method:'GET', params:{page:pageNumber}, isArray:true}
		 			    });
				};
		 		
		 		/**
				 * get the list of entries to show
				 * @param liveOnly	if true, only get entries that are currently live
				 */
		 		DashboardSvc.getAllEntries = function getAllEntries(liveOnly) {
		 			console.log ('get all entries');
					// liveEntry.list to get all entries
					var postData = {
			            'filter:orderBy': '-createdAt',
			            'filter:objectType': 'KalturaLiveStreamEntryFilter',
			            'ignoreNull': '1',
			            'page:objectType': 'KalturaFilterPager',
			            'pager:pageIndex': '1',
			            'pager:pageSize': '10',
			            'service': 'livestream',
			            'action': 'list'
			        };
					
					return KApi.doRequest(postData);
				};
				
				
				/**
				 * of the given list, get the entries that are currently live
				 * @param entryIds		ids of all entries on page
				 */
				DashboardSvc.getLiveEntries = function getLiveEntries(entryIds) {
					console.log ('get live entries');
					// liveEntry.list by isLive to know which ones are currently live
					var postData = {
				            'filter:orderBy': '-createdAt',
				            'filter:objectType': 'KalturaLiveStreamEntryFilter',
				            'filter:isLive': '1',
				            'filter:entryIdsIn': entryIds,
				            'ignoreNull': '1',
				            'page:objectType': 'KalturaFilterPager',
				            'pager:pageIndex': '1',
				            'pager:pageSize': '10',
				            'service': 'livestream',
				            'action': 'list'
				        };
					
					return KApi.doRequest(postData);
				};
		 		
		 		
		 		return DashboardSvc;
		 	} 
	 	]);


analyticsServices.factory('EntrySvc',
		['KApi', '$resource', 
		 	function EntrySvcFactory(KApi, $resource) {
		 		var EntrySvc = {};
		 		
		 		EntrySvc.getAggregates = function getAggregates(entryId) {
		 			var ar = [{'title': 'audience',
		 						'value': 36},
		 					{'title': 'minutes_viewed',
			 				'value': 512},
			 				{'title': 'buffertime',
				 			'value': 2},
				 			{'title': 'bitrate',
					 		'value': 10}
				 	];
		 			return ar;
		 		};
		 		
		 		EntrySvc.getReferals = function getReferals(entryId) {
		 			var ar = [
		 			          {'domain': 'www.domain1.com', 'visits': '36', 'percents' : '5.57'},
		 			          {'domain': 'www.domain2.com', 'visits': '12', 'percents' : '5.7'},
		 			          {'domain': 'www.domain3.com', 'visits': '45', 'percents' : '3.47'},
		 			          {'domain': 'www.domain4.com', 'visits': '76', 'percents' : '5.3'},
		 			          {'domain': 'www.domain5.com', 'visits': '12', 'percents' : '6.26'},
		 			          {'domain': 'www.domain6.com', 'visits': '65', 'percents' : '7.76'},
		 			          {'domain': 'www.domain7.com', 'visits': '87', 'percents' : '8.12'},
		 			          {'domain': 'www.domain8.com', 'visits': '23', 'percents' : '1.12'},
		 			          {'domain': 'www.domain9.com', 'visits': '76', 'percents' : '9.45'},
		 			          {'domain': 'www.domain10.com', 'visits': '34', 'percents' : '0.57'},
		 				
		 						];
		 			return ar;
		 		};
		 		
		 		EntrySvc.getEntry = function getEntry(entryId) {
		 			var postData = {
				            'entryId' : entryId,
				            'service': 'livestream',
				            'action': 'get'
				        };
					
					return KApi.doRequest(postData);
		 		};
		 		
		 		return EntrySvc;
		 	} 
	 	]);




