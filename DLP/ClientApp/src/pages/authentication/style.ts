import Styled from "styled-components";

interface AuthWrapperProps {
  noOverlay?: boolean;
  noImage?: boolean;
}

const LanguageWrapper = Styled.div`
  position: fixed;
  top: 40px;
  right: 50px;
  z-index: 1000;
  color: white;

  .head-example {
    color: white !important;
    cursor: pointer;
    text-decoration: none;
  }

  .head-example:hover,
  .head-example:focus {
    color: #ddd !important;
  }

  .head-example svg {
    color: white !important;
    stroke: white !important;
  }

  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
  }
`;

const ForgotWrapper = Styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;

  .forgot-left {
    flex: 1;
    background-image: url('${require("static/img/auth/warehouseBG.jpg")}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-width: 0;
    min-height: 0;
    height: 100vh;
  }

  .forgot-right {
    flex: 1;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center; /* vertical center */
    height: 100vh;
    min-width: 0;
    min-height: 0;
  }

  .forgot-card {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .forgot-card h3 {
    font-size: 21px;
    margin-bottom: 10px;
    font-weight: 700;
    color: #222;
  }
  .forgot-text {
    margin-bottom: 32px;
    color: #4d5564;
    font-size: 14px;
    line-height: 1.5;
  }
  .ant-form-item {
    margin-bottom: 4px;
  }
  .btn-reset {
    width: 100%;
    height: 38px;
    background: #27b2ea !important;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    font-size: 15px;
    color: #fff !important;
  }
  .btn-reset:hover {
    background: #2090c4 !important;
  }
  .return-text {
    margin-top: 9px;
    font-size: 14px;
    color: #888;
  }
  .return-text a {
    color: #31b0f8;
    text-decoration: underline;
    font-weight: 500;
    margin-left: 2px;
  }

  @media (max-width: 900px) {
    .forgot-card { max-width: 92vw; }
  }

  /* Mobile Styles */
  @media (max-width: 600px) {
    flex-direction: column;

    .forgot-left,
    .forgot-right {
      flex: none;
      width: 100vw;
      height: auto;
      min-height: 200px;
    }

    .forgot-right {
      padding: 24px 0;
    }

    .forgot-card {
      width: 80%;
    }
  }
`;

const AuthWrapper = Styled.div.attrs<AuthWrapperProps>(props => ({
  "data-nooverlay": props.noOverlay ? "true" : "false"
}))<AuthWrapperProps>`
  width: 100vw;
  min-height: 100vh; 
  height: auto; 
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto; /* Allow scroll when content exceeds height */
  
  /* Warehouse background */
  background-image: ${({ noImage }) =>
    noImage ? "none" : `url('${require('static/img/auth/warehouseBG.jpg')}')`};
  background-color: ${({ noImage }) => (noImage ? "#fff" : "transparent")};
  background-size: cover; 
  background-position: center; 
  background-repeat: no-repeat;
  background-attachment: fixed; 

  /* Strong black mask overlay */
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${({ noOverlay, noImage }) =>
      noOverlay || noImage ? "transparent" : "rgba(0,0,0,0.48)"};
    z-index: 0;
    pointer-events: none;
  }

  .no-background {
    background-image: none !important;
    background-color: #fff !important;
  }

  /* Other styles for content */
  .heading-block {
    width: 100%;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 4px;
    z-index: 2;
  }

  .mvp-heading {
    color: #fff;
    font-size: 100px;
    font-weight: 900;
    letter-spacing: 2px;
    line-height: 1.07;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.23);
    margin-bottom: 0;
  }

  .mvp-sub {
    color: #fff;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 1px;
    margin-bottom: 21px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .auth-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 410px;
    z-index: 2;
  }

  .truck-icon-bg {
    background: #79C942;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: -24px;
    box-shadow: 0 2px 8px rgba(10, 20, 40, 0.17);
    z-index: 3;
    position: relative;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 28px;
    box-shadow: 0 16px 32px rgba(10, 25, 70, 0.17);
    padding: 24px 14px 14px 14px;
    max-width: 410px;
    width: 100%;
    margin-bottom: 16px;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .login-card .ant-form {
    width: 100%;
    max-width: none;
    margin-top: 14px;
  }

  .login-card .ant-form-item {
    margin-bottom: 14px;
    margin-left: 14px;
    margin-right: 14px;
  }

  .custom-btn {
    width: 100%;
    font-weight: 700;
    font-size: 17px;
    border-radius: 6px;
    background: #31b0f8;
    border: none;
    color: #fff;
    height: 44px;
    transition: background 0.2s;
  }
  .custom-btn:hover,
  .custom-btn:focus {
    background-color:rgb(33, 127, 182) !important;
    color: #fff;
  }
  .set-password-btn {
    width: 100%;
    font-weight: 700;
    font-size: 17px;
    border-radius: 6px;
    background: #79C942 !important;
    border: none;
    color: #fff;
    height: 44px;
    transition: background 0.2s;
    &:hover {
      background: #cdfcbb !important;
      color: #fff;
    }
  }

  .auth-form-action {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    font-size: 15px;
    color: #444;
    .ant-checkbox-wrapper {
      color: #585c62;
    }
    .remember {
      color: #fff;
      margin-left: 50px;
    }
    .forgot-pass-link {
      color: #fff;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      margin-right: 50px;
    }
  }

  .or-divider {
    font-size: 15px;
    color: #d7e0e3;
    text-align: center;
    margin: 0 0 0px 0;
    letter-spacing: 1px;
    span {
      background: none;
    }
  }

  .white-text {
    color: white !important;
  }

  .green-bottom-bar {
    display: flex;
    flex-direction: row;
    background: #4CAF50;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(40, 80, 40, 0.14);
    overflow-x: auto; /* enables horizontal scroll as needed */
    margin-top: 16px;
    justify-content: center;
    align-items: stretch;
    gap: 13px;
    padding: 0 20px;
    min-width: 410px;
    height: 50px;
    max-width: 700px;
  }

  .green-bottom-bar li {
    flex: 1 1 auto;
    display: flex;
    align-items: stretch;
    list-style: none;
    min-width: 0;
    margin: 0;
  }

  .green-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-align: center;
    color: white !important;
    padding: 0 16px;
    font-size: 15px;
    text-decoration: none;
    border-radius: 0;
    cursor: pointer;
    white-space: nowrap;
    overflow: visible;
    background: transparent;
    min-width: 0;
  }

  /* On hover/focus, only underline -- no box, color unchanged */
  .green-link:hover,
  .green-link:focus,
  .green-link:active {
    background: none !important;
    color: #fff !important;
    text-decoration: underline !important;
  }


  /* Mobile Styles */
  @media (max-width: 767px) {
    .green-bottom-bar {
      flex-direction: column;
      width: 100%;
      min-width: 0;
      padding: 6px 2px;
      gap: 7px;
      height: auto;
      max-width: 96vw;
    }

    .green-link {
      width: 100%;
      font-size: 15.5px;
      padding: 12px 0;
      border-radius: 6px;
      min-width: 0;
      white-space: normal;
      word-break: break-word;
    }
  }

  /* Handling zoomed-out views */
  @media (max-width: 600px) {
    .mvp-heading {
      font-size: 60px;
    }

    .mvp-sub {
      font-size: 16px;
    }

    .login-card {
      width: 100%;
      padding: 24px 12px;
    }

    .auth-form-action {
      flex-direction: column;
      align-items: flex-start;
    }

    .green-bottom-bar {
      flex-direction: column;
      padding: 6px;
      gap: 6px;
    }
  }
`;


export { ForgotWrapper, AuthWrapper, LanguageWrapper };

