import EVirtTable from "./src/EVirtTable";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const columns: any[] = [
  // {
  //   title: '序号',
  //   key: 'index',
  //   type: 'index',
  //   width: 50,
  // },
  // {
  //   key: "selection",
  //   type: "selection",
  //   fixed: "left",
  //   width: 50,
  // },
  {
    key: "selection",
    type: "index-selection",
    width: 100,
    fixed: "left",
  },
  {
    title: "工号",
    key: "emp_no",
    slotName: "emp_no",
    readonly: true,
    type: "tree",
    fixed: "left",
  },
  {
    title: "姓名",
    key: "emp_name",
    type: "contenteditable",
    width: 100,
    fixed: "left",
    verticalAlign: "middle",
    // render: "emp_name",
  },
  // {
  //   title: "图片",
  //   key: "emp_img",
  //   readonly: true,
  //   renderFooter(cell: any) {
  //     return h(
  //       "span",
  //       {
  //         class: "text",
  //       },
  //       "heji"
  //     );
  //   },
  //   renderHeader(cell: any) {
  //     return h(
  //       "div",
  //       {
  //         class: "bg-img",
  //       },
  //       "图片11"
  //     );
  //   },
  //   render(cell: any) {
  //     return h(
  //       "div",
  //       {
  //         style: {
  //           width: "100%",
  //           height: "100%",
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           "pointer-events": "initial",
  //           position: "relative",
  //           overflow: "hidden",
  //         },
  //       },
  //       [
  //         h(
  //           "div",
  //           {
  //             style: {
  //               padding: "4px",
  //               width: "100%",
  //               height: "auto",
  //               position: "absolute",
  //               top: "0",
  //               left: "0",
  //               transform: `translateY(${scrollY.value}px)`,
  //             },
  //           },
  //           [
  //             h("img", {
  //               src: "https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754260406/20240827-182345.jpg",
  //               style: {
  //                 width: "100%",
  //                 height: "100%",
  //                 "pointer-events": "initial",
  //               },
  //             }),
  //             h("img", {
  //               src: "https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754558405/20240827-182906.jpg",
  //               style: {
  //                 width: "100%",
  //                 height: "100%",
  //                 "pointer-events": "initial",
  //               },
  //             }),
  //             h("img", {
  //               src: "https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754558408/20240827-182910.jpg",
  //               style: {
  //                 width: "100%",
  //                 height: "100%",
  //                 "pointer-events": "initial",
  //               },
  //             }),
  //           ]
  //         ),
  //       ]
  //     );
  //   },
  // },
  // {
  //   title: '部门',
  //   key: 'dep_name',
  //   size: 'large',
  //   align: 'left',
  //   readonly: true,
  //   // fixed: 'right',
  //   overflowTooltipShow: true,
  //   overflowTooltipWidth: 300,
  //   overflowTooltipPlacement: 'left-end',
  //   renderFooter(cell: any) {
  //     return h('span', {
  //       class: 'text',
  //     }, 'heji部门');
  //   },
  // },
  {
    title: "岗位",
    key: "job_name",
    size: "small",
    // fixed: 'left',
    width: 200,
    align: "left",
    children: [
      {
        title: "姓名1",
        key: "emp_name1",
        type: "text",
        align: "left",
        fixed: "left",
        children: [
          {
            title: "姓名11",
            key: "emp_name11",
            type: "text",
            readonly: false,
            width: 200,
            rule: {
              validator(rule: any, value: any, callback: any) {
                if (!value) {
                  callback("请输入岗位");
                } else if (value.length > 10) {
                  callback("岗位字段长度必须小于10个字符哦！");
                } else {
                  callback();
                }
              },
              immediate: true,
            },
          },
          {
            title: "姓名22",
            key: "emp_name22",
            type: "text",
            children: [
              {
                title: "姓名221",
                key: "emp_name221",
                type: "text",
                align: "left",
                width: 200,
              },
              {
                title: "姓名222",
                key: "emp_name222",
                type: "text",
              },
            ],
          },
        ],
      },
      {
        title: "姓名2",
        key: "emp_name2",
        type: "text",
      },
    ],
  },
  {
    title: "手机号",
    key: "phone",
    fixed: "right",
    type: "phone",
    readonly: false,
    width: 100,
  },
  {
    title: "性别",
    key: "sex",
    // readonly: false,
    // fixed: "right",
    // render: "sex",
    rules: {
      required: true,
      message: "该项必填哦！",
    },
  },
  {
    title: "计薪月份",
    size: "small",
    fixed: "right",
    key: "salary_month",
    type: "month",
    align: "right",
    width: 200,
  },
  {
    title: "出生日期",
    size: "small",
    key: "birthday",
    type: "date",
  },
  {
    title: "家庭地址",
    key: "address",
    align: "left",
    width: 250,
    overflowTooltipShow: true,
    overflowTooltipWidth: 200,
    overflowTooltipPlacement: "top",
    rules: {
      required: true,
      message: "该项必填哦！",
    },
  },
  {
    title: "请假开始时间",
    size: "small",
    key: "start_dt",
    type: "datetime",
  },
  {
    title: "物料编码",
    key: "materialNo",
    align: "right",
    formatter({ value }: { value: string }) {
      if (!value) {
        return "";
      }
      const v = parseFloat(value);
      return v.toFixed(2);
    },
  },
  {
    title: "数量",
    key: "requiredQuantity",
    type: "number",
    align: "right",
  },
  { title: "单位", key: "unit" },
  { title: "工作性质", key: "work_type" },
  { title: "工作状态", key: "work_status" },
  { title: "户籍城市", key: "household_city" },
  { title: "户籍地址", key: "household_address" },
  { title: "民族", key: "nation" },
  { title: "工作地址", size: "small", key: "work_address" },
  {
    title: "工作邮箱",
    size: "small",
    key: "work_email",
    // rule: {
    //   required: true, message: '请输入邮箱地址'
    // },
  },
  { title: "个人邮箱", size: "small", key: "email" },
  {
    title: "工龄",
    key: "work_age",
  },
  { title: "司龄", key: "company_age" },
  { title: "合同公司", size: "small", key: "contract_company" },
  { title: "qq号", key: "qq" },
  { title: "年龄", key: "age" },
  { title: "品牌", key: "brandName" },
  { title: "商品名称", key: "goodsName" },
  { title: "规格型号", key: "sn", slotName: "sn" },
  { title: "客户备注", key: "customerRemarks", size: "small" },
  {
    title: "采购价(元)",
    key: "purchasePrice",
    type: "number",
  },
  {
    title: "销售价(元)",
    key: "salePrice",
    type: "number",
    readonly: true,
    slotName: "salePrice",
  },
  // {
  //   title: '操作',
  //   key: 'hander',
  //   slotName: 'hander',
  // },
];
let data: any[] = [];
for (let i = 1; i < 10000; i += 1) {
  data.push({
    _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
    id: i,
    // _readonly: true,
    emp_img:
      "https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754260406/20240827-182345.jpg",
    emp_name: `张三${i % 30 ? 1 : 0}`,
    emp_name11: `11张三${i}`,
    emp_name22: `22张三${i}`,
    emp_name2: `2张三${i}`,
    emp_no: i,
    dep_name: ["zhinan", "shejiyuanze", "yizhi"],
    job_name: i === 5 ? "产品经理测试很长的名字" : `产品经理${i}`,
    phone: i === 4 ? "13159645561a" : `${13159645561 + i}`,
    // eslint-disable-next-line no-nested-ternary
    sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
    address:
      // eslint-disable-next-line no-nested-ternary
      i === 1
        ? `海淀区北京路海淀区北京路十分地${i}号`
        : i === 4
        ? ""
        : `海淀区北京路${i}号`,
    work_type: `兼职${i}`,
    work_status: `在职${i}`,
    household_city: `深圳${i}`,
    household_address: `深南大道${i}号`,
    nation: `汉${i}`,
    work_address: `南京路${i}号`,
    work_email: `${28976633 + i}@qq.com`,
    email: `${4465566 + i}@qq.com`,
    work_age: 2 + i,
    company_age: 1 + i,
    contract_company: `飞鸟物流公司${i}`,
    qq: 35860567 + i,
    salary_month: `${1996 + i}-09`,
    birthday: `${1996 + i}-09-21`,
    age: 1 + i,
    brandName: `博世${i}`,
    goodsName: `电钻${i}`,
    sn: `SDFSD${i}`,
    materialNo: `1231${i}`,
    unit: "个",
    requiredQuantity: 10,
    customerRemarks: `测试测试${i}`,
    purchasePrice: 10.2 + i,
    salePrice: 12.3 + i,
    children: [],
  });
}
for (let i = 0; i < 500; i += 1) {
  columns.push({
    title: `表头${i}`,
    key: `sc_name${i}`,
    readonly: true,
    align: "right",
  });
}
const eVirtTable = new EVirtTable(canvas, {
  columns,
  data,
  footerData: [],
  config: {
    WIDTH: 0,
    HEIGHT: 500,
    ENABLE_OFFSET_HEIGHT: false,
    OFFSET_HEIGHT: 16,
  },
});
// 销毁
function destroy() {
  eVirtTable.destroy();
  window.removeEventListener("beforeunload", destroy);
}
window.addEventListener("beforeunload", destroy);
