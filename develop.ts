import EVirtTable from './src/EVirtTable';
import {
    BeforeChangeItem,
    BeforeCopyParams,
    BeforeSetSelectorParams,
    BeforeValueChangeItem,
    Column,
    PastedDataOverflow,
    SelectableParams,
} from './src/types';
// import { mergeColCell, mergeRowCell } from './src/util';

const canvas = document.getElementById('e-virt-table') as HTMLDivElement;
let columns: Column[] = [
    // {
    //   title: "序号",
    //   key: "index",
    //   type: "index",
    //   fixed: "left",
    //   width: 50,
    // },
    {
        title: '',
        key: 'selection',
        type: 'selection',
        align: 'left',
        fixed: 'left',
        maxWidth: 200,
        operation: true,
        // widthFillDisable: true,
    },
    {
        title: '',
        key: 'index-selection',
        type: 'index-selection',
        align: 'center',
        fixed: 'left',
        maxWidth: 200,
        operation: true,
        // widthFillDisable: true,
    },
    {
        key: 'id',
        width: 100,
        title: 'ID',
        fixed: 'left',
        type: 'tree',
        minWidth: 80,
        maxWidth: 200,
    },
    // {
    //   key: "selection",
    //   type: "index-selection",
    //   width: 100,
    //   fixed: "left",
    // },
    {
        title: '工号工号工号工号工号工号工号工号工号',
        key: 'emp_no',
        // operation: true,
        align: 'center',
        type: 'tree-selection',
        // verticalAlign: 'bottom',
        readonly: false,
        width: 180,
        fixed: 'left',
        sort: 4,
        // hide: () => 3 > 2,
    },
    {
        title: '工号工号',
        key: 'emp_no1',
        // operation: true,
        align: 'left',
        type: 'selection-tree',
        // verticalAlign: 'bottom',
        readonly: false,
        width: 180,
        fixed: 'left',
        sort: 4,
        // hide: () => 3 > 2,
    },
    {
        title: '姓名',
        key: 'emp_name',
        width: 100,
        sort: 7,
        fixed: 'left',
        align: 'left',
        hoverIconName: 'icon-edit',
        placeholder: '请输入',
        // editorType: 'none',
        verticalAlign: 'middle',
        // hide: true,
        // render: (pEl, cell) => {
        //     const cellEl = document.createElement('div');
        //     cellEl.addEventListener('click', () => {
        //         console.log('点击了姓名');
        //     });
        //     cellEl.style.width = '100%';
        //     cellEl.style.height = '100%';
        //     cellEl.style.opacity = '0.5';
        //     cellEl.style.backgroundColor = 'cyan';
        //     cellEl.style.display = 'flex';
        //     cellEl.style.justifyContent = 'center';
        //     cellEl.style.alignItems = 'center';

        //     cellEl.innerHTML = cell.text;
        //     pEl.appendChild(cellEl);
        // },
        // render: "emp_name",
    },
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
        title: '岗位',
        key: 'job_name',
        // fixed: 'left',
        width: 200,
        align: 'left',
        children: [
            {
                title: '姓名1',
                key: 'emp_name1',
                align: 'left',
                fixed: 'left',
                children: [
                    {
                        title: '姓名11',
                        key: 'emp_name11',
                        readonly: false,
                        width: 200,
                        rules: {
                            required: true,
                            message: '该项必填哦！',
                            validator(rule, value, callback) {
                                if (!value) {
                                    callback('请输入岗位');
                                } else if (value.length > 10) {
                                    callback('岗位字段长度必须小于10个字符哦！');
                                } else {
                                    callback();
                                }
                            },
                        },
                    },
                    {
                        title: '姓名22',
                        key: 'emp_name22',
                        children: [
                            {
                                title: '姓名221',
                                key: 'emp_name221',
                                align: 'left',
                                width: 200,
                            },
                            {
                                title: '姓名222',
                                key: 'emp_name222',
                            },
                        ],
                    },
                ],
            },
            {
                title: '姓名2',
                key: 'emp_name2',
            },
        ],
    },
    {
        title: '手机号',
        key: 'phone',
        readonly: false,
        overflowTooltipHeaderShow: true,
        formatterFooter: ({ value }) => {
            return `合：${value}`;
        },
        width: 100,
    },
    {
        title: '性别',
        key: 'sex',
        // readonly: false,
        // render: "sex",
        // rules: [
        //     {
        //         validator: (rule, value, callback) => {
        //             if (!value) {
        //                 callback('该项必填哦！');
        //             } else {
        //                 callback();
        //             }
        //         },
        //     },
        // ],
        renderHeader: (pEl, cell) => {
            const cellEl = document.createElement('div');
            cellEl.style.width = '100%';
            cellEl.style.height = '100%';
            cellEl.style.opacity = '0.5';
            cellEl.style.backgroundColor = 'cyan';
            cellEl.style.display = 'flex';
            cellEl.style.justifyContent = 'center';
            cellEl.style.alignItems = 'center';
            cellEl.style.userSelect = 'text';
            cellEl.innerHTML = cell.text;
            pEl.appendChild(cellEl);
        },
    },
    {
        title: '计薪月份',
        // fixed: "right",
        key: 'salary_month',
        align: 'right',
        hoverIconName: 'icon-select',
        sort: 4,
        width: 200,
    },
    {
        title: '出生日期',
        key: 'birthday',
        editorType: 'date',
        hoverIconName: 'icon-date',
        sort: 2,
    },
    {
        title: '家庭地址',
        key: 'address',
        align: 'left',
        width: 250,
        overflowTooltipShow: true,
        overflowTooltipMaxWidth: 200,
        overflowTooltipPlacement: 'top',
        readonly: true,
        // rules: {
        //     required: true,
        //     message: '该项必填哦！',
        // },
        render: (pEl, cell) => {
            const cellEl = document.createElement('div');
            cellEl.addEventListener('click', () => {
                console.log('点击了家庭地址');
            });
            cellEl.addEventListener('selectionchange', () => {
                console.log('selectionchange');
                const selection = window.getSelection();
                const text = selection ? selection.toString() : '';
                if (text) {
                    console.log('用户选中了文本:', text);
                }
            });
            cellEl.style.width = '100%';
            cellEl.style.height = '100%';
            cellEl.style.opacity = '0.5';
            cellEl.style.backgroundColor = 'cyan';
            cellEl.style.display = 'block';
            // cellEl.style.justifyContent = 'center';
            // cellEl.style.alignItems = 'center';
            cellEl.style.whiteSpace = 'pre-line';
            cellEl.style.userSelect = 'text';
            cellEl.innerHTML = cell.text;
            pEl.appendChild(cellEl);
        },
    },
    {
        title: '请假开始时间',
        key: 'start_dt',
    },
    {
        title: '物料编码',
        key: 'materialNo',
        align: 'right',
        selectorCellValueType: 'displayText', // displayText | value
        formatter({ value }: { value: string }) {
            if (!value) {
                return '';
            }
            const v = parseFloat(value);
            return `物料编码：${v}`;
        },
    },
    {
        title: '数量',
        key: 'requiredQuantity',
        rules: [
            {
                required: true, // TODO:表格1.2.19有问题
                pattern: /^(0|[1-9]\d*)$/,
                message: '请输入0或正整数',
                validator(rule, value, callback) {
                    if (value > 10) {
                        callback('数量不能大于10');
                    } else {
                        callback();
                    }
                },
            },
        ],
        align: 'right',
    },
    { title: '单位', key: 'unit' },
    { title: '工作性质', key: 'work_type' },
    { title: '工作状态', key: 'work_status' },
    { title: '户籍城市', key: 'household_city' },
    { title: '户籍地址', key: 'household_address' },
    { title: '民族', key: 'nation' },
    { title: '工作地址', key: 'work_address' },
    {
        title: '工作邮箱',
        key: 'work_email',
        // rule: {
        //   required: true, message: '请输入邮箱地址'
        // },
    },
    { title: '个人邮箱', key: 'email' },
    {
        title: '工龄',
        key: 'work_age',
    },
    { title: '司龄', key: 'company_age' },
    { title: '合同公司', key: 'contract_company' },
    { title: 'qq号', key: 'qq' },
    { title: '年龄', key: 'age' },
    { title: '品牌', key: 'brandName' },
    { title: '商品名称', key: 'goodsName' },
    { title: '规格型号', key: 'sn' },
    { title: '客户备注', key: 'customerRemarks' },
    {
        title: '采购价(元)',
        key: 'purchasePrice',
        fixed: 'right',
        // type: 'number',
        rules: [
            {
                required: true,
                message: '请输入',
            },
            {
                // required: false,
                message: '请输入销售价',
                // 只能输入数字或小数点，且小数点后最多两位
                pattern: /^(\d+(\.\d{1,2})?|\.?\d{1,2})$/,
            },
        ],
    },
    {
        title: '销售价(元)',
        fixed: 'right',
        key: 'salePrice',
        type: 'number',
        align: 'left',
        hoverIconName: 'icon-edit',
        placeholder: '请输入',
        // readonly: true,
        // rules: [
        //     {
        //         required: true,
        //         type: 'number',
        //         message: '请输入销售价',
        //     },
        // ],
    },
    {
        title: '操作',
        key: 'hander',
        fixed: 'right',
    },
];
let data: any[] = [];
for (let i = 0; i < 1000; i += 1) {
    data.push({
        _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
        id: `1_${i}`,
        // _readonly: true,
        emp_name: `张三${i % 5 ? 1 : 0}`,
        emp_name11: `张三${i % 5 ? 1 : 0}`,
        emp_name221: `张三${i % 5 ? 1 : 0}`,
        emp_name222: `张三${i % 5 ? 1 : 0}`,
        emp_name2: `张三${i % 5 ? 1 : 0}`,
        emp_no: i,
        emp_no1: i,
        dep_name: ['zhinan', 'shejiyuanze', 'yizhi'],
        job_name: i === 5 ? '产品经理测试很长的名字' : `产品经理${i}`,
        phone: i === 4 ? '13159645561a' : `${13159645561 + i}`,
        // eslint-disable-next-line no-nested-ternary
        sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
        address:
            // eslint-disable-next-line no-nested-ternary
            i === 1 ? `海淀区北京路海淀区北京路十分地${i}号` : i === 4 ? '' : `海淀区北京路${i}号`,
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
        unit: '个',
        requiredQuantity: 10,
        customerRemarks: `测试测试${i}`,
        purchasePrice: 10.2 + i,
        salePrice: 12.3 + i,
        children: [
            {
                id: `${i}-1`,
                emp_no: `${i}-1`,
                emp_no1: `${i}-1`,
                emp_name: `张三${i}-1`,
                children: [],
            },
            {
                id: `${i}-2`,
                emp_no: `${i}-2`,
                emp_no1: `${i}-2`,
                emp_name: `张三${i}-2`,
                children: [
                    {
                        id: `${i}-2-1`,
                        emp_no: `${i}-2-1`,
                        emp_name: `张三${i}-2-1`,
                        children: [],
                        _hasChildren: true,
                    },
                ],
            },
            {
                id: `${i}-3`,
                emp_no: `${i}-3`,
                emp_no1: `${i}-3`,
                emp_name: `李三${i}-3`,
                children: [],
            },
        ],
        _hasChildren: true,
    });
}
for (let i = 0; i < 0; i += 1) {
    columns.push({
        title: `表头${i}`,
        key: `sc_name${i}`,
        readonly: true,
        align: 'right',
    });
}
const overlayerEl = document.getElementById('e-virt-table-overlayer') as HTMLDivElement;
const editorEl = document.getElementById('e-virt-table-editor') as HTMLDivElement;
const eVirtTable = new EVirtTable(canvas, {
    overlayerElement: overlayerEl,
    editorElement: editorEl,
    columns,
    data,
    footerData: [
        {
            emp_name: '合计',
            emp_img: '122',
            phone: '12222222',
            dep_name: '3434bu',
        },
        {
            emp_name: '合计34',
            emp_img: '122',
            phone: '12222223332',
        },
    ],
    config: {
        ICONS: [],
        BORDER: true,
        STRIPE: false,
        // DISABLED: true,
        // HEIGHT: 500,
        // CHECKBOX_KEY: 'emp_name',
        ROW_KEY: 'id',
        CELL_HEIGHT: 36,
        SELECTOR_AREA_MIN_X: 0,
        DEFAULT_EXPAND_ALL: false,
        ENABLE_AUTOFILL: true,
        ENABLE_SELECTOR: true,
        ENABLE_KEYBOARD: true,
        ENABLE_HISTORY: true,
        ENABLE_OFFSET_HEIGHT: true,
        HIGHLIGHT_SELECTED_ROW: false,
        HIGHLIGHT_HOVER_ROW: true,
        ENABLE_MERGE_CELL_LINK: false,
        ENABLE_EDIT_SINGLE_CLICK: false,
        FOOTER_FIXED: true,
        ENABLE_COPY: true,
        ENABLE_PASTER: true,
        FOOTER_POSITION: 'bottom',
        OFFSET_HEIGHT: 16,
        TREE_SELECT_MODE: 'auto',
        SELECTOR_CELL_VALUE_TYPE: 'displayText', // displayText | value
        // SELECTOR_AREA_MAX_X_OFFSET: 1,
        // SELECTOR_AREA_MAX_Y_OFFSET: 1,
        ENABLE_CONTEXT_MENU: true,
        CONTEXT_MENU: [
            { label: '复制', value: 'copy' },
            { label: '剪切', value: 'cut' },
            { label: '粘贴', value: 'paste' },
            { label: '清空选中内容', value: 'clearSelected' },
            {
                label: '新增',
                value: 'add',
                event: () => {
                    console.log('新增');
                },
            },
        ],
        BODY_CELL_RULES_METHOD: (params) => {
            const { row, column } = params;
            if (column.key === 'work_age') {
                return [
                    {
                        required: false,
                        pattern: /^(0|[1-9]\d*)$/,
                        message: '请输入0或正整数',
                    },
                ];
            }
        },
        // SELECTABLE_METHOD: (params: SelectableParams) => {
        //     const { row, rowIndex } = params;
        //     if (rowIndex === 4) {
        //         return false;
        //     }
        //     return true;
        // },
        // BEFORE_COPY_METHOD: (params: BeforeCopyParams) => {
        //     const { focusCell, xArr, yArr, data } = params;
        //     if (focusCell && focusCell.key === 'emp_name') {
        //         console.error('不能复制emp_name');
        //         return {
        //             ...params,
        //             data: [], // 设置复制内容为空
        //         };
        //     }
        //     if (focusCell && focusCell.key === 'emp_name11') {
        //         console.log(data);

        //         return {
        //             ...params,
        //             data: [],
        //         };
        //     }
        //     return params;
        // },
        // BEFORE_SET_SELECTOR_METHOD: (params: BeforeSetSelectorParams) => {
        //     const { focusCell, xArr, yArr } = params;
        //     if (focusCell && focusCell.key === 'emp_name') {
        //         const [minX, maxX] = xArr;
        //         return {
        //             ...params,
        //             xArr: [focusCell.colIndex, focusCell.colIndex],
        //             yArr,
        //         };
        //     }
        //     return {
        //         ...params,
        //     };
        // },
        // BEFORE_SET_AUTOFILL_METHOD: (params: BeforeSetSelectorParams) => {
        //     const { focusCell, xArr, yArr } = params;
        //     if (focusCell && focusCell.key === 'emp_name') {
        //         const [minX, maxX] = xArr;
        //         return {
        //             ...params,
        //             xArr: [focusCell.colIndex, focusCell.colIndex],
        //             yArr,
        //         };
        //     }
        //     return {
        //         ...params,
        //     };
        // },
        // 改变前需要篡改数据
        BEFORE_VALUE_CHANGE_METHOD: (changeList) => {
            let list: BeforeValueChangeItem[] = [
                {
                    rowKey: '1_0',
                    key: 'emp_no',
                    value: Math.random().toString(36).substring(2, 7),
                },
            ];
            const data = [...changeList, ...list];
            console.log('修改前数据', data);
            return data;
            // if(changeList.some((item) => item.key !== 'requiredQuantity')) {
            //     return changeList.map(item=>{
            //       item.row.emp_name = '张三111';
            //     });
            // }
            // return new Promise((resolve) => {
            //     setTimeout(() => {
            //         const ll = changeList.map((item) => {
            //             const { value, key, rowKey, oldValue } = item;
            //             if (key === 'requiredQuantity') {
            //                 // 清空的
            //                 if ([null, '', undefined].includes(value)) {
            //                     return item;
            //                 }
            //                 // 数字的
            //                 if (!isNaN(value) && Number(value) < 1000000000) {
            //                     return {
            //                         ...item,
            //                         value: Number(value),
            //                     };
            //                 }
            //                 return {
            //                     ...item,
            //                     value: oldValue,
            //                 };
            //             }
            //             return item;
            //         });
            //         resolve(ll);
            //     }, 1000);
            // });
        },
        // BEFORE_PASTE_DATA_METHOD: (changeList, xArr, yArr, texArr) => {
        //     console.log(yArr, texArr);
        //     const [minY, maxY] = yArr;
        //     const num = maxY - eVirtTable.ctx.maxRowIndex;
        //     if (num > 0) {
        //         Array.from({ length: num }).forEach(() => {
        //             data.push({});
        //         });
        //         console.log(data);

        //         eVirtTable.loadData(data);
        //     }
        //     return new Promise((resolve) => {
        //         setTimeout(() => {
        //             console.log('BEFORE_PASTE_DATA_METHOD', changeList);
        //             const ll = changeList.map((item) => {
        //                 const { value } = item;
        //                 return {
        //                     ...item,
        //                     value: `${value}粘贴`,
        //                 };
        //             });
        //             resolve(ll);
        //         }, 1000);
        //     });
        // },
        // BEFORE_AUTOFILL_DATA_METHOD: (changeList) => {
        //     return new Promise((resolve) => {
        //         setTimeout(() => {
        //             console.log('BEFORE_PASTE_DATA_METHOD', changeList);
        //             const ll = changeList.map((item) => {
        //                 const { value } = item;
        //                 return {
        //                     ...item,
        //                     value: `${value}填充`,
        //                 };
        //             });
        //             resolve(ll);
        //         }, 1000);
        //     });
        // },
        // EXPAND_LAZY_METHOD: (params: any) => {
        //     const i = params.row.id;
        //     return new Promise((resolve) => {
        //         setTimeout(() => {
        //             const list = [
        //                 {
        //                     id: `${i}-1`,
        //                     emp_no: `${i}-1`,
        //                     emp_name: `张三${i}-1`,
        //                     children: [],
        //                     _hasChildren: true,
        //                 },
        //                 {
        //                     id: `${i}-2`,
        //                     emp_no: `${i}-2`,
        //                     emp_name: `张三${i}-2`,
        //                 },
        //             ];
        //             resolve(list);
        //         }, 1000);
        //     });
        // },
        BODY_CELL_STYLE_METHOD: (cell: any) => {
            const { rowIndex, column } = cell;
            if (rowIndex == 5 && column.key === 'phone')
                return {
                    color: 'blue',
                    backgroundColor: 'red',
                };
            return {};
        },
        BODY_CELL_READONLY_METHOD: (params: any) => {
            const { rowIndex, column } = params;
            if (rowIndex == 15 && ['emp_name221', 'emp_name2'].includes(column.key)) {
                return true;
            }
        },
        SPAN_METHOD: (params) => {
            const { mergeColCell, mergeRowCell } = eVirtTable.getUtils();
            const { colIndex, column, row, visibleLeafColumns, visibleRows } = params;
            if (
                [
                    // 'selection',
                    'unit',
                    'work_type',
                    'household_city',
                    'household_address',
                    'requiredQuantity',
                    'work_status',
                    'materialNo',
                ].includes(column.key)
            ) {
                // 合并行单元格
                return mergeRowCell(params, column.key, ['emp_name', column.key]);
            }
            if (column.key === 'emp_name') {
                // 合并行单元格
                return mergeRowCell(params, 'emp_name', ['emp_name']);
            }
            if (column.key === 'phone') {
                // 合并行单元格
                return mergeRowCell(params, 'emp_name', ['emp_name', 'phone']);
            }
            if (['emp_name221', 'emp_name222', 'emp_name2'].includes(column.key)) {
                return mergeColCell(params, ['emp_name221', 'emp_name222', 'emp_name2']);
            }
            // if (column.key === 'selection') {
            //     // 合并行单元格
            //     return mergeRowCell(params, 'emp_name');
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
    },
});
eVirtTable.filterMethod((list) => {
    return list.filter((item) => item.id !== '1_3');
});
function getRandomString(minLen = 5, maxLen = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}
eVirtTable.on('error', (error) => {
    console.error(error);
});
eVirtTable.on('hoverIconClick', (cell) => {
    console.log('hoverIconClick', cell);
});
// eVirtTable.on('change', (changeList) => {
//     eVirtTable.validate();
// });
eVirtTable.on('onPastedDataOverflow', (val: PastedDataOverflow) => {
    const { overflowColCount, overflowRowCount } = val;
    if (overflowRowCount > 0) {
        console.log('粘贴数据超出行数', overflowRowCount);
        data = data.concat(Array.from({ length: overflowRowCount }).map(() => ({})));
        eVirtTable.loadData(data);
    }
    if (overflowColCount > 0) {
        console.log('粘贴数据超出列数', overflowColCount);
        columns = columns.concat(
            Array.from({ length: overflowColCount }).map((_, index) => ({
                title: `溢出表头${index}`,
                key: `overflow${index}`,
                fixed: 'right',
            })),
        );
        eVirtTable.loadColumns(columns);
    }
});
eVirtTable.on('overlayerChange', (container) => {
    if (!overlayerEl) {
        return;
    }
    // 移除所有子元素
    overlayerEl.replaceChildren();
    Object.assign(overlayerEl.style, container.style);
    container.views.forEach((typeView) => {
        const typeDiv = document.createElement('div');
        typeDiv.className = typeView.class;
        Object.assign(typeDiv.style, typeView.style);
        typeView.views.forEach((cellWrapView) => {
            const cellWrap = document.createElement('div');
            Object.assign(cellWrap.style, cellWrapView.style);
            cellWrapView.cells.forEach((cell) => {
                const cellEl = document.createElement('div');
                Object.assign(cellEl.style, cell.style);
                if (typeof cell.render === 'function') {
                    cell.render(cellEl, cell);
                }
                cellWrap.appendChild(cellEl);
            });
            typeDiv.appendChild(cellWrap);
        });
        overlayerEl.appendChild(typeDiv);
    });
});

// 三种模式切换功能
let currentMode = 'normal'; // 'normal', 'selection-tree', 'tree-selection'
const modeRadioContainer = document.getElementById('modeRadioContainer') as HTMLDivElement;

// 创建 radio 按钮
if (modeRadioContainer) {
    modeRadioContainer.innerHTML = `
        <label>
            <input type="radio" name="mode" value="normal" checked> 勾选+树
        </label>
        <label>
            <input type="radio" name="mode" value="selection-tree"> 勾选树
        </label>
        <label>
            <input type="radio" name="mode" value="tree-selection"> 树勾选
        </label>
    `;

    // 监听 radio 变化
    const radioButtons = modeRadioContainer.querySelectorAll('input[name="mode"]');
    radioButtons.forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const newMode = target.value;

            if (newMode === currentMode) {
                return;
            }

            currentMode = newMode;

            let newColumns: Column[];

            switch (newMode) {
                case 'selection-tree':
                    // 切换到勾选树模式
                    newColumns = columns.map((col) => {
                        if (col.key === 'selection') {
                            return {
                                ...col,
                                type: 'selection-tree',
                                title: '选择',
                                width: 200,
                                align: 'left',
                            };
                        }
                        if (col.key === 'emp_no') {
                            return {
                                ...col,
                                type: undefined, // 移除 tree 类型
                            };
                        }
                        return col;
                    });
                    break;

                case 'tree-selection':
                    // 切换到树勾选模式
                    newColumns = columns.map((col) => {
                        if (col.key === 'selection') {
                            return {
                                ...col,
                                type: 'tree-selection',
                                title: '选择',
                                align: 'left',
                            };
                        }
                        if (col.key === 'emp_no') {
                            return {
                                ...col,
                                type: undefined, // 移除 tree 类型
                            };
                        }
                        return col;
                    });
                    break;

                default:
                    // 普通模式
                    newColumns = columns;
                    break;
            }

            // 重新加载列配置
            eVirtTable.loadColumns(newColumns);

            // 更新配置
            if (newMode === 'normal') {
                eVirtTable.loadConfig({
                    TREE_SELECT_MODE: 'auto',
                    AUTO_FIT_TREE_WIDTH: true,
                    ENABLE_CONTEXT_MENU: true,
                    CONTEXT_MENU: [
                        { label: '复制', value: 'copy' },
                        { label: '剪切', value: 'cut' },
                        { label: '粘贴', value: 'paste' },
                        { label: '清空选中内容', value: 'clearSelected' },
                        {
                            label: '新增',
                            value: 'add',
                            event: () => {
                                console.log('新增');
                            },
                        },
                    ],
                });
            } else {
                eVirtTable.loadConfig({
                    TREE_SELECT_MODE: 'auto',
                    AUTO_FIT_TREE_WIDTH: false,
                    ENABLE_CONTEXT_MENU: true,
                    CONTEXT_MENU: [
                        { label: '全选', value: 'selectAll' },
                        { label: '取消全选', value: 'unselectAll' },
                        { label: '展开全部', value: 'expandAll' },
                        { label: '收起全部', value: 'collapseAll' },
                    ],
                });
            }
        });
    });
}

