'use strict';

let fs = firebase.firestore();
let collection = 'log_events';
let objProfile = JSON.parse(localStorage.getItem('objProfile'));
let oTable;
let apps_name_dataSet = []
let fname = "";
let username = "";
let role_code = ""; let url_location = "";
url_location = window.location.href;

let export_url = 'http://localhost:8081/vsk-portal-api/export/Log_Import_UpdateData_Export';
let connect_url = 'http://localhost:8081/vsk-portal-api';
//let connect_url = 'http://192.168.1.247/intranet/acc-api';

let log_importupdatalist = connect_url + '/v1/log_import_updatedata_list_get';

$.init = function () {

    $.each(objProfile.auth_user_profile, function (key, val) {
        fname = val['user_fname'];
        var email = val['user_email'];
        email = email.split("@");
        username = email[0];
        //console.log("prodpurplan_updatedby", prodpurplan_updatedby);
    });

    $.each(objProfile.auth_role, function (key, val) {
        role_code = val['role_code'];
        //console.log("role_code", role_code);
    });

    $.addLogEvent('', 'VSM', 'visit', url_location, 'ok');

    $('.input-cash').autoNumeric('init', {
        vMin: '-99999999'
    });

    $.List();

    //window.location.href = 'http://192.168.1.247/vsk-trp/vsk-api-tms/TRPExportFile/TRP_ExportFile_EXCEL?job_pod_check_in=' + $('#frm_data').find('#job_no').val() + '&job_date=' + $.DateToDB($('#frm_data').find('#job_date').val()) + '&route_no=' + $('#frm_data').find('#route_no').val();

    $('#btn-item_create').click(function (e) {

        e.preventDefault();

        $.Create();

    });

    $('#modal-frm_data').on('hidden.bs.modal', function () {

        $('#application_code').val('');
        $('#application_name').val('');

        $("#frm_data").parsley().reset();

    });

    fs.collection('auth_application').get().then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
            apps_name_dataSet.push({ id: doc.data().application_id, text: doc.data().application_name });
        })

    });

};

