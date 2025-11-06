import { Card, Modal, Row } from "antd";
import Styled from "styled-components";

const Main = Styled.div`
    padding: 0px 30px 20px;
    min-height: 80vh;

    // height: 100%;
    background-color: rgb(244, 245, 247);
    &.grid-boxed{
        padding: 0px 180px 20px;
        @media only screen and (max-width: 1599px){
            padding: 0px 130px 20px;
        }
        @media only screen and (max-width: 1399px){
            padding: 0px 50px 20px;
        }
        @media only screen and (max-width: 991px){
            padding: 0px 30px 20px;
        }
    }
    .ant-card-rtl .ant-card-extra{
                margin-right: 0 !important;
            }
    .ant-tabs-tab span svg {        
        ${({ theme }) => (theme.rtl ? "padding-left" : "padding-right")}: 5px;
    }
    /* Picker Under Input */
    .ant-form-item-control-input .ant-picker {
        padding: ${({ theme }) =>
          theme.rtl ? "0 0 0 12px" : "0 12px 0 0"} !important;
    }

    /* progressbars */

    .ant-progress {
        display: inline-flex !important;
        align-items: center;
    }

    .ant-progress>div {
        display: flex;
        flex-direction: column;
    }

    .ant-progress .ant-progress-outer {
        ${({ theme }) =>
          !theme.rtl ? "margin-right" : "margin-left"}: 0 !important;
        ${({ theme }) =>
          !theme.rtl ? "padding-right" : "padding-left"}: 0 !important;
    }

    .ant-progress .ant-progress-text {
        order: 0;
        margin-left: auto;
        ${({ theme }) =>
          theme.rtl ? "margin-right" : "margin-left"}: 10px !important;
        align-self: flex-end;
        text-align: center;
    }

    .ant-progress-status-warning .ant-progress-bg {
        background: #fa8b0c;
    }

    /* progress bars */
    
    @media only screen and (max-width: 1199px){
        padding: 0px 15px;
    }
    @media only screen and (max-width: 991px){
        min-height: 580px;
    }
    .w-100{
        width: 100%;
    }
    .product-sidebar-col{
        @media only screen and (max-width: 767px){
            order: 2;
        }
    }
    .ant-skeleton-paragraph{
        margin-bottom: 0;
    }

    /* // ant alert */
    .ant-alert-closable{
        .ant-alert-message{
          ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 15px;
        }
    }

    .ant-alert-with-description .ant-alert-description{
        display: inline-block;
    }

    /* // ant Calendar Picker */
    .ant-picker-calendar{
        .ant-badge-status-text{
            color: ${({ theme }) => theme["gray-color"]};
        }
    }
    .ant-picker-calendar-header .ant-picker-calendar-year-select{
        @media only screen and (max-width: 400px){
            width: 50% !important;
        }
    }
    .ant-picker-calendar-header .ant-picker-calendar-month-select{
        @media only screen and (max-width: 400px){
            width: calc(50% - 8px) !important
        }
    }

    /* // Card Grid */
    .card-grid-wrap{
        .ant-card-grid{
            @media only screen and (max-width: 575px){
                width: 50% !important
            }
        }
    }

    /* // Drawer */
    .atbd-drawer{
        .ant-card-body{
            text-align: center;
        }
    }
    .drawer-placement{
        @media only screen and (max-width: 400px){
            text-align: center;
        }
        .ant-radio-group{
            @media only screen and (max-width: 400px){
                margin-bottom: 15px;
            }
        }
    }
    .ant-drawer-content-wrapper{
        @media only screen and (max-width: 400px){
            width: 260px !important;
        }
        @media only screen and (max-width: 375px){
            width: 220px !important;
        }
    }

    /* // Input */
    .input-wrap{
        @media only screen and (max-width: 991px){
            min-height: 500px;
        }
        input::placeholder{
            color: ${({ theme }) => theme["light-color"]};
        }
    }
    /* // Modal Buttons */
    .modal-btns-wrap{
        margin: 0 -5px;
    }
    /* spinner */
    .ant-spin{
        ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 20px;
        &:last-child{
            ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 0;
        }
    }

    /* Column Cards Wrapper */
    .columnCardsWrapper{
        background: #F4F5F7;
        border-radius: 4px;
        padding: 50px 30px 25px;
    }
    .columnCardsWrapper .ant-card{
        background: #fff;
    }
    .columnCardsWrapper .ant-card-head{
        background: #fff;
    }

    /* Ant Collapse */
    .ant-collapse{
        border-color: #E3E6EF;
        border-radius: 5px;
    }
    .ant-collapse.ant-collapse-icon-position-left .ant-collapse-header{
        color: #5A5F7D;
        padding: 12px 16px 10px 45px;
        background-color: ${({ theme }) => theme["bg-color-light"]};
    }
    .ant-collapse-content p{
        color: #9299B8;
        margin-bottom: 0;
    }
    .ant-collapse-content > .ant-collapse-content-box {
        padding: 20px 20px 12px;
    }
    .ant-collapse-content > .ant-collapse-content-box .ant-collapse-content-box{
        padding: 10.5px 20px;
    }
    .ant-collapse.ant-collapse-borderless{
        background-color: #fff;
    }
    .ant-collapse > .ant-collapse-item,
    .ant-collapse .ant-collapse-content{
        border-color: #E3E6EF;
    }
    .ant-collapse > .ant-collapse-item.ant-collapse-item-disabled .ant-collapse-header{
        color: #ADB4D2 !important;
    }

    .ant-collapse > .ant-collapse-item .ant-collapse-header .ant-collapse-arrow{

        font-size: 8px;
    }

    .ant-collapse .ant-collapse {
        border: 0 none;
        background: #fff;
    }

    .ant-collapse .ant-collapse > .ant-collapse-item {
        border-bottom: 0;
    }
    .ant-collapse .ant-collapse .ant-collapse-header{
        border: 1px solid #E3E6EF;
        background: #F8F9FB;
    }
    .ant-collapse .ant-collapse .ant-collapse-content{
        margin: 20px 0 10px 0;
        border: 1px solid #E3E6EF;
        border-radius: 0;
    }

    /* // Ant Radio */
    .ant-radio-button-wrapper{
        height: 48px;
        line-height: 46px;
        @media only screen and (max-width: 1024px){
            padding: 0 10px;
        }
        @media only screen and (max-width: 379px){
            height: 40px !important;
            line-height: 38px !important;
            font-size: 12px;
            padding: 0 6px;
        }
    }

    /* // Select */
    .ant-tree-select .ant-select-selector{
        height: 42px;
    }
    .tag-select-list{
        margin-bottom: -10px;
        .ant-select{
            margin-bottom: 10px;
        }
    }
    .ant-select-selector{
        border-color: #E3E6EF !important;
    }

    .ant-select{
        &.ant-select-multiple{
            .ant-select-selection-item{
                ${({ theme }) =>
                  !theme.rtl ? "padding-left" : "padding-right"}: 8px;
            }
        }
        .ant-select-selection-item{
            ${({ theme }) =>
              !theme.rtl ? "padding-left" : "padding-right"}: 10px !important;
        }
        &.ant-select-lg{
            height: 50px;
            line-height: 48px;
            .ant-select-selector{
                height: 50px !important;
                line-height: 48px;
            }
            .ant-select-selection-item{
                line-height: 48px !important;
                ${({ theme }) =>
                  !theme.rtl ? "padding-left" : "padding-right"}: 8px;
            }
            &.ant-select-multiple.ant-select-lg .ant-select-selection-item{
                height: 32px;
                line-height: 32px !important;
            }
        }
        &.ant-select-multiple.ant-select-sm{
            .ant-select-selection-item{
                height: 16px;
                line-height: 14px;
                font-size: 11px;
            }
        }
    }

    /* // Slider */
    .slider-with-input{
        .ant-slider{
            ${({ theme }) =>
              theme.rtl ? "margin-left" : "margin-right"}: 15px;
        }
        .slider-with-input__single{
            margin-bottom: 15px;
        }
    }

    /* // Tag */
    .ant-tag {
        box-sizing: border-box;
        margin: 0 8px 0 0;
        color: #000000d9;
        font-size: 14px;
        font-variant: tabular-nums;
        line-height: 1.5715;
        list-style: none;
        font-feature-settings: "tnum";
        display: inline-block;
        height: auto;
        padding: 0 7px;
        font-size: 12px;
        line-height: 20px;
        white-space: nowrap;
        background: #E6E7E9;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        opacity: 1;
        transition: all .3s;
        &.ant-tag-has-color{
            color: #fff !important;
        }
        &.ant-tag-magenta{
            color: #eb2f96;
        }
        &.ant-tag-red{
            color: #f5222d;
        }
        &.ant-tag-volcano{
            color: #fa541c;
        }
        &.ant-tag-orange{
            color: #fa8c16;
        }
        &.ant-tag-gold{
            color: #faad14;
        }
        &.ant-tag-line{
            color: #a0d911;
        }
        &.ant-tag-green{
            color: #a0d911;
        }
        &.ant-tag-cyan{
            color: #13c2c2;
        }
        &.ant-tag-blue{
            color: #1890ff;
        }
        &.ant-tag-geekbule{
            color: #2f54eb;
        }
        &.ant-tag-purple{
            color: #722ed1;
        }
        &.ant-tag-success {
            color: #52c41a !important;
            background: #f6ffed !important;
            border-color: #b7eb8f !important;
        }
        &.ant-tag-warning {
            color: #faad14 !important;
            background: #fffbe6 !important;
            border-color: #ffe58f !important;
        }
        &.ant-tag-error {
            color: #faad14 !important;
            background: #fff2f0 !important;
            border-color: #ffccc7 !important;
        }
        &.anticon {
            display: inline-flex;
            align-items: center;
            color: inherit;
            font-style: normal;
            line-height: 0;
            text-align: center;
            text-transform: none;
            vertical-align: -0.125em;
            text-rendering: optimizelegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    }

    .ant-tag>.anticon+span, .ant-tag>span+.anticon {
        margin-left: 7px;
    }
    

    /* // Timepicker List */
    .timepicker-list{
        margin: -5px;
        .ant-picker{
            margin: 5px;
        }
    }

    /* // Ant Menu */
    .ant-menu{
        .ant-menu-submenu-title{
            svg{
                color: ${({ theme }) => theme["light-color"]};
            }
        }
    }

    /* Ant Comment */
    .ant-comment-inner{
        padding: 0;
    }
    .ant-comment-content-detail p{
        color: #9299B8;
    }
    .ant-list-items{
        padding-top: 22px;
    }
    .ant-list-items li:not(:last-child){
        margin-bottom: 22px;
    }
    .ant-comment:not(:last-child){
        margin-bottom: 22px;
    }
    .ant-comment-nested{
        margin-top: 22px;
    }
    .ant-comment-actions li span{
        color: #ADB4D2;
    }
    .ant-comment-content-detail textarea{
        resize: none;
        min-height: 170px;
        border-radius: 5px;
    }

    /* // Vector Map */
    .rsm_map{
        min-height: 505px;
        .world-map{
            width: 100%;
            height: auto;
            @media only screen and (max-width: 1599px){
                height: 480px;
            }
            @media only screen and (max-width: 1399px){
                height: 400px;
            }
            @media only screen and (max-width: 575px){
                height: 400px;
            }
            @media only screen and (max-width: 767px){
                height: 300px;
            }
            @media only screen and (max-width: 575px){
                height: 250px;
            }
            @media only screen and (max-width: 479px){
                height: 350px;
            }
            @media only screen and (max-width: 375px){
                height: 240px;
            }
        }
        .controls{
            position: absolute;
            right: 30px;
            bottom: 30px;
            button{
                display: block;
                width: 27px;
                height: 27px;
                background: none;
                color: #5a5f7d;
                border: 1px solid #f1f2f6;
                padding: 0;
                font-size: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #fff;
                cursor: pointer;
                &:first-child{
                    border-radius: 6px 6px 0 0;
                }
                &:last-child{
                    border-radius: 0 0 6px 6px;
                }
                &:focus{
                    outline: none;
                }
                svg{
                    width: 10px;
                }
            }
            button + button{
                border-top: 0 none;
            }
        }
    }

    /* // Checkout Wrapper */
    .checkoutWraper{
        .ant-card-body{
            padding: 50px 50px 50px 30px !important;
            @media only screen and (max-width: 575px){
                padding: 25px !important;
            }
            .ant-card-body{
                padding: 25px !important;
                @media only screen and (max-width: 375px){
                    padding: 15px !important;
                }
            }
        }
        .ant-steps{
            margin-top: -22px;
        }
    }

    /* // Star Active */
    a{
        i,
        span.fa{
          font-size: 16px;
          color: ${({ theme }) => theme["extra-light-color"]};
        }
        &.starDeactivate{
          i:before{
            content: "\f31b";
          }
        }
        &.starActive{
          i,
          span.fa{
            color: ${({ theme }) => theme["warning-color"]};
          }
          i:before,
          span.fa:before{
            color: ${({ theme }) => theme["warning-color"]};
            content: "\f005";
    
          }
        }
    }

    .ant-timeline{
        color: ${({ theme }) => theme["gray-color"]};
        .ant-timeline-item-content{
            font-size: 16px;
        }
    }

    
    .ant-rate-content{
        font-weight: 500;
        color: ${({ theme }) => theme["gray-color"]}
    }

    .account-card{
        .ant-card-head{
            .ant-card-extra{
                @media only screen and (max-width: 575px){
                   padding-top: 0 !important;
                }
            }
            
        }
                
    }

    /* // Rechart */
    .recharts-default-legend{
        .recharts-legend-item{
            min-width: 100px !important;
        }
    }

    /* // Radio */
    .radio-size-wrap{
            .ant-radio-button-wrapper{
                @media only screen and (max-width: 1450px){
                    padding: 0 11.5px;
                }
            }
        }
    }

    /* // Message  */
    .message-button-list{
        margin: -4px;
        .ant-btn {
            margin: 4px;
        }
    }
    /* Chart Label */

    .chart-label {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
        color: #5a5f7d;
    }

    .chart-label .label-dot {
        ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 8px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
    }

    .chart-label .label-dot.dot-success {
        background: #20c997;
    }

    .chart-label .label-dot.dot-info {
        background: #79C942;
    }

    .chart-label .label-dot.dot-warning {
        background: #fa8b0c;
    }

    .chart-label .label-dot {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 10px;
    }

    // Ant comment action
    .ant-comment-actions{
        li{
            position: relative;
            &:not(:last-child){
                margin-right: 8px;
                padding-right: 8px;
                &:after{
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1px;
                    height: 12px;
                    background-color: #C6D0DC;
                    content: '';
                }
            }
            .com-time{
                cursor: default;
            }
            span{
                margin-right: 0;
            }
        }
    }

    // Emoji Picker React
    .emoji-picker-react{
        top: 15px;
        right: 25px;
        box-shadow: 0 5px 10px #efefef10;
        @media only screen and (max-width: 479px){
            top: 25px;
            right: -50px;
            width: 260px;
        }
        .emoji-categories{
            padding: 0 10px;
        }
        .emoji-search{
            margin: 0 10px;
        }
        .content-wrapper:before{
            display: none;
        }
        .emoji-group{
            padding: 0 10px;
        }
        .emoji-group:before{
            font-size: 12px;
            font-weight: 600;
            color: ${({ theme }) => theme["dark-color"]};
        }
        .emoji-group .emoji-img{
            margin: 5px !important;
        }
    }

    .wizard-side-border{
        >.ant-card{
            .ant-card-body{
                padding: 0 25px !important;
            }
        }
        .checkout-successful{
            >.ant-card{
                .ant-card-body{
                    padding: 25px !important;
                }
            }
        }
        .payment-method-form.theme-light{
            .shipping-selection__card{
                .ant-card-body{
                    padding: 25px 0 !important;
                }
            }
        }
        .shipping-selection__card{
            .ant-card-body{
                padding: 25px !important;
            }
        }
        .atbd-review-order{
            .ant-card-body{
                padding: 25px 25px 0 !important;
                @media only screen and (max-width: 767px) {
                    padding: 15px 15px 0 !important;
                }
            }
        }
        
        .ant-steps {
            padding: 50px;
            @media only screen and (max-width: 1399px) {
                padding: 25px;
            }
        }
        .steps-wrapper{
            padding: 50px;
            @media only screen and (max-width: 1399px) {
                padding: 25px;
            }
            ${({ theme }) =>
              theme.rtl ? "border-right" : "border-left"}: 1px solid ${({
  theme,
}) => theme["border-color-light"]};
        }
    }
    .editor-compose > div {
        position: static;
        max-width: 100%;
        margin: 25px 0;
    }

    // Ant Dragger
    .ant-upload-drag{
        background-color: #fff !important;
        border-radius: 10px !important;
        display: flex;
        align-items: center;
        min-height: 100px;
        border-color: #C6D0DC;
        &.sDash-uploader-large{
            min-height: 180px;
        }
        .ant-upload-drag-container{
            .ant-upload-text{
                margin-bottom: 0;
                font-size: 15px;
                color: #9299B8;
            }
        }
    }

    // Form Validation
    .ant-form-item{
        &.ant-form-item-has-success{
            .ant-input{
                border-color: ${({ theme }) => theme["success-color"]};
            }
            &.ant-form-item-with-help{
                .ant-form-item-explain{
                    color: ${({ theme }) => theme["success-color"]};
                }
            }
        }
        &.ant-form-item-with-help{
            .ant-form-item-explain{
                margin-top: 6px;
            }
        }
    }
`;