const dateEl = document.getElementById('e-virt-table-date') as HTMLInputElement;
if (dateEl) {
    eVirtTable.on('startEdit', (cell) => {
        const { width, height, editorType } = cell;
        // 内部已经处理了文本类型的编辑
        if (editorType === 'text') {
            return;
        }
        // 日期
        if (dateEl && ['date'].includes(editorType)) {
            dateEl.focus();
            dateEl.setAttribute('data-row-key', cell.rowKey);
            dateEl.setAttribute('data-key', cell.key);
            dateEl.style.display = 'block';
            dateEl.style.minWidth = `${width - 1}px`;
            dateEl.style.width = `${width - 1}px`;
            dateEl.style.minHeight = `${height - 1}px`;
            dateEl.style.maxHeight = `${window.innerHeight / 2}px`;
            dateEl.style.border = 'none';
            dateEl.value = cell.getValue();
        }
    });
    eVirtTable.on('doneEdit', (cell) => {
        // 内部已经处理了文本类型的编辑
        if (cell.editorType === 'text') {
            return;
        }
        if (['date'].includes(cell.editorType)) {
            dateEl.style.display = 'none';
        }
    });
    eVirtTable.on('change', (value) => {
        console.log(value);
        // console.log(eVirtTable.hasValidationError());
    });
    dateEl.addEventListener('change', function (event) {
        if (!event.target) {
            return;
        }
        // 获取 input 元素的新值
        const newValue = (event.target as HTMLInputElement).value;
        const rowKey = dateEl.getAttribute('data-row-key');
        const key = dateEl.getAttribute('data-key');
        if (rowKey === null || key === null) {
            return;
        }
        eVirtTable.setItemValueByEditor(rowKey, key, newValue, true, true);
    });
}
eVirtTable.on('selectionChange', (rowkeys) => {
    console.log('selectionChange', rowkeys);
});
eVirtTable.on('expandChange', (rowkeys) => {
    console.log('expandChange', rowkeys);
});
eVirtTable.on('validateChangedData', (list) => {
    console.log('validateChangedData', list);
});
document.getElementById('instantiation')?.addEventListener('click', () => {
    console.log(eVirtTable.getExpandRowKeys());
});
document.getElementById('validator')?.addEventListener('click', () => {
    eVirtTable.validate(true).then(() => {
        console.log('校验通过');
    });
});
document.getElementById('search')?.addEventListener('click', () => {
    const text = document.getElementById('search-text') as HTMLInputElement;
    eVirtTable.filterMethod((list) => {
        return list.filter((item) => item.emp_name.includes(text?.value));
    });
});
document.getElementById('getCurrentRow')?.addEventListener('click', () => {
    console.log(eVirtTable.getCurrentRow());
});
document.getElementById('pre')?.addEventListener('click', () => {
    let data: any[] = [];
    for (let i = 0; i < 800; i += 1) {
        data.push({
            _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
            id: `1_${i}`,
            // _readonly: true,
            emp_name: `张三${i % 5 ? 1 : 0}`,
            emp_name11: `张三${i % 5 ? 1 : 0}`,
            emp_name221: `张三${i % 5 ? 1 : 0}`,
            emp_name222: `张三${i % 5 ? 1 : 0}`,
            emp_name2: `张三${i % 5 ? 1 : 0}`,
            emp_no: i,
            dep_name: ['zhinan', 'shejiyuanze', 'yizhi'],
            job_name: i === 5 ? '产品经理测试很长的名字' : `产品经理${i}`,
            phone: i === 4 ? '13159645561a' : `${13159645561 + i}`,
            // eslint-disable-next-line no-nested-ternary
            sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
            address:
                // eslint-disable-next-line no-nested-ternary
                i === 1 ? `海淀区北京路海淀区北京路十分地${i}号` : i === 4 ? '' : `海淀区北京路${i}号`,
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
            unit: '个',
            requiredQuantity: 10,
            customerRemarks: `测试测试${i}`,
            purchasePrice: 10.2 + i,
            salePrice: 12.3 + i,
            children: [],
            _hasChildren: true,
        });
    }
    eVirtTable.loadData(data);
});
document.getElementById('next')?.addEventListener('click', () => {
    let data: any[] = [];
    for (let i = 0; i < 800; i += 1) {
        data.push({
            _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
            id: `2_${i}`,
            // _readonly: true,
            emp_name: `张三${i % 5 ? 1 : 0}`,
            emp_name11: `张三${i % 5 ? 1 : 0}`,
            emp_name221: `张三${i % 5 ? 1 : 0}`,
            emp_name222: `张三${i % 5 ? 1 : 0}`,
            emp_name2: `张三${i % 5 ? 1 : 0}`,
            emp_no: i,
            emp_no1: i,
            dep_name: ['zhinan', 'shejiyuanze', 'yizhi'],
            job_name: i === 5 ? '产品经理测试很长的名字' : `产品经理${i}`,
            phone: i === 4 ? '13159645561a' : `${13159645561 + i}`,
            // eslint-disable-next-line no-nested-ternary
            sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
            address:
                // eslint-disable-next-line no-nested-ternary
                i === 1 ? `海淀区北京路海淀区北京路十分地${i}号` : i === 4 ? '' : `海淀区北京路${i}号`,
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
            unit: '个',
            requiredQuantity: 10,
            customerRemarks: `测试测试${i}`,
            purchasePrice: 10.2 + i,
            salePrice: 12.3 + i,
            children: [],
            _hasChildren: true,
        });
    }
    eVirtTable.loadData(data);
});
document.getElementById('clearSelection')?.addEventListener('click', () => {
    eVirtTable.clearSelection();
});
document.getElementById('updateCssVar')?.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
});
let falg = false;
document.getElementById('expandAll')?.addEventListener('click', () => {
    falg = !falg;
    eVirtTable.toggleExpandAll(falg);
});
document.getElementById('setValidator')?.addEventListener('click', () => {
    const errors = [
        {
            rowIndex: 1,
            key: 'email',
            message: '邮箱必填',
        },
    ];
    eVirtTable.setValidations(errors);
});
document.getElementById('setConfig')?.addEventListener('click', () => {
    eVirtTable.loadConfig({
        CELL_HEIGHT: 40,
        ENABLE_AUTOFILL: true,
        ENABLE_SELECTOR: true,
        ENABLE_KEYBOARD: true,
        ENABLE_HISTORY: true,
        ENABLE_OFFSET_HEIGHT: true,
        HIGHLIGHT_SELECTED_ROW: true,
        HIGHLIGHT_HOVER_ROW: true,
        OFFSET_HEIGHT: 16,
        ENABLE_CONTEXT_MENU: false,
        CONTEXT_MENU: [
            { label: '复制', value: 'copy' },
            { label: '剪切', value: 'cut' },
            { label: '粘贴', value: 'paste' },
            { label: '清空选中内容', value: 'clearSelected' },
            {
                label: '新增',
                value: 'add',
                event: () => {
                    console.log('新增');
                },
            },
        ],
    });
});
document.getElementById('loadData')?.addEventListener('click', () => {
    let data: any[] = [];
    for (let i = 0; i < 500; i += 1) {
        data.push({
            _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
            id: `1_${i}`,
            // _readonly: true,
            emp_name: `张三${i % 5 ? 1 : 0}`,
            emp_name11: `张三${i % 5 ? 1 : 0}`,
            emp_name221: `张三${i % 5 ? 1 : 0}`,
            emp_name222: `张三${i % 5 ? 1 : 0}`,
            emp_name2: `张三${i % 5 ? 1 : 0}`,
            emp_no: i,
            dep_name: ['zhinan', 'shejiyuanze', 'yizhi'],
            job_name: i === 5 ? '产品经理测试很长的名字' : `产品经理${i}`,
            phone: i === 4 ? '13159645561a' : `${13159645561 + i}`,
            // eslint-disable-next-line no-nested-ternary
            sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
            address:
                // eslint-disable-next-line no-nested-ternary
                i === 1 ? `海淀区北京路海淀区北京路十分地${i}号` : i === 4 ? '' : `海淀区北京路${i}号`,
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
            unit: '个',
            requiredQuantity: 10,
            customerRemarks: `测试测试${i}`,
            purchasePrice: 10.2 + i,
            salePrice: 12.3 + i,
            children: [
                {
                    id: `${i}-1`,
                    emp_no: `${i}-1`,
                    emp_name: `张三${i}-1`,
                },
                {
                    id: `${i}-2`,
                    emp_no: `${i}-2`,
                    emp_name: `张三${i}-2`,
                    children: [
                        {
                            id: `${i}-2-1`,
                            emp_no: `${i}-2-1`,
                            emp_name: `张三${i}-2-1`,
                        },
                    ],
                },
            ],
        });
    }
    eVirtTable.loadData(data);
});

document.getElementById('clearEditableData')?.addEventListener('click', () => {
    const ll = eVirtTable.clearEditableData(111);
    console.log('clearEditableData', ll);
});

document.getElementById('setReadOnly')?.addEventListener('click', () => {
    const list = [
        {
            rowKey: '1_1',
            key: 'emp_no',
            value: '张三111',
        },
        {
            rowKey: '1_2',
            key: 'emp_no',
            value: '张三222',
        },
        {
            rowKey: '1_4',
            key: 'emp_no',
            value: '张三333',
        },
    ];
    eVirtTable.batchSetItemValue(list, true, false);
});
document.getElementById('getChangedValues')?.addEventListener('click', () => {
    console.log(eVirtTable.getChangedData());
});

// 销毁
function destroy() {
    eVirtTable.destroy();
    window.removeEventListener('beforeunload', destroy);
}
window.addEventListener('beforeunload', destroy);
