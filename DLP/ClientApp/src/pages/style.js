import { Checkbox } from 'antd';
import Styled from 'styled-components';

const Main = Styled.div`
    padding: 0px 30px 20px;
    min-height: 715px;
    background-color: rgb(244, 245, 247);
    width:100%;
    .ant-card-rtl .ant-card-extra{
                margin-right: 0 !important;
            }
    .ant-tabs-tab span svg {        
        ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 5px;
    }
    /* Picker Under Input */
    .ant-form-item-control-input .ant-picker {
        padding: ${({ theme }) => (theme.rtl ? '0 0 0 12px' : '0 12px 0 0')} !important;
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
        ${({ theme }) => (!theme.rtl ? 'margin-right' : 'margin-left')}: 0 !important;
        ${({ theme }) => (!theme.rtl ? 'padding-right' : 'padding-left')}: 0 !important;
    }

    .ant-progress .ant-progress-text {
        order: 0;
        margin-left: auto;
        ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 10px !important;
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
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
        }
    }

    .ant-alert-with-description .ant-alert-description{
        display: inline-block;
    }

    /* // ant Calendar Picker */
    .ant-picker-calendar{
        .ant-badge-status-text{
            color: ${({ theme }) => theme['gray-color']}
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
            color: ${({ theme }) => theme['light-color']};
        }
    }
    /* // Modal Buttons */
    .modal-btns-wrap{
        margin: 0 -5px;
    }
    /* spinner */
    .ant-spin{
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 20px;
        &:last-child{
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0;
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
        background-color: ${({ theme }) => theme['bg-color-light']};
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
        padding: 0 25.25px;
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
                ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 8px;
            }
        }
        .ant-select-selection-item{
            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 10px !important;
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
                ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 8px;
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
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
        }
        .slider-with-input__single{
            margin-bottom: 15px;
        }
    }

    /* // Taglist */
    .taglist-wrap{
        margin: -5px;
        .ant-tag {
            line-height: 22px;
            padding: 0 10.2px;
            border: 0 none;
            margin: 5px;
            color: ${({ theme }) => theme['gray-color']};
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
        }
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
                color: ${({ theme }) => theme['light-color']};
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
          color: ${({ theme }) => theme['extra-light-color']};
        }
        &.starDeactivate{
          i:before{
            content: "\f31b";
          }
        }
        &.starActive{
          i,
          span.fa{
            color: ${({ theme }) => theme['warning-color']};
          }
          i:before,
          span.fa:before{
            color: ${({ theme }) => theme['warning-color']};
            content: "\f005";
    
          }
        }
    }

    .ant-timeline{
        color: ${({ theme }) => theme['gray-color']};
        .ant-timeline-item-content{
            font-size: 16px;
        }
    }

    
    .ant-rate-content{
        font-weight: 500;
        color: ${({ theme }) => theme['gray-color']}
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
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 8px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
    }

    .chart-label .label-dot.dot-success {
        background: #20c997;
    }

    .chart-label .label-dot.dot-info {
        background: #5f63f2;
    }

    .chart-label .label-dot.dot-warning {
        background: #fa8b0c;
    }

    .chart-label .label-dot {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
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
            color: ${({ theme }) => theme['dark-color']};
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
            ${({ theme }) => (theme.rtl ? 'border-right' : 'border-left')}: 1px solid ${({ theme }) => theme['border-color-light']};
        }
    }
    .editor-compose > div {
        position: static;
        max-width: 100%;
        margin: 25px 0;
    }
`;

const BasicFormWrapper = Styled.div`
    .ant-form {
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
    }
    .ant-form-item{
        flex-flow: column;
        &:not(:last-child){
            margin-bottom: 26px;
        }
        &:last-child{
            margin-bottom: 0;
        }
        .ant-form-item-label{
            text-align: ${({ theme }) => (theme.rtl ? 'right' : 'left')};
            label{
                height: fit-content;
                margin-bottom: 6px;
            }
        }
        .ant-form-item-control-input{
            input,
            textarea{
                color: ${({ theme }) => theme['gray-color']};
                &:placeholder{
                    color: ${({ theme }) => theme['light-color']};
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
                padding: 0 11px;
            }
        }
        .ant-select-single{
            .ant-select-selector{
                padding: 0 20px;
                height: 48px !important;
                border: 1px solid ${({ theme }) => theme['border-color-normal']};
                .ant-select-selection-item{
                    line-height: 46px;
                    padding: 0 !important;
                }
                .ant-select-selection-placeholder{
                    line-height: 46px;
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
                border: 1px solid ${({ theme }) => theme['border-color-light']};
                background-color: ${({ theme }) => theme['bg-color-light']};
            }
        }
    }
    .ant-form-item-control-input{
        .input-prepend{
            position: absolute;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 20px;
            height: 48px;
            border-radius: ${({ theme }) => (theme.rtl ? '0 4px 4px 0' : '4px 0 0 4px')};
            z-index: 10;
            border: 1px solid ${({ theme }) => theme['border-color-normal']};
            background-color: ${({ theme }) => theme['bg-color-light']};
            svg,
            i{
                color: ${({ theme }) => theme['gray-color']};
            }
        }
        .input-prepend-wrap{
            .ant-input-number{
                input{
                    ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 70px;
                }
            }
        }
        .ant-input-number{
            width: 100% !important;
            border: 1px solid ${({ theme }) => theme['border-color-normal']};
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
`;

const PricingCard = Styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 5px 20px #9299B830;
  padding: 30px;
  .pricing-badge{
    height: 32px;
    padding: 6px 22.6px;
  }
  .price-amount{
    font-size: 36px;
    margin-bottom: 10px;
    .currency{
      font-size: 16px;
      font-weight: 600;
      top: -12px;
      ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 2px;
      color: ${({ theme }) => theme['extra-light-color']};
    }
    .pricing-validity{
      font-size: 13px;
      font-weight: 400;
      bottom: 0;
      ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -2px;
      color: ${({ theme }) => theme['light-color']};
    }
  }
  .package-user-type{
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme['gray-color']};
  }
  .pricing-title{
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  button{
    padding: 0px 29.32px;
    height: 44px;
    border-radius: 6px;
    &.ant-btn-white{
      border: 1px solid #E3E6EF;
      span{
        color: #272b41;
      }
    }
  }
`;

const ListGroup = Styled.div`
  margin: 28px 0 15px;
  min-height: 210px;
  .list-single{
    display: flex;
    align-items: center;
    &:not(:last-child){
      margin-bottom: 12px;
    }
    .icon{
      display: inline-block;
      margin: ${({ theme }) => (theme.rtl ? '0px 0 -4px 10px' : '0px 10px -4px 0')};
    }
  }
`;

const Badge = Styled.span`
  display: inline-block;
  margin-bottom: 32px;
  padding: 5px 20px;
  border-radius: 16px;
  background: ${({ type, theme }) => theme[`${type}-color`]}10;
  color: ${({ type, theme }) => theme[`${type}-color`]};
  font-size: 13px;
  font-weight: 500;
`;

const GalleryNav = Styled.nav`
  background: #fff;
  margin-bottom: 25px;
  border-radius: 10px;
  padding: 0px 16px;
  @media only screen and (max-width: 767px){
    padding: 0 12px;
  }
  @media only screen and (max-width: 575px){
    text-align: center;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    li {
      display: inline-block;
      a {
        position: relative;
        display: block;
        padding: 15px 0;
        margin: 0 12px;
        color: ${({ theme }) => theme['light-color']};
        @media only screen and (max-width: 767px){
          margin: 0 10px;
        }
        &:after{
          position: absolute;
          ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          border-radius: 10px;
          opacity: 0;
          visibility: hidden;
          background: ${({ theme }) => theme['primary-color']};
          content: "";
        }
        &.active{
          color: ${({ theme }) => theme['primary-color']};
          &:after{
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }
  }
`;

const GalleryCard = Styled.nav`
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 5px 20px ${({ theme }) => theme['light-color']}03;
  figure{
    margin-bottom: 0;
  }
  .gallery-single-content{
    padding: 18px 25px 20px;
    .gallery-single-title{
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 2px;
    }
    p{
      font-size: 13px;
      margin-bottom: 0px;
      color: ${({ theme }) => theme['light-color']};
    }
  }
`;

const UsercardWrapper = Styled.nav`
  .user-card-pagination{
    margin: 15px 0 40px 0;
    text-align: ${({ theme }) => (!theme.rtl ? 'right' : 'left')};
    @media only screen and (max-width: 991px){
      text-align: center;
    }
  }
`;

const UserTableStyleWrapper = Styled.nav`
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
          background: #f3f3f3;
          &.active{
            background-color: ${({ theme }) => theme['success-color']}15;
            color: ${({ theme }) => theme['success-color']};
          }
          &.deactivate{
            background-color: ${({ theme }) => theme['warning-color']}15;
            color: ${({ theme }) => theme['warning-color']};
          }
          &.blocked{
            background-color: ${({ theme }) => theme['danger-color']}15;
            color: ${({ theme }) => theme['danger-color']};
          }
        }
      }
    }
  }
  .ant-table-pagination.ant-pagination{
    width: 100%;
    text-align: ${({ theme }) => (!theme.rtl ? 'right' : 'left')};
    // border-top: 1px solid ${({ theme }) => theme['border-color-light']};
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
            ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 20px;
          }
          &:last-child{
            ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 20px;
          }
        }
      }
      .table-actions{
        button{
          width: auto;
          height: auto;
          padding: 0;
          background-color: transparent;
          &:hover{
            background-color: transparent;
          }
          &.ant-btn-primary{
            &:hover{
              color: #ADB4D2;
            }
          }
        }
      }
      tbody >tr.ant-table-row-selected >td{
        background-color: ${({ theme }) => theme['primary-color']}10;
      }
    }
  }