const ButtonsGroupWrapper = Styled.div`
    margin-bottom: -25px;
    .button-group-single{
        margin-bottom: 15px;
        h4{
            font-size: 15px;
            margin-bottom: 8px;
        }
        .ant-btn-group{
            margin-bottom: 10px;
        }
    }
    .button-group-single .ant-btn-white{
        border: 1px solid #E3E6EF;
        background: #fff !important;
        ${({ theme }) =>
          theme.rtl ? "border-left-width" : "border-right-width"}: 0px;
        &:last-child{
            ${({ theme }) =>
              theme.rtl ? "border-left-width" : "border-right-width"}: 1px;
        }
        &:hover{
            color: ${({ theme }) => theme["gray-color"]} !important;
            background: ${({ theme }) => theme["bg-color-normal"]} !important;
        }
    }
    .button-group-single .ant-btn-light{
        border: 1px solid #E3E6EF;
        ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 20px;
        ${({ theme }) =>
          theme.rtl ? "border-left-width" : "border-right-width"}: 0px;
        font-weight: 500;
        color: ${({ theme }) => theme["extra-light-color"]} !important;
        background: ${({ theme }) => theme["bg-color-normal"]} !important;
        &:last-child{
            ${({ theme }) =>
              theme.rtl ? "border-left-width" : "border-right-width"}: 1px;
        }
    }
    .ant-btn-group:not(:last-child){
        ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 20px;
    }
`;

