'use strict';

let fs = firebase.firestore();
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];

let collection = 'mrp_opt_purchaseplan';
let oTable, history_Table, role_code, mode;
let inventorycode_dataset = [];
let invfrecode_dataset = [];

const url_api = "http://192.168.1.247/intranet/pur-api";
const url_api_uat = "http://localhost:49705";
const url_api_trp = "http://192.168.1.247:8899/trp-api/";

//let export_cn_job = 'http://192.168.1.247/intranet/report/cn-rpt/Pages/RPT_CN/RPT_CN_JOB';
let lists_get = url_api_uat + '/v1/Cn_Branch_Pre_Job_Get';

let lists_history = url_api_uat + '/v1/Cn_Branch_Pre_Job_Detail_Get';
let update_detail = url_api_uat + '/v1/Cn_Branch_Pre_Job_Detail_Create';
//let export_invoice = 'http://192.168.1.187/intranet/report/cn-rpt/Pages/RPT_CN/RPT_CN_REINVOICE';
let export_invoice = 'http://192.168.1.187/ReportServer/Pages/ReportViewer.aspx?%2fReInvoiceCnBranch%2fCnBranch_TRP_Report&rs:Command=Render&rs:Format=pdf';
const Cn_Lov_Get = url_api + '/v1/Cn_Lov_Get';

//const objProfile = JSON.parse(localStorage.getItem('objProfile'));

let validator, table, options, item_action, item_id, deatailCondition;

let job_comment_dataSet = [];
let job_comment_dataSet_list = [];
let Master_dataSet = [];

let toDate = new Date();


$.init = function () {

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
    $('#cn_date').val(moment().format('DD/MM/YYYY') + '-' + moment().format('DD/MM/YYYY'))

    $('#job_status_search').append('<option value="complete">Complete - สำเร็จ </option>')

    $('#btn-export').off('click').on('click', function (evt) {

        evt.preventDefault();

        $(this).on('click', function (evt) {
            evt.preventDefault();
        });

        let CNdate_start = $('#cn_date').val() != '' ? moment($('#cn_date').val().substring(0, 10), 'DD/MM/YYYY').format('YYYY-MM-DD') + " 00:00" : moment().add(-365, 'days').format('YYYY-MM-DD') + " 00:00";
        let CNdate_end = $('#cn_date').val() != '' ? moment($('#cn_date').val().substring(11, 25), 'DD/MM/YYYY').format('YYYY-MM-DD') + " 23:59" : moment().add(1, 'days').format('YYYY-MM-DD') + " 23:59";

        let url = 'http://192.168.1.187/ReportServer/Pages/ReportViewer.aspx?%2fReInvoiceCnBranch%2fRPT_Cn_job_branch&rs:Command=Render';
        window.open(url, '_blank'); // kung edit 17/11/20

    });

    //if (role_code == 'TRP') {
    //    $('#cn_pre_job_assige_search').val('TRP')
    //}

    $.Load_comment();
    $.Driver_Get();

    $("#driver_id").append('<option value="driver_free">คนขับรถนอก</option>');

    $('.item_status').hide();

    $('#job_status_search').on("change", function () {
        if ($(this).val() == "receive") {
            $('.item_status').show();
        } else {
            $('.item_status').hide();
            $('#item_status').val('');
        }
    })

    $('.fc-datepicker').datepicker({
        dateFormat: 'dd/mm/yy',
        autoclose: true,
    });

    $('.date-picker').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + '-' + picker.endDate.format('DD/MM/YYYY'));
    });

    $('#btn-item_create').click(function (e) {

        e.preventDefault();

        $.Create();

    });

    $('#modal-frm_data').on('hidden.bs.modal', function () {

        //$('#site_code').val('').trigger('change').prop('disabled', false);
        //$('#schedule_note').val('').prop('disabled', false);
        //$('.schedule_day').prop('checked', false).prop('disabled', true);
        //$('#schedule_all').prop('checked', false).prop('disabled', true);
        //$('.record_status').prop('disabled', true);

        $("#frm_data").parsley().reset();

    });

    $("#global-loader").fadeIn("slow");

    $.List(); //before search

    $('#frm_search').submit(async function (e) {

        e.preventDefault();

        $("#global-loader").fadeIn("slow");

        oTable.destroy();


        $.List(); //after search

    });


    $('#modal-frm_history').on('hidden.bs.modal', function () {

        history_Table.destroy();
    });

};