$.List = async function () {

    let url = new URL(log_importupdatalist);

    url.search = new URLSearchParams({
        username: username,
    });

    fetch(url).then(function (response) {
        return response.json();
        //alert("1");
    }).then(function (result) {

        //alert("2");
        //if (mode === 'search') { $('#tbl-list').show(); } else { $('#tbl-list').hide(); }

        //if (mode === 'search' && result.length === 0) {
        //    toastr.error('ไม่พบข้อมูลค้นหา !');
        //    $("#global-loader").fadeOut("slow");
        //    $.addLogError('', 'VSM', 'search', url_location, 'error');
        //} else if (mode === 'search' && result.length > 0) {
        //    $.addLogEvent('', 'VSM', 'search', url_location, 'ok');
        //}

        console.log("oTable", result.data);

        //oTable.destroy();
        oTable = $('#tbl-list').DataTable({
            data: result.data,
            scrollY: "394px",
            scrollX: true,
            scrollCollapse: true,
            autoWidth: true,
            paging: true,
            //dom: 'Bfrtip',
            colReorder: true,
            stateSave: true,
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 rows', '25 rows', '50 rows', 'Show all']
            ],
            rows: {
                callback: function (row, data, index) {
                },
                afterTemplate: function () {

                    $('.btn-export-item').off('click').on('click', function (evt) {

                        evt.preventDefault();

                        $(this).on('click', function (evt) {
                            evt.preventDefault();
                        });

                        item_action = $(this).attr('data-action');
                        item_id = $(this).attr('data-id');

                        alert("export " + item_id);

                        $('#kt-modal-form').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });

                        return false;

                    });

                    //$('.btn-update-item').off('click').on('click', function (evt) {

                    //    evt.preventDefault();

                    //    $(this).on('click', function (evt) {
                    //        evt.preventDefault();
                    //    });

                    //    item_action = $(this).attr('data-action');
                    //    item_id = $(this).attr('data-id');

                    //    $('#kt-modal-form').modal({
                    //        keyboard: false,
                    //        backdrop: 'static'
                    //    });

                    //    return false;

                    //});

                    //$('.btn-delete-item').off('click').on('click', function (evt) {

                    //    evt.preventDefault();

                    //    $(this).on('click', function (evt) {
                    //        evt.preventDefault();
                    //    });

                    //    item_action = $(this).attr('data-action');
                    //    item_id = $(this).attr('data-id');

                    //    $('#kt-modal-form').modal({
                    //        keyboard: false,
                    //        backdrop: 'static'
                    //    });

                    //    return false;

                    //});

                },
                autoHide: false
            },
            //buttons: [
            //    'pageLength', 'copy', 'excel', 'colvis'
            //    , {
            //        extend: 'excel',
            //        text: 'Save in EXCEL',
            //        filename: 'td900',
            //        customize: function (xlsx) {
            //            var sheet = xlsx.xl.worksheets['sheet1.xml'];
            //            // $('c[r=A1] t', sheet).text( 'Custom text' );

            //            // Loop over the cells in column `F`
            //            $('row c[r^="G"] ', sheet).each(function () {
            //                // Get the value and strip the non numeric characters

            //                if ($(this).text() !== "needed Adjustment") {
            //                    $(this).attr('s', '20');
            //                }

            //            });
            //        }


            //    }
            //],
            //fixedColumns: {
            //    //leftColumns: 2,
            //    //rightColumns: 2
            //},
            columns: [
                {
                    title: "<center>วันที่อัปโหลด</center>",
                    data: "created_date",
                    width: "130px",
                    render: function (data, type, row, meta) {
                        var created_date = row.created_date;
                        created_date = moment(created_date, "YYYY-MM-DD").format('DD/MM/YYYY')
                        return created_date;
                    }
                },
                {
                    title: "<center>อัปโหลดทั้งหมด</center>",
                    data: "countitem_all",
                    width: "130px",

                },
                {
                    title: "<center>อัปโหลดสำเร็จ</center>",
                    data: "countitem_complete",
                    width: "120px",

                },
                {
                    title: "<center>อัปโหลดไม่สำเร็จ</center>",
                    data: "countitem_incomplete",
                    width: "120px",

                },
                {
                    title: "<center>อัปเดตสำเร็จ</center>",
                    data: "countitem_updated",
                    width: "120px",
                    render: function (data, type, row, meta) {
                        return '<span style="text-align: right;">' + row.countitem_updated + '</span>';
                    }

                },
                {
                    title: "<center>ผู้อัปเดต</center>",
                    data: "updated_by2",
                    width: "130px",

                },
                {
                    title: "<center>วันที่อัปเดต</center>",
                    data: "updated_date",
                    width: "130px",
                    render: function (data, type, row, meta) {
                        var updated_date = row.updated_date;
                        updated_date = moment(updated_date, "YYYY-MM-DD").format('DD/MM/YYYY')
                        return updated_date;
                    }

                },
                {
                    title: "",
                    data: "",
                    width: "45px",
                    render: function (data, type, row, meta) {

                        return '<a href="' + export_url +'?temp_id=' + row.temp_id + '">Export</a>';
                        //return '<button  title="View" data-action="read" class="btn btn-outline-hover-success btn-sm btn-icon btn-read-item" data-id="' + row.temp_id + '"><i class="la la-print"></i></button >'
                        //return '<button  title="export" data-action="export" class="btn btn-outline-hover-success btn-sm btn-icon btn-export-item" data-id="' + row.temp_id + '"><i class="la la-print"></i></button >'

                    }

                }
            ],
            "order": [[0, "desc"]],
            "initComplete": function (settings, json) {

                $("#global-loader").fadeOut("slow");
                //mode = '';

                $.contextMenu({
                    selector: '#tbl-list tbody tr',
                    callback: function (key, options) {

                        let citem = oTable.row(this).data();

                        $('#modal-frm_data').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });

                        if (key === 'view') {

                            $.LoadingOverlay("show", {
                                image: '',
                                custom: customElement
                            });

                            $.Details(citem);
                            $.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                            setTimeout(function () {
                                $.LoadingOverlay("hide");
                            }, 100);

                        } else if (key === 'edit') {

                            $.LoadingOverlay("show", {
                                image: '',
                                custom: customElement
                            });

                            $.Details(citem);
                            $.Edit(citem);
                            $.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                            setTimeout(function () {
                                $.LoadingOverlay("hide");
                            }, 100);

                            //$('#salesinfo').find('#prodpurplan_countofinvoiceorderlines_vsm').hide();

                        } else if (key === 'delete') {

                            $.Details(citem);
                            $.Delete(citem);

                        }
                        else if (key === 'create') {

                            $.Create();

                        } else {

                            alert('ERROR');

                        }

                    },
                    items: {
                        "view": { name: "View", icon: "fas fa-search" },
                        "edit": { name: "Edit", icon: "edit" },

                        // "delete": { name: "Delete", icon: "delete" },
                        // "sep1": "---------",
                        // "create": { name: "New Item", icon: "add" }
                    }

                });
            },
        });

        $('#modal-frm_search').modal('hide');

        setTimeout(function () {
            $.LoadingOverlay("hide");
        }, 100);
        //}, 900);

    });

    //console.log('Index function Start', new Date());

    //let dataSet = [];
    //let query_event = await fs.collection(collection);
    //let query_error = await fs.collection('log_error');

    //await query_error.get().then(function (querySnapshot) {

    //    querySnapshot.forEach(function (doc) {

    //        dataSet.push([
    //            doc.data().event_id,
    //            doc.data().event_date,
    //            doc.data().event_ref,
    //            doc.data().application_id,
    //            doc.data().domain_id,
    //            doc.data().screen_name,
    //            doc.data().event_name,
    //            doc.data().event_status,
    //            doc.data().user_name
    //        ]);

    //    });

    //});

    //await query_event.get().then(function (querySnapshot) {

    //    querySnapshot.forEach(function (doc) {

    //        dataSet.push([
    //            doc.data().event_id,
    //            doc.data().event_date,
    //            doc.data().event_ref,
    //            doc.data().application_id,
    //            doc.data().domain_id,
    //            doc.data().screen_name,
    //            doc.data().event_name,
    //            doc.data().event_status,
    //            doc.data().user_name
    //        ]);

    //    });

    //    console.log(dataSet)

    //    oTable = $('#tbl-list').DataTable({
    //        data: dataSet,
    //        columns: [
    //            { title: "Events ID" },
    //            {
    //                title: "Event Date",
    //                render: function (data, type, row) {

    //                    return moment(new Date(data.seconds * 1000)).format('YYYY-MM-DD HH:mm')

    //                }
    //            },
    //            { title: "Events Ref" },
    //            { title: "Application Code" },
    //            { title: "Domain" },
                
    //            { title: "Screen Name" },
    //            { title: "Event Name" },
    //            { title: "Event Status" },
    //            {
    //                title: "Username",
    //                render: function (data, type, row) {

    //                    return data.replace("@vskautoparts.com", "");

    //                }
    //            },
               
    //        ],
            
    //        columnDefs: [
    //            {
    //                "targets": [0],
    //                "visible": false,
    //                "searchable": false
    //            },
    //            /*
    //            {
    //                "targets": [4],
    //                "visible": false,
    //                "searchable": false
    //            },
    //            {
    //                "targets": [5],
    //                "visible": false,
    //                "searchable": false
    //            },
    //            {
    //                "targets": [6],
    //                "visible": false,
    //                "searchable": false
    //            },
    //            {
    //                "targets": [7],
    //                "visible": false,
    //                "searchable": false
    //            }
    //            */
    //        ],
             
    //        "order": [[1, "desc"]],
            
    //        "rowCallback": function (row, data) {

    //            let job_comment_obj = apps_name_dataSet.find(obj => obj.id === data[3]);

    //            $('td:eq(2)', row).html(job_comment_obj.text);

    //        },
    //        "initComplete": function (settings, json) {
    //            /*
    //            $.contextMenu({
    //                selector: '#tbl-list tbody tr',
    //                callback: function (key, options) {

    //                    let data = oTable.row(this).data();
    //                    let citem = {
    //                        application_id: data[3],
    //                        application_code: data[0],
    //                        application_name: data[1],
    //                        record_status: data[2],
    //                    };

    //                    $('#modal-frm_data').modal({

    //                        keyboard: false,
    //                        backdrop: 'static'

    //                    });

    //                    if (key === 'view') {

    //                        $.Details(citem);

    //                    } else if (key === 'edit') {

    //                        $.Details(citem);
    //                        $.Edit(citem);

    //                    } else if (key === 'delete') {

    //                        $.Details(citem);
    //                        $.Delete(citem);

    //                    }
    //                    else if (key === 'create') {

    //                        $.Create();

    //                    } else {

    //                        alert('ERROR');

    //                    }

    //                },
    //                items: {
    //                    "view": { name: "View", icon: "fas fa-search" },
    //                    "edit": { name: "Edit", icon: "edit" },

    //                    "delete": { name: "Delete", icon: "delete" },
    //                    "sep1": "---------",
    //                    "create": { name: "New Item", icon: "add" }
    //                }

    //            });
    //            */
    //        },
    //        "drawCallback": function (settings) {

    //        }
    //    });

    //});

};

