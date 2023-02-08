
'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_menu_create = url_api + '/v2/AuthSysMenuCreate';
const url_auth_sys_menu_update = url_api + '/v2/AuthSysMenuUpdate';
const url_auth_sys_menu_delete = url_api + '/v2/AuthSysMenuDelete';
const url_auth_sys_menu_get = url_api + '/v2/AuthSysMenuGet';

const url_auth_sys_application_get = url_api + '/v2/AuthSysApplicationGet';

let oTable = $('#tbl-list').DataTable();
let citem = [];
let arr_icon = [
    'fab fa-accessible-icon',
    'far fa-closed-captioning',
    'far fa-question-circle',
    'fas fa-american-sign-language-interpreting',
    'fas fa-assistive-listening-systems',
    'fas fa-audio-description',
    'fas fa-blind',
    'fas fa-braille',
    'fas fa-closed-captioning',
    'fas fa-deaf',
    'fas fa-low-vision',
    'fas fa-phone-volume',
    'fas fa-question-circle',
    'fas fa-sign-language',
    'fas fa-tty',
    'fas fa-universal-access',
    'fas fa-wheelchair',
    'fas fa-angle-double-down',
    'fas fa-angle-double-left',
    'fas fa-angle-double-right',
    'fas fa-angle-double-up',
    'fas fa-angle-down',
    'fas fa-angle-left',
    'fas fa-angle-right',
    'fas fa-angle-up',
    'fas fa-arrow-alt-circle-down',
    'far fa-arrow-alt-circle-down',
    'fas fa-arrow-alt-circle-left',
    'far fa-arrow-alt-circle-left',
    'fas fa-arrow-alt-circle-right',
    'far fa-arrow-alt-circle-right',
    'fas fa-arrow-alt-circle-up',
    'far fa-arrow-alt-circle-up',
    'fas fa-arrow-circle-down',
    'fas fa-arrow-circle-left',
    'fas fa-arrow-circle-right',
    'fas fa-arrow-circle-up',
    'fas fa-arrow-down',
    'fas fa-arrow-left',
    'fas fa-arrow-right',
    'fas fa-arrow-up',
    'fas fa-arrows-alt',
    'fas fa-arrows-alt-h',
    'fas fa-arrows-alt-v',
    'fas fa-caret-down',
    'fas fa-caret-left',
    'fas fa-caret-right',
    'fas fa-caret-square-down',
    'far fa-caret-square-down',
    'fas fa-caret-square-left',
    'far fa-caret-square-left',
    'fas fa-caret-square-right',
    'far fa-caret-square-right',
    'fas fa-caret-square-up',
    'far fa-caret-square-up',
    'fas fa-caret-up',
    'fas fa-cart-arrow-down',
    'fas fa-chart-line',
    'fas fa-chevron-circle-down',
    'fas fa-chevron-circle-left',
    'fas fa-chevron-circle-right',
    'fas fa-chevron-circle-up',
    'fas fa-chevron-down',
    'fas fa-chevron-left',
    'fas fa-chevron-right',
    'fas fa-chevron-up',
    'fas fa-cloud-download-alt',
    'fas fa-cloud-upload-alt',
    'fas fa-download',
    'fas fa-exchange-alt',
    'fas fa-expand-arrows-alt',
    'fas fa-external-link-alt',
    'fas fa-external-link-square-alt',
    'fas fa-hand-point-down',
    'far fa-hand-point-down',
    'fas fa-hand-point-left',
    'far fa-hand-point-left',
    'fas fa-hand-point-right',
    'far fa-hand-point-right',
    'fas fa-hand-point-up',
    'far fa-hand-point-up',
    'fas fa-hand-pointer',
    'far fa-hand-pointer',
    'fas fa-history',
    'fas fa-level-down-alt',
    'fas fa-level-up-alt',
    'fas fa-location-arrow',
    'fas fa-long-arrow-alt-down',
    'fas fa-long-arrow-alt-left',
    'fas fa-long-arrow-alt-right',
    'fas fa-long-arrow-alt-up',
    'fas fa-mouse-pointer',
    'fas fa-play',
    'fas fa-random',
    'fas fa-recycle',
    'fas fa-redo',
    'fas fa-redo-alt',
    'fas fa-reply',
    'fas fa-reply-all',
    'fas fa-retweet',
    'fas fa-share',
    'fas fa-share-square',
    'far fa-share-square',
    'fas fa-sign-in-alt',
    'fas fa-sign-out-alt',
    'fas fa-sort',
    'fas fa-sort-alpha-down',
    'fas fa-sort-alpha-up',
    'fas fa-sort-amount-down',
    'fas fa-sort-amount-up',
    'fas fa-sort-down',
    'fas fa-sort-numeric-down',
    'fas fa-sort-numeric-up',
    'fas fa-sort-up',
    'fas fa-sync',
    'fas fa-sync-alt',
    'fas fa-text-height',
    'fas fa-text-width',
    'fas fa-undo',
    'fas fa-undo-alt',
    'fas fa-upload',
    'fas fa-audio-description',
    'fas fa-backward',
    'fas fa-circle',
    'far fa-circle',
    'fas fa-closed-captioning',
    'far fa-closed-captioning',
    'fas fa-compress',
    'fas fa-eject',
    'fas fa-expand',
    'fas fa-expand-arrows-alt',
    'fas fa-fast-backward',
    'fas fa-fast-forward',
    'fas fa-file-audio',
    'far fa-file-audio',
    'fas fa-file-video',
    'far fa-file-video',
    'fas fa-film',
    'fas fa-forward',
    'fas fa-headphones',
    'fas fa-microphone',
    'fas fa-microphone-slash',
    'fas fa-music',
    'fas fa-pause',
    'fas fa-pause-circle',
    'far fa-pause-circle',
    'fas fa-phone-volume',
    'fas fa-play',
    'fas fa-play-circle',
    'far fa-play-circle',
    'fas fa-podcast',
    'fas fa-random',
    'fas fa-redo',
    'fas fa-redo-alt',
    'fas fa-rss',
    'fas fa-rss-square',
    'fas fa-step-backward',
    'fas fa-step-forward',
    'fas fa-stop',
    'fas fa-stop-circle',
    'far fa-stop-circle',
    'fas fa-sync',
    'fas fa-sync-alt',
    'fas fa-undo',
    'fas fa-undo-alt',
    'fas fa-video',
    'fas fa-volume-down',
    'fas fa-volume-off',
    'fas fa-volume-up',
    'fab fa-youtube',
    'fas fa-address-book',
    'far fa-address-book',
    'fas fa-address-card',
    'far fa-address-card',
    'fas fa-archive',
    'fas fa-balance-scale',
    'fas fa-birthday-cake',
    'fas fa-book',
    'fas fa-briefcase',
    'fas fa-building',
    'far fa-building',
    'fas fa-bullhorn',
    'fas fa-bullseye',
    'fas fa-calculator',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-calendar-alt',
    'far fa-calendar-alt',
    'fas fa-certificate',
    'fas fa-chart-area',
    'fas fa-chart-bar',
    'far fa-chart-bar',
    'fas fa-chart-line',
    'fas fa-chart-pie',
    'fas fa-clipboard',
    'far fa-clipboard',
    'fas fa-coffee',
    'fas fa-columns',
    'fas fa-compass',
    'far fa-compass',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-copyright',
    'far fa-copyright',
    'fas fa-cut',
    'fas fa-edit',
    'far fa-edit',
    'fas fa-envelope',
    'far fa-envelope',
    'fas fa-envelope-open',
    'far fa-envelope-open',
    'fas fa-envelope-square',
    'fas fa-eraser',
    'fas fa-fax',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-globe',
    'fas fa-industry',
    'fas fa-paperclip',
    'fas fa-paste',
    'fas fa-pen-square',
    'fas fa-pencil-alt',
    'fas fa-percent',
    'fas fa-phone',
    'fas fa-phone-square',
    'fas fa-phone-volume',
    'fas fa-registered',
    'far fa-registered',
    'fas fa-save',
    'far fa-save',
    'fas fa-sitemap',
    'fas fa-sticky-note',
    'far fa-sticky-note',
    'fas fa-suitcase',
    'fas fa-table',
    'fas fa-tag',
    'fas fa-tags',
    'fas fa-tasks',
    'fas fa-thumbtack',
    'fas fa-trademark',
    'fas fa-chess',
    'fas fa-chess-bishop',
    'fas fa-chess-board',
    'fas fa-chess-king',
    'fas fa-chess-knight',
    'fas fa-chess-pawn',
    'fas fa-chess-queen',
    'fas fa-chess-rook',
    'fas fa-square-full',
    'fas fa-archive',
    'fas fa-barcode',
    'fas fa-bath',
    'fas fa-bug',
    'fas fa-code',
    'fas fa-code-branch',
    'fas fa-coffee',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-file-code',
    'far fa-file-code',
    'fas fa-filter',
    'fas fa-fire-extinguisher',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-keyboard',
    'far fa-keyboard',
    'fas fa-microchip',
    'fas fa-qrcode',
    'fas fa-shield-alt',
    'fas fa-sitemap',
    'fas fa-terminal',
    'fas fa-user-secret',
    'fas fa-window-close',
    'far fa-window-close',
    'fas fa-window-maximize',
    'far fa-window-maximize',
    'fas fa-window-minimize',
    'far fa-window-minimize',
    'fas fa-window-restore',
    'far fa-window-restore',
    'fas fa-address-book',
    'far fa-address-book',
    'fas fa-address-card',
    'far fa-address-card',
    'fas fa-american-sign-language-interpreting',
    'fas fa-assistive-listening-systems',
    'fas fa-at',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bell-slash',
    'far fa-bell-slash',
    'fab fa-bluetooth',
    'fab fa-bluetooth-b',
    'fas fa-bullhorn',
    'fas fa-comment',
    'far fa-comment',
    'fas fa-comment-alt',
    'far fa-comment-alt',
    'fas fa-comments',
    'far fa-comments',
    'fas fa-envelope',
    'far fa-envelope',
    'fas fa-envelope-open',
    'far fa-envelope-open',
    'fas fa-envelope-square',
    'fas fa-fax',
    'fas fa-inbox',
    'fas fa-language',
    'fas fa-microphone',
    'fas fa-microphone-slash',
    'fas fa-mobile',
    'fas fa-mobile-alt',
    'fas fa-paper-plane',
    'far fa-paper-plane',
    'fas fa-phone',
    'fas fa-phone-square',
    'fas fa-phone-volume',
    'fas fa-rss',
    'fas fa-rss-square',
    'fas fa-tty',
    'fas fa-wifi',
    'fas fa-desktop',
    'fas fa-download',
    'fas fa-hdd',
    'far fa-hdd',
    'fas fa-headphones',
    'fas fa-keyboard',
    'far fa-keyboard',
    'fas fa-laptop',
    'fas fa-microchip',
    'fas fa-mobile',
    'fas fa-mobile-alt',
    'fas fa-plug',
    'fas fa-power-off',
    'fas fa-print',
    'fas fa-save',
    'far fa-save',
    'fas fa-server',
    'fas fa-tablet',
    'fas fa-tablet-alt',
    'fas fa-tv',
    'fas fa-upload',
    'fab fa-bitcoin',
    'fab fa-btc',
    'fas fa-dollar-sign',
    'fas fa-euro-sign',
    'fab fa-gg',
    'fab fa-gg-circle',
    'fas fa-lira-sign',
    'fas fa-money-bill-alt',
    'far fa-money-bill-alt',
    'fas fa-pound-sign',
    'fas fa-ruble-sign',
    'fas fa-rupee-sign',
    'fas fa-shekel-sign',
    'fas fa-won-sign',
    'fas fa-yen-sign',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bell-slash',
    'far fa-bell-slash',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-calendar-alt',
    'far fa-calendar-alt',
    'fas fa-calendar-check',
    'far fa-calendar-check',
    'fas fa-calendar-minus',
    'far fa-calendar-minus',
    'fas fa-calendar-plus',
    'far fa-calendar-plus',
    'fas fa-calendar-times',
    'far fa-calendar-times',
    'fas fa-clock',
    'far fa-clock',
    'fas fa-hourglass',
    'far fa-hourglass',
    'fas fa-hourglass-end',
    'fas fa-hourglass-half',
    'fas fa-hourglass-start',
    'fas fa-stopwatch',
    'fas fa-adjust',
    'fas fa-clone',
    'far fa-clone',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-crop',
    'fas fa-crosshairs',
    'fas fa-cut',
    'fas fa-edit',
    'far fa-edit',
    'fas fa-eraser',
    'fas fa-eye',
    'fas fa-eye-dropper',
    'fas fa-eye-slash',
    'far fa-eye-slash',
    'fas fa-object-group',
    'far fa-object-group',
    'fas fa-object-ungroup',
    'far fa-object-ungroup',
    'fas fa-paint-brush',
    'fas fa-paste',
    'fas fa-pencil-alt',
    'fas fa-save',
    'far fa-save',
    'fas fa-tint',
    'fas fa-align-center',
    'fas fa-align-justify',
    'fas fa-align-left',
    'fas fa-align-right',
    'fas fa-bold',
    'fas fa-clipboard',
    'far fa-clipboard',
    'fas fa-clone',
    'far fa-clone',
    'fas fa-columns',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-cut',
    'fas fa-edit',
    'far fa-edit',
    'fas fa-eraser',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-font',
    'fas fa-heading',
    'fas fa-i-cursor',
    'fas fa-indent',
    'fas fa-italic',
    'fas fa-link',
    'fas fa-list',
    'fas fa-list-alt',
    'far fa-list-alt',
    'fas fa-list-ol',
    'fas fa-list-ul',
    'fas fa-outdent',
    'fas fa-paper-plane',
    'far fa-paper-plane',
    'fas fa-paperclip',
    'fas fa-paragraph',
    'fas fa-paste',
    'fas fa-pencil-alt',
    'fas fa-print',
    'fas fa-quote-left',
    'fas fa-quote-right',
    'fas fa-redo',
    'fas fa-redo-alt',
    'fas fa-reply',
    'fas fa-reply-all',
    'fas fa-share',
    'fas fa-strikethrough',
    'fas fa-subscript',
    'fas fa-superscript',
    'fas fa-sync',
    'fas fa-sync-alt',
    'fas fa-table',
    'fas fa-tasks',
    'fas fa-text-height',
    'fas fa-text-width',
    'fas fa-th',
    'fas fa-th-large',
    'fas fa-th-list',
    'fas fa-trash',
    'fas fa-trash-alt',
    'far fa-trash-alt',
    'fas fa-underline',
    'fas fa-undo',
    'fas fa-undo-alt',
    'fas fa-unlink',
    'fas fa-archive',
    'fas fa-clone',
    'far fa-clone',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-cut',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-file-archive',
    'far fa-file-archive',
    'fas fa-file-audio',
    'far fa-file-audio',
    'fas fa-file-code',
    'far fa-file-code',
    'fas fa-file-excel',
    'far fa-file-excel',
    'fas fa-file-image',
    'far fa-file-image',
    'fas fa-file-pdf',
    'far fa-file-pdf',
    'fas fa-file-powerpoint',
    'far fa-file-powerpoint',
    'fas fa-file-video',
    'far fa-file-video',
    'fas fa-file-word',
    'far fa-file-word',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-paste',
    'fas fa-save',
    'far fa-save',
    'fas fa-sticky-note',
    'far fa-sticky-note',
    'fas fa-genderless',
    'fas fa-mars',
    'fas fa-mars-double',
    'fas fa-mars-stroke',
    'fas fa-mars-stroke-h',
    'fas fa-mars-stroke-v',
    'fas fa-mercury',
    'fas fa-neuter',
    'fas fa-transgender',
    'fas fa-transgender-alt',
    'fas fa-venus',
    'fas fa-venus-double',
    'fas fa-venus-mars',
    'fas fa-hand-lizard',
    'far fa-hand-lizard',
    'fas fa-hand-paper',
    'far fa-hand-paper',
    'fas fa-hand-peace',
    'far fa-hand-peace',
    'fas fa-hand-point-down',
    'far fa-hand-point-down',
    'fas fa-hand-point-left',
    'far fa-hand-point-left',
    'fas fa-hand-point-right',
    'far fa-hand-point-right',
    'fas fa-hand-point-up',
    'far fa-hand-point-up',
    'fas fa-hand-pointer',
    'far fa-hand-pointer',
    'fas fa-hand-rock',
    'far fa-hand-rock',
    'fas fa-hand-scissors',
    'far fa-hand-scissors',
    'fas fa-hand-spock',
    'far fa-hand-spock',
    'fas fa-handshake',
    'far fa-handshake',
    'fas fa-thumbs-down',
    'far fa-thumbs-down',
    'fas fa-thumbs-up',
    'far fa-thumbs-up',
    'fab fa-accessible-icon',
    'fas fa-ambulance',
    'fas fa-h-square',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-heartbeat',
    'fas fa-hospital',
    'far fa-hospital',
    'fas fa-medkit',
    'fas fa-plus-square',
    'far fa-plus-square',
    'fas fa-stethoscope',
    'fas fa-user-md',
    'fas fa-wheelchair',
    'fas fa-adjust',
    'fas fa-bolt',
    'fas fa-camera',
    'fas fa-camera-retro',
    'fas fa-clone',
    'far fa-clone',
    'fas fa-compress',
    'fas fa-expand',
    'fas fa-eye',
    'fas fa-eye-dropper',
    'fas fa-eye-slash',
    'far fa-eye-slash',
    'fas fa-file-image',
    'far fa-file-image',
    'fas fa-film',
    'fas fa-id-badge',
    'far fa-id-badge',
    'fas fa-id-card',
    'far fa-id-card',
    'fas fa-image',
    'far fa-image',
    'fas fa-images',
    'far fa-images',
    'fas fa-sliders-h',
    'fas fa-tint',
    'fas fa-ban',
    'fas fa-barcode',
    'fas fa-bars',
    'fas fa-beer',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bell-slash',
    'far fa-bell-slash',
    'fas fa-bug',
    'fas fa-bullhorn',
    'fas fa-bullseye',
    'fas fa-calculator',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-calendar-alt',
    'far fa-calendar-alt',
    'fas fa-calendar-check',
    'far fa-calendar-check',
    'fas fa-calendar-minus',
    'far fa-calendar-minus',
    'fas fa-calendar-plus',
    'far fa-calendar-plus',
    'fas fa-calendar-times',
    'far fa-calendar-times',
    'fas fa-certificate',
    'fas fa-check',
    'fas fa-check-circle',
    'far fa-check-circle',
    'fas fa-check-square',
    'far fa-check-square',
    'fas fa-circle',
    'far fa-circle',
    'fas fa-clipboard',
    'far fa-clipboard',
    'fas fa-clone',
    'far fa-clone',
    'fas fa-cloud',
    'fas fa-cloud-download-alt',
    'fas fa-cloud-upload-alt',
    'fas fa-coffee',
    'fas fa-cog',
    'fas fa-cogs',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-cut',
    'fas fa-database',
    'fas fa-dot-circle',
    'far fa-dot-circle',
    'fas fa-download',
    'fas fa-edit',
    'far fa-edit',
    'fas fa-ellipsis-h',
    'fas fa-ellipsis-v',
    'fas fa-envelope',
    'far fa-envelope',
    'fas fa-envelope-open',
    'far fa-envelope-open',
    'fas fa-eraser',
    'fas fa-exclamation',
    'fas fa-exclamation-circle',
    'fas fa-exclamation-triangle',
    'fas fa-external-link-alt',
    'fas fa-external-link-square-alt',
    'fas fa-eye',
    'fas fa-eye-slash',
    'far fa-eye-slash',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-filter',
    'fas fa-flag',
    'far fa-flag',
    'fas fa-flag-checkered',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-frown',
    'far fa-frown',
    'fas fa-hashtag',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-history',
    'fas fa-home',
    'fas fa-i-cursor',
    'fas fa-info',
    'fas fa-info-circle',
    'fas fa-language',
    'fas fa-magic',
    'fas fa-meh',
    'far fa-meh',
    'fas fa-microphone',
    'fas fa-microphone-slash',
    'fas fa-minus',
    'fas fa-minus-circle',
    'fas fa-minus-square',
    'far fa-minus-square',
    'fas fa-paste',
    'fas fa-pencil-alt',
    'fas fa-plus',
    'fas fa-plus-circle',
    'fas fa-plus-square',
    'far fa-plus-square',
    'fas fa-qrcode',
    'fas fa-question',
    'fas fa-question-circle',
    'far fa-question-circle',
    'fas fa-ambulance',
    'fas fa-anchor',
    'fas fa-balance-scale',
    'fas fa-bath',
    'fas fa-bed',
    'fas fa-beer',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bell-slash',
    'far fa-bell-slash',
    'fas fa-bicycle',
    'fas fa-binoculars',
    'fas fa-birthday-cake',
    'fas fa-blind',
    'fas fa-bomb',
    'fas fa-book',
    'fas fa-bookmark',
    'far fa-bookmark',
    'fas fa-briefcase',
    'fas fa-building',
    'far fa-building',
    'fas fa-car',
    'fas fa-coffee',
    'fas fa-crosshairs',
    'fas fa-dollar-sign',
    'fas fa-eye',
    'fas fa-eye-slash',
    'far fa-eye-slash',
    'fas fa-fighter-jet',
    'fas fa-fire',
    'fas fa-fire-extinguisher',
    'fas fa-flag',
    'far fa-flag',
    'fas fa-flag-checkered',
    'fas fa-flask',
    'fas fa-gamepad',
    'fas fa-gavel',
    'fas fa-gift',
    'fas fa-glass-martini',
    'fas fa-globe',
    'fas fa-graduation-cap',
    'fas fa-h-square',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-heartbeat',
    'fas fa-home',
    'fas fa-hospital',
    'far fa-hospital',
    'fas fa-image',
    'far fa-image',
    'fas fa-images',
    'far fa-images',
    'fas fa-industry',
    'fas fa-info',
    'fas fa-info-circle',
    'fas fa-key',
    'fas fa-leaf',
    'fas fa-lemon',
    'far fa-lemon',
    'fas fa-life-ring',
    'far fa-life-ring',
    'fas fa-lightbulb',
    'far fa-lightbulb',
    'fas fa-location-arrow',
    'fas fa-low-vision',
    'fas fa-magnet',
    'fas fa-male',
    'fas fa-map',
    'far fa-map',
    'fas fa-map-marker',
    'fas fa-map-marker-alt',
    'fas fa-map-pin',
    'fas fa-map-signs',
    'fas fa-medkit',
    'fas fa-money-bill-alt',
    'far fa-money-bill-alt',
    'fas fa-motorcycle',
    'fas fa-music',
    'fas fa-newspaper',
    'far fa-newspaper',
    'fas fa-paw',
    'fas fa-phone',
    'fas fa-phone-square',
    'fas fa-phone-volume',
    'fas fa-plane',
    'fas fa-plug',
    'fas fa-plus',
    'fas fa-plus-square',
    'far fa-plus-square',
    'fas fa-print',
    'fas fa-recycle',
    'fas fa-road',
    'fas fa-rocket',
    'fas fa-search',
    'fas fa-search-minus',
    'fas fa-search-plus',
    'fas fa-ship',
    'fas fa-shopping-bag',
    'fas fa-shopping-basket',
    'fas fa-shopping-cart',
    'fas fa-shower',
    'fas fa-street-view',
    'fas fa-subway',
    'fas fa-suitcase',
    'fas fa-tag',
    'fas fa-tags',
    'fas fa-taxi',
    'fas fa-thumbtack',
    'fas fa-ambulance',
    'fas fa-anchor',
    'fas fa-archive',
    'fas fa-balance-scale',
    'fas fa-bath',
    'fas fa-bed',
    'fas fa-beer',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bicycle',
    'fas fa-binoculars',
    'fas fa-birthday-cake',
    'fas fa-bomb',
    'fas fa-book',
    'fas fa-bookmark',
    'far fa-bookmark',
    'fas fa-briefcase',
    'fas fa-bug',
    'fas fa-building',
    'far fa-building',
    'fas fa-bullhorn',
    'fas fa-bullseye',
    'fas fa-bus',
    'fas fa-calculator',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-calendar-alt',
    'far fa-calendar-alt',
    'fas fa-camera',
    'fas fa-camera-retro',
    'fas fa-car',
    'fas fa-clipboard',
    'far fa-clipboard',
    'fas fa-cloud',
    'fas fa-coffee',
    'fas fa-cog',
    'fas fa-cogs',
    'fas fa-compass',
    'far fa-compass',
    'fas fa-copy',
    'far fa-copy',
    'fas fa-cube',
    'fas fa-cubes',
    'fas fa-cut',
    'fas fa-envelope',
    'far fa-envelope',
    'fas fa-envelope-open',
    'far fa-envelope-open',
    'fas fa-eraser',
    'fas fa-eye',
    'fas fa-eye-dropper',
    'fas fa-fax',
    'fas fa-fighter-jet',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-film',
    'fas fa-fire',
    'fas fa-fire-extinguisher',
    'fas fa-flag',
    'far fa-flag',
    'fas fa-flag-checkered',
    'fas fa-flask',
    'fas fa-futbol',
    'far fa-futbol',
    'fas fa-gamepad',
    'fas fa-gavel',
    'fas fa-gem',
    'far fa-gem',
    'fas fa-gift',
    'fas fa-glass-martini',
    'fas fa-globe',
    'fas fa-graduation-cap',
    'fas fa-hdd',
    'far fa-hdd',
    'fas fa-headphones',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-home',
    'fas fa-hospital',
    'far fa-hospital',
    'fas fa-hourglass',
    'far fa-hourglass',
    'fas fa-image',
    'far fa-image',
    'fas fa-images',
    'far fa-images',
    'fas fa-industry',
    'fas fa-key',
    'fas fa-keyboard',
    'far fa-keyboard',
    'fas fa-laptop',
    'fas fa-leaf',
    'fas fa-lemon',
    'far fa-lemon',
    'fas fa-life-ring',
    'far fa-life-ring',
    'fas fa-lightbulb',
    'far fa-lightbulb',
    'fas fa-lock',
    'fas fa-lock-open',
    'fas fa-magic',
    'fas fa-magnet',
    'fas fa-map',
    'far fa-map',
    'fas fa-map-marker',
    'fas fa-map-marker-alt',
    'fab fa-amazon-pay',
    'fab fa-apple-pay',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bookmark',
    'far fa-bookmark',
    'fas fa-bullhorn',
    'fas fa-camera',
    'fas fa-camera-retro',
    'fas fa-cart-arrow-down',
    'fas fa-cart-plus',
    'fab fa-cc-amazon-pay',
    'fab fa-cc-amex',
    'fab fa-cc-apple-pay',
    'fab fa-cc-diners-club',
    'fab fa-cc-discover',
    'fab fa-cc-jcb',
    'fab fa-cc-mastercard',
    'fab fa-cc-paypal',
    'fab fa-cc-stripe',
    'fab fa-cc-visa',
    'fas fa-certificate',
    'fas fa-credit-card',
    'far fa-credit-card',
    'fab fa-ethereum',
    'fas fa-gem',
    'far fa-gem',
    'fas fa-gift',
    'fab fa-google-wallet',
    'fas fa-handshake',
    'far fa-handshake',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-key',
    'fab fa-paypal',
    'fas fa-shopping-bag',
    'fas fa-shopping-basket',
    'fas fa-shopping-cart',
    'fas fa-star',
    'far fa-star',
    'fab fa-stripe',
    'fab fa-stripe-s',
    'fas fa-tag',
    'fas fa-tags',
    'fas fa-thumbs-down',
    'far fa-thumbs-down',
    'fas fa-thumbs-up',
    'far fa-thumbs-up',
    'fas fa-trophy',
    'fas fa-bookmark',
    'far fa-bookmark',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-certificate',
    'fas fa-circle',
    'far fa-circle',
    'fas fa-cloud',
    'fas fa-comment',
    'far fa-comment',
    'fas fa-file',
    'far fa-file',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-heart',
    'far fa-heart',
    'fas fa-map-marker',
    'fas fa-play',
    'fas fa-square',
    'far fa-square',
    'fas fa-star',
    'far fa-star',
    'fas fa-asterisk',
    'fas fa-certificate',
    'fas fa-circle-notch',
    'fas fa-cog',
    'fas fa-compass',
    'far fa-compass',
    'fas fa-crosshairs',
    'fas fa-life-ring',
    'far fa-life-ring',
    'fas fa-snowflake',
    'far fa-snowflake',
    'fas fa-spinner',
    'fas fa-sun',
    'far fa-sun',
    'fas fa-sync',
    'fas fa-baseball-ball',
    'fas fa-basketball-ball',
    'fas fa-bowling-ball',
    'fas fa-football-ball',
    'fas fa-futbol',
    'far fa-futbol',
    'fas fa-golf-ball',
    'fas fa-hockey-puck',
    'fas fa-quidditch',
    'fas fa-table-tennis',
    'fas fa-volleyball-ball',
    'fas fa-ban',
    'fas fa-battery-empty',
    'fas fa-battery-full',
    'fas fa-battery-half',
    'fas fa-battery-quarter',
    'fas fa-battery-three-quarters',
    'fas fa-bell',
    'far fa-bell',
    'fas fa-bell-slash',
    'far fa-bell-slash',
    'fas fa-calendar',
    'far fa-calendar',
    'fas fa-calendar-alt',
    'far fa-calendar-alt',
    'fas fa-calendar-check',
    'far fa-calendar-check',
    'fas fa-calendar-minus',
    'far fa-calendar-minus',
    'fas fa-calendar-plus',
    'far fa-calendar-plus',
    'fas fa-calendar-times',
    'far fa-calendar-times',
    'fas fa-cart-arrow-down',
    'fas fa-cart-plus',
    'fas fa-exclamation',
    'fas fa-exclamation-circle',
    'fas fa-exclamation-triangle',
    'fas fa-eye',
    'fas fa-eye-slash',
    'far fa-eye-slash',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-info',
    'fas fa-info-circle',
    'fas fa-lock',
    'fas fa-lock-open',
    'fas fa-minus',
    'fas fa-minus-circle',
    'fas fa-minus-square',
    'far fa-minus-square',
    'fas fa-plus',
    'fas fa-plus-circle',
    'fas fa-plus-square',
    'far fa-plus-square',
    'fas fa-question',
    'fas fa-question-circle',
    'far fa-question-circle',
    'fas fa-shield-alt',
    'fas fa-shopping-cart',
    'fas fa-sign-in-alt',
    'fas fa-sign-out-alt',
    'fas fa-thermometer-empty',
    'fas fa-thermometer-full',
    'fas fa-thermometer-half',
    'fas fa-thermometer-quarter',
    'fas fa-thermometer-three-quarters',
    'fas fa-thumbs-down',
    'far fa-thumbs-down',
    'fas fa-thumbs-up',
    'far fa-thumbs-up',
    'fas fa-toggle-off',
    'fas fa-toggle-on',
    'fas fa-unlock',
    'fas fa-unlock-alt',
    'fab fa-accessible-icon',
    'fas fa-address-book',
    'far fa-address-book',
    'fas fa-address-card',
    'far fa-address-card',
    'fas fa-bed',
    'fas fa-blind',
    'fas fa-child',
    'fas fa-female',
    'fas fa-frown',
    'far fa-frown',
    'fas fa-id-badge',
    'far fa-id-badge',
    'fas fa-id-card',
    'far fa-id-card',
    'fas fa-male',
    'fas fa-meh',
    'far fa-meh',
    'fas fa-power-off',
    'fas fa-smile',
    'far fa-smile',
    'fas fa-street-view',
    'fas fa-user',
    'far fa-user',
    'fas fa-user-circle',
    'far fa-user-circle',
    'fas fa-user-md',
    'fas fa-user-plus',
    'fas fa-user-secret',
    'fas fa-user-times',
    'fas fa-users',
    'fas fa-wheelchair',
    'fab fa-accessible-icon',
    'fas fa-ambulance',
    'fas fa-bicycle',
    'fas fa-bus',
    'fas fa-car',
    'fas fa-fighter-jet',
    'fas fa-motorcycle',
    'fas fa-paper-plane',
    'far fa-paper-plane',
    'fas fa-plane',
    'fas fa-rocket',
    'fas fa-ship',
    'fas fa-shopping-cart',
    'fas fa-space-shuttle',
    'fas fa-subway',
    'fas fa-taxi',
    'fas fa-train',
    'fas fa-truck',
    'fas fa-wheelchair',
    'fas fa-archive',
    'fas fa-book',
    'fas fa-bookmark',
    'far fa-bookmark',
    'fas fa-edit',
    'far fa-edit',
    'fas fa-envelope',
    'far fa-envelope',
    'fas fa-envelope-open',
    'far fa-envelope-open',
    'fas fa-eraser',
    'fas fa-file',
    'far fa-file',
    'fas fa-file-alt',
    'far fa-file-alt',
    'fas fa-folder',
    'far fa-folder',
    'fas fa-folder-open',
    'far fa-folder-open',
    'fas fa-keyboard',
    'far fa-keyboard',
    'fas fa-newspaper',
    'far fa-newspaper',
    'fas fa-paper-plane',
    'far fa-paper-plane',
    'fas fa-paperclip',
    'fas fa-paragraph',
    'fas fa-pen-square',
    'fas fa-pencil-alt',
    'fas fa-quote-left',
    'fas fa-quote-right',
    'fas fa-sticky-note',
    'far fa-sticky-note',
    'fas fa-thumbtack'

]