//kung update 3/3/2021 
$.Load_comment = function () {
    let Get_comment = new URL(Cn_Lov_Get);

    fetch(Get_comment).then(function (response) {
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

            $.each(result.data, function (key, val) {
                job_comment_dataSet.push({ id: val['lov_code'], text: val['lov_code'] + ' : ' + val['lov1'] });
                job_comment_dataSet_list.push({ id: val['lov_code'], text: val['lov1'] });

            });

            $('.cn_comment').select2({
                width: '100%',
                height: '40px',
                data: job_comment_dataSet,
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

$.List = async function () {

    let url = new URL(lists_get);
    var CNdate_start
    var CNdate_end

    CNdate_start = $('#cn_date').val() != '' ? moment($('#cn_date').val().substring(0, 10), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 00:00' : moment().format('YYYY-MM-DD') + ' 00:00';  //ถ้าไม่เลือกจะเป็นค่าว่าง
    CNdate_end = $('#cn_date').val() != '' ? moment($('#cn_date').val().substring(11, 25), 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 23:59' : moment().format('YYYY-MM-DD') + ' 23:59';

    url.search = new URLSearchParams({
        cn_pre_job_datetime_start: CNdate_start,
        cn_pre_job_datetime_end: CNdate_end,
        cn_pre_job_branch: $('#branch').val(),
        salefile_number: $('#salefile_number_search').val(),
        salefile_invcode: $('#salefile_invcode_search').val(),
        cn_pre_job_item_barcode: $('#barcode').val(),
        cn_pre_job_comment: $('#cn_comment').val(),
        created_by: $('#created_by_search').val(),
        cn_pre_job_status: $('#job_status_search').val(),
        cn_pre_job_jobno: $('#cn_pre_job_jobno_search').val(),
        cn_pre_job_assige: $('#cn_pre_job_assige_search').val(),
        record_status: '1',
        mode: 'Search'
    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {
        //oTable.destroy();
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
                scrollX: true,
                //"pageLength": 100,
                //scrollCollapse: true,
                //autoWidth: true,
                //paging: true,
                scrollY: "410px",
                scrollCollapse: true,
                paging: false,
                columns: [
                    {
                        title: "<span style='font-size:11px;'>Job ID</span>",
                        data: "cn_pre_job_id",
                        width: "70px",
                        visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //1 

                    {
                        title: "<span style='font-size:11px;'>เลขที่อ้างอิง</span>",
                        data: "cn_pre_job_jobno",
                        width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //2

                    {
                        title: "<span style='font-size:11px;'>วันที่/เวลา</span>",
                        data: "cn_pre_job_datetime",
                        width: "100px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + moment(data, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm') + '<span/>';
                        }
                    }, //3

                    {
                        title: "<span style='font-size:11px;'>เลขที่ใบงาน</span>",
                        data: "salefile_number",
                        width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return data != null ? data != '' ? '<span style="font-size:11px;">' + data + '</span>' : '-' : '-';
                        }
                    }, //4

                    {
                        title: "<span style='font-size:11px;'>วันที่ใบงาน</span>",
                        data: "salefile_datetime",
                        width: "100px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            console.log(data)
                            return data != '' ? data != null ? data != '0001-01-01T00:00:00' ? data != '1900-01-01T00:00:00' ? '<span style="font-size:11px;">' + moment(data, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY HH:mm') + '<span/>' : '-' : '-' : '-' : '-';
                        }
                    }, //5

                    {
                        title: "<span style='font-size:11px;'>CN No.</span>",
                        data: "pMessage",
                        width: "70px",
                        visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //6
                    {
                        title: "<span style='font-size:11px;'>เวลา</span>",
                        data: "cn_pre_job_datetime",
                        class: "tx-center",
                        visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + moment(data).format('HH:mm') + '<span/>';
                        }
                    }, //7
                    {
                        title: "<span style='font-size:11px;'>สถานะ</span>",
                        data: "cn_pre_job_status",
                        class: "tx-center job_status",
                        width: "50px",
                        visible: true,
                        render: function (data, type, row, meta) {
                            if (data == 'open') {
                                return '<span style="color:red; font-size:11px;">Open</span>';
                            } else if (data == 'on_process') {
                                return '<span style="color:orange; font-size:11px;">On Process</span>';
                            } else if (data == 'receive') {
                                return '<span style="color:green; font-size:11px;">Receive</span>';
                            } else if (data == 'complete') {
                                return '<span style="color:green; font-size:11px;">Complete</span>';
                            } else if (data == 'rejected') {
                                return '<span style="color:red; font-size:11px;">Rejected</span>';
                            } else if (data == "change") {
                                return '<span style="color:#00AEFF;">Change</span>';
                            } else if (data == "cancel") {
                                return '<span style="color:#FFC300; font-size:11px;">Cancel</span>';
                            } else {
                                return '<span style="color:#000; font-size:11px;">' + data + '</span>';

                            }

                        }
                    }, //8
                    {
                        title: "<span style='font-size:11px;'>ผู้รับผิดชอบ</span>",
                        data: "cn_pre_job_assige",
                        class: "tx-center assige",
                        width: "70px",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //9
                    {
                        title: "<div class='tx-center'><span style='font-size:11px;'>สาขา</span></div>",
                        data: "cn_pre_job_branch",
                        width: "80px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //10
                    //{
                    //    title: "<div class='tx-center'><span style='font-size:11px;'>รหัสลูกค้า</span></div>",
                    //    data: "cn_pre_job_emmas_code",
                    //    width: "80px",
                    //    class: "tx-center",
                    //    render: function (data, type, row, meta) {
                    //        return '<span style="font-size:11px;">' + data + '</span>';
                    //    }
                    //}, //7
                    //{
                    //    title: "<div class='tx-center'><span style='font-size:11px;'>ชื่อลูกค้า</span></div>",
                    //    data: "emmas_lname",
                    //    width: "350px",
                    //    class: "tx-left",
                    //    render: function (data, type, row, meta) {
                    //        return '<span style="font-size:11px;">' + data + '</span>';
                    //    }
                    //}, //8
                    {
                        title: "<div class='tx-center'> <spanstyle='font-size:11px;'>ข้อมูลสินค้า</span></div>",
                        data: "cn_pre_job_item_name",
                        class: "tx-left",
                        width: "350px",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + row.cn_pre_job_item_barcode + " :" + data + "(" + row.cn_pre_job_item_spcode + ")" + '</span>';
                        }
                    }, //11
                    {
                        title: "<span style='font-size:11px;'>Qty.</span>",
                        data: "cn_pre_job_qty",
                        width: "60px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //12
                    {
                        title: "<span style='font-size:11px;'>การรับแจ้ง</span>",
                        data: "cn_pre_job_type",
                        class: "tx-center job_type",
                        width: "80px",
                        //visible: false,
                        render: function (data, type, row, meta) {

                            return data == '1' ? '<span class="badge badge-info">รับคืน</span>' : data == '2' ? '<span class="badge badge-success">หน้างาน</span>' : '-';

                        }
                    }, //13
                    {
                        title: "<span style='font-size:11px;'>บันทึกโดย</span>",
                        data: "created_by",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //14
                    {
                        title: "<div class='tx-center'><span style='font-size:11px;'>สาเหตุ</span></div>",
                        data: "cn_pre_job_comment",
                        class: "tx-left",
                        width: "300px",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //15
                    {
                        title: "<span style='font-size:11px;'>Message</span>",
                        data: "pMessage",
                        class: "tx-center",
                        visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //16
                    {
                        title: "<span style='font-size:11px;'>สภาพสินค้า</span>",
                        data: "cn_pre_job_detail_item_condition",
                        class: "tx-center item_status",
                        width: "70px",
                        render: function (data, type, row, meta) {
                            if (data == '1') {
                                return '<span style="font-size:11px;">สมบูรณ์</span>';
                            } else if (data == '2') {
                                return '<span style="font-size:11px;">ไม่สมบูรณ์</span>';
                            } else {
                                return '<span style="font-size:11px;"></span>';
                            }
                        }
                    }, //17
                ],


                "order": [[1, "desc"]],
                "initComplete": function (settings, json) {

                    // $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    $('#tbl-list tbody tr').hover(function () {
                        $(this).css('cursor', 'pointer');
                    });
                    //mode = '';
                    $.contextMenu({
                        selector: '#tbl-list tbody tr',
                        callback: async function (key, options) {

                            let data = oTable.row(this).data();
                            //console.log("key", key);
                            let citem = {
                                cn_id: data['cn_pre_job_id'],
                                cn_pre_job_jobno: data['cn_pre_job_jobno'],
                                pMessage: data['pMessage'],
                                cn_datetime: data['cn_pre_job_datetime'],
                                cn_pre_job_assige: data['cn_pre_job_assige'],
                                cn_pre_job_branch: data['cn_pre_job_branch'],
                                cn_pre_job_item_name: data['cn_pre_job_item_name'],
                                cn_pre_job_item_spcode: data['cn_pre_job_item_spcode'],
                                cn_qty: data['cn_pre_job_qty'],
                                cn_type: data['cn_pre_job_type'],
                                cn_status: data['cn_pre_job_status'],
                                cn_pre_job_comment: data['cn_pre_job_comment'],
                                job_comment: data['job_comment'],
                                cn_pre_job_detail_item_condition: data['cn_pre_job_detail_item_condition'],
                                branch_address: data['branch_address'],
                                branch_name: data['branch_name'],
                                created_by: data['created_by'],
                                created_date: data['created_date'],
                                record_status: data['record_status'],
                            };

                            let cn_jobno = data['cn_pre_job_jobno'];
                            let cn_pre_job_branch = data['cn_pre_job_branch'];
                            let gbarcode = data['cn_pre_job_item_barcode'];

                            $('#modal-frm_data').modal({

                                keyboard: false,
                                backdrop: 'static'

                            });


                            if (key === 'view') {

                                $.Details(citem);

                            } else if (key === 'edit') {


                                await $.Details(citem);
                                await $.Edit(citem);

                                setTimeout(function () {
                                    //$('.job_status_edit').removeClass('d-none')
                                    //$('#frm_data').find('input[name=item_condition]').prop('disabled', false);
                                    $('#frm_data').find('#pick_up_remark').prop('disabled', false);
                                    $('#frm_data').find('#job_status_edit').prop('disabled', false);
                                    $('#frm_data').find('#driver_id').prop('disabled', true);
                                    $('#frm_data').find('#cn_pre_job_remark_trp').prop('disabled', true);
                                    $('#frm_data').find('#source_site_code').prop('disabled', false);
                                    $('#frm_data').find('#driver_id').prop('disabled', true);

                                    $('#driver_id').parent().parent().addClass('d-none')
                                    $('#driver_free').parent().parent().removeClass('d-none')

                                }, 1000)

                            } else if (key === 'edit-trp') {

                                await $.Details(citem);
                                await $.Edit(citem);

                                setTimeout(function () {
                                    $('#frm_data').find('input[name=item_condition]').prop('disabled', true);
                                    $('#frm_data').find('#pick_up_remark').prop('disabled', true);
                                    $('#frm_data').find('#driver_id').prop('disabled', false);
                                    $('#frm_data').find('#cn_pre_job_remark_trp').prop('disabled', false);
                                    $('#frm_data').find('#source_site_code').prop('disabled', true);

                                    $('#driver_id').parent().parent().removeClass('d-none')
                                    $('#driver_free').parent().parent().addClass('d-none')

                                    //$('#driver_id').on('change', function () {
                                    //    if ($(this).val() === "driver_free") {
                                    //        $('#driver_free').parent().parent().removeClass('d-none')
                                    //        $('#driver_free').val('').prop('disabled', false)
                                    //    } else {
                                    //        $('#driver_free').parent().parent().addClass('d-none')
                                    //        $('#driver_free').val('').prop('disabled', true)

                                    //    }
                                    //})
                                }, 1000)


                            } else if (key === 'delete') {

                                $.Details(citem);
                                $.Delete(citem);

                            }
                            else if (key === 'create') {

                                $.Create();
                            }
                            else if (key === 'history') {

                                $.History(citem);
                            }
                            else if (key === 'invoice') {

                                $.Invoice(citem);

                            }
                            else if (key === 'cancel1') {

                                $.Cancel(citem, 'Cancel - บันทึกผิด');

                            }
                            else if (key === 'cancel2') {

                                $.Cancel(citem, 'Cancel - เปลี่ยนการรับแจ้ง');

                            }
                            else if (key === 'cancel3') {

                                $.Cancel(citem, 'Cancel - เปลี่ยนแปลงสาเหตุ');

                            }
                            else if (key === 'cancel4') {

                                $.Cancel(citem, 'Cancel - ยกเลิกรับคืน');

                            }
                            else if (key === 'edit1') {

                                $.UpdateStatus(citem, 'เปลี่ยนแปลง "รับคืน" เป็น "หน้างาน"', 'IVC');

                            }
                            else if (key === 'reject1') {

                                $.Reject(citem, 'Reject - ยกเลิกสินค้า');

                            }
                            else if (key === 'edit2') {

                                $.UpdateStatus(citem, 'เปลี่ยนแปลง "หน้างาน" เป็น "รับคืน"', 'TRP');

                            }
                            else {

                                alert('ERROR');

                            }

                        },

                        items: {
                            "view": { name: "View", icon: "fas fa-search" },
                            "edit": { name: "Edit", icon: "edit edit-detail ivc", disabled: true },
                            "edit-trp": { name: "Edit TRP", icon: "edit edit-detail-trp trp", disabled: true },
                            //"edit1": { name: "Update - เปลี่ยนแปลง 'รับคืน' เป็น 'หน้างาน'", icon: "edit change-status1 d-none", disabled: true },
                            //"edit2": { name: "Update - เปลี่ยนแปลง 'หน้างาน' เป็น 'รับคืน'", icon: "edit change-status2 d-none", disabled: true },
                            "sep1": "---------",
                            "history": { name: "History - ประวัติรายการ", icon: "fas fa-history" },
                            "invoice": { name: "Invoice - สั่งพิมพ์ใบงาน", icon: "fas fa-copy" },
                            "sep2": "---------",
                            "cancel1": { name: "Cancel - บันทึกผิด", icon: "delete ivc", disabled: true },
                            "cancel2": { name: "Cancel - เปลี่ยนการรับแจ้ง", icon: "delete ivc", disabled: true },
                            "cancel3": { name: "Cancel - เปลี่ยนแปลงสาเหตุ", icon: "delete ivc", disabled: true },
                            "cancel4": { name: "Cancel - ยกเลิกรับคืน", icon: "delete ivc", disabled: true },
                            "sep3": "---------",
                            "reject1": { name: "Reject - ยกเลิกสินค้า", icon: "delete reject-status ivc", disabled: true },
                        }

                    });


                    $("tbody").contextmenu(function (key) {
                        setTimeout(function () {
                            let Status_text = $('.context-menu-active .job_status span').html();
                            let type_text = $('.context-menu-active .job_type span').html();
                            let assige = $('.context-menu-active .assige span').html();
                            let item_status = $('.context-menu-active .item_status span').html();
                            let job_type = $('.context-menu-active .job_type span').html();


                            if (objProfile[0]['role'] == "เจ้าหน้าที่ (IVC)" && assige == "IVC") {
                                $('.edit-detail').removeClass('d-none')
                                $('.edit-detail-trp').addClass('d-none')

                            } else if (objProfile[0]['role'] == "เจ้าหน้าที่ (IVC)" && assige == "TRP") {
                                $('.edit-detail-trp').addClass('d-none')
                                $('.edit-detail').removeClass('d-none')
                                if (Status_text != "Open") {
                                    $('.edit-detail').removeClass('context-menu-disabled')
                                } else {
                                    $('.edit-detail').addClass('context-menu-disabled')
                                }

                            } else if ((objProfile[0]['role'] == "ผู้ดูแลระบบ (TRP)" || objProfile[0]['role'] == "พนักงานทั่วไป (TRP)")) {
                                $('.edit-detail-trp').removeClass('d-none').removeClass('context-menu-disabled')
                                $('.edit-detail').addClass('d-none')

                                if ((Status_text == "Open" || Status_text == "On Process") && assige == "TRP") {
                                    $('.edit-detail-trp').removeClass('context-menu-disabled')
                                } else {
                                    $('.edit-detail-trp').addClass('context-menu-disabled')
                                }
                            } else {
                                $('.edit-detail-trp').addClass('d-none')
                                $('.edit-detail').addClass('d-none')
                            }

                            if (user_id === 'ongkarn.s' || user_id === 'potjana.s' || user_id === 'kullanut.d' || user_id === 'narisara.k') {

                                $('#frm_data').find('#job_comment').prop('disabled', false)
                                $('#frm_data').find('#cn_qty').prop('disabled', false)
                                $('.context-menu-icon-delete').removeClass('context-menu-disabled');
                                $('.edit-detail').removeClass('context-menu-disabled');
                                $('.reject-status').removeClass('context-menu-disabled');

                                if (job_type == 'รับคืน' && (Status_text != 'Complete' || Status_text != 'Rejected')) {
                                    $('.change-status1').removeClass('context-menu-disabled');
                                } else if (job_type == 'หน้างาน' && (Status_text != 'Complete' || Status_text != 'Rejected')) {
                                    $('.change-status2').removeClass('context-menu-disabled');
                                } else {
                                    $('.change-status1').addClass('context-menu-disabled');
                                    $('.change-status2').addClass('context-menu-disabled');
                                }

                            }

                        }, 200);
                    });
                },
            });
        }
    })

};

$.Driver_Get = async function () {

    $.ajax({
        async: false,
        url: 'https://vsk.tms-vcargo.com/api/tms/public/v1/driver/search',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({ 'code': '', 'name': '' }),
        success: function (result) {

            if (result.object.length > 0) {

                Master_dataSet = [];

                $.each(result.object, function (key, val) {

                    Master_dataSet.push({ id: val['code'], text: (val['code'] + ' : ' + val['firstNameTh'] + ' ' + val['lastNameTh']) });

                });

                $('#frm_data').find('#driver_id').select2({
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

            } else {

                toastr.warning('ไม่พบข้อมูลพนักงาน');

            }

        }

    });

}

$.Details = async function (citem) {

    let Get_Detail = new URL(lists_history);

    Get_Detail.search = new URLSearchParams({
        cn_branch_pre_job_id: citem['cn_id'],
        record_status: '1',
    });

    fetch(Get_Detail).then(function (response) {
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
            //get data deatil last one
            let array = result.data
            let deatailDriver = array[array.length - 1].cn_pre_job_detail_driver;
            let deatailPickupDate = array[array.length - 1].cn_pre_job_detail_pickup_date;
            let deatailRemark = array[array.length - 1].cn_pre_job_detail_remark;
            let remark_trp = array[array.length - 1].cn_pre_job_remark_trp;
            deatailCondition = array[array.length - 1].cn_pre_job_detail_item_condition;

            let driver_name = deatailDriver != '' ? deatailDriver != null ? Driver_Find(deatailDriver, '') : '' : ''

            $('#frm_data').find('#pick_up_remark').val(deatailRemark);
            $('#frm_data').find('#driver_id').val(deatailDriver).trigger('change');
            $('#frm_data').find('#driver_name').val(driver_name);
            $('#frm_data').find('#pick_up_date').val(moment(deatailPickupDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss'));
            $('#frm_data').find('#cn_pre_job_remark_trp').val(remark_trp);


            let rq = objProfile[0]['role'] == "เจ้าหน้าที่ (IVC)" ? citem['cn_status'] != 'open' ? 'required' : '' : '';

            if (deatailCondition == "1") { // get checked
                $('.item_condition').replaceWith('<div class="col-sm-9 item_condition"><input  class="col-sm-2" type="radio" id="item_good" name="item_condition" value="1" disabled  checked="checked"  ' + rq + '><label for="good">สมบูรณ์</label><br><input class="col-sm-2" type="radio" id="item_bad" name="item_condition" value="2" disabled ' + rq + '><label for="bad">ไม่สมบูรณ์</label><br></div>');
            } else if (deatailCondition == "2") {
                $('.item_condition').replaceWith('<div class="col-sm-9 item_condition"><input  class="col-sm-2" type="radio" id="item_good" name="item_condition" value="1" disabled ' + rq + '><label for="good">สมบูรณ์</label><br><input class="col-sm-2" type="radio" id="item_bad" name="item_condition" value="2" checked="checked" disabled ' + rq + '><label for="bad">ไม่สมบูรณ์</label><br></div>');
            } else {
                $('.item_condition').replaceWith('<div class="col-sm-9 item_condition"><input  class="col-sm-2" type="radio" id="item_good" name="item_condition" value="1" disabled ' + rq + '><label for="good">สมบูรณ์</label><br><input class="col-sm-2" type="radio" id="item_bad" name="item_condition" value="2" disabled ' + rq + '><label for="bad">ไม่สมบูรณ์</label><br></div>');
            }
        }

    });


    $('#frm_data').find('input, select').prop("disabled", true);

    if (citem['cn_status'] == "open") {
        $('#frm_data').find('#job_status').css('color', 'red');
    } else if (citem['cn_status'] == "on_process") {
        $('#frm_data').find('#job_status').css('color', 'orange');
    } else if (citem['cn_status'] == "receive") {
        $('#frm_data').find('#job_status').css('color', 'green');
    } else if (citem['cn_status'] == "complete") {
        $('#frm_data').find('#job_status').css('color', 'green');
    } else if (citem['cn_status'] == "rejected") {
        $('#frm_data').find('#job_status').css('color', 'red');
    } else if (citem['cn_status'] == "cancel") {
        $('#frm_data').find('#job_status').css('color', '#FFC300');
    }


    $('#frm_data').find('#cn_datetime').val(moment(citem['cn_datetime'], 'YYYY-MM-DD').format('DD/MM/YYYY') + "  " + moment(citem['cn_datetime']).format('HH:mm:ss')).prop("disabled", true);
    $('#frm_data').find('#job_status').val(citem['cn_status']).prop("disabled", true);
    $('#frm_data').find('#job_assige').val(citem['cn_pre_job_assige']).prop("disabled", true);
    $('#frm_data').find('#cn_pre_job_branch').val(citem['cn_pre_job_branch']).prop("disabled", true);
    $('#frm_data').find('#cn_pre_job_item_name').val(citem['cn_pre_job_item_name']).prop("disabled", true);
    $('#frm_data').find('#cn_qty').val(citem['cn_qty']);
    $('#frm_data').find('#created_by').val(citem['created_by']);
    $('#frm_data').find('#source_site_code').val(citem['cn_type']);
    $('#frm_data').find('#job_comment').val(citem['job_comment']).trigger('change');

};

$.Edit = async function (citem) {

    let status = citem['cn_status'];
    let cn_pre_job_detail_status;
    let cn_pre_job_detail_assige = citem['cn_job_assige'];
    let cn_type = citem['cn_type'];

    if (objProfile[0]['role'] == "เจ้าหน้าที่ (IVC)") {

        if (citem['cn_status'] == 'open') {
            cn_pre_job_detail_status = 'open'
            cn_pre_job_detail_assige = "TRP"

            $('.job_status_edit').addClass('d-none')

            setTimeout(function () {
                $('#frm_data').find('input[name=item_condition]').prop('disabled', true);
            }, 1000)

        } else {
            cn_pre_job_detail_status = $('#job_status_edit option:selected').val();
            $('#job_status_edit').change(function () {
                cn_pre_job_detail_status = $('#job_status_edit option:selected').val();
            })

            cn_pre_job_detail_assige = "IVC"
            $('.job_status_edit').removeClass('d-none')
            setTimeout(function () {
                $('#frm_data').find('input[name=item_condition]').prop('disabled', false);
            }, 1000)
        }


    } else if ((objProfile[0]['role'] == "ผู้ดูแลระบบ (TRP)" || objProfile[0]['role'] == "พนักงานทั่วไป (TRP)")) {

        if (status == "open") {
            cn_pre_job_detail_assige = "TRP" // เมื่อ TRP เข้ารับของแล้วจะส่งต่อให้ IVC
            cn_pre_job_detail_status = "open";
            $('.job_status_edit').addClass('d-none')

            $('#driver_id').on('change', function () {
                if ($(this).val() != '') {
                    cn_pre_job_detail_status = "on_process"

                } else {
                    cn_pre_job_detail_status = "open"

                }
            })
        } else if (status == "on_process") {
            cn_pre_job_detail_assige = "TRP" // เมื่อ TRP ต้องการแก้ไข remark ระหว่างสถานะ on process
            cn_pre_job_detail_status = "on_process"
        }

    }


    if (user_id === 'ongkarn.s' || user_id === 'pronnapa.d' || user_id === 'potjana.s' || user_id === 'kullanut.d' || user_id === 'narisara.k') {

        $('#frm_data').find('#job_comment').prop('disabled', false)


    } else {

        $('#frm_data').find('#job_comment').prop('disabled', true)

    }




    $('#btn-save_exit').on('click', function (e) {

        $('#frm_data').parsley().on('form:submit', function () {

            if (status == "open" && (objProfile[0]['role'] == "ผู้ดูแลระบบ (TRP)" || objProfile[0]['role'] == "พนักงานทั่วไป (TRP)") && ($('#driver_id').val() != '') || $('#driver_id').val() != "driver_free") {
                $.Create_job_trp_tms(citem);
            }

            $('#modal-frm_data').modal('hide');

            $("#global-loader").fadeIn("slow");

            $('.btn-save_form').prop('disabled', true);
            let item_condition = $('input[name=item_condition]:checked').val();

            if (item_condition == undefined) {
                item_condition = '';
            } else {
                item_condition = $('input[name=item_condition]:checked').val();
            }
            // Model & Repo
            let edit_data = {
                cn_branch_pre_job_id: citem['cn_id'],
                cn_pre_job_detail_assige: cn_pre_job_detail_assige,
                cn_pre_job_detail_driver: $('#frm_data').find('#driver_id').val() === "driver_free" ? $('#driver_free').val() : $('#frm_data').find('#driver_id').val(),
                cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                cn_pre_job_detail_status: cn_pre_job_detail_status,
                cn_pre_job_detail_remark: $('#frm_data').find('#pick_up_remark').val(),
                cn_pre_job_detail_item_condition: item_condition,
                cn_pre_job_detail_comment: $('#job_comment').val(),
                cn_pre_job_remark_trp: $('#cn_pre_job_remark_trp').val(),
                created_by: user_id,
                record_status: '1',
                pMessage: ''
            };

            var params = [];
            for (const i in edit_data) {
                params.push(i + "=" + encodeURIComponent(edit_data[i]));
            }

            var resStatus = 0;

            fetch(update_detail, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                resStatus = data.status
                return data.json();
            }).then(data => {
                resStatus = data.status;

                if (data.status === 'Error') {

                    toastr.error(data.error_message, async function () {

                        $("#global-loader").fadeIn("slow");

                        oTable.destroy();

                        $('.btn-save_form').prop('disabled', false);
                        $("#frm_data").parsley().reset();

                        $('#modal-frm_data').modal('hide');
                        $.List();

                    });

                } else {

                    toastr.success('Save Successfully!', async function () {

                        $("#global-loader").fadeIn("slow");

                        oTable.destroy();

                        $('.btn-save_form').prop('disabled', false);
                        $("#frm_data").parsley().reset();

                        // $.Invoice(cn_jobno, salefile_number, gbarcode, salefile_invcode)
                        //  $.Invoice(citem['cn_pre_job_jobno'], citem['salefile_number'], citem['saletra_item_barcode'], citem['salefile_invcode'])

                        $('#modal-frm_data').modal('hide');

                        $.List();

                    });

                }

            }).catch(error => {
                toastr.error(error, 'Error writing document');
                //console.error("Error writing document: ", error);
            })

            return false;

        });

    });



};

$.History = async function (citem) {

    let url_history = new URL(lists_history);


    $('#modal-frm_data').modal('hide');

    //$.Driver_Get('', '');

    url_history.search = new URLSearchParams({
        cn_branch_pre_job_id: citem['cn_id'],
        record_status: '1',
    });

    fetch(url_history).then(function (response) {
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
            $('#modal-frm_history').modal('show');

            //$('#tbl-list-history').css({ "table-layout": "fixed", "width": "100%" });
            $('#tbl-list-history').css({ "width": "100%" });

            $('#modal-frm_history').find('.modal-title').html('ประวัติรายการ :  ' + citem['branch_name'] + ' - ' + citem['cn_pre_job_item_name'])

            history_Table = $('#tbl-list-history').DataTable({
                data: result.data,
                //scrollX: true,
                //scrollCollapse: true,
                // autoWidth: true,
                paging: true,
                columns: [
                    {
                        title: "created_date",
                        data: "created_date",
                        visible: false
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>วันที่/เวลา</span>",
                        data: "created_date",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '  ' + moment(data).format('HH:mm') + '<span/>';
                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>ผู้รับผิดชอบ</span>",
                        data: "cn_pre_job_detail_assige",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span">' + data + '</span>';
                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>คนขับรถ</span>",
                        data: "cn_pre_job_detail_driver",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == null || data == '') {
                                return '<span>' + "" + '</span>';

                            } else {
                                return '<span>' + Driver_Find(data, '') + '</span>';
                            }
                        }
                    }, //5
                    {
                        title: "<span style='font-size:11px;'>สถานะ</span>",
                        data: "cn_pre_job_detail_status",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {

                            if (data == 'open') {
                                return '<span style="color:red; ">Open</span>';
                            } else if (data == "on_process") {
                                return '<span style="color:orange;">On Process</span>';
                            } else if (data == "receive") {
                                return '<span style="color:green;">Receive</span>';
                            } else if (data == "complete") {
                                return '<span style="color:green;">Complete</span>';
                            } else if (data == "rejected") {
                                return '<span style="color:red;">Rejected</span>';
                            } else if (data == "change") {
                                return '<span style="color:#00AEFF;">Change</span>';
                            } else if (data == "cancel") {
                                return '<span style="color:#FFC300">Cancel</span>';
                            } else {
                                return '<span style="color:#000">' + data + '</span>';
                            }

                        }
                    }, //6
                    {
                        title: "<span style='font-size:11px;'>สาเหตุ</span>",
                        data: "cn_pre_job_detail_comment",
                        width: "150px",
                        //visible: false,
                        class: "tx-center",

                        render: function (data, type, row, meta) {

                            let job_comment_obj = job_comment_dataSet.find(obj => obj.id === data);
                            return '<span style="font-size:11px;">' + job_comment_obj.text + '</span>';

                        }

                    }, //7
                    {
                        title: "<span style='font-size:11px;'>หมายเหตุ</span>",
                        data: "cn_pre_job_detail_remark",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == null) {
                                return '<span style="font-size:11px;">' + "" + '</span>';

                            } else {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        }
                    }, //8
                    {
                        title: "<span style='font-size:11px;'>สภาพสินค้า</span>",
                        data: "cn_pre_job_detail_item_condition",
                        //width: "70px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == "1") {
                                return '<span style="color:green;">สมบูรณ์ </span>';
                            } else if (data == "2") {
                                return '<span style="color:red;">ไม่สมบูรณ์ </span>';
                            } else {
                                return '<span> </span>';
                            }
                        }
                    }, //9

                ],

            });




        }
    })
};

$.Invoice = async function (citem) { // kung create function 17/11/20
    $('#modal-frm_data').modal('hide');
    //window.location.href = export_invoice +
    //    '?cn_pre_job_jobno=' + cn_jobno +
    //    '&salefile_number=' + salefile_number +
    //    '&gbarcode=' + gbarcode +
    //    '&salefile_invcode=' + salefile_invcode;

    let url = export_invoice + '&cn_pre_job_jobno=' + citem['cn_pre_job_jobno'];
    window.open(url, '_blank');

    //    $.addLogEvent(cn_jobno, 'VSM', 'Print', 'cn/job_list', 'OK');
};

$.Cancel = async function (citem, job_cancel) {

    $('#modal-frm_data').modal('hide');

    swal({
        title: '<span style="font-size:18px;">ยืนยันการยกเลิกใบงาน ' + citem['cn_pre_job_jobno'] + ' หรือไม่ ? </span>',
        text: 'สาขา ' + citem['cn_pre_job_branch'] + '<br>' + ' รหัสอ้างอิง ' + citem['cn_pre_job_jobno'] + '<br>' + 'รายการสินค้า ' + citem['cn_pre_job_item_name'],
        html: '?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }, function (isConfirm) {

        if (isConfirm) {

            let edit_data = {
                cn_branch_pre_job_id: citem['cn_id'],
                cn_pre_job_detail_assige: 'IVC',
                cn_pre_job_detail_driver: '',
                cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                cn_pre_job_detail_status: 'cancel',
                cn_pre_job_detail_remark: job_cancel,
                cn_pre_job_detail_item_condition: '',
                cn_pre_job_detail_comment: citem['job_comment'],
                created_by: user_id,
                record_status: '1',
                pMessage: ''
            };

            var params = [];
            for (const i in edit_data) {
                params.push(i + "=" + encodeURIComponent(edit_data[i]));
            }

            var resStatus = 0;

            fetch(update_detail, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                resStatus = data.status
                return data.json();
            }).then(data => {
                resStatus = data.status;

                toastr.success('Save Successfully!', async function () {

                    $("#global-loader").fadeIn("slow");

                    oTable.destroy();

                    $.List();

                });



            }).catch(error => {
                toastr.error(error, 'Error writing document');

            })

        }
    })


    //$.addLogEvent(citem, 'VSM', 'Cancel', 'cn/job_list', 'OK');

}

$.Reject = async function (citem, job_cancel) {


    $('#modal-frm_data').modal('hide');

    swal({
        title: '<span style="font-size:18px;">ยืนยันการยกเลิกใบงาน ' + citem['cn_pre_job_jobno'] + ' หรือไม่ ? </span>',
        html: '<span style="font-size:14px;">รหัสอ้างอิง ' + citem['cn_pre_job_jobno'] + '</span>',
        text: 'สาขา ' + citem['cn_pre_job_branch'] + '<br>' + 'รายการสินค้า ' + citem['cn_pre_job_item_name'],
        html: '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }, function (isConfirm) {

        if (isConfirm) {

            let edit_data = {
                cn_branch_pre_job_id: citem['cn_id'],
                cn_pre_job_detail_assige: 'IVC',
                cn_pre_job_detail_driver: '',
                cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                cn_pre_job_detail_status: 'rejected',
                cn_pre_job_detail_remark: 'Reject - ยกเลิกสินค้า',
                cn_pre_job_detail_item_condition: '',
                cn_pre_job_detail_comment: citem['job_comment'],
                created_by: user_id,
                record_status: '1',
                pMessage: ''
            };

            var params = [];
            for (const i in edit_data) {
                params.push(i + "=" + encodeURIComponent(edit_data[i]));
            }

            var resStatus = 0;

            fetch(update_detail, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                resStatus = data.status
                return data.json();
            }).then(data => {
                resStatus = data.status;
                /*
                if (data.status === 'Error') {

                    toastr.error(data.error_message, async function () {

                        $("#global-loader").fadeIn("slow");

                        oTable.destroy();

                        $.List('Search');

                    });

                } else {
                */
                toastr.success('Save Successfully!', async function () {

                    $("#global-loader").fadeIn("slow");

                    oTable.destroy();

                    $.List();

                });

                // }

            }).catch(error => {
                toastr.error(error, 'Error writing document');
                //console.error("Error writing document: ", error);
            })

            /*
            swal(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
            */
        }
    })


    //$.addLogEvent(citem, 'VSM', 'Reject', 'cn/job_list', 'OK');

}

$.Delete = async function (citem) {

    $('#btn-save_exit').html('Delete').show();
    $('#btn-save_exit').removeClass('btn-primary').addClass('btn-danger');

    $('#btn-save_exit').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let data_citem = {
                record_status: 'D',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['schedule_id']).update(data_citem).then(function () {

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
                        $('#modal-frm_data').modal('hide');
                        location.reload();
                    }, 1000);

                });

            }).catch(function (error) {

                toastr.error(error, 'Error writing document');
                console.error("Error writing document: ", error);

            });

            return false;

        });

    });

};

