 angular.module('angular-jwt.interceptor', [])
  .provider('jwtInterceptor', function() {

    this.authHeader = 'Authorization';
    this.authPrefix = 'Bearer ';
    this.tokenGetter = function() {
      return null;
    }

    var config = this;

    this.$get = function ($q, $injector, $rootScope) {
      return {
        request: function (request) {
          if (request.skipAuthorization) {
            return request;
          }

          request.headers = request.headers || {};
          // Already has an Authorization header
          if (request.headers[config.authHeader]) {
            return request;
          }

          var tokenPromise = $q.when($injector.invoke(config.tokenGetter, this, {
            config: request
          }));

          return tokenPromise.then(function(token) {
            if (token) {
              request.headers[config.authHeader] = config.authPrefix + token;
            }
            return request;
          });
        },
        responseError: function (response) {
          // handle the case where the user is not authenticated
          if (response.status === 401) {
            $rootScope.$broadcast('unauthenticated', response);
          }
          return $q.reject(response);
        }
      };
    };
  });
