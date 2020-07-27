package com.offcn.sellergoods.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.offcn.entity.PageResult;
import com.offcn.entity.Result;
import com.offcn.pojo.TbBrand;
import com.offcn.sellergoods.service.BrandService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/brand")
public class BrandController {

    @Reference
    private BrandService brandService;

    @RequestMapping("/findAll")
    @ResponseBody
    public List<TbBrand> findAll(){
        return brandService.getAll();
    }


    @RequestMapping("/search")
    @ResponseBody
    private PageResult fandPage(@RequestBody TbBrand tbBrand, int page, int rows) {
        PageResult pageResult = brandService.findpage(tbBrand, page, rows);
        return pageResult;
    }

    @RequestMapping("/add")
    @ResponseBody
    public Result add(@RequestBody TbBrand tbBrand){
        try {
            brandService.add(tbBrand);
            return new Result(true,"添加成功");
        }catch (Exception e){
            return new Result(true,"添加失败");
        }
    }

    @RequestMapping("/findOne")
    @ResponseBody
    public TbBrand findOne(Long id){
        return brandService.findOne(id);
    }

    @RequestMapping("/update")
    @ResponseBody
    public Result update(@RequestBody TbBrand tbBrand){
        try {
            brandService.update(tbBrand);
            return new Result(true,"修改成功");
        }catch (Exception e){
            return new Result(true,"修改失败");
        }
    }

    @RequestMapping("/deleteId")
    @ResponseBody
    public Result deleteId(Long[] ids){
        try {
            brandService.deleteId(ids);
            return new Result(true,"删除成功");
        }catch (Exception e){
            return new Result(true,"删除失败");
        }
    }

    @RequestMapping("/selectOptionList")
    @ResponseBody
    public List<Map> selectOptionList(){
        return brandService.selectOptionList();
    }
}