$.Create_job_trp_tms = async function (citem) {
    let uuid = $.uuid();

    let driver_raw = $("#driver_id option:selected").text();

    const driver = driver_raw.split(":")

    let add_data = [];

    add_data = {
        tran_id: uuid,
        job_date: moment().format("YYYY-MM-DD"),
        job_invoice_no: citem["cn_pre_job_jobno"],
        job_invoice_date: moment().format("YYYY-MM-DD"),
        job_pk_no: citem["cn_qty"],
        job_qty: "1",
        invnet: "0",
        invcode: citem["cn_pre_job_jobno"],
        job_delivery_name: citem["branch_name"],
        job_delivery_addr: citem["branch_address"],
        route_no: "RTB",
        route_name: "เรียกรับคืนสินค้าจากสาขา",
        driver_id: $("#frm_data").find("#driver_id").val(),
        driver_fullname: $.trim(driver[1]),
        job_plate: $("#frm_data").find("#driver_id").val(),
        plate_name: $("#frm_data").find("#driver_id").val(),
        created_by: user_id,
    };

    var params = [];
    for (const i in add_data) {
        params.push(i + "=" + encodeURIComponent(add_data[i]));
    }

    await fetch(url_api_trp + "/v1/trp_tms_job_express_add", {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        // mode: 'no-cors', // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: params.join("&"),
    }).then((result_export) => {
        return result_export.json();
    }).then((result_export) => {
        //console.log(data);
        let resStatus = result_export.status;

        if (result_export.status === "Error") {
            toastr.error(result_export.error_message);
            $.LoadingOverlay("hide");
        } else {
            citem_job = [
                {
                    deliveryProjectCode: result_export.data[0]["deliveryProjectCode"],
                    underDistributionCenterCode: result_export.data[0]["underDistributionCenterCode"],
                    vehicleLicensePlate: $("#frm_data").find("#driver_id").val(),
                    vehicleFuelUseRate: result_export.data[0]["vehicleFuelUseRate"],
                    vehiclePercentReFuel: result_export.data[0]["vehiclePercentReFuel"],
                    addOnVehicleLicensePlate: result_export.data[0]["addOnVehicleLicensePlate"],
                    driverCode: $("#frm_data").find("#driver_id").val(),
                    driverName: result_export.data[0]["driverName"], /// ติดไว้สักครู่
                    manifestNoteCreateDate: moment().format("YYYY-MM-DD"),
                    manifestNoteStartType: result_export.data[0]["manifestNoteStartType"],
                    startDistributionCenterCode: "VSM",
                    endRouteLineCode: "RTB",
                    receiveProductDate: $("#frm_data").find("#driver_id").val(),
                    shippingNoteList: [
                        {
                            shippingNoteCode: result_export.data[0]["shippingNoteCode"],
                            shippingNoteDescription: result_export.data[0]["shippingNoteDescription"],
                            deliveryDate: moment().format("YYYY-MM-DD"),
                            packageNumber: "-",
                            productAmount: result_export.data[0]["productAmount"],
                            codPrice: result_export.data[0]["codPrice"],
                            weight: result_export.data[0]["weight"],
                            volume: result_export.data[0]["volume"],
                            senderName: result_export.data[0]["senderName"],
                            receiverName: $('#cn_pre_job_branch').val(),
                            actualReceiverName: $('#cn_pre_job_branch').val(),
                            receiverContact: 0,
                            receiverAddress: result_export.data[0]["receiverAddress"],
                            endRouteLineCode: result_export.data[0]["endRouteLineCode"],
                            lat: result_export.data[0]["lat"],
                            lng: result_export.data[0]["lng"],
                            productCode: citem["cn_pre_job_jobno"],
                            deliveryProjectCode: result_export.data[0]["deliveryProjectCode"],
                            startConsumerDistributionCenterCode: result_export.data[0]["startConsumerDistributionCenterCode"],
                        },
                    ],
                },
            ];
        }
    });

    await $.ajax({
        async: false,
        url: "https://vsk.tms-vcargo.com/api/tms/public/v1/manifestnote/create-shipping-note-and-create-manifest-customer",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({ manifestNoteList: citem_job }),
        success: function (result) {
            citem_job = [];
        },
    });

}

