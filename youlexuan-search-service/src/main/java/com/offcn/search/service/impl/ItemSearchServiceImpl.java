package com.offcn.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.fastjson.JSON;
import com.github.promeg.pinyinhelper.Pinyin;
import com.github.promeg.pinyinhelper.PinyinDict;
import com.offcn.pojo.TbItem;
import com.offcn.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;


import java.util.*;

@Service(timeout = 3000)
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;

    @Autowired
    private RedisTemplate redisTemplate;

    public Map<String, Object> search(Map searchMap) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.putAll(searchList(searchMap));

        String keywords= (String) searchMap.get("keywords");
        searchMap.put("keywords",keywords.replace(" ",""));

        List categoryList = searchCategoryList(searchMap);
        map.put("categoryList",categoryList);
        String categoryName=(String) searchMap.get("category");
        if(!"".equals(categoryName)) {
            //按照分类名称重新读取对应品牌、规格
            map.putAll(searchBrandAndSpecList(categoryName));
        }else {
            if (categoryList.size() > 0) {
                Map mapBrandAndSpec = searchBrandAndSpecList((String) categoryList.get(0));
                map.putAll(mapBrandAndSpec);
            }
        }
        return map;
    }

    public void importList(List<TbItem> list) {
        for (TbItem item:list){
            Map<String ,String> specMap = JSON.parseObject(item.getSpec(), Map.class);
            Map map=new HashMap();
            for (String key:specMap.keySet()){
                map.put("item_spec"+Pinyin.toPinyin(key,"").toCharArray(),specMap.get(key));
            }
            item.setSpecMap(map);
        }
        solrTemplate.saveBean(list);
        solrTemplate.commit();
    }

    /**
     * 高亮显示
     * @param searchMap
     * @return
     */
    private Map searchList(Map searchMap) {
        Map map = new HashMap();

        //创建高亮查询对象
        SimpleHighlightQuery query = new SimpleHighlightQuery();

        //创建高亮分组对象
        HighlightOptions highlightOptions = new HighlightOptions();

        //高亮处理字段
        highlightOptions.addField("item_title");

        //添加高亮头部标签
        highlightOptions.setSimplePrefix("<em style='color:red'>");

        //添加高亮尾部标签
        highlightOptions.setSimplePostfix("</em>");

        //高亮选择查询
        query.setHighlightOptions(highlightOptions);
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //商品类型查询
        if (!"".equals(searchMap.get("category"))){
            Criteria filterCriteria=new Criteria("item_category").is(searchMap.get("category"));
            FilterQuery filterQuery=new SimpleFacetQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //品牌查询
        if (!"".equals(searchMap.get("brand"))){
            Criteria filterCriteria=new Criteria("item_brand").is(searchMap.get("brand"));
            FilterQuery filterQuery=new SimpleFacetQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //商品规格查询
        if (!"".equals(searchMap.get("spec"))) {
            Map<String, String> specMap = (Map<String, String>) searchMap.get("spec");
            for (String key : specMap.keySet()) {
                Criteria filterCriteria = new Criteria("item_spec_" + Pinyin.toPinyin(key, "").toLowerCase()).is(specMap.get(key));
                FilterQuery filterQuery = new SimpleFacetQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }

        //商品价格分区查询
        if (!"".equals(searchMap.get("price"))){
            String[] prices = ((String) searchMap.get("price")).split("-");
            if (!prices[0].equals("0")){
                Criteria priceCriteria=new Criteria("item_price").greaterThan(prices[0]);
                FilterQuery priceFilter=new SimpleFacetQuery(priceCriteria);
                query.addFilterQuery(priceFilter);
            }
            if (!prices[1].equals("*")){
                Criteria lassCriteria=new Criteria("item_price").lessThanEqual(prices[1]);
                FilterQuery lassFilter=new SimpleFacetQuery(lassCriteria);
                query.addFilterQuery(lassFilter);
            }

        }


        //价格排序
        String sortValue= (String) searchMap.get("sort");
        String sortField= (String) searchMap.get("sortField");
        if(sortValue!=null && !sortValue.equals("")){
            if (sortValue.equals("ASC")){
                Sort sort=new Sort(Sort.Direction.ASC, "item_"+sortField);
                query.addSort(sort);
            }
            if (sortValue.equals("DESC")){
                Sort sort=new Sort(Sort.Direction.DESC, "item_"+sortField);
                query.addSort(sort);
            }
        }

        //时间排序
        String dateDate=(String) searchMap.get("updatetime");
        if(dateDate!=null && !dateDate.equals("")){
            if (dateDate.equals("DESC")){
                Sort sort=new Sort(Sort.Direction.DESC, "item_updatetime");
                query.addSort(sort);
            }
        }


        //分页
        //当前页码
        Integer pageNo= (Integer) searchMap.get("pageNo");
        if (pageNo==null){
            pageNo=1;
        }

        //显示条数
        Integer pageSize= (Integer) searchMap.get("pageSize");
        if (pageSize==null){
            pageSize=20;
        }
        query.setOffset((pageNo-1)*pageSize);
        query.setRows(pageSize);

        //发出高亮请求
        HighlightPage<TbItem> page =solrTemplate.queryForHighlightPage(query, TbItem.class);
        List<TbItem> items = page.getContent();

        //循环集合
        for (TbItem item : items) {
            List<HighlightEntry.Highlight> highlightList = page.getHighlights(item);
            if (highlightList != null && highlightList.size() > 0) {
                List<String> snipplets = highlightList.get(0).getSnipplets();

                //得到高亮字段
                item.setTitle(snipplets.get(0));
            }

        }

        map.put("rows", page.getContent());
        map.put("totalPages",page.getTotalPages());
        map.put("total",page.getTotalElements());
        return map;
    }

    /**
     * 查询分类列表
     * @param searchMap
     * @return
     */
    private  List searchCategoryList(Map searchMap){
        List<String> list=new ArrayList<String>();

        //关键字查询
        Query query=new SimpleQuery();
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //设置分组选项
        GroupOptions groupOptions=new GroupOptions().addGroupByField("item_category");
        query.setGroupOptions(groupOptions);

        //得到分组页
        GroupPage<TbItem> pages = solrTemplate.queryForGroupPage(query, TbItem.class);

        //根据列得到分组集
        GroupResult<TbItem> groupResult  = pages.getGroupResult("item_category");

        //得到分组入口页
        Page<GroupEntry<TbItem>> groupsCount = groupResult.getGroupEntries();

        //得到入口分组集合
        List<GroupEntry<TbItem>> content = groupsCount.getContent();

        for (GroupEntry<TbItem> entry:content){
            list.add(entry.getGroupValue());
        }

        return list;
    }

    /**
     * 查询品牌和规格列表
     * @param category 分类名称
     * @return
     */
    private Map searchBrandAndSpecList(String category) {
        Map map = new HashMap();
        Long typeId = (Long) redisTemplate.boundHashOps("itemCat").get(category);
        if (typeId != null) {
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(typeId);
            map.put("brandList", brandList);
            List specList = (List) redisTemplate.boundHashOps("specList").get(typeId);
            map.put("specList", specList);
        }
        return map;

    }

}