$.Create = async function () {

    $('.btn-save_form').show();
    $('.btn-save_form').prop('disabled', false);
    $('#btn-save_exit').html('Save');
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#frm_data input').val('').prop('disabled', false);
    $('#frm_data input').eq(0).focus();
    $('.record_status').eq(1).prop('checked', true);


    $('.btn-save_form').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let uuid = $.uuid();

            let application_citem = {
                application_id: uuid,
                application_code: $('#application_code').val(),
                application_name: $('#application_name').val(),
                record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 'Y' : 'N',
                created_by: "SYSTEM",
                created_date: new Date(),
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(uuid).set(application_citem).then(function () {

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

                        oTable.destroy();
                        $.List();

                        $("#frm_data").parsley().reset();

                        if (submit_action === "save_exit") {

                            $('.btn-save_form').prop('disabled', false);
                            $('#modal-frm_data').modal('hide');

                        } else if (submit_action === "save_new") {

                            $('#application_code').val('');
                            $('#application_name').val('');

                            $('#frm_data input').val('').prop('disabled', false);
                            $('#frm_data input').eq(0).focus();
                            $('.record_status').eq(1).prop('checked', true);

                            $('.btn-save_form').prop('disabled', false);

                        } else {

                            toastr.error('Error writing document');

                        }

                    }, 1000);

                    //$.addLogEvent(collection);

                });

            }).catch(function (error) {

                toastr.error(error, 'Error writing document');
                console.error("Error writing document: ", error);

            });

            return false;

        });

    });

};

