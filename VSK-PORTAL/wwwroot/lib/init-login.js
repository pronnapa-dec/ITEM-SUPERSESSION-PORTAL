'use strict';

let auth_permission = [];
let auth_role = [];
let auth_role_menu = [];
let auth_menu_parent = [];
let auth_menu_sub = [];
let auth_application = [];
let current_access = [];
let client_ip = '';
let objProfile = {};

firebase.auth().onAuthStateChanged(function (user) {

    let fs = firebase.firestore();

    if (user) {

        window.location.assign('./home');

    } else {

        fs.collection('auth_application').where('record_status', '==', 'Y').get().then(function (querySnapshot) {

            querySnapshot.forEach(function (doc) {

                auth_application.push(doc.data());

            });

            $.each(auth_application, function (key, val) {
                $('#auth_application_list').append('<option value="' + val['application_id'] +'">' + val['application_name'] + '</option>');
            });

            console.log('auth_application', auth_application);

        });


        $('#frm_signin').submit(async function (e) {

            e.preventDefault();

            $('#btn-submit').prop('disabled', true);

            $("#global-loader").fadeIn("slow");

            let collection = 'auth_user';

            let email = $('#user_email').val() + '@vskautoparts.com';
            let password = $('#user_password').val();
            let application_id = $('#auth_application_list').val();

            let dataSet = [];
            let auth_query = fs.collection(collection).where('user_email', '==', email).where('user_password', '==', password).where("record_status", "in", ["Y", "N"]);

            await auth_query.limit(1).get().then(function (querySnapshot) {

                querySnapshot.forEach(function (doc) {

                    dataSet.push({
                        user_id: doc.data().user_id,
                        user_email: doc.data().user_email,
                        user_fname: doc.data().user_fname,
                        user_lname: doc.data().user_lname,
                    });

                });

                objProfile['auth_user_profile'] = dataSet;

            }).catch(function (error) {

                alert('ผิดพลาด');

            });

            if (dataSet.length > 0) {

                await fs.collection('auth_permission').where('user_id', '==', dataSet[0]['user_id']).where('application_id', '==', application_id).limit(1).get().then(function (querySnapshot) {

                    querySnapshot.forEach(function (doc) {

                        auth_permission.push(doc.data());

                        objProfile['auth_permission'] = auth_permission;

                        console.log('auth_permission', auth_permission);

                    });

                });

                await fs.collection('auth_permission').where('user_id', '==', dataSet[0]['user_id']).where('application_id', '==', application_id).limit(1).get().then(function (querySnapshot) {

                    querySnapshot.forEach(function (doc) {

                        auth_permission.push(doc.data());

                        objProfile['auth_permission'] = auth_permission;

                        console.log('auth_permission', auth_permission);

                    });

                });

                await fs.collection('auth_role').where('role_id', '==', auth_permission[0]['role_id']).where('application_id', '==', application_id).limit(1).get().then(async function (querySnapshot) {

                    querySnapshot.forEach(function (doc) {

                        auth_role.push(doc.data());

                        objProfile['auth_role'] = auth_role;

                        console.log('auth_role', auth_role);

                    });

                });

                await fs.collection('auth_role_menu').where('role_id', '==', auth_permission[0]['role_id']).where('application_id', '==', application_id).limit(1).get().then(async function (querySnapshot) {

                    await querySnapshot.forEach(function (doc) {

                        auth_role_menu.push(doc.data().menu_id);

                        objProfile['auth_role_menu'] = auth_role_menu;

                    });

                    for (let i = 0; i < auth_role_menu[0].length; i++) {

                        await fs.collection('auth_menu').where('menu_id', '==', auth_role_menu[0][i]).where('application_id', '==', application_id).limit(1).get().then(async function (querySnapshot) {

                            await querySnapshot.forEach(function (doc) {

                                if (doc.data().menu_parent === '' || doc.data().menu_parent === null) {

                                    auth_menu_parent.push({
                                        menu_order: doc.data().menu_order,
                                        menu_id: doc.data().menu_id,
                                        menu_name: doc.data().menu_name,
                                        menu_icon: doc.data().menu_icon,
                                        menu_url: doc.data().menu_url,
                                    });

                                } else {

                                    auth_menu_sub.push({
                                        menu_order: doc.data().menu_order,
                                        menu_parent: doc.data().menu_parent,
                                        menu_name: doc.data().menu_name,
                                        menu_icon: doc.data().menu_icon,
                                        menu_url: doc.data().menu_url,
                                    });

                                }
                            });


                        });
                    }

                    objProfile['auth_menu_parent'] = auth_menu_parent;
                    objProfile['auth_menu_sub'] = auth_menu_sub;

                });

                await localStorage.setItem("objProfile", JSON.stringify(objProfile));

                

                await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {

                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage);

                    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorCode);
                        console.log(errorMessage);

                    });

                });




            } else {

                alert('ไม่พบผู้ใช้งาน')

            }

        });

    }

});