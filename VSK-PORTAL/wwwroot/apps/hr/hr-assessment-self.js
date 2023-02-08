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
let mode;
let validator, table, options, item_action, item_id;
var data_id, data_form;
let role_code;

const url_api = "http://localhost:49705/";
const url_hr_from = url_api + '/api/Hr_Form_Get';
const url_hr_employee_detail = url_api + '/api/Hr_Employee_Detail';
const url_hr_employee_time = url_api + '/api/Hr_Employee_Time';
const url_hr_quarter = url_api + '/api/Hr_Quarter_Get';
const url_hr_create_data = url_api + '/api/Hr_Create_Data';
const url_hr_create_score = url_api + '/api/Hr_Create_Score';
const url_hr_check_data = url_api + '/api/Hr_Check_Data';
const url_hr_verify_employee = url_api + '/api/Hr_Verify_Employee';

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

    var full_mail = user.email;

    if (user) {

        $.init = function () {

            console.log('objProfile', objProfile)

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

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    toastr.error('ขออภัย!');

                } else {

                    console.log('Verify_ID', result.data);

                    let employee_id = result.data[0]['employee_id']

                    empid = result.data[0]['employee_id']

                    $.List(employee_id);

                }

            });

        };

        $.List = async function (employee_id) {

            let Get_Detail = new URL(url_hr_employee_detail);

            Get_Detail.search = new URLSearchParams({

                employee_id: employee_id,

            });

            fetch(Get_Detail).then(function (response) {
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

                    console.log('Get_Detail', result.data);


                    $.each(result.data, function (key, val) {

                        let citem = ({
                            employee_id: val['employee_id'],
                            employee_code: val['employee_code'],
                            employee_name: val['employee_name'],
                            employee_sec: val['employee_sec'],
                            employee_dept: val['employee_dept'],
                            employee_pos: val['employee_pos'],
                            quarter_id: val['quarter_id'],
                            quarter_name: val['quarter_name'],
                            employee_form: val['employee_form']

                        });

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

                        data_form = val['employee_form']

                        $('#frm_detail').find('#h_employee_code').html(citem['employee_code']);
                        $('#frm_detail').find('#h_employee_assess').html(citem['employee_name']);
                        $('#frm_detail').find('#h_employee_sec').html(citem['employee_sec']);
                        $('#frm_detail').find('#h_employee_dept').html(citem['employee_dept']);
                        $('#frm_detail').find('#h_employee_pos').html(citem['employee_pos']);
                        $('#frm_detail').find('#h_employee_job_startdate').html(employee_job_startdate);
                        $('#frm_detail').find('#h_job_old').html(years + ' ปี ' + months + ' เดือน ' + days + ' วัน');
                        $('#frm_detail').find('#h_data_quarter').html(citem['quarter_name']);

                        $.Time(citem);

                        $.Check_Data(citem);

                    });

                }

            });

        };

        $.Check_Data = async function (citem) {

            let Get_Ck_Data = new URL(url_hr_check_data);

            Get_Ck_Data.search = new URLSearchParams({

                data_employee_assess: citem['employee_id'],
                data_quarter: citem['quarter_id'],
                data_leader_assess: citem['employee_id']

            });

            fetch(Get_Ck_Data).then(function (response) {

                return response.json();

            }).then(function (result) {
                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    swal({
                        title: 'ขออภัย!',
                        text: 'เกิดข้อผิดพลาด',
                        type: 'error',
                        confirmButtonColor: '#8B0000'
                    })

                    toastr.error('ขออภัย!');

                } else {

                    $.each(result.data, function (key, val) {

                        var status = val['status'];

                        if (status == 'codedup') {

                            swal({
                                title: "ขออภัย",
                                text: "ท่านได้ทำแบบประเมินแล้ว",
                                type: 'warning',
                                timer: 2000,
                                showConfirmButton: false
                            });

                            $('.chkdup').removeClass('d-none');

                            $('#alert').html(moment(val['created_date']).format('DD/MM/YYYY HH:mm:ss') + ' น. ' + '<strong>' + ' รอบประเมิน ' + '</strong>' + val['data_quarter']);

                            console.log('codedup', status)

                        } else {

                            window.onbeforeunload = function () {
                                return '';
                            }

                            console.log('codeNodup', status)
                            $.Form(citem);
                            $.Create(citem);
                            $('#page_opt').removeClass('d-none');

                        }

                    });

                }

            });

        };

        $.Form = async function (citem) {

            let Get_Form = new URL(url_hr_from);

            Get_Form.search = new URLSearchParams({

                //header_type: 3,
                header_type: citem['employee_form'],

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

                    if (citem['employee_form'] == 1) {
                        $('.formheader').html('ระดับปฏิบัติการ');
                    } else if (citem['employee_form'] == 2) {
                        $('.formheader').html('ระดับหัวหน้างาน');
                    } else if (citem['employee_form'] == 3) {
                        $('.formheader').html('ระดับบริหาร');
                    } else {
                        $('.formheader').html('');
                    }

                    let i = 0;

                    let temp_assessment_header = []

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

                            $('#assessment-list').append('<tr style="background-color:#7cBBFA; font-weight:bold" class="choice">' +
                                '<td align = "center" class="choice_names tx-16" style = "font-weight:bold" data-subheader_id="' + val['header_id'] + '">' + val['header_subject'] + '</td>' +
                                '<td class="text-center card-font-bold header_weight d-none">' + val['header_weight'] + '%</td>' +
                                '<td colspan="6" class="text-center" data-toggle="tooltip" data-placement="top"><span class="sum_total d-none" id="sum_total' + assessment_header + '">0</span></td>' +
                                '</tr >');

                        }

                        let n = (header_subject - 1)

                        $('#assessment-list').append('<tr valign="middle" style="vertical-align:middle;" class="choice">' +
                            '<td class="choice_names tx-15" style="vertical-align:middle;" data-topic_id="" data-subheader_id="' + val['subheader_id'] + '">' + val['subheader_name'] + '</td>' +
                            '<td valign="middle" style="vertical-align:middle;" class="text-center d-none">' + val['subheader_weight'] + '%</td>' +
                            '<td><div class="form-group">' +
                            '<input type="number"  name="' + val['subheader_id'] + '"  id="' + val['subheader_id'] + '" data-weight="' + val['subheader_weight'] + '"class="form-control text-center numbers sub_' + n + ' answer" min="1" max="10" step="1" required  />' +
                            '</div></td>' +
                            '<td><input type="text" class="form-control comment comment_' + n + '" /></td>' +
                            '</tr >');

                        $(".numbers").inputFilter(function (value) {
                            return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 10);
                        });

                        $('.sub_' + n).val(0)

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

                        $('.sub_0').val('')
                        $('.sub_0').removeAttr('min').prop('disabled', true)
                        $('.sub_0').removeAttr('data-parsley-min')
                        $('.sub_0').removeAttr('required')
                        $('.comment_0').attr('placeholder', 'ระดับ Management').prop('disabled', true)
                        //$('.comment_0').removeAttr('required').prop('disabled', true)

                        i++;

                    });

                    $('#assessment-list').append(' <tr style="background-color:#43A1FF;" valign="middle" class="d-none">' +
                        '<td class="tx-center tx-font-bold" style="vertical-align:middle" valign="middle">100%</td>' +
                        '<td colspan="6" class="tx-center tx-font-bold">' +
                        '<div><span id="asse_total_1" class"">0</span> คะแนน</div>' +
                        '<div><span id="asse_percent_1" class"">0</span> %</div>' +
                        '</td>' +
                        '</tr>');

                    $('.answer').on('change', function (e) {

                        e.preventDefault();

                        var asse_total_1 = 0;
                        var asse_percent_1 = 0;

                        $('.answer').each(function () {

                            asse_total_1 += Number($(this).val());

                        });

                        $('.sum_total').each(function () {

                            asse_percent_1 += Number($(this).html());

                        });

                        let val_asse_percent_1 = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2
                        }).format(asse_percent_1.toFixed(2));

                        $('#asse_total_1').html(asse_total_1);
                        $('#asse_percent_1').html(val_asse_percent_1);

                    });

                }

            });

        };

        $.Create = async function (citem) {

            $('#btn-save_form').click(function () {

                $('#frm_data').parsley().validate();

                $('#frm_data').parsley().on('form:submit', function () {

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

                                data_id = $.uuid();

                                let add_data = {
                                    data_id: data_id,
                                    data_leader_assess: citem['employee_id'],
                                    data_employee_assess: citem['employee_id'],
                                    data_form: citem['employee_form'],
                                    data_quarter: citem['quarter_id'],
                                    data_assess_by: '1',
                                    data_score_pms: $('#asse_total_1').html(),
                                    data_percent_pms: $('#asse_percent_1').html(),
                                    record_status: '1',
                                    created_by: user_id,
                                    data_c_good: $('#frm_data').find('#comment_1_1').val() === undefined ? '' : $('#frm_data').find('#comment_1_1').val(),
                                    data_c_fail: $('#frm_data').find('#comment_1_2').val() === undefined ? '' : $('#frm_data').find('#comment_1_2').val(),
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

                                        $('#frm_data').find('.choice').each(function () {

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
                                                $('#frm_data').find('.comment').prop('disabled', true);
                                                $('#frm_data').find('.answer').prop('disabled', true);

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

                            } else {
                                swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");
                            }
                        })

                    return false;

                });

            });

        };

        $.Time = async function (citem) {

            let Get_Time = new URL(url_hr_employee_time);

            Get_Time.search = new URLSearchParams({

                employee_code: citem['employee_code'],
                data_quarter: citem['quarter_id']

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

                        $('#tbl-list').find('tbody').append('<tr>' +
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

        $(document).ready(async function () {

            await $.init();
            await $.Verify_ID();

        });

    } else {

        window.location.assign('./login');

    }

});