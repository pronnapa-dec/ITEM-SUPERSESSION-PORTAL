'use strict';

let fs = firebase.firestore();
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const empcode = objProfile[0]['empcode'];
let empid;
const customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'
    },

    "text": 'Please Wait...'
});
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var data_id, data_form, leader_assess_id;
let tbl_verify, tbl_results, tbl_confirm
const url_api = "http://localhost:49705/";
const url_hr_from = url_api + '/api/Hr_Form_Get';
const url_master_get = url_api + '/api/Hr_Master_Get';
const url_hr_employee_time = url_api + '/api/Hr_Employee_Time';
const url_hr_verify_employee = url_api + '/api/Hr_Verify_Employee';
const url_hr_verify_assess = url_api + '/api/Hr_Verify_Assess_Get';
const url_hr_updata_data = url_api + '/api/Hr_Update_Data';
const url_hr_delete_data = url_api + '/api/Hr_Delete_Data';
const url_results_admin_get = url_api + '/api/Hr_Results_Admin_Get';
const url_assess_confirm = url_api + '/api/Hr_Assess_Confirm';
const url_employee_get = url_api + '/api/Hr_Employee_Get';
const url_report_pms_get = url_api + '/api/Hr_Report_Pms';
const url_report_assess_get = url_api + '/api/Hr_Result_Assess_Get';
const url_Job_Get = url_api + '/api/Hr_Job_Get';

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        var full_mail = user.email;

        $.init = function () {

            $('#modal-frm_confirm').off('show.bs.modal').on('show.bs.modal', async function (e) {

                await setTimeout(async function () {

                    $("#frm_confirm").parsley().reset();

                    await $.Master_Confirm_Get();
                    await $.Confirm();

                }, 100);
            });

            $('#frm_search').find('#btn-search').on('click', async function (e) {

                e.preventDefault();

                await $.List(empid);
                await $.Master_Get(empid);
                await $.Verify_Assess($('#frm_search').find('#search_leader').val());
                /* $('.tbl-verify').removeClass('d-none')*/
            });

            $('#frm_search').find('#btn-reset').click(async function (e) {

                e.preventDefault();

                $('#frm_search').trigger('reset');
                /* $('.tbl-verify').addClass('d-none')*/
                $('.tbl-verify').empty()
                await $.List(empid);
                await $.Master_Get(empid);

            });

            $('#frm_confirm').find('#btn-search').on('click',  function (e) {

                e.preventDefault();

                $('#frm_confirm').parsley().validate();

                $('#frm_confirm').find('#title_confirm').html($('#frm_confirm').find('#search_quarter :selected').text())

                $.Confirm();

            });

            $('#frm_confirm').find('#btn-reset').click(async function (e) {

                e.preventDefault();

                $('#frm_confirm').trigger('reset');
                await $.Confirm();

            });

            $('.select2').change(function (e) {

                e.preventDefault();

                if ($(this).val() != '') {

                    //$(".select2 option").remove();
                    //$("#search_employee , #search_status , #search_section , #search_department , #search_position").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')
                    //$.Master_Get();

                } else {

                }

            });

            $.Master_Get();
        };

        $.List = async function () {

            let url = new URL(url_results_admin_get);

            url.search = new URLSearchParams({

                data_leader_assess: $('#frm_search').find('#search_leader').val() === '' ? '' : $('#frm_search').find('#search_leader').val(),
                data_employee_assess: $('#frm_search').find('#search_employee').val() === '' ? '' : $('#frm_search').find('#search_employee').val(),
                updated_status: $('#frm_search').find('#search_status').val() === '' ? '' : $('#frm_search').find('#search_status').val(),
                employee_sec: $('#frm_search').find('#search_section').val() === '' ? '' : $('#frm_search').find('#search_section').val(),
                employee_dept: $('#frm_search').find('#search_department').val() === '' ? '' : $('#frm_search').find('#search_department').val(),
                employee_pos: $('#frm_search').find('#search_position').val() === '' ? '' : $('#frm_search').find('#search_position').val(),
                data_form: $('#frm_search').find('#search_form').val() === '' ? '' : $('#frm_search').find('#search_form').val(),
                data_quarter: $('#frm_search').find('#search_quarter').val() === '' ? '' : $('#frm_search').find('#search_quarter').val(),
                data_assess_by: $('#frm_search').find('#search_assess_by').val() === '' ? '' : $('#frm_search').find('#search_assess_by').val(),

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

                    tbl_results = $('#tbl-results').DataTable({
                        data: result.data,
                        dom: 'frtip',
                        deferRender: true,
                        ordering: true,
                        pageLength: 10,
                        bDestroy: true,
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>Assessed by</span>",
                                data: "data_assess_by",
                                class: "tx-center align-middle",
                                width: "100px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 2) {
                                        return '<span class="label text-danger ">' + '<i class="fas fa-user-tie"></i></br>' + 'หัวหน้าประเมิน' + '</br></span >' +
                                            '<span class="label">' + moment(row.created_date).format('DD/MM/YYYY HH:mm') + '</span >'
                                    } else if (data == 1) {
                                        return '<span class="label text-primary ">' + '<i class="fas fa-user"></i></br>' + 'ตนเองประเมิน' + '</br></span >' +
                                            '<span class="label">' + moment(row.created_date).format('DD/MM/YYYY HH:mm') + '</span >'
                                    } else {
                                        return '-'
                                    }
                                }
                            }, //0
                            {
                                title: "<span style='font-size:11px;'>Assessment date</span>",
                                data: "created_date",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + moment(data).format('DD/MM/YYYY HH:mm') + '<span/>';
                                    } else {
                                        return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY HH:mm') + '<span/>';
                                    }
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Assessor</span>",
                                data: "leader_name",
                                width: "350px",
                                //visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;" class="tx-bold">' + row.leader_code + ' ' + data + '</span>' +
                                            '</br>' +
                                            '<span style="font-size:11px;">' + row.leader_sec + ' - ' + row.leader_dept + ' - ' + row.leader_pos + '</span>';
                                    }
                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>L_Section_L</span>",
                                data: "leader_sec",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>:L_Department_L</span>",
                                data: "leader_dept",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>Position_L</span>",
                                data: "leader_pos",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>Assess</span>",
                                data: "employee_name",
                                width: "350px",
                                //visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {

                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;" class="tx-bold">' + row.employee_code + ' ' + data + '</span>' +
                                            '</br>' +
                                            '<span style="font-size:11px;">' + row.employee_sec + ' - ' + row.employee_dept + ' - ' + row.employee_pos + '</span>';
                                    }
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>Section_E</span>",
                                data: "employee_sec",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //7
                            {
                                title: "<span style='font-size:11px;'>Department_E</span>",
                                data: "employee_dept",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>Position_E</span>",
                                data: "employee_pos",
                                class: "tx-center align-middle",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //9
                            {
                                title: "<span style='font-size:11px;'>PMS Score</span>",
                                data: "data_score_pms",
                                class: "tx-center align-middle",
                                width: "70px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through;" class="tx-bold tx-11 tx-danger">' + data + '</span>';
                                    } else {
                                        return '<span class="tx-bold tx-11 tx-primary">' + data + '</span>';
                                    }
                                }
                            }, //10
                            {
                                title: "<span style='font-size:11px;'>PMS Percentage</span>",
                                data: "data_percent_pms",
                                class: "tx-center align-middle",
                                width: "70px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through;" class="tx-bold tx-11 tx-danger">' + data + ' %' + '</span>';
                                    } else {
                                        return '<span class="tx-bold tx-11 tx-primary">' + data + ' %' + '</span>';
                                    }
                                }
                            }, //11
                            {
                                title: "<span style='font-size:11px;'>Time score</span>",
                                data: "time_score",
                                class: "tx-center align-middle",
                                width: "100px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through;" class="tx-bold tx-11 tx-danger">' + data + '</span>';
                                    } else {
                                        return '<span class="tx-bold tx-11 tx-primary">' + data + '</span>';
                                    }
                                }
                            }, //12
                            {
                                title: "<span style='font-size:11px;'>Assessment form</span>",
                                data: "data_form_name",
                                class: "tx-center align-middle",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px; font-weight:bold; color:#;">' + data + '</span>';
                                    }
                                }
                            }, //13
                            {
                                title: "<span style='font-size:11px;'>Quarter</span>",
                                data: "quarter_name",
                                class: "tx-center align-middle",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px; font-weight:bold; color:#;">' + data + '</span>';
                                    }
                                }
                            }, //14
                            {
                                title: "<span style='font-size:11px;'>Status</span>",
                                data: "updated_status",
                                class: "tx-center align-middle",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 1) {
                                        return '<span class="label text-success"><div class="dot-label bg-success mr-0"></div>สำเร็จ</span >'
                                    } else if (data == 2) {
                                        return '<span class="label text-danger"><div class="dot-label bg-danger mr-0"></div>ยกเลิก</span >'
                                    } else if (data == 0) {
                                        return '<span class="label text-secondary"><div class="dot-label bg-warning mr-0"></div>รอ</span >'
                                    } else {
                                        return '-'
                                    }
                                }
                            }, //15
                            {
                                title: "<span style='font-size:11px;'>leader_code</span>",
                                data: "leader_code",
                                width: "350px",
                                visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px; font-weight:bold; color:#;">' + data + '</span>';
                                }
                            }, //16
                            {
                                title: "<span style='font-size:11px;'>employee_code</span>",
                                data: "employee_code",
                                width: "350px",
                                visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px; font-weight:bold; color:#;">' + data + '</span>';
                                }
                            }, //17
                        ],
                        //"order": [[1, "desc"]],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-results tbody tr',
                                callback: async function (key, options) {

                                    let citem = tbl_results.row(this).data();

                                    if (key === 'view') {

                                        $.Details(citem);

                                    } else if (key === 'report') {

                                        await $.Form(citem);
                                        await $.Time(citem);
                                        await $.Report(citem);


                                    } else if (key === 'edit') {

                                        await $.Details(citem);

                                    } else if (key === 'delete') {

                                        await $.Details(citem);
                                        await $.Check_Delete(citem);


                                    } else {

                                        alert('ERROR');

                                    }
                                },
                                items: {
                                    "view": { name: "View", icon: "fas fa-search" },
                                    //"edit": { name: "Edit", icon: "edit" },
                                    "report": { name: "Report", icon: "far fa-file-alt" },
                                    "delete": { name: "Delete", icon: "delete" },
                                }
                            });

                        },
                    });


                }
            })

        };

        $.Details = async function (citem) {

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            console.log('Details', citem)

            let update_status = citem['updated_status'];

            $('#data_pms').html(moment(citem['created_date']).format('DD/MM/YYYY HH:mm'));

            $('#title_assess_pms').html(citem['employee_name']);
            $('#quarter_pms').html(citem['quarter_name']);
            $('#assessor_pms').html(citem['leader_name']);
            $('#assess_pms').html(citem['employee_name']);
            $('#score_pms').html(citem['data_score_pms']);
            $('#percentage_pms').html(citem['data_percent_pms']);
            $('#score_time').html(citem['time_score']);
            $('#remark_pms').val(citem['updated_command']).prop('disabled', true);
            $('.update_status').prop('disabled', true);
            $('input[type="radio"][value="' + update_status + '"]').prop('checked', true)

            $('#frm_data').find('#btn-save_exit').hide();

        };

        $.Check_Delete = async function (citem) {

            console.log('Delete', citem)

            let update_status = citem['updated_status'];
            let assess_by = citem['data_assess_by'];

            if (assess_by == 1) {

                $('#frm_data').find('#btn-save_exit').show();
                $.Delete(citem);

            } else {

                $('#frm_data').find('#btn-save_exit').hide();

                if (update_status == 2 || update_status == 1) {

                    $('#frm_data').find('#btn-save_exit').show();
                    $.Delete(citem);

                } else {

                    $('#frm_data').find('#btn-save_exit').hide();
                }
            }



        };

        $.Delete = async function (citem) {

            $("#btn-save_exit").on('click', function (e) {

                e.preventDefault();

                $('#frm_data').parsley().validate();

                if ($('#frm_data').parsley().isValid()) {

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
                                data_id: citem['data_id'],
                                updated_by: user_id,
                            };

                            var params = [];
                            for (const i in data_update) {
                                params.push(i + "=" + encodeURIComponent(data_update[i]));
                            }

                            fetch(url_hr_delete_data, {
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

                                        await setTimeout(function () {

                                            $.List();

                                            $('#modal-frm_data').modal('hide');


                                        }, 900);

                                    }, 2000);

                                }

                            }).catch(error => {

                                toastr.error('Error, Please contact administrator.');

                            });

                        } else {

                            swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                        }

                    });

                }
            });

        };

        $.Report = async function (citem) {

            await $('#modal-frm_assess').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#frm_assess').find('#btn-report-assess').on('click', async function (e) {

                e.preventDefault();

                //toastr.success('การประเมินสำเร็จ!');

                setTimeout(async function () {

                    let url_report = "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_HR_ASSESS&rs:Command=Render&data_id=" + citem['data_id'] + "";
                    window.open(url_report, '_blank');

                }, 100);

            });
            //console.log('Report', citem)

            let Get_Assess = new URL(url_report_assess_get);

            Get_Assess.search = new URLSearchParams({

                data_id: citem['data_id'],

            });

            fetch(Get_Assess).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

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

                    $(".tx-detail").empty();
                    $('#frm_assess').find('#title_assess_pms').html(citem['employee_name'])

                    $('#frm_assess').find('#h_employee_code').html(citem['employee_code']);
                    $('#frm_assess').find('#emp_assess').html(citem['employee_name']);
                    $('#frm_assess').find('#emp_assessor').html(citem['leader_name']);
                    $('#frm_assess').find('#h_employee_sec').html(citem['employee_sec']);
                    $('#frm_assess').find('#h_employee_dept').html(citem['employee_dept']);
                    $('#frm_assess').find('#h_employee_pos').html(citem['employee_pos']);
                    $('#frm_assess').find('#h_data_quarter').html(citem['quarter_name']);
                    $('#frm_assess').find('#asse_total_1').html(citem['data_score_pms'])
                    $('#frm_assess').find('#asse_percent_1').html(citem['data_percent_pms'])
                    $('#frm_assess').find('#comment_1_1').html(citem['data_c_good'])
                    $('#frm_assess').find('#comment_1_2').html(citem['data_c_fail'])

                    $.each(result.data, function (key, val) {

                        var employee_job_startdate = moment(val['employee_job_startdate']).format('DD/MM/YYYY');
                        var date_now = moment();
                        var date_end = moment(val['employee_job_startdate']);
                        var duration = moment.duration(date_now.diff(date_end));
                        var days = duration.asDays();
                        var years = date_now.diff(date_end, 'year');
                        date_end.add(years, 'years');
                        var months = date_now.diff(date_end, 'months');
                        date_end.add(months, 'months');
                        var days = date_now.diff(date_end, 'days');
                        $('#frm_assess').find('#h_employee_job_startdate').html(employee_job_startdate);
                        $('#frm_assess').find('#h_job_old').html(years + ' ปี ' + months + ' เดือน ' + days + ' วัน');

                        $("#" + val['sc_subheader_id'] + "").val(val['sc_score'])
                        $("#comment_" + val['sc_subheader_id'] + "").val(val['sc_comment'])

                    });

                    $('#frm_assess').find('.choice_header').each(function () {

                        let total = 0;

                        $('#frm_assess').find('.score_' + $(this).data('choice')).each(function () {

                            total += (parseFloat($(this).val()) / 10) * parseFloat($(this).attr('data-weight'))

                        });

                        let val_total = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2
                        }).format(total.toFixed(2));

                        $('.sum_choice_' + $(this).data('choice')).html(val_total)

                    });

                }

            });

        };

        $.Form = async function (citem) {

            let Get_Form = new URL(url_hr_from);

            Get_Form.search = new URLSearchParams({

                header_type: citem['data_form'],

            });

            fetch(Get_Form).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

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
                    console.log('Form', result.data)
                    $("#assessment-list").empty();

                    if (citem['data_form'] == 1) {
                        $('.formheader').html('ระดับปฏิบัติการ');
                    } else if (citem['data_form'] == 2) {
                        $('.formheader').html('ระดับหัวหน้างาน');
                    } else if (citem['data_form'] == 3) {
                        $('.formheader').html('ระดับบริหาร');
                    } else {
                        $('.formheader').html('');
                    }

                    let i = 0;
                    let sum_weight = 0;
                    let temp_assessment_header = []

                    $('#assessment-list').append(
                        '<tr class="text-center card-valign-middle" style="vertical-align:middle;">' +
                        '<th class="text-center" rowspan="2" valign="middle" style="vertical-align:middle; width:40%;">ปัจจัยการประเมินผลงาน</th>' +
                        '<th class="text-center header_weight" rowspan="2" valign="middle" style="vertical-align:middle; width:5%;">น้ำหนัก</th>' +
                        '<th class="text-center quarter_score" colspan="6" valign="middle" style="vertical-align:middle; width:17%;">คะแนนการประเมิน</th>' +
                        '</tr>' +
                        '<tr class="text-center">' +
                        '<th class="text-center" width="6%"> คะแนน 1 - 10</th>' +
                        '<th class="text-center" width="22%">ความคิดเห็น</th>' +
                        '</tr>'
                    );

                    $.each(result.data, function (key, val) {

                        temp_assessment_header.push(val['subheader_name'].substr(0, 1));

                        let header_subject = val['subheader_name'].substr(0, 1)

                        let assessment_header

                        if (typeof temp_assessment_header[i - 1] === 'undefined' || temp_assessment_header[i - 1] === null) {

                            assessment_header = 0

                        } else {

                            assessment_header = temp_assessment_header[i - 1]
                        }

                        if (assessment_header != header_subject) {

                            sum_weight += Number(val['header_weight']);

                            $('#assessment-list').append('<tr style="background-color:#7cBBFA; font-weight:bold" class="choice_header choice" data-choice="' + val['header_id'] + '">' +
                                '<td align = "center" class="choice_names" style = "font-weight:bold" data-subheader_id="' + val['header_id'] + '">' + val['header_subject'] + '</td>' +
                                '<td class="text-center card-font-bold header_weight">' + val['header_weight'] + '%</td>' +
                                '<td colspan="6" class="text-center" data-toggle="tooltip" data-placement="top"><span class="sum_total sum_choice_' + val['header_id'] + '"  data-index="' + assessment_header + '" id="sum_total' + assessment_header + '"></span>%</td>' +
                                '</tr >');

                        }

                        let n = (header_subject - 1)

                        $('#assessment-list').append('<tr valign="middle" style="vertical-align:middle;" class="choice">' +
                            '<td class="choice_names" style="vertical-align:middle;" data-topic_id="" data-subheader_id="' + val['subheader_id'] + '">' + val['subheader_name'] + '</td>' +
                            '<td valign="middle" style="vertical-align:middle;" class="text-center weight_' + val['subheader_id'] + '">' + val['subheader_weight'] + '%</td>' +
                            '<td><div class="form-group">' +
                            '<input type="number" name="' + val['subheader_id'] + '"  id="' + val['subheader_id'] + '" data-weight="' + val['subheader_weight'] + '"class="form-control text-center score_' + val['header_id'] + ' numbers sub_' + n + ' answer" min="1" max="10" step="1" required  />' +
                            '</div></td>' +
                            '<td><input type="text" id="comment_' + val['subheader_id'] + '" class="form-control comment comment_' + n + '" /></td>' +
                            '</tr >');

                        $('.comment_0').attr('placeholder', 'ระดับ Management');
                        $('#frm_assess').find('input').prop('disabled', true);
                        $('#frm_assess').find('textarea').prop('disabled', true);

                        i++;

                    });

                    $('#assessment-list').append(' <tr style="background-color:#43A1FF;" valign="middle">' +
                        '<td class="tx-center tx-font-bold" style="vertical-align:middle" valign="middle">' + sum_weight + '%</td>' +
                        '<td colspan="6" class="tx-center tx-font-bold">' +
                        '<div><span id="asse_total_1" class"">0</span> คะแนน</div>' +
                        '<div><span id="asse_percent_1" class"">0</span> %</div>' +
                        '</td>' +
                        '</tr>');

                }

            });

        };

        $.Confirm = async function () {

            let url = new URL(url_assess_confirm);

            url.search = new URLSearchParams({

                data_leader_assess: $('#frm_confirm').find('#search_leader').val() === '' ? '' : $('#frm_confirm').find('#search_leader').val(),
                data_employee_assess: $('#frm_confirm').find('#search_employee').val() === '' ? '' : $('#frm_confirm').find('#search_employee').val(),
                count_leader_assess: $('#frm_confirm').find('#search_status').val() === '' ? '' : $('#frm_confirm').find('#search_status').val(),
                employee_sec: $('#frm_confirm').find('#search_section').val() === '' ? '' : $('#frm_confirm').find('#search_section').val(),
                employee_dept: $('#frm_confirm').find('#search_department').val() === '' ? '' : $('#frm_confirm').find('#search_department').val(),
                employee_pos: $('#frm_confirm').find('#search_position').val() === '' ? '' : $('#frm_confirm').find('#search_position').val(),
                data_quarter: $('#frm_confirm').find('#search_quarter').val() === '' ? '' : $('#frm_confirm').find('#search_quarter').val(),

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

                    tbl_confirm = $('#tbl-confirm').DataTable({
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
                                exportOptions: {
                                    columns: [1, 2, 4, 6, 7, 9, 10, 12, 13, 16]
                                }
                            },
                        ],
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>employee_id</span>",
                                data: "employee_id",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //0
                            {
                                title: "<span style='font-size:11px;'>employee_code</span>",
                                data: "employee_code",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>employee_full_name_th</span>",
                                data: "employee_full_name_th",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + row.employee_code + '<br>' + data + '</span>';
                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>employee_data_id</span>",
                                data: "employee_data_id",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>employee_pms</span>",
                                data: "employee_pms",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>leader_data_id_1</span>",
                                data: "leader_data_id_1",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>leader_name_1</span>",
                                data: "leader_name_1",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>leader_pms_1</span>",
                                data: "leader_pms_1",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //7
                            {
                                title: "<span style='font-size:11px;'>leader_data_id_2</span>",
                                data: "leader_data_id_2",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>leader_name_2</span>",
                                data: "leader_name_2",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //9
                            {
                                title: "<span style='font-size:11px;'>leader_pms_2</span>",
                                data: "leader_pms_2",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //10
                            {
                                title: "<span style='font-size:11px;'>leader_data_id_3</span>",
                                data: "leader_data_id_3",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //11
                            {
                                title: "<span style='font-size:11px;'>leader_name_3</span>",
                                data: "leader_name_3",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //12
                            {
                                title: "<span style='font-size:11px;'>leader_pms_3</span>",
                                data: "leader_pms_3",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //13
                            {
                                title: "<span style='font-size:11px;'>check_assess</span>",
                                data: "check_assess",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //14
                            {
                                title: "<span style='font-size:11px;'>check_leader</span>",
                                data: "check_leader",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //15
                            {
                                title: "<span style='font-size:11px;'>count_leader_assess</span>",
                                data: "count_leader_assess",
                                class: "tx-center align-middle",
                                //width: "190px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //16
                            {
                                title: "<span style='font-size:11px;'>success</span>",
                                class: "tx-center align-middle",
                                //width: "190px",
                                //visible: false,
                                render: function (data, type, row, meta) {

                                    let leader = row.check_leader;
                                    let assess = row.check_assess;
                                    if (assess == 0) { assess = '<span class="tx-danger" >' + assess + '</span>' }
                                    if (assess != leader && assess != 0) { assess = '<span style="color:DarkOrange" >' + assess + '</span>' } else { assess = '<span style="color:DarkGreen" >' + assess + '</span>' }

                                    leader = '<span class="tx-primary" >' + leader + '</span>'

                                    return '<span style="font-size:11px;">' + assess + ' / ' + leader + '</span>';
                                }
                            }, //17
                        ],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $('#tbl-confirm tbody').off('dblclick').on('dblclick', 'tr', async function (e) {

                                e.preventDefault()

                                $('#tbl-confirm tbody tr').removeClass('bg-warning')

                                $(this).addClass('bg-warning')

                                var data = tbl_confirm.row(this).data();

                                console.log('data', data)
                                let leader = data['check_leader'];
                                let asses = data['check_assess'];

                                if (leader == asses) {

                                    toastr.success('การประเมินสำเร็จ!');

                                    setTimeout(async function () {

                                        let url_report = "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_HR_ASSESS_CONFIRM&rs:Command=Render&data_employee_assess=" + data['employee_id'] + "";
                                        window.open(url_report, '_blank');

                                    }, 900);


                                } else {
                                    toastr.error('การประเมินไม่สำเร็จ!');
                                }

                            });

                            //this.api().columns().every(function () {
                            //    var column = this;
                            //    console.log('column', column)
                            //    var select = $('<select><option value=""></option></select>')
                            //        .appendTo($(column.footer()).empty())
                            //        .on('change', function () {
                            //            var val = $.fn.dataTable.util.escapeRegex(
                            //                $(this).val()
                            //            );

                            //            column
                            //                .search(val ? '^' + val + '$' : '', true, false)
                            //                .draw();
                            //        });

                            //    column.data().unique().sort().each(function (d, j) {
                            //        select.append('<option value="' + d + '">' + d + '</option>')
                            //    });
                            //});

                            //$('#tbl-confirm').find('tbody').append('<tr style="background-color: ' + bg_row + ';">' +
                            //    '<td class="d-none">' + val['job_detail_id'] + '</td>' +
                            //    '<td style="text-align:center">' + i + '</td>' +
                            //    '<td style="text-align:center">' + val['gbarcode'] + '</td>' +
                            //    '<td style="text-align:center">' + val['stkname'] + '</td>' +
                            //    '<td style="text-align:center">' + val['spcodes'] + '</td>' +
                            //    '<td style="text-align:center">' + '<span style="color:blue;">' + add_qty + '</span >' + ' ' + '/' + ' ' + '<span style="color:green;">' + cost_qty + '</span >' + '</td>' +
                            //    '<td style="text-align:center">' + val['job_detail_oldqty'] + '</td>' +
                            //    '<td style="text-align:center">' + val['stkunit'] + '</td>' +
                            //    '</tr>'
                            //)
                        },
                    });

                }
            })

        };

        $.Time = async function (citem) {

            let Get_Time = new URL(url_hr_employee_time);

            Get_Time.search = new URLSearchParams({

                employee_code: citem['employee_code'],
                data_quarter: citem['data_quarter']

            });

            fetch(Get_Time).then(function (response) {

                return response.json();

            }).then(function (result) {

                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

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

                    // $("#tbl-list td").empty();

                    $("#tbl-time tbody tr").empty();

                    $.each(result.data, function (key, val) {

                        var time_id = val['time_id']
                        var time_employee_code = val['time_employee_code']
                        var time_employee_name = val['time_employee_name']
                        var time_employee_pos = val['time_employee_pos']
                        var time_late_count = val['time_late_count']
                        var time_late_time = val['time_late_time']
                        var time_absent_count = val['time_absent_count']
                        var time_absent_time = val['time_absent_time']
                        var time_sick_leave = val['time_sick_leave']
                        var time_personal_leave = val['time_personal_leave']
                        var time_maternity_leave = val['time_maternity_leave']
                        var time_ordination_leave = val['time_ordination_leave']
                        var time_wage_leave = val['time_wage_leave']
                        var time_funeral_wedding_leave = val['time_funeral_wedding_leave']
                        var time_warning_leave = val['time_warning_leave']
                        var time_probate_leave = val['time_probate_leave']
                        var time_data_quarter = val['time_data_quarter']
                        var time_score = val['time_score']
                        var created_by = val['created_by']
                        var created_date = val['created_date']
                        var updated_by = val['updated_by']
                        var updated_date = val['updated_date']
                        var record_status = val['record_status']

                        $('#tbl-time').find('tbody').append('<tr>' +
                            '<td style="text-align:center">' + time_late_count + '</td>' +
                            '<td style="text-align:center">' + time_late_time + '</td>' +
                            '<td style="text-align:center">' + time_absent_count + '</td>' +
                            '<td style="text-align:center">' + time_absent_time + '</td>' +
                            '<td style="text-align:center">' + time_sick_leave + '</td>' +
                            '<td style="text-align:center">' + time_personal_leave + '</td>' +
                            '<td style="text-align:center">' + time_maternity_leave + '</td>' +
                            '<td style="text-align:center">' + time_ordination_leave + '</td>' +
                            '<td style="text-align:center">' + time_wage_leave + '</td>' +
                            '<td style="text-align:center">' + time_funeral_wedding_leave + '</td>' +
                            '<td style="text-align:center">' + time_warning_leave + '</td>' +
                            '<td style="text-align:center">' + time_probate_leave + '</td>' +
                            '<td style="text-align:center">' + citem['quarter_name'] + '</td>' +
                            '</tr>'
                        )

                    });

                }

            });

        };

        $.Master_Get = async function () {

            let url_Master = new URL(url_master_get);

            url_Master.search = new URLSearchParams({
                mode: 'employee',
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

                        Master_dataSet.push({ id: val['id'], text: val['code'] + ' ' + val['text'] });

                    });

                    $('#frm_search').find('#search_employee').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'leader',
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

                        Master_dataSet.push({ id: val['id'], text: val['code'] + ' ' + val['text'] });

                    });

                    $('#frm_search').find('#search_leader').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'assess_by',
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

                    $('#frm_search').find('#search_assess_by').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'assess_form',
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

                    $('#frm_search').find('#search_form').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'quarter',
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

                    $('#frm_search').find('#search_quarter').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'status',
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_status option").remove();
                    //$("#search_status").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_search').find('#search_status').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'sec',
                keywords: $('#frm_search').find('#search_leader').val(),
                keywords1: $('#frm_search').find('#search_employee').val(),
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_section option").remove();
                    //$("#search_section").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_search').find('#search_section').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'dept',
                keywords: $('#frm_search').find('#search_leader').val(),
                keywords1: $('#frm_search').find('#search_employee').val(),
                keywords2: $('#frm_search').find('#search_section').val(),
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_department option").remove();
                    //$("#search_department").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_search').find('#search_department').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'pos',
                keywords: $('#frm_search').find('#search_leader').val(),
                keywords1: $('#frm_search').find('#search_employee').val(),
                keywords2: $('#frm_search').find('#search_section').val(),
                keywords3: $('#frm_search').find('#search_department').val(),
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_position option").remove();
                    //$("#search_position").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_search').find('#search_position').select2({
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

        $.Master_Confirm_Get = async function () {

            let url_Master = new URL(url_master_get);

            url_Master.search = new URLSearchParams({
                mode: 'employee_all',
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

                        Master_dataSet.push({ id: val['id'], text: val['code'] + ' ' + val['text'] });

                    });

                    $('#frm_confirm').find('#search_employee').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'leader_all',
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

                        Master_dataSet.push({ id: val['id'], text: val['code'] + ' ' + val['text'] });

                    });

                    $('#frm_confirm').find('#search_leader').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'quarter',
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

                    $('#frm_confirm').find('#search_quarter').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'job_all',
                keywords: '1',
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_section option").remove();
                    //$("#search_section").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_confirm').find('#search_section').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'job_all',
                keywords: '2',
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_section option").remove();
                    //$("#search_section").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_confirm').find('#search_department').select2({
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

            url_Master.search = new URLSearchParams({
                mode: 'job_all',
                keywords: '3',
            });
            fetch(url_Master).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    let Master_dataSet = [];

                    //$("#search_section option").remove();
                    //$("#search_section").append("<option value='' selected>--SELECT ALL--</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        Master_dataSet.push({ id: val['id'], text: val['text'] });

                    });

                    $('#frm_confirm').find('#search_position').select2({
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

        $.Verify_Assess = async function (employee_id) {

            let url = new URL(url_hr_verify_assess);

            url.search = new URLSearchParams({

                data_leader_assess: $('#frm_search').find('#search_leader').val(),

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

                    $('.alert-verify').addClass('d-none')
                    $('#tbl-verify').empty()

                    tbl_verify = $('#tbl-verify').DataTable({
                        data: result.data,
                        dom: 'ft',
                        ordering: true,
                        "paging": false,
                        "scrollY": "180px",
                        "scrollCollapse": true,
                        bDestroy: true,
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>Code</span>",
                                data: "employee_code",
                                class: "tx-center",
                                width: "60px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //0
                            {
                                title: "<span style='font-size:11px;'>Prefix</span>",
                                data: "employee_prefix",
                                class: "tx-center",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Name</span>",
                                data: "employee_name",
                                class: "tx-center",
                                width: "190px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + row.employee_prefix + ' ' + data + '</span>';
                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>Section</span>",
                                data: "employee_sec",
                                class: "tx-center",
                                width: "120px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Department</span>",
                                data: "employee_dept",
                                class: "tx-center",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Position</span>",
                                data: "employee_pos",
                                class: "tx-center",
                                width: "120px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Status</span>",
                                data: "status_assess",
                                class: "tx-center",
                                width: "50px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 'SUCCEED') {
                                        return '<span class="tx-primary"><i class="fas fa-check"></i></span >'
                                    } else if (data == 'WAIT') {
                                        return '<span class="tx-warning"><i class="far fa-lightbulb"></i></span >'
                                    } else if (data == 'FALSE') {
                                        return '<span class="tx-danger"><i class="fas fa-times"></i></span >'
                                    } else {
                                        return '-'
                                    }
                                }
                            }, //3
                        ],
                        //"order": [[1, "desc"]],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                        },
                    });


                }
            })

        };

        $(document).ready(async function () {

            await $.init();
            await $.List();
        });

    } else {

        window.location.assign('./login');

    }

});