firebase.auth().onAuthStateChanged(async function (user) {

    if (user) {

        $.init = async function () {

            await $.LoadingOverlay("show");

            await $.List();

            await $.LoadingOverlay("hide");

            $('#btn-item_create').click(function (e) {

                e.preventDefault();

                $.Create();

            });

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                citem = [];

                await $.LoadingOverlay("show");

                await $.List();

                await $('#menu_parent').empty().select2().select2("destroy");
                await $('#menu_icon').val('').trigger("change");
                await $('#application_id').val('').trigger("change");

                await $.LoadingOverlay("hide");

            });

            let url = new URL(url_auth_sys_application_get);
            url.search = new URLSearchParams({
                application_id: '',
                application_name: '',
                application_code: '',
                application_type: '',
            });
            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    if (val['record_status'] == true) {

                        $('#application_id').append('<option value="' + val['application_id'] + '">' + val['application_code'] + '</option>');

                    }

                });

            }).then(function () {

                $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

                    $('#application_id').select2({
                        dropdownParent: $('#modal-frm_data')
                    }).on('select2:select', function (e) {
                         
                    

                        let url = new URL(url_auth_sys_menu_get);
                        url.search = new URLSearchParams({
                            application_id: $('#application_id').val(),
                        });
                        fetch(url).then(function (response) {
                            return response.json();
                        }).then(function (result) {

                            $('#menu_parent').empty().select2().select2("destroy");

                            $('#menu_parent').append('<option value="">--- Select Parent Menu ---</option>');

                            $.each(result.data, function (key, val) {

                                if (val['record_status'] == true && (val['menu_parent'] == '' || val['menu_parent'] == null)) {

                                    $('#menu_parent').append('<option value="' + val['menu_id'] + '">' + val['menu_name'] + '</option>');

                                }

                            });

                        }).then(function () {

                            $('#menu_parent').select2({
                                dropdownParent: $('#modal-frm_data')
                            });


                        });

                    });

                });

            });


            // Start Icon List //
            let options = new Array();

            $.each(arr_icon, function (index, icon) {
                options.push({
                    id: icon,
                    text: '<i class="' + icon + '"></i>&nbsp;&nbsp;' + icon
                });
            });


            $('#menu_icon').select2({
                width: '100%',
                height: '40px',
                dropdownParent: $("#modal-frm_data"),
                placeholder: "--- Select Icon ---",
                data: options,
                escapeMarkup: function (markup) {
                    return markup;
                }
            });
            // End Icon List //


        };

        $.List = async function () {

            let url = new URL(url_auth_sys_menu_get);

            url.search = new URLSearchParams({
                menu_id: '',
                application_id: '',
                menu_parent: ''
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = result.length;

                let data = [];

                $.each(result.data, function (key, val) {

                    data.push([
                        i,
                        val['menu_id'],
                        val['application_code'],
                        val['parent_name'],
                        val['menu_name'],
                        val['menu_url'],
                        val['menu_order'],
                        val['record_status'],
                        val['menu_id']
                    ]);

                    i--;

                });

                oTable.clear().destroy();

                oTable = $('#tbl-list').DataTable({
                    "data": data,
                    //"dom": 'ifrtp',
                    "deferRender": true,
                    "order": [[0, "desc"]],
                    // "ordering": false,
                    "pageLength": 10,
                    "columnDefs": [
                        {
                            "targets": [0,1,2,3,6],
                            "className": 'tx-center'
                        },
                        {
                            "targets": [1],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [7],
                            "searchable": false,
                            "className": 'tx-center',
                            "render": function (data, type, row) {

                                return data === true ? '<span class="badge badge-success">Enable</span>' : '<span class="badge badge-danger">Disable</span>';

                            }
                        },
                        {
                            "targets": [8],
                            "searchable": false,
                            "visible": false,

                        },
                    ],
                    "initComplete": function (settings, json) {
                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let tbl_data = oTable.row(this).data();

                                let citem = {
                                    menu_id: tbl_data[1],
                                };

                                if (key === 'view') {

                                    await $.Details(citem['menu_id']);

                                } else if (key === 'edit') {

                                    await $.Details(citem['menu_id'], key);

                                } else if (key === 'delete') {

                                    await $.Details(citem['menu_id'], key);

                                } else {

                                    $LogEventCreate('create', result['status'], JSON.stringify(citem))
                                    alert('ERROR');

                                }

                            },
                            items: {
                                "view": { name: "View", icon: "fas fa-search" },
                                "edit": { name: "Edit", icon: "edit" },
                                "delete": { name: "Delete", icon: "delete" },

                            }

                        });
                    }
                });

            });

        };

        $.Create = async function () {

            $('.btn-save_form').removeClass('d-none');
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

                    citem.push({
                        application_id: $('#frm_data').find('#application_id').val(),
                        menu_name: $('#frm_data').find('#menu_name').val(),
                        menu_parent: $('#frm_data').find('#menu_parent').val(),
                        menu_icon: $('#frm_data').find('#menu_icon').val(),
                        menu_url: $('#frm_data').find('#menu_url').val(),
                        menu_order: $('#frm_data').find('#menu_order').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 1 : 0,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    $.ajax({
                        url: url_auth_sys_menu_create,
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(citem),
                        success: function (result) {

                            $LogEventCreate('create', result['status'], JSON.stringify(citem))

                            citem = [];

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

                                    $("#frm_data").parsley().reset();

                                    if (submit_action === "save_exit") {

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

                            });

                        }
                    }).catch(function (error) {

                        $LogEventCreate('create', error['status'], JSON.stringify(citem))
                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $.Details = async function (item_id, key = null) {

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('.record_status').prop('disabled', true)

            citem['record_status'] === true
                ? $('.record_status').eq(0).prop('checked', true)
                : $('.record_status').eq(1).prop('checked', true);


            let url = new URL(url_auth_sys_menu_get);

            url.search = new URLSearchParams({
                menu_id: item_id,
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    $('#application_id').val(val['application_id']).trigger("change").prop('disabled', true);
                    $('#menu_name').val(val['menu_name']).prop('disabled', true);
                    $('#menu_parent').val(val['menu_parent']).trigger("change").prop('disabled', true);
                    $('#menu_icon').val(val['menu_icon']).trigger("change").prop('disabled', true);
                    $('#menu_url').val(val['menu_url']).prop('disabled', true);
                    $('#menu_order').val(val['menu_order']).prop('disabled', true);

                    $('.record_status').prop('disabled', true)

                    val['record_status'] === true
                        ? $('.record_status').eq(0).prop('checked', true)
                        : $('.record_status').eq(1).prop('checked', true)

                });

            }).then(function (result) {

                if (key === 'edit') {

                    $.Edit(item_id);

                } else if (key === 'delete') {

                    $.Delete(item_id);

                }

            })

        };

        $.Edit = async function (item_id) {

            let url = new URL(url_auth_sys_menu_get);
            url.search = new URLSearchParams({
                application_id: $('#application_id').val(),
            });
            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $('#menu_parent').empty().select2().select2("destroy");
                $('#menu_parent').append('<option value="">--- Select Parent Menu ---</option>');

                $.each(result.data, function (key, val) {

                    if (val['record_status'] == true && (val['menu_parent'] == '' || val['menu_parent'] == null)) {

                        $('#menu_parent').append('<option value="' + val['menu_id'] + '">' + val['menu_name'] + '</option>');

                    }

                });

            }).then(function () {

                $('#menu_parent').select2({
                    dropdownParent: $('#modal-frm_data')
                });

            });

            $('#btn-save_exit').html('Update').removeClass('d-none').addClass('btn-primary').prop('disabled', false);

            $('#application_id').prop('disabled', false);
            $('#menu_parent').prop('disabled', false);
            $('#menu_name').prop('disabled', false);
            $('#menu_icon').prop('disabled', false);
            $('#menu_url').prop('disabled', false);
            $('#menu_order').prop('disabled', false);
            $('.record_status').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        menu_id: item_id,
                        application_id: $('#frm_data').find('#application_id').val(),
                        menu_name: $('#frm_data').find('#menu_name').val(),
                        menu_parent: $('#frm_data').find('#menu_parent').val(),
                        menu_icon: $('#frm_data').find('#menu_icon').val(),
                        menu_url: $('#frm_data').find('#menu_url').val(),
                        menu_order: $('#frm_data').find('#menu_order').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_menu_update, {
                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        console.log('OK')
                        return data.json();
                    }).then(result => {

                        console.log(result)
                        $LogEventCreate('update', result['status'], JSON.stringify(citem));

                        citem = [];

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

                                $("#frm_data").parsley().reset();

                                if (submit_action === "save_exit") {

                                    $('#modal-frm_data').modal('hide');

                                } else {

                                    toastr.error('Error writing document');

                                }

                            }, 500);

                        });

                    }).catch((error) => {

                        $LogEventCreate('update', 'ERROR', JSON.stringify(citem))
                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $.Delete = async function (item_id) {

            $('#btn-save_exit').html('Delete').removeClass('d-none').addClass('btn-danger').prop('disabled', false);
            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        menu_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_menu_delete, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        console.log('OK')
                        return data.json();
                    }).then(result => {

                        console.log(result)
                        $LogEventCreate('delete', result['status'], JSON.stringify(citem));

                        citem = [];

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

                                $("#frm_data").parsley().reset();

                                if (submit_action === "save_exit") {

                                    $('#modal-frm_data').modal('hide');

                                } else {

                                    toastr.error('Error writing document');

                                }

                            }, 500);

                        });

                    }).catch((error) => {

                        $LogEventCreate('delete', 'ERROR', JSON.stringify(citem))
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

    } else {

        window.location.assign('./login');

    }

});