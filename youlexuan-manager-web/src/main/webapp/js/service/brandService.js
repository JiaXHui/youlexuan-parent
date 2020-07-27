app.service("brandService",function ($http) {
			this.fandAll=function () {
				return 	$http.get('../brand/findAll.do');
			};
			this.add=function (entity) {
				return $http.post('../brand/add.do',entity);
			};
			this.update=function (entity) {
				return $http.post('../brand/update.do',entity);
			};
			this.search=function (page,rows,searchEntity) {
				return $http.post("../brand/search.do?page="+page+"&rows="+rows,searchEntity);
			};
			this.deleteId=function (selectIds) {
				return $http.get('../brand/deleteId.do?ids='+selectIds);
			}
			this.selectOptionList=function () {
            	return $http.get('../brand/selectOptionList.do');
            }

});