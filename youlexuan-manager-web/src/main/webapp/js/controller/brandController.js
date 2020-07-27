app.controller("branController",function ($scope,$controller,brandService) {

    //继承baseController
    $controller('baseController',{$scope:$scope});

    //查询所有类
    $scope.findAll=function () {
        brandService.findAll().success(function (response) {
            $scope.list=response;
        })
    };

    //分页模糊查询
    $scope.searchEntity={};
    $scope.search=function(page,rows){
        brandService.search(page,rows,$scope.searchEntity).success(
            function (response) {
                $scope.list=response.rows;
                $scope.paginationConf.totalItems=response.total;
            })
    };


    //根据id查找类
    $scope.findone=function(id){
        brandService.findone(id).success(
            function (response) {
                $scope.entity=response;
            }
        )
    };

    //添加与修改
    $scope.save=function () {
        if($scope.entity.id!=null){
            brandService.update($scope.entity).success(
                function (response) {
                    if (response.success){
                        $scope.reloadList();
                    }else {
                        alert(response.message)
                    }

                }
            )
        }else{
            brandService.add($scope.entity).success(
                function (response) {
                    if (response.success){
                        $scope.reloadList();
                    }else {
                        alert(response.message)
                    }

                }
            )
        }

    };

    //根据id删除类
    $scope.deleteId=function () {
        brandService.deleteId($scope.selectIds).success(
            function (response) {
                if (response.success){
                    $scope.reloadList();
                }

            }
        )

    };
})
