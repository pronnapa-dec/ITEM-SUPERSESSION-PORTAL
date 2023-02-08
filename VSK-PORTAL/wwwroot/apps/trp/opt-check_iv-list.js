'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089";

let url_trp = 'http://localhost:57916/'
//let url_slip = 'http://192.168.1.247:8899/'v

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const url_ck_inv_list = url_api + '/v1/Trp_Ck_Inv_List';
const url_ck_inv_detail = url_api + '/v1/Trp_Ck_Inv_Detail';
const url_master_selete2_get = url_api + '/v1/Master_Selete2';

let tbl_list;
let tbl_list_inv;
/*let add_data = {};*/
/*let add_img = {};*/

let customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'

    },
    "text": 'Please Wait...'
});

firebase.auth().onAuthStateChanged(async function (user) {

    if (user) {

        $.init = async function () {

            await setTimeout(function () {
                $.LoadingOverlay("hide");
                $('#btn-save_exit').hide()
            }, 1000);

            console.log(urlParams.get('refno'))

            //$('.fc-datepicker').datepicker({
            //    dateFormat: 'dd/mm/yy',
            //    autoclose: true,
            //});

            //$('.date-picker').daterangepicker({
            //    autoUpdateInput: false,
            //    showDropdowns: true,
            //    opens: "right",
            //    locale: { cancelLabel: 'Clear' },
            //}, function (start, end, label) {
            //    //console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            //});

            //$('.date-picker').on('apply.daterangepicker', function (ev, picker) {
            //    $(this).val(picker.startDate.format('DD/MM/YYYY') + '-' + picker.endDate.format('DD/MM/YYYY'));
            //});

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await setTimeout(function () {

                    $('#detectImageForm').find('input').val('')
                    $('.dropify-clear').trigger('click');

                }, 100);

            });

            $('#btn-save_exit').off('click').on('click', async function (e) {

                e.preventDefault();

                await $('#detectImageForm').parsley().validate();

                await $.Slip_Create();
            });

            $('#btn-item_create').off('click').on('click', async function (e) {

                e.preventDefault();

                //let url_bankslip = url_slip + "csh/opt/bankslip";
                let url_bankslip = url_slip + "csh/opt/bankslip";

                console.log(url_bankslip)

                window.open(url_bankslip, '_blank');

            });

            $(".img-gallery").lightGallery({ rel: true });

            $('#frm_search').submit(async function (e) {

                e.preventDefault();

                $.List();

            });

            $('#job_inv_emmas').select2({
                minimumInputLength: 1,
                minimumResultsForSearch: 10,
                dropdownAutoWidth: true,
                delay: 500,
                ajax: {
                    url: 'http://192.168.1.247/vsk-api-acc/api/ACC/VSK_Emmas_Select2_GET',
                    dataType: 'json',
                    width: 'resolve',
                    data: function (params) {
                        var query = {
                            search: typeof params.term !== 'undefined' ? params.term : ' ',
                        }
                        //console.log(params);
                        return query;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (data, search) {
                        console.log(data);
                        return {
                            results: $.map(data.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.id
                                }
                            })
                        };
                    },
                },
                escapeMarkup: function (markup) {
                    return markup;
                },
            })

            $('#inv_item').select2({
                minimumInputLength: 1,
                minimumResultsForSearch: 10,
                dropdownAutoWidth: true,
                delay: 500,
                ajax: {
                    url: url_master_selete2_get,
                    dataType: 'json',
                    width: 'resolve',
                    data: function (params) {
                        var query = {
                            mode: "item",
                            keywords: typeof params.term !== 'undefined' ? params.term : ' ',
                        }
                        //console.log(params);
                        return query;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (data, search) {
                        console.log(data);
                        return {
                            results: $.map(data.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.id
                                }
                            })
                        };
                    },
                },
                escapeMarkup: function (markup) {
                    return markup;
                },
            })

            $('#btn-item_create').off('click').on('click', async function (e) {

                e.preventDefault();

                //let url_bankslip = url_slip + "csh/opt/bankslip";
                let url_bankslip = url_trp + "trp/check_iv_job";

                console.log(url_bankslip)

                window.open(url_bankslip, '_blank');

            });
        };

        $.clear_input = async function () {

            $('#frm_search').trigger('reset');
            $('#frm_search').find('input').val('');
            $("#frm_search").parsley().reset();
            $("#bankslip_emmas option").remove();
            $('#bankslip_emmas')
                .append($("<option value=''>--- Select ---</option>")).prop('disabled', false);

        };

        $.List = async function () {

            let url = new URL(url_ck_inv_list);

            let trndate_start;
            let trndate_end;

            trndate_start = $('#job_inv_date').val() != '' ? moment($('#job_inv_date').val().substring(0, 10), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 00:00' : moment().add(-1, 'days').format('YYYY-MM-DD') + ' 00:00';
            trndate_end = $('#job_inv_date').val() != '' ? moment($('#job_inv_date').val().substring(11, 25), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 23:59' : moment().format('YYYY-MM-DD') + ' 23:59';

            url.search = new URLSearchParams({

                //slip_datetime_start: trndate_start,
                //slip_datetime_end: trndate_end,
                //slip_jobdate_start: trndate_start,
                //slip_jobdate_end: trndate_end,
                job_number: $('#frm_search').find('#job_number').val() === '' ? '' : $('#frm_search').find('#job_number').val(),
                job_pk_number: $('#frm_search').find('#job_pk_number').val() === '' ? '' : $('#frm_search').find('#job_pk_number').val(),
                job_inv_number: $('#frm_search').find('#job_inv_number').val() === '' ? '' : $('#frm_search').find('#job_inv_number').val(),
                job_inv_emmas: $('#frm_search').find('#job_inv_emmas').val() === '' ? '' : $('#frm_search').find('#job_inv_emmas').val(),
                job_item_code: $('#frm_search').find('#inv_item').val() === '' ? '' : $('#frm_search').find('#inv_item').val(),
                check_status: $('#frm_search').find('#check_status').val() === '' ? '' : $('#frm_search').find('#check_status').val(),
                created_by: $('#frm_search').find('#created_by').val() === '' ? '' : $('#frm_search').find('#created_by').val(),

            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    $("#global-loader").fadeOut("slow");

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ขออภัย!');

                } else {

                    tbl_list = $('#tbl-list').DataTable({
                        data: result.data,
                        dom: 'Bfrtip',
                        deferRender: true,
                        ordering: true,
                        pageLength: 10,
                        bDestroy: true,
                        autoWidth: false,
                        buttons: [
                            'copyHtml5',
                            {
                                extend: 'excelHtml5',
                                title: '',
                                filename: 'Assess_Confirm_' + moment().format("YYYY/MM/DD hh:ss:mm"),
                                //exportOptions: {
                                //    columns: [1, 2, 4, 6, 7, 9, 13, 10, 12, 13, 16]
                                //}
                            },
                        ],
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>job_id</span>",
                                data: "job_id",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //0

                            {
                                title: "<span style='font-size:11px;'>date</span>",
                                data: "job_inv_date",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + moment(data).format("DD/MM/YYYY") + '<span/>';
                                    // return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '<span/>';
                                }
                            }, //10

                            {
                                title: "<span style='font-size:11px;'>job</span>",
                                data: "job_number",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                    //return '<div data-placement="top" data-toggle="tooltip-primary">' + '<a href="' + url_trp + 'trp/check_iv_job?inv_number=' + row.job_inv_number + '&created_by=' + user_id +'" target="_blank"><b>' + data + '<b></a></div>'
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>inv</span>",
                                data: "job_inv_number",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    // return '<span style="font-size:11px;">' + data + '</span>';
                                    return '<div data-placement="top" data-toggle="tooltip-primary">' + '<a href="' + url_trp + 'trp/check_iv_job?inv_number=' + data + '&created_by=' + user_id + '" target="_blank"><b>' + data + '<b></a></div>'
                                }
                            }, //2

                            {
                                title: "<span style='font-size:11px;'>pk</span>",
                                data: "job_pk_number",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>customer</span>",
                                data: "job_inv_emmas",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data.substring(0, 7) + '<br>' + data.substring(7) + '</span>';
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>address</span>",
                                data: "job_inv_address",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //7
                            {
                                title: "<span style='font-size:11px;'>item</span>",
                                data: "job_inv_qty",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>qty</span>",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    let tx_color
                                    let job_item_qty = row.job_item_qty
                                    let job_item_trnqty = row.job_item_trnqty
                                    if (job_item_qty == 0) {
                                        tx_color = 'tx-danger';
                                    } else if (job_item_qty != 0 && job_item_qty < job_item_trnqty) {
                                        tx_color = 'tx-warning';
                                    } else {
                                        tx_color = 'tx-success';
                                    }
                                    return '<span style="font-size:11px;" class="' + tx_color + '">' + row.job_item_qty + '</span>' + ' / ' + '<span style="font-size:11px;" class="tx-primary">' + row.job_item_trnqty + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>job_item_trnqty</span>",
                                data: "job_item_qty",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>job_item_trnqty</span>",
                                data: "job_item_trnqty",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>status</span>",
                                data: "check_status",
                                class: "tx-center align-middle",
                                width: "70px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 'true') {
                                        return '<span class="label text-success"><div class="dot-label bg-success mr-0"></div>สำเร็จ</span >'
                                    } else if (data == 'false') {
                                        return '<span class="label text-danger"><div class="dot-label bg-danger mr-0"></div>ไม่สำเร็จ</span >'
                                    } else {
                                        return '-'
                                    }
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>record_status</span>",
                                data: "record_status",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //11
                            {
                                title: "<span style='font-size:11px;'>user</span>",
                                data: "created_by",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '<br>' + moment(row.created_date).format("YYYY/MM/DD hh:ss:mm") + '</span>';
                                }
                            }, //12
                            {
                                title: "<span style='font-size:11px;'>created_date</span>",
                                data: "created_date",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //13
                        ],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-list tbody tr',
                                callback: async function (key, options) {

                                    let citem = tbl_list.row(this).data();

                                    if (key === 'view') {

                                        await $.Detail(citem);
                                        //await $.Slip_Bill_List(citem);

                                    } else if (key === 'edit') {

                                        await $.Update(citem);

                                    //} else if (key === 'delete') {

                                    //    //await $.Slip_Delete(citem);

                                    } else {

                                        alert('ERROR');

                                    }
                                },
                                items: {
                                    "view": { name: "View", icon: "fas fa-search" },
                                    "edit": { name: "Edit", icon: "edit" },
                                    //"delete": { name: "Delete", icon: "delete" },
                                }
                            });

                        },
                    });

                }
            })

        };

        $.Update = async function (citem) {

            //let url_bankslip = "http://192.168.1.247:8099/csh/opt/bankslip?jobno=" + citem['slip_jobno'];

            let url_ck_inv = url_trp + 'trp/check_iv_job?inv_number=' + citem['job_inv_number'] + '&created_by=' + user_id;

            console.log(url_ck_inv)

            window.open(url_ck_inv, '_blank');

        };

        $.Detail = async function (citem) {

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#no_br').html(citem['job_inv_number'])

            //$('#sum_qty_current').html(citem['job_detail_qty']).css("color", "#F39C12");
            //$('#sum_qty_total').html(citem['job_qty']).css("color", "#138D75");
            //$('#sum_qty_item').html(sum_qty_item).css("color", "#8A0006");

            fetch(url_ck_inv_detail + '?inv_number=' + citem['job_inv_number']).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.status === 'Error') {

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ไม่พบข้อมูลใบงาน');

                } else {

                    if (result.length > 0) {

                        let sum_qty_current = 0;
                        let sum_qty_total = 0;
                        let sum_qty_item = 0;

                        $.each(result.data, function (key, val) {

                            let add_qty = val['job_item_qty'];
                            let cost_qty = val['job_item_trnqty'];

                            sum_qty_current += parseFloat(add_qty)
                            sum_qty_total += parseFloat(cost_qty)

                        });

                        $('#sum_qty_current').html(sum_qty_current).css("color", "#F39C12");
                        $('#sum_qty_total').html(sum_qty_total).css("color", "#138D75");
                        $('#sum_qty_item').html(sum_qty_total - sum_qty_current).css("color", "#8A0006");

                        tbl_list_inv = $('#tbl-list-inv').DataTable({
                            data: result.data,
                            dom: 'frtip',
                            deferRender: true,
                            ordering: true,
                            pageLength: 10,
                            bDestroy: true,
                            autoWidth: false,
                            columns: [
                                {
                                    title: "<span style='font-size:11px;'>job_detail_id</span>",
                                    data: "job_id",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //0

                                {
                                    title: "<span style='font-size:11px;'>job_item_barcode</span>",
                                    data: "job_item_barcode",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '<span/>';
                                    }
                                }, //10

                                {
                                    title: "<span style='font-size:11px;'>job_item_name</span>",
                                    data: "job_item_name",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //1
                                {
                                    title: "<span style='font-size:11px;'>job_item_spcodes</span>",
                                    data: "job_item_spcodes",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        // return '<span style="font-size:11px;">' + data + '</span>';
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //2

                                {
                                    title: "<span style='font-size:11px;'>job_item_qty</span>",
                                    data: "job_item_qty",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //5
                                {
                                    title: "<span style='font-size:11px;'>job_item_trnqty</span>",
                                    data: "job_item_trnqty",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //6
                                {
                                    title: "<span style='font-size:11px;'>job_item_unit</span>",
                                    data: "job_item_unit",
                                    class: "tx-center align-middle",
                                    //width: "190px",
                                    //visible: false,
                                    render: function (data, type, row, meta) {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }, //7
                            ],
                            "initComplete": function (settings, json) {

                                $("#global-loader").fadeOut("slow");

                            },
                        });

                    } else {

                        swal({
                            title: "ขออภัย",
                            text: "เกิดข้อผิดพลาด",
                            type: 'error',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        toastr.error('ไม่พบข้อมูลใบงาน');
                    }
                }
            })
        };

        $.Master_Get = async function () {

            let url_Master = new URL(url_master_selete2_get);

            url_Master.search = new URLSearchParams({
                mode: 'user',
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_employee option").remove();
                    //$("#search_employee").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_search').find('#created_by').select2({
                        width: '100%',
                        height: '40px',
                        data: Master_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        }

        $(document).ready(async function () {

            await $.init();
            await $.Master_Get();
            await $.List();

        });

    } else {

        window.location.assign('./login');

    }

});