const BlockButtonsWrapper = Styled.div`
    .ant-btn-block{
        margin-bottom: 10px;
    }
`;

const ButtonSizeWrapper = Styled.div`
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
`;

const BtnWithIcon = Styled.div`
    display: inline;
    .anticon i,
    .anticon svg,
    .anticon img{
        width: 10px;
        height: 10px;
    }
    .ant-btn-group button.active{
        ${({ theme }) => (theme.rtl ? "border-left" : "border-right")}: 0px;
    }
`;

const AlertList = Styled.div`
    margin-top: -15px;
    .alert-empty-message{
        .ant-alert{
            padding: 10px 40px 10px!important;
            &.ant-alert-no-icon{
                padding: 10px 20px 10px!important;
            }
        }
        .ant-alert-icon{
            top: 15px !important;
        }
        .ant-alert-message{
            display: none !important;
        }
    }
`;

const AutoCompleteWrapper = Styled.div`
    .ant-select:not(:last-child){
        margin-bottom: 20px;
    }
    .auto-complete-input{
        .ant-select{
            width: 200px !important;
            @media only screen and (max-width: 575px){
                width: 100% !important;
            }
        }
    }
`;

const CalendarWrapper = Styled.div`
    .ant-select-single:not(.ant-select-customize-input) .ant-select-selector{
        height: 30px !important;
    }
    .ant-select-single .ant-select-selector .ant-select-selection-item,
    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
        line-height: 28px !important;
    }
    .ant-picker-calendar-full .ant-picker-panel .ant-picker-calendar-date-content{
        height: 105px;
    }
    .ant-radio-button-wrapper{
        height: 30px;
        line-height: 28px;
        @media only screen and (max-width: 575px){
            height: 30px !important;
            line-height: 28px !important;
        }
    }
`;

const DatePickerWrapper = Styled.div`
    .ant-picker{
        padding: 6px 11px 6px;
        width: 100%;
        border-color: #E3E6EF;
        border-radius: 5px;
    }
    .ant-picker:not(:last-child){
        margin-bottom: 20px;
    }
    .ant-picker-input > input{
        color: #5A5F7D;
    }
    .ant-picker-range .ant-picker-input > input{
        text-align: center;
        font-weight: 500;
    }
`;

const NotificationListWrapper = Styled.div`
    margin: -4px;
    button{
        margin: 4px;
    }
`;

const TagInput = Styled.div`
    padding: 12px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme["border-color-normal"]};
    margin: -3px;
    .ant-tag{
        margin: 3px;
        font-size: 11px;
        padding: 0 4px;
        border: 0 none;
        height: 24px;
        display: inline-flex;
        align-items: center;
    }
`;

const PageHeaderWrapper = Styled.div`
    .ant-page-header{
        border: 1px solid ${({ theme }) => theme["border-color-normal"]};
        border-radius: 5px;
    }
    .ant-page-header .ant-page-header-heading-left{
        margin: 2px 0;
    }
`;

const MessageStyleWrapper = Styled.div`
    .ant-btn-lg{
        font-size: 14px;
    }
`;

