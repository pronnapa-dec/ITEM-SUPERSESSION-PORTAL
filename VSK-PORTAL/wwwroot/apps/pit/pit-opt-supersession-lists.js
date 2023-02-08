'use strict';


let fs = firebase.firestore();
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];

const url_api = "http://192.168.1.247/intranet/pur-api";
const url_api_uat = "http://localhost:49708";
//const url_api_uat = "http://192.168.1.247:8899/cn-branch-api";


const url_iss_detail_get = url_api_uat + '/v1/item_suppersession_Detail_Get';
const url_iss_hrad_get = url_api_uat + '/v1/item_suppersession_Head_Get';
const url_iss_create = url_api_uat + '/v1/item_suppersession_Create';
const url_iss_detail_create = url_api_uat + '/v1/item_suppersession_Detail_Create';
const url_iss_Update = url_api_uat + '/v1/item_suppersession_Update';
const url_iss_Delete = url_api_uat + '/v1/item_suppersession_Delete';
const url_iss_history_get = url_api_uat + '/v1/item_suppersession_history_Get';
//const url_salefile_get = url_api_uat + '/v1/salefile_get';
//const url_saletra_get = url_api_uat + '/v1/saletra_get';
//const url_cn_branch_pre_job_get = url_api_uat + '/v1/Cn_Branch_Pre_Job_Get';
//const url_cn_branch_pre_job_create = url_api_uat + '/v1/Cn_Branch_Pre_Job_Create';
//const Cn_Branch_Lov_Get = url_api_uat + '/v1/Cn_Branch_Lov_Get';
//const lists_get = url_api + '/v1/Cn_Pre_Job_Get';

let oTable = [];
let history_Table = []; //$('#tbl-list-history').DataTable({ "order": [[0, "desc"]], "pageLength": 50 });
let itemssTable = [];
let cn_pre_job_type_dataset = [];
let job_comment_dataSet = [];
let job_comment_dataSet_list = [];


firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            $('.fc-datepicker').datepicker({
                dateFormat: 'dd/mm/yy',
                autoclose: true,
            });

            $('.date-picker').daterangepicker({
                autoUpdateInput: false,
                showDropdowns: true,
                opens: "right",
                locale: { cancelLabel: 'Clear' },
            }, function (start, end, label) {
                //console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            });

            $('.date-picker').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + '-' + picker.endDate.format('DD/MM/YYYY'));
            });

            $('#ss_date').val(moment().format('DD/MM/YYYY') + '-' + moment().format('DD/MM/YYYY'))

            $.List();

            $.Select2Item('sku_list');

            $('#modal-frm_data').on('shown.bs.modal', function (e) {

                $(".nav-ss-item li").find("a").eq(0).trigger('click')

                $('#replace_item_ss').prop('disabled', true);
                $('#frm_data select, #frm_data input, #frm_data textarea').val('').trigger('change')

                $.Select2Item('sku'); //call select2 ที่ id sku
                //$.Select2Item('item_ss'); //call select2 ที่ Item Supersesstion
                $.Select2ItemHead('replace_item_ss'); //call select2 ที่ Item Supersesstion
                $('#sku').on('select2:select', function (e) {
                    var data = e.params.data;
                    //$.Checksku($(this).val());
                    $(this).attr({ 'data-spcode': data.spcode, 'data-name': data.name, 'data-gbarcode': data.gbarcode, 'data-type': data.type, 'data-record-id': data.record_id });
                    $('#replace_item_ss').removeAttr('disabled')
                    e.preventDefault();
                });

                $('#replace_item_ss').on('select2:select', function (e) {
                    var data = e.params.data;
                    //$.Checksku($(this).val());
                    $(this).attr({ 'data-spcode': data.spcode, 'data-name': data.name, 'data-gbarcode': data.gbarcode, 'data-type': data.type, 'data-record-id': data.record_id, 'data-supersession-id': data.supersession_id });


                    e.preventDefault();
                });

                $('#sku').val('').trigger('change');
                $('#item_ss').val('').trigger('change').prop('disabled', false);
                $('#remark').val('').prop('disabled', false);
                $('#is_item_ss').attr('checked', false);
                $('#create_date').val(moment().format('DD/MM/YYYY'))
                e.preventDefault();
            })

            $('#modal-detailSuperSession').on('shown.bs.modal', function (e) {
                e.preventDefault();

                $(".nav-ss-item").find("a").eq(0).trigger('click')
            })

            $('#modal-cte-detail').on('shown.bs.modal', function (e) {

                $('#frm_data_detail_create select, #frm_data_detail_create input, #frm_data_detail_create textarea').val('').trigger('change')

                $.Select2Item('detail_sku'); //call select2 ที่ id sku
                $.Select2ItemHead('item_ss_detail'); //call select2 ที่ Item Supersesstion

                $('#detail_sku').on('select2:select', function (e) {
                    var data_detail_sku = e.params.data;
                    //$.Checksku($(this).val());
                    $(this).attr({ 'data-spcode': data_detail_sku.spcode, 'data-name': data_detail_sku.name, 'data-gbarcode': data_detail_sku.gbarcode, 'data-type': data_detail_sku.type });
                    $('#item_ss_detail').removeAttr('disabled')
                    e.preventDefault();
                });


                $('#item_ss_detail').on('select2:select', function (e) {
                    var data = e.params.data;
                    $(this).attr({ 'data-spcode': data.spcode, 'data-name': data.name, 'data-gbarcode': data.gbarcode, 'data-type': data.type, 'data-record-id': data.record_id });
                    $('#detail_sku').removeAttr('disabled')
                    e.preventDefault();
                });



                $('#detail_sku').val('').trigger('change');
                $('#item_ss_detail').val('').trigger('change').prop('disabled', false);
                $('#detail_remark').val('').prop('disabled', false);
                $('#create_detail_date').val(moment().format('DD/MM/YYYY'));
                e.preventDefault();
            })


            $('.btn-save_form').on('click', function (e) {

                let citem = [];

                let action_status = $(this).attr('data-status');

                citem = {
                    save_action: $(this).attr('data-action'),
                    action_status: $(this).attr('data-status'),
                    sku: $('#sku').val(),
                    ss_sku: $('#sku').val(),
                    gbarcode: $('#sku').attr('data-gbarcode'),
                    spcode: $('#sku').attr('data-spcode'),
                    name: $('#sku').attr('data-name'),
                    type: $('#sku').attr('data-type'),
                    remark: $('#remark').val(),
                    is_itemsupersession: 'YES',
                    replace_itemsupersession: $('#replace_item_ss').val(),
                    record_id: $('#replace_item_ss').val() != '' ? $('#replace_item_ss').attr('data-record-id') : '',
                    record_status: 1,
                    created_by: user_id,
                    supersession_id: $('#replace_item_ss').val() != '' ? $('#replace_item_ss').attr('data-supersession-id') : ''

                };

                $.Create(citem);

                e.preventDefault();
            });

            $('.btn-save-form-detail').on('click', function (e) {

                let citem_detail = [];

                citem_detail = {
                    save_action: $(this).attr('data-action'),
                    action_status: $(this).attr('data-status'),
                    sku: $('#detail_sku').val(),
                    ss_sku: $('#item_ss_detail').val(),
                    gbarcode: $('#detail_sku').attr('data-gbarcode'),
                    spcode: $('#detail_sku').attr('data-spcode'),
                    name: $('#detail_sku').attr('data-name'),
                    type: $('#detail_sku').attr('data-type'),
                    remark: $('#detail_remark').val(),
                    record_id: $('#item_ss_detail').attr('data-record-id'),
                    record_status: 1,
                    created_by: user_id,

                };

                $.CreateDetail(citem_detail);

                e.preventDefault();
            });


            $("#frm_search").on("submit", function () {
                //Code: Action (like ajax...)
                $.List();
                //alert(1)
                return false;
            })

        };

        $.List = async function () {

            let get_data = {
                sku: $('#sku_list').val(),
                ss_sku: $('#ss_sku_search').val(),
                gbarcode: '',
                name: '',
                mode: 'Search',
                //    is_itemsupersession: 'YES',
                //    record_status: 1
            };

            var params = [];
            for (const i in get_data) {
                params.push(i + "=" + encodeURIComponent(get_data[i]));
            }

            fetch(url_iss_hrad_get + '?' + params.join("&")).then(function (response) {

                return response.json();

            }).then(function (result) {

                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    }, function (isConfirmed) {
                        if (isConfirmed) {

                            location.reload();

                        }
                    })


                } else {

                    oTable = $('#tbl-list').DataTable({
                        data: result.data,
                        //scrollX: true,
                        //scrollY: "410px",
                        scrollCollapse: true,
                        destroy: true,
                        paging: true,
                        pageLength: 100,
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>#</span>",
                                width: "7%",
                                class: "tx-center",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return meta.row + 1;
                                }
                            },
                            {
                                title: "<span style='font-size:11px;'>Item Supersession</span>",
                                width: "7%",
                                class: "tx-center",
                                data: 'ss_sku',
                                visible: false,
                                render: function (data, type, row, meta) {

                                    //return '<a id="sku-' + row.sku + '" data-toggle="modal" data-target="modal-detailSuperSession" onclick="$.ListItemsupersession(' + JSON.stringify(row) + ')"><span style="font-size:11px;">' + data + '</span></a>';
                                    return "<a id='sku-" + row.sku + "' data-toggle='modal' data-target='modal-detailSuperSession' onclick='$.ViewDetail(" + JSON.stringify(row) + ")'><span style='font-size:11px;'>" + data + "</span></a>";

                                }

                            },
                            {
                                title: "<span style='font-size:11px;'>sku</span>",
                                width: "7%",
                                class: "tx-center",
                                data: 'sku',
                                render: function (data, type, row, meta) {
                                    //return '<span style="font-size:11px;">' + data + '</span>';
                                    return "<a id='sku-" + row.sku + "' data-toggle='modal' data-target='modal-detailSuperSession' onclick='$.ViewDetail(" + JSON.stringify(row) + ")'><span style='font-size:11px;'>" + data + "</span></a>";

                                }

                            },
                            {
                                title: "<span style='font-size:11px;'>Rank</span>",
                                width: "7%",
                                class: "tx-center",
                                data: 'rank',
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }

                            },
                            {
                                title: "<div class='tx-center'><span  style='font-size:11px;'>Item Name</span></div>",
                                width: "12%",
                                class: "tx-left",
                                data: 'gbarcode',
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + ' : ' + row.name + '</span>';
                                }

                            },
                            {
                                title: "<span  style='font-size:11px;'>Type</span>",
                                width: "3%",
                                class: "tx-center",
                                data: 'type',
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }

                            },
                            {
                                title: "<div class='tx-center'><span  style='font-size:11px;'>Remark</span></div>",
                                width: "7%",
                                class: "tx-left",
                                data: 'remark',
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }

                            }],
                        order: [
                            [0, 'asc'],
                            //    [2, 'asc'],
                        ],

                        //"fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                        //    console.log('iDisplayIndex', iDisplayIndex)
                        //    if (aData['record_id'] == aData['record_id']) {
                        //        $('td', nRow).addClass('table-success');
                        //    } else {
                        //        $('td', nRow).addClass('table-warning');
                        //    }
                        //},

                        "initComplete": function (settings, json) {


                            //$("#tbl-list-book-taxnum tr  th #select-all").parents('th').removeClass('sorting_asc');

                            //// Handle click on "Select all" control
                            //$('#select-all').on('click', function () {
                            //    // Get all rows with search applied
                            //    var rows = oTable.rows({ 'search': 'applied' }).nodes();
                            //    // Check/uncheck checkboxes for all rows in the table
                            //    $('input[type="checkbox"]', rows).prop('checked', this.checked);
                            //});

                            //// Handle click on checkbox to set state of "Select all" control
                            //$('#tbl-list-book-taxnum tbody').on('change', 'input[type="checkbox"]', function () {
                            //    // If checkbox is not checked
                            //    if (!this.checked) {
                            //        var el = $('#select-all').get(0);
                            //        // If "Select all" control is checked and has 'indeterminate' property
                            //        if (el && el.checked && ('indeterminate' in el)) {
                            //            // Set visual state of "Select all" control
                            //            // as 'indeterminate'
                            //            el.indeterminate = true;
                            //        }
                            //    }
                            //});

                            // Handle form submission event
                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-list tbody tr',
                                callback: async function (key, options) {

                                    let data = oTable.row(this).data();

                                    let citem = data;

                                    if (key === 'view') {
                                        citem = {
                                            supersession_id: data['supersession_id'],
                                            sku: data['sku'],
                                            ss_sku: data['ss_sku'],
                                            rank: data['rank'],
                                            gbarcode: data['gbarcode'],
                                            spcode: data['spcode'],
                                            name: data['name'],
                                            type: data['type'],
                                            remark: data['remark'],
                                            created_by: data['created_by'],
                                            created_date: data['created_date'],
                                            updated_by: data['updated_by'],
                                            updated_date: data['updated_date'],
                                            record_status: data['record_status'],
                                            replace_itemsupersession: data['replace_itemsupersession'],
                                            record_id: data['record_id'],
                                            action_status: 'view'
                                        };

                                        $.ViewDetail(citem);
                                        //} else if (key === 'delete') {
                                        //    $.Delete(citem);
                                    } else {

                                        alert('ERROR');

                                    }

                                },

                                items: {

                                    "view": { name: "View", icon: "fas fa-search" },
                                    //    "edit": { name: "Edit", icon: "edit edit-detail" },
                                    //    "delete": { name: "Delete", icon: "delete delete-detail" },
                                }

                            });



                            $('#tbl-list tbody').off('click').on('click', 'td i.dt-control', function () {
                                var tr = $(this).closest('tr');
                                var row = oTable.row(tr);

                                //alert(row.child.isShown())
                                if (row.child.isShown()) {
                                    // This row is already open - close it
                                    row.child.hide();
                                    tr.removeClass('shown');
                                } else {
                                    // Open this row
                                    //let Tabletwo = Tabletwo(row.data())

                                    let data = row.data();

                                    var thead = '<tr class="table-primary">' + "<th class='tx-center border-bottom-0'>#</th>" +
                                        "<th class='border-bottom-0 tx-center'>SKU</th>" +
                                        "<th class='border-bottom-0 tx-center'>ITEM NAME</th>" +
                                        "<th class='border-bottom-0 tx-center'>TYPE</th>" +
                                        "<th class='border-bottom-0 tx-center'>REMARK</th>";

                                    fetch(url_iss_get + '?ss_sku=' + data.ss_sku + '&is_itemsupersession=NO' + '&mode=Search&record_status=1').then(function (response) {
                                        return response.json();
                                    }).then(function (result) {

                                        var tbody = '';

                                        $.each(result.data, function (key, val) {

                                            tbody += '<tr class="table-secondary">' +
                                                "<td class='tx-center'>" + (key + 1) + "</td>" +
                                                "<td>" + val.sku + "</td>" +
                                                "<td>" + val.ss_sku + "</td>" +
                                                "<td>" + val.type + "</td>" +
                                                "<td>" + val.remark + "</td>" +
                                                "</tr>";

                                            //    tbody += '<tr>' +
                                            //        '<td>ชื่อขนส่งเอกชน:</td>' +
                                            //        '<td>' + val.name + '</td>' +
                                            //        '</tr>' +
                                            //        '<tr>' +
                                            //        '<td>ชำระค่าขนส่ง:</td>' +
                                            //        '<td>' + val.lov_deliverycost_code + '</td>' +
                                            //        '</tr>' +
                                            //        '<tr>' +
                                            //        '<td>Zone:</td>' +
                                            //        '<td>' + val.lov_zone_code + '</td>' +
                                            //        '</tr>' +
                                            //        '<tr>' +
                                            //        '<td>พื้นที่:</td>' +
                                            //        '<td>' + val.lov_route_name + '</td>' +
                                            //        '</tr>' +
                                            //        '<tr>' +
                                            //        '<td>เรื่มต้น:</td>' +
                                            //        '<td>' + val.tdefault + '</td>' +
                                            //        '</tr>';

                                        })

                                        row.child('<div class="table-responsive"><table class="table table-bordered">' + thead + tbody + '</table></div>').show();
                                        tr.addClass('shown');
                                        //return '<table class="table text-md-nowrap">' + thead + tbody + '</table>'

                                        $('#tbl-list table').bind("contextmenu", function () {
                                            return false;
                                        });

                                    })
                                }
                            });


                        },


                    });



                    $("#global-loader").fadeOut("slow");

                }

            });

        };

        $.ViewDetail = async function (citem) {
            $('#modal-detailSuperSession').modal('show')
            $('.ss_sku_list').addClass('d-none');
            $('.btn-save').addClass('d-none');
            $('#item_supersession').removeClass('d-none');
            $.ListItemsupersession(citem);
            $.History(citem);

        }

        $.Edit = async function (citem) {
            $('#modal-detailSuperSession').modal('show')
            $('.ss_sku_list').removeClass('d-none');
            $('.btn-save').removeClass('d-none');
            $('#item_supersession').addClass('d-none');
            $.ListItemsupersession(citem);
            $.History(citem);

        }

        $.ListItemsupersession = async function (citem) {

            let item_supersession = citem.ss_sku + "  :  " + citem.name

            $('#item_supersession').text(item_supersession)

            let get_data = {
                sku: '',
                ss_sku: citem['ss_sku'],
                gbarcode: '',
                name: '',
                mode: 'Search',
                is_itemsupersession: '',
                record_status: 1
            };

            var params = [];
            for (const i in get_data) {
                params.push(i + "=" + encodeURIComponent(get_data[i]));
            }

            fetch(url_iss_detail_get + '?' + params.join("&")).then(function (response) {

                return response.json();

            }).then(function (result) {

                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    }, function (isConfirmed) {
                        if (isConfirmed) {

                            location.reload();

                        }
                    })


                } else {
                    $('#ss_sku_list option').remove();

                    $.each(result.data, function (key, val) {
                        $('#ss_sku_list').append(`<option value="${val.sku}"> ${val.sku + ": " + val.name} </option>`);
                    });

                    $('#ss_sku_list').val(citem['ss_sku']).trigger('change');

                    itemssTable = $('#tbl-itemsupersession').DataTable({
                        data: result.data,
                        autoWidth: false,
                        scrollCollapse: true,
                        destroy: true,
                        paging: false,
                        info: false,
                        pageLength: 20,
                        searching: false,

                        columns: [{
                            title: "<span style='font-size:11px;'>Item Supersession</span>",
                            width: "15%",
                            class: "tx-center primary",
                            data: 'ss_sku',
                            render: function (data, type, row, meta) {
                                let is_itemsupersession = row.is_itemsupersession == 'YES' ? '<i class="fas fa-check"></i>' : ''
                                return row.is_itemsupersession == 'YES' ? '<i class="fas fa-check"></i>' : '';
                            }

                        },
                        {
                            title: "<span style='font-size:11px;'>is_itemsupersession</span>",
                            width: "15%",
                            class: "tx-center is_ss",
                            data: 'is_itemsupersession',
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        },
                        {
                            title: "<span style='font-size:11px;'>sku</span>",
                            width: "15%",
                            class: "tx-center",
                            data: 'sku',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        },
                        {
                            title: "<div class='tx-center'><span  style='font-size:11px;'>Item Name</span></div>",
                            width: "20%",
                            class: "tx-left",
                            data: 'gbarcode',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + ' : ' + row.name + '</span>';
                            }

                        },
                        {
                            title: "<span  style='font-size:11px;'>Type</span>",
                            width: "5%",
                            class: "tx-center",
                            data: 'type',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        },
                        {
                            title: "<div class='tx-center'><span  style='font-size:11px;'>Remark</span></div>",
                            width: "15%",
                            class: "tx-left",
                            data: 'remark',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        },
                        {
                            title: "<span style='font-size:11px;'>Create Date</span>",
                            width: "20%",
                            class: "tx-center",
                            data: 'created_date',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY HH:mm') + '</span>';
                            }

                        }],

                        order: [
                            [0, 'desc'],
                            //    [2, 'asc'],
                        ],
                        //สี
                        //"fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                        //    console.log(aData)
                        //    if (aData['sku'] == aData['ss_sku']) {
                        //        $('td', nRow).addClass('table-success');
                        //    } else {
                        //        $('td', nRow).addClass('table-warning');
                        //    }
                        //},


                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-itemsupersession tbody tr',
                                callback: async function (key, options) {

                                    let data = itemssTable.row(this).data();

                                    let citem_detail = data;

                                    citem_detail = {
                                        supersession_id: data['supersession_id'],
                                        sku: data['sku'],
                                        ss_sku: data['ss_sku'],
                                        rank: data['rank'],
                                        gbarcode: data['gbarcode'],
                                        spcode: data['spcode'],
                                        name: data['name'],
                                        type: data['type'],
                                        remark: data['remark'],
                                        is_itemsupersession: data['is_itemsupersession'],
                                        created_by: data['created_by'],
                                        created_date: data['created_date'],
                                        updated_by: data['updated_by'],
                                        updated_date: data['updated_date'],
                                        record_status: data['record_status'],
                                        replace_itemsupersession: data['replace_itemsupersession'],
                                        record_id: data['record_id'],
                                        action_status: 'view'
                                    };


                                    if (key === 'edit') {

                                        $.EditPrimary(citem_detail)

                                    } else if (key === 'delete') {


                                    } else {

                                        alert('ERROR');

                                    }

                                },

                                items: {

                                    //"view": { name: "View", icon: "fas fa-search" },
                                    "edit": { name: "Edit", icon: "edit edit-detail-primary" },
                                    "delete": { name: "Delete", icon: "delete delete-detail-supersess" },
                                }

                            });


                        },


                    });

                    $("#tbl-itemsupersession tbody tr").contextmenu(function (e) {
                        e.preventDefault();
                        let detail_item = this;
                        let primary = $(this).find('.primary i').hasClass('fa-check') ? "Yes" : "No";
                        if (primary == 'Yes') {
                            $('.edit-detail-primary').removeClass('d-none');
                            $('.delete-detail-supersess').addClass('d-none');
                        } else {
                            $('.edit-detail-primary').addClass('d-none');
                            $('.delete-detail-supersess').removeClass('d-none');
                        }
                    });

                    $("#global-loader").fadeOut("slow");

                }

            });

        };

        $.Create = async function (citem) {

            $('#frm_data').parsley().validate();
            if ($('#frm_data').parsley().isValid()) {

                // do something here...

                $('.btn-save_form').prop('disabled', true);

                // Model & Repo ไปเปลี่ยนเอาเอง
                let add_data = {
                    sku: citem['sku'],
                    ss_sku: citem['ss_sku'],
                    gbarcode: citem['gbarcode'],
                    spcode: citem['spcode'],
                    name: citem['name'],
                    type: citem['type'],
                    remark: citem['remark'],
                    is_itemsupersession: citem['is_itemsupersession'],
                    replace_itemsupersession: citem['replace_itemsupersession'],
                    record_status: citem['record_status'],
                    created_by: citem['created_by'],
                    record_status: 1,
                    record_id: citem['record_id'],
                    //supersession_id: citem['supersession_id']

                };

                var params = [];
                for (const i in add_data) {
                    params.push(i + "=" + encodeURIComponent(add_data[i]));
                }

                fetch(url_iss_create, {
                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                    // mode: 'no-cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params.join("&"),
                }).then(data => {
                    return data.json();
                }).then(data => {

                    if (data.status === 'Error') {
                        toastr.error(data.error_message);
                    } else {
                        toastr.success('Save Successfully!', async function () {
                            $("#global-loader").fadeIn("slow");

                            $('#frm_data select, #frm_data input, #frm_data textarea').val('').trigger('change');
                            $('#item_ss').prop('disabled', false);
                            $('#is_item_ss').prop('checked', false);
                            $('.btn-save_form').prop('disabled', false);
                            $('#modal-frm_data').modal('hide');
                            $.List();
                        });

                        //swal({
                        //    position: 'top-end',
                        //    type: 'success',
                        //    title: 'Your work has been saved',
                        //    showConfirmButton: false,
                        //    timer: 1500
                        //}, function (isConfirmed) {
                        //    if (isConfirmed) {



                        //    }
                        //})
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.error('Error:', error);
                });

                return false;

            }

        };

        $.CreateDetail = async function (citem) {

            $('#frm_data_detail_create').parsley().validate();
            if ($('#frm_data_detail_create').parsley().isValid()) {

                // do something here...

                $('.btn-save_form').prop('disabled', true);

                // Model & Repo ไปเปลี่ยนเอาเอง
                let add_data = {
                    sku: citem['sku'],
                    ss_sku: citem['ss_sku'],
                    gbarcode: citem['gbarcode'],
                    spcode: citem['spcode'],
                    name: citem['name'],
                    type: citem['type'],
                    remark: citem['remark'],
                    is_itemsupersession: 'NO',
                    created_by: citem['created_by'],
                    record_status: 1,
                    record_id: citem['record_id'],

                };

                var params = [];
                for (const i in add_data) {
                    params.push(i + "=" + encodeURIComponent(add_data[i]));
                }

                fetch(url_iss_detail_create, {
                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                    // mode: 'no-cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params.join("&"),
                }).then(data => {
                    return data.json();
                }).then(data => {

                    if (data.status === 'Error') {
                        toastr.error(data.error_message);
                    } else {
                        toastr.success('Save Successfully!', async function () {
                            $("#global-loader").fadeIn("slow");

                            $('#frm_data_detail_create select, #frm_data_detail_create input, #frm_data_detail_create textarea').val('').trigger('change');
                            $('#detail_sku').prop('disabled', false);
                            $('.btn-save_form').prop('disabled', false);
                            $('#modal-cte-detail').modal('hide');
                            $.List();
                        });

                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.error('Error:', error);
                });

                return false;

            }

        };

        $.Update = async function (citem) {

            $('#frm_data').parsley().validate();
            if ($('#frm_data').parsley().isValid()) {

                // do something here...

                $('.btn-save_form').prop('disabled', true);

                // Model & Repo ไปเปลี่ยนเอาเอง
                let add_data = {
                    sku: citem['sku'],
                    ss_sku: citem['ss_sku'],
                    gbarcode: citem['gbarcode'],
                    spcode: citem['spcode'],
                    name: citem['name'],
                    type: citem['type'],
                    remark: citem['remark'],
                    is_itemsupersession: citem['is_itemsupersession'],
                    replace_itemsupersession: citem['replace_itemsupersession'],
                    record_id: citem['record_id'],
                    record_status: citem['record_status'],
                    created_by: citem['created_by']
                };

                var params = [];
                for (const i in add_data) {
                    params.push(i + "=" + encodeURIComponent(add_data[i]));
                }

                fetch(url_iss_Update, {
                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                    // mode: 'no-cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params.join("&"),
                }).then(data => {
                    return data.json();
                }).then(data => {

                    if (data.status === 'Error') {
                        toastr.error(data.error_message);
                    } else {

                        toastr.success('Save Successfully!', async function () {
                            $('#frm_data select, #frm_data input, #frm_data textarea').val('').trigger('change');
                            $('#item_ss').prop('disabled', false);
                            $('#is_item_ss').prop('checked', false);

                            if (citem['save_action'] == 'save_exit') {
                                $('#modal-frm_data').modal('hide');
                                //swal("Good job!", "You clicked the button!", "success")
                                swal({
                                    position: 'top-end',
                                    type: 'success',
                                    title: 'Your work has been saved',
                                    showConfirmButton: false,
                                    timer: 1500
                                })
                            } else {
                                $('#create_date').val(moment().format('DD/MM/YYYY'))
                            }

                        });
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.error('Error:', error);
                });

                return false;

            }

        };

        $.History = async function (citem) {


            let get_data = {
                mode: 'Search',
                is_itemsupersession: 'YES',
                record_id: citem['record_id']
            };

            var params = [];
            for (const i in get_data) {
                params.push(i + "=" + encodeURIComponent(get_data[i]));
            }

            fetch(url_iss_history_get + '?' + params.join("&")).then(function (response) {

                return response.json();

            }).then(function (result) {

                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    }, function (isConfirmed) {
                        if (isConfirmed) {

                            location.reload();

                        }
                    })


                } else {

                    history_Table = $('#tbl-item-history').DataTable({
                        data: result.data,
                        autoWidth: false,
                        scrollCollapse: true,
                        destroy: true,
                        paging: false,
                        info: false,
                        pageLength: 20,
                        searching: false,
                        columns: [{
                            title: "<span style='font-size:11px;'>Item Supersession</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'ss_sku',
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }, //0
                        {
                            title: "<span style='font-size:11px;'>Item Supersession</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'ss_sku',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }, //1
                        {
                            title: "<span style='font-size:11px;'>sku</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'sku',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }, //2
                        {
                            title: "<span style='font-size:11px;'>Rank</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'rank',
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }, //3
                        {
                            title: "<div class='tx-center'><span  style='font-size:11px;'>Item Name</span></div>",
                            width: "10%",
                            class: "tx-left",
                            data: 'gbarcode',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + ' : ' + row.name + '</span>';
                            }

                        }, //4
                        {
                            title: "<span  style='font-size:11px;'>Type</span>",
                            width: "3%",
                            class: "tx-center",
                            data: 'type',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }, //5
                        {
                            title: "<div class='tx-center'><span  style='font-size:11px;'>Remark</span></div>",
                            width: "7%",
                            class: "tx-left",
                            data: 'remark',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data != null ? data : '' + '</span>';
                            }

                        }, //6
                        {
                            title: "<span  style='font-size:11px;'>Create Date</span>",
                            width: "5%",
                            targets: 7,
                            class: "tx-center",
                            data: 'created_date',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY HH:mm') + '</span>';
                            }

                        }, //7
                        ],
                        order: [
                            [7, 'desc'],
                        ],
                        //orderClasses: false,
                        //"fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                        //    if (aData['ss_sku'] == aData['sku']) {
                        //        $('td', nRow).addClass('table-success');
                        //    } else {
                        //        $('td', nRow).addClass('table-white');
                        //    }
                        //},
                    });


                    $("#global-loader").fadeOut("slow");

                }

            });



        }

        $.Select2Item = function (elm_id) {

            $('#' + elm_id).select2({
                //tags: true,
                //width: '90%',
                height: '40px',

                ajax: {
                    url: url_api_uat + '/v1/item_suppersession_item_Get',
                    dataType: 'json',
                    //width: 'resolve',/
                    dropdownAutoWidth: true,
                    minimumInputLength: 2,
                    minimumResultsForSearch: 50,
                    data: function (params) {
                        var query = {
                            item_master: typeof params.term !== 'undefined' ? params.term : ''
                        }
                        //console.log(params);
                        return query;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (resulte, search) {
                        return {
                            results: $.map(resulte.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.code,
                                    spcode: item.SPCODES,
                                    name: item.name,
                                    gbarcode: item.gbarcode,
                                    type: item.type,
                                    record_id: item.record_id
                                }
                            })
                        };
                    },
                    cache: true
                }

            });


        }

        $.Select2ItemHead = function (elm_id) {

            $('#' + elm_id).select2({
                //tags: true,
                //width: '90%',
                height: '40px',

                ajax: {
                    url: url_api_uat + '/v1/item_suppersession_Head_item_Get',
                    dataType: 'json',
                    //width: 'resolve',/
                    dropdownAutoWidth: true,
                    minimumInputLength: 2,
                    minimumResultsForSearch: 50,
                    data: function (params) {
                        var query = {
                            item_master: typeof params.term !== 'undefined' ? params.term : ''
                        }
                        //console.log(params);
                        return query;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (resulte, search) {
                        return {
                            results: $.map(resulte.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.code,
                                    spcode: item.SPCODES,
                                    name: item.name,
                                    gbarcode: item.gbarcode,
                                    type: item.type,
                                    record_id: item.record_id,
                                    supersession_id: item.supersession_id
                                }
                            })
                        };
                    },
                    cache: true
                }

            });


        }

        $.Checksku = async function (sku) {


            let get_data = {
                sku: sku,
                mode: 'Search'
            };

            var params = [];
            for (const i in get_data) {
                params.push(i + "=" + encodeURIComponent(get_data[i]));
            }

            fetch(url_iss_get + '?' + params.join("&")).then(function (response) {

                return response.json();

            }).then(function (result) {

                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    }, function (isConfirmed) {
                        if (isConfirmed) {

                            location.reload();

                        }
                    })


                } else {

                    if (result.length > 0) {

                        swal({
                            title: "ข้อมูลซ้ำ!",
                            text: "กรุณาค้นหา SKU เพื่อแก้ไข!",
                            type: "warning",
                            button: "OK!",
                        }, function (isConfirmed) {
                            if (isConfirmed) {

                                location.reload();

                            }
                        })


                    }

                }

            });

            return false;

        };

        $.Details = async function (citem) {
            $('#modal-frm_data').modal({

                keyboard: false,
                backdrop: 'static'

            });

            $('#frm_data').find('input, select, textarea').prop('disabled', true)
            $('.btn-save_form').addClass('d-none')

            $('#sku').val(citem['sku']);
            $('#item_ss').val(citem['ss_sku']);
            $('#create_date').val(moment(citem['created_date']).format('DD/MM/YYYY'));
            $('#remark').val(citem['remark']);

            if (citem['sku'] === citem['ss_sku']) {
                $('#is_item_ss').prop('checked', true);

                $('#sku').append("<option selected value='" + citem['sku'] + "'>" + citem['sku'] + ' - ' + citem['name'] + "</option>");
                $('[name="item_ss"]').append("<option selected value='" + citem['ss_sku'] + "'>" + citem['ss_sku'] + "</option>").prop('disabled', true);
            } else {
                $('#is_item_ss').prop('checked', false);
            }

        }

        $.EditPrimary = async function (citem) {

            console.log('edit_primary', citem);

            //if (citem['action_status'] === 'edit_primary') {

            //}
        };

        $.Delete = async function (citem) {
            swal({
                title: "Are you sure?",
                text: "คุณยืนยันที่จะลบ Itemsupersesion นี้หรือไม่!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
                function (isConfirmed) {
                    if (isConfirmed) {
                        let add_data = {
                            sku: $('#sku').val(),
                            ss_sku: $('#item_ss').val(),
                            gbarcode: $('#sku').attr('data-gbarcode'),
                            spcode: $('#sku').attr('data-spcode'),
                            name: $('#sku').attr('data-name'),
                            type: $('#sku').attr('data-type'),
                            remark: $('#remark').val(),
                            record_status: 1,
                            created_by: user_id
                        };

                        var params = [];
                        for (const i in add_data) {
                            params.push(i + "=" + encodeURIComponent(add_data[i]));
                        }

                        fetch(url_iss_Update, {
                            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                            // mode: 'no-cors', // no-cors, *cors, same-origin
                            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                            credentials: 'same-origin', // include, *same-origin, omit
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: params.join("&"),
                        }).then(data => {
                            return data.json();
                        }).then(data => {

                            if (data.status === 'Error') {
                                toastr.error(data.error_message);

                            } else {

                                toastr.success('Save Successfully!', async function () {

                                    $('#frm_data select, #frm_data input, #frm_data textarea').val('').trigger('change');
                                    $('#item_ss').prop('disabled', false);
                                    $.List();

                                });
                            }

                        }).catch((error) => {
                            toastr.error(error, 'Error writing document');
                            console.error('Error:', error);
                        });

                        return false;

                        swal("Deleted!", "Your Itemsupersesion has been deleted.", "success");

                    }

                });
        }


        $(document).ready(async function () {

            await $("#global-loader").css('opacity', '0.5').fadeIn("slow");
            await $.init();


        });


    } else {

        window.location.assign('./login');

    }

});