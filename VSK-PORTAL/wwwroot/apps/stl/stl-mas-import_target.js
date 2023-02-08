'use strict';

let validator, oTable, table, options, item_action, item_id;

//let objProfile = JSON.parse(localStorage.getItem('objProfile'));
let objProfile = JSON.parse(localStorage.getItem('objAuth'));
console.log("objProfile", objProfile);

//let template_url = 'http://localhost:8081/template/';
let template_url = 'http://192.168.1.247/template/';

let connect_url = 'http://localhost:8081/vsk-portal-api';
//let connect_url = 'http://192.168.1.247/intranet/acc-api';

//let auth_get = connect_url + '/v1/itemmaster_lov_get';
//let stmas_get = connect_url + '/v1/importupdatedata_stmas_list_get';
//let ck_code = connect_url + '/v1/gcode_get';
//let ck_item = connect_url + '/v1/stmas_get';
//let gcode_url = connect_url + '/v1/gcode_get';
//let barcode_url = connect_url + '/v1/barcode_get';
//let uom_url = connect_url + '/v1/uom_get';
//let location_url = connect_url + '/v1/location_get';
//let printerzone_url = connect_url + '/v1/printerzone_get';
//let lovdata_url = connect_url + '/v1/itemmaster_lov_get';

let MasterData_ImportCustomerTarget_Update = connect_url + '/v1/ImportCustomerTarget_Update';
let MasterData_ImportCustomerTarget_CalcStatus = connect_url + '/v1/ImportCustomerTarget_CalcStatus';
let MasterData_ImportCustomerTarget_TemplateGet = connect_url + '/v1/ImportCustomerTarget_TemplateGet';
let MasterData_ImportCustomerTarget_Create = connect_url + '/v1/ImportCustomerTarget_Create';
let MasterData_ImportCustomerTargetTran_Create = connect_url + '/v1/ImportCustomerTarget_Tran_Create';

let temp_table = [];
let objTable = {};
let citem_stmas = [];
let citem_c1 = [];
let citem_c2 = [];
let citem_c3 = [];
let citem_c4 = [];
let citem_c5 = [];
let citem_barcode = [];
let citem_uom = [];
let citem_location = [];
let citem_printerzone = [];
let citem_carmodel = [];
let citem_carbrand = [];
let citem_cartype = [];
let username = "";
//let fname = "";
let authorize = "";
let temp_id = "";
let count_length = 0;

function objectPropInArray(list, prop, val) {
    if (list.length > 0) {
        for (i in list) {
            if (list[i][prop] === val) {
                return true;
            }
        }
    }
    return false;
}

let customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'

    },
    "text": 'Please Wait...'
});

