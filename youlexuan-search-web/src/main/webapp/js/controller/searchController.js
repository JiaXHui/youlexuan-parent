app.controller("searchController",function ($scope,$location,searchService) {
    $scope.resultMap = {brandList:[] };

    $scope.searchMap = {
        'keywords': '',
        'category': '',
        'brand': '',
        'spec': {},
        'price': '',
        'pageNo': 1,
        'pageSize': 40,
        'sortField': '',
        'sort': '',
        'updatetime': ''
    };
    $scope.addSearchItem = function (key, value) {
        if (key == 'category' || key == 'brand' || key == 'price') {
            $scope.searchMap[key] = value;
        } else {
            $scope.searchMap.spec[key] = value;
        }
        $scope.search();
    }
    //加载查询字符串
    $scope.loadkeywords=function(){
        $scope.searchMap.keywords=  $location.search()['keywords'];
        $scope.search();
    }

    $scope.removeSearchItem = function (key) {
        if (key == "category" || key == "brand" || key == 'price') {//如果是分类或品牌
            $scope.searchMap[key] = "";
        } else {//否则是规格
            delete $scope.searchMap.spec[key];//移除此属性
        }
        $scope.search();
    }

    $scope.queryByPage = function (pageNo) {
        if (pageNo < 1 || pageNo > $scope.resultMap.totalPages) {
            return;
        }

        $scope.searchMap.pageNo = pageNo;
        $scope.search();
    }

    $scope.sortSearch = function (sortField, sort, updatetime) {
        $scope.searchMap.sort = sort;
        $scope.searchMap.sortField = sortField;
        $scope.searchMap.updatetime = updatetime;
        $scope.search();
    }


$scope.keywordsIsBrand=function(){
    for(var i=0;i<$scope.resultMap.brandList.length;i++){
        if ($scope.searchMap.keywords==$scope.resultMap.brandList[i].text){
            return true;
        }
    }
    return false;
}

    buildPageLabel=function () {
        $scope.pageLabel=[];
        var maxPageNo=$scope.resultMap.totalPages;
        var firstPage=1;
        var lastPage=maxPageNo;
        if (maxPageNo>5){
            if ($scope.searchMap.pageNo<=3){
                lastPage=5;
            }else if($scope.searchMap.pageNo>=lastPage-2){
                firstPage=maxPageNo-4;
            }else {
                firstPage=$scope.searchMap.pageNo-2;
                lastPage=$scope.searchMap.pageNo+2;
            }
        }
        //循环产生页码标签
        for(var i=firstPage;i<=lastPage;i++){
            $scope.pageLabel.push(i);
        }
    }

    $scope.search = function () {
        $scope.searchMap.pageNo = parseInt($scope.searchMap.pageNo);
        searchService.search($scope.searchMap).success(
            function (response) {
                $scope.resultMap = response;
                buildPageLabel();
            }
        )
    };

})