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

const url_api = "http://localhost:49705/";
const url_hr_from = url_api + '/api/Hr_Form_Get';

const url_hr_employee_detail = url_api + '/api/Hr_Employee_Detail';
const url_hr_employee_time = url_api + '/api/Hr_Employee_Time';
const url_hr_quarter = url_api + '/api/Hr_Quarter_Get';
const url_hr_create_data = url_api + '/api/Hr_Create_Data';
const url_hr_create_score = url_api + '/api/Hr_Create_Score';
const url_hr_check_data = url_api + '/api/Hr_Check_Data';
const url_hr_verify_employee = url_api + '/api/Hr_Verify_Employee';
const url_employee_get = url_api + '/api/Hr_Employee_Get';

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

            $('#frm_detail').find('.empdetail').hide();

            $('#frm_detail').find('#emp_assess').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                let employee_id = $('#emp_assess').val();

                if (employee_id !== "") {

                    $('#frm_detail').find('.empdetail').show();

                    $.Employee_Detail(employee_id);

                } else {

                    $('#frm_detail').find('.empdetail').hide();

                }

            });

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

                    $.List(employee_id);

                }

            });

        };

        $.List = async function (employee_id) {

            fetch(url_hr_employee_detail + '?employee_id=' + employee_id).then(function (response) {
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

                    console.log('Get_Detail', result.data);

                    let emp_assessor_id = result.data[0]['employee_id']
                    let emp_assessor_code = result.data[0]['employee_code']
                    let emp_assessor_name = result.data[0]['employee_name']

                    leader_assess_id = result.data[0]['employee_id']

                    $('#frm_detail').find('#emp_assessor').html(emp_assessor_name);

                    $.Leader_Get(emp_assessor_id)
                }

            });

        };

        $.Leader_Get = async function (emp_assessor_id) {

            let Employee_Get = new URL(url_employee_get);

            Employee_Get.search = new URLSearchParams({

                employee_leader: emp_assessor_id,

                //employee_form: 2,

            });

            fetch(Employee_Get).then(function (response) {

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

                    $('#emp_assess').select2({
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

        $.Employee_Detail = async function (employee_id) {

            fetch(url_hr_employee_detail + '?employee_id=' + employee_id).then(function (response) {
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

                    $(".tx-detail").empty();

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
        }

        $.Check_Data = async function (citem) {

            let Get_Ck_Data = new URL(url_hr_check_data);

            Get_Ck_Data.search = new URLSearchParams({

                data_employee_assess: citem['employee_id'],
                data_quarter: citem['quarter_id'],
                data_leader_assess: leader_assess_id

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

                            $('#page_opt').addClass('d-none');

                            $('#alert').html(moment(val['created_date']).format('DD/MM/YYYY HH:mm:ss') + ' น. ' + '<strong>' + ' รอบประเมิน ' + '</strong>' + val['data_quarter']);

                            console.log('codedup', status)

                            $("#btn-save_form").prop('disabled', true);

                        } else {

                            window.onbeforeunload = function () {
                                return '';
                            }

                            $("#btn-save_form").prop('disabled', false);

                            $('.chkdup').addClass('d-none');

                            console.log('codeNodup', status)

                            $.Form(citem);

                            $.Create(citem);

                            $('#page_opt').removeClass('d-none');

                        }

                    });

                }

            });

        };

        $.Form_V1 = async function (citem) {

            let Get_Form = new URL(url_hr_from);

            Get_Form.search = new URLSearchParams({

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

                    $("#assessment-list").empty();
                    $("#assessment-l").empty();

                    let i = 0;

                    for (i = 0; i < 10; i++) {
                        $('.custom-select').append('<option value="' + i + '">' + 'Option ' + i + '</option>');
                    }

                    if (citem['employee_form'] == 1) {
                        $('.formheader').html('ระดับปฏิบัติการ');
                    } else {
                        $('.formheader').html('ระดับบริหาร');
                    }

                    let temp_assessment_header = []

                    let temp_assessment_subheader = []

                    let temp_assessment_topic = []

                    $.each(result.data, function (key, val) {

                        temp_assessment_header.push(val['header_subject']);

                        temp_assessment_subheader.push(val['header_subject'] + "|" + val['subheader_name'] + "|" + val['subheader_choice'] + "|" + val['subheader_weight'] + "|" + val['subheader_id']);

                        temp_assessment_topic.push(val['subheader_name'] + "|" + val['topic_name'] + "|" + val['topic_weight'] + "|" + val['topic_id'] + "|" + val['subheader_choice']);

                    });

                    let assessment_header = temp_assessment_header.filter((v, i, a) => a.indexOf(v) === i);
                    let assessment_subheader = temp_assessment_subheader.filter((v, i, a) => a.indexOf(v) === i);
                    let assessment_topic = temp_assessment_topic.filter((v, i, a) => a.indexOf(v) === i);

                    for (let i = 0; i < assessment_header.length; i++) {

                        $('#assessment-list').append('<tr style="background-color:#7cBBFA; font-weight:bold" class="choice">' +
                            '<td align = "center" style = "font-weight:bold">' + assessment_header[i] + '</td>' +
                            '<td class="text-center card-font-bold ">50%</td>' +
                            '<td colspan="6" class="text-center" data-toggle="tooltip" data-placement="top"><span class="sum_total" id="sum_total' + i + '">0</span>%</td>' +
                            '</tr >');

                        for (let j = 0; j < assessment_subheader.length; j++) {

                            let arr_assessment_subheader = assessment_subheader[j].split("|")

                            if (arr_assessment_subheader[0] === assessment_header[i]) {

                                if (arr_assessment_subheader[2] === "1") {

                                    $('#assessment-list').append('<tr valign="middle" style="vertical-align:middle;" class="choice">' +
                                        '<td class="choice_names" style="width:60%;" data-topic_id="" data-subheader_id="' + arr_assessment_subheader[4] + '">' + arr_assessment_subheader[1] + '</td>' +
                                        '<td valign="middle" style="vertical-align:middle; width:5%" class="text-center">' + arr_assessment_subheader[3] + '%</td>' +
                                        '<td  style="width:7%"><div class="form-group">' +
                                        '<select name="1' + arr_assessment_subheader[4] + '"  id="1' + arr_assessment_subheader[4] + '" data-weight="' + arr_assessment_subheader[3] + '" class="form-control custom-select text-center sub_' + i + ' answer" data-parsley-min="1" required >' +
                                        '<option value="0"> </option>' +
                                        '<option value="1">1</option>' +
                                        '<option value="2">2</option>' +
                                        '<option value="3">3</option>' +
                                        '<option value="4">4</option>' +
                                        '<option value="5">5</option>' +
                                        '<option value="6">6</option>' +
                                        '<option value="7">7</option>' +
                                        '<option value="8">8</option>' +
                                        '<option value="9">9</option>' +
                                        '<option value="10">10</option>' +
                                        '</select>' +
                                        '</div></td>' +
                                        '<td><input type="text" class="form-control comment" /></td>' +
                                        '</tr >');


                                    $('.sub_' + i).on('change', function (e) {

                                        var sum = 0;

                                        $('.sub_' + i).each(function () {

                                            sum += (parseFloat($(this).val()) / 10) * parseFloat($(this).data('weight'));

                                        });

                                        $('#sum_total' + i).html(sum);

                                        //console.log('total', sum)

                                    });

                                } else if (arr_assessment_subheader[2] === '0') {

                                    $('#assessment-list').append('<tr style = "background-color:#c2DFFc; font-weight:bold" >' +
                                        '<td align = "left"  "font-weight:bold">' + arr_assessment_subheader[1] + '</td>' +
                                        '<td class="tx-center tx-font-bold"  >' + arr_assessment_subheader[3] + '%</td>' +
                                        '<td colspan="6" class="tx-center" title="" data-toggle="tooltip" data-placement="top"><span class="sub_total' + i + '" id="sum_' + j + '">0</span>%</td>' +
                                        '</tr >');
                                }

                                for (let k = 0; k < assessment_topic.length; k++) {

                                    let arr_assessment_topic = assessment_topic[k].split("|")

                                    if (arr_assessment_topic[0] === arr_assessment_subheader[1] & arr_assessment_subheader[2] === '0') {

                                        $('#assessment-list').append('<tr  class="choice">' +
                                            '<td align = "left" class="choice_names choice_name" data-topic_id="' + arr_assessment_topic[3] + '">' + arr_assessment_topic[1] + '</td>' +
                                            '<td class="tx-center kt-font-bold  choice_percent ">' + arr_assessment_topic[2] + '%</td>' +
                                            '<td><div class="form-group">' +
                                            '<select name="2' + arr_assessment_topic[3] + '"  id="1' + arr_assessment_topic[3] + '" data-weight="' + arr_assessment_topic[2] + '" class="form-control custom-select text-center topic_' + j + ' answer" data-parsley-min="1" required >' +
                                            '<option value="0"></option>' +
                                            '<option value="1">1</option>' +
                                            '<option value="2">2</option>' +
                                            '<option value="3">3</option>' +
                                            '<option value="4">4</option>' +
                                            '<option value="5">5</option>' +
                                            '<option value="6">6</option>' +
                                            '<option value="7">7</option>' +
                                            '<option value="8">8</option>' +
                                            '<option value="9">9</option>' +
                                            '<option value="10">10</option>' +
                                            '</select>' +
                                            '</div></td>' +
                                            '<td><input type="text" class="form-control comment" /></td>' +
                                            '</tr >');

                                        $('.topic_' + j).on('change', function (e) {

                                            e.preventDefault();

                                            let sum = 0;
                                            let sum_total = 0;

                                            $('.topic_' + j).each(function () {

                                                sum += (parseFloat($(this).val()) / 10) * parseFloat($(this).data('weight'));

                                            });

                                            //console.log(sum);

                                            $('#sum_' + j).html(sum);

                                            $('.sub_total' + i).each(function () {

                                                //console.log($(this).html())

                                                if (!isNaN($(this).html())) {

                                                    sum_total += parseFloat($(this).html());

                                                }
                                            });

                                            //console.log('sum_total', sum_total);

                                            let val_sum_total = new Intl.NumberFormat('en-US', {
                                                minimumFractionDigits: 2
                                            }).format(sum_total.toFixed(2));

                                            $('#sum_total' + i).html(val_sum_total);

                                        });

                                    }

                                };

                            }

                        };

                    };

                    $('#assessment-list').append(' <tr style="background-color:#43A1FF;" valign="middle">' +
                        //'<td align="center" style="font-weight:bold; class"kt-hidden" vertical-align:middle" valign="middle">รวม</td>' +
                        '<td class="tx-center tx-font-bold" style="vertical-align:middle" valign="middle">100%</td>' +
                        '<td colspan="6" class="tx-center tx-font-bold">' +
                        '<div><span id="asse_total_1" class"">0</span> คะแนน</div>' +
                        '<div><span id="asse_percent_1" class"">0</span> %</div>' +
                        '</td>' +
                        '</tr>');

                    $('#assessment-l').append(
                        ' <tr class="tx-center tx-font-bold" style="vertical-align:middle; background-color:#c2DFFc">' +
                        ' <th valign="middle" style="vertical-align:middle; ;" width="50%">ความสำเร็จและจุดเด่น</th>' +
                        ' <th valign="middle" style="vertical-align:middle; ;" width="50%">สิ่งที่ควรปรับปรุงและจุดอ่อน</th>' +
                        ' </tr>' +
                        ' <tr class="tx-center tx-valign-middle" style="vertical-align:middle;">' +
                        ' <td><textarea id="comment_1_1" name="comment_1_1" class="comment_1_1" style="width:100%" required></textarea></td>' +
                        ' <td><textarea id="comment_1_2" name="comment_1_2" class="comment_1_2" style="width:100%" required></textarea></td>' +
                        '</tr>');

                    $('.answer').on('change', function (e) {

                        e.preventDefault();

                        //console.log('answer')

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

                    $('.custom-select').change(function (e) {

                        e.preventDefault();

                        $('#emp_assess').prop('disabled', true)

                    });
                }

                //$.Form_More()

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

                    $("#assessment-list").empty();
                    $("#assessment-more").empty();
                    //$("#assessment-l").empty();

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

                    $('#assessment-more').append(
                        '<tr class="text-center card-valign-middle" style="vertical-align:middle; background-color:#c2DFFc">' +
                        '<th valign="middle" style="vertical-align:middle; width:40%;" width="50%">สิ่งที่ต้องแก้ไขและปรับปรุง (อย่างน้อย 3 ข้อ)</th>' +
                        '<th valign="middle" style="vertical-align:middle; width:40%;" width="50%">สิ่งที่ต้องเรียนรู้และพัฒนาเพิ่มเติม (อย่างน้อย 3 ข้อ)</th>' +
                        '</tr>' +
                        '<tr class="text-center card-valign-middle" style="vertical-align:middle;">' +
                        '<td><textarea class="form-control" id="comment_1_1" name="comment_1_1" style="width:100%" required></textarea></td>' +
                        '<td><textarea class="form-control" id="comment_1_2" name="comment_1_2" style="width:100%" required></textarea></td>' +
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

                            $('#assessment-list').append('<tr style="background-color:#7cBBFA; font-weight:bold" class="choice">' +
                                '<td align = "center" class="choice_names tx-16" style = "font-weight:bold" data-subheader_id="' + val['header_id'] + '">' + val['header_subject'] + '</td>' +
                                '<td class="text-center card-font-bold header_weight d-none">' + val['header_weight'] + '%</td>' +
                                '<td colspan="6" class="text-center" data-toggle="tooltip" data-placement="top"><span class="sum_total d-none" id="sum_total' + assessment_header + '">0</span></td>' +
                                '</tr >');

                        }

                        let n = (header_subject - 1)

                        $('#assessment-list').append('<tr valign="middle" style="vertical-align:middle;" class="choice">' +
                            '<td class="choice_names tx-15" style="vertical-align:middle;" data-topic_id="" data-subheader_id="' + val['subheader_id'] + '">' + val['subheader_name'] + '</td>' +
                            '<td valign="middle" style="vertical-align:middle;" class="text-center d-none">' + val['subheader_weight'] + '</td>' +
                            '<td><div class="form-group">' +
                            '<input type="number"  name="' + val['subheader_id'] + '"  id="' + val['subheader_id'] + '" data-weight="' + val['subheader_weight'] + '"class="form-control text-center numbers sub_' + n + ' answer" min="1" max="10" step="1" required  />' +
                            '</div></td>' +
                            '<td><input type="text" class="form-control comment comment_' + n + '"  required/></td>' +
                            '</tr >');

                        $(".numbers").inputFilter(function (value) {
                            return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 10);
                        });

                        $('.sub_' + n).val(0)

                        $('.sub_' + n).on("keyup change", function (e) {

                            //console.log('val')
                            //$('#emp_assess').prop('disabled', true);

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
                        $('.sub_0 , .comment_0 ').removeAttr('required')
                        $('.comment_0').attr('placeholder', 'ระดับ Management').prop('disabled', true)

                        i++;

                    });

                    $('#assessment-list').append(' <tr style="background-color:#43A1FF;" valign="middle" class="d-none">' +
                        '<td class="tx-center tx-font-bold" style="vertical-align:middle" valign="middle">' + sum_weight + '%</td>' +
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

                    // $("#tbl-list td").empty();

                    $("#tbl-list tbody tr").empty();

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
                                    data_leader_assess: leader_assess_id,
                                    data_employee_assess: citem['employee_id'],
                                    data_form: citem['employee_form'],
                                    data_quarter: citem['quarter_id'],
                                    data_assess_by: '2',
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

                                                if (result.status === 'Error') {

                                                    toastr.error('Oops! An Error Occurred');
                                                    $("#global-loader").fadeOut("slow");

                                                } else {

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

        $(document).ready(async function () {

            await $.init();
            await $.Verify_ID();

        });

    } else {

        window.location.assign('./login');

    }

});