const BasicFormWrapper = Styled.div`
    .ant-form {
        .ant-input{
            background-color: #fff;
        }
        .form-item{
            margin-bottom: 30px;
            label{
                font-weight: 500;
                display: block;
                margin-bottom: 15px;
            }
            .ant-cascader-picker{
                width: 100%;
                min-height: 48px;
                .ant-cascader-input{
                    min-height: 48px;
                }
            }
        }
        .ant-input-affix-wrapper > input.ant-input{
            padding-top: 12px;
            padding-bottom: 12px;
        }
        .ant-input-affix-wrapper .ant-input-prefix svg{
            color: #9299B8;
        }
    }
    .ant-form-item-control-input{
        min-height: auto !important;
    }
    .ant-form-item,
    .ant-form-item-row{
        flex-flow: column;
        &:not(:last-child){
            margin-bottom: 26px;
        }
        &:last-child{
            margin-bottom: 0;
        }
        .ant-form-item-label{
            text-align: ${({ theme }) => (theme.rtl ? "right" : "left")};
            label{
                height: fit-content;
                margin-bottom: 6px;
            }
        }
        .ant-form-item-control-input{
            input,
            textarea{
                color: ${({ theme }) => theme["gray-color"]};
                &:placeholder{
                    color: ${({ theme }) => theme["light-color"]};
                }
            }
            input[type="password"]{
                padding-top: 12px;
                padding-bottom: 12px;
            }
            .ant-picker-input input{
                padding: 12px;
            }
            button{
                height: 44px;
            }
            .ant-input-affix-wrapper{
                padding: 0 11px 0 11px;
            }
        }
        .ant-select-single{
            .ant-select-selector{
                padding: 0 20px;
                height: 48px !important;
                border: 1px solid ${({ theme }) =>
                  theme["border-color-normal"]};
                .ant-select-selection-item{
                    line-height: 46px !important;
                    padding: 0 !important;
                }
                .ant-select-selection-placeholder{
                    line-height: 46px !important;
                }
            }
        }
    }
    .setting-form-actions{
        margin: 48px 0 14px;
        @media only screen and (max-width: 575px){
            margin: 40px 0 14px;
        }
        button{
            border-radius: 6px;
            height: 44px;
            margin-bottom: 14px;
            &.ant-btn-light{
                border: 1px solid ${({ theme }) => theme["border-color-light"]};
                background-color: ${({ theme }) => theme["bg-color-light"]};
            }
        }
    }
    .ant-form-item-control-input{
        .input-prepend{
            position: absolute;
            ${({ theme }) => (theme.rtl ? "right" : "left")}: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 20px;
            height: 48px;
            border-radius: ${({ theme }) =>
              theme.rtl ? "0 4px 4px 0" : "4px 0 0 4px"};
            z-index: 10;
            border: 1px solid ${({ theme }) => theme["border-color-normal"]};
            background-color: ${({ theme }) => theme["bg-color-light"]};
            svg,
            i{
                color: ${({ theme }) => theme["gray-color"]};
            }
        }
        .input-prepend-wrap{
            .ant-input-number{
                input{
                    ${({ theme }) =>
                      !theme.rtl ? "padding-left" : "padding-right"}: 70px;
                }
            }
        }
        .ant-input-number{
            width: 100% !important;
            border: 1px solid ${({ theme }) => theme["border-color-normal"]};
        }
    }
    .add-record-form{
        margin: 25px 0 35px 0;
        
        .record-form-actions{
            padding-right: 40px;
        }
        .ant-btn{
            height: 44px;
            font-size: 14px;
            font-weight: 500;
        }
        .ant-radio-group{
            margin-bottom: -4px;
            .ant-radio-wrapper{
                margin-bottom: 4px;
            }
        }
    }
    .adTodo-form{
        .btn-adTodo {
            font-size: 14px;
        }
    }

    .sDash_form-action{
        margin: -7.5px;
        button{
            font-size: 14px;
            font-weight: 500;
            border-radius: 6px;
            margin: 7.5px;
            padding: 6.4px 19px;
            &.ant-btn-light{
                height: 44px;
                background-color: #F1F2F6;
                border-color: #F1F2F6;
            }
        }
        .ant-form-item{
            margin-bottom: 25px !important;
        }
        .ant-btn-light{
            background-color: #F8F9FB;
        }
    }
    .sDash_color-picker{
        border: 1px solid #E3E6EF;
        border-radius: 4px;
        padding: 11px 14px;
        input{
            width: 100%;
            border: 0 none;
            background-color: #fff;
            &::-webkit-color-swatch{
                min-height: 18px;
                border: 1px solid #C6D0DC;
            }
        }
    }
`;

const CardToolbox = Styled.div`
    .ant-page-header-heading{
        @media only screen and (max-width: 991px){
            flex-flow: column;
            align-items: center;
        }
    }

    .ant-page-header-heading-left{
        @media only screen and (max-width: 575px){
            flex-flow: column;
        }
        @media only screen and (max-width: 800px){
            max-width: 100%;
        }
        .ant-page-header-back{
            @media only screen and (max-width: 575px){
                margin: 0;
                padding: 0;
            }
        }
        .ant-page-header-heading-title{
            @media only screen and (max-width: 575px){
                margin: 10px 0 8px;
                padding: 0;
            }
            &:after{
                @media only screen and (max-width: 575px){
                    display: none;
                }
            }
        }
        .ant-page-header-heading-sub-title{
            @media only screen and (max-width: 575px){
                margin: 0;
                padding: 0;
                flex-flow: column;
            }
            .title-counter{
                @media only screen and (max-width: 575px){
                    margin-bottom: 16px;
                }
            }
        }
    }

    .ant-page-header-heading-title{
        position: relative;
        ${({ theme }) => (theme.rtl ? "padding-left" : "padding-right")}: 24px;
        // ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 24px;
        @media only screen and (max-width: 767px){
            ${({ theme }) =>
              theme.rtl ? "padding-left" : "padding-right"}: 12px;
            ${({ theme }) =>
              theme.rtl ? "margin-left" : "margin-right"}: 12px !important;
        }
        &:after{
            // position: absolute;
            // ${({ theme }) => (theme.rtl ? "left" : "right")}: 0px;
            // top: 0;
            // height: 100%;
            // width: 1px;
            // content: '';
            // background: ${({ theme }) => theme["border-color-normal"]};
        }
    }
    .ant-page-header-heading-sub-title{
        font-weight: 500;
        display: flex;
        align-items: center;
    }
    .ant-select{
        ${({ theme }) => (!theme.rtl ? "margin-left" : "margin-right")}: 25px;
        @media only screen and (max-width: 575px){
            ${({ theme }) => (!theme.rtl ? "margin-left" : "margin-right")}: 0;
        }
        .ant-select-selector{
            height: 46px;
            @media only screen and (max-width: 991px){
                min-width: 100%;
            }
        }
        .ant-select-selection-search-input{
            height: 46px;
            border-radius: 23px;
            border: 0 none;
            box-shadow: 0 5px 20px #9299B803;
            input{
                height: 46px !important;
                font-size: 14px;
            }
        }
    }
    .btn-add_new{
        border-radius: 6px;
        height: 40px;
        padding: 0 14px;
        font-size: 12px;
        @media only screen and (max-width: 991px){
            margin-top: 10px;
        }
        a{
            display: flex;
            align-items: center;
            svg{
                ${({ theme }) =>
                  theme.rtl ? "margin-left" : "margin-right"}: 6px;
            }
        }
    }
`;

