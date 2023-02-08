'use strict';

let fs = firebase.firestore();
let oTable, history_Table, role_code, mode;
let inventorycode_dataset = [];
let invfrecode_dataset = [];
var name;
let invname_dataSet = [];
let invname_dataSet_list = [];
let job_sec_dataSet = [];
let job_detp_dataSet = [];
let job_pos_dataSet = [];

const url_api = "http://localhost:49705/";
const url_quarter_get = url_api + '/api/Hr_Quarter_Get';
const url_quarter_update = url_api + '/api/Hr_Quarter_Update';

const objProfile = JSON.parse(localStorage.getItem('objProfile'));
let validator, table, options, item_action, item_id, deatailCondition;


firebase.auth().onAuthStateChanged(function (user) {
     
    if (user) {
        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");
       

    } else {

        window.location.assign('./login');

    }

});

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

    $('#frm_search').submit(async function (e) {

        e.preventDefault();

        $("#global-loader").fadeIn("slow");

        oTable.destroy();

        $.List();

    });

    $('.reset').on("click", function (e) {

        $('#frm_search').find('select').val('').trigger('change');

        e.preventDefault();

    });

    $('#modal-frm_data').on('hidden.bs.modal', function () {




    });

    $('#btn-emp_create').click(function (e) {

        e.preventDefault();

        $.Create();

        $.Ck_Employee_code();

    });

};

$.List = async function () {

    let url = new URL(url_quarter_get);

    url.search = new URLSearchParams({

        employee_id: ''

    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {

        if (result.status === 'Error') {

            $("#global-loader").fadeOut("slow");

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            }).then((result) => {
                if (result.isConfirmed) {

                    location.reload();

                }
            })

        } else {

            oTable = $('#tbl-list').DataTable({
                data: result.data,
                //scrollX: true,
                //scrollCollapse: true,
                //autoWidth: true,
                //scrollY: "300px",
                scrollCollapse: true,
                paging: false,
                paging: true,
                //dom: 'Bfrtip',
                //buttons: [
                //    'copy', 'excel'
                //],
                columns: [
                    {
                        title: "<span style='font-size:11px;'>รอบประเมิน Quarter</span>",
                        data: "quarter_name",
                        class: "tx-center",
                        width: "70px",
                        //visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>' + '  ' + '<span style="font-size:11px;">' + row.quarter_year  + '</span>';
                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>ปี Year</span>",
                        data: "quarter_year",
                        class: "tx-center",
                        width: "150px",
                        visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;  color:;">' + data + '</span>';
                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>สถานะ Status</span>",
                        data: "quarter_status",
                        class: "tx-center",
                        width: "30px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return '<span class="badge badge-success">ใช้งาน</span >'
                            } else if (data == 0) {
                                return '<span class="badge badge-danger">ไม่ใช้งาน</span >'
                            } else {
                                return '<span class="badge badge-secondary">รอ</span >'
                            }
                        }
                    }, //8
                ],
                //"order": [[1, "desc"]],
                "initComplete": function (settings, json) {

                    $("#global-loader").fadeOut("slow");

                    $.contextMenu({
                        selector: '#tbl-list tbody tr',
                        callback: async function (key, options) {

                            let data = oTable.row(this).data();
                            let citem = {
                                quarter_id: data['quarter_id'],
                                quarter_code: data['quarter_code'],
                                quarter_name: data['quarter_name'],
                                quarter_year: data['quarter_year'],
                                quarter_order: data['quarter_order'],
                                quarter_status: data['quarter_status'],
                                created_by: data['created_by'],
                                created_date: data['created_date'],
                                updated_by: data['updated_by'],
                                updated_date: data['updated_date'],
                                record_status: data['record_status'],
                            };

                            $('#modal-frm_data').modal({

                                keyboard: false,
                                backdrop: 'static'

                            });

                             if (key === 'edit') {

                                await $.Edit(citem);

                            } else {

                                alert('ERROR');

                            }
                        },
                        items: {

                            "edit": { name: "Edit", icon: "edit" },
                         
                        }
                    });



                },
            });


        }
    })

};

//$.Create = async function () {

//    $('#btn-submit').show();
//    $('#frm_data input').val('');
//    $('#frm_data select').val('');
//    $("input[name~='employee_code']").val('').prop('readonly', false);
//    $("input[name~='employee_name']").val('').prop('readonly', false);
//    $("input[name~='employee_nickname']").val('').prop('readonly', false);
//    $('#frm_data').find('#employee_prefix').prop('disabled', false);
//    $('#frm_data').find('.employee_sec').prop('disabled', false);
//    $('#frm_data').find('.employee_dept').prop('disabled', false);
//    $('#frm_data').find('.employee_pos').prop('disabled', false);
//    $('#frm_data').find('#employee_job_startdate').prop('disabled', false);
//    $('#frm_data').find('#employee_leader_asses1').prop('disabled', false);
//    $('#frm_data').find('#employee_leader_asses2').prop('disabled', false);
//    $('#frm_data').find('#employee_leader_asses3').prop('disabled', false);
//    $('#frm_data').find('#employee_form_id').val('').trigger('change').prop('disabled', false);
//    $('#frm_data').parsley().on('form:submit', function () {
//        $.LoadingOverlay("show");

//        $('.btn-save_form').prop('disabled', true);
//        let start_date = moment($('#frm_data').find('#employee_job_startdate').val(), 'DD-MM-YYYY').format('YYYY/MM/DD')
//        // Model & Repo
//        let add_data = {

