<template>
    <div class="content-wrapper">
        <div class="content">
            <h1 class="title">Операции на поле {{id}}</h1>
            <section class="toolbar">
                <section class="filters">
                    <label :class="{active: operationFilter === 'all'}">
                        <input type="radio"
                               value="all"
                               v-model="operationFilter"
                               name="toolbar-filter">
                        Все
                    </label>
                    <label :class="{active: operationFilter === 'planed'}">
                        <input type="radio"
                               value="planed"
                               v-model="operationFilter"
                               name="toolbar-filter">
                        Запланированные операции
                    </label>
                    <label :class="{active: operationFilter === 'done'}">
                        <input type="radio"
                               value="done"
                               v-model="operationFilter"
                               name="toolbar-filter">
                        Выполненные операции
                    </label>
                </section>
                <section class="actions">
                    <button class="btn-add"><i class="icon-add"></i> Добавить операцию</button>
                </section>
            </section>
            <table class="operations-table">
                <thead>
                <tr>
                    <th v-for="column in tableHeader" :key="column.code"
                        :class="{active: column.code === activeSortColumn}"
                        @click="headerClickHandler(column.code)">
                        {{column.label}} <i :class="{desc: sortOrder === 'desc'}"></i>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="operation in operations" :key="operation.id">
                    <td>{{operation.date}}</td>
                    <td style="width: 40%">{{operation.operationLabel}}</td>
                    <td class="kind">
                        <img :src="`/img/${operation.icon}`" width="30" height="27"
                             :alt="`~@img/${operation.icon}`"/>
                        <span>{{operation.kind}}</span>
                    </td>
                    <td>
                        <span class="visual-assessment"
                              :class="{green: operation.assessment === 0, yellow: operation.assessment === 1, red: operation.assessment === 2}"></span>
                        {{operation.assessmentLabel}}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import FieldService from "@/api/FieldService";
    import Operation from "../api/models/Operation";
    import moment from "moment";

    moment.locale("ru");

    class HeaderColumn {
        code: string;
        label: string;

        constructor(_code: string, _label: string) {
            this.code = _code;
            this.label = _label;
        }
    }

    class TableHeaderSortController {
        private activeColumnCode: string;
        private sortOrder: string;

        constructor(_activeColumnCode: string, _initialOrder: string = "asc") {
            this.activeColumnCode = _activeColumnCode;
            this.sortOrder = _initialOrder;
        }

        changeActiveColumn(columnCode: string) {
            if (this.activeColumnCode === columnCode) return;
            this.activeColumnCode = columnCode;
            this.sortOrder = "asc";
        }

        getActiveColumnCode() {
            return this.activeColumnCode;
        }

        getSortOrder() {
            return this.sortOrder;
        }

        changeSortOrder() {
            this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        }
    }

    class Product {
        label: string;
        icon: string;

        constructor(_label: string, _icon: string) {
            this.label = _label;
            this.icon = _icon;

        }
    }

    let wheat: Product = new Product("Пшеница озимая", "cropWheat.png");

    @Component
    export default class FieldOperations extends Vue {
        // ---------- Props ----------
        @Prop(Number) id: number;

        // ---------- Data Model ----------
        tableHeader: Array<HeaderColumn> = [
            new HeaderColumn("date", "Дата"),
            new HeaderColumn("operationLabel", "Операция"),
            new HeaderColumn("kind", "Культура"),
            new HeaderColumn("assessmentLabel", "Качество"),
        ];

        tableHeaderController: TableHeaderSortController = new TableHeaderSortController(this.tableHeader[0].code, "asc");

        originOperations: Array<Operation> = [];
        operations: Array<Object> = [];

        operationLabel: Array<string> = [
            "Вспашка",
            "Боронование",
            "Внесение удобрений",
            "Полив",
            "Прикатывание",
            "Сбор урожая",
        ];

        assessmentLabels: Array<string> = [
            "Отлично",
            "Удовлетворительно",
            "Плохо",
        ];

        operationFilter: string = "all";

        // ---------- Computed Properties ----------
        get sortOrder() {
            return this.tableHeaderController.getSortOrder();
        }

        get activeSortColumn() {
            return this.tableHeaderController.getActiveColumnCode();
        }

        // ---------- Watch ----------
        @Watch("activeSortColumn")
        onSortColumnChange(val: string) {
            this.sortOperations();
        }

        @Watch("sortOrder")
        onSortOrderChange(val: string) {
            this.sortOperations();
        }

        @Watch("operationFilter")
        onOperationFilterChange(val: string,) {
            let filteredOperations: Array<Operation>;
            if (this.operationFilter === "all") {
                filteredOperations = this.originOperations;
            } else if (this.operationFilter === "planed") {
                filteredOperations = this.originOperations.filter(item => item.assessment === null);
            } else if (this.operationFilter === "done") {
                filteredOperations = this.originOperations.filter(item => item.assessment !== null);
            }
            this.operations = this.prepareOperationsData(filteredOperations);
            this.sortOperations();
        }

        // ---------- Lifecycle Hooks ----------
        created() {
            this.getOperations();
        }

        // ---------- Methods ----------
        sortOperations(): void {
            const coefficient: number = this.sortOrder === "asc" ? 1 : -1;

            if (this.tableHeaderController.getActiveColumnCode() === "date") {
                this.operations.sort((a, b) => {
                    if (moment(a.date, "DD MMM YYYY").isBefore(moment(b.date, "DD MMM YYYY"))) {
                        return 1 * coefficient;
                    } else if (moment(b.date, "DD MMM YYYY").isBefore(moment(a.date, "DD MMM YYYY"))) {
                        return -1 * coefficient;
                    }
                    return 0;
                });
            } else {
                this.operations.sort((a, b) => {
                    if (a[this.activeSortColumn] > b[this.activeSortColumn]) {
                        return 1 * coefficient;
                    } else if (a[this.activeSortColumn] < b[this.activeSortColumn]) {
                        return -1 * coefficient;
                    }
                    return 0;
                });
            }
        }

        headerClickHandler(columnCode: string): void {
            if (columnCode === this.tableHeaderController.getActiveColumnCode()) {
                this.tableHeaderController.changeSortOrder();
            } else {
                this.tableHeaderController.changeActiveColumn(columnCode);
            }
        }

        async getOperations(): void {
            const fieldService: FieldService = new FieldService();
            this.originOperations = await fieldService.getOperations();
            this.operations = this.prepareOperationsData(this.originOperations);
            this.sortOperations();
        }

        prepareOperationsData(operations: Array<Operation>): Array<Object> {
            return operations.map(item => {
                return {
                    id: item.id,
                    date: moment(item.date).format("DD MMM YYYY"),
                    operation: item.type,
                    operationLabel: this.operationLabel[item.type],
                    icon: wheat.icon,
                    kind: wheat.label,
                    assessment: item.assessment,
                    assessmentLabel: this.assessmentLabels[item.assessment] || "",
                };
            });
        }
    }
