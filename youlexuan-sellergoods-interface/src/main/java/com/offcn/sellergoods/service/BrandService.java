package com.offcn.sellergoods.service;

import com.offcn.entity.PageResult;
import com.offcn.pojo.TbBrand;

import java.util.List;
import java.util.Map;

public interface BrandService {
    //查询所有类
    public List<TbBrand> getAll();

    //添加Brand
    public void add(TbBrand tbBrand);

    //根据Id查找对应的实体类
    public TbBrand findOne(Long id);

    //跟据id修改实体类
    public void update(TbBrand tbBrand);

    //删除实体类
    public void deleteId(Long[] ids);

    //分页查询
    public PageResult findpage(TbBrand tbBrand,int pageNume,int pageSize);

    //返回json串
    public List<Map> selectOptionList();

}
