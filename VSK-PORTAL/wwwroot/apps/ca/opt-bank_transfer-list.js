'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089/ca-api/";

let url_image = 'http://localhost/image_slip/'
//let url_image = 'http://192.168.1.247:8899/image_slip/'

let url_slip = 'http://localhost:57916/'
//let url_slip = 'http://192.168.1.247:8099/'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const url_slip_list = url_api + '/v1/Slip_List';
const url_slip_delete = url_api + '/v1/Slip_Delete';
const url_slip_detail = url_api + '/v1/Slip_Detail';
const url_slip_create = url_api + '/v1/Slip_Create';
const url_slip_upload = url_api + '/v1/Slip_Upload';
const url_slip_update = url_api + '/v1/Slip_Update';
const url_slip_bill_create = url_api + '/v1/Slip_Bill_Create';
const url_slip_bill_list = url_api + '/v1/Slip_Bill_List';
const url_slip_bill_delete = url_api + '/v1/Slip_Bill_Delete';
const url_master_get = url_api + '/v1/Slip_Master';

let oTable = $('#tbl-list').DataTable();
let table_bill;
let tbl_slip;
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

            $.LoadingOverlay("show", {
                image: '/assets/img/sor.jpg',
                //custom: customElement
            });

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

                $.Slip_List();

            });

            $('#slip_cusname').select2({
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
        };

        $.clear_input = async function () {

            $('#frm_search').trigger('reset');
            $('#frm_search').find('input').val('');
            $("#frm_search").parsley().reset();
            $("#bankslip_emmas option").remove();
            $('#bankslip_emmas')
                .append($("<option value=''>--- Select ---</option>")).prop('disabled', false);

        };

        $.Slip_List = async function () {

            let url = new URL(url_slip_list);

            let trndate_start;
            let trndate_end;

            trndate_start = $('#slip_job_datetime').val() != '' ? moment($('#slip_job_datetime').val().substring(0, 10), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 00:00' : moment().add(-1, 'days').format('YYYY-MM-DD') + ' 00:00';
            trndate_end = $('#slip_job_datetime').val() != '' ? moment($('#slip_job_datetime').val().substring(11, 25), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 23:59' : moment().format('YYYY-MM-DD') + ' 23:59';


            url.search = new URLSearchParams({

                //slip_datetime_start: trndate_start,
                //slip_datetime_end: trndate_end,
                //slip_jobdate_start: trndate_start,
                //slip_jobdate_end: trndate_end,
                slip_refno: $('#frm_search').find('#slip_refno').val() === '' ? '' : $('#frm_search').find('#slip_refno').val(),
                slip_bank: $('#frm_search').find('#slip_bank').val() === '' ? '' : $('#frm_search').find('#slip_bank').val(),
                created_by: $('#frm_search').find('#slip_user').val() === '' ? '' : $('#frm_search').find('#slip_user').val(),
                slip_cuscode: $('#frm_search').find('#slip_cusname').val() === '' ? '' : $('#frm_search').find('#slip_cusname').val(),
                slip_bill: $('#frm_search').find('#bill_no').val() === '' ? '' : $('#frm_search').find('#bill_no').val(),

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

                    tbl_slip = $('#tbl-slip').DataTable({
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
                                title: "<span style='font-size:11px;'>trans_id</span>",
                                data: "trans_id",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //0
                            {
                                title: "<center>images</center>",
                                data: "images",
                                class: "tx-center",
                                //width: "300px",
                                //visible: false,
                                render: function (data, type, row, meta) {

                                    return "<div class='carousel-inner tx-center' style='width: 50px!important; height: 80px!important;'>" +
                                        "<div class='tx-center'>" +
                                        "<img src=" + url_image + row.image_no + '/' + row.image_name + " alt='img' class=''>" +
                                        "</div>" +
                                        "</div>";
                                }
                            },//0
                            {
                                title: "<span style='font-size:11px;'>slip_jobdate</span>",
                                data: "slip_jobdate",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + moment(data, 'DD/MM/YYYY hh:mm:ss').format('DD/MM/YYYY') + '<span/>';
                                }
                            }, //10
                          
                            {
                                title: "<span style='font-size:11px;'>slip_jobno</span>",
                                data: "slip_jobno",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '<br>' + row.slip_refno + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>slip_refno</span>",
                                data: "slip_refno",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //2
                        
                            {
                                title: "<span style='font-size:11px;'>slip_bank</span>",
                                data: "slip_bank",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>slip_cuscode</span>",
                                data: "slip_cuscode",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>slip_cusname</span>",
                                data: "slip_cusname",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //7
                            {
                                title: "<span style='font-size:11px;'>slip_cuslname</span>",
                                data: "slip_cuslname",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + row.slip_cuscode + ' ' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>slip_total</span>",
                                data: "slip_total",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>count_bill</span>",
                                data: "count_bill",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //9
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
                                title: "<span style='font-size:11px;'>slip_datetime</span>",
                                data: "slip_datetime",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                   // return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '<span/>';
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>created_by</span>",
                                data: "created_by",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
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
                            {
                                title: "<span style='font-size:11px;'>image_no</span>",
                                data: "image_no",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //14
                            {
                                title: "<span style='font-size:11px;'>image_name</span>",
                                data: "image_name",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //15
                            //{
                            //    title: "<span style='font-size:11px;'>image_name</span>",
                            //    class: "tx-center align-middle",
                            //    //width: "190px",
                            //    //visible: false,
                            //    render: function (data, type, row, meta) {
                            //        return "<div class='d-flex flex-row justify-content-center'>" +
                            //            "<button onclick='$.Slip_Bill_Update(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-primary btn-sm edit-item update_item' data-action='update'  id='update_item" + meta + "' type='button'>Edit</button>" +
                            //            "<button onclick='$.Slip_Bill_Delete(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete-item delete_item' data-action='delete' id='delete_item" + meta + "' type='button'>Delete</button>" +
                            //            "</div>";
                            //    }
                            //}, //15
                          
                        ],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-slip tbody tr',
                                callback: async function (key, options) {

                                    let citem = tbl_slip.row(this).data();

                                    if (key === 'view') {

                                        await $.Slip_Detail(citem);
                                        await $.Slip_Bill_List(citem);

                                    } else if (key === 'edit') {

                                        await $.Slip_Update(citem);

                                    } else if (key === 'delete') {

                                        await $.Slip_Delete(citem);
                                   
                                    } else {

                                        alert('ERROR');

                                    }
                                },
                                items: {
                                    "view": { name: "View", icon: "fas fa-search" },
                                    "edit": { name: "Edit", icon: "edit" },
                                    "delete": { name: "Delete", icon: "delete" },
                                }
                            });

                        },
                    });

                }
            })

        };

        $.Slip_Detail = async function (citem) {

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            fetch(url_slip_detail + '?slip_jobno=' + citem['slip_jobno']).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    $.each(result.data, function (key, val) {

                        var slip_jobdate = val['slip_jobdate'];
                        var slip_datetime = val['slip_datetime'];

                        $('#bankslip_date').val(slip_jobdate);
                        $('#bankslip_jobno').val(val['slip_jobno']);
                        $('#bankslip_ref').val(val['slip_refno']);
                        $('#bankslip_number').val(val['slip_bank']);
                        $('#bankslip_payindate').val(slip_datetime);
                        $('#bankslip_total').val(val['slip_total']);

                        $('#bankslip_gallery').attr('data-src', url_image + val['image_no'] + '/' + val['image_name']);
                        $('#bankslip_image').attr('src', url_image + val['image_no'] + '/' + val['image_name']);

                        $("#bankslip_emmas option").remove();

                        if (citem['slip_cuscode'] != '') {

                            fetch('http://192.168.1.247/vsk-api-acc/api/ACC/VSK_Emmas_Select2_GET?search=' + citem['slip_cuscode']).then(function (response) {
                                return response.json();
                            }).then(function (result) {
                                console.log('emmas', result.data)
                                if (result.length > 0) {

                                    $('#bankslip_emmas')
                                        .append($("<option>--- Select ---</option>")
                                            .attr("value", result.data[0]['id'])
                                            .text(result.data[0]['text'])
                                            .attr('name', result.data[0]['text']));

                                }

                            });

                        }

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

            });

        };

        $.Slip_Update = async function (citem) {

            //let url_bankslip = "http://192.168.1.247:8099/csh/opt/bankslip?jobno=" + citem['slip_jobno'];

            let url_bankslip = url_slip + "csh/opt/bankslip?jobno=" + citem['slip_jobno'];

            console.log(url_bankslip)

            window.open(url_bankslip, '_blank');

        };

        $.Slip_Delete = async function (citem) {

            console.log('citem', citem)

            swal({
                title: "คุณแน่ใจหรือไม่",
                text: "ที่จะทำการอัพเดตข้อมูลนี้",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "ใช่, ยันยืน",
                cancelButtonText: "ไม่, ยกเลิก",
                cancelButtonColor: '#d33',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {

                if (isConfirm) {

                    let data_update = {
                        trans_id: citem['trans_id'],
                        ref_id: citem['slip_jobno'],
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in data_update) {
                        params.push(i + "=" + encodeURIComponent(data_update[i]));
                    }

                    fetch(url_slip_delete, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        return data.json();
                    }).then(result => {
                        if (result.status === 'Error') {

                            toastr.error('Oops! An Error Occurred');

                        } else {

                            swal({
                                title: "สำเร็จ!",
                                text: "ทำรายการสำเร็จ",
                                type: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });

                            toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {
                                //table_bill.destroy();
                                //await location.reload();
                                $.Slip_List();

                            }, 1000);

                        }

                    }).catch(error => {

                        toastr.error('Error, Please contact administrator.');

                    });

                } else {

                    swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                }

            });

        };

        $.Slip_Bill_List = async function (citem) {

            let data_jobno = $('#bankslip_jobno').val()

            fetch(url_slip_bill_list + '?ref_id=' + citem['slip_jobno']).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    let i = result.length;

                    var data_slip_bill = [];

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)

                        data_slip_bill.push([
                            i,
                            val['created_datetime'],
                            val['bill_no'],
                            val['created_by'],
                            "<div class='d-flex flex-row justify-content-center'>" +
                            //"<button onclick='$.Slip_Bill_Update(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-primary btn-sm edit-item update_item' data-action='update'  id='update_item" + i + "' type='button'>Edit</button>" +
                            //"<button onclick='$.Slip_Bill_Delete(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete-item delete_item' data-action='delete' id='delete_item" + i + "' type='button'>Delete</button>" +
                            "</div>",
                            val['trans_id'],
                            val['ref_id'],
                            val['record_status'],

                        ])

                        i--;

                    });

                    console.log('data_slip_bill', data_slip_bill)

                    table_bill = $('#tbl-bill').DataTable({
                        "data": data_slip_bill,
                        "dom": 'ifrtp',
                        //autoWidth : true,
                        "bDestroy": true,
                        "deferRender": true,
                        "order": [[0, "desc"]],
                        "ordering": false,
                        "pageLength": 5,
                        "columnDefs": [{
                            "targets": 'no-sort',
                            "orderable": false,
                        },
                        {
                            "targets": [0],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        {
                            "targets": [1],
                            "searchable": false,
                            "class": "tx-center",
                            "render": function (data, type, row, meta) {
                                return (data != '0001-01-01T00:00:00' ? moment(data).format('DD/MM/YYYY HH:mm:ss') : '-');
                            }
                        },
                        {
                            "targets": [2],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        {
                            "targets": [3],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        {
                            "targets": [4],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [5],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [6],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [7],
                            "searchable": false,
                            "visible": false

                        }],
                        "initComplete": function (settings, json) {

                        }
                    });

                    table_bill.columns.adjust();

                    //$.LoadingOverlay("hide");

                }

            });

        };

        $.Master_Get = async function () {

            let url_Master = new URL(url_master_get);

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

                    $('#frm_search').find('#slip_user').select2({
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
            await $.Slip_List();

        });

    } else {

        window.location.assign('./login');

    }

});