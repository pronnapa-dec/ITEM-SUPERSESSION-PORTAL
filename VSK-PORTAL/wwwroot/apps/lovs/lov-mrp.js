'use strict';

let fs = firebase.firestore();
let collection = 'lov_mrp';
let oTable;

$.init = function () {

    $.List();

    $('#btn-item_create').click(function (e) {

        e.preventDefault();

        $.Create();

    });

    $('#modal-frm_data').on('hidden.bs.modal', function () {

        $('#application_code').val('');
        $('#application_name').val('');

        $("#frm_data").parsley().reset();

    });

};

$.List = async function () {

    console.log('Index function Start', new Date());

    let dataSet = [];
    let query = await fs.collection(collection).where("active_flag", "in", ["Y", "N"]);

    query.get().then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {

            /*
             lov_id, lov_group ,lov_type ,parent_lov_id ,lov_code
            ,lov1 ,lov2 ,lov3 ,lov4 ,lov5 ,lov6 ,lov7 ,lov8 ,lov9 ,lov10 
            ,lov_desc ,lov_order ,active_flag ,created_by ,created_date ,updated_by ,updated_date
            */

            dataSet.push([
                doc.data().lov_id,              // 0
                doc.data().lov_group,           // 1
                doc.data().lov_type,            // 2
                doc.data().parent_lov_id,       // 3
                doc.data().lov_code,            // 4
                doc.data().lov1,                // 5
                doc.data().lov2,                // 6
                doc.data().lov3,                // 7
                doc.data().lov4,                // 8
                doc.data().lov5,                // 9
                doc.data().lov6,                // 10
                doc.data().lov7,                // 11
                doc.data().lov8,                // 12
                doc.data().lov9,                // 13   
                doc.data().lov10,               // 14
                doc.data().lov_desc,            // 15
                doc.data().lov_order,           // 16
                doc.data().active_flag,         // 17
                doc.data().created_by,          // 18
                doc.data().created_date,        // 19
                doc.data().updated_by,          // 20
                doc.data().updated_date,        // 21
                doc.data().trans_id             // 22
            ]);

        });

        oTable = $('#tbl-list').DataTable({
            data: dataSet,
            "scrollX": true,
            "autoWidth": false, 
            columns: [
                { title: "LOV ID" },
                { title: "LOV GROUP" },
                { title: "LOV TYPE" },
                { title: "PARENT LOV ID" },
                { title: "LOV CODE" },
                { title: "LOV 1" },
                { title: "LOV 2" },
                { title: "LOV 3" },
                { title: "LOV 4" },
                { title: "LOV 5" },
                { title: "LOV 6" },
                { title: "LOV 7" },
                { title: "LOV 8" },
                { title: "LOV 9" },
                { title: "LOV 10" },
                { title: "LOV NOTE" },
                { title: "LOV ORDER" },
                {
                    title: "ACTIVE FLAG",
                    render: function (data, type, row) {

                        return data === 'Y' ? '<span class="badge badge-success">Enable</span>' : '<span class="badge badge-danger">Disable</span>';

                    }
                },
                { title: "created_by" },
                { title: "created_date" },
                { title: "updated_by" },
                { title: "updated_date" }
            ],
            columnDefs: [
                {
                    "targets": [18],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [19],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [20],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [21],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [22],
                    "visible": false,
                    "searchable": false
                }
            ],
            "order": [[19, "desc"]],
            "rowCallback": function (row, data) {

            },
            "initComplete": function (settings, json) {
                $.contextMenu({
                    selector: '#tbl-list tbody tr',
                    callback: function (key, options) {

                        /*
                         lov_id, lov_group ,lov_type ,parent_lov_id ,lov_code
                        ,lov1 ,lov2 ,lov3 ,lov4 ,lov5 ,lov6 ,lov7 ,lov8 ,lov9 ,lov10
                        ,lov_desc ,lov_order ,active_flag ,created_by ,created_date ,updated_by ,updated_date
                        */

                        let data = oTable.row(this).data();
                        let citem = {
                            lov_id: data[0],
                            lov_group: data[1],
                            lov_type: data[2],
                            parent_lov_id: data[3],
                            lov_code: data[4],
                            lov1: data[5],
                            lov2: data[6],
                            lov3: data[7],
                            lov4: data[8],
                            lov5: data[9],
                            lov6: data[10],
                            lov7: data[11],
                            lov8: data[12],
                            lov9: data[13],
                            lov10: data[14],
                            lov_desc: data[15],
                            lov_order: data[16],
                            active_flag: data[17],
                            trans_id: data[22]
                        };

                        $('#modal-frm_data').modal({

                            keyboard: false,
                            backdrop: 'static'

                        });

                        if (key === 'view') {

                            $.Details(citem);

                        } else if (key === 'edit') {

                            $.Details(citem);
                            $.Edit(citem);

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

                        "delete": { name: "Delete", icon: "delete" },
                        "sep1": "---------",
                        "create": { name: "New Item", icon: "add" }
                    }

                });
            },
            "drawCallback": function (settings) {

            }
        });

    });

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

            /*
             lov_id, lov_group ,lov_type ,parent_lov_id ,lov_code
            ,lov1 ,lov2 ,lov3 ,lov4 ,lov5 ,lov6 ,lov7 ,lov8 ,lov9 ,lov10
            ,lov_desc ,lov_order ,active_flag ,created_by ,created_date ,updated_by ,updated_date
            */

            $('.btn-save_form').prop('disabled', true);

            let uuid = $.uuid();

            let data_citem = {
                lov_id: $('#lov_id').val(),
                lov_group: $('#lov_group').val(),
                lov_type: $('#lov_type').val(),
                parent_lov_id: $('#parent_lov_id').val(),
                lov_code: $('#lov_code').val(),
                lov1: $('#lov1').val(),
                lov2: $('#lov2').val(),
                lov3: $('#lov3').val(),
                lov4: $('#lov4').val(),
                lov5: $('#lov5').val(),
                lov6: $('#lov6').val(),
                lov7: $('#lov7').val(),
                lov8: $('#lov8').val(),
                lov9: $('#lov9').val(),
                lov10: $('#lov10').val(),
                lov_desc: $('#lov_desc').val(),
                lov_order: $('#lov_order').val(),
                active_flag: $('#frm_data').find('.active_flag').prop("checked") === true ? 'Y' : 'N',
                created_by: "SYSTEM",
                created_date: new Date(),
                updated_by: "SYSTEM",
                updated_date: new Date(),
                trans_id: uuid
            };

            fs.collection(collection).doc(uuid).set(data_citem).then(function () {

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

    /*
    lov_id, lov_group ,lov_type ,parent_lov_id ,lov_code
    ,lov1 ,lov2 ,lov3 ,lov4 ,lov5 ,lov6 ,lov7 ,lov8 ,lov9 ,lov10
    ,lov_desc ,lov_order ,active_flag ,created_by ,created_date ,updated_by ,updated_date
    */

    $('#lov_id').val(citem['lov_id']).prop('disabled', true);
    $('#lov_group').val(citem['lov_group']).prop('disabled', true);
    $('#lov_type').val(citem['lov_type']).prop('disabled', true);
    $('#parent_lov_id').val(citem['parent_lov_id']).prop('disabled', true);
    $('#lov_code').val(citem['lov_code']).prop('disabled', true);
    $('#lov1').val(citem['lov1']).prop('disabled', true);
    $('#lov2').val(citem['lov2']).prop('disabled', true);
    $('#lov3').val(citem['lov3']).prop('disabled', true);
    $('#lov4').val(citem['lov4']).prop('disabled', true);
    $('#lov5').val(citem['lov5']).prop('disabled', true);
    $('#lov6').val(citem['lov6']).prop('disabled', true);
    $('#lov7').val(citem['lov7']).prop('disabled', true);
    $('#lov8').val(citem['lov8']).prop('disabled', true);
    $('#lov9').val(citem['lov9']).prop('disabled', true);
    $('#lov10').val(citem['lov10']).prop('disabled', true);
    $('#lov_desc').val(citem['lov_desc']).prop('disabled', true);
    $('#lov_order').val(citem['lov_order']).prop('disabled', true);

    citem['active_flag'] === 'Y'
        ? $('.active_flag').eq(0).prop('checked', true)
        : $('.active_flag').eq(1).prop('checked', true);

};

$.Edit = async function (citem) {

    $('#lov_id').prop('disabled', false);
    $('#lov_group').prop('disabled', false);
    $('#lov_type').prop('disabled', false);
    $('#parent_lov_id').prop('disabled', false);
    $('#lov_code').prop('disabled', false);
    $('#lov1').prop('disabled', false);
    $('#lov2').prop('disabled', false);
    $('#lov3').prop('disabled', false);
    $('#lov4').prop('disabled', false);
    $('#lov5').prop('disabled', false);
    $('#lov6').prop('disabled', false);
    $('#lov7').prop('disabled', false);
    $('#lov8').prop('disabled', false);
    $('#lov9').prop('disabled', false);
    $('#lov10').prop('disabled', false);
    $('#lov_desc').prop('disabled', false);
    $('#lov_order').prop('disabled', false);


    $('#btn-save_exit').html('Update').show();
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#btn-save_exit').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let data_citem = {
                lov_id: $('#lov_id').val(),
                lov_group: $('#lov_group').val(),
                lov_type: $('#lov_type').val(),
                parent_lov_id: $('#parent_lov_id').val(),
                lov_code: $('#lov_code').val(),
                lov1: $('#lov1').val(),
                lov2: $('#lov2').val(),
                lov3: $('#lov3').val(),
                lov4: $('#lov4').val(),
                lov5: $('#lov5').val(),
                lov6: $('#lov6').val(),
                lov7: $('#lov7').val(),
                lov8: $('#lov8').val(),
                lov9: $('#lov9').val(),
                lov10: $('#lov10').val(),
                lov_desc: $('#lov_desc').val(),
                lov_order: $('#lov_order').val(),
                active_flag: $('#frm_data').find('.active_flag').prop("checked") === true ? 'Y' : 'N',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['trans_id']).update(data_citem).then(function () {

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

            let data_citem = {
                active_flag: 'D',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['trans_id']).update(data_citem).then(function () {

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