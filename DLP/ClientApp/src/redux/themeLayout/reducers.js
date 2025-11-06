import actions from './actions';
import staticData from '../../config/config';

const initialState = {
  data: staticData.darkMode,
  rtlData: staticData.rtl,
  topMenu: staticData.topMenu,
  loading: false,
  rtlLoading: false,
  menuLoading: false,
  error: null,
};

const initialStateFilter = {
  data: staticData,
  loading: false,
  error: null,
};

const {
  CHANGE_LAYOUT_MODE_BEGIN,
  CHANGE_LAYOUT_MODE_SUCCESS,
  CHANGE_LAYOUT_MODE_ERR,

  CHANGE_RTL_MODE_BEGIN,
  CHANGE_RTL_MODE_SUCCESS,
  CHANGE_RTL_MODE_ERR,

  CHANGE_MENU_MODE_BEGIN,
  CHANGE_MENU_MODE_SUCCESS,
  CHANGE_MENU_MODE_ERR,

  SINGLE_PROJECT_BEGIN,
  SINGLE_PROJECT_SUCCESS,
  SINGLE_PROJECT_ERR,

  FILTER_PROJECT_BEGIN,
  FILTER_PROJECT_SUCCESS,
  FILTER_PROJECT_ERR,

  SORTING_PROJECT_BEGIN,
  SORTING_PROJECT_SUCCESS,
  SORTING_PROJECT_ERR,
} = actions;

const LayoutChangeReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case CHANGE_LAYOUT_MODE_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case CHANGE_LAYOUT_MODE_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
      };
    case CHANGE_LAYOUT_MODE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case CHANGE_RTL_MODE_BEGIN:
      return {
        ...state,
        rtlLoading: true,
      };
    case CHANGE_RTL_MODE_SUCCESS:
      return {
        ...state,
        rtlData: data,
        rtlLoading: false,
      };
    case CHANGE_RTL_MODE_ERR:
      return {
        ...state,
        error: err,
        rtlLoading: false,
      };
    case CHANGE_MENU_MODE_BEGIN:
      return {
        ...state,
        menuLoading: true,
      };
    case CHANGE_MENU_MODE_SUCCESS:
      return {
        ...state,
        topMenu: data,
        menuLoading: false,
      };
    case CHANGE_MENU_MODE_ERR:
      return {
        ...state,
        error: err,
        menuLoading: false,
      };

      case FILTER_PROJECT_BEGIN:
      return {
        ...initialStateFilter,
        loading: true,
      };
    case FILTER_PROJECT_SUCCESS:
      return {
        ...initialStateFilter,
        data,
        loading: false,
      };
    case FILTER_PROJECT_ERR:
      return {
        ...initialStateFilter,
        error: err,
        loading: false,
      };
    case SORTING_PROJECT_BEGIN:
      return {
        ...initialStateFilter,
        loading: true,
      };
    case SORTING_PROJECT_SUCCESS:
      return {
        ...initialStateFilter,
        data,
        loading: false,
      };
    case SORTING_PROJECT_ERR:
      return {
        ...initialStateFilter,
        error: err,
        loading: false,
      };

      case SINGLE_PROJECT_BEGIN:
        return {
          ...initialState,
          loading: true,
        };
      case SINGLE_PROJECT_SUCCESS:
        return {
          ...initialState,
          data,
          loading: false,
        };
      case SINGLE_PROJECT_ERR:
        return {
          ...initialState,
          error: err,
          loading: false,
        };
    default:
      return state;
  }
};

export default LayoutChangeReducer;
