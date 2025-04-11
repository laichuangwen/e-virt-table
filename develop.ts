import EVirtTable from './src/EVirtTable';
import { BeforeCopyParams, BeforeSetSelectorParams, Column, SelectableParams } from './src/types';
// import { mergeColCell, mergeRowCell } from './src/util';

const canvas = document.getElementById('e-virt-table') as HTMLDivElement;
const columns: Column[] = [
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
        fixed: 'left',
        width: 50,
        operation: true,
        widthFillDisable: true,
    },
    {
        key: 'id',
        width: 100,
        title: 'ID',
        fixed: 'left',
    },
    // {
    //   key: "selection",
    //   type: "index-selection",
    //   width: 100,
    //   fixed: "left",
    // },
    {
        title: '工号',
        key: 'emp_no',
        // operation: true,
        readonly: true,
        type: 'tree',
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
        editorType: 'none',
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
                            validator(rule: any, value: any, callback: any) {
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
        fixed: 'right',
        readonly: false,
        formatterFooter: ({ value }) => {
            return `合：${value}`;
        },
        width: 100,
    },
    {
        title: '性别',
        key: 'sex',
        // readonly: false,
        fixed: 'right',
        // render: "sex",
        rules: [
            {
                validator: (rule, value, callback) => {
                    if (!value) {
                        callback('该项必填哦！');
                    } else {
                        callback();
                    }
                },
            },
        ],
        renderHeader: (pEl, cell) => {
            const cellEl = document.createElement('div');
            cellEl.style.width = '100%';
            cellEl.style.height = '100%';
            cellEl.style.opacity = '0.5';
            cellEl.style.backgroundColor = 'cyan';
            cellEl.style.display = 'flex';
            cellEl.style.justifyContent = 'center';
            cellEl.style.alignItems = 'center';

            cellEl.innerHTML = cell.text;
            pEl.appendChild(cellEl);
        },
    },
    {
        title: '计薪月份',
        // fixed: "right",
        key: 'salary_month',
        align: 'right',
        sort: 4,
        width: 200,
    },
    {
        title: '出生日期',
        key: 'birthday',
        editorType: 'date',
        sort: 2,
    },
    {
        title: '家庭地址',
        key: 'address',
        align: 'left',
        width: 250,
        fixed: 'right',
        overflowTooltipShow: true,
        overflowTooltipMaxWidth: 200,
        overflowTooltipPlacement: 'top',
        rules: {
            required: true,
            message: '该项必填哦！',
        },
        render: (pEl, cell) => {
            const cellEl = document.createElement('div');
            cellEl.addEventListener('click', () => {
                console.log('点击了家庭地址');
            });
            cellEl.style.width = '100%';
            cellEl.style.height = '100%';
            cellEl.style.opacity = '0.5';
            cellEl.style.backgroundColor = 'cyan';
            cellEl.style.display = 'block';
            // cellEl.style.justifyContent = 'center';
            // cellEl.style.alignItems = 'center';
            cellEl.style.whiteSpace = 'pre-line';
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
        formatter({ value }: { value: string }) {
            if (!value) {
                return '';
            }
            const v = parseFloat(value);
            return v.toFixed(2);
        },
    },
    {
        title: '数量',
        key: 'requiredQuantity',
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
        type: 'number',
        rules: [
            {
                required: true,
                type: 'number',
                message: '请输入销售价',
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
        rules: [
            {
                required: true,
                type: 'number',
                message: '请输入销售价',
            },
        ],
    },
    {
        title: '操作',
        key: 'hander',
        fixed: 'right',
    },
];
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
        ICONS: [
            {
                name: 'icon-edit',
                svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="28" height="28" viewBox="0 0 28 28"><defs><clipPath id="master_svg0_7146_08671"><rect x="6" y="6" width="16" height="16" rx="0"/></clipPath></defs><g><rect x="0" y="0" width="28" height="28" rx="8" fill="#1B6CFC" fill-opacity="1"/><g clip-path="url(#master_svg0_7146_08671)"><g><path d="M8.400390625,19.2L20.000390625,19.2Q20.079190625000003,19.2,20.156490625,19.215372Q20.233790624999997,19.230744,20.306490625000002,19.260896Q20.379290625,19.291049,20.444890625,19.334824Q20.510390625,19.378599,20.566090625,19.434315Q20.621790625,19.49003,20.665590625,19.555544Q20.709290625,19.621058,20.739490625000002,19.693853Q20.769690625000003,19.766649,20.784990625,19.843928Q20.800390625,19.9212069,20.800390625,20Q20.800390625,20.0787931,20.784990625,20.156072Q20.769690625000003,20.233351,20.739490625000002,20.306147Q20.709290625,20.378942,20.665590625,20.444456Q20.621790625,20.50997,20.566090625,20.565685Q20.510390625,20.621401,20.444890625,20.665176Q20.379290625,20.708951,20.306490625000002,20.739104Q20.233790624999997,20.769256,20.156490625,20.784628Q20.079190625000003,20.8,20.000390625,20.8L8.400390625,20.8Q8.321597525,20.8,8.244318625,20.784628Q8.167039625,20.769256,8.094243625,20.739104Q8.021448625,20.708951,7.955934625,20.665176Q7.890420625,20.621401,7.834705625,20.565685Q7.778989625,20.50997,7.735214625,20.444456Q7.691439625,20.378942,7.661286625,20.306147Q7.631134625,20.233351,7.615762625,20.156072Q7.600390625,20.0787931,7.600390625,20Q7.600390625,19.9212069,7.615762625,19.843928Q7.631134625,19.766649,7.661286625,19.693853Q7.691439625,19.621058,7.735214625,19.555544Q7.778989625,19.49003,7.834705625,19.434315Q7.890420625,19.378599,7.955934625,19.334824Q8.021448625,19.291049,8.094243625,19.260896Q8.167039625,19.230744,8.244318625,19.215372Q8.321597525,19.2,8.400390625,19.2Z" fill-rule="evenodd" fill="#FFFFFF" fill-opacity="1"/></g><g><path d="M16.5652521875,7.448875Q15.9850221875,7.448986,15.5749821875,7.859519L9.1594621875,14.282720000000001Q8.8669921875,14.57555,8.8669921875,14.98941L8.8669921875,16.93334Q8.8669921875,17.43039,9.2184641875,17.78186Q9.5699365875,18.1333,10.0669921875,18.1333L12.0231921875,18.1333Q12.4375321875,18.1333,12.7304521875,17.84029L19.142152187500002,11.42577Q19.551982187500002,11.01575,19.551982187500002,10.43603Q19.551982187500002,9.85632,19.142152187500002,9.4463L17.5556821875,7.8591429999999995Q17.1454921875,7.448765,16.5652521875,7.448875ZM16.5655721875,9.13183L10.4669921875,15.23772L10.4669921875,16.53333L11.7745821875,16.53333L17.8692021875,10.43603L16.5655721875,9.13183Z" fill-rule="evenodd" fill="#FFFFFF" fill-opacity="1"/></g></g></g></svg>`,
                color: '',
            },
        ],
        BORDER: true,
        STRIPE: false,
        EDIT_BG_COLOR: '#fff',
        // DISABLED: true,
        // HEIGHT: 500,
        // CHECKBOX_KEY: 'emp_name',
        ROW_KEY: 'id',
        ENABLE_RESERVE_SELECTION: true,
        CELL_HEIGHT: 36,
        SELECTOR_AREA_MIN_X: 0,
        ENABLE_AUTOFILL: true,
        ENABLE_SELECTOR: true,
        ENABLE_KEYBOARD: true,
        ENABLE_HISTORY: true,
        ENABLE_OFFSET_HEIGHT: true,
        HIGHLIGHT_SELECTED_ROW: false,
        HIGHLIGHT_HOVER_ROW: true,
        ENABLE_MERGE_CELL_LINK: true,
        ENABLE_EDIT_SINGLE_CLICK: false,
        FOOTER_FIXED: true,
        ENABLE_COPY: true,
        ENABLE_PASTER: true,

        FOOTER_POSITION: 'bottom',
        OFFSET_HEIGHT: 16,
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
            return changeList;
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
        // BEFORE_PASTE_DATA_METHOD: (changeList, xArr, yArr) => {
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
                        },
                        {
                            id: 2,
                            emp_no: `${i}-1-2`,
                            emp_name: `张三${i}-层级1-1`,
                        },
                    ];
                    resolve(list);
                }, 1000);
            });
        },
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
eVirtTable.on('error', (error) => {
    console.error(error);
});
eVirtTable.on('hoverIconClick', (cell) => {
    console.log('hoverIconClick', cell);
});
// eVirtTable.on('change', (changeList) => {
//     eVirtTable.validate();
// });
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
    console.log(eVirtTable);
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
// 销毁
function destroy() {
    eVirtTable.destroy();
    window.removeEventListener('beforeunload', destroy);
}
window.addEventListener('beforeunload', destroy);