const FormGroupWrapper = Styled.div`
    .ant-card-body{
        @media only screen and (max-width: 767px){
            padding: 0 !important;
        }
    }
`;
const BannerCardStyleWrap = Styled.div`
    .ant-card-body{
        padding: 25px 25px 0 25px !important;
    }
`;

const FileCardWrapper = Styled.div`
    .file-list{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding-left: 0;
        gap:15px;
        .file-list__single{
            justify-content: space-between;
            align-items: center;
            span{
                display: block;
                font-size: 12px;
                line-height: 1.42;
                &.file-name{
                    font-size: 14px;
                    font-weight: 500;
                    color: ${({ theme }) => theme["dark-color"]};
                }
                &.file-size{
                    margin: 2px 0;;
                    color: ${({ theme }) => theme["gray-solid"]};
                }
                &.file-content-action{
                    a{
                        font-weight: 500;
                        color: ${({ theme }) => theme["primary-color"]};
                    }
                    a + a{
                        margin-left: 8px;
                    }
                    span {
                        cursor: pointer;
                        color: #79C942 !important; 
                    }
                }
            }
        }
        .file-single-info{
            width: 50%;
            .file-single-logo{
                ${({ theme }) =>
                  theme.rtl ? "margin-left" : "margin-right"}: 7px;
                img{
                    max-width: 42px;
                }
            }
        }
        .file-single-action{
            .ant-dropdown-trigger {
                color: ${({ theme }) => theme["extra-light-color"]};
            }
        }
    }
`;

const ProfilePageheaderStyle = Styled.div`
  .ant-page-header-heading-title{
    margin-right: 0;
    padding-right: 0;
    display: flex;
    justify-content: space-between;
    &:after{
      display: none;
    }
  }
  .ant-select .ant-select-selection-search-input{
    border-radius: 6px;
  }
`;

const TableWrapper = Styled.div`
    .ant-pagination-prev, .ant-pagination-next {
        line-height: 28px !important;
        transform: rotateY(${({ theme }) => (theme.rtl ? "180deg" : "0deg")})
    }
    .ant-table table{
        text-align: ${({ theme }) => (!theme.rtl ? "left" : "right")};
    }
    .ant-table-thead > tr > th{
        text-align: ${({ theme }) => (!theme.rtl ? "left" : "right")};
    }
    span.anticon.anticon-right{
        transform: rotateY(${({ theme }) => (theme.rtl ? "180deg" : "0deg")})
    }
    span.anticon.anticon-left{
        transform: rotateY(${({ theme }) => (theme.rtl ? "180deg" : "0deg")})
    }
    &.table-order,
    &.table-seller,
    &.table-data-view{
        .ant-table-selection{
            .ant-checkbox-indeterminate{
                .ant-checkbox-inner{
                    background: ${({ theme }) => theme["primary-color"]};
                    border-color: ${({ theme }) => theme["primary-color"]};
                    &:after{
                        height: 2px;
                        background-color: #fff;
                    }
                }
            }
        }
        .ant-table-container{
            padding-bottom: 25px;
            border-bottom: 1px solid ${({ theme }) =>
              theme["border-color-light"]};
        }
        tbody{
            tr{
                &:hover{
                    td{
                        background: ${({ theme }) => theme["bg-color-light"]};
                    }
                }
                td{
                    .product-id{
                        max-width: 60px;
                        text-align: ${({ theme }) =>
                          theme.rtl ? "left" : "right"};
                    }
                }
            }
        }
        .ant-pagination{
            margin-top: 25px !important;
        }
    }
    &.table-data-view{
        .ant-table-container{
            padding-bottom: 0;
        }
        table{
            thead{
                th{
                    padding: 15px 16px;
                }
            }
            tbody{
                td{
                    padding: 11px 16px;
                    .record-img{
                        img{
                            max-width: 38px;
                            border-radius: 50%;
                            ${({ theme }) =>
                              theme.rtl ? "margin-left" : "margin-right"}: 12px;
                            min-height: 38px;
                        }
                    }
                    .record-location{
                        display: block;
                        font-size: 12px;
                        font-weight: 400;
                        color: ${({ theme }) => theme["light-color"]};
                    }
                    .status{
                        font-weight: 500;
                        text-transform: capitalize;
                        &.active{
                            color: ${({ theme }) => theme["success-color"]};
                            background: ${({ theme }) =>
                              theme["success-color"]}10;
                        }
                        &.deactivated{
                            color: ${({ theme }) => theme["warning-color"]};
                            background: ${({ theme }) =>
                              theme["warning-color"]}10;
                        }
                        &.blocked{
                            color: ${({ theme }) => theme["danger-color"]};
                            background: ${({ theme }) =>
                              theme["danger-color"]}10;
                        }
                    }
                    .table-actions{
                        a{
                            svg, i{
                                width: 16px;
                                color: ${({ theme }) =>
                                  theme["extra-light-color"]};
                            }
                            &.edit{
                                ${({ theme }) =>
                                  theme.rtl
                                    ? "margin-left"
                                    : "margin-right"}: 6px;
                              &:hover{
                                svg,
                                i{
                                    color: ${({ theme }) =>
                                      theme["info-color"]};
                                }
                              }  
                            }
                            &.delete{
                              &:hover{
                                svg,
                                i{
                                    color: ${({ theme }) =>
                                      theme["danger-color"]};
                                }
                              }  
                            }
                        }
                    }
                }
            }
        }
    }
    table{
        thead{
            tr{
                border-radius: 10px;
                th{
                    &:last-child{
                        text-align: ${({ theme }) =>
                          theme.rtl ? "left" : "right"};
                    }
                    color: ${({ theme }) => theme["gray-color"]};
                    background: ${({ theme }) => theme["bg-color-light"]};
                    border-top: 1px solid ${({ theme }) =>
                      theme["border-color-light"]};
                    border-bottom: 1px solid ${({ theme }) =>
                      theme["border-color-light"]};
                    &:first-child{
                        ${({ theme }) =>
                          !theme.rtl
                            ? "border-left"
                            : "border-right"}: 1px solid ${({ theme }) =>
  theme["border-color-light"]};
                        border-radius: ${({ theme }) =>
                          !theme.rtl
                            ? "10px 0 0 10px"
                            : "0 10px 10px 0"} !important;
                    }
                    &:last-child{
                        ${({ theme }) =>
                          theme.rtl
                            ? "border-left"
                            : "border-right"}: 1px solid ${({ theme }) =>
  theme["border-color-light"]};
                        border-radius: ${({ theme }) =>
                          !theme.rtl
                            ? "0 10px 10px 0"
                            : "10px 0 0 10px"} !important;
                    }
                }
            }
        }
        tbody{
            tr{
                &:hover{
                    td{
                        background: ${({ theme }) => theme["bg-color-light"]};
                    }
                }
                &.ant-table-row-selected{
                    &:hover{
                        td{
                            background: ${({ theme }) =>
                              theme["bg-color-light"]};
                        }
                    }
                    td{
                        background: ${({ theme }) => theme["bg-color-light"]};
                    }
                }
                td{
                    // border: 0 none;
                    font-weight: 500;
                    color: ${({ theme }) => theme["dark-color"]};
                    &:first-child{
                        border-radius: ${({ theme }) =>
                          !theme.rtl
                            ? "10px 0 0 10px"
                            : "0 10px 10px 0"} !important;
                    }
                    &:last-child{
                        border-radius: ${({ theme }) =>
                          !theme.rtl
                            ? "0 10px 10px 0"
                            : "10px 0 0 10px"} !important;
                    }
                    span{
                        display: block;
                    }
                    .order-id{
                        min-width: 128px;
                    }
                    .customer-name{
                        min-width: 174px;
                    }
                    .status{
                        min-width: 175px;
                    }
                    .ordered-amount{
                        min-width: 175px;
                    }
                    .ordered-date{
                        min-width: 165px;
                    }
                    .table-actions{
                        min-width: 60px;
                    }
                }
            }
        }
        .table-actions{
            text-align: left !important;
            //  justify-content: flex-start !important;
            // min-width: 150px !important;
            button{
                height: 40px;
                // padding: 0 11px;
                padding: 0 4px;
                background: transparent;
                border: 0 none;
                color: ${({ theme }) => theme["extra-light-color"]};
                &:hover{
                    &.ant-btn-primary{
                        color: ${({ theme }) => theme["primary-color"]};
                        background: ${({ theme }) => theme["primary-color"]}10;
                    }
                    &.ant-btn-info{
                        color: ${({ theme }) => theme["info-color"]};
                        background: ${({ theme }) => theme["info-color"]}10;
                    }
                    &.ant-btn-danger{
                        color: ${({ theme }) => theme["danger-color"]};
                        background: ${({ theme }) => theme["danger-color"]}10;
                    }
                }
            }
        }
        .seller-info{
            img{
                ${({ theme }) =>
                  theme.rtl ? "margin-left" : "margin-right"}: 12px;
            }
        }
        .user-info{
            display: flex;
            align-items: center;
            figure{
                margin: 0 8px 0;
            }
            .user-name{
                margin-bottom: 4px;
                font-weight: 500;
            }
            .user-designation{
                font-size: 12px;
                font-weight: 400;
                color: ${({ theme }) => theme["light-color"]};
            }
        }
    }    
`;

