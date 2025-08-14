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
        fixed: 'left',
        maxWidth: 60,
        operation: true,
        // widthFillDisable: true,
    },
    {
        key: 'id',
        width: 100,
        title: 'ID',
        fixed: 'left',
        minWidth: 80,
        maxWidth: 200,
        sortBy: 'string',
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
        width: 120,
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
        align: 'center',
        hoverIconName: 'icon-edit',
        placeholder: '请输入',
        sortBy: 'string',
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
    {
        title: '数量',
        key: 'requiredQuantity',
        sortBy: 'number',
        align: 'right',
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
        align: 'right',
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
        sortBy: 'date',
    },
    {
        title: '出生日期',
        key: 'birthday',
        editorType: 'date',
        hoverIconName: 'icon-date',
        sort: 2,
        sortBy: 'date',
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
                // 点击了家庭地址
            });
            cellEl.addEventListener('selectionchange', () => {
                const selection = window.getSelection();
                const text = selection ? selection.toString() : '';
                if (text) {
                    // 用户选中了文本
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
        sortBy: 'date',
    },
    {
        title: '物料编码',
        key: 'materialNo',
        align: 'right',
        selectorCellValueType: 'displayText', // displayText | value
        sortBy: (a, b) => {
            // 自定义排序：按物料编码的数字部分排序
            const aValue = parseFloat(a.materialNo) || 0;
            const bValue = parseFloat(b.materialNo) || 0;
            return aValue - bValue;
        },
        formatter({ value }: { value: string }) {
            if (!value) {
                return '';
            }
            const v = parseFloat(value);
            return `物料编码：${v}`;
        },
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
        sortBy: 'api',
        sortIconName: 'sortable-backend',
        sortAscIconName: 'sort-backend-asc',
        sortDescIconName: 'sort-backend-desc',
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
        start_dt: new Date(Math.ceil(new Date().getTime() * (0.9995 + Math.random() * 0.001))).toISOString().slice(0, 19).replace('T', ' '),
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
        requiredQuantity: Math.ceil(Math.random() * 100),
        customerRemarks: `测试测试${i}`,
        purchasePrice: 10.2 + i,
        salePrice: 12.3 + i,
        children: [
            {
                id: `${i}-1`,
                emp_no: `${i}-1`,
                emp_name: `张三${i}-1`,
                children: [],
                _hasChildren: true,
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
                        children: [
                            {
                                id: `${i}-2-1-1`,
                                emp_no: `${i}-2-1-1`,
                                emp_no1: `${i}-2-1-1`,
                                emp_name: `张三${i}-2-1-1`,
                                children: [
                                    {
                                        id: `${i}-2-1-1-1`,
                                        emp_no: `${i}-2-1-1-1`,
                                        emp_name: `张三${i}-2-1-1-1`,
                                        children: [
                                            {
                                                id: `${i}-2-1-1-1-1`,
                                                emp_no: `${i}-2-1-1-1-1`,
                                                emp_name: `张三${i}-2-1-1-1-1`,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        _hasChildren: true,
                    },
                ],
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
const svgSelect =
    '<svg t="1724122044148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4551" width="32" height="32"><path d="M707.648 401.28L489.28 560.704l22.656 30.976 22.656-30.976L316.16 401.216q-3.072-2.24-6.464-3.84-3.456-1.536-7.104-2.432-3.712-0.896-7.488-1.088-3.776-0.128-7.488 0.448-3.776 0.64-7.296 1.92-3.584 1.28-6.784 3.2-3.2 1.984-6.016 4.544-2.816 2.56-5.056 5.632-2.176 3.072-3.84 6.464-1.536 3.456-2.432 7.104-0.896 3.712-1.088 7.488-0.128 3.776 0.448 7.488 0.64 3.776 1.92 7.296 1.28 3.584 3.2 6.784 1.984 3.2 4.544 6.016 2.56 2.752 5.632 4.992l218.368 159.552q4.928 3.584 10.752 5.504 5.76 1.92 11.904 1.92 6.08 0 11.904-1.92 5.76-1.92 10.752-5.504l218.368-159.552q3.008-2.24 5.568-4.992 2.56-2.816 4.544-6.016 1.92-3.2 3.264-6.784 1.28-3.52 1.92-7.296 0.576-3.712 0.384-7.488-0.128-3.84-1.024-7.488-0.896-3.648-2.496-7.04-1.6-3.456-3.84-6.528-2.24-3.072-4.992-5.632-2.816-2.56-6.016-4.48-3.2-1.984-6.784-3.328-3.584-1.28-7.296-1.856-3.712-0.64-7.488-0.448-3.84 0.192-7.488 1.088-3.648 0.896-7.04 2.496-3.456 1.536-6.528 3.84z m61.056 30.976q0-3.84-0.768-7.488-0.704-3.712-2.176-7.232-1.472-3.456-3.52-6.656-2.112-3.136-4.8-5.76-2.688-2.688-5.76-4.8-3.2-2.112-6.72-3.584-3.456-1.408-7.168-2.176-3.712-0.704-7.488-0.704-3.84 0-7.488 0.704-3.712 0.768-7.232 2.176-3.456 1.472-6.656 3.584-3.136 2.112-5.76 4.8-2.688 2.624-4.8 5.76-2.112 3.2-3.584 6.656-1.408 3.52-2.176 7.232-0.704 3.712-0.704 7.488 0 3.776 0.704 7.488 0.768 3.712 2.176 7.168 1.472 3.52 3.584 6.656 2.112 3.2 4.8 5.824 2.624 2.688 5.76 4.8 3.2 2.112 6.656 3.52 3.52 1.472 7.232 2.176 3.712 0.768 7.488 0.768 3.776 0 7.488-0.768 3.712-0.704 7.168-2.176 3.52-1.408 6.656-3.52 3.2-2.112 5.824-4.8 2.688-2.688 4.8-5.76 2.048-3.2 3.52-6.72 1.472-3.456 2.176-7.168 0.768-3.712 0.768-7.488z m-436.736 0q0-3.84-0.768-7.488-0.704-3.712-2.176-7.232-1.408-3.456-3.52-6.656-2.112-3.136-4.8-5.76-2.688-2.688-5.76-4.8-3.2-2.112-6.656-3.584-3.52-1.408-7.232-2.176-3.712-0.704-7.488-0.704-3.84 0-7.488 0.704-3.712 0.768-7.232 2.176-3.456 1.472-6.592 3.584-3.2 2.112-5.824 4.8-2.688 2.624-4.8 5.76-2.112 3.2-3.52 6.656-1.472 3.52-2.24 7.232-0.704 3.712-0.704 7.488 0 3.776 0.704 7.488 0.768 3.712 2.24 7.168 1.408 3.52 3.52 6.656 2.112 3.2 4.8 5.824 2.624 2.688 5.76 4.8 3.2 2.112 6.656 3.52 3.52 1.472 7.232 2.176 3.712 0.768 7.488 0.768 3.776 0 7.488-0.768 3.712-0.704 7.232-2.176 3.456-1.408 6.592-3.52 3.2-2.112 5.824-4.8 2.688-2.688 4.8-5.76 2.112-3.2 3.52-6.72 1.472-3.456 2.176-7.168 0.768-3.712 0.768-7.488z" p-id="4552"></path></svg>';
const svgCharacterAsc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M4.664 11.942a1 1 0 0 0 1.278-.606L6.419 10h3.162l.477 1.336a1 1 0 0 0 1.884-.672L9.61 4.134a1.71 1.71 0 0 0-3.22 0l-2.332 6.53a1 1 0 0 0 .606 1.278M8 5.573L8.867 8H7.133zm8.293-1.28a1 1 0 0 1 1.414 0l2.829 2.828a1 1 0 0 1-1.415 1.415L18 7.414V20a1 1 0 1 1-2 0V7.414l-1.121 1.122a1 1 0 1 1-1.415-1.415zM5 13a1 1 0 1 0 0 2h3.586l-4.122 4.122C3.77 19.815 4.26 21 5.24 21H11a1 1 0 1 0 0-2H7.414l4.122-4.122c.693-.693.203-1.878-.777-1.878z"></path></g></svg>`;
const svgCharacterDesc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M8 12c.674 0 1.28.396 1.556 1.002l.054.132l2.332 6.53a1 1 0 0 1-1.838.78l-.046-.108L9.581 19H6.419l-.477 1.336a1 1 0 0 1-1.917-.56l.033-.112l2.332-6.53A1.71 1.71 0 0 1 8 12m9-8a1 1 0 0 1 1 1v12.414l1.121-1.121a1 1 0 0 1 1.415 1.414l-2.829 2.828a1 1 0 0 1-1.414 0l-2.828-2.828a1 1 0 0 1 1.414-1.414L16 17.414V5a1 1 0 0 1 1-1M8 14.573L7.133 17h1.734zM10.759 3c.94 0 1.43 1.092.855 1.792l-.078.086L7.414 9H11a1 1 0 0 1 .117 1.993L11 11H5.241c-.94 0-1.43-1.092-.855-1.792l.078-.086L8.586 5H5a1 1 0 0 1-.117-1.993L5 3z"></path></g></svg>`;
const svgNumberAsc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2"></path></g></svg>`;
const svgNumberDesc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M5 6a3 3 0 0 1 5.995-.176L11 6.01c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 10l.224-.228A7 7 0 0 0 7.971 9A3 3 0 0 1 5 6m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2m10 0a1 1 0 1 0-2 0v12.414l-1.121-1.121a1 1 0 0 0-1.415 1.414l2.829 2.828a1 1 0 0 0 1.414 0l2.828-2.828a1 1 0 1 0-1.414-1.414L18 17.413zM8 13a3 3 0 0 0-3 3v2a3 3 0 1 0 6 0v-2a3 3 0 0 0-3-3m-1 3a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0z"></path></g></svg>`;
const svgDateAsc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 7h-3l4-4l4 4h-3v14h-2zM8 16h3v-3H8zm5-11h-1V3h-2v2H6V3H4v2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2M3 18v-7h10v7z"></path></svg>`;
const svgDateDesc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 17h3l-4 4l-4-4h3V3h2zM8 16h3v-3H8zm5-11h-1V3h-2v2H6V3H4v2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2M3 18v-7h10v7z"></path></svg>`;
const svgSortAsc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 17.25a.75.75 0 0 1-1.5 0V7.56l-2.22 2.22a.75.75 0 1 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1-1.06 1.06L18.5 7.56zm-15.75.25a.75.75 0 0 1 0-1.5h9.5a.75.75 0 0 1 0 1.5zm0-5a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 0 1.5zm0-5a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 0 1.5z"></path></svg>`;
const svgSortDesc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 16.44V6.75a.75.75 0 0 0-1.5 0v9.69l-2.22-2.22a.75.75 0 1 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 1 0-1.06-1.06zM2 7.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 7.25m0 5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75m0 5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75"></path></svg>`;
const svgSortBackendAsc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="m15 7.674l1.409-1.487C17.159 5.396 17.534 5 18 5s.841.396 1.591 1.187L21 7.674m-3-2.587v4.375c0 2.234 0 3.35-.447 4.335s-1.287 1.72-2.968 3.191L14 17.5M3 6.5c0-1.225 0-1.838.238-2.306c.21-.411.545-.746.956-.956C4.662 3 5.274 3 6.5 3s1.838 0 2.306.238c.411.21.746.545.956.956C10 4.662 10 5.274 10 6.5s0 1.838-.238 2.306c-.21.411-.545.746-.956.956C8.338 10 7.726 10 6.5 10s-1.838 0-2.306-.238a2.2 2.2 0 0 1-.956-.956C3 8.338 3 7.726 3 6.5m0 11c0-1.225 0-1.838.238-2.306c.21-.411.545-.746.956-.956C4.662 14 5.274 14 6.5 14s1.838 0 2.306.238c.411.21.746.545.956.956c.238.468.238 1.08.238 2.306s0 1.838-.238 2.306c-.21.411-.545.746-.956.956C8.338 21 7.726 21 6.5 21s-1.838 0-2.306-.238a2.2 2.2 0 0 1-.956-.956C3 19.338 3 18.726 3 17.5"></path></svg>`;
const svgSortBackendDesc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="m15 16.327l1.409 1.486C17.159 18.604 17.534 19 18 19s.841-.396 1.591-1.187L21 16.327m-3 2.586v-4.375c0-2.234 0-3.35-.447-4.335s-1.287-1.72-2.968-3.191L14 6.5m-11 0c0-1.225 0-1.838.238-2.306c.21-.411.545-.746.956-.956C4.662 3 5.274 3 6.5 3s1.838 0 2.306.238c.411.21.746.545.956.956C10 4.662 10 5.274 10 6.5s0 1.838-.238 2.306c-.21.411-.545.746-.956.956C8.338 10 7.726 10 6.5 10s-1.838 0-2.306-.238a2.2 2.2 0 0 1-.956-.956C3 8.338 3 7.726 3 6.5m0 11c0-1.225 0-1.838.238-2.306c.21-.411.545-.746.956-.956C4.662 14 5.274 14 6.5 14s1.838 0 2.306.238c.411.21.746.545.956.956c.238.468.238 1.08.238 2.306s0 1.838-.238 2.306c-.21.411-.545.746-.956.956C8.338 21 7.726 21 6.5 21s-1.838 0-2.306-.238a2.2 2.2 0 0 1-.956-.956C3 19.338 3 18.726 3 17.5"></path></svg>`;
const svgSortable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m17.25 4l-.1.007a.75.75 0 0 0-.65.743v12.692l-3.22-3.218l-.084-.072a.75.75 0 0 0-.976 1.134l4.504 4.5l.084.072a.75.75 0 0 0 .976-.073l4.497-4.5l.072-.084a.75.75 0 0 0-.073-.977l-.084-.072a.75.75 0 0 0-.977.073L18 17.446V4.75l-.006-.102A.75.75 0 0 0 17.251 4m-11.036.22L1.72 8.715l-.073.084a.75.75 0 0 0 .073.976l.084.073a.75.75 0 0 0 .976-.073l3.217-3.218v12.698l.008.102a.75.75 0 0 0 .743.648l.101-.007a.75.75 0 0 0 .649-.743L7.497 6.559l3.223 3.217l.084.072a.75.75 0 0 0 .975-1.134L7.275 4.22l-.085-.072a.75.75 0 0 0-.976.073"></path></svg>`;
const svgSortableBackend = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#bec4c7" stroke-width="1.5"><path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.5 8v8m0 0L7 13.25M9.5 16l2.5-2.75M14.5 16V8m0 0L12 10.75M14.5 8l2.5 2.75"/></g></svg>`;
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
            // {
            //     name: 'sort-by-character-asc',
            //     svg: svgCharacterAsc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-by-character-desc',
            //     svg: svgCharacterDesc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-by-number-asc',
            //     svg: svgNumberAsc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-by-number-desc',
            //     svg: svgNumberDesc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-by-date-asc',
            //     svg: svgDateAsc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-by-date-desc',
            //     svg: svgDateDesc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-asc',
            //     svg: svgSortAsc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sort-desc',
            //     svg: svgSortDesc,
            //     color: '#4E5969',
            // },
            // {
            //     name: 'sortable',
            //     svg: svgSortable,
            //     color: '#bec4c7',
            // },
            // {
            //     name: 'sort-backend-asc',
            //     svg: svgSortBackendAsc,
            //     color: '',
            // },
            // {
            //     name: 'sort-backend-desc',
            //     svg: svgSortBackendDesc,
            //     color: '',
            // },
            // {
            //     name: 'sortable-backend',
            //     svg: svgSortableBackend,
            //     color: '',
            // },
        ],
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
                    // 新增
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
            // 修改前数据
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
    // hoverIconClick
});
// eVirtTable.on('change', (changeList) => {
//     eVirtTable.validate();
// });
eVirtTable.on('onPastedDataOverflow', (val: PastedDataOverflow) => {
    const { overflowColCount, overflowRowCount } = val;
    if (overflowRowCount > 0) {
        // 粘贴数据超出行数
        data = data.concat(Array.from({ length: overflowRowCount }).map(() => ({})));
        eVirtTable.loadData(data);
    }
    if (overflowColCount > 0) {
        // 粘贴数据超出列数
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

// 模拟服务端排序接口
function mockServerSort(sortData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let sortedData = [...data];

            // 根据排序条件对数据进行排序
            sortData.forEach(({ field, direction }) => {
                sortedData.sort((a, b) => {
                    let aValue = a[field];
                    let bValue = b[field];

                    // 根据字段类型进行排序
                    if (
                        field === 'requiredQuantity' ||
                        field === 'work_age' ||
                        field === 'age' ||
                        field === 'salePrice'
                    ) {
                        // 数字排序
                        aValue = Number(aValue) || 0;
                        bValue = Number(bValue) || 0;
                        return direction === 'asc' ? aValue - bValue : bValue - aValue;
                    } else if (field === 'birthday') {
                        // 日期排序
                        aValue = new Date(aValue).getTime();
                        bValue = new Date(bValue).getTime();
                        return direction === 'asc' ? aValue - bValue : bValue - aValue;
                    } else {
                        // 字符串排序
                        aValue = String(aValue || '');
                        bValue = String(bValue || '');
                        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    }
                });
            });

            resolve(sortedData);
        }, 500); // 模拟网络延迟
    });
}

eVirtTable.on('sortChange', async (sortMap) => {
    const sortData = (Array.from(sortMap.entries()) as [any, any][]).map(([key, value]) => ({
        field: key,
        direction: value.direction,
    }));
    console.log();
    
    // const sortedData = await mockServerSort(sortData);
    // eVirtTable.loadData(sortedData);
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
                                // 新增
                            },
                        },
                    ],
                });
            } else {
                eVirtTable.loadConfig({
                    TREE_SELECT_MODE: 'auto',
                    AUTO_FIT_TREE_WIDTH: true,
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
                    // 新增
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
document.getElementById('test')?.addEventListener('click', () => {
    eVirtTable.setSortQueryData([
        {
            field: 'phone',
            direction: 'desc',
        },
    ]);
});

// 销毁
function destroy() {
    eVirtTable.destroy();
    window.removeEventListener('beforeunload', destroy);
}
window.addEventListener('beforeunload', destroy);
