app.controller("baseController",function ($scope) {
    //重新加载列表 数据
    $scope.reloadList=function(){
        $scope.search($scope.paginationConf.currentPage,$scope.paginationConf.itemsPerPage);
    };
    //分页控件配置
    $scope.paginationConf = {
        currentPage: 1,
        totalItems: 10,
        itemsPerPage: 10,
        perPageOptions: [10, 20, 30, 40, 50],
        onChange: function(){
            $scope.reloadList();//重新加载
        }
    };
    $scope.selectIds=[];
    $scope.updateSelection =function ($event,id) {
        if($event.target.checked){
            $scope.selectIds.push(id);
        }else {
            var deleteId=$scope.selectIds.indexOf(id);
            $scope.selectIds.splice(deleteId,1);
        }

    };

})