const DragDropStyle = Styled.div`
    .ant-card-body{
        padding: 15px !important;
    }
    table{
        thead{
            display: none;
        }
        tbody{
            >tr{
                &:not(:last-child){
                    td{
                         border-bottom: 1px solid ${({ theme }) =>
                           theme["border-color-normal"]} !important;
                    }
                 }
                 &:hover{
                     td{
                         background-color: transparent !important;
                     }
                 }
                >td{
                    font-size: 14px;
                    &:first-child,
                    &:last-child{
                        border-radius: 0 !important;
                    }
                }
            }
        }
        tr{
            td{
                &.drag-visible{
                    svg,
                    img{
                        width: 20px;
                    }
                    svg,
                    i{
                        color: ${({ theme }) =>
                          theme["extra-light-color"]} !important;
                    }
                }
            }
        }
        .user-info{
            .user-name{
                font-size: 14px;
                margin-left: 8px;
            }
        }
    }
`;

const ImportStyleWrap = Styled.div`
    .ant-upload.ant-upload-drag{
        background-color: #fff;
        min-height: 280px;
        display: flex;
        align-items: center;
        border-color: #C6D0DC;
        border-radius: 10px;
        .ant-upload-drag-icon{
            svg,
            i{
                color: #ADB4D2;
            }
        }
    }
    .sDash_import-inner{
        .ant-upload-text{
            font-size: 20px;
            font-weight: 500;
        }
        .ant-upload-hint{
            margin-left: 4px;
            span{
                color: ${({ theme }) => theme["primary-color"]};
            }
        }
        .ant-upload-list{
            .ant-upload-list-item{
                background-color: #fff;
                border-color: ${({ theme }) => theme["border-color-normal"]};
            }
            .ant-upload-list-item-card-actions.picture{
                top: 18px;
                ${({ theme }) => (!theme.rtl ? "right" : "left")}: 15px;
            }
        }
    }
`;

const ExportStyleWrap = Styled.div`
    .sDash_export-box{
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        @media only screen and (max-width: 575px){
            flex-flow: column;
        }
        .btn-export{
            height: 44px; 
            @media only screen and (max-width: 575px){
                margin-bottom: 20px;
            }
        }
        .ant-select{
            width: auto !important;
            .ant-select-selector{
                padding: 0 20px;
                .ant-select-selection-search-input{
                    border-radius: 20px;
                }
            }
        }
    }
    .sDash_export-file-table{
        .ant-table-content{
            .ant-table-thead{
                border: 1px solid ${({ theme }) => theme["border-color-light"]};
                border-radius: 10px;
                tr{
                    th{
                        background-color: ${({ theme }) =>
                          theme["bg-color-light"]};
                        border: 0 none;
                        color: ${({ theme }) => theme["gray-color"]};
                        &:first-child{
                            border-radius: 10px 0 0 10px;
                        }
                        &:last-child{
                            border-radius: 0 10px 10px 0;
                        }
                    }
                }
            }
            .ant-table-tbody{
                tr{
                    &:hover{
                        box-shadow: 0 15px 50px #9299B820;
                        td{
                            background-color: #fff !important;
                        }
                    }
                    td{
                        border: 0 none;
                        padding: 22px 25px;
                        background-color: #fff;
                    }
                }
            }
        }
    }
`;

const ProfileTableStyleWrapper = Styled.nav`
  table{
    tbody{
      td{
        .user-info{
          .user-name{
            font-size: 14px;
          }
        }
        span.status-text{
          font-size: 12px;
          padding: 0 12.41px;
          line-height: 1.9;
          font-weight: 500;
          border-radius: 12px;
          text-transform: capitalize;
          display: inline-block !important;
          background: #ddd;
          &.active{
            background-color: ${({ theme }) => theme["success-color"]}15;
            color: ${({ theme }) => theme["success-color"]};
          }
          &.deactivate{
            background-color: ${({ theme }) => theme["warning-color"]}15;
            color: ${({ theme }) => theme["warning-color"]};
          }
          &.blocked{
            background-color: ${({ theme }) => theme["danger-color"]}15;
            color: ${({ theme }) => theme["danger-color"]};
          }
        }
      }
    }
  }
  .ant-table-pagination.ant-pagination{
    width: 100%;
    text-align: ${({ theme }) => (!theme.rtl ? "right" : "left")};
    // border-top: 1px solid ${({ theme }) => theme["border-color-light"]};
    margin-top: 0 !important;
    padding-top: 30px;
    @media only screen and (max-width: 767px){
      text-align: center;
    }
  }
  .contact-table{
    table{
      tr{
        th{
          &:first-child{
            ${({ theme }) =>
              theme.rtl ? "padding-right" : "padding-left"}: 20px;
          }
          &:last-child{
            ${({ theme }) =>
              theme.rtl ? "padding-left" : "padding-right"}: 20px;
          }
        }
      }
      .table-actions{
            text-align: left !important;
             justify-content: flex-start !important;
            // min-width: 150px !important;
            button{
                height: 40px;
                padding: 0 11px;
                background: transparent;
                border: 0 none;
                color: ${({ theme }) => theme["extra-light-color"]};
                &:hover{
                    &.ant-btn-primary{
                        color: ${({ theme }) => theme["primary-color"]};
                        background: ${({ theme }) => theme["primary-color"]}10;
                    }
                    &.ant-btn-info{
                        color: ${({ theme }) => theme["info-color"]};
                        background: ${({ theme }) => theme["info-color"]}10;
                    }
                    &.ant-btn-danger{
                        color: ${({ theme }) => theme["danger-color"]};
                        background: ${({ theme }) => theme["danger-color"]}10;
                    }
    }
  }
`;