//            employee_code: $('#frm_data').find('#employee_code').val(),
//            employee_prefix: $('#frm_data').find('#employee_prefix').val(),
//            employee_name: $('#frm_data').find('#employee_name').val(),
//            employee_nickname: $('#frm_data').find('#employee_nickname').val(),
//            employee_sec: $('#frm_data').find('#employee_sec_id').val(),
//            employee_dept: $('#frm_data').find('#employee_dept_id').val(),
//            employee_pos: $('#frm_data').find('#employee_pos_id').val(),
//            employee_job_startdate: start_date,
//            employee_leader_asses1: $('#frm_data').find('#employee_leader_asses1').val(),
//            employee_leader_asses2: $('#frm_data').find('#employee_leader_asses2').val(),
//            employee_leader_asses3: $('#frm_data').find('#employee_leader_asses3').val(),
//            employee_form: $('#frm_data').find('#employee_form_id').val(),
//            created_by: name
//        };

//        var params = [];
//        for (const i in add_data) {
//            params.push(i + "=" + encodeURIComponent(add_data[i]));
//        }

//        fetch(url_employee_create, {
//            method: 'POST', // *GET, POST, PUT, DELETE, etc.
//            // mode: 'no-cors', // no-cors, *cors, same-origin
//            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//            credentials: 'same-origin', // include, *same-origin, omit
//            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
//            body: params.join("&"),
//        }).then(data => {

//            toastr.success('Save Successfully!', async function () {

//                $.LoadingOverlay("hide");

//                await oTable.destroy();

//                await $.List();

//                await setTimeout(function () {

//                    $('.btn-save_form').prop('disabled', false);

//                    // $("#frm_data").parsley().reset();

//                    $('#modal-frm_data').modal('hide');

//                }, 1000);

//            });

//        }).catch((error) => {
//            $.LoadingOverlay("hide");

//            console.error('Error:', error);
//        });

//        return false;

//    });

//};

//$.Details = async function (citem) {

//    $('#frm_data input').removeClass('parsley-error');
//    console.log('ดู', citem['employee_code']);
//    $('#btn-submit').hide();
//    $("input[name~='employee_code']").val(citem['employee_code']).prop('readonly', true);
//    $('#frm_data').find('#employee_prefix').val(citem['employee_prefix']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('#employee_name').val(citem['employee_name']).prop('readonly', true);
//    $('#frm_data').find('#employee_nickname').val(citem['employee_nickname']).prop('readonly', true);
//    $('#frm_data').find('.employee_sec').val(citem['employee_sec_id']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('.employee_dept').val(citem['employee_dept_id']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('.employee_pos').val(citem['employee_pos_id']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('#employee_job_startdate').val(moment(citem['employee_job_startdate'], 'YYYY-MM-DD').format('DD/MM/YYYY')).prop('disabled', true);
//    $('#frm_data').find('#employee_leader_asses1').val(citem['employee_leader_asses1']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('#employee_leader_asses2').val(citem['employee_leader_asses2']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('#employee_leader_asses3').val(citem['employee_leader_asses3']).trigger('change').prop('disabled', true);
//    $('#frm_data').find('#employee_form_id').val(citem['employee_form']).trigger('change').prop('disabled', true);



//};

$.Edit = async function (citem) {

    let status;


    setTimeout(function () {

        $('#frm_data').find('select').removeAttr('disabled');
        $('#frm_data').find('input').removeAttr('readonly');
        $('#btn-submit').show();

    }, 100);

    //$('#quarter_status').on('click', function () {
        //$(this).toggleClass('on');
        //$(this).toggleClass('quarter_status_yes');

        //if ($('.quarter_status_yes').data('status') == 1) {

        //    status = "1";

        //} else {

        //    status = "0";
        //}

        if ($('#quarter_status').hasClass('on') == true) {
            status = "1";
            console.log($('#quarter_status').hasClass('on'))
        } else {
            status = "0";
            console.log($('#quarter_status').hasClass('on'))

        }


    //})

    $('#frm_data').find('#quarter_name').html(citem['quarter_name']).prop('readonly', true);
    $('#frm_data').find('#quarter_year').val(citem['quarter_year']).prop('readonly', true);

   // $('#quarter_status.on').find('#quarter_status').val('1')
    //$(document).blur(function () {
    //    console.log($('#frm_data').find('#quarter_status').prop("checked"));
    //    console.log($('#frm_data').find('#quarter_status').val());
    //    console.log($('#frm_data').find('#quarter_status').html());
    //    console.log($('#frm_data').find('#quarter_status').text());
    //});

    $('#frm_data').parsley().on('form:submit', function () {

        $.LoadingOverlay("show");

        let add_data = {
            quarter_id: citem['quarter_id'],
            quarter_year: $('#frm_data').find('#quarter_year').val(),
            //record_status: $('#frm_data').find('#quarter_status').val(),
            //quarter_status: $('#frm_data').find('#quarter_status').val(),
            quarter_status: status,
            //quarter_status: $('#frm_data').find('#quarter_status').prop("checked") === true ? '1' : '0',
            //quarter_status: '0',
            updated_by: name
        };

        var params = [];
        for (const i in add_data) {
            params.push(i + "=" + encodeURIComponent(add_data[i]));
        }

        fetch(url_quarter_update, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            // mode: 'no-cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: params.join("&"),
        }).then(data => {

            toastr.success('Save Successfully!', async function () {

                $.LoadingOverlay("hide");

                await oTable.destroy();

                await $.List();

                //await setTimeout(function () {

                $('#modal-frm_data').modal('hide');

                //}, 1000);

            });

        }).catch((error) => {

            $.LoadingOverlay("hide");

            console.error('Error:', error);
        });

        return false;

    });

};

$(document).ready(async function () {

    await $.init();
    await $.List();

});