$.UpdateStatus = async function (citem, comment, assige) {

    $('#modal-frm_data').modal('hide');

    swal({
        title: 'ยืนยันการ' + comment + ' หรือไม่ ?',
        text: 'สาขา ' + citem['cn_pre_job_branch'] + '<br>' + ' รหัสอ้างอิง ' + citem['cn_pre_job_jobno'] + '<br>' + 'รายการสินค้า ' + citem['cn_pre_job_item_name'],
        html: '?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }, function (isConfirm) {

        if (isConfirm) {

            let edit_data = {
                cn_branch_pre_job_id: citem['cn_id'],
                cn_pre_job_detail_assige: 'IVC',
                cn_pre_job_detail_driver: '',
                cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                cn_pre_job_detail_status: 'change',
                cn_pre_job_detail_remark: comment,
                cn_pre_job_detail_item_condition: '',
                cn_pre_job_detail_comment: citem['job_comment'],
                created_by: user_id,
                record_status: '1',
                pMessage: ''
            };

            var params = [];
            for (const i in edit_data) {
                params.push(i + "=" + encodeURIComponent(edit_data[i]));
            }

            var resStatus = 0;

            fetch(update_detail, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                resStatus = data.status
                return data.json();
            }).then(data => {
                resStatus = data.status;

                let edit_change_data

                if (assige == 'IVC') {

                    edit_change_data = {
                        cn_branch_pre_job_id: citem['cn_id'],
                        cn_pre_job_detail_assige: 'IVC',
                        cn_pre_job_detail_driver: '',
                        cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        cn_pre_job_detail_status: 'open',
                        cn_pre_job_detail_remark: comment,
                        cn_pre_job_detail_item_condition: '',
                        cn_pre_job_detail_comment: citem['job_comment'],
                        created_by: user_id,
                        record_status: '1',
                        pMessage: ''
                    };

                } else if (assige == 'TRP') {

                    edit_change_data = {
                        cn_branch_pre_job_id: citem['cn_id'],
                        cn_pre_job_detail_assige: 'TRP',
                        cn_pre_job_detail_driver: '',
                        cn_pre_job_detail_pickup_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        cn_pre_job_detail_status: 'open',
                        cn_pre_job_detail_remark: comment,
                        cn_pre_job_detail_item_condition: '',
                        cn_pre_job_detail_comment: citem['job_comment'],
                        created_by: user_id,
                        record_status: '1',
                        pMessage: ''
                    };

                }

                var params_change = [];
                for (const i in edit_change_data) {
                    params_change.push(i + "=" + encodeURIComponent(edit_change_data[i]));
                }

                var resStatus = 0;

                fetch(update_detail, {
                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                    // mode: 'no-cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params_change.join("&"),
                }).then(data => {
                    resStatus = data.status
                    return data.json();
                }).then(data => {
                    resStatus = data.status;

                    toastr.success('Save Successfully!', async function () {

                        $("#global-loader").fadeIn("slow");

                        oTable.destroy();

                        $.List();

                    });


                }).catch(error => {
                    toastr.error(error, 'Error writing document');
                    //console.error("Error writing document: ", error);
                })


            }).catch(error => {
                toastr.error(error, 'Error writing document');
                //console.error("Error writing document: ", error);
            })

        }
    })


    //$.addLogEvent(citem, 'VSM', 'Cancel', 'cn/job_list', 'OK');

}

function Driver_Find(code, name) {

    let full_name = ''

    $.ajax({
        async: false,
        url: 'https://vsk.tms-vcargo.com/api/tms/public/v1/driver/search',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({ 'code': code, 'name': name }),
        success: function (result) {

            if (result.object.length > 0) {

                $.each(result.object, function (key, val) {

                    full_name = val['code'] + ' : ' + val['firstNameTh'] + ' ' + val['lastNameTh'];
                    return false;

                });


            } else {

                full_name = code;
                return false;
            }

            return false;


        }

    });
    return full_name;

}

$(document).ready(async function () {

    await $.init();
    //$.LoadingOverlay("show");
});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {
        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");

        //console.log('user', user.email);

    } else {

        window.location.assign('./login');

    }

});