const ProfilePageHeaderStyle = Styled.div`
  .ant-page-header-heading-title{
    margin-right: 0;
    padding-right: 0;
    display: flex;
    justify-content: space-between;
    &:after{
      display: none;
    }
  }
  .ant-select .ant-select-selection-search-input{
    border-radius: 6px;
  }
`;

const AddProfile = Styled.div`
  .form-title{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 36px;
  }

  .ant-form-item {
    margin-bottom:16px !important;
  }
  .add-user-wrap{
   $: 
  }
  .add-user-bottom{
    margin-top: 20px;
    button + button{
      ${({ theme }) => (!theme.rtl ? "margin-left" : "margin-right")}: 15px;
    }
    .ant-btn-light{
      background: ${({ theme }) => theme["bg-color-light"]};
      border: 1px solid #F1F2F6;
    }
    &.text-right{
      @media only screen and (max-width: 767px){
        text-align: ${({ theme }) =>
          !theme.rtl ? "left" : "right"} !important;
      }
    }
  }
  .card-nav{
    ul{
      flex-wrap: wrap;
      margin-bottom: -4px -10px;
      @media only screen and (max-width: 575px){
        justify-content: center;
      }
      li{
        margin: 4px 10px !important;
        &:not(:last-child){
          ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 26px;
          @media only screen and (max-width: 575px){
            ${({ theme }) => (theme.rtl ? "margin-left" : "margin-right")}: 0;
          }
        }
        a{
          position: relative;
          padding: 22px 0;
          font-size: 14px;
          font-weight: 500;
          color: ${({ theme }) => theme["gray-color"]};
          @media only screen and (max-width: 575px){
            padding: 0;
          }
          &:after{
            position: absolute;
            ${({ theme }) => (!theme.rtl ? "left" : "right")}: 0;
            bottom: -4px;
            width: 100%;
            height: 2px;
            border-radius: 4px;
            content: '';
            opacity: 0;
            visibility: hidden;
            background-color: ${({ theme }) => theme["primary-color"]};
            @media only screen and (max-width: 575px){
              display: none;
            }
          }
          &.active{
            color: ${({ theme }) => theme["primary-color"]};
            &:after{
              opacity: 1;
              visibility: visible;
            }
            svg,
            img,
            i,
            span{
              color: ${({ theme }) => theme["primary-color"]};
            }
          }
          svg,
          img,
          i,
          span{
            color: ${({ theme }) => theme["light-color"]};
            ${({ theme }) =>
              theme.rtl ? "margin-left" : "margin-right"}: 10px;
          }
        }
      }
    }
  }

  /* // Photo Upload */
  .photo-upload{
    position: relative;
    max-width: 260px;
    margin-bottom: 30px;
    .ant-upload-select{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      width: 40px;
      border-radius: 50%;
      position: absolute;
      ${({ theme }) => (!theme.rtl ? "left" : "right")}: 85px;
      bottom: 5px;
      z-index: 10;
      background-color: ${({ theme }) => theme["white-color"]};
      span{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        z-index: -1;
        background-color: ${({ theme }) => theme["primary-color"]};
      }
      svg,
      i,
      span{
        color: ${({ theme }) => theme["white-color"]};
      }
      a{
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    img{
      border-radius: 50%;
    }
    .info{
      background-color: transparent;
    }
    figcaption{
      ${({ theme }) => (theme.rtl ? "margin-right" : "margin-left")}: 20px;
      .info{
        h1,
        h2,
        h3,
        h4,
        h5,
        h6{
          font-size: 15px;
          font-weight: 500;
        }
      }
    }
  }

  .user-work-form{
    .ant-picker{
      padding: 0 15px 0 0;
    }
  }
  .user-info-form{
    .ant-select-single .ant-select-selector .ant-select-selection-item{
      color: ${({ theme }) => theme["gray-color"]};
    }
  }
  .social-form{
    .ant-form-item-control-input-content{
      .ant-input-prefix{
        width: 44px;
        height: 44px;
        border-radius: 4px;
      }
    }
    .ant-form-item-control-input{
      height: 44px;
      .ant-input-affix-wrapper{
        &:hover,
        &:focus,
        &.ant-input-affix-wrapper-focused{
          border-color: #E3E6EF;
        }
        .ant-input{
          height: 42px;
          ${({ theme }) => (!theme.rtl ? "padding-left" : "padding-right")}: 0;
        }
      }
    }
    .ant-input-prefix{
      position: relative;
      ${({ theme }) => (!theme.rtl ? "left" : "right")}: -11px;
      span{
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        width: 100%;
        height: 100%;
        background-color: ${({ theme }) => theme["primary-color"]};
        i,
        svg,
        span.fa{
          color: #fff;
          font-size: 16px;
        }
        .fa-facebook{
          background-color: #3B5998;
        }
        .fa-twitter{
          background-color: #38B8FF;
        }
        .fa-linkedin{
          background-color: #2CAAE1;
        }
        .fa-instagram{
          background-color: #FF0300;
        }
        .fa-github{
          background-color: #292929;
        }
        .fa-youtube{
          background-color: #FE0909;
        }
      }
    }
  }
`;

