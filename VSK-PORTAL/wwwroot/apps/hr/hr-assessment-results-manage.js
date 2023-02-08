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
let tbl_verify, tbl_results
const url_api = "http://localhost:49705/";
const url_hr_from = url_api + '/api/Hr_Form_Get';
const url_hr_create_data = url_api + '/api/Hr_Create_Data';
const url_hr_create_score = url_api + '/api/Hr_Create_Score';
const url_master_get = url_api + '/api/Hr_Master_Get';
const url_hr_employee_time = url_api + '/api/Hr_Employee_Time';
const url_hr_verify_employee = url_api + '/api/Hr_Verify_Employee';
const url_hr_updata_data = url_api + '/api/Hr_Update_Data';
const url_results_manage_get = url_api + '/api/Hr_Results_Manage_Get';
const url_employee_get = url_api + '/api/Hr_Employee_Get';
const url_report_pms_get = url_api + '/api/Hr_Report_Pms';
const url_report_assess_get = url_api + '/api/Hr_Result_Assess_Get';

(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };
}(jQuery));

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        var full_mail = user.email;

        $.init = function () {

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function (e) {

                await setTimeout(function () {

                    $("#frm_data").parsley().reset();

                }, 100);
            });

            $('#btn-search').on('click', async function (e) {

                e.preventDefault();

                await $.List(empid);
                await $.Master_Get(empid);

            });

            $('#btn-reset').click(async function (e) {

                e.preventDefault();

                $('#frm_search').trigger('reset');
                await $.List(empid);
                await $.Master_Get(empid);

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

        $.List = async function (employee_id) {

            let url = new URL(url_results_manage_get);

            url.search = new URLSearchParams({

                data_leader_assess: employee_id,
                data_employee_assess: $('#frm_search').find('#search_employee').val() === '' ? '' : $('#frm_search').find('#search_employee').val(),
                updated_status: $('#frm_search').find('#search_status').val() === '' ? '' : $('#frm_search').find('#search_status').val(),
                employee_sec: $('#frm_search').find('#search_section').val() === '' ? '' : $('#frm_search').find('#search_section').val(),
                employee_dept: $('#frm_search').find('#search_department').val() === '' ? '' : $('#frm_search').find('#search_department').val(),
                employee_pos: $('#frm_search').find('#search_position').val() === '' ? '' : $('#frm_search').find('#search_position').val(),

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
                                visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 2) {
                                        return '<span class="label text-danger ">' + '<i class="fas fa-user-tie"></i>' + '</br>' + 'หัวหน้าประเมิน' + '</span >'
                                    } else if (data == 1) {
                                        return '<span class="label text-primary ">' + '<i class="fas fa-user"></i>' + '</br>' + 'ตนเองประเมิน' + '</span >'
                                    } else {
                                        return '-'
                                    }
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>date time</span>",
                                data: "created_date",
                                class: "tx-center align-middle",
                                width: "120px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + moment(data).format('DD/MM/YYYY HH:mm') + '<span/>';
                                    } else {
                                        return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY HH:mm') + '<span/>';
                                    }
                                }
                            }, //0
                            {
                                title: "<span style='font-size:11px;'>Employee_code</span>",
                                data: "employee_code",
                                width: "50px",
                                visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Employee</span>",
                                data: "employee_name",
                                width: "200px",
                                //visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {

                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + row.employee_code + ' ' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + row.employee_code + ' ' + data + '</span>';
                                    }
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>Section</span>",
                                data: "employee_sec",
                                class: "tx-center align-middle",
                                width: "120px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>Department</span>",
                                data: "employee_dept",
                                class: "tx-center align-middle",
                                width: "120px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>Position</span>",
                                data: "employee_pos",
                                class: "tx-center align-middle",
                                width: "120px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>Assessor</span>",
                                data: "leader_name",
                                width: "200px",
                                visible: false,
                                class: "tx-center align-middle",
                                render: function (data, type, row, meta) {
                                    if (row.updated_status == 2) {
                                        return '<span style="text-decoration: line-through; color:red;">' + data + '</span>';
                                    } else {
                                        return '<span style="font-size:11px;">' + data + '</span>';
                                    }
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>PMS Score</span>",
                                data: "data_score_pms",
                                class: "tx-center",
                                width: "70px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px; font-weight:bold; color:#eb5e34;">' + data + '</span>';
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>PMS Percentage</span>",
                                data: "data_percent_pms",
                                class: "tx-center align-middle",
                                width: "70px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px; font-weight:bold; color:#1a94eb;">' + data + ' %' + '</span>';
                                }
                            }, //7 
                            {
                                title: "<span style='font-size:11px;'>Time score</span>",
                                data: "time_score",
                                class: "tx-center align-middle",
                                width: "100px",
                                visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px; font-weight:bold; color:#;">' + data + '</span>';
                                }
                            }, //8
                            {
                                title: "<span style='font-size:11px;'>form</span>",
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
                            }, //9
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
                            }, //10
                            {
                                title: "<span style='font-size:11px;'>Status</span>",
                                data: "updated_status",
                                class: "tx-center",
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
                            }, //11
                        ],
                        "order": [[0, "desc"]],
                        "initComplete": function (settings, json) {

                            $("#global-loader").fadeOut("slow");

                            $.contextMenu({
                                selector: '#tbl-results tbody tr',
                                callback: async function (key, options) {

                                    let citem = tbl_results.row(this).data();

                                    if (key === 'view') {

                                        $.Details(citem);

                                    } else if (key === 'update') {

                                        await $.Form(citem);
                                        //await $.Time(citem);
                                        await $.Report(citem);
                                        await setTimeout(function () {
                                            $.Report_update(citem);
                                        }, 300)

                                        //await $.Report_update(citem);


                                    } else if (key === 'status') {

                                        await $.Details(citem);
                                        await $.Update(citem);

                                    } else if (key === 'delete') {

                                        await $.Details(citem);
                                        await $.Delete(citem);
                                        $('#btn-delete').removeClass('hide');
                                        $('#btn-submit').addClass('hide');

                                    } else {

                                        alert('ERROR');

                                    }
                                },
                                items: {
                                    //"view": { name: "View", icon: "fas fa-search" },
                                    "status": { name: "Status", icon: "edit" },
                                    "update": { name: "Update", icon: "far fa-file-alt" },
                                    /*  "delete": { name: "Delete", icon: "delete" },*/
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

            $('#title_assess_pms').html(citem['employee_code'] + ' ' + citem['employee_name']);
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

        $.Update = async function (citem) {

            console.log('Update', citem)

            let update_status = citem['updated_status'];

            if (update_status != 0) {

                $('#remark_pms').prop('disabled', true);
                $('.update_status').prop('disabled', true);

            } else {

                $('#remark_pms').prop('disabled', false);
                $('.update_status').prop('disabled', false);
                $('#frm_data').find('#btn-save_exit').show();

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
                                    updated_status: $("input[name='update_status']:checked").val(),
                                    updated_command: $('#remark_pms').val(),
                                    updated_by: user_id,
                                };

                                var params = [];
                                for (const i in data_update) {
                                    params.push(i + "=" + encodeURIComponent(data_update[i]));
                                }

                                fetch(url_hr_updata_data, {
                                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
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

                                            $.List(citem['data_leader_assess']);
                                            $.Verify_Assess(citem['data_leader_assess']);

                                            await setTimeout(function () {

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

            }
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
                        '<th class="text-center header_weight d-none" rowspan="2" valign="middle" style="vertical-align:middle; width:5%;">น้ำหนัก</th>' +
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
                                '<td class="text-center card-font-bold header_weight d-none">' + val['header_weight'] + '%</td>' +
                                '<td colspan="6" class="text-center" data-toggle="tooltip" data-placement="top"><span class="sum_total d-none sum_choice_' + val['header_id'] + '"  data-index="' + assessment_header + '" id="sum_total' + assessment_header + '"></span></td>' +
                                '</tr >');

                        }

                        let n = (header_subject - 1)

                        $('#assessment-list').append('<tr valign="middle" style="vertical-align:middle;" class="choice">' +
                            '<td class="choice_names" style="vertical-align:middle;" data-topic_id="" data-subheader_id="' + val['subheader_id'] + '">' + val['subheader_name'] + '</td>' +
                            '<td valign="middle" style="vertical-align:middle;" class="text-center d-none weight_' + val['subheader_id'] + '">' + val['subheader_weight'] + '</td>' +
                            '<td><div class="form-group">' +
                            '<input type="number" name="' + val['subheader_id'] + '"  id="' + val['subheader_id'] + '" data-weight="' + val['subheader_weight'] + '"class="form-control text-center score_' + val['header_id'] + ' numbers sub_' + n + ' answer" min="1" max="10" step="1" required  />' +
                            '</div></td>' +
                            '<td><input type="text" id="comment_' + val['subheader_id'] + '" class="form-control comment comment_' + n + '" /></td>' +
                            '</tr >');

                        $(".numbers").inputFilter(function (value) {
                            return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 10);
                        });

                        $('.sub_' + n).on("keyup change", function (e) {

                            //console.log('val')

                            var sum = 0;

                            $('.sub_' + n).each(function () {

                                sum += (parseFloat($(this).val()) / 10) * parseFloat($(this).data('weight'));

                            });

                            let val_sum = new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2
                            }).format(sum.toFixed(2));

                            $('#sum_total' + n).html(val_sum);

                        });

                        $('.sub_0').removeAttr('min').prop('disabled', true)
                        $('.sub_0').removeAttr('data-parsley-min')
                        $('.sub_0').removeAttr('required')
                        $('.comment_0').removeAttr('required')
                        $('.comment_0').attr('placeholder', 'ระดับ Management');

                        i++;

                    });

                    $('#assessment-list').append(' <tr style="background-color:#43A1FF;" valign="middle" class="d-none">' +
                        '<td class="tx-center tx-font-bold" style="vertical-align:middle" valign="middle">' + sum_weight + '%</td>' +
                        '<td colspan="6" class="tx-center tx-font-bold">' +
                        '<div><span id="asse_total_1" class"">0</span> คะแนน</div>' +
                        '<div><span id="asse_percent_1" class"">0</span> %</div>' +
                        '</td>' +
                        '</tr>');

                }

            });

        };

        $.Report = async function (citem) {

            await $('#modal-frm_assess').modal({
                keyboard: false,
                backdrop: 'static'
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

                    $('#assessment-more tr').find('th').eq(0).html('')
                    $('#assessment-more tr').find('th').eq(1).html('')
                    $('#assessment-more tr').find('th').eq(0).html('สิ่งที่ต้องแก้ไขและปรับปรุง (อย่างน้อย 3 ข้อ)')
                    $('#assessment-more tr').find('th').eq(1).html('สิ่งที่ต้องเรียนรู้และพัฒนาเพิ่มเติม (อย่างน้อย 3 ข้อ)')

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

        $.Report_update = async function (citem) {

            console.log('Report_update', citem)
            console.log('Report_update', citem['updated_status'])
           
            if (citem['updated_status'] == 0) {

                $('#frm_assess').find('input').prop('disabled', false);
                $('#frm_assess').find('textarea').prop('disabled', false);
                $('#frm_assess').find('#btn-save_form').show();
                $('.sub_0').removeAttr('min').prop('disabled', true)
                $('.sub_0').removeAttr('data-parsley-min')
                $('.sub_0').removeAttr('required')
                $('.comment_0').removeAttr('required').prop('disabled', true)
                $('.comment_0').attr('placeholder', 'ระดับ Management');

                $('#btn-save_form').click(function () {

                    $('#frm_assess').parsley().validate();

                    $('#frm_assess').parsley().on('form:submit', function () {

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
                        },
                            function (isConfirm) {

                                if (isConfirm) {

                                    var today = new Date();
                                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                    var dateTime = date + ' ' + time;

                                    let data_update = {
                                        data_id: citem['data_id'],
                                        updated_status: 2,
                                        updated_command: 'Revised assessment on ' + dateTime + ' .',
                                        updated_by: user_id,
                                    };

                                    var params = [];
                                    for (const i in data_update) {
                                        params.push(i + "=" + encodeURIComponent(data_update[i]));
                                    }

                                    fetch(url_hr_updata_data, {
                                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
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

                                            data_id = $.uuid();

                                            let add_data = {
                                                data_id: data_id,
                                                data_leader_assess: citem['data_leader_assess'],
                                                data_employee_assess: citem['data_employee_assess'],
                                                data_form: citem['data_form'],
                                                data_quarter: citem['data_quarter'],
                                                data_assess_by: '2',
                                                data_score_pms: $('#asse_total_1').html(),
                                                data_percent_pms: $('#asse_percent_1').html(),
                                                record_status: '1',
                                                created_by: user_id,
                                                data_c_good: $('#frm_assess').find('#comment_1_1').val() === undefined ? '' : $('#frm_assess').find('#comment_1_1').val(),
                                                data_c_fail: $('#frm_assess').find('#comment_1_2').val() === undefined ? '' : $('#frm_assess').find('#comment_1_2').val(),
                                            };

                                            var params = [];
                                            for (const i in add_data) {
                                                params.push(i + "=" + encodeURIComponent(add_data[i]));
                                            }

                                            fetch(url_hr_create_data, {
                                                method: 'POST', // *GET, POST, PUT, DELETE, etc.
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

                                                    let i = 1;
                                                    let choice_citem = [];

                                                    $('#frm_assess').find('.choice').each(function () {

                                                        choice_citem.push({
                                                            sc_data_id: data_id,
                                                            sc_topic: $(this).find('td').eq(0).html(),
                                                            sc_weight: $(this).find('td').eq(1).html(),
                                                            sc_score: $(this).find('.answer').val() === undefined ? '' : $(this).find('.answer').val(),
                                                            sc_comment: $(this).find('.comment').val() === undefined ? '' : $(this).find('.comment').val(),
                                                            sc_subheader_id: $(this).find('.choice_names').attr("data-subheader_id") === undefined ? '' : $(this).find('.choice_names').attr("data-subheader_id"),
                                                            sc_order: i++,
                                                            record_status: "1",
                                                            created_by: user_id,
                                                        })

                                                    });

                                                    console.log(choice_citem);

                                                    $.ajax({
                                                        url: url_hr_create_score,
                                                        type: 'POST',
                                                        contentType: "application/json; charset=utf-8",
                                                        data: JSON.stringify(choice_citem),
                                                        success: function (result) {


                                                            $("#global-loader").fadeOut("slow");

                                                            $("#btn-save_form").prop('disabled', true);
                                                            $('#frm_assess').find('.comment').prop('disabled', true);
                                                            $('#frm_assess').find('.answer').prop('disabled', true);

                                                            swal({
                                                                title: "สำเร็จ!",
                                                                text: "ทำรายการสำเร็จ",
                                                                type: 'success',
                                                                timer: 2000,
                                                                showConfirmButton: false
                                                            });

                                                            toastr.success('สำเร็จ บันทึกสำเร็จ!');

                                                            window.onbeforeunload = null;

                                                            setTimeout(function () {
                                                                location.reload();
                                                            }, 900);

                                                        }
                                                    });


                                                }

                                            }).catch((error) => {
                                                toastr.error(error, 'Error writing document');
                                            });


                                        }

                                    });

                                  

                                } else {
                                    swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");
                                }
                            })

                        return false;

                    });

                });

            } else {

                $('#frm_assess').find('input').prop('disabled', true);
                $('#frm_assess').find('textarea').prop('disabled', true);
                $('#frm_assess').find('#btn-save_form').hide();
            }

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

        $.Employee_Get = async function (empid) {

            fetch(url_employee_get + '?employee_leader=' + empid).then(function (response) {
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

                } else {

                    let employee_dataSet = [];

                    $.each(result.data, function (key, val) {

                        employee_dataSet.push({ id: val['employee_id'], text: val['employee_code'] + ' ' + val['employee_prefix'] + ' ' + val['employee_name'], data: val });

                    });

                    //console.log(employee_dataSet);

                    $('#search_employee').select2({
                        width: '100%',
                        height: '40px',
                        data: employee_dataSet,
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

        $.Master_Get = async function () {

            let url_Master = new URL(url_master_get);

            url_Master.search = new URLSearchParams({
                mode: 'employee_access',
                keywords: empid,
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

                        Master_dataSet.push({ id: val['id'], text: val['code'] + ' ' + val['text']});

                    });

                    $('#search_employee').select2({
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
                keywords: empid,
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

                    $('#search_status').select2({
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
                keywords: empid,
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

                    $('#search_section').select2({
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
                keywords: empid,
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

                    $('#search_department').select2({
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
                keywords: empid,
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

                    $('#search_position').select2({
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

            let url = new URL(url_employee_get);

            url.search = new URLSearchParams({

                employee_leader: employee_id,

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

                    tbl_verify = $('#tbl-verify').DataTable({
                        data: result.data,
                        dom: 't',
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

        $.Verify_ID = async function () {

            let Verify_ID = new URL(url_hr_verify_employee);

            Verify_ID.search = new URLSearchParams({

                code: empcode,

            });

            fetch(Verify_ID).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result.status === 'Error') {

                    $("#global-loader").fadeOut("slow");

                    toastr.error('ขออภัย!');

                } else {

                    console.log('Verify_ID', result.data);

                    let employee_id = result.data[0]['employee_id']

                    empid = result.data[0]['employee_id']

                    $.List(empid);
                    $.Verify_Assess(empid);
                    $.init(empid);
                    //$.Employee_Get(employee_id);
                }

            });

        };

        $(document).ready(async function () {

            await $.Verify_ID();
            //await $.init();

        });

    } else {

        window.location.assign('./login');

    }

});