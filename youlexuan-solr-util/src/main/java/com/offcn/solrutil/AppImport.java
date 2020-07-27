package com.offcn.solrutil;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class AppImport {

    /**
     * 手动导入数据到solr中的主函数
     * @param args
     */
    public static void main(String[] args) {

        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath*:spring/applicationContext*.xml");
        SolrUtil solrUtil = (SolrUtil) context.getBean("solrUtil");
        solrUtil.importItemData();


    }
}