$.Details = async function (citem) {

    $('.btn-save_form').hide();

    $('#application_code').val(citem['application_code']).prop('disabled', true);
    $('#application_name').val(citem['application_name']).prop('disabled', true);

    citem['record_status'] === 'Y'
        ? $('.record_status').eq(0).prop('checked', true)
        : $('.record_status').eq(1).prop('checked', true);

};

$.Edit = async function (citem) {

    $('#application_code').prop('disabled', false);
    $('#application_name').prop('disabled', false);

    $('#btn-save_exit').html('Update').show();
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#btn-save_exit').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let application_citem = {
                application_code: $('#application_code').val(),
                application_name: $('#application_name').val(),
                record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 'Y' : 'N',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['application_id']).update(application_citem).then(function () {

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

                    oTable.destroy();
                    $.List();

                    setTimeout(function () {

                        $('.btn-save_form').prop('disabled', false);
                        $("#frm_data").parsley().reset();

                        $('#modal-frm_data').modal('hide');

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

$.Delete = async function (citem) {

    $('#btn-save_exit').html('Delete').show();
    $('#btn-save_exit').removeClass('btn-primary').addClass('btn-danger');

    $('#btn-save_exit').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let application_citem = {
                record_status: 'D',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['application_id']).update(application_citem).then(function () {

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