'use strict';

//const api_url = 'http://localhost:49705';
const api_url = 'http://192.168.1.247:8082/mrp-api';
const url_mrp_itemimport_verified = api_url + '/v1/MRP_ItemImport_Verified';
const url_mrp_itemimport_chkduplicate = api_url + '/v1/MRP_ItemImport_ChkDuplicate';
const url_mrp_itemimport_chkadjust = api_url + '/v1/MRP_ItemImport_ChkAdjust';
const url_mrp_itemimport_chkdelete = api_url + '/v1/MRP_ItemImport_ChkDelete';
const url_mrp_itemmaster_import = api_url + '/v1/MRP_ItemMaster_Import';
const url_filedownload = "http://192.168.1.247:8082/uploads";


let name, validator, oTable, table, options, item_action, item_id, rowCount = 0, countitem_incomplete = 0, countitem_complete = 0, countitem_problem = 0;
let citem_import = [];

let objProfile = JSON.parse(localStorage.getItem('objProfile'));
console.log("objProfile", objProfile);


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

    $(document).on('click', '#btn-item_template', function () {

        location.href = url_filedownload + '/import_mrp_itemsetup_rev2.xlsx';

    });

    $(document).on('change', '#customFile', function (evt) {

        evt.preventDefault();

        console.log(this.files[0])

        if ($(this).val() !== '') {

            citem_import = [];

            let filename = this.files[0];

            readXlsxFile(this.files[0], { dateFormat: 'YYYY/MM/DD_hh:mm:ss' }).then(async function (result) {

                console.log('readXlsxFile', result);

                if (result.length > 2) {

                    $.LoadingOverlay("show", {
                        image: '',
                        custom: customElement
                    });

                    let i = 0;
                    let countitem_incomplete = 0;

                    await $.each(result, async function (key, val) {

                        if (i >= 2) {

                            let url = new URL(url_mrp_itemimport_verified);

                            url.search = new URLSearchParams({
                                code: val[1],
                                destination_site_code: val[0]
                            });

                            fetch(url).then(async function (response) {
                                return response.json();
                            }).then(async function (result_stmas) {

                                let time = 300;
                                setTimeout(function () {

                                    $.each(result_stmas.data, async function (key, val_stmas) {
                                        console.log(val[6].toLowerCase(), val[1])


                                        if (val[6].toLowerCase() === 'add') {

                                            let url = new URL(url_mrp_itemimport_chkduplicate);

                                            url.search = new URLSearchParams({
                                                code: val[1],
                                                destination_site_code: val[0]
                                            });

                                            fetch(url).then(async function (response) {
                                                return response.json();
                                            }).then(async function (result_chkduplicate) {

                                                rowCount = $("#tbl-list-temp-tbody td").closest("tr").length + 1;

                                                if (result_chkduplicate.length == 0) {

                                                    countitem_complete += 1;
                                                    $('#countitem_complete').html(countitem_complete)

                                                    await $('#tbl-list-temp-tbody').append('<tr id="list-' + val_stmas['code'] + '"><td style="width:90px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-success">Pass</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');
                                                    citem_import.push({
                                                        "item_importfilename": filename,
                                                        "destination_site_code": val[0],
                                                        "item_code": val_stmas['code'],
                                                        "item_remark": (val[2] === null ? '' : val[2]),
                                                        "item_max": (val[3] === null ? '' : val[3]),
                                                        "item_min": (val[4] === null ? '' : val[4]),
                                                        "item_replenish_status": (val[5] === null ? '' : val[5]),
                                                        "item_action": val[6],
                                                        "created_by": name
                                                    });

                                                } else {

                                                    countitem_problem += 1;
                                                    $('#countitem_problem').html(countitem_problem);

                                                    await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-danger">Dupplicate</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');

                                                }

                                            })

                                        } else if (val[6].toLowerCase() === 'adjust') {

                                            let url = new URL(url_mrp_itemimport_chkadjust);

                                            url.search = new URLSearchParams({
                                                code: val[1],
                                                destination_site_code: val[0]
                                            });

                                            fetch(url).then(async function (response) {
                                                return response.json();
                                            }).then(async function (result_chkadjust) {

                                                rowCount = $("#tbl-list-temp-tbody td").closest("tr").length + 1;

                                                if (result_chkadjust.length > 0) {

                                                    countitem_complete += 1;
                                                    $('#countitem_complete').html(countitem_complete)



                                                    await $('#tbl-list-temp-tbody').append('<tr id="list-' + val_stmas['code'] + '"><td style="width:70px;text-align:center;">' + rowCount + '</td><td style="width:90px;text-align:center;"><span class="badge badge-success">Pass</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');
                                                    citem_import.push({
                                                        "item_importfilename": filename,
                                                        "destination_site_code": val[0],
                                                        "item_code": val_stmas['code'],
                                                        "item_remark": (val[2] === null ? '' : val[2]),
                                                        "item_max": (val[3] === null ? '' : val[3]),
                                                        "item_min": (val[4] === null ? '' : val[4]),
                                                        "item_replenish_status": (val[5] === null ? '' : val[5]),
                                                        "item_action": val[6],
                                                        "created_by": name
                                                    });

                                                } else {

                                                    countitem_problem += 1;
                                                    $('#countitem_problem').html(countitem_problem);


                                                    await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-danger">No Item</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');

                                                    // await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td style="width:90px;text-align:center;"><span class="badge badge-danger">No Item</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[1] === null ? '' : val[1]) + '</td><td style="width:100px;text-align:center;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[4] + '</td></tr>');


                                                }

                                            })

                                        } else if (val[6].toLowerCase() === 'delete') {

                                            console.log('Delete', val[6].toLowerCase(), val[1])

                                            let url = new URL(url_mrp_itemimport_chkdelete);

                                            url.search = new URLSearchParams({
                                                code: val[1],
                                                destination_site_code: val[0]
                                            });

                                            fetch(url).then(async function (response) {
                                                return response.json();
                                            }).then(async function (result_chkdelete) {

                                                rowCount = $("#tbl-list-temp-tbody td").closest("tr").length + 1;

                                                if (result_chkdelete.length > 0) {

                                                    countitem_complete += 1;
                                                    $('#countitem_complete').html(countitem_complete)

                                                    await $('#tbl-list-temp-tbody').append('<tr id="list-' + val_stmas['code'] + '"><td style="width:90px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-success">Pass</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');

                                                    // await $('#tbl-list-temp-tbody').append('<tr id="list-' + val_stmas['code'] + '"><td style="width:70px;text-align:center;">' + rowCount + '</td><td style="width:90px;text-align:center;"><span class="badge badge-success">Pass</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[1] === null ? '' : val[1]) + '</td><td style="width:100px;text-align:center;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[4] + '</td></tr>');
                                                    citem_import.push({
                                                        "item_importfilename": filename,
                                                        "destination_site_code": val[0],
                                                        "item_code": val_stmas['code'],
                                                        "item_remark": (val[2] === null ? '' : val[2]),
                                                        "item_max": (val[3] === null ? '' : val[3]),
                                                        "item_min": (val[4] === null ? '' : val[4]),
                                                        "item_replenish_status": (val[5] === null ? '' : val[5]),
                                                        "item_action": val[6],
                                                        "created_by": name
                                                    });

                                                } else {

                                                    countitem_problem += 1;
                                                    $('#countitem_problem').html(countitem_problem);

                                                    await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-danger">No Item</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');

                                                    //await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td style="width:90px;text-align:center;"><span class="badge badge-danger">No Item</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[1] === null ? '' : val[1]) + '</td><td style="width:100px;text-align:center;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[4] + '</td></tr>');

                                                }

                                            })

                                        } else {

                                            countitem_incomplete += 1;
                                            $('#countitem_incomplete').html(countitem_incomplete)

                                            await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td align="center"><span class="badge badge-danger">No Item</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[6] + '</td></tr>');

                                            //await $('#tbl-list-temp-tbody').append('<tr><td style="width:70px;text-align:center;">' + rowCount + '</td><td style="width:90px;text-align:center;"><span class="badge badge-danger">Error</span></td><td style="width:190px;text-align:center;">' + val_stmas['code'] + '</td><td style="width:390px;text-align:left;">' + val_stmas['itemname'] + '</td><td style="width:210px;text-align:left;">' + (val[2] === null ? '' : val[2]) + '</td><td style="width:100px;text-align:center;">' + (val[3] === null ? '' : val[3]) + '</td><td style="width:100px;text-align:center;">' + (val[4] === null ? '' : val[4]) + '</td><td class="tx-uppercase" style="width:110px;text-align:center;">' + val[5] + '</td></tr>');

                                        }

                                    });

                                }, time);

                                time += 300;

                            })

                        }

                        i++;


                    });

                    await $('#countitem_all').html(i - 2);

                    $.LoadingOverlay("hide");

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
        console.log('citem_import', citem_import);

    });

    $('#btn-item_import').off('click').on('click', function (evt) {

        evt.preventDefault();

        if ($('#countitem_complete').html() === $('#countitem_all').html() && $('#countitem_complete').html() > 0) {

            console.log('citem_import', 'YES', citem_import);

            $.LoadingOverlay("show", {
                image: '',
                custom: customElement
            });

            let time = 300;
            let i = 0;

            $.each(citem_import, function (key, val) {

                setTimeout(function () {

                    console.log(citem_import);

                    let data_citem = {
                        "item_importfilename": val['filename'],
                        "destination_site_code": val['destination_site_code'],
                        "item_code": val['item_code'],
                        "item_remark": val['item_remark'],
                        "item_max": val['item_max'],
                        "item_min": val['item_min'],
                        "item_replenish_status": val['item_replenish_status'],
                        "item_action": val['item_action'].toLowerCase(),
                        "created_by": name
                    };

                    if (val['item_action'].toLowerCase() === 'add' || val['item_action'].toLowerCase() === 'adjust' || val['item_action'].toLowerCase() === 'delete') {

                        var params = [];
                        for (const i in data_citem) {
                            params.push(i + "=" + encodeURIComponent(data_citem[i]));
                        }

                        console.log('OK', 'data_citem', data_citem['item_code'], data_citem);

                        fetch(url_mrp_itemmaster_import, {
                            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                            credentials: 'same-origin', // include, *same-origin, omit
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: params.join("&"),
                        }).then(data => {
                            console.log('OK')
                            resStatus = data.status
                            return data.json();
                        }).then(function (data) {


                        })

                        $('#list-' + data_citem['item_code']).css("background-color", "#66FF99");

                    } else {

                        console.log('ERROR', 'data_citem', data_citem['item_code'], data_citem);

                    }

                    i++

                    if (i === citem_import.length) {

                        toastr.options = {
                            "closeButton": false, // true/false
                            "debug": false, // true/false
                            "newestOnTop": false, // true/false
                            "progressBar": true, // true/false
                            "preventDuplicates": false,
                            "onclick": null,
                            "showDuration": "200", // in milliseconds
                            "hideDuration": "1000", // in milliseconds
                            "timeOut": "2000", // in milliseconds
                            "extendedTimeOut": "900", // in milliseconds
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        };

                        toastr.success('Import Data Successfully!', function () {
                            setTimeout(function () {
                                location.reload();
                            }, 2100)
                        });

                    }

                }, time);

                time += 300;

            });

        } else {

            toastr.options = {
                "closeButton": false, // true/false
                "debug": false, // true/false
                "newestOnTop": false, // true/false
                "progressBar": true, // true/false
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "200", // in milliseconds
                "hideDuration": "1000", // in milliseconds
                "timeOut": "2000", // in milliseconds
                "extendedTimeOut": "900", // in milliseconds
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };


            console.log('citem_import', 'NO', citem_import);

            toastr.error('มีข้อมูลไม่ถูกต้องกรุณาตรวจสอบ!!.', function () {
                setTimeout(function () {
                    location.reload();
                }, 2100)
            });
        }

    });
};


$(document).ready(async function () {

    await $.init();

});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        console.log(user);
        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");

    } else {

        window.location.assign('./login');

    }

});