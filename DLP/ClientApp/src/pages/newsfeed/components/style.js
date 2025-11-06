import Styled from 'styled-components';

const CreatePost = Styled.div`
    position: relative;
    z-index: 21;
    .ant-card-body{
        padding: 20px 25px 15px!important;
        .postBody{
            display: flex;
            position: relative;
            textarea{
                border: 0 none;
                min-height: 55px;
                resize: none;
                &:focus{
                    outline: none;
                    box-shadow: 0 0 0 0px rgba(95, 99, 242, 0.2);
                }
            }
        }
        .postFooter{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
            border-top: 1px solid #F1F2F6;
            padding-top: 15px;
            .ant-upload{
                margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 8px;
                .ant-btn{
                    height: 30px;
                    font-size: 12px;
                    font-weight: 500;
                    border-radius: 16px;
                    padding: 0 14.5px;
                    color: ${({ theme }) => theme['gray-color']};
                }
            }
            .btn-more{
                padding: 0 16px;
            }
            .postFooter_left{
                display: flex;
            }
            .btn-post{
                height: 35px;
            }
            .btn-post:last-of-type{
                margin-left:15px
            }
        }
    }    
`;

const BackShadow = Styled.div`
    width: 100%;
    height: 100%;
    background: #11121760;
    position: fixed;
    top: 0;
    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
    z-index: -0;
`;
const BackShadowEmoji = Styled.div`
    width: 100%;
    height: 100%;
    background: #11121760;
    position: fixed;
    top: 0;
    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
    z-index: 9999;
`;


const RightAsideWrapper = Styled.div`
    .ant-card-head{
        .btn-seeAll{
            font-size: 13px;
            font-weight: 500;
            color: ${({ theme }) => theme['primary-color']};
        }
    }
    .ant-card-body{
        padding: 0 0 25px !important;
        ul{
            margin: 0;
            padding: 0;
            
            li{
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 25px;
                cursor: pointer;

                &:hover{
                    box-shadow: 0 15px 50px #9299B820;
                }

                div{
                    display: flex;
                    img{
                        width: 46px;
                        height: 46px;
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
                        border-radius: 50%;
                    }
                    p{
                        margin: 0;
                        padding: 0;
                        span{
                            display: block;
                        }
                    }
                }
            }
            .btn-loadMore{
                display: inline-block;
                margin-top: 10px;
                font-size: 13px;
                font-weight: 500;
                padding: 0 25px;
            }
        }
    }
    .ff-widget{
        li{
            @media only screen and (max-width: 1599px){
                flex-flow: column;
                padding: 20px !important;
                align-items: flex-start !important;
                display: flex;
                flex-direction: row;
            }
            .ff-info{
                @media only screen and (max-width: 1199px){
                    flex-flow: column;
                }
                @media only screen and (max-width: 767px){
                    flex-flow: row;
                }
                p{
                    font-size: 14px;
                    font-weight: 600;
                    color: ${({ theme }) => theme['dark-color']};
                    @media only screen and (max-width: 1199px){
                        margin-top: 12px;
                    }
                    @media only screen and (max-width: 767px){
                        margin-top: 0;
                    }
                    span{
                        margin-top: 3px;
                        font-weight: 400;
                        color: ${({ theme }) => theme['light-color']};
                    }
                }
            }
            .btn-ff{
                font-size: 12px;
                font-weight: 500;
                padding: 0 12.88px;
                @media only screen and (max-width: 1599px){
                    margin-top: 15px;
                }
                svg,
                i,
                img{
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 6px;
                }
            }
        }
    }
    .widget-photo-list,
    .widget-video-list{
        padding: 20px 25px 0;
        .ant-row{
            margin: -4px 0;
            .ant-col{
                margin: 4px 0;
            }
        }
        img{
            max-width: 103px;
            border-radius: 6px;
        }
    }

    .widget-video-list{
        .video{
            display: inline-block;
            position: relative;
            z-index: 4;
            &:after{
                position: absolute;
                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
                top: 0;
                width: 100%;
                height: 100%;
                content: '';
                border-radius: 6px;
                background-color: ${({ theme }) => theme['dark-color']}20;
            }
            span{
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
                z-index: 5;
                background-color: ${({ theme }) => theme['dark-color']}60;
                svg,
                img,
                i{
                    width: 14px;
                    color: #fff;
                }
            }
        }
    }
`;


