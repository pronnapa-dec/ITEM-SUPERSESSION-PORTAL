'use strict';

//const api_url = 'http://localhost:49705';
const api_url = 'http://192.168.1.247:8082/mrp-api';
const product_purplan_get = api_url + '/v1/MRP_ItemMaster_Get';
const url_mrp_itemsetup_get = api_url + '/v1/MRP_ItemSetup_Get';
const url_mrp_itemMaster_update = api_url + '/v1/MRP_ItemMaster_Update'
const url_mrp_itemMaster_vsk_sync = api_url + '/v1/MRP_ItemMaster_VSK_Sync'
const objProfile = JSON.parse(localStorage.getItem('objProfile'));
//const urlParams = new URLSearchParams(queryString);

let fs = firebase.firestore();
let collection = 'mrp_opt_itemsetup';
let oTable;
let item_data = [];

let customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'

    },
    "text": 'Please Wait...'
});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            await $.List();
            //await $.MRP_Source_Site_Get();
            await $.MRP_Desination_Site_Get();
            await $.MRP_Formula_Get();
            await $.MRP_ItemMaster_Search();
            await $.Search();

            await $('#frm_search').find('#search_source_site_code').val('201 : VSK - Minburi');

            await $('#btn-item_create').click(async function (e) {

                e.preventDefault();

                $.LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                $('#modal-frm_data').on('shown.bs.modal', async function () {

                    await $.Create();
                    await setTimeout(function () {
                        $.LoadingOverlay("hide");
                    }, 300);

                })

            });

            await $('#modal-frm_data').on('hidden.bs.modal', function () {

                $('#frm_data').find('input').val('');
                $('#frm_data').find('#item_barcode').prop('disabled', true);
                $('#frm_data').find('select').val('').trigger('change.select2');

                $("#frm_data").parsley().reset();

            });

            await $('#btn-refresh').off('click').on('click', function (e) {

                e.preventDefault();

                Swal.fire({
                    title: 'Are you sure?',
                    text: "Want to Synchronize from VSM Data ?!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, Synchronize!'
                }).then((result) => {

                    if (result.isConfirmed) {

                        $.LoadingOverlay("show", {
                            image: '',
                            custom: customElement
                        });

                        fetch(url_mrp_itemMaster_vsk_sync).then(function (response) {
                            return response.json();
                        }).then(function (result) {
                            $.LoadingOverlay("hide")
                        });
                    }

                })

            })

        };

        $.Search = async function () {

            console.log('Search function Start', new Date());

            $('#btn-search').on('click', async function (e) {

                e.preventDefault();

                $.LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                await oTable.destroy();

                await $.List('search');

            });

        }

        $.List = async function (search) {

            console.log('List function Start', new Date());

            let url = new URL(url_mrp_itemsetup_get);

            url.search = new URLSearchParams({
                mode: search,
                barcode: $('#search_itemmaster').val(),
                StockStatus: $('#search_stock_status').val(),
                source_site_code: $('#search_source_site_code').val() === '' ? '' : $('#search_source_site_code').val(),
                destination_site_code: $('#search_destination_site_code').val() === '' ? '' : $('#search_destination_site_code').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                oTable = $('#tbl-list').DataTable({
                    data: result.data,
                    //scrollY: "450px",
                    scrollX: true,
                    deferRender: true,
                    //scrollCollapse: true,
                    autoWidth: true,
                    //paging: false,
                    paging: true,
                    dom: 'Bfrtip',
                    colReorder: true,
                    //stateSave: true,
                    /*fixedColumns: {
                        leftColumns: 6,
                        rightColumns: 1
                    },*/
                    lengthMenu: [
                        [10, 25, 50, -1],
                        ['10 rows', '25 rows', '50 rows', 'Show all']
                    ],
                    buttons: [
                        'copyHtml5',
                        // 'excelHtml5',
                        {
                            extend: 'excelHtml5',
                            exportOptions: {
                                modifier: {
                                    order: 'current',
                                    page: 'all',
                                    search: 'none'
                                },
                                columns: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
                            },
                        },
                        'csvHtml5',
                        'pdfHtml5',
                        'print',
                    ],
                    columns: [
                        {
                            title: "ID",
                            data: "trand_id",
                            visible: false,
                            searchable: false
                        },//0
                        {
                            title: "Item Name",
                            data: "itemname",
                            width: "250px",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;  color:DarkGreen;">' + row.code + '</span>' + '</br >' + '<span style="font-size:11px;  color:OrangeRed;">' + row.spcodes + '</span>' + ' / ' + '<span style="font-size:11px; color:DodgerBlue;">' + row.barcode + '</span>' + '</br >' + '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//0
                        {
                            title: "Item Code",
                            data: "code",
                            visible: false,
                        },//1
                        {
                            title: "Item Name",
                            data: "itemname",
                            visible: false,
                        },//2


                        {
                            title: "UOM",
                            class: "tx-center",
                            data: "item_uom",
                        },//4
                        {
                            title: "Transfer Qty Required",
                            class: "tx-center",
                            render: function (data, type, row, meta) {

                                var MRP_MINMAX_MAIN = "";

                                if (row.StockStatus == 'BACKLOG') {

                                    MRP_MINMAX_MAIN = 0;

                                } else {

                                    if (row.destination_site_code === '202 : VSK - Suwintawong') {
                                        MRP_MINMAX_MAIN = $.MRP_MINMAX_MAIN(row.MinQty_VSF, row.MaxQty_VSF, row.Onhand_VSF, row.item_pending_po, row.PackCodeRounding);
                                    } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {
                                        MRP_MINMAX_MAIN = $.MRP_MINMAX_MAIN(row.MinQty_LKS, row.MaxQty_LKS, row.Onhand_LKS, row.item_pending_po, row.PackCodeRounding);
                                    } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {
                                        MRP_MINMAX_MAIN = $.MRP_MINMAX_MAIN(row.MinQty_KLH, row.MaxQty_KLH, row.Onhand_KLH, row.item_pending_po, row.PackCodeRounding);
                                    } else if (row.destination_site_code === '213 : SPP - Lamlukka') {
                                        MRP_MINMAX_MAIN = $.MRP_MINMAX_MAIN(row.MinQty_LLK, row.MaxQty_LLK, row.Onhand_LLK, row.item_pending_po, row.PackCodeRounding);
                                    } else if (row.destination_site_code === '214 : SPP - Nawamin') {
                                        //Onhand = row.Onhand_NWM
                                        MRP_MINMAX_MAIN = $.MRP_MINMAX_MAIN(row.MinQty_NWM, row.MaxQty_NWM, row.Onhand_NWM, row.item_pending_po, row.PackCodeRounding);
                                    } else {
                                        MRP_MINMAX_MAIN = '-'
                                    }
                                }

                                return MRP_MINMAX_MAIN;
                            }
                        },//5
                        {
                            title: "GCOST",
                            class: "tx-center",
                            data: "item_gcost",
                        },//7
                        {
                            title: "ZONE",
                            data: 'item_WH',
                            class: "tx-center",
                            width: "80px"
                        },//19
                        /*
                        {
                            title: "Chemical Flag",
                            data: 'item_chem_flag',
                            class: "tx-center",
                            width: "80px",
                        	
                            render: function (data, type, row, meta) {


                                if (data == 'Chemical') {
                                    return '1'
                                } else {
                                    return '0'
                                }
                            }
                        	
                        },//19
                        */
                        {
                            title: "Code 1",
                            data: 'code1_gnamechr',
                            class: "tx-center",
                            width: "80px"
                        },//19

                        {
                            title: "SPCODE",
                            data: "spcodes",
                            visible: false,
                        },//3
                        {
                            title: "Barcode",
                            data: "barcode",
                            visible: false,
                        },//6

                        {
                            title: "Source Site",
                            width: "150px",
                            data: 'source_site_code',
                        },//8
                        {
                            title: "Destination Site",
                            width: "150px",
                            data: 'destination_site_code',
                        },//9
                        {
                            title: "Source Site Stock Status",
                            data: 'StockStatus',
                        },//10
                        {
                            title: "Replenish Status",
                            data: 'ReplenishStatus',
                        },//10
                        /*
                        {
                            title: "Destination Site Stock Status",
                            data: 'StockStatus',
                            render: function (data, type, row, meta) {

                                var sitesetting = "";

                                if (row.destination_site_code === '202 : VSK - Suwintawong') {
                                    sitesetting = row.StockStatus_VSF
                                } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {
                                    sitesetting = row.StockStatus_LKS
                                } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {
                                    sitesetting = row.StockStatus_KLH
                                } else if (row.destination_site_code === '213 : SPP - Lamlukka') {
                                    sitesetting = row.StockStatus_LLK
                                } else if (row.destination_site_code === '214 : SPP - Nawamin') {
                                    sitesetting = row.StockStatus_NWM
                                }

                                return sitesetting;
                            }
                        },//11
                        */
                        {
                            title: "Min",
                            width: "70px",
                            class: "tx-center",
                            searchable: false,
                            render: function (data, type, row, meta) {

                                var item_min_qty = "";


                                if (row.destination_site_code === '202 : VSK - Suwintawong') {
                                    item_min_qty = row.MinQty_VSF

                                } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {
                                    item_min_qty = row.MinQty_LKS

                                } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {
                                    item_min_qty = row.MinQty_KLH

                                } else if (row.destination_site_code === '213 : SPP - Lamlukka') {
                                    item_min_qty = row.MinQty_LLK

                                } else if (row.destination_site_code === '214 : SPP - Nawamin') {
                                    item_min_qty = row.MinQty_NWM

                                }

                                return item_min_qty;

                            }
                        },//12
                        {
                            title: "Max",
                            width: "70px",
                            class: "tx-center",
                            searchable: false,
                            render: function (data, type, row, meta) {


                                var item_max_qty = "";

                                if (row.destination_site_code === '202 : VSK - Suwintawong') {

                                    item_max_qty = row.MaxQty_VSF
                                } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {

                                    item_max_qty = row.MaxQty_LKS
                                } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {

                                    item_max_qty = row.MaxQty_KLH
                                } else if (row.destination_site_code === '213 : SPP - Lamlukka') {

                                    item_max_qty = row.MaxQty_LLK
                                } else if (row.destination_site_code === '214 : SPP - Nawamin') {

                                    item_max_qty = row.MaxQty_NWM
                                }

                                return item_max_qty

                            }
                        },//13
                        {
                            title: "VSM SOH",
                            class: "tx-center",
                            data: 'item_soh_vsm'
                        },//14
                        {
                            title: "SOH Destination",
                            class: "tx-center",
                            width: "70px",
                            searchable: false,
                            render: function (data, type, row, meta) {

                                var Onhand = "";

                                if (row.destination_site_code === '202 : VSK - Suwintawong') {
                                    Onhand = row.Onhand_VSF
                                } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {
                                    Onhand = row.Onhand_LKS
                                } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {
                                    Onhand = row.Onhand_KLH
                                } else if (row.destination_site_code === '213 : SPP - Lamlukka') {
                                    Onhand = row.Onhand_LLK
                                } else if (row.destination_site_code === '214 : SPP - Nawamin') {
                                    Onhand = row.Onhand_NWM

                                } else {
                                    Onhand = '-'
                                }

                                return Onhand;

                            }
                        },//15
                        {
                            title: "Pending PO",
                            data: 'item_pending_po',
                            class: "tx-center",
                            width: "120px",
                            searchable: false,
                        },//16
                        {
                            title: "Transit QTY",
                            data: 'item_transit_qty',
                            class: "tx-center",
                            width: "120px",
                            searchable: false,
                        },//16
                        {
                            title: "Pack Code Rounding",
                            data: 'PackCodeRounding',
                            class: "tx-center",
                            width: "60px",
                            searchable: false,
                        },//17
                        {
                            title: "Backlog Ctrl",
                            class: "tx-center",
                            width: "60px",
                            searchable: false,
                            render: function (data, type, row, meta) {
                                if (row.StockStatus == 'BACKLOG') {
                                    return 'Y'
                                } else {
                                    return 'N'
                                }

                            }
                        },//18
                        {
                            title: "Formula",
                            data: 'item_formula',
                            class: "tx-center",
                            width: "80px"
                        },//19
                        {
                            title: "Good Seller Flag",
                            class: "tx-center",
                            width: "120px",
                            render: function (data, type, row, meta) {

                                var GoodSellerFlag = "";

                                if (row.destination_site_code === '202 : VSK - Suwintawong') {
                                    GoodSellerFlag = row.GoodSellerFlag_VSF
                                } else if (row.destination_site_code === '211 : SPP - Liab Klong Song') {
                                    GoodSellerFlag = row.GoodSellerFlag_LKS
                                } else if (row.destination_site_code === '212 : SPP - Khlong Luang') {
                                    GoodSellerFlag = row.GoodSellerFlag_KLH
                                } else if (row.destination_site_code === '213 : SPP - Lamlukka') {
                                    GoodSellerFlag = row.GoodSellerFlag_LLK
                                } else if (row.destination_site_code === '214 : SPP - Nawamin') {
                                    //Onhand = row.Onhand_NWM
                                    GoodSellerFlag = row.GoodSellerFlag_NWM
                                } else {
                                    GoodSellerFlag = '-'
                                }

                                return GoodSellerFlag;
                            }
                        },//20
                        {
                            title: "Remark",
                            data: 'site_remark',
                            width: "200px",
                        },//20
                        {
                            title: "Replenish Status",
                            data: 'ReplenishStatus',
                            width: "80px",
                        },//20
                    ],
                    //"order": [[21, "asc"]],
                    "rowCallback": function (row, data) {


                    },
                    "initComplete": function (settings, json) {

                        let $buttons = $('.dt-buttons').hide();

                        $('.btn-tbl_export').on('click', function (e) {

                            e.preventDefault();

                            let btnClass = '.buttons-' + $(this).data('export')

                            $buttons.find(btnClass).click();
                        });

                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let citem = oTable.row(this).data();

                                if (key === 'view') {

                                    $.Details(citem);

                                } else if (key === 'edit') {

                                    await $.Details(citem);
                                    await $.Edit(citem);

                                } else {

                                    alert('ERROR');

                                }

                            },
                            items: {
                                "view": { name: "View", icon: "fas fa-search" },
                                "edit": { name: "Edit", icon: "edit" },
                            }

                        });

                        $.LoadingOverlay("hide")

                    },
                    "drawCallback": function (settings) {

                    }
                });

            });

        };

        $.Create = async function () {

            $('.btn-save_form').show();
            $('.btn-save_form').prop('disabled', false);
            $('#btn-save_exit').html('Save');
            $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

            $.MRP_ItemMaster_Search();

            $('#frm_data').find('#lead_time').val('3');

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    // Insert to firebase
                    fs.collection(collection).doc(item_data.trand_id).set(item_data).then(function () {

                        toastr.options = {
                            "closeButton": false, // true/false
                            "debug": false, // true/false
                            "newestOnTop": false, // true/false
                            "progressBar": true, // true/false
                            "preventDuplicates": false,
                            "onclick": null,
                            "showDuration": "300", // in milliseconds
                            "hideDuration": "500", // in milliseconds
                            "timeOut": "900", // in milliseconds
                            "extendedTimeOut": "900", // in milliseconds
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        };

                        toastr.success('Save Successfully!', function () {

                            setTimeout(function () {

                                oTable.destroy();
                                $.List();

                                $("#frm_data").parsley().reset();

                                item_data = [];

                                if (submit_action === "save_exit") {

                                    $('.btn-save_form').prop('disabled', false);
                                    $('#modal-frm_data').modal('hide');

                                } else if (submit_action === "save_new") {


                                    $('.record_status').eq(1).prop('checked', true);

                                    $('.btn-save_form').prop('disabled', false);

                                } else {

                                    toastr.error('Error writing document');

                                }

                            }, 1000);

                            //$.addLogEvent(collection);

                        });

                    }).catch(function (error) {

                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $.Details = async function (citem) {

            console.log('Detail citem', citem)
            $('#btn-save_exit').addClass('d-none');

            await $('#modal-frm_data').modal({

                keyboard: false,
                backdrop: 'static'

            });

            $('#frm_data').find('#source_site_code').val(citem['source_site_code']).prop('disabled', true);
            $('#frm_data').find('#destination_site_code').val(citem['destination_site_code']).prop('disabled', true);
            $('#frm_data').find('#item_barcode').append('<option value="' + citem['barcode'] + '" selected>' + citem['barcode'] + '-' + citem['itemname'] + '(' + citem['spcodes'] + ')' + '</option>');
            $('#frm_data').find('#PackCodeRounding').val(citem['PackCodeRounding']).prop('disabled', true);
            $('#frm_data').find('#Onhand').val(citem['Onhand_KLH']).prop('disabled', true);
            $('#frm_data').find('#PackCodeRounding').val(citem['PackCodeRounding']).prop('disabled', true);
            $('#frm_data').find('#item_pending_po').val(citem['item_pending_po']).prop('disabled', true);
            $('#frm_data').find('#lead_time').val(citem['LeadTimeItem']).prop('disabled', true);
            $('#frm_data').find('#ManualSafetyStockQty').val(citem['ManualSafetyStockQty']).prop('disabled', true);
            $('#frm_data').find('#StockStatus').val(citem['StockStatus']).prop('disabled', true);

            if (citem['destination_site_code'] === '212 : SPP - Khlong Luang') {

                $('#frm_data').find('#item_status_site_setting').val(citem['StockStatus_KLH']).prop('disabled', true);
                $('#frm_data').find('#MinQty').val(citem['MinQty_KLH']).prop('disabled', true);
                $('#frm_data').find('#MaxQty').val(citem['MaxQty_KLH']).prop('disabled', true);
                $('#frm_data').find('#item_result_final').val($.MRP_MINMAX_MAIN(citem['MinQty_KLH'], citem['MaxQty_KLH'], citem['Onhand_KLH'], citem['item_pending_po'], citem['PackCodeRounding'])).prop('disabled', true);
                $('#frm_data').find('#item_goodsalesflag').val(citem['GoodSellerFlag_KLH']).prop('disabled', true);

            } else if (citem['destination_site_code'] === '213 : SPP - Lamlukka') {

                $('#frm_data').find('#item_status_site_setting').val(citem['StockStatus_LLK']).prop('disabled', true);
                $('#frm_data').find('#MinQty').val(citem['MinQty_LLK']).prop('disabled', true);
                $('#frm_data').find('#MaxQty').val(citem['MaxQty_LLK']).prop('disabled', true);
                $('#frm_data').find('#item_result_final').val($.MRP_MINMAX_MAIN(citem['MinQty_LLK'], citem['MaxQty_LLK'], citem['Onhand_LLK'], citem['item_pending_po'], citem['PackCodeRounding'])).prop('disabled', true);
                $('#frm_data').find('#item_goodsalesflag').val(citem['GoodSellerFlag_LLK']).prop('disabled', true);

            } else if (citem['destination_site_code'] === '211 : SPP - Liab Klong Song') {

                $('#frm_data').find('#item_status_site_setting').val(citem['StockStatus_KLH']).prop('disabled', true);
                $('#frm_data').find('#MinQty').val(citem['MinQty_LKS']).prop('disabled', true);
                $('#frm_data').find('#MaxQty').val(citem['MaxQty_LKS']).prop('disabled', true);
                $('#frm_data').find('#item_result_final').val($.MRP_MINMAX_MAIN(citem['MinQty_LKS'], citem['MaxQty_LKS'], citem['Onhand_LKS'], citem['item_pending_po'], citem['PackCodeRounding'])).prop('disabled', true);
                $('#frm_data').find('#item_goodsalesflag').val(citem['GoodSellerFlag_LKS']).prop('disabled', true);

            } else if (citem['destination_site_code'] === '214 : SPP - Nawamin') {

                $('#frm_data').find('#item_status_site_setting').val(citem['StockStatus_KLH']).prop('disabled', true);
                $('#frm_data').find('#MinQty').val(citem['MinQty_KLH']).prop('disabled', true);
                $('#frm_data').find('#MaxQty').val(citem['MaxQty_KLH']).prop('disabled', true);
                $('#frm_data').find('#item_result_final').val($.MRP_MINMAX_MAIN(citem['MinQty_KLH'], citem['MaxQty_KLH'], citem['Onhand_KLH'], citem['item_pending_po'], citem['PackCodeRounding'])).prop('disabled', true);
                $('#frm_data').find('#item_goodsalesflag').val(citem['GoodSellerFlag_KLH']).prop('disabled', true);

            }

            $('#frm_data').find('#item_reorder_point').val(citem['item_reorder_point']).prop('disabled', true);
            $('#frm_data').find('#item_reorder_qty').val(citem['item_reorder_qty']).prop('disabled', true);
            $('#frm_data').find('#item_result_final').val(citem['item_result_final']).prop('disabled', true);
            $('#frm_data').find('#item_reorder_qty').val(citem['item_reorder_qty']).prop('disabled', true);
            $('#frm_data').find('#site_remark').val(citem['site_remark']).prop('disabled', true);


            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await $.LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                await oTable.destroy();

                await $.List('search');

                await $.LoadingOverlay("hide")

            })


        };

        $.Edit = async function (citem) {

            $('#frm_data').find('#source_site_code').prop('disabled', true);
            $('#frm_data').find('#destination_site_code').prop('disabled', true);
            $('#frm_data').find('#item_barcode').prop('disabled', true);
            $('#frm_data').find('#Onhand').prop('disabled', true);
            $('#frm_data').find('#PackCodeRounding').prop('disabled', true);
            $('#frm_data').find('#item_pending_po').prop('disabled', true);
            $('#frm_data').find('#lead_time').prop('disabled', true);
            $('#frm_data').find('#ManualSafetyStockQty').prop('disabled', true);
            $('#frm_data').find('#StockStatus').prop('disabled', true);
            $('#frm_data').find('#item_status_site_setting').prop('disabled', true);
            $('#frm_data').find('#MinQty').prop('disabled', false);
            $('#frm_data').find('#MaxQty').prop('disabled', false);
            $('#frm_data').find('#item_reorder_point').prop('disabled', true);
            $('#frm_data').find('#item_reorder_qty').prop('disabled', true);
            $('#frm_data').find('#item_result_final').prop('disabled', true);
            $('#frm_data').find('#item_reorder_qty').prop('disabled', true);
            $('#frm_data').find('#item_result_final').prop('disabled', true);
            $('#frm_data').find('#item_goodsalesflag').prop('disabled', true);
            $('#frm_data').find('#site_remark').prop('disabled', false);

            $('#btn-save_exit').removeClass('d-none');
            $('#btn-save_exit').off('click').on('click', function (e) {

                var full_mail = user.email;
                var name = full_mail.replace("@vskautoparts.com", "");

                e.preventDefault

                let update_data = {
                    code: citem['code'],
                    MaxQty_KLH: $('#frm_data').find('#MaxQty').val(),
                    MinQty_KLH: $('#frm_data').find('#MinQty').val(),
                    MaxQty_LLK: $('#frm_data').find('#MaxQty').val(),
                    MinQty_LLK: $('#frm_data').find('#MinQty').val(),
                    UserUpdate_SPC: name,
                    site_remark: $('#frm_data').find('#site_remark').val(),
                    destination_site_code: $('#frm_data').find('#destination_site_code').val(),
                };

                var params = [];
                for (const i in update_data) {
                    params.push(i + "=" + encodeURIComponent(update_data[i]));
                }

                fetch(url_mrp_itemMaster_update, {
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

                        toastr.success('Save Successfully!', async function () { });
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.log('Error:', error);
                });
                return false;

            });

        };

        $.MRP_ItemMaster_Search = async function () {

            function template(data) {
                if ($(data.html).length === 0) {
                    return data.text;
                }
                return $(data.html);
            }

            $('#search_itemmaster').select2({
                ajax: {
                    url: api_url + '/v1/MRP_ItemMaster_Search',
                    dataType: 'json',
                    width: 'resolve',
                    delay: 500,
                    dropdownAutoWidth: true,
                    minimumInputLength: 3,
                    minimumResultsForSearch: 10,
                    data: function (params) {
                        var query = {
                            keywords: typeof params.term !== 'undefined' ? params.term : ' ',
                        }
                        //console.log(params);
                        return query;
                    },
                    escapeMarkup: function (markup) {
                        return markup;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (data, search) {
                        //console.log(data);
                        return {
                            results: $.map(data.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.id
                                }
                            })
                        };
                    },


                }
            })

        }

        $.MRP_ItemMaster_Detail = async function (barcode) {

            let url = new URL(product_purplan_get);

            url.search = new URLSearchParams({
                barcode: $('#frm_data').find('#item_barcode').val()
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let ResultFinal = 0;

                console.log(moment(), 'START FUNCTION MRP_ItemMaster_Search', result)



            });

        }

        $.MRP_Source_Site_Get = async function () {

            // Start LOV MRP DATASET
            let lov_site_dataset = [];
            let lov_mrp_query = fs.collection('lov_mrp').where("active_flag", "in", ["Y"]);

            lov_mrp_query.get().then(function (querySnapshot) {

                querySnapshot.forEach(function (doc) {

                    if (doc.data().lov_code > 200 && doc.data().lov_code < 250) {
                        lov_site_dataset.push({ id: doc.data().lov_code + ' : ' + doc.data().lov1, text: doc.data().lov_code + ' : ' + doc.data().lov1 });
                    }
                });

                $('#source_site_code').val('201 : VSK - Minburi').trigger('change.select2').prop('disabled', true); //เลือกชั่วคราว

                $('#search_source_site_code').select2({
                    width: '100%',
                    height: '40px',
                    placeholder: {
                        id: '0', // the value of the option
                        text: '--- Select Source Site ---'
                    },
                    data: lov_site_dataset,
                    templateResult: function (data) {
                        return data.text;
                    },
                    sorter: function (data) {
                        return data.sort(function (a, b) {
                            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                        });
                    }
                });

            });
            // End LOV MRP List

        }

        $.MRP_Desination_Site_Get = async function () {

            // Start LOV MRP DATASET
            let lov_site_dataset = [];
            let lov_mrp_query = fs.collection('lov_mrp').where("active_flag", "in", ["Y"]);

            lov_mrp_query.get().then(function (querySnapshot) {

                querySnapshot.forEach(function (doc) {
                    if (doc.data().lov_code > 200 && doc.data().lov_code < 250) {
                        lov_site_dataset.push({ id: doc.data().lov_code + ' : ' + doc.data().lov1, text: doc.data().lov_code + ' : ' + doc.data().lov1 });
                    }
                });

                $('#search_destination_site_code').select2({
                    width: '100%',
                    height: '40px',
                    placeholder: {
                        id: '0', // the value of the option
                        text: '--- Select Destination Site ---'
                    },
                    data: lov_site_dataset,
                    templateResult: function (data) {
                        return data.text;
                    },
                    sorter: function (data) {
                        return data.sort(function (a, b) {
                            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                        });
                    }
                });

            });
            // End LOV MRP List

        }

        $.MRP_Formula_Get = async function () {

            // Start LOV MRP DATASET
            let formula_dataset = [];
            let formula_query = fs.collection('mrp_mas_formula').where("record_status", "==", "Y");

            formula_query.get().then(function (querySnapshot) {

                querySnapshot.forEach(function (doc) {

                    formula_dataset.push({ id: doc.data().formula_type, text: doc.data().formula_type });

                });

                $('#item_formula').select2({
                    width: '100%',
                    height: '40px',
                    dropdownParent: $("#modal-frm_data"),
                    placeholder: {
                        id: '0', // the value of the option
                        text: '--- Select Formula ---'
                    },
                    data: formula_dataset,
                    templateResult: function (data) {
                        return data.text;
                    },
                    sorter: function (data) {
                        return data.sort(function (a, b) {
                            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                        });
                    }
                });

                $('#item_formula').val('MINMAX').trigger('change.select2').prop('disabled', true); //เลือกชั่วคราว

                $('#search_item_formula').select2({
                    width: '100%',
                    height: '40px',
                    placeholder: {
                        id: '0', // the value of the option
                        text: '--- Select Formula ---'
                    },
                    data: formula_dataset,
                    templateResult: function (data) {
                        return data.text;
                    },
                    sorter: function (data) {
                        return data.sort(function (a, b) {
                            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                        });
                    }
                });

            });
            // End LOV MRP List

        }

        $.MRP_MINMAX_SUB1 = function (MinQty, MaxQty, StockOnHand, Pending_POorTransit) {

            let Answer = 0;

            if (MinQty > 0) {

                if (Number(StockOnHand) + Number(Pending_POorTransit) <= MinQty) {

                    if (MaxQty - StockOnHand - Pending_POorTransit > 0) {

                        Answer = MaxQty - StockOnHand - Pending_POorTransit

                        //console.log('Then MRP_MINMAX_SUB1 = ', Answer);

                    } else {

                        Answer = 0

                        //console.log('Else MRP_MINMAX_SUB1 = ', Answer);

                    }

                } else {

                    Answer = 0

                    // console.log('Else MRP_MINMAX_SUB1 = ', Answer);

                }
            }

            return Answer

        }

        $.MRP_MINMAX_SUB2 = function (MinQty, MaxQty, StockOnHand, Pending_POorTransit) {

            let Answer = 0;

            if (MinQty > 0) {

                if ((Number(StockOnHand) + Number(Pending_POorTransit)) <= MinQty) {

                    Answer = MaxQty - StockOnHand - Pending_POorTransit;

                    //console.log('Then MRP_MINMAX_SUB2 = ', Answer);

                } else {

                    Answer = 0;

                    //console.log('Else StockOnHand + Pending_POorTransit) <= MinQty MRP_MINMAX_SUB2 = ', Answer);

                }

            } else {

                //console.log('Else MinQty > 0 MRP_MINMAX_SUB2 = ', Answer);

                Answer = 0;

            }

            return Answer

        }

        $.MRP_MINMAX_SUB3 = function (MinQty, MaxQty, StockOnHand, Pending_POorTransit) {

            let Answer = 0;

            if (MinQty > 0) {

                if (StockOnHand + Pending_POorTransit <= MinQty) {

                    if ((MaxQty - StockOnHand - Pending_POorTransit) > 0) {

                        Answer = MaxQty - StockOnHand - Pending_POorTransit;

                        //console.log('Then MRP_MINMAX_SUB3 = ', Answer);

                    } else {

                        Answer = 0;

                        //console.log('Else (MaxQty - StockOnHand - Pending_POorTransit) > 0 MRP_MINMAX_SUB3 = ', Answer);
                    }

                } else {

                    Answer = 0;
                    // console.log('Else (StockOnHand + Pending_POorTransit <= MinQty) MRP_MINMAX_SUB3 = ', Answer);

                }

            } else {

                //console.log('Else MinQty > 0 MRP_MINMAX_SUB3 = ', Answer);

                Answer = 0;

            }

            return Answer

        }

        $.MRP_MINMAX_MAIN = function (MinQty, MaxQty, StockOnHand, Pending_POorTransit, PackCodeRounding) {

            let DestinationSiteActive = "YES";
            let ItemRecordActive = "YES";
            let AnswerFunc1 = 0;
            let AnswerFunc2 = 0;
            let AnswerFunc3 = 0;
            let Answer = 0;

            if (DestinationSiteActive === 'YES') {

                if (ItemRecordActive === "YES") {

                    AnswerFunc1 = $.MRP_MINMAX_SUB1(MinQty, MaxQty, StockOnHand, Pending_POorTransit);

                    if (AnswerFunc1 > (5 * PackCodeRounding)) {

                        AnswerFunc2 = $.MRP_MINMAX_SUB2(MinQty, MaxQty, StockOnHand, Pending_POorTransit);

                        Answer = $.MRP_MROUND(AnswerFunc2, PackCodeRounding) - PackCodeRounding;

                        //console.log("THEN OK")

                    } else {

                        AnswerFunc3 = $.MRP_MINMAX_SUB3(MinQty, MaxQty, StockOnHand, Pending_POorTransit);

                        Answer = AnswerFunc3;

                        //console.log("ELSE OK")

                    }

                } else {

                    Answer = 0;

                    console.log("ITEM NOT ACTIVE");

                }

            } else {

                Answer = 0;

                console.log("DESTINATION SITE NOT ACTIVE");

            }

            return Answer

        }

        $(document).ready(async function () {

            await $.init();

            //  console.log($.MRP_MINMAX_MAIN(3, 6, 0, 0, 4));

        });

    } else {

        window.location.assign('./login');

    }

});