import EVirtTable from './src/EVirtTable';
import { BeforeCopyParams, BeforeSetSelectorParams, Column } from './src/types';
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
    // {
    //   key: "selection",
    //   type: "index-selection",
    //   width: 100,
    //   fixed: "left",
    // },
    // {
    //     title: '工号',
    //     key: 'emp_no',
    //     // operation: true,
    //     readonly: true,
    //     type: 'tree',
    //     fixed: 'left',
    //     sort: 4,
    //     // hide: () => 3 > 2,
    // },
    {
        title: '姓名',
        key: 'emp_name',
        width: 100,
        sort: 7,
        fixed: 'left',
        align: 'left',
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
        sort: 8,
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
    },
    {
        title: '销售价(元)',
        key: 'salePrice',
        readonly: true,
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
        id: i,
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
                svg: `<svg t="1728701835623" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4378" width="32" height="32"><path d="M169.958745 816.694816h684.107862q3.762689 0 7.461604 0.701518 3.698915 0.765293 7.206505 2.168329 3.443817 1.466811 6.568762 3.571366 3.188719 2.104555 5.80347 4.719305 2.678524 2.678524 4.783079 5.803469 2.104555 3.188719 3.507591 6.632536 1.466811 3.507591 2.168329 7.206506 0.765293 3.698915 0.765293 7.461604 0 3.762689-0.765293 7.461603-0.701518 3.698915-2.168329 7.142731-1.403037 3.507591-3.507591 6.632537-2.104555 3.188719-4.783079 5.803469-2.678524 2.678524-5.739695 4.783079-3.188719 2.04078-6.632537 3.507592-3.507591 1.466811-7.206505 2.168329-3.698915 0.765293-7.461604 0.765292H169.958745q-3.826463 0-7.461604-0.765292-3.698915-0.701518-7.206506-2.168329-3.443817-1.466811-6.568762-3.507592-3.188719-2.104555-5.803469-4.783079-2.678524-2.678524-4.783079-5.739695-2.104555-3.188719-3.507591-6.696311-1.466811-3.443817-2.16833-7.142731-0.765293-3.698915-0.765292-7.461603 0-3.826463 0.765292-7.461604 0.701518-3.698915 2.16833-7.206506 1.403037-3.443817 3.507591-6.632536 2.104555-3.124945 4.783079-5.739695 2.678524-2.678524 5.739695-4.783079 3.188719-2.104555 6.632536-3.571366 3.507591-1.403037 7.206506-2.168329 3.698915-0.701518 7.461604-0.701518zM651.51915 135.775673q-31.695871 0-54.144456 22.448584l-368.615963 368.99861q-22.321036 22.38481-22.321036 54.080682v89.029046q0 31.695871 22.38481 54.080681 22.448585 22.448585 54.144456 22.448584h89.730564q31.695871 0 54.144455-22.448584l368.297092-368.488415q22.38481-22.448585 22.384811-54.144456 0-31.632097-22.321036-54.080681L705.599831 158.160483q-22.448585-22.38481-54.144455-22.38481z m-368.615964 445.527876l368.615964-368.998611 89.475467 89.475467-368.297092 368.55219H282.966961V581.303549z" p-id="4379"></path></svg>`,
                color: '#4E5969',
            },
        ],
        // DISABLED: true,
        // HEIGHT: 500,
        // CHECKBOX_KEY: 'emp_name',
        // ROW_KEY: 'emp_no',
        CELL_HEIGHT: 36,
        SELECTOR_AREA_MIN_X: 0,
        ENABLE_AUTOFILL: true,
        ENABLE_SELECTOR: true,
        ENABLE_KEYBOARD: true,
        ENABLE_HISTORY: true,
        ENABLE_OFFSET_HEIGHT: true,
        HIGHLIGHT_SELECTED_ROW: false,
        HIGHLIGHT_HOVER_ROW: false,
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
        BEFORE_PASTE_DATA_METHOD: (changeList, xArr, yArr) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('BEFORE_PASTE_DATA_METHOD', changeList);
                    const ll = changeList.map((item) => {
                        const { value } = item;
                        return {
                            ...item,
                            value: `${value}粘贴`,
                        };
                    });
                    resolve(ll);
                }, 1000);
            });
        },
        BEFORE_AUTOFILL_DATA_METHOD: (changeList) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('BEFORE_PASTE_DATA_METHOD', changeList);
                    const ll = changeList.map((item) => {
                        const { value } = item;
                        return {
                            ...item,
                            value: `${value}填充`,
                        };
                    });
                    resolve(ll);
                }, 1000);
            });
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
// eVirtTable.on('error', (error) => {
//     console.error(error);
// })
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
document.getElementById('scroll')?.addEventListener('click', () => {
    eVirtTable.scrollYTo(1000);
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
