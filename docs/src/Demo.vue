<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, h } from "vue";
import KDataGrid from "./KDataGrid.vue";
import { DataGrid } from "@evirt-table/core";
import type { SpanParams } from "@evirt-table/core";
const canvasRef = ref();
const canvasRef1 = ref();
let grid: DataGrid;
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
    width: 50,
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
            render(cell: any) {
              // console.log(cell.getValue());
              return h("span", {}, cell.getValue());
            },
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
            renderHeader(cell: any) {
              return h(
                "div",
                {
                  class: "bg-img",
                },
                "姓名22"
              );
            },
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
    renderFooter(cell: any) {
      return h(
        "span",
        {
          class: "text",
        },
        "heji手机号"
      );
    },
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
    render(cell: any) {
      // console.log(cell.getValue());
      return h("span", {}, cell.getValue());
    },
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
    renderHeader(cell: any) {
      return h(
        "div",
        {
          class: "bg-img",
        },
        "工龄"
      );
    },
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
let tableData = ref<any[]>([]);
onMounted(() => {
  // nextTick(() => {
  let data: any[] = [];
  // 5000 => 1319 500=>181
  for (let i = 1; i < 1000; i += 1) {
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
  for (let i = 0; i < 0; i += 1) {
    columns.push({
      title: `生成表头${i}`,
      key: `sc_name${i}`,
      readonly: true,
      align: "right",
    });
  }
  tableData.value = data;
  nextTick(() => {
    canvasRef.value.loadConfig({
      // ROW_KEY: "id",
      // HEIGHT: 500,
      // MAX_HEIGHT: 800,
      CELL_HEIGHT: 36,
      ENABLE_OFFSET_HEIGHT: true,
      // OFFSET_HEIGHT: 32,
      FOOTER_FIXED: false,
      ENABLE_SELECTOR: true,
      ENABLE_AUTOFILL: true,
      HIGHLIGHT_HOVER_ROW: true,
      HIGHLIGHT_SELECTED_ROW: true,
      EXPAND_LAZY_METHOD: (params: any) => {
        const i = params.row.id;
        return new Promise((resolve) => {
          setTimeout(() => {
            const list = [
              {
                id: 1,
                emp_no: `${i}-1-1`,
                emp_name: `张三${i}-层级1-1`,
                children: [],
                emp_img:
                  "https://img.alicdn.com/bao/uploaded/i1/3035493001/O1CN01ueaQmD1Y2VJOV3Ujo_!!3035493001.jpg",
              },
              {
                id: 2,
                emp_no: `${i}-1-2`,
                emp_name: `张三${i}-层级1-1`,
                emp_img:
                  "https://img.alicdn.com/bao/uploaded/i1/3035493001/O1CN01ueaQmD1Y2VJOV3Ujo_!!3035493001.jpg",
              },
            ];
            resolve(list);
          }, 3000);
        });
      },
      CONTEXT_MENU: [
        {
          label: "复制",
          value: "copy",
        },
        {
          label: "剪切",
          value: "cut",
        },
        {
          label: "粘贴",
          value: "paste",
        },
        {
          label: "清空选中内容",
          value: "clearSelected",
        },
      ],
      BODY_CELL_STYLE_METHOD: (cell: any) => {
        const { rowIndex, column } = cell;
        if (rowIndex == 5 && column.key === "phone")
          return {
            color: "#1e80ff",
            backgroundColor: "red",
          };
        return {};
      },
      CELL_READONLY_METHOD: (params: any) => {
        const { rowIndex, column } = params;
        if (
          rowIndex == 15 &&
          ["emp_name221", "emp_name2"].includes(column.key)
        ) {
          return true;
        }
        // return true;
      },
      CELL_TYPE_METHOD: (params: any) => {
        const { rowIndex, column } = params;
        if (rowIndex == 1 && ["start_dt"].includes(column.key)) {
          return "text"; //请假时间rowIndex=1变成输入框
        }
      },
      // CELL_RENDER_METHOD: (params: any) => {
      //   // const { rowIndex, column, value } = params;
      //   // if (column.type !== 'session') {
      //   //   return ()=>h('span', {}, '123');
      //   // }
      //   // if (rowIndex == 1 && ['emp_img'].includes(column.key)) {
      //   //   return (cell: any) => h('span', {}, cell.value);
      //   // }
      //   // if (rowIndex == 2 && ['emp_img'].includes(column.key)) {
      //   //   return 'sex'; // 自定义插槽
      //   // }
      // },
      CHECKBOX_KEY: "emp_name",
      SELECTABLE_METHOD: (params: any) => {
        // const { rowIndex } = params;
        // if ([0, 1].includes(rowIndex)) {
        //   return true;
        // }
        // return false;
        return true;
      },
      SPAN_METHOD: (params: SpanParams) => {
        const { colIndex, column, row, visibleLeafColumns, visibleRows } =
          params;
        if (column.key === "emp_name") {
          // 合并行单元格
          return mergeRowCell(params, "emp_name");
        }
        // if (column.key === "selection") {
        //   // 合并行单元格
        //   return mergeRowCell(params, "emp_name");
        // }
        // // 合并动态列单元格
        // if (colIndex > 4) {
        //   const spanObj = getSpanObjByColumn(row, visibleLeafColumns);
        //   if (spanObj[column.key] === 0) {
        //     return {
        //       rowspan: 0,
        //       colspan: 0,
        //     };
        //   }
        //   return {
        //     rowspan: 1,
        //     colspan: spanObj[column.key],
        //   };
        // }
      },
      // CELL_RULE_METHOD: (params: any) => {
      //   const { column, row } = params;
      //   if (['address'].includes(column.key)) {
      //     if (row.children) {
      //       return {
      //         required: true,
      //         message: '该项必填哦！',
      //       }
      //     }
      //     return {
      //       required: false,
      //     }
      //   }
      //   return null;
      // },
    });
  });
  // setInterval(() => {
  //   nextTick(() => {
  //     const num = Math.floor(Math.random() * 1000);
  //     canvasRef.value?.loadFooterData([
  //       {
  //         emp_name: "合计",
  //         emp_img: "122",
  //         phone: "12222222",
  //         sex: `${num}`,
  //         dep_name: "3434bu",
  //       },
  //       {
  //         emp_name: "合计34",
  //         emp_img: "122",
  //         phone: "12222223332",
  //         sex: `${num}`,
  //       },
  //     ]);
  //   });
  // }, 3000);
});
const viewRef = ref<HTMLElement | null>(null);
const enterFullscreen = () => {
  const element = viewRef.value;
  if (!element) {
    return;
  }
  console.log("enterFullscreen");
  // 进入全屏模式的兼容处理
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    // Firefox
    (element as any).mozRequestFullScreen();
  } else if ((element as any).webkitRequestFullscreen) {
    // Chrome, Safari, Opera
    (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) {
    // IE/Edge
    (element as any).msRequestFullscreen();
  }
};
const getDataGrid = () => {
  console.log(canvasRef.value, "grid");
};
const getChangedData = () => {
  console.log(canvasRef.value.getChangedData());
};
const getChangedRows = () => {
  console.log(canvasRef.value.getChangedRows());
};
const getSelectionRows = () => {
  console.log(canvasRef.value.getSelectionRows());
};
const toggleRowSelection = () => {
  canvasRef.value.toggleRowSelection(tableData.value[1]);
};
const setSelectionRows = () => {
  const rows = tableData.value.slice(0, 3);
  console.log(rows, "rows");
  canvasRef.value.setSelectionByRows(rows, true);
};
const clearSelection = () => {
  canvasRef.value.clearSelection();
};
const validate = async () => {
  try {
    const res = await canvasRef.value.validate();
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};
const getValidations = async () => {
  try {
    const err = await canvasRef.value.getValidations();
    console.log(err);
  } catch (error) {
    console.log(error);
  }
};
const clearValidate = () => {
  canvasRef.value.clearValidate();
};
const destroy = () => {
  canvasRef.value.destroy();
};
const filterMethod = () => {
  canvasRef.value.filterMethod((rows: any[]) => {
    const ll = rows.filter((row: any) => row.id < 1);
    return ll;
  });
};
const resetFilterMethod = () => {
  canvasRef.value.filterMethod((rows: any[]) => {
    return rows;
  });
};
const loadColumns = () => {
  console.log(grid, "grid");
  canvasRef.value.loadColumns([
    {
      title: "计薪月份",
      size: "small",
      key: "salary_month",
      type: "month",
      align: "right",
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
      size: "medium",
      align: "left",
      width: 110,
      overflowTooltipShow: true,
      overflowTooltipWidth: 200,
      overflowTooltipPlacement: "top",
    },
    {
      title: "请假开始时间",
      size: "small",
      key: "start_dt",
      type: "datetime",
    },
  ]);
};
const loadData = () => {
  let data: any[] = [];
  for (let i = 0; i < 10; i += 1) {
    data.push({
      _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
      id: i,
      _readonly: i > 10,
      emp_img:
        "https://img.alicdn.com/bao/uploaded/i1/3035493001/O1CN01ueaQmD1Y2VJOV3Ujo_!!3035493001.jpg",
      emp_name: `张三${i % 10 ? 1 : 0}`,
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
    });
  }
  canvasRef.value.loadData(data);
};
const pasteChange = (list: any, rows: any) => {
  console.log("pasteChange", list, rows);
};
const autofillChange = (list: any, rows: any) => {
  console.log("autofillChange", list, rows);
};
const editChange = (value: any) => {
  console.log("editChange", value);
};
const iterationChange = (value: any) => {
  // console.log('iterationChange', value);
};
const change = (list: any, rows: any) => {
  console.log("change", list, rows);
};
const resizeColumnChange = (columns: any) => {
  console.log("resizeColumnChange", columns);
};

// 获取合并单元格的spanArr,针对行数据相同key合并
const getSpanArrByRow = (list: any, key: string) => {
  let contactDot = 0;
  const spanArr: number[] = [];
  list.forEach((item: any, index: number) => {
    if (index === 0) {
      spanArr.push(1);
    } else {
      if (item[key] === list[index - 1][key]) {
        spanArr[contactDot] += 1;
        spanArr.push(0);
      } else {
        spanArr.push(1);
        contactDot = index;
      }
    }
  });
  return spanArr;
};
const getSpanObjByColumn = (row: any, columns: any) => {
  let keyPre = "";
  let keyDot = "";
  const spanObj: any = {};
  columns.forEach((item: any, index: number) => {
    if (index === 0) {
      keyPre = item.key;
      keyDot = item.key;
      spanObj[item.key] = 1;
    } else {
      // eslint-disable-next-line no-undef
      if (row[item.key] === row[keyPre]) {
        spanObj[item.key] = 0;
        spanObj[keyDot] += 1;
      } else {
        spanObj[item.key] = 1;
        keyPre = item.key;
        keyDot = item.key;
      }
    }
  });
  return spanObj;
};
// 合并行单元格
const mergeRowCell = (data: any, key: string) => {
  // 合并单元格
  const { visibleRows, rowIndex, headIndex, headPosition } = data;
  const { top } = headPosition;
  scrollY.value = -top;
  const spanArr = getSpanArrByRow(visibleRows, key);
  if (spanArr[rowIndex - headIndex] === 0) {
    return {
      rowspan: 0,
      colspan: 0,
    };
  }
  return {
    rowspan: spanArr[rowIndex - headIndex],
    colspan: 1,
  };
};
const scrollY = ref(0);
const resizeRowChange = (data) => {
  console.log(data);
};
const cellSelectedClick = (data) => {
  console.log(data);
};
</script>

<template>
  <div class="view" ref="viewRef">
    <el-button type="primary" @click="enterFullscreen" style="margin-left: 16px"
      >全屏</el-button
    >
    <el-button type="primary" @click="getDataGrid" style="margin-left: 16px"
      >获取实例</el-button
    >
    <el-button type="primary" @click="destroy" style="margin-left: 16px"
      >销毁</el-button
    >
    <el-button type="primary" @click="loadColumns" style="margin-left: 16px"
      >加载列</el-button
    >
    <el-button type="primary" @click="loadData" style="margin-left: 16px"
      >加载数据</el-button
    >
    <el-button type="primary" @click="getChangedData" style="margin-left: 16px"
      >获取已改变</el-button
    >
    <el-button type="primary" @click="getChangedRows" style="margin-left: 16px"
      >获取已改变行数据</el-button
    >
    <el-button type="primary" @click="validate" style="margin-left: 16px"
      >检验数据</el-button
    >
    <el-button type="primary" @click="getValidations" style="margin-left: 16px"
      >检验所有数据</el-button
    >
    <el-button type="primary" @click="clearValidate" style="margin-left: 16px"
      >清除校验</el-button
    >
    <el-button
      type="primary"
      @click="getSelectionRows"
      style="margin-left: 16px"
      >获取选中</el-button
    >
    <el-button
      type="primary"
      @click="toggleRowSelection"
      style="margin-left: 16px"
      >切换1行选中状态</el-button
    >
    <el-button
      type="primary"
      @click="setSelectionRows"
      style="margin-left: 16px"
      >设置1-3行选中状态</el-button
    >
    <el-button type="primary" @click="clearSelection" style="margin-left: 16px"
      >清除选中</el-button
    >
    <el-button type="primary" @click="filterMethod" style="margin-left: 16px"
      >过滤数据方法</el-button
    >
    <el-button
      type="primary"
      @click="resetFilterMethod"
      style="margin-left: 16px"
      >重置过滤数据方法</el-button
    >
    <KDataGrid
      ref="canvasRef"
      :columns="columns"
      :data="tableData"
      @paste-change="pasteChange"
      @autofill-change="autofillChange"
      @edit-change="editChange"
      @iteration-change="iterationChange"
      @change="change"
      @resizeRowChange="resizeRowChange"
      @resizeColumnChange="resizeColumnChange"
      @cellSelectedClick="cellSelectedClick"
    >
      <template #sex="cell">
        <span>{{ cell.value }}</span>
        <!-- <el-tooltip content="2222222222222222222222222222222222222222" placement="top">
          <span class="single-line" style="pointer-events:initial">222</span>
        </el-tooltip> -->
      </template>
      <template #emp_name="{ cell }">
        <div v-html="cell.getValue()" style="padding: 4px"></div>
      </template>
    </KDataGrid>
    <!-- <div class="evirt-table">
      <div class="grid" ref="canvasRef"></div>
      <p>1111</p>
    </div> -->
  </div>
</template>

<style>
#app {
  padding: 0;
}

view {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #f0f0f0;
}

.view:fullscreen {
  background-color: white;
}

.text {
  font-size: 12px;
  color: #4e5969;
}

.single-line {
  display: inline-block;
  font-size: 12px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 5px;
}

.grid {
  overflow: hidden;
}
.bg-img {
  width: 100%;
  height: 100%;
  background-color: red;
}
</style>
