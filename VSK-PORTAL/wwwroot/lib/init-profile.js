'use strict';

firebase.auth().onAuthStateChanged(async function (user) {

    if (user) {

        const objProfile = JSON.parse(localStorage.getItem('objProfile'));
        const fireBase_name = user.displayName;
        const fireBase_email = user.email;
        const fireBase_uid = user.uid;
        let env_version = 'dev';

        if (env_version != 'dev') {
            $('#env_version').css('display', 'none')
        } else if (env_version != 'prod') {
            $('#env_version').css('display', 'block')
        }

        $.getUserProfile = function () {

            $.each(objProfile.auth_user_profile, function (key, val) {
                $('.profile_fullname').html(val['user_fname'] + ' ' + val['user_lname']);
                $('#welcome_name').html(val['user_fname'] + ' ' + val['user_lname']);
            });

            $.each(objProfile.auth_role, function (key, val) {
                $('.profile_role').html(val['role_name']);
            });

        };

        $.getMenuParent = function () {

            objProfile.auth_menu_parent.sort($.dynamicSort("menu_order"));

            $.each(objProfile.auth_menu_parent, function (key, val) {

                if (val['menu_url'] === '#') {

                    $('#header-menu_load').append('<li aria-haspopup="true">\
                                                        <a href="javascript:void(0)" class="sub-icon"><i class="' + val['menu_icon'] + '">\
                                                            </i> ' + val['menu_name'] + '<i class="fe fe-chevron-down horizontal-icon"></i>\
                                                        </a>\
                                                        <ul id="' + val['menu_id'] + '" class="sub-menu"></ul>\
                                                    </li>');

                    return $.getMemuSub(val['menu_id']);

                } else {

                    $('#header-menu_load').append('<li aria-haspopup="true" id="' + val['menu_id'] + '"><a href="' + val['menu_url'] + '" class=""><i class="' + val['menu_icon'] + '"></i> ' + val['menu_name'] + '</a></li>');

                    return '';
                }



            });

        }

        $.getMemuSub = function (menu_parent) {

            objProfile.auth_menu_sub.sort($.dynamicSort("menu_order"));

            var url = window.location.protocol + '' + window.location.origin;

            $.each(objProfile.auth_menu_sub, function (key, val) {

                if (val['menu_parent'] === menu_parent) {

                    $('#' + menu_parent).append('<li aria-haspopup="true"><a href="' + val['menu_url'] + '" class="slide-item">' + val['menu_name'] + '</a></li>');
                }

            });

        };

        $('#user-fullname').html();
        $('#user-role').html();
        $('#header-menu_load').append('<li aria-haspopup="true"><a href="home" class=""><i class="fas fa-home"></i> Home</a></li>');

        await $.getMenuParent();
        await $.getUserProfile();
       
    } else {

        window.location.assign('./login');

    }




});