`;

const UserCard = Styled.div`
  text-align: center;
  .card{
    position: relative;
    box-shadow: 0 5px 20px ${({ theme }) => theme['light-color']}03;
    border: none;
    .ant-card-body{
      padding: 30px !important;
      div{
        position: static;
      }
    }
    figure{
      margin-bottom: 0;
      img{
        margin-bottom: 20px;
        width: 100%;
        border-radius: 50%;
        max-width: 150px;
      }
    }
    .card__more_actions{
      position: absolute;
      ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 24px;
      top: 20px;
      line-height: .5;
      padding: 5px 3px;
      color: ${({ theme }) => theme['extra-light-color']};
      box-shadow: 0 10px 20px #9299B815;
      svg,
      img{
        width: 20px;
      }
    }
    .card__name{
      font-size: 16px;
      margin-bottom: 6px;
      font-weight: 500;
      a{
        color: ${({ theme }) => theme['dark-color']};
        &:hover{
          color: ${({ theme }) => theme['primary-color']};
        }
      }
    }
    .card__designation{
      font-size: 13px;
      margin-bottom: 25px;
      color: ${({ theme }) => theme['light-color']};
    }
    .card__social{
      margin-top: 16px;
      a{
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 20px ${({ theme }) => theme['light-color']}15;
        background: #fff;
        &:not(:last-child){
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
        }
        &.facebook span.fa{
          color: #3B5998;
        }
        &.twitter span.fa{
          color: #1DA1F2;
        }
        &.dribble span.fa{
          color: #C2185B;
        }
        &.instagram span.fa{
          color: #FF0300;
        }
      }
    }
  }

  .user-card{
    .ant-card-body{
      padding: 30px 25px 18px 25px !important;
      @media only screen and (max-width: 1599px){
        padding: 20px  20px 20px !important;
      }
      @media only screen and (max-width: 767px){
        padding: 15px  15px 15px !important;
      }
    }
    figure{
      img{
        margin-bottom: 18px;
        max-width: 120px;
      }
    }
    .card__actions{
      margin: -5px;
      .ant-btn-white{
        color: white;
        border: 1px solid ${({ theme }) => theme['border-color-light']};
        &:hover{
          border: 1px solid ${({ theme }) => theme['primary-color']};
        }
      }
    }
    .card__info{
      padding-top: 20px;
      margin-top: 18px;
      border-top: 1px solid ${({ theme }) => theme['border-color-light']};
      .info-single{
        text-align: center;
      }
      .info-single__title{
        font-size: 16px;
        font-weight: 600;
        line-height: 1.5;
        margin-bottom: 4px;
      }
      p{
        margin-bottom: 0;
        color: ${({ theme }) => theme['light-color']};
      }
    }
  }
