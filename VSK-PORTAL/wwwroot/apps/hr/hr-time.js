'use strict';

let fs = firebase.firestore();
let oTable, history_Table, role_code, mode;
let inventorycode_dataset = [];
let invfrecode_dataset = [];

let employee_dataSet = [];
let invname_dataSet = [];
let invname_dataSet_list = [];
let job_sec_dataSet = [];
let job_detp_dataSet = [];
let job_pos_dataSet = [];
let quarter_dataSet = [];

const url_api = "http://localhost:49705/";
const url_employee_get = url_api + '/api/Hr_Employee_Get';
const url_time_get = url_api + '/api/Hr_Time_Get';
const url_time_create = url_api + '/api/Hr_Time_Create';
const url_Job_Get = url_api + '/api/Hr_Job_Get';
const url_quarter_get = url_api + '/api/Hr_Quarter_Get';

const objProfile = JSON.parse(localStorage.getItem('objProfile'));
let validator, table, options, item_action, item_id, deatailCondition;
var name;

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {
        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");

        //console.log('user', user.email);

    } else {

        window.location.assign('./login');

    }

});

$.init = function () {

    $('.dropify').dropify({
        messages: {
            'default': 'Drag and drop a file here or click',
            'replace': 'Drag and drop or click to replace',
            'remove': 'Remove',
            'error': 'Ooops, something wrong appended.'
        },
        error: {
            'fileSize': 'The file size is too big (2M max).'
        }
    });

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

    $.Job_Sec();

    $.Job_Dept();

    $.Job_Pos();

    $.Employee_Get();

    $.Quarter_Get();

    $(".custom-file-input").on("change", function () {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

};

$.List = async function () {

    let url = new URL(url_time_get);

    url.search = new URLSearchParams({

        time_data_quarter: $('#frm_search').find('#sh_data_quarter').val() === '' ? '' : $('#frm_search').find('#sh_data_quarter').val(),
        employee_code: $('#frm_search').find('#employee_code').val() === '' ? '' : $('#frm_search').find('#employee_code').val(),
        employee_sec: $('#frm_search').find('#employee_sec').val() === '' ? '' : $('#frm_search').find('#employee_sec').val(),
        employee_dept: $('#frm_search').find('#employee_dept').val() === '' ? '' : $('#frm_search').find('#employee_dept').val(),
        employee_pos: $('#frm_search').find('#employee_pos').val() === '' ? '' : $('#frm_search').find('#employee_pos').val(),

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
                scrollX: true,
                scrollCollapse: true,
                autoWidth: true,
                scrollY: "500px",
                scrollCollapse: true,
                paging: false,
                colReorder: true,
                buttons: [
                    'pageLength', 'excel'
                    //'pageLength', 'colvis'
                ],
                columns: [
                    {
                        title: "<span style='font-size:11px;'>รอบประเมิน <br> Quarter</span>",
                        data: "time_data_quarter",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //0
                    {
                        title: "<span style='font-size:11px;'>รหัสพนักงาน <br> Employee Code</span>",
                        data: "time_employee_code",
                        width: "100px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //1 
                    {
                        title: "<span style='font-size:11px;'>ชื่อ <br> Name</span>",
                        data: "time_employee_name",
                        class: "tx-center",
                        width: "100px",
                        //visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;  color:OrangeRed;">' + data + '</span>';
                        }
                    }, //2
                    {
                        title: "<span style='font-size:11px;'>ตำแหน่ง <br> Position</span>",
                        data: "time_employee_pos",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>มาสาย/ครั้ง <br> Late count</span>",
                        data: "time_late_count",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>มาสาย/เวลา <br> Late time</span>",
                        data: "time_late_time",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //5
                    {
                        title: "<span style='font-size:11px;'>ขาดงาน/ครั้ง <br> Absent count</span>",
                        data: "time_absent_count",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //6
                    {
                        title: "<span style='font-size:11px;'>ขาดงาน/เวลา <br> Absent time</span>",
                        data: "time_absent_time",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //7
                    {
                        title: "<span style='font-size:11px;'>ลาป่วย/เวลา <br> Sick leave</span>",
                        data: "time_sick_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //8
                    {
                        title: "<span style='font-size:11px;'>ลากิจ/เวลา <br> Personal leave</span>",
                        data: "time_personal_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //9
                    {
                        title: "<span style='font-size:11px;'>ลาคลอด/เวลา <br> Maternity leave</span>",
                        data: "time_maternity_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //10
                    {
                        title: "<span style='font-size:11px;'>ลาบวช/เวลา <br> Ordination leave</span>",
                        data: "time_ordination_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //11
                    {
                        title: "<span style='font-size:11px;'>ลาหักค่าจ้าง/เวลา <br> Wage leave</span>",
                        data: "time_wage_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //12
                    {
                        title: "<span style='font-size:11px;'>ลางานศพ/งานแต่ง <br> Funeral/wedding leave</span>",
                        data: "time_funeral_wedding_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //13
                    {
                        title: "<span style='font-size:11px;'>ใบเตือน <br> Warning leave</span>",
                        data: "time_warning_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //14
                    {
                        title: "<span style='font-size:11px;'>ใบภาคทัณฑ์ <br> Probate leave</span>",
                        data: "time_probate_leave",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';

                        }
                    }, //15
                    {
                        title: "<span style='font-size:11px;'>คะแนนรวม <br> Score</span>",
                        data: "time_score",
                        class: "tx-center",
                        width: "100px",
                        // visible: false,
                        render: function (data, type, row, meta) {
                            if (data == null) {
                                return '';
                            } else {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }

                        }
                    }, //16
                ],
                //"order": [[1, "desc"]],
                "initComplete": function (settings, json) {

                    $("#global-loader").fadeOut("slow");

                    $.contextMenu({
                        selector: '#tbl-list tbody tr',
                        callback: async function (key, options) {

                            let data = oTable.row(this).data();
                            let citem = {

                                time_id: data['time_id'],
                                time_employee_code: data['time_employee_code'],
                                time_employee_name: data['time_employee_name'],
                                time_employee_pos: data['time_employee_pos'],
                                time_late_count: data['time_late_count'],
                                time_late_time: data['time_late_time'],
                                time_absent_count: data['time_absent_count'],
                                time_absent_time: data['time_absent_time'],
                                time_sick_leave: data['time_sick_leave'],
                                time_personal_leave: data['time_personal_leave'],
                                time_maternity_leave: data['time_maternity_leave'],
                                time_ordination_leave: data['time_ordination_leave'],
                                time_wage_leave: data['time_wage_leave'],
                                time_funeral_wedding_leave: data['time_funeral_wedding_leave'],
                                time_warning_leave: data['time_warning_leave'],
                                time_probate_leave: data['time_probate_leave'],
                                time_data_quarter: data['time_data_quarter'],
                                time_score: data['time_score'],
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

                            if (key === 'view') {
                                //console.log(citem);
                                //$.Details(citem);

                            } else if (key === 'edit') {

                                //await $.Details(citem);
                                //await $.Edit(citem);

                            } else if (key === 'delete') {

                                //$.Details(citem);
                                //$.Delete(citem);

                            }
                            else if (key === 'create') {

                                //$.Create();

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

$.Create = async function () {

    $('.fileupload').hide();

    $('#time_data_quarter').on('change', function (evt) {

        evt.preventDefault();

        //emp_quarter = $(this).val();

        if ($(this).val() !== '') {
            //swal(
            //    {
            //        title: 'Well done!',
            //        text: 'You clicked the button!',
            //        type: 'success',
            //        confirmButtonColor: '#57a94f'
            //    }
            //)

            $('.fileupload').show();

            //alert($(this).val());

            $('#fileupload').on('change', function (evt) {

                evt.preventDefault();

                $("#global-loader").fadeIn("slow");

                readXlsxFile(this.files[0], { dateFormat: 'MM/DD/YY' }).then(function (result) {

                    var i = 0;

                    // console.log(result);

                    let citem_time = [];
                    let quarter = $('#time_data_quarter').val();

                    // console.log(quarter);

                    $.each(result, function (key, val) {

                        if (i > 0) {

                            citem_time.push({

                                time_employee_code: val[0],
                                time_employee_name: val[1],
                                time_employee_pos: val[2],
                                time_late_count: val[3],
                                time_late_time: val[4],
                                time_absent_count: val[5],
                                time_absent_time: val[6],
                                time_sick_leave: val[7],
                                time_personal_leave: val[8],
                                time_maternity_leave: val[9],
                                time_ordination_leave: val[10],
                                time_wage_leave: val[11],
                                time_funeral_wedding_leave: val[12],
                                time_warning_leave: val[13],
                                time_probate_leave: val[14],
                                time_data_quarter: quarter,
                                created_by: name,

                            });


                        }

                        i++
                    });

                    //console.log(citem_time);

                    $.ajax({
                        url: 'http://localhost:49705/api/Hr_Time_Create',
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(citem_time),
                        success: function (result) {

                            $("#global-loader").fadeOut("slow");

                            Swal.fire(
                                'บันทึกข้อมูลสำเร็จ',
                                'You clicked the button!',
                                'success'
                            ).then((result) => {
                                if (result.value) {
                                    location.reload();
                                }
                            });


                        }
                    });


                });

            });

        } else {

            $('.fileupload').hide();

        }



    });
};

$.Quarter_Get = function () {

    let quarter_get = new URL(url_quarter_get);

    quarter_get.search = new URLSearchParams({

        quarter_id: ''

    });
    fetch(quarter_get).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.status === 'Error') {



            $("#global-loader").fadeOut("slow");

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'ไม่สามารถเรียกข้อมูล รอบประเมินได้',
            }).then((result) => {
                if (result.isConfirmed) {
                    //location.reload();
                }
            })
        } else {

            $.each(result.data, function (key, val) {
                quarter_dataSet.push({ id: val['quarter_id'], text: val['quarter_name'] + val['quarter_year'] });

            });

            $('#time_data_quarter').select2({
                width: '100%',
                height: '40px',
                data: quarter_dataSet,
                templateResult: function (data) {
                    return data.text;
                },
                sorter: function (data) {
                    return data.sort(function (a, b) {
                        return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                    });
                }
            });

            $('#sh_data_quarter').select2({
                width: '100%',
                height: '40px',
                data: quarter_dataSet,
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

$.Job_Sec = function () {

    let Job_Sec_Get = new URL(url_Job_Get);

    Job_Sec_Get.search = new URLSearchParams({

        job_type: 1

    });
    fetch(Job_Sec_Get).then(function (response) {
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

            $.each(result.data, function (key, val) {
                job_sec_dataSet.push({ id: val['job_id'], text: val['job_name'] });

            });

            $('.employee_sec').select2({
                width: '100%',
                height: '40px',
                data: job_sec_dataSet,
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

$.Job_Dept = function () {

    let Job_Dept_Get = new URL(url_Job_Get);

    Job_Dept_Get.search = new URLSearchParams({

        job_type: 2

    });
    fetch(Job_Dept_Get).then(function (response) {
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

            $.each(result.data, function (key, val) {
                job_detp_dataSet.push({ id: val['job_id'], text: val['job_name'] });

            });

            $('.employee_dept').select2({
                width: '100%',
                height: '40px',
                data: job_detp_dataSet,
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

$.Job_Pos = function () {

    let Job_Pos_Get = new URL(url_Job_Get);

    Job_Pos_Get.search = new URLSearchParams({

        job_type: 3

    });
    fetch(Job_Pos_Get).then(function (response) {
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

            $.each(result.data, function (key, val) {
                job_pos_dataSet.push({ id: val['job_id'], text: val['job_name'] });

            });

            $('.employee_pos').select2({
                width: '100%',
                height: '40px',
                data: job_pos_dataSet,
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

$.Employee_Get = function () {

    let employee_dataSet = [];

    let Employee_Get = new URL(url_employee_get);

    Employee_Get.search = new URLSearchParams({

        record_status: 1

    });

    fetch(Employee_Get).then(function (response) {
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

            $.each(result.data, function (key, val) {
                employee_dataSet.push({ id: val['employee_code'], text: val['employee_code'] + ' ' + val['employee_name'] });

            });

            $('#employee_code').select2({
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

$(document).ready(async function () {

    await $.init();
    await $.List();
    await $.Create();

});