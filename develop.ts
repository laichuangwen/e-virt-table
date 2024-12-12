import EVirtTable from './src/EVirtTable';

const canvas = document.getElementById('e-virt-table') as HTMLDivElement;
const columns: any[] = [
    // {
    //   title: "序号",
    //   key: "index",
    //   type: "index",
    //   fixed: "left",
    //   width: 50,
    // },
    // {
    //     key: 'selection',
    //     type: 'selection',
    //     fixed: 'left',
    //     width: 50,
    //     widthFillDisable: true,
    // },
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
        slotName: 'emp_no',
        readonly: true,
        type: 'tree',
        fixed: 'left',
        sort: 4,
        // hide: () => 3 > 2,
    },
    {
        title: '姓名',
        key: 'emp_name',
        type: 'contenteditable',
        width: 100,
        sort: 7,
        fixed: 'left',
        align: 'left',
        verticalAlign: 'middle',
        // hide: true,
        renderFooter: (pEl, cell) => {
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
        title: '岗位',
        key: 'job_name',
        size: 'small',
        // fixed: 'left',
        width: 200,
        align: 'left',
        children: [
            {
                title: '姓名1',
                key: 'emp_name1',
                type: 'text',
                align: 'left',
                fixed: 'left',
                children: [
                    {
                        title: '姓名11',
                        key: 'emp_name11',
                        type: 'text',
                        readonly: false,
                        width: 200,
                        rule: {
                            validator(rule: any, value: any, callback: any) {
                                if (!value) {
                                    callback('请输入岗位');
                                } else if (value.length > 10) {
                                    callback('岗位字段长度必须小于10个字符哦！');
                                } else {
                                    callback();
                                }
                            },
                            immediate: true,
                        },
                    },
                    {
                        title: '姓名22',
                        key: 'emp_name22',
                        type: 'text',
                        children: [
                            {
                                title: '姓名221',
                                key: 'emp_name221',
                                type: 'text',
                                align: 'left',
                                width: 200,
                            },
                            {
                                title: '姓名222',
                                key: 'emp_name222',
                                type: 'text',
                            },
                        ],
                    },
                ],
            },
            {
                title: '姓名2',
                key: 'emp_name2',
                type: 'text',
            },
        ],
    },
    {
        title: '手机号',
        key: 'phone',
        fixed: 'right',
        type: 'phone',
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
        size: 'small',
        // fixed: "right",
        key: 'salary_month',
        type: 'month',
        align: 'right',
        sort: 4,
        width: 200,
    },
    {
        title: '出生日期',
        size: 'small',
        key: 'birthday',
        editorType: 'date',
        sort: 2,
    },
    {
        title: '家庭地址',
        sort: 8,
        key: 'address',
        align: 'left',
        width: 250,
        fixed: 'right',
        overflowTooltipShow: true,
        overflowTooltipWidth: 200,
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
        size: 'small',
        key: 'start_dt',
        type: 'datetime',
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
        type: 'number',
        align: 'right',
    },
    { title: '单位', key: 'unit' },
    { title: '工作性质', key: 'work_type' },
    { title: '工作状态', key: 'work_status' },
    { title: '户籍城市', key: 'household_city' },
    { title: '户籍地址', key: 'household_address' },
    { title: '民族', key: 'nation' },
    { title: '工作地址', size: 'small', key: 'work_address' },
    {
        title: '工作邮箱',
        size: 'small',
        key: 'work_email',
        // rule: {
        //   required: true, message: '请输入邮箱地址'
        // },
    },
    { title: '个人邮箱', size: 'small', key: 'email' },
    {
        title: '工龄',
        key: 'work_age',
    },
    { title: '司龄', key: 'company_age' },
    { title: '合同公司', size: 'small', key: 'contract_company' },
    { title: 'qq号', key: 'qq' },
    { title: '年龄', key: 'age' },
    { title: '品牌', key: 'brandName' },
    { title: '商品名称', key: 'goodsName' },
    { title: '规格型号', key: 'sn', slotName: 'sn' },
    { title: '客户备注', key: 'customerRemarks', size: 'small' },
    {
        title: '采购价(元)',
        key: 'purchasePrice',
        type: 'number',
    },
    {
        title: '销售价(元)',
        key: 'salePrice',
        type: 'number',
        readonly: true,
        slotName: 'salePrice',
    },
    {
        title: '操作',
        key: 'hander',
        fixed: 'right',
        slotName: 'hander',
    },
];
let data: any[] = [];
for (let i = 0; i < 10000; i += 1) {
    data.push({
        _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
        id: i,
        // _readonly: true,
        emp_img: 'https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754260406/20240827-182345.jpg',
        emp_name: `张三${i % 30 ? 1 : 0}`,
        emp_name11: `11张三${i}`,
        emp_name22: `22张三${i}`,
        emp_name2: `2张三${i}`,
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
    let keyPre = '';
    let keyDot = '';
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
    const { visibleRows, rowIndex, headIndex } = data;
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
                svg: `<svg t="1728701835623" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4378" width="32" height="32"><path d="M169.958745 816.694816h684.107862q3.762689 0 7.461604 0.701518 3.698915 0.765293 7.206505 2.168329 3.443817 1.466811 6.568762 3.571366 3.188719 2.104555 5.80347 4.719305 2.678524 2.678524 4.783079 5.803469 2.104555 3.188719 3.507591 6.632536 1.466811 3.507591 2.168329 7.206506 0.765293 3.698915 0.765293 7.461604 0 3.762689-0.765293 7.461603-0.701518 3.698915-2.168329 7.142731-1.403037 3.507591-3.507591 6.632537-2.104555 3.188719-4.783079 5.803469-2.678524 2.678524-5.739695 4.783079-3.188719 2.04078-6.632537 3.507592-3.507591 1.466811-7.206505 2.168329-3.698915 0.765293-7.461604 0.765292H169.958745q-3.826463 0-7.461604-0.765292-3.698915-0.701518-7.206506-2.168329-3.443817-1.466811-6.568762-3.507592-3.188719-2.104555-5.803469-4.783079-2.678524-2.678524-4.783079-5.739695-2.104555-3.188719-3.507591-6.696311-1.466811-3.443817-2.16833-7.142731-0.765293-3.698915-0.765292-7.461603 0-3.826463 0.765292-7.461604 0.701518-3.698915 2.16833-7.206506 1.403037-3.443817 3.507591-6.632536 2.104555-3.124945 4.783079-5.739695 2.678524-2.678524 5.739695-4.783079 3.188719-2.104555 6.632536-3.571366 3.507591-1.403037 7.206506-2.168329 3.698915-0.701518 7.461604-0.701518zM651.51915 135.775673q-31.695871 0-54.144456 22.448584l-368.615963 368.99861q-22.321036 22.38481-22.321036 54.080682v89.029046q0 31.695871 22.38481 54.080681 22.448585 22.448585 54.144456 22.448584h89.730564q31.695871 0 54.144455-22.448584l368.297092-368.488415q22.38481-22.448585 22.384811-54.144456 0-31.632097-22.321036-54.080681L705.599831 158.160483q-22.448585-22.38481-54.144455-22.38481z m-368.615964 445.527876l368.615964-368.998611 89.475467 89.475467-368.297092 368.55219H282.966961V581.303549z" p-id="4379"></path></svg>`,
                color: '#4E5969',
            },
        ],
        HEIGHT: 500,
        CHECKBOX_KEY: 'emp_name',
        ROW_KEY: 'emp_no',
        CELL_HEIGHT: 36,
        SELECTOR_AREA_MIN_X: 0,
        ENABLE_AUTOFILL: true,
        ENABLE_SELECTOR: true,
        ENABLE_KEYBOARD: true,
        ENABLE_HISTORY: true,
        ENABLE_OFFSET_HEIGHT: false,
        HIGHLIGHT_SELECTED_ROW: true,
        HIGHLIGHT_HOVER_ROW: true,
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
        // 改变前需要篡改数据
        BEFORE_CELL_VALUE_CHANGE_METHOD: (params) => {
            const { value, key, oldValue } = params;
            if (key === 'requiredQuantity') {
                // 清空的
                if ([null, '', undefined].includes(value)) {
                    return value;
                }
                // 数字的
                if (!isNaN(value) && Number(value) < 1000000000) {
                    return Number(value);
                }
                return oldValue;
            }
            return value;
        },
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
                                'https://img.alicdn.com/bao/uploaded/i1/3035493001/O1CN01ueaQmD1Y2VJOV3Ujo_!!3035493001.jpg',
                        },
                        {
                            id: 2,
                            emp_no: `${i}-1-2`,
                            emp_name: `张三${i}-层级1-1`,
                            emp_img:
                                'https://img.alicdn.com/bao/uploaded/i1/3035493001/O1CN01ueaQmD1Y2VJOV3Ujo_!!3035493001.jpg',
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
        CELL_READONLY_METHOD: (params: any) => {
            const { rowIndex, column } = params;
            if (rowIndex == 15 && ['emp_name221', 'emp_name2'].includes(column.key)) {
                return true;
            }
        },
        SPAN_METHOD: (params) => {
            const { colIndex, column, row, visibleLeafColumns, visibleRows } = params;
            if (column.key === 'emp_name') {
                // 合并行单元格
                return mergeRowCell(params, 'emp_name');
            }
            if (column.key === 'selection') {
                // 合并行单元格
                return mergeRowCell(params, 'emp_name');
            }
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
eVirtTable.on('expandChange', (rowkeys) => {
    console.log('expandChange', rowkeys);
});
document.getElementById('expand')?.addEventListener('click', () => {
    eVirtTable.setExpandRowKeys(['0-1-1']);
});
document.getElementById('instantiation')?.addEventListener('click', () => {
    console.log(eVirtTable);
});
document.getElementById('validator')?.addEventListener('click', () => {
    eVirtTable.validate(true).then(() => {
        console.log('校验通过');
    });
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
document.getElementById('edit')?.addEventListener('click', () => {
    let data: any[] = [];
    for (let i = 0; i < 100; i += 1) {
        data.push({
            _height: [3, 5, 6, 7].includes(i) ? 60 : 0,
            id: i,
            // _readonly: true,
            emp_img: 'https://devtest-oss-r.bananain.cn/wechat-mall/2024/08/27/1724754260406/20240827-182345.jpg',
            emp_name: `张三${i % 30 ? 1 : 0}`,
            emp_name11: `11张三${i}`,
            emp_name22: `22张三${i}`,
            emp_name2: `2张三${i}`,
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
        });
    }
    eVirtTable.loadData(data);
});
// 销毁
function destroy() {
    eVirtTable.destroy();
    window.removeEventListener('beforeunload', destroy);
}
window.addEventListener('beforeunload', destroy);
