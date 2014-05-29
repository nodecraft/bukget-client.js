var request = require('request'),
	_ = require('underscore'),
	fs = require('fs'),
	crypto = require('crypto'),
	qs =  require('qs');


module.exports = function(config){

	var defaults = {
		url: 'api.bukget.org/',
		version: 3,
		https: false,
		rejectUnauthorizedSSL: false,
		userAgent: 'Bukget-node.js',
		localAddress : false,
		pluginServer: 'bukkit'
	};
	if(config && typeof(config) == 'object'){
		_.defaults(config, defaults);
	}else{
		config = defaults;
	}

	var helpers = {
		makeUrl: function(url, version){
			return 'http' + ((config.https == true)?'s':'') + '://' + config.url + version + '/' + url;
		},
		requestStats: function(url, callback){
			request({
				url: this.makeUrl(url, 'stats'),
				json: true,
				followRedirect: false,
				headers: {
					'User-Agent': config.userAgent
				}
			}, function(err, response, body){
				callback(err, body, response);
			});
		},
		request: function(url, getParams, postParams, callback){
			var reqType = 'GET';
			if(getParams && postParams == undefined && callback == undefined){
				callback = getParams;
				postParams = false;
				getParams = {};
			}
			if(postParams && callback == undefined){
				callback = postParams;
				postParams = false;
			}else{
				reqType = 'POST';
			}
			var urlParams = '?' + qs.stringify(getParams);
			console.log(this.makeUrl(url, config.version) + urlParams);
			var options = {
				method: reqType,
				url: this.makeUrl(url) + urlParams,
				json: true,
				followRedirect: false,
				headers: {
					'User-Agent': config.userAgent
				}
			};
			if(postParams){
				options.body = postParams;
			}
			if(config.localAddress != false){
				options.localAddress  = config.localAddress;
			}
			if(config.https && config.rejectUnauthorizedSSL){
				options.rejectUnauthorized = config.rejectUnauthorizedSSL;
			}
			request(options, function(err, response, body){
				if(response.statusCode !== 302 && response.statusCode !== 200){
					return callback({message:'Invalid HTTP status code response given.', body: body, code: response.statusCode})
				}
				return callback(err, body, response);
			});
		}
	}

	return {
		genInfo: function(size, callback){
			if(size && callback == undefined){
				callback = size;
				size = false;
			}

			var params = {};
			if(size){
				params.size = size;
			}
			return helpers.request('geninfo', params, callback);
		},
		getGenInfo: function(id, callback){
			return helpers.request('geninfo/' + id, {}, callback);
		},
		plugins: function(filters, callback){
			if(filters && callback == undefined){
				callback = filters;
				filters = {};
			}else{
				var params = _.pick(filters, ['server', 'size', 'start', 'sort', 'fields']);
				if(params.fields && params.fields.join != undefined){
					params.fields = params.fields.join(',');
				}
			}
			return helpers.request('plugins', params, callback);
		},
		listPluginsCategories: function(callback){
			return helpers.request('categories', {}, callback);
		},
		pluginsByCategories: function(category, filters, callback){
			if(filters && callback == undefined){
				callback = filters;
				filters = {};
			}else{
				var params = _.pick(filters, ['server', 'size', 'start', 'sort', 'fields']);
				if(params.fields && params.fields.join != undefined){
					params.fields = params.fields.join(',');
				}
			}
			return helpers.request('categories/' + category, params, callback);
		},
		pluginsByAuthor: function(author, filters, callback){
			if(filters && callback == undefined){
				callback = filters;
				filters = {};
			}else{
				var params = _.pick(filters, ['server', 'size', 'start', 'sort', 'fields']);
				if(params.fields && params.fields.join != undefined){
					params.fields = params.fields.join(',');
				}
			}
			return helpers.request('authors/' + author, params, callback);
		},
		getPlugin: function(slug, filters, callback){
			if(filters && callback == undefined){
				callback = filters;
				filters = {};
			}
			var params = _.pick(filters, ['server', 'size', 'version', 'fields']);
			if(params.fields && params.fields.join != undefined){
				params.fields = params.fields.join(',');
			}
			var server = config.pluginServer;
			if(params.server){
				server = params.server;
			}
			var url = ['plugins', server, slug];
			if(params.version){
				url.push(params.version);
			}
			return helpers.request(url.join('/'), params, callback);
		},
		getPluginDownload: function(slug, version, server, callback){
			if(version && server == undefined && callback == undefined){
				callback = version;
				server = false;
				version = 'latest';
			}
			if(server && callback == undefined){
				callback = server;
				server = false;
			}
			if(server == false){
				server = config.pluginServer;
			}
			var url = ['plugins', server, slug, version, 'download'];
			return helpers.request(url.join('/'), {}, function(err, body, response){
				if(err){
					return callback(err);
				}
				if(response.statusCode == 302){
					return callback(null, response.headers.location);
				}else{
					return callback(null, false);
				}
			});
		},
		updates: function(filters, callback){
			var params = {};
			_.each(filters, function(filter, name){
				if(['slugs', 'hashes', 'filenames'].indexOf(name) != -1){
					if(filter.join != undefined){
						params[name] = filter.join(',');
					}else{
						params[name] = filter;
					}
				}
			});
			return helpers.request('updates', params, callback);
		},
		basicSearch: function(filters, callback){
			var params = _.pick(filters, ['size', 'start', 'sort', 'fields']);
			if(params.fields && params.fields.join != undefined){
				params.fields = params.fields.join(',');
			}
			return helpers.request(['search', filters.field, filters.action, filters.value].join('/'), params, callback);
		},
		search: function(filters, callback){
			var params = _.pick(filters, ['filters', 'size', 'start', 'sort', 'fields']);
			if(params.fields && params.fields.join != undefined){
				params.fields = params.fields.join(',');
			}
			if(params.filters){
				params.filters = JSON.stringify(params.filters);
			}
			return helpers.request('search', {}, params, callback);
		},
		getNaughtyList: function(callback){
			return helpers.requestStats('naughty_list', callback);
		},
		getTodaysTrends: function(callback){
			return helpers.requestStats('todays_trends', callback);
		},
		getTrends: function(days, callback){
			return helpers.requestStats('trend/'+days, callback);
		}
	}
}