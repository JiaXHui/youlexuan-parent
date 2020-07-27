 //控制层 
app.controller('goodsController' ,function($scope,$controller,$location,goodsService,uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(id){
		var id=$location.search()['id'];
		if(id==null){
			return ;
		}
		goodsService.findOne(id).success(
			function(response) {
				$scope.entity = response;
				editor.html($scope.entity.goodsDesc.introduction);
				$scope.entity.goodsDesc.itemImages = JSON.parse($scope.entity.goodsDesc.itemImages);
				$scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.entity.goodsDesc.customAttributeItems);
				//规格
				$scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);

			}
		);

	}


//根据规格名称和选项名称返回是否被勾选
	$scope.checkAttributeValue=function(specName,optionName){
		var items= $scope.entity.goodsDesc.specificationItems;
		var object= $scope.searchObjectByKey(items,'attributeName',specName);
		if(object==null){
			return false;
		}else{
			if(object.attributeValue.indexOf(optionName)>=0){
				return true;
			}else{
				return false;
			}
		}
	}
	
	//保存 
	$scope.save=function(){
		//提取文本编辑器的值
		$scope.entity.goodsDesc.introduction=editor.html();
		var serviceObject;//服务层对象  				
		if($scope.entity.goods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加
		}
		serviceObject.success(
			function(response){
				if(response.success){
					alert('保存成功');
					$scope.entity={};
					editor.html("");
				}else{
					alert(response.message);
				}
			}
		);
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

	$scope.add=function () {
		$scope.entity.goodsDesc.introduction=editor.html();
		goodsService.add( $scope.entity).success(
			function (response) {
				if (response.success){
					alert(response.message);
					$scope.entity={ goodsDesc:{itemImages:[],specificationItems:[]}  };
					editor.html('');
				}else {
					alert(response.message);
				}

			}
		);//增加
	}

	$scope.uploadFile=function () {
		uploadService.uploadFile().success(
			function (response) {
				if (response.success){
					$scope.image_entity.url=response.message;
				}else {
					alert(response.message);
				}
			}
		).error(function () {
			alert("上传发生错误")
		})
	}

	$scope.entity={goods:{},goodsDesc:{itemImages:[]}};

	$scope.add_image_entity=function () {
		$scope.entity.goodsDesc.itemImages.push($scope.image_entity);

	}

	$scope.remove_image_entity=function (index) {
		$scope.entity.goodsDesc.itemImages.splice(index,1)
	}

	$scope.selectItemCat1List=function () {
		itemCatService.findByParentId(0).success(
			function (response) {
				$scope.itemCat1List=response;
			}
		)

	}

	$scope.$watch('entity.goods.category1Id',function (newValue,oldValue) {
		if (newValue){
			itemCatService.findByParentId(newValue).success(
				function (response) {
					$scope.itemCat2List=response;

				}
			)
		}

	})

	$scope.$watch('entity.goods.category2Id',function (newValue,oldValue) {
		if (newValue){
			itemCatService.findByParentId(newValue).success(
				function (response) {
					$scope.itemCat3List=response;
				}
			)
		}

	})

	$scope.$watch('entity.goods.category3Id',function (newValue,oldValue) {
		if (newValue){
			itemCatService.findOne(newValue).success(
				function (response) {
					$scope.entity.goods.typeTemplateId=response.typeId;

				}
			)
		}

	})

	$scope.$watch('entity.goods.typeTemplateId',function (newValue,oldValue) {
 		if (newValue){
 			typeTemplateService.findOne(newValue).success(
 				function (response) {
					$scope.typeTemplate=response;
					$scope.typeTemplate.brandIds=JSON.parse($scope.typeTemplate.brandIds);
					if ($location.search()['id'] == null) {
						$scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);//扩展属性
					}
					for( var i=0;i<$scope.entity.itemList.length;i++ ){
						$scope.entity.itemList[i].spec =
							JSON.parse( $scope.entity.itemList[i].spec);
					}
				}
			);
 			typeTemplateService.findSpecList(newValue).success(
 				function (response) {
 					$scope.specList=response;

				}
			)
		}
	})

	$scope.entity={ goodsDesc:{itemImages:[],specificationItems:[]}  };
	$scope.updateSpecAttribute=function ($even,name,value) {
		var object=$scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems,'attributeName',name);
		if (object!=null){
			if ($even.target.checked ){
				object.attributeValue.push(value);

			}else {
				object.attributeValue.splice(object.attributeValue.indexOf(value),1)
				if (object.attributeValue.length){
					$scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object),1);
				}
			}
		}else {
			$scope.entity.goodsDesc.specificationItems.push({"attributeName":name,"attributeValue":[value]});
		}
	}

	//创建SKU列表
	$scope.createItemList=function () {
		//spec 存储sku对应的规格
		$scope.entity.itemList=[{spec:{},price:0,num:99999,status:'0',isDefault:'0' } ];
		//初始
		//定义变量 items指向 用户选中规格集合
		var items=$scope.entity.goodsDesc.specificationItems;
		//遍历用户选中规格集合
		for (var i=0;i<items.length;i++){
			//编写增加sku规格方法addColumn 参数1:sku规格列表  参数2:规格名称  参数3:规格选项
			$scope.entity.itemList=addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);
		}

	}
	addColumn=function(list,attributeName,attributeValue){
		var newList=[];
		//遍历sku规格列表
		for (var i=0;i<list.length;i++){
			//读取每行sku数据，赋值给遍历oldRow
			var oldRow= list[i];
			//遍历规格选项
			for (var j=0;j<attributeValue.length;j++){
				//深克隆当前行sku数据为 newRow
				var newRow=JSON.parse(JSON.stringify(oldRow));
				//在新行扩展列（列名是规格名称），给列赋值（规格选项值）
				newRow.spec[attributeName]=attributeValue[j];
				//保存新sku行到sku新集合
				newList.push(newRow);
			}
		}
		return newList;
	}

	$scope.status=['未审核','已审核','审核未通过','关闭'];

	$scope.itemCatList=[];

	$scope.findItemCatList=function () {
		itemCatService.findAll().success(
			function (response) {
				for (var i=0;i<response.length;i++){
					$scope.itemCatList[response[i].id]=response[i].name;
				}
			}
		)
	}

});	