const TopToolBox = Styled.div`
    margin-bottom: 20px;
    /* // Toolbox Common Styles */
    .ant-row{
        align-items: center;
    }
    .table-toolbox-menu{
        margin: -10px;
        color: ${({ theme }) => theme["gray-color"]};
        @media only screen and (max-width: 1599px){
            text-align: ${({ theme }) => (theme.rtl ? "left" : "right")};
        }
        @media only screen and (max-width: 991px){
            margin-top: 20px;
        }
        .ant-radio-button-wrapper{
            height: 40px;
            line-height: 40px;
            padding: 0 12.5px;
            &.active{
                span{
                    color: ${({ theme }) => theme["primary-color"]};
                }
            }
        }
        @media only screen and (max-width: 991px){
            text-align: center;
        }
        .toolbox-menu-title,
        .ant-radio-group-outline{
            margin: 10px;
        }
    }
    .ant-select{
        @media only screen and (max-width: 1599px){
            margin-bottom: 20px;
        }
        @media only screen and (max-width: 767px){
            max-width: 350px;
            margin: 0 auto 20px;
        }
        .ant-select-selection-search{
            @media only screen and (max-width: 991px){
                width: 100% !important;
            }
            .ant-select-selection-search-input{
                @media only screen and (max-width: 1792px){
                    min-width: 230px;
                }
            }
        }
    }
    .search-result{
        margin: ${({ theme }) => (theme.rtl ? "0 25px 0 0" : "0 0 0 25px")};
        color: ${({ theme }) => theme["gray-color"]};
        @media only screen and (max-width: 1599px){
            text-align: ${({ theme }) => (theme.rtl ? "left" : "right")};
            margin-bottom: 15px;
        }
        @media only screen and (max-width: 991px){
            text-align: center;
            margin-bottom: 18px;
        }
        @media only screen and (max-width: 991px){
            ${({ theme }) =>
              !theme.rtl ? "margin-left" : "margin-right"}: 0px;
        }
    }
    .ant-select-selector{
        height: 46px !important;
        .ant-select-selection-search-input{
            box-shadow: 0 5px 20px ${({ theme }) => theme["light-color"]}3;
            border-radius: 23px;
            border: 0 none;
            input{
                height: 46px !important;
            }
        }
    }

    .ant-radio-group-outline{
        padding: 0 10px;
        border-radius: 5px;
        background: #fff;
        border: 1px solid ${({ theme }) => theme["border-color-normal"]};
        @media only screen and (max-width: 1792px){
            padding: 0 5px;
        }
        @media only screen and (max-width: 991px){
            padding: 0;
        }
    }
    .ant-radio-button-wrapper{
        height: 40px;
        line-height: 42px;
        padding: 0 12px;
        border-color: ${({ theme }) => theme["border-color-normal"]};
        border: 0 none !important;
        @media only screen and (max-width: 1792px){
            padding: 0 7.5px;
        }
        @media only screen and (max-width: 1599px){
            padding: 0 12.5px;
        }
        &.ant-radio-button-wrapper-checked{
            &:focus-within{
                box-shadow: 0 0;
            }
        }
        &:not(:first-child){
            &:before{
                display: none;
            }
        }
        &:not(:last-child){
            &:after{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                ${({ theme }) => (theme.rtl ? "left" : "right")}: 0px;
                display: block;
                box-sizing: content-box;
                width: 1px;
                height: 50%;
                padding: 1px 0;
                background-color: #F1F2F6;
                transition: background-color 0.3s;
                content: '';
                z-index: 1;
                @media only screen and (max-width: 479px){
                    display: none;
                }
            }
        }
        span{
            color: ${({ theme }) => theme["light-color"]};
            @media only screen and (max-width: 1792px){
                font-size: 13px;
            }
        }
        &.ant-radio-button-wrapper-checked{
            span{
                color: ${({ theme }) => theme["primary-color"]};
            }
        }
    }

    // Product Toolbox Styles
    .product-list-action{
        @media only screen and (max-width: 991px){
            flex-flow: column;
            justify-content: center;
        }
    }
    .product-list-action__tab{
        margin: -10px;
        color: ${({ theme }) => theme["gray-color"]};
        
        @media only screen and (max-width: 767px){
            margin-bottom: 15px;
            text-align: center;
        }
        @media only screen and (max-width: 991px) and (min-width: 768px){
            margin: -10px -10px 0;
        }
        @media only screen and (max-width: 575px){
            margin: -6px -6px 0;
        }
        @media only screen and (max-width: 344px){
            .ant-radio-group-outline{
                margin-top: 8px;
                ${({ theme }) =>
                  !theme.rtl ? "margin-left" : "margin-right"}: 0;;
            }
        }
        .toolbox-menu-title,
        .ant-radio-group{
            margin: 10px;
            @media only screen and (max-width: 575px){
                margin: 6px
            }
        }
    }

    .product-list-action__viewmode{
        display: flex;
        align-items: center;
        a{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: ${({ theme }) => theme["light-color"]};
            box-shadow: 0 5px 20px ${({ theme }) => theme["light-color"]}10;
            &.active{
                background-color: #fff;
                color: ${({ theme }) => theme["primary-color"]};
            }
        }
    }

    .table-search-box{
        @media only screen and (max-width: 991px){
            max-width: 600px;
            margin: 0 auto;
        }
        .ant-select{
            margin-bottom: 0;
        }
        .ant-select-selection-search{
            width: 100% !important;
            .ant-select-selection-search-input {
                border-radius: 20px;
                
                background: ${({ theme }) => theme["bg-color-light"]};
                height: 40px;
                input{
                    background: ${({ theme }) => theme["bg-color-light"]};
                    height: 40px !important;
                    border-radius: 20px;
                }
            }
        }
    }
    .table-toolbox-actions{
        text-align: ${({ theme }) => (theme.rtl ? "left" : "right")};
        display: flex;
        justify-content: flex-end;
        align-items: center;
        @media only screen and (max-width: 1599px){
            margin-top: 20px;
            justify-content: center !important;
            text-align: center !important;
        }
        button{
            padding: 0px 13.4px;
            height: 38px;
            font-size: 13px;
            font-weight: 500;
            border-radius: 6px;
            svg,
            i{
                color: #fff;
            }
            &{
                +button{
                    ${({ theme }) =>
                      !theme.rtl ? "margin-left" : "margin-right"}: 8px;
                }
            }
        }
    }
`;

// 02-10-2025

// Two cards side-by-side
const Panel = Styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: flex-start;
  max-width: 1800px;
  margin: 0 auto;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const OfferCardStyled = Styled(Card)`
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  min-width: 300px;
  box-shadow: 0px 4px 25px 0px #e8eaee;
  border: 1px solid #f1f1f4;
  padding: 0 0 24px 0;
  margin-bottom: 24px;
  @media (max-width: 800px) {
    width: 100%;
    min-width: 0;
    margin-left: auto;
    margin-right: auto;
  }
`;



const OfferFormBg = Styled.div`
  background: #f7f8fa;
  border-radius: 4px;
  padding: 24px 22px 14px 22px;
  margin: 32px 18px 0 18px;
`;

const SectionHeader = Styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #23233b;
  margin-bottom: 12px;
  margin-top: 7px;
`;

const OfferFormRow = Styled(Row)`
  margin-top: 8px;
  margin-bottom: 15px;
`;

const InfoLabel = Styled.div`
  font-weight: 700;
  font-size: 13px;
  color: #2e2a2a;
  // margin-top: 7px;
`;

const InfoValue = Styled.div`
  font-weight: 400;
  font-size: 13px;
  color: #737373;
  // margin-bottom: 8px;
`;

const ErrorText = Styled.div`
  color: #f5222d;
  font-size: 13px;
  margin-top: 5px;
`;

// 08-10-2025


const Loader = Styled.div`
  display: flex;
  height: 400px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const StyledModal = Styled(Modal)`
  .ant-modal-content {
    background:  #F2F2F2 !important; 
    border-radius: 4px;
    box-shadow: 0 4px 32px rgba(20,40,40,0.12);
    padding: 0;
  }
`;

const ModalCardSection = Styled.div`
  background: #fff;
//   border-radius: 8px;
  padding: 24px;
//   margin-bottom: 4px;
  box-shadow: 0 1px 3px rgba(80,80,80,0.05);
`;
const ModalHeader = Styled.div`
  width: 100%;
  padding: 20px 24px 16px 24px;
  font-size: 18px;
  font-weight: 600;
  background: #fff;
  border-bottom: 1px solid #ececec;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const FooterButtons = Styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 20px;
`;



export {
  Main,
  TopToolBox,
  ButtonsGroupWrapper,
  BlockButtonsWrapper,
  ButtonSizeWrapper,
  BtnWithIcon,
  AlertList,
  AutoCompleteWrapper,
  CalendarWrapper,
  DatePickerWrapper,
  NotificationListWrapper,
  TagInput,
  PageHeaderWrapper,
  MessageStyleWrapper,
  ProfilePageheaderStyle,
  BasicFormWrapper,
  CardToolbox,
  FormGroupWrapper,
  DragDropStyle,
  BannerCardStyleWrap,
  FileCardWrapper,
  TableWrapper,
  ImportStyleWrap,
  ExportStyleWrap,
  ProfileTableStyleWrapper,
  ProfilePageHeaderStyle,
  AddProfile,
  Panel,
  OfferCardStyled,
  OfferFormBg,
  SectionHeader,
  OfferFormRow,
  InfoLabel,
  InfoValue,
  ErrorText,
  Loader,
  StyledModal,
  ModalCardSection,
  ModalHeader,
  FooterButtons,
};