`;

const BusinessCard = UserCard;

const FaqCategoryBox = Styled.div`
  .faq-badge{
    font-weight: 400;
    color: ${({ theme }) => theme['light-color']};
    background: ${({ theme }) => theme['bg-color-light']};
  }
  ul{
    li{
      a{
        display: inline-block;
        font-weight: 500;
        position: relative;
        padding: ${({ theme }) => (!theme.rtl ? '12px 0 12px 20px' : '12px 20px 12px 0')};
        transition: all .3s ease;
        color: ${({ theme }) => theme['gray-color']};
        &.active{
          padding-left: 28px;
          &:before{
            opacity: 1;
            visibility: visible;
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -15px;
          }
          &:after{
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 5px;
          }
          &.primary{
            &:after{
              background: ${({ theme }) => theme['primary-color']};
            }
          }
          &.secondary{
            &:after{
              background: ${({ theme }) => theme['secondary-color']};
            }
          }
          &.success{
            &:after{
              background: ${({ theme }) => theme['success-color']};
            }
          }
          &.warning{
            &:after{
              background: ${({ theme }) => theme['warning-color']};
            }
          }
          &.info{
            &:after{
              background: ${({ theme }) => theme['info-color']};
            }
          }
          &.danger{
            &:after{
              background: ${({ theme }) => theme['danger-color']}5;
            }
          }
        }
        &:before{
          position: absolute;
          ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -25px;
          top: 0;
          height: 100%;
          width: 2px;
          border-radius: 10px;
          opacity: 0;
          visibility: hidden;
          content: '';
          background: ${({ theme }) => theme['primary-color']};
          transition: all .3s ease;
        }
        &:after{
          position: absolute;
          ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
          top: 50%;
          transform: translatey(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          content: '';
          background: ${({ theme }) => theme['primary-color']}50;
          transition: all .3s ease;
        }
        &.secondary{
          &:after{
            background: ${({ theme }) => theme['secondary-color']}50;
          }
          &:before{
            background: ${({ theme }) => theme['secondary-color']};
          }
        }
        &.success{
          &:after{
            background: ${({ theme }) => theme['success-color']}50;
          }
          &:before{
            background: ${({ theme }) => theme['success-color']};
          }
        }
        &.warning{
          &:after{
            background: ${({ theme }) => theme['warning-color']}50;
          }
          &:before{
            background: ${({ theme }) => theme['warning-color']};
          }
        }
        &.info{
          &:after{
            background: ${({ theme }) => theme['info-color']}50;
          }
          &:before{
            background: ${({ theme }) => theme['info-color']};
          }
        }
        &.danger{
          &:after{
            background: ${({ theme }) => theme['danger-color']}50;
          }
          &:before{
            background: ${({ theme }) => theme['danger-color']};
          }
        }
      }
    }
  }
`;

const FaqSupportBox = Styled.div`
  text-align: center;
  .ant-card-body{
    padding: 30px 50px 40px 50px !important;
    @media only screen and (max-width: 1599px){
      padding: 30px !important;
    }
    @media only screen and (max-width: 991px){
      padding: 25px !important;
    }
  }
  figure{
    margin-bottom: 30px;
    img{
      width: 100%;
    }
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 20px;
    color: ${({ theme }) => theme['dark-color']};
  }
  button{
    padding: 0 30px;
    border-radius: 6px;
    height: 44px;
  }
`;

const FaqWrapper = Styled.div`
  .ant-card{
    .ant-card-body{
      h1{
        font-weight: 500;
      }
    }
  }
  .ant-collapse{
    margin-top: 25px;
    &.ant-collapse-borderless{
      background: #fff;
    }
    &.ant-collapse-icon-position-left{
      .ant-collapse-header{
        color: ${({ theme }) => theme['dark-color']} !important;
      }
    }
  }
  .ant-collapse-item{
    background: white !important;
    border: 1px solid ${({ theme }) => theme['border-color-light']} !important;
    &.ant-collapse-item-active{
      box-shadow: 0px 15px 40px ${({ theme }) => theme['light-color']}15;
    }
    .ant-collapse-header{
      font-weight: 500;
      background: white !important;
      font-size: 15px;
      padding: 18px 25px !important;
      border-radius: 5px !important;
      @media only screen and (max-width: 575px){        
        padding: ${({ theme }) => (!theme.rtl ? '15px 45px 15px 15px' : '15px 15px 15px 45px')} !important;
      }
      .ant-collapse-arrow{
        ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: auto !important;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 25px !important;
        top: 22px !important;
        transform: translateY(0) !important;
      }
    }
  }

  .ant-collapse-content{
    box-shadow: 0 15px 40px ${({ theme }) => theme['light-color']}15;
    .ant-collapse-content-box{
      border-top: 1px solid ${({ theme }) => theme['border-color-light']} !important;
      padding: 20px 25px 30px !important;
      P{
        font-size: 15px;
        margin-bottom: 35px;
        line-height: 1.667;
        color: ${({ theme }) => theme['gray-color']};
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6{
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: ${({ theme }) => theme['dark-color']};
      }
      .panel-actions{
        button{
          height: 36px;
          padding: 0 15px;
          &:not(:last-child){
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
          }
        }
      }
    }
  }
`;

const SearchResultWrapper = Styled.div`
  .ant-select{
    @media only screen and (max-width: 575px){
      width: 100% !important;
    }
  }
  .ant-select-selector{
    height: 48px !important;
    .ant-select-selection-search{
      height: 48px;
      width: 100% !important;
      input{
        height: 46px !important;
      }
    }
    .ant-input-affix-wrapper{
      border: 0 none;
    }
    .ant-select-selection-search-input {
      border-radius: 100px;
    }
  }
  .search-filter-menu{
    margin: 22px 0 20px;
    @media only screen and (max-width: 575px){
      text-align: center;
    }
    ul{
      li{
        display: inline-block;
        margin-bottom: 10px;
        &:not(:last-child){
          ${({ theme }) => (!theme.rtl ? 'margin-right' : 'margin-left')}: 10px;
        }
        a{
          font-size: 13px;
          font-weight: 500;
          display: block;
          padding: 5px 15px;
          border-radius: 5px;
          color: ${({ theme }) => theme['light-color']};
          box-shadow: 0 3px 6px ${({ theme }) => theme['light-color']}05;
          background: #fff;
          &.active{
            color: #fff;
            background: ${({ theme }) => theme['primary-color']};
          }
        }
      }
    }
  }
`;

const ResultList = Styled.div`
  .result-list-top{
    max-width: 1000px;
    border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
    margin-bottom: 20px;
    padding-bottom: 24px;
  }
  .search-found-text{
    font-size: 16px;
    margin-bottom: 0;
    color: ${({ theme }) => theme['light-color']};
    .result-count{
      ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 5px;
    }
    .result-keyword{
      ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 4px;
    }
    .result-count,
    .result-keyword{
      font-weight: 600;
      color: ${({ theme }) => theme['dark-color']};
    }
  }
  .result-limit{
    text-align: ${({ theme }) => (!theme.rtl ? 'right' : 'left')};
    margin-bottom: 0;
    color: ${({ theme }) => theme['light-color']};
    @media only screen and (max-width: 767px){
      text-align: ${({ theme }) => (theme.rtl ? 'right' : 'left')};
      margin-top: 10px;
    }
  }
  .result-list-content{
    border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
    padding-bottom: 14px;
    margin-bottom: 30px;
    ul{
      li{
        &:not(:last-child){
          margin-bottom: 35px;
        }
        .result-list-title{
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 10px;
          .search-keyword{
            font-weight: 600;
            color: ${({ theme }) => theme['primary-color']};
          }
        }
        p{
          color: ${({ theme }) => theme['gray-color']};
        }
      }
    }
  }
  .ant-pagination{
    @media only screen and (max-width: 575px){
      text-align: center;
    }
  }
`;

const MaintananceWrapper = Styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  text-align: center;
  img{
    margin-bottom: 72px;
    max-width: 400px;
    width: 100%;
    @media only screen and (max-width: 575px){
      margin-bottom: 30px;
    }
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 15px;
  }
  p{
    color: ${({ theme }) => theme['gray-color']};
  }
`;

const ErrorWrapper = Styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  text-align: center;
  img{
    margin-bottom: 100px;
    max-width: 400px;
    width: 100%;
    @media only screen and (max-width: 575px){
      margin-bottom: 30px;
    }
  }
  .error-text{
    font-size: 60px;
    font-weight: 600;
    margin-bottom: 35px;
    color: ${({ theme }) => theme['extra-light-color']};
  }
  p{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 26px;
  }
  button{
    height: 44px;
  }
`;

const ComingsoonStyleWrapper = Styled.div`
  text-align: center;
  background: #fff;
  padding: 75px 0 30px;
  margin-bottom: 30px;
  @media only screen and (max-width: 1150px){
    padding: 50px 0 6px;
  }
  @media only screen and (max-width: 991px){
    padding: 20px 0 0px;
  }
  .strikingDash-logo{
    margin-bottom: 55px;
    @media only screen and (max-width: 1150px){
      margin-bottom: 30px;
    }
    @media only screen and (max-width: 767px){
      margin-bottom: 25px;
    }
    img{
      max-width: 170px;
    }
  }
  .coming-soon-content{
    h1{
      font-size: 58px;
      font-weight: 600;
      line-height: 1.5;
      margin-bottom: 25px;
      color: ${({ theme }) => theme['dark-color']};
      @media only screen and (max-width: 991px){
        font-size: 48px;
        margin-bottom: 15px;
      }
      @media only screen and (max-width: 767px){
        font-size: 40px;
        line-height: 1.45;
      }
      @media only screen and (max-width: 479px){
        font-size: 30px;
      }
      @media only screen and (max-width: 375px){
        font-size: 20px;
      }
    }
    p{
      font-size: 17px;
      max-width: 580px;
      margin: 0 auto 25px;
      color: ${({ theme }) => theme['gray-color']};
      @media only screen and (max-width: 991px){
        margin-bottom: 15px;
      }
      @media only screen and (max-width: 767px){
        font-size: 16px;
      }
      @media only screen and (max-width: 375px){
        font-size: 15px;
      }
    }
  }
  .countdwon-data{
    display: flex;
    justify-content: center;
    >span{
      &:not(:last-child){
        margin-right: 50px;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 50px;
        @media only screen and (max-width: 575px){
          margin-right: 20px;
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 20px;
        }
      }
    }
  }
  .strikingDash-countdown{
    .countdown-time{
      font-size: 42px;
      font-weight: 600;
      line-height: 1.45;
      color: ${({ theme }) => theme['dark-color']};
      @media only screen and (max-width: 991px){
        font-size: 32px;
      }
      @media only screen and (max-width: 575px){
        font-size: 26px;
      }
      @media only screen and (max-width: 375px){
        font-size: 20px;
      }
    }
    .countdown-title{
      font-size: 16px;
      font-weight: 400;
      display: block;
      color: ${({ theme }) => theme['gray-color']};
      @media only screen and (max-width: 375px){
        font-size: 15px;
      }
    }
  }
  .subscription-form{
    margin-top: 40px;
    @media only screen and (max-width: 991px){
      margin-top: 25px;
    }
    @media only screen and (max-width: 1150px){
      margin-top: 35px;
    }
    .subscription-form-inner{
      display: flex;
      justify-content: center;
      @media only screen and (max-width: 375px){
        flex-flow: column;
        margin-bottom: 20px;
      }
      .ant-form-item-control-input{
        margin-right: 20px;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 20px;
        @media only screen and (max-width: 375px){
          margin-right: 0;
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0;
        }
        .ant-input{
          min-width: 320px;
          padding: 12px 20px;
          @media only screen and (max-width: 767px){
            min-width: 100%;
          }
          &::placeholder{
            color: ${({ theme }) => theme['extra-light-color']};
          }
        }
      }
      button{
        font-size: 14px;
        text-transform: uppercase;
        font-weight: 500;
      }
    }
  }
  .coming-soon-social{
    margin-top: 50px;
    @media only screen and (max-width: 1150px){
      margin-top: 25px;
    }
    @media only screen and (max-width: 767px){
      margin-top: 30px;
    }
    ul{
      margin-bottom: 30px;
      li{
        display: inline-block;
        &:not(:last-child){
          margin-right: 15px;
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
        }
        a{
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          i,
          span,
          svg{
            color: #fff;
          }
          &.facebook{
            background-color: #3B5998;
          }
          &.twitter{
            background-color: #1DA1F2;
          }
          &.globe{
            background-color: #DD3E7C;
          }
          &.github{
            background-color: #23282D;
          }
        }
      }
    }
    p{
      font-size: 14px;
      color: ${({ theme }) => theme['light-color']};
    }
  }
`;

const AddUser = Styled.div`
  .form-title{
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 36px;
  }
  .add-user-wrap{
   $: 
  }
  .add-user-bottom{
    margin-top: 20px;
    button + button{
      ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
    }
    .ant-btn-light{
      background: ${({ theme }) => theme['bg-color-light']};
      border: 1px solid #F1F2F6;
    }
    &.text-right{
      @media only screen and (max-width: 767px){
        text-align: ${({ theme }) => (!theme.rtl ? 'left' : 'right')} !important;
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
          ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 26px;
          @media only screen and (max-width: 575px){
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0;
          }
        }
        a{
          position: relative;
          padding: 22px 0;
          font-size: 14px;
          font-weight: 500;
          color: ${({ theme }) => theme['gray-color']};
          @media only screen and (max-width: 575px){
            padding: 0;
          }
          &:after{
            position: absolute;
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
            bottom: -4px;
            width: 100%;
            height: 2px;
            border-radius: 4px;
            content: '';
            opacity: 0;
            visibility: hidden;
            background-color: ${({ theme }) => theme['primary-color']};
            @media only screen and (max-width: 575px){
              display: none;
            }
          }
          &.active{
            color: ${({ theme }) => theme['primary-color']};
            &:after{
              opacity: 1;
              visibility: visible;
            }
            svg,
            img,
            i,
            span{
              color: ${({ theme }) => theme['primary-color']};
            }
          }
          svg,
          img,
          i,
          span{
            color: ${({ theme }) => theme['light-color']};
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
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
      ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 85px;
      bottom: 5px;
      z-index: 10;
      background-color: ${({ theme }) => theme['white-color']};
      span{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        z-index: -1;
        background-color: ${({ theme }) => theme['primary-color']};
      }
      svg,
      i,
      span{
        color: ${({ theme }) => theme['white-color']};
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
      ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 20px;
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
      color: ${({ theme }) => theme['gray-color']};
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
          ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0;
        }
      }
    }
    .ant-input-prefix{
      position: relative;
      ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -11px;
      span{
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        width: 100%;
        height: 100%;
        background-color: ${({ theme }) => theme['primary-color']};
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

const UserBioBox = Styled.div`
    .ant-card-body{
        padding: 25px 0 25px 0 !important;
    }
    
    .user-info{
        margin-bottom: 22px;
        padding: 0 25px 22px 25px;
        border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
        &:last-child{
            border-bottom: 0;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .user-info__title{
            font-size: 12px;
            color: ${({ theme }) => theme['light-color']};
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        p{
            font-size: 15px;
            line-height: 1.667;
            color: ${({ theme }) => theme['gray-color']};
            &:last-child{
                margin-bottom:0;
            }
        }
        .user-info__contact{
            li{
                display: flex;
                align-items: center;
                &:not(:last-child){
                    margin-bottom: 14px;
                }
                svg,
                i,
                img{
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 12px;
                    color: ${({ theme }) => theme['light-color']};
                }
                span{
                    font-size: 14px;
                    color: ${({ theme }) => theme['gray-color']};
                }
            }
        }

        .user-info__skills{
            margin: -3px;
            .btn-outlined{
                margin: 3px !important;
                font-size: 11px;
                height: 25px;
                padding: 0px 8.75px;
                text-transform: uppercase;
                border-radius: 5px;
                border-color: ${({ theme }) => theme['border-color-normal']};
                margin: ${({ theme }) => (theme.rtl ? '0 0 10px 10px' : '0 10px 10px 0')};
                color: ${({ theme }) => theme['gray-color']} !important;
            }
        }
        .card__social{
            a{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                box-shadow: 0 5px 15px ${({ theme }) => theme['light-color']}20;
                &:not(:last-child){
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
                }
                &.facebook{
                    span{
                        color: #3B5998;
                    }
                }
                &.twitter{
                    span{
                        color: #1DA1F2;
                    }
                }
                &.dribble{
                    span{
                        color: #C2185B;
                    }
                }
                &.instagram{
                    span{
                        color: #FF0300;
                    }
                }
            }
        }
    }
    
`;

const WizardWrapper = Styled.div`
    // padding: 25px 0;
    color:#eee;
    &.bordered-wizard{
        padding: 0;
    }
    .steps-action button.btn-next svg {
        ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 10px;
        transform: rotateY(${({ theme }) => (theme.rtl ? '180deg' : '0deg')})
    }
    .steps-action button.btn-prev svg {
        ${({ theme }) => (!theme.rtl ? 'margin-right' : 'margin-left')}: 10px;
        transform: rotateY(${({ theme }) => (theme.rtl ? '180deg' : '0deg')})
    }
    .ant-steps {
        @media only screen and (max-width: 767px) {
            flex-flow: column;
            align-items: center;
        }
        @media only screen and (max-width: 480px) {
            align-items: flex-start;
        }
    }
    .ant-steps-item-container{
        display: flex;
        flex-flow: column;
        align-items: center;
        width: 50%;
        ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 15px;
        @media only screen and (max-width: 991px) {
            width: 100%;
            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0;
        }
        @media only screen and (max-width: 767px) {
            font-size: 15px;
        }
        @media only screen and (max-width: 480px) {
            flex-flow: row;
        }
        .ant-steps-item-tail{
            @media only screen and (max-width: 480px) {
                background: #C5CAE1;
                top: 35px !important;
                padding: 20px 0 8px !important;
            }
        }
        .ant-steps-item-content{
            @media only screen and (max-width: 480px) {
                min-height: auto !important;
                padding-right: 16px;
            }
        }
    }
    .steps-content{
        margin-top: 72px !important;
        @media only screen and (max-width: 1599px) {
            min-height: 252px !important;
        }
        @media only screen and (max-width: 1199px) {
            margin-top: 45px !important;
        }
        @media only screen and (max-width: 575px) {
            margin-top: 30px !important;
        }
    }
    .ant-steps-item-container{
        position: relative;
        &:after{
            position: absolute;
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 100%;
            top: 20px;
            color: #333;
            background-image: url(${require('../static/img/progress.svg')});
            width: 114%;
            height: 6px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: transparent !important;
            content: '';
            @media only screen and (max-width: 1399px) {
                width: 120%;
            }
            @media only screen and (max-width: 991px) {
                display: none;
            }
        }
        .ant-steps-item-tail{
            &:after{
                height: 80%;
            }
        }
    }
    .wizard-step-item{
        .ant-steps-item-container{
            &:after{
                background-image: url(${require('../static/img/progress.svg')});
            }
        }
    }
    .wizard-steps-item-active{
        .ant-steps-item-container{
            &:after{
                background-image: url(${require('../static/img/progress-active.svg')});
            }
        }
    }
    .success-step-item{
        .ant-steps-item-container{
            &:after{
                background-image: url(${require('../static/img/progress-success.svg')});
            }
        }
    }
    .ant-steps-item{
        padding: ${({ theme }) => (theme.rtl ? '0 0 0 25px !important' : '0 25px 0 0 !important')} ;
        @media only screen and (max-width: 767px) {
            padding: 0 !important;
            &:not(:last-child){
                margin-bottom: 20px;
            }
        }
        &:last-child{
            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 15px !important;
            @media only screen and (max-width: 767px) {
                padding: 0 !important;
            }
            .ant-steps-item-container{
                &:after{
                    display: none;
                }
            }
        }
        &:last-child{
            @media only screen and (max-width: 991px) {
                flex: 1 1;
            }
        }
        .ant-steps-item-title{
            font-size: 15px;
            font-weight: 500;
            margin-top: 8px;
            padding: ${({ theme }) => (theme.rtl ? '0 10px 0 0' : '0 0 0 10px')};
            
            color: ${({ theme }) => theme['gray-solid']} !important;
            @media only screen and (max-width: 1210px) {
                padding: ${({ theme }) => (!theme.rtl ? '0 0 0 20px' : '0 20px 0 0')};
            }
            @media only screen and (max-width: 767px) {
                padding: 0;
            }
            &:after{
                display: none;
                @media only screen and (max-width: 991px) {
                    display: none;
                }
            }
        }
        .ant-steps-item-icon{
            width: 50px;
            height: 50px;
            line-height: 50px;
            border: 0 none;
            box-shadow: 10px 0 20px ${({ theme }) => theme['gray-solid']}15;
            @media only screen and (max-width: 767px) {
                ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0;
                width: 35px;
                height: 35px;
                line-height: 35px;
            }
            .ant-steps-icon{
                font-size: 16px;
                font-weight: 500;
                color: ${({ theme }) => theme['dark-color']};
                @media only screen and (max-width: 767px) {
                    font-size: 15px;
                }
            }
        }
        &.ant-steps-item-active{
            .ant-steps-item-icon{
                .ant-steps-icon{
                    color: #fff;
                }
            }
            .ant-steps-item-title{
                color: ${({ theme }) => theme['dark-color']} !important;
            }
            &.ant-steps-item-finish{
                .ant-steps-item-title{
                    color: ${({ theme }) => theme['light-color']} !important;
                }
            }
        }
        &.ant-steps-item-finish{
            // .ant-steps-item-container{
            //     &:after{
            //         background-image: url(${require('../static/img/progress-active.svg')});
            //     }
            // }
            // .ant-steps-item-title{
            //     color: ${({ theme }) => theme['dark-color']} !important;
            //     &:after{
            //         background-image: url(${require('../static/img/progress-active.svg')});
            //     }
            // }
            .ant-steps-item-icon{
                background: ${({ theme }) => theme['success-color']} !important;
                .ant-steps-icon{
                    color: #fff;
                }
            }
        }
    }
    .basic-form-inner{
        width: 580px;
        @media only screen and (max-width: 575px){
            width: 100%
        }
        .ant-input-password.ant-input-affix-wrapper{
            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0;
        }
        .ant-form-item-label{
            label{
                font-weight: 400;
                color: ${({ theme }) => theme['dark-color']};
            }
        }
        .ant-form-item-control-input{
            .ant-input{
                padding: 12px 20px;
            }
        }
    }
    .steps-action{
        .btn-next{
            &:focus{
                background-color: ${({ theme }) => theme['primary-color']};
            }
        }
    }
    .atbd-form-checkout{
        .ant-input-affix-wrapper-rtl{
            input[type="password"]{
                ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 15px;
            }
        }
       h1{
            // font-size: 20px;
            // font-weight: 500;
            margin-bottom: 26px;
            color: ${({ theme }) => theme['dark-color']};
            @media only screen and (max-width: 991px){
                font-size: 18px;
                margin-bottom: 22px;
            }
            @media only screen and (max-width: 479px){
                font-size: 16px;
            }
       }
       .ant-form-item-label{
           label{
               font-size: 15px;
           }
       }
       input::placeholder{
        color: ${({ theme }) => theme['extra-light-color']};
       }
       .input-message{
           margin-top: -6px;
           display: inline-block;
           font-size: 13px;
           color: ${({ theme }) => theme['gray-solid']};
       }

       .shipping-selection{
           > .ant-card{
               .ant-card-body{
                    border: 1px solid ${({ theme }) => theme['border-color-light']};
               }
           }
           .ant-card{
               .ant-card{
                   margin-bottom: 0 !important;
               }
           }
           .ant-radio-group {
               .ant-radio-wrapper{
                    display: flex;
                    align-items: flex-start;
                    span + span{
                        width: 100%;
                        min-height: 60px;
                    }
                   .ant-radio{
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
                    }
               }
           }
           .ant-form-item-control-input-content{
                input{
                    @media only screen and (max-width: 479px) {
                        width: 100% !important;
                        margin-bottom: 6px;
                    }
                }
               .input-leftText{
                   ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
                   @media only screen and (max-width: 479px) {
                        display: block;
                        ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 0px;
                    }
               }
           }
           .shipping-selection__card{
               .ant-card .ant-card{
                   border: 0 none;
                   border-radius: 20px;
                   box-shadow: 0 10px 30px ${({ theme }) => theme['light-color']}10;
               }
               .ant-radio-wrapper{
                    .ant-radio{
                        margin-top: 30px;
                    }
                    span + span{
                        padding: 0;
                    }
               }
               .cvv-wrap{
                   input{
                       max-width: 120px;
                   }
                   .input-leftText{
                       color: ${({ theme }) => theme['color-info']};
                   }
               }
            }
           .shipping-selection__paypal{
               margin-bottom: 20px;
               .ant-radio-wrapper{
                   span + span{
                       display: flex;
                       justify-content: space-between;
                       @media only screen and (max-width: 375px){
                            img{
                                display: none;
                            }
                        }
                   }
               }
           }
           .shipping-selection__paypal,
           .shipping-selection__cash{
                .ant-radio-wrapper{
                    align-items: center;
                    span + span{
                        font-size: 15px;
                        font-weight: 500;
                        padding: 0 25px;
                        display: flex;
                        align-items: center;
                        border-radius: 10px;
                        border: 1px solid ${({ theme }) => theme['border-color-normal']};
                    }
                }
           }
           .supported-card{
               align-items: center;
               justify-content: space-between;
               margin-bottom: 20px;
                @media only screen and (max-width: 479px) {
                    flex-flow: column;
                }
               .supported-card_logos{
                    @media only screen and (max-width: 479px) {
                        margin-top: 12px;
                    }
                   img + img{
                       ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
                   }
               }
           }
       }
   }
   .profile-hints{
       p{
        color: ${({ theme }) => theme['dark-color']};
           font-size: 15px;
           span{
               color: ${({ theme }) => theme['extra-light-color']};
           }
       }
   }
   .atbd-finish-order{
       max-width: 540px;
       margin: 0 auto;
       padding: 30px;
       min-height: 248px;
       border-radius: 6px;
       border: 1px solid ${({ theme }) => theme['bg-color-deep']};
       h1,
       h2,
       h3,
       h4,
       h5,
       h6{
            margin-bottom: 16px;
            color: ${({ theme }) => theme['darks-color']};
       }
       .ant-checkbox{
           &:hover{
               .ant-checkbox-inner{
                    border-color: ${({ theme }) => theme['success-color']};
               }
           }
       }
       .ant-checkbox-checked{
           &:after{
                border-color: ${({ theme }) => theme['success-color']};
           }
           .ant-checkbox-inner{
                background-color: ${({ theme }) => theme['success-color']};
                border-color: ${({ theme }) => theme['success-color']};
           }
       }
       .ant-checkbox-input{
           &:focus + .ant-checkbox-inner{
            border-color: ${({ theme }) => theme['success-color']};
           }
       }
       .checkbox-label{
            ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 10px;
            font-size: 15px;
            color: ${({ theme }) => theme['extra-light-color']};
       }
   }
   .atbd-review-order{
       > .ant-card{
           > .ant-card-body{
               border: 1px solid ${({ theme }) => theme['border-color-light']};
           }
       }
       h1{
           font-size: 20px;
           font-weight: 500;
           margin-bottom: 45px;
           @media only screen and (max-width: 479px) {
                font-size: 16px;
                margin-bottom: 25px;
            }
       }

       .atbd-review-order__single{
           .ant-radio-wrapper{
                display: flex;
                align-items: flex-start;
            }
            .ant-card{
                .ant-card-body{
                    padding: 30px !important;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px ${({ theme }) => theme['gray-solid']}10;
                }
            }
            h1{
                font-size: 18px;
                font-weight: 400;
                margin-bottom: 30px;
            }
            .method-info{
                margin-top: -2px;
                font-weight: 500;
                color: color: ${({ theme }) => theme['dark-color']};
                img{
                    margin-top: -4px;
                    max-width: 40px;
                }
            }
            .btn-addCard{
                font-weight: 500
                display: inline-block;
                font-size: 13px;
                margin-top: 20px;
                color: ${({ theme }) => theme['info-color']};
            }

            .table-cart{
                border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
                .cart-single-t-price{
                    color: ${({ theme }) => theme['gray-color']};
                }
                .ant-table-content{
                    padding-bottom: 10px;
                }
                thead{
                    display: none;
                }
                .ant-table-tbody{
                    .ant-table-row{
                        &:hover{
                            box-shadow: 0 0;
                        }
                    }
                    >tr >td{
                        padding: 8px 15px;
                        &:first-child{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0px;
                        }
                        &:last-child{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0px;
                            text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
                        }
                    }
                }
            }
            .cart-single{
                .cart-single__info{
                    h1{
                        color: ${({ theme }) => theme['dark-color']};
                        margin-bottom: 8px;
                    }
                }
            }
       }

        .atbd-review-order__shippingTitle{
            h1{
                display: flex;
                margin-bottom: 30px;
                justify-content: space-between;
                color: ${({ theme }) => theme['gray-color']};
                @media only screen and (max-width: 479px) {
                    flex-flow: column;
                }
                a{
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    @media only screen and (max-width: 479px) {
                        margin-top: 12px;
                    }
                    svg{
                        width: 14px;
                        height: 14px;
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 4px;
                    }
                }
            }
        }

        .atbd-review-order__shippingInfo{
            .shipping-info-text{
                margin: -4px 12px 0;
                h1{
                    font-size: 15px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }
                p{
                    font-size: 15px;
                    color: ${({ theme }) => theme['gray-color']};
                }
            }
            .btn-addNew{
                font-size: 13px;
                font-weight: 500;
                color: ${({ theme }) => theme['info-color']};
            }
        }
   }
   .invoice-summary-inner{
        .summary-total{
            margin-bottom: 0;
        }
   }
   .summary-list{
        margin: 20px 0 10px !important;
        .summary-list-text{
            font-size: 15px;
            color: ${({ theme }) => theme['gray-color']};
        }
        li{
            &:not(:last-child){
                margin-bottom: 10px;
            }
        }
   }

   .checkout-successful{
       text-align: center;
        > .ant-card{
            > .ant-card-body{
                border: 1px solid ${({ theme }) => theme['border-color-light']};
            }
        }
        .ant-card {
            box-shadow: 0 10px 30px ${({ theme }) => theme['light-color']}10;
            .ant-card{
                padding: 25px;
                    margin-bottom: 0 !important;
            }
        }
        .icon-success{
            width: 34px;
            height: 34px;
            margin: 0 auto 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            background: ${({ theme }) => theme['success-color']};
            svg{
                width: 18px;
            }
        }
        h1{
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 16px;
        }
        p{
            margin-bottom: 0;
            color: ${({ theme }) => theme['gray-color']};
        }
   }
`;

const AddBusiness = AddUser;

const ChangelogWrapper = Styled.div`
   .ant-card-head{
     .ant-card-head-title{
       .v-num{
        $: 0;
         font-size: 18px;
         color: ${({ theme }) => theme['dark-color']};
       }
       .sign{
         font-size: 18px;
         color: ${({ theme }) => theme['dark-color']};
         display: inline-block;
         margin: 0 8px;
       }
       .rl-date{
        $: 0;
         font-weight: 400;
         font-size: 16px;
       }
     }
   }
  .version-list{
    .version-list__single{
      &:not(:last-child){
        margin-bottom: 30px;
      }
      ul{
        li{
          position: relative;
          ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 20px;
          font-size: 16px;
          color: ${({ theme }) => theme['gray-color']};
          &:not(:last-child){
            margin-bottom: 12px;
          }
          &:after{
            position: absolute;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            content: "";
          }
        }
        &.version-primary{
          li{
            &:after{
              background-color: ${({ theme }) => theme['primary-color']};
            }
          }
        }
        &.version-success{
          li{
            &:after{
              background-color: ${({ theme }) => theme['success-color']};
            }
          }
        }
        &.version-info{
          li{
            &:after{
              background-color: ${({ theme }) => theme['info-color']};
            }
          }
        }
      }
    }
    .version-list__top{
      .badge{
        font-size: 12px;
        line-height: 1.2;
        letter-spacing: 1.4px;
        font-weight: 500;
        display: inline-block;
        padding: 5px 8px;
        height: auto;
        border-radius: 4px;
        margin-bottom: 14px;
        color: #fff;
        &.badge-primary{
          background-color: ${({ theme }) => theme['primary-color']};
        }
        &.badge-info{
          background-color: ${({ theme }) => theme['info-color']};
        }
        &.badge-success{
          background-color: ${({ theme }) => theme['success-color']};
        }
      }
    }
  }

  .changelog-accordion{
    margin-top: 30px;
    .ant-collapse{
      background-color: transparent;
      border: 0 none;
    }
    .ant-collapse-item{
      border-radius: 6px;
      border: 1px solid ${({ theme }) => theme['border-color-normal']};
      &:not(:last-child){
        margin-bottom: 20px;
      }
      &:last-child{
        border-radius: 6px;
        .ant-collapse-header{
          border-radius: 6px;
        }
      }
    }
    .ant-collapse-header{
      border-radius: 6px;
      padding: 20px 30px 18px 30px !important;
      @media only screen and (max-width: 575px){
        padding: 16px 20px 14px 20px !important;
      }
      .ant-collapse-arrow{
        left: auto !important;
        right: 30px;
        svg,
        img{
          width: 14px;
        }
      }
      .v-num{
        font-size: 18px;
        font-weight: 500;
        color: ${({ theme }) => theme['dark-color']};
        @media only screen and (max-width: 575px){
          font-size: 16px;
        }
      }
      .rl-date{
        font-size: 16px;
        font-weight: 400;
        @media only screen and (max-width: 575px){
          font-size: 14px;
        }
      }
    }
    .ant-collapse-content{
      border-radius: 0 0 6px 6px;
      > .ant-collapse-content-box{
        padding: 30px 30px 25px;
      }
    }
  }
`;
const VersionHistoryList = Styled.div`
  .history-title{
    font-size: 11px;
    margin-bottom: 24px;
    color: ${({ theme }) => theme['light-gray-color']};
  }
  .v-history-list{
    li{
      display: flex;
      justify-content: space-between;
      &:not(:last-child){
        margin-bottom: 24px;
      }
      .version-name{
        font-size: 14px;
        font-weight: 500;
        color: ${({ theme }) => theme['dark-color']};
      }
      .version-date{
        font-size: 14px;
        color: ${({ theme }) => theme['light-gray-color']};
      }
    }
  }
`;

const WizardFour = Styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    @media (max-width: 991px){
        flex-flow: column;
        align-items: center;
    }
    .ant-steps-item-container{
        position: relative
        display: flex;
        flex-flow: row;
        width: 100%;
        ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 0;
        @media (max-width: 767px){
            flex-flow: column;
        }
        &:after{
            display: none;
        }
        .ant-steps-item-tail{
            display: none !important;
            &:after{
                display: none;
            }
        }
    }
    .ant-steps-item:last-child {
        ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 0 !important;
    }
    .ant-steps {
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 30px;
        min-width: 300px;
        flex-direction: column;
        @media (max-width: 991px){
            min-width: auto;
            margin: 0 0 25px 0;
        }
        @media (max-width: 575px){
            align-items: flex-start;
        }
        
        &.ant-steps-vertical{
            flex: 1;
            padding: 30px;
            border-radius: 6px;
            border: 1px solid ${({ theme }) => theme['bg-color-deep']};
            max-width: 300px;
            .ant-steps-item-icon{
                ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0 !important;
            }
            .ant-steps-item {
                ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 0;
                &:not(:last-child){
                    margin-bottom: 30px;
                    @media (max-width: 767px){
                        margin-bottom: 15px;
                    }
                }
                &.ant-steps-item-wait{
                    .ant-steps-item-icon{
                        background-color: ${({ theme }) => theme['extra-light-color']}50;
                        box-shadow: 0 0;
                        .ant-steps-icon{
                            color: #fff;
                        }
                    }
                }
            }
            .ant-steps-item-content{
                ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0 !important;
            }
        }
    }
    
    .create-account-form{
        padding: 30px;
        // border-radius: 6px;
        // border: 1px solid ${({ theme }) => theme['bg-color-deep']};
    }
    .atbd-finish-order{
        max-width: 100%;
    }
    .steps-wrapper{
        width: 100%;
        max-width: 580px;
    }
    .steps-content{
        margin-top: 0 !important;
        justify-content: flex-start !important;
    }
    .step-action-wrap{
        .step-action-inner{
            padding: 0 !important;
        }
    }
`;

const HorizontalFormStyleWrap = Styled.div`
    .ant-card{
        margin-bottom: 25px
    }
    .ant-form-horizontal{
        label{
            display: inline-block;
            font-weight: 500;
            margin-bottom: 24px;
            @media only screen and (max-width: 767px) {
                margin-bottom: 12px;
            }
        }
        .ant-form-item{
            margin-bottom: 25px !important;
        }
        .ant-input-affix-wrapper > input.ant-input{
            padding-top: 12px;
            padding-bottom: 12px;
        }
        .ant-input-affix-wrapper .ant-input-prefix svg{
            color: ${({ theme }) => theme['gray-color']};
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
            .ant-btn-light{
                background-color: #F8F9FB;
            }
        }
    }
    &.sDash_input-form{
        .ant-picker{
            width: 100%;
            &:focus{
                outline: none;
                box-shadow: 0 0;
            }
        }
    }
    ant-picker-input{
        &::placeholder{
            color: #9299B8 !important;
        }
    }
`;

const InvoiceLetterBox = Styled.div`
    .invoice-letter-inner{
        background: #F8F9FB;
        padding: 30px 50px 25px;
        border-radius: 20px;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-flex-flow: nowrap;
        justify-content: space-around;
        align-items: center;
        @media print {
            padding: 20px;
        }
        @media only screen and (max-width: 991px){
            flex-flow: column;
        }
        @media only screen and (max-width: 575px){
            padding: 25px;
        }
    }
    .invoice-author{
        @media only screen and (max-width: 991px){
            text-align: center;
        }
        @media print {
            margin-right: 8px;
        }
        .invoice-author__title{
            font-size: 36px;
            font-weight: 600;
            margin-bottom: 16px;
            @media only screen and (max-width: 575px){
                font-size: 30px;
            }
            @media print {
                font-size: 24px;
            }
        }
        p{
            font-size: 15px;
            font-weight: 500;
            margin-bottom: 4px;
            @media print {
                font-size: 14px;
            }
        }
    }
    .invoice-barcode{
        max-width: 310px;
        margin: 0 auto;
        text-align: center;
        border: 1px solid ${({ theme }) => theme['border-color-light']};
        @media only screen and (max-width: 991px){
            margin: 20px auto;
        }
        .ant-card{
            margin-bottom: 0 !important;
        }
        .ant-card-body{
            padding: 20px 20px 16px !important;
            @media print {
                padding: 15px !important;
            }
            img{
                @media print {
                    max-width: 180px;
                }
            }
        }
        p{
            margin-bottom: 0;
        }
    }
    .invoice-customer{
        float: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
        text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
        @media only screen and (max-width: 991px){
            float: none;
            text-align: center;
        }
        @media print {
            margin-left: 8px;
        }
        .invoice-customer__title{
            font-size: 15px;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 5px;
            color: ${({ theme }) => theme['dark-color']};
        }
        p{
            font-size: 15px;
            margin-bottom: 0;
            color: ${({ theme }) => theme['gray-color']};
            @media print {
                font-size: 14px;
            }
        }
    }
`;

const FigureWizards = Styled.figure`

    display: inline-flex;
    img {
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
    }
`;

const ProductTable = Styled.div`
    .table-cart{
        .ant-table-content{
            padding-bottom: 10px;
        }
        .ant-table-tbody{
            .cart-single{
                figure{
                    align-items: center;
                    margin-bottom: 0;
                    img{
                        max-width: 80px;
                        min-height: 80px;
                        border-radius: 10px;
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 25px;
                    }
                }
                .cart-single__info{
                    h1,
                    h2,
                    h3,
                    h4,
                    h5,
                    h6{
                        font-size: 15px;
                        font-weight: 500;
                    }
                    p{
                        margin-bottom: 0;
                    }
                }
            }
            .ant-table-row{
                &:hover{
                    box-shadow: 0 10px 15px ${({ theme }) => theme['light-color']}15;
                    td{
                        background: #fff !important;
                    }
                    .table-action{
                        button{
                            background: #FF4D4F15;
                            i,
                            svg{
                                color: ${({ theme }) => theme['danger-color']};
                            }
                        }
                    }
                }
            }
        }
    }
    .table-invoice{
        .ant-table table {
            text-align: ${({ theme }) => (theme.rtl ? 'right' : 'left')}
        }
        table{
            thead{
                >tr{
                    th{
                        border-top: 1px solid ${({ theme }) => theme['border-color-light']};
                        border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
                        &:first-child{
                            ${({ theme }) => (!theme.rtl ? 'border-left' : 'border-right')}: 1px solid ${({ theme }) =>
  theme['border-color-light']};
                        }
                        &:last-child{
                            ${({ theme }) => (theme.rtl ? 'border-left' : 'border-right')}: 1px solid ${({ theme }) =>
  theme['border-color-light']};
                            text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
                        }
                    }
                }
            }
            tbody{
                >tr{
                    &.ant-table-row{
                        &:hover{
                            >td{
                                background: #fff;
                            }
                        }
                    }
                    td{
                        border-bottom: 1px solid ${({ theme }) => theme['border-color-light']};
                        color: ${({ theme }) => theme['gray-color']};
                        border-radius: 0 !important;
                        &:last-child{
                            text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
                        }
                        .product-info-title{
                            font-size: 15px;
                            font-weight: 500;
                            color: ${({ theme }) => theme['dark-color']};
                        }
                        .product-unit{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 40px;
                        }
                        .product-quantity{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 50px;
                        }
                    }
                }
            }
        }
        .product-info{
            min-width: 300px;
            .product-info{
                margin-bottom: 8px;
            }
        }
    }
    table{
        thead{
            tr{
                border-radius: 10px;
                th{
                    border-bottom: 0 none;
                    background:  ${({ theme }) => theme['bg-color-light']};
                    &:first-child{
                    border-radius: ${({ theme }) => (theme.rtl ? '0 10px 10px 0' : '10px 0 0 10px')} !important;
                    }
                    &:last-child{
                        border-radius: ${({ theme }) => (!theme.rtl ? '0 10px 10px 0' : '10px 0 0 10px')} !important;
                    }
                }
            }
        }
        tbody{
            tr{
                border-radius: 10px;
                td{
                    border-bottom: 0 none;
                    &:first-child{
                        border-radius: ${({ theme }) => (theme.rtl ? '0 10px 10px 0' : '10px 0 0 10px')};
                    }
                    &:last-child{
                        border-radius: ${({ theme }) => (!theme.rtl ? '0 10px 10px 0' : '10px 0 0 10px')} !important;
                    }
                }
            }
        }

        .info-list{
            li{
                display: inline-block;
                &:not(:last-child){
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 20px;
                }
                span{
                    font-size: 14px;
                    color: ${({ theme }) => theme['gray-color']};
                    &.info-title{
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 5px;
                        font-weight: 500;
                        color: ${({ theme }) => theme['dark-color']};
                    }
                }
            }
        }
        .cart-single-price{
            font-size: 15px;
            color: ${({ theme }) => theme['gray-color']};
        }
        .cart-single-t-price{
            font-size: 15px;
            font-weight: 500;
            color: ${({ theme }) => theme['primary-color']};
            display: inline-block;
            min-width: 80px;
        }
        .cart-single-quantity{
            button{
                background-color: ${({ theme }) => theme['bg-color-normal']};
                i,
                img,
                svg{
                    min-width: 12px;
                    height: 12px;
                }
                &.btn-inc,
                &.btn-dec{
                    width: 36px;
                    height: 36px;
                }
                &.btn-inc{
                    ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 16px;
                    @media only screen and (max-width: 575px){
                        ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
                    }
                }
                &.btn-dec{
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 16px;
                    @media only screen and (max-width: 575px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
                    }
                }
            }
        }
        .table-action{
            text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
            button{
                padding: 0 11px;
                height: 38px;
                background: #fff;
                i,
                svg{
                    color: #707070;
                }
            }
        }
    }
`;

const OrderSummary = Styled.div`
    max-width: 650px;
    margin: 0 auto;
    .ant-card{
        margin-bottom: 0 !important;
    }
    .ant-card-body{
        box-shadow: 0 10px 30px ${({ theme }) => theme['dark-color']}10;
    }
    .ant-form-item{
        margin-bottom: 0;
    }

    .summary-table-title{
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 25px;
        color: ${({ theme }) => theme['dark-color']};
    }
    .order-summary-inner{
        padding-bottom: 5px;
        @media only screen and (max-width: 1599px){
            max-width: 600px;
            margin: 0 auto;
        }
        .ant-select{
            .ant-select-selection-item{
                font-weight: 500;
            }
        }
    }
    .invoice-summary-inner{
        .summary-list{
            margin: 22px 0;
            li{
                &:not(:last-child){
                    margin-bottom: 12px;
                }
            }
        }
        .summary-total-amount{
            color: ${({ theme }) => theme['primary-color']} !important;
        }
    }

    .summary-list{
        li{
            display: flex;
            justify-content: space-between;
            &:not(:last-child){
                margin-bottom: 18px;
            }
            span{
                font-weight: 500;
            }
            .summary-list-title{
                color: ${({ theme }) => theme['gray-color']};
            }
            .summary-list-text{
                color: ${({ theme }) => theme['dark-color']};
            }
        }
    }
    .ant-select-focused.ant-select-single{
        .ant-select-selector{
            box-shadow: 0 0 !important;
        }
    }
    .ant-select-single{
        margin-top: 18px;
        .ant-select-selection-search-input{
            height: fit-content;
        }
        .ant-select-selector{
            padding: 0 !important;
            border: 0 none !important;
            color: ${({ theme }) => theme['success-color']};
        }
        .ant-select-arrow{
            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
        }
    }
    .promo-apply-form{
        display: flex;
        align-items: flex-end;
        margin: 5px 0 18px;
        @media only screen and (max-width: 479px){
            flex-flow: column;
            align-items: flex-start;
        }
        .ant-form-item{
            margin-bottom: 0;
        }
        .ant-row{
            flex: auto;
            flex-flow: column;
        }
        .ant-form-item-label{
            text-align: ${({ theme }) => (!theme.rtl ? 'left' : 'right')};
            label{
                font-weight: 400;
                margin-bottom: 4px;
                height: fit-content;
                color: ${({ theme }) => theme['gray-color']};
            }
        }
        .ant-form-item-control-input-content{
            display: flex;
            @media only screen and (max-width: 479px){
                flex-flow: column;
            }
            input{
                margin: ${({ theme }) => (theme.rtl ? '0 0 0px 6px' : '0 6px 0px 0')};
                height: 40px;
                @media only screen and (max-width: 479px){
                    margin: ${({ theme }) => (theme.rtl ? '0 0 10px 6px' : '0 6px 10px 0')};
                    width: 100% !important;
                }
            }
            button{
                height: 40px;
            }
        }
    }
    .summary-total{
        display: inline-flex;
        justify-content: space-between;
        width: 100%;
        .summary-total-label{
            font-size: 16px;
            font-weight: 500;
            color: ${({ theme }) => theme['dark-color']};
        }
        .summary-total-amount{
            font-size: 18px;
            font-weight: 600;
            color: ${({ theme }) => theme['primary-color']};
        }
    }
    .btn-proceed{
        font-size: 15px;
        font-weight: 500;
        width: 100%;
        height: 50px;
        border-radius: 8px;
        margin-top: 22px;
        @media only screen and (max-width: 575px){
            font-size: 13px;
        }
        a{
            display: flex;
            align-items: center;
        }
        i,
        svg{
            ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 6px;
        }
    }
`;

export {
  Main,
  BasicFormWrapper,
  WizardWrapper,
  WizardFour,
  PricingCard,
  ListGroup,
  Badge,
  GalleryNav,
  UserCard,
  UserBioBox,
  BusinessCard,
  GalleryCard,
  UsercardWrapper,
  UserTableStyleWrapper,
  FaqCategoryBox,
  FaqSupportBox,
  FaqWrapper,
  SearchResultWrapper,
  ResultList,
  MaintananceWrapper,
  ErrorWrapper,
  ComingsoonStyleWrapper,
  HorizontalFormStyleWrap,
  AddUser,
  AddBusiness,
  ChangelogWrapper,
  VersionHistoryList,
  InvoiceLetterBox,
  FigureWizards,
  ProductTable,
  OrderSummary,
};