$.init = function () {


    $.fntemptable = function (currentindex) {

        $('#tbl-list-temp tbody').empty();

        if (currentindex == 0) {

            $.each(result.data, function (key, val) {

                var recordstatus_txt = "";


                if (val['record_status'] == 0) {

                    // ERROR
                    recordstatus_txt = '<span style="color: red;font-weight: bold;text-align: center;">ERROR</span>';


                } else if (val['record_status'] == 1) {

                    //SUCCESS
                    recordstatus_txt = '<span style="color: green;font-weight: bold;text-align: center;">OK</span>';

                } else if (val['record_status'] == 2) {

                    // DUPLICATE
                    recordstatus_txt = '<span style="color: orange;font-weight: bold;text-align: center;">DUPLICATE</span>';

                }

                if (val['code'] == null) { var val_code = ''; } else { var val_code = val['code']; }
                if (val['lname'] == null) { var val_lname = ''; } else { var val_lname = val['lname']; }
                if (val['year'] == null) { var val_year = ''; } else { var val_year = val['year']; }
                if (val['M01'] == null) { var val_M01 = ''; } else { var val_M01 = val['M01']; }
                if (val['M02'] == null) { var val_M02 = ''; } else { var val_M02 = val['M02']; }
                if (val['M03'] == null) { var val_M03 = ''; } else { var val_M03 = val['M03']; }
                if (val['M04'] == null) { var val_M04 = ''; } else { var val_M04 = val['M04']; }
                if (val['M05'] == null) { var val_M05 = ''; } else { var val_M05 = val['M05']; }
                if (val['M06'] == null) { var val_M06 = ''; } else { var val_M06 = val['M06']; }
                if (val['M07'] == null) { var val_M07 = ''; } else { var val_M07 = val['M07']; }
                if (val['M08'] == null) { var val_M08 = ''; } else { var val_M08 = val['M08']; }
                if (val['M09'] == null) { var val_M09 = ''; } else { var val_M09 = val['M09']; }
                if (val['M10'] == null) { var val_M10 = ''; } else { var val_M10 = val['M10']; }
                if (val['M11'] == null) { var val_M11 = ''; } else { var val_M11 = val['M11']; }
                if (val['M12'] == null) { var val_M12 = ''; } else { var val_M12 = val['M12']; }


                $('#tbl-list-temp tbody').append('<tr>' +
                    '<td class="tx-center">' + val['item'] + '</td>' +
                    '<td class="tx-center">' + recordstatus_txt + '</td>' +
                    '<td>' + val['code'] + '</td>' +
                    '<td>' + val['lname'] + '</td>' +
                    '<td>' + val['year'] + '</td>' +
                    '<td>' + val['targetgroup'] + '</td>' +
                    '<td>' + numberWithCommas(val_M01) + '</td>' +
                    '<td>' + numberWithCommas(val_M02) + '</td>' +
                    '<td>' + numberWithCommas(val_M03) + '</td>' +
                    '<td>' + numberWithCommas(val_M04) + '</td>' +
                    '<td>' + numberWithCommas(val_M05) + '</td>' +
                    '<td>' + numberWithCommas(val_M06) + '</td>' +
                    '<td>' + numberWithCommas(val_M07) + '</td>' +
                    '<td>' + numberWithCommas(val_M08) + '</td>' +
                    '<td>' + numberWithCommas(val_M09) + '</td>' +
                    '<td>' + numberWithCommas(val_M10) + '</td>' +
                    '<td>' + numberWithCommas(val_M11) + '</td>' +
                    '<td>' + numberWithCommas(val_M12) + '</td>' +
                    '</tr>');

            });

        } else if (currentindex == 1) {

            $.each(temp_table, function (key, val) {

                var recordstatus_txt = "";

                if (val['record_status'] == 1) {

                    //SUCCESS
                    recordstatus_txt = '<span style="color: green;font-weight: bold;text-align: center;">OK</span>';


                    if (val['code'] == null) { var val_code = ''; } else { var val_code = val['code']; }
                    if (val['lname'] == null) { var val_lname = ''; } else { var val_lname = val['lname']; }
                    if (val['year'] == null) { var val_year = ''; } else { var val_year = val['year']; }
                    if (val['M01'] == null) { var val_M01 = ''; } else { var val_M01 = val['M01']; }
                    if (val['M02'] == null) { var val_M02 = ''; } else { var val_M02 = val['M02']; }
                    if (val['M03'] == null) { var val_M03 = ''; } else { var val_M03 = val['M03']; }
                    if (val['M04'] == null) { var val_M04 = ''; } else { var val_M04 = val['M04']; }
                    if (val['M05'] == null) { var val_M05 = ''; } else { var val_M05 = val['M05']; }
                    if (val['M06'] == null) { var val_M06 = ''; } else { var val_M06 = val['M06']; }
                    if (val['M07'] == null) { var val_M07 = ''; } else { var val_M07 = val['M07']; }
                    if (val['M08'] == null) { var val_M08 = ''; } else { var val_M08 = val['M08']; }
                    if (val['M09'] == null) { var val_M09 = ''; } else { var val_M09 = val['M09']; }
                    if (val['M10'] == null) { var val_M10 = ''; } else { var val_M10 = val['M10']; }
                    if (val['M11'] == null) { var val_M11 = ''; } else { var val_M11 = val['M11']; }
                    if (val['M12'] == null) { var val_M12 = ''; } else { var val_M12 = val['M12']; }


                    $('#tbl-list-temp tbody').append('<tr>' +
                        '<td class="tx-center">' + val['item'] + '</td>' +
                        '<td class="tx-center">' + recordstatus_txt + '</td>' +
                        '<td>' + val['code'] + '</td>' +
                        '<td>' + val['lname'] + '</td>' +
                        '<td>' + val['year'] + '</td>' +
                        '<td>' + val['targetgroup'] + '</td>' +
                        '<td>' + numberWithCommas(val_M01) + '</td>' +
                        '<td>' + numberWithCommas(val_M02) + '</td>' +
                        '<td>' + numberWithCommas(val_M03) + '</td>' +
                        '<td>' + numberWithCommas(val_M04) + '</td>' +
                        '<td>' + numberWithCommas(val_M05) + '</td>' +
                        '<td>' + numberWithCommas(val_M06) + '</td>' +
                        '<td>' + numberWithCommas(val_M07) + '</td>' +
                        '<td>' + numberWithCommas(val_M08) + '</td>' +
                        '<td>' + numberWithCommas(val_M09) + '</td>' +
                        '<td>' + numberWithCommas(val_M10) + '</td>' +
                        '<td>' + numberWithCommas(val_M11) + '</td>' +
                        '<td>' + numberWithCommas(val_M12) + '</td>' +
                        '</tr>');

                }

            });
            
        }
    };


    $.fnupdatedata = function (template_id) {

        $.LoadingOverlay("show", {
            image: '',
            custom: customElement
        });

        fetch(MasterData_ImportCustomerTarget_Update + '?temp_id=' + template_id + '&updated_by=' + username + '&updated_by2=' + fname).then(function (response) {
            return response.json();
        }).then(function (result) {

            toastr.success('Updated data successfully');
            $.LoadingOverlay("hide");

        }).catch(error => {
            $.LoadingOverlay("hide");
            toastr.error('Error, Please contact administrator.');
        });

    };


    $('#wizard1').steps({
        headerTag: 'h3',
        bodyTag: 'section',
        autoFocus: true,
        titleTemplate: '<span class="number">#index#<\/span> <span class="title">#title#<\/span>',
        onStepChanged: function () {

            var chk_index = $('#wizard1').steps('getCurrentIndex');
            //console.log("onStepChanged:currentIndex", chk_index);

            if (chk_index == 0 || chk_index == 1) { $.fntemptable(chk_index); }
            if (chk_index == 2) { $.fnupdatedata(temp_id); }

        },
        onFinishing: function () {
            setTimeout(function () {
                location.reload();
            }, 1000);
        }
    });


    $('#wizards').find('#btn_downloadtemplate').on('click', function (evt) {
        location.href = template_url + 'ImportCustomerTarget.xlsx';
        //location.href = template_url + 'Import_Customer_Target.xlsx';
    });

    const username = objProfile[0]['username'];
    const fname = objProfile[0]['firstname'];
    console.log("username", username);
    console.log("fname", fname);

    temp_id = $.uuid();
    console.log("temp_id", temp_id);


    $('#customFile').on('change', function (evt) {

        evt.preventDefault();

        if ($(this).val() !== '') {

            let i = 0;

            readXlsxFile(this.files[0], { dateFormat: 'YYYY/MM/DD_hh:mm:ss' }).then(async function (result) {

                console.log("readXlsxFile", result);

                if (result.length > 2) {

                    $.LoadingOverlay("show", {
                        image: '',
                        custom: customElement
                    });

                    count_length = result.length - 2;

                    let add_data = {
                        'temp_id': temp_id,
                        'countitem_all': count_length,
                        'created_by': username,
                        'created_by2': fname,
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(MasterData_ImportCustomerTarget_Create, {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {

                        let count_row = 0;

                        var citem_customertarget_tran_create = [];

                        $.each(result, function (key, val) {

                            if (i > 1) {

                                ++count_row;
                                //console.log("code: ", val[0]);

                                citem_customertarget_tran_create.push({
                                    'temp_id': temp_id,
                                    'item': count_row,
                                    'code': val[0],
                                    'year': val[1],
                                    'targetgroup': val[2],
                                    'M01': val[3],
                                    'M02': val[4],
                                    'M03': val[5],
                                    'M04': val[6],
                                    'M05': val[7],
                                    'M06': val[8],
                                    'M07': val[9],
                                    'M08': val[10],
                                    'M09': val[11],
                                    'M10': val[12],
                                    'M11': val[13],
                                    'M12': val[14],
                                    'created_by': username,
                                    'created_by2': fname,
                                });

                            }

                            i++

                        });


                        //console.log("citem_customertarget_tran_create", citem_customertarget_tran_create);


                        $.ajax({
                            url: MasterData_ImportCustomerTargetTran_Create,
                            type: 'POST',
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: JSON.stringify(citem_customertarget_tran_create),
                            success: function (data) {

                                //console.log("MasterData_ImportCustomerTargetTran_Create", data);

                                fetch(MasterData_ImportCustomerTarget_TemplateGet + '?temp_id=' + temp_id + '&created_by=' + username + '&created_by2=' + fname).then(function (response) {
                                    return response.json();
                                }).then(function (result) {

                                    //console.log("MasterData_ImportCustomerTarget_TemplateGet", result.data);
                                    temp_table = result.data;
                                    console.log("MasterData_ImportCustomerTarget_TemplateGet", result.data);

                                    $.each(result.data, function (key, val) {

                                        var recordstatus_txt = "";


                                        if (val['record_status'] == 0) {

                                            // ERROR
                                            recordstatus_txt = '<span style="color: red;font-weight: bold;text-align: center;">ERROR</span>';


                                        } else if (val['record_status'] == 1) {

                                            //SUCCESS
                                            recordstatus_txt = '<span style="color: green;font-weight: bold;text-align: center;">OK</span>';

                                        } else if (val['record_status'] == 2) {

                                            // DUPLICATE
                                            recordstatus_txt = '<span style="color: orange;font-weight: bold;text-align: center;">DUPLICATE</span>';

                                        }

                                        if (val['code'] == null) { var val_code = ''; } else { var val_code = val['code']; }
                                        if (val['lname'] == null) { var val_lname = ''; } else { var val_lname = val['lname']; }
                                        if (val['year'] == null) { var val_year = ''; } else { var val_year = val['year']; }
                                        if (val['M01'] == null) { var val_M01 = ''; } else { var val_M01 = val['M01']; }
                                        if (val['M02'] == null) { var val_M02 = ''; } else { var val_M02 = val['M02']; }
                                        if (val['M03'] == null) { var val_M03 = ''; } else { var val_M03 = val['M03']; }
                                        if (val['M04'] == null) { var val_M04 = ''; } else { var val_M04 = val['M04']; }
                                        if (val['M05'] == null) { var val_M05 = ''; } else { var val_M05 = val['M05']; }
                                        if (val['M06'] == null) { var val_M06 = ''; } else { var val_M06 = val['M06']; }
                                        if (val['M07'] == null) { var val_M07 = ''; } else { var val_M07 = val['M07']; }
                                        if (val['M08'] == null) { var val_M08 = ''; } else { var val_M08 = val['M08']; }
                                        if (val['M09'] == null) { var val_M09 = ''; } else { var val_M09 = val['M09']; }
                                        if (val['M10'] == null) { var val_M10 = ''; } else { var val_M10 = val['M10']; }
                                        if (val['M11'] == null) { var val_M11 = ''; } else { var val_M11 = val['M11']; }
                                        if (val['M12'] == null) { var val_M12 = ''; } else { var val_M12 = val['M12']; }


                                        $('#tbl-list-temp tbody').append('<tr>' +
                                            '<td class="tx-center">' + val['item'] + '</td>' +
                                            '<td class="tx-center">' + recordstatus_txt + '</td>' +
                                            '<td>' + val['code'] + '</td>' +
                                            '<td>' + val['lname'] + '</td>' +
                                            '<td>' + val['year'] + '</td>' +
                                            '<td>' + val['targetgroup'] + '</td>' +
                                            '<td>' + numberWithCommas(val_M01) + '</td>' +
                                            '<td>' + numberWithCommas(val_M02) + '</td>' +
                                            '<td>' + numberWithCommas(val_M03) + '</td>' +
                                            '<td>' + numberWithCommas(val_M04) + '</td>' +
                                            '<td>' + numberWithCommas(val_M05) + '</td>' +
                                            '<td>' + numberWithCommas(val_M06) + '</td>' +
                                            '<td>' + numberWithCommas(val_M07) + '</td>' +
                                            '<td>' + numberWithCommas(val_M08) + '</td>' +
                                            '<td>' + numberWithCommas(val_M09) + '</td>' +
                                            '<td>' + numberWithCommas(val_M10) + '</td>' +
                                            '<td>' + numberWithCommas(val_M11) + '</td>' +
                                            '<td>' + numberWithCommas(val_M12) + '</td>' +
                                            '</tr>');

                                    });

                                    $('#tbl-list-temp').DataTable({
                                        paging: false,
                                        dom: 'Brti',
                                        buttons: [
                                            'copyHtml5',
                                            {
                                                extend: 'excelHtml5',
                                                title: '',
                                                filename: 'Export_UpdateDataTemplate_' + authorize,
                                                exportOptions: {
                                                    columns: [0, 1, 2, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16]
                                                }
                                            },
                                        ],
                                    });


                                    fetch(MasterData_ImportCustomerTarget_CalcStatus + '?temp_id=' + temp_id + '&updated_by=' + username + '&updated_by2=' + fname).then(function (response) {

                                        return response.json();

                                    }).then(function (result) {

                                        console.log("MasterData_ImportCustomerTarget_CalcStatus", result);

                                        $.each(result.data, function (key, val) {

                                            $("#wizards").find("#countitem_all").html(val['countitem_all']);
                                            $("#wizards").find("#countitem_incomplete").html(val['countitem_incomplete']);
                                            $("#wizards").find("#countitem_complete").html(val['countitem_complete']);
                                            $("#wizards").find("#countitem_problem").html(val['countitem_incomplete']);

                                            console.log("success");
                                            $.LoadingOverlay("hide");

                                        });

                                    });

                                });

                            }
                        });

                    }).catch(error => {
                        $.LoadingOverlay("hide");
                        toastr.error('Error writing document');
                    });

                    $('#wizards').find('#customFile').prop("disabled", true);

                } else {
                    toastr.error('Data not found. Please make sure your data start at row 3');
                }

            }).catch(error => {
                $.LoadingOverlay("hide");
                toastr.error('Error writing document');
                //console.error("Error writing document: ", error);
            });

        }

        $.LoadingOverlay("hide");
        console.log('objTable', objTable)

    });

    //$('#customFile').on('click', function (evt) {

    //    evt.preventDefault();



    //});
};


$(document).ready(async function () {

    await $.init();

});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        console.log(user);

    } else {

        window.location.assign('./login');

    }

});