const PostComment = Styled.div`
.commentArea{
  display: flex;
  align-items: center;
  
  @media only screen and (max-width: 991px){
      flex-flow: column;
      align-items: flex-start;
  }
  .comment-form{
      flex: auto;
      position: relative;
      display: flex;
      align-items: center;
      margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 10px;
      @media only screen and (max-width: 991px){
          flex-flow: column;
          align-items: flex-start;
          width: 100%;
          margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 0;
          margin-bottom: 15px;
      }
      img{
          max-width: 36px;
          margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 10px;
          border-radius: 50%;
          @media only screen and (max-width: 991px){
              margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 0;
              margin-bottom: 15px;
          }
      }
      textarea{
          padding: 14px 22px;
          height: 50px;
          border: 0 none;
          border-radius: 25px;
          background-color: #F4F5F7;
          resize: none;
      }
  }
  .btn-send{
      padding: 0;
      height: 50px;
      width: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px #5F63F220;
      @media only screen and (max-width: 991px){
          width: 35px;
          height: 35px;
      }
      svg,
      i,
      img{
          width: 16px;
          color: #fff;
          @media only screen and (max-width: 991px){
              width: 14px;
          }
      }
  }`;

const AllPosts = Styled.div`     
    .ant-card-body{
        padding: 20px 0 !important;
    }    
    .ant-collapse-header{
        background-color: white !important;
        font-weight:500
    }
    .post-content{
        .gallery{
            padding: 0 25px;
            img{
                margin-bottom: 10px;
                border-radius: 8px;
            }
        }
        .post-text{
            border-bottom: 1px solid #F1F2F6;
            padding: 0 25px 20px 25px;
            p{
                font-size: 15px;
                color: ${({ theme }) => theme['gray-color']};
                &:last-child{
                    margin-bottom: 0;
                }
            }
        } 
        .post-actions{
            padding: 0 25px 20px 25px;
            margin-bottom: 20px;
            border-bottom: 1px solid #F1F2F6;
            span{
                display: inline-flex;
                align-items: center;
                color: ${({ theme }) => theme['extra-light-color']};
                margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 20px;
            }
            a{
                display: inline-flex;
                align-items: center;
                font-size: 13px;
                color: ${({ theme }) => theme['extra-light-color']};
                svg,
                i{
                    margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 6px;
                }
            }
        }
        .commentArea{
            display: flex;
            align-items: center;
            padding: 0 25px 20px 25px;
            border-bottom: 1px solid #F1F2F6;
            @media only screen and (max-width: 991px){
                flex-flow: column;
                align-items: flex-start;
            }
            .comment-form{
                flex: auto;
                position: relative;
                display: flex;
                align-items: center;
                margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 10px;
                @media only screen and (max-width: 991px){
                    flex-flow: column;
                    align-items: flex-start;
                    width: 100%;
                    margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 0;
                    margin-bottom: 15px;
                }
                img{
                    max-width: 36px;
                    margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 10px;
                    border-radius: 50%;
                    @media only screen and (max-width: 991px){
                        margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 0;
                        margin-bottom: 15px;
                    }
                }
                textarea{
                    padding: 14px 22px;
                    height: 50px;
                    border: 0 none;
                    border-radius: 25px;
                    background-color: #F4F5F7;
                    resize: none;
                }
            }
            .btn-send{
                padding: 0;
                height: 50px;
                width: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 15px #5F63F220;
                @media only screen and (max-width: 991px){
                    width: 35px;
                    height: 35px;
                }
                svg,
                i,
                img{
                    width: 16px;
                    color: #fff;
                    @media only screen and (max-width: 991px){
                        width: 14px;
                    }
                }
            }
            .chatbox-reply-action{
                position: absolute;
                ${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 22px;
                align-items: center;
                @media only screen and (max-width: 991px){
                    bottom: 10px;
                }
                .smile-icon{
                    position: relative;                    
                    margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 18px;
                    line-height: 1;
                    @media only screen and (max-width: 991px){
                        margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 8px;
                    }
                    aside{
                        position: absolute;
                        z-index: 9999999;
                    }
                }
                a{
                    line-height: 1;
                    &:not(:last-child){
                        margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 18px;
                        @media only screen and (max-width: 991px){
                            margin-${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 6px;
                        }
                    }
                    svg,
                    i{
                        color: #ADB4D2;
                        width: 18px;
                        @media only screen and (max-width: 991px){
                            width: 14px;
                        }
                    }
                }
                .ant-upload-list {
                    display: none;
                }
                .ant-upload{
                    margin: 0;
                    padding: 0;
                    width: auto;
                    height: auto;
                    line-height: .5;
                    background-color: transparent;
                    border: 0 none;
                }
            }
        }
        .commentReplay{
            padding: 20px 25px 0 25px;
            .ant-comment-content-author-name{
                font-size: 14px;
                font-weight: 600;
                color: ${({ theme }) => theme['dark-color']};
            }
            .ant-comment-actions{
                margin-top: 10px;
            }
        }
    }
`;

const Title = Styled.div`
    display: flex;
    align-items: center;
    img {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
    }
    p {
        font-size: 14px;
        font-weight: 600;
        color: ${({ theme }) => theme['dark-color']};
        margin: 0;
        span {
            font-size: 13px;
            font-weight: 400;
            display: block;
            margin: 0;
            color: ${({ theme }) => theme['light-color']};
        }
    }
`;

export { CreatePost, BackShadow, AllPosts, Title, BackShadowEmoji, RightAsideWrapper, PostComment };