</script>

<style scoped lang="scss">
    @media (min-width: 600px) {
        .content {
            width: 870px;
            height: 100%;
            box-sizing: border-box;

            margin: 0 auto;
            padding: 15px;
            background: #FFFFFF;
            box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.20);

            .title {
                font-family: Helvetica, sans-serif;
                font-size: 25px;
                color: #333333;
                letter-spacing: -0.8px;
                line-height: 31px;
            }

            .toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;

                .filters {
                    margin: 10px 0 15px 0;

                    input[type=radio] {
                        display: none;
                    }

                    label {
                        text-transform: uppercase;
                        margin-right: 10px;

                        &:hover,
                        &:focus {
                            color: #74d4ed;
                        }


                        &.active {
                            color: #1c85ff;
                        }
                    }
                }

                .actions {

                    .btn-add {
                        height: 40px;
                        width: 175px;
                        border-radius: 20px;
                        font-family: Helvetica, sans-serif;
                        font-size: 13px;
                        color: #333333;
                        letter-spacing: -0.4px;
                        position: relative;
                        display: flex;
                        align-items: center;
                        outline: none;

                        &:focus, &:hover {
                            background: #74d4ed;
                        }

                        &:active {
                            background: #50abed;
                        }

                        .icon-add {
                            position: relative;
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            background-color: #2ad536;
                            border-radius: 50%;
                            margin-right: 10px;
                            margin-left: 5px;

                            &::before {
                                content: ' ';
                                top: 8px;
                                left: 4px;
                                display: inline-block;
                                position: absolute;
                                width: 12px;
                                height: 4px;
                                background-color: white;
                            }

                            &::after {
                                content: ' ';
                                top: 4px;
                                left: 8px;
                                display: inline-block;
                                position: absolute;
                                width: 4px;
                                height: 12px;
                                background-color: white;
                            }
                        }

                    }
                }
            }

            .operations-table {
                width: 100%;
                text-align: left;
                border-collapse: collapse;

                th, td {
                    height: 40px;
                    padding-left: 5px;
                    padding-right: 5px;
                }

                .kind {
                    span {
                    }

                    img {
                        vertical-align: middle;
                        margin-right: 5px;
                        width: 30px;
                        height: 27px;
                    }
                }

                thead tr {
                    position: relative;
                }

                th {
                    background: #EDEEEE;

                    i {
                        display: inline-block;
                        position: relative;
                        top: -1px;
                        margin-left: 3px;
                        width: 10px;
                        height: 5px;
                        background-image: url("~@img/sort-arrow.png");
                    }

                    &.active {
                        i {
                            background-image: url("~@img/sort-arrow-active.png");

                            &.desc {
                                transform: rotate(180deg);

                            }
                        }
                    }
                }

                td {
                    border-bottom: 1px solid rgba(128, 128, 128, .2);
                }
            }

            .visual-assessment {
                display: inline-block;
                width: 20px;
                height: 10px;
                border-radius: 10px;
                margin-right: 5px;

                &.green {
                    background-color: lightgreen;
                }

                &.yellow {
                    background-color: #f0f000;
                }

                &.red {
                    background-color: #ff383d;
                }
            }
        }
    }
</style>
