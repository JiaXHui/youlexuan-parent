app.controller('longinController',function ($scope,$controller,loginService) {
    $scope.showLoginName=function(){
        loginService.loginName().success(
            function(response){
                $scope.loginName=response.loginName;
            }
        );
    }

})