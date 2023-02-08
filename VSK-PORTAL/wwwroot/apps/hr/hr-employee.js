'use strict';

let fs = firebase.firestore();
let oTable, role_code, mode;
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

const url_api = "http://localhost:49705/";
let template_url = 'http://192.168.1.247/template/';
const url_employee_get = url_api + '/api/Hr_Employee_Get';
const url_employee_import = url_api + '/api/Hr_Employee_Import';
const url_employee_create = url_api + '/api/Hr_Employee_Create';
const url_employee_update = url_api + '/api/Hr_Employee_Update';
const url_employee_delete = url_api + '/api/Hr_Employee_Delete';
const url_Job_Get = url_api + '/api/Hr_Job_Get';

let validator, table, options, item_action, item_id, deatailCondition;

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        var full_mail = user.email;
        var name = full_mail.replace("@vskautoparts.com", "");

        $.init = function () {

            $('#btn-emp_import').hide()
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

                $.List();

            });

            $('.reset').on("click", function (e) {

                $('#frm_search').find('select').val('').trigger('change');

                e.preventDefault();

            });

            $('#modal-frm_data').on('hidden.bs.modal', function () {

                $("#frm_data").parsley().reset();

            });

            $('#modal-import').off('shown.bs.modal').on('shown.bs.modal', async function (e) {

                await $.Import();

            });

            $('#modal-import').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                //await setTimeout(function () {

                //    location.reload();

                //}, 100);

            });

            $('#btn-emp_create').click(function (e) {

                e.preventDefault();

                $("#frm_data").parsley().reset();
                $("#frm_data").find('input , select').prop("disabled", false);
                $("#frm_data").find('input, select').val('');
                $("#frm_data").find('select').val('').trigger('change');

                setTimeout(function () {

                    $.Create();

                    $.Ck_Employee_code();

                }, 300);

            });

            $('#btn-emp_import').click(function (e) {

                e.preventDefault();

            });

            $('#btn_downloadtemplate').on('click', function (evt) {

                location.href = template_url + 'HR_Template_Employee_Import.xlsx';

            });

            $.Job_Sec();

            $.Job_Dept();

            $.Job_Pos();

            $.Employee_Get();

            $.Leader_Get();
        };

        $.List = async function () {

            let url = new URL(url_employee_get);

            url.search = new URLSearchParams({

                employee_id: $('#frm_search').find('#employee_name').val() === '' ? '' : $('#frm_search').find('#employee_name').val(),
                employee_form: $('#frm_search').find('#employee_form').val() === '' ? '' : $('#frm_search').find('#employee_form').val(),
                employee_sec: $('#frm_search').find('#employee_sec').val() === '' ? '' : $('#frm_search').find('#employee_sec').val(),
                employee_dept: $('#frm_search').find('#employee_dept').val() === '' ? '' : $('#frm_search').find('#employee_dept').val(),
                employee_pos: $('#frm_search').find('#employee_pos').val() === '' ? '' : $('#frm_search').find('#employee_pos').val(),

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

                    oTable = $('#tbl-list').DataTable({
                        data: result.data,
                        dom: 'Bfrtlip',
                        deferRender: true,
                        ordering: true,
                        pageLength: 10,
                        bDestroy: true,
                        "lengthMenu": [5, 10, 25, 50, 75, 100],
                        buttons: [
                            'copyHtml5',
                            {
                                extend: 'excelHtml5',
                                title: '',
                                filename: 'CarModelMix_' + moment().format("YYYY/MM/DD hh:ss:mm"),
                                exportOptions: {
                                    columns: [1, 3, 4, 5, 6, 7, 8, 9, 13, 10, 11, 12, 14, 15, 16, 17, 18, 19, 25, 26]
                                }
                            },
                        ],

                        columns: [
                            {
                                title: "<span style='font-size:11px;'>code</span>",
                                data: "employee_code",
                                width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //1 
                            {
                                title: "<span style='font-size:11px;'>Prefix</span>",
                                data: "employee_prefix",
                                width: "300px",
                                visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>Name</span>",
                                data: "employee_name",
                                class: "tx-center",
                                width: "170px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + row.employee_prefix + '</span>' + '  ' + '<span style="font-size:11px;">' + data + '</span>';
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>Section</span>",
                                data: "employee_sec",
                                class: "tx-center",
                                width: "70px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;  color:;">' + data + '</span>';
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>Department</span>",
                                data: "employee_dept",
                                class: "tx-center",
                                width: "70px",
                                //visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;  color:;">' + data + '</span>';
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>Position</span>",
                                data: "employee_pos",
                                class: "tx-center",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + data + '</span>';

                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>Start date</span>",
                                data: "employee_job_startdate",
                                class: "tx-center",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '<span/>';
                                }
                            }, //7
                            {
                                title: "<span style='font-size:11px;'>Assessment form</span>",
                                data: "employee_form",
                                class: "tx-center",
                                width: "100px",
                                // visible: false,
                                render: function (data, type, row, meta) {
                                    if (data == 1) {
                                        return '<span class="tx-dark">ระดับปฏิบัติการ</span >'
                                    } else if (data == 2) {
                                        return '<span class="tx-dark">ระดับหัวหน้างาน</span >'
                                    } else if (data == 3) {
                                        return '<span class="tx-dark">ระดับบริหาร</span >'
                                    } else {
                                        return '<span class="tx-dark">ไม่มีแบบประเมิน</span >'
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
                                        employee_id: data['employee_id'],
                                        user_id: data['user_id'],
                                        employee_code: data['employee_code'],
                                        employee_prefix: data['employee_prefix'],
                                        employee_name: data['employee_name'],
                                        employee_nickname: data['employee_nickname'],
                                        employee_sec: data['employee_sec'],
                                        employee_dept: data['employee_dept'],
                                        employee_pos: data['employee_pos'],
                                        employee_sec_id: data['employee_sec_id'],
                                        employee_dept_id: data['employee_dept_id'],
                                        employee_pos_id: data['employee_pos_id'],
                                        employee_job_startdate: data['employee_job_startdate'],
                                        employee_leader_asses1: data['employee_leader_asses1'],
                                        employee_leader_asses2: data['employee_leader_asses2'],
                                        employee_leader_asses3: data['employee_leader_asses3'],
                                        employee_form: data['employee_form'],
                                        created_by: data['created_by'],
                                        created_date: data['created_date'],
                                        updated_by: data['updated_by'],
                                        updated_date: data['updated_date'],
                                        record_status: data['record_status'],
                                        employee_prefix_th: data['employee_prefix_th'],
                                        employee_first_name_th: data['employee_first_name_th'],
                                        employee_last_name_th: data['employee_last_name_th'],
                                        employee_full_name_th: data['employee_full_name_th'],
                                        employee_prefix_en: data['employee_prefix_en'],
                                        employee_first_name_en: data['employee_first_name_en'],
                                        employee_last_name_en: data['employee_last_name_en'],
                                        employee_full_name_en: data['employee_full_name_en'],
                                        employee_photo: data['employee_photo'],
                                        employee_nickname_th: data['employee_nickname_th'],
                                        employee_nickname_en: data['employee_nickname_en'],
                                    };

                                    //$('#modal-frm_data').modal({

                                    //    keyboard: false,
                                    //    backdrop: 'static'

                                    //});
                                    //$('#modal-import').modal({

                                    //    keyboard: false,
                                    //    backdrop: 'static'

                                    //});
                                    if (key === 'view') {
                                        //console.log(citem);
                                        $.Details(citem);
                                        $('#btn-delete').addClass('hide');


                                    } else if (key === 'edit') {

                                        await $.Details(citem);
                                        await $.Edit(citem);
                                        $('#btn-delete').addClass('hide');

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

        $.Ck_Employee_code = async function () {


            $("#frm_data").find('#employee_code').off('keyup').on('keyup', function (evt) {

                evt.preventDefault();


                if ($(this).val().length === 5) {

                    let get_ck = new URL(url_employee_get);

                    get_ck.search = new URLSearchParams({

                        employee_code: $(this).val()

                    });

                    fetch(get_ck).then(function (response) {
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

                            $.each(result.data, function (key, val) {

                                if (val['employee_code'] == $("#frm_data").find('#employee_code').val()) {

                                    swal({
                                        title: "ขออภัย",
                                        text: "รหัสพนักงานซ้ำ",
                                        type: 'warning',
                                        timer: 2000,
                                        showConfirmButton: false
                                    });

                                    $("#frm_data").find('#btn-submit').prop('disabled', true);


                                } else {


                                    $("#frm_data").find('#btn-submit').prop('disabled', false);
                                }



                            });


                        }

                    });


                } else {

                    $("#frm_data").find('#btn-submit').prop('disabled', false);
                }


            });

        };

        $.Import = async function () {

            $(document).on('change', '#customFile', function (evt) {

                evt.preventDefault();

                var path = $(this).val();
                var fileName = path.replace(/^.*\\/, "");
                $(this).next('.custom-file-label').html(fileName);

                if ($(this).val() !== '') {

                    $("#customFile").prop('disabled', true);

                    $(".modal-body").LoadingOverlay("show", {
                        image: '',
                        custom: customElement
                    });

                    let uuid = $.uuid();

                    let i = 0;

                    readXlsxFile(this.files[0], { dateFormat: 'YYYY/MM/DD_hh:mm:ss' }).then(async function (result) {

                        let count_length = result.length - 2;

                        if (result.length > 2) {

                            var citem_import = [];

                            $.each(result, async function (key, val) {

                                if (i > 1) {

                                    citem_import.push({

                                        user_id: '',
                                        employee_code: $.trim(val[0]),
                                        employee_prefix_th: $.trim(val[1]),
                                        employee_first_name_th: $.trim(val[2]),
                                        employee_last_name_th: $.trim(val[3]),
                                        employee_nickname_th: $.trim(val[4]),
                                        employee_prefix_en: $.trim(val[5]),
                                        employee_first_name_en: $.trim(val[6]),
                                        employee_last_name_en: $.trim(val[7]),
                                        employee_nickname_en: $.trim(val[8]),
                                        employee_sec: $.trim(val[9]),
                                        employee_dept: $.trim(val[10]),
                                        employee_pos: $.trim(val[11]),
                                        employee_job_startdate: $.trim(val[12]),
                                        employee_leader_asses1: $.trim(val[13]),
                                        employee_leader_asses2: $.trim(val[14]),
                                        employee_leader_asses3: $.trim(val[15]),
                                        employee_form: $.trim(val[16]),
                                        created_by: user_id,
                                        temp_id: uuid,

                                    });

                                }

                                i++

                            });


                            console.log('citem_import', citem_import)
                            await $.ajax({
                                url: url_employee_import,
                                type: 'POST',
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                data: JSON.stringify(citem_import),
                                success: function (data) {

                                    if (data.status === 'Error') {

                                        $(".modal-body").LoadingOverlay("hide", true);

                                        toastr.error('Error, Please contact administrator.');

                                    } else {


                                        console.log('data',data)
                                        console.log('dataa', data.data)

                                        //fetch(url_importdate_carmodelmix_verify + '?temp_id=' + uuid + '&updated_by=' + user_id).then(function (response) {
                                        //    return response.json();
                                        //}).then(function (result) {

                                        //    if (result.status === 'Error') {

                                        //        toastr.error(status.error_message);

                                        //    } else {

                                        //        //toastr.error('Q P BOY');

                                        //        let data_import = [];

                                        //        let i = 1;
                                        //        let wrong_information = 0;
                                        //        let success_information = 0;

                                        //        $.each(result.data, function (key, val) {

                                        //            let trans_id = val['trans_id'];
                                        //            let temp_id = val['temp_id'];
                                        //            let model_id = val['model_id'];
                                        //            let modelmixed = val['modelmixed'];
                                        //            let cartype = val['cartype'];
                                        //            let vehicle_brand = val['vehicle_brand'];
                                        //            let vehicle_model = val['vehicle_model'];
                                        //            let minor_change = val['minor_change'];
                                        //            let model_change = val['model_change'];
                                        //            let fuel_type = val['fuel_type'];
                                        //            let engine_displacement = val['engine_displacement'];
                                        //            let engine_code = val['engine_code'];
                                        //            let transmission_type = val['transmission_type'];
                                        //            let body_type = val['body_type'];
                                        //            let hign_stant = val['hign_stant'];
                                        //            let wheel_drive = val['wheel_drive'];
                                        //            let street_name = val['street_name'];
                                        //            let model_code = val['model_code'];
                                        //            let remarks = val['remarks'];
                                        //            let action = val['action'];
                                        //            let created_by = val['created_by'];
                                        //            let created_datetime = val['created_datetime'];
                                        //            let updated_by = val['updated_by'];
                                        //            let updated_datetime = val['updated_datetime'];
                                        //            let record_status = val['record_status'];
                                        //            let text_status = val['text_status'];
                                        //            let chk_duplicate = val['chk_duplicate'];
                                        //            let car_models = val['car_models'];
                                        //            let car_models_ref = val['car_models_ref'];

                                        //            if (record_status == '1') {
                                        //                success_information += 1;
                                        //            } else {
                                        //                wrong_information += 1;
                                        //            }

                                        //            if (text_status == 'ไม่พบข้อมูล modelmix') {
                                        //                modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล cartype') {
                                        //                cartype = '<span style="color: red;font-weight: bold;text-align: center;">' + val['cartype'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล vehicle_brand') {
                                        //                vehicle_brand = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_brand'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล vehicle_model') {
                                        //                vehicle_model = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_model'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล fuel_type') {
                                        //                fuel_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['fuel_type'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล transmission_type') {
                                        //                transmission_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['transmission_type'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูล wheel_drive') {
                                        //                wheel_drive = '<span style="color: red;font-weight: bold;text-align: center;">' + val['wheel_drive'] + '</span>'

                                        //            } else if (text_status == 'ไม่พบข้อมูลซ้ำในระบบ') {
                                        //                modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'

                                        //            } else if (text_status == 'พบข้อมูลซ้ำในระบบ' || text_status == 'พบข้อมูลซ้ำในเอกสาร') {
                                        //                modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'
                                        //                cartype = '<span style="color: red;font-weight: bold;text-align: center;">' + val['cartype'] + '</span>'
                                        //                vehicle_brand = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_brand'] + '</span>'
                                        //                vehicle_model = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_model'] + '</span>'
                                        //                minor_change = '<span style="color: red;font-weight: bold;text-align: center;">' + val['minor_change'] + '</span>'
                                        //                model_change = '<span style="color: red;font-weight: bold;text-align: center;">' + val['model_change'] + '</span>'
                                        //                fuel_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['fuel_type'] + '</span>'
                                        //                engine_displacement = '<span style="color: red;font-weight: bold;text-align: center;">' + val['engine_displacement'] + '</span>'
                                        //                engine_code = '<span style="color: red;font-weight: bold;text-align: center;">' + val['engine_code'] + '</span>'
                                        //                transmission_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['transmission_type'] + '</span>'
                                        //                body_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['body_type'] + '</span>'
                                        //                hign_stant = '<span style="color: red;font-weight: bold;text-align: center;">' + val['hign_stant'] + '</span>'
                                        //                wheel_drive = '<span style="color: red;font-weight: bold;text-align: center;">' + val['wheel_drive'] + '</span>'
                                        //                street_name = '<span style="color: red;font-weight: bold;text-align: center;">' + val['street_name'] + '</span>'
                                        //                model_code = '<span style="color: red;font-weight: bold;text-align: center;">' + val['model_code'] + '</span>'
                                        //                remarks = '<span style="color: red;font-weight: bold;text-align: center;">' + val['remarks'] + '</span>'

                                        //            } else {
                                        //                //alert('ERORR')
                                        //            }

                                        //            if (action == 'CREATE') {

                                        //                action = '<span style="color: DarkGreen;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                        //                model_id = ''
                                        //                if (text_status == 'ไม่พบข้อมูล modelmix') {
                                        //                    modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'
                                        //                    text_status = 'ไม่พบข้อมูล modelmix'
                                        //                }

                                        //            } else if (action == 'UPDATE') {

                                        //                action = '<span style="color: DarkBlue;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                        //                model_id = '<span style="color: DarkBlue;font-weight: bold;text-align: center;">' + val['model_id'] + '</span>'

                                        //            } else if (action == 'DELETE') {

                                        //                action = '<span style="color: DarkRed;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                        //                model_id = '<span style="color: DarkRed;font-weight: bold;text-align: center;">' + val['model_id'] + '</span>'

                                        //            } else {

                                        //                action = '<span style="color: DarkOrange;font-weight: bold;text-align: center;">' + 'ERORR' + '</span>'

                                        //            }

                                        //            data_import.push([
                                        //                i,
                                        //                action,
                                        //                record_status,
                                        //                text_status,
                                        //                car_models,
                                        //                model_id,
                                        //                modelmixed,
                                        //                vehicle_brand,
                                        //                vehicle_model,
                                        //                cartype,
                                        //                model_change,
                                        //                minor_change,
                                        //                fuel_type,
                                        //                engine_displacement,
                                        //                engine_code,
                                        //                transmission_type,
                                        //                body_type,
                                        //                hign_stant,
                                        //                wheel_drive,
                                        //                street_name,
                                        //                model_code,
                                        //                remarks,
                                        //                trans_id
                                        //            ])

                                        //            i++;

                                        //        });

                                        //        table_carnodel_import = $('#tbl-carmodel_import').DataTable({
                                        //            "data": data_import,
                                        //            "dom": 'Bfrtip',
                                        //            "deferRender": true,
                                        //            "order": [[0, "desc"]],
                                        //            "ordering": false,
                                        //            "pageLength": 5,
                                        //            "bDestroy": true,
                                        //            autoWidth: true,
                                        //            buttons: [
                                        //                'copyHtml5',
                                        //                {
                                        //                    extend: 'excelHtml5',
                                        //                    title: '',
                                        //                    filename: 'Export_Temp_Varify_Carmodel',
                                        //                    exportOptions: {
                                        //                        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
                                        //                    }
                                        //                },
                                        //            ],
                                        //            "columnDefs": [{
                                        //                "targets": 'no-sort',
                                        //                "orderable": false,
                                        //            },
                                        //            {
                                        //                "targets": [0],
                                        //                "searchable": false,
                                        //                "visible": false
                                        //            },
                                        //            {
                                        //                "targets": [2],
                                        //                "render": function (data, type, row, meta) {
                                        //                    return (data === '1' ? '<span class="badge badge-pill badge-success">OK</span>' : '<span class="badge badge-pill badge-danger">ERROR</span>');
                                        //                }
                                        //            },
                                        //            {
                                        //                "targets": [3],
                                        //                "searchable": false,
                                        //            },
                                        //            {
                                        //                "targets": [22],
                                        //                "searchable": false,
                                        //                "visible": false
                                        //            }
                                        //            ],
                                        //            "initComplete": function (settings, json) {

                                        //                $('.tbl-carmodel-import').removeClass('d-none');

                                        //            }
                                        //        });

                                        //        $('#all_information').html(i - 1);
                                        //        $('#success_information').html(success_information).css("color", "darkgreen");
                                        //        $('#wrong_information').html(wrong_information).css("color", "red");

                                        //        table_carnodel_import.columns.adjust();

                                        //        $('#btn_update-data').show();

                                        //        $.carmodel_upload(uuid);

                                        //        $(".modal-body").LoadingOverlay("hide", true);
                                        //    }

                                        //});

                                    }
                                }

                            });

                        }

                    });

                }

            });

        };

        $.Create = async function () {

            $('#btn-submit').show();

            $("#btn-submit").off('click').on('click', function (e) {

                e.preventDefault();

                $('#frm_data').parsley().validate();

                if ($('#frm_data').parsley().isValid()) {

                    $('.btn-save_form').prop('disabled', true);

                    let start_date = moment($('#frm_data').find('#employee_job_startdate').val(), 'DD-MM-YYYY').format('YYYY/MM/DD')
                    let employee_prefix_th = $('#frm_data').find('#employee_prefix_th').val();
                    let employee_first_name_th = $('#frm_data').find('#employee_first_name_th').val();
                    let employee_last_name_th = $('#frm_data').find('#employee_last_name_th').val();
                    let employee_nickname_th = $('#frm_data').find('#employee_nickname_th').val();
                    let employee_prefix_en = $('#frm_data').find('#employee_prefix_en').val();
                    let employee_first_name_en = $('#frm_data').find('#employee_first_name_en').val();
                    let employee_last_name_en = $('#frm_data').find('#employee_last_name_en').val();
                    let employee_nickname_en = $('#frm_data').find('#employee_nickname_en').val();

                    // Model & Repo
                    let add_data = {

                        employee_code: $('#frm_data').find('#employee_code').val(),
                        employee_prefix: employee_prefix_th,
                        employee_name: employee_first_name_th + ' ' + employee_last_name_th,
                        employee_nickname: employee_nickname_th,
                        employee_sec: $('#frm_data').find('#employee_sec_id').val(),
                        employee_dept: $('#frm_data').find('#employee_dept_id').val(),
                        employee_pos: $('#frm_data').find('#employee_pos_id').val(),
                        employee_job_startdate: start_date,
                        employee_leader_asses1: $('#frm_data').find('#employee_leader_asses1').val(),
                        employee_leader_asses2: $('#frm_data').find('#employee_leader_asses2').val(),
                        employee_leader_asses3: $('#frm_data').find('#employee_leader_asses3').val(),
                        employee_form: $('#frm_data').find('#employee_form_id').val(),
                        created_by: user_id,
                        employee_prefix_th: $('#frm_data').find('#employee_prefix_th').val(),
                        employee_first_name_th: $('#frm_data').find('#employee_first_name_th').val(),
                        employee_last_name_th: $('#frm_data').find('#employee_last_name_th').val(),
                        employee_nickname_th: $('#frm_data').find('#employee_nickname_th').val(),
                        employee_prefix_en: $('#frm_data').find('#employee_prefix_en').val(),
                        employee_first_name_en: $('#frm_data').find('#employee_first_name_en').val(),
                        employee_last_name_en: $('#frm_data').find('#employee_last_name_en').val(),
                        employee_nickname_en: $('#frm_data').find('#employee_nickname_en').val(),
                        employee_full_name_th: employee_prefix_th + ' ' + employee_first_name_th + ' ' + employee_last_name_th,
                        employee_full_name_en: employee_prefix_en + ' ' + employee_first_name_en + ' ' + employee_last_name_en
                    };

                    console.log('add_data', add_data)

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_employee_create, {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {

                        toastr.success('Save Successfully!', async function () {

                            swal({
                                title: 'Well done!',
                                text: 'You clicked the button!',
                                type: 'success',
                                confirmButtonColor: '#57a94f'
                            })

                            await $.List();

                            await setTimeout(function () {

                                $('.btn-save_form').prop('disabled', false);

                                $('#modal-frm_data').modal('hide');

                            }, 1000);

                        });

                    }).catch((error) => {

                        console.error('Error:', error);
                    });

                    return false;
                }
            });

        };

        $.Details = async function (citem) {

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#frm_data input').removeClass('parsley-error');

            console.log('ดู', citem);

            $('#btn-submit').hide();
            //$("input[name~='employee_code']").val(citem['employee_code']).prop('disabled', true);
            $('#frm_data').find('#employee_code').val(citem['employee_code']).prop('disabled', true);

            $('#frm_data').find('#employee_prefix_th').val(citem['employee_prefix_th']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_first_name_th').val(citem['employee_first_name_th']).prop('disabled', true);
            $('#frm_data').find('#employee_last_name_th').val(citem['employee_last_name_th']).prop('disabled', true);
            $('#frm_data').find('#employee_nickname_th').val(citem['employee_nickname_th']).prop('disabled', true);

            $('#frm_data').find('#employee_prefix_en').val(citem['employee_prefix_en']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_first_name_en').val(citem['employee_first_name_en']).prop('disabled', true);
            $('#frm_data').find('#employee_last_name_en').val(citem['employee_last_name_en']).prop('disabled', true);
            $('#frm_data').find('#employee_nickname_en').val(citem['employee_nickname_en']).prop('disabled', true);


            $('#frm_data').find('#employee_nickname').val(citem['employee_nickname']).prop('disabled', true);
            $('#frm_data').find('.employee_sec').val(citem['employee_sec_id']).trigger('change').prop('disabled', true);
            $('#frm_data').find('.employee_dept').val(citem['employee_dept_id']).trigger('change').prop('disabled', true);
            $('#frm_data').find('.employee_pos').val(citem['employee_pos_id']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_job_startdate').val(moment(citem['employee_job_startdate'], 'YYYY-MM-DD').format('DD/MM/YYYY')).prop('disabled', true);
            $('#frm_data').find('#employee_leader_asses1').val(citem['employee_leader_asses1']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_leader_asses2').val(citem['employee_leader_asses2']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_leader_asses3').val(citem['employee_leader_asses3']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#employee_form_id').val(citem['employee_form']).trigger('change').prop('disabled', true);

        };

        $.Edit = async function (citem) {

            setTimeout(function () {

                $('#frm_data').find('#employee_job_startdate').removeAttr('disabled');
                $('#frm_data').find('select').removeAttr('disabled');
                $('#frm_data').find('input').removeAttr('disabled');
                $('#btn-submit').show();

            }, 100);


            $("#btn-submit").off('click').on('click', function (e) {

                e.preventDefault();

                $('#frm_data').parsley().validate();

                if ($('#frm_data').parsley().isValid()) {

                    let start_date = moment($('#frm_data').find('#employee_job_startdate').val(), 'DD-MM-YYYY').format('YYYY/MM/DD')
                    let employee_prefix_th = $('#frm_data').find('#employee_prefix_th').val();
                    let employee_first_name_th = $('#frm_data').find('#employee_first_name_th').val();
                    let employee_last_name_th = $('#frm_data').find('#employee_last_name_th').val();
                    let employee_nickname_th = $('#frm_data').find('#employee_nickname_th').val();
                    let employee_prefix_en = $('#frm_data').find('#employee_prefix_en').val();
                    let employee_first_name_en = $('#frm_data').find('#employee_first_name_en').val();
                    let employee_last_name_en = $('#frm_data').find('#employee_last_name_en').val();
                    let employee_nickname_en = $('#frm_data').find('#employee_nickname_en').val();

                    // Model & Repo
                    let add_data = {
                        employee_id: citem['employee_id'],
                        employee_code: citem['employee_code'],
                        employee_prefix: employee_prefix_th,
                        employee_name: employee_first_name_th + ' ' + employee_last_name_th,
                        employee_nickname: employee_nickname_th,
                        employee_sec: $('#frm_data').find('#employee_sec_id').val(),
                        employee_dept: $('#frm_data').find('#employee_dept_id').val(),
                        employee_pos: $('#frm_data').find('#employee_pos_id').val(),
                        employee_job_startdate: start_date,
                        employee_leader_asses1: $('#frm_data').find('#employee_leader_asses1').val(),
                        employee_leader_asses2: $('#frm_data').find('#employee_leader_asses2').val(),
                        employee_leader_asses3: $('#frm_data').find('#employee_leader_asses3').val(),
                        employee_form: $('#frm_data').find('#employee_form_id').val(),
                        created_by: user_id,
                        employee_prefix_th: $('#frm_data').find('#employee_prefix_th').val(),
                        employee_first_name_th: $('#frm_data').find('#employee_first_name_th').val(),
                        employee_last_name_th: $('#frm_data').find('#employee_last_name_th').val(),
                        employee_nickname_th: $('#frm_data').find('#employee_nickname_th').val(),
                        employee_prefix_en: $('#frm_data').find('#employee_prefix_en').val(),
                        employee_first_name_en: $('#frm_data').find('#employee_first_name_en').val(),
                        employee_last_name_en: $('#frm_data').find('#employee_last_name_en').val(),
                        employee_nickname_en: $('#frm_data').find('#employee_nickname_en').val(),
                        employee_full_name_th: employee_prefix_th + ' ' + employee_first_name_th + ' ' + employee_last_name_th,
                        employee_full_name_en: employee_prefix_en + ' ' + employee_first_name_en + ' ' + employee_last_name_en
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_employee_update, {
                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {

                        toastr.success('Save Successfully!', async function () {

                            swal(
                                {
                                    title: 'Well done!',
                                    text: 'You clicked the button!',
                                    type: 'success',
                                    timer: 1000
                                }
                            )

                            await $.List();

                            $('#modal-frm_data').modal('hide');

                        });

                    }).catch((error) => {

                        console.error('Error:', error);
                    });

                    return false;

                }
            })

        };

        $.Delete = async function (citem) {

            $('#btn-delete').on('click', function (e) {
                e.preventDefault

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

                        let delete_data = {
                            employee_id: citem['employee_id'],
                            updated_by: name
                        };

                        var params = [];
                        for (const i in delete_data) {
                            params.push(i + "=" + encodeURIComponent(delete_data[i]));
                        }

                        fetch(url_employee_delete, {
                            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                            // mode: 'no-cors', // no-cors, *cors, same-origin
                            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                            credentials: 'same-origin', // include, *same-origin, omit
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: params.join("&"),
                        }).then(data => {

                            toastr.success('Save Successfully!', async function () {

                                swal("Deleted!", "Your imaginary file has been deleted.", "success");

                                await $.List();

                                $('#modal-frm_data').modal('hide');

                            });

                        }).catch((error) => {



                            console.error('Error:', error);
                        });

                    } else {

                        swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                    }
                })

            });

        };

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

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ขออภัย!');

                } else {

                    let job_sec_dataSet = [];

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

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ขออภัย!');

                } else {

                    let job_detp_dataSet = [];

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

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ขออภัย!');

                } else {

                    let job_pos_dataSet = [];

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

            let Employee_Get = new URL(url_employee_get);

            Employee_Get.search = new URLSearchParams({

                record_status: 1

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

                    toastr.error('ขออภัย!');

                } else {

                    let employee_dataSet = [];

                    $.each(result.data, function (key, val) {
                        employee_dataSet.push({ id: val['employee_id'], text: val['employee_code'] + ' ' + val['employee_name'] });

                    });

                    $('#employee_name').select2({
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

        $.Leader_Get = function () {

            let employee_dataSet1 = [];

            let Leader_Get = new URL(url_employee_get);

            Leader_Get.search = new URLSearchParams({

                record_status: 1

            });
            fetch(Leader_Get).then(function (response) {
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

                    $.each(result.data, function (key, val) {
                        employee_dataSet1.push({ id: val['employee_id'], text: val['employee_code'] + ' ' + val['employee_name'] });

                    });

                    $('#employee_leader_asses1').select2({
                        width: '100%',
                        height: '40px',
                        data: employee_dataSet1,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                    $('#employee_leader_asses2').select2({
                        width: '100%',
                        height: '40px',
                        data: employee_dataSet1,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                    $('#employee_leader_asses2').select2({
                        width: '100%',
                        height: '40px',
                        data: employee_dataSet1,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                    $('#employee_leader_asses3').select2({
                        width: '100%',
                        height: '40px',
                        data: employee_dataSet1,
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

        });

    } else {

        window.location.assign('./login');

    }

});